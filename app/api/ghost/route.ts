import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// CONFIG
const FREE_DAILY_LIMIT = 5;
const OWNER_EMAIL = "ghostaicorp@gmail.com";

// 🔮 ACTUAL AI FUNCTION
async function runAI(prompt: string, category: string) {
  // TEMP RESPONSE (replace later with OpenAI / Anthropic)
  return `The sky appears blue because of Rayleigh scattering. Shorter blue wavelengths of sunlight are scattered in all directions by the gases and particles in Earth’s atmosphere, making the sky look blue to our eyes.`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt, category } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const isOwner = session.user.email === OWNER_EMAIL;

  // ---------------------------
  // FREE USER DAILY LIMIT
  // ---------------------------
  if (!isOwner) {
    const today = new Date().toISOString().slice(0, 10);

    const { data: usage } = await supabase
      .from("ai_usage")
      .select("count")
      .eq("user_id", session.user.email)
      .eq("date", today)
      .maybeSingle();

    const used = usage?.count ?? 0;

    if (used >= FREE_DAILY_LIMIT) {
      return NextResponse.json(
        { error: "Limit reached", limitReached: true },
        { status: 403 }
      );
    }

    await supabase.from("ai_usage").upsert({
      user_id: session.user.email,
      date: today,
      count: used + 1,
    });
  }

  // ---------------------------
  // RUN AI
  // ---------------------------
  const answer = await runAI(prompt, category);

  return NextResponse.json({
    result: answer,
  });
}
