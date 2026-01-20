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
    return `
You are GhostAI Interview Coach (premium).

Task:
- The user will provide an interview question and either their draft answer OR ask you to generate a model answer.
- Your job is to give high-quality feedback and improve their answer.

Rules:
- Be direct and specific. No fluff.
- Use this exact structure:

1) Score (0–10) for: Clarity, Impact, Structure, Confidence
2) What’s strong (2–4 bullets)
3) What to fix (2–4 bullets)
4) Improved Answer (STAR format if applicable)
5) Extra punch: 2 metrics/examples they can add
6) Next Attempt: ask them 1 follow-up question to tailor further

If they didn’t provide an answer, generate:
- A strong model answer + why it works.
`;
  }

  return `
You are GhostAI — a premium AI Career Coach.

Goal:
Help ambitious early-career professionals get interviews, offers, promotions, and higher salary.

Style rules:
- Be direct, practical, and specific (no generic fluff).
- Use structured formatting with headings and bullet points.
- Provide templates/examples when useful.
- UK-friendly by default unless user mentions another location.

Always end with:
Next Steps (3–5 bullet actions).
`;
}

async function runAI(task: string, category: string, mode: Mode) {
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;
  const isOwner = email === OWNER_EMAIL;

  const body = await req.json().catch(() => null);
  const task = body?.task?.trim();
  const category = body?.category ?? "Career";
  const mode: Mode = body?.mode === "interview_mock" ? "interview_mock" : "career";

  if (!task) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  // ✅ Pull tier from DB (source of truth)
  const { data: userRow, error: userErr } = await supabaseServer
    .from("app_users")
    .select("subscription_tier")
    .eq("email", email)
    .maybeSingle();

  if (userErr) {
    return NextResponse.json({ error: "User lookup failed" }, { status: 500 });
  }

  const tier: Tier = normalizeTier(userRow?.subscription_tier);

  // ✅ Pro feature enforcement
  if (!isOwner && tier === "free" && mode === "interview_mock") {
    return NextResponse.json(
      {
        upgradeRequired: true,
        message: "Interview Mock Mode is available on Pro.",
      },
      { status: 402 }
    );
  }

  // ✅ Unlimited for owner + ultimate
  if (isOwner || tier === "ultimate") {
    const result = await runAI(task, category, mode);
    return NextResponse.json({ result });
  }

  const dailyLimit = LIMITS[tier]; // free/pro
  const today = new Date().toISOString().slice(0, 10);

  const { data: usageRow, error: usageErr } = await supabaseServer
    .from("ai_usage")
    .select("count")
    .eq("email", email)
    .eq("date", today)
    .maybeSingle();

  if (usageErr) {
    return NextResponse.json({ error: "Usage read error" }, { status: 500 });
  }

  const used = usageRow?.count ?? 0;

  if (used >= dailyLimit) {
    return NextResponse.json(
      { error: "Limit reached", limitReached: true, limit: dailyLimit, used, tier },
      { status: 403 }
    );
  }

  await supabaseServer.from("ai_usage").upsert(
    { email, date: today, count: used + 1 },
    { onConflict: "email,date" }
  );

  const result = await runAI(task, category, mode);
  return NextResponse.json({ result });
}
