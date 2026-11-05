# Own hero map swap: implementation notes (5 Nov 2026)

Brief: `../hq/requests/2026-11-04-website-own-map-swap.md`. Decisions: D344, D355. Map source and licence table: `../design/outbox/2026-11-04-website-rebrand-review/` (`own-map/` and the end of `REVIEW.md`).

## Decisions and deviations

1. **Credit wording and links.** The brief gives the line and three URLs but not which words carry each link. Used OpenFreeMap's own form: "OpenFreeMap", "© OpenMapTiles" and "OpenStreetMap" are links; "Data from" isn't.
2. **Two lines at 921px and up.** On one line the pill is 326px wide (Design's preview said 305) and overlaps Master Wei at 1024x768 by 5px and Norma at 1280x720 by 1px. `max-width:190px` wraps it and clears both. Phones hide pin labels, so one line stays clear there and stays out of the headline at 360x600.
3. **Move under the badges at 341px and below (was 339).** One line needs 342px. A wrapped pill at the top would hit the headline. `bottom` went from 8px to 4px, because the wrapped pill otherwise overlapped the badges by up to 3px.
4. **Known overlap got worse.** At about 921 to 960 wide and 720 tall, the taller pill overlaps the Norma label by up to 14px at the top of its float and about 5px at rest. It was 6px. No corner is clear at that size, and the credit stays on top.
5. **`mapProjection.ts` comments updated, constants untouched.** They described a Leaflet capture and a script that doesn't exist. `scripts/capture-hero-map.mjs` still needs a `/map-capture-tmp` route that's gone. Left alone, outside this job.
6. **"CARTO" remains in `src` only in two tests that assert it is absent.** Nothing renders it.

## Alignment

Edge correlation against the previous map is not useful here (about 0.30 at every small offset), because the new style removed buildings. Water and park shapes work better: the Thames is best at 0,0 (0.885), and land shapes per quarter land within 1px, with scores close to a tie. Design's own check against the original found 0,0.

## Lanes

- Credit, CSS, tests, comments (exact change, one concern): Haiku writer.
- Map file and docs: orchestrator.
- No separate reviewer: the orchestrator read the full diff, which is small and fully specified.

Heavy jobs ran one at a time under `systemd-run` caps, after checking load, per the owner's rule after the 4 Nov restart.
