import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

function getBaseUrl() {
  // Works for localhost + Vercel + your custom domain
  const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  return process.env.NEXTAUTH_URL || vercel || "http://localhost:3000";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const plan = body?.plan as "pro" | "ultimate";
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    if (plan !== "pro" && plan !== "ultimate") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // ✅ pick correct price id
    const priceId =
      plan === "pro"
        ? process.env.STRIPE_PRICE_ID
        : process.env.STRIPE_ULTIMATE_PRICE_ID;

    if (!priceId) {
      return NextResponse.json({ error: "Missing price id env var" }, { status: 500 });
    }

    // ✅ ensure user row exists in app_users
    const { data: existingUser, error: userErr } = await supabaseServer
      .from("app_users")
      .select("stripe_customer_id, email")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      return NextResponse.json({ error: "DB error reading user" }, { status: 500 });
    }

    // ✅ Create or reuse Stripe customer
    let customerId = existingUser?.stripe_customer_id || null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { app: "GhostAI" },
      });
      customerId = customer.id;

      const { error: upsertErr } = await supabaseServer.from("app_users").upsert(
        {
          email,
          stripe_customer_id: customerId,
          subscription_tier: "free",
        },
        { onConflict: "email" }
      );

      if (upsertErr) {
        return NextResponse.json({ error: "DB error saving customer id" }, { status: 500 });
      }
    }

    const baseUrl = getBaseUrl();

    // ✅ Create Stripe Checkout Session (subscription)
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: {
        email,
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("CHECKOUT ERROR:", err?.message || err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
