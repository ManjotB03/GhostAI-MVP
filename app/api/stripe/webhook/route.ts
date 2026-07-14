import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

/**
 * Stripe requires RAW body for signature verification.
 * Use req.text() (NOT req.json()).
 */

type Tier = "free" | "pro" | "ultimate";

/**
 * Map a checkout "plan" value (as stamped by the checkout route into
 * subscription_data.metadata.plan) to a subscription tier.
 * Returns null if the plan string isn't a recognised subscription plan.
 */
function tierFromPlan(plan: string | undefined | null): Tier | null {
  const p = String(plan || "").toLowerCase();
  if (p === "pro-monthly" || p === "pro-annual") return "pro";
  if (p === "ultimate-monthly" || p === "ultimate-annual") return "ultimate";
  return null; // cv-boost or unknown -> not a subscription tier
}

/**
 * Map a Stripe price ID to a tier by comparing against the four
 * subscription price-ID env vars used by the checkout route.
 * Returns null if none match.
 */
function tierFromPriceId(priceId: string | undefined | null): Tier | null {
  const id = String(priceId || "");
  if (!id) return null;

  const proIds = [
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  ].filter(Boolean) as string[];

  const ultimateIds = [
    process.env.STRIPE_ULTIMATE_MONTHLY_PRICE_ID,
    process.env.STRIPE_ULTIMATE_ANNUAL_PRICE_ID,
  ].filter(Boolean) as string[];

  if (ultimateIds.includes(id)) return "ultimate";
  if (proIds.includes(id)) return "pro";
  return null;
}

function tierFromSubscription(sub: any): Tier {
  // Not paid -> always free (covers canceled / past_due / unpaid / incomplete).
  const status = String(sub?.status || "");
  const isPaid = status === "active" || status === "trialing";
  if (!isPaid) return "free";

  // 1) Prefer the plan stamped into subscription metadata by the checkout route.
  const metaTier = tierFromPlan(sub?.metadata?.plan);
  if (metaTier) return metaTier;

  // 2) Fall back to matching the subscription's line-item price IDs.
  const items = sub?.items?.data || [];
  const priceIds: string[] = items
    .map((it: any) => it?.price?.id)
    .filter(Boolean);

  // Prefer the highest tier present if multiple items exist.
  if (priceIds.some((id) => tierFromPriceId(id) === "ultimate")) return "ultimate";
  if (priceIds.some((id) => tierFromPriceId(id) === "pro")) return "pro";

  // 3) Paid but unrecognised -> default to free (safe).
  return "free";
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
      // e.g. a one-off "cv-boost" payment (mode: "payment") has no subscription.
      // Nothing to do here for tier changes; acknowledge so Stripe doesn't retry.
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