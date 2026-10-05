import { NextResponse } from "next/server";
import { answer } from "@/lib/qaf/pipeline";

// Web chat API: every message here is directed at QAF by construction
// (the user opened QAF's chat page), so isReplyToQaf bypasses the
// WhatsApp invocation gate. No rate-limit on web for the local pilot;
// silence-capable skills still return null and the client stays quiet.
export async function POST(req: Request) {
  let body: { message?: string; sender?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const message = String(body.message ?? "").slice(0, 2000);
  if (!message.trim()) return NextResponse.json({ error: "empty message" }, { status: 400 });
  const sender = "web:" + String(body.sender ?? "anon").slice(0, 40).replace(/[^a-zA-Z0-9_-]/g, "");
  const result = await answer(message, { msgId: `web-${Date.now()}`, sender, isReplyToQaf: true });
  return NextResponse.json({ reply: result.reply, skill: result.skill, handoff: result.handoff, linkCards: result.linkCards ?? [] });
}
