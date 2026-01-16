import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
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
    console.error("Webhook verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      await upsertSubscription(event.data.object as Stripe.Subscription);
    }

    if (event.type === "customer.subscription.deleted") {
      await cancelSubscription(event.data.object as Stripe.Subscription);
    }
  } catch (err) {
    console.error("Webhook handling error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0].price.id;

  const tier =
    priceId === process.env.STRIPE_ULTIMATE_PRICE_ID
      ? "ultimate"
      : "pro";

  await supabaseServer
    .from("app_users")
    .update({
      subscription_tier: tier,
      subscription_status: subscription.status,
      subscription_id: subscription.id,
      updated_at: new Date(),
    })
    .eq("stripe_customer_id", customerId);
}

async function cancelSubscription(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  await supabaseServer
    .from("app_users")
    .update({
      subscription_tier: "free",
      subscription_status: "canceled",
      subscription_id: null,
      updated_at: new Date(),
    })
    .eq("stripe_customer_id", customerId);
}
