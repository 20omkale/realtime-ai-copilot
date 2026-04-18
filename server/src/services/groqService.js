import axios from "axios";
import FormData from "form-data";

/**
 * GroqService handles all interactions with the Groq API.
 * Refactored for Strategic Context-Awareness and Production Stability.
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
   * Strategic Suggestion Engine
   * Generates varied, contextual insights based on the transcript history.
   */
  async generateSuggestions(transcript, apiKey, { model = "llama-3.3-70b-versatile", prompt = "" } = {}) {
    try {
      const systemPrompt = `
        You are an Elite Meeting Copilot and Strategic Advisor.
        Your task is to listen to the provided transcript and generate EXACTLY 3 high-value suggestions.
        
        CRITICAL GUIDELINES:
        1. NO GENERIC TITLES: Never use "Insight," "Question," or "Clarification" as a title. 
        2. BE SPECIFIC: Titles must use keywords directly from the conversation (e.g., "Project X Delay Impact").
        3. VARIETY: Provide a mix of:
           - A provocative question to move the meeting forward.
           - A summary of a key talking point just discussed.
           - A fact-check or clarification if someone sounds uncertain.
        4. LANGUAGE: Detect the language used in the transcript and respond in that same language.
        5. PREVIEW QUALITY: The preview must be 1-2 sentences of deep synthesis, not just a repeat of the transcript.
        
        OUTPUT FORMAT:
        Return ONLY a JSON array of objects with keys: "title", "preview", and "type".
      `;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Contextual Transcript:\n${transcript.slice(-3000)}\n\nGenerate the 3 suggestions now.` },
          ],
          temperature: 0.7, 
        },
        { headers: this._getHeaders(apiKey) }
      );

      let content = response.data.choices[0].message.content.trim();
      
      // Professional-grade JSON Extraction
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) content = jsonMatch[0];

      try {
        let items = JSON.parse(content);
        if (!Array.isArray(items)) {
          if (items.suggestions) items = items.suggestions;
          else if (items.items) items = items.items;
          else items = [items];
        }

        // Final Normalization mapping synonyms to expected keys
        return items.map(item => ({
          title: item.title || item.headline || item.topic || "Strategic Insight",
          preview: item.preview || item.text || item.content || "Contextual details provided above.",
          type: item.type || "insight",
          id: item.id || Date.now() + Math.random().toString(36).substr(2, 9)
        })).slice(0, 3);

      } catch (e) {
        console.error("AI Output Parsing Failed. RAW:", content);
        return [
          { title: "Analyzing Meeting Flow...", preview: "Processing the conversation for deep-dive suggestions.", type: "insight", id: "error-" + Date.now() }
        ];
      }
    } catch (error) {
      console.error("Groq Suggestion Error:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Detailed Chat Response Engine
   */
  async chat(messages, apiKey, { model = "llama-3.3-70b-versatile" } = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: model,
          messages,
          temperature: 0.5,
        },
        { headers: this._getHeaders(apiKey) }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Groq Chat Error:", error.response?.data || error.message);
      throw error;
    }
  }
}

export default new GroqService();
