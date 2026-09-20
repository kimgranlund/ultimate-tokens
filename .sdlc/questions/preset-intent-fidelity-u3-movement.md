---
kind: question
unit: pif-u4-integration (plan preset-intent-fidelity, ticket #681, unit U4), on behalf of U3's C6(iv)
written: 2026-09-19
status: open
---

# C6 (iv): the per-preset movement table, for the owner's acceptance

Per the plan's own C6(iv) text: "a per-preset movement table, not a magnitude gate ... it ships as U4's
blast-radius report and U3 lands only after the owner accepts it, recorded as a 🟢 answer in
`.sdlc/questions/preset-intent-fidelity-u3-movement.md`; the verifier checks that the record exists,
names the report's sha, and carries the owner's acceptance line, and does not grade the magnitudes."

This is that record.

## The report

`.sdlc/handoffs/pif-u4.md`, at commit **`1041d53eec197b6197c534e5cbf0e8133d79c34c`** (branch
`unit/pif-u4-integration`), section 8 ("Step 3: generators run, assets committed"). Contents relevant to
this acceptance:

- **Presets moved: 343 of 343.** **Palettes moved: 3,780 of 3,780.**
- Max |dL*| / max dChroma per stop/mode (corpus, export25, vs `bf2aaf6`):
  - perceptual: max |dL*| 19.40 (film "TRON: Legacy" secondary, stop 500), max dChroma 32.25 (brands
    "Burger King" primary, stop 500)
  - even: max |dL*| 12.45 (film "2001: A Space Odyssey" tertiary-muted, stop 500), max dChroma -43.75
    (brands "Nike" primary-muted, stop 600)
  - peak: max |dL*| 50.75 (cuisine "Cocktails" tertiary-muted, stop 650), max dChroma 43.85 (brands
    "Burger King" primary, stop 500)
- Full per-mode median/p90 table, both stop sets, all stops (corpus |dL*| vs `bf2aaf6`) - six rows,
  perceptual/even/peak x display19/export25, median 1.35-6.04, p90 5.82-26.14.
- `damp`/`dampCurve` before/after: `DEFAULT_CONTROLS`' raw values unchanged (80/1.5/0/0, both); U3's
  retune is a new even-mode-only multiplier, `EVEN_DAMP_FACTOR = 0.25`, absent from `bf2aaf6` entirely.
- Default-kit peak-vs-perceptual ratio: byte-identical at stop 500 for all 16 families on the integrated
  tree (was substantially different per family at `bf2aaf6`, e.g. a 40-point L* spread for Data 5).

This document does not re-grade any of those magnitudes - per C6(iv)'s own text, that is not this
record's job. It exists to carry the owner's 🟢/🔴 on having seen them.

## What this acceptance is NOT

This acceptance is scoped to C6(iv) - the per-preset movement magnitude, as a record that the owner has
seen real numbers rather than a pass/fail line. It is separate from, and does not resolve, the open
questions in `.sdlc/questions/pif-u4.md` (Q1-Q6), several of which touch the SAME report - in particular
Q4 (#668's non-reproducing negative control) and Q2 (the F1-widening-search gap) are live findings inside
the very numbers this record asks the owner to accept the existence of. Accepting C6(iv) is not a ruling
on those.

## Owner's acceptance

_(to be filled in by the owner, relayed through team-lead per the brief - "the owner's answer comes back
through me")_

- [ ] 🟢 Accepted - the movement table exists, names the report's sha above, and has been seen.
- [ ] 🔴 Not accepted - reason:
