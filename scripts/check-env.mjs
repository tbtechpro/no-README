// Pre-deploy env diagnostic: prints the SHAPE of DATABASE_URL / DIRECT_URL
// (presence, length, scheme, pooler flag, stray quotes/whitespace) without
// ever printing secret values. Fails the build with a precise message.

const problems = [];

for (const name of ["DATABASE_URL", "DIRECT_URL"]) {
  const raw = process.env[name] ?? "";
  const v = raw.trim();
  const info = {
    present: raw.length > 0,
    length: v.length,
    scheme: v.includes("://") ? v.split("://")[0] : "(missing — value is not a URL)",
    hasPooler: v.includes("-pooler"),
    wrappedInQuotes: /^['"]/.test(raw) || /['"]$/.test(raw),
    leadingTrailingWhitespace: raw !== v,
  };
  console.log(`ENV ${name}: ${JSON.stringify(info)}`);
  if (!info.present) problems.push(`${name} is empty or missing — paste the Neon string.`);
  else if (info.scheme !== "postgresql")
    problems.push(
      `${name} does not start with postgresql:// — re-paste the full string with no quotes or spaces around it.`
    );
  else if (info.wrappedInQuotes || info.leadingTrailingWhitespace)
    problems.push(`${name} has stray quotes/whitespace — clear the field and paste the bare string.`);
}

const db = (process.env.DATABASE_URL ?? "").trim();
const direct = (process.env.DIRECT_URL ?? "").trim();
if (db && direct && db === direct)
  console.log("ENV note: DATABASE_URL equals DIRECT_URL — runtime should use the -pooler string; schema push may still work.");
if (db && !db.includes("-pooler"))
  console.log("ENV note: DATABASE_URL has no -pooler — runtime works but misses connection pooling; prefer the pooled string here.");
if (direct && direct.includes("-pooler"))
  problems.push("DIRECT_URL contains -pooler — toggle pooling OFF in Neon and copy that string instead (schema pushes need the direct host).");

if (problems.length) {
  console.error("\nENV CHECK FAILED:");
  for (const p of problems) console.error(`  x ${p}`);
  process.exit(1);
}
console.log("ENV CHECK OK");
