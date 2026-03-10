// lib/supabaseServer.ts

import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 * Uses SERVICE ROLE KEY.
 * Never expose this to client.
 */

// Prefer server-only URL, fallback to public if needed
const url =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY"
  );
}

export const supabaseServer = createClient(url, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});