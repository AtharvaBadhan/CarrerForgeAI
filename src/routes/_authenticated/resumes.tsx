import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, Plus, Trash2, Star, Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const CATEGORIES = [
  { v: "data_analyst", l: "Data Analyst" },
  { v: "data_science", l: "Data Science" },
  { v: "business_analyst", l: "Business Analyst" },
  { v: "consulting", l: "Consulting" },
  { v: "cloud", l: "Cloud" },
  { v: "frontend", l: "Front-End" },
  { v: "general", l: "General" },
];

export const Route = createFileRoute("/_authenticated/resumes")({
  head: () => ({ meta: [{ title: "Resumes — CareerForge AI" }] }),
  component: ResumesPage,
});

function ResumesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("data_analyst");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const list = useQuery({
    queryKey: ["resumes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("resumes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      let file_path: string | null = null;
      let file_name: string | null = null;
      let text = content.trim();
      if (file) {
        setUploading(true);
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("resumes").upload(path, file);
        if (upErr) throw upErr;
        file_path = path;
        file_name = file.name;
        if (!text) {
          // fallback: try reading as text for .txt/.md
          if (/\.(txt|md)$/i.test(file.name)) text = await file.text();
        }
      }
      if (!text) throw new Error("Paste resume text (PDF/DOCX text extraction can be pasted manually).");
      const { error } = await supabase.from("resumes").insert({
        user_id: user.id,
        label: label.trim() || `Resume ${new Date().toLocaleDateString()}`,
        category: category as any,
        content_text: text,
        file_path,
        file_name,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Resume saved");
      setLabel(""); setContent(""); setFile(null);
      qc.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: (e: any) => toast.error(e.message),
    onSettled: () => setUploading(false),
  });

  const setDefault = useMutation({
    mutationFn: async (id: string) => {
      if (!user) return;
      await supabase.from("resumes").update({ is_default: false }).eq("user_id", user.id);
      const { error } = await supabase.from("resumes").update({ is_default: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Default updated"); qc.invalidateQueries({ queryKey: ["resumes"] }); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("resumes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["resumes"] }); },
  });

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Library</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Resumes</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Versioned resumes by category. Used by Match, Tailor, and Cover Letter modules.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="glass rounded-2xl p-6 space-y-4 lg:col-span-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Add new</h2>
          <div className="space-y-2">
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Data Analyst – v3" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Resume text</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste full resume text…" className="min-h-[220px] bg-background/40" />
          </div>
          <div className="space-y-2">
            <Label>Optional file (PDF/DOCX)</Label>
            <div className="flex items-center gap-2">
              <Input type="file" accept=".pdf,.docx,.txt,.md" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <p className="text-xs text-muted-foreground">File is stored for download. Paste the text above for AI to read it.</p>
          </div>
          <Button onClick={() => create.mutate()} disabled={create.isPending || uploading} className="bg-gradient-primary text-primary-foreground glow-ring w-full">
            {create.isPending || uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Save resume
          </Button>
        </section>

        <section className="lg:col-span-3 space-y-3">
          {list.isLoading && <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">Loading…</div>}
          {list.data && list.data.length === 0 && (
            <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
              <Upload className="mx-auto mb-3 h-6 w-6" /> No resumes yet. Add your first one.
            </div>
          )}
          {list.data?.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass rounded-2xl p-5 flex items-start gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary"><FileText className="h-5 w-5 text-primary-foreground" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium truncate">{r.label}</div>
                  {r.is_default && <Badge className="bg-gradient-primary text-primary-foreground">Default</Badge>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{String(r.category).replace("_", " ")}</Badge>
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  <span>· {r.content_text.length.toLocaleString()} chars</span>
                  {r.file_name && <span>· {r.file_name}</span>}
                </div>
              </div>
              <div className="flex gap-1">
                {!r.is_default && (
                  <Button size="icon" variant="ghost" onClick={() => setDefault.mutate(r.id)} title="Set default"><Star className="h-4 w-4" /></Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete this resume?")) remove.mutate(r.id); }} title="Delete"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </motion.div>
          ))}
        </section>
      </div>
    </div>
  );
}
