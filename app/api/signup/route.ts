import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser, error: existingErr } = await supabaseServer
      .from("app_users")
      .select("id,email")
      .eq("email", email)
      .maybeSingle();

    if (existingErr) {
      console.error("SIGNUP existing user check error:", existingErr);
      return NextResponse.json(
        {
          error: "Database error checking existing user.",
          details: existingErr.message,
        },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const insertPayload = {
      email,
      password_hash: passwordHash,
      subscription_tier: "free",
    };

    console.log("SIGNUP insert payload:", {
      email: insertPayload.email,
      hasPasswordHash: !!insertPayload.password_hash,
      subscription_tier: insertPayload.subscription_tier,
    });

    const { data: createdUser, error: createErr } = await supabaseServer
      .from("app_users")
      .insert(insertPayload)
      .select("id,email,subscription_tier")
      .single();

    if (createErr) {
      console.error("SIGNUP create error:", createErr);
      return NextResponse.json(
        {
          error: "Failed to create account.",
          details: createErr.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Account created successfully.",
      user: createdUser,
    });
  } catch (err: any) {
    console.error("SIGNUP server error:", err);
    return NextResponse.json(
      {
        error: "Server error.",
        details: err?.message || "Unknown",
      },
      { status: 500 }
    );
  }
}