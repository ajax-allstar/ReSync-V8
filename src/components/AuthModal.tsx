import { useEffect, useState, type FormEvent } from "react";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";

type AuthMode = "signin" | "signup";

type AuthModalProps = {
  authError: string | null;
  isConfigured: boolean;
  isOpen: boolean;
  isSubmitting: boolean;
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (values: {
    email: string;
    fullName: string;
    password: string;
  }) => Promise<void> | void;
};

export function AuthModal({
  authError,
  isConfigured,
  isOpen,
  isSubmitting,
  mode,
  onClose,
  onModeChange,
  onSubmit,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setPassword("");
  }, [isOpen, mode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      email: email.trim(),
      fullName: fullName.trim(),
      password,
    });
  }

  return (
    <Modal
      description="Use your ReSync account to unlock a real profile menu, avatar state, and saved student preferences."
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "signin" ? "Welcome back" : "Create your ReSync space"}
    >
      <div className="space-y-5">
        <div className="inline-flex rounded-full border border-white/70 bg-white/70 p-1.5 dark:border-white/10 dark:bg-white/5">
          <Button
            aria-pressed={mode === "signin"}
            className={mode === "signin" ? "" : "shadow-none"}
            onClick={() => onModeChange("signin")}
            size="sm"
            variant={mode === "signin" ? "secondary" : "ghost"}
          >
            Sign in
          </Button>
          <Button
            aria-pressed={mode === "signup"}
            className={mode === "signup" ? "" : "shadow-none"}
            onClick={() => onModeChange("signup")}
            size="sm"
            variant={mode === "signup" ? "secondary" : "ghost"}
          >
            Create account
          </Button>
        </div>

        {!isConfigured ? (
          <div className="ui-subpanel rounded-[26px] border-amber-200/80 bg-amber-50/90 p-4 text-sm leading-6 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/12 dark:text-amber-50">
            Supabase auth is not configured for this build yet. Add
            `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, or keep using the
            public config loader in `index.html`.
          </div>
        ) : null}

        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={handleSubmit}
        >
          {mode === "signup" ? (
            <label className="sm:col-span-2">
              <span className="ui-label">Full name</span>
              <input
                autoComplete="name"
                className="ui-field mt-2"
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Ajax Shinto"
                required
                value={fullName}
              />
            </label>
          ) : null}

          <label className="sm:col-span-2">
            <span className="ui-label">Email</span>
            <input
              autoComplete="email"
              className="ui-field mt-2"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label className="sm:col-span-2">
            <span className="ui-label">Password</span>
            <input
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="ui-field mt-2"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              required
              type="password"
              value={password}
            />
          </label>

          {authError ? (
            <p className="sm:col-span-2 rounded-[22px] border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/12 dark:text-rose-50">
              {authError}
            </p>
          ) : null}

          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <Button
              fullWidth
              loading={isSubmitting}
              type="submit"
              variant="primary"
            >
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
            <Button
              fullWidth
              onClick={onClose}
              size="md"
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
