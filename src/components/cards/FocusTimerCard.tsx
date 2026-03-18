import { Pause, Play, RotateCcw, TimerReset } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardCard } from "../DashboardCard";
import type { TimerPreset } from "../../types/dashboard";

type FocusTimerCardProps = {
  presets: TimerPreset[];
  showSample: boolean;
};

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function FocusTimerCard({ presets, showSample }: FocusTimerCardProps) {
  const [selectedPreset, setSelectedPreset] = useState<TimerPreset | null>(
    showSample ? presets[1] : null,
  );
  const [secondsRemaining, setSecondsRemaining] = useState(
    showSample ? presets[1].minutes * 60 : 0,
  );
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setIsRunning(false);
    setSelectedPreset(showSample ? presets[1] : null);
    setSecondsRemaining(showSample ? presets[1].minutes * 60 : 0);
  }, [presets, showSample]);

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

  const totalSeconds = selectedPreset?.minutes ? selectedPreset.minutes * 60 : 0;
  const progress = totalSeconds > 0
    ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100
    : 0;

  function changePreset(preset: TimerPreset) {
    setSelectedPreset(preset);
    setSecondsRemaining(preset.minutes * 60);
    setIsRunning(false);
  }

  return (
    <DashboardCard
      accent="sage"
      category="Focus"
      description="Start a focused study session with simple presets and short-break pacing."
      eyebrow="Pomodoro Timer"
      surface="glass"
      title="Start one clear study sprint"
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="ui-subpanel-glass border-emerald-100/90 p-5 dark:border-emerald-400/10">
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
            <span>{selectedPreset?.label ?? "No preset selected"}</span>
            <span>{selectedPreset?.vibe ?? "blank start"}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {showSample
              ? "Example timer presets help first-time users understand how a focus session is structured."
              : "Blank mode starts at zero. Pick a preset when you want to load a study timer."}
          </p>

          <div className="mt-6">
            <div className="relative mx-auto grid h-52 w-52 place-items-center rounded-full border border-emerald-100 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(233,243,236,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] dark:border-emerald-400/10 dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),rgba(38,58,52,0.82))]">
              <div
                className="absolute inset-3 rounded-full border border-white/80 dark:border-white/10"
                style={{
                  background: `conic-gradient(from 180deg, rgba(127, 176, 143, 0.88) ${progress}%, rgba(223, 232, 225, 0.5) ${progress}% 100%)`,
                }}
              />
              <div className="absolute inset-6 rounded-full bg-white/94 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] dark:bg-slate-950" />
              <div className="relative text-center">
                <p className="ui-demo-label">
                  {showSample ? "Sample session" : "Blank timer"}
                </p>
                <p
                  aria-live="polite"
                  className="mt-3 font-display text-5xl text-slate-950 dark:text-white"
                  role="status"
                >
                  {formatSeconds(secondsRemaining)}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                  {selectedPreset === null
                    ? "Select a preset to load the timer."
                    : secondsRemaining === 0
                    ? "Session complete. Reset or choose another pace."
                    : isRunning
                      ? "Deep breath, stay here."
                      : "Ready when you are."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="ui-button-primary px-4 py-2.5"
              disabled={selectedPreset === null}
              onClick={() => {
                if (!selectedPreset) {
                  return;
                }

                if (secondsRemaining === 0) {
                  setSecondsRemaining(totalSeconds);
                  setIsRunning(true);
                  return;
                }

                setIsRunning((current) => !current);
              }}
              type="button"
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? "Pause" : secondsRemaining === 0 ? "Restart" : "Start"}
            </button>
            <button
              className="ui-button-secondary px-4 py-2.5"
              disabled={selectedPreset === null}
              onClick={() => {
                if (!selectedPreset) {
                  return;
                }

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
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
              Session presets
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Choose a timer length based on the kind of work you want to do next.
            </p>
          </div>
          {presets.map((preset) => {
            const isActive = preset.id === selectedPreset?.id;

            return (
              <button
                key={preset.id}
                className={`flex w-full items-center justify-between rounded-[22px] border px-4 py-4 text-left transition duration-200 ${
                  isActive
                    ? "border-emerald-200 bg-[linear-gradient(135deg,rgba(236,247,240,0.92),rgba(255,255,255,0.86))] text-slate-950 shadow-[0_10px_22px_rgba(97,135,110,0.10)] dark:border-emerald-400/20 dark:bg-[linear-gradient(135deg,rgba(24,60,49,0.78),rgba(15,23,42,0.96))] dark:text-emerald-50 dark:shadow-[0_10px_22px_rgba(7,12,26,0.30)]"
                    : "border-white/80 bg-white/86 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-white/10 dark:bg-white/6 dark:text-slate-200"
                }`}
                onClick={() => changePreset(preset)}
                type="button"
              >
                <div>
                  <p className="font-medium">{preset.label}</p>
                  <p className="mt-1 text-sm opacity-70">{preset.vibe}</p>
                </div>
                <div className="rounded-2xl bg-white/85 p-2 dark:bg-white/10">
                  <TimerReset size={18} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </DashboardCard>
  );
}
