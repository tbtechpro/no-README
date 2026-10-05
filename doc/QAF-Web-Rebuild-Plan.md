# QAF Web Rebuild — Implementation Plan

Parent: `doc/QAF-Implementation-Plan.md` (Phases 0–4 done, live on Vercel + Neon).
Design: `architecture.html` (5 surfaces, link cards, fresh identity) +
`reminders.html` (5 triggers, push + inbox). Both approved before build.
Rule: every phase ships visibly to production; eval stays green throughout.

## Phase R0 — Foundation: link registry + event corpus (½ day)

- New corpus types: `official-link` (label, url, badge) and `event`
  (title, date, channel, reg/replay url, status derivation).
- Seed 8–10 rows from verified official sources only: aifoundry page,
  /stream, learn portal, LinkedIn sessions, YouTube, Instagram.
- Composer: `answer + linkCards[]`; rule — any reply naming a program,
  event, or lesson MUST attach its card; unconfirmed dates → uncertainty.
- Acceptance: seeded rows render as cards in a scratch harness; no invented URLs anywhere.

## Phase R1 — Ask with link cards (½ day)

- Pipeline returns `linkCards[]` (retrieval over new types + rule above).
- `/api/chat` passes cards through; Ask UI renders tappable cards.
- Eval +6: card present for program/event/lesson answers; absent (not
  invented) for rumors; uncertainty still refers.
- Acceptance: "How do I join AI Foundry?" → answer + Apply card (aifoundry URL).

## Phase R2 — Events feed (1 day)

- Events page: Upcoming → Live now → Replay status logic from event dates.
- Optional `EventItem` Prisma model + Admin editor (publish without deploys);
  fallback is seed edits if time is short.
- Acceptance: orientation/info-session/KSS entries show correct state Adder:
  a dated test event flips states as its date passes.

## Phase R3 — Reminders engine (1 day)

- Models: `ReminderSubscription` (user key, trigger, channel) + `ReminderInbox`.
- Triggers: assessment 48h/6h (from confirmed deadline, survives changes),
  new-event, starting-1h, replay-available, deadline-changed.
- Scheduler: Vercel Cron (free tier, 1/min ok at hourly) hitting
  `/api/cron/reminders` with `CRON_SECRET`.
- Channels: Web Push (VAPID + service worker) + inbox always.
- Acceptance: subscribing + firing a test trigger delivers push-style banner
  and inbox row; deadline change re-times pending warnings.

## Phase R4 — Learn paths + reskin (1 day)

- Learn & Build path view (lesson → build → submit → Demo Day) from corpus.
- Home ask-first layout with live/next strip.
- Public identity cutover: indigo `#1E1B4B` + amber `#F59E0B` on paper
  `#FAF7F2`; Admin keeps serious teal tokens.
- Acceptance: side-by-side pass against `architecture.html` mocks.

## Phase R5 — Eval + launch (½ day)

- Eval +10 (cards, triggers, reskin regressions none — engine untouched).
- Freshness covers new corpus types (no placeholders served).
- Full `npm.cmd run check` + prod build; push; verify live with owner:
  ask → card, event state, trigger fire, admin edit.
- Update launch docs; pilot notice v2 with web link + reminder opt-in.

## Risks & guards

- Stale event dates → events carry `expiresAt`; expired auto-hide, freshness flags.
- Push denied → inbox is the guaranteed channel; UI says so plainly.
- Scheduler cost → hourly cron on free tier; triggers computed, not polled per user.
- Scope creep → WhatsApp 1:1 reminder opt-in explicitly deferred unless members ask.
