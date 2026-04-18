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
        Return ONLY a raw JSON array in this format:
        [
          { "title": "Heading", "preview": "Short takeaway...", "type": "question|insight|clarification" }
        ]
      `;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: model,
          messages: [
            { role: "system", content: "You are a professional assistant that outputs ONLY valid JSON. No conversational filler." },
            { role: "user", content: `${systemPrompt}\n\nTranscript: ${transcript.slice(-2500)}` },
          ],
          temperature: 0.5,
          // JSON mode is disabled here to favor raw array extraction which is more flexible across models
        },
        { headers: this._getHeaders(apiKey) }
      );

      let content = response.data.choices[0].message.content.trim();
      
      // Senior-level robust JSON extraction (handles markdown and text wrapping)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }

      try {
        return JSON.parse(content);
      } catch (parseErr) {
        console.error("JSON Parse Error. Raw content:", content);
        // Fallback for malformed AI output
        return [
          { title: "Context analyzing...", preview: "I'm still processing the conversation flow.", type: "insight" }
        ];
      }
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
