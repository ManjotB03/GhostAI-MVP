import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

type Plan = "pro" | "ultimate";

function getPriceId(plan: Plan) {
  if (plan === "pro") return process.env.STRIPE_PRICE_ID!;
  return process.env.STRIPE_ULTIMATE_PRICE_ID!;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const plan = body?.plan as Plan;

    if (!plan || (plan !== "pro" && plan !== "ultimate")) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = getPriceId(plan);
    if (!priceId) {
      return NextResponse.json(
        { error: `Missing price id for ${plan}` },
        { status: 500 }
      );
    }

    // ✅ Use NEXTAUTH_URL as the canonical base
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: session.user.email,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: {
        email: session.user.email,
        plan,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    // ✅ Return the REAL Stripe error to the frontend (huge for debugging)
    console.error("CHECKOUT ERROR:", err);

    const message =
      err?.raw?.message ||
      err?.message ||
      "Checkout failed";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
