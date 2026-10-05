# Go Live Checklist (Vercel + Neon, free tiers)

Code is 100% ready (commit `vercel-build` proven locally). Only account
actions remain — everything below needs YOUR logins; nothing else needs coding.

## 1. Neon database (5 min)

1. Go to https://neon.tech → Sign up (GitHub login is fastest).
2. Create a project (any name, e.g. `qaf-support-ai`, region closest to you).
3. Open the project dashboard → **Connection string** → enable **Pooled**
   connection → Copy. It looks like:
   `postgresql://user:password@ep-xxx.pooler.neon.tech/dbname?sslmode=require`
4. Keep it — you paste it into Vercel next.

## 2. Vercel hosting (5 min)

1. Go to https://vercel.com → Sign up with GitHub.
2. **Add New → Project → Import** `tbtechpro/no-README` (root folder
   `AI Practical` if prompted — the repo root IS the app; `vercel.json`
   in the repo already sets the build command, nothing to type).
3. **Environment Variables** — add exactly these (names must match).
   Leave all environment checkboxes ticked (Production is the one that
   matters; Preview/Development ticked is harmless):
   - `DATABASE_URL` = the Neon **pooled** string from step 1 (hostname
     contains `-pooler`).
   - `DIRECT_URL` = the Neon **direct** string — same Connect modal with
     pooling toggled OFF and copied (hostname has NO `-pooler`).
   - `ADMIN_NUMBERS` = `2348078239107`
   - (Optional, only if keeping WhatsApp too: `WHATSAPP_VERIFY_TOKEN`,
     `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` — same values
     as local `.env`.)
   **Ignore** any "Add storage / Prisma Postgres" prompts — Neon is our
   database; that button would spin up a second, unused one.
4. Click **Deploy**. First build runs `prisma db push` (creates all tables
   on Neon) then `next build`.

## 3. Verify (2 min, tell me the URL and I'll do it with you)

- Open `https://<your-app>.vercel.app/` → chat loads, ask the deadline
  question → correct c08 answer.
- Open `https://<your-app>.vercel.app/admin` → corpus table, metrics,
  deadline card all render from Neon (all zeros/empty at first — real
  traffic fills them).
- Post the chat link to pilot members — no accounts, no caps.

## If WhatsApp stays in the mix

- Meta dashboard → Configuration → Callback URL becomes
  `https://<your-app>.vercel.app/api/webhooks/whatsapp` (same verify
  token). Permanent URL — never rotate again, unlike the tunnel.

## Rollback

- Vercel → Deployments → promote any older deployment. Neon data is
  untouched by redeploys. Local tunnel setup still works as fallback.
