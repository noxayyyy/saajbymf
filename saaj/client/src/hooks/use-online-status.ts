import { useEffect, useState, useCallback } from "react";

const PING_URL = "/api/settings/public";
const PING_INTERVAL_MS = 30_000;

async function pingServer(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(PING_URL, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      signal,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [serverReachable, setServerReachable] = useState<boolean>(true);

  const check = useCallback(async (signal?: AbortSignal) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOnline(false);
      setServerReachable(false);
      return;
    }
    setIsOnline(true);
    const ok = await pingServer(signal);
    setServerReachable(ok);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    check(controller.signal);

    const handleOnline = () => check();
    const handleOffline = () => {
      setIsOnline(false);
      setServerReachable(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const id = window.setInterval(() => check(), PING_INTERVAL_MS);

    return () => {
      controller.abort();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.clearInterval(id);
    };
  }, [check]);

  return {
    isOnline,
    serverReachable,
    isConnected: isOnline && serverReachable,
    recheck: () => check(),
  };
}
