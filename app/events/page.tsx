import { listEvents } from "@/lib/qaf/events";

// Events feed: Upcoming → Live now → Replay. Data-driven from event corpus
// items; admin publishing without deploys arrives with the EventItem model.
export const dynamic = "force-dynamic";

const pill = (status: string) =>
  status === "live"
    ? { background: "#D9F2E3", color: "#14532D", label: "● LIVE NOW" }
    : status === "replay"
      ? { background: "#E0E7FF", color: "#3730A3", label: "REPLAY" }
      : { background: "#FEF3C7", color: "#92400E", label: "UPCOMING" };

export default async function Events() {
  const events = await listEvents();
  return (
    <main style={{ maxWidth: 560, margin: "0 auto", minHeight: "100vh", background: "#FAF7F2", fontFamily: "Segoe UI, system-ui, sans-serif" }}>
      <header style={{ background: "#1E1B4B", color: "#fff", padding: "14px 16px", position: "sticky", top: 0 }}>
        <div style={{ fontWeight: 800 }}>QAF <span style={{ color: "#F59E0B" }}>Events</span></div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>
          <a href="/" style={{ color: "#fff", marginRight: 12 }}>Ask</a>
          <a href="/events" style={{ color: "#F59E0B", marginRight: 12 }}>Events</a>
          <a href="/learn" style={{ color: "#fff", marginRight: 12 }}>Learn</a>
          <a href="/admin" style={{ color: "#fff" }}>Admin</a>
        </div>
      </header>
      <div style={{ padding: 16 }}>
        {events.length === 0 && <p>No events on file yet — check back soon.</p>}
        {events.map((e) => {
          const p = pill(e.status);
          return (
            <div key={e.id} style={{ background: "#fff", border: "1px solid #E7E2D8", borderLeft: "4px solid #F59E0B", borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <span style={{ display: "inline-block", fontSize: 11, fontWeight: 800, background: p.background, color: p.color, borderRadius: 20, padding: "2px 10px" }}>{p.label}</span>
              <div style={{ fontWeight: 800, color: "#1E1B4B", marginTop: 6 }}>{e.title}</div>
              {e.channel && <div style={{ fontSize: 12, color: "#6B6A85" }}>{e.channel}</div>}
              <p style={{ fontSize: 13, color: "#232136" }}>{e.body}</p>
              {e.actionUrl && (
                <a href={e.actionUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", background: "#F59E0B", color: "#fff", borderRadius: 10, padding: "8px 16px", fontWeight: 800, textDecoration: "none", fontSize: 13 }}>
                  {e.actionLabel}
                </a>
              )}
            </div>
          );
        })}
      </div>
      <footer style={{ fontSize: 11, color: "#6B6A85", textAlign: "center", padding: "8px 16px 20px" }}>
        Dates come from confirmed info only — unconfirmed sessions are never listed. QAF is an AI assistant, not a human.
      </footer>
    </main>
  );
}
