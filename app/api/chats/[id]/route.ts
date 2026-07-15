import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

// PUT /api/chats/[id]  -> update an existing chat that belongs to the signed-in user
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "Missing chat id" }, { status: 400 });
    }

    const body = await req.json();
    const {
      title,
      mode,
      targetRole,
      customRole,
      task,
      response,
      atsScore,
      fileName,
    } = body;

    const { data, error } = await supabaseServer
      .from("ghost_chats")
      .update({
        title,
        mode,
        target_role: targetRole,
        custom_role: customRole,
        task,
        response,
        ats_score: atsScore,
        file_name: fileName,
      })
      .eq("id", id)
      .eq("email", email) // ownership guard: only update your own chat
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "DB update error", details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ chat: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", details: err?.message || "Unknown" },
      { status: 500 }
    );
  }
}

// DELETE /api/chats/[id]  -> delete a chat that belongs to the signed-in user
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "Missing chat id" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("ghost_chats")
      .delete()
      .eq("id", id)
      .eq("email", email); // ownership guard: only delete your own chat

    if (error) {
      return NextResponse.json(
        { error: "DB delete error", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", details: err?.message || "Unknown" },
      { status: 500 }
    );
  }
}