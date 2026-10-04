# QAF Support AI — Launch Readiness (Pilot)

All four build phases are code-complete. This is the go/no-go sheet for the
controlled pilot (small participant group, Phase 1 scope).

## Gates

| Gate | Status | Evidence |
|---|---|---|
| Eval regression green | ✅ 92/92 | `npm.cmd run check` (eval + freshness) |
| Production build | ✅ passes | `npm.cmd run build` (incl. deadline-governance types) |
| Corpus approved, no placeholders served | ✅ 36/40 approved | `node scripts/freshness.mjs`; drafts never answer |
| Authoritative deadline wired | ✅ Sundays 11:59 p.m. WAT (c08) | Owner-confirmed 27 Sept 2026 |
| Uncertainty + handoff paths | ✅ | Verbatim line, 8 owner-routed categories, tickets |
| Image pipeline + privacy gate | ✅ | 3-step flow, personal-data reveal-nothing rule |
| Noise guards | ✅ | Invocation gate, 5/min rate limit, complaint tracking |
| Admin controls | ✅ | /admin: corpus approve/retire, pause, spotlight validation, patterns, metrics |
| Decisions (PRD Sec 19) | ⚠️ 7.5/8 | Owners, window, conduct, corrections confirmed; session times + links + owner contact routes pending |
| Sandbox live verification | ⏳ needs you | `doc/QAF-Sandbox-Setup.md` checklist (Meta test number + tunnel) |

## Launch sequence

1. Close the two ⏳ items above (forward the admin's session/link announcement; run the sandbox checklist).
2. `npm.cmd install && npm.cmd run db:push && npm.cmd run dev` + tunnel → webhook verified.
3. Invite the small pilot group; post the participant notice (QAF is AI, call it with "QAF …").
4. Watch /admin daily: review queue → publish confirmed answers back into corpus; validate spotlights; track metrics as the real Sec-14 baseline.
5. Hold 1–2 weekly cycles (incl. one Sunday 11:59 p.m. assessment) with zero exposure incidents and no noise complaints → graduate to Phase 2 cohort rollout.

## Known limits (pilot)

- Single-group, text + invoked-image only; no 1:1 bot DMs; no LLM yet — deterministic templates (an LLM/vision adapter slots behind the same safety gates later).
- Tickets, logs and pause flag are local files; multi-admin and Postgres come with deployment.
- Youth rule: adults-only cohort assumed; re-confirm if any minor joins.
