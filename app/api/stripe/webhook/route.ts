import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
});

export async function POST(req: Request) {
    const sig = req.headers.get("stripe-signature")!;
    
    if (!sig) {
        return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }

    let event;

    try {
        const body = await req.text();
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }

    const data = event.data.object as Stripe.Subscription;

    try {
        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
                await handleSubscriptionUpdate(data);
                break;

            case "customer.subscription.deleted":
                await handleSubscriptionUpdate(data);
                break;  
            
            default:
                break;
        }   
    } catch (err) {
        console.error("Error handling subscription event:", err);
        return NextResponse.json({ error: "Error handling subscription event" }, { status: 500 });
    }   

    return NextResponse.json({ received: true });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const costumerID = subscription.customer as string;
    const priceId = subscription.items.data[0].price.id;

    const tier = priceId === process.env.STRIPE_ULTIMATE_PRICE_ID ? "ultimate" : "pro";

    const { data: user, error } = await supabase
        .from("app_users")
        .select("*")
        .eq("stripe_customer_id", costumerID)
        .single();  
    
    if (error || !user) {
        await supabase
            .from("app_users")
            .insert({
                stripe_customer_id: costumerID,
                subscription_tier: tier,
                subscription_status: subscription.status,
                subscription_id: subscription.id,
                updated_at: new Date(),
            });
    }       

    async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
        const costumerID = subscription.customer as string;

        await supabase
            .from("app_users")
            .update({
                subscription_tier: "free",
                subscription_status: "canceled",
                subscription_id: null,
                updated_at: new Date(),
            })
            .eq("stripe_customer_id", costumerID);
    }
}