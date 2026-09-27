import { readFileSync } from "node:fs";

// Freshness sweep: ensures superseded or placeholder content can never answer.
// FAILS (exit 1) on: approved items past expiry, TBD sources on approved items,
// PLACEHOLDER text in approved bodies. WARNS on: drafts aging, pending links.
// Run: node scripts/freshness.mjs (also via `npm.cmd run check`).

const corpus = JSON.parse(readFileSync(new URL("../data/corpus.seed.json", import.meta.url), "utf8"));
const now = new Date();
const fails = [];
const warns = [];

for (const c of corpus) {
  if (c.status === "approved") {
    if (c.expiresAt && new Date(c.expiresAt) <= now)
      fails.push(`${c.id}: approved but expired ${c.expiresAt} — retire or extend`);
    if (/^TBD-/i.test(c.sourceLink || ""))
      fails.push(`${c.id}: approved with TBD source — confirm or demote to draft`);
    if (/PLACEHOLDER/i.test(c.body))
      fails.push(`${c.id}: approved body contains PLACEHOLDER`);
  }
  if (c.status === "draft") warns.push(`${c.id}: draft — needs owner sign-off before serving`);
  if (/pending/i.test(c.sourceLink || "")) warns.push(`${c.id}: source link pending admin`);
}

if (warns.length) {
  console.log("WARNINGS:");
  for (const w of warns) console.log(`  ! ${w}`);
}
if (fails.length) {
  console.log("FAILURES:");
  for (const f of fails) console.log(`  x ${f}`);
  process.exit(1);
}
const approved = corpus.filter((c) => c.status === "approved").length;
console.log(`FRESHNESS OK: ${approved}/${corpus.length} approved, 0 blocking issues.`);
