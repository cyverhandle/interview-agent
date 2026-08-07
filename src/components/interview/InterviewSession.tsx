import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  isSpeechRecognitionSupported,
  useSpeechSynthesis,
} from "@/hooks/use-voice";
import { useAction, useQuery } from "convex/react";
import { FileText, Loader2, MessageSquare, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FeedbackPanel } from "./FeedbackPanel";
import { InterviewChat } from "./InterviewChat";
import { ProgressSidebar } from "./ProgressSidebar";
import type { FeedbackReport } from "./shared";

export function InterviewSession({
  interviewId,
  onExit,
}: {
  interviewId: Id<"interviews">;
  onExit: () => void;
}) {
  const interview = useQuery(api.interviewQueries.getInterview, { interviewId });
  const messages = useQuery(api.interviewQueries.getMessages, { interviewId });
  const respond = useAction(api.interviews.respond);
  const completeInterview = useAction(api.interviews.completeInterview);

  const tts = useSpeechSynthesis();
  const [micSupported] = useState<boolean>(() => isSpeechRecognitionSupported());
  const [voiceOut, setVoiceOut] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const [pending, setPending] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [mode, setMode] = useState<"feedback" | "transcript">("feedback");
  const spokenRef = useRef<Set<string>>(new Set());

  const loading = interview === undefined || messages === undefined;
  const completed = interview?.status === "completed";

  const send = async (answer: string) => {
    setPending(answer);
    try {
      const res = await respond({ interviewId, answer });
      setPending(null);
      if (res.readyToComplete) {
        toast("Coverage complete", {
          description:
            "You've asked 8+ questions across 4+ days. End the interview to generate feedback.",
        });
      }
    } catch (e) {
      setPending(null);
      toast.error(
        e instanceof Error ? e.message : "Failed to send your answer",
      );
    }
  };

  const end = async () => {
    setEnding(true);
    try {
      await completeInterview({ interviewId });
      setMode("feedback");
      toast.success("Feedback ready", {
        description: "Your structured interview report is below.",
      });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not complete the interview",
      );
    } finally {
      setEnding(false);
    }
  };

  /* ---------------- voice orchestration ---------------- */

  const handleSpeak = useCallback(
    (text: string, messageId?: string) => {
      setSpeakingId(messageId ?? null);
      tts.speak(text, () => setSpeakingId(null));
    },
    [tts.speak],
  );

  const handleStopSpeaking = useCallback(() => {
    tts.stop();
    setSpeakingId(null);
  }, [tts.stop]);

  const handleMicStart = useCallback(() => {
    // The candidate is about to answer — pause any narration so it isn't
    // picked up by the microphone.
    tts.stop();
    setSpeakingId(null);
  }, [tts.stop]);

  // Read the interviewer's latest message aloud when "read questions aloud"
  // is enabled. Each message is only spoken once per session.
  useEffect(() => {
    if (!voiceOut || completed || !tts.supported) return;
    for (let i = (messages?.length ?? 0) - 1; i >= 0; i--) {
      const m = messages![i];
      if (m.role !== "assistant" || !m.content.trim()) continue;
      if (!spokenRef.current.has(m._id)) {
        spokenRef.current.add(m._id);
        handleSpeak(m.content, m._id);
      }
      break;
    }
  }, [messages, voiceOut, completed, tts.supported, handleSpeak]);

  // Stop narrating when the interview is over.
  useEffect(() => {
    if (completed) handleStopSpeaking();
  }, [completed, handleStopSpeaking]);

  // Clean up narration when leaving the session.
  useEffect(() => () => tts.stop(), [tts.stop]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Interview not found.</p>
      </div>
    );
  }

  const feedback = interview.feedback as FeedbackReport | undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:h-[calc(100dvh-4rem)] lg:flex-row">
      {/* main column */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                completed ? "bg-emerald-500" : "bg-amber-400",
              )}
            />
            <p className="truncate text-sm font-medium">
              {completed
                ? `Interview report · ${interview.candidateName}`
                : `Live interview · ${interview.candidateName}`}
            </p>
            {interview.engine === "fallback" && (
              <span
                className="hidden rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 sm:inline"
                title="AI gateway unavailable — running on the built-in local interviewer engine"
              >
                Local engine
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Voice settings"
                  title="Voice settings"
                  className={cn(
                    "text-muted-foreground",
                    (voiceOut || tts.speaking) &&
                      "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
                  )}
                >
                  <Volume2
                    className={cn(
                      "size-4",
                      tts.speaking && "animate-pulse",
                    )}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={8} className="w-72 p-4">
                <div>
                  <p className="text-sm font-semibold tracking-tight">
                    Voice interview
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    Speak answers with your mic and hear the interviewer read
                    each message aloud.
                  </p>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Read questions aloud</p>
                      <p className="text-xs text-muted-foreground">
                        Interviewer speaks its messages
                      </p>
                    </div>
                    <Switch
                      checked={voiceOut}
                      onCheckedChange={setVoiceOut}
                      disabled={!tts.supported}
                      aria-label="Read questions aloud"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Answer by voice</p>
                      <p className="text-xs text-muted-foreground">
                        Mic button in the composer
                      </p>
                    </div>
                    <Switch
                      checked={micEnabled}
                      onCheckedChange={setMicEnabled}
                      disabled={!micSupported}
                      aria-label="Answer by voice"
                    />
                  </div>
                </div>
                {(!tts.supported || !micSupported) && (
                  <p className="mt-3 border-t border-border/60 pt-3 text-[11px] leading-4 text-muted-foreground">
                    {!tts.supported && "Speech output isn't available here. "}
                    {!micSupported &&
                      "Voice input needs Chrome, Edge, or Safari."}
                  </p>
                )}
                {(voiceOut || micEnabled) && tts.supported && micSupported && (
                  <p className="mt-3 border-t border-border/60 pt-3 text-[11px] leading-4 text-muted-foreground">
                    The interviewer pauses while you speak — starting the mic
                    stops any narration automatically.
                  </p>
                )}
              </PopoverContent>
            </Popover>
            {completed && (
              <div className="flex items-center gap-1 rounded-full bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setMode("feedback")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                    mode === "feedback"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <FileText className="size-3.5" />
                  Feedback
                </button>
                <button
                  type="button"
                  onClick={() => setMode("transcript")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                    mode === "transcript"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <MessageSquare className="size-3.5" />
                  Transcript
                </button>
              </div>
            )}
          </div>
        </div>

        {completed && mode === "feedback" && feedback ? (
          <FeedbackPanel feedback={feedback} />
        ) : (
          <InterviewChat
            messages={messages ?? []}
            pendingAnswer={pending}
            awaitingReply={pending !== null || ending}
            onSend={send}
            micEnabled={micEnabled}
            speakingId={speakingId}
            onSpeak={handleSpeak}
            onStopSpeaking={handleStopSpeaking}
            onMicStart={handleMicStart}
          />
        )}
      </div>

      {/* progress rail */}
      <div className="order-first w-full shrink-0 border-b border-border/60 lg:order-none lg:w-80 lg:border-b-0">
        <ProgressSidebar
          interview={interview}
          ending={ending}
          onEnd={end}
          onExit={onExit}
        />
      </div>
    </div>
  );
}
