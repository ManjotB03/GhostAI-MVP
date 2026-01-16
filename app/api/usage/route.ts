import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";

const FREE_DAILY_LIMIT = 5;
const OWNER_EMAIL = "ghostaicorp@gmail.com"; // 🔴 your owner account

export async function GET() {
  const session = await getServerSession(authOptions);

  // 🔐 Not logged in
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const email = session.user.email;
  const isOwner = email === OWNER_EMAIL;

  // 🧑‍💼 Owner = unlimited
  if (isOwner) {
    return NextResponse.json({
      tier: "owner",
      used: 0,
      limit: Infinity,
      remaining: Infinity,
      limitReached: false,
    });
  }

  // 📅 Today (UTC)
  const today = new Date().toISOString().slice(0, 10);

  // 🔎 Fetch usage
  const { data: usage, error } = await supabaseServer
    .from("ai_usage")
    .select("count")
    .eq("email", email)
    .eq("date", today)
    .single();

  const used = usage?.count ?? 0;
  const remaining = Math.max(FREE_DAILY_LIMIT - used, 0);

  return NextResponse.json({
    tier: "free",
    used,
    limit: FREE_DAILY_LIMIT,
    remaining,
    limitReached: used >= FREE_DAILY_LIMIT,
  });
}
