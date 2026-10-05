// QAF reminder push handler. Shows the notification; tap opens the URL.
self.addEventListener("push", (event) => {
  let data = { title: "QAF reminder", body: "", url: "/reminders" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch { /* keep defaults */ }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/reminders";
  event.waitUntil(clients.openWindow(url));
});
