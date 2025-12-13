import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const FREE_DAILY_LIMIT = 5;
const OWNER_EMAIL = "ghostaicorp@gmail.com"; // your owner email

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const userEmail = session.user.email;

// Fetch role from DB (authoritative)
const { data: user } = await supabase
  .from("app_users")
  .select("id, role")
  .eq("email", userEmail)
  .single();

const userId = user?.id;
const role = user?.role ?? "free";
const isOwner = session.user.email === OWNER_EMAIL;

  // ✅ Owner or paid users = unlimited
  if (isOwner || role !== "free") {
    return runAI(req);
  }

  // ---------------------------
  // FREE USER DAILY LIMIT
  // ---------------------------
  const today = new Date().toISOString().slice(0, 10);

  const { data: usage } = await supabase
    .from("ai_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  const used = usage?.count ?? 0;

  if (used >= FREE_DAILY_LIMIT) {
    return NextResponse.json(
      {
        error: "Free limit reached",
        limitReached: true,
      },
      { status: 403 }
    );
  }

  // Increment usage
  await supabase.from("ai_usage").upsert(
    {
      user_id: userId,
      date: today,
      count: used + 1,
    },
    {
      onConflict: "user_id,date",
    }
  );

  return runAI(req);
}

// ----------------------------------
// AI EXECUTION (mock for now)
// ----------------------------------
async function runAI(req: Request) {
  const { task, category } = await req.json();

  // Replace this later with OpenAI
  const result = `GhostAI (${category}) response:\n\n${task}`;

  return NextResponse.json({ result });
}
