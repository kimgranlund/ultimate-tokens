---
kind: handoff
unit: U10
plan: adopt-hygiene
base: e64b082
built: 2026-09-17
---

# U10 handoff: pre-land fixes, round 5

Branch `unit/hygiene-U10` from `sdlc/adopt` @ e64b082. Four commits: the six-card fix, a merge of
`sdlc/adopt` @ 29fc25b (the U10 review's criterion 6, and the second, non-vacuous version of
`card-amendment-check.sh`) plus the start-only source-range fix that criterion needed, a merge of
`sdlc/adopt` @ 6c83520 (criterion 6 rewritten to check each section's end too), then the end fix
that revision needs.

## What changed

The sixth 🔴 named in `.sdlc/verdicts/adopt-hygiene-prepr.md` (on 279ae0f): six record cards, and
the matching `.sdlc/records/index.md` lineage cells, omitted U1's `Amendment (2026-09-16)` from
their source. `ADR-016` and `SITE-runbook` read "none stated" against a lineage cell that named
one, contradicting `decisions.md:33` and `:50`.

Fixed, in each card's "Supersedes / amended by" cell and the matching `index.md` row, by reading
the amendment straight from its source and stating what it actually says (not paraphrased from
the card's older content):

- `ADR-010`: the storage chain now lives as a `persist.js` comment, not code in the record; the
  zip writer is `zipStore`, not `makeZip`.
- `ADR-013`: voice count moved thirteen → fifteen (`UI-control`, `UI-widget` split off `ui`).
- `ADR-016`: the #491 ruling renamed the collection set again ("Color Roles", "Type Primitives",
  "Geometry"; "Color Primitives" unchanged), correcting the prior "none stated".
- `LLD-muted-base`: the shared resolver the LLD's own risk table and Agent-verification section
  refer to lives at `src/engine/resolve.mjs`.
- `SITE-runbook`: step 0's premise is stale, every flag but `hostedMcp` is now a wired
  `flagOf()` consumer, correcting the prior "none stated".
- `SITE-describe-palette`: the adopt-hygiene plan flips the describe-eval workflow from a clean
  no-op skip to failing loudly (`exit 1`) when the provider key is absent.

## Round 1 (the six cards)

Reported, not fixed, in the first pass: the plan's criterion 2 negative control ("planting the
amendment line in ADR-011's section makes the script print `stale card ADR-011`") did not fire
against that first `card-amendment-check.sh`, because it hardcoded only the six records this unit
owns and never scanned ADR-011 at all. The Orchestrator's review confirmed this, rewrote the
script to derive its card set from each card's own `Source` row instead of a hardcoded list, and
added criterion 6 below for the `Source` line ranges U1's amendments had shifted.

## Round 2 (criterion 6, after merging `sdlc/adopt` @ 29fc25b)

`sh .sdlc/checks/card-source-range-check.sh` printed 12 stale ranges, `ADR-011` through `ADR-022`
(every card whose heading sits after `ADR-010`, which is exactly where U1's three amendment blocks
insert lines). Recomputed each range from the file directly (`grep -nE '^## ADR-0NN '`, end =
next heading's line minus one) and rewrote all 12 `Source` cells. That version of the script only
checked the range's start; it printed 0 for `ADR-010`, whose end (157) already stopped one
paragraph short of the amendment (section runs to 161), because it never read the end at all.

## Round 3 (criterion 6, after merging `sdlc/adopt` @ 6c83520)

The rewritten script also checks the end: the section's last non-blank line before the next
heading, not the heading's line minus one (a blank separator line sits between every ADR section
and the next heading, so "next heading minus one" always lands on that blank line, one past the
real end). It printed 14 stale ends, `ADR-010` through `ADR-023`: `ADR-010`'s end was short by
four lines (it predates this unit and was never touched by round 2, since round 2 only checked
starts), the other 13 were each short by exactly one (round 2's "next minus one" arithmetic).
Recomputed each true end directly (last non-blank line strictly before the next `## ADR-NNN`
heading, or before EOF for `ADR-024`, which the script left alone) and rewrote all 14 cells.

## Checks run (rerun in full after all three rounds)

- Criterion 1 (`sh .sdlc/checks/card-amendment-check.sh`): `stale total: 0`.
- Criterion 2: planted `- **Amendment (2026-09-16).**` under `## ADR-011`, ran the (now
  card-set-derived) script: `stale card ADR-011`, `stale index ADR-011`, `stale total: 2`.
  Restored, back to `0`. The negative control now fires as the plan describes.
- Criterion 3 (`grep ... index.md | grep -c 'none'` over the six rows): `0`.
- Criterion 4: `u8check.sh` and `debt-closure-check.sh` (copied from
  `.sdlc/plans/adopt-hygiene-prepr3.md` §Checks, run with `gh` authenticated, no `NO_GH`):
  `debt disagreeing: 0`, every other line matches §U8's expected shape. `wording-check.sh
  origin/main HEAD`: `plan-authored em dashes: 0, bold labels: 0`, exit 0. U9 criteria 1 and 3
  rerun directly: criterion 1 prints exactly the three named `missing` lines
  (`.claude/ops/plan.md`, `data/role-table.json`, `figma-aliased/palette.tokens.json`); criterion
  3's `git grep` prints no line, `npm ci` count in `ci.yml` is `3`.
- Criterion 5: `npm test` → `all 44 test files passed`; `git status --porcelain | wc -l` → `14`
  once round 1's six cards, `index.md`, round 2's twelve `ADR-011..022` starts, and this handoff
  were already committed; round 3's end fix touches exactly `ADR-010` through `ADR-023`, tree
  otherwise clean. `node test/repo/branding.mjs` → `clean (435 files scanned)`.
- Criterion 6 (`sh .sdlc/checks/card-source-range-check.sh`): `range mismatches: 0`. Shifted-end
  control (shortened `ADR-010`'s end by one line, reran): `end ADR-010 says 160, section ends at
  161`, `range mismatches: 1`; restored, back to `0`.

## Result

All 6 criteria pass cleanly, including both negative controls.
