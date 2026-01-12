import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { LIMITS, OWNER_EMAIL, type Tier } from "@/lib/limits";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function normalizeTier(input: any): Tier {
  const t = String(input ?? "free").toLowerCase();
  if (t === "free" || t === "pro" || t === "ultimate") return t;
  return "free";
}

function systemPrompt(category: string) {
  if (category === "Career")
    return "You are GhostAI, a practical career coach. Give structured, actionable advice with clear next steps.";
  if (category === "Money")
    return "You are GhostAI, a practical money coach. Be realistic, actionable, and risk-aware. Provide steps and examples.";
  return "You are GhostAI, a practical work assistant. Help the user get results quickly with clear steps and templates.";
}

async function runAI(task: string, category: string) {
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt(category) },
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

  // ✅ Read body ONCE here
  const body = await req.json().catch(() => null);
  const task = body?.task?.trim();
  const category = body?.category ?? "Work";

  if (!task) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  // ✅ Pull tier from DB (source of truth)
  const { data: userRow } = await supabase
    .from("app_users")
    .select("subscription_tier")
    .eq("email", email)
    .maybeSingle();

  const tier: Tier = normalizeTier(userRow?.subscription_tier);

  // ✅ Unlimited for owner + ultimate
  if (isOwner || tier === "ultimate") {
    const result = await runAI(task, category);
    return NextResponse.json({ result });
  }

  const dailyLimit = LIMITS[tier]; // free/pro
  const today = new Date().toISOString().slice(0, 10);

  // ✅ Usage keyed by email (stable for Google + credentials)
  const { data: usageRow } = await supabase
    .from("ai_usage")
    .select("count")
    .eq("email", email)
    .eq("date", today)
    .maybeSingle();

  const used = usageRow?.count ?? 0;

  if (used >= dailyLimit) {
    return NextResponse.json(
      { error: "Limit reached", limitReached: true, limit: dailyLimit, used, tier },
      { status: 403 }
    );
  }

  await supabase.from("ai_usage").upsert(
    { email, date: today, count: used + 1 },
    { onConflict: "email,date" }
  );

  const result = await runAI(task, category);
  return NextResponse.json({ result });
}
