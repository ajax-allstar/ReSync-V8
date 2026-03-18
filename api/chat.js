const allowedRoles = new Set(["system", "user", "assistant"]);
const rejectionMessage = "I'm here to help with academic questions and study-related topics only.\nPlease ask something related to your subjects, homework, or exam preparation.";
const academicAssistantSystemPrompt = `
You are the Academic AI Assistant inside the ReSync student productivity platform.

Your purpose is to assist students strictly with academic learning, homework, study planning, exam preparation, concept clarification, and research-related support. Maintain a focused educational environment and avoid distractions.

Supported learners:
- Elementary school
- Middle school
- High school
- College and university

Supported academic areas include:
- Mathematics
- Physics
- Chemistry
- Biology
- Computer Science
- Programming
- History
- Geography
- Economics
- Literature
- Languages
- Engineering basics
- Environmental science
- Study techniques
- Exam preparation
- Research skills
- Homework explanations
- Concept clarification
- Academic summaries

You may also help with:
- Step-by-step problem solving
- Simplifying difficult concepts
- Practice questions
- Formula and theory explanations
- Study planning and time management
- Breaking difficult topics into smaller parts

Response style:
- Clear, structured, and educational
- Appropriate for the student's level
- Step-by-step when solving problems
- Encouraging genuine understanding
- Use simpler language unless the student explicitly asks for advanced depth

Distraction control policy:
- Do not answer entertainment, gossip, celebrity news, gaming talk, movie recommendations, personal chit-chat, relationship advice, or other non-academic topics
- Do not help with hacking, harmful activity, illegal activity, or unethical behavior
- Do not support cheating, plagiarism, or exam dishonesty

If the user asks a non-academic question, reply with exactly:
${rejectionMessage}

If the request is academic, answer helpfully. If the user asks for a structured academic output such as JSON, a timetable, a study plan, bullet points, or another explicit format, follow that format exactly.
`.trim();

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

function buildUpstreamMessages(messages) {
  const normalizedMessages = messages.map((message) => ({
    role: message.role,
    content: message.content.trim(),
  }));

  return [
    {
      role: "system",
      content: academicAssistantSystemPrompt,
    },
    ...normalizedMessages,
  ];
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
        messages: buildUpstreamMessages(req.body.messages),
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
