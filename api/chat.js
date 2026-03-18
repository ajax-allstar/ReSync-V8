const allowedRoles = new Set(["system", "user", "assistant"]);

function validateBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object.";
  }

  if (typeof body.model !== "string" || !body.model.trim()) {
    return "A non-empty model string is required.";
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return "At least one message is required.";
  }

  const hasInvalidMessage = body.messages.some((message) => (
    !message ||
    typeof message !== "object" ||
    !allowedRoles.has(message.role) ||
    typeof message.content !== "string" ||
    !message.content.trim()
  ));

  if (hasInvalidMessage) {
    return "Messages must include a valid role and non-empty content.";
  }

  return null;
}

function upstreamOrigin(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const protocol = req.headers["x-forwarded-proto"] || "https";

  if (host) {
    return `${protocol}://${host}`;
  }

  return "https://resync-v8.vercel.app";
}

async function parseUpstreamJson(response) {
  const raw = await response.text();

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("OpenRouter returned a non-JSON response.");
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const validationError = validateBody(req.body);

  if (validationError) {
    return res.status(400).json({ error: { message: validationError } });
  }

  const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();

  if (!apiKey) {
    return res.status(500).json({ error: { message: "OpenRouter API key is not configured." } });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": req.headers.referer || upstreamOrigin(req),
        "X-Title": "ReSync V8",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: req.body.model.trim(),
        messages: req.body.messages.map((message) => ({
          role: message.role,
          content: message.content.trim(),
        })),
      }),
    });

    const data = await parseUpstreamJson(response);

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: { message: error.message || "Unexpected API error." } });
  }
}
