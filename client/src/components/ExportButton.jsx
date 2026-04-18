import React from "react";
import { Download } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export default function ExportButton() {
  const transcript = useAppStore((s) => s.transcript);
  const suggestions = useAppStore((s) => s.suggestions);
  const chat = useAppStore((s) => s.chat);

  const handleExport = () => {
    let content = "===== TWINMIND SESSION EXPORT =====\n";
    content += `Timestamp: ${new Date().toLocaleString()}\n\n`;

    content += "--- FULL TRANSCRIPT ---\n";
    transcript.forEach((line, index) => {
      content += `[Line ${index + 1}] ${line}\n`;
    });
    content += "\n";

    content += "--- AI SUGGESTIONS BATCHES ---\n";
    suggestions.forEach((batch, index) => {
      content += `Batch ${suggestions.length - index} (Generated at ${batch.timestamp}):\n`;
      batch.items.forEach((item) => {
        content += `- [${item.type.toUpperCase()}] ${item.title}: ${item.preview}\n`;
      });
      content += "\n";
    });

    content += "--- CHAT HISTORY ---\n";
    chat.forEach((msg) => {
      content += `[${msg.timestamp}] ${msg.role.toUpperCase()}: ${msg.content}\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `twinmind-session-${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 transition-all text-sm font-semibold text-white group"
    >
      <Download size={16} className="text-violet-400 group-hover:scale-110 transition-transform" />
      <span>Export Session</span>
    </button>
  );
}
