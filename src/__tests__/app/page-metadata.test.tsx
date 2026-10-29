/**
 * src/__tests__/app/page-metadata.test.tsx
 *
 * Each legal/support page and the post-payment success page must describe
 * itself (own canonical, og:url, full OG + twitter) instead of inheriting
 * the homepage's; the success page is also noindex.
 */

jest.mock("@/components/legal/LegalShell", () => ({ LegalShell: () => null }));
jest.mock("@/components/legal/ContactLinks", () => ({ ContactLinks: () => null }));
jest.mock("@/components/landing/StoreBadges", () => ({ StoreBadge: () => null }));

import { metadata as privacy } from "@/app/privacy/page";
import { metadata as terms } from "@/app/terms/page";
import { metadata as support } from "@/app/support/page";
import { metadata as deleteAccount } from "@/app/delete-account/page";
import { metadata as success } from "@/app/founding-member/success/page";
import { OG_IMAGE } from "@/lib/seo";

const CASES = [
  ["/privacy", privacy, "Privacy Policy - Crumbify"],
  ["/terms", terms, "Terms of Service - Crumbify"],
  ["/support", support, "Support - Crumbify"],
  ["/delete-account", deleteAccount, "Delete Your Crumbify Account"],
  ["/founding-member/success", success, "Welcome, founding member - Crumbify"],
] as const;

describe.each(CASES)("%s metadata", (path, meta, title) => {
  it("keeps its title", () => {
    expect(meta.title).toBe(title);
  });

  it("has its own absolute canonical and og:url", () => {
    expect(meta.alternates?.canonical).toBe(`https://crumbify.co.uk${path}`);
    expect(meta.openGraph).toMatchObject({ url: `https://crumbify.co.uk${path}`, title });
  });

  it("carries a full OG image and twitter card", () => {
    expect(meta.openGraph?.images).toEqual([OG_IMAGE]);
    expect(meta.twitter).toMatchObject({ card: "summary_large_image", site: "@crumbifyco", title });
  });
});

describe("founding-member/success", () => {
  it("is noindex but followable", () => {
    expect(success.robots).toEqual({ index: false, follow: true });
  });

  it("has the brief description", () => {
    expect(success.description).toBe(
      "You're a Crumbify founding member. Here's how to unlock lifetime Premium in the app.",
    );
  });
});

describe("indexable pages", () => {
  it.each([privacy, terms, support, deleteAccount])("do not set robots", (meta) => {
    expect(meta.robots).toBeUndefined();
  });
});
