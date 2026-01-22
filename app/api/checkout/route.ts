import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(req: Request) {
  try {
    const { plan, email } = await req.json();

    if (!plan || !email) {
      return NextResponse.json({ error: "Missing plan or email" }, { status: 400 });
    }

    const priceId =
      plan === "pro"
        ? process.env.STRIPE_PRICE_ID!
        : plan === "ultimate"
        ? process.env.STRIPE_ULTIMATE_PRICE_ID!
        : null;

    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL!;
    // IMPORTANT: {CHECKOUT_SESSION_ID} lets us verify/lookup later if needed
    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/pricing`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email, // ✅ KEY FIX
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        email, // ✅ KEY FIX
        plan,  // ✅ helpful
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
