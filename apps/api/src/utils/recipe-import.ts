import * as cheerio from "cheerio";
import { lookup } from "node:dns/promises";
import ipaddr from "ipaddr.js";

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

export async function validateRecipeUrl(value: string): Promise<URL> {
  const url = new URL(value);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are allowed");
  }

  if (url.username || url.password) {
    throw new Error("URLs containing credentials are not allowed");
  }

  const hostname = url.hostname.toLowerCase();

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("Local addresses are not allowed");
  }

  let addresses;

  try {
    addresses = await lookup(hostname, {
      all: true,
      verbatim: true,
    });
  } catch {
    throw new Error("Could not resolve recipe website");
  }

  if (addresses.length === 0) {
    throw new Error("Could not resolve recipe website");
  }

  for (const { address } of addresses) {
    let parsedAddress = ipaddr.parse(address);

    if (
      parsedAddress instanceof ipaddr.IPv6 &&
      parsedAddress.isIPv4MappedAddress()
    ) {
      parsedAddress = parsedAddress.toIPv4Address();
    }

    if (parsedAddress.range() !== "unicast") {
      throw new Error("Private or reserved network addresses are not allowed");
    }
  }

  return url;
}
