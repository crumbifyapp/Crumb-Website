import { StoreBadge } from "@/components/landing/StoreBadges";
import { appleSvg } from "@/components/landing/data";

const APP_STORE_URL = "https://apps.apple.com/gb/app/crumbify/id6777163992";

export default function FoundingMemberSuccess() {
  return (
    <div className="min-h-screen bg-crumb-ink-deep flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">&#x1F389;</div>
        <h1 className="text-3xl font-bold text-crumb-cream mb-4">
          Welcome, Founding Member!
        </h1>
        <p className="text-crumb-cream/70 text-lg mb-8">
          You&apos;re a founding member. You get lifetime Premium for as long as Crumbify
          runs, with no subscription.
        </p>
        <p className="text-crumb-cream/70 text-sm mb-6">
          Crumbify is live on the App Store.
        </p>
        <p className="text-crumb-cream text-base mb-6">
          Next step: download Crumbify from the App Store and sign up with the same email
          address you paid with. That unlocks your founding membership. Signing up with a
          different email will not unlock it. If you used Apple&apos;s Hide My Email, you can
          restore it in Settings by verifying the email you paid with.
        </p>
        <div className="flex justify-center mb-8">
          <StoreBadge
            href={APP_STORE_URL}
            iconSvg={appleSvg}
            smallLabel="Download on the"
            bigLabel="App Store"
            ariaLabel="Download on the App Store"
          />
        </div>
        <a
          href="https://crumbify.co.uk"
          className="inline-block rounded-[14px] bg-crumb-gold px-[22px] py-[13px] text-[15px] font-bold text-crumb-ink shadow-[0_5px_0_var(--color-crumb-gold-deep)] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_1px_0_var(--color-crumb-gold-deep)]"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
