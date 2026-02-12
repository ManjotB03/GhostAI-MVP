import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";
import { LIMITS, OWNER_EMAIL, type Tier } from "@/lib/limits";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

type Mode = "career" | "interview_mock";

function normalizeTier(input: any): Tier {
  const t = String(input ?? "free").toLowerCase();
  if (t === "free" || t === "pro" || t === "ultimate") return t;
  return "free";
}

function systemPrompt(mode: Mode) {
  if (mode === "interview_mock") {
    return `You are GhostAI, an expert interview coach.
Give tough but constructive feedback.
Rewrite the answer using STAR format.
Add missing metrics.
Suggest improvements clearly.`;
  }

  return `You are GhostAI, a practical career coach.
Give structured, actionable advice.
Be direct, specific, and provide examples/templates.`;
}

async function runAI(task: string, mode: Mode) {
  console.log("CALLING OPENAI ...");

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt(mode) },
      { role: "user", content: task },
    ],
    temperature: 0.7,
  });

  console.log("OPENAI OK");

  return (
    completion.choices?.[0]?.message?.content?.trim() ||
    "No response generated."
  );
}

/* ===========================
   PDF PARSER (STABLE VERSION)
   =========================== */
async function parsePdfToText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(" ") + "\n";
  }

  return fullText.trim();
}

async function fileToText(file: File) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) {
    return await parsePdfToText(file);
  }

  return (await file.text()).trim();
}

/* ===========================
   MAIN API
   =========================== */

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    console.log("SESSION:", {
      hasSession: !!session,
      email: session?.user?.email || null,
    });

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const isOwner = email === OWNER_EMAIL;

    const contentType = req.headers.get("content-type") || "";

    let task = "";
    let mode: Mode = "career";
    let file: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      task = String(form.get("task") || "").trim();
      mode = (String(form.get("mode") || "career") as Mode) || "career";
      const f = form.get("file");
      file = f instanceof File ? f : null;
    } else {
      const body = await req.json().catch(() => null);
      task = String(body?.task || "").trim();
      mode = (String(body?.mode || "career") as Mode) || "career";
    }

    console.log("BODY:", {
      taskPreview: task ? task.slice(0, 40) : null,
      mode,
      hasFile: !!file,
      fileName: file?.name ?? null,
    });

    /* ===== FILE HANDLING ===== */
    if (file) {
      const extracted = await fileToText(file);

      console.log("FILE TEXT LEN:", extracted?.length ?? 0);

      if (!extracted) {
        return NextResponse.json(
          { error: "Could not extract text from file" },
          { status: 400 }
        );
      }

      const clipped = extracted.slice(0, 12000);

      const instructions =
        task && task.length > 0
          ? task
          : "Review this document and provide detailed career feedback.";

      task = `INSTRUCTIONS:\n${instructions}\n\n---\nDOCUMENT CONTENT:\n${clipped}\n---\n\nNow respond following the instructions.`;
    }

    if (!task) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    /* ===== TIER CHECK ===== */

    const { data: userRow } = await supabaseServer
      .from("app_users")
      .select("subscription_tier")
      .eq("email", email)
      .maybeSingle();

    const tier: Tier = normalizeTier(userRow?.subscription_tier);

    console.log("TIER:", { tier, isOwner });

    if (!isOwner && tier === "free" && mode === "interview_mock") {
      return NextResponse.json(
        {
          upgradeRequired: true,
          message: "Upgrade to Pro to use Interview Mock Mode.",
        },
        { status: 402 }
      );
    }

    if (isOwner || tier === "ultimate") {
      const result = await runAI(task, mode);
      return NextResponse.json({ result, unlimited: true });
    }

    /* ===== LIMIT CHECK ===== */

    const dailyLimit = LIMITS[tier];
    const today = new Date().toISOString().slice(0, 10);
    const cost = file ? 2 : 1;

    const { data: usageRow } = await supabaseServer
      .from("ai_usage")
      .select("count")
      .eq("email", email)
      .eq("date", today)
      .maybeSingle();

    const used = usageRow?.count ?? 0;

    if (used + cost > dailyLimit) {
      return NextResponse.json(
        {
          error: "Limit reached",
          limitReached: true,
          used,
          limit: dailyLimit,
        },
        { status: 403 }
      );
    }

    const usedNext = used + cost;

    await supabaseServer.from("ai_usage").upsert(
      { email, date: today, count: usedNext },
      { onConflict: "email,date" }
    );

    console.log("UPSERTED:", { usedNext });

    /* ===== AI CALL ===== */

    const result = await runAI(task, mode);

    return NextResponse.json({
      result,
      used: usedNext,
      limit: dailyLimit,
    });
  } catch (err: any) {
    console.error("API /ghost ERROR:", err?.message || err);
    return NextResponse.json(
      { error: "Server error", details: err?.message || "Unknown" },
      { status: 500 }
    );
  }
}
