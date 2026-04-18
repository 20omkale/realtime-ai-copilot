import { useAppStore } from "../store/useAppStore";
import axios from "axios";
import { API_URL } from "../config";

/**
 * useSuggestions handles manual and automatic suggestion fetching.
 */
export const useSuggestions = () => {
  const { transcript, apiKey, addSuggestions, settings } = useAppStore();

  const fetchSuggestions = async () => {
    if (!apiKey) {
      alert("Please enter your Groq API key in Settings.");
      return;
    }

    try {
      const fullTranscript = transcript.join(" ");
      const res = await axios.post(`${API_URL}/api/suggest`, {
        transcript: fullTranscript,
        model: settings.suggestionModel,
        prompt: settings.suggestionPrompt
      }, {
        headers: { "x-api-key": apiKey }
      });

      if (res.data && Array.isArray(res.data)) {
        addSuggestions(res.data);
      }
    } catch (err) {
      console.error("Manual refresh error:", err);
    }
  };

  return { fetchSuggestions };
};