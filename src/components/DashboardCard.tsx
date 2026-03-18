import { motion } from "motion/react";
import type { AccentTone, CardCategory } from "../types/dashboard";
import type { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  eyebrow: string;
  description: string;
  category: CardCategory;
  accent: AccentTone;
  surface?: "glass" | "solid";
  children: ReactNode;
};

const accentToneClasses: Record<AccentTone, string> = {
  sage: "from-emerald-100/88 via-white to-white dark:from-emerald-400/16 dark:via-slate-950 dark:to-slate-950",
  peach: "from-orange-100/88 via-white to-white dark:from-orange-400/16 dark:via-slate-950 dark:to-slate-950",
  violet: "from-violet-100/88 via-white to-white dark:from-violet-400/16 dark:via-slate-950 dark:to-slate-950",
  sky: "from-sky-100/88 via-white to-white dark:from-sky-400/16 dark:via-slate-950 dark:to-slate-950",
  gold: "from-amber-100/88 via-white to-white dark:from-amber-400/16 dark:via-slate-950 dark:to-slate-950",
};

const surfaceClasses = {
  glass:
    "border-white/70 bg-white/68 shadow-[0_26px_64px_rgba(110,93,77,0.11)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/58",
  solid:
    "border-white/80 bg-white/84 shadow-[0_20px_50px_rgba(110,93,77,0.08)] dark:border-white/10 dark:bg-slate-950/40",
};

export function DashboardCard({
  title,
  eyebrow,
  description,
  category,
  accent,
  surface = "solid",
  children,
}: DashboardCardProps) {
  return (
    <motion.article
      className={`group relative h-full overflow-hidden rounded-[30px] border bg-gradient-to-br p-6 ${surfaceClasses[surface]} ${accentToneClasses[accent]}`}
      layout
      transition={{ duration: 0.28, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      <div className="absolute -right-10 top-0 h-28 w-28 rounded-full bg-white/45 blur-3xl transition duration-300 group-hover:opacity-90 dark:bg-white/7" />
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/25" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="ui-kicker">
            {eyebrow}
          </p>
          <h3 className="mt-3 font-display text-[1.9rem] leading-tight text-slate-950 dark:text-white">
            {title}
          </h3>
          <p className="mt-2.5 max-w-[28rem] text-sm leading-6 text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
        <span className="ui-chip">
          {category}
        </span>
      </div>
      <div className="relative mt-6">{children}</div>
    </motion.article>
  );
}
