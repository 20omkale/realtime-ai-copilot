# 🚀 TwinMind Live Copilot

![Architecture](https://img.shields.io/badge/Architecture-Clean%20Service%20Layer-blue)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20Groq-green)
![Design](https://img.shields.io/badge/Design-Glassmorphism-purple)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

> **Official Senior Developer Submission**: A production-grade AI meeting assistant that handles real-time audio orchestration, stateful deduplication, and contextual AI insights.

---

## 📽️ Project Overview
TwinMind Live is an AI-powered meeting companion that transcribes live audio in 30-second intervals, generates context-aware suggestions, and provides a continuous chat interface for deep-dive queries.

### ✨ Key Senior Features
- **Deterministic 30s Record Cycle**: A robust, battery-tested recursive system for consistent audio chunking.
- **Stateful Deduplication Engine**: Prevents expensive and redundant AI chat queries by tracking suggestion IDs across the session.
- **System Heartbeat & Health Banners**: Proactive frontend monitoring of backend connectivity.
- **Optimistic UI Execution**: Instant user feedback in the chat panel with asynchronous backend validation.

---

## 🛠️ Stack Choices & Rationale
We selected a modern, high-performance stack to handle the low-latency requirements of a live copilot:

| Technology | Rationale |
| :--- | :--- |
| **React + Vite** | Blazing fast HMR and optimized build cycles for real-time UI development. |
| **Node.js (Express)** | Proven asynchronous performance for handling simultaneous transcription and AI completion requests. |
| **Zustand** | Light-weight, high-performance store state management. Scalable without the boilerplate of Redux. |
| **Groq (Whisper V3)** | Selected for industry-leading transcription speed (SOTA accuracy with <1s latency). |
| **Llama 3.3 (70B)** | Chosen for its superior reasoning in context-aware meeting summaries and chat. |

---

## 🤖 Prompt Strategy & AI Engineering
The AI interaction is governed by specialized system prompts designed for "Meeting Context":

### 1. Suggestion Generation
- **Strategy**: Zero-shot JSON orchestration. 
- **Goal**: Force the model to return exactly 3 varied insights (Question, Talking Point, Clarification).
- **Constraints**: Stripped of conversational filler to ensure the UI can parse and render suggestions instantly.

### 2. Live Chat Assistant
- **Strategy**: Contextual RAG (Sliding Window).
- **Goal**: Uses the most recent 1500 characters of transcripts as a "primary context" to answer user queries without exceeding token limits or losing focus.

---

## ⚖️ Technical Tradeoffs
- **WebM vs WAV**: We chose WebM for audio chunking to minimize data transfer size, prioritizing speed over raw audio fidelity (which Whisper handles perfectly).
- **Polling vs WebSockets**: For this assignment's scale, we used polished HTTP Polling for health checks to maintain simplicity and reliability without the overhead of WebSocket state management on short-lived backend processes.
- **Zustand vs LocalState**: Centralized all AI data in Zustand to enable cross-panel deduplication, choosing it over React Context to avoid unnecessary re-renders.

---

## 🚀 Setup & Installation

### 1. Backend
```bash
cd server
npm install
# Create .env based on .env.example
node src/index.js
```

### 2. Frontend
```bash
cd client
npm install
# Create .env based on .env.example
npm run dev
```

---

## ☁️ Cloud Deployment
- **Frontend**: Deployed via Vercel for high-availability.
- **Backend**: Deployed via Render/Railway with environment variable support for dynamic CORS.

---

**Developed with ❤️ by Om Kale (Senior Full-Stack Submission).**