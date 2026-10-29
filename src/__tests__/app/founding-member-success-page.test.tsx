/**
 * Founding member success page copy: founders get lifetime Premium now that
 * the app is live (D172). The old "first-day access" and "when Crumb launches"
 * wording promised a launch that already happened. Lifetime wording matches the
 * Terms ("for as long as Crumbify runs"), not "ever". The next step tells the
 * buyer to sign up with the same email they paid with, because founding status
 * is keyed to that email.
 */
import { render, screen } from "@testing-library/react";
import FoundingMemberSuccess from "@/app/founding-member/success/page";

const APP_STORE_URL = "https://apps.apple.com/gb/app/crumbify/id6777163992";

describe("founding member success page copy", () => {
  it("states lifetime Premium with no subscription and no launch-day promise", () => {
    const { container } = render(<FoundingMemberSuccess />);
    const text = container.textContent ?? "";
    expect(text).toContain(
      "You're a founding member. You get lifetime Premium for as long as Crumbify runs, with no subscription.",
    );
    expect(text).not.toContain("no subscription needed, ever");
    expect(text).toContain("Crumbify is out now on iPhone.");
    expect(text).not.toContain("first-day access");
    expect(text).not.toContain("When Crumb launches");
    expect(text).not.toContain("moment it's ready");
  });

  it("tells the buyer to sign up with the same email they paid with", () => {
    const { container } = render(<FoundingMemberSuccess />);
    const text = container.textContent ?? "";
    expect(text).toContain(
      "Next step: download Crumbify from the App Store and sign up with the same email address you paid with.",
    );
    expect(text).toContain(
      "Signing up with a different email will not unlock it. If you used Apple's Hide My Email, you can restore it in Settings by verifying the email you paid with.",
    );
  });

  it("links the App Store button to the Crumbify App Store listing", () => {
    render(<FoundingMemberSuccess />);
    const link = screen.getByRole("link", { name: "Download on the App Store" });
    expect(link).toHaveAttribute("href", APP_STORE_URL);
    expect(link).toHaveTextContent("App Store");
  });
});
