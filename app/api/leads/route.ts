import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

// POST /api/leads
// { email, source: "ats-report" | "lifetime-waitlist", consent?: boolean, report?: {...} }
// Stores the lead. For "ats-report" it also emails the report via Resend when
// RESEND_API_KEY + REPORT_FROM_EMAIL are configured.
// Responds { stored, emailed } so the UI can tell the truth about what happened.

const SOURCES = ["ats-report", "lifetime-waitlist"] as const;
type Source = (typeof SOURCES)[number];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Same simple per-instance limiter as the ATS checker: 5 requests/min/IP.
const hits = new Map<string, { count: number; resetAt: number }>();
function limited(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || e.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  e.count += 1;
  return e.count > 5;
}

function esc(s: unknown) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function strings(v: unknown, max = 15): string[] {
  return Array.isArray(v)
    ? v.filter((x) => typeof x === "string").slice(0, max).map((x) => x.slice(0, 200))
    : [];
}

type Report = { score: number; missing: string[]; matched: string[]; improvements: string[] };

function cleanReport(r: any): Report | null {
  if (!r || typeof r !== "object") return null;
  const score = Math.max(0, Math.min(100, Math.round(Number(r.score) || 0)));
  return {
    score,
    missing: strings(r.missingKeywords),
    matched: strings(r.matchedKeywords),
    improvements: strings(r.improvements, 5),
  };
}

async function sendReport(to: string, report: Report): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.REPORT_FROM_EMAIL; // e.g. "GhostAI <reports@ghostaicorp.com>"
  if (!key || !from) return false;

  const list = (items: string[]) =>
    items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "<p>None found.</p>";

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;color:#0f172a">
    <h2 style="margin:0 0 8px">Your GhostAI ATS report</h2>
    <p style="font-size:32px;font-weight:bold;margin:8px 0">${report.score}% match</p>
    <h3>Missing keywords</h3>${list(report.missing)}
    <h3>Matched keywords</h3>${list(report.matched)}
    <h3>Top improvements</h3>${list(report.improvements)}
    <p style="margin-top:24px">Want GhostAI to rewrite your CV for this role and track the application?
    <a href="https://www.ghostaicorp.com/signup">Start free</a>.</p>
    <p style="color:#64748b;font-size:12px;margin-top:24px">You're getting this because you asked for your report on ghostaicorp.com.
    GhostAI helps you prepare stronger applications; it doesn't guarantee interviews or job offers.</p>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: `Your ATS report: ${report.score}% match`, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (limited(req)) {
    return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const email = String(body?.email || "").trim().toLowerCase().slice(0, 254);
  const source = String(body?.source || "") as Source;
  const consent = body?.consent === true;

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!SOURCES.includes(source)) {
    return NextResponse.json({ error: "Unknown form." }, { status: 400 });
  }

  const report = source === "ats-report" ? cleanReport(body?.report) : null;
  if (source === "ats-report" && !report) {
    return NextResponse.json({ error: "Run a check first." }, { status: 400 });
  }

  const { error } = await supabaseServer.from("leads").insert({
    email,
    source,
    marketing_consent: consent,
    payload: report ? { score: report.score } : null,
  });
  const stored = !error;
  if (error) console.error("LEADS INSERT ERROR:", error.message);

  const emailed = report ? await sendReport(email, report) : false;

  if (!stored && !emailed) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ stored, emailed });
}
