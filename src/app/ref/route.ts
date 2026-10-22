import { NextResponse } from "next/server";
import { detectPlatform, recordReferralClick } from "@/lib/referral-click";
import { normaliseInviteUsername } from "@/lib/referral-code";

export const dynamic = "force-dynamic";

/**
 * `GET /ref?u=<username>`: the invite link the app shares (utils/referral-link.ts in the app repo).
 *
 * It used to be a permanent redirect to `/` in next.config.ts, which dropped the `u` and recorded
 * nothing, so the app could never learn who invited a new user (#1191). Now it records one
 * referral_clicks row (code = the normalised username, ip_hash, platform) through the same logic as
 * `/referral?code=` and then lands where `/ref` always landed: the home page. An installed app
 * opens this URL itself as a universal link (public/.well-known/apple-app-site-association, `/ref*`)
 * and reads `u` from the link, so the website only ever sees visitors without the app.
 *
 * Invalid or missing input never errors to the visitor: no row is written and they land on `/`.
 */
export async function GET(request: Request) {
  const username = normaliseInviteUsername(new URL(request.url).searchParams.get("u"));

  if (username) {
    await recordReferralClick(request, username, detectPlatform(request.headers.get("user-agent")));
  }

  return NextResponse.redirect(new URL("/", request.url), 302);
}
