"use client";

import { useState, useRef, useEffect } from "react";

type LinkCard = { id: string; label: string; url: string; badge: string };
type Msg = { who: "you" | "qaf"; text: string; handoff?: boolean; linkCards?: LinkCard[] };

const CHIPS = [
  "When is the weekly assessment due?",
  "What should I do next?",
  "My submission still shows Draft",
];

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      who: "qaf",
      text: "Hello! I'm QAF, the Qubators AI assistant. Ask me about deadlines, submissions, lessons, or your next step — I answer only from confirmed cohort info, and I never guess.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    setInput("");
    setMsgs((m) => [...m, { who: "you", text: clean }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean }),
      });
      const data = await res.json();
      setMsgs((m) => [
        ...m,
        {
          who: "qaf",
          text: data.reply ?? "Hmm, I stayed quiet on that one — try rephrasing, or start with what you need (deadline, submission, lesson, idea).",
          handoff: data.handoff === true,
          linkCards: Array.isArray(data.linkCards) ? data.linkCards : [],
        },
      ]);
    } catch {
      setMsgs((m) => [...m, { who: "qaf", text: "I couldn't reach the engine just now — check your connection and try again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f4f6f5" }}>
      <header style={{ background: "#0E6B6B", color: "#fff", padding: "14px 16px", position: "sticky", top: 0 }}>
        <div style={{ fontWeight: 800 }}>QAF Support AI</div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>
          <a href="/" style={{ color: "#fff", marginRight: 12 }}>Ask</a>
          <a href="/events" style={{ color: "#fff", marginRight: 12 }}>Events</a>
          <a href="/reminders" style={{ color: "#fff", marginRight: 12 }}>Reminders</a>
          <a href="/learn" style={{ color: "#fff", marginRight: 12 }}>Learn</a>
          <a href="/admin" style={{ color: "#fff" }}>Admin</a>
        </div>
      </header>

      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.who === "you" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
            <div
              style={{
                background: m.who === "you" ? "#0E6B6B" : "#fff",
                color: m.who === "you" ? "#fff" : "#111",
                borderRadius: 14,
                padding: "10px 14px",
                boxShadow: "0 1px 2px rgba(0,0,0,.08)",
                whiteSpace: "pre-wrap",
              }}
            >
              {m.who === "qaf" && <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>QAF (AI)</div>}
              {m.text}
            </div>
            {m.who === "qaf" && (m.linkCards ?? []).map((c) => (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                style={{ display: "block", marginTop: 6, background: "#fff", border: "1px solid #E7E2D8", borderLeft: "4px solid #F59E0B", borderRadius: 10, padding: "8px 10px", textDecoration: "none" }}
              >
                <span style={{ display: "inline-block", fontSize: 10, fontWeight: 800, background: "#F1EDFF", color: "#4C1D95", borderRadius: 12, padding: "1px 8px", marginBottom: 4 }}>{c.badge}</span>
                <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1E1B4B" }}>{c.label}</span>
                <span style={{ display: "block", fontSize: 11, color: "#6B6A85" }}>{c.url.replace(/^https?:\/\//, "").split("/")[0]}</span>
              </a>
            ))}
            {m.handoff && <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>✓ Flagged for a human admin</div>}
          </div>
        ))}
        {busy && <div style={{ color: "#666", fontSize: 13 }}>QAF is typing…</div>}
        <div ref={bottom} />
      </div>

      <div style={{ padding: "8px 12px 0", display: "flex", gap: 8, flexWrap: "wrap", background: "#f4f6f5" }}>
        {CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => send(c)}
            disabled={busy}
            style={{ border: "1px solid #0E6B6B", color: "#0E6B6B", background: "#fff", borderRadius: 20, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}
          >
            {c}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        style={{ display: "flex", gap: 8, padding: 12, background: "#fff", borderTop: "1px solid #ddd", position: "sticky", bottom: 0 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask QAF anything…"
          style={{ flex: 1, border: "1px solid #ccc", borderRadius: 20, padding: "10px 14px", fontSize: 14 }}
        />
        <button
          type="submit"
          disabled={busy}
          style={{ background: "#0E6B6B", color: "#fff", border: "none", borderRadius: 20, padding: "10px 18px", fontWeight: 700, cursor: "pointer" }}
        >
          Send
        </button>
      </form>

      <footer style={{ fontSize: 11, color: "#777", textAlign: "center", padding: "8px 16px 14px", background: "#fff" }}>
        QAF is an AI assistant, not a human. For personal or sensitive matters, contact the programme admin privately. · <a href="/admin">Admin</a>
      </footer>
    </main>
  );
}
