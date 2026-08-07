import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CandidatePicker } from "@/components/interview/CandidatePicker";
import { InterviewSession } from "@/components/interview/InterviewSession";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useAction, useQuery } from "convex/react";
import { LogOut, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const startInterview = useAction(api.interviews.startInterview);
  const recent = useQuery(api.interviewQueries.listInterviews);

  const [activeInterviewId, setActiveInterviewId] = useState<
    Id<"interviews"> | null
  >(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleStart = async (candidateId: string) => {
    setStartingId(candidateId);
    try {
      const res = await startInterview({ candidateId });
      setActiveInterviewId(res.interviewId);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not start the interview",
      );
    } finally {
      setStartingId(null);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* app bar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-5 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <MessageSquareText className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">
              Interview Studio
            </p>
            <p className="text-xs text-muted-foreground">
              {activeInterviewId
                ? "Live session"
                : "AI Cohort · pick a candidate to begin"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user?.name ?? "Interviewer"}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleSignOut}
            title="Sign out"
            className="text-muted-foreground"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {/* content */}
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden">
        {activeInterviewId ? (
          <InterviewSession
            interviewId={activeInterviewId}
            onExit={() => setActiveInterviewId(null)}
          />
        ) : (
          <CandidatePicker
            recent={recent}
            startingId={startingId}
            onStart={handleStart}
            onOpenRecent={(id) => setActiveInterviewId(id as Id<"interviews">)}
          />
        )}
      </main>
    </div>
  );
}
