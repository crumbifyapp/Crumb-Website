# SEO and AI-search fix pack: implementation notes (29 Oct 2026)

Brief: `hq/requests/2026-10-29-website-seo-fix-pack.md` (HQ, owner decisions D303 to D307).
Evidence: `hq/research/website-seo-ai-audit-2026-10-29.md`.
Branch: `seo/ai-search-fix-pack`. Merge and deploy only on the owner's word.

## Facts checked before writing (29 Oct)
- iTunes lookup for id6777163992 (gb): name "Crumbify", primary genre Food & Drink, secondary
  Social Networking, price 0 GBP, seller Crumbify LTD, 6 ratings averaging 5.0, min iOS 16.
- Production env has `NEXT_PUBLIC_APP_STORE_URL` and `NEXT_PUBLIC_STRIPE_FOUNDING_MEMBER_LINK`;
  `NEXT_PUBLIC_PLAY_STORE_URL` is unset, so the Play badge reads "Coming soon" (correct).
- The founding counter is open: 3 of 100 claimed.
- The audit was taken against a stale checkout. Upstream (PRs #40, #41, #44) had already
  fixed the success page "When Crumb launches" copy, the "Early access before public launch"
  perk, and the `/founding-member` 404 fallback (now `/#founding`). Item 6 is reduced to
  aligning on "out now on iPhone".
- The only real social profile is X `@crumbifyco` (Footer), so Organization `sameAs` lists only that.

## Decisions and deviations
- band-overhead.jpg: re-encoded with sharp mozjpeg q72 progressive at the same 1180x1572
  resolution (the band shows full width, so downscaling would blur it on desktop).
  263 KB down to 173 KB. Checked visually.
- MobileApplication `applicationCategory`: `SocialNetworkingApplication`. Google requires one
  of its supported app types and has no Food & Drink type; Social Networking is the App
  Store's own secondary genre, so it is both true and supported.
- `aggregateRating`: read live from the iTunes lookup API (revalidated daily) and omitted
  when the fetch fails or the count is 0. This follows the brief's rule (real App Store numbers
  only), and Google needs a rating or review before it treats the app as rich-result eligible.
- robots also disallows `/api/`, `/ref`, `/referral` (click-logging redirects, so bots must
  not inflate referral counts) and `/turnstile.html` (an app WebView helper). The share pages
  stay crawlable, because a crawler has to fetch them to see their noindex.

## Lanes
- Image compression, notes, merge: orchestrator (asset and markdown only).
- Unit A, crawl and metadata (robots, sitemap, per-page metadata, share pages, not-found):
  sonnet writer, because it touches many files with Next metadata-merge subtleties.
- Unit B, landing content and JSON-LD (hero sentence, FAQ, all four JSON-LD blocks, launch
  copy): sonnet writer, because it combines UI, schema and server fetch.
- Unit C, next/image swap (5 components): sonnet writer, because there is a visual-regression
  risk with the absolutely positioned parallax containers.
- Review: sonnet, read-only.
