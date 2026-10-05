import { NextResponse } from "next/server";
import { prisma } from "@/lib/qaf/db";
import { fireDueForUser } from "@/lib/qaf/reminders";
import { sendPushToUser } from "@/lib/qaf/push";

// Hourly scheduler (Vercel Cron). Auth: Bearer CRON_SECRET. When CRON_SECRET
// is unset (local dev), the route still runs — set the secret on Vercel.
export async function GET(req: Request) {
  const required = process.env.CRON_SECRET ?? "";
  if (required) {
    const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (got !== required) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let users: { userKey: string }[] = [];
  try {
    users = await prisma.reminderSubscription.groupBy({ by: ["userKey"] });
  } catch (err) {
    return NextResponse.json({ error: "db unreachable" }, { status: 500 });
  }
  const now = new Date();
  let fired = 0;
  let pushed = 0;
  for (const u of users) {
    let created: Awaited<ReturnType<typeof fireDueForUser>> = [];
    try {
      created = await fireDueForUser(u.userKey, now);
    } catch {
      continue;
    }
    fired += created.length;
    for (const n of created) {
      const r = await sendPushToUser(u.userKey, n);
      if (r.ok) pushed++;
    }
  }
  return NextResponse.json({ ok: true, users: users.length, fired, pushed, at: now.toISOString() });
}
