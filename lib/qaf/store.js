import { prisma } from "./db.js";

// Runtime persistence on Prisma (SQLite locally, Postgres hosted).
// No image bytes or confidential details are ever written here.

/** @returns {Promise<boolean>} */
export async function isPaused() {
  try {
    const s = await prisma.pauseState.findUnique({ where: { id: "global" } });
    return s?.paused === true;
  } catch {
    return false;
  }
}

/** @param {boolean} paused */
export async function setPaused(paused) {
  await prisma.pauseState.upsert({
    where: { id: "global" },
    create: { id: "global", paused },
    update: { paused },
  });
}

/**
 * @param {object} entry
 */
export async function logDecision(entry) {
  const { msgId, invoked, skill, corpusIds, handoff, owner } = entry;
  try {
    await prisma.decisionLog.create({
      data: {
        msgId: String(msgId ?? `m-${Date.now()}`),
        invoked: invoked === true,
        skill: skill ?? null,
        corpusIds: JSON.stringify(corpusIds ?? []),
        handoff: handoff === true,
        owner: owner ?? null,
      },
    });
  } catch (err) {
    // Duplicate delivery of an already-logged msgId: keep the first row.
    if (err?.code !== "P2002") throw err;
  }
}

const ticketId = () => `QAF-${String(Math.floor(100 + Math.random() * 900))}`;

/**
 * @param {{category:string, owner:string, excerpt:string}} t
 * @returns {Promise<{id:string}>} ticket ref (persisted redacted)
 */
export async function openTicket(t) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const row = await prisma.ticket.create({
        data: {
          id: ticketId(),
          category: t.category,
          owner: t.owner,
          redactedExcerpt: String(t.excerpt ?? "").slice(0, 140),
        },
      });
      return { id: row.id };
    } catch (err) {
      if (err?.code !== "P2002") throw err;
    }
  }
  // Extremely unlikely triple collision — return an id without persisting.
  return { id: ticketId() };
}

/** @returns {Promise<Array<object>>} */
export async function listTickets() {
  try {
    return await prisma.ticket.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

// ---------- Phase 3: noise guards ----------

const buckets = new Map();

/**
 * In-memory per-sender rate limit (resets on restart / per serverless
 * instance — pilot scale only; move to DB/Upstash for multi-instance).
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
 * @returns {Promise<boolean>} found and updated
 */
export async function validateTicket(id) {
  try {
    const t = await prisma.ticket.findFirst({ where: { id, category: "spotlight" } });
    if (!t) return false;
    await prisma.ticket.update({ where: { id: t.id }, data: { status: "validated" } });
    return true;
  } catch {
    return false;
  }
}
