import { Lightbulb, TrendingUp, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayChip, VERDICTS, type FeedbackReport } from "./shared";

function ScoreRing({
  score,
  toneClass,
}: {
  score: number;
  toneClass: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const r = 54;
  const c = 2 * Math.PI * r;
  const filled = (clamped / 100) * c;

  return (
    <div className="relative size-36">
      <svg viewBox="0 0 128 128" className="size-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          strokeWidth="10"
          className="stroke-border/70"
        />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
          className={cn("transition-all duration-700", toneClass)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums tracking-tight">
          {clamped}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          / 100
        </span>
      </div>
    </div>
  );
}

export function FeedbackPanel({ feedback }: { feedback: FeedbackReport }) {
  const verdict = VERDICTS[feedback.verdict] ?? VERDICTS.lean_hire;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-8 sm:px-8">
        {/* header card */}
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
            <ScoreRing
              score={feedback.overallScore}
              toneClass={verdict.ring}
            />
            <div className="text-center sm:text-left">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                  verdict.chip,
                )}
              >
                <Trophy className="size-3.5" />
                {verdict.label}
              </span>
              <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
                Interview feedback
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {feedback.summary}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                {feedback.topicsCovered?.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* scorecard */}
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold tracking-tight">
            Scorecard
          </h3>
          <div className="mt-5 space-y-4">
            {feedback.scorecard?.map((row) => (
              <div key={row.dimension}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{row.dimension}</span>
                  <span className="font-semibold tabular-nums">
                    {Math.round(row.score)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/80 transition-all duration-700"
                    style={{ width: `${Math.max(0, Math.min(100, row.score))}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                  {row.note}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* strengths */}
          <div className="rounded-3xl border border-emerald-500/20 bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <TrendingUp className="size-4 text-emerald-500" />
              Strengths
            </h3>
            <ul className="mt-4 space-y-3">
              {feedback.strengths?.map((s) => (
                <li
                  key={s}
                  className="flex gap-2.5 text-sm leading-6 text-muted-foreground"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* improvements */}
          <div className="rounded-3xl border border-amber-500/20 bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Lightbulb className="size-4 text-amber-500" />
              To improve
            </h3>
            <ul className="mt-4 space-y-3">
              {feedback.improvements?.map((s) => (
                <li
                  key={s}
                  className="flex gap-2.5 text-sm leading-6 text-muted-foreground"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* coverage footer */}
        {feedback.daysCovered && feedback.daysCovered.length > 0 && (
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold tracking-tight">
              Days covered
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {feedback.daysCovered.map((d) => (
                <DayChip key={d} day={d} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
