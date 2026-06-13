/* SAAJ by MF — Firebase Cloud Messaging service worker
 * Config is supplied via URL query parameters when the SW is registered
 * (see client/src/lib/firebase.ts). This lets a single file work for any
 * Firebase project without needing a build step. */

importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

const params = new URL(self.location.href).searchParams;
const config = {
  apiKey: params.get("apiKey"),
  authDomain: params.get("authDomain"),
  projectId: params.get("projectId"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
};

if (config.apiKey && config.projectId && config.messagingSenderId && config.appId) {
  firebase.initializeApp(config);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = (payload.notification && payload.notification.title) || "SAAJ by MF";
    const options = {
      body: (payload.notification && payload.notification.body) || "",
      icon: (payload.notification && payload.notification.image) || "/favicon.ico",
      data: payload.data || {},
    };
    self.registration.showNotification(title, options);
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((all) => {
      for (const c of all) {
        if ("focus" in c) {
          c.navigate(link).catch(() => {});
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(link);
    })
  );
});
