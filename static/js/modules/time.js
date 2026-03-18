export function getUserTimeZone(profile) {
    return profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function dateKeyForTimeZone(value = new Date(), timeZone = "UTC") {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

export function todayISO(timeZone = "UTC") {
    return dateKeyForTimeZone(new Date(), timeZone);
}

export function formatDateTime(value, timeZone = "UTC") {
    if (!value) {
        return "No date yet";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "No date yet";
    }

    return new Intl.DateTimeFormat(undefined, {
        timeZone,
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

export function dateTimeInputToIso(value) {
    if (!value) {
        return null;
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed.toISOString();
}

export function computeStreak(sessions, timeZone = "UTC") {
    const done = new Set(
        sessions
            .filter((session) => session.status === "completed" && session.completed_at)
            .map((session) => dateKeyForTimeZone(session.completed_at, timeZone))
            .filter(Boolean),
    );

    let cursor = new Date();
    let streak = 0;

    while (done.has(dateKeyForTimeZone(cursor, timeZone))) {
        streak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    return streak;
}
