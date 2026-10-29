import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Manifesto } from "@/components/landing/Manifesto";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeedMarquee } from "@/components/landing/FeedMarquee";
import { Band } from "@/components/landing/Band";
import { TasteMatch } from "@/components/landing/TasteMatch";
import { Groups } from "@/components/landing/Groups";
import { FoundingSection } from "@/components/landing/FoundingSection";
import { Faq } from "@/components/landing/Faq";
import { CTA } from "@/components/landing/CTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAppStoreRating } from "@/lib/app-store-rating";
import { mobileApplicationJsonLd } from "@/lib/structured-data";
import { Footer } from "@/components/landing/Footer";
import { ScrollFX } from "@/components/landing/ScrollFX";
import "./landing.css";

export default async function Home() {
  const rating = await getAppStoreRating();
  return (
    <div className="landing">
      <JsonLd data={mobileApplicationJsonLd(rating)} />
      <Header />
      <span id="top" />
      <Hero />
      <Manifesto />
      <HowItWorks />
      <FeedMarquee />
      <Band />
      <TasteMatch />
      <Groups />
      <FoundingSection />
      <Faq />
      <CTA />
      <Footer />
      <ScrollFX />
    </div>
  );
}
