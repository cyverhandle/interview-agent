import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { dayTopic } from "@/lib/curriculum";

/** Client-side shape of the structured feedback produced by the engine. */
export interface FeedbackReport {
  overallScore: number;
  verdict: "strong_hire" | "hire" | "lean_hire" | "not_now";
  summary: string;
  strengths: string[];
  improvements: string[];
  scorecard: { dimension: string; score: number; note: string }[];
  topicsCovered: string[];
  questionsAsked?: number;
  daysCovered?: number[];
}

export const VERDICTS: Record<
  FeedbackReport["verdict"],
  { label: string; chip: string; ring: string }
> = {
  strong_hire: {
    label: "Strong hire",
    chip: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
    ring: "text-emerald-500",
  },
  hire: {
    label: "Hire",
    chip: "bg-sky-500/12 text-sky-700 dark:text-sky-400",
    ring: "text-sky-500",
  },
  lean_hire: {
    label: "Lean hire",
    chip: "bg-amber-500/12 text-amber-700 dark:text-amber-400",
    ring: "text-amber-500",
  },
  not_now: {
    label: "Not now",
    chip: "bg-rose-500/12 text-rose-700 dark:text-rose-400",
    ring: "text-rose-500",
  },
};

export function InterviewerMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm",
        className,
      )}
    >
      <Bot className="size-4" />
    </div>
  );
}

export function DayChip({ day }: { day: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <span className="size-1.5 rounded-full bg-primary/70" />
      D{day} · {dayTopic(day)}
    </span>
  );
}
