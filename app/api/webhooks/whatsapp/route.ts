import { NextResponse } from "next/server";

// Phase 0.5 skeleton — verification + intake ONLY. No LLM, no replies yet.
// Full pipeline (gate → retrieval → composer → safety → sender) lands in Phase 1.

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

// Minimal invocation check (Phase 1 makes this robust: mentions, quote-replies).
export function isInvoked(text: string): boolean {
  return /(^|\W)qaf(\W|$)/i.test(text);
}

// Intake probe (POST). Ack fast, log, reply nothing — silence is correct for now.
export async function POST(req: Request) {
  // TODO Phase 1: verify X-Hub-Signature-256 with WHATSAPP_APP_SECRET before parsing.
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
  // TODO Phase 1: persist to DecisionLog + route to skills. For sandbox we just prove intake works.
  console.log("[qaf-intake]", JSON.stringify(intake));
  return NextResponse.json({ ok: true, invoked: intake.invoked });
}
