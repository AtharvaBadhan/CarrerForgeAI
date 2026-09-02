import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — CareerForge AI" }] }),
  component: AnalyticsPage,
});

const COLORS = ["oklch(0.78 0.16 220)", "oklch(0.72 0.18 180)", "oklch(0.7 0.2 295)", "oklch(0.78 0.18 145)", "oklch(0.78 0.18 60)", "oklch(0.65 0.22 22)", "oklch(0.55 0.05 250)"];

function AnalyticsPage() {
  const { user } = useAuth();

  const data = useQuery({
    queryKey: ["analytics", user?.id], enabled: !!user,
    queryFn: async () => {
      const [apps, reports] = await Promise.all([
        supabase.from("applications").select("status,category,created_at,applied_at"),
        supabase.from("match_reports").select("missing_keywords"),
      ]);
      return { apps: apps.data ?? [], reports: reports.data ?? [] };
    },
  });

  const apps = data.data?.apps ?? [];
  const total = apps.length;
  const interviews = apps.filter((a) => ["interview", "final_round", "offer"].includes(a.status)).length;
  const offers = apps.filter((a) => a.status === "offer").length;
  const responded = apps.filter((a) => !["saved", "applied", "ghosted"].includes(a.status)).length;
  const responseRate = total ? Math.round((responded / total) * 100) : 0;
  const interviewRate = total ? Math.round((interviews / total) * 100) : 0;
  const offerRate = total ? Math.round((offers / total) * 100) : 0;

  // Apps per week
  const weekly = (() => {
    const map = new Map<string, number>();
    apps.forEach((a) => {
      const d = new Date(a.applied_at || a.created_at);
      const monday = new Date(d); monday.setDate(d.getDate() - d.getDay());
      const k = monday.toISOString().slice(0, 10);
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return [...map.entries()].sort().map(([week, count]) => ({ week: week.slice(5), count }));
  })();

  // Funnel
  const STATUSES = ["saved", "applied", "online_assessment", "interview", "final_round", "offer", "rejected", "ghosted"];
  const funnel = STATUSES.map((s) => ({ status: s.replace("_", " "), count: apps.filter((a) => a.status === s).length }));

  // Category donut
  const catMap = new Map<string, number>();
  apps.forEach((a) => { const c = a.category ?? "general"; catMap.set(c, (catMap.get(c) ?? 0) + 1); });
  const categoryData = [...catMap.entries()].map(([name, value]) => ({ name: name.replace("_", " "), value }));

  // Top missing keywords
  const kw = new Map<string, number>();
  data.data?.reports.forEach((r) => (r.missing_keywords ?? []).forEach((k: string) => kw.set(k, (kw.get(k) ?? 0) + 1)));
  const topMissing = [...kw.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([keyword, count]) => ({ keyword, count }));

  const kpis = [
    { label: "Applications", value: total },
    { label: "Response rate", value: `${responseRate}%` },
    { label: "Interview rate", value: `${interviewRate}%` },
    { label: "Offer rate", value: `${offerRate}%` },
  ];

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Insights</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Funnel, response rates, missing keywords across all applications.</p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</div>
            <div className="mt-2 text-3xl font-semibold text-gradient">{k.value}</div>
          </motion.div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Applications per week" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={weekly}>
              <defs>
                <linearGradient id="grad-a" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.16 220)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(0.78 0.16 220)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.97 0.01 240 / 0.06)" />
              <XAxis dataKey="week" stroke="oklch(0.7 0.03 250)" fontSize={11} />
              <YAxis stroke="oklch(0.7 0.03 250)" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "oklch(0.19 0.035 255)", border: "1px solid oklch(0.97 0.01 240 / 0.1)", borderRadius: 8 }} />
              <Area dataKey="count" type="monotone" stroke="oklch(0.78 0.16 220)" fill="url(#grad-a)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="By category">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "oklch(0.19 0.035 255)", border: "1px solid oklch(0.97 0.01 240 / 0.1)", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Funnel by status" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={funnel}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.97 0.01 240 / 0.06)" />
              <XAxis dataKey="status" stroke="oklch(0.7 0.03 250)" fontSize={10} />
              <YAxis stroke="oklch(0.7 0.03 250)" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "oklch(0.19 0.035 255)", border: "1px solid oklch(0.97 0.01 240 / 0.1)", borderRadius: 8 }} />
              <Bar dataKey="count" fill="oklch(0.72 0.18 180)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top missing keywords">
          {topMissing.length === 0 ? (
            <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">
              <div className="text-center"><BarChart3 className="mx-auto mb-2 h-6 w-6" /> Run an ATS Match to see gaps.</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topMissing} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.97 0.01 240 / 0.06)" />
                <XAxis type="number" stroke="oklch(0.7 0.03 250)" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="keyword" stroke="oklch(0.7 0.03 250)" fontSize={11} width={100} />
                <Tooltip contentStyle={{ background: "oklch(0.19 0.035 255)", border: "1px solid oklch(0.97 0.01 240 / 0.1)", borderRadius: 8 }} />
                <Bar dataKey="count" fill="oklch(0.78 0.18 60)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass rounded-2xl p-6 ${className}`}>
      <div className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}
