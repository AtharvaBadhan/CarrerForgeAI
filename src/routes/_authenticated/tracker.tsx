import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { KanbanSquare, Plus, Trash2, Table as TableIcon, LayoutGrid, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const STATUSES = [
  { v: "saved", l: "Saved", color: "oklch(0.7 0.03 250)" },
  { v: "applied", l: "Applied", color: "oklch(0.78 0.16 220)" },
  { v: "online_assessment", l: "OA", color: "oklch(0.72 0.18 180)" },
  { v: "interview", l: "Interview", color: "oklch(0.7 0.2 295)" },
  { v: "final_round", l: "Final", color: "oklch(0.78 0.18 60)" },
  { v: "offer", l: "Offer", color: "oklch(0.78 0.18 145)" },
  { v: "rejected", l: "Rejected", color: "oklch(0.65 0.22 22)" },
  { v: "ghosted", l: "Ghosted", color: "oklch(0.55 0.05 250)" },
];
const CATEGORIES = ["data_analyst", "data_science", "business_analyst", "consulting", "cloud", "frontend", "general"];

export const Route = createFileRoute("/_authenticated/tracker")({
  head: () => ({ meta: [{ title: "Tracker — CareerForge AI" }] }),
  component: TrackerPage,
});

function TrackerPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [filter, setFilter] = useState<string>("all");

  const apps = useQuery({
    queryKey: ["apps", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("applications").select("*").order("updated_at", { ascending: false })).data ?? [],
  });

  const filtered = useMemo(() => (apps.data ?? []).filter((a) => filter === "all" || a.category === filter), [apps.data, filter]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("applications").update({ status: status as any, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["apps"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("applications").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["apps"] }); toast.success("Deleted"); },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">CRM</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Application Tracker</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Tabs value={view} onValueChange={(v) => setView(v as any)}>
            <TabsList>
              <TabsTrigger value="kanban"><LayoutGrid className="mr-1.5 h-3.5 w-3.5" /> Kanban</TabsTrigger>
              <TabsTrigger value="table"><TableIcon className="mr-1.5 h-3.5 w-3.5" /> Table</TabsTrigger>
            </TabsList>
          </Tabs>
          <NewAppDialog onCreated={() => qc.invalidateQueries({ queryKey: ["apps"] })} />
        </div>
      </header>

      {apps.isLoading && <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">Loading…</div>}
      {filtered.length === 0 && !apps.isLoading && (
        <div className="glass rounded-2xl p-10 text-center">
          <KanbanSquare className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No applications yet. Add your first one.</p>
        </div>
      )}

      {view === "kanban" && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          {STATUSES.map((s) => {
            const cards = filtered.filter((a) => a.status === s.v);
            return (
              <div key={s.v} className="glass rounded-2xl p-3 min-h-[200px]">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-xs font-medium uppercase tracking-wider">{s.l}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{cards.length}</span>
                </div>
                <div className="space-y-2">
                  {cards.map((a) => (
                    <motion.div key={a.id} layout className="rounded-lg border border-border bg-background/40 p-3 text-sm">
                      <div className="font-medium truncate">{a.role}</div>
                      <div className="text-xs text-muted-foreground truncate">{a.company}</div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <Select value={a.status} onValueChange={(v) => updateStatus.mutate({ id: a.id, status: v })}>
                          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{STATUSES.map((s2) => <SelectItem key={s2.v} value={s2.v}>{s2.l}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { if (confirm("Delete?")) remove.mutate(a.id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "table" && filtered.length > 0 && (
        <div className="glass rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Applied</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-background/30">
                  <td className="px-4 py-3 font-medium">{a.role}</td>
                  <td className="px-4 py-3">{a.company}</td>
                  <td className="px-4 py-3">
                    <Select value={a.status} onValueChange={(v) => updateStatus.mutate({ id: a.id, status: v })}>
                      <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s2) => <SelectItem key={s2.v} value={s2.v}>{s2.l}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3"><Badge variant="secondary">{(a.category ?? "—").toString().replace("_", " ")}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{a.applied_at ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) remove.mutate(a.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function NewAppDialog({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    role: "", company: "", location: "", category: "data_analyst", status: "saved",
    applied_at: "", salary: "", source_url: "", recruiter_name: "", notes: "",
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user) return;
      if (!form.role || !form.company) throw new Error("Role and company are required");
      const { error } = await supabase.from("applications").insert({
        user_id: user.id,
        role: form.role,
        company: form.company,
        location: form.location || null,
        category: form.category as any,
        status: form.status as any,
        applied_at: form.applied_at || null,
        salary: form.salary || null,
        source_url: form.source_url || null,
        recruiter_name: form.recruiter_name || null,
        notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application added");
      setOpen(false);
      setForm({ role: "", company: "", location: "", category: "data_analyst", status: "saved", applied_at: "", salary: "", source_url: "", recruiter_name: "", notes: "" });
      onCreated();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary text-primary-foreground glow-ring"><Plus className="mr-2 h-4 w-4" /> New</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>New application</DialogTitle></DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Role *"><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></Field>
          <Field label="Company *"><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
          <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
          <Field label="Salary"><Input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} /></Field>
          <Field label="Category">
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Applied at"><Input type="date" value={form.applied_at} onChange={(e) => setForm({ ...form, applied_at: e.target.value })} /></Field>
          <Field label="Recruiter"><Input value={form.recruiter_name} onChange={(e) => setForm({ ...form, recruiter_name: e.target.value })} /></Field>
          <div className="md:col-span-2"><Field label="Source URL"><Input value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} /></Field></div>
          <div className="md:col-span-2"><Field label="Notes"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field></div>
        </div>
        <Button onClick={() => create.mutate()} disabled={create.isPending} className="bg-gradient-primary text-primary-foreground">
          {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
