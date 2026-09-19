---
kind: verdict
plan: records-refresh
unit: U2
ticket: "#691"
graded: 2026-09-19
branch: unit/rr-U2 @ 341be2a (NOT on plan/records-refresh; plan head is c3dc4bc5)
merge-base: d814500 (origin/main)
worktree: detached scratch worktree at 341be2a, removed after grading
verdict: 🟢
---

# Verdict U2 · 🟢

The C31 shape is in and every criterion I was asked to grade reproduces on my own runs. The
doc-drift sweep reproduces the claimed counts exactly. Pass 5 does not exist yet, which the plan's
own sequencing requires (the Orchestrator commits it after the U2 merge, before pre-land), so it is
an outstanding deliverable, not a U2 defect.

| Field | Value |
|---|---|
| Branch found on | `unit/rr-U2`, not `plan/records-refresh` |
| Merge base | `d814500` = the `ref` sha in `.sdlc/baseline.md` |
| Files U2 changed since its base `f857ce72` | `.sdlc/architecture.md`, `.sdlc/baseline.md`, `.sdlc/checks/doc-drift-rows-check.sh`, `.sdlc/handoffs/records-refresh-U2.md` |

## Criteria

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | §8 Doc drift present once, last, C31 section grep counts 6 | 🟢 | my run: `1`, no `NOT LAST`, `6` | appended `## 9. Notes` after §8 in the clone: prints `NOT LAST` |
| 2 | §8, rerun note, Counts bullet all name the merge base and the baseline `ref` | 🟢 | my run printed `d814500` five times | changed §8's sha to `f9e20c5` in the clone: third line prints `f9e20c5`, no longer this tree's head |
| 3 | every §8 row well-formed, quote verbatim on the cited doc line, code paths tracked, state one of three, seven seeds present | 🟢 | `sh .sdlc/checks/doc-drift-rows-check.sh` → `rows 56 drifted 11 holds 45 undetermined 0 bad 0`, `exit 0`; seed grep `7`. Reproduces the handoff's counts exactly | three separate plants in the clone: DD1 quote one char off → `QUOTE DD1: not found at .claude/CLAUDE.md:22`, `bad 1`, exit 1; untracked `src/engine/nope.mjs:3` added to DD3's code cell → `PATH DD3: src/engine/nope.mjs not tracked`, exit 1; DD5 state cell blanked → `STATE DD5`, exit 1 |
| 4 | the check script is the plan's fence byte for byte | 🟢 | `diff` empty, `same` | one space added inside `let bad = 0` in the clone: `diff` prints hunk `10c10`, `same` absent |
| 5 | rerun note once, U1's note untouched, `debt.md` untouched by U2, `architecture.md` zero deletions vs merge base | 🟢 | my run: `1`, `1`, `0`, `0`, `1`. Stronger check: `git diff f857ce72 341be2a -- .sdlc/architecture.md` has 0 deletions and U1's Staleness note paragraph is byte-identical across U2's base and head | splicing the rerun sentence into U1's paragraph in the clone: first line prints `0`. The deletion counter bites: removing pre-merge-base lines from `architecture.md` prints `6`. See the 🟡 note below on the plan's own stated control for this row |
| 6 | handoff evidence table: 18 K rows, no empty cell, measured-at line | 🟢 | my run: `18`, `0`, `1` | K7's `hits` cell blanked in the clone: `18`, `1` |
| P1 | `npm test` green with no `node_modules`, tree byte-stable | 🟢 | one run, no concurrent gates, in my scratch worktree with no `node_modules` present: `✓ all 47 test files passed`, `git status --short` `0`. `47` is the figure `baseline-agrees-check.sh` reports for both baseline and `test/run.mjs` | in the clone: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test 2>&1 \| grep -c FAIL` → `3`, the recorded count |
| P4 | branding gate clean | 🟢 | `branding: clean (450 files scanned)`, `exit 0` | run, not reported: `cp docs/reference/references/decision-records.md docs/x.md && node test/repo/branding.mjs` → `FAIL: 3 branding violation(s) across 451 files` |
| P5 | scope wall: nothing outside `.sdlc/` and `.gitignore` differs from the merge base | 🟢 | `0` | `echo "// probe" >> src/engine/tonal.js` in the clone: `1` |

## Timing

| Item | Value |
|---|---|
| `npm test` wall clock | 1:42.58 (102.6 s) |
| `time` user / system | 106.03 s user, 2.56 s system, 105% cpu |
| `uptime` before | load averages 9.49 6.42 5.25 on 10 cores |
| `uptime` after | load averages 7.79 7.21 5.73 |
| Baseline recorded range | 59 to 66 s |

102.6 s sits inside the plan's half-to-double band (29.5 to 132 s), so no 🟡 on timing. The overshoot
tracks the load, which was 9.49 on 10 cores at run start against the baseline's 3.13.

## The 18 controls, rerun

I reran 11 of the 18 at `d814500`, covering every kind the table has: plain grep (K1, K3, K11, K16),
bundled control script (K13, K14, K18), test-running (K8), build-and-write (K7), full regen chain
(K9), and tracked-file plus hook selftest (K15). K7, K9 and every plant ran in a throwaway
`--shared` clone, reset between plants; the read-only ones ran in my scratch worktree.

| K | my run at `d814500` | handoff cell | match |
|---|---|---|---|
| K1 | 0 | 0 | 🟢 |
| K3 | 0 | 0 | 🟢 |
| K7 | `node scripts/bundle.mjs` exit 0, `wrote dist/ultimate-tokens.html 3774.8 KB` | exit 0, 3774.8 KB | 🟢 |
| K8 | `semantic.mjs` exit 0, `binder.mjs` exit 0, `53 53` | both exit 0, 53 = 53 | 🟢 |
| K9 | 0 changed of 16 watched files, `git status` empty | 0, clean | 🟢 |
| K11 | jsx/tsx/vue/svelte 0, framework imports 0, `attachShadow` 0, `html:` 6+3+3 = 12 | same, 12 | 🟢 |
| K13 | 0 | 0 | 🟢 |
| K14 | 3 (`lc-applied`, `lc-ceiling`, `lc-toneline`) | 3, same three | 🟢 |
| K15 | 0, 0, no commits, selftest `PASS` | same | 🟢 |
| K16 | 0 | 0 | 🟢 |
| K18 | silent, `CUR=4`, `schema-rename v4` present | silent at 4 | 🟢 |

Plants I reran, each in the clone: K7's unregistered `src/engine/planted.mjs` imported by
`exports.js` → exit 1, `bundle.mjs preflight found 1 registry problem`, naming `import path "./planted.mjs" is not
registered in KEY`. K9's four hand-edit markers → exactly 4
`CHANGED BY REGEN` lines, one per file. Both reproduce the handoff's recorded hits.

No control printed a hit outside its recorded exceptions, confirming the handoff's "no real drift at
the head".

## DD48 to DD56 against their cited sources at `d814500`

Every quote sits on the cited line and every evidence claim checks out.

| DD | check | result |
|---|---|---|
| DD48 | `git ls-tree d814500:figma/plugin/` | exactly 3 entries, all 3 named on `README.md:118` · holds confirmed |
| DD49 | `git ls-tree d814500:figma/binder/` | 7 entries; the 5 unnamed ones are exactly `live-diff.mjs`, `migrations.mjs`, `mode-apply-plan.mjs`, `splice-utils.mjs`, `style-plan.mjs` · drifted confirmed |
| DD50 | hook file tracked; `.claude/settings.json:12` is `"command": "node .claude/hooks/git-precommit-privatedocs-guard.mjs"` | holds confirmed |
| DD51 | `test/engine/type.mjs:181` asserts `--font-display: 'Source Serif 4'` quoting; `test/engine/categories.mjs:304-307` loops `lmin`/`lmax` against `CURVE_DEFAULTS` / the spec | holds confirmed, including the lmin/lmax wording |
| DD52 | `97bc505f` is the only commit touching the file on 2026-07-31; parent 90 lines, commit 85 lines | drifted confirmed, "~70" is wrong |
| DD53 | `package.json:21` `"gen:preview"`; `scripts/gen-preview.mjs` imports `projectView` and sets `doc.toneMode = "perceptual"` | holds confirmed |
| DD54 | same script, `README.md:25` | holds confirmed |
| DD55 | `docs/site` 5 entries, `docs/lld` 2, `docs/img` 1, all tracked at `d814500` | holds confirmed |
| DD56 | `docs/tickets/` holds 31 tracked archive files from `tkt-0001.md`; ADR-017 present in `decision-records.md` | holds confirmed |

I also spot-checked three drifted rows outside the DD48-DD56 window, all confirmed: DD15
(`CATEGORY_INDEX.length` is 8 with a `brands` entry, and `src/ui/app.js:943` renders that length, so
`README.md:51`'s "7 categories" is wrong twice over), DD18 (`src/engine/type.mjs:67-69` names the
fifteen voices; README's seven include `Heading`, `UI`, `Code`, none of which is a real voice name),
and DD23 (`src/engine/derive.mjs:70` is `complete`, and `complement` appears only inside
`contrast`'s hint text).

## A control the check script does not have, run here

`doc-drift-rows-check.sh` checks that a cited code path is tracked, not that a cited line exists. I
ran that stronger check over all 56 rows: 24 `path:line` code citations, 0 untracked, 0 out of range.

## Ledger completeness

The handoff's line-coverage script, rerun verbatim by me: `README not-in-ledger: []` and
`CLAUDE not-in-ledger: []`. Empty for both files, as claimed.

## Other standing checks

| Check | Result |
|---|---|
| `test/repo/branding.mjs` | `branding: clean (450 files scanned)`, exit 0 |
| Em dash (U+2014) in lines U2 added (`git diff f857ce72 341be2a`) | 0 |
| Tree clean after `npm test` | `git status --short` → 0 |
| U1 criterion 1 after the baseline host fold | 🟢 `sh .sdlc/checks/baseline-agrees-check.sh` → seven `ok` lines, `stale total: 0`, exit 0. `host:` now reads `Node 24.18` and `node -v` in this worktree is `v24.18.0` |

The 5 arrow characters in U2's added lines are all inside verbatim doc quotes (`90→~70 lines` and
similar), not U2's own prose.

## 🟡 Notes, none blocking the U2 merge

| # | Note |
|---|---|
| 1 | Pass 5 does not exist in `.sdlc/verdicts/architecture.md` at `341be2a`: `grep -c '^## Pass 5'` → `0`, K-row count `0`. The file has passes 1, 3 and 4 only. This is the plan's own sequencing (the Orchestrator commits pass 5 on `plan/records-refresh` after the U2 merge and before pre-land), so it is not a U2 defect, but the C31 shape is not closed and criteria 7 and 8 are not gradeable until it lands. I hold reusable evidence for 11 of the 18 K rows from this grading. |
| 2 | Criterion 5's stated negative control is unsound as written. "A copy with one word of U1's note changed prints `1` on the third line" cannot happen: U1's note is itself an added line against the merge base, so editing it yields a changed addition and no deletion. I measured it twice (a reworded note prints `0`) and substituted a control that does bite (removing pre-merge-base lines prints `6`) plus a direct diff proving U1's note is byte-identical across U2's base and head. Plan-text defect, worth fixing before the next plan copies the pattern. |
| 3 | U2 changed `.sdlc/baseline.md`, a U1-owned file, in `341be2a` (`host:` Node 22 → 24.18). The commit body records a Conductor ruling to fold the fix here rather than reopen U1. The path is inside the plan's scope wall, so P5 passes, but the edit sits outside U2's builder ownership row and outside every U2 criterion, so nothing in U2's own criteria table grades it. U1 criterion 1 still holds after it, which I verified above. |
| 4 | `341be2a` is on `unit/rr-U2` and is not on `plan/records-refresh` (head `c3dc4bc5`). The unit is unmerged, as expected at this point. |
