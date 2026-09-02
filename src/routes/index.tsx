import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Target, FileText, BarChart3, Bot, Workflow, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { GradientOrbs } from "@/components/GradientOrbs";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerForge AI — AI Job Application Copilot" },
      { name: "description", content: "Analyze JDs, tailor resumes, generate cover letters, score ATS match, and track every application — all powered by AI." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Sparkles, title: "JD Analyzer", desc: "Extract role, ATS keywords, tools, soft skills, difficulty & competition from any job post." },
  { icon: Target, title: "ATS Match Engine", desc: "Score your resume against the JD. See missing keywords, weak areas and prioritized fixes." },
  { icon: FileText, title: "Resume Tailoring", desc: "AI rewrites your summary, skills and bullets with stronger verbs and quantified impact." },
  { icon: Bot, title: "Cover Letters", desc: "Six tones × three lengths. Editable, downloadable, saved per role." },
  { icon: Workflow, title: "Application Tracker", desc: "Kanban + table CRM with status, follow-ups, salary, recruiter, and resume version per app." },
  { icon: BarChart3, title: "Analytics", desc: "Funnel, response rate, top missing keywords, resume version performance." },
];

function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <GradientOrbs />
      <div className="absolute inset-0 grid-pattern opacity-[0.35]" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary glow-ring">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">CareerForge<span className="text-gradient"> AI</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#workflow" className="hover:text-foreground transition">Workflow</a>
          <a href="#stack" className="hover:text-foreground transition">Stack</a>
          <Link to="/portfolio" className="hover:text-foreground transition">Portfolio</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/signup"><Button size="sm" className="bg-gradient-primary text-primary-foreground glow-ring">Get started</Button></Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto inline-flex items-center gap-2 rounded-full border border-border glass px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.78_0.18_145)] animate-pulse" />
          AI copilot for Data, Cloud, Consulting & Front-End roles
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mx-auto mt-6 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
        >
          Land interviews faster with an <span className="text-gradient">AI job application copilot</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Analyze JDs, tailor your resume, generate cover letters, score ATS match, and track every application — in one premium workspace.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/signup"><Button size="lg" className="bg-gradient-primary text-primary-foreground glow-ring">Start free <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          <Link to="/login"><Button size="lg" variant="outline" className="border-border bg-background/40">I have an account</Button></Link>
        </motion.div>

        {/* Hero panel */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="mx-auto mt-16 max-w-5xl">
          <div className="glass-strong rounded-3xl p-2">
            <div className="rounded-2xl border border-border bg-background/40 p-6 text-left">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {[
                  { k: "ATS Match", v: "84%", sub: "vs avg 61%", c: "oklch(0.78 0.18 145)" },
                  { k: "Apps tracked", v: "127", sub: "this quarter", c: "oklch(0.78 0.16 220)" },
                  { k: "Interview rate", v: "18%", sub: "+5pp w/ tailored resume", c: "oklch(0.7 0.2 295)" },
                ].map((s) => (
                  <div key={s.k} className="rounded-2xl glass p-5 hover-lift">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.k}</div>
                    <div className="mt-2 text-3xl font-semibold" style={{ color: s.c }}>{s.v}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Everything in one workspace</h2>
          <p className="mt-3 text-muted-foreground">Designed for analytical and technical roles.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6 hover-lift"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary glow-ring">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { n: "01", t: "Drop a JD", d: "Paste any job description. AI extracts structure & ATS keywords." },
            { n: "02", t: "Match & tailor", d: "Score your resume vs the JD, then auto-tailor summary & bullets." },
            { n: "03", t: "Apply & track", d: "Generate the cover letter and move the card across your CRM." },
          ].map((s) => (
            <div key={s.n} className="glass rounded-2xl p-6">
              <div className="text-xs font-mono text-[oklch(0.78_0.16_220)]">{s.n}</div>
              <h4 className="mt-2 text-xl font-semibold">{s.t}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section id="stack" className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="glass-strong rounded-3xl p-10 text-center">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Private by default</span>
            <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> GPT-4o powered</span>
            <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Analytics built-in</span>
          </div>
          <h3 className="mt-6 text-3xl font-semibold tracking-tight">Ready to forge your next role?</h3>
          <div className="mt-6">
            <Link to="/signup"><Button size="lg" className="bg-gradient-primary text-primary-foreground glow-ring">Create your workspace <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CareerForge AI. Built for personal use.
      </footer>
    </main>
  );
}
