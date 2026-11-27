import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseServer } from "@/lib/supabaseServer";
import { LIFETIME_STATUS, PASS_DAYS, PASS_STATUS, isPassExpired } from "@/lib/tier";

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

/**
 * Fulfil a one-off Checkout payment (mode: "payment").
 * - lifetime:      Pro forever (status "lifetime", no expiry)
 * - job-hunt-pass: Pro until PASS_DAYS after the purchase (status "pass")
 * Idempotent: Stripe retries produce the same result, because the pass end is
 * computed from the session's own creation time, not from "now".
 */
async function fulfilOneOff(session: any): Promise<NextResponse> {
  const plan = String(session?.metadata?.plan || "").toLowerCase();

  if (plan !== "lifetime" && plan !== "job-hunt-pass") {
    // e.g. cv-boost: nothing to unlock yet.
    return NextResponse.json({ received: true });
  }

  // "no_payment_required" = a £0 checkout (e.g. a 100% off promotion code).
  // Anything else (e.g. "unpaid" for delayed methods) waits for a later event.
  const settled =
    session?.payment_status === "paid" ||
    session?.payment_status === "no_payment_required";
  if (!settled) {
    return NextResponse.json({ received: true });
  }

  const customerId = String(session?.customer || "");
  const email = String(session?.metadata?.email || "");

  let query = supabaseServer
    .from("app_users")
    .select("id,subscription_status,subscription_current_period_end");
  query = customerId ? query.eq("stripe_customer_id", customerId) : query.eq("email", email);
  const { data: row, error: readErr } = await query.maybeSingle();

  if (readErr || !row) {
    // 500 -> Stripe retries; the user row should exist (checkout creates it).
    return NextResponse.json(
      { error: "User not found for one-off payment", details: readErr?.message },
      { status: 500 }
    );
  }

  let update: Record<string, unknown>;

  if (plan === "lifetime") {
    update = {
      subscription_tier: "pro",
      subscription_status: LIFETIME_STATUS,
      subscription_current_period_end: null,
    };
  } else {
    if (row.subscription_status === LIFETIME_STATUS) {
      return NextResponse.json({ received: true }); // already has more than a pass
    }
    const createdMs = (Number(session?.created) || Math.floor(Date.now() / 1000)) * 1000;
    const newEnd = createdMs + PASS_DAYS * 24 * 60 * 60 * 1000;
    const existingEnd =
      row.subscription_status === PASS_STATUS
        ? Date.parse(String(row.subscription_current_period_end || "")) || 0
        : 0;
    update = {
      subscription_tier: "pro",
      subscription_status: PASS_STATUS,
      subscription_current_period_end: new Date(Math.max(newEnd, existingEnd)).toISOString(),
    };
  }

  const { error } = await supabaseServer.from("app_users").update(update).eq("id", row.id);

  if (error) {
    return NextResponse.json(
      { error: "Database update failed", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
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

    // Checkout completed -> one-off payment, or retrieve the subscription
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session?.mode === "payment") {
        return await fulfilOneOff(session);
      }
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

    // Don't let a subscription event overwrite a one-off purchase:
    // a lifetime member keeps Pro, and a live pass isn't downgraded by an old
    // subscription ending. A paid subscription may replace a pass.
    const { data: current } = await supabaseServer
      .from("app_users")
      .select("subscription_status,subscription_current_period_end")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (current?.subscription_status === LIFETIME_STATUS) {
      return NextResponse.json({ received: true });
    }
    if (
      current?.subscription_status === PASS_STATUS &&
      !isPassExpired(current) &&
      tier === "free"
    ) {
      return NextResponse.json({ received: true });
    }

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