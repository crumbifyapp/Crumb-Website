/**
 * src/__tests__/app/robots.test.ts
 *
 * A crawler obeys only its most specific matching group, so every named
 * group must repeat the disallows. Training bots are allowed (owner
 * decision D305). Share pages stay crawlable so bots can see their noindex.
 */

import robots from "@/app/robots";

const NAMED_BOTS = [
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
const DISALLOWS = ["/admin", "/api/", "/ref", "/referral", "/turnstile.html"];

function groups() {
  const rules = robots().rules;
  return Array.isArray(rules) ? rules : [rules];
}

describe("robots()", () => {
  it("has a wildcard group", () => {
    expect(groups().some((g) => g.userAgent === "*")).toBe(true);
  });

  it.each(NAMED_BOTS)("has an explicit allowed group for %s", (bot) => {
    const group = groups().find((g) => g.userAgent === bot);
    expect(group).toBeDefined();
    expect(group?.allow).toBe("/");
  });

  it("repeats the disallows in every group", () => {
    for (const group of groups()) {
      expect(group.allow).toBe("/");
      expect(group.disallow).toEqual(DISALLOWS);
    }
  });

  it("does not block the share pages", () => {
    for (const group of groups()) {
      for (const prefix of ["/place", "/review", "/post", "/u"]) {
        expect(group.disallow).not.toContain(prefix);
      }
    }
  });

  it("points at the sitemap and host", () => {
    const result = robots();
    expect(result.sitemap).toBe("https://crumbify.co.uk/sitemap.xml");
    expect(result.host).toBe("https://crumbify.co.uk");
  });
});
