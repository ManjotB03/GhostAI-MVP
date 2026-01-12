// lib/limits.ts
export type Tier = "free" | "pro" | "ultimate";

export const LIMITS: Record<Tier, number> = {
  free: 15,
  pro: 60,
  ultimate: 1_000_000, // treat as unlimited
};

export const OWNER_EMAIL = "ghostaicorp@gmail.com";
