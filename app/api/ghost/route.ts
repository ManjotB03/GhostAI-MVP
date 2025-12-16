import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { runAI } from "@/lib/runAI";

const FREE_DAILY_LIMIT = 5;
const OWNER_EMAIL = "ghostaicorp@gmail.com";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { task, category } = await req.json();

  // 🔴 THIS WAS THE ROOT CAUSE
  if (!task || !task.trim()) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const isOwner = session.user.email === OWNER_EMAIL;

  // ---------------------------
  // OWNER = UNLIMITED
  // ---------------------------
  if (isOwner) {
    return runAI(task, category);
  }

  // ---------------------------
  // FREE USER LIMIT
  // ---------------------------
  const today = new Date().toISOString().slice(0, 10);

  const { data: usage } = await supabase
    .from("ai_usage")
    .select("count")
    .eq("user_id", session.user)
    .eq("date", today)
    .single();

  const used = usage?.count ?? 0;

  if (used >= FREE_DAILY_LIMIT) {
    return NextResponse.json(
      { error: "Limit reached", limitReached: true },
      { status: 403 }
    );
  }

  await supabase.from("ai_usage").upsert({
    user_id: session.user,
    date: today,
    count: used + 1,
  });

  return runAI(task, category);
}
