/**
 * src/__tests__/app/u-username-page.test.tsx
 *
 * Pixel-fix F-53 fix-round r1, F53-R4: the /u/[username] page's
 * USERNAME_PATTERN must accept both real username shapes the app can
 * resolve - a claimed handle (3-30 lowercase letters/digits/underscore) AND
 * the `handle_new_user` trigger's default `user-<32hex>` handle for a
 * profile that never completed username claim (supabase/migrations/
 * 014_fix_profile_trigger.sql:35) - and reject a malformed/pathological
 * segment. Without this widening, a share link built from an unclaimed
 * profile's default username 404s on the website even though the app-side
 * resolver (services/supabase/resolve-username.ts, app repo) resolves it
 * fine - this test fails on the narrower `/^[a-z0-9_]{3,30}$/`-only pattern.
 * SEO fix pack: a rejected username calls notFound() (a real 404) instead of
 * rendering an inline 200 block, and a valid one is noindex with its own
 * canonical and og:url.
 */

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";
import ProfileSharePage, { generateMetadata } from "@/app/u/[username]/page";

const TRIGGER_DEFAULT_USERNAME = `user-${"a1b2c3d4e5f6".repeat(3).slice(0, 32)}`;

beforeEach(() => {
  (notFound as unknown as jest.Mock).mockClear();
});

describe("ProfileSharePage username validation (F53-R4)", () => {
  it("renders the profile-share landing for a claimed-username shape", async () => {
    const element = await ProfileSharePage({
      params: Promise.resolve({ username: "alibars" }),
    });
    render(element);
    expect(screen.getByRole("heading", { name: "@alibars" })).toBeInTheDocument();
    expect(notFound).not.toHaveBeenCalled();
  });

  it("renders the profile-share landing for the trigger-generated default username shape (user-<32hex>) - NOT a 404", async () => {
    const element = await ProfileSharePage({
      params: Promise.resolve({ username: TRIGGER_DEFAULT_USERNAME }),
    });
    render(element);
    expect(
      screen.getByRole("heading", { name: `@${TRIGGER_DEFAULT_USERNAME}` }),
    ).toBeInTheDocument();
    expect(notFound).not.toHaveBeenCalled();
  });

  it("calls notFound() for a malformed/pathological username (too short)", async () => {
    await expect(ProfileSharePage({ params: Promise.resolve({ username: "a" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("calls notFound() for a username containing disallowed characters", async () => {
    await expect(
      ProfileSharePage({ params: Promise.resolve({ username: "../../etc" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("does NOT accept a 'user-' prefixed value that is not exactly 32 lowercase-hex characters (still rejects genuinely malformed input)", async () => {
    await expect(
      ProfileSharePage({ params: Promise.resolve({ username: "user-tooshort" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalledTimes(1);
  });
});

describe("generateMetadata username validation (F53-R4)", () => {
  it("titles a claimed-shape username with an @handle", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ username: "alibars" }),
    });
    expect(metadata.title).toBe("@alibars on Crumbify");
  });

  it("titles a trigger-default-shape username with an @handle too", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ username: TRIGGER_DEFAULT_USERNAME }),
    });
    expect(metadata.title).toBe(`@${TRIGGER_DEFAULT_USERNAME} on Crumbify`);
  });

  it("calls notFound() for a malformed username", async () => {
    await expect(generateMetadata({ params: Promise.resolve({ username: "a" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("sets a canonical URL and og:url built from the encoded username", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ username: "alibars" }),
    });
    const url = "https://crumbify.co.uk/u/alibars";
    expect(metadata.alternates?.canonical).toBe(url);
    expect(metadata.openGraph).toMatchObject({ url });
  });

  it("sets the smart app banner app-argument to the canonical profile URL", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ username: "alibars" }),
    });
    expect(metadata.itunes).toEqual({
      appId: "6777163992",
      appArgument: "https://crumbify.co.uk/u/alibars",
    });
  });

  it("is noindex but followable", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ username: "alibars" }),
    });
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});
