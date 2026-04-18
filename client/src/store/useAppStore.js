import { create } from "zustand";

/**
 * useAppStore manages the global state of the TwinMind application.
 * Persists settings to localStorage for a production-ready experience.
 */
export const useAppStore = create((set) => ({
  // SESSION DATA
  transcript: [],
  suggestions: [], // Array of batches: { timestamp: string, items: [] }
  chat: [], // Array of messages: { role: 'user'|'assistant', content: string, timestamp: string, error?: boolean, suggestionId?: string }
  isRecording: false,
  backendOnline: true,
  processedSuggestions: new Set(), // IDs of suggestions already clicked

  // UI STATUS
  micError: null,
  globalError: null,

  // SETTINGS (Persisted)
  apiKey: localStorage.getItem("tm_api_key") || "",
  settings: JSON.parse(localStorage.getItem("tm_settings")) || {
    suggestionModel: "llama-3.3-70b-versatile",
    chatModel: "llama-3.3-70b-versatile",
    suggestionPrompt: `You are a real-time meeting copilot. Analyze the transcript and provide EXACTLY 3 helpful suggestions. Vary the types: one question, one talking point, one fact-check or clarification. Return ONLY valid JSON array.`,
    chatPrompt: "You are a helpful, professional meeting assistant. Use the transcript provided as context.",
    contextWindow: 1500, // characters
  },

  // ACTIONS
  setApiKey: (key) => {
    localStorage.setItem("tm_api_key", key);
    set({ apiKey: key, globalError: null });
  },

  updateSettings: (newSettings) => {
    set((state) => {
      const updated = { ...state.settings, ...newSettings };
      localStorage.setItem("tm_settings", JSON.stringify(updated));
      return { settings: updated };
    });
  },

  setRecording: (recording) => set({ isRecording: recording, micError: null }),
  setMicError: (err) => set({ micError: err, isRecording: false }),
  setGlobalError: (err) => set({ globalError: err }),
  setBackendOnline: (online) => set({ backendOnline: online }),

  addTranscript: (text) =>
    set((state) => ({
      transcript: [...state.transcript, text],
    })),

  addSuggestions: (items) =>
    set((state) => {
      // Assign IDs to new items
      const itemsWithIds = items.map(item => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9)
      }));

      return {
        suggestions: [
          { 
            timestamp: new Date().toLocaleTimeString(), 
            items: itemsWithIds
          }, 
          ...state.suggestions 
        ],
      };
    }),

  markSuggestionProcessed: (id) =>
    set((state) => {
      const next = new Set(state.processedSuggestions);
      next.add(id);
      return { processedSuggestions: next };
    }),

  addChatMessage: (msg) =>
    set((state) => ({
      chat: [
        ...state.chat, 
        { ...msg, timestamp: new Date().toLocaleTimeString() }
      ],
    })),

  clearSession: () =>
    set({
      transcript: [],
      suggestions: [],
      chat: [],
      globalError: null,
      micError: null,
      processedSuggestions: new Set()
    }),
}));