import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";

// Deadline governance: the authoritative deadline changes ONLY via an admin
// announcement followed by an explicit admin CONFIRM. Proposals and the active
// overlay live in gitignored local files; the corpus seed stays the baseline.

const proposalFile = () => join(process.cwd(), "data", "deadline-proposal.json");
const overlayFile = () => join(process.cwd(), "data", "deadline.json");

const DAYS = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
const MONTHS = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6, august: 7,
  september: 8, october: 9, november: 10, december: 11,
  jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
};
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Normalize for equality checks. @param {string} s */
export function norm(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Extract a deadline candidate from admin announcement text.
 * Needs a day/date AND a time; otherwise null (caller asks for restatement).
 * @param {string} text
 * @param {Date} [now]
 * @returns {{date: Date, label: string}|null}
 */
export function parseDeadlineCandidate(text, now = new Date()) {
  const t = String(text).toLowerCase();

  let hh = null;
  let mm = 0;
  const m12 = t.match(/(\d{1,2})(?::(\d{2}))?\s*(a\.m\.|p\.m\.|am|pm)/);
  const m24 = m12 ? null : t.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (m12) {
    hh = parseInt(m12[1], 10) % 12;
    mm = parseInt(m12[2] || "0", 10);
    if (/p/.test(m12[3])) hh += 12;
  } else if (m24) {
    hh = parseInt(m24[1], 10);
    mm = parseInt(m24[2], 10);
  } else {
    return null;
  }

  /** @type {Date|null} */
  let target = null;
  const wd = t.match(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  if (wd) {
    const diff = ((DAYS[wd[1]] - now.getUTCDay() + 7) % 7) || 7;
    target = new Date(now.getTime() + diff * 86400000);
  } else {
    const monthNames = Object.keys(MONTHS).join("|");
    const dmy =
      t.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthNames})\\b`)) ||
      t.match(new RegExp(`\\b(${monthNames})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`));
    const slash = dmy ? null : t.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
    if (dmy) {
      const dayFirst = /^\d/.test(dmy[0]);
      const day = parseInt(dayFirst ? dmy[1] : dmy[2], 10);
      const monTok = (dayFirst ? dmy[2] : dmy[1]).toLowerCase();
      const mon = MONTHS[monTok.slice(0, 3)];
      if (mon === undefined || day < 1 || day > 31) return null;
      target = new Date(Date.UTC(now.getUTCFullYear(), mon, day));
      if (target.getTime() < now.getTime() - 86400000) target = new Date(Date.UTC(now.getUTCFullYear() + 1, mon, day));
    } else if (slash) {
      const day = parseInt(slash[1], 10);
      const mon = parseInt(slash[2], 10) - 1;
      const yr = slash[3] ? parseInt(slash[3].length === 2 ? "20" + slash[3] : slash[3], 10) : now.getUTCFullYear();
      if (mon < 0 || mon > 11 || day < 1 || day > 31) return null;
      target = new Date(Date.UTC(yr, mon, day));
      if (target.getTime() < now.getTime() - 86400000 && !slash[3]) target = new Date(Date.UTC(yr + 1, mon, day));
    } else {
      return null;
    }
  }

  // Set wall-clock time in WAT (UTC+1).
  target.setUTCHours(hh - 1, mm, 0, 0);
  if (target.getTime() < now.getTime()) return null;

  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  const ampm = hh < 12 ? "a.m." : "p.m.";
  const label = `${DAY_NAMES[target.getUTCDay()]}, ${target.getUTCDate()} ${MONTH_NAMES[target.getUTCMonth()]}, at ${h12}:${String(mm).padStart(2, "0")} ${ampm} (WAT)`;
  return { date: target, label };
}

/** @returns {{label:string, at:string, by:string}|null} */
export function loadProposal() {
  try {
    const f = proposalFile();
    if (!existsSync(f)) return null;
    return JSON.parse(readFileSync(f, "utf8"));
  } catch {
    return null;
  }
}

/** @param {{label:string, by:string}} p */
export function saveProposal(p) {
  writeFileSync(proposalFile(), JSON.stringify({ ...p, at: new Date().toISOString() }, null, 2));
}

export function clearProposal() {
  try {
    unlinkSync(proposalFile());
  } catch { /* none pending */ }
}

/**
 * Apply a confirmed proposal: writes the overlay (source of currentDeadline)
 * and clears the proposal. Idempotent per label.
 * @param {{label:string, by:string}} p
 */
export function applyProposal(p) {
  writeFileSync(
    overlayFile(),
    JSON.stringify({ label: p.label, source: "admin-announcement", by: p.by, at: new Date().toISOString() }, null, 2)
  );
  clearProposal();
}

/** @returns {string|null} active overlay label, if any */
export function loadOverlay() {
  try {
    const f = overlayFile();
    if (!existsSync(f)) return null;
    const o = JSON.parse(readFileSync(f, "utf8"));
    return o && o.label ? o.label : null;
  } catch {
    return null;
  }
}
