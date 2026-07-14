import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

const VALID_STATUSES = ["saved", "applied", "interview", "offer", "rejected"];

// PUT /api/applications/[id] -> update an application owned by the signed-in user
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
      return NextResponse.json({ error: "Missing application id" }, { status: 400 });
    }

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

    // Build an update object with only the fields that were provided,
    // so a partial update (e.g. just a status change) doesn't wipe other columns.
    const update: Record<string, any> = { updated_at: new Date().toISOString() };

    if (company !== undefined) update.company = company;
    if (roleTitle !== undefined) update.role_title = roleTitle;
    if (jobDescription !== undefined) update.job_description = jobDescription;
    if (cvVersion !== undefined) update.cv_version = cvVersion;
    if (notes !== undefined) update.notes = notes;
    if (sourceChatId !== undefined) update.source_chat_id = sourceChatId;
    if (matchScore !== undefined) update.match_score = matchScore;

    if (status !== undefined) {
      const safeStatus = VALID_STATUSES.includes(String(status))
        ? String(status)
        : "saved";
      update.status = safeStatus;
      // Stamp applied_at the first time it moves to "applied".
      if (safeStatus === "applied") {
        update.applied_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabaseServer
      .from("job_applications")
      .update(update)
      .eq("id", id)
      .eq("email", email) // ownership guard
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "DB update error", details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ application: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", details: err?.message || "Unknown" },
      { status: 500 }
    );
  }
}

// DELETE /api/applications/[id] -> delete an application owned by the signed-in user
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
      return NextResponse.json({ error: "Missing application id" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("job_applications")
      .delete()
      .eq("id", id)
      .eq("email", email); // ownership guard

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
