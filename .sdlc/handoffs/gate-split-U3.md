---
kind: handoff
plan: gate-split
unit: U3
branch: unit/gs-U3
written: 2026-09-20
pass: 1
---

# Handoff U3 (`anchor.mjs`) . builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/gs-U3 @ 4a58ae28710d0bd1cd5a1ead8c1e28c6bb62a717 |
| Files | test/engine/anchor.mjs |
| Ran | `npm test` 50/50 pass, exit 0, tree byte-stable after (re-run after the P8 fix below); `node test/engine/anchor.mjs` (SAMPLED) exit 0; `npm run -s gate:corpus-anchor` (FULL) exit 0 |
| Left out | none |

## Correction: P8/P9 diff base is `ebddc55d`, not `git merge-base origin/main HEAD`

Caught mid-pass, before commit, by running P8 for real. G0 was waived for this whole tree since `#681` has not landed on `origin/main`, so `git merge-base origin/main HEAD` sits before `#681` and the diff against it treats the entire pre-existing `anchor.mjs` (all of `#681`'s own prose, which already uses em dashes throughout) as "added." First run against that wrong base read 56 em-dash hits outside backticks. Against `ebddc55d` (this unit's own base, named in the brief) the same sweep on my own commit read 11 real hits, all mine: nine plain comments plus two double-quoted `FAIL(...)` strings whose only backtick span was a short inline `` `.vol` `` in the middle, not the whole message. Fixed all 11 (em dash to plain hyphen) and amended the one unreviewed commit rather than stacking a fixup, since nothing had reviewed it yet. Re-ran `node test/repo/branding.mjs`, both `anchor.mjs` legs, and `npm test` after the fix; all still green (rows below). P9 (scope wall) re-run against `ebddc55d` too: `git diff --name-only ebddc55d` -> `test/engine/anchor.mjs` only; `git diff --name-only ebddc55d -- src | wc -l` -> `0`. Naming this per the team-lead's note; not amending the plan's P8/P9 command cells myself.

This handoff itself is also written with no em dash on any line, since `branding.mjs` scans `.sdlc/` too.

## G0, as waived

`git cat-file -e plan/gate-split:test/engine/anchor.mjs; echo $?` -> `0`. Merge commit named in the unit brief: `ebddc55dfdc7497a7f4e438692ca8cadbc611892` (`sdlc(gate-split): merge plan/preset-intent-fidelity @ a2bb3c84, the #681 tree U2 to U5 build on (#713)`). Worktree cut at that head; branch `unit/gs-U3`.

## Re-observed counts at G0, before editing (pre-edit `node test/engine/anchor.mjs`, unsplit file)

No drift from the plan's 36ce7777 measurement: every needle and count below is unchanged.

- 19 `pass` lines, 0 `FAIL` lines, exit 0.
- `anchor-identity: 3380 exact, 0 off`; corpus loaded 3780 palettes (no FAIL, i.e. `corpus.length === 3780`); `controlSubjects.length === 3796` (`prime-identity-control: 0 exact, 3796 off`).
- `anchor-ladder order-allow-list: 26 (expected 26)`, `dupe-allow-list: 3 (expected 3)`.
- `anchor-ramp allow-list` (window-clamp) `10 (expected 10)`; `gap (19-stop) allow-list` `72 (expected 72)`; `distinct (25-stop) allow-list` `16 (expected 16)`; `notch allow-list` `15 (expected 15)`; `lone-spike allow-list` `64 (expected 64)`.
- PASS line carries `gap-19 (72), distinct-25 (16) and notch (15` verbatim.

No table cell in the plan or the unit brief needs amending.

## Design: FULL/SAMPLED split implemented

`corpus`/`presetsByCat` build from `byCategory` either by loading every category verbatim (`FULL`) or by calling the shared `sampleCorpus(byCategory)` (`test/engine/lib/corpus-sample.mjs`, SAMPLED, default). `controlSubjects` and `hueSpaceBoundSubjects` derive from `corpus`/`presetsByCat`, so they sample automatically; the 16-palette default kit stays full in both modes wherever it already was (F4_CASES, the hueSpace-bound loop's own default-kit-only bound, the default-kit lone-spike finding).

Vacuity: `corpus.length !== 3780` and `controlSubjects.length !== 3796` are now FULL-only exact checks. SAMPLED asserts `presetsByCat.length >= 30` (documents) and `controlSubjects.length >= 46` (30-document floor plus 16 default-kit palettes; no plan-pinned number existed for this one, flagged below). `anchored.length` keeps its FULL exact assertion (3380, "report this line, do not force the number") and gets a SAMPLED floor of "not zero" only, since the plan gave no other target for the anchored-subset count.

Per-category presence (note from the U1 verdict, folded in here as the first #713 unit whose file calls `sampleCorpus` for real): SAMPLED now asserts every gallery category (all of `CATS` but `brands`) contributed at least one document, with an in-file negative control on a synthetic two-category input proving `sampleCorpus` really does drop a category whose presets carry no `.vol`.

Pinned lists: `ORDER_ALLOW`/`DUPE_ALLOW` (anchor-ladder) plus the five allow-lists the unit brief names (window-clamp, gap-19, distinct-25, notch, lone-spike) all route through one new `allowListOk(measuredSorted, allow)`. FULL delegates to the existing `allowListMatches` (exact); SAMPLED is a subset test, no unlisted member, and a listed member the sample does not reach is not a failure. The R10 exact-match negative controls (`dropCheck`/`swapCheck`) are now FULL-only, since dropping or swapping the tail of a list a 10 percent sample mostly does not observe anyway proves nothing about subset semantics either way; the subset half is graded below (U3-4) against a real allow-list mutation instead of an in-file control.

Mode line, printed just before the PASS line (same placement `curated-contrast.mjs` uses, before the `fails.length` check so it always prints): `(FULL: 343 curated documents, 3780 palettes)` / `(SAMPLED seed 0: 35 curated documents, 392 palettes)`.

## Corrections (flagged for the reviewer)

1. **`anchor-ladder`'s `ORDER_ALLOW`/`DUPE_ALLOW` were not named in the unit brief's list of five allow-lists**, but they read exactly the same way: frozen names, compared by `allowListMatches`, driven by the same mode-aware `corpus`/`anchored`. Leaving them FULL-exact-only would fail `npm test` on every SAMPLED run (a 10 percent sample essentially never observes all 26 `ORDER_ALLOW` names), which would make U3-2 unsatisfiable. I extended the same FULL-exact/SAMPLED-subset treatment to them under the design section's general "pinned lists read two ways" rule. Verified: SAMPLED `node test/engine/anchor.mjs` now passes with `order-allow-list: 4 (expected at most 26 ...)` / `dupe-allow-list: 0 (expected at most 3 ...)`.
2. **`controlSubjects`'s SAMPLED floor (46) and `anchored.length`'s SAMPLED floor (not zero) are my own numbers**, not plan-pinned ones. The plan only pins a 30-document floor and the two FULL-exact counts (3780, 3796). 46 equals the 30-document floor plus the fixed 16-palette default kit, a lower bound assuming at least one palette per document (true in practice). `anchored.length`'s SAMPLED check is deliberately loose (only guards the degenerate empty case) because I found no plan-given target for the anchored-subset count under SAMPLED.
3. **The R10 negative controls (`dropCheck`/`swapCheck`) are now gated to FULL only.** They still run identically to before under `--full`; under SAMPLED they are skipped rather than made mode-aware, because, per point 1's reasoning, they test discrimination properties that only apply to exact-match semantics.

## U3-1 (FULL is the old file), after editing

`npm run -s gate:corpus-anchor > log 2>&1; echo exit; grep -c '^  pass  '; grep -c '^  FAIL'; grep -c '(FULL: 343 curated documents, 3780 palettes)'; grep -c 'gap-19 (72), distinct-25 (16) and notch (15'`

`exit 0`, `19`, `0`, `1`, `1`. 🟢

## U3-2 (SAMPLED is green and says so)

`node test/engine/anchor.mjs > log 2>&1; echo exit; grep -c '(SAMPLED seed 0: 35 curated documents, 392 palettes)'; grep -c '^  FAIL'`

`exit 0`, `1`, `0`. 🟢

## U3-3 (broad regression caught by the sample; sparse one recorded)

All three run in their own throwaway clone (M-A / M-C / M-E applied to `src/engine/tonal.js`, `git diff --stat` confirmed `1 file changed, 1 insertion(+), 1 deletion(-)` for each before running), plain `node test/engine/anchor.mjs` (SAMPLED):

- M-A: `exit 1`; `grep 'FAIL' log | grep -c 'lone-spike allow-list'` -> `1` (`anchor-ramp lone-spike allow-list ...: 139 (expected at most 64 ...)`). 🟢
- M-E: `exit 1`; `grep 'FAIL' log | grep -c 'hueSpace-perceptual-bound'` -> `1` (its worst witness is the always-present default kit, as the plan predicts). 🟢
- M-C: recorded, not graded. `exit 1` (`anchor-ramp monotone: 3 (expected 0 ...)`). Unlike tonal's dip gate, `anchor.mjs`'s monotone check also runs unconditionally over the always-full 16-palette default kit, so M-C (which disables `enforceMonotonePixelL` outright) is visible there too. The sample catching it is not a contradiction of "sparse regression, canary not guaranteed," just this particular sparse mutation having a witness inside the part of the file that is never sampled down.

## U3-4 (subset semantics, both halves, on `gap-19`)

Sampled run observed (instrumented once, in a throwaway clone, to find a real member; the printed allow-list dump is always the full canonical list, not what was measured): `brands "Burger King · The Flame Identity · 2021 rebrand" tertiary-muted #F5EBDC` was one of the 8 gap-19 names this seed's SAMPLED run actually sees.

(a) Deleted that one line from `RAMP_GAP_ALLOW` in a clone, ran `node test/engine/anchor.mjs`: `exit 1`, with `gap allow-list: unexpected member, brands "Burger King · The Flame Identity · 2021 rebrand" tertiary-muted #F5EBDC` in the log (quoted with its own punctuation, not the literal FAIL-line dash). 🟢 (matches the plan's "the deleted name in an unlisted-dip line," anchor's own wording is "unexpected member")

(b) Added the fictitious name `` `zz-not-in-corpus|primary|500` `` to `RAMP_GAP_ALLOW` in a fresh clone: SAMPLED `node test/engine/anchor.mjs` -> `exit 0`. FULL `npm run -s gate:corpus-anchor` -> `exit 1`, with `gap allow-list: expected member missing, zz-not-in-corpus|primary|500` in the log. 🟢 (plan's illustrative wording is "were not observed"; `anchor.mjs`'s own established allow-list phrasing across every gate in this file is "expected member missing," semantically the same claim, cited here since the literal string differs)

## U3-5 (the file's own share), loud host, graded 🟡

Quiet-host rule not met (host loaded 8 to 9 times the 10-core count for the whole build). Recorded honestly, not waited on:

```
sysctl -n hw.ncpu -> 10
before: 86.76 156.18 124.46
/usr/bin/time -p node test/engine/anchor.mjs  -> exit 0, 19 pass, 0 FAIL
real 32.82
user 28.82
sys 0.59
after: 77.27 147.39 122.38
```

Target is at or under 15 s quiet; today's row (loud, load about 87 to 156 against 10 cores) reads 32.82 s. 🟡, not 🔴, per the plan's own timing-row rule. For comparison, the pre-edit FULL baseline (also loud, load about 164 peak) measured 390.15 s real, and the post-edit FULL run (host settled to load about 27 to 98) measured 245.61 s real, both far off Lane A's quiet 80.0 s, consistent with this host's contention throughout the pass, not a regression introduced by the split.

## `gate:corpus-anchor` at head

`npm run -s gate:corpus-anchor` exits **0** (the FULL leg re-run above, U3-1). This is the leg named as red in the `sweeps` CI job description; after this unit it is green.

## P8 (branding, no em dash on an added line)

`node test/repo/branding.mjs | tail -1` -> `branding: clean (515 files scanned)`. `git diff ebddc55d -- test/engine/anchor.mjs | grep -v '^+++ ' | grep '^+' | perl -CSD -ne 's/\`[^\`]*\`//g; print if /\x{2014}/' | wc -l` -> `0` (see the Correction section above: `ebddc55d` is the base, not `git merge-base origin/main HEAD`).

## P9 (scope wall)

`git diff --name-only ebddc55d` -> `test/engine/anchor.mjs` (plus this handoff, once committed, under `.sdlc/`), both inside the plan's allowed paths. `git diff --name-only ebddc55d -- src | wc -l` -> `0`. Nothing under `src/` touched.

## Clones

Throwaway clones under this seat's own scratchpad, all `git clone -q --shared`, never a unit-worktree mutation:
`gsU3neg/neg` (P3 real leg plus U3-3 gap-19 instrumentation, reverted before use), `gsU3neg/p3ctl` (P3 controls a/b/c), `gsU3neg/p5row2-ma`, `gsU3neg/p5row5-mc`, `gsU3neg/p5row7-me` (M-A/M-C/M-E, both the FULL P5 leg and the SAMPLED U3-3 leg), `gsU3neg/u34` and `gsU3neg/u34b` (U3-4 (a) and (b)). Left in place per the session's `rm -rf` restriction; named here for cleanup.

## P5 (rows 2, 5, 7, anchor's own rows)

| row | mutation | command | needle | exit | count |
|---|---|---|---|---|---|
| 2 | M-A | `npm run -s gate:corpus-anchor` | `lone-spike allow-list` (FAIL-filtered) | 1 | 1 |
| 5 | M-C | `npm run -s gate:corpus-anchor` | `anchor-ramp monotone:` (FAIL-filtered) | 1 | 1 |
| 7 | M-E | `npm run -s gate:corpus-anchor` | `hueSpace-perceptual-bound` (FAIL-filtered) | 1 | 1 |

Exact FAIL lines: row 2 `anchor-ramp lone-spike allow-list ...: 1709 (expected 64)`; row 5 `anchor-ramp monotone: 13 (expected 0 ...)`; row 7 `anchor-f4 hueSpace-perceptual-bound: ... max OKLab dE 0.0308 (want <= 0.01 ...)` and the paired `hueSpace-peak-bound` line at `0.0310`, both matching the plan's mutation table exactly. All three `git diff --stat -- src/engine/tonal.js` read `1 file changed, 1 insertion(+), 1 deletion(-)` before running.

P3 (own gate only, per the common brief): real leg `exit 0`, mode-line-or-determinism-line count `1`. Control (a) (drop ` --full` from the script) `exit 0`, count `0`. Control (b) (force `process.argv.includes("--full")` to `false`) `exit 0`, count `0`. Control (c): force the FULL branch to also take the sampled list. My substitution point is an `if (FULL) {...} else {...}` block, not the design's illustrative `FULL ? all : sampleCorpus(...)` ternary, so I mutated `if (FULL) {` to `if (false) {` on the corpus-loading block specifically, confirmed a single-line diff against my own shipped file. Result: `exit 1`, `FAIL` count `10`, `35` count `3` (the FULL-side vacuity checks correctly name the SAMPLED size, 35, when the FULL branch is starved of the real corpus).

## npm test at head

`all 50 test files passed`, exit 0, tree byte-stable (`git status --short` empty after). N = 50 (48 at 36ce7777, plus U1's `engine/corpus-sample.mjs` and `engine/anchor.mjs` itself, matching the common brief's N=50 note).
