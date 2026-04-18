import express from "express";
import groqService from "../services/groqService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { messages, model } = req.body;
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) return res.status(401).json({ error: "API Key required" });
    if (!messages || !messages.length) return res.status(400).json({ error: "Messages required" });

    const content = await groqService.chat(messages, apiKey, { 
      model: model || "llama-3.3-70b-versatile" 
    });

    res.json({ content });
  } catch (err) {
    console.error("Chat Route Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;