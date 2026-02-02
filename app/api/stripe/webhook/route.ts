import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET in env");
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message || err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // ✅ We mainly need this one to upgrade users
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const email =
        session.customer_details?.email ||
        (session.metadata?.email as string | undefined);

      const plan = (session.metadata?.plan as string | undefined) ?? "free";

      const tier =
        plan === "ultimate" ? "ultimate" : plan === "pro" ? "pro" : "free";

      if (!email) {
        console.error("No email found on checkout session");
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // Optional helpful fields
      const stripeCustomerId =
        typeof session.customer === "string" ? session.customer : null;

      const stripeSubscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;

      console.log("WEBHOOK UPDATING USER:", {
        email,
        tier,
        stripeCustomerId,
        stripeSubscriptionId,
      });

      // ✅ Update your app_users table
      const { error } = await supabaseServer.from("app_users").upsert(
        {
          email,
          subscription_tier: tier,
          stripe_customer_id: stripeCustomerId,
          subscription_id: stripeSubscriptionId,
          subscription_status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

      if (error) {
        console.error("Supabase upsert error:", error);
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("Webhook handler error:", err?.message || err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
