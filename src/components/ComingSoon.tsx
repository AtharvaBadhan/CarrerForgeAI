import { motion } from "framer-motion";
import { Construction, type LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon = Construction,
  title,
  description,
  bullets = [],
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  bullets?: string[];
}) {
  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Coming next</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </header>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-2xl p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary glow-ring">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <h2 className="mt-5 text-xl font-semibold">On the roadmap</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          This module is scaffolded. The core AI loop (Analyzer → Match → Tailor → Cover Letter → Tracker → Analytics) ships in v1.
        </p>
        {bullets.length > 0 && (
          <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-muted-foreground">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[oklch(0.78_0.16_220)]" />
                {b}
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
