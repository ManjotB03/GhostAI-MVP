import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, msg: "debug route hit" });
}