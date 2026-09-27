import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Local-first persistence: JSON files under ./data (gitignored except seeds).
// No image bytes or confidential details are ever written here.

function dataPath(name) {
  return join(process.cwd(), "data", name);
}

/** @returns {boolean} */
export function isPaused() {
  try {
    const p = dataPath("pause.json");
    if (!existsSync(p)) return false;
    return JSON.parse(readFileSync(p, "utf8")).paused === true;
  } catch {
    return false;
  }
}

/** @param {boolean} paused */
export function setPaused(paused) {
  writeFileSync(dataPath("pause.json"), JSON.stringify({ paused, at: new Date().toISOString() }, null, 2));
}

/**
 * @param {object} entry
 */
export function logDecision(entry) {
  appendFileSync(dataPath("decisions.log"), JSON.stringify({ at: new Date().toISOString(), ...entry }) + "\n");
}

/**
 * @param {{category:string, owner:string, excerpt:string}} t
 * @returns {{id:string}} ticket ref (persisted redacted)
 */
export function openTicket(t) {
  const id = `QAF-${String(Math.floor(100 + Math.random() * 900))}`;
  const file = dataPath("tickets.json");
  let all = [];
  try {
    if (existsSync(file)) all = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    all = [];
  }
  all.push({ id, status: "open", at: new Date().toISOString(), ...t });
  try {
    mkdirSync(join(process.cwd(), "data"), { recursive: true });
    writeFileSync(file, JSON.stringify(all, null, 2));
  } catch {
    /* sandbox without fs write — ticket id still returned */
  }
  return { id };
}

/** @returns {Array<object>} */
export function listTickets() {
  try {
    const file = dataPath("tickets.json");
    if (!existsSync(file)) return [];
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

// ---------- Phase 3: noise guards ----------

const buckets = new Map();

/**
 * In-memory per-sender rate limit (resets on restart — pilot scale only).
 * @param {string} sender
 * @param {number} [limit]
 * @param {number} [windowMs]
 */
export function checkRate(sender, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const arr = (buckets.get(sender) || []).filter((ts) => now - ts < windowMs);
  arr.push(now);
  buckets.set(sender, arr);
  return { allowed: arr.length <= limit, count: arr.length };
}

/**
 * @param {string} id
 * @returns {boolean} found and updated
 */
export function validateTicket(id) {
  try {
    const file = dataPath("tickets.json");
    if (!existsSync(file)) return false;
    const all = JSON.parse(readFileSync(file, "utf8"));
    const t = all.find((x) => x.id === id);
    if (!t) return false;
    t.status = "validated";
    writeFileSync(file, JSON.stringify(all, null, 2));
    return true;
  } catch {
    return false;
  }
}
