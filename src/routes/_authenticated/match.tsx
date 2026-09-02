import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Target, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { runMatch } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ScoreRing";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/match")({
  head: () => ({ meta: [{ title: "ATS Match — CareerForge AI" }] }),
  component: MatchPage,
});

function MatchPage() {
  const { user } = useAuth();
  const [jobId, setJobId] = useState<string>("");
  const [resumeId, setResumeId] = useState<string>("");
  const [report, setReport] = useState<any>(null);

  const jobs = useQuery({
    queryKey: ["match-jobs", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("jobs").select("id,title,company").order("created_at", { ascending: false })).data ?? [],
  });
  const resumes = useQuery({
    queryKey: ["match-resumes", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("resumes").select("id,label,category,is_default").order("is_default", { ascending: false })).data ?? [],
  });

  const match = useServerFn(runMatch);
  const run = useMutation({
    mutationFn: () => match({ data: { jobId, resumeId } }),
    onSuccess: (res) => { setReport(res.raw); toast.success("Match complete"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">AI</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">ATS Match Engine</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Score any saved resume against any saved job description.</p>
      </header>

      <section className="glass rounded-2xl p-6 grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Job</Label>
          <Select value={jobId} onValueChange={setJobId}>
            <SelectTrigger><SelectValue placeholder="Select a saved job" /></SelectTrigger>
            <SelectContent>
              {jobs.data?.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}{j.company ? ` · ${j.company}` : ""}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Resume</Label>
          <Select value={resumeId} onValueChange={setResumeId}>
            <SelectTrigger><SelectValue placeholder="Select a resume" /></SelectTrigger>
            <SelectContent>
              {resumes.data?.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}{r.is_default ? " ★" : ""}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={() => run.mutate()} disabled={!jobId || !resumeId || run.isPending} className="w-full bg-gradient-primary text-primary-foreground glow-ring">
            {run.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Target className="mr-2 h-4 w-4" />} Run match
          </Button>
        </div>
      </section>

      {(jobs.data?.length === 0 || resumes.data?.length === 0) && (
        <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
          You need at least one saved <strong>job</strong> (Analyzer) and one <strong>resume</strong> (Resumes) to run a match.
        </div>
      )}

      {report && (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-3">
          <div className="glass-strong rounded-2xl p-8 flex flex-col items-center justify-center">
            <ScoreRing score={report.score} label="ATS Score" />
            <p className="mt-6 text-center text-sm text-muted-foreground max-w-xs">{report.summary}</p>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4 lg:col-span-2">
            <ChipBlock title="Strong matches" tone="green" items={report.strong_matches} icon={CheckCircle2} />
            <ChipBlock title="Missing keywords" tone="orange" items={report.missing_keywords} icon={AlertTriangle} />
            {report.weak_areas?.length > 0 && (
              <div>
                <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Weak areas</div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {report.weak_areas.map((w: string, i: number) => (
                    <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[oklch(0.78_0.18_60)]" /> {w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="glass-strong rounded-2xl p-6 lg:col-span-3">
            <div className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">Prioritized improvements</div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {report.suggestions?.map((s: any, i: number) => (
                <div key={i} className="rounded-xl border border-border bg-background/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{s.title}</div>
                    <Badge variant={s.impact === "high" ? "default" : "secondary"} className={s.impact === "high" ? "bg-gradient-primary text-primary-foreground" : ""}>{s.impact}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{s.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}

function ChipBlock({ title, items, tone, icon: Icon }: { title: string; items?: string[]; tone: "green" | "orange"; icon: any }) {
  if (!items || items.length === 0) return null;
  const color = tone === "green" ? "oklch(0.78 0.18 145)" : "oklch(0.78 0.18 60)";
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" style={{ color }} /> {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((k, i) => (
          <span key={i} className="rounded-full border px-2.5 py-1 text-xs" style={{ borderColor: `${color} / 0.4`, color }}>{k}</span>
        ))}
      </div>
    </div>
  );
}
