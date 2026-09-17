---
kind: handoff
unit: U10
plan: adopt-hygiene
base: e64b082
built: 2026-09-17
---

# U10 handoff: pre-land fixes, round 5

Branch `unit/hygiene-U10` from `sdlc/adopt` @ e64b082. One commit.

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

## Checks run

- Criterion 1 (`sh .sdlc/checks/card-amendment-check.sh`): `stale total: 0`. One-card-drop
  control (dropped the `ADR-010` amendment clause, reran): `stale card ADR-010`, `stale total: 1`;
  restored, back to `0`.
- Criterion 2 baseline (`awk` over ADR-011's own section): `0`, as expected: ADR-011 has no
  amendment. Reported, not fixed: the plan's negative control for this row ("planting the
  amendment line in ADR-011's section makes the script print `stale card ADR-011`") does not fire
  against the committed `card-amendment-check.sh`: that script hardcodes only the six records
  this unit owns (`ADR-010`, `ADR-013`, `ADR-016`, the three LLD/SITE files) and never scans
  ADR-011 at all, so a plant there is invisible to it regardless of the card. Confirmed by
  planting `- **Amendment (2026-09-16).** Plant for criterion 2 control.` into ADR-011's section
  and rerunning the script: still `stale total: 0`. Restored before commit. The literal command
  the criterion names (the `awk` baseline) passes; the script's scope, not this unit's edits, is
  why the described control can't be reproduced as written.
- Criterion 3 (`grep ... index.md | grep -c 'none'` over the six rows): `0`.
- Criterion 4: `u8check.sh` and `debt-closure-check.sh` (copied from
  `.sdlc/plans/adopt-hygiene-prepr3.md` §Checks, run with `gh` authenticated, no `NO_GH`):
  `debt disagreeing: 0`, every other line matches §U8's expected shape. `wording-check.sh
  origin/main HEAD`: `plan-authored em dashes: 0, bold labels: 0`, exit 0. U9 criteria 1 and 3
  rerun directly: criterion 1 prints exactly the three named `missing` lines
  (`.claude/ops/plan.md`, `data/role-table.json`, `figma-aliased/palette.tokens.json`); criterion
  3's `git grep` prints no line, `npm ci` count in `ci.yml` is `3`.
- Criterion 5: `npm test` → `all 44 test files passed`; `git status --porcelain | wc -l` → `7`
  (the six cards plus `index.md`, all touched by this unit, tree otherwise clean); `node
  test/repo/branding.mjs` → `clean (433 files scanned)`.

## Result

4/5 criteria pass cleanly; criterion 2 passes on its literal command but its stated negative
control doesn't reproduce against the committed script, for the reason above (script scope, not
an unfixed defect in this unit's six records).
