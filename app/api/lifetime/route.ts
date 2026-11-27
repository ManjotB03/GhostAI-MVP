import { NextResponse } from "next/server";
import { lifetimeSale } from "@/lib/tier";
import { countLifetimeMembers } from "@/lib/lifetime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/lifetime -> public sale status for the /lifetime page.
// Returns counts only; never any user data.
export async function GET() {
  const sale = lifetimeSale();

  let sold: number;
  try {
    sold = await countLifetimeMembers();
  } catch {
    return NextResponse.json({ error: "Could not load sale status" }, { status: 500 });
  }
  const remaining = Math.max(sale.cap - sold, 0);

  return NextResponse.json(
    {
      open: sale.open && remaining > 0,
      ended: sale.ended,
      soldOut: remaining === 0,
      endsAt: sale.endsAt,
      cap: sale.cap,
      remaining,
    },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
  );
}
