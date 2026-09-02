import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Sparkles, Save, Loader2 } from "lucide-react";
import { analyzeJob } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/analyzer")({
  head: () => ({ meta: [{ title: "JD Analyzer — CareerForge AI" }] }),
  component: Analyzer,
});

function Analyzer() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [company, setCompany] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);

  const analyze = useServerFn(analyzeJob);

  const recent = useQuery({
    queryKey: ["recent-jobs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("jobs").select("id,title,company,created_at").order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const run = useMutation({
    mutationFn: (save: boolean) => analyze({ data: { jobText: text, sourceUrl: url, companyHint: company, save } }),
    onSuccess: (res, save) => {
      setAnalysis(res.analysis);
      if (save) {
        toast.success("Job saved");
        qc.invalidateQueries({ queryKey: ["recent-jobs"] });
      }
    },
    onError: (e: any) => toast.error(e.message ?? "Analysis failed"),
  });

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">AI</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Job Description Analyzer</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Paste any JD. We extract role, ATS keywords, tools, soft skills, difficulty and competition.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="glass rounded-2xl p-6 lg:col-span-3 space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Source URL (optional)</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            </div>
            <div className="space-y-2">
              <Label>Company hint (optional)</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Atlassian" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Job description</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the full job description here…"
              className="min-h-[260px] bg-background/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => run.mutate(false)} disabled={run.isPending || text.trim().length < 40} className="bg-gradient-primary text-primary-foreground glow-ring">
              {run.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Analyze
            </Button>
            <Button onClick={() => run.mutate(true)} disabled={run.isPending || text.trim().length < 40} variant="outline">
              <Save className="mr-2 h-4 w-4" /> Analyze & Save
            </Button>
          </div>
        </section>

        <aside className="glass rounded-2xl p-6 lg:col-span-2 space-y-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Recent jobs</div>
          {recent.data && recent.data.length > 0 ? (
            <ul className="space-y-2">
              {recent.data.map((j) => (
                <li key={j.id} className="rounded-lg border border-border bg-background/30 px-3 py-2 text-sm">
                  <div className="font-medium">{j.title}</div>
                  <div className="text-xs text-muted-foreground">{j.company || "—"}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No saved jobs yet.</p>
          )}
        </aside>
      </div>

      {analysis && (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-2xl p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Stat label="Role" value={analysis.role_title} />
            <Stat label="Category" value={(analysis.category || "").replace("_", " ")} />
            <Stat label="ATS Difficulty" value={`${analysis.ats_difficulty}/5`} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Stat label="Company" value={analysis.company || "—"} />
            <Stat label="Location" value={analysis.location || "—"} />
            <Stat label="Competition" value={(analysis.competition_level || "").replace("_", " ")} />
          </div>
          <p className="text-sm text-muted-foreground">{analysis.summary}</p>
          <ChipGroup title="ATS Keywords" items={analysis.ats_keywords} tone="primary" />
          <ChipGroup title="Required Skills" items={analysis.required_skills} />
          <ChipGroup title="Preferred Skills" items={analysis.preferred_skills} />
          <ChipGroup title="Tools & Technologies" items={analysis.tools_technologies} />
          <ChipGroup title="Soft Skills" items={analysis.soft_skills} />
          <div>
            <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Responsibilities</div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {analysis.responsibilities?.map((r: string, i: number) => (
                <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[oklch(0.78_0.16_220)]" /> {r}</li>
              ))}
            </ul>
          </div>
        </motion.section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/30 p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-medium capitalize">{value}</div>
    </div>
  );
}

function ChipGroup({ title, items, tone }: { title: string; items?: string[]; tone?: "primary" }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((k, i) => (
          <Badge key={i} variant={tone === "primary" ? "default" : "secondary"} className={tone === "primary" ? "bg-gradient-primary text-primary-foreground" : ""}>
            {k}
          </Badge>
        ))}
      </div>
    </div>
  );
}
