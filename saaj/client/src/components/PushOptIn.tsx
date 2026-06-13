import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ensurePushSubscription, readFirebaseConfig } from "@/lib/firebase";

const STORAGE_KEY = "saaj_push_subscribed_v1";

export default function PushOptIn() {
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings/public"],
  });

  useEffect(() => {
    const config = readFirebaseConfig(settings);
    if (!config) return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    // Only auto-attempt if the user has already granted permission
    // (browsers reject prompts that fire without a user gesture on
    // subsequent visits — but if it's already granted we can silently
    // refresh the token and ensure server-side topic subscription).
    if (Notification.permission !== "granted") {
      // Defer to a one-shot click on the page so the prompt is allowed.
      const handler = () => {
        ensurePushSubscription(config, "all")
          .then((res) => {
            if (res) localStorage.setItem(STORAGE_KEY, "1");
          })
          .catch(() => {});
        window.removeEventListener("click", handler);
      };
      window.addEventListener("click", handler, { once: true });
      return () => window.removeEventListener("click", handler);
    }

    ensurePushSubscription(config, "all")
      .then((res) => {
        if (res) localStorage.setItem(STORAGE_KEY, "1");
      })
      .catch(() => {});
  }, [settings?.firebase_api_key, settings?.firebase_vapid_key, settings?.firebase_project_id]);

  return null;
}
