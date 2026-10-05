import { readFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "./db.js";
import { loadOverlay } from "./deadlines.js";

// Corpus access. ONLY approved + unexpired items are servable — drafts never answer.
// Seed content ships with the deployment (read-only file, safe on serverless);
// admin status changes persist as DB overrides merged over the seed.
// Runs under Next.js (node runtime) and plain node scripts; cwd is the repo root.

/** @typedef {{id:string,type:string,title:string,body:string,sourceLink:string|null,owner:string,effectiveFrom:string,expiresAt:string|null,version:number,status:string}} CorpusItem */

let cache = null;

/** @returns {CorpusItem[]} raw seed rows (file only) */
export function loadSeed() {
  if (cache) return cache;
  const raw = readFileSync(join(process.cwd(), "data", "corpus.seed.json"), "utf8");
  cache = JSON.parse(raw);
  return cache;
}

// Back-compat alias (pre-DB name).
export const loadCorpus = loadSeed;

/** @returns {Promise<Map<string,{status:string,version:number}>>} */
async function loadOverrides() {
  try {
    const rows = await prisma.corpusStatusOverride.findMany();
    return new Map(rows.map((r) => [r.itemId, { status: r.status, version: r.version }]));
  } catch {
    return new Map();
  }
}

/** @returns {Promise<CorpusItem[]>} seed + admin overrides applied */
export async function loadCorpusMerged() {
  const overrides = await loadOverrides();
  return loadSeed().map((c) => {
    const o = overrides.get(c.id);
    return o ? { ...c, status: o.status, version: o.version } : c;
  });
}

/**
 * Persist an admin status change (approve/draft/retire). Version keeps
 * climbing so the audit trail survives across seed edits.
 * @param {string} id
 * @param {string} status
 */
export async function setItemStatus(id, status) {
  const seed = loadSeed().find((c) => c.id === id);
  const existing = await prisma.corpusStatusOverride.findUnique({ where: { itemId: id } }).catch(() => null);
  const version = (existing?.version ?? seed?.version ?? 0) + 1;
  await prisma.corpusStatusOverride.upsert({
    where: { itemId: id },
    create: { itemId: id, status, version },
    update: { status, version },
  });
}

/** @returns {Promise<CorpusItem[]>} items QAF may cite */
export async function servableItems() {
  const now = new Date();
  return (await loadCorpusMerged()).filter(
    (c) => c.status === "approved" && (!c.expiresAt || new Date(c.expiresAt) > now)
  );
}

const STOP = new Set(
  "a,an,the,is,are,was,were,be,been,to,of,in,on,for,with,at,by,from,as,and,or,my,me,i,you,your,do,does,what,when,where,who,which,how,can,could,should,would,will,there,their,this,that,these,those,it,its,if,so,than,then,not,no,yes,please,hey,hi,hello,thanks,thank,qaf".split(",")
);

/** @param {string} t */
function stem(t) {
  if (t.length <= 4) return t;
  if (t.endsWith("ies")) return t.slice(0, -3) + "y";
  if (t.endsWith("es")) return t.slice(0, -2);
  if (t.endsWith("s")) return t.slice(0, -1);
  return t;
}

/** @param {string} text */
export function tokens(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOP.has(t))
    .map(stem);
}

/**
 * Keyword retrieval over approved items. Title matches weigh double.
 * @param {string} query
 * @param {number} [limit]
 * @returns {Promise<{item:CorpusItem,score:number}[]>}
 */
export async function searchCorpus(query, limit = 3) {
  const q = new Set(tokens(query));
  if (q.size === 0) return [];
  const scored = [];
  for (const item of await servableItems()) {
    const titleToks = new Set(tokens(item.title));
    const bodyToks = new Set(tokens(item.body));
    let score = 0;
    for (const t of q) {
      if (titleToks.has(t)) score += 2;
      else if (bodyToks.has(t)) score += 1;
    }
    if (score > 0) scored.push({ item, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/** @param {string} id @returns {Promise<CorpusItem|undefined>} */
export async function getById(id) {
  return (await loadCorpusMerged()).find((c) => c.id === id);
}

/** @typedef {{id:string,label:string,url:string,badge:string}} LinkCard */

const NO_TOPUP_SKILLS = new Set(["uncertainty", "postcheck-fail", "refusal", "boundary", "handoff"]);

/**
 * Official link/event cards for an answer. Cited link/event items always
 * attach; keyword top-up fills gaps except on uncertain/refused/handoff
 * answers (never decorate a guess or a refusal). Max 3, deduped.
 * @param {string} text user text
 * @param {string[]} [corpusIds] cited ids
 * @param {string} [skill]
 * @returns {Promise<LinkCard[]>}
 */
export async function resolveLinkCards(text, corpusIds = [], skill = "") {
  const cards = [];
  const seen = new Set();
  const push = (item) => {
    if (!item || !item.sourceLink || seen.has(item.id) || cards.length >= 3) return;
    seen.add(item.id);
    cards.push({
      id: item.id,
      label: item.title,
      url: item.sourceLink,
      badge: item.badge ?? (item.type === "event" ? "Event" : "Link"),
    });
  };
  const all = await loadCorpusMerged();
  const byId = new Map(all.map((c) => [c.id, c]));
  for (const id of corpusIds) {
    const it = byId.get(id);
    if (it && (it.type === "official-link" || it.type === "event") && it.status === "approved") push(it);
  }
  if (!NO_TOPUP_SKILLS.has(skill)) {
    const low = String(text).toLowerCase();
    const servable = new Set((await servableItems()).map((c) => c.id));
    const rules = [
      [/foundry|apply|application|join|register/, ["l01"]],
      [/stream|orientation|live|watch/, ["l02", "v01"]],
      [/lesson|learn|material|study|portal/, ["l03"]],
      [/linkedin|knowledge sharing/, ["l04", "v02"]],
      [/youtube|replay/, ["l05", "v01"]],
      [/instagram/, ["l06"]],
      [/event|session/, ["v03", "v02"]],
    ];
    for (const [re, ids] of rules) {
      if (!re.test(low)) continue;
      for (const id of ids) {
        const it = byId.get(id);
        if (it && servable.has(id)) push(it);
      }
    }
  }
  return cards;
}

/**
 * Single source for the current deadline: admin-confirmed overlay first
 * (DeadlineOverlay table), else parsed from approved c08 body ("...due X unless...").
 * Null = not confirmed → callers must refer, never invent.
 * @returns {Promise<string|null>}
 */
export async function currentDeadline() {
  try {
    const label = await loadOverlay();
    if (label) return label;
  } catch { /* no overlay — fall through to corpus */ }
  const c = await getById("c08");
  if (!c || c.status !== "approved") return null;
  const m = c.body.match(/due\s+(.*?)\s+unless/i);
  return m ? m[1] : null;
}
