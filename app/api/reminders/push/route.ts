import { NextResponse } from "next/server";
import { savePushSubscription } from "@/lib/qaf/push";

export async function GET() {
  const pub = process.env.VAPID_PUBLIC_KEY ?? "";
  if (!pub) return NextResponse.json({ error: "push not configured" }, { status: 503 });
  return NextResponse.json({ publicKey: pub });
}

export async function POST(req: Request) {
  let body: { userKey?: string; subscription?: { endpoint: string; keys: { p256dh: string; auth: string } } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const userKey = String(body.userKey ?? "").slice(0, 80);
  if (!userKey || !body.subscription) return NextResponse.json({ error: "userKey + subscription required" }, { status: 400 });
  try {
    await savePushSubscription(userKey, body.subscription);
  } catch {
    return NextResponse.json({ error: "bad subscription" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
