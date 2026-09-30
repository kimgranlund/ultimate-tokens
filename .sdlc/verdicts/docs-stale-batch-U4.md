---
kind: verdict
plan: docs-stale-batch
unit: U4
ticket: "#779"
branch: unit/dsb-U4
base: 30f7ba10
grade: verifier-l2 (opus) per R79; the builder was builder-l2 (sonnet), so the checker sits outside the builder's family; evidence run docs-stale-batch-U4-verifier-l2-p1, spot-checked by the Verifier seat
pass: 1
written: 2026-09-30
---

# Verdict docs-stale-batch U4 · 🟡 · four comments now match their deciders with no code token moved; one new sentence reads two ways

verdict: 🟡
sha: d9de1b8244020b975cf10dcaf90b093801abbd29

Graded against `.sdlc/plans/docs-stale-batch.md` as committed on the branch; it differs from `plan/docs-stale-batch` only in the U3 tick. The unit base is `30f7ba10`. `git merge-base origin/main HEAD` is `17edb2d2`, and the two bases differ outside `.sdlc/` only in U2's `best-practices.md`, so every `src/` reading is the same at both. The code commit is `6497a7bd`, the handoff commit `d9de1b82`. Controls ran in throwaway clones, each control's first line naming its sha. I spot-checked U4-1 (`0`), U4-3 (`0` `0`) and U4-5 against `30f7ba10` (`0 0 0`) in the unit worktree myself, and `git diff 30f7ba10 6497a7bd -- src/ui/model.mjs` shows no changed non-comment line. No review record for U4 exists on the branch or in the root checkout; this verdict does not rely on one.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U4-1 | 🟢 | `grep -c 'XS/XL/2XL fall back' src/ui/model.mjs` reads `0` (seat-reproduced); `geomScale` sets `font = ovF ?? (composed != null ? composed : round(CONTROL_FONT[name] * factor))`, so the new sentence is true for `geomScale` | the base `17edb2d2` and `30f7ba10` read `2` |
| U4-2 | 🟢 | the plan probe prints `6 true false` (ANSI-wrapped under the host's `FORCE_COLOR=3`) | `const uiSteps = false &&` in `geometry.mjs` prints `6 false false` |
| U4-3 | 🟢 | `grep -c 'only when ≥1 mode'` reads `0` `0` (seat-reproduced); `typeEffectiveModes`/`geomEffectiveModes` return `STANDARD_*_RUNGS` (Tablet, Mobile) when `modes` is empty, and both mode controls bind them above the guard | the bases read `1` `1` `7` `7` |
| U4-4 | 🟢 | `t({}).length, g({}).length, t({type:{modes:[]}}).length` prints `2 2 2` | one declared mode prints `1 1` |
| U4-5 | 🟢 | the comment-stripped, blank-dropped diff reads `0 0 0` against `17edb2d2` and `30f7ba10` (seat-reproduced) | `modes.length ?` to `modes.length >= 1 ?` in `geometry.js` reads `0 0 4` |
| P1 | 🟢 | clone at `d9de1b82`, no `node_modules`: exit `0`, `✓ all 54 test files passed`, 121 s, `git status --porcelain \| wc -l` `0` | `"scrim` to `"scrimX`: `node test/engine/semantic.mjs` exit `1`, `FAIL  refs-canonical` |
| P2 | 🟢 | `em-dash: clean (1017 files scanned)`, `branding: clean (1009 files scanned)` | a U+2014 appended to the handoff: `FAIL: 1 em dashes`, exit `1` |
| P3 | 🟢 | escapes removed: `7` rows, `2 cond`, `5 ok`, `1`, `1` | needle edited to `_geomZzzModes`: `1 MISS _geomZzzModes`; `~~~sh ran` deleted: `0` |
| P4 | 🟢 | the ran block at its named head `6497a7bd` prints `SAME`, tree clean after | replayed at `17edb2d2`: `diff` exit `1` on the sha and the U4-1, U4-3 readings |
| P6 | 🟢 | `--identity-control --base 17edb2d2 \| tail -1` prints `0 differing cells` | `--perturb` prints `1 differing cells` |

## Findings

1. **🟡 One new comment sentence reads two ways.** The `geometryScale` comment in `src/ui/model.mjs` says CONTROL_FONT is the fallback "for the no-opts form, per `geomScale`". Three lines later it says the no-opts case is `geomScaleFor(doc, "base")`, which composes. The fallback sentence is true of `geomScale`'s own no-opts form, but a reader can take it as `geometryScale`'s, which does not fall back (`geometryScale({type:{bodyBase:18}})` equals the voice at every step). Naming `geomScale`'s no-opts form removes the ambiguity. The `geomScaleFor` comment's pointer "(see the tier columns in `geomModeScales`)" is true but loose.
2. **🟡 Plan lane list.** `src/ui/describe-mcp-assets.js` is in the unit diff but not in the plan's `lane:` list or U4's Steps. It is generator output, and a clean tree after `npm test` proves it regenerated rather than hand-edited.
3. **🟡 Host-dependent ran block.** The `~~~out ran` block carries ANSI codes on two lines because the host exports `FORCE_COLOR=3`. A no-color replay differs on exactly those lines. The handoff discloses this (Decision 4).
4. **Known plan wording (as in U3's verdict).** P3's literal escapes and P4's "unit head" against "named head" were graded on the faithful reading. The handoff states no numeric P3 row count; its 7 ledger rows match P3's 7.

Scratch the evidence run could not delete: `$CLAUDE_JOB_DIR/tmp/dsbu4` (clean clones).
