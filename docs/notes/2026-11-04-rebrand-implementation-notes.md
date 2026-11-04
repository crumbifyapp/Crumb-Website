# Rebrand 1.4.2: implementation notes (4 Nov 2026)

Brief: `../hq/requests/2026-10-30-website-rebrand-colours.md`. Palette source:
`../design/outbox/2026-10-29-rebrand/PALETTE-MAP.md`. Branch: `rebrand/1.4.2-colours`. Merge waits for the
owner's word, on the day 1.4.2 is live.

## Token spec (the single source for every writer)

Token names are RENAMED to their roles (the brief leaves this to the website session). Reason: once the literals
move onto tokens, keeping the old names would leave `crumb-cream` meaning white and `crumb-ink` meaning a green card
on about 100 call sites. Only about 8 call sites used the old names.

`src/app/globals.css` declares these with `@theme inline static` so that every token is emitted on `:root`.
Tailwind otherwise drops unused variables, and the legal pages read them through inline styles with `var()`.

### Dark surfaces (legal, support, admin, founding-member success)

| Token | Value | Replaces |
|---|---|---|
| `--color-crumb-bg` | #12291F | crumb-ink-deep, #0E0805, #1A1208 as a page background |
| `--color-crumb-bg-2` | #0C1D16 | new |
| `--color-crumb-card` | #1F4634 | crumb-ink, #241712 |
| `--color-crumb-card-hi` | #285443 | crumb-ink-soft |
| `--color-crumb-text` | #FFFFFF | crumb-cream, #E0D5C9, #F4ECDF, #F4ECE1 as text |
| `--color-crumb-text-soft` | #C2D6CF | crumb-cream-soft, #C4B09A |
| `--color-crumb-muted` | #8AA69C | crumb-ink-muted, #9B8272 |
| `--color-crumb-line` | #2C5745 | new |
| `--color-crumb-teal` | #79B8AD | crumb-gold, #E6C39B |
| `--color-crumb-teal-hover` | #5FA195 | #C9A077 and #D8B489 as hover colours |
| `--color-crumb-teal-deep` | #3E7A70 | crumb-gold-deep, #C9A077 as a ledge |
| `--color-crumb-on-teal` | #27180E | #1A1208 as text on a gold fill |
| `--color-crumb-danger` | #F29A86 | crumb-red |
| `--color-crumb-teal-tint` | rgba(121,184,173,0.07) | rgba(230,195,155,0.07) |
| `--color-crumb-teal-wash` | rgba(121,184,173,0.12) | rgba(230,195,155,0.12) as a fill |
| `--color-crumb-teal-line` | rgba(121,184,173,0.15) | rgba(230,195,155,0.12 or 0.15) as a border |
| `--color-crumb-shadow` | rgba(0,0,0,0.25) | rgba(26,18,8,0.25) |
| `--color-crumb-platform-ios` | #5AC8FA | unchanged value, moved onto a token |
| `--color-crumb-platform-android` | #7ED957 | unchanged value, moved onto a token |

### Light surfaces outside the landing (not-found, share landing pages)

| Token | Value | Replaces |
|---|---|---|
| `--color-crumb-light-bg` | #E6F0EE | #F4ECE1 |
| `--color-crumb-light-bg-2` | #D9E8E4 | new |
| `--color-crumb-light-card` | #FFFFFF | new |
| `--color-crumb-light-ink` | #27180E | #1A1208 |
| `--color-crumb-light-ink-soft` | #4A3A30 | #4A3F33, #8A7A68 (muted cannot carry body text) |
| `--color-crumb-light-muted` | #6B827C | new, icons and hints only |
| `--color-crumb-light-line` | #CFE0DC | new |
| `--color-crumb-light-teal-ledge` | #4E8C81 | #C9A077 as a button ledge |
| `--color-crumb-light-danger` | #B23A26 | new |

Teal buttons on light pages use `bg-crumb-teal text-crumb-on-teal`, with the ledge colour from `crumb-light-teal-ledge`.
Never white text on teal. Never teal text on a light background.

## Decisions and deviations

1. **Dark-surface accents (mismatch with brief step 3, told to HQ).** The brief says `.band-cap .k`, `.cta-in h2 em`
   and the footer link hover "follow the same rule" (--ink). All three sit on dark surfaces, where chocolate is
   invisible. CTA em and footer hover become teal text (7.58 on chocolate). The band label becomes a teal fill with
   chocolate text, because it sits over a photo whose contrast varies.
2. **All text on --ink-3 moves to --ink-2.** #6B827C is 3.54 on the page and 4.11 on a white card, both under 4.5.
   --ink-3 stays only on the scroll cue's outline and dot.
3. **Eyebrow text moves from --hi to --ink.** It is 13px text and --hi is 3.07 on the new background. The small bar
   in front of it stays --hi as a fill.
4. **Organization logo PNG is the chocolate lockup on transparent** at 512x512, because Google requires a logo to look
   right on white.
5. **Favicon uses the full logo at 16, 32 and 48** as the brief and D331 say. At 16px it is not legible. Flagged for
   Design: `icon/small-mark-24.svg` exists if they want it for the favicon only.
6. **Hero map image shows the old cream style.** Flagged to HQ and left alone, as the brief says.
7. **Dead CSS removed from globals.css** where it held retired colours: `.receipt-edge`, `@keyframes f-pulse`,
   `.animated-border-gradient` with its `--angle` property and keyframes. None has a user.
8. **Amber warning callout in admin/referrals stays.** It is Tailwind's amber as a warning state, not the brand.

9. **Privacy policy: removed the word "gold" from `"Sponsored" label`.** In the app's 1.4.2 code the chip uses the
   brand fill (`components/feed/SponsoredCard.tsx`), so "gold" would be false once it ships. Without the colour word,
   the sentence is true before and after. The "Last updated" date is unchanged because the meaning didn't change.
10. **"Crumbify" text beside the logo removed** from the header and footer, because the lockup contains the word. The
    link's accessible name comes from the svg's aria-label.

## Design review round 1 (4 Nov, `design/outbox/2026-11-04-website-rebrand-review/REVIEW.md`)

Applied: accents inherit the heading font, orange `--hi` retired (guard rejects it), pulse ring removed, band label removed.
This reverses decision 3's small bar and decision 1's band label, and the earlier eyebrow note about `--hi`.

Headline over pins: measured overlap at 1024x768, 1280x720, 1366x768, 1440x900 and 1536x864, so hiding one pin (Design's
simplest option) would not have fixed it. Moving pins would have put real restaurants in the wrong place, and the hero copy says
every pin is a real spot. Instead `#lmap` slides up with `translate` by `max(0px, 500px - max(46.7vh, 336px))` above 921px wide.
That left a hard seam at the map's bottom edge on short screens, so the map now fades out from 78% to 94% of its height. The
fade also hides the baked-in "N" badge. Still overlapping at 360x640, unchanged from before this job.

Manifesto width went from 18ch to 20ch, because the wider font left "go." alone on the last line.

Design signed off round 2. Final edits: `.here2` blue dot removed with `HERE_POSITION` and `--blue`, and `.band-cap p` and
`.footer-brand p` moved to `--disp`. Owner decision D343: the hero map is recoloured before merge. Design supplies the file.

Hero map recoloured by Design and swapped in (D343): same 1440x900 and geography, no baked-in badge. `.landing #lmap img`'s colour filter removed at Design's request, because the file is already on palette. The slide and fade stay; the map credit is unchanged.

## Map credit moved onto the hero (D344)

CARTO's terms require the credit to be legible in the image, so a footer-only credit falls short. The line is exactly "© OpenStreetMap contributors, © CARTO", with both names linked, and the footer credit is gone. It's a sibling of `#lmap`, because that element is `aria-hidden`, masked and slid up on short screens.

Top-left, directly under the header, because top-right collides with Maki & Ramen on short screens and the bottom of the map is faded. 12px at left 16px clipped the Norma pin at 1280x720, so it's 11px at top 84px, left 8px. Below 340px wide the headline covers the top of the hero, so the credit goes under the store badges. At 320x568 that's just below the first screen.

Known overlap: windows 921 to about 960px wide and about 720px tall, up to 6px at the top of the pin's float. The credit stays on top. Left alone as a rare size with no clear corner.

After merge, Design renders our own map from OpenStreetMap data and the credit changes to OpenStreetMap only. The owner also kept the privacy wording change, with "Last updated" unchanged (D345).

## Vercel build failure: intermittent, cause unknown (read this on merge day)

The git-triggered previews for 3d4b5d8 (about 16:30 UTC) and c7a1a73 (about 16:35) both failed on Vercel with
`Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'` and
`next/font/google queries have exactly one entry`, for Nunito in `LegalShell.tsx`, with 15 errors.

What was tested:
- `vercel deploy --force` of c7a1a73, which skips the build cache, is READY (dpl_4E9Gc6G6, about 16:39).
- The git-triggered preview of 7bf893a is READY (dpl_GuXamk42, about 16:42). It **restored the same 29 Oct build cache
  as the failures** (dpl_5x61SEuY), used the same Next 16.3.8, and differs from c7a1a73 only in a docs file.
- A clean local build passes for this branch and for untouched main at 5873224 (Next 16.3.8 from a fresh `npm ci`).

So neither the code nor the build cache explains it, and an earlier version of this note that blamed the cache was
wrong. The same inputs failed and then passed minutes later, so the failure is intermittent. The timing suggests
something transient while fetching Google Fonts, but that is not proven. The same error also hit a writer's worktree
build during the 29 Oct job, so it may recur.

A failed production deploy leaves the old site serving, so it isn't an outage, but the rebrand wouldn't be live.
**On merge day, watch the deploy. If it shows this error, redeploy and check again.**

## Known e2e failure, not from this branch

`tests/e2e/mobile-responsive.spec.ts:86` looks for a `.store` class that main already removed on purpose (see the
comment in `landing.css`). Verified: run on a clean build of main at 5873224, it fails the same way. Left alone, outside this job.

## Not verified

- Logged-in admin pages: behind the magic link, so covered only by the colour guard and the review.
- Share pages with real data (`/place`, `/review`, `/post`, `/u`).

## Lanes

- Units A to E (tokens and landing CSS, admin, legal and share pages, logo and metadata, colour guard): Sonnet writers,
  because each brief covered many files or constraints.
- Unit F (review fixes, about 5 small exact changes): Haiku writer.
- Units G and H (Design's changes, exact CSS and small component edits): Haiku writer.
- Map credit (exact change, about 6 files, one concern): Haiku writer.
- Review: one Sonnet reviewer, read-only. No blockers; 1 SHOULD and several notes, fixed in unit F.
- Assets and docs: orchestrator (generated PNG and ICO files, markdown).
