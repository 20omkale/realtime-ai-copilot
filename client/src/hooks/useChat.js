import { useAppStore } from "../store/useAppStore";
import axios from "axios";
import { API_URL } from "../config";

/**
 * useChat handles manual chat queries and expanded suggestion answers.
 * Implements Optimistic UI and Suggestion Deduplication.
 */
export const useChat = () => {
  const { 
    transcript, 
    addChatMessage, 
    apiKey, 
    settings, 
    setGlobalError, 
    processedSuggestions, 
    markSuggestionProcessed 
  } = useAppStore();

  const sendMessage = async (query, suggestionId = null) => {
    // 0. DEDUPLICATION CHECK
    if (suggestionId && processedSuggestions.has(suggestionId)) {
      return;
    }

    // 1. OPTIMISTIC UPDATE
    const userMsg = { role: "user", content: query, suggestionId };
    addChatMessage(userMsg);
    
    if (suggestionId) {
      markSuggestionProcessed(suggestionId);
    }

    // 2. Validation Check
    if (!apiKey) {
      addChatMessage({ 
        role: "assistant", 
        content: "I can't answer that yet because your Groq API Key is missing. Please add it in Settings.",
        error: true 
      });
      return;
    }

    // 3. Placeholder
    const assistantMsgId = Date.now();
    addChatMessage({ role: "assistant", content: "", id: assistantMsgId });

    try {
      const fullTranscript = transcript.join(" ");
      const context = fullTranscript.slice(-settings.contextWindow);

      const messages = [
        { role: "system", content: settings.chatPrompt },
        { role: "user", content: `Context from meeting:\n${context}\n\nQuestion/Topic: ${query}` }
      ];

      const res = await axios.post(`${API_URL}/api/chat`, {
        messages,
        model: settings.chatModel
      }, {
        headers: { "x-api-key": apiKey }
      });

      const fullContent = res.data.content;

      // 4. Token-by-token simulation
      const words = fullContent.split(" ");
      let currentText = "";
      
      for (const word of words) {
        currentText += word + " ";
        useAppStore.setState((state) => {
          const newChat = [...state.chat];
          const lastIdx = newChat.length - 1;
          newChat[lastIdx] = { ...newChat[lastIdx], content: currentText.trim() };
          return { chat: newChat };
        });
        await new Promise(r => setTimeout(r, 10 + Math.random() * 20)); 
      }

    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg = err.response?.data?.error || "Sorry, I encountered an error helper. Please check your connection.";
      
      useAppStore.setState((state) => {
        const newChat = [...state.chat];
        newChat[newChat.length - 1] = { 
          ...newChat[newChat.length - 1], 
          content: errorMsg,
          error: true
        };
        return { chat: newChat };
      });

      setGlobalError(errorMsg);
    }
  };

  return { sendMessage };
};