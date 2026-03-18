function toastClasses(type) {
    if (type === "error") {
        return "border-red-200 bg-red-50 text-red-700";
    }

    return "border-sand-300 bg-white/95 text-stone-700";
}

function bootStatusClasses(type) {
    if (type === "error") {
        return "border-red-200 bg-red-50 text-red-700";
    }

    if (type === "warning") {
        return "border-amber-200 bg-amber-50 text-amber-800";
    }

    return "border-sand-200 bg-white/90 text-stone-700";
}

export function toast(message, type = "info") {
    const el = document.querySelector("#toast");

    if (!el) {
        return;
    }

    el.textContent = message;
    el.className = `fixed right-4 top-4 z-50 rounded-2xl border px-4 py-3 text-sm shadow-paper animate-bounce-in ${toastClasses(type)}`;
    el.classList.remove("hidden");
    window.clearTimeout(el._timeout);
    el._timeout = window.setTimeout(() => el.classList.add("hidden"), 3200);
}

export function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;",
    }[char]));
}

export function showBootStatus(message, type = "info") {
    const el = document.querySelector("#boot-status");

    if (!el) {
        return;
    }

    el.textContent = message;
    el.className = `mb-6 rounded-3xl border px-4 py-3 text-sm shadow-sm ${bootStatusClasses(type)}`;
    el.classList.remove("hidden");
}

export function clearBootStatus() {
    const el = document.querySelector("#boot-status");

    if (!el) {
        return;
    }

    el.textContent = "";
    el.classList.add("hidden");
}
