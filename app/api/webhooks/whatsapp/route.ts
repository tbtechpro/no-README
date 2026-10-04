import { NextResponse } from "next/server";
import { appendFile } from "node:fs";
import { join } from "node:path";
import { isInvoked } from "@/lib/qaf/invocation";
import { answer } from "@/lib/qaf/pipeline";

// Phase 1 webhook: verification + intake + pipeline reply + outbound send.
// Outbound sends only engine-produced replies via the Meta send API.
// Send attempts are appended to data/send.log (gitignored) for sandbox visibility.

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? "";

// Meta webhook verification handshake (GET).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge") ?? "";
  if (mode === "subscribe" && token && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "verification failed" }, { status: 403 });
}

type Intake = {
  msgId: string;
  from: string;
  text: string;
  hasImage: boolean;
  invoked: boolean;
};

// Intake + answer (POST). Ack fast; reply preview returned for sandbox testing.
export async function POST(req: Request) {
  // TODO: verify X-Hub-Signature-256 with WHATSAPP_APP_SECRET before parsing.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const entry = (body as { entry?: Array<{ changes?: Array<{ value?: { messages?: Array<{ id?: string; from?: string; text?: { body?: string }; image?: object; timestamp?: string }> } }> }> }).entry?.[0];
  const msg = entry?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return NextResponse.json({ ok: true, ignored: "no-message" });
  const text = msg.text?.body ?? "";
  const intake: Intake = {
    msgId: msg.id ?? "unknown",
    from: msg.from ?? "unknown",
    text,
    hasImage: Boolean(msg.image),
    invoked: isInvoked(text),
  };
  console.log("[qaf-intake]", JSON.stringify(intake));
  // TODO Phase 1.9: download image by media ID when hasImage, then pass imageType.
  // Rate-limited per sender (5/min): burst floods go silent and get logged.
  // Admins (ADMIN_NUMBERS) can propose/confirm deadline changes; see lib/qaf/deadlines.js.
  const adminNumbers = (process.env.ADMIN_NUMBERS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const result = answer(text, { msgId: intake.msgId, sender: intake.from, enforceRate: true, isAdmin: adminNumbers.includes(intake.from) });
  console.log("[qaf-answer]", JSON.stringify({ skill: result.skill, handoff: result.handoff }));
  // Outbound: send the reply back on WhatsApp ONLY when the engine produced
  // one. Silent skills (non-invoked, rate-limited, privacy-held) send nothing.
  const sendLog = (entry: object) => {
    try {
      appendFile(join(process.cwd(), "data", "send.log"), JSON.stringify({ at: new Date().toISOString(), ...entry }) + "\n", () => {});
    } catch { /* best effort */ }
  };
  if (result.reply && intake.from && intake.from !== "unknown") {
    const token = process.env.WHATSAPP_ACCESS_TOKEN ?? "";
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";
    if (token && phoneId) {
      try {
        const res = await fetch(`https://graph.facebook.com/v25.0/${phoneId}/messages`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: intake.from,
            type: "text",
            body: result.reply,
          }),
        });
        const data = await res.json().catch(() => ({}));
        const entry = { ok: res.ok, status: res.status, id: data?.messages?.[0]?.id ?? null, error: data?.error?.message ?? null, to: intake.from, skill: result.skill };
        console.log("[qaf-send]", JSON.stringify(entry));
        sendLog(entry);
      } catch (err) {
        // Never break the 200 ack: log and keep going.
        const entry = { ok: false, error: String(err), to: intake.from, skill: result.skill };
        console.log("[qaf-send]", JSON.stringify(entry));
        sendLog(entry);
      }
    } else {
      const entry = { ok: false, error: "missing-access-token-or-phone-id", to: intake.from, skill: result.skill };
      console.log("[qaf-send]", JSON.stringify(entry));
      sendLog(entry);
    }
  } else {
    sendLog({ ok: true, skipped: "silent-skill", to: intake.from, skill: result.skill });
  }
  return NextResponse.json({ ok: true, invoked: intake.invoked, skill: result.skill, replyPreview: result.reply });
}
