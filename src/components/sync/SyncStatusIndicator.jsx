import React, { useState, useEffect } from "react";
import { Cloud, CloudLightning, RefreshCw } from "lucide-react";
import { getQueue, syncNow } from "@/utils/sync-queue";
import { Badge } from "@/components/ui/badge";

export default function SyncStatusIndicator() {
  const [status, setStatus] = useState({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    pendingCount: getQueue().length
  });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setStatus({
        isOnline: navigator.onLine,
        pendingCount: getQueue().length
      });
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    window.addEventListener("yooga-sync-changed", updateStatus);

    updateStatus();

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      window.removeEventListener("yooga-sync-changed", updateStatus);
    };
  }, []);

  const handleSyncManual = async () => {
    if (isSyncing || status.pendingCount === 0) return;
    setIsSyncing(true);
    try {
      await syncNow();
    } catch (err) {
      console.error("Erro na sincronização manual:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const { isOnline, pendingCount } = status;

  if (isOnline && pendingCount === 0) {
    return (
      <Badge 
        variant="outline" 
        className="bg-green-50/60 backdrop-blur-sm border-green-200/50 text-green-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium transition-all duration-300 shadow-sm"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <Cloud className="w-4 h-4 text-green-600" />
        <span className="text-xs hidden sm:inline">Nuvem Sincronizada</span>
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className={`${
          !isOnline 
            ? "bg-red-50/60 border-red-200/50 text-red-700" 
            : "bg-amber-50/60 border-amber-200/50 text-amber-700"
        } backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold transition-all duration-300 shadow-sm`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <CloudLightning className={`w-4 h-4 ${!isOnline ? "text-red-500" : "text-amber-500"}`} />
        <span className="text-xs">
          {!isOnline ? "Modo Offline" : "Dados Locais"} {pendingCount > 0 && `(${pendingCount})`}
        </span>
      </Badge>

      {pendingCount > 0 && isOnline && (
        <button
          onClick={handleSyncManual}
          disabled={isSyncing}
          className="p-1.5 hover:bg-slate-100 active:scale-95 rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center"
          title="Sincronizar dados pendentes agora"
        >
          <RefreshCw className={`w-4 h-4 text-slate-600 ${isSyncing ? "animate-spin text-blue-600" : ""}`} />
        </button>
      )}
    </div>
  );
}
