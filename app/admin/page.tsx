import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { redirect } from "next/navigation";
import { earlyFinal } from "@/lib/qaf/reminders";

// Admin console (local only, no login yet — auth arrives with real deployment).
// Corpus browser + pause switch + ticket queue + patterns + deadline/reminders.

// Next Sunday 23:59 WAT (UTC+1) from now.
function nextSundayDeadline(from = new Date()): Date {
  const d = new Date(from);
  const add = (7 - d.getUTCDay()) % 7;
  d.setUTCDate(d.getUTCDate() + add);
  d.setUTCHours(22, 59, 0, 0); // 23:59 WAT
  if (d.getTime() <= from.getTime()) d.setUTCDate(d.getUTCDate() + 7);
  return d;
}

function dataFile(name: string) {
  return join(process.cwd(), "data", name);
}

function readJson<T>(name: string, fallback: T): T {
  try {
    const f = dataFile(name);
    if (!existsSync(f)) return fallback;
    return JSON.parse(readFileSync(f, "utf8")) as T;
  } catch {
    return fallback;
  }
}

type CorpusItem = { id: string; type: string; title: string; body: string; owner: string; status: string };
type Ticket = { id: string; category: string; owner: string; status: string; at: string };

async function togglePause() {
  "use server";
  const cur = readJson<{ paused: boolean }>("pause.json", { paused: false });
  writeFileSync(dataFile("pause.json"), JSON.stringify({ paused: !cur.paused, at: new Date().toISOString() }, null, 2));
  redirect("/admin");
}

export default function Admin() {
  const corpus = readJson<CorpusItem[]>("corpus.seed.json", []);
  const tickets = readJson<Ticket[]>("tickets.json", []);
  const paused = readJson<{ paused: boolean }>("pause.json", { paused: false }).paused;
  const approved = corpus.filter((c) => c.status === "approved").length;
  const open = tickets.filter((t) => t.status === "open");
  const patterns = new Map<string, number>();
  for (const t of open) patterns.set(t.category, (patterns.get(t.category) ?? 0) + 1);
  const deadline = nextSundayDeadline();
  const { early, final } = earlyFinal(deadline);
  const fmt = (d: Date) => d.toUTCString();

  return (
    <main style={{ maxWidth: 900, margin: "32px auto", padding: "0 24px", lineHeight: 1.5, fontFamily: "Segoe UI, system-ui, sans-serif" }}>
      <h1>QAF Admin (local)</h1>
      {paused && (
        <p style={{ background: "#B3261E", color: "#fff", padding: 12, borderRadius: 8, fontWeight: 700 }}>
          QAF PAUSED — responses blocked except corrections.
        </p>
      )}
      <form action={togglePause}>
        <button type="submit" style={{ background: paused ? "#1F7A3D" : "#B3261E", color: "#fff", border: "none", borderRadius: 6, padding: "10px 18px", fontWeight: 700, cursor: "pointer" }}>
          {paused ? "Resume QAF" : "Pause QAF"}
        </button>
      </form>

      <h2>Corpus — {approved} approved / {corpus.length} total</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead><tr style={{ textAlign: "left", borderBottom: "2px solid #0E6B6B" }}>
          <th>ID</th><th>Title</th><th>Owner</th><th>Status</th>
        </tr></thead>
        <tbody>
          {corpus.map((c) => (
            <tr key={c.id} style={{ borderBottom: "1px solid #E2E8E8" }}>
              <td>{c.id}</td><td>{c.title}</td><td>{c.owner}</td>
              <td style={{ color: c.status === "approved" ? "#1F7A3D" : "#8A5A00", fontWeight: 700 }}>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Deadline + reminders</h2>
      <p>Weekly assessment due: <b>{fmt(deadline)}</b> (Sundays 23:59 WAT).<br />
        Early reminder: {fmt(early)} · Final reminder: {fmt(final)} (admin-created only).</p>

      <h2>Patterns — confusion themes</h2>
      {patterns.size === 0 ? <p>No open tickets yet — patterns appear as handoffs land.</p> : (
        <ul>{[...patterns.entries()].map(([cat, n]) => <li key={cat}>{cat}: {n} open</li>)}</ul>
      )}

      <h2>Review queue — {open.length} open</h2>
      {open.length === 0 ? <p>Queue empty. Handoffs, corrections and uncertainty referrals land here.</p> : (
        <ul>{open.map((t) => <li key={t.id}>{t.id} · {t.category} → {t.owner} · {t.at}</li>)}</ul>
      )}
      <p style={{ color: "#5F6B6B", fontSize: 12 }}>Eval: run <code>node scripts/eval.mjs</code> locally (73 cases). Publish/retire editing + fresh-sweep view land in Phase 4.</p>
    </main>
  );
}
