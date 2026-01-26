import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

function tierFromPriceId(priceId?: string | null) {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_ULTIMATE_PRICE_ID) return "ultimate";
  if (priceId === process.env.STRIPE_PRICE_ID) return "pro";
  return "pro"; // fallback if you add more later
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err?.message || err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // ✅ 1) Checkout completed: best place to map Stripe -> your user via email
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const email = session.customer_details?.email || session.customer_email || null;
      const customerId = typeof session.customer === "string" ? session.customer : null;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;

      if (!email) {
        console.warn("⚠️ checkout.session.completed missing email");
        return NextResponse.json({ received: true });
      }

      // pull subscription to read price id (tier)
      let tier = "pro";
      let status: string | null = null;

      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = sub.items.data?.[0]?.price?.id;
        tier = tierFromPriceId(priceId);
        status = sub.status;
      }

      // ✅ update user row by email (source of truth)
      const { error: upErr } = await supabaseServer
        .from("app_users")
        .update({
          stripe_customer_id: customerId,
          subscription_id: subscriptionId,
          subscription_status: status || "active",
          subscription_tier: tier,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      if (upErr) {
        console.error("❌ Supabase update failed:", upErr);
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
      }

      console.log("✅ Updated user from checkout:", { email, tier, customerId, subscriptionId });
    }

    // ✅ 2) Subscription updated/deleted: keep tier/status in sync later
    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : null;
      const priceId = sub.items.data?.[0]?.price?.id;
      const tier = event.type === "customer.subscription.deleted" ? "free" : tierFromPriceId(priceId);
      const status = sub.status;

      if (customerId) {
        const { error: upErr } = await supabaseServer
          .from("app_users")
          .update({
            subscription_id: sub.id,
            subscription_status: status,
            subscription_tier: tier,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (upErr) console.error("❌ Supabase update failed (sub event):", upErr);
        else console.log("✅ Synced user from sub event:", { customerId, tier, status });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("❌ Webhook handler error:", err?.message || err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
