# QAF Sandbox Setup (Phase 0.5)

Goal: prove the bot receives text + images, detects QAF invocation, and stays
silent otherwise — WITHOUT touching the real participant group.
Status: GUIDE READY · live verification PENDING (needs your Meta account + dev phones).

## A. Meta Cloud API test number (free)

1. Register as a Meta developer and create an app at developers.facebook.com.
2. Add the WhatsApp product → a test number + test WhatsApp Business Account are auto-generated.
3. In API Setup: generate a System User access token (the dashboard temp token expires in ~24h).
4. Add up to 5 recipient phones (your dev phones) under "Manage phone number list"; each confirms via the verification message.
5. Note the test phone number ID and WABA ID.

## B. Local webhook via tunnel (free)

1. `npm.cmd install`, copy `.env.example` → `.env`, fill `WHATSAPP_VERIFY_TOKEN` (any secret string you invent).
2. `npm.cmd run db:push`, then `npm.cmd run dev` (http://localhost:3000).
3. Start Cloudflare Tunnel pointing at localhost:3000; set the Meta webhook callback URL to `https://<tunnel>/api/webhooks/whatsapp` with your verify token.
4. From a test phone, send "QAF, ping" to the test number → terminal must show `[qaf-intake] {"invoked":true,…}` and the bot must reply NOTHING (silence is correct in Phase 0).

## C. Acceptance checklist (all must pass before Phase 1)

- [ ] Text received + logged with `invoked:true` on "QAF, …"
- [ ] Image with caption received + logged with `hasImage:true`
- [ ] Reply-to-QAF detection verified against provider behaviour
- [ ] Non-invoked chatter logged with `invoked:false`, zero replies sent
- [ ] 20 duplicate questions collapse to one intake pattern (dedupe design validated)
- [ ] Replies stay under ~400 chars in provider preview

Record results + dates here when run. Sandbox sessions and tokens expire — re-verify after any gap before building on it.
