import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Mail, Loader2, Copy, Download, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { generateCoverLetter } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const TONES = [
  { v: "professional", l: "Professional" },
  { v: "confident", l: "Confident" },
  { v: "consulting", l: "Consulting" },
  { v: "data_analyst", l: "Data Analyst" },
  { v: "corporate", l: "Corporate" },
  { v: "startup", l: "Startup" },
];
const LENGTHS = [
  { v: "short", l: "Short (~130 words)" },
  { v: "professional", l: "Professional (~220 words)" },
  { v: "standout", l: "Standout (~320 words)" },
];

export const Route = createFileRoute("/_authenticated/cover-letter")({
  head: () => ({ meta: [{ title: "Cover Letters — CareerForge AI" }] }),
  component: CoverPage,
});

function CoverPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [jobId, setJobId] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("professional");
  const [content, setContent] = useState("");
  const [label, setLabel] = useState("");

  const jobs = useQuery({
    queryKey: ["cl-jobs", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("jobs").select("id,title,company").order("created_at", { ascending: false })).data ?? [],
  });
  const resumes = useQuery({
    queryKey: ["cl-resumes", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("resumes").select("id,label,is_default").order("is_default", { ascending: false })).data ?? [],
  });
  const saved = useQuery({
    queryKey: ["cl-saved", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("cover_letters").select("*").order("created_at", { ascending: false }).limit(20)).data ?? [],
  });

  const generate = useServerFn(generateCoverLetter);
  const run = useMutation({
    mutationFn: (save: boolean) => generate({ data: { jobId, resumeId, tone: tone as any, length: length as any, save, label } }),
    onSuccess: (r, save) => {
      setContent(r.content);
      if (save) { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["cl-saved"] }); }
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("cover_letters").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cl-saved"] }); toast.success("Deleted"); },
  });

  const download = (ext: "txt" | "md") => {
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${label || "cover-letter"}.${ext}`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">AI</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Cover Letter Generator</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">6 tones × 3 lengths. Editable, copyable, saved per role.</p>
      </header>

      <section className="glass rounded-2xl p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>Job</Label>
          <Select value={jobId} onValueChange={setJobId}>
            <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
            <SelectContent>{jobs.data?.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}{j.company ? ` · ${j.company}` : ""}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Resume</Label>
          <Select value={resumeId} onValueChange={setResumeId}>
            <SelectTrigger><SelectValue placeholder="Select resume" /></SelectTrigger>
            <SelectContent>{resumes.data?.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}{r.is_default ? " ★" : ""}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TONES.map((t) => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Length</Label>
          <Select value={length} onValueChange={setLength}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{LENGTHS.map((t) => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 lg:col-span-4 flex flex-wrap items-end gap-2">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label for saved version (optional)" className="md:max-w-xs" />
          <Button onClick={() => run.mutate(false)} disabled={!jobId || !resumeId || run.isPending} className="bg-gradient-primary text-primary-foreground glow-ring">
            {run.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />} Generate
          </Button>
          <Button onClick={() => run.mutate(true)} disabled={!jobId || !resumeId || run.isPending} variant="outline">
            <Save className="mr-2 h-4 w-4" /> Generate & Save
          </Button>
        </div>
      </section>

      {content && (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-2xl p-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <Badge>{tone}</Badge><Badge variant="secondary">{length}</Badge>
              <Badge variant="secondary">{content.split(/\s+/).filter(Boolean).length} words</Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(content); toast.success("Copied"); }}><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy</Button>
              <Button size="sm" variant="ghost" onClick={() => download("txt")}><Download className="mr-1.5 h-3.5 w-3.5" /> .txt</Button>
              <Button size="sm" variant="ghost" onClick={() => download("md")}><Download className="mr-1.5 h-3.5 w-3.5" /> .md</Button>
            </div>
          </div>
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[420px] bg-background/40 font-mono text-sm leading-relaxed" />
        </motion.section>
      )}

      {saved.data && saved.data.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Saved cover letters</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {saved.data.map((c) => (
              <div key={c.id} className="glass rounded-2xl p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{c.label}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary">{c.tone}</Badge>
                    <Badge variant="secondary">{c.length}</Badge>
                    <span className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{c.content.slice(0, 220)}…</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setContent(c.content); setLabel(c.label); }} title="Load"><Mail className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) remove.mutate(c.id); }} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
