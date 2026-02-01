import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ✅ IMPORTANT: Stripe needs Node runtime

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function getBaseUrl(req: NextRequest) {
  // Prefer NEXTAUTH_URL in prod, otherwise fall back to request origin
  const envUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (envUrl) return envUrl.replace(/\/$/, "");
  const origin = req.headers.get("origin") || "http://localhost:3000";
  return origin.replace(/\/$/, "");
}

export async function POST(req: NextRequest) {
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
        : plan === "ultimate"
        ? process.env.STRIPE_ULTIMATE_PRICE_ID
        : null;

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing Stripe price id for plan" },
        { status: 500 }
      );
    }

    const baseUrl = getBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],

      // ✅ ties Stripe checkout to the logged-in user
      customer_email: email,

      line_items: [{ price: priceId, quantity: 1 }],

      // ✅ MUST be a real URL that exists on your site
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,

      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    // ✅ This will show in Vercel function logs
    console.error("CHECKOUT ERROR:", err?.message || err, err);

    return NextResponse.json(
      {
        error: "Checkout failed",
        // helpful hint (safe):
        hint:
          "Check STRIPE_SECRET_KEY, STRIPE_PRICE_ID, STRIPE_ULTIMATE_PRICE_ID, and Stripe mode (test vs live).",
      },
      { status: 500 }
    );
  }
}
