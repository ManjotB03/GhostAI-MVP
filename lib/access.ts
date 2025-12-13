export type Tier = "free" | "pro" | "ultimate" | "owner";

export function hasAccess(
  userTier: Tier,
  requiredTier: "free" | "pro" | "ultimate"
) {
  if (userTier === "owner") return true;

  const hierarchy = {
    free: 0,
    pro: 1,
    ultimate: 2,
  };

  return hierarchy[userTier] >= hierarchy[requiredTier];
}
