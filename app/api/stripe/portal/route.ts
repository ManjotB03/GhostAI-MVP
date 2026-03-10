import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

function getReturnUrl() {
  const fromPublic = process.env.NEXT_PUBLIC_URL;
  const fromAuth = process.env.NEXTAUTH_URL;
  const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  return fromPublic || fromAuth || vercel || "http://localhost:3000";
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;

    const { data: userRow, error } = await supabaseServer
      .from("app_users")
      .select("stripe_customer_id")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "DB error", details: error.message }, { status: 500 });
    }

    const customerId = userRow?.stripe_customer_id;
    if (!customerId) {
      return NextResponse.json({ error: "No Stripe customer found for this user" }, { status: 400 });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getReturnUrl()}/billing`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Portal error", details: err?.message || "Unknown" },
      { status: 500 }
    );
  }
}