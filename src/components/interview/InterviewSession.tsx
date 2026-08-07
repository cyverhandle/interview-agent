import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAction, useQuery } from "convex/react";
import { FileText, Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";
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

  const [pending, setPending] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [mode, setMode] = useState<"feedback" | "transcript">("feedback");

  const loading = interview === undefined || messages === undefined;

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

  const completed = interview.status === "completed";
  const feedback = interview.feedback as FeedbackReport | undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:h-[calc(100dvh-4rem)] lg:flex-row">
      {/* main column */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "size-2 rounded-full",
                completed ? "bg-emerald-500" : "bg-amber-400",
              )}
            />
            <p className="text-sm font-medium">
              {completed
                ? `Interview report · ${interview.candidateName}`
                : `Live interview · ${interview.candidateName}`}
            </p>
            {interview.engine === "fallback" && (
              <span
                className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400"
                title="AI gateway unavailable — running on the built-in local interviewer engine"
              >
                Local engine
              </span>
            )}
          </div>
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

        {completed && mode === "feedback" && feedback ? (
          <FeedbackPanel feedback={feedback} />
        ) : (
          <InterviewChat
            messages={messages ?? []}
            pendingAnswer={pending}
            awaitingReply={pending !== null || ending}
            onSend={send}
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
