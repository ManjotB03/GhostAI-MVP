import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET() {
  const env = {
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    STRIPE_SECRET: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    NODE_ENV: process.env.NODE_ENV || null,
    VERCEL_ENV: process.env.VERCEL_ENV || null,
  };

  // Supabase ping (safe)
  let supabaseOk = false;
  let supabaseError: any = null;

  try {
    const { error } = await supabaseServer.from("app_users").select("email").limit(1);
    if (error) supabaseError = error;
    else supabaseOk = true;
  } catch (e: any) {
    supabaseError = { message: e?.message || String(e) };
  }

  return NextResponse.json({
    env,
    supabaseOk,
    supabaseError,
  });
}
