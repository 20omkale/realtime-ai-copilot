import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";

import groqService from "../services/groqService.js";

const router = express.Router();
const upload = multer();

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) return res.status(401).json({ error: "API Key required" });

    const text = await groqService.transcribe(req.file.buffer, apiKey);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;