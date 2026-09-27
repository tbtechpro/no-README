// Invocation gate (F02): respond ONLY when deliberately called.
// Matches: "QAF …", reply-to-QAF (handled by caller via context flag), approved help phrases.

const PATTERNS = [/(^|\W)qaf(\W|$)/i, /^hey qaf\b/i, /^@qaf\b/i];

/**
 * @param {string} text message text or image caption
 * @param {{isReplyToQaf?: boolean}} [ctx]
 */
export function isInvoked(text, ctx = {}) {
  if (ctx.isReplyToQaf) return true;
  return PATTERNS.some((re) => re.test(text || ""));
}
