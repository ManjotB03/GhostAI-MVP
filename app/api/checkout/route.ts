import Stripe from "stripe";
import { NextResponse } from "next/server";     

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",   
});

export async function POST() {
    try {
        console.log("DEBUG - NEXT_PUBLIC_URL:", process.env.NEXT_PUBLIC_URL);
        console.log("DEBUG - FULL success URL =", `${process.env.NEXT_PUBLIC_URL}/success`);
        
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [   
                {
                    price: process.env.STRIPE_PRICE_ID!,
                    quantity: 1,        
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
        }); 
        
        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error("Stripe error:", err);
        return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
    }   
}