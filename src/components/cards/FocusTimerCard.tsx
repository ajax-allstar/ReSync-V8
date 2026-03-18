import { Pause, Play, RotateCcw, TimerReset } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { DashboardCard } from "../DashboardCard";
import type { TimerPreset } from "../../types/dashboard";

type FocusTimerCardProps = {
  presets: TimerPreset[];
};

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function FocusTimerCard({ presets }: FocusTimerCardProps) {
  const [selectedPreset, setSelectedPreset] = useState<TimerPreset>(presets[1]);
  const [secondsRemaining, setSecondsRemaining] = useState(
    presets[1].minutes * 60,
  );
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          setIsRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning]);

  const totalSeconds = selectedPreset.minutes * 60;
  const progress = ((totalSeconds - secondsRemaining) / totalSeconds) * 100;

  function changePreset(preset: TimerPreset) {
    setSelectedPreset(preset);
    setSecondsRemaining(preset.minutes * 60);
    setIsRunning(false);
  }

  return (
    <DashboardCard
      accent="sage"
      category="Focus"
      description="Pick the right pace for the study block you actually have energy for."
      eyebrow="Focus Timer"
      surface="glass"
      title="Stay with one calm sprint"
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="ui-subpanel-glass border-emerald-100/90 p-5 dark:border-emerald-400/10">
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
            <span>{selectedPreset.label}</span>
            <span>{selectedPreset.vibe}</span>
          </div>

          <div className="mt-6">
            <div className="relative mx-auto grid h-52 w-52 place-items-center rounded-full border border-emerald-100 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(225,241,231,0.9))] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-emerald-400/10 dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),rgba(38,58,52,0.85))]">
              <div
                className="absolute inset-3 rounded-full border border-white/80 dark:border-white/10"
                style={{
                  background: `conic-gradient(from 180deg, rgba(127, 176, 143, 0.95) ${progress}%, rgba(223, 232, 225, 0.55) ${progress}% 100%)`,
                }}
              />
              <div className="absolute inset-6 rounded-full bg-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] dark:bg-slate-950" />
              <div className="relative text-center">
                <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
                  Active session
                </p>
                <p className="mt-3 font-display text-5xl text-slate-950 dark:text-white">
                  {formatSeconds(secondsRemaining)}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                  {isRunning ? "Deep breath, stay here." : "Ready when you are."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="ui-button-primary px-4 py-2.5"
              onClick={() => setIsRunning((current) => !current)}
              type="button"
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? "Pause" : "Start"}
            </button>
            <button
              className="ui-button-secondary px-4 py-2.5"
              onClick={() => {
                setSecondsRemaining(totalSeconds);
                setIsRunning(false);
              }}
              type="button"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
            Pomodoro presets
          </p>
          {presets.map((preset) => {
            const isActive = preset.id === selectedPreset.id;

            return (
              <motion.button
                key={preset.id}
                className={`flex w-full items-center justify-between rounded-[24px] border px-4 py-4 text-left transition duration-300 ${
                  isActive
                    ? "border-emerald-200 bg-[linear-gradient(135deg,rgba(236,247,240,0.95),rgba(255,255,255,0.8))] text-slate-950 shadow-[0_14px_30px_rgba(97,135,110,0.12)] dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-white"
                    : "border-white/80 bg-white/78 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                }`}
                onClick={() => changePreset(preset)}
                type="button"
                whileHover={{ x: 4 }}
              >
                <div>
                  <p className="font-medium">{preset.label}</p>
                  <p className="mt-1 text-sm opacity-70">{preset.vibe}</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-2 dark:bg-white/10">
                  <TimerReset size={18} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </DashboardCard>
  );
}
