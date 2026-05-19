import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cv = body?.cv;
    const jobDescription = body?.jobDescription;

    if (!cv || !jobDescription) {
      return NextResponse.json(
        { error: "CV and job description are required." },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            'You are an ATS expert. Return ONLY valid JSON in this exact structure: { "score": number, "matchedKeywords": string[], "missingKeywords": string[], "improvements": string[] }. Improvements must contain exactly 3 items.',
        },
        {
          role: "user",
          content: `CV:\n${cv}\n\nJob description:\n${jobDescription}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "ATS checker failed." },
      { status: 500 }
    );
  }
}