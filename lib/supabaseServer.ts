import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("SUPABASE ENV CHECK", {
  url,
  hasAnon: !!anonKey,
  hasService: !!serviceKey,
});

console.log("ANON KEY PREFIX:", anonKey?.slice(0, 20));
console.log("SERVICE ROLE KEY PREFIX:", serviceKey?.slice(0, 20));

if (!url || !serviceKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
}

export const supabaseServer = createClient(url, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
