/**
 * src/__tests__/app/layout-viewport.test.ts
 *
 * themeColor moved out of metadata (deprecated there) into the viewport
 * export; layout.tsx must re-export rootMetadata as its metadata.
 */

jest.mock("next/font/google", () => ({
  Bricolage_Grotesque: () => ({ variable: "--font-disp" }),
  Hanken_Grotesk: () => ({ variable: "--font-body" }),
}));
jest.mock("@vercel/speed-insights/next", () => ({ SpeedInsights: () => null }));

import { metadata, viewport } from "@/app/layout";
import { rootMetadata } from "@/lib/seo";

describe("root layout exports", () => {
  it("exports the cream theme colour as viewport.themeColor", () => {
    expect(viewport.themeColor).toBe("#F4ECE1");
  });

  it("exports rootMetadata as metadata", () => {
    expect(metadata).toBe(rootMetadata);
  });
});
