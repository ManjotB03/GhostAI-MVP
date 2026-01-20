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
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;

      const email =
        session.customer_details?.email ||
        session.customer_email ||
        (session.metadata?.email as string | undefined);

      const customerId = session.customer as string | null;
      const subscriptionId = session.subscription as string | null;

      if (!email) {
        console.error("No email on checkout session");
        return NextResponse.json({ received: true });
      }

      // Get subscription to read the priceId
      if (!subscriptionId) {
        console.error("No subscriptionId on checkout session");
        return NextResponse.json({ received: true });
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price?.id;

      let tier: "free" | "pro" | "ultimate" = "free";
      if (priceId === process.env.STRIPE_ULTIMATE_PRICE_ID) tier = "ultimate";
      else if (priceId === process.env.STRIPE_PRICE_ID) tier = "pro";

      await supabaseServer
        .from("app_users")
        .update({
          stripe_customer_id: customerId,
          subscription_id: subscriptionId,
          subscription_status: subscription.status,
          subscription_tier: tier,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      return NextResponse.json({ received: true });
    }

    // Subscription cancelled → downgrade to free
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabaseServer
        .from("app_users")
        .update({
          subscription_tier: "free",
          subscription_status: "canceled",
          subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId);

      return NextResponse.json({ received: true });
    }

    // Subscription updated (renewal, past_due, etc.)
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const priceId = subscription.items.data[0]?.price?.id;

      let tier: "free" | "pro" | "ultimate" = "free";
      if (priceId === process.env.STRIPE_ULTIMATE_PRICE_ID) tier = "ultimate";
      else if (priceId === process.env.STRIPE_PRICE_ID) tier = "pro";

      await supabaseServer
        .from("app_users")
        .update({
          subscription_tier: tier,
          subscription_status: subscription.status,
          subscription_id: subscription.id,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId);

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }
}
