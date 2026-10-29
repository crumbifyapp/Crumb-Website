import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// A crawler obeys only its most specific matching group, so every named
// group repeats the disallows. Search AND training bots are allowed
// (owner decision D305). Share pages stay crawlable on purpose: a bot has
// to fetch them to see their noindex.
const BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
  "Googlebot",
  "Bingbot",
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
];

const DISALLOW = ["/admin", "/api/", "/ref", "/referral", "/turnstile.html"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: ["*", ...BOTS].map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow: DISALLOW,
    })),
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
