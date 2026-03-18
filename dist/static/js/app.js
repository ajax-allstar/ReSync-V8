import {
    a11yStorageKey,
    moodLabels,
    sections,
    themeStorageKey,
    timerStorageKey,
    weekdayLabels,
} from "./modules/constants.js";
import { clearBootStatus, escapeHtml, showBootStatus, toast } from "./modules/dom.js";
import { computeStreak, dateKeyForTimeZone, dateTimeInputToIso, formatDateTime, getUserTimeZone, todayISO } from "./modules/time.js";
import { applyTheme, getStoredA11y, getStoredTheme, initThemeControls, registerServiceWorker } from "./modules/theme.js";
import { parseJsonReply, requestChatCompletion, validateTimetableEntries } from "./modules/ai.js";

const state = {
    supabase: null,
    session: null,
    user: null,
    profile: null,
    subjects: [],
    plans: [],
    sessions: [],
    timetable: [],
    moods: [],
    chatHistory: [],
    chatPersona: null,
    activeSection: "dashboard",
};

const academicChatRejection = "I'm here to help with academic questions and study-related topics only.\nPlease ask something related to your subjects, homework, or exam preparation.";
const academicChatPolicy = `
You are the Academic AI Assistant inside the ReSync student productivity platform.

Help students strictly with academic learning, homework, concept clarification, study planning, exam preparation, and research-related study support.

Allowed areas include mathematics, physics, chemistry, biology, computer science, programming, history, geography, economics, literature, languages, engineering basics, environmental science, study techniques, research skills, academic summaries, and homework explanations.

You may help with step-by-step problem solving, simplifying difficult concepts, practice questions, formula explanations, theory explanations, study planning, and breaking down hard topics.

Do not answer non-academic requests such as entertainment, jokes, gossip, celebrity news, gaming discussions, movie recommendations, personal conversations, relationship advice, or unrelated chit-chat.

Do not help with hacking, harmful activity, illegal activity, cheating, plagiarism, or exam dishonesty.

If the user asks a non-academic question, reply with exactly:
${academicChatRejection}
`.trim();

function chatPersonaLabel(persona) {
    return persona === "motivator" ? "Study Coach" : "Subject Tutor";
}

function chatPersonaPrompt(persona) {
    const personaInstruction = persona === "motivator"
        ? "Use a warm, encouraging study-coach tone. Help with study anxiety only in the context of academic work, focus, homework, and exam preparation."
        : "Use a tutor tone. Explain concepts clearly, give structured academic help, and break problems into steps when helpful.";

    return `${academicChatPolicy}\n\n${personaInstruction}`;
}

function getActiveTimeZone() {
    return getUserTimeZone(state.profile);
}

function matchesDay(value, dayKey, timeZone) {
    return Boolean(value) && dateKeyForTimeZone(value, timeZone) === dayKey;
}

function refreshIcons() {
    window.lucide?.createIcons();
}

function resetUserCollections() {
    state.profile = null;
    state.subjects = [];
    state.plans = [];
    state.sessions = [];
    state.timetable = [];
    state.moods = [];
    state.chatHistory = [];
    state.chatPersona = null;
    state.activeSection = "dashboard";
}

function isConfigured() {
    const config = window.RESYNC_SUPABASE_CONFIG || {};
    return Boolean(config.url && config.anonKey);
}

function renderMarketing() {
    document.querySelector("#marketing-screen").innerHTML = `
        <section class="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
                <p class="inline-flex rounded-full border border-sand-300 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 animate-fade-in">Welcome to ReSync</p>
                <h1 class="mt-6 max-w-3xl font-serif text-5xl leading-tight text-ink sm:text-6xl animate-fade-in-up stagger-1">A calmer study rhythm.</h1>
                <p class="mt-6 max-w-2xl text-lg leading-8 text-stone-600 animate-fade-in-up stagger-2">Plan your studies, track your mood, and get academic help for homework, concepts, and exam preparation.</p>
                <div class="mt-8 flex flex-wrap gap-4 animate-fade-in-up stagger-3">
                    <button class="rounded-full bg-moss-700 px-6 py-3 font-semibold text-white shadow-paper transition active:scale-95 hover:bg-moss-500 hover-lift" data-open-auth="signup">Create your space</button>
                    <button class="rounded-full border border-sand-300 bg-white/90 px-6 py-3 font-semibold transition active:scale-95 hover:border-moss-500 hover:text-moss-700 hover-lift" data-open-auth="login">Sign in</button>
                </div>
            </div>
            <div class="rounded-[2rem] border border-sand-200 bg-white/85 p-6 shadow-paper animate-scale-in stagger-2 card-hover">
                <div class="rounded-[1.5rem] bg-gradient-to-br from-sand-100 to-white p-6">
                    <div class="flex items-center justify-between">
                        <div><p class="text-sm text-stone-500">Today in ReSync</p><h2 class="mt-1 text-2xl font-semibold">Your focus corner</h2></div>
                        <div class="rounded-2xl bg-moss-200 px-4 py-2 text-sm font-semibold text-moss-700 animate-pulse-glow">25:00</div>
                    </div>
                    <div class="mt-6 grid gap-4">
                        <div class="rounded-3xl bg-white p-4 animate-fade-in-up stagger-3"><p class="text-xs uppercase tracking-[0.18em] text-stone-400">Next session</p><p class="mt-2 text-lg font-semibold">Biology revision sprint</p><p class="mt-1 text-sm text-stone-500">3:30 PM to 4:15 PM</p></div>
                        <div class="grid gap-4 sm:grid-cols-2">
                            <div class="rounded-3xl bg-white p-4 animate-fade-in-up stagger-4"><p class="text-xs uppercase tracking-[0.18em] text-stone-400">Mood</p><p class="mt-2 text-lg font-semibold">Steady</p></div>
                            <div class="rounded-3xl bg-white p-4 animate-fade-in-up stagger-5"><p class="text-xs uppercase tracking-[0.18em] text-stone-400">Motivation</p><p class="mt-2 text-sm font-medium text-stone-600">One calm session is enough to reset the day.</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section id="features" class="mt-16 grid gap-6 md:grid-cols-3">
            <div class="rounded-[2rem] border border-sand-200 bg-white/75 p-6 shadow-sm card-hover animate-fade-in-up stagger-4"><h3 class="text-xl font-semibold text-moss-700">AI Weekly Planner</h3><p class="mt-2 text-sm text-stone-600">Let AI intelligently space out your study sessions for a balanced schedule.</p></div>
            <div class="rounded-[2rem] border border-sand-200 bg-white/75 p-6 shadow-sm card-hover animate-fade-in-up stagger-5"><h3 class="text-xl font-semibold text-moss-700">Interactive Timer</h3><p class="mt-2 text-sm text-stone-600">Customizable Pomodoro timers to help you keep a steady flow.</p></div>
            <div class="rounded-[2rem] border border-sand-200 bg-white/75 p-6 shadow-sm card-hover animate-fade-in-up stagger-6"><h3 class="text-xl font-semibold text-moss-700">Academic AI Assistant</h3><p class="mt-2 text-sm text-stone-600">Ask academic questions, get concept explanations, and prepare for exams.</p></div>
        </section>
        <section id="auth-section" class="mt-16 grid gap-6 lg:grid-cols-[1fr_0.95fr] animate-fade-in-up stagger-6">
            <div class="rounded-[2rem] border border-sand-200 bg-white/80 p-8 shadow-paper">
                <div class="flex gap-3">
                    <button id="auth-tab-login" class="rounded-full bg-moss-700 px-5 py-3 text-sm font-semibold text-white transition active:scale-95">Sign in</button>
                    <button id="auth-tab-signup" class="rounded-full border border-sand-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition active:scale-95">Create account</button>
                </div>
                <form id="login-form" class="mt-6 space-y-4">
                    <div><label class="text-sm font-medium text-stone-700">Email</label><input name="email" type="email" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm" required></div>
                    <div><label class="text-sm font-medium text-stone-700">Password</label><input name="password" type="password" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm" required></div>
                    <button class="w-full rounded-full bg-moss-700 px-5 py-3 text-sm font-semibold text-white transition active:scale-95 hover-lift">Sign in</button>
                </form>
                <form id="signup-form" class="mt-6 hidden space-y-4">
                    <div><label class="text-sm font-medium text-stone-700">Full name</label><input name="full_name" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm" required></div>
                    <div><label class="text-sm font-medium text-stone-700">Email</label><input name="email" type="email" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm" required></div>
                    <div><label class="text-sm font-medium text-stone-700">Password</label><input name="password" type="password" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm" required></div>
                    <div><label class="text-sm font-medium text-stone-700">Education stage</label><select name="education_stage" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"><option value="elementary">Elementary</option><option value="high-school" selected>High School</option><option value="higher-studies">Higher Studies</option></select></div>
                    <button class="w-full rounded-full bg-moss-700 px-5 py-3 text-sm font-semibold text-white transition active:scale-95 hover-lift">Create account</button>
                </form>
                <p id="config-warning" class="mt-4 hidden rounded-2xl border border-sand-200 bg-sand-100 px-4 py-3 text-sm text-stone-600"></p>
            </div>
            <div id="team" class="grid gap-5">
                <div class="rounded-[2rem] border border-sand-200 bg-white/75 p-6 shadow-sm card-hover animate-fade-in-up stagger-7"><p class="text-sm uppercase tracking-[0.2em] text-stone-400">Team</p><p class="mt-3 text-2xl font-semibold">Daniel Santhosh</p><p class="mt-2 text-sm font-medium text-moss-700">Product vision and demo lead</p><p class="mt-3 text-sm text-stone-600">Daniel shaped ReSync around real student pressure points and kept the product supportive and practical.</p></div>
                <div class="rounded-[2rem] border border-sand-200 bg-white/75 p-6 shadow-sm card-hover animate-fade-in-up stagger-8"><p class="text-sm uppercase tracking-[0.2em] text-stone-400">Team</p><p class="mt-3 text-2xl font-semibold">Ajax Shinto</p><p class="mt-2 text-sm font-medium text-moss-700">Development and systems implementation</p><p class="mt-3 text-sm text-stone-600">Ajax converted the old workflow into a deployable browser app backed by Supabase and serverless APIs.</p></div>
            </div>
        </section>
    `;

    bindMarketingEvents();
}

function openAuth(mode) {
    document.querySelector("#login-form")?.classList.toggle("hidden", mode !== "login");
    document.querySelector("#signup-form")?.classList.toggle("hidden", mode !== "signup");

    document.querySelector("#auth-tab-login")?.classList.toggle("bg-moss-700", mode === "login");
    document.querySelector("#auth-tab-login")?.classList.toggle("text-white", mode === "login");
    document.querySelector("#auth-tab-login")?.classList.toggle("bg-white", mode !== "login");
    document.querySelector("#auth-tab-login")?.classList.toggle("text-stone-700", mode !== "login");

    document.querySelector("#auth-tab-signup")?.classList.toggle("bg-moss-700", mode === "signup");
    document.querySelector("#auth-tab-signup")?.classList.toggle("text-white", mode === "signup");
    document.querySelector("#auth-tab-signup")?.classList.toggle("bg-white", mode !== "signup");
    document.querySelector("#auth-tab-signup")?.classList.toggle("text-stone-700", mode !== "signup");

    document.querySelector("#auth-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function bindMarketingEvents() {
    document.querySelector("#auth-tab-login")?.addEventListener("click", () => openAuth("login"));
    document.querySelector("#auth-tab-signup")?.addEventListener("click", () => openAuth("signup"));
    document.querySelectorAll("[data-open-auth]").forEach((button) => {
        button.addEventListener("click", () => openAuth(button.dataset.openAuth));
    });
    document.querySelector("#login-form")?.addEventListener("submit", handleLogin);
    document.querySelector("#signup-form")?.addEventListener("submit", handleSignup);
}

async function initSupabase() {
    renderMarketing();
    renderNav();

    if (!isConfigured()) {
        const warning = "Add your Supabase project URL and anon key to /static/js/supabase-config.js before using the app.";
        document.querySelector("#config-warning").textContent = warning;
        document.querySelector("#config-warning").classList.remove("hidden");
        showBootStatus(warning, "warning");
        return;
    }

    try {
        showBootStatus("Connecting to Supabase...");
        state.supabase = window.supabase.createClient(
            window.RESYNC_SUPABASE_CONFIG.url,
            window.RESYNC_SUPABASE_CONFIG.anonKey,
        );

        const { data, error } = await state.supabase.auth.getSession();

        if (error) {
            throw error;
        }

        await handleSession(data.session);

        state.supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session).catch((sessionError) => {
                console.error(sessionError);
                showBootStatus(sessionError.message || "Unable to refresh the session.", "error");
                toast("Session refresh failed.", "error");
            });
        });
    } catch (error) {
        console.error(error);
        showBootStatus(error.message || "Unable to initialize ReSync.", "error");
        toast(error.message || "Unable to initialize ReSync.", "error");
    }
}

function renderNav() {
    const nav = document.querySelector("#app-nav");

    if (!nav) {
        return;
    }

    if (!state.user) {
        nav.innerHTML = `
            <a href="#features" class="nav-link flex items-center gap-2">
                <i data-lucide="sparkles" class="h-4 w-4"></i>Features
            </a>
            <button class="rounded-full border border-sand-300 px-4 py-2 transition hover:border-moss-500 hover:text-moss-700 flex items-center gap-2 active:scale-95" data-open-auth="login">
                <i data-lucide="log-in" class="h-4 w-4"></i>Sign in
            </button>
        `;
        nav.querySelector("[data-open-auth]")?.addEventListener("click", () => openAuth("login"));
        refreshIcons();
        return;
    }

    const sectionIcons = {
        dashboard: "layout-dashboard",
        planner: "calendar-days",
        timetable: "table-2",
        timer: "timer",
        mood: "smile",
        friends: "users",
        profile: "user",
    };

    nav.innerHTML = `
        ${sections.map((section) => `
            <button class="nav-link flex items-center gap-2 rounded-full px-3 py-2 ${state.activeSection === section ? "font-semibold text-moss-700" : ""}" data-section-target="${section}">
                <i data-lucide="${sectionIcons[section]}" class="h-4 w-4"></i>${section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
        `).join("")}
        <button id="logout-button" class="rounded-full border border-sand-300 px-4 py-2 transition hover:border-moss-500 hover:text-moss-700 flex items-center gap-2">
            <i data-lucide="log-out" class="h-4 w-4"></i>Log out
        </button>
    `;

    nav.querySelectorAll("[data-section-target]").forEach((button) => {
        button.addEventListener("click", () => setSection(button.dataset.sectionTarget));
    });
    nav.querySelector("#logout-button")?.addEventListener("click", signOut);
    refreshIcons();
}

async function handleSession(session) {
    state.session = session;
    state.user = session?.user || null;

    renderNav();
    document.querySelector("#marketing-screen").classList.toggle("hidden", Boolean(state.user));
    document.querySelector("#app-screen").classList.toggle("hidden", !state.user);

    if (!state.user) {
        resetUserCollections();
        renderMarketing();
        clearBootStatus();
        return;
    }

    showBootStatus("Loading your workspace...");
    await ensureProfile();
    await loadData();
    renderAppShell();
    clearBootStatus();
}

async function ensureProfile(seed = {}) {
    const defaults = {
        id: state.user.id,
        full_name: seed.full_name || state.user.user_metadata?.full_name || "",
        education_stage: seed.education_stage || "high-school",
        preferred_study_duration: 45,
        timezone: getUserTimeZone(state.profile),
        notifications_enabled: true,
    };

    const { data, error } = await state.supabase
        .from("profiles")
        .select("*")
        .eq("id", state.user.id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        const { error: insertError } = await state.supabase.from("profiles").insert(defaults);

        if (insertError) {
            throw insertError;
        }

        state.profile = defaults;
        return;
    }

    state.profile = data;
}

async function loadData() {
    const results = await Promise.all([
        state.supabase.from("subjects").select("*").order("name"),
        state.supabase.from("study_plans").select("*").order("created_at", { ascending: false }),
        state.supabase.from("study_sessions").select("*").order("scheduled_start", { ascending: true }),
        state.supabase.from("timetable_entries").select("*").order("day_of_week").order("start_time"),
        state.supabase.from("mood_entries").select("*").order("logged_for", { ascending: false }),
        state.supabase.from("profiles").select("*").eq("id", state.user.id).maybeSingle(),
    ]);

    const [subjects, plans, sessions, timetable, moods, profile] = results;

    for (const result of results) {
        if (result.error) {
            throw result.error;
        }
    }

    state.subjects = subjects.data || [];
    state.plans = plans.data || [];
    state.sessions = sessions.data || [];
    state.timetable = timetable.data || [];
    state.moods = moods.data || [];
    state.profile = profile.data || state.profile;
}

function setSection(section) {
    state.activeSection = section;
    renderNav();
    renderAppShell();
}

function renderAppShell() {
    const timeZone = getActiveTimeZone();
    const todayKey = todayISO(timeZone);
    const sessionsForToday = state.sessions.filter((session) => (
        matchesDay(session.scheduled_start, todayKey, timeZone)
    ));
    const completedMinutes = sessionsForToday
        .filter((session) => session.status === "completed")
        .reduce((sum, session) => sum + Number(session.actual_duration_minutes || 0), 0);
    const streak = computeStreak(state.sessions, timeZone);

    document.querySelector("#app-screen").innerHTML = `
        <div class="mb-8 flex flex-col gap-8 rounded-[2rem] border border-sand-200 bg-white/80 p-8 shadow-sm lg:flex-row lg:items-center lg:justify-between animate-fade-in-up">
            <div class="max-w-xl">
                <h1 class="font-serif text-4xl lg:text-5xl">Welcome back, ${escapeHtml(state.profile?.full_name || state.user?.email || "Student")}</h1>
                <p class="mt-4 text-lg leading-relaxed text-stone-600">See today's plan, protect your attention, and return to one clear next step.</p>
            </div>
            <div class="flex flex-wrap gap-6">
                <div class="flex items-center gap-4 rounded-3xl bg-sand-100 p-4 animate-scale-in stagger-1">
                    <div class="relative h-16 w-16">
                        <svg class="h-full w-full" viewBox="0 0 36 36">
                            <circle class="stroke-sand-200" stroke-width="3" fill="transparent" r="16" cx="18" cy="18"></circle>
                            <circle class="stroke-moss-500 transition-all duration-1000" stroke-width="3" stroke-dasharray="100" stroke-dashoffset="${100 - Math.min(100, (sessionsForToday.length / 5) * 100)}" stroke-linecap="round" fill="transparent" r="16" cx="18" cy="18"></circle>
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center font-bold text-ink" id="summary-today">0</div>
                    </div>
                    <div><p class="text-xs uppercase tracking-widest text-stone-400">Sessions</p><p class="text-sm text-stone-500">Today's goal</p></div>
                </div>
                <div class="flex items-center gap-4 rounded-3xl bg-sand-100 p-4 animate-scale-in stagger-2">
                    <div class="relative h-16 w-16">
                        <svg class="h-full w-full" viewBox="0 0 36 36">
                            <circle class="stroke-sand-200" stroke-width="3" fill="transparent" r="16" cx="18" cy="18"></circle>
                            <circle class="stroke-moss-700 transition-all duration-1000" stroke-width="3" stroke-dasharray="100" stroke-dashoffset="${100 - Math.min(100, (completedMinutes / 120) * 100)}" stroke-linecap="round" fill="transparent" r="16" cx="18" cy="18"></circle>
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center font-bold text-ink" id="summary-minutes">0</div>
                    </div>
                    <div><p class="text-xs uppercase tracking-widest text-stone-400">Minutes</p><p class="text-sm text-stone-500">Focus time</p></div>
                </div>
                <div class="flex items-center gap-4 rounded-3xl bg-sand-100 p-4 animate-scale-in stagger-3">
                    <div class="relative h-16 w-16">
                        <svg class="h-full w-full" viewBox="0 0 36 36">
                            <circle class="stroke-sand-200" stroke-width="3" fill="transparent" r="16" cx="18" cy="18"></circle>
                            <circle class="stroke-amber-500 transition-all duration-1000" stroke-width="3" stroke-dasharray="100" stroke-dashoffset="${100 - Math.min(100, (streak / 7) * 100)}" stroke-linecap="round" fill="transparent" r="16" cx="18" cy="18"></circle>
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center font-bold text-ink" id="summary-streak">0</div>
                    </div>
                    <div><p class="text-xs uppercase tracking-widest text-stone-400">Streak</p><p class="text-sm text-stone-500">Days steady</p></div>
                </div>
            </div>
        </div>
        <div id="section-content" class="animate-fade-in-up stagger-1">${renderSection()}</div>
    `;

    bindAppEvents();
    renderData();
    refreshIcons();
}

function renderSection() {
    const views = {
        dashboard: `<div class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]"><div class="rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-sm"><h2 class="text-2xl font-semibold">Today's focus</h2><div id="dashboard-next-session" class="mt-5 rounded-3xl border border-sand-200 bg-sand-100 p-5 text-sm text-stone-600"></div><div class="mt-5 grid gap-4 md:grid-cols-2"><div class="rounded-3xl border border-sand-200 bg-sand-100 p-5"><p class="text-xs uppercase tracking-[0.18em] text-stone-400">Mood snapshot</p><p id="dashboard-mood" class="mt-2 text-lg font-semibold"></p></div><div class="rounded-3xl border border-sand-200 bg-sand-100 p-5"><p class="text-xs uppercase tracking-[0.18em] text-stone-400">Motivation</p><p id="dashboard-motivation" class="mt-2 text-sm leading-7 text-stone-600"></p></div></div></div><div class="rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-sm"><div class="flex items-center justify-between"><h2 class="text-2xl font-semibold">Upcoming sessions</h2><span id="dashboard-session-count" class="rounded-full bg-sand-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500"></span></div><div id="dashboard-sessions-list" class="mt-5 space-y-3"></div></div></div>`,
        planner: `<div class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]"><div class="space-y-6"><div class="rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-sm">${subjectFormHtml()}</div><div class="rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-sm">${planFormHtml()}</div><div class="rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-sm">${sessionFormHtml()}</div></div><div class="space-y-6"><div class="rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-sm"><div class="flex items-center justify-between"><h2 class="text-2xl font-semibold">Active plans</h2><p id="plans-count" class="text-sm text-stone-500"></p></div><div id="plans-list" class="mt-5 space-y-4"></div></div><div class="rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-sm"><h2 class="text-2xl font-semibold">Scheduled sessions</h2><div id="sessions-list" class="mt-5 space-y-3"></div></div></div></div>`,
        timetable: `<div class="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]"><div class="rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-sm">${timetableFormHtml()}</div><div class="rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-sm"><div class="flex items-center justify-between"><h2 class="text-2xl font-semibold">Weekly structure</h2><span id="timetable-count" class="rounded-full bg-sand-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500"></span></div><div id="timetable-list" class="mt-5 grid gap-4 md:grid-cols-2"></div></div></div>`,
        timer: `<div class="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]"><div class="rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-sm">${timerPanelHtml()}</div><div class="rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-sm"><div class="flex items-center justify-between"><h2 class="text-2xl font-semibold">Planned focus blocks</h2><span id="timer-session-count" class="rounded-full bg-sand-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500"></span></div><div id="timer-session-list" class="mt-5 space-y-3"></div></div></div>`,
        mood: `<div class="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><div class="rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-sm">${moodFormHtml()}</div><div class="rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-sm"><div class="flex items-center justify-between"><h2 class="text-2xl font-semibold">Recent mood history</h2><span id="mood-count" class="rounded-full bg-sand-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500"></span></div><div id="mood-list" class="mt-5 space-y-3"></div></div></div>`,
        friends: `<div class="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]" id="friends-container"><div class="rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-sm transition-all" id="friends-sidebar"><h2 class="text-2xl font-semibold">Academic AI Assistant</h2><p class="mt-2 text-sm text-stone-600">Choose the kind of academic support you need.</p><div class="mt-5 space-y-3"><button class="friend-select-btn w-full rounded-2xl border border-sand-300 bg-white p-4 text-left shadow-sm transition hover:border-moss-500 active:scale-95" data-persona="motivator"><p class="font-semibold text-moss-700">Study Coach</p><p class="mt-1 text-xs text-stone-500">Encouragement and study support for homework, focus, and exam preparation.</p></button><button class="friend-select-btn w-full rounded-2xl border border-sand-300 bg-white p-4 text-left shadow-sm transition hover:border-moss-500 active:scale-95" data-persona="expert"><p class="font-semibold text-moss-700">Subject Tutor</p><p class="mt-1 text-xs text-stone-500">Concept explanations, step-by-step solutions, and study guidance.</p></button></div></div><div class="hidden h-[600px] flex-col rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-sm" id="chat-area"><div class="flex items-center justify-between border-b border-sand-200 pb-4"><div class="flex items-center gap-3"><button id="back-to-friends" class="rounded-full bg-sand-100 p-2 transition hover:bg-sand-200 active:scale-95">←</button><h2 id="chat-title" class="text-xl font-semibold">Select an academic assistant</h2></div></div><div id="chat-messages" class="flex-1 space-y-4 overflow-y-auto py-4 text-sm"><div class="text-center text-stone-500">Academic chat history will appear here.</div></div><form id="chat-form" class="mt-4 flex gap-3"><input type="text" id="chat-input" class="flex-1 rounded-full border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm transition" placeholder="Ask about homework, concepts, or exam prep..." disabled><button type="submit" id="chat-submit" class="rounded-full bg-moss-700 px-6 py-3 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50" disabled>Send</button></form></div></div>`,
        profile: `<div class="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"><div class="rounded-[2rem] border border-sand-200 bg-white/80 p-6 shadow-sm">${profileFormHtml()}</div></div>`,
    };

    return views[state.activeSection];
}

function subjectFormHtml() {
    return `<h2 class="text-2xl font-semibold">Add a subject</h2><form id="subject-form" class="mt-5 space-y-4"><div><label class="text-sm font-medium text-stone-700">Name</label><input name="name" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm" required></div><div><label class="text-sm font-medium text-stone-700">Accent color</label><input name="accent_color" type="color" value="#8FB7A5" class="mt-2 h-12 w-full rounded-2xl border border-sand-300 bg-white/90 p-2"></div><button class="rounded-full bg-moss-700 px-5 py-3 text-sm font-semibold text-white transition active:scale-95">Save subject</button></form>`;
}

function planFormHtml() {
    return `<h2 class="text-2xl font-semibold">Create a study plan</h2><form id="plan-form" class="mt-5 space-y-4"><div><label class="text-sm font-medium text-stone-700">Subject</label><select name="subject_id" id="plan-subject" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></select></div><div><label class="text-sm font-medium text-stone-700">Title</label><input name="title" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm" required></div><div><label class="text-sm font-medium text-stone-700">Description</label><textarea name="description" rows="4" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></textarea></div><div class="grid gap-4 md:grid-cols-3"><div><label class="text-sm font-medium text-stone-700">Target date</label><input name="target_date" type="date" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></div><div><label class="text-sm font-medium text-stone-700">Effort</label><input name="estimated_effort_hours" type="number" min="1" value="2" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></div><div><label class="text-sm font-medium text-stone-700">Priority</label><select name="priority" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select></div></div><button class="rounded-full bg-moss-700 px-5 py-3 text-sm font-semibold text-white transition active:scale-95">Create plan</button></form>`;
}

function sessionFormHtml() {
    return `<h2 class="text-2xl font-semibold">Schedule a session</h2><form id="session-form" class="mt-5 space-y-4"><div><label class="text-sm font-medium text-stone-700">Plan</label><select name="plan_id" id="session-plan" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></select></div><div><label class="text-sm font-medium text-stone-700">Subject</label><select name="subject_id" id="session-subject" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></select></div><div><label class="text-sm font-medium text-stone-700">Title</label><input name="title" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm" required></div><div class="grid gap-4 md:grid-cols-2"><div><label class="text-sm font-medium text-stone-700">Start</label><input name="scheduled_start" type="datetime-local" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></div><div><label class="text-sm font-medium text-stone-700">End</label><input name="scheduled_end" type="datetime-local" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></div></div><div class="grid gap-4 md:grid-cols-3"><div><label class="text-sm font-medium text-stone-700">Mode</label><select name="timer_mode" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"><option value="pomodoro">Pomodoro</option><option value="custom">Custom Focus</option><option value="stopwatch">Stopwatch</option></select></div><div><label class="text-sm font-medium text-stone-700">Focus</label><input name="focus_minutes" type="number" min="1" value="25" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></div><div><label class="text-sm font-medium text-stone-700">Break</label><input name="break_minutes" type="number" min="0" value="5" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></div></div><button class="rounded-full bg-moss-700 px-5 py-3 text-sm font-semibold text-white transition active:scale-95">Save session</button></form>`;
}

function timetableFormHtml() {
    return `<h2 class="text-2xl font-semibold">Add timetable block</h2><form id="timetable-form" class="mt-5 space-y-4"><div><label class="text-sm font-medium text-stone-700">Subject</label><select name="subject_id" id="timetable-subject" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></select></div><div><label class="text-sm font-medium text-stone-700">Title</label><input name="title" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm" required></div><div class="grid gap-4 md:grid-cols-2"><div><label class="text-sm font-medium text-stone-700">Day</label><select name="day_of_week" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm">${weekdayLabels.map((label, index) => `<option value="${index}">${label}</option>`).join("")}</select></div><div><label class="text-sm font-medium text-stone-700">Type</label><select name="entry_type" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"><option value="study">Study</option><option value="class">Class</option><option value="break">Break</option></select></div></div><div class="grid gap-4 md:grid-cols-2"><div><label class="text-sm font-medium text-stone-700">Start</label><input name="start_time" type="time" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm" required></div><div><label class="text-sm font-medium text-stone-700">End</label><input name="end_time" type="time" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm" required></div></div><div class="flex flex-wrap gap-3"><button class="rounded-full bg-moss-700 px-5 py-3 text-sm font-semibold text-white transition active:scale-95">Save block</button><button type="button" id="ai-timetable-btn" class="rounded-full border border-moss-700 bg-moss-50 px-5 py-3 text-sm font-semibold text-moss-700 transition hover:bg-moss-100">Auto-generate weekly plan</button></div></form>`;
}

function timerPanelHtml() {
    return `<div class="flex items-center justify-between gap-4"><div><p id="timer-label" class="text-sm uppercase tracking-[0.18em] text-stone-400">Pomodoro</p><h2 id="timer-display" class="mt-3 font-serif text-6xl">25:00</h2></div><div id="timer-phase" class="rounded-3xl bg-sand-100 px-4 py-3 text-sm font-medium text-stone-600">Focus phase</div></div><div class="mt-5 grid gap-4 md:grid-cols-2"><div><label class="text-sm font-medium text-stone-700">Focus minutes</label><input id="timer-focus-minutes" type="number" min="1" value="25" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></div><div><label class="text-sm font-medium text-stone-700">Break minutes</label><input id="timer-break-minutes" type="number" min="0" value="5" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></div></div><div class="mt-5 flex flex-wrap gap-3"><button class="timer-mode rounded-full border border-sand-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700" data-mode="pomodoro" data-focus="25" data-break="5">Pomodoro</button><button class="timer-mode rounded-full border border-sand-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700" data-mode="custom" data-focus="45" data-break="10">Custom</button><button class="timer-mode rounded-full border border-sand-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700" data-mode="stopwatch" data-focus="0" data-break="0">Stopwatch</button></div><div class="mt-5 grid gap-3 sm:grid-cols-2"><button id="timer-start" class="rounded-full bg-moss-700 px-5 py-3 text-sm font-semibold text-white">Start</button><button id="timer-pause" class="rounded-full border border-sand-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700">Pause</button><button id="timer-reset" class="rounded-full border border-sand-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700">Reset</button><button id="timer-complete" class="rounded-full bg-sand-100 px-5 py-3 text-sm font-semibold text-moss-700">Complete session</button></div><div class="mt-5"><label class="text-sm font-medium text-stone-700">Link to planned session</label><select id="timer-session-id" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></select></div><p id="timer-feedback" class="mt-4 text-sm text-stone-600">Timer state is stored locally so you can refresh without losing the session.</p>`;
}

function moodFormHtml() {
    return `<h2 class="text-2xl font-semibold">Log today's mood</h2><form id="mood-form" class="mt-5 space-y-4"><div><label class="text-sm font-medium text-stone-700">Mood level</label><select name="level" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm">${Object.entries(moodLabels).map(([value, label]) => `<option value="${value}" ${value === "3" ? "selected" : ""}>${label}</option>`).join("")}</select></div><div><label class="text-sm font-medium text-stone-700">Note</label><textarea name="note" rows="4" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></textarea></div><div><label class="text-sm font-medium text-stone-700">Logged for</label><input name="logged_for" id="mood-date" type="date" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></div><button class="rounded-full bg-moss-700 px-5 py-3 text-sm font-semibold text-white transition active:scale-95">Save mood</button></form>`;
}

function profileFormHtml() {
    return `<h2 class="text-2xl font-semibold">Profile settings</h2><form id="profile-form" class="mt-5 space-y-4"><div><label class="text-sm font-medium text-stone-700">Full name</label><input name="full_name" id="profile-full-name" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></div><div><label class="text-sm font-medium text-stone-700">Email</label><input id="profile-email" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm" disabled></div><div><label class="text-sm font-medium text-stone-700">Education stage</label><select name="education_stage" id="profile-education-stage" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 py-3 pl-4 pr-10 text-sm text-stone-700 shadow-sm appearance-none"><option value="elementary">Elementary</option><option value="high-school">High School</option><option value="higher-studies">Higher Studies</option></select></div><div class="grid gap-4 md:grid-cols-2"><div><label class="text-sm font-medium text-stone-700">Preferred study duration</label><input name="preferred_study_duration" id="profile-duration" type="number" min="15" max="180" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></div><div><label class="text-sm font-medium text-stone-700">Timezone</label><input name="timezone" id="profile-timezone" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm"></div></div><div class="grid gap-4 md:grid-cols-2"><div><label class="text-sm font-medium text-stone-700">App Theme</label><select id="profile-theme" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 py-3 pl-4 pr-10 text-sm text-stone-700 shadow-sm appearance-none"><option value="default">Default (Light)</option><option value="ocean">Ocean</option></select></div><div><label class="text-sm font-medium text-stone-700">Accessibility</label><select id="profile-a11y" class="mt-2 w-full rounded-2xl border border-sand-300 bg-white/90 py-3 pl-4 pr-10 text-sm text-stone-700 shadow-sm appearance-none"><option value="normal">Standard</option><option value="large">Large Text</option><option value="contrast">High Contrast</option></select></div></div><label class="flex items-center gap-3 rounded-2xl border border-sand-200 bg-sand-100 px-4 py-3 text-sm text-stone-700"><input type="checkbox" name="notifications_enabled" id="profile-notifications"><span>Notifications enabled</span></label><button class="rounded-full bg-moss-700 px-5 py-3 text-sm font-semibold text-white transition active:scale-95 hover-lift">Save profile</button></form>`;
}

function bindAppEvents() {
    document.querySelector("#subject-form")?.addEventListener("submit", handleCreateSubject);
    document.querySelector("#plan-form")?.addEventListener("submit", handleCreatePlan);
    document.querySelector("#session-form")?.addEventListener("submit", handleCreateSession);
    document.querySelector("#timetable-form")?.addEventListener("submit", handleCreateTimetable);
    document.querySelector("#ai-timetable-btn")?.addEventListener("click", handleGenerateTimetable);
    document.querySelector("#mood-form")?.addEventListener("submit", handleSaveMood);
    document.querySelector("#profile-form")?.addEventListener("submit", handleSaveProfile);
    mountTimer();
    mountChat();
}

function renderData() {
    renderSummary();

    if (state.activeSection === "dashboard") {
        renderDashboardCards();
    }

    if (state.activeSection === "planner") {
        renderPlannerCards();
    }

    if (state.activeSection === "timetable") {
        renderTimetableCards();
    }

    if (state.activeSection === "timer") {
        renderTimerCards();
    }

    if (state.activeSection === "mood") {
        renderMoodCards();
    }

    if (state.activeSection === "profile") {
        renderProfileForm();
    }
}

function renderSummary() {
    const timeZone = getActiveTimeZone();
    const todayKey = todayISO(timeZone);
    const sessionsToday = state.sessions.filter((session) => (
        matchesDay(session.scheduled_start, todayKey, timeZone)
    ));
    const completedMinutes = sessionsToday
        .filter((session) => session.status === "completed")
        .reduce((sum, session) => sum + Number(session.actual_duration_minutes || 0), 0);

    document.querySelector("#summary-today").textContent = String(sessionsToday.length);
    document.querySelector("#summary-minutes").textContent = String(completedMinutes);
    document.querySelector("#summary-streak").textContent = String(computeStreak(state.sessions, timeZone));
}

function optionMarkup(items, fallback = "General") {
    return `<option value="">${fallback}</option>${items.map((item) => `<option value="${item.id}">${escapeHtml(item.name || item.title)}</option>`).join("")}`;
}

function findSubjectName(subjectId) {
    return state.subjects.find((subject) => subject.id === subjectId)?.name || "General";
}

function renderDashboardCards() {
    const timeZone = getActiveTimeZone();
    const now = new Date().toISOString();
    const streak = computeStreak(state.sessions, timeZone);
    const next = state.sessions
        .filter((session) => session.status !== "completed" && session.scheduled_start && session.scheduled_start >= now)
        .sort((a, b) => a.scheduled_start.localeCompare(b.scheduled_start))[0];
    const mood = state.moods[0];
    const todayCompleted = state.sessions.filter((session) => (
        session.status === "completed" && matchesDay(session.completed_at, todayISO(timeZone), timeZone)
    )).length;
    const motivation = mood && Number(mood.level) <= 2
        ? "You do not need a perfect day. One calm session is enough to restart your rhythm."
        : streak >= 5
            ? `You are on a ${streak}-day streak. Protect your momentum with one focused block today.`
            : todayCompleted >= 2
                ? "Your effort is stacking up today. Finish with a short review and call it a win."
                : "Start small, stay kind to yourself, and let one focused session lead the day.";

    document.querySelector("#dashboard-next-session").innerHTML = next
        ? `<p class="text-xs uppercase tracking-[0.18em] text-stone-400">Next session</p><p class="mt-2 text-lg font-semibold">${escapeHtml(next.title)}</p><p class="mt-1 text-sm text-stone-500">${formatDateTime(next.scheduled_start, timeZone)}</p>`
        : "No session scheduled yet.";
    document.querySelector("#dashboard-mood").textContent = mood ? moodLabels[mood.level] : "No check-in yet";
    document.querySelector("#dashboard-motivation").textContent = motivation;
    document.querySelector("#dashboard-session-count").textContent = `${state.sessions.length} sessions`;
    document.querySelector("#dashboard-sessions-list").innerHTML = state.sessions.slice(0, 5).map((session) => `
        <div class="rounded-3xl border border-sand-200 bg-sand-100 p-4">
            <p class="font-semibold">${escapeHtml(session.title)}</p>
            <p class="mt-1 text-sm text-stone-500">${session.scheduled_start ? formatDateTime(session.scheduled_start, timeZone) : "No date yet"} | ${escapeHtml(session.timer_mode || "pomodoro")}</p>
        </div>
    `).join("") || `<p class="text-sm text-stone-600">No sessions yet. Add one in Planner.</p>`;
}

function renderPlannerCards() {
    document.querySelector("#plan-subject").innerHTML = optionMarkup(state.subjects);
    document.querySelector("#session-subject").innerHTML = optionMarkup(state.subjects);
    document.querySelector("#session-plan").innerHTML = `<option value="">General session</option>${state.plans.map((plan) => `<option value="${plan.id}">${escapeHtml(plan.title)}</option>`).join("")}`;
    document.querySelector("#plans-count").textContent = `${state.plans.length} plans`;
    document.querySelector("#plans-list").innerHTML = state.plans.map((plan) => `
        <div class="rounded-3xl border border-sand-200 bg-sand-100 p-5">
            <p class="font-semibold">${escapeHtml(plan.title)}</p>
            <p class="mt-1 text-sm text-stone-500">${escapeHtml(findSubjectName(plan.subject_id))} | ${escapeHtml(plan.priority)}</p>
            <p class="mt-3 text-sm leading-7 text-stone-600">${escapeHtml(plan.description || "No description yet.")}</p>
        </div>
    `).join("") || `<p class="text-sm text-stone-600">No plans yet.</p>`;
    document.querySelector("#sessions-list").innerHTML = state.sessions.map((session) => `
        <div class="rounded-3xl border border-sand-200 bg-sand-100 p-4">
            <p class="font-semibold">${escapeHtml(session.title)}</p>
            <p class="mt-1 text-sm text-stone-500">${escapeHtml(session.timer_mode || "pomodoro")} | ${Number(session.focus_minutes || 25)} focus / ${Number(session.break_minutes || 5)} break</p>
            <p class="mt-1 text-sm text-stone-500">${session.scheduled_start ? formatDateTime(session.scheduled_start, getActiveTimeZone()) : "No date yet"}</p>
        </div>
    `).join("") || `<p class="text-sm text-stone-600">No sessions yet.</p>`;
}

function renderTimetableCards() {
    document.querySelector("#timetable-subject").innerHTML = optionMarkup(state.subjects);
    document.querySelector("#timetable-count").textContent = `${state.timetable.length} entries`;
    document.querySelector("#timetable-list").innerHTML = state.timetable.map((entry) => `
        <div class="rounded-3xl border border-sand-200 bg-sand-100 p-4">
            <p class="font-semibold">${escapeHtml(entry.title)}</p>
            <p class="mt-1 text-sm text-stone-500">${weekdayLabels[entry.day_of_week]} | ${entry.start_time} - ${entry.end_time}</p>
            <p class="mt-1 text-sm text-stone-600">${escapeHtml(findSubjectName(entry.subject_id))} | ${escapeHtml(entry.entry_type)}</p>
        </div>
    `).join("") || `<p class="text-sm text-stone-600">No timetable blocks yet.</p>`;
}

function renderTimerCards() {
    document.querySelector("#timer-session-id").innerHTML = `<option value="">Ad hoc focus block</option>${state.sessions.filter((session) => session.status !== "completed").map((session) => `<option value="${session.id}">${escapeHtml(session.title)}</option>`).join("")}`;
    document.querySelector("#timer-session-count").textContent = `${state.sessions.length} sessions`;
    document.querySelector("#timer-session-list").innerHTML = state.sessions.map((session) => `
        <div class="rounded-3xl border border-sand-200 bg-sand-100 p-4">
            <p class="font-semibold">${escapeHtml(session.title)}</p>
            <p class="mt-1 text-sm text-stone-500">${session.scheduled_start ? formatDateTime(session.scheduled_start, getActiveTimeZone()) : "No date yet"} | ${escapeHtml(session.status)}</p>
        </div>
    `).join("") || `<p class="text-sm text-stone-600">No planned focus blocks yet.</p>`;
}

function renderMoodCards() {
    document.querySelector("#mood-date").value = todayISO(getActiveTimeZone());
    document.querySelector("#mood-count").textContent = `${state.moods.length} entries`;
    document.querySelector("#mood-list").innerHTML = state.moods.map((mood) => `
        <div class="rounded-3xl border border-sand-200 bg-sand-100 p-4">
            <div class="flex items-center justify-between gap-3">
                <p class="font-semibold">${moodLabels[mood.level]}</p>
                <p class="text-xs uppercase tracking-[0.18em] text-stone-400">${mood.logged_for}</p>
            </div>
            <p class="mt-2 text-sm text-stone-600">${escapeHtml(mood.note || "No note added.")}</p>
        </div>
    `).join("") || `<p class="text-sm text-stone-600">No mood entries yet.</p>`;
}

function renderProfileForm() {
    document.querySelector("#profile-full-name").value = state.profile?.full_name || "";
    document.querySelector("#profile-email").value = state.user?.email || "";
    document.querySelector("#profile-education-stage").value = state.profile?.education_stage || "high-school";
    document.querySelector("#profile-duration").value = state.profile?.preferred_study_duration || 45;
    document.querySelector("#profile-timezone").value = state.profile?.timezone || getActiveTimeZone();
    document.querySelector("#profile-notifications").checked = state.profile?.notifications_enabled ?? true;
    document.querySelector("#profile-theme").value = getStoredTheme();
    document.querySelector("#profile-a11y").value = getStoredA11y();
}

async function handleLogin(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { error } = await state.supabase.auth.signInWithPassword({
        email: form.get("email"),
        password: form.get("password"),
    });

    if (error) {
        toast(error.message, "error");
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = form.get("email");
    const fullName = form.get("full_name");
    const educationStage = form.get("education_stage");
    const { data, error } = await state.supabase.auth.signUp({
        email,
        password: form.get("password"),
        options: { data: { full_name: fullName } },
    });

    if (error) {
        return toast(error.message, "error");
    }

    if (data.user) {
        state.user = data.user;
        await ensureProfile({ full_name: fullName, education_stage: educationStage });
        setSection("dashboard");
    }
}

async function signOut() {
    await state.supabase.auth.signOut();
    state.user = null;
    resetUserCollections();
    renderNav();
    document.querySelector("#marketing-screen").classList.remove("hidden");
    document.querySelector("#app-screen").classList.add("hidden");
    renderMarketing();
    clearBootStatus();
}

async function handleCreateSubject(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { error } = await state.supabase.from("subjects").insert({
        user_id: state.user.id,
        name: form.get("name"),
        accent_color: form.get("accent_color") || "#8FB7A5",
    });

    if (error) {
        if (error.code === "23505") {
            return toast("You already have a subject with this name.", "error");
        }

        return toast(error.message, "error");
    }

    event.currentTarget.reset();
    await loadData();
    renderData();
    toast("Subject saved.");
}

async function handleCreatePlan(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { error } = await state.supabase.from("study_plans").insert({
        user_id: state.user.id,
        subject_id: form.get("subject_id") || null,
        title: form.get("title"),
        description: form.get("description") || "",
        target_date: form.get("target_date") || null,
        estimated_effort_hours: Number(form.get("estimated_effort_hours") || 2),
        priority: form.get("priority") || "medium",
    });

    if (error) {
        return toast(error.message, "error");
    }

    event.currentTarget.reset();
    await loadData();
    renderData();
    toast("Plan created.");
}

async function handleCreateSession(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const startValue = String(form.get("scheduled_start") || "");
    const endValue = String(form.get("scheduled_end") || "");
    const scheduledStart = dateTimeInputToIso(startValue);
    const scheduledEnd = dateTimeInputToIso(endValue);

    if (startValue && !scheduledStart) {
        return toast("Please enter a valid session start time.", "error");
    }

    if (endValue && !scheduledEnd) {
        return toast("Please enter a valid session end time.", "error");
    }

    if (scheduledStart && scheduledEnd && scheduledEnd <= scheduledStart) {
        return toast("Session end must be after the start time.", "error");
    }

    const { error } = await state.supabase.from("study_sessions").insert({
        user_id: state.user.id,
        plan_id: form.get("plan_id") || null,
        subject_id: form.get("subject_id") || null,
        title: form.get("title"),
        scheduled_start: scheduledStart,
        scheduled_end: scheduledEnd,
        timer_mode: form.get("timer_mode") || "pomodoro",
        focus_minutes: Number(form.get("focus_minutes") || 25),
        break_minutes: Number(form.get("break_minutes") || 5),
    });

    if (error) {
        return toast(error.message, "error");
    }

    event.currentTarget.reset();
    await loadData();
    renderData();
    toast("Session saved.");
}

async function handleCreateTimetable(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const entry = {
        user_id: state.user.id,
        subject_id: form.get("subject_id") || null,
        title: form.get("title"),
        day_of_week: Number(form.get("day_of_week")),
        entry_type: form.get("entry_type") || "study",
        start_time: form.get("start_time"),
        end_time: form.get("end_time"),
    };

    if (entry.end_time <= entry.start_time) {
        return toast("End time must be after start time.", "error");
    }

    const overlap = state.timetable.some((item) => (
        item.day_of_week === entry.day_of_week &&
        item.start_time < entry.end_time &&
        item.end_time > entry.start_time
    ));

    if (overlap) {
        return toast("This timetable slot overlaps with an existing entry.", "error");
    }

    const { error } = await state.supabase.from("timetable_entries").insert(entry);

    if (error) {
        return toast(error.message, "error");
    }

    event.currentTarget.reset();
    await loadData();
    renderData();
    toast("Timetable block saved.");
}

async function handleGenerateTimetable() {
    if (state.subjects.length === 0) {
        return toast("Please add some subjects in the Planner section first.", "error");
    }

    const button = document.querySelector("#ai-timetable-btn");
    const originalText = button.textContent;
    const duration = Number(state.profile?.preferred_study_duration || 45);
    const stage = state.profile?.education_stage || "high-school";
    const subjectList = state.subjects.map((subject) => `ID: ${subject.id}, Name: ${subject.name}`).join("\n");
    const prompt = `You are a study planner AI. Generate a weekly study timetable for a ${stage} student.
Their preferred study session duration is ${duration} minutes.
They are studying these subjects:
${subjectList}

Create a balanced schedule spreading out 10-15 study sessions across the week.
Use day_of_week values from 0-6 where 0 is Sunday.
Make sure end_time is exactly ${duration} minutes after start_time.
Use 24-hour time format (HH:MM).

Respond ONLY with valid JSON. Do not include markdown code blocks or any other text. Return an array of objects:
[
  {
    "subject_id": <numeric ID from the list>,
    "title": "Study session title",
    "day_of_week": <0-6>,
    "entry_type": "study",
    "start_time": "15:00",
    "end_time": "15:45"
  }
]`;

    button.textContent = "Generating...";
    button.disabled = true;
    toast("Generating your study schedule... This may take a moment.");

    try {
        const content = await requestChatCompletion([{ role: "user", content: prompt }]);
        const entries = parseJsonReply(content);
        const validEntries = validateTimetableEntries(entries, {
            validSubjectIds: new Set(state.subjects.map((subject) => Number(subject.id))),
            sessionDuration: duration,
        });

        const { error } = await state.supabase.from("timetable_entries").insert(validEntries.map((entry) => ({
            user_id: state.user.id,
            ...entry,
        })));

        if (error) {
            throw error;
        }

        await loadData();
        renderData();
        toast("AI timetable successfully generated!");
    } catch (error) {
        console.error(error);
        toast(`Failed: ${error.message}`, "error");
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

async function handleSaveMood(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
        user_id: state.user.id,
        level: Number(form.get("level")),
        note: form.get("note") || "",
        logged_for: form.get("logged_for") || todayISO(getActiveTimeZone()),
    };
    const { error } = await state.supabase.from("mood_entries").upsert(payload, {
        onConflict: "user_id,logged_for",
    });

    if (error) {
        return toast(error.message, "error");
    }

    await loadData();
    renderData();
    toast("Mood saved.");
}

async function handleSaveProfile(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
        id: state.user.id,
        full_name: form.get("full_name") || "",
        education_stage: form.get("education_stage"),
        preferred_study_duration: Number(form.get("preferred_study_duration") || 45),
        timezone: form.get("timezone") || "UTC",
        notifications_enabled: form.get("notifications_enabled") === "on",
    };
    const themeSelect = document.querySelector("#profile-theme");
    const a11ySelect = document.querySelector("#profile-a11y");

    if (themeSelect) {
        window.localStorage.setItem(themeStorageKey, themeSelect.value);
    }

    if (a11ySelect) {
        window.localStorage.setItem(a11yStorageKey, a11ySelect.value);
    }

    applyTheme();

    const { error } = await state.supabase.from("profiles").upsert(payload);

    if (error) {
        return toast(error.message, "error");
    }

    await loadData();
    renderData();
    toast("Profile updated.");
}

function mountChat() {
    const form = document.querySelector("#chat-form");

    if (!form) {
        return;
    }

    document.querySelectorAll(".friend-select-btn").forEach((button) => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".friend-select-btn").forEach((item) => {
                item.classList.remove("border-moss-500", "bg-moss-50");
            });
            button.classList.add("border-moss-500", "bg-moss-50");

            const newPersona = button.dataset.persona;
            document.querySelector("#chat-title").textContent = button.querySelector("p.font-semibold").textContent;
            document.querySelector("#chat-input").disabled = false;
            document.querySelector("#chat-submit").disabled = false;
            document.querySelector("#friends-sidebar").classList.add("hidden");
            document.querySelector("#chat-area").classList.remove("hidden");
            document.querySelector("#chat-area").classList.add("flex");
            document.querySelector("#friends-container").classList.remove("xl:grid-cols-[0.7fr_1.3fr]");
            document.querySelector("#friends-container").classList.add("grid-cols-1");

            if (state.chatPersona !== newPersona) {
                state.chatHistory = [];
                state.chatPersona = newPersona;
                document.querySelector("#chat-messages").innerHTML = `<div class="text-center text-stone-500">Started chat with ${chatPersonaLabel(newPersona)}. Ask an academic question to begin.</div>`;
            } else {
                document.querySelector("#chat-messages").innerHTML = "";
                if (state.chatHistory.length === 0) {
                    document.querySelector("#chat-messages").innerHTML = `<div class="text-center text-stone-500">Started chat with ${chatPersonaLabel(newPersona)}. Ask an academic question to begin.</div>`;
                } else {
                    state.chatHistory.forEach((message) => appendMessage(message.role, message.content));
                }
            }
        });
    });

    document.querySelector("#back-to-friends")?.addEventListener("click", () => {
        document.querySelector("#friends-sidebar").classList.remove("hidden");
        document.querySelector("#chat-area").classList.add("hidden");
        document.querySelector("#chat-area").classList.remove("flex");
        document.querySelector("#friends-container").classList.add("xl:grid-cols-[0.7fr_1.3fr]");
        document.querySelector("#friends-container").classList.remove("grid-cols-1");
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!state.chatPersona) {
            return;
        }

        const input = document.querySelector("#chat-input");
        const message = input.value.trim();

        if (!message) {
            return;
        }

        input.value = "";
        appendMessage("user", message);
        state.chatHistory.push({ role: "user", content: message });

        const systemPrompt = chatPersonaPrompt(state.chatPersona);
        const submitButton = document.querySelector("#chat-submit");

        submitButton.textContent = "...";
        submitButton.disabled = true;

        try {
            const reply = await requestChatCompletion([
                { role: "system", content: systemPrompt },
                ...state.chatHistory,
            ]);
            state.chatHistory.push({ role: "assistant", content: reply });
            appendMessage("assistant", reply);
        } catch (error) {
            toast(`Chat error: ${error.message}`, "error");
        } finally {
            submitButton.textContent = "Send";
            submitButton.disabled = false;
        }
    });
}

function appendMessage(role, text) {
    const container = document.querySelector("#chat-messages");
    const div = document.createElement("div");

    div.className = `flex ${role === "user" ? "justify-end" : "justify-start"}`;
    div.innerHTML = `<div class="max-w-[80%] rounded-2xl p-4 ${role === "user" ? "bg-moss-700 text-white" : "bg-sand-100 text-stone-700"} whitespace-pre-wrap">${escapeHtml(text)}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function loadTimerState() {
    try {
        return JSON.parse(window.localStorage.getItem(timerStorageKey) || "null");
    } catch {
        return null;
    }
}

function saveTimerState(timer) {
    window.localStorage.setItem(timerStorageKey, JSON.stringify(timer));
}

function formatSeconds(total) {
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function mountTimer() {
    const display = document.querySelector("#timer-display");

    if (!display) {
        return;
    }

    const label = document.querySelector("#timer-label");
    const phase = document.querySelector("#timer-phase");
    const feedback = document.querySelector("#timer-feedback");
    const focusInput = document.querySelector("#timer-focus-minutes");
    const breakInput = document.querySelector("#timer-break-minutes");
    const sessionSelect = document.querySelector("#timer-session-id");
    let timer = loadTimerState() || {
        mode: "pomodoro",
        focusMinutes: 25,
        breakMinutes: 5,
        phase: "focus",
        running: false,
        remainingSeconds: 1500,
        baseSeconds: 1500,
        startedAt: null,
    };

    const sync = () => {
        focusInput.value = timer.focusMinutes;
        breakInput.value = timer.breakMinutes;
        label.textContent = timer.mode;
        phase.textContent = timer.phase === "break" ? "Break phase" : timer.phase === "open" ? "Open session" : "Focus phase";
        display.textContent = formatSeconds(Math.max(timer.remainingSeconds, 0));
        saveTimerState(timer);
    };

    const recalc = () => {
        if (!timer.running || !timer.startedAt) {
            return;
        }

        const elapsed = Math.floor((Date.now() - timer.startedAt) / 1000);

        if (timer.mode === "stopwatch") {
            timer.remainingSeconds = timer.baseSeconds + elapsed;
            return;
        }

        timer.remainingSeconds = timer.baseSeconds - elapsed;

        if (timer.remainingSeconds <= 0) {
            if (timer.phase === "focus" && timer.breakMinutes > 0) {
                timer.phase = "break";
                timer.baseSeconds = timer.breakMinutes * 60;
                timer.remainingSeconds = timer.baseSeconds;
                timer.startedAt = Date.now();
                feedback.textContent = "Focus complete. Break phase started.";
            } else {
                timer.running = false;
                timer.remainingSeconds = 0;
                feedback.textContent = "Timer finished. You can complete the session now.";
            }
        }
    };

    const applyMode = (mode, focus, rest) => {
        timer = {
            mode,
            focusMinutes: Number(focus),
            breakMinutes: Number(rest),
            phase: mode === "stopwatch" ? "open" : "focus",
            running: false,
            remainingSeconds: mode === "stopwatch" ? 0 : Number(focus) * 60,
            baseSeconds: mode === "stopwatch" ? 0 : Number(focus) * 60,
            startedAt: null,
        };
        sync();
    };

    document.querySelectorAll(".timer-mode").forEach((button) => {
        button.addEventListener("click", () => applyMode(button.dataset.mode, button.dataset.focus, button.dataset.break));
    });
    focusInput.addEventListener("change", (event) => {
        if (!timer.running && timer.mode !== "stopwatch") {
            applyMode(timer.mode, event.target.value, timer.breakMinutes);
        }
    });
    breakInput.addEventListener("change", (event) => {
        if (!timer.running && timer.mode !== "stopwatch") {
            applyMode(timer.mode, timer.focusMinutes, event.target.value);
        }
    });
    document.querySelector("#timer-start").onclick = () => {
        timer.focusMinutes = Number(focusInput.value || 25);
        timer.breakMinutes = Number(breakInput.value || 5);

        if (!timer.running) {
            if (timer.mode !== "stopwatch" && timer.remainingSeconds === 0) {
                timer.remainingSeconds = timer.focusMinutes * 60;
            }

            timer.baseSeconds = timer.remainingSeconds;
            timer.startedAt = Date.now();
            timer.running = true;
        }

        feedback.textContent = "Timer running.";
        sync();
    };
    document.querySelector("#timer-pause").onclick = () => {
        recalc();
        timer.running = false;
        timer.baseSeconds = timer.remainingSeconds;
        timer.startedAt = null;
        feedback.textContent = "Timer paused.";
        sync();
    };
    document.querySelector("#timer-reset").onclick = () => {
        applyMode(timer.mode, focusInput.value || timer.focusMinutes, breakInput.value || timer.breakMinutes);
        feedback.textContent = "Timer reset.";
    };
    document.querySelector("#timer-complete").onclick = async () => {
        const duration = timer.mode === "stopwatch"
            ? Math.max(1, Math.round(timer.remainingSeconds / 60))
            : Math.max(1, Math.round(((timer.focusMinutes * 60) - Math.max(timer.remainingSeconds, 0)) / 60));
        const sessionId = sessionSelect.value;

        if (!sessionId) {
            feedback.textContent = `Focus block complete. Estimated duration: ${duration} minutes.`;
            return;
        }

        const { error } = await state.supabase.from("study_sessions").update({
            status: "completed",
            actual_duration_minutes: duration,
            completed_at: new Date().toISOString(),
        }).eq("id", sessionId);

        if (error) {
            return toast(error.message, "error");
        }

        await loadData();
        renderData();
        feedback.textContent = `Session completed in ${duration} minutes.`;
        applyMode(timer.mode, focusInput.value || timer.focusMinutes, breakInput.value || timer.breakMinutes);
    };

    sync();
    window.clearInterval(window.__resyncTimer);
    window.__resyncTimer = window.setInterval(() => {
        recalc();
        sync();
    }, 1000);
}

document.addEventListener("DOMContentLoaded", async () => {
    initThemeControls();
    await registerServiceWorker();
    await initSupabase();
});
