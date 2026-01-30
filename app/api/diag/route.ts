import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    NODE_ENV: process.env.NODE_ENV || null,
  };

  let supabaseOk = false;
  let supabaseError: unknown = null;

  try {
    const { error } = await supabaseServer.from("app_users").select("email").limit(1);
    if (error) supabaseError = error;
    else supabaseOk = true;
  } catch (e) {
    supabaseError = e;
  }

  return NextResponse.json({ env, supabaseOk, supabaseError });
}
