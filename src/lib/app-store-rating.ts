/**
 * Live App Store rating for the MobileApplication JSON-LD.
 * Real numbers only: any failure returns null so the aggregateRating key is
 * omitted. Never hardcode a fallback rating.
 */

import { redactForLog } from "./redact-log";

const LOOKUP_URL = "https://itunes.apple.com/lookup?id=6777163992&country=gb";
const REVALIDATE_SECONDS = 86400;
const TIMEOUT_MS = 5000;

export interface AppStoreRating {
  readonly ratingValue: number;
  readonly ratingCount: number;
}

function parseRating(body: unknown): AppStoreRating | null {
  const results = (body as { results?: unknown } | null)?.results;
  if (!Array.isArray(results)) return null;
  const first = results[0] as
    | { averageUserRating?: unknown; userRatingCount?: unknown }
    | undefined;
  const average = first?.averageUserRating;
  const count = first?.userRatingCount;
  if (typeof average !== "number" || !Number.isFinite(average) || average < 1 || average > 5) {
    return null;
  }
  if (typeof count !== "number" || !Number.isInteger(count) || count <= 0) return null;
  return { ratingValue: Math.round(average * 10) / 10, ratingCount: count };
}

export async function getAppStoreRating(): Promise<AppStoreRating | null> {
  try {
    const res = await fetch(LOOKUP_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.warn(`[app-store-rating] iTunes lookup returned HTTP ${res.status}`);
      return null;
    }
    const rating = parseRating(await res.json());
    if (!rating) {
      console.warn("[app-store-rating] iTunes lookup had no usable rating; omitting aggregateRating");
    }
    return rating;
  } catch (error) {
    console.warn(
      "[app-store-rating] iTunes lookup failed; omitting aggregateRating",
      redactForLog(error),
    );
    return null;
  }
}
