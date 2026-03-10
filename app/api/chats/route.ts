import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();

    const { data, error } = await supabaseServer
      .from("ghost_chats")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json(
        { error: "DB error", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ chats: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", details: err?.message || "Unknown" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const body = await req.json();

    const { title, mode, targetRole, customRole, task, response, atsScore, fileName } = body;

    const { data, error } = await supabaseServer
      .from("ghost_chats")
      .insert({
        email,
        title,
        mode,
        target_role: targetRole,
        custom_role: customRole,
        task,
        response,
        ats_score: atsScore,
        file_name: fileName,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "DB insert error", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ chat: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", details: err?.message || "Unknown" },
      { status: 500 }
    );
  }
}