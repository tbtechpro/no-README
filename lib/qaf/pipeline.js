import { isInvoked } from "./invocation.js";
import { searchCorpus, getById, currentDeadline } from "./corpus.js";
import { classifyText, postCheck, OWNERS } from "./safety.js";
import * as composer from "./composer.js";
import { handleImage } from "./images.js";
import { isPaused, logDecision, openTicket, checkRate } from "./store.js";
import { parseDeadlineCandidate, loadProposal, saveProposal, applyProposal, norm } from "./deadlines.js";

// Full Phase-1 answering pipeline (deterministic, template-faithful).
// RULE: deadlines/dates come ONLY from approved corpus items. c08 (weekly
// deadline) is still draft → deadline questions honestly refer to the admin.

/**
 * @param {string} text message text or image caption
 * @param {{isReplyToQaf?:boolean, imageType?:string, seenOverride?:string, msgId?:string, sender?:string, enforceRate?:boolean, isAdmin?:boolean}} [opts]
 * @returns {Promise<{reply:string|null, skill:string, corpusIds:string[], handoff:boolean, owner:string|null, ticketId:string|null}>}
 */
export async function answer(text, opts = {}) {
  const msgId = opts.msgId ?? `m-${Date.now()}`;
  /** @param {object} r */
  const done = async (r) => {
    const full = { reply: null, skill: "none", corpusIds: [], handoff: false, owner: null, ticketId: null, ...r };
    try {
      await logDecision({ msgId, text: String(text).slice(0, 200), invoked: true, ...full, reply: full.reply ? full.reply.slice(0, 200) : null });
    } catch { /* logging never breaks answering */ }
    const check = full.reply ? postCheck(full.reply) : { ok: true, reason: null };
    if (!check.ok) {
      return { reply: composer.uncertainty(OWNERS.admin), skill: "postcheck-fail", corpusIds: [], handoff: true, owner: OWNERS.admin, ticketId: null };
    }
    return full;
  };

  const t = String(text);
  const low = t.toLowerCase();
  const invoked = isInvoked(text, opts);
  // Admin deadline announcements are monitored even without invocation —
  // that is how the deadline stays consistent with admin messages.
  const adminAnnouncement =
    opts.isAdmin === true &&
    !/\?/.test(t) &&
    !/\bconfirm\b/.test(low) &&
    /(deadline|assessment|deliverable|submission|\bdue\b|closes|closing)/.test(low);
  if (!invoked && !adminAnnouncement) {
    try { await logDecision({ msgId, invoked: false, skill: "silent" }); } catch { /* ignore */ }
    return { reply: null, skill: "silent", corpusIds: [], handoff: false, owner: null, ticketId: null };
  }
  if (await isPaused()) {
    return done({ reply: "QAF is paused right now. Urgent? Contact the programme admin directly — otherwise I'll reply when resumed. — QAF (AI)", skill: "paused" });
  }
  if (opts.enforceRate && opts.sender) {
    const rl = checkRate(opts.sender);
    if (!rl.allowed) {
      try { await logDecision({ msgId, invoked: true, skill: "rate-limited" }); } catch { /* ignore */ }
      return { reply: null, skill: "rate-limited", corpusIds: [], handoff: false, owner: null, ticketId: null };
    }
  }

  // 1. Invoked image → image flow (privacy gate inside).
  if (opts.imageType) {
    const r = handleImage(opts.imageType, opts.seenOverride, await currentDeadline());
    let ticketId = null;
    if (r.handoff) {
      const owner = r.skill === "image-privacy" ? OWNERS.admin : OWNERS.admin;
      ticketId = (await openTicket({ category: r.skill, owner, excerpt: `[image:${opts.imageType}]` })).id;
    }
    return done({ ...r, owner: r.handoff ? OWNERS.admin : null, ticketId });
  }

  // 2. Explicit refusals first (no guessing, no authority, no promises) —
  // checked before classification so "pay a fee for certification" lands here.
  if (/\b(pay|fee|payment|cost|price|billing)\b/.test(low)) return done({ reply: composer.refusal("payments"), skill: "refusal" });
  if (/(medicine|drug|dose|mg\b|doctor|diagnos|focus pill)/.test(low)) return done({ reply: composer.refusal("medical"), skill: "refusal" });
  if (/\b(rank|ranking|leaderboard|top participants|most active)\b/.test(low)) return done({ reply: composer.refusal("ranking"), skill: "refusal" });
  if (/(funding|investor|grant money)/.test(low)) return done({ reply: composer.refusal("funding"), skill: "refusal" });
  if (/(certificat|certify)/i.test(t)) return done({ reply: composer.refusal("certify"), skill: "refusal" });

  // 3. Safety classification → handoff paths.
  const cls = classifyText(t);
  if (cls.sensitive) {
    let reply;
    if (cls.category === "welfare-urgent" || cls.category === "welfare") reply = composer.welfareHandoff();
    else if (cls.category === "conflict") reply = composer.conflictHandoff();
    else if (cls.category === "grade") reply = composer.gradeHandoff();
    else if (cls.category === "exception") reply = composer.exceptionHandoff();
    else if (cls.category === "learning") {
      reply = composer.sensitiveHandoff(OWNERS.facilitator);
    } else reply = composer.sensitiveHandoff(cls.owner ?? OWNERS.admin);
    const ticketId = (await openTicket({ category: cls.category ?? "sensitive", owner: cls.owner ?? OWNERS.admin, excerpt: t.slice(0, 140) })).id;
    return done({ reply, skill: "handoff", corpusIds: [], handoff: true, owner: cls.owner, ticketId });
  }

  // 4. Abuse → calm boundary (legitimate question preserved).
  if (cls.abusive) return done({ reply: composer.abuseBoundary(), skill: "boundary" });

  // 5. Thanks.
  if (/^\s*(thanks|thank you|thx|appreciated)/.test(low)) return done({ reply: composer.thanks(), skill: "thanks" });

  // 5b. Deadline governance: admin announcements propose; nothing applies
  // without an explicit admin CONFIRM. Questions (with "?") fall through.
  if (/\bqaf\b/.test(low) && /\bconfirm\b/.test(low)) {
    if (!opts.isAdmin) return done({ reply: composer.confirmDenied(), skill: "deadline-confirm-denied" });
    const p = await loadProposal();
    if (!p) return done({ reply: composer.noPending(), skill: "deadline-no-pending" });
    const old = await currentDeadline();
    await applyProposal(p);
    return done({ reply: composer.proposalApplied(old ?? "none confirmed", p.label), skill: "deadline-apply", corpusIds: ["c08"] });
  }
  if (opts.isAdmin && !/\?/.test(t) && /(deadline|assessment|deliverable|submission|due|closes|closing)/.test(low)) {
    const parsed = parseDeadlineCandidate(t);
    if (!parsed) return done({ reply: composer.deadlineUnclear(), skill: "deadline-unclear" });
    const cur = await currentDeadline();
    if (cur && norm(cur) === norm(parsed.label))
      return done({ reply: composer.alreadyCurrent(cur), skill: "deadline-current", corpusIds: ["c08"] });
    await saveProposal({ label: parsed.label, by: opts.sender ?? "admin" });
    return done({ reply: composer.proposalAsk(parsed.label, cur ?? "none confirmed"), skill: "deadline-propose", corpusIds: ["c08"] });
  }

  // 6. Corrections (user reports a wrong answer or broken link — first-person reports).
  if (/(you said|you told|doesn.?t open|does not open|that link|my link)/.test(low)) {
    const ticketId = (await openTicket({ category: "correction-report", owner: OWNERS.admin, excerpt: t.slice(0, 140) })).id;
    return done({
      reply: composer.correction("the day I gave", "the admin's Friday message") + " I've also flagged this for the admin.",
      skill: "correction",
      corpusIds: ["c34"],
      handoff: true,
      owner: OWNERS.admin,
      ticketId,
    });
  }

  // 7. Unconfirmed / rumor / status probes → verify-first.
  if (/(portal|website|learn\.qubators).*(down|not (loading|opening|working))/.test(low))
    return done({ reply: composer.portalStatus(), skill: "status-probe", handoff: true, owner: OWNERS.admin });
  if (/(mov(e|ed|ing)|true\?|someone said|heard that|rumou?r|new (rule|facilitator)|is it true)/.test(low)) {
    const ticketId = (await openTicket({ category: "unconfirmed", owner: OWNERS.admin, excerpt: t.slice(0, 140) })).id;
    return done({ reply: composer.uncertainty(OWNERS.admin), skill: "uncertainty", handoff: true, owner: OWNERS.admin, ticketId });
  }
  if (/(change.*deadline|deadline.*change|old.*new|new.*deadline)/.test(low))
    return done({ reply: composer.compareDeadlines(await currentDeadline()), skill: "deadline-compare" });

  // 8. Response modes wrap corpus answers.
  const modeMatch = low.match(/\b(quick( answer)?|explain( simply)?|steps|example)\b/);
  if (modeMatch) {
    const kind = modeMatch[1].startsWith("explain") ? "explain" : modeMatch[1].startsWith("step") ? "steps" : modeMatch[1].startsWith("exam") ? "example" : "quick";
    const topic = t.replace(/qaf[,:]?\s*/i, "").replace(/\b(quick( answer)?|explain( simply)?|give me the steps|steps|show me an example|example)\b[:]?/gi, "").trim();
    if (kind === "explain") {
      const subject = /prototype/.test(topic) ? "a prototype is an early working version of your idea" : "this week's task: learn it, build it, submit it";
      return done({ reply: composer.explain(subject), skill: "mode-explain" });
    }
    if (kind === "steps") {
      return done({
        reply: composer.steps(["open the official cohort submission link early", "complete every required field", "confirm it no longer shows Draft", "submit before the announced deadline"]),
        skill: "mode-steps",
        corpusIds: ["c13"],
      });
    }
    if (kind === "example") return done({ reply: composer.feedbackExample(), skill: "mode-example", corpusIds: ["c23"] });
    const hit = (await searchCorpus(topic, 1))[0];
    if (hit) return done({ reply: composer.quick(hit.item.body), skill: "mode-quick", corpusIds: [hit.item.id] });
    return done({ reply: composer.uncertainty(), skill: "uncertainty", handoff: true, owner: OWNERS.admin });
  }

  // 9. Skill routing.
  if (/(did nothing|no progress|haven.?t done anything|am behind)/.test(low))
    return done({ reply: composer.encourage(), skill: "encourage" });
  if (/(missed|didn.?t attend|absent|away for|behind|catch.?up)/.test(low))
    return done({ reply: /missed|didn.?t attend/.test(low) ? composer.missedSession() : composer.catchUp(), skill: "catchup", corpusIds: ["c25"] });
  if (/(stuck|blocked|confused|don't understand|dont understand)/.test(low))
    return done({ reply: composer.blockerClarifier(), skill: "blocker", corpusIds: ["c22"] });
  const stripped = t.replace(/qaf[,:]?\s*/i, "").trim().toLowerCase().replace(/[!?.]+$/, "");
  if (stripped === "lesson") return done({ reply: composer.blockerLesson(), skill: "blocker-lesson", corpusIds: ["c17"] });
  if (stripped === "idea") return done({ reply: composer.blockerIdea(), skill: "blocker-idea", corpusIds: [] });
  if (stripped === "build") return done({ reply: composer.blockerBuild(), skill: "blocker-build", corpusIds: [] });
  if (/(feedback|review my)/.test(low))
    return done({ reply: composer.feedbackStruct(), skill: "feedback-prep", corpusIds: ["c23"] });
  if (/(suggestion|confusing|feedback for (the )?(admin|team|programme))/i.test(t)) {
    const ticketId = (await openTicket({ category: "feedback-box", owner: OWNERS.admin, excerpt: t.slice(0, 140) })).id;
    return done({ reply: composer.feedbackBox(t.slice(0, 120)), skill: "feedback-box", corpusIds: ["c35"], handoff: false, owner: null, ticketId });
  }
  if (/(recording|template|slides|video\b|study material)/.test(low))
    return done({ reply: composer.resourceFallback(), skill: "resource", corpusIds: ["c17"] });
  if (/(pulse|check-?in\b|i.?m confident|\bconfidence\b)/.test(low))
    return done({ reply: composer.pulseAck(), skill: "pulse", corpusIds: [] });
  const quizAns = t.match(/answer\s*:\s*(.+)/i);
  if (quizAns) {
    const correct = /draft/i.test(quizAns[1]);
    return done({ reply: composer.quizGrade(correct, await currentDeadline()), skill: correct ? "quiz-correct" : "quiz-retry", corpusIds: ["c14"] });
  }
  if (/(quiz|challenge|test me|question me)/.test(low))
    return done({ reply: composer.quizAsk(), skill: "quiz", corpusIds: [] });
  if (/(new here|just joined|where.*(begin|start)|getting started|first action)/.test(low))
    return done({ reply: composer.onboarding(), skill: "onboarding", corpusIds: ["c03"] });
  if (/(finished.*lesson|done with.*lesson|completed.*lesson)/.test(low))
    return done({ reply: composer.finishedLesson(), skill: "build-next", corpusIds: ["c21"] });
  if (/prototype/.test(low) && /(next|after|done)/.test(low))
    return done({ reply: composer.prototypeNext(), skill: "build-next", corpusIds: ["c16"] });
  if (/(done for the week|anything left|finished.*week|all done)/.test(low))
    return done({ reply: composer.doneWeek(), skill: "confirm-complete", corpusIds: ["c14"] });
  // Phase 3: engagement on outputs only — never volume, never leaderboards.
  if (/user test|tested with|tested my/.test(low))
    return done({ reply: composer.milestone("usertest", await currentDeadline()), skill: "milestone", corpusIds: ["c16"] });
  if (/(i (finished|completed|built)|done with (my )?(prototype|build|mvp))/.test(low))
    return done({ reply: composer.milestone("prototype", await currentDeadline()), skill: "milestone", corpusIds: ["c16"] });
  if (/improv/.test(low) && /(^|\W)(i|my)\W/.test(low))
    return done({ reply: composer.milestone("improvement", await currentDeadline()), skill: "milestone", corpusIds: ["c16"] });
  if (/^\s*qaf[,:]?\s*i submitted/.test(low))
    return done({ reply: composer.milestone("submission", await currentDeadline()), skill: "milestone", corpusIds: ["c14"] });
  if (/(spotlight|shout ?out|kudos|nominate|recogni[sz]e|helped me)/.test(low)) {
    const ticketId = (await openTicket({ category: "spotlight", owner: OWNERS.admin, excerpt: t.slice(0, 140) })).id;
    return done({ reply: composer.spotlightAck(), skill: "spotlight", corpusIds: [], handoff: false, owner: null, ticketId });
  }
  if (/(my idea|i have an idea|idea:|problem i want to solve|startup idea)/.test(low))
    return done({ reply: composer.ideaToAction(), skill: "idea", corpusIds: [] });
  if (/(too many|spamm|mute|noisy|stop (messaging|replying)|annoying)/.test(low)) {
    const ticketId = (await openTicket({ category: "noise", owner: OWNERS.admin, excerpt: t.slice(0, 140) })).id;
    return done({ reply: composer.noiseApology(), skill: "noise", corpusIds: [], handoff: false, owner: null, ticketId });
  }
  if (/(recap|week.*summary|my week\b)/.test(low))
    return done({ reply: composer.weeklyRecap(await currentDeadline()), skill: "recap", corpusIds: ["c08"] });
  if (/(announce|summariz|summaris|latest update|latest news)/.test(low)) {
    return done({
      reply: composer.announcement({ changed: null, who: "all active participants", action: "keep to the current plan and confirm the active deliverable", by: "the announced deadline", source: "current official info (no new announcement on file — paste it and I'll compress it)" }),
      skill: "announcement",
    });
  }
  if (/(where|link|how).{0,20}submit|submit.{0,20}(where|link|how)/.test(low)) {
    const item = await getById("c13");
    return done({ reply: composer.routine(item), skill: "routine", corpusIds: ["c13"] });
  }
  if (/\b(due|deadline|closing|closes|due date|assessment)\b/.test(low) || /when.*(submit|due)/.test(low)) {
    // Deadline answers come ONLY from approved c08. Draft/missing → honest referral.
    const dl = await currentDeadline();
    if (dl) {
      return done({ reply: composer.deadlineAnswer(dl), skill: "routine", corpusIds: ["c08"] });
    }
    const dlTicket = (await openTicket({ category: "deadline-unknown", owner: OWNERS.admin, excerpt: t.slice(0, 140) })).id;
    return done({ reply: composer.uncertainty(OWNERS.admin), skill: "uncertainty", handoff: true, owner: OWNERS.admin, ticketId: dlTicket });
  }
  if (/\b(next|next step)\b/.test(low))
    return done({ reply: composer.nextStep(await currentDeadline()), skill: "next-step", corpusIds: ["c21", "c08"] });

  // 10. Fallback: corpus search, else honest uncertainty.
  const hit = (await searchCorpus(t, 1))[0];
  if (hit) return done({ reply: composer.routine(hit.item), skill: "routine", corpusIds: [hit.item.id] });
  const ticketId = (await openTicket({ category: "unresolved", owner: OWNERS.admin, excerpt: t.slice(0, 140) })).id;
  return done({ reply: composer.uncertainty(OWNERS.admin), skill: "uncertainty", handoff: true, owner: OWNERS.admin, ticketId });
}
