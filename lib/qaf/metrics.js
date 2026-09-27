import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Metrics from the local decision log + ticket file (PRD Sec 14, pilot baseline).
// NOTE: current log traffic is synthetic (eval runs) until the sandbox goes live.

function dataFile(name) {
  return join(process.cwd(), "data", name);
}

/** @returns {Array<object>} */
export function loadDecisions() {
  try {
    const f = dataFile("decisions.log");
    if (!existsSync(f)) return [];
    return readFileSync(f, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

/** @returns {Array<object>} */
export function loadTickets() {
  try {
    const f = dataFile("tickets.json");
    if (!existsSync(f)) return [];
    return JSON.parse(readFileSync(f, "utf8"));
  } catch {
    return [];
  }
}

export function computeMetrics() {
  const rows = loadDecisions();
  const invoked = rows.filter((r) => r.invoked);
  const bySkill = {};
  for (const r of invoked) bySkill[r.skill] = (bySkill[r.skill] || 0) + 1;
  const handoffs = invoked.filter((r) => r.handoff).length;
  const silent = rows.filter((r) => !r.invoked).length;
  const tickets = loadTickets();
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
