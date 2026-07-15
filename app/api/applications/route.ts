import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";
import { OWNER_EMAIL } from "@/lib/limits";

export const runtime = "nodejs";

const VALID_STATUSES = ["saved", "applied", "interview", "offer", "rejected", "no_response"];

// Free users can track a limited number of applications; paid tiers are unlimited.
const FREE_APPLICATION_LIMIT = 5;

function normalizeTier(input: any): "free" | "pro" | "ultimate" {
  const t = String(input ?? "free").toLowerCase();
  if (t === "pro" || t === "ultimate") return t;
  return "free";
}

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

    // Tell the client the user's tier + cap so it can show usage / upgrade UI.
    const isOwner = OWNER_EMAIL.some((e) => e.toLowerCase() === email);

    const { data: userRow } = await supabaseServer
      .from("app_users")
      .select("subscription_tier")
      .eq("email", email)
      .maybeSingle();

    const tier = isOwner ? "owner" : normalizeTier(userRow?.subscription_tier);
    const unlimited = tier !== "free";

    return NextResponse.json({
      applications: data || [],
      tier,
      unlimited,
      limit: unlimited ? null : FREE_APPLICATION_LIMIT,
    });
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

    // --- Free-tier cap enforcement -------------------------------------
    // Owners and paid tiers are unlimited. Free users are capped.
    const isOwner = OWNER_EMAIL.some((e) => e.toLowerCase() === email);

    if (!isOwner) {
      const { data: userRow, error: userErr } = await supabaseServer
        .from("app_users")
        .select("subscription_tier")
        .eq("email", email)
        .maybeSingle();

      if (userErr) {
        return NextResponse.json(
          { error: "User read error", details: userErr.message },
          { status: 500 }
        );
      }

      const tier = normalizeTier(userRow?.subscription_tier);

      if (tier === "free") {
        const { count, error: countErr } = await supabaseServer
          .from("job_applications")
          .select("id", { count: "exact", head: true })
          .eq("email", email);

        if (countErr) {
          return NextResponse.json(
            { error: "Count error", details: countErr.message },
            { status: 500 }
          );
        }

        const used = count ?? 0;

        if (used >= FREE_APPLICATION_LIMIT) {
          return NextResponse.json(
            {
              error: "LIMIT_REACHED",
              limitReached: true,
              upgradeRequired: true,
              tier,
              used,
              limit: FREE_APPLICATION_LIMIT,
              message:
                "You've reached the free limit for tracked applications. Upgrade to Pro to track unlimited jobs.",
            },
            { status: 402 }
          );
        }
      }
    }
    // -------------------------------------------------------------------

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