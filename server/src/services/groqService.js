import axios from "axios";
import FormData from "form-data";

/**
 * GroqService handles all interactions with the Groq API.
 * Designed for production reliability and clean error handling.
 */
class GroqService {
  constructor() {
    this.baseUrl = "https://api.groq.com/openai/v1";
  }

  _getHeaders(apiKey, contentType = "application/json") {
    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": contentType,
    };
  }

  async transcribe(audioBuffer, apiKey) {
    try {
      const form = new FormData();
      form.append("file", audioBuffer, {
        filename: "audio.webm",
        contentType: "audio/webm",
      });
      form.append("model", "whisper-large-v3");

      const response = await axios.post(`${this.baseUrl}/audio/transcriptions`, form, {
        headers: {
          ...this._getHeaders(apiKey, "multipart/form-data"),
          ...form.getHeaders(),
        },
      });

      return response.data.text;
    } catch (error) {
      console.error("Groq Transcription Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || "Transcription failed");
    }
  }

  async generateSuggestions(transcript, apiKey, { model = "llama-3.3-70b-versatile", prompt = "" } = {}) {
    try {
      const systemPrompt = prompt || `
        You are a real-time meeting copilot. 
        Analyze the transcript and provide EXACTLY 3 helpful suggestions.
        Vary the types: one question, one talking point, one fact-check or clarification.
        
        CRITICAL: Your output MUST be a JSON array of objects with these EXACT keys:
        - "title": (A short catchy header)
        - "preview": (A 1-2 sentence description)
        - "type": (Exactly one of: "question", "insight", or "clarification")

        Example:
        [
          {"title": "Project Scope", "preview": "The team mentioned a delay in Phase 1...", "type": "insight"}
        ]
      `;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: model,
          messages: [
            { role: "system", content: "You output ONLY raw JSON arrays. No conversational text." },
            { role: "user", content: `${systemPrompt}\n\nTranscript: ${transcript.slice(-2500)}` },
          ],
          temperature: 0.3, // Lower temperature for stricter adherence
        },
        { headers: this._getHeaders(apiKey) }
      );

      let content = response.data.choices[0].message.content.trim();
      
      // Senior-level robust JSON extraction
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) content = jsonMatch[0];

      try {
        let rawItems = JSON.parse(content);
        if (!Array.isArray(rawItems)) {
          // If the AI returned an object with a key like "suggestions"
          if (rawItems.suggestions) rawItems = rawItems.suggestions;
          else if (rawItems.items) rawItems = rawItems.items;
          else rawItems = [rawItems];
        }

        // NORMALIZATION LAYER (Senior Practice)
        // Maps variations (headline, text, content) back to the expected (title, preview)
        return rawItems.map(item => ({
          title: item.title || item.headline || item.topic || "Insight Found",
          preview: item.preview || item.text || item.content || "Click to expand details.",
          type: item.type || "insight",
          id: item.id || Date.now() + Math.random().toString(36).substr(2, 9)
        })).slice(0, 3);

      } catch (parseErr) {
        console.error("JSON Parse Error. Raw content:", content);
        return [
          { title: "Analyzing Meeting...", preview: "Processing the latest audio chunks for insights.", type: "insight", id: "error-" + Date.now() }
        ];
      }
    } catch (error) {
      console.error("Groq Suggestion Error:", error.response?.data || error.message);
      throw error;
    }
  }

  async chat(messages, apiKey, { model = "llama-3.3-70b-versatile" } = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model,
        messages,
        temperature: 0.5,
      }, { headers: this._getHeaders(apiKey) });
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Groq Chat Error:", error.response?.data || error.message);
      throw error;
    }
  }
}

export default new GroqService();
