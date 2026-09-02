import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Wand2, Loader2, Copy, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { tailorResume } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tailor")({
  head: () => ({ meta: [{ title: "Tailor Resume — CareerForge AI" }] }),
  component: TailorPage,
});

function TailorPage() {
  const { user } = useAuth();
  const [jobId, setJobId] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [out, setOut] = useState<any>(null);
  const [saveLabel, setSaveLabel] = useState("");

  const jobs = useQuery({
    queryKey: ["tailor-jobs", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("jobs").select("id,title,company").order("created_at", { ascending: false })).data ?? [],
  });
  const resumes = useQuery({
    queryKey: ["tailor-resumes", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("resumes").select("id,label,category,is_default").order("is_default", { ascending: false })).data ?? [],
  });

  const tailor = useServerFn(tailorResume);
  const run = useMutation({
    mutationFn: () => tailor({ data: { jobId, resumeId } }),
    onSuccess: (r) => { setOut(r); toast.success("Tailored content ready"); },
    onError: (e: any) => toast.error(e.message),
  });

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied"); };

  const saveAsResume = useMutation({
    mutationFn: async () => {
      if (!user || !out) return;
      const text = [
        `SUMMARY\n${out.professional_summary}`,
        `\nSKILLS\n${out.skills.join(", ")}`,
        `\nEXPERIENCE BULLETS\n- ${out.experience_bullets.join("\n- ")}`,
      ].join("\n");
      const { error } = await supabase.from("resumes").insert({
        user_id: user.id,
        label: saveLabel.trim() || `Tailored – ${new Date().toLocaleDateString()}`,
        category: "general",
        content_text: text,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved as new resume version"); setSaveLabel(""); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">AI</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Tailor Resume</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Rewrite summary, skills, and bullets to align with a target role.</p>
      </header>

      <section className="glass rounded-2xl p-6 grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Job</Label>
          <Select value={jobId} onValueChange={setJobId}>
            <SelectTrigger><SelectValue placeholder="Select a saved job" /></SelectTrigger>
            <SelectContent>{jobs.data?.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}{j.company ? ` · ${j.company}` : ""}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Resume</Label>
          <Select value={resumeId} onValueChange={setResumeId}>
            <SelectTrigger><SelectValue placeholder="Select a resume" /></SelectTrigger>
            <SelectContent>{resumes.data?.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}{r.is_default ? " ★" : ""}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={() => run.mutate()} disabled={!jobId || !resumeId || run.isPending} className="w-full bg-gradient-primary text-primary-foreground glow-ring">
            {run.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />} Tailor
          </Button>
        </div>
      </section>

      {out && (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Block title="Professional Summary" onCopy={() => copy(out.professional_summary)}>
            <Textarea value={out.professional_summary} onChange={(e) => setOut({ ...out, professional_summary: e.target.value })} className="min-h-[120px] bg-background/40" />
          </Block>

          <Block title="Skills" onCopy={() => copy(out.skills.join(", "))}>
            <div className="flex flex-wrap gap-2">{out.skills.map((s: string, i: number) => <Badge key={i} className="bg-gradient-primary text-primary-foreground">{s}</Badge>)}</div>
          </Block>

          <Block title="Experience Bullets" onCopy={() => copy(out.experience_bullets.map((b: string) => `• ${b}`).join("\n"))}>
            <ul className="space-y-2 text-sm">
              {out.experience_bullets.map((b: string, i: number) => (
                <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[oklch(0.78_0.16_220)]" /> {b}</li>
              ))}
            </ul>
          </Block>

          {out.keywords_added?.length > 0 && (
            <Block title="Keywords woven in">
              <div className="flex flex-wrap gap-2">{out.keywords_added.map((k: string, i: number) => <Badge key={i} variant="secondary">{k}</Badge>)}</div>
            </Block>
          )}

          {out.project_recommendations?.length > 0 && (
            <Block title="Project recommendations">
              <div className="grid gap-3 md:grid-cols-2">
                {out.project_recommendations.map((p: any, i: number) => (
                  <div key={i} className="rounded-xl border border-border bg-background/30 p-4">
                    <div className="font-medium text-sm">{p.title}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{p.why}</p>
                  </div>
                ))}
              </div>
            </Block>
          )}

          <div className="glass-strong rounded-2xl p-6 flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <Label>Save as new resume version</Label>
              <Input value={saveLabel} onChange={(e) => setSaveLabel(e.target.value)} placeholder="Label (optional)" />
            </div>
            <Button onClick={() => saveAsResume.mutate()} disabled={saveAsResume.isPending} className="bg-gradient-primary text-primary-foreground glow-ring">
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </div>
        </motion.section>
      )}
    </div>
  );
}

function Block({ title, children, onCopy }: { title: string; children: React.ReactNode; onCopy?: () => void }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
        {onCopy && <Button size="sm" variant="ghost" onClick={onCopy}><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy</Button>}
      </div>
      {children}
    </div>
  );
}
