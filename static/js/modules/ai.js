import { chatModel } from "./constants.js";

const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

async function readJsonResponse(response) {
    const raw = await response.text();

    if (!raw) {
        return {};
    }

    try {
        return JSON.parse(raw);
    } catch {
        throw new Error(response.ok ? "Chat API returned invalid JSON." : raw.slice(0, 180));
    }
}

function stripCodeFence(content) {
    const trimmed = content.trim();

    if (!trimmed.startsWith("```")) {
        return trimmed;
    }

    return trimmed.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
}

function parseClockTime(value) {
    const [hours, minutes] = value.split(":").map(Number);
    return (hours * 60) + minutes;
}

export async function requestChatCompletion(messages, model = chatModel) {
    const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model,
            messages,
        }),
    });

    const data = await readJsonResponse(response);

    if (!response.ok) {
        throw new Error(data?.error?.message || "API request failed.");
    }

    if (data?.error?.message) {
        throw new Error(data.error.message);
    }

    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
        throw new Error("Chat API returned an empty response.");
    }

    return content.trim();
}

export function parseJsonReply(content) {
    return JSON.parse(stripCodeFence(content));
}

export function validateTimetableEntries(entries, { validSubjectIds, sessionDuration }) {
    if (!Array.isArray(entries) || entries.length === 0) {
        throw new Error("AI did not return any timetable entries.");
    }

    return entries.map((entry, index) => {
        const subjectId = Number(entry.subject_id);
        const dayOfWeek = Number(entry.day_of_week);
        const title = String(entry.title || "").trim();
        const startTime = String(entry.start_time || "").trim();
        const endTime = String(entry.end_time || "").trim();

        if (!Number.isInteger(subjectId) || !validSubjectIds.has(subjectId)) {
            throw new Error(`AI entry ${index + 1} has an invalid subject.`);
        }

        if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
            throw new Error(`AI entry ${index + 1} has an invalid day.`);
        }

        if (!title) {
            throw new Error(`AI entry ${index + 1} is missing a title.`);
        }

        if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
            throw new Error(`AI entry ${index + 1} has an invalid time format.`);
        }

        if (parseClockTime(endTime) <= parseClockTime(startTime)) {
            throw new Error(`AI entry ${index + 1} ends before it starts.`);
        }

        if ((parseClockTime(endTime) - parseClockTime(startTime)) !== sessionDuration) {
            throw new Error(`AI entry ${index + 1} does not match the preferred duration.`);
        }

        return {
            subject_id: subjectId,
            title,
            day_of_week: dayOfWeek,
            entry_type: "study",
            start_time: startTime,
            end_time: endTime,
        };
    });
}
