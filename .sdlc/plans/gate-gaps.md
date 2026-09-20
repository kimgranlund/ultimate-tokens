---
status: proposed
ticket: #715
priority: P2
lane: color-engine
size: S + M (U1 S = 1 point, U2 M = 2; 3 points)
labels: kind:chore · size:small · lane:color-engine · P2 (as minted on #715)
written: 2026-09-20
depends: #681 landed on `origin/main` (gate G0 below decides it by command; no unit starts before it prints green)
head: 3ce50daa (`origin/main`; `plan/gate-gaps` is cut from it, local only, never pushed by the planner)
measured-at: 3921f140 (`unit/pif-u4-integration`, the head that lands as #681), in one detached scratch worktree, 2026-09-20
branch: plan/gate-gaps
inputs: ticket #715; `.sdlc/verdicts/pif-u4.md` rows 13 and 25 on `plan/preset-intent-fidelity` (aee16e2e); `.sdlc/handoffs/pif-u4.md` at 3921f140 (the two yellow-row sections); criterion C4 of `.sdlc/plans/preset-intent-fidelity.md`; `.sdlc/plans/gate-split.md` on `plan/gate-split` (#713); `.sdlc/plans/chroma-floor.md` on `plan/chroma-floor` (#701); `.sdlc/adapter.md` §1; `.sdlc/baseline.md`; `.sdlc/checks/baseline-agrees-check.sh`
---

# Close the two gate gaps #681 left: the default kit in every sweep, a ramp identity control

#681 left two yellow rows in its own verdict. Both are safe today and neither is enforced.

1. Row 25. `test/engine/anchor.mjs` runs nine named checks over rendered ramps and prime ladders. The 16-palette default kit is visited by two of them (lone-spike, and the dip gate in `tonal.mjs`). Window, gap, distinct, notch, monotone, order and dupe walk the 8 curated categories only. The kit reads 0 on all seven, so a kit regression on any of them would pass in silence.
2. Row 13. Criterion C4 promised `node scripts/report-preset-fidelity.mjs --identity-control --base <sha>`. The prime half got a gate (`prime-identity-control`). The ramp half got a hand measurement and no command. Today the flag prints the usage line and exits 2.

Two units. U1 adds the kit to the seven checks inside `anchor.mjs`. U2 builds the identity-control mode, a thin registered test so the mode cannot rot, and the two record lines that follow from it.

Three things the measurement found that the ticket did not know.

1. The kit sweep is nearly free: 48 rendered ramps and 16 ladders against the corpus's 10,140 and 3,380. So it does not need a home in a CI gate script. It runs wherever `anchor.mjs` runs, in both legs of #713's split.
2. The identity control as C4 words it (anchors stripped) is blind to the anchored path. An anchored-only mutation moves 0 of 3,780 palettes on the stripped corpus and 3,023 on the authored one. All 3,380 curated sources and the whole kit are anchored, so the mode takes an `--authored` flag. That leg costs about five times more, so it is opt-in.
3. Disabling the monotone post-pass also moves 0 stripped palettes. The perturbation this plan uses for the stripped leg is a constant on the non-anchored path, measured to move 3,710.

Scope wall. Paths this plan may change: `test/engine/anchor.mjs` (U1), `scripts/report-preset-fidelity.mjs`, `test/engine/ramp-identity.mjs` (new), `test/run.mjs` (one entry), `.sdlc/adapter.md`, `.sdlc/baseline.md` (U2), this plan, its handoffs, verdicts and questions. `src/` is untouched: no engine change, no kit retune. If a kit check reads anything but 0 at G0, the builder stops and reports; it does not add an allow-list.

Prose rules for every line this plan adds. No em dash outside an inline backtick span that quotes program output. No bold inline labels. The retired maker brand is paraphrased, never quoted. `grep -P` is absent on this host: PCRE runs through `perl`. No criterion pins a line number. Commands sit in fenced blocks, not table cells, so a pipe is always a plain pipe (the lesson of gate-split's revision 3).

Criteria ids: P rows for the plan, numbered rows per unit, cited as U1-2. G0 is the start gate.

## Measured by the planner on 2026-09-20 at 3921f140

Every "today" value below comes from this section. The host was loud throughout (1-minute load 5 to 26 on 10 cores), so every second is indicative and none is a baseline figure.

### The kit against the seven checks

Method: a probe that imports the engine and copies `monotoneOk`, `notchOk`, `gapOk19` and `distinctOk25` verbatim from `anchor.mjs`, renders `projectView(hydrate({ ...defaultDocument(), toneMode }))` in all three modes, and applies the file's own order and dupe expressions to `primeSwatches`. Counts are hits across the three modes, so 3 means one palette in every mode.

| kit as planted | window | monotone | gap | distinct | notch | order | dupe | sweep cost |
|---|---|---|---|---|---|---|---|---|
| clean | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.7 s cold, 0.15 s warm |
| K1: Neutral anchor `#050505` | 1 | 0 | 3 | 3 | 0 | 1 | 0 | |
| K2: Neutral anchor `#1E2024` | 0 | 0 | 3 | 1 | 0 | 1 | 1 | |
| K3: Data 7 anchor `#D6D5D0` | 0 | 0 | 0 | 0 | 1 | 0 | 0 | |
| K4: Neutral anchor `#101820` plus M-C | 1 | 1 | 3 | 1 | 0 | 1 | 0 | |
| Neutral anchor `#101820`, engine unmutated | 1 | 0 | 3 | 1 | 0 | 1 | 0 | |

Every one of the seven has a plant that reds it. K3 is pure: it reds notch and nothing else, which shows the checks are independent. Monotone cannot be planted through data alone, because `enforceMonotonePixelL` repairs it at construction; K4 pairs a data plant with M-C (the mutation gate-split already uses).

The edits, run from a clone's root. After each, `git diff --stat | tail -1` must read `1 file changed, 1 insertion(+), 1 deletion(-)` (verified for all four on 3921f140). If it prints nothing the needle moved, the control is void, and the builder reports that instead of a pass.

```sh
# K1
perl -pi -e 's/anchor: "#576485"/anchor: "#050505"/' src/ui/model.mjs
# K2
perl -pi -e 's/anchor: "#576485"/anchor: "#1E2024"/' src/ui/model.mjs
# K3
perl -pi -e 's/anchor: "#088585"/anchor: "#D6D5D0"/' src/ui/model.mjs
# K4, two files, one line each
perl -pi -e 's/anchor: "#576485"/anchor: "#101820"/' src/ui/model.mjs
perl -pi -e 's/^function enforceMonotonePixelL\(stopsOut\) \{/function enforceMonotonePixelL(stopsOut) { return;/' src/engine/tonal.js
```

A planted kit also reds gates that already read the kit (`anchor-f4`, the kit lone-spike finding, role-table parity in another file). That is noise here: every control below greps its own needle on a `FAIL` line and runs `anchor.mjs` alone.

### The ramp differ

Method: a prototype that loads two copies of `persist.js`, `model.mjs`, `tonal.js` and `hct.js` (the working tree, and a `git archive <rev> src` unpacked in a scratch directory), takes the base tree's 8 category files, strips `anchor` and `sourceAnchor`, and renders each palette through `paletteStops` with `rampChromaOf` on `EXPORT_STOPS` (25 stops), the call shape the script's `--envelope` mode already uses. A cell differs when the two hex strings differ.

| run | perceptual | peak | even | wall |
|---|---|---|---|---|
| base bf2aaf65 (the merge-base, pre-#681) | 3780/3780 palettes, 52980/94500 cells, max dL* 2.5973 | 3780/3780, 52950/94500, 4.3631 | 3780/3780, 37146/94500, 0.4290 | 32.2 s |
| base = the head itself | 0/3780 | 0/3780 | 0/3780 | 24.3 s |
| M-F on the head, base = unmutated head | 0/3780 | 0/3780 | 3710/3780, 53822/94500, 0.3866 | about 25 s |
| M-A on the head, stripped | 0/3780 | 0/3780 | 0/3780 | about 25 s |
| M-C on the head, stripped | 0/3780 | 0/3780 | 0/3780 | about 25 s |
| M-A on the head, authored (anchors kept) | 3023/3780, 6056/94500, 1.2631 | 3023/3780, 6056/94500, 1.3402 | 3379/3780, 6743/94500, 0.4230 | 154.7 s |
| unmutated, authored, base = the head | 0/3780 | 0/3780 | 0/3780 | 144.9 s |
| `brands` only (84 palettes), base = the head | 0/84 | 0/84 | 0/84 | 6.8 s at load 22 |

The first row reproduces the record: the handoff reads 3,780 of 3,780 per mode and max dL* 2.5961, 4.3634, 0.4289; the verifier read 2.60, 4.36, 0.43. The prototype agrees to two decimals by a different code path, so U2-2 grades two decimals and records the rest. bf2aaf65 is an ancestor of `origin/main` today, so the calibration stays runnable after #681 lands.

```sh
# M-F, the stripped-path perturbation
perl -pi -e 's/^export const EVEN_DAMP_FACTOR = 0\.25;/export const EVEN_DAMP_FACTOR = 0.3;/' src/engine/tonal.js
# M-A, the anchored-path perturbation (from gate-split)
perl -0pi -e 's/const w = t \* t \* \(3 - 2 \* t\); \/\/ smoothstep/const w = t < 0.15 ? -0.6 : t * t * (3 - 2 * t); \/\/ smoothstep/' src/engine/tonal.js
```

Each must leave `1 file changed, 1 insertion(+), 1 deletion(-)` (verified on 3921f140).

### Other facts

| Fact | Value |
|---|---|
| `node test/engine/anchor.mjs` at 3921f140 | exit 0, 19 `pass` lines, 0 lines matching the U1-1 needle, 5 lines naming `default-kit` (all lone-spike) |
| `node scripts/report-preset-fidelity.mjs --identity-control` at 3921f140 | the usage line, `exit 2` |
| `TESTS` length | 48 at 3921f140 and at 3ce50daa |
| The script in `npm test`, `package.json` or CI | not referenced. Nothing runs it, which is why U2 registers a thin test |
| G0 today | `128`, `128`, `OPEN`, `128` |

## Where each new sweep runs and what it costs

| sweep | runs in | cost | why there |
|---|---|---|---|
| U1 kit block, seven checks | `test/engine/anchor.mjs`, unconditionally. So `npm test`, and after #713 both the sampled leg and `gate:corpus-anchor --full` | 0.15 to 0.7 s | gate-split's design keeps the default kit in both modes of every file. At under a second it costs the 120 s ceiling nothing, and a kit defect is caught locally, not only in CI |
| U2 thin test `test/engine/ramp-identity.mjs` | `npm test` | two child runs over the 16-palette kit; estimated 2 to 4 s quiet (84 palettes took 6.8 s at load 22). U2-5 records the figure | proves the mode runs and its compare is live. It is not an engine-identity gate: it compares the working tree with itself |
| U2 full differ, stripped | not `npm test`, not CI (Q1). The adapter row names who runs it: builder and verifier of any unit that touches the ramp path, and pre-land always | 24 to 32 s loud | on a plan that means to move ramps, exit 1 is the expected reading, so an always-on CI leg would need a waiver mechanism. The reading goes in the verdict and is compared with what the plan declared |
| U2 full differ, `--authored` | same seats, when the unit touches the anchored construction | 145 to 155 s loud | five times the stripped cost, so never a default |

## G0: has #681 landed (every unit's step 1, and the Orchestrator's before it cuts any unit worktree)

```sh
git fetch -q origin
git cat-file -e origin/main:test/engine/anchor.mjs; echo $?
git cat-file -e origin/main:scripts/report-preset-fidelity.mjs; echo $?
gh issue view 681 --json state --jq .state
git cat-file -e plan/gate-gaps:test/engine/anchor.mjs; echo $?
```

Expected `0`, `0`, `CLOSED`, `0`. Today `128`, `128` (each with git's `fatal:` line), `OPEN`, `128`. Both files this plan edits arrive with #681, so the first two lines cannot go green early. The last line is the Orchestrator's own step: once the first three are green it rebases the one-commit plan branch onto the new `origin/main` (local and unpushed, so nothing shared is rewritten) and only then cuts unit worktrees. A builder that sees any other value stops and reports `G0 red`; it does not build against `unit/pif-u4-integration`.

At G0 the builder also observes, on the rebased branch before it edits, and cites in its handoff:

```sh
N0=$(perl -0ne 'my ($b) = /const TESTS = \[(.*?)\];/s; my @m = $b =~ /"[^"]+\.mjs"/g; print scalar(@m)' test/run.mjs); echo "N0 $N0"
node test/engine/anchor.mjs | grep -c '^  pass  '
grep -c -e '--full' test/engine/anchor.mjs
```

`N0` is 48 today and 49 if #713 landed first. The pass count is 19 today. The third figure says whether #713's split is in the file (`0` today). This plan works in either order with #713 and #701: the kit block is its own block and reads no allow-list, and whichever plan lands second rebases.

## Criteria (plan-level: each builder runs them, each verifier reruns them, pre-land runs them all)

Every negative control that edits a file runs in a throwaway clone (`git clone -q --shared . "$F/neg"`), never in a unit worktree. `F` is a directory the seat makes under its own scratchpad with a name no other seat would pick, and removes by that exact name.

| # | Criterion | Expected | Negative control | Today |
|---|---|---|---|---|
| P1 | `npm test` green with no `node_modules`, the count agrees, the tree is byte-stable | the runner's pass line naming N files, then N, then `0`. N is `N0` after U1 and `N0 + 1` after U2 | in the clone, the role-table edit below prints `exit 1` | 48 |
| P2 | the landing rule for every plan after #691: the baseline's test-file figure equals `TESTS.length`, by script, at the pre-land head | every line `ok`, `stale total: 0`, `exit 0` | in the clone, lower the baseline's test-file figure by one: `STALE tests:` and `exit 1` | green on main at 48. Goes `STALE` when U2 registers its file and stays so until U2's last step; expected on the unit branch, a blocker at pre-land |
| P3 | branding clean, and no added line carries an em dash (U+2014) outside a backtick span | `branding: clean (N files scanned)`, then `0` | in the clone, one added line with the dash: `1` | clean, `0` |
| P4 | scope wall | `0`, `0` | a fixture of three names (`.sdlc/x.md`, `test/engine/anchor.mjs`, `src/engine/hct.js`) piped through the same filter prints `1` | `0`, `0` on the plan branch |
| P5 | this plan moves no ramp, read by the tool it builds (pre-land only) | `exit 0`, `1` | U2-3 | the flag does not exist: `exit 2` |

```sh
# P1
npm test 2>&1 | tail -1
perl -0ne 'my ($b) = /const TESTS = \[(.*?)\];/s; my @m = $b =~ /"[^"]+\.mjs"/g; print scalar(@m), "\n"' test/run.mjs
git status --short | wc -l
# P1 control, in the clone
sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test > "$F/neg.log" 2>&1; echo "exit $?"
# P2
sh .sdlc/checks/baseline-agrees-check.sh; echo "exit $?"
# P3
bash -c 'set -o pipefail; node test/repo/branding.mjs | tail -1'
git diff $(git merge-base origin/main HEAD) | grep -v '^+++ ' | grep '^+' | perl -CSD -ne 's/`[^`]*`//g; print if /\x{2014}/' | wc -l
# P4
git diff --name-only $(git merge-base origin/main HEAD) | grep -v -E -e '^test/engine/(anchor|ramp-identity)\.mjs$' -e '^scripts/report-preset-fidelity\.mjs$' -e '^test/run\.mjs$' -e '^\.sdlc/' | wc -l
git diff --name-only $(git merge-base origin/main HEAD) -- src | wc -l
# P5
node scripts/report-preset-fidelity.mjs --identity-control --base $(git merge-base origin/main HEAD) > "$F/p5.log" 2>&1; echo "exit $?"
grep -c '^0 differing cells$' "$F/p5.log"
```

## Units

Grades come from the Orchestrator's table: L3 builders get reviewer-l2 and verifier-l2. Order: U1, then U2. They touch different files, but U2's last step measures the baseline on the tree with U1 merged, so U2's worktree is cut after U1 merges into `plan/gate-gaps`.

| Unit | Size | Builder | Reviewer | Verifier | Touches |
|---|---|---|---|---|---|
| U1 the default kit joins window, gap, distinct, notch, monotone, order and dupe | S | builder-l3 | reviewer-l2 | verifier-l2 | `test/engine/anchor.mjs` |
| U2 `--identity-control`, its thin test, the adapter row, the baseline figure | M | builder-l3 | reviewer-l2 | verifier-l2 | `scripts/report-preset-fidelity.mjs`, `test/engine/ramp-identity.mjs`, `test/run.mjs`, `.sdlc/adapter.md`, `.sdlc/baseline.md` |

U1 is L3, not L2, because `anchor.mjs` has a history of proxy gates that measured the wrong path and read 0: the kit block has to use the file's own predicates on the rendered path, and the review has to check that it does. U2 is L3 because it loads two engine trees in one process and must leave no trace in the tree or in the temp directory. Every unit's step 1 is G0. Every unit runs P1, P3 and P4.

### U1: the kit in the seven checks

Steps. (1) G0. (2) One new block in `anchor.mjs`, after the curated sweeps have printed. It builds the kit the way the file's lone-spike kit block does (`defaultDocument()`, `hydrate` with each of `MODES`, `projectView`), and for every anchored kit palette applies the file's own `monotoneOk` (both stop sets), `gapOk19`, `distinctOk25`, `notchOk`, the window test against `RAMP_L_MIN` and `RAMP_L_MAX`, and the order and dupe expressions the `anchor-ladder` gate uses on `primeSwatches`. No predicate is copied or rewritten; if one is scoped inside a block, the builder hoists it and says so. (3) Expected is a true 0 for each, with no allow-list. A hit is a `FAIL` that names the kit palette, its anchor and the mode. (4) Seven lines, one per check, in this shape, the count computed and never typed in:

```
  pass  anchor-ramp default-kit window: 0 (expected 0; 16 palettes, 3 modes)
  pass  anchor-ladder default-kit order: 0 (expected 0; 16 palettes)
```

`window`, `monotone`, `gap`, `distinct` and `notch` carry the `anchor-ramp` prefix; `order` and `dupe` carry `anchor-ladder`. (5) Vacuity: the block FAILs if it visited fewer palettes than `defaultDocument().palettes.length`, or fewer than 16. (6) The curated sweeps, their allow-lists and the existing kit lone-spike block are not touched: #701 owns the lone-spike lines.

| # | Criterion | Expected | Negative control | Today |
|---|---|---|---|---|
| U1-1 | the seven kit lines print, each 0, and the file is green | `exit 0`, `7`, `0` | U1-2 | `exit 0`, `0`, `0` |
| U1-2 | a planted kit defect reds each of the seven, by name | K1: `exit 1`, then `1` or more for each of `window`, `gap`, `distinct`, `order`. K2: `exit 1`, `1` or more for `dupe`. K3: `exit 1`, `1` or more for `notch`, and `0` for each of the other six. K4: `exit 1`, `1` or more for `monotone` | the unplanted run is U1-1. Each plant's `git diff --stat` line is checked first | the kit lines do not exist: every count `0`. The planner's probe read the table above |
| U1-3 | the vacuity check bites | `exit 1`, `1` or more | the edit is the control; U1-1 is its clean half | no block |
| U1-4 | the curated gates did not move | the G0 pass count plus 7, then `1` | in the clone, delete one name from `RAMP_GAP_ALLOW`: the second figure prints `0` and the file exits 1 | `19`, `1` |

```sh
# U1-1
node test/engine/anchor.mjs > "$F/a.log" 2>&1; echo "exit $?"
grep -cE '^  pass  anchor-(ramp|ladder) default-kit (window|monotone|gap|distinct|notch|order|dupe): 0 ' "$F/a.log"
grep -c '^  FAIL' "$F/a.log"
# U1-2, once per plant K1 to K4, each in its own clone, after the plant's edit and its diff-stat check
node test/engine/anchor.mjs > "$F/k.log" 2>&1; echo "exit $?"
for c in window monotone gap distinct notch order dupe; do printf "$c "; grep 'FAIL' "$F/k.log" | grep -c "default-kit $c"; done
# U1-3, in the clone: make the kit block iterate an empty list (the builder cites the one-line edit
# and its diff-stat line in the handoff), then
node test/engine/anchor.mjs > "$F/v.log" 2>&1; echo "exit $?"
grep 'FAIL' "$F/v.log" | grep -c 'default-kit'
# U1-4
grep -c '^  pass  ' "$F/a.log"
grep -c 'gap-19 (72), distinct-25 (16) and notch (15' "$F/a.log"
```

If #713 landed first, U1-1 and U1-4 run twice, once as printed and once as `npm run -s gate:corpus-anchor`, and the needle in U1-4 is the one the builder observed at G0 in each mode. The kit lines must be identical in both legs.

### U2: the identity control

Steps. (1) G0, and U1 merged. (2) `scripts/report-preset-fidelity.mjs` takes a second mode:

```
node scripts/report-preset-fidelity.mjs --identity-control (--base <rev> | --base-dir <dir>) [--authored] [--only <category>|default-kit] [--perturb]
```

`--base <rev>` unpacks `git archive <rev> src` into a fresh directory under `os.tmpdir()` whose name starts `ramp-identity-`, and removes it on every exit path. `--base-dir` reads an existing tree and needs no git. The mode imports `persist.js`, `model.mjs` and `tonal.js` from both trees. The subjects are the base tree's 8 category files plus its default kit, with `anchor` and `sourceAnchor` stripped unless `--authored`. Each palette renders in all three modes on `EXPORT_STOPS` through `paletteStops` with `rampChromaOf`, the call shape `--envelope` already uses, once per tree. A cell differs when the hex strings differ; dL* is `lstarFromRgb` of the two. A base that lacks one of those modules or exports is a usage error, exit 2, naming what is missing. (3) Output, one line per mode for the corpus and one for the kit, then the total, all computed:

```
identity perceptual: 0/3780 palettes, 0/94500 cells differ, max dL* 0.00
identity perceptual default kit: 0/16 palettes, 0/400 cells differ, max dL* 0.00
0 differing cells
```

Exit 0 only when the total is 0; otherwise 1, after up to three named witnesses per mode. The mode FAILs its own vacuity check when a full run (no `--only`) reads fewer than 3780 palettes. (4) `--perturb` flips the last hex digit of the first rendered cell on the head side before the compare. It is the script's own negative control, the same pattern as `--damp-amp`. (5) `test/engine/ramp-identity.mjs`, registered in `TESTS` (K17): runs the script three times as a child with `--base-dir .` and `--only default-kit`. Plain: exit 0 and `0 differing cells`. With `--perturb`: exit 1 and `1 differing cells`. With no base: exit 2. It prints one `PASS:` line and says in a comment that it proves the mode runs and compares, not engine identity. (6) Adapter §1 gains one gate row, `ramp-identity`: the P5 command; needs git and no `node_modules`; green is `0 differing cells`, and on a plan that declares ramp movement the per-mode lines are copied into the verdict and compared with the declaration; time stated as measured, marked loud if it was; run by the builder and verifier of any unit touching `src/engine/`, `src/ui/model.mjs`, `src/ui/persist.js` or `src/ui/categories/`, with `--authored` when the unit touches the anchored construction, and at pre-land always. (7) Last, on the tree with everything above merged: rerun `npm test` three times under the quiet-host rule and rewrite the baseline's `npm test` row and `ref`, moving the old row to a labelled prior set as the file's history section does. The quiet-host rule is gate-split's: read it from the adapter if #713 has landed, else from `.sdlc/plans/gate-split.md` on `plan/gate-split`. If no quiet slot arrives the builder says so and the step waits; it does not record a loud figure. If the three figures leave the adapter's test time range, the adapter row moves with them, because the check script compares the two.

| # | Criterion | Expected | Negative control | Today |
|---|---|---|---|---|
| U2-1 | the head is identical to itself, over everything | `exit 0`, `3`, `3`, `1`, `0` | U2-3 | `exit 2`, the usage line |
| U2-2 | the differ reproduces the record it was asked to gate, so it is not echoing constants | `exit 1`, `3`, then the three max figures `2.60`, `4.36`, `0.43` | U2-1: the same command against the head prints `0/3780` three times | the verifier's hand figures 2.60, 4.36, 0.43; the planner's prototype 2.5973, 4.3631, 0.4290 |
| U2-3 | a perturbed ramp fails the control, and the differ says where | `exit 1`; the even line reads `1` or more palettes (3710 by the prototype); the perceptual and peak lines read `0/3780` | the unperturbed run is U2-1 | prototype: `0/3780`, `0/3780`, `3710/3780` |
| U2-4 | the stripped leg's blind spot is on the record, and `--authored` covers it | stripped: `exit 0`. Authored: `exit 1`, three lines with `1` or more palettes (3023, 3023, 3379 by the prototype) | the unmutated authored run prints `0 differing cells`, `exit 0` | prototype, as the table above |
| U2-5 | the thin test is registered, green, fast, and cannot pass with a dead compare | `exit 0`, one `PASS:` line, `1`; wall time recorded with the load, graded 🟡 if over 6 s quiet | in the clone, the rename below makes the script ignore the flag: `exit 1`, `1` or more | the file does not exist |
| U2-6 | the mode leaves nothing behind | `0`, `0` | in the clone, remove the cleanup call (the builder cites the edit): the first figure prints `1` | not applicable |
| U2-7 | the records agree | one `ramp-identity` row; then P2 green | P2's control | `0`; P2 green at 48 |

```sh
# U2-1
node scripts/report-preset-fidelity.mjs --identity-control --base HEAD > "$F/i.log" 2>&1; echo "exit $?"
grep -cE '^identity (perceptual|peak|even): 0/3780 palettes' "$F/i.log"
grep -cE '^identity (perceptual|peak|even) default kit: 0/16 palettes' "$F/i.log"
grep -c '^0 differing cells$' "$F/i.log"
git status --short | wc -l
# U2-2
node scripts/report-preset-fidelity.mjs --identity-control --base bf2aaf65 > "$F/r.log" 2>&1; echo "exit $?"
grep -cE '^identity (perceptual|peak|even): 3780/3780 palettes' "$F/r.log"
grep -E '^identity (perceptual|peak|even): ' "$F/r.log" | sed 's/.*max dL\* //'
# U2-3, in the M-F clone, after the edit and its diff-stat check
node scripts/report-preset-fidelity.mjs --identity-control --base HEAD > "$F/f.log" 2>&1; echo "exit $?"
grep -E '^identity (perceptual|peak|even): ' "$F/f.log"
# U2-4, in the M-A clone
node scripts/report-preset-fidelity.mjs --identity-control --base HEAD > "$F/ma.log" 2>&1; echo "exit $?"
node scripts/report-preset-fidelity.mjs --identity-control --base HEAD --authored > "$F/mb.log" 2>&1; echo "exit $?"
grep -E '^identity (perceptual|peak|even): ' "$F/mb.log"
# U2-5
/usr/bin/time -p node test/engine/ramp-identity.mjs > "$F/t.log" 2> "$F/t.time"; echo "exit $?"
grep '^PASS:' "$F/t.log"; grep -c '"engine/ramp-identity.mjs"' test/run.mjs; grep real "$F/t.time"
# U2-5 control, in the clone
perl -pi -e 's/"--perturb"/"--perturbX"/' scripts/report-preset-fidelity.mjs
node test/engine/ramp-identity.mjs > "$F/tn.log" 2>&1; echo "exit $?"; grep -c 'FAIL' "$F/tn.log"
# U2-6, straight after U2-1 and again after U2-3's red run
ls "$(node -p 'require("os").tmpdir()')" | grep -c '^ramp-identity-'
git status --short | wc -l
# U2-7
grep -c '^| ramp-identity | ' .sdlc/adapter.md
```

In U2-3 the base is `HEAD` and the mutation is uncommitted, so the head side reads the working tree and the base side reads the commit. That is the everyday use: did what I have not committed yet move a ramp.

## Not in scope

| Item | Why | Where it goes |
|---|---|---|
| A CI leg for the identity control | Q1. A ramp-moving PR reds it by design, and nothing in CI can read a plan's declaration | owner; one matrix entry in #713's `sweeps` job if the answer is yes |
| The kit's lone-spike finding (Data 7) and the lone-spike lines | owned by #701, which makes them a true 0 | #701 |
| The kit in `tonal.mjs`'s dip gate | already swept (F2 of #681) | none |
| Any kit retune, any `src/` change | every check reads 0 today; this plan only enforces that | none planned |
| Replacing the `prime-identity-control` gate with the new mode | it is the prime half of C4, gated and ruled (Q1 of #681) | none |
| #701's `mode-isolation` fixture (its C6) | a hash of two modes on the authored path inside `npm test`. It says that something moved. This differ says which cells, by how much, in all three modes, against any base. They overlap and neither replaces the other | #701 |

## Risks

| Risk | What this plan does about it |
|---|---|
| The kit block is written against a proxy path and reads 0 for ever | it must call the file's own predicates on `projectView` output; U1-2 plants a real defect in the kit data for each of the seven, and the reviewer checks that no predicate was copied |
| #701 or #713 lands first and the same region of `anchor.mjs` moved | the kit block is its own block with no allow-list. G0 re-observes every count, every needle is text, and each plant checks its own diff-stat line |
| #681 lands with kit anchors other than `#576485` and `#088585` | the plant prints no diff-stat line, the control is void, and the builder picks the landed anchor of the same palette and cites it |
| People read the stripped identity run as proof that nothing moved | U2-4 puts the blind spot in the record, and the adapter row says when `--authored` is required |
| The thin test is taken for an engine gate | its comment and its `PASS:` line say what it proves. The adapter row is the gate |
| `git archive` is unavailable where `npm test` runs | the thin test uses `--base-dir .` and never calls git |
| No quiet slot for the baseline rerun | U2 step 7 waits and says so. P2 stays a pre-land blocker. Everything else can be verified meanwhile |

## Landing

One PR from `plan/gate-gaps` to `main`, title `test(color-engine): default kit in every anchor sweep, ramp identity control (#715)`. Draft at the first verified unit. Pre-land per adapter §2.1: P1 to P5 at the branch head, U1-1, U1-2 and U2-3 rerun by the pre-land verifier, record at `.sdlc/verdicts/gate-gaps-prepr.md` with the head sha. P2 is the post-#691 landing rule and is not waivable by a seat.

## Open questions for the owner

| # | Question | Default if unanswered |
|---|---|---|
| Q1 | Should the full identity control run in CI on every PR (one more leg, about 45 s on the runner, `fetch-depth: 0`)? | no. It is a pre-land and verifier command named in the adapter. A ramp-moving PR would red it by design |
| Q2 | Keep the `--authored` flag (one branch in the subject loader, 145 to 155 s a run)? | yes. Without it the control cannot see the anchored path, which is what every curated source and the whole kit render on |
| Q3 | Register the thin test? It raises the test-file count by one and forces a three-run baseline refresh on a quiet host | yes. Nothing else runs the script, so without it the mode can rot unseen |
