import {
  ChevronDown,
  LayoutDashboard,
  Menu,
  MoonStar,
  Settings,
  Sparkles,
  SunMedium,
  UserRound,
  Wind,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";

type HeaderSection = "dashboard" | "planner" | "focus" | "mood" | "insights";

type AppHeaderProps = {
  activeSection: HeaderSection;
  avatarUrl?: string;
  displayName: string;
  email?: string;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isCalmMode: boolean;
  isDark: boolean;
  onNavigate: (section: HeaderSection) => void;
  onOpenAccount: (view: "profile" | "settings") => void;
  onOpenAuth: (mode: "signin" | "signup") => void;
  onSignOut: () => void;
  onToggleCalmMode: () => void;
  onToggleTheme: () => void;
};

const navItems: Array<{ id: HeaderSection; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "planner", label: "Planner" },
  { id: "focus", label: "Focus" },
  { id: "mood", label: "Mood" },
  { id: "insights", label: "Insights" },
];

function isWithinTarget(
  eventTarget: EventTarget | null,
  ref: RefObject<HTMLElement | null>,
) {
  return (
    eventTarget instanceof Node && Boolean(ref.current?.contains(eventTarget))
  );
}

export function AppHeader({
  activeSection,
  avatarUrl,
  displayName,
  email,
  isAuthenticated,
  isAuthLoading,
  isCalmMode,
  isDark,
  onNavigate,
  onOpenAccount,
  onOpenAuth,
  onSignOut,
  onToggleCalmMode,
  onToggleTheme,
}: AppHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const handleDocumentPointerDown = useEffectEvent((event: PointerEvent) => {
    if (
      isProfileMenuOpen &&
      !isWithinTarget(event.target, profileMenuRef)
    ) {
      setIsProfileMenuOpen(false);
    }

    if (
      isMobileMenuOpen &&
      !isWithinTarget(event.target, mobileMenuRef)
    ) {
      setIsMobileMenuOpen(false);
    }
  });

  useEffect(() => {
    document.addEventListener("pointerdown", handleDocumentPointerDown);
    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
    };
  }, [handleDocumentPointerDown]);

  function handleNavigate(section: HeaderSection) {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    onNavigate(section);
  }

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="ui-panel mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <button
            className="flex min-w-0 items-center gap-3 text-left"
            onClick={() => handleNavigate("dashboard")}
            type="button"
          >
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
          </button>

          <nav className="hidden items-center gap-1 rounded-full border border-white/75 bg-white/62 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)] backdrop-blur-lg dark:border-white/10 dark:bg-white/5 md:flex">
            {navItems.map((item) => {
              const isActive = item.id === activeSection;

              return (
                <button
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition duration-300 ${
                    isActive
                      ? "bg-white/88 text-slate-950 shadow-[0_10px_24px_rgba(110,91,75,0.08)] dark:bg-white/10 dark:text-white"
                      : "text-slate-600 hover:bg-white/80 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              );
            })}
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

            <Button
              className="hidden sm:inline-flex"
              leadingIcon={isCalmMode ? <Sparkles size={16} /> : <Wind size={16} />}
              onClick={onToggleCalmMode}
              size="sm"
              variant="secondary"
            >
              {isCalmMode ? "Calm mode on" : "Enable calm mode"}
            </Button>

            {isAuthenticated ? (
              <div
                className="relative"
                ref={profileMenuRef}
              >
                <button
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Open account menu"
                  className="flex items-center gap-2 rounded-[22px] border border-white/80 bg-white/82 px-2.5 py-2 text-sm font-medium text-slate-700 shadow-[0_16px_28px_rgba(108,92,76,0.1)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                  onClick={() => setIsProfileMenuOpen((current) => !current)}
                  type="button"
                >
                  <Avatar
                    avatarUrl={avatarUrl}
                    email={email}
                    fullName={displayName}
                    size="sm"
                  />
                  <div className="hidden min-w-0 text-left lg:block">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-300">
                      Account
                    </p>
                  </div>
                  <ChevronDown
                    className={`hidden transition duration-200 lg:block ${isProfileMenuOpen ? "rotate-180" : ""}`}
                    size={16}
                  />
                </button>

                {isProfileMenuOpen ? (
                  <div
                    className="ui-panel-glass absolute right-0 mt-3 w-64 rounded-[28px] p-2"
                    role="menu"
                  >
                    <button
                      className="flex w-full items-center gap-3 rounded-[22px] px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-white/80 dark:text-slate-100 dark:hover:bg-white/10"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenAccount("profile");
                      }}
                      role="menuitem"
                      type="button"
                    >
                      <UserRound size={16} />
                      Profile
                    </button>
                    <button
                      className="flex w-full items-center gap-3 rounded-[22px] px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-white/80 dark:text-slate-100 dark:hover:bg-white/10"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenAccount("settings");
                      }}
                      role="menuitem"
                      type="button"
                    >
                      <Settings size={16} />
                      Settings
                    </button>
                    <button
                      className="flex w-full items-center gap-3 rounded-[22px] px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-white/80 dark:text-slate-100 dark:hover:bg-white/10"
                      onClick={() => handleNavigate("dashboard")}
                      role="menuitem"
                      type="button"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </button>
                    <button
                      className="flex w-full items-center gap-3 rounded-[22px] px-4 py-3 text-left text-sm text-rose-700 transition hover:bg-rose-50 dark:text-rose-100 dark:hover:bg-rose-400/12"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onSignOut();
                      }}
                      role="menuitem"
                      type="button"
                    >
                      <X size={16} />
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <Button
                  className="hidden sm:inline-flex"
                  onClick={() => onOpenAuth("signin")}
                  size="sm"
                  variant="secondary"
                >
                  Sign in
                </Button>
                <Button
                  className="hidden md:inline-flex"
                  onClick={() => onOpenAuth("signup")}
                  size="sm"
                  variant="primary"
                >
                  Get started
                </Button>
              </>
            )}

            <Button
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile navigation"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              size="icon"
              variant="icon"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div
            className="mt-4 space-y-3 md:hidden"
            ref={mobileMenuRef}
          >
            <nav className="grid gap-2">
              {navItems.map((item) => (
                <button
                  className={`rounded-[22px] px-4 py-3 text-left text-sm font-medium transition ${
                    item.id === activeSection
                      ? "bg-white/85 text-slate-950 shadow-[0_12px_24px_rgba(110,91,75,0.08)] dark:bg-white/10 dark:text-white"
                      : "bg-white/68 text-slate-600 dark:bg-white/5 dark:text-slate-200"
                  }`}
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="grid gap-2">
              <Button
                leadingIcon={isCalmMode ? <Sparkles size={16} /> : <Wind size={16} />}
                onClick={onToggleCalmMode}
                variant="secondary"
              >
                {isCalmMode ? "Calm mode on" : "Enable calm mode"}
              </Button>

              {isAuthenticated ? (
                <>
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAccount("profile");
                    }}
                    variant="secondary"
                  >
                    Profile
                  </Button>
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAccount("settings");
                    }}
                    variant="secondary"
                  >
                    Settings
                  </Button>
                  <Button
                    onClick={onSignOut}
                    variant="danger"
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth("signin");
                    }}
                    variant="secondary"
                  >
                    Sign in
                  </Button>
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth("signup");
                    }}
                    variant="primary"
                  >
                    Get started
                  </Button>
                  {isAuthLoading ? (
                    <p className="px-1 text-xs text-slate-500 dark:text-slate-300">
                      Checking your session…
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
