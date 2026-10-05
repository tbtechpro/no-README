import webpush from "web-push";
import { prisma } from "./db.js";

// Web Push delivery (VAPID). Keys from env; public key is browser-visible
// by design. Failures never throw — they return {ok:false}.

let configured = false;
function ensure() {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY ?? "";
  const priv = process.env.VAPID_PRIVATE_KEY ?? "";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:admin@qubators.org", pub, priv);
  configured = true;
  return true;
}

/**
 * @param {string} userKey
 * @param {{title:string, body:string, url?:string|null}} n
 */
export async function sendPushToUser(userKey, n) {
  if (!ensure()) return { ok: false, error: "vapid-not-configured" };
  const sub = await prisma.pushSubscription.findUnique({ where: { userKey } }).catch(() => null);
  if (!sub) return { ok: false, error: "no-push-subscription" };
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify({ title: n.title, body: n.body, url: n.url ?? "/reminders" })
    );
    return { ok: true };
  } catch (err) {
    if (err?.statusCode === 404 || err?.statusCode === 410) {
      await prisma.pushSubscription.delete({ where: { userKey } }).catch(() => {});
      return { ok: false, error: "subscription-expired" };
    }
    return { ok: false, error: String(err?.message ?? err).slice(0, 120) };
  }
}

/**
 * @param {{endpoint:string, keys:{p256dh:string, auth:string}}} s
 * @param {string} userKey
 */
export async function savePushSubscription(userKey, s) {
  if (!s?.endpoint || !s?.keys?.p256dh || !s?.keys?.auth) throw new Error("bad subscription");
  await prisma.pushSubscription.upsert({
    where: { userKey },
    create: { userKey, endpoint: s.endpoint, p256dh: s.keys.p256dh, auth: s.keys.auth },
    update: { endpoint: s.endpoint, p256dh: s.keys.p256dh, auth: s.keys.auth },
  });
}
