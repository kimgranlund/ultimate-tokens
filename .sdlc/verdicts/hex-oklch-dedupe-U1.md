---
kind: verdict
plan: hex-oklch-dedupe
unit: U1
ticket: "#731"
branch: unit/hx-U1
base: plan/hex-oklch-dedupe @ 91ac5168
grade: verifier-l2, the evidence run dispatched by the Verifier seat, which re-read the rows marked mine
contract: P1 to P4 and U1-1 to U1-5 of .sdlc/plans/hex-oklch-dedupe.md at f972da4f, and the repo checks at the head
pass: 2
passes: 1 at f972da4f 🔴, 2 at eb5fac84 🟢
written: 2026-09-26
---

# Verdict hex-oklch-dedupe U1 · passes 1 to 2 · 🟢 at `eb5fac84`

Current finding: 🟢 at `eb5fac84`, in `## Pass 2` below. Pass 1, 🔴 at `f972da4f`, is history.

## Pass 1, at `f972da4f`: 9 of 9 plan rows 🟢; the baseline figure the unit moved is left stale, and the scope wall forbids the repair

verdict: 🔴
sha: f972da4f0517ba0abe4e44dffb550fc36c433db6

`unit/hx-U1` at `f972da4f`, which is `ac1e5e6a` plus a record-only commit (the review's last line gains
🟢). The evidence run's report is at `/tmp/v13/hx-U1-verify.md`; its clones are removed. The worktree was
only read and is clean.

## The red

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| K1 | the unit leaves no repo check red that it caused | 🔴 | mine at `f972da4f`: `STALE ui.html: baseline 4119.1 KB, tree 4116.2 KB`, `stale total: 1`, exit `1`. The unit's `model.mjs` change shrinks the bundle. `.sdlc/baseline.md:237` says the unit that makes this figure stale "repairs it in its own commit rather than leaving a red gate for a later one", but P4's scope wall admits no `.sdlc/baseline.md`, so the builder could not | the same script at the base: `stale total: 0`, exit `0` |

What unblocks: a plan revision admitting `.sdlc/baseline.md` for the one KB cell, then the figure is
measured after `origin/main` is merged in. Main now reads `4125.3 KB` and has changed `ui.html` too.

## Green

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P1 | `npm test` | 🟢 | `all 49 test files passed`, N `49`, tree `0` | `scrim` corrupted: exit `1`, `1/49 failed` |
| P2 | `npm run build` | 🟢 | exit `0`, `wrote figma/plugin/ui.html 4116.2 KB`, tree `0` | `hexToOklch` un-exported: exit `1`, `[MISSING_EXPORT]` |
| P3 | branding, no added dash | 🟢 | `branding: clean (646 files scanned)`; em and en dash added `0` | a copied `decision-records.md`: `FAIL: 3`; a prose dash line: `1` |
| P4 | scope wall | 🟢 | `0`, `0` | the three-name fixture: `2` |
| U1-1 | one conversion, the false comment gone | 🟢 | `0 1 1 1` (base `7 1 0 1`) | one comment line left behind: `1` |
| U1-2 | the anchor gate still agrees | 🟢 | exit `0`, `key-anchor` `2`, FAIL `0`, `3380 of 3380` | a `keyHex` edit: exit `1`, FAIL `2`. The plan's own `#000000` keyOklch edit stays green, so it does not discriminate here |
| U1-3 | behaviour-neutral, measured | 🟢 | the plan's probe at base and head: `3780 3380` both, `cmp 0`; the run's own bit-level probe over `3796` palettes: `cmp 0` | a coefficient edit: `differ: char 286`, `cmp 1` |
| U1-4 | the agreement assertion bites inside `npm test` | 🟢 | exit `0`, pin `1`, subjects `16` | a planted disagreement: `model FAIL (16)`; inside `npm test`: `1/49 failed`, the one failure `ui/model.mjs` |
| U1-5 | the deletion is the whole source change | 🟢 | `1 20`, `1` | one planted line: `2 20`, `2` |

## Notes

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| N1 | U1-2's written control | 🟡 | the plan's `#000000` edit to keyOklch leaves `npm test` green, so the row as written cannot red; the `keyHex` edit does | the `keyHex` run: FAIL `2` |
| N2 | the pinned pass line | 🟡 | it still prints once (`1`) when the block's assertions fail; the row reds through the exit code | the planted-failure log: pass line `1`, exit `1` |
| N3 | the handoff's Branch row | 🟡 | it names `52ad7ddc`, not the head | `git log -1` in the worktree: `f972da4f` |

verdict: 🔴
sha: f972da4f0517ba0abe4e44dffb550fc36c433db6

## Pass 2, at `eb5fac84`

verdict: 🟢
sha: eb5fac84c4b97d3794e00b2b8e3d1562dbe70948

Run by me at grade L2, in clones `/tmp/v13/hx2h-1790404244` (head) and `/tmp/v13/hx2b-1790404244` (the new
base `612650b0`, which is `origin/main` merged into the plan plus the P4 revision). Every row was
rerun on the new base, because the main merge moved code outside the unit (`16` files under `src`,
`test` and `scripts` between `f972da4f` and `eb5fac84`). The unit's own `src/ui/model.mjs` and
`test/ui/model.mjs` are the same blobs as at `f972da4f`.

The revision. P4 now admits `.sdlc/baseline.md` for the build row's KB cell and one correction
paragraph. It was written after pass 1's red and is the route that verdict named. It widens the wall
by one file for one cell, and the file carries exactly that: numstat `3 1` (the row, a blank and the
paragraph). No criterion gets weaker.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| K1 | the unit leaves no check red that it caused | 🟢 | `baseline-agrees-check.sh`: `stale total: 0`; the row reads `wrote figma/plugin/ui.html 4122.4 KB` and my build prints `wrote figma/plugin/ui.html 4122.4 KB` | the figure planted as `4122.5`: `STALE ui.html: baseline 4122.5 KB, tree 4122.4 KB`, `stale total: 1` |
| P1 | `npm test` | 🟢 | `✓ all 50 test files passed`, TESTS `50`, tree `0` | U1-4's plant below reds `test/ui/model.mjs`, a file inside `npm test` |
| P2 | `npm run build` | 🟢 | exit `0`, `wrote figma/plugin/ui.html 4122.4 KB`, tree `0` | K1's plant |
| P3 | branding, no added dash | 🟢 | `branding: clean (728 files scanned)`; added em or en dash, backticks stripped: `0` | pass 1's plants |
| P4 | scope wall, as revised | 🟢 | `0`; `.sdlc/baseline.md` numstat `3 1` | the wall without the new baseline entry would print `1` for that file |
| U1-1 | one conversion, the false comment gone | 🟢 | `0`, `1`, `1`, `1` | pass 1's control |
| U1-2 | the anchor gate agrees | 🟢 | exit `0`, `key-anchor` `2`, FAIL `0` | pass 1's `keyHex` control |
| U1-3 | behaviour-neutral on the new base | 🟢 | the plan's probe at `612650b0` and at `eb5fac84`: `3780 3380` both, `cmp 0` | the coefficient `0.4122214708` to `0.4122214709` at the head: `cmp 1` |
| U1-4 | the assertion bites | 🟢 | exit `0`, subjects `16` | `keyOklch: hexToOklch("#000000")` planted: exit `1`, FAIL `1` |
| U1-5 | the deletion is the whole source change | 🟢 | `1 20` against `612650b0` | pass 1's control |
| K2 | the other checks | 🟢 | `stale total: 0`, `range mismatches: 0`, `verdicts 145 graded 145 bad 0` | each with its figure read |

Carried, not this unit's: `doc-drift-rows` reads `bad 1` (`QUOTE DD9: not found at .claude/CLAUDE.md:95`)
and `ceiling-counts: 1 failure(s)` (`adapter pointer found`), identical at the base `612650b0`, so both
are red on main. The correction paragraph is dated `2026-09-25` though written on the 26th. Pass 1's N1
(U1-2's written control) is now noted in the handoff.

verdict: 🟢
sha: eb5fac84c4b97d3794e00b2b8e3d1562dbe70948
