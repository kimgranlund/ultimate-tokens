---
kind: handoff
plan: gate-split
unit: U7
branch: unit/gs-U7
written: 2026-09-24
pass: 3
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

7. `.sdlc/adapter.md` section 7's proposed `.claude/CLAUDE.md` text (commit `e330d24a`,
   team-lead follow-up). Section 1's own Gates table (line 26) and `.sdlc/baseline.md`
   (line 19) already agreed with each other: both quote `npm test`'s three quiet-host
   readings as `89.10 · 79.93 · 80.07` and the range as `80 to 89 s`, so no fix was needed
   there. Section 7's own proposal text disagreed with section 1's own table. Before:
   `npm test (no `node_modules`, ~60 s, tree clean after)` and `green CI (`build-test` +
   `panda-smoke`)`. After: `npm test (no `node_modules`, 80 to 89 s, tree clean after)`
   and `green CI (`build-test`, `panda-smoke`, `corpus-contrast`, `sweeps`)`, matching
   section 1's Gates table (`80 to 89 s`; the CI-on-a-PR row's four jobs) and the CI job
   list `.claude/CLAUDE.md` already carries. `.claude/CLAUDE.md` itself is untouched:
   its own `~60 s` line (`:95`) is a separate, owner-pending item (X9), not this file.

8. `.sdlc/adapter.md` and `.sdlc/baseline.md`, two remaining stale `56 to 60 s` `npm test`
   figures (commit `080474ac`, team-lead pass 2). Both files' own live table (section 1
   line 26 and baseline.md line 19) already agreed with each other on `89.10 · 79.93 ·
   80.07` / `80 to 89 s`; grepping both files for `~60` and `56 to 60` turned up two spots
   that had not been brought forward with that re-time. `adapter.md`'s ceiling-arithmetic
   bullet: before, `Arithmetic: main's 56 to 60 s, plus the four sampled legs at about a
   tenth of the moved cost, plus the thinned tonal grid, near 100 s with 20 s of room
   (#713 design section).` After: `Arithmetic at the time the ceiling was set (#713 design
   section, before U6c-8 re-measured it): main's then-current 56 to 60 s, plus the four
   sampled legs at about a tenth of the moved cost, plus the thinned tonal grid, projected
   near 100 s with 20 s of room. History now: the real re-time is 80 to 89 s (line 26
   above, `.sdlc/baseline.md`), comfortably inside the same 120 s ceiling.`
   `baseline.md`'s "why a ceiling was needed" sentence: before, `The `npm test` seconds in
   the live table above (56 to 60 s) were measured before #681, whose corpus sweeps are
   the cost.` After: `The `npm test` seconds the live table above showed at this section's
   own writing (56 to 60 s, since superseded by the 80 to 89 s U6c-8 re-time in that same
   table) were measured before #681, whose corpus sweeps are the cost.` Every other
   digit-plus-`s` figure found by the grep sweep sits inside the already-retired
   `Interim gate-time ceiling` / pif-u5 history section or the already-"Retired, #713 U6b"
   paragraph, both already correctly labelled as history; none needed a further fix.

9. `.sdlc/baseline.md`'s "why a ceiling was needed" sentence, reworded (commit `9202a2cb`,
   team-lead pass 3). `adapter.md:59`'s own ceiling-arithmetic bullet was confirmed fine
   as item 8 left it (it is about `main` before #681, not a claim about the live table).
   `baseline.md`'s sentence still framed the old figure as something the live table itself
   once showed, worded confusingly against a table that has since moved. Before (item 8's
   own after-text): `The `npm test` seconds the live table above showed at this section's
   own writing (56 to 60 s, since superseded by the 80 to 89 s U6c-8 re-time in that same
   table) were measured before #681, whose corpus sweeps are the cost.` After: `The
   table's pre-#681 figures, 56 to 60 s, were measured before #681, whose corpus sweeps
   are the cost; the live table above now reads 89.10, 79.93 and 80.07 s, the 80 to 89 s
   U6c-8 re-time.`

## Not this unit's

`.claude/CLAUDE.md:95`'s `~60 s` line (owner ruling, X9, pending), `test/engine/anchor.mjs`'s
two nits (`allowListOk` hoisting, `seenCats`/`brands` coverage), and every item the review
lists as correctly deferred (U6-5's `STALE head`, the `note head:` on the two main-side
files, `.sdlc/debt.md`'s K17 drift list, the `symmetry` anchored-corpus leg).

## Close-out checks

- `npm test` in a fresh clone at pass 1's head (`e330d24a`): `all 50 test files passed`,
  `git status --short` empty after. Pass 2 (`080474ac`) is records-only per the
  team-lead's ask; no `npm test` re-run for it.
- `node test/repo/branding.mjs | tail -1` at `9202a2cb`: `branding: clean (694 files
  scanned)`.
- Added-line em dash count against `origin/main` (`git merge-base origin/main HEAD` =
  `2890d67a`) at `9202a2cb`: `git diff $BASE | grep -v '^+++ ' | grep '^+' | perl -CSD -ne
  's/`[^`]*`//g; print if /\x{2014}/' | wc -l` reads `0`.

## Commits

- `4ed0f7db` gate-split: qualify prime.mjs FULL/SAMPLED comments, cut ci.yml sequencing
  note (#713 U7)
- `587ff627` gate-split: pin shipping-changes CI figure, fix handoff quotes and bold
  labels (#713 U7)
- `e330d24a` gate-split: fix adapter.md's own SDLC-proposal npm test and CI figures
  (#713 U7)
- `080474ac` gate-split: mark the two remaining stale 56-60s npm test figures as history
  (#713 U7)
- `9202a2cb` gate-split: reword baseline.md's ceiling paragraph as history (#713 U7)

Head: `9202a2cb`.
