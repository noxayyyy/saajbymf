import { initializeApp, cert, deleteApp, type App } from "firebase-admin/app";
import { getMessaging, type Message } from "firebase-admin/messaging";
import { storage } from "./storage";

let cachedApp: App | null = null;
let cachedKey: string | null = null;

async function getServiceAccountJson(): Promise<string | null> {
  const settings = await storage.getSiteSettings("firebase");
  const sa = settings.find((s) => s.key === "firebase_service_account_json");
  return sa?.value?.trim() || null;
}

export async function getFirebaseAdmin(): Promise<App | null> {
  const json = await getServiceAccountJson();
  if (!json) {
    if (cachedApp) {
      await deleteApp(cachedApp).catch(() => {});
      cachedApp = null;
      cachedKey = null;
    }
    return null;
  }

  if (cachedApp && cachedKey === json) return cachedApp;

  if (cachedApp) {
    await deleteApp(cachedApp).catch(() => {});
    cachedApp = null;
  }

  let parsed: any;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Service account JSON is invalid");
  }

  cachedApp = initializeApp(
    {
      credential: cert(parsed),
    },
    `saaj-fcm-${Date.now()}`
  );
  cachedKey = json;
  return cachedApp;
}

export interface PushPayload {
  topic: string;
  title: string;
  body: string;
  link?: string;
  image?: string;
}

export async function sendToTopic(payload: PushPayload) {
  const app = await getFirebaseAdmin();
  if (!app) throw new Error("Firebase service account is not configured");

  const topic = payload.topic.replace(/[^a-zA-Z0-9-_.~%]/g, "_");

  const message: Message = {
    topic,
    notification: {
      title: payload.title,
      body: payload.body,
      ...(payload.image ? { imageUrl: payload.image } : {}),
    },
    webpush: {
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.image || undefined,
      },
      fcmOptions: payload.link ? { link: payload.link } : undefined,
    },
    data: payload.link ? { link: payload.link } : undefined,
  };

  return getMessaging(app).send(message);
}

export async function subscribeTokenToTopic(token: string, topic: string) {
  const app = await getFirebaseAdmin();
  if (!app) throw new Error("Firebase service account is not configured");
  const safeTopic = topic.replace(/[^a-zA-Z0-9-_.~%]/g, "_");
  return getMessaging(app).subscribeToTopic([token], safeTopic);
}

export async function unsubscribeTokenFromTopic(token: string, topic: string) {
  const app = await getFirebaseAdmin();
  if (!app) throw new Error("Firebase service account is not configured");
  const safeTopic = topic.replace(/[^a-zA-Z0-9-_.~%]/g, "_");
  return getMessaging(app).unsubscribeFromTopic([token], safeTopic);
}
