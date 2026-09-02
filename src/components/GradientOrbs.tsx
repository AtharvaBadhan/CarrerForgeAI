import { motion } from "framer-motion";

export function GradientOrbs({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <motion.div
        className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[oklch(0.78_0.16_220/.35)] blur-3xl animate-orb"
      />
      <motion.div
        className="absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-[oklch(0.7_0.2_295/.28)] blur-3xl animate-orb"
        style={{ animationDelay: "-4s" }}
      />
      <motion.div
        className="absolute bottom-[-12rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-[oklch(0.72_0.18_180/.28)] blur-3xl animate-orb"
        style={{ animationDelay: "-8s" }}
      />
    </div>
  );
}
