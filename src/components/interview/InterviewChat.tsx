import type { Doc } from "@/convex/_generated/dataModel";
import { ArrowUp, Mic, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { InterviewerMark } from "./shared";

type MessageDoc = Doc<"messages">;

function Bubble({
  role,
  content,
  day,
}: {
  role: "assistant" | "user";
  content: string;
  day?: number;
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
        <div className="rounded-2xl rounded-tl-sm border border-border/70 bg-card px-4 py-3 text-sm leading-relaxed shadow-sm">
          {content}
        </div>
        {day && (
          <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
            Day {day} · cohort material
          </p>
        )}
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
}: {
  messages: MessageDoc[];
  pendingAnswer: string | null;
  awaitingReply: boolean;
  onSend: (answer: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pendingAnswer, awaitingReply]);

  const submit = () => {
    const text = draft.trim();
    if (!text || awaitingReply) return;
    setDraft("");
    onSend(text);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-xs text-muted-foreground shadow-sm w-fit">
            <Sparkles className="size-3.5 text-primary" />
            Answer naturally — the interviewer will follow up on what you say.
          </div>

          {messages.map((m) => (
            <Bubble
              key={m._id}
              role={m.role}
              content={m.content}
              day={m.day}
            />
          ))}

          {pendingAnswer && (
            <Bubble role="user" content={pendingAnswer} />
          )}
          {awaitingReply && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border/60 bg-background/80 p-4 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-3xl items-end gap-2.5">
          <div className="relative flex-1">
            <Mic className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={
                awaitingReply
                  ? "The interviewer is thinking…"
                  : "Type your answer…"
              }
              disabled={awaitingReply}
              rows={1}
              className="field-sizing-content max-h-40 min-h-12 w-full resize-none rounded-2xl border border-border bg-card py-3 pl-10 pr-4 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
            />
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim() || awaitingReply}
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
