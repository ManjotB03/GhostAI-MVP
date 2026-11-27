// lib/lifetime.ts
import { supabaseServer } from "@/lib/supabaseServer";
import { LIFETIME_STATUS } from "@/lib/tier";

/**
 * Number of Founding Lifetime members.
 * Uses a normal (GET) count query: the head-only variant came back with no
 * count here, which made the spots counter stuck at 0 sold and the cap
 * unenforced. Throws on any failure so callers can't silently treat it as 0.
 */
export async function countLifetimeMembers(): Promise<number> {
  const { count, error } = await supabaseServer
    .from("app_users")
    .select("id", { count: "exact" })
    .eq("subscription_status", LIFETIME_STATUS)
    .limit(1);

  if (error) throw new Error(error.message);
  if (typeof count !== "number") throw new Error("Lifetime count unavailable");
  return count;
}
