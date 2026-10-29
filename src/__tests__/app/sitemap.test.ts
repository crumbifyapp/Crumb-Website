/**
 * src/__tests__/app/sitemap.test.ts
 *
 * The sitemap lists the 5 indexable routes as absolute URLs with fixed
 * lastModified dates (not new Date(), so output does not churn per build).
 */

import sitemap from "@/app/sitemap";

describe("sitemap()", () => {
  const entries = sitemap();

  it("lists exactly the 5 indexable routes as absolute URLs", () => {
    expect(entries.map((e) => e.url)).toEqual([
      "https://crumbify.co.uk/",
      "https://crumbify.co.uk/support",
      "https://crumbify.co.uk/privacy",
      "https://crumbify.co.uk/terms",
      "https://crumbify.co.uk/delete-account",
    ]);
  });

  it("gives every entry a Date lastModified", () => {
    for (const entry of entries) {
      expect(entry.lastModified).toBeInstanceOf(Date);
    }
  });

  it("is deterministic across calls", () => {
    expect(sitemap()).toEqual(entries);
  });
});
