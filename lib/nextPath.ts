// Where to send someone after login/signup: the ?next= path if it's a safe,
// same-site path (e.g. "/lifetime"), otherwise the fallback.
// Only call from event handlers (it reads window.location).
export function nextPath(fallback = "/ghost"): string {
  if (typeof window === "undefined") return fallback;
  const next = new URLSearchParams(window.location.search).get("next") || "";
  return /^\/(?!\/)[A-Za-z0-9/_-]*$/.test(next) ? next : fallback;
}
