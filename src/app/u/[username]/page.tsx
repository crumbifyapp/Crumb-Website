/**
 * src/app/u/[username]/page.tsx
 *
 * Pixel-fix F-53 (app repo, docs/v0.9.3/PIXEL-PASS-FINDINGS.md:1414-1442):
 * marketing-site landing target for the profile-share universal link
 * `https://crumbify.co.uk/u/<username>` (built by the app's
 * utils/profile-share-link.ts, shared from app/profile/[id].tsx's "Share
 * profile" button / dots-sheet Share entry). This page is what a recipient
 * WITHOUT the app installed sees - the app-side route
 * (app/u/[username].tsx in the app repo) handles the installed case via the
 * iOS `applinks:crumbify.co.uk` associated domain and the Android
 * `pathPrefix: "/u/"` intent filter (trailing slash - scoped to exactly this
 * path segment, not a bare-prefix match that would also hijack /updates,
 * /user, /unsubscribe etc - fix-round r1, F53-R3).
 *
 * Server component: validates the username shape (defensive - a malformed
 * or pathological URL segment gets a plain landing rather than being fed
 * straight into a client-side deep-link attempt) and renders the client
 * island that does the actual app-open attempt + fallback.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileShareLanding } from "@/components/profile-share/ProfileShareLanding";
import { APP_STORE_ID, pageMetadata, SITE_URL } from "@/lib/seo";

// Mirrors the app repo's real username SHAPES so this page does not reject
// a link that the app itself would happily resolve (fix-round r1, F53-R4):
//   1. Claimed usernames (supabase/migrations/125_claim_username.sql,
//      017_username_search.sql): length 3-30, lowercase letters/digits/
//      underscore only.
//   2. The `handle_new_user` trigger's DEFAULT username for a profile that
//      never completed username claim (supabase/migrations/
//      014_fix_profile_trigger.sql:35, 158_contact_hash_columns.sql:208):
//      `'user-' || REPLACE(id::text, '-', '')` - 5 + 32 lowercase-hex chars,
//      always containing a hyphen, so it fails BOTH the length and charset
//      halves of the claimed-username shape above. A profile-share link
//      built from a real (if unclaimed) profile's default handle must not
//      render "Profile not found" here when the app-side resolver (which
//      has no such filter - see app repo's resolve-username.ts /
//      resolve_referral_code RPC) would resolve it fine.
// When in doubt this pattern accepts broadly and lets resolution 404
// downstream (this page never queries Supabase directly - only the
// installed app resolves usernames - so a broader accept here has no
// enumeration/security cost, just a marginally later "not found").
const USERNAME_PATTERN = /^([a-z0-9_]{3,30}|user-[0-9a-f]{32})$/;

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  if (!USERNAME_PATTERN.test(username)) notFound();
  // noindex: every profile shows the same generic copy, so these are share
  // links only. follow stays true and robots.txt allows the crawl, so bots
  // can see the noindex.
  return {
    ...pageMetadata({
      path: `/u/${encodeURIComponent(username)}`,
      title: `@${username} on Crumbify`,
      description: "Every bite tells a story. See this profile on Crumbify.",
    }),
    robots: { index: false, follow: true },
    // Smart App Banner opens the shared profile in the app, not the app home.
    itunes: {
      appId: APP_STORE_ID,
      appArgument: `${SITE_URL}/u/${encodeURIComponent(username)}`,
    },
  };
}

export default async function ProfileSharePage({ params }: PageProps) {
  const { username } = await params;

  if (!USERNAME_PATTERN.test(username)) notFound();

  return <ProfileShareLanding username={username} />;
}
