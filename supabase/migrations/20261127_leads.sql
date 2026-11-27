-- Leads captured before signup (ATS report emails, Lifetime Pass waitlist).
-- Run once in the Supabase SQL editor (Dashboard -> SQL -> New query).
-- Only the server (service role) reads/writes this table; RLS with no
-- policies blocks the public anon key.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null,                 -- 'ats-report' | 'lifetime-waitlist'
  marketing_consent boolean not null default false,
  payload jsonb,                        -- e.g. the ATS score sent in the report
  created_at timestamptz not null default now()
);

create index if not exists leads_email_idx on public.leads (lower(email));
create index if not exists leads_source_idx on public.leads (source, created_at desc);

alter table public.leads enable row level security;
