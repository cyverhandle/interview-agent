import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Minimal typings for the experimental Web Speech APIs                */
/* ------------------------------------------------------------------ */

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: { transcript: string; confidence: number };
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function getSpeechRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognition() !== null;
}

/* ------------------------------------------------------------------ */
/* Speech synthesis (reading text aloud)                               */
/* ------------------------------------------------------------------ */

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let cachedVoice: SpeechSynthesisVoice | null = null;

/** Pick a pleasant English voice, preferring local (offline) US/UK voices. */
function pickVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  if (cachedVoice && voices.includes(cachedVoice)) return cachedVoice;
  const preferred =
    voices.find((v) => /^en(-|_)?(US|GB)/i.test(v.lang) && v.localService) ??
    voices.find((v) => v.lang.toLowerCase().startsWith("en")) ??
    voices[0];
  cachedVoice = preferred;
  return preferred;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    cachedVoice = null;
    pickVoice();
  });
}

/** Speak text out loud, cancelling anything currently playing. */
export function speak(
  text: string,
  options?: { rate?: number; pitch?: number; onEnd?: () => void },
): void {
  if (!isSpeechSynthesisSupported() || !text.trim()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = options?.rate ?? 1;
  utterance.pitch = options?.pitch ?? 1;
  utterance.onend = () => options?.onEnd?.();
  utterance.onerror = () => options?.onEnd?.();
  synth.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/**
 * Transcribe the candidate's spoken answer using the browser's
 * speech-recognition engine. Recognized text is exposed live so the UI
 * can show it in the composer while the candidate is still talking.
 */
export function useSpeechRecognition() {
  const [supported] = useState<boolean>(() => isSpeechRecognitionSupported());
  const [listening, setListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef("");

  const start = useCallback(() => {
    const recognition = getSpeechRecognition();
    if (!recognition) return;
    recognitionRef.current?.abort();
    finalRef.current = "";
    setFinalTranscript("");
    setInterimTranscript("");
    setError(null);

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalRef.current = `${finalRef.current} ${transcript}`.trim();
          setFinalTranscript(finalRef.current);
        } else {
          interim += transcript;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      setError(event.error);
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    try {
      recognition.start();
    } catch {
      setError("not-allowed");
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  return {
    supported,
    listening,
    finalTranscript,
    interimTranscript,
    error,
    finalRef,
    start,
    stop,
  };
}

/** Speak text aloud and track whether speech is currently playing. */
export function useSpeechSynthesis() {
  const [supported] = useState<boolean>(() => isSpeechSynthesisSupported());
  const [speaking, setSpeaking] = useState(false);

  const speakText = useCallback((text: string, onEnd?: () => void) => {
    speak(text, {
      onEnd: () => {
        setSpeaking(false);
        onEnd?.();
      },
    });
    setSpeaking(true);
  }, []);

  const stop = useCallback(() => {
    stopSpeaking();
    setSpeaking(false);
  }, []);

  useEffect(() => () => stopSpeaking(), [stop]);

  return { supported, speaking, speak: speakText, stop };
}
