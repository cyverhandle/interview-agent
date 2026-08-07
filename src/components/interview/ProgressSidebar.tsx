import type { Doc } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, FileText, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayChip } from "./shared";

type InterviewDoc = Doc<"interviews">;

const MIN_QUESTIONS = 8;
const MIN_DAYS = 4;

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ProgressSidebar({
  interview,
  ending,
  onEnd,
  onExit,
}: {
  interview: InterviewDoc;
  ending: boolean;
  onEnd: () => void;
  onExit: () => void;
}) {
  const questions = interview.questionsAsked;
  const days = interview.daysCovered;
  const qPct = Math.min(100, Math.round((questions / MIN_QUESTIONS) * 100));
  const dPct = Math.min(100, Math.round((days.length / MIN_DAYS) * 100));
  const ready = questions >= MIN_QUESTIONS && days.length >= MIN_DAYS;
  const complete = interview.status === "completed";

  return (
    <div className="flex h-full flex-col gap-4 border-r border-border/60 bg-card/40 p-4 lg:p-5">
      {/* candidate snapshot */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 rounded-xl">
            <AvatarFallback
              className="rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: interview.candidateTone }}
            >
              {initials(interview.candidateName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">
              {interview.candidateName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {interview.candidateTitle}
            </p>
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {interview.candidateBio}
        </p>
      </div>

      {/* coverage */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Coverage
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Questions</span>
              <span className="font-semibold tabular-nums">
                {questions}
                <span className="text-muted-foreground">/{MIN_QUESTIONS}</span>
              </span>
            </div>
            <Progress value={qPct} className="mt-1.5 h-1.5" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Days covered</span>
              <span className="font-semibold tabular-nums">
                {days.length}
                <span className="text-muted-foreground">/{MIN_DAYS}</span>
              </span>
            </div>
            <Progress value={dPct} className="mt-1.5 h-1.5" />
          </div>
        </div>

        {days.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {days.map((d) => (
              <DayChip key={d} day={d} />
            ))}
          </div>
        )}

        <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
          {[
            { met: questions >= MIN_QUESTIONS, label: `At least ${MIN_QUESTIONS} questions` },
            { met: days.length >= MIN_DAYS, label: `Across ${MIN_DAYS}+ curriculum days` },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-2 text-xs">
              {r.met ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="size-4 shrink-0 text-muted-foreground/40" />
              )}
              <span
                className={cn(
                  r.met ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {r.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* actions */}
      <div className="mt-auto space-y-2.5">
        {!complete ? (
          <Button
            className="w-full rounded-full"
            onClick={onEnd}
            disabled={!ready || ending}
            title={
              ready
                ? "End the interview and generate feedback"
                : "Keep going — more coverage is needed before feedback"
            }
          >
            {ending ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Writing feedback…
              </>
            ) : (
              <>
                <FileText className="size-4" />
                End & get feedback
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-4" />
            Interview complete
          </div>
        )}
        <Button variant="outline" className="w-full rounded-full" onClick={onExit}>
          <RefreshCw className="size-4" />
          New interview
        </Button>
      </div>
    </div>
  );
}
