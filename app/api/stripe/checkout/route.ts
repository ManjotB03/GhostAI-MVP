// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { supabaseServer } from "@/lib/supabaseServer";
import { LIFETIME_STATUS, PASS_STATUS, isPassExpired, lifetimeSale } from "@/lib/tier";
import { countLifetimeMembers } from "@/lib/lifetime";

export const runtime = "nodejs";

type CheckoutPlan =
  | "pro-monthly"
  | "pro-annual"
  | "ultimate-monthly"
  | "ultimate-annual"
  | "cv-boost"
  | "lifetime"
  | "job-hunt-pass"
  | "cv-rewrite";

const PRICE_IDS: Record<CheckoutPlan, string | undefined> = {
  "pro-monthly": process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
  "pro-annual": process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  "ultimate-monthly": process.env.STRIPE_ULTIMATE_MONTHLY_PRICE_ID,
  "ultimate-annual": process.env.STRIPE_ULTIMATE_ANNUAL_PRICE_ID,
  "cv-boost": process.env.STRIPE_CV_BOOST_PRICE_ID,
  lifetime: process.env.STRIPE_LIFETIME_PRICE_ID,
  "job-hunt-pass": process.env.STRIPE_JOB_HUNT_PASS_PRICE_ID,
  "cv-rewrite": process.env.STRIPE_CV_REWRITE_PRICE_ID,
};

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000"
  );
}

const ONE_OFF_PLANS: CheckoutPlan[] = ["cv-boost", "lifetime", "job-hunt-pass", "cv-rewrite"];

function isSubscriptionPlan(plan: CheckoutPlan) {
  return !ONE_OFF_PLANS.includes(plan);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const body = await req.json().catch(() => null);

    const legacyTier = String(body?.tier || "").toLowerCase();
    const billingCycle = String(body?.billingCycle || "monthly").toLowerCase();

    let plan = String(body?.plan || "").toLowerCase() as CheckoutPlan;

    if (!plan && (legacyTier === "pro" || legacyTier === "ultimate")) {
      plan = `${legacyTier}-${billingCycle === "annual" ? "annual" : "monthly"}` as CheckoutPlan;
    }

    const validPlans: CheckoutPlan[] = [
      "pro-monthly",
      "pro-annual",
      "ultimate-monthly",
      "ultimate-annual",
      "cv-boost",
      "lifetime",
      "job-hunt-pass",
      "cv-rewrite",
    ];

    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: "Invalid checkout plan" }, { status: 400 });
    }

    if (plan === "lifetime" && !lifetimeSale().open) {
      return NextResponse.json(
        { error: "The Founding Lifetime Pass isn't on sale right now." },
        { status: 403 }
      );
    }

    const priceId = PRICE_IDS[plan];
    const baseUrl = getBaseUrl();

    if (!priceId) {
      return NextResponse.json(
        { error: `Missing Stripe price ID for ${plan}` },
        { status: 500 }
      );
    }

    const { data: userRow, error: userErr } = await supabaseServer
      .from("app_users")
      .select("id,email,stripe_customer_id,subscription_status,subscription_current_period_end")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      return NextResponse.json(
        { error: "DB error", details: userErr.message },
        { status: 500 }
      );
    }

    let userId = userRow?.id;
    let stripeCustomerId = userRow?.stripe_customer_id as string | null | undefined;

    if (!userId) {
      const { data: created, error: createErr } = await supabaseServer
        .from("app_users")
        .insert({ email, subscription_tier: "free" })
        .select("id")
        .single();

      if (createErr) {
        return NextResponse.json(
          { error: "User create failed", details: createErr.message },
          { status: 500 }
        );
      }

      userId = created.id;
    }

    const status = userRow?.subscription_status;
    const hasActiveSub = status === "active" || status === "trialing";
    const hasLifetime = status === LIFETIME_STATUS;
    const hasLivePass = status === PASS_STATUS && !isPassExpired(userRow);

    // A lifetime member can still buy a human CV Rewrite.
    if (hasLifetime && plan !== "cv-boost" && plan !== "cv-rewrite") {
      return NextResponse.json({
        alreadySubscribed: true,
        message: "You already have the Lifetime Pass, so there's nothing more to buy.",
      });
    }

    if (isSubscriptionPlan(plan) && (hasActiveSub || hasLivePass)) {
      return NextResponse.json({
        alreadySubscribed: true,
        message: hasLivePass
          ? "Your Job Hunt Pass is still active."
          : "You already have an active subscription.",
      });
    }

    if (plan === "job-hunt-pass" && hasActiveSub) {
      return NextResponse.json({
        alreadySubscribed: true,
        message: "You already have an active subscription with the same features.",
      });
    }

    if (plan === "lifetime") {
      const { cap } = lifetimeSale();
      let sold: number;
      try {
        sold = await countLifetimeMembers();
      } catch (e: any) {
        return NextResponse.json(
          { error: "DB error", details: e?.message || "count failed" },
          { status: 500 }
        );
      }

      if (sold >= cap) {
        return NextResponse.json(
          { error: "All Founding Lifetime spots have been claimed." },
          { status: 409 }
        );
      }
    }

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId: String(userId) },
      });

      stripeCustomerId = customer.id;

      await supabaseServer
        .from("app_users")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("email", email);
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: isSubscriptionPlan(plan) ? "subscription" : "payment",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: String(userId),
      metadata: {
        userId: String(userId),
        email,
        plan,
      },
      ...(isSubscriptionPlan(plan)
        ? {
            subscription_data: {
              metadata: {
                userId: String(userId),
                email,
                plan,
              },
            },
          }
        : {}),
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${baseUrl}${plan === "lifetime" ? "/lifetime" : plan === "cv-rewrite" ? "/cv-rewrite" : "/pricing"}`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err: any) {
    console.error("STRIPE CHECKOUT ERROR:", err);

    return NextResponse.json(
      {
        error: "Stripe checkout failed",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
