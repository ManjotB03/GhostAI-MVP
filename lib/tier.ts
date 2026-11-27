// lib/tier.ts
// One place that decides what a user's tier is *right now*.
//
// Subscriptions are kept in sync by the Stripe webhook. One-off purchases
// reuse the same app_users columns (no schema change):
//   - Lifetime Pass:  subscription_tier = "pro", subscription_status = "lifetime",
//                     subscription_current_period_end = null (never expires)
//   - Job Hunt Pass:  subscription_tier = "pro", subscription_status = "pass",
//                     subscription_current_period_end = expiry date
// An expired pass is treated as free here, so nothing has to run on expiry.

export type PaidTier = "free" | "pro" | "ultimate";

export const LIFETIME_STATUS = "lifetime";
export const PASS_STATUS = "pass";
export const PASS_DAYS = 90;

export type TierRow = {
  subscription_tier?: string | null;
  subscription_status?: string | null;
  subscription_current_period_end?: string | null;
} | null | undefined;

export const TIER_COLUMNS =
  "subscription_tier,subscription_status,subscription_current_period_end";

export function normalizeTier(input: unknown): PaidTier {
  const t = String(input ?? "free").toLowerCase();
  if (t === "pro" || t === "ultimate") return t;
  return "free";
}

export function isPassExpired(row: TierRow, now = Date.now()): boolean {
  if (row?.subscription_status !== PASS_STATUS) return false;
  const end = Date.parse(String(row?.subscription_current_period_end || ""));
  return !Number.isFinite(end) || end <= now;
}

export function effectiveTier(row: TierRow, now = Date.now()): PaidTier {
  if (isPassExpired(row, now)) return "free";
  return normalizeTier(row?.subscription_tier);
}

/** Lifetime sale settings, read from env so the sale can open/close without a deploy of code changes. */
export function lifetimeSale(now = Date.now()) {
  const cap = Math.max(0, Number(process.env.LIFETIME_CAP || 200) || 200);
  const endsAt = process.env.LIFETIME_SALE_ENDS || null; // ISO date-time
  const endsMs = endsAt ? Date.parse(endsAt) : NaN;
  const switchedOn = String(process.env.LIFETIME_SALE_OPEN || "").toLowerCase() === "true";
  const ended = Number.isFinite(endsMs) && endsMs <= now;
  return { cap, endsAt, open: switchedOn && !ended, ended };
}
