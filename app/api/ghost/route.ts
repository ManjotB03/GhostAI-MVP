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

const DEV = process.env.NODE_ENV !== "production";
function log(...args: any[]) {
  if (DEV) console.log(...args);
}

function normalizeTier(input: any): Tier {
  const t = String(input ?? "free").toLowerCase();
  if (t === "free" || t === "pro" || t === "ultimate") return t;
  return "free";
}

function normalizeMode(input: any): Mode {
  const m = String(input ?? "career").toLowerCase();
  if (m === "career" || m === "interview_mock") return m;
  return "career";
}

function systemPrompt(mode: Mode) {
  if (mode === "interview_mock") {
    return [
      "You are GhostAI, an interview coach.",
      "Act like a tough but fair interviewer + coach.",
      "Give direct feedback, identify weak points, rewrite answers, and provide a better STAR answer.",
      "Then give 3 follow-up questions and what a strong answer should include.",
    ].join(" ");
  }

  return [
    "You are GhostAI, a practical career coach.",
    "Give structured, actionable advice with clear next steps.",
    "Be realistic and tailored to UK job market when relevant.",
  ].join(" ");
}

async function runAI(task: string, mode: Mode) {
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt(mode) },
      { role: "user", content: task },
    ],
    temperature: 0.7,
  });

  const text = completion.choices?.[0]?.message?.content?.trim() || "";
  return text || "No response generated.";
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    log("❌ Unauthorized (no session)");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;
  const isOwner = email === OWNER_EMAIL;

  const body = await req.json().catch(() => null);
  const task = body?.task?.trim();
  const mode = normalizeMode(body?.mode);

  log("SESSION:", { email, hasSession: true });
  log("BODY:", { taskPreview: task?.slice?.(0, 40), mode });

  if (!task) {
    log("❌ Missing prompt");
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  // Tier from DB
  const { data: userRow, error: userErr } = await supabaseServer
    .from("app_users")
    .select("subscription_tier")
    .eq("email", email)
    .maybeSingle();

  const tier: Tier = normalizeTier(userRow?.subscription_tier);

  log("USER ROW:", { userRow, userErr });
  log("TIER:", { tier, isOwner });

  // Pro feature gate (interview_mock is Pro+)
  if (!isOwner && tier === "free" && mode === "interview_mock") {
    log("🔒 Blocked: interview_mock requires Pro");
    return NextResponse.json(
      {
        upgradeRequired: true,
        message: "Upgrade to Pro to use Interview Mock Mode.",
      },
      { status: 402 }
    );
  }

  // Unlimited for owner + ultimate
  if (isOwner || tier === "ultimate") {
    log("✅ Unlimited path:", { tier });
    const result = await runAI(task, mode);
    return NextResponse.json({ result });
  }

  // Daily limits for free/pro
  const dailyLimit = LIMITS[tier];
  const today = new Date().toISOString().slice(0, 10);

  log("LIMIT CHECK:", { email, today, tier, dailyLimit });

  const { data: usageRow, error: usageErr } = await supabaseServer
    .from("ai_usage")
    .select("count")
    .eq("email", email)
    .eq("date", today)
    .maybeSingle();

  const used = usageRow?.count ?? 0;

  log("USAGE ROW:", { usageRow, usageErr });

  if (usageErr) {
    log("❌ Usage read error:", usageErr);
    return NextResponse.json({ error: "Usage read error" }, { status: 500 });
  }

  if (used >= dailyLimit) {
    log("⛔ Limit reached:", { used, dailyLimit });
    return NextResponse.json(
      {
        error: "Limit reached",
        limitReached: true,
        tier,
        used,
        limit: dailyLimit,
      },
      { status: 403 }
    );
  }

  log("UPSERTING USAGE:", { email, today, usedNext: used + 1 });

  const { error: upsertErr } = await supabaseServer.from("ai_usage").upsert(
    { email, date: today, count: used + 1 },
    { onConflict: "email,date" }
  );

  log("UPSERT RESULT:", { upsertErr });

  if (upsertErr) {
    log("❌ Usage upsert error:", upsertErr);
    return NextResponse.json({ error: "Usage upsert error" }, { status: 500 });
  }

  log("CALLING OPENAI ...");
  const result = await runAI(task, mode);
  log("OPENAI OK");

  return NextResponse.json({
    result,
    tier,
    used: used + 1,
    limit: dailyLimit,
  });
}
