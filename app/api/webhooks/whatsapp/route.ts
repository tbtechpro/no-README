import { NextResponse } from "next/server";
import { isInvoked } from "@/lib/qaf/invocation";
import { answer } from "@/lib/qaf/pipeline";

// Phase 1 webhook: verification + intake + pipeline reply preview.
// Outbound sending is still stubbed — sandbox needs WHATSAPP_ACCESS_TOKEN
// before anything leaves this server (see doc/QAF-Sandbox-Setup.md).

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
  const result = answer(text, { msgId: intake.msgId });
  console.log("[qaf-answer]", JSON.stringify({ skill: result.skill, handoff: result.handoff }));
  // TODO: POST reply to Meta send API when WHATSAPP_ACCESS_TOKEN is set. Until
  // then, silence on the wire is correct — preview only.
  return NextResponse.json({ ok: true, invoked: intake.invoked, skill: result.skill, replyPreview: result.reply });
}
