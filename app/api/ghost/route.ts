import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPTS: Record<string, string> = {
  work: `You are GhostAI – a productivity assistant that writes emails, summaries, proposals and workplace documents. Be concise, professional and helpful.`,
  career: `You are GhostAI – a career assistant that rewrites CV bullets, drafts cover letters and generates interview answers. Be clear, confident and structured.`,
  money: `You are GhostAI – a simple financial explainer. You give beginner-friendly advice, explain ETFs/stocks, budgeting, saving, and financial concepts. Avoid giving personalised regulated investment advice.`,
};

let lastCall = 0;

export async function POST(req: Request) {
  try {
    const { task, mode } = await req.json();

    if (!task) return NextResponse.json({ error: "Task is required." }, { status: 400 });

    const now = Date.now();
    if (now - lastCall < 1500) {
      return NextResponse.json({ error: "Too many requests. Slow down." }, { status: 429 });
    }
    lastCall = now;

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS["work"];

    try {
      const completion = await client.responses.create({
        model: "gpt-4.1-mini",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: task },
        ],
      });

      // Prefer the SDK's concatenated text if available, otherwise fall back to inspecting the output array safely
      const text =
        completion.output_text ??
        ((Array.isArray(completion.output) && (completion.output[0] as any).content?.[0]?.text) ?? "");

      return NextResponse.json({ result: text });
    } catch (error: any) {
      console.error("OpenAI error:", error);
      return NextResponse.json({
        result: `⚠️ OpenAI quota error — mock response for "${task}"`,
        error: "OpenAI quota exceeded or unavailable.",
      });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
