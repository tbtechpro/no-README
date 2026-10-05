"use client";

import { useState, useEffect, useCallback } from "react";

type Trigger = { id: string; title: string; blurb: string; on: boolean };
type InboxItem = { id: string; title: string; body: string; url: string | null; read: boolean; createdAt: string };

const keyOf = () => {
  let k = "";
  try {
    k = localStorage.getItem("qaf-user") ?? "";
    if (!k) {
      k = "u-" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("qaf-user", k);
    }
  } catch {
    k = "u-anon";
  }
  return k;
};

export default function Reminders() {
  const [userKey, setUserKey] = useState("");
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [pushState, setPushState] = useState("unknown");

  const load = useCallback(async (k: string) => {
    const t = await fetch(`/api/reminders/triggers?userKey=${encodeURIComponent(k)}`).then((r) => r.json()).catch(() => ({ triggers: [] }));
    setTriggers(t.triggers ?? []);
    const m = await fetch(`/api/reminders/inbox?userKey=${encodeURIComponent(k)}`).then((r) => r.json()).catch(() => ({ items: [] }));
    setInbox(m.items ?? []);
  }, []);

  useEffect(() => {
    const k = keyOf();
    setUserKey(k);
    load(k);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, [load]);

  async function toggle(id: string, on: boolean) {
    await fetch("/api/reminders/triggers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userKey, trigger: id, on }),
    }).catch(() => {});
    load(userKey);
  }

  async function markAll() {
    for (const item of inbox.filter((i) => !i.read)) {
      await fetch("/api/reminders/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userKey, id: item.id }),
      }).catch(() => {});
    }
    load(userKey);
  }

  async function enablePush() {
    try {
      const v = await fetch("/api/reminders/push").then((r) => r.json());
      if (!v.publicKey) {
        setPushState("unavailable");
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setPushState("denied");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: v.publicKey,
      });
      await fetch("/api/reminders/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userKey, subscription: sub.toJSON() }),
      });
      setPushState("on");
    } catch {
      setPushState("failed");
    }
  }

  const unread = inbox.filter((i) => !i.read).length;

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", minHeight: "100vh", background: "#FAF7F2", fontFamily: "Segoe UI, system-ui, sans-serif" }}>
      <header style={{ background: "#1E1B4B", color: "#fff", padding: "14px 16px", position: "sticky", top: 0 }}>
        <div style={{ fontWeight: 800 }}>QAF <span style={{ color: "#F59E0B" }}>Reminders</span></div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>
          <a href="/" style={{ color: "#fff", marginRight: 12 }}>Ask</a>
          <a href="/events" style={{ color: "#fff", marginRight: 12 }}>Events</a>
          <a href="/reminders" style={{ color: "#F59E0B", marginRight: 12 }}>Reminders</a>
          <a href="/learn" style={{ color: "#fff", marginRight: 12 }}>Learn</a>
          <a href="/admin" style={{ color: "#fff" }}>Admin</a>
        </div>
      </header>
      <div style={{ padding: 16 }}>
        <div style={{ background: "#fff", border: "1px solid #E7E2D8", borderRadius: 12, padding: 14 }}>
          <div style={{ fontWeight: 800, color: "#1E1B4B" }}>Push notifications: {pushState === "on" ? "on ✓" : pushState}</div>
          <p style={{ fontSize: 13, color: "#6B6A85" }}>Get nudges even with the site closed. Denied or off? The inbox below still catches everything.</p>
          {pushState !== "on" && (
            <button onClick={enablePush} style={{ background: "#F59E0B", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 800, cursor: "pointer" }}>
              Enable push
            </button>
          )}
        </div>

        <h3 style={{ color: "#1E1B4B" }}>Never-miss triggers</h3>
        {triggers.map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #E7E2D8", borderRadius: 12, padding: 12, marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{t.title}</div>
              <div style={{ fontSize: 12, color: "#6B6A85" }}>{t.blurb}</div>
            </div>
            <button
              onClick={() => toggle(t.id, !t.on)}
              style={{ width: 46, height: 26, borderRadius: 20, border: "none", cursor: "pointer", background: t.on ? "#1F7A3D" : "#D1D5DB", position: "relative" }}
              aria-label={t.title}
            >
              <span style={{ position: "absolute", top: 3, left: t.on ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff" }} />
            </button>
          </div>
        ))}

        <h3 style={{ color: "#1E1B4B" }}>Inbox {unread > 0 && <span style={{ fontSize: 11, background: "#FEF3C7", color: "#92400E", borderRadius: 20, padding: "2px 10px" }}>{unread} unread</span>}</h3>
        {inbox.length === 0 && <p style={{ fontSize: 13, color: "#6B6A85" }}>Empty — fired reminders land here.</p>}
        {inbox.map((i) => (
          <div key={i.id} style={{ background: i.read ? "#F6F4EE" : "#fff", border: "1px solid #E7E2D8", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{i.title}</div>
            <div style={{ fontSize: 13 }}>{i.body}</div>
            {i.url && <a href={i.url} style={{ fontSize: 12, color: "#1E1B4B", fontWeight: 700 }}>Open →</a>}
          </div>
        ))}
        {unread > 0 && (
          <button onClick={markAll} style={{ background: "#fff", border: "1px solid #1E1B4B", color: "#1E1B4B", borderRadius: 10, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>
            Mark all read
          </button>
        )}
      </div>
    </main>
  );
}
