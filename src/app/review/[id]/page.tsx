/**
 * src/app/review/[id]/page.tsx
 *
 * Pixel-fix F-53b (app repo, owner directive 2026-08-06, EXECUTION.md
 * wave-3 item 7b): marketing-site landing target for the review-share
 * universal link `https://crumbify.co.uk/review/<id>` (built by the app's
 * utils/post-share-link.ts's buildPostShareLink for a text-only post, shared
 * from app/review/[id].tsx's own Share action). This page is what a
 * recipient WITHOUT the app installed sees - the app-side route
 * (app/review/[id].tsx in the app repo) handles the installed case via the
 * iOS `applinks:crumbify.co.uk` associated domain and the Android
 * `pathPrefix: "/review/"` intent filter (trailing slash - scoped exactly to
 * this path segment, mirroring /u/[username]/page.tsx's F53-R3 pattern).
 *
 * Server component: validates the id shape (a post UUID - the app repo's
 * services/social/post-detail.ts's UUID_RE) and renders the shared
 * AppShareLanding client island, mirroring /u/[username]/page.tsx's shape
 * exactly (validate -> render client island; this page never queries
 * Supabase directly, same "installed app is the only real resolver" pattern
 * as the profile page).
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShareLanding } from "@/components/share-landing/AppShareLanding";
import { APP_STORE_ID, pageMetadata, SITE_URL } from "@/lib/seo";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();
  // noindex: every id shows the same generic copy, so these are share links
  // only. follow stays true and robots.txt allows the crawl, so bots can see
  // the noindex.
  return {
    ...pageMetadata({
      path: `/review/${encodeURIComponent(id)}`,
      title: "A review on Crumbify",
      description: "Every bite tells a story. See this review on Crumbify.",
    }),
    robots: { index: false, follow: true },
    // Smart App Banner opens the shared item in the app, not the app home.
    itunes: {
      appId: APP_STORE_ID,
      appArgument: `${SITE_URL}/review/${encodeURIComponent(id)}`,
    },
  };
}

export default async function ReviewSharePage({ params }: PageProps) {
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) notFound();

  return (
    <AppShareLanding
      pathSegment="review"
      id={id}
      kicker="Crumbify review"
      heading="A review on Crumbify"
      description="Get the Crumbify app to see this review and explore what your friends are eating."
    />
  );
}
