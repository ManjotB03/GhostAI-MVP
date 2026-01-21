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
      return NextResponse.json(
        { error: "Missing plan or email" },
        { status: 400 }
      );
    }

    const priceId =
      plan === "pro"
        ? process.env.STRIPE_PRICE_ID
        : plan === "ultimate"
        ? process.env.STRIPE_ULTIMATE_PRICE_ID
        : null;

    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      // ✅ ensures Stripe session has the user's email
      customer_email: email,

      // ✅ webhook can always map payment -> your user
      metadata: { email, plan },

      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],

      success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
