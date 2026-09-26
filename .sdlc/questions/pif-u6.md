---
kind: question
unit: pif-u6-ladder (plan preset-intent-fidelity, ticket #681, unit U6)
written: 2026-09-18
status: open
---

# U6 measured figures disagree with the dispatch's pinned numbers (expected: U1 dependency)

## Context

U6's dispatch (team-lead message, 2026-09-18) says: "U6 is independent of U1's anchor field: where
the plan says 'the anchor's L\*', use the existing key colour's L\* on the non-anchored path so your
unit stands alone, and say so in the handoff." The same message then asks to "Assert the three clipped
defaults (Tertiary, Danger, Warning) at their equal-compress spans 52.8 / 49.9 / 46.3 L\* +/- 0.05."

Those three families and spans are the plan's own numbers (`.sdlc/plans/preset-intent-fidelity.md`,
mechanism-(3) section), computed against **U1's Q2(b) minted anchors** (today's stop-550 hex per
family: Tertiary `#920CC6`, Danger `#AD1A0D`, Warning `#774902`). U1 has not landed on this branch,
`unit/pif-u6-ladder` branches before it, per the dispatch, so `src/engine/prime.mjs` here reads the
**cusp key colour's own CIE L\*** (`peakC(hue).tone`, the same anchor the ladder used pre-#681), not
U1's minted hex.

## What I measured (this branch, cusp anchors, STEP_L = 9, window [12.2500, 96.8849] L\*)

Command: `node -e "..."` sweeping `src/engine/prime.mjs`'s `primeSteps`/`peakC` over the 16
`docs/reference/data/role-table.json` defaults, `hueSpace: "cam16"`.

| family | cusp L\* (`lPrime`) | roomUp | roomDown | equal-compress span | clip side |
|---|---|---|---|---|---|
| Tertiary | 46.00 | 16.96 | 11.25 | **54.00** (unclipped) | none |
| Danger | 52.00 | 14.96 | 13.25 | **54.00** (unclipped) | none |
| Warning | 74.00 | 7.63 | 20.58 | **45.77**, not 46.3 | light |
| Secondary | 88.00 | 2.96 | 25.25 | 17.77 | light |
| Info | 72.00 | 8.29 | 19.92 | 49.77 | light |
| Success | 88.00 | 2.96 | 25.25 | 17.77 | light |
| Data 1 | 34.00 | 20.96 | 7.25 | 43.50 | dark |
| Data 4 | 70.00 | 8.96 | 19.25 | 53.77 | light |
| Data 5 | 92.00 | 1.63 | 26.58 | 9.77 | light |
| Data 6 | 88.00 | 2.96 | 25.25 | 17.77 | light |
| Data 7 | 90.00 | 2.29 | 25.92 | 13.77 | light |

Tertiary and Danger do not clip at all under the cusp anchor (their cusp L\*, 46.00 and 52.00, sits
too far from either window bound for a STEP_L-9 ladder to reach it). Warning clips, but to 45.77 L\*,
not 46.3. The families that DO clip here (Secondary, Info, Success, Warning, Data 1/4/5/6/7) are a
different set than the plan's Tertiary/Danger/Warning trio, because U1's minted anchors sit at
different L\* values than the cusp construction (e.g. Tertiary's cusp is 46.00 L\*, but U1 mints it from
`#920CC6`, whose L\* is close to the plan's stated 38.64).

## Two candidate resolutions

1. **Keep U6 standalone (what I shipped).** `test/engine/prime.mjs` asserts the MEASURED cusp-anchor
   clip set and spans (Secondary 17.77, Info 49.77, Success 17.77, Warning 45.77, Data 1 43.50), plus an
   explicit assertion that Tertiary and Danger are UNCLIPPED here, so a silent shift toward the plan's
   post-U1 numbers at rebase time shows up as a failing test, not a surprise. This is what
   `test/engine/prime.mjs` does right now (search `CLIPPED_DEFAULTS`).
2. **Defer the three-family assertion to the U1 rebase.** Drop the specific Tertiary/Danger/Warning
   spans from this unit's own gate entirely and let the Verifier / the U1+U6 integration pass re-add
   them once the anchor field exists on this branch.

I shipped (1): it is the only thing my code can honestly assert about itself, and it still gives a
concrete regression trip-wire for the rebase. I did not silently adopt the plan's numbers as reported.

## Ask

Route to the plan owner / U1 builder: confirm option (1) is acceptable as an interim state, and that
the U1+U6 integration (whoever rebases U6 onto U1's `anchor` field) is expected to replace
`CLIPPED_DEFAULTS` and the Tertiary/Danger-unclipped assertion in `test/engine/prime.mjs` with the
plan's original post-U1 numbers (52.8 / 49.9 / 46.3 L\* for Tertiary / Danger / Warning) at that time.

## Ruling (team lead, 2026-09-18)

Routed to the owner; option (1) stands unless told otherwise. No code change made under this ruling,
`test/engine/prime.mjs` already ships option (1) as described above.

## Amendment (2026-09-18, review pass 1, finding S5)

The fresh-context reviewer found the trip-wire weaker than the "Ask" above implies: `primeSwatches`
forwards a palette object it doesn't recognise every field of, so once U1 adds `defaults[].anchor` to
`role-table.json`, **`CLIPPED_DEFAULTS` and the Tertiary/Danger-unclipped assertion stay GREEN on this
branch's own construction even after that merge**, they only go red once someone actually wires an
anchor branch into `src/engine/prime.mjs` (the U1+U6 integration edit itself), because until then
`primeSwatches` keeps reading the cusp tone regardless of whether `anchor` is present on the palette.
So: green on `CLIPPED_DEFAULTS` after a plain U1 merge does NOT mean U6's construction is anchor-aware,
it means nothing changed yet. Whoever does the U1+U6 integration must not treat a green `npm test`
immediately after merging U1 as evidence the ladder is anchored; the replacement described in "Ask"
above is a real code change to `prime.mjs`, not just a data change to `role-table.json`.
