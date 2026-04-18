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

  /**
   * Helper to get common headers
   */
  _getHeaders(apiKey, contentType = "application/json") {
    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": contentType,
    };
  }

  /**
   * Transcribe audio using Whisper Large V3
   */
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
   * Generate suggestions based on context
   */
  async generateSuggestions(transcript, apiKey, { model = "llama-3.3-70b-versatile", prompt = "" } = {}) {
    try {
      const systemPrompt = prompt || `
        You are a real-time meeting copilot. 
        Analyze the transcript and provide EXACTLY 3 helpful suggestions.
        Vary the types: one question, one talking point, one fact-check or clarification.
        Return ONLY valid JSON in the format:
        [
          { "title": "Heading", "preview": "Short takeaway...", "type": "question|insight|clarification" },
          ...
        ]
      `;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: model,
          messages: [
            { role: "system", content: "You are a professional assistant that outputs only valid JSON arrays." },
            { role: "user", content: `${systemPrompt}\n\nTranscript: ${transcript.slice(-2000)}` },
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }, // Use JSON mode if supported by model, though array is tricky in some JSON modes
        },
        { headers: this._getHeaders(apiKey) }
      );

      let content = response.data.choices[0].message.content;
      
      // Basic cleanup in case of markdown wrap
      if (content.includes("```")) {
        content = content.replace(/```json|```/g, "").trim();
      }

      return JSON.parse(content);
    } catch (error) {
      console.error("Groq Suggestion Error:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * General Chat completion for detailed answers
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
