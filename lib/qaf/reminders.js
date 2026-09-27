// Reminder scheduling (F07): admin-created only. Early + final per deliverable.
// Times in WAT (UTC+1); no night sends (08:00–20:00).

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
