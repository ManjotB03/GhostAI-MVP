import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function runAI(task: string, category: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are GhostAI. Category: ${category}`,
      },
      {
        role: "user",
        content: task,
      },
    ],
  });

  return NextResponse.json({
    result: completion.choices[0].message.content,
  });
}
