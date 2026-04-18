import { useRef } from "react";
import { useAppStore } from "../store/useAppStore";
import axios from "axios";
import { API_URL } from "../config";

/**
 * useRecorder handles logic for audio capture, chunking, and triggering AI services.
 * Implements the 30-second logic required by the assignment with robust error reporting.
 */
export const useRecorder = () => {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  
  const { apiKey, addTranscript, addSuggestions, setRecording, setMicError, settings } = useAppStore();

  const processChunk = async (blob) => {
    if (!apiKey) return;

    try {
      const formData = new FormData();
      formData.append("file", blob, "audio.webm");

      const transcribeRes = await axios.post(`${API_URL}/api/transcribe`, formData, {
        headers: { "x-api-key": apiKey },
      });

      const newText = transcribeRes.data.text;
      if (!newText || newText.trim().length < 2) return;

      addTranscript(newText);

      const fullTranscript = [...useAppStore.getState().transcript, newText].join(" ");
      
      const suggestRes = await axios.post(`${API_URL}/api/suggest`, {
        transcript: fullTranscript,
        model: settings.suggestionModel,
        prompt: settings.suggestionPrompt
      }, {
        headers: { "x-api-key": apiKey }
      });

      if (suggestRes.data && Array.isArray(suggestRes.data)) {
        addSuggestions(suggestRes.data);
      }

    } catch (error) {
      console.error("Error processing audio chunk:", error);
    }
  };

  const startRecording = async () => {
    try {
      setMicError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(err => {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          throw new Error('denied');
        }
        throw new Error('unavailable');
      });

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        processChunk(blob);
        audioChunksRef.current = [];
      };

      mediaRecorder.start();
      setRecording(true);

      const triggerNextChunk = () => {
        timerRef.current = setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.start();
            triggerNextChunk();
          }
        }, 30000);
      };

      triggerNextChunk();

    } catch (err) {
      console.error("Mic error:", err.message);
      setMicError(err.message === 'denied' ? 'denied' : 'unavailable');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setRecording(false);
  };

  return { startRecording, stopRecording };
};