import { HeroMap } from "./HeroMap";
import { StoreBadges } from "./StoreBadges";

export function Hero() {
  return (
    <section className="hero">
      <HeroMap />
      <div className="hero-mask" />
      <div className="hero-c">
        <div className="in">
          <h1>
            Your city, scored
            <br />
            by the people <em className="s">you trust</em>.
          </h1>
          <p className="sub">
            Crumbify is a social food app for iPhone for finding, rating and saving restaurants with
            your friends. Every pin is a real spot a friend has been to, scored out of ten.
          </p>
          <StoreBadges />
        </div>
      </div>
      <div className="scrollcue">
        <div className="m" />
        <span>Scroll</span>
      </div>
    </section>
  );
}
