import { useOnlineStatus } from "@/hooks/use-online-status";
import { WifiOff, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function ConnectionStatus() {
  const { isOnline, serverReachable, recheck } = useOnlineStatus();
  const [retrying, setRetrying] = useState(false);

  if (isOnline && serverReachable) return null;

  const message = !isOnline
    ? "You're offline. Check your internet connection."
    : "Can't reach our servers. Retrying soon…";

  const handleRetry = async () => {
    setRetrying(true);
    await recheck();
    setRetrying(false);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="status-connection"
      className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-sm shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span data-testid="text-connection-message">{message}</span>
        </div>
        <button
          type="button"
          onClick={handleRetry}
          disabled={retrying}
          data-testid="button-retry-connection"
          className="flex items-center gap-1.5 px-3 py-1 bg-white/15 hover:bg-white/25 rounded text-xs font-medium uppercase tracking-wide transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`} />
          {retrying ? "Checking" : "Retry"}
        </button>
      </div>
    </div>
  );
}
