import { NextResponse } from "next/server";
import { getInbox, markRead } from "@/lib/qaf/reminders";

export async function GET(req: Request) {
  const userKey = String(new URL(req.url).searchParams.get("userKey") ?? "").slice(0, 80);
  if (!userKey) return NextResponse.json({ error: "userKey required" }, { status: 400 });
  const items = await getInbox(userKey);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  let body: { userKey?: string; id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const userKey = String(body.userKey ?? "");
  const id = String(body.id ?? "");
  if (!userKey || !id) return NextResponse.json({ error: "userKey + id required" }, { status: 400 });
  await markRead(userKey, id);
  return NextResponse.json({ ok: true });
}
