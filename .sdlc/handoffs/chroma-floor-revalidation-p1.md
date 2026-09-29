# chroma-floor revalidation against #681 (revision 6)

Commit `49819c31` on `plan/chroma-floor` (not pushed). Message: `sdlc(chroma-floor): revalidated against #681, revision 6 (#701)`.

## What #681 invalidated

| Criterion | What moved | Why it's stale |
|---|---|---|
| C2 | #681 shipped a second lone-spike allow-list, `DEFAULT_KIT_SPIKE_FINDING` (`test/engine/anchor.mjs`), beside `LONE_SPIKE_ALLOW` | "exactly one `lone-spike` line" is false today (2 lines print, grep-verified); the awk `defaultDocument()` proxy no longer discriminates since that call already sits in-range for an unrelated reason |
| C3 | `EVEN_DIP_BASELINE` is no longer the stale 53-name gate-path list | #681's own addendum-2 already replaced it with a 90-name, anchor-aware, rendered-path list (57@450, 32@500, 1@550); the "today" premise (53 of 53 not observed) and the expected `dip-gate even` console shape no longer exist |
| C4 | rendered-path dip measurement already ships | the shipped 90-name list does not yet separate the stop-500 notch class (Q-C, not this plan's) from the 450/550 off-anchor class (this plan's); C4's "no such reading exists" premise is wrong |
| C11 | now three allow-lists, not two, plus `NOTCH_ALLOW` moved 142 to 102 names | needs a `DEFAULT_KIT_SPIKE_FINDING` grep row added; the `NOTCH_ALLOW` drift is expected under the plan's own Risks row, not a fault |

All four marked inline as **STALE** with what moved and why. I did not author new Command/Expected text for them; that requires the same measured rigor as the rest of the document and is U1/U2's to re-derive against the actual landed head.

## Status

Flipped `status: draft`. The owner's 2026-09-19 approval covered gate shapes (`EVEN_DIP_BASELINE`, the lone-spike allow-list count) that no longer ship on #681's tip; C2/C3/C4 are load-bearing Criteria rows for U1 and U2, so this is more than a number drifting.

## #701 vs #725

Confirmed clean via `gh issue view 725` and `.sdlc/handoffs/pif-prepr-review-p1.md` finding B2. #725 (`kind:bug`, `size:big`) owns the perceptual+peak median/p90 miss by its own stated Acceptance scope; #701 owns even mode's `chromaFloor` dip only, and the plan already said so (title, Not-in-scope table). Updated the Not-in-scope row that said "a new ticket if the owner wants them" to name #725.

One wrinkle flagged, not resolved: #725's own evidence table also cites an `even 300: p90 113.7` reading and an `even 670` above-100% count, but its Acceptance text scopes to "perceptual and peak cells" only. Read that as #725 not claiming the even rendered-path bar either, so it stays unowned exactly as chroma-floor.md's Q2 already ruled; noted inline for the owner rather than resolved unilaterally.

## Unchanged

Corpus counts (343 presets, 3,780 palettes, 3,380/3,370 anchored) confirmed unchanged against `docs/reference/CHANGELOG.md` 1.64. `chromaEnvelope(` call count still 5 (C7 unaffected).
