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
