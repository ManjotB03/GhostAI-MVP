import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

/**
 * Stripe requires RAW body for signature verification.
 * Use req.text() (NOT req.json()).
 */

function tierFromSubscription(sub: any) {
  // Default to free
  let tier: "free" | "pro" | "ultimate" = "free";

  const status = String(sub?.status || "");
  const isPaid = status === "active" || status === "trialing";

  if (!isPaid) return tier;

  const items = sub?.items?.data || [];
  const priceIds: string[] = items
    .map((it: any) => it?.price?.id)
    .filter(Boolean);

  if (priceIds.includes(process.env.STRIPE_ULTIMATE_PRICE_ID!)) return "ultimate";
  if (priceIds.includes(process.env.STRIPE_PRICE_ID!)) return "pro";

  return tier;
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    const relevant =
      event.type === "checkout.session.completed" ||
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted";

    if (!relevant) {
      return NextResponse.json({ received: true });
    }

    let subscription: any = null;

    // Subscription events include the subscription directly
    if (event.type.startsWith("customer.subscription.")) {
      subscription = event.data.object;
    }

    // Checkout completed -> retrieve subscription from Stripe
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session?.subscription) {
        subscription = await stripe.subscriptions.retrieve(String(session.subscription));
      }
    }

    if (!subscription) {
      return NextResponse.json({ received: true });
    }

    const customerId = String(subscription.customer || "");
    if (!customerId) {
      return NextResponse.json({ received: true });
    }

    const tier = tierFromSubscription(subscription);

    // current_period_end is a unix timestamp (seconds)
    const currentPeriodEnd =
      typeof subscription.current_period_end === "number"
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null;

    const { error } = await supabaseServer
      .from("app_users")
      .update({
        subscription_tier: tier,
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_current_period_end: currentPeriodEnd,
      })
      .eq("stripe_customer_id", customerId);

    if (error) {
      // Returning 500 makes Stripe retry (good if DB hiccup)
      return NextResponse.json(
        { error: "Database update failed", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Webhook handler failed", details: err?.message || "Unknown" },
      { status: 500 }
    );
  }
}