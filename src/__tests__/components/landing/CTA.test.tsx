import { render, screen } from "@testing-library/react";
import { CTA } from "@/components/landing/CTA";

describe("CTA", () => {
  it("says the app is out now on iPhone", () => {
    render(<CTA />);
    expect(
      screen.getByText(
        "Crumbify is out now on iPhone. Get it, add your friends, and start posting the places you love.",
      ),
    ).toBeInTheDocument();
  });
});
