import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
  apiVersion: "2025-11-17.clover",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await handleStripeEvent(event);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook handler error:", err?.message);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleStripeEvent(event: Stripe.Event) {
  const proPrice = process.env.STRIPE_PRICE_ID?.trim();
  const ultimatePrice = process.env.STRIPE_ULTIMATE_PRICE_ID?.trim();

  // ---- CASE 1: checkout.session.completed (best source of email) ----
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const email = String(session.customer_details?.email || session.customer_email || "").trim();
    const customerId = String(session.customer || "").trim();
    const subscriptionId = String(session.subscription || "").trim();

    if (!email) {
      console.warn("checkout.session.completed had no email");
      return;
    }

    // Pull the subscription to identify the price
    let tier: "free" | "pro" | "ultimate" = "pro";
    if (subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = sub.items.data?.[0]?.price?.id;
      tier = priceId === ultimatePrice ? "ultimate" : "pro";
    }

    await supabaseServer
      .from("app_users")
      .update({
        subscription_tier: tier,
        subscription_status: "active",
        stripe_customer_id: customerId || null,
        subscription_id: subscriptionId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    return;
  }

  // ---- CASE 2: customer.subscription.* (no email, so map by customer id) ----
  const sub = event.data.object as Stripe.Subscription;
  const customerId = String(sub.customer || "").trim();
  const subscriptionId = String(sub.id || "").trim();

  const priceId = sub.items.data?.[0]?.price?.id;
  const tier: "free" | "pro" | "ultimate" =
    event.type === "customer.subscription.deleted"
      ? "free"
      : priceId === ultimatePrice
      ? "ultimate"
      : "pro";

  const status =
    event.type === "customer.subscription.deleted" ? "canceled" : String(sub.status || "active");

  if (!customerId) return;

  await supabaseServer
    .from("app_users")
    .update({
      subscription_tier: tier,
      subscription_status: status,
      subscription_id: tier === "free" ? null : subscriptionId,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}
