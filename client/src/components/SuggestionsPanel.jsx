import { useAppStore } from "../store/useAppStore";
import { useSuggestions } from "../hooks/useSuggestions";
import { useChat } from "../hooks/useChat";
import { Sparkles, RefreshCw, Clock, ChevronRight, CheckCircle2 } from "lucide-react";

export default function SuggestionsPanel() {
  const { fetchSuggestions } = useSuggestions();
  const suggestions = useAppStore((s) => s.suggestions);
  const processedSuggestions = useAppStore((s) => s.processedSuggestions);
  const { sendMessage } = useChat();

  const getBadgeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case "question":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "insight":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "clarification":
      case "fact-check":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-black/10">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-violet-400 flex items-center gap-2">
            <Sparkles size={14} />
            AI Suggestions
          </h2>
          <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">
            Context-Aware Insights
          </p>
        </div>
        <button 
          onClick={fetchSuggestions}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-slate-400 hover:text-white"
          title="Manual Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* SUGGESTIONS LIST */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {suggestions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-4">
            <Sparkles size={40} className="mb-4 text-violet-500" />
            <p className="text-sm font-medium">Suggestions appear here as the conversation unfolds.</p>
          </div>
        ) : (
          suggestions.map((batch, batchIdx) => (
            <div key={batchIdx} className="space-y-4 animate-slide-up">
              {/* BATCH TIMESTAMP */}
              <div className="flex items-center gap-2">
                <Clock size={10} className="text-slate-600" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                  Batch {suggestions.length - batchIdx} • Generated at {batch.timestamp}
                </span>
                <div className="flex-1 h-[1px] bg-white/5" />
              </div>

              <div className="grid gap-3">
                {batch.items.map((sug) => {
                  const isProcessed = processedSuggestions.has(sug.id);
                  
                  return (
                    <button
                      key={sug.id}
                      onClick={() => sendMessage(sug.title, sug.id)}
                      disabled={isProcessed}
                      className={`group w-full text-left p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                        isProcessed 
                          ? "bg-white/[0.01] border-white/5 opacity-40 grayscale-[0.5] cursor-default" 
                          : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-500/30"
                      }`}
                    >
                      {/* Hover Glow */}
                      {!isProcessed && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                      
                      <div className="relative z-10">
                        <div className="flex justify-between items-start gap-3 mb-2">
                          <h4 className={`text-[13px] font-semibold transition-colors ${
                            isProcessed ? "text-slate-500" : "text-slate-100 group-hover:text-violet-300"
                          }`}>
                            {sug.title}
                          </h4>
                          {isProcessed ? (
                            <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">
                              <CheckCircle2 size={12} />
                              Processed
                            </div>
                          ) : (
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter border ${getBadgeStyle(
                                sug.type
                              )}`}
                            >
                              {sug.type}
                            </span>
                          )}
                        </div>

                        <p className={`text-[11px] leading-relaxed line-clamp-2 ${
                          isProcessed ? "text-slate-600" : "text-slate-400"
                        }`}>
                          {sug.preview}
                        </p>
                        
                        {!isProcessed && (
                          <div className="mt-3 flex items-center text-[10px] font-bold text-violet-400/0 group-hover:text-violet-400 transition-all">
                            EXPAND ANSWER <ChevronRight size={10} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}