import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Layers,
  MessageSquare,
  Mic,
  Rocket,
  Sparkles,
  Target,
} from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/logo.svg";
import { MODULES } from "@/lib/curriculum";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const STEPS = [
  {
    icon: Target,
    step: "01",
    title: "Pick a candidate profile",
    body: "Choose a cohort participant. Their completed missions, retakes and skipped days shape everything the interviewer asks.",
  },
  {
    icon: MessageSquare,
    step: "02",
    title: "Face an adaptive interview",
    body: "A senior AI interviewer probes what they've built. Vague answer? It digs deeper. Strong answer? It pivots to design tradeoffs.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Get structured feedback",
    body: "A full scorecard — conceptual depth, system design, communication — with strengths, gaps and actionable next steps.",
  },
];

const FEATURES = [
  {
    icon: Bot,
    title: "Adaptive questioning",
    body: "Every question builds on the last answer. The interviewer switches between concept checks, debugging scenarios and design discussions in real time.",
  },
  {
    icon: Layers,
    title: "Curriculum-grounded",
    body: "Questions are anchored to the 31-day cohort curriculum — never testing what a candidate hasn't covered, and gently probing what they skipped.",
  },
  {
    icon: BrainCircuit,
    title: "Context-aware follow-ups",
    body: "The agent holds the whole conversation in mind, referencing your earlier answers and asking the follow-up a human interviewer would.",
  },
  {
    icon: Sparkles,
    title: "Structured feedback",
    body: "Interviews close with a scored report across five engineering dimensions, plus concrete improvements for the real interview.",
  },
];

function ChatMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/12 via-primary/4 to-transparent blur-2xl" />
      <Card className="border-border/70 shadow-[0_24px_60px_-24px_rgba(30,41,72,0.25)]">
        <CardContent className="p-5 sm:p-6">
          {/* header */}
          <div className="flex items-center justify-between border-b border-border/70 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">
                  Interview Agent
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Live · Emily Chen · Day 10/31
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              6 questions
            </div>
          </div>

          {/* transcript */}
          <div className="flex flex-col gap-4 py-5">
            <div className="flex gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="size-3.5" />
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm leading-relaxed">
                You retook the embeddings day before it clicked. Walk me
                through what changed the second time around.
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground">
                Once I stopped picturing cosine similarity as distance and
                started seeing it as alignment, the whole pipeline made sense.
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="size-3.5" />
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm leading-relaxed">
                Good framing. You skipped hybrid search — if a user searches an
                order ID and gets nothing, where do you start debugging?{" "}
                <span className="inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse rounded-full bg-primary/60" />
              </div>
            </div>
          </div>

          {/* input */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
            <Mic className="size-4 shrink-0 text-muted-foreground/60" />
            <span className="flex-1 text-sm text-muted-foreground/70">
              Type your answer…
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ArrowRight className="size-3.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ------------------------------------------------ Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="Interview Agent"
              width={30}
              height={30}
              className="rounded-lg"
            />
            <span className="text-[15px] font-semibold tracking-tight">
              Interview Agent
            </span>
            <Badge variant="outline" className="ml-1 hidden text-[10px] sm:inline-flex">
              AI Cohort
            </Badge>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a
              href="#curriculum"
              className="transition-colors hover:text-foreground"
            >
              Curriculum
            </a>
          </nav>
          <Button asChild size="sm" className="rounded-full px-4">
            <Link to="/dashboard">
              Launch studio
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      {/* ------------------------------------------------ Hero */}
      <section className="bg-grid mask-fade-radial relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="max-w-xl"
          >
            <motion.div variants={fadeUp}>
              <Badge className="mb-5 rounded-full border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <Sparkles className="size-3 text-primary" />
                31-day AI Cohort · Interview practice
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-[3.4rem]"
            >
              Build the{" "}
              <span className="text-primary">interviewer</span>, not the
              interview.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-lg text-pretty text-base leading-7 text-muted-foreground sm:text-lg"
            >
              A conversational AI that conducts real technical interviews with
              your cohort candidates — grounded in what they actually built,
              adapting to every answer, and closing with actionable feedback.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button asChild size="lg" className="rounded-full px-6">
                <Link to="/dashboard">
                  Start an interview
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                <a href="#how">See how it works</a>
              </Button>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-muted-foreground"
            >
              {[
                ["31", "curriculum days"],
                ["8", "AI modules"],
                ["20", "candidate profiles"],
                ["8+", "questions per run"],
              ].map(([num, label]) => (
                <div key={label} className="flex items-baseline gap-1.5">
                  <span className="text-lg font-semibold text-foreground">
                    {num}
                  </span>
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <ChatMockup />
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------ How it works */}
      <section id="how" className="border-t border-border/60">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              How it works
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              From cohort progress to interview readiness
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              The agent reads each candidate's learning journey, then runs an
              interview the way a senior engineer would.
            </p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card className="h-full border-border/70 transition-shadow duration-300 hover:shadow-[0_16px_40px_-20px_rgba(30,41,72,0.25)]">
                  <CardContent className="p-7">
                    <div className="flex items-center justify-between">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <s.icon className="size-5" />
                      </div>
                      <span className="text-sm font-semibold tracking-tight text-border">
                        {s.step}
                      </span>
                    </div>
                    <h3 className="mt-6 text-lg font-semibold tracking-tight">
                      {s.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-6 text-muted-foreground">
                      {s.body}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Features */}
      <section
        id="features"
        className="border-t border-border/60 bg-gradient-to-b from-muted/40 to-background"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Why it feels real
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              An interviewer with context, not a script
            </h2>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card className="h-full border-border/70 bg-background/70 shadow-sm">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <f.icon className="size-5" />
                    </div>
                    <h3 className="mt-5 text-[15px] font-semibold tracking-tight">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {f.body}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Curriculum */}
      <section id="curriculum" className="border-t border-border/60">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                The curriculum
              </p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Every question grounded in the 31-day journey
              </h2>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/dashboard">
                Practice with a profile
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="group flex h-full flex-col rounded-xl border border-border/70 bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_32px_-16px_rgba(30,41,72,0.25)]">
                  <div className="flex items-center justify-between">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CalendarDays className="size-4" />
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      Days {m.days[0]}–{m.days[1]}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold tracking-tight">
                    {m.name}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm leading-6 text-muted-foreground">
                    {m.focus}
                  </p>
                </div>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex h-full flex-col justify-between rounded-xl border border-dashed border-border bg-muted/30 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Rocket className="size-4" />
                  </div>
                  <p className="text-sm font-medium">
                    Twenty real candidate journeys
                  </p>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  From first-try perfectionists to candidates who skipped entire
                  modules — different completion rates, retakes and learning
                  signals make every interview run a fresh challenge.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ CTA */}
      <section className="border-t border-border/60">
        <div className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8 sm:pb-24">
          <div className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-16 text-center text-background sm:px-16">
            <div className="bg-grid mask-fade-radial absolute inset-0 opacity-[0.15]" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                See who's ready for the real interview
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-6 opacity-80 sm:text-base">
                Open the studio, pick a candidate, and run a live adaptive
                interview in under a minute.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-background text-foreground hover:bg-background/90"
                >
                  <Link to="/dashboard">
                    Open the interview studio
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="Interview Agent"
              width={22}
              height={22}
              className="rounded-md"
            />
            <span className="text-sm font-semibold tracking-tight">
              Interview Agent
            </span>
            <span className="text-sm text-muted-foreground">
              · The AI Cohort
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Official AI Cohort curriculum & candidate data · Built for
            interview practice
          </p>
        </div>
      </footer>
    </div>
  );
}
