import { prisma } from "./db.js";

// Metrics from the decision log + ticket tables (PRD Sec 14, pilot baseline).
// NOTE: current log traffic is synthetic (eval runs) until the sandbox goes live.

/** @returns {Promise<Array<object>>} */
export async function loadDecisions() {
  try {
    return await prisma.decisionLog.findMany({ orderBy: { createdAt: "desc" }, take: 5000 });
  } catch {
    return [];
  }
}

/** @returns {Promise<Array<object>>} */
export async function loadTickets() {
  try {
    return await prisma.ticket.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export async function computeMetrics() {
  const rows = await loadDecisions();
  const invoked = rows.filter((r) => r.invoked);
  const bySkill = {};
  for (const r of invoked) bySkill[r.skill] = (bySkill[r.skill] || 0) + 1;
  const handoffs = invoked.filter((r) => r.handoff).length;
  const silent = rows.filter((r) => !r.invoked).length;
  const tickets = await loadTickets();
  const byCategory = {};
  for (const t of tickets) byCategory[t.category] = (byCategory[t.category] || 0) + 1;
  return {
    total: rows.length,
    invoked: invoked.length,
    silent,
    bySkill,
    handoffs,
    handoffRate: invoked.length ? Math.round((handoffs / invoked.length) * 100) : 0,
    rateLimited: bySkill["rate-limited"] || 0,
    postcheckFails: bySkill["postcheck-fail"] || 0,
    tickets: tickets.length,
    openTickets: tickets.filter((t) => t.status === "open").length,
    byCategory,
  };
}
