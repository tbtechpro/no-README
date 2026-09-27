import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { redirect } from "next/navigation";

// Admin console MVP (local only, no login yet — auth arrives with real deployment).
// Corpus browser + pause switch + ticket queue. All data local.

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

      <h2>Review queue — {open.length} open</h2>
      {open.length === 0 ? <p>Queue empty. Handoffs, corrections and uncertainty referrals land here.</p> : (
        <ul>{open.map((t) => <li key={t.id}>{t.id} · {t.category} → {t.owner} · {t.at}</li>)}</ul>
      )}
      <p style={{ color: "#5F6B6B", fontSize: 12 }}>Eval: run <code>node scripts/eval.mjs</code> locally. Full publish/retire editing lands in Phase 2.</p>
    </main>
  );
}
