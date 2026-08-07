import type { Doc } from "@/convex/_generated/dataModel";
import { useSpeechRecognition } from "@/hooks/use-voice";
import { ArrowUp, Mic, Sparkles, Square, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { InterviewerMark } from "./shared";

type MessageDoc = Doc<"messages">;

const MIC_ERRORS: Record<string, string> = {
  "not-allowed":
    "Microphone access was denied. Allow the mic in your browser and try again.",
  "not-found": "No microphone was found on this device.",
  "no-speech": "No speech was detected. Try speaking a little louder.",
  network: "The speech service is unavailable right now. Please retry.",
  aborted: "Recording was interrupted. Please retry.",
};

function Bubble({
  role,
  content,
  day,
  speaking,
  onToggleSpeak,
}: {
  role: "assistant" | "user";
  content: string;
  day?: number;
  speaking: boolean;
  onToggleSpeak: () => void;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground shadow-sm sm:max-w-[75%]">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <InterviewerMark className="mt-0.5" />
      <div className="max-w-[85%] sm:max-w-[80%]">
        <div
          className={cn(
            "rounded-2xl rounded-tl-sm border border-border/70 bg-card px-4 py-3 text-sm leading-relaxed shadow-sm transition-shadow",
            speaking && "border-primary/40 ring-1 ring-primary/30",
          )}
        >
          {content}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          {day && (
            <p className="text-[11px] font-medium text-muted-foreground">
              Day {day} · cohort material
            </p>
          )}
          <button
            type="button"
            onClick={onToggleSpeak}
            className={cn(
              "inline-flex size-6 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground",
              speaking && "text-primary hover:text-primary",
            )}
            aria-label={speaking ? "Stop reading aloud" : "Read this message aloud"}
            title={speaking ? "Stop reading" : "Read aloud"}
          >
            {speaking ? (
              <VolumeX className="size-3.5" />
            ) : (
              <Volume2 className="size-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <InterviewerMark className="mt-0.5" />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border/70 bg-card px-4 py-3.5 shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
            style={{ animationDelay: `${i * 0.14}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function InterviewChat({
  messages,
  pendingAnswer,
  awaitingReply,
  onSend,
  micEnabled,
  speakingId,
  onSpeak,
  onStopSpeaking,
  onMicStart,
}: {
  messages: MessageDoc[];
  pendingAnswer: string | null;
  awaitingReply: boolean;
  onSend: (answer: string) => void;
  micEnabled: boolean;
  /** _id of the assistant message currently being read aloud, if any. */
  speakingId: string | null;
  onSpeak: (content: string, messageId: string) => void;
  onStopSpeaking: () => void;
  /** Fired when the candidate starts recording so the interviewer stops talking. */
  onMicStart: () => void;
}) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const {
    supported: micSupported,
    listening,
    finalTranscript,
    interimTranscript,
    error,
    finalRef,
    start,
    stop,
  } = useSpeechRecognition();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pendingAnswer, awaitingReply, listening]);

  useEffect(() => {
    if (!error) return;
    toast.error("Voice input", {
      description: MIC_ERRORS[error] ?? "Speech recognition failed. Please retry.",
    });
  }, [error]);

  // Don't let the interviewer's narration bleed into the answer transcript.
  useEffect(() => {
    if (speakingId && listening) stop();
  }, [speakingId, listening, stop]);

  const submit = () => {
    const text = draft.trim();
    if (!text || awaitingReply) return;
    setDraft("");
    onSend(text);
  };

  const toggleMic = () => {
    if (listening) {
      stop();
      const transcript = finalRef.current.trim();
      if (transcript) setDraft(transcript);
    } else {
      onMicStart();
      start();
    }
  };

  const micUnavailable = !micEnabled || !micSupported;
  const liveTranscript = listening
    ? `${finalTranscript}${interimTranscript ? ` ${interimTranscript}` : ""}`
    : "";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          <div className="flex w-fit items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-xs text-muted-foreground shadow-sm">
            <Sparkles className="size-3.5 text-primary" />
            Answer naturally — the interviewer will follow up on what you say.
          </div>

          {messages.map((m) => (
            <Bubble
              key={m._id}
              role={m.role}
              content={m.content}
              day={m.day}
              speaking={speakingId === m._id}
              onToggleSpeak={() =>
                speakingId === m._id
                  ? onStopSpeaking()
                  : onSpeak(m.content, m._id)
              }
            />
          ))}

          {pendingAnswer && (
            <Bubble
              role="user"
              content={pendingAnswer}
              speaking={false}
              onToggleSpeak={() => {}}
            />
          )}
          {awaitingReply && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border/60 bg-background/80 p-4 backdrop-blur-sm sm:px-8">
        {listening && (
          <div className="mx-auto mb-2.5 flex max-w-3xl items-center gap-2 text-xs font-medium text-destructive">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive/50" />
              <span className="relative inline-flex size-2 rounded-full bg-destructive" />
            </span>
            Listening — speak your answer, then tap the square to finish.
          </div>
        )}
        <div className="mx-auto flex max-w-3xl items-end gap-2.5">
          <button
            type="button"
            onClick={toggleMic}
            disabled={micUnavailable || awaitingReply}
            aria-label={listening ? "Stop recording" : "Answer with your voice"}
            title={
              micUnavailable
                ? micEnabled
                  ? "Voice input isn't supported in this browser (try Chrome, Edge, or Safari)."
                  : "Voice answers are turned off in the voice settings."
                : listening
                  ? "Stop recording"
                  : "Answer with your voice"
            }
            className={cn(
              "relative flex size-12 shrink-0 items-center justify-center rounded-2xl border transition-all active:scale-95",
              listening
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-border bg-card text-muted-foreground shadow-sm hover:border-ring/50 hover:text-foreground",
              micUnavailable || awaitingReply
                ? "pointer-events-none opacity-40"
                : "cursor-pointer",
            )}
          >
            {listening && (
              <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-destructive/40" />
            )}
            {listening ? (
              <Square className="size-4 fill-current" />
            ) : (
              <Mic className="size-5" />
            )}
          </button>
          <div className="relative flex-1">
            <textarea
              value={listening ? liveTranscript : draft}
              onChange={(e) => {
                if (!listening) setDraft(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={
                awaitingReply
                  ? "The interviewer is thinking…"
                  : listening
                    ? "Listening…"
                    : micEnabled
                      ? "Type or speak your answer…"
                      : "Type your answer…"
              }
              disabled={awaitingReply}
              readOnly={listening}
              rows={1}
              className="field-sizing-content max-h-40 min-h-12 w-full resize-none rounded-2xl border border-border bg-card py-3 px-4 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
            />
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim() || awaitingReply || listening}
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            aria-label="Send answer"
          >
            <ArrowUp className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
