import { readFileSync, existsSync, unlinkSync, writeFileSync } from "node:fs";
import { answer } from "../lib/qaf/pipeline.js";

// Zero-dependency eval: node scripts/eval.mjs [--only e01,e02]
// Checks reply contents case-insensitively; silence cases must return null.
// Deadline-governance state is reset around the run so e88+ stay deterministic.

const overlayUrl = new URL("../data/deadline.json", import.meta.url);
const proposalUrl = new URL("../data/deadline-proposal.json", import.meta.url);
let savedOverlay = null;
try {
  if (existsSync(overlayUrl)) savedOverlay = readFileSync(overlayUrl);
} catch { /* none */ }
for (const u of [overlayUrl, proposalUrl]) {
  try { unlinkSync(u); } catch { /* none */ }
}

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
    r = answer(c.input, { imageType: c.imageType, msgId: c.id, isAdmin: c.isAdmin === true, sender: c.sender });
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
if (savedOverlay) {
  try { writeFileSync(overlayUrl, savedOverlay); } catch { /* best effort */ }
} else {
  try { unlinkSync(overlayUrl); } catch { /* none */ }
}
process.exit(fails.length ? 1 : 0);
