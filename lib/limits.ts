// lib/limits.ts
export type Tier = "free" | "pro" | "ultimate";

export const OWNER_EMAIL = "ghostaicorp@gmail.com";

// change these whenever you want
export const LIMITS: Record<Tier, number> = {
  free: 10,
  pro: 45,
  ultimate: 100000,
};

export function normalizeTier(input: any): Tier {
  const t = String(input ?? "free").toLowerCase();
  if (t === "free" || t === "pro" || t === "ultimate") return t;
  return "free";
}
