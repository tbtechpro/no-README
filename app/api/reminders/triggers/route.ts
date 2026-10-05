import { NextResponse } from "next/server";
import { TRIGGERS, getSubscriptions, setSubscription } from "@/lib/qaf/reminders";

const keyOf = (req: Request, body?: { userKey?: string }) => {
  const url = new URL(req.url);
  const k = body?.userKey ?? url.searchParams.get("userKey") ?? "";
  return String(k).slice(0, 80);
};

export async function GET(req: Request) {
  const userKey = keyOf(req);
  const on = new Set(userKey ? await getSubscriptions(userKey) : []);
  return NextResponse.json({
    triggers: TRIGGERS.map((t) => ({ ...t, on: on.has(t.id) })),
  });
}

export async function POST(req: Request) {
  let body: { userKey?: string; trigger?: string; on?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const userKey = keyOf(req, body);
  const trigger = String(body.trigger ?? "");
  if (!userKey || !trigger) return NextResponse.json({ error: "userKey + trigger required" }, { status: 400 });
  try {
    await setSubscription(userKey, trigger, body.on !== false);
  } catch {
    return NextResponse.json({ error: "unknown trigger" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, trigger, on: body.on !== false });
}
