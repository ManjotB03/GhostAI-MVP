import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";
import { LIMITS, OWNER_EMAIL, type Tier } from "@/lib/limits";

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
Rewrite the answer using STAR format, add missing details, and suggest follow-up improvements.`;
  }

  return `You are GhostAI, a practical career coach.
Give structured, actionable advice with clear next steps.
Be direct, specific, and include examples/templates where useful.`;
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

  const text = completion.choices?.[0]?.message?.content?.trim() || "";
  return text || "No response generated.";
}

export async function POST(req: Request) {
  try {
    // -------------------------
    // 1) SESSION
    // -------------------------
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

    // -------------------------
    // 2) BODY (JSON ONLY)
    // -------------------------
    const body = await req.json().catch(() => null);

    const task = String(body?.task || "").trim();
    const mode = (String(body?.mode || "career") as Mode) || "career";

    // cost comes from client (1 normal, 2 when file was used)
    const rawCost = Number(body?.cost ?? 1);
    const cost = rawCost === 2 ? 2 : 1; // clamp to 1 or 2 only

    console.log("BODY:", {
      taskPreview: task ? task.slice(0, 60) : null,
      mode,
      cost,
    });

    if (!task) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // -------------------------
    // 3) TIER FROM DB
    // -------------------------
    const { data: userRow, error: userErr } = await supabaseServer
      .from("app_users")
      .select("subscription_tier")
      .eq("email", email)
      .maybeSingle();

    console.log("USER ROW:", { userRow, userErr });

    const tier: Tier = normalizeTier(userRow?.subscription_tier);
    console.log("TIER:", { tier, isOwner });

    // ✅ Pro gate for interview_mock
    if (!isOwner && tier === "free" && mode === "interview_mock") {
      return NextResponse.json(
        {
          upgradeRequired: true,
          message: "Upgrade to Pro to use Interview Mock Mode.",
        },
        { status: 402 }
      );
    }

    // ✅ Unlimited for owner + ultimate
    if (isOwner || tier === "ultimate") {
      const result = await runAI(task, mode);
      return NextResponse.json({ result, tier, unlimited: true });
    }

    // -------------------------
    // 4) DAILY LIMIT
    // -------------------------
    const dailyLimit = LIMITS[tier]; // free/pro
    const today = new Date().toISOString().slice(0, 10);

    console.log("LIMIT CHECK:", { email, today, tier, dailyLimit, cost });

    const { data: usageRow, error: usageErr } = await supabaseServer
      .from("ai_usage")
      .select("count")
      .eq("email", email)
      .eq("date", today)
      .maybeSingle();

    console.log("USAGE ROW:", { usageRow, usageErr });

    if (usageErr) {
      return NextResponse.json(
        { error: "Usage read error", details: usageErr.message },
        { status: 500 }
      );
    }

    const used = usageRow?.count ?? 0;

    if (used + cost > dailyLimit) {
      return NextResponse.json(
        {
          error: "Limit reached",
          limitReached: true,
          tier,
          used,
          limit: dailyLimit,
          cost,
        },
        { status: 403 }
      );
    }

    const usedNext = used + cost;

    console.log("UPSERTING USAGE:", { email, today, usedNext });

    const { error: upsertErr } = await supabaseServer.from("ai_usage").upsert(
      { email, date: today, count: usedNext },
      { onConflict: "email,date" }
    );

    console.log("UPSERT RESULT:", { upsertErr });

    if (upsertErr) {
      return NextResponse.json(
        { error: "Usage write error", details: upsertErr.message },
        { status: 500 }
      );
    }

    // -------------------------
    // 5) CALL AI
    // -------------------------
    const result = await runAI(task, mode);

    return NextResponse.json({
      result,
      tier,
      used: usedNext,
      limit: dailyLimit,
      cost,
    });
  } catch (err: any) {
    console.error("API /ghost ERROR:", err?.message || err);
    return NextResponse.json(
      { error: "Server error", details: err?.message || "Unknown" },
      { status: 500 }
    );
  }
}
