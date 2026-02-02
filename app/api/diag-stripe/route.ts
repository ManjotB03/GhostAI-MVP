import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mask(key?: string | null) {
  if (!key) return null;
  return key.slice(0, 8) + "..." + key.slice(-4);
}

export async function GET() {
  const secret = process.env.STRIPE_SECRET_KEY;

  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Missing STRIPE_SECRET_KEY" },
      { status: 500 }
    );
  }

  const keyType =
    secret.startsWith("sk_test_")
      ? "sk_test"
      : secret.startsWith("sk_live_")
      ? "sk_live"
      : secret.startsWith("pk_")
      ? "❌ PUBLISHABLE KEY USED BY MISTAKE"
      : "❌ UNKNOWN KEY FORMAT";

  const stripe = new Stripe(secret, {
    apiVersion: "2025-11-17.clover",
    maxNetworkRetries: 2,
    timeout: 30000,
  });

  try {
    // Simple Stripe auth + connectivity check
    const account = await stripe.accounts.retrieve();

    return NextResponse.json({
      ok: true,
      keyType,
      keyMasked: mask(secret),
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      country: account.country,
      defaultCurrency: account.default_currency,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        keyType,
        keyMasked: mask(secret),
        errorType: err?.type,
        errorMessage: err?.message,
        statusCode: err?.statusCode,
        code: err?.code,
        raw: err?.raw?.message,
      },
      { status: 500 }
    );
  }
}
