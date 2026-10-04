import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { redirect } from "next/navigation";
import { earlyFinal } from "@/lib/qaf/reminders";
import { computeMetrics } from "@/lib/qaf/metrics";
import { currentDeadline } from "@/lib/qaf/corpus";
import { loadProposal, applyProposal } from "@/lib/qaf/deadlines";

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

async function validateSpotlight(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const file = dataFile("tickets.json");
  if (!existsSync(file)) redirect("/admin");
  const all = JSON.parse(readFileSync(file, "utf8")) as Ticket[];
  const t = all.find((x) => x.id === id);
  if (t && t.category === "spotlight") t.status = "validated";
  writeFileSync(file, JSON.stringify(all, null, 2));
  redirect("/admin");
}

async function approveProposal() {
  "use server";
  const p = loadProposal();
  if (p) applyProposal(p);
  redirect("/admin");
}

type CorpusSeedItem = CorpusItem & { body: string; sourceLink: string | null; effectiveFrom: string; expiresAt: string | null; version: number };

async function setCorpusStatus(formData: FormData) {  "use server";
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["approved", "draft", "retired"].includes(status)) redirect("/admin");
  const file = dataFile("corpus.seed.json");
  const all = JSON.parse(readFileSync(file, "utf8")) as CorpusSeedItem[];
  const item = all.find((x) => x.id === id);
  if (item) {
    item.status = status;
    item.version += 1;
    writeFileSync(file, JSON.stringify(all, null, 2));
  }
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
  const m = computeMetrics();
  const activeDeadline = currentDeadline();
  const proposal = loadProposal();

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
          <th>ID</th><th>Title</th><th>Owner</th><th>Status</th><th>Controls</th>
        </tr></thead>
        <tbody>
          {corpus.map((c) => (
            <tr key={c.id} style={{ borderBottom: "1px solid #E2E8E8" }}>
              <td>{c.id}</td><td>{c.title}</td><td>{c.owner}</td>
              <td style={{ color: c.status === "approved" ? "#1F7A3D" : "#8A5A00", fontWeight: 700 }}>{c.status}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                {c.status !== "approved" && (
                  <form action={setCorpusStatus} style={{ display: "inline", marginRight: 4 }}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button type="submit" style={{ background: "#1F7A3D", color: "#fff", border: "none", borderRadius: 6, padding: "2px 10px", cursor: "pointer" }}>Approve</button>
                  </form>
                )}
                {c.status === "approved" && (
                  <form action={setCorpusStatus} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="status" value="retired" />
                    <button type="submit" style={{ background: "#fff", color: "#B3261E", border: "1.5px solid #B3261E", borderRadius: 6, padding: "2px 10px", cursor: "pointer" }}>Retire</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Metrics — pilot baseline (local decision log)</h2>
      <p>Answered: {m.invoked} · Silent (not invoked): {m.silent} · Handoffs: {m.handoffs} ({m.handoffRate}%) ·
        Rate-limited: {m.rateLimited} · Post-check blocks: {m.postcheckFails} ·
        Tickets: {m.tickets} ({m.openTickets} open).</p>
      <p style={{ color: "#5F6B6B", fontSize: 12 }}>Traffic is synthetic (eval runs) until the sandbox goes live — then these become the real Sec-14 baseline.</p>

      <h2>Deadline + reminders</h2>
      <p>Weekly assessment due: <b>{fmt(deadline)}</b> (Sundays 23:59 WAT).<br />
        Active deadline on file: <b>{activeDeadline ?? "none confirmed"}</b><br />
        Early reminder: {fmt(early)} · Final reminder: {fmt(final)} (admin-created only).</p>
      <h3>Deadline governance</h3>
      {proposal ? (
        <div>
          <p>Pending proposal: <b>{proposal.label}</b> (by {proposal.by}, {proposal.at})</p>
          <form action={approveProposal}>
            <button type="submit" style={{ background: "#0E6B6B", color: "#fff", border: "none", borderRadius: 6, padding: "10px 18px", fontWeight: 700, cursor: "pointer" }}>
              Approve + apply
            </button>
          </form>
        </div>
      ) : <p>No pending deadline proposal. Admin announcements in the group create one automatically; nothing applies without confirmation.</p>}

      <h2>Patterns — confusion themes</h2>
      {patterns.size === 0 ? <p>No open tickets yet — patterns appear as handoffs land.</p> : (
        <ul>{[...patterns.entries()].map(([cat, n]) => <li key={cat}>{cat}: {n} open</li>)}</ul>
      )}

      <h2>Spotlight — peer nominations awaiting validation</h2>
      {open.filter((t) => t.category === "spotlight").length === 0 ? <p>No nominations pending. Recognition is confirmed here, never by votes.</p> : (
        <ul>{open.filter((t) => t.category === "spotlight").map((t) => (
          <li key={t.id}>{t.id} · {t.at}{" "}
            <form action={validateSpotlight} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={t.id} />
              <button type="submit" style={{ background: "#1F7A3D", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>Validate</button>
            </form>
          </li>))}</ul>
      )}

      <h2>Review queue — {open.length} open</h2>
      {open.length === 0 ? <p>Queue empty. Handoffs, corrections and uncertainty referrals land here.</p> : (
        <ul>{open.map((t) => <li key={t.id}>{t.id} · {t.category} → {t.owner} · {t.at}</li>)}</ul>
      )}
      <p style={{ color: "#5F6B6B", fontSize: 12 }}>Eval: run <code>node scripts/eval.mjs</code> locally (73 cases). Publish/retire editing + fresh-sweep view land in Phase 4.</p>
    </main>
  );
}
