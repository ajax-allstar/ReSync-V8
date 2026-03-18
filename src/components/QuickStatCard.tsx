import { ArrowUpRight } from "lucide-react";
import type { QuickStat } from "../types/dashboard";

type QuickStatCardProps = {
  isActive?: boolean;
  onClick: () => void;
  stat: QuickStat;
};

const accentClasses: Record<QuickStat["accent"], string> = {
  sage: "from-emerald-200/80 via-emerald-50 to-white text-emerald-900 dark:from-emerald-500/20 dark:via-emerald-500/5 dark:to-white/5 dark:text-emerald-100",
  peach: "from-orange-200/80 via-orange-50 to-white text-orange-900 dark:from-orange-400/20 dark:via-orange-300/5 dark:to-white/5 dark:text-orange-100",
  violet: "from-violet-200/80 via-violet-50 to-white text-violet-900 dark:from-violet-400/20 dark:via-violet-400/5 dark:to-white/5 dark:text-violet-100",
  sky: "from-sky-200/80 via-sky-50 to-white text-sky-900 dark:from-sky-400/20 dark:via-sky-400/5 dark:to-white/5 dark:text-sky-100",
  gold: "from-amber-200/80 via-amber-50 to-white text-amber-900 dark:from-amber-400/20 dark:via-amber-300/5 dark:to-white/5 dark:text-amber-100",
};

export function QuickStatCard({
  isActive = false,
  onClick,
  stat,
}: QuickStatCardProps) {
  return (
    <button
      aria-pressed={isActive}
      className={`ui-hover-lift group relative w-full overflow-hidden rounded-[28px] border border-white/75 bg-gradient-to-br p-5 text-left shadow-[0_18px_40px_rgba(120,104,91,0.10)] ${accentClasses[stat.accent]} ${isActive ? "ring-2 ring-white/80 ring-offset-2 ring-offset-transparent dark:ring-white/15" : ""} dark:border-white/10`}
      onClick={onClick}
      type="button"
    >
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/25" />
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/45 blur-2xl dark:bg-white/8" />
      <div className="flex items-start justify-between gap-3">
        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase opacity-60">
            {stat.label}
          </p>
          <p className="mt-4 font-display text-3xl leading-none sm:text-[2.15rem]">
            {stat.value}
          </p>
        </div>
        <div className="ui-icon-shell relative z-10 text-current transition duration-300 group-hover:scale-[1.03]">
          <ArrowUpRight size={18} />
        </div>
      </div>
      <div className="relative z-10 mt-6 flex items-end justify-between gap-3">
        <p className="rounded-full bg-white/62 px-3 py-1 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:bg-white/10">
          {stat.change}
        </p>
        <p className="max-w-[11rem] text-right text-sm leading-5 opacity-75">
          {isActive ? "Currently highlighted" : stat.detail}
        </p>
      </div>
    </button>
  );
}
