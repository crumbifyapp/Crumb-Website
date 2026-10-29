/**
 * Pure schema.org JSON-LD builders for the marketing site.
 * Facts are verified against the live App Store listing and /support; see
 * docs/notes/2026-10-29-seo-fix-pack-implementation-notes.md.
 */

import { SUPPORT_EMAIL } from "@/components/seo/site-contact";
import type { AppStoreRating } from "./app-store-rating";

const SITE_URL = "https://crumbify.co.uk/";
const ORG_ID = "https://crumbify.co.uk/#organization";
const WEBSITE_ID = "https://crumbify.co.uk/#website";
const APP_STORE_URL = "https://apps.apple.com/gb/app/crumbify/id6777163992";
const SITE_DESCRIPTION =
  "Crumbify is a social food app for iPhone. Discover restaurants through friends you trust, log everywhere you eat, rate it out of ten and save places to try.";

export interface FaqEntry {
  readonly question: string;
  readonly answer: string;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Crumbify",
    legalName: "Crumbify LTD",
    url: SITE_URL,
    logo: `${SITE_URL}images/crumbify-logo.png`,
    // The only real social profile. Add others only once they exist.
    sameAs: ["https://x.com/crumbifyco"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SUPPORT_EMAIL,
    },
  };
}

// No SearchAction: the site has no search.
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: "Crumbify",
    url: SITE_URL,
    inLanguage: "en-GB",
    publisher: { "@id": ORG_ID },
  };
}

export function mobileApplicationJsonLd(rating: AppStoreRating | null) {
  return {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: "Crumbify",
    operatingSystem: "iOS",
    // Google's supported app types have no Food & Drink; Social Networking is
    // the App Store's real secondary genre.
    applicationCategory: "SocialNetworkingApplication",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    installUrl: APP_STORE_URL,
    image: `${SITE_URL}images/app-icon.png`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
    publisher: { "@id": ORG_ID },
    ...(rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.ratingValue,
            ratingCount: rating.ratingCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

export function faqPageJsonLd(faqs: readonly FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
