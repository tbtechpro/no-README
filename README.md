# QAF Support AI

The WhatsApp support companion for Qubators AI Foundry participants.

> Every participant can quickly understand what is happening, what is expected, what to do next, and when a human admin needs to help.

**Learn clearly • Build consistently • Grow through community**
**Learn. Build. Earn.**

## What this is

QAF Support AI answers routine programme questions in the Foundry WhatsApp group, turns announcements into clear actions, guides each participant to their next step, reads screenshots when asked, and routes judgement-sensitive issues to a human admin.

It is not a noisy chatbot, substitute instructor, or automated authority. Human admins, mentors, and facilitators remain responsible for decisions, feedback, and care.

- Status: v0.1 initial version — product direction + standard AI context + implementation plan, no code yet
- PRD: `doc/QAF Support AI-PRD.md` (v1.0, 19 Sept 2026)
- Standard context for implementation: `doc/QAF-Support-AI-Context.md`
- Implementation plan: `doc/QAF-Implementation-Plan.md`
- Architecture: `doc/QAF-Architecture.md`
- Design system (chat + admin UI): `doc/QAF-Design-System.md`
- Copilot instructions: `.github/muse-instructions.md`

## Who it serves

- New participants: orientation, rules, schedule, where to begin
- Active builders: deadlines, deliverables, resources, blocker support
- Quiet participants: safe way to ask basic questions
- Peer contributors: responsible help without replacing facilitators
- Admins / facilitators: fewer repeated questions, clear handoff of unresolved needs

## Core behavior (P0)

1. **Official Q&A** — answer only from current admin-approved info, with date/cohort context.
2. **QAF-directed only** — respond when called "QAF", replied to, or via approved help phrase. Never interrupt ordinary conversation.
3. **Next-Step Guide** (signature) — immediate task + deliverable + deadline + material + help route.
4. **Announcement simplifier** — meaning / who acts / what to do / by when / source.
5. **Uncertainty + referral** — say when unconfirmed, refer to human, never guess:
   > "I do not have a confirmed answer to that yet. I'll direct it to the appropriate Qubators admin rather than guess."
6. **Sensitive handoff** — personal, welfare, conflict, disciplinary, certification, exception requests go to private human route. Reveal nothing publicly.
7. **Reminders** — limited, admin-approved, with what/who/when/action.

## Image recognition — core capability

QAF reads participant-shared images **only when invoked**:

1. State what is visibly shown in one sentence.
2. Give likely cause/meaning grounded only in visible content + official material.
3. Give next action + deadline/source, or private human route.

- Error/code screenshots, submission/dashboard screens, lesson/announcement pages supported.
- Unclear images: ask for clearer image or pasted text. Never invent unseen content.
- Personal/confidential details in images: reveal nothing publicly, move to private admin.
- Memes/casual photos: ignore unless explicitly invoked for support.
- Same accuracy, privacy, and escalation rules as text apply.

See `doc/QAF-Support-AI-Context.md` Section 6 for full rules.

## Explicitly out of scope

Payments/fees/billing, automated disciplinary/certification/exception decisions, unapproved career/funding/legal/medical advice, public ranking by activity, answers from rumours or outdated messages presented as official.

## Repo structure

```
AI Practical/
  README.md
  doc/
    QAF Support AI-PRD.md
    QAF-Support-AI-Context.md
    QAF-Implementation-Plan.md
    QAF-Architecture.md
    QAF-Design-System.md
  .github/
    muse-instructions.md
```

## Getting started (for builders)

1. Read the PRD and standard context above.
2. Confirm with Qubators before pilot: code of conduct, escalation owners, response window, private 1:1 support route, age range/safeguarding, faith-language use, cohort calendar/deliverables, correction process (PRD Sec. 19).
3. Implement Stage 1 pilot only: routine Q&A, direct invocation, next-step guidance, announcement summaries, image assistance on invocation, human handoff.
4. Admins must be able to approve/retire info, review unresolved questions, publish confirmed answers, control reminders, pause/correct QAF.

## Sources

- Qubators AI Foundry: https://www.qubators.org/aifoundry
- Learning portal: https://learn.qubators.org/
- Brand press (21 April 2026): https://techpoint.africa/brandpress/qubators-launches-free-ai-foundry-to-help-talents-build-apps-using-artificial-intelligence/

QAF Support AI should make the next right action easier — while keeping people, judgement and community at the centre.
