import { MoonStar, ShieldCheck, SunMedium, Wind } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type { ProfileRecord } from "../lib/supabase";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";

type AccountView = "profile" | "settings";

type EditableProfile = Pick<
  ProfileRecord,
  | "avatar_url"
  | "education_stage"
  | "full_name"
  | "notifications_enabled"
  | "preferred_study_duration"
  | "timezone"
>;

type AccountModalProps = {
  activeView: AccountView;
  email: string;
  isCalmMode: boolean;
  isDark: boolean;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: EditableProfile) => Promise<void> | void;
  onSignOut: () => void;
  onToggleCalmMode: () => void;
  onToggleTheme: () => void;
  onViewChange: (view: AccountView) => void;
  profile: ProfileRecord | null;
};

function createDraft(profile: ProfileRecord | null): EditableProfile {
  return {
    avatar_url: profile?.avatar_url ?? "",
    education_stage: profile?.education_stage ?? "high-school",
    full_name: profile?.full_name ?? "",
    notifications_enabled: profile?.notifications_enabled ?? true,
    preferred_study_duration: profile?.preferred_study_duration ?? 45,
    timezone:
      profile?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone ??
      "UTC",
  };
}

export function AccountModal({
  activeView,
  email,
  isCalmMode,
  isDark,
  isOpen,
  isSaving,
  onClose,
  onSave,
  onSignOut,
  onToggleCalmMode,
  onToggleTheme,
  onViewChange,
  profile,
}: AccountModalProps) {
  const [draft, setDraft] = useState<EditableProfile>(() => createDraft(profile));

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraft(createDraft(profile));
  }, [isOpen, profile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave(draft);
  }

  return (
    <Modal
      description="Keep your student profile polished, reliable, and sign-in aware across every session."
      isOpen={isOpen}
      onClose={onClose}
      title={activeView === "profile" ? "Your profile" : "Settings"}
    >
      <div className="space-y-6">
        <div className="inline-flex rounded-full border border-white/70 bg-white/70 p-1.5 dark:border-white/10 dark:bg-white/5">
          <Button
            aria-pressed={activeView === "profile"}
            onClick={() => onViewChange("profile")}
            size="sm"
            variant={activeView === "profile" ? "secondary" : "ghost"}
          >
            Profile
          </Button>
          <Button
            aria-pressed={activeView === "settings"}
            onClick={() => onViewChange("settings")}
            size="sm"
            variant={activeView === "settings" ? "secondary" : "ghost"}
          >
            Settings
          </Button>
        </div>

        {activeView === "profile" ? (
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <label className="sm:col-span-2">
              <span className="ui-label">Full name</span>
              <input
                className="ui-field mt-2"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    full_name: event.target.value,
                  }))
                }
                placeholder="How should ReSync address you?"
                required
                value={draft.full_name}
              />
            </label>

            <label className="sm:col-span-2">
              <span className="ui-label">Avatar URL</span>
              <input
                className="ui-field mt-2"
                inputMode="url"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    avatar_url: event.target.value,
                  }))
                }
                placeholder="https://example.com/avatar.jpg"
                type="url"
                value={draft.avatar_url}
              />
            </label>

            <label className="sm:col-span-2">
              <span className="ui-label">Email</span>
              <input
                className="ui-field mt-2 opacity-80"
                disabled
                value={email}
              />
            </label>

            <label>
              <span className="ui-label">Education stage</span>
              <select
                className="ui-field mt-2"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    education_stage: event.target.value as EditableProfile["education_stage"],
                  }))
                }
                value={draft.education_stage}
              >
                <option value="elementary">Elementary</option>
                <option value="high-school">High school</option>
                <option value="higher-studies">Higher studies</option>
              </select>
            </label>

            <label>
              <span className="ui-label">Preferred study duration</span>
              <input
                className="ui-field mt-2"
                max={180}
                min={15}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    preferred_study_duration: Number(event.target.value || 45),
                  }))
                }
                type="number"
                value={draft.preferred_study_duration}
              />
            </label>

            <label className="sm:col-span-2">
              <span className="ui-label">Timezone</span>
              <input
                className="ui-field mt-2"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    timezone: event.target.value,
                  }))
                }
                value={draft.timezone}
              />
            </label>

            <label className="ui-subpanel sm:col-span-2 flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Study notifications
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                  Keep gentle reminders available for task and focus prompts.
                </p>
              </div>
              <button
                aria-checked={draft.notifications_enabled}
                className={`ui-toggle ${draft.notifications_enabled ? "bg-emerald-100 dark:bg-emerald-400/20" : ""}`}
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    notifications_enabled: !current.notifications_enabled,
                  }))
                }
                role="switch"
                type="button"
              >
                <span
                  className={`ui-toggle-thumb ${draft.notifications_enabled ? "translate-x-5 bg-emerald-600 dark:bg-emerald-100" : ""}`}
                />
              </button>
            </label>

            <div className="sm:col-span-2 flex flex-wrap gap-3">
              <Button
                loading={isSaving}
                type="submit"
                variant="primary"
              >
                Save profile
              </Button>
              <Button
                onClick={() => setDraft(createDraft(profile))}
                variant="secondary"
              >
                Reset changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="ui-subpanel flex items-center justify-between gap-4 p-5">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Theme
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                  Switch instantly between light and dark study surfaces.
                </p>
              </div>
              <Button
                leadingIcon={isDark ? <SunMedium size={16} /> : <MoonStar size={16} />}
                onClick={onToggleTheme}
                variant="secondary"
              >
                {isDark ? "Use light theme" : "Use dark theme"}
              </Button>
            </div>

            <div className="ui-subpanel flex items-center justify-between gap-4 p-5">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Calm mode
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                  Soften motion and hover lift when you want a quieter workspace.
                </p>
              </div>
              <Button
                leadingIcon={<Wind size={16} />}
                onClick={onToggleCalmMode}
                variant="secondary"
              >
                {isCalmMode ? "Turn calm mode off" : "Turn calm mode on"}
              </Button>
            </div>

            <div className="ui-subpanel flex items-center justify-between gap-4 p-5">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className="text-emerald-600 dark:text-emerald-300"
                    size={18}
                  />
                  <p className="font-medium text-slate-900 dark:text-white">
                    Account security
                  </p>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                  Signed in as {email}.
                </p>
              </div>
              <Button
                onClick={onSignOut}
                variant="danger"
              >
                Sign out
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
