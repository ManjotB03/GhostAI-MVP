# Week 0 sales setup: what to configure before merging

This branch adds the Founding Lifetime Pass (£49), the Job Hunt Pass (£19 / 90 days),
email capture, and one-click cover letters. The code is safe to deploy only after
steps 1–3; until then the Job Hunt Pass button on /pricing will show a checkout error.

## 1. Stripe (live mode)

Create two **one-time** prices in the Stripe dashboard (Products → Add product):

| Product | Price | Type |
| --- | --- | --- |
| GhostAI Founding Lifetime Pass | £49.00 | One-off |
| GhostAI Job Hunt Pass (90 days) | £19.00 | One-off |

Copy each price ID (starts with `price_`).

The existing webhook endpoint already receives `checkout.session.completed`, so
no new webhook is needed.

## 2. Vercel environment variables (Production)

| Variable | Value | Notes |
| --- | --- | --- |
| `STRIPE_LIFETIME_PRICE_ID` | `price_...` | from step 1 |
| `STRIPE_JOB_HUNT_PASS_PRICE_ID` | `price_...` | from step 1 |
| `LIFETIME_SALE_OPEN` | `false` now, `true` on launch day | page shows the waitlist while `false` |
| `LIFETIME_SALE_ENDS` | e.g. `2026-12-14T23:59:00Z` | closes the sale automatically |
| `LIFETIME_CAP` | `200` | optional, defaults to 200 |
| `RESEND_API_KEY` | from resend.com | for "Email me this report" |
| `REPORT_FROM_EMAIL` | e.g. `GhostAI <reports@ghostaicorp.com>` | domain must be verified in Resend |

Redeploy after changing env vars.

## 3. Supabase

Run `supabase/migrations/20261127_leads.sql` once in the Supabase SQL editor.
It creates the `leads` table used by the waitlist and ATS report form.

## 4. Test before launch

1. Create a Stripe **100% off promotion code**, limited to 1 redemption, and buy the Job Hunt Pass with it on a test account.
2. Check `app_users`: `subscription_tier = pro`, `subscription_status = pass`, `subscription_current_period_end` ≈ 90 days ahead.
3. Repeat for the Lifetime Pass (temporarily set `LIFETIME_SALE_OPEN=true`): status should be `lifetime`, end date empty.
4. Run an ATS check and use "Email me this report"; check the email arrives and a row appears in `leads`.

## How it works

- No schema change on `app_users`: lifetime = status `lifetime`; pass = status `pass` with an expiry in `subscription_current_period_end`. `lib/tier.ts` treats an expired pass as free.
- Subscription webhook events never overwrite a lifetime member, and an old subscription ending won't downgrade a live pass.
- Lifetime checkout is refused when the sale is closed or 200 lifetime members exist.
- Refunds: when refunding a pass or lifetime purchase in Stripe, also set the user back to `free` in `app_users` (one-off payments have no subscription to cancel).
