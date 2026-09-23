# Question preset-intent-fidelity pre-land · from conductor

Asked 2026-09-20 through `AskUserQuestion`, after the pre-land review at `b4be472c`
(`.sdlc/handoffs/pif-prepr-review-p1.md`: 2 blocking, 5 should-fix, 5 carry).

| # | Question | Options offered | Chosen (verbatim) |
|---|---|---|---|
| Q1 | B1: 22 of 3,380 anchored palettes break the equal-on-both-sides rule (max 54 L*, near-black sources) and no gate covers the corpus. The plan says 0 exceptions. How do we settle it? | Allow-list the 22 by name and gate the corpus (Recommended) · Fix the engine until it is 0 exceptions · Land as is and ticket it | "Allow-list the 22 by name and gate the corpus (Recommended)" |
| Q2 | B2: `--envelope` exits 1, 14 of 24 readings miss, 11 of them perceptual and peak, which no ticket owns (#701 covers even only). How do we close #681? | File a ticket for perceptual and peak, re-cite, accept C6 open (Recommended) · Hold #681 until `--envelope` passes · Fold perceptual and peak into #701 | "File a ticket for perceptual and peak, re-cite, accept C6 open (Recommended)" |
| Q3 | S1 to S5: the `key` swatch still shows the cusp colour, `seedFromKey` does not detach, and three record fixes. Where do they go? | Fix all five in this PR (Recommended) · Fix the three record items now, ticket the two code ones · Ticket all five | "Fix all five in this PR (Recommended)" |

Consequences. Q1: the symmetry gate gains the 3,380 anchored corpus palettes, the 22 become named
exceptions in the shape `ORDER_ALLOW` already uses, and the span-under-30 count is re-pinned to what
the gate measures. Q2 is the owner's written acceptance that #681 closes with C6 open; a new issue
owns the perceptual and peak median and p90 miss, and ADR-026 and CHANGELOG 1.64 cite it in place of
#701. Q3: one fix unit, U7, carries B1's gate work and S1 to S5; the planner writes its criteria.

## Q4, asked 2026-09-21 on the U7 review at `285f66ec` (F2)

| # | Question | Options offered | Chosen (verbatim) |
|---|---|---|---|
| Q4 | U7's key-follows-anchor fix has a downstream effect nobody ruled on. The New Palette dialog's Relative derivation (`_isNeutralPalette`, `_orderedContext`, `newPalSamples`, `_newPalProposed`) reads the palette key, so it now pivots on the sampled anchor colour instead of the old cusp colour. Over 344 corpus documents: 148 palettes flip their neutral classification, the primary index moves for 14, and the derived target moves for 339. Is that intended? | Intended, the derivation follows the sampled colour (Recommended) · Hold the derivation to the old key · Hold U7 until I see examples | "Intended, the derivation follows the sampled colour (Recommended)" |

Consequence. No code change. The plan's Blast radius section gains a row naming the New-Palette
derivation consumers with those figures, and U7's handoff cites this answer. The anchor is the
palette's identity everywhere, per ADR-026; two notions of a key would be the contradiction S1
set out to remove.
