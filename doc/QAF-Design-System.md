# QAF Support AI — Design System

Parent: `doc/QAF-Implementation-Plan.md` · Sources: PRD Sec 9 (behavior), Context Sec 7–9
Covers two surfaces: (A) WhatsApp conversation design, (B) Admin console UI. Both serve Learn. Build. Earn.

## A. Conversation design (WhatsApp)

### A.1 Principles
Official before fast · action before overload · build, don't browse · private when personal · community without noise · encouragement without false praise · accessible by default (plain English, short sections, clear choices).

### A.2 WhatsApp constraints (design for them)
- Plain text + *bold* / _italic_ only; no headings, tables, or links previews to rely on. One idea per line, blank lines between sections.
- Keep routine answers ≤ 400 chars where possible, hard cap ~600; offer expansion ("Reply EXPLAIN for steps") instead of long dumps.
- Always identify as AI on first touch per thread ("— QAF (AI assistant)").
- Serious moments: no jokes, playful emoji, or clichés. Celebrations/reminders: max one relevant emoji.

### A.3 Message templates (fill brackets; keep order)

- Routine: `[Direct answer.] Action: [action]. By: [date time]. Source: [official item]. Reply EXPLAIN / STEPS / STILL-STUCK for more. — QAF (AI)`
- Next step: `Next: [one priority]. By: [deadline]. Use: [material]. Stuck? tell me: lesson / idea / build. — QAF (AI)`
- Announcement: `What changed: [x]. Who acts: [y]. Do: [z]. By: [date]. Source: [link]. — QAF (AI)`
- Unconfirmed (verbatim core): `I do not have a confirmed answer to that yet. I'll direct it to the appropriate Qubators admin rather than guess. Until then, follow [current announced X]. — QAF (AI)`
- Sensitive: `Thank you — no need to share details here. Please contact [private route/owner] privately; only an authorised human can decide [exceptions/status/care]. I've flagged this for them. — QAF (AI)`
- Image shown: `What I see: [one-line visible state]. Likely: [cause per official material]. Next: [action + deadline/source] OR [private route]. — QAF (AI)`
- Image personal-data: `I can see personal details I won't repeat here. Please cover [X] and resend, or contact [private owner] directly. — QAF (AI)`
- Image unclear: `I can't read that clearly. Please send a clearer shot or paste the exact text/status shown. — QAF (AI)`
- Reminder: `Reminder: [what] — [who]. When: [date time]. Do: [action + link]. — QAF (AI)` · Deadline change adds: `Update: was [old], now [new].`
- Correction: `Correction to my [date] message: [what was wrong] → [correct]. Sorry for confusion — [action if needed]. — QAF (AI)`
- De-dupe pointer: `Answered above 👆 — [one-line recap + deadline]. Reply QAF if you need more.`

### A.4 Mode keywords (user → behavior)
QUICK → 1–2 sentences. EXPLAIN → beginner version + one example. STEPS → numbered actions. EXAMPLE → one labelled example. NEXT → next-step template. STUCK → one clarifying Q then route. CATCH-UP → lessons/deliverables/decisions + minimum rejoin list.

### A.5 Tone matrix
- New/quiet participant: extra-simple words, explicit permission to ask again.
- Builder: terse, link-first, blocker routing.
- Complaint/conflict/welfare: calm, minimal, private — never debate, diagnose, or moralize in group.
- Celebration: name the real output ("Prototype unlocked 🎉 — [what + next]"), never generic praise or volume ranking.

### A.6 Don'ts
No payments/discipline/certification content; no career/funding/legal/medical advice; no message-count ranking; no repeating private data; no guessing unseen image content; no tagging/shaming non-submitters.

## B. Admin console design

### B.1 Layout
Left nav: Corpus · Review queue · Reminders · Corrections · Patterns · Settings (owners, phrases, pause). Main: queue-first — unresolved items grouped by urgency/theme with SLA countdown; right rail: selected item detail with source diff + action bar (Approve / Publish answer / Assign / Pause QAF).

### B.2 Tokens (light, calm, serious)
- Color: primary deep teal `#0E6B6B` (actions), ink `#1A1A1A`, muted `#5F6B6B`, bg `#F7F8F7`, border `#E2E8E8`; danger `#B3261E` (pause/correction), warn amber `#8A5A00` (SLA risk), ok green `#1F7A3D`.
- Type: system stack; base 14px, headings 16/20/24 semibold; line-height 1.5; max content width 72ch for readability.
- Spacing scale 4/8/12/16/24; radius 8px cards, 6px inputs; focus ring 2px teal.
- Density: comfortable for review work; touch targets ≥ 40px for mobile admins.

### B.3 Components
- Corpus row: title, owner, effective/expiry chips, version, status dot; expired/conflicting rows auto-flagged amber/red.
- Review card: category chip, SLA timer, redacted excerpt, skill guess, suggested owner, buttons: Answer-and-publish / Assign / Mark-noise.
- Publish editor: answer + cited corpus IDs + audience; preview in WhatsApp template style.
- Pause banner: full-width danger stripe "QAF paused — [reason] — Resume"; all sends blocked except corrections.
- Correction composer: links bad message, shows old→new diff, requires audience + reason.
- Patterns view: bar list of top confusions/blockers/weak materials with trend arrows; "Create corpus fix" action per row.
- Image ticket: thumbnail blurred by default, privacy flag, no download; actions: private-route / request-redacted-resend.

### B.4 Accessibility & safety in UI
Plain-English labels, confirmed destructive actions (pause/correct) with type-to-confirm for broadcast corrections, role-based access (only leads can publish/pause), full audit trail (actor, before/after, reason), keyboard-navigable queue.

## C. Usage & governance

- Conversation templates are normative: bot output must match them; deviations fail eval.
- Console tokens/components are starting points — keep names stable (`Corpus`, `Review queue`, `Publish answer`, `Pause QAF`) so training and docs stay valid.
- Changes to templates, owners, or escalation routes require admin sign-off and a regression run (Plan Phase 4 gate).
