import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

function tierFromPrice(priceId: string) {
  if (priceId === process.env.STRIPE_ULTIMATE_PRICE_ID) return "ultimate";
  if (priceId === process.env.STRIPE_PRICE_ID) return "pro";
  return "free";
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook verify failed:", err.message);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    // ✅ These are the key events for subscriptions
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const email = (session.customer_email || session.metadata?.email || "").toLowerCase();
      const customerId = String(session.customer || "");
      const subscriptionId = String(session.subscription || "");

      if (!email) {
        console.warn("checkout.session.completed missing email");
        return NextResponse.json({ received: true });
      }

      // We can look up subscription to get the exact price
      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ["items.data.price"],
        });

        const priceId = sub.items.data[0]?.price?.id || "";
        const tier = tierFromPrice(priceId);

        await supabaseServer
          .from("app_users")
          .update({
            stripe_customer_id: customerId || null,
            subscription_id: sub.id,
            subscription_status: sub.status,
            subscription_tier: tier,
            updated_at: new Date().toISOString(),
          })
          .eq("email", email);

        return NextResponse.json({ received: true });
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const sub = event.data.object as Stripe.Subscription;

      const customerId = String(sub.customer || "");
      const priceId = sub.items.data[0]?.price?.id || "";
      const tier = tierFromPrice(priceId);

      // Find email via Stripe customer
      let email = "";
      if (customerId) {
        const cust = await stripe.customers.retrieve(customerId);
        if (!("deleted" in cust) && cust.email) email = cust.email.toLowerCase();
      }

      if (!email) {
        console.warn("subscription event missing email");
        return NextResponse.json({ received: true });
      }

      await supabaseServer
        .from("app_users")
        .update({
          stripe_customer_id: customerId || null,
          subscription_id: sub.id,
          subscription_status: sub.status,
          subscription_tier: tier,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      return NextResponse.json({ received: true });
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;

      const customerId = String(sub.customer || "");

      // Find email via Stripe customer
      let email = "";
      if (customerId) {
        const cust = await stripe.customers.retrieve(customerId);
        if (!("deleted" in cust) && cust.email) email = cust.email.toLowerCase();
      }

      if (!email) {
        console.warn("subscription.deleted missing email");
        return NextResponse.json({ received: true });
      }

      await supabaseServer
        .from("app_users")
        .update({
          subscription_tier: "free",
          subscription_status: "canceled",
          subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
