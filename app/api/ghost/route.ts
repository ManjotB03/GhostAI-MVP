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

  if (!task || !task.trim()) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const email = session.user.email;
  const today = new Date().toISOString().slice(0, 10);

  // 👑 OWNER = UNLIMITED
  if (email === OWNER_EMAIL) {
    return runAI(task, category);
  }

  // 🔍 Fetch usage
  const { data: usage } = await supabase
    .from("ai_usage")
    .select("id, count")
    .eq("user_email", email)
    .eq("date", today)
    .maybeSingle();

  const used = usage?.count ?? 0;

  // 🚫 Limit reached
  if (used >= FREE_DAILY_LIMIT) {
    return NextResponse.json(
      { error: "Limit reached", limitReached: true },
      { status: 403 }
    );
  }

  // ➕ Increment safely
  if (usage) {
    await supabase
      .from("ai_usage")
      .update({ count: used + 1 })
      .eq("id", usage.id);
  } else {
    await supabase.from("ai_usage").insert({
      user_email: email,
      date: today,
      count: 1,
    });
  }

  return runAI(task, category);
}
