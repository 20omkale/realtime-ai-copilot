import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * useAppStore manages the global state of the TwinMind application.
 * Upgraded with 'persist' middleware to ensure session data (transcripts, suggestions)
 * survives browser refreshes—a key Senior UX requirement.
 */
export const useAppStore = create(
  persist(
    (set, get) => ({
      // SESSION DATA
      transcript: [],
      suggestions: [], // Array of batches: { timestamp: string, items: [] }
      chat: [], // { role, content, timestamp, error, suggestionId }
      isRecording: false,
      backendOnline: true,
      processedSuggestions: [], // Stored as array for JSON serializability

      // UI STATUS
      micError: null,
      globalError: null,

      // SETTINGS
      apiKey: "",
      settings: {
        suggestionModel: "llama-3.3-70b-versatile",
        chatModel: "llama-3.3-70b-versatile",
        suggestionPrompt: "You are a real-time meeting copilot. Analyze the transcript and provide EXACTLY 3 helpful suggestions. Vary the types: one question, one talking point, one fact-check or clarification. Return ONLY valid JSON array.",
        chatPrompt: "You are a helpful, professional meeting assistant. Use the transcript provided as context.",
        contextWindow: 1500,
      },

      // ACTIONS
      setApiKey: (key) => set({ apiKey: key, globalError: null }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

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
          const itemsWithIds = items.map((item) => ({
            ...item,
            id: item.id || Math.random().toString(36).substr(2, 9),
          }));

          return {
            suggestions: [
              {
                timestamp: new Date().toLocaleTimeString(),
                items: itemsWithIds,
              },
              ...state.suggestions,
            ],
          };
        }),

      markSuggestionProcessed: (id) =>
        set((state) => ({
          processedSuggestions: [...state.processedSuggestions, id],
        })),

      addChatMessage: (msg) =>
        set((state) => ({
          chat: [
            ...state.chat,
            { ...msg, timestamp: new Date().toLocaleTimeString() },
          ],
        })),

      clearSession: () =>
        set({
          transcript: [],
          suggestions: [],
          chat: [],
          globalError: null,
          micError: null,
          processedSuggestions: [],
        }),
    }),
    {
      name: "twinmind-persistent-storage", // Key for localStorage
      storage: createJSONStorage(() => localStorage),
      // Only persist certain parts of the state
      partialize: (state) => ({
        transcript: state.transcript,
        suggestions: state.suggestions,
        chat: state.chat,
        apiKey: state.apiKey,
        settings: state.settings,
        processedSuggestions: state.processedSuggestions,
      }),
    }
  )
);