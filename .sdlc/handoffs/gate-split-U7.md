---
kind: handoff
plan: gate-split
unit: U7
branch: unit/gs-U7
written: 2026-09-24
pass: 1
---

# gate-split U7: pre-land review fixes, records and comments only

Source: `gs-prepr-review.md` (reviewer `gs-prepr-reviewer-l4-p1`, verdict FIX-FIRST on
`plan/gate-split` @ `1c958d6b`), Findings table and Addendum. Six fixes, all record or
comment edits; no source or test logic touched.

## Fixes, mapped to commits

1. `.claude/skills/shipping-changes/SKILL.md` step 6 (commit `587ff627`). Before:
   `Watch CI (~figure pinned at pre-land, once U6-8/P10 measures a completed `sweeps`
   matrix run; not yet measured on `plan/gate-split`)`. After: `Watch CI (~265 s wall on
   a PR, measured on run 35974499577: `build-test` about 260 s is the wall, the `sweeps`
   legs run 70 to 190 s in parallel)`. Quotes run 35974499577 per the review's Addendum.

2. `test/engine/prime.mjs` (commit `4ed0f7db`), the `151,200` and `114/151,200 every
   time` sentences (C1). Before: `... = 151,200 rungs; these are THIS gate's own
   parameters ...` and `... measured, this commit, three runs: 114/151,200 every time.`
   After: `... = 151,200 rungs FULL (30,240 SAMPLED, one hue in five at hue step 5); these
   are THIS gate's own parameters ...` and `... measured FULL, this commit, three runs:
   114/151,200 every time (SAMPLED prints 3/30,240 at hue step 5).` Both sentences now
   name FULL and give the SAMPLED denominator. The two lines' rewrap swept their
   pre-existing em dashes onto added lines (P8 caught this at `2` before the second pass);
   recast both with a colon, no wording change, P8 now reads `0`.

3. `.github/workflows/ci.yml` `sweeps` job comment (commit `4ed0f7db`). Cut: `Sequencing
   note (#713 plan): gate:corpus-anchor needs test/engine/anchor.mjs, which arrives with
   #681, so that leg runs red until it lands; gate:corpus-tonal, gate:sweep-prime and
   gate:corpus-reset only read --full once U2, U4 and U5 teach those files to, so until
   then they run their existing, unsplit suite instead. That is this plan's own
   sequencing, not a bug in this job.` Kept: the shape rationale (own runners, `fail-fast:
   false`, no `npm ci`, no `if:`/`continue-on-error:`).

4. `.sdlc/handoffs/gate-split-U2.md:220` (commit `587ff627`, C6). Before: `... e.g.
   Trulli of Alberobello ...|primary|500`. After: `... e.g. Trulli of Alberobello ·
   vernacular · Puglia, Italy|primary|500`, the full program-output name, no `altered:`
   marker needed.

5. `.sdlc/handoffs/gate-split-U5.md:53` (commit `587ff627`, C7). Before: `branding:
   clean (514 files scanned)`. After: the same figure with `(base's own count, not this
   unit's head)` appended, since 514 is `ebddc55d`'s count, not this unit's own head.

6. `.sdlc/handoffs/gate-split-U3.md` and `gate-split-U4.md`, eight bold inline labels
   (commit `587ff627`). Unbolded three list items in U3 (the `anchor-ladder` allow-lists
   item, the `controlSubjects`/`anchored.length` floors item, the R10 negative-controls
   item) and five in U4 (the U4-1 N=21 mention, and the four Corrections list items:
   U4-1's N, the P8/P9 merge-base note, the added FULL vacuity gate, the em-dash fix).
   `git diff 2890d67a -- gate-split-U3.md gate-split-U4.md | grep '^+' | grep -cE
   '\*\*[^*]+\*\*'` reads `2` after the sweep. Both remaining hits are bold data values in
   table cells (`0` and a "sampled M-B: exit 1, 3/400, ceiling line count 1" reading), not
   prose labels, so they are out of scope per the brief.

## Not this unit's

`.claude/CLAUDE.md:95`'s `~60 s` line (owner ruling, X9), `test/engine/anchor.mjs`'s two
nits (`allowListOk` hoisting, `seenCats`/`brands` coverage), and every item the review
lists as correctly deferred (U6-5's `STALE head`, the `note head:` on the two main-side
files, `.sdlc/debt.md`'s K17 drift list, the `symmetry` anchored-corpus leg).

## Close-out checks

- `npm test` in a fresh clone at `587ff627` (final head): `all 50 test files passed`,
  `git status --short` empty after.
- `node test/repo/branding.mjs | tail -1`: `branding: clean (693 files scanned)`.
- Added-line em dash count against `origin/main` (`git merge-base origin/main HEAD` =
  `2890d67a`): `git diff $BASE | grep -v '^+++ ' | grep '^+' | perl -CSD -ne 's/`[^`]*`//g;
  print if /\x{2014}/' | wc -l` reads `0`.

## Commits

- `4ed0f7db` gate-split: qualify prime.mjs FULL/SAMPLED comments, cut ci.yml sequencing
  note (#713 U7)
- `587ff627` gate-split: pin shipping-changes CI figure, fix handoff quotes and bold
  labels (#713 U7)

Head: `587ff627`.
