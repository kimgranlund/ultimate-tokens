---
kind: verdict
plan: docs-repair
unit: U3
ticket: "#751"
branch: unit/dr-U3
base: 282fca8d
grade: verifier-l1, the evidence run dispatched by the Verifier seat
pass: 1
written: 2026-09-28
---

# Verdict docs-repair U3 · 🔴 · every doc and source row is met; P3 fails on five rewritten review lines and no handoff states the count

verdict: 🔴
sha: 50a7f464c752131ab39adf88a7abbbb9be1081d9

`unit/dr-U3` at `50a7f464`, with `B` = `git merge-base origin/main 50a7f464` = `282fca8d`. Graded against plan
revision `c7eafe2d`. The evidence run (`$CLAUDE_JOB_DIR/tmp/drU3/report.md`) used throwaway clones at `50a7f464` and `B`.
I reran P3's counts in the worktree and read P3's row and the handoffs' dash lines myself. `verdict.py check` passes on
both handoffs and both review records.

## The red

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P3 | no added prose line carries U+2014 outside a code span; the raw count equals the count the handoffs state, each line listed; "a line it rewrites is [counted], so a rewritten ... line drops the glyph it carried" | 🔴 | mine: the stripped count prints `5`, not `0`; the raw non-handoff count prints `7`. Two are the old `persist.js` header quoted inside a code span, in `.sdlc/reviews/docs-repair-U3-progress.md` and review r1. The other five are reactivity review lines (`01-core-reactivity.md` finding 1, `02-sections-and-resolvers.md` B4, three in `03-stores-and-persistence.md`) whose `persist.js` cites U3 re-pointed, e.g. `:646` to `:631`. So they are rewritten lines and keep a prose glyph. No P row admits a merge-time carry or a later `--fix`. Branding is clean | the run: a glyph prose line appended to `app-shell.md` makes the stripped count `6`; a copied ADR under `.sdlc/verdicts/` makes branding `FAIL: 3`, exit 1 |
| S7 | step (7): the handoff states the raw count and lists every dashed line | 🔴 | mine: `docs-repair-U3.md:24` states `0`, `0` (true at `0d1ebb55`), and `docs-repair-U3-rework.md:17` says the added-line em-dash count is `0` (true at `a18c3531`, before `0f001caa` re-pointed the five review cites). No handoff states `7` or lists the lines; only review r2 does. That is stale record text in the unit's own handoffs | at `a18c3531` the five reactivity lines are not yet in the diff, which is why the rework figure was once true |

What unblocks it: the five rewritten review lines drop the glyph (a records and docs edit, no code), and a handoff
states the new raw count at the head it names, listing each remaining dashed line word for word. "Known carry" is not
a ruling the plan makes. Only 2 of the 7 are quotes; the other 5 are rewritten prose.

## Met

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U3-1 | plan command | 🟢 | `1`, `1`, `1`, `1` | files at `B`: `0`, `0`, `0`, `1` |
| U3-2 | plan command | 🟢 | `0`, `1`, `15` | at `B`: `1`, `0`, `15` |
| U3-3 | the `mixinInto` cite lands | 🟢 | L=`2581`, no NO-CITE, `1`, `1`; line 2581 reads `mixinInto(HctApp, ColorSection, ...` | at `B`: L=`2570`, `0`, `0`, and the audit prints `NEAR ... has mixinInto (-2)` |
| U3-4 | plan command | 🟢 | `0`, `1`, `1`, `1`, `1`, `1`, `1` | at `B`: `1`, `0`, `0`, `1`, `1`, `0`, `0` |
| U3-5 | the five factory rows | 🟢 | ten `1`s, then `1`, `0` | at `B`: doc greps `0` x5, exports `1` x5, `1`, `0` |
| U3-6 | plan command | 🟢 | `0`, `1`, `0` | at `B`: `1`, `0`, `1` |
| U3-7 | plan command | 🟢 | `0`, `1`, `1`, `0`, `0` | at `B`: `1`, `0`, `0`, `1`, `2` |
| U3-8 | `docs/marketing` untouched | 🟢 | `0` | a line appended to a marketing file: `1` |
| U3-9 | the source edits are comment-only | 🟢 | P4's middle `0`; numstat `2 2 geometry.mjs`, `1 1 app.js`, `16 31 persist.js` (revision `c7eafe2d`'s figure); with full-line `//` comments and blanks stripped, all three files equal `B`'s (0 differing lines) and no `/*` block is in any hunk | `baseChroma: 100` to `101` in `persist.js`: middle `2`, and the strip diff shows one `9c9` hunk; a third comment line in `geometry.mjs`: `3 3` |
| P1 | `npm test` green, N, tree clean | 🟢 | the run: `✓ all 50 test files passed`, exit 0, `50`, `0` | `scrimX`: `✗ 1/50 test file(s) failed`, exit 1 |
| P4 | scope wall | 🟢 | `0`, `0`, `0`, `0` (revision `c7eafe2d` admits the reactivity reviews) | four planted names: `2`; a code-token edit: `2`; DD41 and DD40 edited: `2` |
| P5 | citations green and bite | 🟢 | `1`; `✓ citations: ... STALE 0 across 10 discovered docs`, exit 0 | the plan's bump of the cite to `app.js:1`: `✗ 1 citation gate failure(s)`, exit 1 |

## Met with a concern

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P2 | build green and the baseline agrees | 🟡 | the baseline leg: `stale total: 0`, and `gen:figma-ui` printed `4124.3 KB`, equal to the cell. `npm run build` (exit 0, tree clean after) is owed on a host with `node_modules`; the cell says "re-measured" but no build produced it | the cell set to `4125.3`: `STALE ui.html`, `stale total: 1` |
| P6 | plan-wide stale counts | 🟡 | `12`, `10`; U3's three hits (`11 voices`, two `5 formats` cells) are gone; the 12 left belong to U1 and U2 | at `B`: `15`, `10` |
| F3 | the `persist.js` header fold keeps the old block's content (review r2) | 🟡 | the new header drops the `serialize(state)`/`hydrate(snapshot)` contracts, the byte-for-byte round-trip sentence and the TKT-0016 pointer; its line 1 says "Hydrate a State from storage" while line 4 says no storage I/O lives here. So review r2's "no content was lost" is false. It is comment-only, with no runtime effect | the comment strip shows code equal to `B` |
| F5 | merge debt | 🟡 | a trial merge of `origin/main` conflicts in 11 files, `persist.js` and `app.js` among them; the pre-land record must re-prove P3, P4's middle, U3-3 and U3-9 on the merged tree | the aborted merge left the clone clean |
