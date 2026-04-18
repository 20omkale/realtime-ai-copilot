import { useAppStore } from "../store/useAppStore";
import { useState } from "react";

export default function SettingsPanel() {
  const apiKey = useAppStore((s) => s.apiKey);
  const setApiKey = useAppStore((s) => s.setApiKey);

  const [show, setShow] = useState(false);

  return (
    <div className="border-b p-2 space-y-2 bg-white">

      {/* API KEY INPUT */}
      <div className="flex gap-2">
        <input
          type="password"
          placeholder="Enter Groq API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="border px-2 py-1 rounded w-full text-sm"
        />

        <button
          onClick={() => setShow(!show)}
          className="text-xs px-2 border rounded hover:bg-gray-100"
        >
          ⚙️
        </button>
      </div>

      {/* ADVANCED SETTINGS */}
      {show && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>🔧 Prompt tuning coming here</p>
          <p>📏 Context window control</p>
          <p>⚡ Model selection (future upgrade)</p>

          {/* subtle clarity (no behavior change) */}
          <p className="text-gray-400 pt-1">
            API key is stored locally and used for requests
          </p>
        </div>
      )}

    </div>
  );
}