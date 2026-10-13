/**
 * Legal minimum age: the app (1.1.1, teen mode) admits users aged 13 and over,
 * so the Terms and the Privacy Policy must say 13, never the old 16. A copy
 * regression here is a legal misstatement, and no other test reads this text.
 */
import { render } from "@testing-library/react";
jest.mock("next/font/google", () => ({
  Fredoka: () => ({ variable: "f", className: "f" }),
  Nunito: () => ({ variable: "n", className: "n" }),
}));

import TermsPage from "@/app/terms/page";
import PrivacyPage from "@/app/privacy/page";

const OLD_AGE = /\b(?:at least|aged|under|over) 16\b|\b16 years old\b/i;

describe("legal pages minimum age", () => {
  it("Terms say 13 and not 16", () => {
    const text = render(<TermsPage />).container.textContent ?? "";
    expect(text).toContain("at least 13 years old");
    expect(text).not.toMatch(OLD_AGE);
  });

  it("Privacy Policy says 13 and not 16", () => {
    const text = render(<PrivacyPage />).container.textContent ?? "";
    expect(text).toContain("people aged 13 and over");
    expect(text).not.toMatch(OLD_AGE);
  });
});
