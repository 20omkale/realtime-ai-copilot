import { useAppStore } from "../store/useAppStore";
import MicButton from "./MicButton";
import { useEffect, useRef } from "react";
import { Activity, Radio } from "lucide-react";

export default function TranscriptPanel() {
  const { transcript, isRecording } = useAppStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  return (
    <div className="h-full flex flex-col relative">
      
      {/* HEADER */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-black/10">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-violet-400 flex items-center gap-2">
            <Radio size={14} className={isRecording ? "animate-pulse" : ""} />
            Transcript
          </h2>
          <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Live Audio Stream</p>
        </div>
        <MicButton />
      </div>

      {/* TRANSCRIPT CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-20 space-y-6">
        {transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-4">
             <Activity size={40} className="mb-4" />
             <p className="text-sm font-medium">Listening for audio...<br/>Tap the mic to begin recording.</p>
          </div>
        ) : (
          transcript.map((chunk, i) => (
            <div 
              key={i} 
              className="text-sm leading-relaxed text-slate-300 animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="inline-block px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-slate-500 font-mono mr-2">
                {i + 1}
              </span>
              {chunk}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* INDICATOR OVERLAY */}
      {isRecording && (
        <div className="absolute bottom-4 left-6 right-6 p-3 rounded-xl bg-violet-600/10 border border-violet-500/20 backdrop-blur-md flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-tighter text-violet-300">Recording Live</span>
           </div>
           <div className="flex gap-1">
             <div className="w-1 h-3 bg-violet-400/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
             <div className="w-1 h-5 bg-violet-400/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
             <div className="w-1 h-2 bg-violet-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
           </div>
        </div>
      )}

    </div>
  );
}