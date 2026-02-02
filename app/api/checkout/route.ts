import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // ✅ Don’t set apiVersion if it was giving you red errors
});

type Plan = "pro" | "ultimate";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const plan = body?.plan as Plan | undefined;
    const email = body?.email as string | undefined;

    if (!plan || !email) {
      return NextResponse.json(
        { error: "Missing plan or email" },
        { status: 400 }
      );
    }

    const proPrice = process.env.STRIPE_PRICE_ID;
    const ultimatePrice = process.env.STRIPE_ULTIMATE_PRICE_ID;

    if (!proPrice || !ultimatePrice) {
      return NextResponse.json(
        { error: "Missing STRIPE price env vars" },
        { status: 500 }
      );
    }

    const price =
      plan === "pro" ? proPrice : plan === "ultimate" ? ultimatePrice : null;

    if (!price) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // ✅ Works on localhost + live domain
    const origin =
      req.headers.get("origin") ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    // ✅ Put plan + email in metadata so webhook can update Supabase reliably
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,

      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,

      metadata: {
        plan,
        email,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("CHECKOUT ERROR:", err?.message || err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
