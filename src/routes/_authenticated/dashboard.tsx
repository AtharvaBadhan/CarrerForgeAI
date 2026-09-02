import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, Target, FileText, KanbanSquare, ArrowRight, Wand2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CareerForge AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const stats = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [apps, jobs, resumes, covers] = await Promise.all([
        supabase.from("applications").select("id,status", { count: "exact" }),
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase.from("resumes").select("id", { count: "exact", head: true }),
        supabase.from("cover_letters").select("id", { count: "exact", head: true }),
      ]);
      const total = apps.count ?? 0;
      const interview = (apps.data ?? []).filter((a) => ["interview", "final_round", "offer"].includes(a.status)).length;
      return {
        applications: total,
        jobs: jobs.count ?? 0,
        resumes: resumes.count ?? 0,
        covers: covers.count ?? 0,
        interviewRate: total ? Math.round((interview / total) * 100) : 0,
      };
    },
  });

  const cards = [
    { to: "/analyzer", icon: Sparkles, title: "Analyze a JD", desc: "Extract ATS keywords & difficulty." },
    { to: "/match", icon: Target, title: "Score ATS match", desc: "Compare resume vs job description." },
    { to: "/tailor", icon: Wand2, title: "Tailor resume", desc: "Rewrite bullets to fit the role." },
    { to: "/cover-letter", icon: Mail, title: "Cover letter", desc: "6 tones × 3 lengths." },
    { to: "/resumes", icon: FileText, title: "Resumes", desc: "Versioned by category." },
    { to: "/tracker", icon: KanbanSquare, title: "Tracker", desc: "Kanban CRM for every app." },
  ];

  return (
    <div className="space-y-8">
      <header>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Welcome back</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your career command center</h1>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { k: "Applications", v: stats.data?.applications ?? "–" },
          { k: "Interview rate", v: `${stats.data?.interviewRate ?? 0}%` },
          { k: "Saved jobs", v: stats.data?.jobs ?? "–" },
          { k: "Resume versions", v: stats.data?.resumes ?? "–" },
        ].map((s, i) => (
          <motion.div key={s.k} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.k}</div>
            <div className="mt-2 text-3xl font-semibold text-gradient">{s.v}</div>
          </motion.div>
        ))}
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">Quick actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <motion.div key={c.to} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={c.to} className="group block glass rounded-2xl p-6 hover-lift">
                <div className="flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary glow-ring">
                    <c.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
