import { readFileSync } from "node:fs";
import { join } from "node:path";

// Corpus access. ONLY approved + unexpired items are servable — drafts never answer.
// Runs under Next.js (node runtime) and plain node scripts; cwd is the repo root.

/** @typedef {{id:string,type:string,title:string,body:string,sourceLink:string|null,owner:string,effectiveFrom:string,expiresAt:string|null,version:number,status:string}} CorpusItem */

let cache = null;

/** @returns {CorpusItem[]} */
export function loadCorpus() {
  if (cache) return cache;
  const raw = readFileSync(join(process.cwd(), "data", "corpus.seed.json"), "utf8");
  cache = JSON.parse(raw);
  return cache;
}

/** @returns {CorpusItem[]} items QAF may cite */
export function servableItems() {
  const now = new Date();
  return loadCorpus().filter(
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
 * @returns {{item:CorpusItem,score:number}[]}
 */
export function searchCorpus(query, limit = 3) {
  const q = new Set(tokens(query));
  if (q.size === 0) return [];
  const scored = [];
  for (const item of servableItems()) {
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

/** @param {string} id @returns {CorpusItem|undefined} */
export function getById(id) {
  return loadCorpus().find((c) => c.id === id);
}

/**
 * Single source for the current deadline: parsed from approved c08 body
 * ("...due X unless..."). Null = not confirmed → callers must refer, never invent.
 * @returns {string|null}
 */
export function currentDeadline() {
  const c = getById("c08");
  if (!c || c.status !== "approved") return null;
  const m = c.body.match(/due\s+(.*?)\s+unless/i);
  return m ? m[1] : null;
}
