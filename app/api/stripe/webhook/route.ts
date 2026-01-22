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

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  try {
    // ✅ Best event to update user right after payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const email =
        (session.customer_details?.email as string) ||
        (session.customer_email as string) ||
        (session.metadata?.email as string);

      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!email) {
        console.error("No email found on checkout.session.completed");
        return NextResponse.json({ received: true });
      }

      // Fetch subscription to determine tier from price id
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price?.id;

      const tier =
        priceId === process.env.STRIPE_ULTIMATE_PRICE_ID ? "ultimate" : "pro";

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

    // ✅ Keep status in sync if Stripe updates/cancels later
    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const priceId = subscription.items.data[0]?.price?.id;

      const tier =
        event.type === "customer.subscription.deleted"
          ? "free"
          : priceId === process.env.STRIPE_ULTIMATE_PRICE_ID
          ? "ultimate"
          : "pro";

      await supabaseServer
        .from("app_users")
        .update({
          subscription_id: subscription.id,
          subscription_status:
            event.type === "customer.subscription.deleted"
              ? "canceled"
              : subscription.status,
          subscription_tier: tier,
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
