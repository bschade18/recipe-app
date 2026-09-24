import * as cheerio from "cheerio";
import { lookup } from "node:dns/promises";
import ipaddr from "ipaddr.js";

export class RecipeUrlValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecipeUrlValidationError";
  }
}

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
    throw new RecipeUrlValidationError("Only HTTP and HTTPS URLs are allowed");
  }

  if (url.username || url.password) {
    throw new RecipeUrlValidationError("Only HTTP and HTTPS URLs are allowed");
  }

  const hostname = url.hostname.toLowerCase();

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new RecipeUrlValidationError("Local addresses are not allowed");
  }

  let addresses;

  try {
    addresses = await lookup(hostname, {
      all: true,
      verbatim: true,
    });
  } catch {
    throw new RecipeUrlValidationError("Could not resolve recipe website");
  }

  if (addresses.length === 0) {
    throw new RecipeUrlValidationError("Could not resolve recipe website");
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
      throw new RecipeUrlValidationError(
        "Private or reserved network addresses are not allowed",
      );
    }
  }

  return url;
}

export async function fetchRecipePage(
  initialUrl: URL,
  maxRedirects = 5,
): Promise<Response> {
  let currentUrl = initialUrl;

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
    const response = await fetch(currentUrl, {
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RecipeApp/1.0)",
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");

      if (!location) {
        throw new Error("Recipe website returned an invalid redirect");
      }

      if (redirectCount === maxRedirects) {
        throw new Error("Too many redirects");
      }

      // Handles both absolute redirects and relative ones like "/new-page".
      const nextUrl = new URL(location, currentUrl);

      // Re-run SSRF validation for every redirect destination.
      currentUrl = await validateRecipeUrl(nextUrl.toString());

      continue;
    }

    return response;
  }

  throw new Error("Too many redirects");
}
