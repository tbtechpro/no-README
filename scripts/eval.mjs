import { readFileSync } from "node:fs";
import { answer } from "../lib/qaf/pipeline.js";

// Zero-dependency eval: node scripts/eval.mjs [--only e01,e02]
// Checks reply contents case-insensitively; silence cases must return null.

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
    r = answer(c.input, { imageType: c.imageType, msgId: c.id });
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
process.exit(fails.length ? 1 : 0);
