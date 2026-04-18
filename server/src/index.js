const express = require("express");
const cors = require("cors");
const transcribeRoute = require("./routes/transcribe");
const suggestRoute = require("./routes/suggest");
const chatRoute = require("./routes/chat");

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS Configuration for Production Security
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/transcribe", transcribeRoute);
app.use("/api/suggest", suggestRoute);
app.use("/api/chat", chatRoute);

// Favicon handler to clean up logs
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({ status: "online", version: "1.0.0" });
});

// STARTUP WRAPPER
// Keeps the process alive and provides senior-level diagnostics.
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("\n🚀 TwinMind Backend Active");
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔒 Allowed Origin: ${corsOptions.origin}`);
  console.log(`🕒 Started at: ${new Date().toLocaleTimeString()}\n`);
});

// HEARTBEAT Logic (Prevents premature exits in restricted environments)
setInterval(() => {
  if (server.listening) {
    // Healthy
  }
}, 30000);

// GLOBAL EXCEPTION HANDLERS (Senior Practice)
process.on("uncaughtException", (err) => {
  console.error("❌ CRITICAL UNCAUGHT ERROR:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("⚠️ UNHANDLED PROMISE REJECTION:", reason);
});