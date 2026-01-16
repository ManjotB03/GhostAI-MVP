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

function normalizeTier(input: any): Tier {
  const t = String(input ?? "free").toLowerCase();
  if (t === "free" || t === "pro" || t === "ultimate") return t;
  return "free";
}

function systemPrompt(category: string) {
  return `
You are GhostAI, a senior career coach and hiring advisor.

You help users with:
- CV and resume improvement
- Interview preparation
- Career changes and job strategy
- Salary negotiation and long-term growth

Your advice must be:
- Clear and structured
- Practical and actionable
- Honest and realistic
- Focused on next steps

Avoid generic motivational fluff.
Use bullet points, examples, and step-by-step guidance.
`;
}


async function runAI(task: string, category: string) {
  // ✅ This is where OpenAI usually throws
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt(category) },
      { role: "user", content: task },
    ],
    temperature: 0.7,
  });

  return completion.choices?.[0]?.message?.content?.trim() || "No response generated.";
}

export async function POST(req: Request) {
  try {
    console.log("=== /api/ghost HIT ===");

    const session = await getServerSession(authOptions);

    console.log("SESSION:", { hasSession: !!session, email: session?.user?.email });

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase().trim();
    const isOwner = email === OWNER_EMAIL.toLowerCase().trim();

    const body = await req.json().catch(() => null);
    const task = body?.task?.trim();
    const category = body?.category ?? "Work";

    console.log("BODY:", { taskPreview: task?.slice(0, 60), category });

    if (!task) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // ✅ Pull tier from DB
    const { data: userRow, error: userErr } = await supabaseServer
      .from("app_users")
      .select("subscription_tier")
      .eq("email", email)
      .maybeSingle();

    console.log("USER ROW:", { userRow, userErr });

    const tier: Tier = normalizeTier(userRow?.subscription_tier);
    console.log("TIER:", { tier, isOwner });

    // ✅ Unlimited for owner + ultimate
    if (isOwner || tier === "ultimate") {
      console.log("UNLIMITED PATH - calling OpenAI");
      const result = await runAI(task, category);
      return NextResponse.json({ result });
    }

    const dailyLimit = LIMITS[tier];
    const today = new Date().toISOString().slice(0, 10);

    const { data: usageRow, error: usageErr } = await supabaseServer
      .from("ai_usage")
      .select("count")
      .eq("email", email)
      .eq("date", today)
      .maybeSingle();

    console.log("USAGE ROW:", { usageRow, usageErr });

    if (usageErr) {
      return NextResponse.json({ error: "Usage tracking failed", details: usageErr }, { status: 500 });
    }

    const used = usageRow?.count ?? 0;

    if (used >= dailyLimit) {
      return NextResponse.json(
        { error: "Limit reached", limitReached: true, limit: dailyLimit, used, tier },
        { status: 403 }
      );
    }

    console.log("UPSERTING USAGE:", { email, today, usedNext: used + 1 });

    const { error: upsertErr } = await supabaseServer
      .from("ai_usage")
      .upsert({ email, date: today, count: used + 1 }, { onConflict: "email,date" });

    console.log("UPSERT RESULT:", { upsertErr });

    if (upsertErr) {
      return NextResponse.json({ error: "Usage upsert failed", details: upsertErr }, { status: 500 });
    }

    console.log("CALLING OPENAI...");
    const result = await runAI(task, category);
    console.log("OPENAI OK");

    return NextResponse.json({ result });
  } catch (err: any) {
    console.error("API /ghost CRASH:", err?.message || err, err);
    return NextResponse.json(
      { error: "Server crashed", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
