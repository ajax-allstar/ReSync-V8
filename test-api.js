const apiUrl = process.env.RESYNC_CHAT_API_URL;

if (!apiUrl) {
    console.error("Set RESYNC_CHAT_API_URL to the deployed or local /api/chat endpoint before running this script.");
    process.exit(1);
}

const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        model: "arcee-ai/trinity-large-preview:free",
        messages: [{ role: "user", content: "Say hello" }],
    }),
});

const raw = await response.text();

console.log(raw);

if (!response.ok) {
    process.exit(1);
}
