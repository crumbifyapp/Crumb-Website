import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Fixed dates (the last git commit touching each route's content), not
// new Date(), so the sitemap does not churn on every build. Bump a date
// when that page's content changes.
const LAST_MODIFIED = {
  home: new Date("2026-10-22"),
  support: new Date("2026-10-16"),
  privacy: new Date("2026-10-22"),
  terms: new Date("2026-10-22"),
  deleteAccount: new Date("2026-10-16"),
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: LAST_MODIFIED.home },
    { url: `${SITE_URL}/support`, lastModified: LAST_MODIFIED.support },
    { url: `${SITE_URL}/privacy`, lastModified: LAST_MODIFIED.privacy },
    { url: `${SITE_URL}/terms`, lastModified: LAST_MODIFIED.terms },
    { url: `${SITE_URL}/delete-account`, lastModified: LAST_MODIFIED.deleteAccount },
  ];
}
