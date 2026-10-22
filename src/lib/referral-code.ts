/**
 * Shared referral code validation, used by both the public redirect route
 * (src/app/referral/route.ts) and the admin code-registry functions
 * (src/lib/admin/referrals.ts). Keep this the single source of truth for the
 * pattern so the two never drift.
 */
export const REFERRAL_CODE_PATTERN = /^[A-Za-z0-9_-]{2,64}$/;

export function isValidReferralCode(code: string): boolean {
  return REFERRAL_CODE_PATTERN.test(code);
}

/** Normalise a code to a single consistent case for storage/lookup. */
export function normaliseReferralCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Crumbify usernames are 6 to 30 lowercase letters, digits and underscores (server CHECK
 * profiles_username_format_check). The invite link carries one as `?u=`; anything that cannot be a
 * username is dropped so junk never reaches the click log. A lenient lower bound (2) keeps this
 * file independent of the app's current minimum; the server only matches real usernames anyway.
 */
export const INVITE_USERNAME_PATTERN = /^[a-z0-9_]{2,30}$/;

/** Trim and lower-case an invite `u` value; null when it cannot be a username. */
export function normaliseInviteUsername(raw: string | null): string | null {
  if (raw === null) return null;
  const value = raw.trim().toLowerCase();
  return INVITE_USERNAME_PATTERN.test(value) ? value : null;
}
