# Verdict gg-U2 · 🟢

| Field | Value |
|---|---|
| Unit | U2, plan `gate-gaps` revision 7 (`c442aa56`), ticket #715 |
| Graded | `unit/gg-U2` at `26940c07`, base `6456f893` |
| Where | detached scratch worktree at `26940c07` plus throwaway `git clone --shared` clones, all under this seat's scratchpad; no `node_modules` |
| Load | 1-minute 3.37 at start, 4.39 at the end (10 cores) |
| Counts | 🟢 9 · 🟡 0 · 🔴 0 (U2-1 to U2-6, U2-7 adapter half, P1, P3/P4); U2-7 P2 half and step 7 deferred to U2b, not graded; P5 pre-land only, not graded |

## Criteria

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U2-1 | head identical to itself | 🟢 | `--base HEAD`: `exit 0`, `3`, `3`, `1`, `git status` `0`. Six `0/3780` / `0/16` lines, `0 differing cells`, `real 14.52` at load 2.62 to 3.01 | My own engine plant (below) and M-F both red the same command |
| U2-2 | differ reproduces the record | 🟢 | `--base bf2aaf65`: `exit 1`, `3`, max dL* `2.5973`, `4.3631`, `0.4290` (2.60, 4.36, 0.43). Cells 52980, 52950, `37145`; kit 90, 100, 327; `143592 differing cells` | U2-1 reads `0/3780` three times on the same code |
| U2-3 | perturbed ramp reds, differ says where | 🟢 | M-F clone, diff-stat `1 file changed, 1 insertion(+), 1 deletion(-)`: `exit 1`, perceptual `0/3780`, peak `0/3780`, even `3710/3780, 53822/94500, max dL* 0.3866` | My own plant, `src/engine/tonal.js` line 814 renders stop 300 as stop 301 on the okhsl path (diff-stat 1/1/1): `exit 1`, perceptual `3424/3780 palettes, 3424/94500 cells`, peak `2553/3780, 2553/94500`, even `0/3780`, every witness `at stop 300`, `5997 differing cells`. Exactly one cell per palette at the planted stop, only in the two planted modes. Unchanged engine: U2-1 `exit 0` |
| U2-4 | stripped blind spot on record, `--authored` covers it | 🟢 | M-A clone, diff-stat 1/1/1. Stripped `exit 0`, `0 differing cells`. Authored `exit 1`: `3023/3780, 6056`, `3023/3780, 6056`, `3379/3780, 6743`, max 1.2631, 1.3402, 0.4230; kit 16/16 x3; `real 54.02` at load 4.07 to 4.79 | Unmutated authored in the worktree: `exit 0`, `0 differing cells`, `real 50.36` at load 4.79 to 4.16 |
| U2-5 | thin test registered, green, fast, not vacuous | 🟢 | `exit 0`, one `PASS:` line, `grep -c '"engine/ramp-identity.mjs"'` = `1`, `real 0.65` at load 4.55, stderr carries only `time` lines. `npm test` runs it: `▶ engine/ramp-identity.mjs pass` | `"--perturb"` to `"--perturbX"` (diff-stat 1/1/1): `exit 1`, `grep -c '^FAIL'` = `1`, `FAIL: the identity-control mode missed on: --perturb (exit 0)` |
| U2-6 | leaves nothing behind | 🟢 | Private `TMPDIR` each: green (`--base HEAD --only default-kit`) `exit 0` then `0`; red M-F run `exit 1` then `0`; `--base no-such-rev` `exit 2` then `0`; worktree `git status --short` `0` | Both `rmSync(scratch` sites replaced by `void 0;` (diff-stat `1 file changed, 2 insertions(+), 2 deletions(-)`): `exit 0`, count `1`. So the count is not vacuous |
| U2-7 (adapter half) | one `ramp-identity` row, per step 6 and ruling F3 | 🟢 | `grep -c '^\| ramp-identity \| '` = `1`. Command is the P5 command verbatim; needs git, no `node_modules`; green `0 differing cells`; declared-movement rule; triggers `src/engine/` or `src/ui/model.mjs`, `--authored` on the anchored construction, pre-land always. Times `14.63 s` and `50.38 s` match mine (`14.52`, `50.36`). Out-of-reach sentence names `src/ui/categories/*.js`, the kit list in `defaultDocument()`, all of `persist.js`, and says no other gate catches them as an identity check. Plan revision 7 row says the same | Brands hue +40 in a clone (84 hues shifted, `cmp` differs at char 1813): `--only brands --base HEAD` `exit 0`, `0/84` x3, `0 differing cells`, by design, and the handoff carries it (lines 255 to 270). `node test/engine/anchor.mjs` on that clone: `exit 0`, `PASS (SAMPLED)`, which backs the row's "no other gate" clause for the sampled leg |
| P1 | `npm test` green, count, tree stable | 🟢 | `✓ all 51 test files passed`, `TESTS` 51 (50 at `6456f893`, so N0 + 1), `git status --short` `0`, `real 128.81` loud-ish at load 4.08 to 4.46 | In the `"--perturbX"` clone, `node test/run.mjs`: `▶ engine/ramp-identity.mjs FAIL`, `✗ 1/51 test file(s) failed`, `exit 1`. The registered file reds the runner |
| P3/P4 | no em dash, no `**`, branding clean, scope wall | 🟢 | Added lines with U+2014: `0`; with `**`: `0`; `branding: clean (527 files scanned)`. Files outside the U2 wall: `0` (five files, no `src/`, no `baseline.md`) | Fixture line with U+2014 counts `1`; fixture `src/engine/hct.js` through the same wall filter counts `1` |

## The open note: 37145 against the prototype's 37146

Explained. The one cell is `music/Gospel · the church choir/tertiary` at stop 75, even mode. The base `bf2aaf65` has the pre-#686 `hct.js` memo keyed by `hue.toFixed(2) + "|" + tone.toFixed(2)`, which the head's comment (`src/engine/hct.js` lines 267 onward) documents as history-dependent. The head uses exact keys. So the base side's answer for that cell depends on what the base engine rendered before it.

| Probe (independent script, base inputs, base hydrate) | even cells |
|---|---|
| all three modes per palette, perceptual, peak, even (the script's order) | `37145` |
| even only per palette (reproduces the prototype figure; its source was not found, so its order is inferred) | `37146` |
| that one palette alone, fresh process, base or head, with or without a prior perceptual and peak render | `#FFFAF7` all four |

In the even-only sweep the warmed base cache returns `#FFFAF8` against the head's `#FFFAF7`; in the three-mode sweep it returns `#FFFAF7`. The `anchor: undefined` key and the input source (base vs head categories, base vs head hydrate) were each ruled out: 37145 either way. The differ is right for its order, and the prototype is right for its own. Neither is a bug in U2. A base older than #686 gives a sweep-order-dependent reading at the one-cell level; worth one line in the adapter row some day, not a blocker.

## Notes, not graded

| Item | Reading |
|---|---|
| P5 (pre-land only) | The adapter command at this head reads `exit 1`, `143592 differing cells`, because `git merge-base origin/main HEAD` is `3ce50daa` and #681's engine work is not on `origin/main` yet (`src` differs by 18 files). It is the same figure as U2-2. Expected until #681 lands and the plan branch takes main; the pre-land verifier reads it then |
| Step 7, U2-7 P2 half | deferred to U2b by revision 6 |
| Cleanup | clones and the scratch worktree removed by exact name after this verdict |
