---
kind: verdict
plan: hex-oklch-dedupe
unit: U1
ticket: "#731"
branch: unit/hx-U1
base: plan/hex-oklch-dedupe @ 91ac5168
grade: verifier-l2, the evidence run dispatched by the Verifier seat, which re-read the rows marked mine
contract: P1 to P4 and U1-1 to U1-5 of .sdlc/plans/hex-oklch-dedupe.md at f972da4f, and the repo checks at the head
pass: 1
written: 2026-09-26
---

# Verdict hex-oklch-dedupe U1 · 🔴 · 9 of 9 plan rows 🟢; the baseline figure the unit moved is left stale, and the scope wall forbids the repair

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
