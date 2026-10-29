/**
 * src/__tests__/app/post-id-page.test.tsx
 *
 * Pixel-fix F-53b (owner directive 2026-08-06): /post/[id] landing page id
 * validation, mirroring src/__tests__/app/u-username-page.test.tsx's shape
 * for the profile page. SEO fix pack: a malformed id calls notFound() (a real
 * 404) instead of rendering an inline 200 block, and a valid id is noindex
 * with its own canonical and og:url.
 */

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";
import PostSharePage, { generateMetadata } from "@/app/post/[id]/page";

const VALID_ID = "255378a1-cefa-472b-9508-b6c74dad852c";

beforeEach(() => {
  (notFound as unknown as jest.Mock).mockClear();
});

describe("PostSharePage id validation", () => {
  it("renders the share landing for a valid UUID id", async () => {
    const element = await PostSharePage({ params: Promise.resolve({ id: VALID_ID }) });
    render(element);
    expect(screen.getByRole("heading", { name: "A post on Crumbify" })).toBeInTheDocument();
    expect(notFound).not.toHaveBeenCalled();
  });

  it("calls notFound() for a malformed id (not UUID-shaped)", async () => {
    await expect(
      PostSharePage({ params: Promise.resolve({ id: "not-a-uuid" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalledTimes(1);
  });
});

describe("generateMetadata id validation", () => {
  it("titles a valid UUID id", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ id: VALID_ID }) });
    expect(metadata.title).toBe("A post on Crumbify");
  });

  it("calls notFound() for a malformed id", async () => {
    await expect(generateMetadata({ params: Promise.resolve({ id: "bad" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("sets a canonical URL and og:url built from the encoded id", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ id: VALID_ID }) });
    const url = `https://crumbify.co.uk/post/${VALID_ID}`;
    expect(metadata.alternates?.canonical).toBe(url);
    expect(metadata.openGraph).toMatchObject({ url });
  });

  it("is noindex but followable", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ id: VALID_ID }) });
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});
