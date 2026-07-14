import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

const VALID_STATUSES = ["saved", "applied", "interview", "offer", "rejected"];

// GET /api/applications -> list the signed-in user's applications, newest first
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();

    const { data, error } = await supabaseServer
      .from("job_applications")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      return NextResponse.json(
        { error: "DB error", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ applications: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", details: err?.message || "Unknown" },
      { status: 500 }
    );
  }
}

// POST /api/applications -> create a new application
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const body = await req.json().catch(() => null);

    const {
      company,
      roleTitle,
      jobDescription,
      status,
      matchScore,
      cvVersion,
      notes,
      sourceChatId,
    } = body || {};

    const safeStatus = VALID_STATUSES.includes(String(status))
      ? String(status)
      : "saved";

    const { data, error } = await supabaseServer
      .from("job_applications")
      .insert({
        email,
        company: company ?? null,
        role_title: roleTitle ?? null,
        job_description: jobDescription ?? null,
        status: safeStatus,
        match_score:
          typeof matchScore === "number" ? matchScore : matchScore ?? null,
        cv_version: cvVersion ?? null,
        notes: notes ?? null,
        source_chat_id: sourceChatId ?? null,
        applied_at: safeStatus === "applied" ? new Date().toISOString() : null,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "DB insert error", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ application: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", details: err?.message || "Unknown" },
      { status: 500 }
    );
  }
}
