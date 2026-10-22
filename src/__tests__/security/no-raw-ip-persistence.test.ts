/**
 * Static-analysis guard: the referral route must never persist or log a raw
 * client IP address. Raw IPs are personal data under UK GDPR, this repo is
 * PUBLIC on GitHub, and the referral_clicks table is queried through an
 * admin dashboard - so the only value written to Supabase (or to any
 * console.* call) is a salted hash (`ip_hash`), never `ip` / `user_agent`.
 *
 * Reads the actual route source (filesystem only, no network/git) so it
 * stays correct across reasonable refactors instead of pinning exact
 * whitespace or a specific implementation.
 */

import { readFileSync } from "fs";
import path from "path";

// #1191: the click write moved out of the /referral route into the shared helper that BOTH
// public referral routes (/referral?code= and /ref?u=) call, so this guard reads the helper and
// then proves each route reaches the database only through it.
const ROUTE_PATH = path.resolve(__dirname, "..", "..", "lib", "referral-click.ts");
const ROUTES = ["referral", "ref"].map((dir) =>
  path.resolve(__dirname, "..", "..", "app", dir, "route.ts")
);

function extractBalancedCall(source: string, calleeSuffix: string): string {
  const callIndex = source.indexOf(calleeSuffix);
  if (callIndex === -1) {
    throw new Error(
      `Could not find a "${calleeSuffix}" call in ${ROUTE_PATH}. The Supabase ` +
        "persistence call for referral_clicks appears to have moved or been " +
        "renamed - update this guard to match the new call so raw-IP " +
        "persistence stays covered."
    );
  }
  const openParenIndex = callIndex + calleeSuffix.length - 1;
  let depth = 0;
  for (let i = openParenIndex; i < source.length; i++) {
    if (source[i] === "(") depth++;
    if (source[i] === ")") {
      depth--;
      if (depth === 0) {
        return source.slice(callIndex, i + 1);
      }
    }
  }
  throw new Error(`Unbalanced parentheses scanning "${calleeSuffix}" in ${ROUTE_PATH}`);
}

describe("security: the referral routes never persist a raw client IP", () => {
  it.each(ROUTES)("%s reaches referral_clicks only through recordReferralClick", (routePath) => {
    // Comments may explain the flow, so only code counts.
    const routeSource = readFileSync(routePath, "utf-8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
    expect(routeSource).toMatch(/recordReferralClick\(\s*request,/);
    expect(routeSource).not.toMatch(/referral_clicks/);
    expect(routeSource).not.toMatch(/x-forwarded-for|x-real-ip/i);
    expect(routeSource).not.toMatch(/console\./);
  });

  const source = readFileSync(ROUTE_PATH, "utf-8");

  it("writes ip_hash (never a bare ip: or user_agent: key) to referral_clicks", () => {
    const persistCall = extractBalancedCall(source, ".from(\"referral_clicks\").upsert(");

    expect(persistCall).toMatch(/\bip_hash\s*:/);

    // A bare `ip:` key (not part of `ip_hash:`) would mean a raw IP is being
    // written to the row - fail loudly if one appears in the payload.
    expect(persistCall).not.toMatch(/\bip\s*:/);

    // The pre-hardening implementation logged the full UA string alongside
    // the click; that combination is enough to re-identify a visitor when
    // paired with timing, so it must not come back either.
    expect(persistCall).not.toMatch(/\buser_agent\s*:/);
  });

  it("never passes the resolved client IP variable to console.*", () => {
    // Find whatever variable the raw IP is resolved into (e.g.
    // `const clientIp = resolveClientIp(...)`), then confirm no console.*
    // call anywhere in the file references that variable.
    const ipVarMatch = source.match(/\bconst\s+(\w*[Ii]p\w*)\s*=\s*resolveClientIp\(/);
    expect(ipVarMatch).not.toBeNull();
    const ipVar = ipVarMatch ? ipVarMatch[1] : "clientIp";

    const consoleCalls = source.match(/console\.\w+\([^;]*\)/g) ?? [];
    const leakyCalls = consoleCalls.filter((call) => new RegExp(`\\b${ipVar}\\b`).test(call));

    if (leakyCalls.length > 0) {
      throw new Error(
        `Found console.* call(s) that pass the raw client IP variable "${ipVar}" ` +
          `in ${ROUTE_PATH}:\n${leakyCalls.join("\n")}\n\n` +
          "Raw IPs are personal data under UK GDPR and this repo is public - " +
          "log/persist only the salted ip_hash, never the raw IP."
      );
    }
  });

  it("derives ip_hash from a hash function, not a plain assignment of the IP", () => {
    // Confirms the value written as ip_hash actually goes through hashing
    // (e.g. `hashIp(clientIp, salt)`) rather than being the raw IP renamed.
    const persistCall = extractBalancedCall(source, ".from(\"referral_clicks\").upsert(");
    expect(persistCall).toMatch(/ip_hash\s*:\s*\w*[Hh]ash\w*/);
  });
});
