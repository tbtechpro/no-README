import { OWNERS, UNCERTAIN } from "./safety.js";

// Message composers — templates from doc/QAF-Design-System.md Sec A.3.
// RULE: never state a date, deadline or time that is not passed in from an
// approved corpus item. Unconfirmed dates → uncertainty(), never invention.

const SIG = "— QAF (AI)";

/**
 * Routine 5-part answer from a corpus item.
 * @param {{title:string, body:string, id:string}} item
 */
export function routine(item) {
  return `${item.body} Source: ${item.title} (${item.id}). Reply EXPLAIN / STEPS / STILL-STUCK for more. ${SIG}`;
}

/** @param {string} body */
export function quick(body) {
  return `${body.split(". ")[0]}. ${SIG}`;
}

/** @param {string} topic */
export function explain(topic) {
  return (
    `Simply put: ${topic}. Think of the weekly deliverable like a bus that leaves at the announced time — ` +
    `be at the stop early with your work ready. Example: open the official cohort submission link today so deadline day is just one click. ${SIG}`
  );
}

/** @param {string[]} steps */
export function steps(steps) {
  return `${steps.map((s, i) => `${i + 1}) ${s}`).join("\n")}\n${SIG}`;
}

/** @param {string|null} deadline null = not confirmed on file */
export function nextStep(deadline = null) {
  const by = deadline ?? "the announced deadline (check the latest admin message)";
  return (
    `Next: complete this week's most important build task. By: ${by}. ` +
    `Use: the required lesson at learn.qubators.org + the official cohort submission link. ` +
    `Stuck? Tell me: lesson / idea / build. ${SIG}`
  );
}

export function onboarding() {
  return (
    `Welcome! Start here: 1) read the group rules, 2) open learn.qubators.org, ` +
    `3) find this week's lesson and deliverable, 4) ask me "what should I do next?" any time. ${SIG}`
  );
}

export function catchUp() {
  return (
    `Shortest catch-up path: 1) review the current lesson, 2) read the latest project instruction, ` +
    `3) complete the active deliverable, 4) check the next live-session time. Tell me which step to explain. ${SIG}`
  );
}

export function missedSession() {
  return (
    `No penalty for missing it — here is the way back: 1) get the session recording link from the admin, ` +
    `2) complete the active deliverable, 3) check the next live-session time. Tell me which step to explain. ${SIG}`
  );
}

export function finishedLesson() {
  return (
    `Great — now apply it. Build one small feature from the lesson into your project today, ` +
    `then confirm the deliverable and submit through the official cohort link. Stuck? Say the word. ${SIG}`
  );
}

export function prototypeNext() {
  return (
    `Strong move. Next: run one user test on the prototype, note what to improve, ` +
    `then submit the improved version through the official cohort link. ${SIG}`
  );
}

export function doneWeek() {
  return (
    `Confirm before you rest: 1) submission shows Submitted (not Draft), 2) you saved the confirmation, ` +
    `3) you know next week's kickoff. All three? You're clear. ${SIG}`
  );
}

export function blockerClarifier() {
  return `Quick check so I point you right: is the blocker the lesson, your idea, or your build? Reply with one word. ${SIG}`;
}

export function feedbackStruct() {
  return (
    `Send the facilitator this structure — goal, what you tried, evidence (link/screenshot), blocker, ` +
    `your exact question — labelled as an example:\nExample: "Goal: fix Draft status. Tried: reconfirming. Evidence: [screenshot]. Blocker: still Draft. Question: what step am I missing?" ${SIG}`
  );
}

export function feedbackExample() {
  return feedbackStruct();
}

/**
 * Announcement in What-changed / Who-acts / Do / By format.
 * Nulls where nothing is confirmed — honesty over invention.
 * @param {{changed:string|null, who:string, action:string, by:string, source:string}} a
 */
export function announcement(a) {
  const changed = a.changed ?? "nothing new on file — current plan stands";
  return `What changed: ${changed}. Who acts: ${a.who}. Do: ${a.action}. By: ${a.by}. Source: ${a.source}. ${SIG}`;
}

export function compareDeadlines() {
  return (
    `No confirmed change on file. Old deadline on file: none confirmed — follow the latest admin announcement. ` +
    `New deadline: none announced. Paste the update here and I'll compare old vs new for you. ${SIG}`
  );
}

export function portalStatus() {
  return (
    `I don't have a confirmed status for the portal — try learn.qubators.org again; ` +
    `if it still fails, tell me exactly what you see. I've directed this to the admin. ${SIG}`
  );
}

/** @param {string} owner */
export function uncertainty(owner = OWNERS.admin) {
  return `${UNCERTAIN} Until then, please follow the current announced time. This is with the ${owner}. ${SIG}`;
}

/** @param {string} owner */
export function sensitiveHandoff(owner) {
  return (
    `Thank you for letting me know. You don't need to explain personal details in the group. ` +
    `Please contact the ${owner} privately — only an authorised human can decide exceptions or status matters. ` +
    `I've flagged this for them. ${SIG}`
  );
}

export function exceptionHandoff() {
  return (
    `I cannot approve or reject extensions — only an authorised human programme lead can decide. ` +
    `Please contact them privately and I've flagged this for them. ${SIG}`
  );
}

export function gradeHandoff() {
  return (
    `For grade or result issues, contact the facilitator privately with your evidence — ` +
    `I can't change results here. I've flagged this for them. ${SIG}`
  );
}

export function welfareHandoff() {
  return (
    `I'm really glad you told us. Please contact the ${OWNERS.welfare} right now — ` +
    `a human needs to support you directly, and that matters more than any task here. ` +
    `If it feels urgent, reach someone you trust immediately. ${SIG}`
  );
}

export function conflictHandoff() {
  return (
    `Noted — I won't take either position in the group. Please report the details privately to the ${OWNERS.safeguarding}, ` +
    `and keep this space respectful meanwhile. ${SIG}`
  );
}

/** @param {string} kind payments|medical|ranking|certify|funding|rules */
export function refusal(kind) {
  switch (kind) {
    case "payments":
      return `The Foundry is free and I never handle money matters. If someone asked you for money in the programme's name, report it privately to the ${OWNERS.admin}. ${SIG}`;
    case "medical":
      return `I cannot give medical advice. Please speak to a qualified health professional — and if this affects your participation, contact the ${OWNERS.admin} privately. ${SIG}`;
    case "ranking":
      return `I cannot rank participants — we celebrate real outputs (prototypes, user tests, submissions), never message counts. Tell me about something you built instead. ${SIG}`;
    case "certify":
      return `I cannot certify completion or approve extensions — only an authorised human programme lead decides those. Contact them privately and I'll point you to the private route. ${SIG}`;
    case "funding":
      return `Building a strong, tested product is the path — I can't assure funding or outcomes either way. Ask me for the next build step instead. ${SIG}`;
    default:
      return `I can't help with that — programme rules don't allow it. Ask me about deadlines, next steps, lessons or resources. ${SIG}`;
  }
}

export function abuseBoundary() {
  return `I can't ignore programme rules. Tell me what you actually need — a deadline, a next step, or a resource — and I'll help. ${SIG}`;
}

export function thanks() {
  return `You're welcome — good luck building! Ask QAF any time. ${SIG}`;
}

/** @param {string} wrong @param {string} right */
export function correction(wrong, right) {
  return `Correction to my earlier message: "${wrong}" → ${right}. Sorry for the confusion — please follow the corrected version. ${SIG}`;
}
