import { useState, useEffect } from "react";
import StatusBanner from "../components/StatusBanner";
import SettingsModal from "../components/SettingsModal";
import { Settings, Download, Zap } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import axios from "axios";
import { API_URL } from "../config";

export default function MainLayout({ children }) {
  const [showSettings, setShowSettings] = useState(false);
  const { transcript, suggestions, chat, setApiKey, setBackendOnline } = useAppStore();

  // HEARBEAT: Poll backend health every 5s
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await axios.get(`${API_URL}/`);
        setBackendOnline(true);
      } catch (err) {
        setBackendOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, [setBackendOnline]);

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      transcript,
      suggestions_batches: suggestions,
      chat_history: chat,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `twinmind-session-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0c] text-slate-100 font-sans">
      
      {/* PROFESSIONAL NAV */}
      <header className="h-14 px-6 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">TwinMind <span className="text-violet-400 font-medium ml-1">Live</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            <Download size={14} />
            Export Session
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* SYSTEM NOTICES */}
      <StatusBanner />

      {/* MAIN 3-COLUMN GRID */}
      <main className="flex-1 grid grid-cols-12 main-grid overflow-hidden gap-1 p-1 bg-white/5">
        
        {/* TRANSCRIPT */}
        <div className="col-span-12 md:col-span-3 h-full glass-panel rounded-xl overflow-hidden flex flex-col">
          {children[0]}
        </div>

        {/* SUGGESTIONS */}
        <div className="col-span-12 md:col-span-5 h-full glass-panel rounded-xl overflow-hidden flex flex-col">
          {children[1]}
        </div>

        {/* CHAT */}
        <div className="col-span-12 md:col-span-4 h-full glass-panel rounded-xl overflow-hidden flex flex-col">
          {children[2]}
        </div>

      </main>

      {/* SETTINGS MODAL */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}