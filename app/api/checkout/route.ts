import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Legacy route kept for backward compatibility.
 * Redirects to the canonical Stripe checkout route: /api/stripe/checkout
 *
 * Expected body (legacy): { plan: "pro" | "ultimate", email?: string }
 * Canonical body:        { tier: "pro" | "ultimate" }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const plan = String(body?.plan || "").toLowerCase();
    const tier = plan === "ultimate" ? "ultimate" : "pro"; // default to pro if something weird

    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ""}/api/stripe/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });

    const data = await res.json().catch(() => ({}));

    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Checkout failed", details: err?.message || "Unknown" },
      { status: 500 }
    );
  }
}