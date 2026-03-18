import { motion } from "motion/react";
import { MoonStar, Sparkles, SunMedium } from "lucide-react";

type AppHeaderProps = {
  isDark: boolean;
  onToggleTheme: () => void;
};

const navItems = ["Dashboard", "Planner", "Focus", "Mood", "Insights"];

export function AppHeader({ isDark, onToggleTheme }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="ui-panel mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/70 bg-[linear-gradient(135deg,rgba(249,221,197,0.95),rgba(217,234,220,0.88))] text-sm font-semibold tracking-[0.2em] text-slate-800 shadow-[0_16px_30px_rgba(124,102,83,0.14)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(118,93,83,0.85),rgba(55,84,100,0.88))] dark:text-amber-50">
              RS
            </div>
            <div className="min-w-0">
              <p className="font-display text-xl leading-none text-slate-900 dark:text-slate-50">
                ReSync
              </p>
              <p className="mt-1 truncate text-xs tracking-[0.24em] text-slate-500 uppercase dark:text-slate-400">
                student rhythm dashboard
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 rounded-full border border-white/75 bg-white/62 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)] backdrop-blur-lg dark:border-white/10 dark:bg-white/5 md:flex">
            {navItems.map((item) => (
              <a
                key={item}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition duration-300 hover:bg-white/80 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                href={`#${item.toLowerCase()}`}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              aria-label="Toggle theme"
              aria-pressed={isDark}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white/82 text-slate-600 shadow-[0_16px_32px_rgba(108,92,76,0.1)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/15 dark:hover:text-white"
              onClick={onToggleTheme}
              type="button"
              whileTap={{ scale: 0.96 }}
            >
              {isDark ? <SunMedium size={18} /> : <MoonStar size={18} />}
            </motion.button>

            <button
              className="hidden items-center gap-2 rounded-full border border-emerald-200/75 bg-emerald-50/90 px-4 py-2 text-sm font-medium text-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(88,126,100,0.12)] dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100 sm:inline-flex"
              type="button"
            >
              <Sparkles size={16} />
              Calm mode on
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-[linear-gradient(145deg,rgba(202,183,255,0.95),rgba(255,226,203,0.92))] text-sm font-semibold text-slate-700 shadow-[0_18px_30px_rgba(128,108,149,0.18)] dark:border-white/10 dark:bg-[linear-gradient(145deg,rgba(127,107,176,0.9),rgba(131,89,78,0.92))] dark:text-white">
              AJ
            </div>
          </div>
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {navItems.map((item) => (
            <a
              key={item}
              className="shrink-0 rounded-full border border-white/80 bg-white/74 px-4 py-2 text-sm font-medium text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] transition duration-300 hover:bg-white/92 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              href={`#${item.toLowerCase()}`}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
