/**
 * src/__tests__/app/place-id-page.test.tsx
 *
 * Pixel-fix F-53b (owner directive 2026-08-06): /place/[id] landing page id
 * validation, mirroring src/__tests__/app/u-username-page.test.tsx's shape
 * for the profile page. place_id is a Google Places id, not a UUID - see
 * PLACE_ID_PATTERN's own comment for the charset/length rationale (mirrors
 * the app repo's services/deeplinks/parse-place-id.ts exactly).
 * SEO fix pack: a malformed id calls notFound() (a real 404) instead of
 * rendering an inline 200 block, and a valid id is noindex with its own
 * canonical and og:url.
 */

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";
import PlaceSharePage, { generateMetadata } from "@/app/place/[id]/page";

const VALID_ID = "ChIJN1t_tDeuEmsRUsoyG83frY4";

beforeEach(() => {
  (notFound as unknown as jest.Mock).mockClear();
});

describe("PlaceSharePage id validation", () => {
  it("renders the share landing for a valid Google Places id", async () => {
    const element = await PlaceSharePage({ params: Promise.resolve({ id: VALID_ID }) });
    render(element);
    expect(screen.getByRole("heading", { name: "A place on Crumbify" })).toBeInTheDocument();
    expect(notFound).not.toHaveBeenCalled();
  });

  it("accepts an id containing underscores and hyphens", async () => {
    const element = await PlaceSharePage({
      params: Promise.resolve({ id: "place_name-123" }),
    });
    render(element);
    expect(screen.getByRole("heading", { name: "A place on Crumbify" })).toBeInTheDocument();
  });

  it("calls notFound() for an id containing disallowed characters", async () => {
    await expect(
      PlaceSharePage({ params: Promise.resolve({ id: "../../etc/passwd" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("calls notFound() for an id exceeding the 300-char length cap", async () => {
    await expect(
      PlaceSharePage({ params: Promise.resolve({ id: "a".repeat(301) }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("accepts an id exactly at the 300-char length cap", async () => {
    const element = await PlaceSharePage({
      params: Promise.resolve({ id: "a".repeat(300) }),
    });
    render(element);
    expect(screen.getByRole("heading", { name: "A place on Crumbify" })).toBeInTheDocument();
  });
});

describe("generateMetadata id validation", () => {
  it("titles a valid id", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ id: VALID_ID }) });
    expect(metadata.title).toBe("A place on Crumbify");
  });

  it("calls notFound() for a malformed id", async () => {
    await expect(
      generateMetadata({ params: Promise.resolve({ id: "../bad" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("sets a canonical URL and og:url built from the encoded id", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ id: VALID_ID }) });
    const url = `https://crumbify.co.uk/place/${VALID_ID}`;
    expect(metadata.alternates?.canonical).toBe(url);
    expect(metadata.openGraph).toMatchObject({ url });
  });

  it("is noindex but followable", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ id: VALID_ID }) });
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});
