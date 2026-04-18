import { useAppStore } from "../store/useAppStore";
import { AlertTriangle, MicOff, Key, X, ServerCrash } from "lucide-react";

export default function StatusBanner() {
  const { apiKey, micError, globalError, backendOnline, setGlobalError } = useAppStore();

  if (!apiKey || micError || globalError || !backendOnline) {
    return (
      <div className="px-6 py-3 animate-slide-up z-[40]">
        <div className="flex flex-col gap-2">
          
          {/* BACKEND OFFLINE */}
          {!backendOnline && (
            <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-red-600/20 border border-red-600/40 text-red-200 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-2">
                <ServerCrash size={14} className="text-red-400" />
                <span className="text-[11px] font-bold uppercase tracking-tight">Backend Offline: The AI server is not reachable. Ensure it is running on port 5000.</span>
              </div>
            </div>
          )}

          {/* API KEY WARNING */}
          {backendOnline && !apiKey && (
            <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Key size={14} />
                <span className="text-[11px] font-bold uppercase tracking-tight">Setup Required: Enter your Groq API Key in Settings to enable AI features.</span>
              </div>
            </div>
          )}

          {/* MIC ERROR */}
          {backendOnline && micError && (
            <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <MicOff size={14} />
                <span className="text-[11px] font-bold uppercase tracking-tight">
                  Mic Access Denied: Please enable microphone permissions in your browser.
                </span>
              </div>
            </div>
          )}

          {/* GLOBAL ERROR */}
          {backendOnline && globalError && (
            <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-100 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-400" />
                <span className="text-[11px] font-medium">{globalError}</span>
              </div>
              <button onClick={() => setGlobalError(null)} className="p-1 hover:bg-white/5 rounded-full transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  return null;
}
