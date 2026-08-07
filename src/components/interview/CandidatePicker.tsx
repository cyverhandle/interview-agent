import type { Doc } from "@/convex/_generated/dataModel";
import { CANDIDATES } from "@/lib/candidates";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Clock,
  Mic,
  Repeat2,
  SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";

type InterviewDoc = Doc<"interviews">;

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function CandidateCard({
  candidate,
  starting,
  onStart,
}: {
  candidate: (typeof CANDIDATES)[number];
  starting: boolean;
  onStart: () => void;
}) {
  const completed = candidate.completedDays.length;
  const pct = Math.round((completed / 31) * 100);

  return (
    <Card className="group h-full border-border/70 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_44px_-24px_rgba(30,41,72,0.28)]">
      <CardContent className="flex h-full flex-col p-6">
        <div className="flex items-start justify-between">
          <Avatar className="size-12 rounded-xl">
            <AvatarFallback
              className="rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: candidate.tone }}
            >
              {initials(candidate.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex gap-1.5">
            {candidate.attemptedDays.length > 0 && (
              <Badge
                variant="outline"
                className="gap-1 text-[10px] text-muted-foreground"
              >
                <Repeat2 className="size-3" />
                {candidate.attemptedDays.length} retake
                {candidate.attemptedDays.length > 1 ? "s" : ""}
              </Badge>
            )}
            {candidate.skippedDays.length > 0 && (
              <Badge
                variant="outline"
                className="gap-1 text-[10px] text-muted-foreground"
              >
                <SkipForward className="size-3" />
                {candidate.skippedDays.length} skip
                {candidate.skippedDays.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        <h3 className="mt-4 text-[15px] font-semibold tracking-tight">
          {candidate.name}
        </h3>
        <p className="text-sm text-muted-foreground">{candidate.title}</p>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Cohort progress</span>
            <span className="font-medium text-foreground">
              {completed}/31 days
            </span>
          </div>
          <Progress value={pct} className="mt-1.5 h-1.5 bg-muted" />
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {candidate.signals.slice(0, 2).map((s) => (
            <span
              key={s}
              className="rounded-full bg-muted px-2 py-0.5 text-[11px] leading-4 text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-5 flex-1" />

        <Button
          className="w-full rounded-full"
          onClick={onStart}
          disabled={starting}
        >
          {starting ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Warming up…
            </>
          ) : (
            <>
              <Mic className="size-4" />
              Start interview
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export function CandidatePicker({
  recent,
  startingId,
  onStart,
  onOpenRecent,
}: {
  recent: InterviewDoc[] | undefined;
  startingId: string | null;
  onStart: (candidateId: string) => void;
  onOpenRecent: (interviewId: string) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Choose a candidate
          </h2>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
            Each profile reflects a real learning journey — completed missions,
            retakes, skipped topics and learning signals. The interviewer
            adapts to all of it.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="w-fit gap-1.5 rounded-full px-3 py-1 text-xs"
        >
          <CheckCircle2 className="size-3.5 text-primary" />
          {CANDIDATES.length} candidate profiles ready
        </Badge>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CANDIDATES.map((c) => (
          <CandidateCard
            key={c.id}
            candidate={c}
            starting={startingId === c.id}
            onStart={() => onStart(c.id)}
          />
        ))}
      </div>

      {recent && recent.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold tracking-tight">
              Recent interviews
            </h3>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.slice(0, 6).map((i) => (
              <button
                key={i._id}
                type="button"
                onClick={() => onOpenRecent(i._id)}
                className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 text-left transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <Avatar className="size-9 rounded-lg">
                  <AvatarFallback
                    className="rounded-lg text-xs font-semibold text-white"
                    style={{ backgroundColor: i.candidateTone }}
                  >
                    {initials(i.candidateName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {i.candidateName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {i.status === "completed" ? "Completed · " : "In progress · "}
                    {i.questionsAsked} question{i.questionsAsked === 1 ? "" : "s"}
                  </p>
                </div>
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    i.status === "completed"
                      ? "bg-emerald-500"
                      : "bg-amber-400",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
