import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Guardrails ------------------------------------------------------------
// This route is intentionally PUBLIC (no auth) so visitors can try GhostAI
// before signing up. That makes input caps + rate limiting essential.
const MAX_CV_CHARS = 15000;
const MAX_JD_CHARS = 8000;
const MIN_CHARS = 50;

// Simple in-memory rate limit. Note: per-instance only (resets on redeploy and
// isn't shared across serverless instances). Good enough to stop casual abuse;
// swap for Upstash/Redis if this needs to be strict.
const RATE_LIMIT_MAX = 5; // requests
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // per hour
const hits = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function rateLimit(ip: string): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true, retryAfterSec: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

// Opportunistic cleanup so the map can't grow unbounded.
function sweep() {
  const now = Date.now();
  for (const [k, v] of hits) {
    if (now > v.resetAt) hits.delete(k);
  }
}

function clampScore(n: any): number {
  const num = Number(n);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function toStringArray(v: any, max = 12): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => typeof x === "string" && x.trim())
    .map((x) => String(x).trim())
    .slice(0, max);
}

export async function POST(request: Request) {
  try {
    if (hits.size > 5000) sweep();

    const ip = getClientIp(request);
    const limited = rateLimit(ip);

    if (!limited.ok) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          message:
            "You've used your free checks for now. Create a free account to keep going.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        }
      );
    }

    const body = await request.json().catch(() => null);

    const cvRaw = typeof body?.cv === "string" ? body.cv.trim() : "";
    const jdRaw =
      typeof body?.jobDescription === "string" ? body.jobDescription.trim() : "";

    if (!cvRaw || !jdRaw) {
      return NextResponse.json(
        { error: "CV and job description are required." },
        { status: 400 }
      );
    }

    if (cvRaw.length < MIN_CHARS || jdRaw.length < MIN_CHARS) {
      return NextResponse.json(
        {
          error:
            "Please paste a bit more text — both your CV and the job description are needed to score a match.",
        },
        { status: 400 }
      );
    }

    // Cap input size (protects cost + latency).
    const cv = cvRaw.slice(0, MAX_CV_CHARS);
    const jobDescription = jdRaw.slice(0, MAX_JD_CHARS);

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_ATS_MODEL || "gpt-4.1-mini",
      temperature: 0.2,
      // Force valid JSON so we can't get prose back.
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'You are an ATS expert. Return ONLY valid JSON in this exact structure: { "score": number, "matchedKeywords": string[], "missingKeywords": string[], "improvements": string[] }. "score" is 0-100 for ATS-friendliness and keyword match against the job description. "improvements" must contain exactly 3 concise, specific items.',
        },
        {
          role: "user",
          content: `CV:\n${cv}\n\nJob description:\n${jobDescription}`,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || "";

    // Safe parse: never let a bad model response 500 the front door.
    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json(
        {
          error:
            "Could not analyse that. Please try again with plain text CV and job description.",
        },
        { status: 502 }
      );
    }

    // Validate + normalise the shape before returning it to the client.
    const result = {
      score: clampScore(parsed.score),
      matchedKeywords: toStringArray(parsed.matchedKeywords),
      missingKeywords: toStringArray(parsed.missingKeywords),
      improvements: toStringArray(parsed.improvements, 3),
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("ATS CHECKER ERROR:", error?.message || error);
    // Don't leak internal error details to a public endpoint.
    return NextResponse.json(
      { error: "ATS checker failed. Please try again." },
      { status: 500 }
    );
  }
}