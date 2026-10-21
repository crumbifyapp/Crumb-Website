/**
 * Terms founder restore copy: the App only offers the restore to Apple Hide My
 * Email accounts (verify the purchase email in Settings). Everyone else is
 * unlocked by signing up with the purchase email, or contacts support. The old
 * "can be restored by verifying that email in the App" line overstated this.
 */
import { render } from "@testing-library/react";
jest.mock("next/font/google", () => ({
  Fredoka: () => ({ variable: "f", className: "f" }),
  Nunito: () => ({ variable: "n", className: "n" }),
}));

import TermsPage from "@/app/terms/page";

const FOUNDER_RESTORE_SENTENCE =
  "Founding Member status is keyed to the email used at purchase. It unlocks automatically when you sign up in the App with that email. If you signed up with Apple's Hide My Email, you can restore it by verifying your purchase email in the App's Settings; otherwise, contact support.";

describe("terms page founding member restore copy", () => {
  it("renders the exact founder restore sentence", () => {
    const text = render(<TermsPage />).container.textContent ?? "";
    expect(text).toContain(FOUNDER_RESTORE_SENTENCE);
  });

  it("no longer claims any purchase email can be restored in the App", () => {
    const text = render(<TermsPage />).container.textContent ?? "";
    expect(text).not.toContain(
      "can be restored by verifying that email in the App",
    );
  });

  it("shows the 21 October 2026 last-updated date", () => {
    const text = render(<TermsPage />).container.textContent ?? "";
    expect(text).toContain("Last updated: 21 October 2026");
    expect(text).not.toContain("13 October 2026");
  });
});
