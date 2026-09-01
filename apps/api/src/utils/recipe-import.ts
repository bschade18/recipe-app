import * as cheerio from "cheerio";

// Decode HTML entities, replace non-breaking spaces, collapse repeated
// whitespace, and trim the final string.
export function cleanText(value: string) {
  return cheerio
    .load(`<div>${value}</div>`)("div")
    .text()
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseDurationMinutes(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const match = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/);

  if (!match) {
    return undefined;
  }

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);

  return hours * 60 + minutes;
}

export function parseServings(value: unknown): number | undefined {
  if (typeof value === "number") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const parsed = parseServings(item);

      if (parsed !== undefined) {
        return parsed;
      }
    }

    return undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const match = value.match(/\d+/);

  if (!match) {
    return undefined;
  }

  return Number(match[0]);
}
