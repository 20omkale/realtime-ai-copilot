import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { X, Save, Key, ShieldCheck, Database, FileText } from "lucide-react";

export default function SettingsModal({ onClose }) {
  const { apiKey, setApiKey, settings, updateSettings } = useAppStore();

  const [localKey, setLocalKey] = useState(apiKey);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    setApiKey(localKey);
    updateSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#0f0f12] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        
        {/* MODAL HEADER */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">System Settings</h2>
              <p className="text-xs text-slate-500 font-medium">Configure models and prompt strategies</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="px-8 py-8 h-[60vh] overflow-y-auto space-y-8">
          
          {/* API KEY SECTION */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <Key size={12} />
              API Authentication
            </div>
            <div className="relative">
              <input 
                type="password"
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-slate-700 font-mono"
              />
              {apiKey && (
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                   <ShieldCheck size={12} />
                   <span className="text-[10px] font-bold uppercase tracking-tighter">Secure</span>
                 </div>
              )}
            </div>
            <p className="text-[10px] text-slate-600 px-1">Your Groq API Key is stored locally in your browser and never leaves this session.</p>
          </section>

          {/* MODEL SETTINGS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400">Suggestion Model</label>
              <input 
                 value={localSettings.suggestionModel}
                 onChange={(e) => setLocalSettings({...localSettings, suggestionModel: e.target.value})}
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400">Chat Model</label>
              <input 
                 value={localSettings.chatModel}
                 onChange={(e) => setLocalSettings({...localSettings, chatModel: e.target.value})}
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>

          {/* PROMPT ENGINEERING */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <FileText size={12} />
              Prompt Engineering
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Live Suggestions Prompt</label>
              <textarea 
                 rows={4}
                 value={localSettings.suggestionPrompt}
                 onChange={(e) => setLocalSettings({...localSettings, suggestionPrompt: e.target.value})}
                 className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-violet-500/50 resize-none font-mono leading-relaxed"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Detailed Answer Prompt</label>
              <textarea 
                 rows={3}
                 value={localSettings.chatPrompt}
                 onChange={(e) => setLocalSettings({...localSettings, chatPrompt: e.target.value})}
                 className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-violet-500/50 resize-none font-mono leading-relaxed"
              />
            </div>
          </section>

        </div>

        {/* MODAL FOOTER */}
        <div className="px-8 py-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
          <button onClick={onClose} className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors">
            Discard Changes
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl accent-gradient text-white text-xs font-bold shadow-xl shadow-violet-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Save size={16} />
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
}
