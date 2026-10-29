/**
 * src/__tests__/lib/seo.test.ts
 *
 * Guards the shared SEO helper. Next shallow-merges metadata, so a child
 * page's openGraph/twitter REPLACES the root's whole object: pageMetadata
 * must always emit the complete objects, and rootMetadata must carry the
 * exact brief strings, the real 2400x1260 OG image size and the Smart App
 * Banner id.
 */

import { OG_IMAGE, SITE_URL, pageMetadata, rootMetadata } from "@/lib/seo";

const TITLE = "Crumbify: Restaurant Discovery App for iPhone";
const DESCRIPTION =
  "Crumbify is a social food app for iPhone. Discover restaurants through friends you trust, log everywhere you eat, rate it out of ten and save places to try.";

describe("OG_IMAGE", () => {
  it("declares the real pixel size of public/images/og-image.png", () => {
    expect(OG_IMAGE).toEqual({
      url: "/images/og-image.png",
      width: 2400,
      height: 1260,
      alt: "Crumbify",
    });
  });
});

describe("pageMetadata", () => {
  const meta = pageMetadata({
    path: "/privacy",
    title: "Privacy Policy - Crumbify",
    description: "How Crumbify handles your data.",
  });

  it("emits an absolute canonical for the page's own path", () => {
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/privacy`);
  });

  it("emits a complete openGraph object with the page's own url", () => {
    expect(meta.openGraph).toMatchObject({
      url: `${SITE_URL}/privacy`,
      title: "Privacy Policy - Crumbify",
      description: "How Crumbify handles your data.",
      siteName: "Crumbify",
      locale: "en_GB",
      type: "website",
    });
    expect(meta.openGraph?.images).toEqual([OG_IMAGE]);
  });

  it("emits a complete twitter object", () => {
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      site: "@crumbifyco",
      title: "Privacy Policy - Crumbify",
      description: "How Crumbify handles your data.",
    });
    expect(meta.twitter?.images).toEqual([OG_IMAGE]);
  });

  it("sets the title and description at the top level", () => {
    expect(meta.title).toBe("Privacy Policy - Crumbify");
    expect(meta.description).toBe("How Crumbify handles your data.");
  });
});

describe("rootMetadata", () => {
  it("uses the exact brief title and description", () => {
    expect(rootMetadata.title).toBe(TITLE);
    expect(rootMetadata.description).toBe(DESCRIPTION);
    expect(rootMetadata.openGraph?.title).toBe(TITLE);
    expect(rootMetadata.openGraph?.description).toBe(DESCRIPTION);
    expect(rootMetadata.twitter?.title).toBe(TITLE);
    expect(rootMetadata.twitter?.description).toBe(DESCRIPTION);
  });

  it("keeps metadataBase and the root canonical", () => {
    expect(String(rootMetadata.metadataBase)).toBe(`${SITE_URL}/`);
    expect(rootMetadata.alternates?.canonical).toBe(`${SITE_URL}/`);
    expect(rootMetadata.keywords).toContain("crumbify");
  });

  it("declares the Smart App Banner via itunes.appId", () => {
    expect(rootMetadata.itunes).toEqual({ appId: "6777163992" });
  });

  it("declares the real OG image size in openGraph and twitter", () => {
    expect(rootMetadata.openGraph?.images).toEqual([OG_IMAGE]);
    expect(rootMetadata.twitter?.images).toEqual([OG_IMAGE]);
  });

  it("no longer carries the deprecated themeColor", () => {
    expect(rootMetadata).not.toHaveProperty("themeColor");
  });
});
