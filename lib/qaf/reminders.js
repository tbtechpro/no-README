// Reminder scheduling (F07): admin-created only. Early + final per deliverable.
// Times in WAT (UTC+1); no night sends (08:00–20:00).

import { prisma } from "./db.js";
import { servableItems } from "./corpus.js";

/**
 * @param {Date} deadline
 * @returns {{early:Date, final:Date}} early = 3 days before 09:00, final = 1 day before 09:00
 */
export function earlyFinal(deadline) {
  const at0900 = (d) => {
    const x = new Date(d);
    x.setUTCHours(8, 0, 0, 0); // 09:00 WAT
    return x;
  };
  const early = at0900(new Date(deadline.getTime() - 3 * 86400000));
  const final = at0900(new Date(deadline.getTime() - 1 * 86400000));
  return { early, final };
}

/**
 * @param {Date} oldDeadline
 * @param {Date} newDeadline
 * @returns {string} deadline-change notice body
 */
export function deadlineChangeNotice(oldDeadline, newDeadline) {
  const f = (d) => d.toUTCString();
  return `Update: the deadline was ${f(oldDeadline)} and is now ${f(newDeadline)}. Please follow the new date.`;
}

// ---------- Web triggers (R3): subscriber-driven, inbox-guaranteed ----------

export const TRIGGERS = [
  { id: "assessment-48h", title: "Assessment due — 48h warning", blurb: "Two days before the confirmed deadline." },
  { id: "assessment-6h", title: "Assessment due — 6h warning", blurb: "Final stretch before the confirmed deadline." },
  { id: "new-event", title: "New event published", blurb: "Any session added after you subscribe, with its link card." },
  { id: "starting-1h", title: "Event starting — 1h before", blurb: "Friday Knowledge Sharing and other windowed sessions." },
  { id: "deadline-changed", title: "Deadline changed by admin", blurb: "Old → new notice the moment CONFIRM lands." },
];

/** Next Sunday 23:59 WAT from now (the standing assessment cadence). @param {Date} [from] */
export function nextSunday2359WAT(from = new Date()) {
  const d = new Date(from);
  const add = (7 - d.getUTCDay()) % 7;
  d.setUTCDate(d.getUTCDate() + add);
  d.setUTCHours(22, 59, 0, 0); // 23:59 WAT
  if (d.getTime() <= from.getTime()) d.setUTCDate(d.getUTCDate() + 7);
  return d;
}

/** Next Friday 15:00 WAT occurrence (Knowledge Sharing window start). @param {Date} [from] */
export function nextFriday1500WAT(from = new Date()) {
  const d = new Date(new Date(from).getTime() + 60 * 60 * 1000); // view in WAT
  const add = (5 - d.getUTCDay() + 7) % 7;
  d.setUTCDate(d.getUTCDate() + add);
  d.setUTCHours(14, 0, 0, 0); // 15:00 WAT
  return new Date(d.getTime() - 60 * 60 * 1000);
}

/** Effective assessment due: admin overlay date if set, else standing Sunday. @returns {Promise<Date>} */
export async function assessmentDue() {
  try {
    const o = await prisma.deadlineOverlay.findUnique({ where: { id: "active" } });
    if (o?.dueAt) {
      const d = new Date(o.dueAt);
      if (!Number.isNaN(d.getTime()) && d.getTime() > Date.now()) return d;
    }
  } catch { /* fall through */ }
  return nextSunday2359WAT();
}

/** @param {string} userKey @returns {Promise<string[]>} subscribed trigger ids */
export async function getSubscriptions(userKey) {
  const rows = await prisma.reminderSubscription.findMany({ where: { userKey } });
  return rows.map((r) => r.trigger);
}

/** @param {string} userKey @param {string} trigger @param {boolean} on */
export async function setSubscription(userKey, trigger, on) {
  if (!TRIGGERS.some((t) => t.id === trigger)) throw new Error("unknown trigger");
  if (on) {
    await prisma.reminderSubscription.upsert({
      where: { userKey_trigger: { userKey, trigger } },
      create: { userKey, trigger },
      update: {},
    });
  } else {
    await prisma.reminderSubscription.deleteMany({ where: { userKey, trigger } });
  }
}

/**
 * Compute due notifications WITHOUT writing (pure check for tests/previews).
 * @param {string} userKey
 * @param {Date} [now]
 * @returns {Promise<Array<{trigger:string,ref:string,title:string,body:string,url:string|null}>>}
 */
export async function computeDueForUser(userKey, now = new Date()) {
  const subs = new Set(await getSubscriptions(userKey));
  if (subs.size === 0) return [];
  const due = [];
  const t = now.getTime();

  const collect = async (trigger, ref, title, body, url) => {
    const exists = await prisma.reminderInbox.findUnique({
      where: { userKey_trigger_ref: { userKey, trigger, ref } },
    }).catch(() => null);
    if (!exists) due.push({ trigger, ref, title, body, url });
  };

  if (subs.has("assessment-48h") || subs.has("assessment-6h")) {
    const dueAt = await assessmentDue();
    const ms = dueAt.getTime() - t;
    const ref = dueAt.toISOString();
    if (subs.has("assessment-48h") && ms > 0 && ms <= 48 * 3600000) {
      await collect("assessment-48h", ref, "Assessment due in 48h",
        "Submit before the confirmed deadline and confirm it no longer shows Draft.", "/learn");
    }
    if (subs.has("assessment-6h") && ms > 0 && ms <= 6 * 3600000) {
      await collect("assessment-6h", ref, "Assessment due in 6h — final stretch",
        "Complete every field, confirm it no longer shows Draft, submit now.", "/learn");
    }
  }
  if (subs.has("new-event") || subs.has("starting-1h")) {
    const weekAgo = new Date(t - 7 * 86400000);
    const events = (await servableItems()).filter((c) => c.type === "event");
    for (const e of events) {
      if (subs.has("new-event") && e.effectiveFrom && new Date(e.effectiveFrom) > weekAgo) {
        await collect("new-event", e.id, `New event: ${e.title}`, e.body.slice(0, 140), "/events");
      }
      if (subs.has("starting-1h") && e.liveWindow) {
        const start = nextFriday1500WAT(t);
        const ms = start.getTime() - t;
        if (ms > 0 && ms <= 3600000) {
          await collect("starting-1h", `${e.id}@${start.toISOString()}`, `Starting in 1h: ${e.title}`, e.body.slice(0, 140), "/events");
        }
      }
    }
  }
  if (subs.has("deadline-changed")) {
    const o = await prisma.deadlineOverlay.findUnique({ where: { id: "active" } }).catch(() => null);
    if (o && t - new Date(o.at).getTime() < 48 * 3600000) {
      await collect("deadline-changed", new Date(o.at).toISOString(),
        "Deadline updated by admin", `Now: ${o.label}. Please follow the new date.`, "/events");
    }
  }
  return due;
}

/** Fire due notifications: inbox rows (dedupe-safe) + payloads for push. @returns {Promise<Array>} created */
export async function fireDueForUser(userKey, now = new Date()) {
  const due = await computeDueForUser(userKey, now);
  const created = [];
  for (const n of due) {
    try {
      await prisma.reminderInbox.create({
        data: { userKey, trigger: n.trigger, ref: n.ref, title: n.title, body: n.body, url: n.url },
      });
      created.push(n);
    } catch (err) {
      if (err?.code !== "P2002") throw err; // duplicate = already notified
    }
  }
  return created;
}

/** @param {string} userKey */
export async function getInbox(userKey) {
  return prisma.reminderInbox.findMany({ where: { userKey }, orderBy: { createdAt: "desc" }, take: 50 });
}

/** @param {string} userKey @param {string} id */
export async function markRead(userKey, id) {
  await prisma.reminderInbox.updateMany({ where: { id, userKey }, data: { read: true } });
}
