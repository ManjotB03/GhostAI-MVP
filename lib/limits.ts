export type Tier = "free" | "pro" | "ultimate";

export const OWNER_EMAIL = "ghostaicorp@gmail.com";

export const LIMITS: Record<Tier, number> = {
  free: 5,        // free users
  pro: 20,        // paid but capped
  ultimate: 100000, // effectively unlimited
};

