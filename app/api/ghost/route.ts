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
If the user provides an interview question or asks for an interview answer, answer directly and practically.
Use the uploaded CV/document as context when relevant.
Use previous saved chat context when it is supplied.
When useful, rewrite answers using STAR format and suggest improvements.

Return in Markdown with headings and bullet points when appropriate.`;
  }

  return `You are GhostAI, a practical career coach.
Always answer the user's actual request directly first.
If the user uploaded a CV/document, use it as context when relevant.
If previous saved chat context is supplied, use it carefully and only when relevant.
Do not force a generic CV review structure unless the user is clearly asking for a CV review, CV rewrite, CV improvement, CV analysis, bullet rewrite, ATS check, or profile assessment.
Be direct, specific, and include examples/templates where useful.

Return in Markdown with headings and bullet points when appropriate.`;
}

function isCvReviewRequest(userTask: string) {
  const t = userTask.toLowerCase();

  const keywords = [
    "review my cv",
    "review my resume",
    "cv review",
    "resume review",
    "improve my cv",
    "improve my resume",
    "rewrite my cv",
    "rewrite my resume",
    "ats",
    "ats score",
    "cv bullet",
    "resume bullet",
    "profile summary",
    "improve this cv",
    "improve this resume",
    "analyze my cv",
    "analyse my cv",
    "analyze my resume",
    "analyse my resume",
  ];

  return keywords.some((k) => t.includes(k));
}

function wantsMemory(userTask: string) {
  const t = userTask.toLowerCase();

  const triggers = [
    "using previous chats",
    "use previous chats",
    "based on previous chats",
    "based on earlier chats",
    "using earlier chats",
    "use earlier chats",
    "using what i said before",
    "use what i said before",
    "from my past chats",
    "from previous chats",
    "from earlier chats",
    "using my past chats",
    "based on what i said before",
    "using my old chats",
    "based on my old chats",
  ];

  return triggers.some((p) => t.includes(p));
}

function cleanMemoryText(input: string) {
  return String(input || "")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function getRecentChatMemory(email: string) {
  const { data, error } = await supabaseServer
    .from("ghost_chats")
    .select("title,task,response,created_at")
    .eq("email", email.toLowerCase())
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !data?.length) return "";

  const chunks = data.map((row, idx) => {
    const title = String(row.title || `Chat ${idx + 1}`);
    const task = String(row.task || "").slice(0, 500);
    const response = String(row.response || "").slice(0, 900);

    return `Previous Chat ${idx + 1}
Title: ${title}
User asked: ${task}
GhostAI answered: ${response}`;
  });

  return cleanMemoryText(chunks.join("\n\n---\n\n")).slice(0, 5000);
}

function buildFinalTask(
  userTask: string,
  docText?: string,
  targetRole?: string,
  memoryText?: string
) {
  const cleanTask = (userTask || "").trim();
  const role = (targetRole || "Data Engineer").trim();
  const hasDoc = !!docText?.trim();
  const hasMemory = !!memoryText?.trim();

  if (!hasDoc) {
    if (hasMemory) {
      return `USER REQUEST:
${cleanTask}

TARGET ROLE:
${role}

PREVIOUS CHAT CONTEXT:
${memoryText}

IMPORTANT:
- Use the previous chat context only where relevant.
- Answer the USER REQUEST directly first.
- Do not just summarize old chats unless the user asks for that.
- Keep the response practical and tailored.`;
    }

    return cleanTask;
  }

  const instruction =
    cleanTask ||
    "Please use this document as context and help me with my career question.";

  const clippedDoc = docText!.slice(0, 12000);

  if (isCvReviewRequest(instruction)) {
    return `USER REQUEST:
${instruction}

TARGET ROLE:
${role}

${hasMemory ? `PREVIOUS CHAT CONTEXT:\n${memoryText}\n` : ""}

DOCUMENT (use as source context):
${clippedDoc}

IMPORTANT:
- Use the document as the main source of truth.
- Tailor your advice to the TARGET ROLE.
- Use previous chat context only if it genuinely helps.
- Be specific and practical.

RESPONSE FORMAT (Markdown):

### 🔎 Profile Summary
Give a concise overview of the candidate (3–4 bullets).

### 💪 Key Strengths
Highlight the strongest technical and professional skills.

### ⚡ High Impact Improvements
Explain what should change to make the CV stronger and more competitive.

### ✏️ Rewritten CV Bullet Points
Rewrite the most important bullet points using:
- strong action verbs
- measurable results
- clearer technical language
- ATS-friendly keywords for the TARGET ROLE

### 📈 Next Career Moves
Give 3–6 clear steps the candidate should take next to improve their career trajectory.

### ✅ ATS Score
Give ONE score out of 100 for ATS-friendliness + keyword match for the TARGET ROLE.
Then output this exact final line at the very end of your response:
ATS_SCORE: <number from 0 to 100>`;
  }

  return `USER REQUEST:
${instruction}

TARGET ROLE:
${role}

${hasMemory ? `PREVIOUS CHAT CONTEXT:\n${memoryText}\n` : ""}

DOCUMENT / CV CONTEXT:
${clippedDoc}

IMPORTANT:
- First answer the USER REQUEST directly.
- Use the document as supporting context.
- Use previous chat context only where relevant.
- If the user is asking for an interview answer, write the actual answer.
- If the user is asking for scripting/help with speaking, make it sound natural and human.
- Only include ATS or CV review commentary if it is directly relevant to the user's request.
- Keep the response practical, polished, and ready to use.

If useful, structure your answer with headings such as:
### Direct Answer
### Why This Works
### Improved Version
### Next Steps

Only use headings when they help clarity.`;
}

async function runAI(task: string, mode: Mode) {
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt(mode) },
      { role: "user", content: task },
    ],
    temperature: 0.6,
  });

  const text = completion.choices?.[0]?.message?.content?.trim() || "";
  return text || "No response generated.";
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const isOwner = OWNER_EMAIL.includes(email);

    const body = await req.json().catch(() => null);

    const userTask = String(body?.task || "").trim();
    const mode = (String(body?.mode || "career") as Mode) || "career";
    const docText = String(body?.docText || "").trim();
    const targetRole = String(body?.targetRole || "Data Engineer");

    if (!userTask && !docText) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const cost = docText ? 2 : 1;

    const { data: userRow, error: userErr } = await supabaseServer
      .from("app_users")
      .select("subscription_tier")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      return NextResponse.json(
        { error: "User read error", details: userErr.message },
        { status: 500 }
      );
    }

    const tier: Tier = normalizeTier(userRow?.subscription_tier);

    if (!isOwner && tier === "free" && mode === "interview_mock") {
      return NextResponse.json(
        {
          upgradeRequired: true,
          message: "Upgrade to Pro to use Interview Mock Mode.",
        },
        { status: 402 }
      );
    }

    const memoryText = wantsMemory(userTask)
      ? await getRecentChatMemory(email)
      : "";

    if (isOwner || tier === "ultimate") {
      const finalTask = buildFinalTask(userTask, docText, targetRole, memoryText);
      const result = await runAI(finalTask, mode);
      return NextResponse.json({ result, tier, unlimited: true });
    }

    const dailyLimit = LIMITS[tier];
    const today = new Date().toISOString().slice(0, 10);

    const { data: usageRow, error: usageErr } = await supabaseServer
      .from("ai_usage")
      .select("count")
      .eq("email", email)
      .eq("date", today)
      .maybeSingle();

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
          error: "LIMIT_REACHED",
          limitReached: true,
          tier,
          used,
          limit: dailyLimit,
          cost,
          message:
            "You've hit your daily limit. Upgrade to Pro for more CV rewrites, interview coaching, and stronger answers.",
        },
        { status: 403 }
      );
    }

    const usedNext = used + cost;

    const { error: upsertErr } = await supabaseServer.from("ai_usage").upsert(
      { email, date: today, count: usedNext },
      { onConflict: "email,date" }
    );

    if (upsertErr) {
      return NextResponse.json(
        { error: "Usage write error", details: upsertErr.message },
        { status: 500 }
      );
    }

    const finalTask = buildFinalTask(userTask, docText, targetRole, memoryText);
    const result = await runAI(finalTask, mode);

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