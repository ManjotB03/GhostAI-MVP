import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
    }
  } catch (err) {
    console.error("❌ Stripe webhook handling error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/* ----------------------------- HANDLERS ----------------------------- */

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const email = session.customer_email;
  const customerId = session.customer as string;

  if (!email || !customerId) return;

  await supabase
    .from("app_users")
    .update({
      stripe_customer_id: customerId,
      updated_at: new Date(),
    })
    .eq("email", email);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  let tier: "pro" | "ultimate" | "free" = "free";

  if (priceId === process.env.STRIPE_PRICE_ID) tier = "pro";
  if (priceId === process.env.STRIPE_ULTIMATE_PRICE_ID) tier = "ultimate";

  await supabase
    .from("app_users")
    .update({
      subscription_tier: tier,
      subscription_status: subscription.status,
      subscription_id: subscription.id,
      updated_at: new Date(),
    })
    .eq("stripe_customer_id", customerId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  await supabase
    .from("app_users")
    .update({
      subscription_tier: "free",
      subscription_status: "canceled",
      subscription_id: null,
      updated_at: new Date(),
    })
    .eq("stripe_customer_id", customerId);
}
