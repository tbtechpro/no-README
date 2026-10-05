import { servableItems } from "./corpus.js";

// Events feed data. Status derives from seed fields: badge "Replay" pins
// replay; an optional liveWindow {dow (0=Sun), startH, endH} in WAT marks
// "live now"; everything else servable is upcoming.

/**
 * @param {Date} [now]
 * @returns {Promise<Array<{id:string,title:string,body:string,channel:string|null,actionUrl:string|null,actionLabel:string|null,status:string}>>}
 */
export async function listEvents(now = new Date()) {
  const items = (await servableItems()).filter((c) => c.type === "event");
  // WAT wall-clock from UTC.
  const wat = new Date(now.getTime() + 60 * 60 * 1000);
  return items.map((c) => {
    let status = "upcoming";
    if (c.badge === "Replay") status = "replay";
    else if (c.liveWindow && wat.getUTCDay() === c.liveWindow.dow) {
      const h = wat.getUTCHours() + wat.getUTCMinutes() / 60;
      if (h >= c.liveWindow.startH && h < c.liveWindow.endH) status = "live";
    }
    return {
      id: c.id,
      title: c.title,
      body: c.body,
      channel: c.channel ?? null,
      actionUrl: c.actionUrl ?? c.sourceLink,
      actionLabel: c.actionLabel ?? "Open",
      status,
    };
  });
}
