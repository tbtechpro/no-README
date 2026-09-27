# QAF Support AI — Architectural Design

Parent: `doc/QAF-Implementation-Plan.md` · Sources: `doc/QAF Support AI-PRD.md`, `doc/QAF-Support-AI-Context.md`
Status: Phase 1 pilot design. Stack decided (Sec 1.5): all free, all local-first.

> **Local-first: the app (Next.js) and the database (SQLite file) run locally for now.** No cloud hosting, no external DB server, no external auth or storage service. See Sec 1.5.

## 1. Goals & constraints

- P0 pilot must: answer only from admin-approved info, stay silent unless invoked, handle invoked images, never guess, hand sensitive matters to a private human route, and let admins approve/retire/pause/correct.
- Hard constraints: WhatsApp group bots have limited reply/thread visibility (validate with provider); never DM unless 1:1 route approved; never use raw chat as truth; images processed on invocation only and retained minimally; no payments, no automated decisions on exceptions/discipline/certification.

## 1.5 Decided stack — free, local-first

> **App and database run locally for now.** `npm run dev` serves the app; Prisma uses a local SQLite file (`prisma/dev.db`). Nothing requires a cloud account.

| Layer | Choice (all free) | Why | Local run |
|---|---|---|---|
| Framework (API + admin console) | Next.js 15, App Router, TypeScript (OSS, MIT) | Most recommended free full-stack React framework; API routes host the WhatsApp webhook and the admin console lives in the same app | `npm.cmd run dev` on localhost |
| Database | SQLite file via Prisma ORM (both OSS/free) | Zero-config, zero-cost, file-based; Prisma schema migrates to Postgres later without code changes | `prisma/dev.db`, `DATABASE_URL="file:./dev.db"` |
| Authentication (admin console) | Auth.js v5 — **DEFERRED, not needed now** (see "Needed now vs later" below) | No login exists yet: single builder, local-only console, nothing deployed | Add when Admin Console MVP lands (Plan Phase 1.9); until then the `admins` allowlist lives in local `.env` |
| File storage (invoked images, attachments) | Local filesystem behind a `Storage` interface (`./storage/…`) | Free, private, trivially local; interface swaps to S3-compatible later | Transient image bytes deleted on TTL; never committed (gitignored) |

Rules that stay: WhatsApp provider account is the only external dependency (sandbox number for Phase 0.5); chat history is never a source of truth; image bytes are transient and never leave the local disk except to the vision model for the current request.

### Needed now vs later (Phase 0 verdict)

- **Needed now:** Node 24 + `npm.cmd` (present); Next.js local skeleton + Prisma SQLite schema (scaffolded in repo); WhatsApp Cloud API sandbox number + webhook via tunnel for Phase 0.5 tests; starter corpus + eval set content; Sec 19 decisions from Qubators.
- **NOT needed now:** authentication (no users, no login surface, local single-builder — WhatsApp verifies webhooks by signature and participants are identified by phone number); Postgres or any cloud DB; cloud hosting; S3; scheduler/reminders (Phase 1.7); Auth.js (install with the Admin Console MVP).

```
[WhatsApp Group] ⇄ [Provider: Cloud API / BSP] ⇄ [Webhook Gateway]
  → [Ingest + Dedup] → [Invocation Gate] ──silent──→ (drop + log sample)
  → [Safety Pre-check: sensitive text / image privacy gate]
  → [Router]: Q&A | Next-Step | Announcement | Catch-up/Recap | Blocker/Resource | Reminder-send | Handoff
  → [Retrieval: approved corpus ONLY, versioned] → [Composer (LLM) + Vision (invoked images)]
  → [Safety Post-check: citation, uncertainty, privacy, tone] → [Sender]
  → [Stores]: Corpus, Decision log, Escalation queue, Scheduler, Metrics
[Admin Console] → manages Corpus, Review queue, Reminders, Pause/Corrections, Patterns
```

| Component | Responsibility | Key rule |
|---|---|---|
| Webhook Gateway | Verify signatures, ack fast, enqueue | Never block on LLM; retry idempotently |
| Ingest + Dedup | Normalize text/caption/image id, thread context, de-dupe repeats | Same question flood → one group answer |
| Invocation Gate | Mention / quote-reply-to-QAF / help-phrase match, incl. image captions | Default silent; log drop samples for tuning |
| Safety Pre-check | Sensitive-text classifier + image privacy gate (personal data scan first) | Sensitive wins over everything, incl. image analysis |
| Router | Map to skill per Context Sec 7 modes | Unknown → uncertainty path, never free-answer |
| Retrieval | Top-k over versioned approved corpus with effective/expiry dates | Out-of-corpus or conflict → refer, do not generate |
| Composer + Vision | 5-part text format; 3-step image flow (show → cause → action/route) | Cite corpus IDs; verbatim uncertainty line when unconfirmed |
| Safety Post-check | Block guesses, exposures, overlong/noisy replies, wrong tone | Fail closed → handoff |
| Escalation queue | Ticket per unresolved/sensitive item with owner + SLA window | Grouped by urgency/theme for admins |
| Scheduler | Admin-created reminders (event/audience/timing/wording) | Early + final only; deadline-change format |
| Admin Console | Approve/retire, review queue, publish answer, pause, correct, patterns | Every mutation versioned with actor + reason |
| Stores + Metrics | Corpus versions, decision log (cited IDs or handoff reason), Sec 14 metrics | Support eval regression + audits |

## 3. Flows

### 3.1 Text question (routine)
Webhook → Ingest → Invoked? (no → drop) → Pre-check sensitive? (yes → handoff flow) → Router=Q&A → Retrieval (hit? no → uncertainty + ticket) → Composer (answer/action/deadline/source/help-offer) → Post-check → Send + log (corpus IDs, stage, latency).

### 3.2 Invoked image
Webhook(image+caption) → Invoked? (no → drop, never scan gallery) → Download once → Privacy gate (personal/confidential? yes → reveal nothing publicly, private-route message, ticket, delete image ASAP) → Type branch: error/code (describe text + cause + fix; ask pasted text if blurry) / submission-dashboard (status + action + deadline; flag contradictions) / lesson-announcement (visible → next step) / unclear (ask clearer/pasted text) / meme-casual (ignore unless support-invoked) → Composer 3-step → Post-check → Send + log (no personal detail in log) + scheduled delete.

### 3.3 Handoff / escalation
Trigger: sensitive class, unconfirmed/conflict, welfare/urgent, abuse-repeat, or post-check failure → calm group message (private-route direction, verbatim uncertainty line where applicable) → ticket {category, owner, SLA, excerpt redacted, corpus state} → owner notified out-of-band → admin resolution can become reusable guidance (publish flow).

### 3.4 Reminder
Admin creates (what/who/when/action) → approval → scheduled send → log delivery; deadline change → labelled update (old + new). Pause switch suppresses all sends except corrections.

## 4. Data model (minimal)

- `corpus_item {id, type, title, body, source_link, owner, effective_from, expires_at, version, status}` — only `approved` + unexpired served.
- `decision_log {msg_id, invoked, skill, corpus_ids[], handoff?, owner?, latency_ms, feedback?}` — no image bytes, no personal data.
- `ticket {id, category, owner, sla_due, status, redacted_excerpt, resolution_id?}`.
- `reminder {id, event, audience, send_at, wording, status}`.
- `correction {id, bad_msg_id, fix_text, audience, sent_at}`.
- `image_job {msg_id, downloaded_at, deleted_at, privacy_flag}` — bytes transient, metadata only.

## 5. Provider decision (validate in sandbox, Phase 0.5)

| Option | Fit | Watch out |
|---|---|---|
| WhatsApp Cloud API (direct) | Official, webhooks for text/image, template control | Group mention/reply detection varies; test quote-reply + caption parsing |
| BSP (Twilio/360dialog/etc.) | Faster setup, tooling, number hosting | Cost, feature lag, same group limits |
| Phone-automation (unofficial) | Full group view | Bannable, fragile, privacy risk — **rejected** |

Acceptance before build: receive text + image-with-caption, detect reply-to-QAF, send <400-char reply, stay silent on non-invoked traffic, handle burst of 20 duplicate questions as one answer.

## 6. Non-functionals

- Safety: fail closed to handoff; blocklist for payments/advice/ranking content; tone guard per serious-vs-celebratory contexts.
- Privacy: minimal collection, no confidential-detail solicitation in group, transient image bytes with TTL delete, redacted logs, admin-only access to tickets.
- Reliability: at-least-once ingest with idempotency keys; pause switch <1 min effect; corrections addressed to affected audience, not silent edits.
- Observability: dashboards for Sec 14 outcomes + guardrails (wrong answers, exposures, noise complaints, misroutes, authority confusion); every reply traceable to corpus versions or ticket.
- Scale: pilot = single group + console; Phase 2 adds recap/catch-up batch jobs and patterns aggregation — no architecture change, only new skills + views.

## 7. Build order (maps to plan)

Phase 0: gateway + ingest + invocation samples + corpus schema + eval set. Phase 1: gate → retrieval → composer/vision → pre/post safety → queue + console MVP + scheduler + logging. Phase 2+: new skills reuse router/retrieval/safety; console gains patterns view; Phase 4 adds freshness sweeps + regression gate.
