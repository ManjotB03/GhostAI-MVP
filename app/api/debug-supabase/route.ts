import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";

const OWNER_EMAIL = "ghostaicorp@gmail.com";

export const runtime = "nodejs";

export async function GET() {
  // Only allow you (owner) to view this
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email || email !== OWNER_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Basic env check (don’t leak keys)
  const envCheck = {
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  // Test 1: can we read ai_usage?
  const { data: usageTest, error: usageErr } = await supabaseServer
    .from("ai_usage")
    .select("email,date,count")
    .limit(1);

  // Test 2: can we read app_users?
  const { data: userTest, error: userErr } = await supabaseServer
    .from("app_users")
    .select("email,subscription_tier")
    .limit(1);

  return NextResponse.json({
    ok: true,
    envCheck,
    usageTest,
    usageErr,
    userTest,
    userErr,
  });
}
