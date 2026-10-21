/**
 * Founding member success page copy: founders get lifetime Premium now that
 * the app is live (D172). The old "first-day access" and "when Crumb launches"
 * wording promised a launch that already happened.
 */
import { render } from "@testing-library/react";
import FoundingMemberSuccess from "@/app/founding-member/success/page";

describe("founding member success page copy", () => {
  it("states lifetime Premium with no subscription and no launch-day promise", () => {
    const { container } = render(<FoundingMemberSuccess />);
    const text = container.textContent ?? "";
    expect(text).toContain(
      "You're a founding member. You get lifetime Premium, no subscription needed, ever.",
    );
    expect(text).toContain("Crumbify is live on the App Store.");
    expect(text).not.toContain("first-day access");
    expect(text).not.toContain("When Crumb launches");
    expect(text).not.toContain("moment it's ready");
  });
});
