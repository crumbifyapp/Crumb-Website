import Image from "next/image";
import { StoreBadges } from "./StoreBadges";

export function CTA() {
  return (
    <section className="cta" id="get-the-app">
      <div className="cta-media par" data-speed="0.2">
        <Image src="/media/food/cta-dark.jpg" alt="" width={1180} height={1572} sizes="100vw" />
      </div>
      <div className="cta-in reveal">
        <h2>
          Your next favourite spot is <em className="s">one tap away</em>.
        </h2>
        <p>Crumbify is out now on iPhone. Get it, add your friends, and start posting the places you love.</p>
        <StoreBadges className="justify-center" />
      </div>
    </section>
  );
}
