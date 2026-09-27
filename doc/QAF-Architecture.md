# QAF Support AI — Architectural Design

Parent: `doc/QAF-Implementation-Plan.md` · Sources: `doc/QAF Support AI-PRD.md`, `doc/QAF-Support-AI-Context.md`
Status: design for Phase 1 pilot; tech-neutral but concrete enough to build from.

## 1. Goals & constraints

- P0 pilot must: answer only from admin-approved info, stay silent unless invoked, handle invoked images, never guess, hand sensitive matters to a private human route, and let admins approve/retire/pause/correct.
- Hard constraints: WhatsApp group bots have limited reply/thread visibility (validate with provider); never DM unless 1:1 route approved; never use raw chat as truth; images processed on invocation only and retained minimally; no payments, no automated decisions on exceptions/discipline/certification.

## 2. Component map

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
