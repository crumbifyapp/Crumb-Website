/**
 * src/lib/seo.ts
 *
 * Shared SEO metadata. Next shallow-merges metadata, so a page's `openGraph`
 * or `twitter` REPLACES the parent's whole object rather than merging into
 * it. `pageMetadata` therefore always emits the complete objects, and every
 * page that sets its own canonical goes through it. The root metadata lives
 * here (not in layout.tsx) so it can be unit-tested without next/font.
 */

import type { Metadata } from "next";

export const SITE_URL = "https://crumbify.co.uk";

// App Store id of the Crumbify iOS app, used by the Smart App Banner.
export const APP_STORE_ID = "6777163992";

// The real pixel size of public/images/og-image.png.
export const OG_IMAGE = {
  url: "/images/og-image.png",
  width: 2400,
  height: 1260,
  alt: "Crumbify",
};

const ROOT_TITLE = "Crumbify: Restaurant Discovery App for iPhone";
const ROOT_DESCRIPTION =
  "Crumbify is a social food app for iPhone. Discover restaurants through friends you trust, log everywhere you eat, rate it out of ten and save places to try.";

interface PageMetadataInput {
  path: string;
  title: string;
  description: string;
}

export function pageMetadata({ path, title, description }: PageMetadataInput): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      url,
      title,
      description,
      siteName: "Crumbify",
      locale: "en_GB",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      site: "@crumbifyco",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

export const rootMetadata: Metadata = {
  ...pageMetadata({ path: "/", title: ROOT_TITLE, description: ROOT_DESCRIPTION }),
  metadataBase: new URL(SITE_URL),
  keywords: [
    "crumbify",
    "food app",
    "restaurant recommendations",
    "food social app",
    "friends food app",
    "food discovery",
    "restaurant ratings",
    "food map",
  ],
  // Renders <meta name="apple-itunes-app" content="app-id=6777163992">.
  itunes: { appId: APP_STORE_ID },
};
