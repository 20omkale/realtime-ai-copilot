import { useState, useEffect, useRef } from "react";
import { useAppStore } from "../store/useAppStore";
import { useChat } from "../hooks/useChat";
import { MessageSquare, Send, User, Bot, Clock } from "lucide-react";

export default function ChatPanel() {
  const chat = useAppStore((s) => s.chat);
  const { sendMessage } = useChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-black/10">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-violet-400 flex items-center gap-2">
            <MessageSquare size={14} />
            Live Chat
          </h2>
          <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">
            Deep Analysis & Queries
          </p>
        </div>
      </div>

      {/* CHAT MESSAGES */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {chat.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-4">
            <MessageSquare size={40} className="mb-4" />
            <p className="text-sm font-medium">No messages yet.<br/>Ask a question or click a suggestion.</p>
          </div>
        ) : (
          chat.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-4 ${msg.role === "user" ? "flex-reverse items-end" : "items-start"} animate-slide-up`}
            >
              <div className={`flex-1 space-y-2 ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  {msg.role === "assistant" && <span className="text-[10px] font-bold text-violet-400 uppercase tracking-tighter">TwinMind AI</span>}
                  <span className="text-[9px] text-slate-600 font-mono flex items-center gap-1">
                    <Clock size={10} /> {msg.timestamp}
                  </span>
                  {msg.role === "user" && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">You</span>}
                </div>
                
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-violet-600 text-white rounded-br-none"
                      : "bg-white/5 text-slate-200 border border-white/10 rounded-bl-none"
                  }`}
                >
                  {msg.content || <div className="flex gap-1 py-1"><div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'0s'}}/><div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}/><div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}/></div>}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-6 border-t border-white/5 bg-black/20">
        <div className="relative group">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question about the meeting..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-slate-600 pr-14"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-600/20"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}