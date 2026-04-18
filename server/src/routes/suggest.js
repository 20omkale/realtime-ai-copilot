import express from "express";
import groqService from "../services/groqService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { transcript, model, prompt } = req.body;
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) return res.status(401).json({ error: "API Key required" });
    if (!transcript) return res.json([]);

    const suggestions = await groqService.generateSuggestions(transcript, apiKey, { 
      model: model || "llama-3.3-70b-versatile", 
      prompt 
    });

    res.json(suggestions);
  } catch (err) {
    console.error("Suggest Route Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;