const CACHE_NAME = "resync-shell-v3";
const SHELL_FILES = [
    "/",
    "/index.html",
    "/static/app.webmanifest",
    "/static/css/styles.css",
    "/static/js/app.js",
    "/static/icons/resync-icon.svg",
    "/static/icons/resync-logo.png",
];

function isShellAsset(requestUrl) {
    return SHELL_FILES.includes(requestUrl.pathname);
}

async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);

    try {
        const response = await fetch(request);

        if (response.ok && (request.mode === "navigate" || isShellAsset(new URL(request.url)))) {
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        if (request.mode === "navigate") {
            return caches.match("/index.html");
        }

        throw error;
    }
}

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting()),
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys
                .filter((key) => key !== CACHE_NAME)
                .map((key) => caches.delete(key)),
        )).then(() => self.clients.claim()),
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    const requestUrl = new URL(event.request.url);

    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    if (event.request.mode === "navigate" || isShellAsset(requestUrl)) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request)),
    );
});
