import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ScoreRing({
  score,
  size = 160,
  label,
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const offset = c - (pct / 100) * c;
  const tone =
    pct >= 80 ? "oklch(0.78 0.18 145)" : pct >= 60 ? "oklch(0.78 0.16 220)" : pct >= 40 ? "oklch(0.78 0.18 60)" : "oklch(0.7 0.2 22)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={tone} />
            <stop offset="100%" stopColor="oklch(0.72 0.18 180)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(0.97 0.01 240 / 0.08)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className={cn("absolute inset-0 flex flex-col items-center justify-center")}>
        <div className="text-4xl font-semibold text-gradient">{Math.round(pct)}</div>
        {label && <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>}
      </div>
    </div>
  );
}
