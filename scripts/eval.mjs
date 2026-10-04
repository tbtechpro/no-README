import { readFileSync } from "node:fs";
import { answer } from "../lib/qaf/pipeline.js";
import { prisma } from "../lib/qaf/db.js";

// Eval: node scripts/eval.mjs [--only=e01,e02]
// Checks reply contents case-insensitively; silence cases must return null.
// Runs against the database (SQLite locally): governance + log tables are
// reset around the run so e88+ stay deterministic without touching live rows
// beyond the run (tables are shared with dev — eval traffic is synthetic).

// Snapshot live governance rows, then reset for determinism.
const saved = {};
try {
  saved.overlay = await prisma.deadlineOverlay.findUnique({ where: { id: "active" } });
  saved.proposal = await prisma.deadlineProposal.findUnique({ where: { id: "single" } });
  saved.pause = await prisma.pauseState.findUnique({ where: { id: "global" } });
} catch (err) {
  console.error("EVAL: database unreachable — run `npm.cmd run db:push` first.");
  process.exit(2);
}
await prisma.decisionLog.deleteMany();
await prisma.ticket.deleteMany();
await prisma.deadlineProposal.deleteMany();
await prisma.deadlineOverlay.deleteMany();
await prisma.corpusStatusOverride.deleteMany();
await prisma.pauseState.deleteMany();

const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.split("=")[1].split(",")) : null;

const cases = JSON.parse(readFileSync(new URL("../data/eval-set.json", import.meta.url), "utf8"));
const low = (s) => String(s).toLowerCase();
let pass = 0;
const fails = [];

for (const c of cases) {
  if (only && !only.has(c.id)) continue;
  let r;
  try {
    r = await answer(c.input, { imageType: c.imageType, msgId: c.id, isAdmin: c.isAdmin === true, sender: c.sender });
  } catch (err) {
    fails.push({ id: c.id, reason: `threw: ${err.message}` });
    continue;
  }
  const problems = [];
  if (c.expected === "silence") {
    if (r.reply !== null) problems.push("should stay silent");
  } else if (c.expected === "brief-or-silence") {
    if (r.reply !== null && r.reply.length > 120) problems.push("too long for brief");
  } else if (r.reply === null) {
    problems.push("returned silence, expected a reply");
  } else {
    for (const m of c.mustInclude || []) if (!low(r.reply).includes(low(m))) problems.push(`missing "${m}"`);
    for (const m of c.mustNotInclude || []) if (low(r.reply).includes(low(m))) problems.push(`banned "${m}" present`);
  }
  if (problems.length === 0) pass++;
  else fails.push({ id: c.id, expected: c.expected, skill: r.skill, problems, reply: (r.reply || "").slice(0, 220) });
}

const total = only ? [...only].length : cases.length;
console.log(`\nEVAL: ${pass}/${total} passed${fails.length ? "" : " — all green"}`);
for (const f of fails) {
  console.log(`\nFAIL ${f.id} (expected ${f.expected}, got skill=${f.skill})`);
  for (const p of f.problems) console.log(`  - ${p}`);
  if (f.reply) console.log(`  > ${f.reply}`);
}
// Restore live governance rows; drop synthetic eval traffic.
await prisma.decisionLog.deleteMany();
await prisma.ticket.deleteMany();
await prisma.deadlineProposal.deleteMany();
await prisma.deadlineOverlay.deleteMany();
await prisma.corpusStatusOverride.deleteMany();
await prisma.pauseState.deleteMany();
if (saved.overlay) await prisma.deadlineOverlay.create({ data: { id: "active", label: saved.overlay.label, source: saved.overlay.source, by: saved.overlay.by } });
if (saved.proposal) await prisma.deadlineProposal.create({ data: { id: "single", label: saved.proposal.label, by: saved.proposal.by } });
if (saved.pause) await prisma.pauseState.create({ data: { id: "global", paused: saved.pause.paused } });
await prisma.$disconnect();
process.exit(fails.length ? 1 : 0);
