---
status: approved
ticket: #715
priority: P2
lane: color-engine
size: S + M (U1 S = 1 point, U2 M = 2; 3 points)
labels: kind:chore · size:small · lane:color-engine · P2 (as minted on #715)
written: 2026-09-20
amended: 2026-09-20 (revision 4: the recheck of de036a89 folded, 3 green, 1 yellow, 0 red; see Revisions)
depends: #681 and then #713 landed on `origin/main`, in that order (gate G0 below decides both by command; no unit starts before it prints green). #713's U6b owns the baseline figures after #681, and the records refresh that follows #713's landing on main (the repo's pattern: PRs #708, #712, #714) re-points `ref` into main's history; this plan adds only its own delta and does not wait for a clean `head` line
head: 3ce50daa (`origin/main`; `plan/gate-gaps` is cut from it, local only, never pushed by the planner)
measured-at: 3921f140 (`unit/pif-u4-integration`), in one detached scratch worktree, 2026-09-20. The review reran the cheap figures at the branch's later head 67d4df96 and they held, except `TESTS`, which reads 49 there
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
2. The identity control as C4 words it (anchors stripped) is blind to the anchored path. An anchored-only mutation moves 0 of 3,780 palettes on the stripped corpus and 3,023 on the authored one. All 3,380 curated sources and the whole kit are anchored, so the mode takes an `--authored` flag. The flag is part of this plan, not a question: U2-4 and the adapter row depend on it. That leg costs about five times more, so it is opt-in per run.
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
| `TESTS` length | 48 at 3ce50daa (`origin/main`), 49 at 67d4df96 (#681 adds `repo/gate-report.mjs`). No later count in this plan is a literal: each derives from the `N0` that G0 prints |
| `sh .sdlc/checks/baseline-agrees-check.sh` | `stale total: 0` on `origin/main`. Three stale lines at 67d4df96 (`tests` 48 against 49, `ui.html` 3780.5 against 4111.1 KB, `head`), exit 1. #713's U6b clears the first two, which is why this plan starts after #713 |
| The check's two `head` lines | one says the baseline `ref` has the same tree as HEAD outside `.sdlc/`; the other says `ref` is in `origin/main`'s history. On any branch that commits a file outside `.sdlc/`, one of the two is `STALE` whatever the seat does: leave `ref` alone and the first reds, re-point `ref` to the branch head and the second reds, because no commit in main's history can carry a plan's tree before the plan merges (the reviewer ran both in a clone). The script's own header calls a stale head line expected. So `stale total: 0` is unreachable for a code plan, and no criterion here asks for it. #709 lands first and turns the same-tree row into an uncounted `note head:` line; the ancestry row still counts |
| The script in `npm test`, `package.json` or CI | not referenced. Nothing runs it, which is why U2 registers a thin test |
| G0 today | `128`, `128`, `OPEN`, `0`, `OPEN`, `128` |

## Where each new sweep runs and what it costs

| sweep | runs in | cost | why there |
|---|---|---|---|
| U1 kit block, seven checks | `test/engine/anchor.mjs`, unconditionally. So `npm test`, and after #713 both the sampled leg and `gate:corpus-anchor --full` | 0.15 to 0.7 s | gate-split's design keeps the default kit in both modes of every file. At under a second it costs the 120 s ceiling nothing, and a kit defect is caught locally, not only in CI |
| U2 thin test `test/engine/ramp-identity.mjs` | `npm test` | two child runs over the 16-palette kit; estimated 2 to 4 s quiet (84 palettes took 6.8 s at load 22). U2-5 records the figure | proves the mode runs and its compare is live. It is not an engine-identity gate: it compares the working tree with itself |
| U2 full differ, stripped | not `npm test`, not CI (Q1). The adapter row names who runs it: builder and verifier of any unit that touches the ramp path, and pre-land always | 24 to 32 s loud | on a plan that means to move ramps, exit 1 is the expected reading, so an always-on CI leg would need a waiver mechanism. The reading goes in the verdict and is compared with what the plan declared |
| U2 full differ, `--authored` | same seats, when the unit touches the anchored construction | 145 to 155 s loud | five times the stripped cost, so never a default |

## G0: have #681 and #713 landed (every unit's step 1, and the Orchestrator's before it cuts any unit worktree)

```sh
git fetch -q origin
git cat-file -e origin/main:test/engine/anchor.mjs; echo $?
git cat-file -e origin/main:scripts/report-preset-fidelity.mjs; echo $?
gh issue view 681 --json state --jq .state
git show origin/main:package.json | grep -c '"gate:corpus-anchor"'
gh issue view 713 --json state --jq .state
git cat-file -e plan/gate-gaps:test/engine/anchor.mjs; echo $?
```

Expected `0`, `0`, `CLOSED`, `1`, `CLOSED`, `0`. Today `128`, `128` (each with git's `fatal:` line), `OPEN`, `0`, `OPEN`, `128`. Both files this plan edits arrive with #681, so the first two lines cannot go green early, and the gate script arrives with #713. The last line is the Orchestrator's own step: once the first five are green it rebases the one-commit plan branch onto the new `origin/main` (local and unpushed, so nothing shared is rewritten) and only then cuts unit worktrees. A builder that sees any other value stops and reports `G0 red`; it does not build against `unit/pif-u4-integration`.

At G0 the builder also observes, on the rebased branch before it edits, and cites in its handoff:

```sh
N0=$(perl -0ne 'my ($b) = /const TESTS = \[(.*?)\];/s; my @m = $b =~ /"[^"]+\.mjs"/g; print scalar(@m)' test/run.mjs); echo "N0 $N0"
node test/engine/anchor.mjs | grep -c '^  pass  '
npm run -s gate:corpus-anchor | grep -c '^  pass  '
npm run -s gate:corpus-anchor | grep 'gap-19 ('
sh .sdlc/checks/baseline-agrees-check.sh > "$F/b.log" 2>&1; echo "exit $?"
grep -c -E '^STALE (tests|ui\.html|time )' "$F/b.log"
grep '^STALE ' "$F/b.log" | grep -v -c '^STALE head'
grep -E '^(STALE|note|ok) +head' "$F/b.log"
```

`N0` is whatever the command prints, and every later count derives from it; this plan states no literal for it. The two pass counts (sampled leg, FULL leg) were 19 on the unsplit file. The fourth command prints the FULL leg's summary line that carries the allow-list populations: the builder cites it verbatim, and its text up to the notch count is the needle `ALLOW_NEEDLE` of U1-4, because #701 re-freezes exactly those lists and may land first. The last block is the baseline read, line-scoped. Its second and third figures must both be `0`: no `STALE` line names `tests`, `ui.html` or a `time`, and every stale line is a `head` line. The exit code and the `head` lines (the fourth command prints them, `STALE`, `note` or `ok`) are copied into the handoff and gate nothing. If either figure is not `0` the builder stops and reports `G0 red: baseline stale before this plan`, naming the lines; this plan does not repair figures it did not move. With #701 this plan works in either order: the kit block is its own block and reads no allow-list, and whichever lands second rebases.

## Criteria (plan-level: each builder runs them, each verifier reruns them, pre-land runs them all)

Every negative control that edits a file runs in a throwaway clone (`git clone -q --shared . "$F/neg"`), never in a unit worktree. A clone carries committed work only, so the builder commits its unit work before it runs any control; a control run against a clone that lacks the feature reads a clean pass and proves nothing. `F` is a directory the seat makes under its own scratchpad with a name no other seat would pick, and removes by that exact name. A timing is called quiet only under gate-split's quiet-host rule, read from adapter §1 (#713 lands it there): 1-minute load under the core count, zero processes at 50 percent CPU or more, no matching `pgrep`, read before and after the run.

Control budget. `node test/engine/anchor.mjs` unsplit took 174 s at load 22. After #713 the sampled leg is about a tenth of that and the FULL leg is not. U1-1 and U1-4 run both legs once; U1-2 and U1-3 run the sampled leg five times, which is enough because the kit is in every sample. Budget about 10 minutes loud for U1's controls and about 15 for U2's (seven full differ runs, one of them `--authored`).

| # | Criterion | Expected | Negative control | Today |
|---|---|---|---|---|
| P1 | `npm test` green with no `node_modules`, the count agrees, the tree is byte-stable | the runner's pass line naming N files, then N, then `0`. N is `N0` after U1 and `N0 + 1` after U2 | in the clone, the role-table edit below prints `exit 1` | `N0`, read at G0 |
| P2 | the landing rule for every plan after #691: the baseline's test-file figure equals `TESTS.length`, by script, at the pre-land head. Read by line, not by total | `1`, then `1` under owner ruling R53 (revision 8; `0`, then `0` before it): no `STALE` line names `tests` or `ui.html`, and the only `time` line allowed is the one `STALE time test` owner ruling R53 carries (revision 8), and every stale line is a `head` line. The exit code and the `head` lines are recorded in the verdict, not graded: `exit 1` with one stale `head` line is the normal pre-land reading of a code plan | in the clone, lower the baseline's test-file figure by one: the first figure prints `1` and so does the second | both `0` on main. The `tests` line goes `STALE` when U2 registers its file and stays so until U2's last step; expected on the unit branch, a blocker at pre-land |
| P3 | branding clean, and no added line carries an em dash (U+2014) outside a backtick span | `branding: clean (N files scanned)`, then `0` | in the clone, one added line with the dash: `1` | clean, `0` |
| P4 | scope wall | `0`, `0` | a fixture of three names (`.sdlc/x.md`, `test/engine/anchor.mjs`, `src/engine/hct.js`) piped through the same filter prints `1` | `0`, `0` on the plan branch |
| P5 | the mode runs end to end at the pre-land head against the merge-base and reads clean (pre-land only). It cannot red on ramps here, because P4 already proves no `src/` file moved; what it proves is that the shipped mode works on the landing tree. The stripped leg suffices for the same reason, so the 150 s `--authored` leg is not run here; U2-4 exercises it | `exit 0`, `1` | U2-3 | the flag does not exist: `exit 2` |

```sh
# P1
npm test 2>&1 | tail -1
perl -0ne 'my ($b) = /const TESTS = \[(.*?)\];/s; my @m = $b =~ /"[^"]+\.mjs"/g; print scalar(@m), "\n"' test/run.mjs
git status --short | wc -l
# P1 control, in the clone
sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test > "$F/neg.log" 2>&1; echo "exit $?"
# P2
sh .sdlc/checks/baseline-agrees-check.sh > "$F/b.log" 2>&1; echo "exit $?"
grep -c -E '^STALE (tests|ui\.html|time )' "$F/b.log"
grep '^STALE ' "$F/b.log" | grep -v -c '^STALE head'
grep -E '^(STALE|note|ok) +head' "$F/b.log"
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

Checklist (the Orchestrator ticks it; the sections below carry the detail):

- [x] U1 (S) the default kit joins the seven `anchor.mjs` checks · builder-l3 · reviewer-l2 · verifier-l2
- [x] U2 (M) `--identity-control` and `--authored` in `report-preset-fidelity.mjs`, the thin registered test, the adapter row · builder-l3 · reviewer-l2 · verifier-l2
- [x] U2b (S) U2 step 7, the baseline `npm test` row, and U2-7's P2 half, after #713 U6b lands and merges into `plan/gate-gaps` (revision 6) · builder-l3 · reviewer-l2 · verifier-l2

Grades come from the Orchestrator's table: L3 builders get reviewer-l2 and verifier-l2. Order: U1, then U2. They touch different files, but U2's last step measures the baseline on the tree with U1 merged, so U2's worktree is cut after U1 merges into `plan/gate-gaps`.

| Unit | Size | Builder | Reviewer | Verifier | Touches |
|---|---|---|---|---|---|
| U1 the default kit joins window, gap, distinct, notch, monotone, order and dupe | S | builder-l3 | reviewer-l2 | verifier-l2 | `test/engine/anchor.mjs` |
| U2 `--identity-control`, its thin test, the adapter row, the baseline figure | M | builder-l3 | reviewer-l2 | verifier-l2 | `scripts/report-preset-fidelity.mjs`, `test/engine/ramp-identity.mjs`, `test/run.mjs`, `.sdlc/adapter.md`, `.sdlc/baseline.md` |

U1 is L3, not L2, because `anchor.mjs` has a history of proxy gates that measured the wrong path and read 0: the kit block has to use the file's own predicates on the rendered path, and the review has to check that it does. U2 is L3 because it loads two engine trees in one process and must leave no trace in the tree or in the temp directory. Every unit's step 1 is G0. Every unit runs P1, P3 and P4.

### U1: the kit in the seven checks

Steps. (1) G0. (2) One new block in `anchor.mjs`, after the curated sweeps have printed. It builds the kit the way the file's lone-spike kit block does (`defaultDocument()`, `hydrate` with each of `MODES`, `projectView`), and for every anchored kit palette applies the file's own `monotoneOk` (both stop sets), `gapOk19`, `distinctOk25`, `notchOk`, the window test against `RAMP_L_MIN` and `RAMP_L_MAX`, and the order and dupe expressions the `anchor-ladder` gate uses on `primeSwatches`. No predicate is copied or rewritten (all of them, and `MODES`, `RAMP_L_MIN` and `RAMP_L_MAX`, are top level in the file today). (3) Expected is a true 0 for each, with no allow-list. A hit prints a `FAIL` line whose message opens with the same `default-kit <check>:` token the pass line carries, then the palette, its anchor and the mode, so U1-1's pass needle and U1-2's fail needle are one token:

```
  FAIL  anchor-ramp default-kit window: Neutral #050505 [perceptual] L* 1.37 outside [9.95, 95.05]
```

If the file's `FAIL()` helper prints a different prefix, the builder keeps the helper and still opens the message with `default-kit <check>:`; U1-2 greps only that token on a line containing `FAIL`. (4) Seven lines, one per check, in this shape, the count computed and never typed in:

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
| U1-4 | the curated gates did not move, in both legs | per leg: that leg's G0 pass count plus 7, then `1` for the FULL leg's `ALLOW_NEEDLE` | in the clone, delete one name from `RAMP_GAP_ALLOW` (check the diff-stat line): the FULL leg's needle count prints `0` and the leg exits 1 | `19`, and `1` for the unsplit file's needle `gap-19 (72), distinct-25 (16) and notch (15` |

```sh
# U1-1
node test/engine/anchor.mjs > "$F/a.log" 2>&1; echo "exit $?"
grep -cE '^  pass  anchor-(ramp|ladder) default-kit (window|monotone|gap|distinct|notch|order|dupe): 0 ' "$F/a.log"
grep -c '^  FAIL' "$F/a.log"
# U1-2, once per plant K1 to K4, each in its own clone, after the plant's edit and its diff-stat check
node test/engine/anchor.mjs > "$F/k.log" 2>&1; echo "exit $?"
for c in window monotone gap distinct notch order dupe; do printf '%s ' "$c"; grep 'FAIL' "$F/k.log" | grep -c "default-kit $c:"; done
# U1-3, in the clone: make the kit block iterate an empty list (the builder cites the one-line edit
# and its diff-stat line in the handoff), then
node test/engine/anchor.mjs > "$F/v.log" 2>&1; echo "exit $?"
grep 'FAIL' "$F/v.log" | grep -c 'default-kit'
# U1-4, ALLOW_NEEDLE set by the builder to the text it cited at G0, as a fixed string
grep -c '^  pass  ' "$F/a.log"
npm run -s gate:corpus-anchor > "$F/af.log" 2>&1; echo "exit $?"
grep -c '^  pass  ' "$F/af.log"
grep -cF "$ALLOW_NEEDLE" "$F/af.log"
grep -E '^  pass  anchor-(ramp|ladder) default-kit ' "$F/a.log" > "$F/kit-s.txt"; grep -E '^  pass  anchor-(ramp|ladder) default-kit ' "$F/af.log" > "$F/kit-f.txt"; cmp "$F/kit-s.txt" "$F/kit-f.txt"; echo "cmp $?"
```

U1-1 also runs once as `npm run -s gate:corpus-anchor`, same three figures. The last line of U1-4 prints `cmp 0`: the seven kit lines are identical in the sampled and the FULL leg.

### U2: the identity control

Steps. (1) G0, and U1 merged. (2) `scripts/report-preset-fidelity.mjs` takes a second mode:

```
node scripts/report-preset-fidelity.mjs --identity-control (--base <rev> | --base-dir <dir>) [--authored] [--only <category>|default-kit] [--perturb]
```

`--base <rev>` unpacks `git archive <rev> src` into a fresh `fs.mkdtempSync` directory under `os.tmpdir()` whose name starts `ramp-identity-`, and removes it on every exit path. `os.tmpdir()` honours `TMPDIR`, which is how U2-6 gives the run a directory no other seat shares. `--base-dir` reads an existing tree and needs no git. The mode imports `persist.js`, `model.mjs` and `tonal.js` from both trees. The subjects are the base tree's 8 category files plus its default kit, with `anchor` and `sourceAnchor` stripped unless `--authored`. Each palette renders in all three modes on `EXPORT_STOPS` through `paletteStops` with `rampChromaOf`, the call shape `--envelope` already uses, once per tree. A cell differs when the hex strings differ; dL* is `lstarFromRgb` of the two. A base that lacks one of those modules or exports is a usage error, exit 2, naming what is missing. (3) Output, one line per mode for the corpus and one for the kit, then the total, all computed:

```
identity perceptual: 0/3780 palettes, 0/94500 cells differ, max dL* 0.00
identity perceptual default kit: 0/16 palettes, 0/400 cells differ, max dL* 0.00
0 differing cells
```

Exit 0 only when the total is 0; otherwise 1, after up to three named witnesses per mode. The mode counts the palettes it loaded from the base tree's category files and FAILs its own vacuity check when the number it rendered differs from the number it loaded, or when a full run (no `--only`) loaded none. It carries no corpus literal: `3780` in the criteria below is today's value, not a constant in shipped code. (4) `--perturb` flips the last hex digit of the first rendered cell on the head side before the compare. It is the script's own negative control, the same pattern as `--damp-amp`. (5) `test/engine/ramp-identity.mjs`, registered in `TESTS` (K17): runs the script three times as a child with `--base-dir .` and `--only default-kit`. Plain: exit 0 and `0 differing cells`. With `--perturb`: exit 1 and `1 differing cells`. With no base: exit 2. It prints one `PASS:` line on success; on any miss it prints a line that opens with `FAIL` and says which of the three runs missed, and exits 1. A comment says it proves the mode runs and compares, not engine identity. (6) Adapter §1 gains one gate row, `ramp-identity`: the P5 command; needs git and no `node_modules`; green is `0 differing cells`, and on a plan that declares ramp movement the per-mode lines are copied into the verdict and compared with the declaration; time stated as measured, marked loud if it was; run by the builder and verifier of any unit touching `src/engine/`, `src/ui/model.mjs`, `src/ui/persist.js` or `src/ui/categories/`, with `--authored` when the unit touches the anchored construction, and at pre-land always. (7) Last, on the tree with everything above merged, this plan's own baseline delta and nothing more, since G0 proved the baseline clean before the plan started: rerun `npm test` three times under the quiet-host rule (under #713's 120 s ceiling that is about 5 minutes of quiet host), rewrite the baseline's `npm test` row (three figures, N), and re-read the `ui.html` KB figure from the tree at that head (a no-op if the check already prints `ok` for it). The old row moves to a labelled prior set as the file's history section does. The step leaves `ref` alone. A pre-land head sha dies in the squash, so writing it would leave main with a `ref` in nobody's history. With `ref` untouched the same-tree `head` line reads `STALE` (or `note head:` after #709) from U1's first commit onward, which the script's header calls expected, and the next records plan re-points `ref` on main, as #708 did. The handoff records the head the three runs were taken at. P2 reads the check by line for that reason. The gate-script rows are not rerun: this plan adds under a second to `gate:corpus-anchor` and touches no other gate. If no quiet slot arrives the builder says so and the step waits; it does not record a loud figure. If the three figures leave the adapter's test time range, the adapter row moves with them, because the check script compares the two.

| # | Criterion | Expected | Negative control | Today |
|---|---|---|---|---|
| U2-1 | the head is identical to itself, over everything | `exit 0`, `3`, `3`, `1`, `0` | U2-3 | `exit 2`, the usage line |
| U2-2 | the differ reproduces the record it was asked to gate, so it is not echoing constants | `exit 1`, `3`, then the three max figures `2.1736`, `4.3631`, `0.4290` (revision 8) | U2-1: the same command against the head prints `0/3780` three times | the verifier's hand figures 2.60, 4.36, 0.43; the planner's prototype 2.5973, 4.3631, 0.4290 |
| U2-3 | a perturbed ramp fails the control, and the differ says where | `exit 1`; the even line reads `1` or more palettes (3710 by the prototype); the perceptual and peak lines read `0/3780` | the unperturbed run is U2-1 | prototype: `0/3780`, `0/3780`, `3710/3780` |
| U2-4 | the stripped leg's blind spot is on the record, and `--authored` covers it | stripped: `exit 0`. Authored: `exit 1`, three lines with `1` or more palettes (3023, 3023, 3379 by the prototype) | the unmutated authored run prints `0 differing cells`, `exit 0` | prototype, as the table above |
| U2-5 | the thin test is registered, green, fast, and cannot pass with a dead compare | `exit 0`, one `PASS:` line, `1`; wall time recorded with the quiet-host readings before and after, graded 🟡 if over 6 s on a run that meets the rule, and recorded without a grade on a loud one | in the clone, the rename below makes the script ignore the flag. Its diff-stat line must read `1 file changed` with at least one insertion and one deletion; if it prints nothing, the builder's quote style differs, the control is void, and the builder adapts the needle and cites it. Then `exit 1`, `1` or more | the file does not exist |
| U2-6 | the mode leaves nothing behind, read in a temp directory only this seat uses | `exit 0` then `0`, `exit 1` then `0`, then `0` | in the clone, remove the cleanup call (the builder cites the edit and its diff-stat line): the first count prints `1` | not applicable |
| U2-7 | the records agree | one `ramp-identity` row; then P2's two figures `1`, `1` (R53's carried `STALE time test`, revision 8) | P2's control | `0`; P2 green at 48 |

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
perl -pi -e 's/"--perturb"/"--perturbX"/' scripts/report-preset-fidelity.mjs; git diff --stat | tail -1
node test/engine/ramp-identity.mjs > "$F/tn.log" 2>&1; echo "exit $?"; grep -c '^FAIL' "$F/tn.log"
# U2-6: a green run in the unit worktree, then a red run in the M-F clone, each with a private TMPDIR
mkdir -p "$F/tmp"
TMPDIR="$F/tmp" node scripts/report-preset-fidelity.mjs --identity-control --base HEAD > /dev/null 2>&1; echo "exit $?"
ls "$F/tmp" | grep -c '^ramp-identity-'
# (the same two lines in the M-F clone)
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
| #701 lands first, or #713 moved the same region of `anchor.mjs` | the kit block is its own block with no allow-list. G0 re-observes every count, every needle is text, and each plant checks its own diff-stat line |
| #681 lands with kit anchors other than `#576485` and `#088585` | the plant prints no diff-stat line, the control is void, and the builder picks the landed anchor of the same palette and cites it |
| People read the stripped identity run as proof that nothing moved | U2-4 puts the blind spot in the record, and the adapter row says when `--authored` is required |
| The thin test is taken for an engine gate | its comment and its `PASS:` line say what it proves. The adapter row is the gate |
| `git archive` is unavailable where `npm test` runs | the thin test uses `--base-dir .` and never calls git |
| No quiet slot for the baseline rerun | U2 step 7 waits and says so. P2 stays a pre-land blocker. Everything else can be verified meanwhile |

## Landing

One PR from `plan/gate-gaps` to `main`, title `test(color-engine): default kit in every anchor sweep, ramp identity control (#715)`. Draft at the first verified unit. Pre-land per adapter §2.1: P1 to P5 at the branch head, U1-1, U1-2 and U2-3 rerun by the pre-land verifier, record at `.sdlc/verdicts/gate-gaps-prepr.md` with the head sha. P2 is the post-#691 landing rule and is not waivable by a seat. This plan never writes the baseline `ref`; the next records plan re-points it on main, as #708 did.

## Open questions for the owner

| # | Question | Default if unanswered |
|---|---|---|
| Q1 | Should the full identity control run in CI on every PR (one more leg, about 45 s on the runner, `fetch-depth: 0`)? | no. It is a pre-land and verifier command named in the adapter. A ramp-moving PR would red it by design |
| Q2 | Should `--authored` ever be the default, or a second pre-land leg on every plan, given 145 to 155 s a run? (The flag itself is not in question: U2-4 and the adapter row depend on it.) | no. Opt-in, required by the adapter row only when a unit touches the anchored construction |
| Q3 | Register the thin test? It raises the test-file count by one, which costs a three-run `npm test` refresh of the baseline on a quiet host, about 5 minutes after #713 | yes. Nothing else runs the script, so without it the mode can rot unseen. Sequencing after #713 already took the expensive half of that refresh out of this plan |

## Revisions

| date | what changed |
|---|---|
| 2026-09-20 | revision 2, on the checkability review of 97222c91 (9 🟢, 7 🟡, 1 🔴). Red fixed: U1-2 (the FAIL line must open with the pass line's `default-kit <check>:` token, so both needles are one token; `printf '%s '`; commit before cloning, stated once in the criteria preamble). Yellows folded: G0 (no literal `N0`; the baseline check is a G0 line; #713 is now a start condition, because the baseline reads three stale lines at the #681 head and #713's U6b owns that refresh), P2 and U2 step 7 (this plan's own delta only, including the `ui.html` figure), P5 (reworded to what it proves, and why the stripped leg suffices there), U1-4 (#713 or #701; the needle is re-observed at G0 and cited; both legs; the kit lines compared across legs), U2-1 (the vacuity floor derives from the loaded count, no corpus literal in shipped code), U2-5 (a `FAIL` line mandated, the quiet-host rule cited, a diff-stat gate on the flag rename), U2-6 (a private `TMPDIR` per run). Q2 retired as asked and reframed: `--authored` is part of the plan. Control budget stated. Changed rows: G0, P1, P2, P5, U1-2, U1-4, U2-1, U2-5, U2-6, Q2, Q3 |
| 2026-09-21 | revision 5, conductor ruling on U1's base: U1 is cut from `plan/gate-split` (tip 557b6c0c), not from `origin/main`, because its only file `test/engine/anchor.mjs` does not exist on main and #713 splits it into a FULL sweep and a SAMPLED leg; a U1 written against the unsplit file would needle a shape nobody ships. G0 is waived for U1 on the same reasoning as gate-split Q8, and the landing order stays #681, then #713, then #715, stated in U1's handoff. If gate-split's tip moves (U5's merge, then U6b), the lane MERGES the moved tip into the unit and re-runs its gates, rather than rebasing, so the shas the handoff cites stay true (the lane corrected my wording and is right). Correction in the same breath: this plan's G0 and P2 rows read `stale total: 0`, and at 557b6c0c `.sdlc/baseline.md` still shows two non-head STALE lines because #713 U6b has not been built yet. The waiver covers U1 regardless, but no row of this plan may claim the baseline is clean until U6b lands; pre-land reads this note. |
| 2026-09-20 | revision 3, on the recheck of a7a95c14 (8 🟢, 3 🟡, 1 🔴, one root). Revision 2 tightened G0 and P2 onto `stale total: 0`, which the check cannot print on a branch that lands code: a `ref` written on a plan branch is not in main's history after the squash. G0, P2, U2-7 and U2 step 7 now read the check by line (no `STALE` line naming `tests`, `ui.html` or a `time`; every stale line a `head` line; exit code and head lines recorded, not graded). The depends line names #713's post-landing refresh, Landing names this plan's own, and the #709 `note head:` form is covered by the fourth command. Changed rows: depends, G0, P2, U2 step 7, U2-7, Landing |
| 2026-09-20 | revision 4, on the recheck of de036a89 (3 🟢, 1 🟡, 0 🔴). U2 step 7 no longer rewrites `ref`: a pre-land head sha dies in the squash and would leave main with a `ref` in nobody's history. `ref` is left alone, the Landing sentence about a plan-closing re-point is dropped, and the next records plan re-points it, as #708 did. Changed rows: U2 step 7, Landing |
| 2026-09-22 | revision 6, conductor ruling (a), recorded by the Orchestrator from the Conductor's message of 2026-09-22: U2 step 7 and U2-7's P2 half move out of U2 into a follow-up unit U2b, built after #713 U6b lands and is merged into `plan/gate-gaps`. U6b rewrites the same baseline `npm test` row (TESTS re-point, the load under 5 rule), and revision 5 bars a clean-baseline claim until it lands. U2 is verified on steps 1 to 6 and U2-7's adapter-row half. U2b's criteria are step 7 and U2-7's P2 half as written, read at U2b's head. |
| 2026-09-22 | revision 7, conductor ruling (a) on U2 review finding F3, recorded by the Orchestrator from the Conductor's message of 2026-09-22: the identity control diffs engines under the base tree's inputs only, as step 2 specifies. A head-only change to `src/ui/categories/`, the kit in `model.mjs`, or `persist.js` hydration is out of its reach by design (the reviewer's control: every brands hue +40 in the head reads `0/84` three times). The adapter row must not list those paths as covered; it says they are out of reach and names the gate that catches an input change, or says none does. U2's handoff carries the brands hue +40 control reading 0 by design. |
| 2026-09-26 | revision 8, on pre-land pass 1 at 39142e49 (`.sdlc/verdicts/gate-gaps-prepr.md` F1 and F2). Owner rulings R50 (U2b's runs count under load, marked under-load, per `.sdlc/questions/rule-gates-U5-load.md`) and R53 (`.sdlc/questions/gg-U2b-p2-time-stale.md`: `adapter.md` keeps the quiet 80 to 89 s) are recorded here: P2's Expected and U2-7's figures now read `1`, then `1` (`stale total: 1`), whose one line is `STALE time test`, a documented exception through pre-land; every other line reads ok. U2-2's first max figure is re-pinned from `2.60` to `2.1736`, measured at the head (the other two, `4.3631` and `0.4290`, match the planner's prototype); the drift follows main's tonal changes merged since the figure was taken. | the pre-land verifier's F1 and F2 |
