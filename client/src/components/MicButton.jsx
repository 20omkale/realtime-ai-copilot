import { Mic, MicOff } from "lucide-react";
import { useRecorder } from "../hooks/useRecorder";
import { useAppStore } from "../store/useAppStore";

export default function MicButton() {
  const { startRecording, stopRecording } = useRecorder();
  const isRecording = useAppStore((s) => s.isRecording);

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${
        isRecording
          ? "bg-red-500/20 text-red-400 border border-red-500/30"
          : "bg-white/5 text-slate-400 border border-white/10 hover:border-white/20"
      }`}
    >
      {isRecording && (
        <span className="absolute inset-0 rounded-xl bg-red-500/20 animate-ping" />
      )}
      
      <div className="relative z-10">
        {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
      </div>
      
      {/* TOOLTIP */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10">
        {isRecording ? "Stop Listening" : "Start Listening"}
      </span>
    </button>
  );
}