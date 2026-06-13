import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from "firebase/messaging";

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
}

export function readFirebaseConfig(settings: Record<string, string> | undefined): FirebaseWebConfig | null {
  if (!settings) return null;
  const cfg: FirebaseWebConfig = {
    apiKey: settings.firebase_api_key || "",
    authDomain: settings.firebase_auth_domain || "",
    projectId: settings.firebase_project_id || "",
    messagingSenderId: settings.firebase_messaging_sender_id || "",
    appId: settings.firebase_app_id || "",
    vapidKey: settings.firebase_vapid_key || "",
  };
  const required: (keyof FirebaseWebConfig)[] = [
    "apiKey",
    "projectId",
    "messagingSenderId",
    "appId",
    "vapidKey",
  ];
  for (const k of required) {
    if (!cfg[k]) return null;
  }
  return cfg;
}

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

function ensureApp(config: FirebaseWebConfig): FirebaseApp {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApps()[0]!;
    return app;
  }
  app = initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain || `${config.projectId}.firebaseapp.com`,
    projectId: config.projectId,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
  });
  return app;
}

async function registerSwWithConfig(config: FirebaseWebConfig): Promise<ServiceWorkerRegistration> {
  const params = new URLSearchParams({
    apiKey: config.apiKey,
    authDomain: config.authDomain || `${config.projectId}.firebaseapp.com`,
    projectId: config.projectId,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
  });
  return navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params.toString()}`, {
    scope: "/firebase-cloud-messaging-push-scope",
  });
}

export interface EnsurePushResult {
  token: string;
}

export async function ensurePushSubscription(
  config: FirebaseWebConfig,
  topic: string = "all"
): Promise<EnsurePushResult | null> {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return null;
  if (!(await isSupported().catch(() => false))) return null;

  if (Notification.permission === "denied") return null;
  if (Notification.permission === "default") {
    const result = await Notification.requestPermission();
    if (result !== "granted") return null;
  }

  ensureApp(config);
  const reg = await registerSwWithConfig(config);
  if (!messaging) {
    messaging = getMessaging(app!);
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || "SAAJ by MF";
      const body = payload.notification?.body || "";
      try {
        new Notification(title, {
          body,
          icon: payload.notification?.image,
        });
      } catch {
        /* ignore */
      }
    });
  }

  const token = await getToken(messaging, {
    vapidKey: config.vapidKey,
    serviceWorkerRegistration: reg,
  });
  if (!token) return null;

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, topic }),
  }).catch(() => {});

  return { token };
}
