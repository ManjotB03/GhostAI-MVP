import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ✅ IMPORTANT (prevents Edge runtime issues)
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // ✅ DO NOT set apiVersion unless you know it is valid for your Stripe account
  // apiVersion: "2024-06-20",
  maxNetworkRetries: 2,
  timeout: 30000,
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const plan = body?.plan as "pro" | "ultimate" | undefined;
    const email = body?.email as string | undefined;

    if (!plan) {
      return NextResponse.json({ error: "Missing plan" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const priceId =
      plan === "pro"
        ? process.env.STRIPE_PRICE_ID
        : process.env.STRIPE_ULTIMATE_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing Stripe price id for plan" },
        { status: 500 }
      );
    }

    // ✅ Use NEXTAUTH_URL so it works on localhost + live
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    // ✅ Surface the REAL Stripe error to you
    console.error("STRIPE CHECKOUT ERROR:", {
      type: err?.type,
      message: err?.message,
      code: err?.code,
      statusCode: err?.statusCode,
      raw: err?.raw?.message,
    });

    return NextResponse.json(
      {
        error: "Checkout failed",
        details: err?.message || "Unknown Stripe error",
      },
      { status: 500 }
    );
  }
}
