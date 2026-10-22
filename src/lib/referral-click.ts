import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { redactForLog } from "@/lib/redact-log";

/**
 * Shared referral click logging, used by BOTH public referral routes:
 *   - src/app/referral/route.ts  (`/referral?code=X`, influencer tracking links)
 *   - src/app/ref/route.ts       (`/ref?u=<username>`, the in-app invite link, #1191)
 * Keep this the single place that writes `referral_clicks` so the two never drift: the app
 * backend (supabase/functions/likely-inviter in the app repo) matches a new user's IP against the
 * `ip_hash` column written here, so the hash MUST stay sha256("<salt>:<ip>") with the same salt
 * (env REFERRAL_IP_SALT, falling back to the service-role key when unset).
 */

export type Platform = "ios" | "android" | "other";

/** Postgres unique_violation: this visitor already clicked this code. */
const UNIQUE_VIOLATION = "23505";

export function detectPlatform(userAgent: string | null): Platform {
  if (!userAgent) return "other";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "other";
}

// Never store or log the raw client IP: only a salted hash. This repo is
// public and the DB tracks UGC referral traffic, so the IP itself must not
// be persisted anywhere. The table has ONE row per (code, ip_hash) visitor,
// enforced by a PARTIAL unique index (WHERE ip_hash IS NOT NULL), which a
// plain ON CONFLICT write cannot target (Postgres 42P10), so the write is a
// plain insert and a repeat click refreshes the existing row's created_at.
function resolveClientIp(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/**
 * Records one referral click for `code` (already validated and normalised by the caller).
 * Never throws and never blocks a redirect: a missing config, an unknown address or a Supabase
 * failure is logged (redacted) or skipped silently.
 */
export async function recordReferralClick(
  request: Request,
  code: string,
  platform: Platform
): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const salt = process.env.REFERRAL_IP_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const clientIp = resolveClientIp(request.headers);

  if (!(url && key && salt && clientIp)) return;

  try {
    const ipHash = hashIp(clientIp, salt);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient<any>(url, key);
    const { error } = await supabase.from("referral_clicks").insert({
      code,
      platform,
      ip_hash: ipHash,
    });
    if (!error) return;
    if (error.code !== UNIQUE_VIOLATION) {
      console.error("referral_clicks insert failed:", redactForLog(error));
      return;
    }
    // Repeat click from the same visitor: move the existing row's time forward so the
    // app's 24 h inviter window counts from the latest click.
    const { error: refreshError } = await supabase
      .from("referral_clicks")
      .update({ created_at: new Date().toISOString(), platform })
      .eq("code", code)
      .eq("ip_hash", ipHash);
    if (refreshError) {
      console.error("referral_clicks refresh failed:", redactForLog(refreshError));
    }
  } catch (err) {
    console.error("referral_clicks insert threw:", redactForLog(err));
  }
}
