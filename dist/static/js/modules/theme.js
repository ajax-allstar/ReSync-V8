import { a11yStorageKey, themeStorageKey } from "./constants.js";

function normalizeTheme(theme) {
    return theme === "ocean" ? "ocean" : "default";
}

function normalizeA11y(mode) {
    return ["normal", "large", "contrast"].includes(mode) ? mode : "normal";
}

export function getStoredTheme() {
    return normalizeTheme(window.localStorage.getItem(themeStorageKey) || "default");
}

export function getStoredA11y() {
    return normalizeA11y(window.localStorage.getItem(a11yStorageKey) || "normal");
}

export function applyTheme() {
    const theme = getStoredTheme();
    const a11y = getStoredA11y();

    document.body.classList.remove("theme-ocean", "a11y-large-text", "a11y-high-contrast");

    if (theme === "ocean") {
        document.body.classList.add("theme-ocean");
    }

    if (a11y === "large") {
        document.body.classList.add("a11y-large-text");
    }

    if (a11y === "contrast") {
        document.body.classList.add("a11y-high-contrast");
    }

    const metaTheme = document.querySelector('meta[name="theme-color"]');

    if (metaTheme) {
        metaTheme.content = theme === "ocean" ? "#f0f8ff" : "#f4efe6";
    }

    const globalSelector = document.querySelector("#global-theme-selector");

    if (globalSelector) {
        globalSelector.value = theme;
    }
}

export function initThemeControls() {
    applyTheme();

    const globalSelector = document.querySelector("#global-theme-selector");

    if (!globalSelector || globalSelector.dataset.bound === "true") {
        return;
    }

    globalSelector.dataset.bound = "true";
    globalSelector.addEventListener("change", (event) => {
        window.localStorage.setItem(themeStorageKey, normalizeTheme(event.target.value));
        applyTheme();

        const profileSelector = document.querySelector("#profile-theme");

        if (profileSelector) {
            profileSelector.value = getStoredTheme();
        }
    });
}

function isLocalPreviewHost() {
    return ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

async function clearReSyncCaches() {
    if (!("caches" in window)) {
        return;
    }

    const keys = await caches.keys();
    await Promise.all(
        keys
            .filter((key) => key.startsWith("resync-"))
            .map((key) => caches.delete(key)),
    );
}

export async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        return;
    }

    if (!["http:", "https:"].includes(window.location.protocol)) {
        return;
    }

    try {
        if (isLocalPreviewHost()) {
            const registrations = await navigator.serviceWorker.getRegistrations();

            await Promise.all(registrations.map((registration) => registration.unregister()));
            await clearReSyncCaches();
            return;
        }

        await navigator.serviceWorker.register("/static/service-worker.js", {
            scope: "/",
            updateViaCache: "none",
        });
    } catch (error) {
        console.error("Service worker registration failed.", error);
    }
}
