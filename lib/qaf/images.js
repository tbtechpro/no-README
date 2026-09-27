import { privacyGate } from "./safety.js";
import * as composer from "./composer.js";

// Invoked-image flow (Context Sec 6): privacy gate FIRST, then 3 steps —
// show → cause per official material → action/deadline or human route.
// `seen` is the visible-content description (vision model in production,
// reporter-confirmed text in sandbox). Never invent beyond it.

/** Visible-content presets for sandbox/eval when no vision model is attached. */
const PRESETS = {
  "submission-draft": "a submission form still showing Draft",
  "error-blurry": "a blurry, unreadable code error",
  "error-clear": "a readable TypeError in code",
  "dashboard-submitted": "a dashboard showing a Submitted checkmark",
  "lesson-page": "a lesson page with this week's material",
  "personal-data": "a payment receipt showing card number and personal details",
  unclear: "a half-cropped, unreadable form",
  meme: "a meme with no support question",
  "casual-photo": "a group photo with no support question",
  contradiction: "a screen showing an old deadline that conflicts with the admin update",
  "build-output": "a build output with passing tests",
  "announcement-shot": "an announcement about Friday's session",
};

/**
 * @param {string} imageType
 * @param {string} [seenOverride]
 */
export function handleImage(imageType, seenOverride) {
  const seen = seenOverride ?? PRESETS[imageType] ?? "an image I cannot describe";

  // Privacy gate first — reveal NOTHING when personal data may be present.
  if (privacyGate(seen) || imageType === "personal-data") {
    return {
      reply:
        "I can see personal details I won't repeat here. Cover them and resend, " +
        "or contact the designated admin privately. — QAF (AI)",
      skill: "image-privacy",
      corpusIds: ["c31"],
      handoff: true,
    };
  }

  // Ignore list.
  if (imageType === "meme" || imageType === "casual-photo") {
    return { reply: null, skill: "image-ignore", corpusIds: [], handoff: false };
  }

  // Unclear → ask for better input before answering.
  if (imageType === "unclear" || imageType === "error-blurry") {
    return {
      reply:
        "I can't read that clearly — what I see is blurry. Please send a clearer shot " +
        "or paste the exact text shown, and I'll take it from there. — QAF (AI)",
      skill: "image-unclear",
      corpusIds: ["c32"],
      handoff: false,
    };
  }

  // 3-step analyses grounded only in what is visible + approved material.
  switch (imageType) {
    case "submission-draft":
      return {
        reply:
          "What I see: your submission form is still in Draft. " +
          "Likely cause: it wasn't confirmed. " +
          "Next: complete and confirm before the announced deadline via the official cohort submission link. " +
          "Still Draft after confirming? Contact the designated admin privately. — QAF (AI)",
        skill: "image",
        corpusIds: ["c13", "c14"],
        handoff: false,
      };
    case "error-clear":
      return {
        reply:
          `What I see: ${seen}. ` +
          "Likely cause depends on your code — compare the failing line with this week's lesson. " +
          "Next: paste the exact error text plus what you tried, or tell me whether the blocker is the lesson, your idea or your build. — QAF (AI)",
        skill: "image",
        corpusIds: ["c22"],
        handoff: false,
      };
    case "dashboard-submitted":
      return {
        reply:
          `What I see: ${seen} — your submission is in. ` +
          "Next: keep building toward the next milestone and watch for the admin's recap. — QAF (AI)",
        skill: "image",
        corpusIds: ["c14"],
        handoff: false,
      };
    case "lesson-page":
      return {
        reply:
          `What I see: ${seen}. ` +
          "Next: apply one idea from it to your build today, then confirm this week's deliverable and deadline. " +
          "Want it explained simply or as steps? — QAF (AI)",
        skill: "image",
        corpusIds: ["c17", "c21"],
        handoff: false,
      };
    case "contradiction":
      return {
        reply:
          "What I see contradicts the current information I have — screens can go stale. " +
          "Follow the most recent admin announcement, not the screen. " +
          "I've flagged the conflict for the admin. — QAF (AI)",
        skill: "image",
        corpusIds: ["c11"],
        handoff: true,
      };
    case "build-output":
      return {
        reply:
          `What I see: ${seen} — solid progress. ` +
          "Next: test it with one real user and note what to improve before submission. — QAF (AI)",
        skill: "image",
        corpusIds: ["c16"],
        handoff: false,
      };
    case "announcement-shot":
      return {
        reply: composer.announcement({
          changed: seen,
          who: "all active participants",
          action: "follow the instruction shown and confirm the deadline",
          by: "the announced date (or the date shown, if newer and admin-confirmed)",
          source: "the announcement you shared",
        }),
        skill: "image",
        corpusIds: [],
        handoff: false,
      };
    default:
      return {
        reply:
          `What I see: ${seen}. Tell me what you need from it — a fix, a next step, or the deadline it relates to. — QAF (AI)`,
        skill: "image",
        corpusIds: [],
        handoff: false,
      };
  }
}
