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

  /**
   * High-Quality Suggestion Strategy
   * Focuses on contextual deep-analysis and creative insights.
   */
  async generateSuggestions(transcript, apiKey, { model = "llama-3.3-70b-versatile", prompt = "" } = {}) {
    try {
      // PROMPT UPGRADE: Focus on quality and context, remove mimicry examples.
      const systemPrompt = prompt || `
        You are a Top-Tier Meeting Consultant. 
        Your goal is to analyze transcripts and provide 3 highly specific, creative, and ACTIONABLE insights.
        
        RULES:
        1. NEVER use generic titles like "Insight Found" or "Talking Point".
        2. Create titles that specifically wrap the keywords of the conversation.
        3. Preview must be 1-2 sentences of deep reasoning.
        4. Detect the language of the transcript and respond in that same language.
        
        OUTPUT FORMAT:
        You must return ONLY a JSON array with these keys: 
        "title" (catchy, specific), "preview" (detailed), and "type" (one of: question, insight, clarification).
      `;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: model,
          messages: [
            { role: "system", content: "You are a professional assistant that outputs ONLY raw JSON arrays. Do not apologize or explain." },
            { role: "user", content: `${systemPrompt}\n\nTranscript: ${transcript.slice(-3000)}` },
          ],
          temperature: 0.8, // Increased for better creative analysis
        },
        { headers: this._getHeaders(apiKey) }
      );

      let content = response.data.choices[0].message.content.trim();
      
      // Extract array
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) content = jsonMatch[0];

      try {
        let rawItems = JSON.parse(content);
        if (!Array.isArray(rawItems)) {
          if (rawItems.suggestions) rawItems = rawItems.suggestions;
          else if (rawItems.items) rawItems = rawItems.items;
          else rawItems = [rawItems];
        }

        // Final Normalization for any key mismatches
        return rawItems.map(item => ({
          title: item.title || item.headline || item.topic || "Discussion Analysis",
          preview: item.preview || item.text || item.content || "Contextual details found in transcript.",
          type: item.type || "insight",
          id: item.id || Date.now() + Math.random().toString(36).substr(2, 9)
        })).slice(0, 3);

      } catch (parseErr) {
        console.error("Parse Error. Raw was:", content);
        return [
          { title: "Analyzing Meeting...", preview: "Processing the latest audio stream for insights.", type: "insight", id: "err-" + Date.now() }
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
