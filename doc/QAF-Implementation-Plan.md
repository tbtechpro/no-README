# QAF Support AI — Implementation Plan

Source PRD: `doc/QAF Support AI-PRD.md` v1.0 (19 Sept 2026)
System context: `doc/QAF-Support-AI-Context.md`
Status: planning — no code yet. This plan turns PRD Stages 0–4 into manageable build phases.

Design choice applied from prior review: **image/screenshot assistance (PRD F19, Sec 9.5) is treated as core from Phase 1**, not deferred to P1. All image rules below come from Context Sec 6.

## Architecture (proposed, tech-neutral)

```
WhatsApp group → Cloud API webhook → QAF service
  ├─ Invocation gate (QAF mention / reply / help phrase, incl. with image)
  ├─ Knowledge retrieval (admin-approved docs ONLY: schedule, rules, deadlines, lessons, links)
  ├─ LLM + vision (text answers + invoked-image analysis, 3-step flow)
  ├─ Safety layer (sensitive detector, privacy gate for images, uncertainty enforcement)
  ├─ Escalation queue (unresolved / sensitive → named human owner + response window)
  ├─ Scheduler (admin-approved reminders only)
  └─ Admin console (approve/retire info, review queue, publish answers, pause/correct, patterns)
```

Key constraints:
- QAF never DMs participants unless the 1:1 route is approved (PRD Sec 19.4). Default: answer in group when invoked, hand sensitive matters to a private human route.
- WhatsApp group bots cannot reliably read every reply/thread — validate invocation detection (mention, quote-reply, help phrase) against the chosen provider before pilot.
- No vector search over raw chat history. Retrieval corpus = curated approved docs with version + effective date. Chat is signal for the review queue, not a source of truth.
- Images: download on invocation only, run privacy gate first, retain no longer than necessary, never repost.

## Phase 0 — Readiness (PRD Stage 0)

Goal: settle everything the pilot depends on so the bot cannot invent authority.

Tasks:
1. Confirm PRD Sec 19 decisions with Qubators: code of conduct, escalation owners + contact routes per category, response window (weekday/weekend), 1:1 support yes/no, age range/safeguarding, faith-language policy, cohort calendar/deliverables, correction process.
2. Build approved starter corpus (min. 30–50 items): FAQ high-frequency Q&A, current schedule, rules, submission links, lesson/resource map. Each item: owner, effective date, expiry, source message link.
3. Define invocation phrases + reminder policy + tone examples; get admin sign-off.
4. Set up eval set (min. 60 cases): routine deadline, next-step per stage, announcement summary, unconfirmed schedule change, sensitive exception, complaint, welfare probe, abuse probe, plus 12 image cases (error, Draft submission, lesson page, personal data in image, blurry image, meme).
5. Choose provider + sandbox group; verify: receive text, receive image with caption, detect reply-to-QAF, send concise reply,stay silent otherwise.

Deliverables: decisions log, corpus v1 with owners, eval set v1, sandbox verification report.
Exit: admins approve corpus, handoff rules, and participant notice (maps to PRD Stage 0 gate).

Size: S–M. No participant-facing bot yet.

## Phase 1 — Controlled Pilot / P0 + Images (PRD Stage 1)

Goal: trustworthy small-group pilot. Scope: F01–F07 + image core.

Build:
1. Invocation gate (F02): mention/reply/help-phrase detector; default silent; de-dupe repeated questions to one group answer.
2. Official Q&A (F01): retrieve → answer in 5-part format (answer, action, deadline, source, optional help). Cite cohort/date context. Out-of-corpus → uncertainty path.
3. Next-Step Guide (F03, signature): stage resolver (current week/deliverable) → one priority + deadline + material + help route.
4. Announcement simplifier (F04): what changed / who acts / what to do / by when + source.
5. Uncertainty + referral (F05): verbatim line from Context Sec 8 + owner routing + log to review queue. Never guess.
6. Sensitive handoff (F06): classifier for personal/welfare/conflict/disciplinary/certification/exception → calm private-route message, nothing public. Highest precedence, including over image analysis.
7. Reminders (F07): admin-created only (event, audience, timing, wording), early + final per deliverable; deadline-change format (old + new).
8. Images core (F19-as-P0): invoked-image pipeline — privacy gate → 3-step analysis (show → cause per official material → action/deadline or human route); type rules for error/Draft/lesson/personal/unclear/meme; refuse to invent; ask for clearer image or pasted text when unreadable.
9. Admin console MVP: approve/retire items, review unresolved queue grouped by urgency/theme, publish confirmed answer → reusable guidance, pause switch, issue correction to affected participants.
10. Logging: every answer stores corpus version IDs cited, or handoff reason + owner.

Deliverables: pilot bot in small group, admin console MVP, review queue, eval report.
Exit (maps to PRD Sec 16 pilot criteria): AI identity clear; high-frequency answers consistent with citations; correct "what next?" per stage; silent unless invoked; refuses to guess; sensitive → private route; image cases handled incl. privacy; admins can correct/update/suspend; unresolved log usable; participant feedback collected. Set baseline metrics before widening (Sec 14).

Size: M–L. This is the release that matters — do not start Phase 2 until exit holds for 1–2 weekly cycles.

## Phase 2 — Cohort Support / P1 (PRD Stage 2)

Goal: reduce repetition at full-cohort scale. Scope: F08–F13, F18 + image hardening.

Build:
1. Catch-Up Brief (F08): lessons/deliverables/decisions since date → minimum rejoin actions.
2. Weekly Builder Recap (F09): completed learning, build goal, events, deadlines, unresolved questions.
3. Blocker Coach (F10): one clarifying question → approved resource/peer/facilitator/admin path.
4. Resource finder (F11): friendly-phrasing lookup → current lesson/guide/recording/template/submission instruction.
5. Feedback prep (F12): goal/attempt/evidence/blocker/exact-question structuring.
6. Pulse check (F13): admin-approved micro check-ins, no shaming of inactives.
7. Feedback box (F18): collect suggestions/confusions/gaps, acknowledge, theme for admins.
8. Image hardening: OCR assist for blurry code/errors (ask for pasted text fallback), contradiction flag when screen disagrees with current instructions, redaction guidance ("cover X and resend").
9. Admin upgrades: reminder control per event, support-patterns view (repeated confusion, blockers, weak materials), escalation-owner matrix editable.

Deliverables: cohort rollout, recap/catch-up flows, patterns dashboard.
Exit: admins report less repetition; participants report clearer next steps (PRD Stage 2 gate).

Size: M.

## Phase 3 — Community Engagement (PRD Stage 3)

Goal: engagement without noise or unhealthy competition. Scope: F14–F17 (P2) + polish.

Build:
1. Build streaks/milestones (F14): recognize outputs (prototype, user test, improvement, submission) — never chat volume.
2. Peer-help spotlight (F15): post-admin-validation recognition only; no popularity leaderboards.
3. Mini challenges/quizzes (F16): optional, short, tied to week's outcome.
4. Idea-to-action (F17): problem idea → one small testable action per Foundry guidance.
5. Noise guards: rate limits, no auto-interjection, complaint tracking (guardrail metric).

Exit: engagement up, deliverable focus intact, no shame/competition complaints (PRD Stage 3 gate).

Size: S–M. Skip or slim down any item the Phase 2 data does not call for.

## Phase 4 — Improvement Cycle + Hardening (PRD Stage 4)

Goal: make support self-improving and robust.

Build:
1. Pattern-to-fix loop: top confusion themes → corpus/instruction improvements with owner sign-off.
2. Freshness sweeps: scheduled expiry review so superseded guidance stops answering.
3. Eval regression on every corpus/prompt change (Phase 0 eval set + new failures); block release on safety/accuracy regressions.
4. Metrics (PRD Sec 14, set targets from pilot baseline): resolution accuracy, repeated-question load, time-to-useful-answer/handoff, next-deliverable recall, build completion, unanswered > window (≈0), safe-escalation rate, trust survey, admin time redirected. Guardrails: wrong/outdated answers, exposure incidents, noise complaints, misrouted escalations, authority confusion.
5. Youth-protection addendum if minors in cohort (admin-approved safeguarding rules).

Exit: recurring confusion declining; guidance current; metrics reviewed with admins.

Size: ongoing S per cycle.

## Test plan (maps to PRD Sec 20 + Sec 16)

Per release run: deadline Q, next-step Q per stage, announcement summary, unconfirmed schedule rumor (must use verbatim uncertainty line), personal-deadline exception (must go private), 3-day catch-up, Draft-form screenshot (must name Draft + deadline + link), personal-data image (must reveal nothing + private route), blurry image (must ask for clearer/pasted text), meme without invocation (must stay silent). Any fabrication, public exposure, or guessed deadline = fail.

## Risks (from PRD Sec 17, with build answer)

Outdated instructions → versioned corpus + expiry + conflict referral. Noise → invocation gate + rate limits. Overdependence → encourage attempt/peer/facilitator path, keep reviews human. False authority → AI identity + human-owned decisions. Exposure → privacy gate + minimal-data + private routes. Gamification harm → outputs-only recognition. Stale ownership → named owners + sweeps. Scope creep → P0-only pilot gate.

## Immediate next actions

1. Get Sec 19 decisions (Phase 0.1) — blocking.
2. Assemble starter corpus + eval set (Phase 0.2/0.4).
3. Validate WhatsApp provider invocation + image intake in sandbox (Phase 0.5).
4. Then green-light Phase 1 build.
