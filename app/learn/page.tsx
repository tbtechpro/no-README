import { currentDeadline } from "@/lib/qaf/corpus";

// Learn & Build path: lesson → build → submit → Demo Day, wired to the
// Foundry curriculum and the live confirmed deadline.
export const dynamic = "force-dynamic";

const STEPS = [
  { n: "1", title: "Prompt engineering", body: "Talk to AI precisely: roles, constraints, examples. The first Foundry skill — everything else builds on it.", url: "https://learn.qubators.org/", action: "Start lesson" },
  { n: "2", title: "AI workflows + automation", body: "Chain prompts into workflows that do real work while you sleep.", url: "https://learn.qubators.org/", action: "Continue" },
  { n: "3", title: "Ship a prototype", body: "One working thing beats ten perfect plans. Test it with one real user.", url: "https://www.qubators.org/aifoundry", action: "Build guide" },
  { n: "4", title: "Submit weekly", body: "Complete every field, confirm it no longer shows Draft, submit before the deadline.", url: null, action: "" },
];

export default async function Learn() {
  const dl = await currentDeadline();
  return (
    <main style={{ maxWidth: 560, margin: "0 auto", minHeight: "100vh", background: "#FAF7F2", fontFamily: "Segoe UI, system-ui, sans-serif" }}>
      <header style={{ background: "#1E1B4B", color: "#fff", padding: "14px 16px", position: "sticky", top: 0 }}>
        <div style={{ fontWeight: 800 }}>QAF <span style={{ color: "#F59E0B" }}>Learn &amp; Build</span></div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>
          <a href="/" style={{ color: "#fff", marginRight: 12 }}>Ask</a>
          <a href="/events" style={{ color: "#fff", marginRight: 12 }}>Events</a>
          <a href="/reminders" style={{ color: "#fff", marginRight: 12 }}>Reminders</a>
          <a href="/admin" style={{ color: "#fff" }}>Admin</a>
        </div>
      </header>
      <div style={{ padding: 16 }}>
        <div style={{ background: "#1E1B4B", color: "#fff", borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>This week's deliverable closes in</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#F59E0B" }}>{dl ?? "date to be confirmed"}</div>
        </div>
        {STEPS.map((s) => (
          <div key={s.n} style={{ background: "#fff", border: "1px solid #E7E2D8", borderRadius: 12, padding: 14, marginBottom: 10, display: "flex", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1E1B4B", color: "#F59E0B", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.n}</div>
            <div>
              <div style={{ fontWeight: 800, color: "#1E1B4B" }}>{s.title}</div>
              <p style={{ fontSize: 13, color: "#232136", margin: "4px 0 8px" }}>{s.body}</p>
              {s.url && (
                <a href={s.url} target="_blank" rel="noreferrer" style={{ display: "inline-block", background: "#F59E0B", color: "#fff", borderRadius: 10, padding: "8px 16px", fontWeight: 800, textDecoration: "none", fontSize: 13 }}>
                  {s.action}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      <footer style={{ fontSize: 11, color: "#6B6A85", textAlign: "center", padding: "8px 16px 20px" }}>
        Stuck anywhere? <a href="/" style={{ color: "#1E1B4B", fontWeight: 700 }}>Ask QAF</a> — lesson, idea, or build.
      </footer>
    </main>
  );
}
