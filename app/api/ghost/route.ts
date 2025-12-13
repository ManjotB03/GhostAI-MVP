import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const OWNER_EMAIL = "ghostaicorp@gmail.com";

// Daily limits
const LIMITS = {
  free: 5,
  pro: 50,
  ultimate: Infinity,
};

export async function POST(req: Request) {
  try {
    // 1️⃣ Auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;

    // 2️⃣ Get user
    const { data: user, error: userError } = await supabase
      .from("app_users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3️⃣ Owner bypass (YOU)
    const isOwner = email === OWNER_EMAIL;
    if (!isOwner) {
      const today = new Date().toISOString().split("T")[0];

      // 4️⃣ Get usage for today
      const { data: usage } = await supabase
        .from("ai_usage")
        .select("count")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      const usedToday = usage?.count ?? 0;
      const limit = LIMITS[user.role as keyof typeof LIMITS] ?? 0;

      // 5️⃣ Enforce limit
      if (usedToday >= limit) {
        return NextResponse.json(
          {
            error: "Daily limit reached. Upgrade to continue.",
            limitReached: true,
          },
          { status: 403 }
        );
      }

      // 6️⃣ Increment usage
      await supabase
        .from("ai_usage")
        .upsert(
          {
            user_id: user.id,
            date: today,
            count: usedToday + 1,
          },
          { onConflict: "user_id,date" }
        );
    }

    // 7️⃣ AI call
    const { task, category } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `You are GhostAI for ${category}.` },
        { role: "user", content: task },
      ],
    });

    return NextResponse.json({
      result: completion.choices[0].message.content,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
