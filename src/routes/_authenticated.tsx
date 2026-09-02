import { createFileRoute, Outlet, Link, useNavigate, useLocation, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { GradientOrbs } from "@/components/GradientOrbs";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Sparkles, Target, FileText, Mail, KanbanSquare, BarChart3,
  Settings, Compass, Bot, Briefcase, Lightbulb, LogOut, Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  component: AppLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyzer", label: "JD Analyzer", icon: Sparkles },
  { to: "/match", label: "ATS Match", icon: Target },
  { to: "/tailor", label: "Tailor Resume", icon: Wand2 },
  { to: "/cover-letter", label: "Cover Letters", icon: Mail },
  { to: "/resumes", label: "Resumes", icon: FileText },
  { to: "/tracker", label: "Tracker", icon: KanbanSquare },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/discovery", label: "Discovery", icon: Compass },
  { to: "/automation", label: "Automation", icon: Bot },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/insights", label: "Insights", icon: Lightbulb },
  { to: "/settings", label: "Settings", icon: Settings },
];

function AppLayout() {
  const { user, loading, signOut } = useAuth();
  const nav2 = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!loading && !user) nav2({ to: "/login" });
  }, [user, loading, nav2]);

  if (loading || !user) {
    return (
      <main className="relative min-h-screen grid place-items-center">
        <GradientOrbs />
        <div className="text-sm text-muted-foreground">Loading workspace…</div>
      </main>
    );
  }

  return (
    <div className="relative min-h-screen">
      <GradientOrbs />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1480px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border glass px-3 py-5 md:flex">
          <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary glow-ring">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">CareerForge<span className="text-gradient"> AI</span></div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Workspace</div>
            </div>
          </Link>

          <nav className="mt-6 flex-1 space-y-0.5 overflow-y-auto pr-1">
            {nav.map((n) => {
              const active = loc.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                    active
                      ? "bg-[oklch(0.78_0.16_220/.12)] text-foreground border border-[oklch(0.78_0.16_220/.25)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-[oklch(0.97_0.01_240/.04)]"
                  )}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-border pt-3">
            <div className="rounded-lg px-3 py-2 text-xs text-muted-foreground">
              <div className="truncate">{user.email}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => signOut().then(() => nav2({ to: "/login" }))} className="w-full justify-start text-muted-foreground">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="md:hidden absolute top-0 left-0 right-0 z-20 flex items-center justify-between border-b border-border glass px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-primary"><Sparkles className="h-4 w-4 text-primary-foreground" /></div>
            <span className="text-sm font-semibold">CareerForge AI</span>
          </Link>
          <Button size="sm" variant="ghost" onClick={() => signOut().then(() => nav2({ to: "/login" }))}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <main className="flex-1 px-4 pb-20 pt-20 md:px-10 md:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
