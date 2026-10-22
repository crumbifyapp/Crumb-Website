/**
 * #1191: /ref used to be a permanent redirect to / in next.config.ts, which ran before any route and
 * made the invite link's `u` unreachable (no click was ever recorded). The route handler
 * src/app/ref/route.ts now owns /ref, so the redirect rule must stay gone. /invite is unrelated and keeps
 * its redirect.
 */

import nextConfig from "../../../next.config";

describe("next.config redirects", () => {
  it("has no /ref rule (the route handler records the click and redirects)", async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];
    expect(redirects.map((r) => r.source)).not.toContain("/ref");
  });

  it("still redirects /invite to the home page", async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];
    expect(redirects).toContainEqual({ source: "/invite", destination: "/", permanent: true });
  });
});
