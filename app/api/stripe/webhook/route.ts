import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

function tierFromPriceId(priceId?: string | null) {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_ULTIMATE_PRICE_ID) return "ultimate";
  return "free";
}

export async function POST(req: Request) {
  const sig = (await headers()).get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !whSecret) {
    return NextResponse.json({ error: "Missing Stripe signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (err: any) {
    console.error("WEBHOOK SIGNATURE ERROR:", err?.message || err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // ✅ handle checkout completion (most important)
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

      // Pull plan from metadata OR inspect subscription items
      const metaPlan = (session.metadata?.plan || "").toLowerCase();
      let tier: "free" | "pro" | "ultimate" =
        metaPlan === "pro" || metaPlan === "ultimate" ? (metaPlan as any) : "free";

      // If metadata missing, attempt to infer from subscription price
      if (tier === "free" && subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ["items.data.price"],
        });
        const priceId = (sub.items.data?.[0]?.price as Stripe.Price | undefined)?.id || null;
        tier = tierFromPriceId(priceId) as any;
      }

      // Update app_users by stripe_customer_id (best key)
      if (customerId) {
        const { error } = await supabaseServer
          .from("app_users")
          .update({
            subscription_tier: tier,
            subscription_status: "active",
            subscription_id: subscriptionId || null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("DB UPDATE ERROR (checkout.session.completed):", error);
          return NextResponse.json({ error: "DB update failed" }, { status: 500 });
        }
      }

      return NextResponse.json({ received: true });
    }

    // ✅ subscription updates (keep status in sync)
    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;

      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
      const status = sub.status; // active, canceled, past_due etc.
      const priceId = (sub.items.data?.[0]?.price as Stripe.Price | undefined)?.id || null;
      const tier = tierFromPriceId(priceId);

      if (customerId) {
        const { error } = await supabaseServer
          .from("app_users")
          .update({
            subscription_tier: tier,
            subscription_status: status,
            subscription_id: sub.id,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("DB UPDATE ERROR (subscription event):", error);
          return NextResponse.json({ error: "DB update failed" }, { status: 500 });
        }
      }

      return NextResponse.json({ received: true });
    }

    // Ignore other events
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("WEBHOOK HANDLER ERROR:", err?.message || err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
