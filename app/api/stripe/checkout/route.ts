// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { supabaseServer } from "@/lib/supabaseServer";
import type { Tier } from "@/lib/limits";

export const runtime = "nodejs";

const PRICE_IDS: Record<Exclude<Tier, "free">, string | undefined> = {
  pro: process.env.STRIPE_PRICE_ID,
  ultimate: process.env.STRIPE_ULTIMATE_PRICE_ID,
};

function getBaseUrl() {
  // Prefer NEXT_PUBLIC_URL (your env), fallback to NextAuth/Vercel
  const fromPublic = process.env.NEXT_PUBLIC_URL;
  const fromAuth = process.env.NEXTAUTH_URL;
  const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;

  return fromPublic || fromAuth || vercel || "http://localhost:3000";
}

export async function POST(req: Request) {
  try {
    // 1) Auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;

    // 2) Body
    const body = await req.json().catch(() => null);
    const tier = String(body?.tier || "").toLowerCase() as Tier;

    if (tier !== "pro" && tier !== "ultimate") {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // 3) Env sanity checks (THIS will reveal your real issue)
    const baseUrl = getBaseUrl();
    const priceId = PRICE_IDS[tier];

    const missing: string[] = [];
    if (!process.env.STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY");
    if (!process.env.NEXT_PUBLIC_URL && !process.env.NEXTAUTH_URL && !process.env.VERCEL_URL)
      missing.push("NEXT_PUBLIC_URL (or NEXTAUTH_URL / VERCEL_URL)");
    if (!priceId) missing.push(tier === "pro" ? "STRIPE_PRICE_ID" : "STRIPE_ULTIMATE_PRICE_ID");

    if (missing.length) {
      return NextResponse.json(
        {
          error: "Missing environment variables",
          missing,
          baseUrlResolved: baseUrl,
        },
        { status: 500 }
      );
    }

    // 4) Ensure user row exists + customer exists
    const { data: userRow, error: userErr } = await supabaseServer
      .from("app_users")
      .select("id,email,stripe_customer_id,subscription_status")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      return NextResponse.json({ error: "DB error", details: userErr.message }, { status: 500 });
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

    // Optional: stop users making multiple active subs
    if (userRow?.subscription_status === "active" || userRow?.subscription_status === "trialing") {
      return NextResponse.json({
        alreadySubscribed: true,
        message: "You already have an active subscription.",
      });
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

    // 5) Create checkout session
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId!, quantity: 1 }],
      allow_promotion_codes: true,

      client_reference_id: String(userId),
      metadata: { userId: String(userId), email, tier },
      subscription_data: {
        metadata: { userId: String(userId), email, tier },
      },

      success_url: `${baseUrl}/billing?success=1`,
      cancel_url: `${baseUrl}/pricing?canceled=1`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err: any) {
    // ✅ Return real Stripe error message
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