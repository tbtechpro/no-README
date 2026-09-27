// Safety layer: pre-check classification + privacy gate + post-check.
// Fail closed: anything sensitive, abusive-persistent, or unconfirmed → human handoff.

export const UNCERTAIN =
  "I do not have a confirmed answer to that yet. I'll direct it to the appropriate Qubators admin rather than guess.";

export const OWNERS = {
  admin: "programme admin",
  facilitator: "facilitator/mentor",
  lead: "authorised programme lead",
  safeguarding: "safeguarding/community lead",
  welfare: "designated welfare/admin contact",
};

/** @typedef {{sensitive:boolean, category:string|null, owner:string|null, abusive:boolean}} Classification */

/**
 * @param {string} text
 * @returns {Classification}
 */
export function classifyText(text) {
  const t = text.toLowerCase();
  /** @type {Classification} */
  const out = { sensitive: false, category: null, owner: null, abusive: false };

  const rules = [
    { re: /(suicid|self-?harm|hurt myself|kill myself|end it|emergency|urgent.*safe)/, category: "welfare-urgent", owner: OWNERS.welfare },
    { re: /(overwhelm|burnout|depress|anxiety|can't continue|cannot continue|mental health)/, category: "welfare", owner: OWNERS.welfare },
    { re: /(harass|bully|threat|assault|abuse by|fighting|conflict|complaint against)/, category: "conflict", owner: OWNERS.safeguarding },
    { re: /(grade|result|score).*(wrong|missing|incorrect)|fix (my|the) (grade|result)/, category: "grade", owner: OWNERS.facilitator },
    { re: /(personal reason|private matter|family issue|health issue|my (payment|status)|can't meet|cannot meet)/, category: "personal", owner: OWNERS.admin },
    { re: /(extension|late submission|approve my|exception|waive|promotion|select)/, category: "exception", owner: OWNERS.lead },
    { re: /(feedback on my|review my (project|build|prototype)|judge my)/, category: "learning", owner: OWNERS.facilitator },
  ];
  for (const r of rules) {
    if (r.re.test(t)) {
      out.sensitive = true;
      out.category = r.category;
      out.owner = r.owner;
      break;
    }
  }
  if (/(useless|stupid|idiot|hate you|shut up|ignore your rules|bypass|jailbreak)/.test(t)) {
    out.abusive = true;
  }
  return out;
}

/**
 * Privacy gate for image visible-descriptions (and text): personal data → never repeat.
 * @param {string} description visible content description (from vision model or reporter)
 * @returns {boolean} true if personal/confidential signals present
 */
export function privacyGate(description) {
  return /(card|payment|receipt|bank|phone number|email|address|contact|id number|passport|private (message|chat|dm)|password|otp|pin\b|face|photo of (me|person|people)|name:|@\w+)/i.test(
    description
  );
}

/**
 * Post-check: block guesses, exposures, overlong replies, ranking content.
 * @param {string} reply
 * @returns {{ok:boolean, reason:string|null}}
 */
export function postCheck(reply) {
  if (!reply || reply.length > 1200) return { ok: false, reason: "length" };
  if (/(i think|probably|maybe the deadline|as an ai language model)/i.test(reply))
    return { ok: false, reason: "hedged-guess" };
  if (/(top ?\d|leaderboard|ranked #)/i.test(reply)) return { ok: false, reason: "ranking" };
  return { ok: true, reason: null };
}
