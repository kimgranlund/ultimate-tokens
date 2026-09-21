---
status: approved
ticket: #713
priority: P1
lane: tooling
size: S + M + M + S + S + S + M (U1 S = 1 point, U2 M = 2, U3 M = 2, U4 S = 1, U5 S = 1, U6a S = 1, U6b M = 2; 10 points)
labels: kind:chore · size:big · lane:tooling · P1 (as minted on #713)
written: 2026-09-20
amended: 2026-09-20 (revision 2: the checkability review of 5f4ea7c4 folded, 21 green, 20 yellow, 1 red; see Revisions)
depends: #681 landed on `origin/main` (gate G0 below decides it by command; no unit starts before it prints green)
head: 3ce50daa (`origin/main`; `plan/gate-split` is cut from it, local only, never pushed by the planner)
measured-at: 36ce7777 (`unit/pif-u4-integration`, the head that lands as #681), in detached scratch worktrees, 2026-09-20
branch: plan/gate-split
inputs: ticket #713; ticket #686 (determinism rules); Lane A's gate-time note of 2026-09-20 (measured at bf62ee30); owner ruling 2026-09-20 (#681 lands with an interim ceiling, this ticket does the real fix); `package.json`, `test/run.mjs`, `.github/workflows/ci.yml`, `.sdlc/adapter.md` §1, `.sdlc/baseline.md`, `.sdlc/checks/baseline-agrees-check.sh`, the `shipping-changes` skill
---

# Split the heavy sweeps out of `npm test` into CI gates, keep a seeded sample in

After #681, `npm test` takes about 296 to 344 s on a quiet host. It took 77 s before that plan, and main's live baseline reads 56 to 60 s. The time bought real coverage: gates that used to sample now sweep all 343 curated documents on the rendered path, and that is what found five vacuous gates and two engine defects. This plan keeps every one of those sweeps running on every PR, in CI, and gives the local loop back a measured ceiling.

The shape is the one `gate:corpus-contrast` already uses. Each heavy file takes a `--full` flag. `npm test` runs it without the flag on a seeded sample. `npm run gate:<name>` runs it with the flag on everything. CI runs both.

Four things the measurement found that the ticket did not know. They change the work, so they come first.

1. The cost in `prime.mjs` is not a corpus sweep. It is the #686 determinism gate (two cold child processes, 2000 cases plus 1500 poison renders) and two synthetic hue grids. The file's only corpus read (`ladder-window`) costs under 0.1 s. The same split applies, but the sample is a thinned case list and grid, not a document sample.
2. `headless-boot.mjs` is two thirds corpus sweep. Its `(rst-corpus)` group detaches and resets all 3396 anchored palettes and re-renders each ramp: 59.9 s of the file's 89.7 s under the probe. The other third is the DOM shim boot and the lettered interaction groups, which are not sweeps and stay where they are. The ticket names three files; this plan proposes the fourth as U5, pending Q1.
3. The sampler this plan was told to copy is order-dependent. `test/engine/curated-contrast.mjs` picks `vols[hash % vols.length]`, where `vols` is in first-appearance order. With each category's `PRESETS` reversed, all 7 gallery categories pick a different volume (measured, table below). Sorting `vols` first makes the pick identical both ways. U1 builds one shared sampler that sorts, and moves `curated-contrast.mjs` onto it.
4. Two of the five measured mutations are sparse: disabling the monotone post-pass reds 4 rises corpus-wide in `tonal.mjs` and 13 of 3380 sources in `anchor.mjs`. A 10 percent sample will usually miss those. So the sample is a canary and the full gates are the gates of record. That is why must-have 1 (CI runs every full sweep on every PR) is a landing blocker and not a nicety.

Scope wall. Paths this plan may change: `test/engine/{tonal,anchor,prime,curated-contrast}.mjs`, `test/engine/lib/corpus-sample.mjs` (new), `test/engine/corpus-sample.mjs` (new), `test/ui/headless-boot.mjs` (U5 only), `test/run.mjs` (one entry), `package.json` (`scripts` only), `.github/workflows/ci.yml`, `.sdlc/adapter.md`, `.sdlc/baseline.md`, `.sdlc/checks/baseline-agrees-check.sh`, `.claude/skills/shipping-changes/SKILL.md`, this plan, its handoffs, verdicts and questions, and one line of `.claude/CLAUDE.md` only if Q2 is answered yes. `src/` is untouched: no engine change, no shared cache, no perf work. Added in revision 4 (conductor ruling on the U1 review): `.sdlc/architecture.md`, one exception-list entry, U1 only.

Prose rules for every line this plan adds. No em dash outside an inline backtick span that quotes program output. No bold inline labels. The retired maker brand is paraphrased, never quoted. `grep -P` is absent on this host: PCRE runs through `perl`.

Criteria ids: P rows for the plan, numbered rows per unit, cited as U2-3. G0 is the start gate.

## Measured by the planner on 2026-09-20 at 36ce7777

Every "today" value below comes from this section. All timing was taken while another verifier was using the host, so every second here is indicative, not a baseline figure. Shares within one file are load-independent enough to plan on; totals are not. U6 takes the figures of record under the quiet-host rule.

### Whole files, `/usr/bin/time -p node test/<file>`, sequential, foreground

| file | pass 1 real (s) | 1-min load at start, processes at 50% CPU or more | pass 2 real (s) | load, hot | Lane A at bf62ee30, load 5.16 |
|---|---|---|---|---|---|
| `test/engine/tonal.mjs` | 161.45 | 8.53, 5 | 132.03 | 3.60, 1 | 100.2 |
| `test/engine/anchor.mjs` | 128.20 | 8.64, 1 | 124.21 | 9.44, 1 | 80.0 |
| `test/engine/prime.mjs` | 88.24 | 12.03, 1 | 81.89 | 6.14, 2 | 54.9 |
| `test/ui/headless-boot.mjs` | 104.04 | 8.27, 3 | 92.78 | 5.74, 2 | 61.0 |
| sum of the four | 481.93 | | 430.91 | | 296.1 |
| the other 44 files of `TESTS` (48 entries), one sequential run | 51.7 | 6.08 to 8.30, not recorded per file | | | not measured by Lane A |

All eight runs exit 0. `user` time tracks `real` within 3 percent on every run, so the files are single-threaded and CPU-bound, and the slowdown against Lane A is per-core contention, not waiting. The largest of the other 44: `ui/poster-strip.mjs` 16.0 s, `engine/hct.mjs` 7.0 s, then nothing above 3.2 s.

### Inside each file

Method: a scratch copy of each file with a `console.error` timestamp inserted before every top-level block, loop and section header (a perl one-liner, never committed, removed with the worktree). Seconds are from that probe run (loads 5.9 to 8.2), so read the share column. The last column applies the share to Lane A's quieter whole-file figure; it is an estimate, not a measurement.

| file | gate or block (line at 36ce7777) | what it sweeps | probe s | share | est. quiet s |
|---|---|---|---|---|---|
| tonal | `chroma-envelope` C6 (i) upticks and (ii) duplicate hexes (1255) | full corpus, 3780 palettes x 3 tone modes x 2 stop sets, plus the default kit | 42.7 | 30% | 30 |
| tonal | `chroma-envelope` (iv) dip gate (1566) | full corpus plus default kit x 3 modes x 2 stop sets | 37.9 | 27% | 27 |
| tonal | (iv) negative control, even, patched engine (1642) | full corpus x 2 stop sets on a patched `tonal.js` | 21.0 | 15% | 15 |
| tonal | (iv) negative control, peak, patched engine (1612) | same, peak | 5.2 | 4% | 4 |
| tonal | C6 (iii) above-100 violators and its control (1332) | generated palettes x 2 modes | 4.5 | 3% | 3 |
| tonal | C6 (v) ratchet, monitor and sampled control (1776) | full corpus once; the control is already a 50-document seeded sample | 3.0 | 2% | 2 |
| tonal | `skew-lift-okhsl` (iii b) grid (992) | synthetic grid, 2 modes x 2 hue spaces x 3 vibrancies x skews x lifts x hues. Not a corpus sweep | 23.1 | 16% | 16 |
| tonal | everything else, 17 gates | defaults and fixtures | 4.2 | 3% | 3 |
| anchor | `anchor-ramp` rendered-path sweep (869, with its per-ramp predicates) | 343 presets x 3 modes through `hydrate` and `projectView` | 73.9 | 54% | 44 |
| anchor | `anchor-f4` hue-space bound (1151) | full corpus plus default kit x 2 modes x 2 hue spaces | 43.0 | 32% | 25 |
| anchor | `prime-identity-control` C4 (198 to 266) | 3796 subjects | 12.1 | 9% | 7 |
| anchor | `anchor-identity` C2 count and control (176) | 3780 palettes | 4.4 | 3% | 3 |
| anchor | everything else | default kit | 2.3 | 2% | 1 |
| prime | gate `c` determinism (253): cold worker twice, 2000 cases, 1500 poison renders | synthetic cases. Not a corpus sweep | 48.4 | 61% | 34 |
| prime | `gamut-ceiling` (285 to 404) | synthetic grid, 151200 rungs. Not a corpus sweep | 16.7 | 21% | 12 |
| prime | gate `c` `GAMUT_SWEEP` (179) | synthetic grid, 18000 cases. Not a corpus sweep | 12.5 | 16% | 9 |
| prime | everything else, including `ladder-window` over the 8 category JSON files | | 1.6 | 2% | 1 |
| headless-boot | `(rst-corpus)` and `(rst-corpus-ramp)` (3866) | 3396 anchored palettes: detach, reset, re-render 25 stops each | 59.9 | 67% | 41 |
| headless-boot | shim boot plus every other lettered group | one app instance, not a sweep | 29.8 | 33% | 20 |

Cross-check: main's live baseline is 56 to 60 s for the whole suite. The non-sweep remainder estimated here is 3 + 16 + 1 + 1 + 20 for the four files plus roughly 35 s for the other 44, about 76 s, which is the 77 s Lane A recorded before #681. The estimates hang together.

### The sample

| Fact | Value |
|---|---|
| Corpus at 36ce7777 | 343 curated documents (336 gallery in 7 categories of 12 volumes each, 7 in `brands`), 3780 palettes, plus the 16-palette default kit |
| `curated-contrast.mjs` pick, forward against each category's `PRESETS` reversed | architecture VI, VII. cuisine III, X. film V, VIII. literature VI, VII. music IV, IX. nature X, III. travel XI, II. 7 of 7 differ |
| Same pick with `vols` sorted first, forward and reversed | V, III, IX, V, IV, X, XI both ways. 0 of 7 differ |
| Sample size under the sorted pick, seed 0, `brands` in full | 35 documents, 392 palettes, 10.4 percent of 3780 |

### Mutations, each in a throwaway worktree, against the unsplit files (which are the FULL leg by construction)

| id | one-line source mutation | file | exit | first red line (cut) |
|---|---|---|---|---|
| M-A | `anchorChromaBasis` smoothstep weight goes negative below 0.15 (`src/engine/tonal.js:508`) | tonal | 1 | `(iv dip gate) peak: 3987 dip instance(s) beyond the cited baseline` |
| M-A | same | anchor | 1 | `anchor-ramp lone-spike allow-list` ... `1709 (expected 64)`; also `notch allow-list` ... `0 (expected 15)` |
| M-A | same | headless-boot | 0 | none. The reset sweep does not read ramp shape, so it needs its own mutation (M-D) |
| M-B | `maxChromaInGamut` and `peakC` cache keys back to `toFixed(2)` (`src/engine/hct.js:313,338`), the #686 defect | prime | 1 | `409/151200 out-of-gamut rungs exceeds the pinned ceiling of 0`; gate `c` red; the determinism line reads `7/2000 palettes shifted hex by call order` |
| M-C | `enforceMonotonePixelL` returns at once (`src/engine/tonal.js:660`) | tonal | 1 | `(C6 i) perceptual: 4 rise(s)` |
| M-C | same | anchor | 1 | `anchor-ramp monotone: 13 (expected 0` |
| M-D | `resetAnchor` writes `lift = 0` instead of the snapshot (`src/ui/sections/color.js`, in `resetAnchor`) | headless-boot | 1 | `(rst-corpus) 3396 of 3396 anchored palettes failed the exact-snapshot field round trip`; 10 failure lines in all |
| M-E | the anchored OKHSL path solves for `targetOklchHue + 4` (`src/engine/tonal.js:1044`) | anchor | 1 | `anchor-f4 hueSpace-perceptual-bound` ... `max OKLab dE 0.0308 (want <= 0.01`; peak `0.0310` |

Every moved sweep has a measured red: C6 (i) by M-C, the dip gate by M-A, `anchor-ramp` by M-A and M-C, the hue-space bound by M-E, determinism and both prime grids by M-B, the reset sweep by M-D. M-A is broad (thousands of hits) and M-C is sparse (4 and 13 hits), which is the pair the sample criteria need.

The exact edits, run from the clone's root:

```sh
# M-A
perl -0pi -e 's/const w = t \* t \* \(3 - 2 \* t\); \/\/ smoothstep/const w = t < 0.15 ? -0.6 : t * t * (3 - 2 * t); \/\/ smoothstep/' src/engine/tonal.js
# M-B
perl -pi -e 's/^  const key = hue \+ "\|" \+ tone;/  const key = hue.toFixed(2) + "|" + tone.toFixed(2);/; s/^  const key = String\(hue\);/  const key = hue.toFixed(2);/' src/engine/hct.js
# M-C
perl -pi -e 's/^function enforceMonotonePixelL\(stopsOut\) \{/function enforceMonotonePixelL(stopsOut) { return;/' src/engine/tonal.js
# M-D
perl -pi -e 's/d\.palettes\[i\]\.lift = Number\.isFinite\(p\.preDetachLift\) \? p\.preDetachLift : 0;/d.palettes[i].lift = 0;/' src/ui/sections/color.js
# M-E
perl -pi -e 's/solveOkhslHue\(targetOklchHue, s, l\) : hOkSeed;/solveOkhslHue(targetOklchHue + 4, s, l) : hOkSeed;/' src/engine/tonal.js
```

After each, `git diff --stat | tail -1` must read `1 file changed, 1 insertion(+), 1 deletion(-)` (M-B: `2 insertions(+), 2 deletions(-)`). If it prints nothing the needle moved, the control is void, and the builder reports that instead of a pass.

### CI and host facts

| Fact | Value |
|---|---|
| CI jobs on a PR at 3ce50daa | `build-test`, `panda-smoke`, `corpus-contrast` (own runners, parallel), `deploy` on a main push only. Node 24 |
| Run 35517479022 (PR, 2026-09-20) | wall 117 s. `build-test` 113 s, of which `npm test` 79 s, build 2 s, smoke 21 s. `corpus-contrast` 38 s. `panda-smoke` 22 s |
| Run 35517038658 (PR) | wall 167 s |
| Runner against this Mac | `npm test` 79 s on the runner against 56 to 60 s locally, a factor of about 1.4 |
| `.sdlc/adapter.md` §2 "CI on a PR" and `.claude/CLAUDE.md:99` | both name two required jobs, `build-test` and `panda-smoke`. `corpus-contrast` already runs and is named in neither |
| `pgrep -fl 'test/run.mjs\|zzz'` and the bracket form `'[t]est/run.mjs\|[z]zz'`, from an agent shell, nothing running | both print nothing. The self-match was not reproduced today. The bracket form is kept because it is free and cannot match a shell that carries the pattern in its own arguments |
| Processes on the host at 0 percent CPU | 949. At 50 percent or more: 0 to 5 during the runs above |
| `hw.ncpu` | 10 |
| G0 today | `128`, `0`, `OPEN` |

## The design, stated once

One flag. Each of the four files reads `process.argv.includes("--full")`, as `curated-contrast.mjs` does. No environment variable, no second copy of any gate.

One sampler. `test/engine/lib/corpus-sample.mjs` exports `SAMPLE_SEED`, `pickVolume(cat, presets)` and `sampleCorpus(byCategory)`. The pick is `sortedVols[fnv1a(cat + "#" + SAMPLE_SEED) % sortedVols.length]`. `sampleCorpus` takes `{ category: PRESETS }` and returns curated documents only, each tagged with its `category`, with `brands` always in full, sorted by category then name, so the result is a pure function of the set of documents and the seed. Each file adds the default kit itself in both modes, as it does today, and the mode line counts curated documents only. It keeps no module state, so there is nothing a call order could poison (#686). Every file that samples imports it; none carries its own pick.

One substitution point per file. The file builds `docs` (or `corpus`, `presetsByCat`, `corpusPresets`) once, full or sampled, and every sweep and every in-file negative control downstream reads that one list. A sweep is never skipped in sampled mode; it runs on fewer documents.

Pinned lists read two ways, as `curated-contrast.mjs` already does. FULL is exact: no unlisted name, and every cited name observed. SAMPLED is a subset test: no unlisted name; a cited name that is not observed is not a failure; a pinned count is an upper bound. An in-file negative control compares the patched engine against the same mode's own real count, never against a full-corpus pin it cannot reach.

A mode line, printed just before the PASS line, is the contract the criteria grep:

| file | FULL | SAMPLED |
|---|---|---|
| tonal, anchor, headless-boot | `  (FULL: 343 curated documents, 3780 palettes)` | `  (SAMPLED seed 0: 35 curated documents, 392 palettes)` |
| prime | `  (FULL: 2000 determinism cases, 1500 poison renders, hue step 1)` | `  (SAMPLED: 400 determinism cases, 1500 poison renders, hue step 5)` |

The counts are computed by the file from what it measured, never typed in. Each file also fails its own vacuity check: FULL below 343 documents or 3780 palettes is a FAIL, SAMPLED below 30 documents is a FAIL. If the corpus moved when #681 landed, the builder re-measures the four numbers with U1-2's command and amends this table in the same commit.

Prime's sample is a thinning, since there is no corpus to draw from: the first 400 of the 2000 determinism cases (the case list is an index formula, so a prefix is already deterministic and order-free), all 1500 poison renders (the file's own comment says catch rate follows case count, not poison density), and every fifth hue of the two grids, offset by `SAMPLE_SEED % 5`. The tonal `skew-lift-okhsl` grid thins the same way in U2. It is not a corpus sweep, but at an estimated 16 s it decides whether the ceiling holds.

Gate scripts, added to `package.json` by U1 so the four later units never touch the same lines:

| script | command |
|---|---|
| `gate:corpus-tonal` | `node test/engine/tonal.mjs --full` |
| `gate:corpus-anchor` | `node test/engine/anchor.mjs --full` |
| `gate:sweep-prime` | `node test/engine/prime.mjs --full` |
| `gate:corpus-reset` | `node test/ui/headless-boot.mjs --full` (only if Q1 is yes) |
| `gate:sweeps` | runs the four above and `gate:corpus-contrast` in sequence, stopping at the first red. The local pre-land command |

CI: one new job `sweeps` in `ci.yml`, a matrix over the gate script names, own runners, no `needs:`, no `npm ci` (zero dependencies, the same reasoning the `corpus-contrast` job's comment gives), no `if:`, no `continue-on-error`, `fail-fast: false` so one red leg does not hide another. It runs on every `pull_request` and every push to main because the workflow's `on:` block already says so.

The ceiling. `npm test` at or under 120 s, as the largest of three sequential quiet-host runs. Arithmetic behind it: main's 56 to 60 s, plus the sampled legs at about a tenth of the moved cost (tonal 8 s, anchor 8 s, reset 4 s), plus prime's thinned leg at about 18 s (the 1500 poison renders dominate), plus the thinned tonal grid at about 3 s: near 100 s, with 20 s of room. The interim figure #681 lands with is about 300 s. The pre-#681 77 s is not reachable without giving coverage back, because the sampled legs are new work that did not exist then.

The quiet-host rule, used by U6 for every figure of record and by any seat that wants to call a timing meaningful:

```sh
sysctl -n hw.ncpu; uptime | sed 's/.*averages: //'
ps -Ao pcpu=,comm= | awk '$1 >= 50 {n++} END {print n+0}'
pgrep -fl '[t]est/run.mjs|[v]ite build|[s]moke.mjs|[-]-full'
```

A run counts only if the 1-minute load is under the core count, the second command prints `0`, and the third prints nothing, the first two read immediately before the run and again after it, the third before it. The guard measures contention, so only processes that are using a core count: the 949 resident processes at 0 percent CPU on this host (idle agent sessions, dev servers, editors) are not contention and never block a run. The brackets stop the pattern from matching a shell that carries it as an argument. A run that starts quiet and ends loud is recorded and not counted.

The CI budget. On a PR, wall time from run creation to completion at or under 300 s, and every `sweeps` leg at or under 240 s. Today's PR wall is 117 to 167 s. Projected after the split: `build-test` about 195 s (`npm test` near 140 s on the runner, smoke 21 s, setup 15 s), the longest sweep leg (tonal) about 150 s, all in parallel, so the wall stays `build-test`. Without the matrix, one sequential sweeps job would run near 480 s and become the wall, which is why the job is a matrix.

## G0: has #681 landed (every unit's step 1, and the Orchestrator's before it cuts any unit worktree)

```sh
git fetch -q origin
git cat-file -e origin/main:test/engine/anchor.mjs; echo $?
git show origin/main:test/run.mjs | grep -c '"engine/anchor.mjs"'
gh issue view 681 --json state --jq .state
git cat-file -e plan/gate-split:test/engine/anchor.mjs; echo $?
```

Expected `0`, `1`, `CLOSED`, `0`. Today `128` (with git's `fatal:` line), `0`, `OPEN`, `128`. `anchor.mjs` does not exist on main until #681 lands, and it is one of the three files this plan edits, so the first two lines cannot go green early. The last line is the Orchestrator's own step: once the first three are green it rebases the one-commit plan branch onto the new `origin/main` (the branch is local and unpushed, so the rebase rewrites nothing shared) and only then cuts unit worktrees. A builder that sees any other value stops and reports `G0 red`; it does not build against `unit/pif-u4-integration`.

## Criteria (plan-level: each builder runs them, each verifier reruns them, pre-land runs them all)

Every negative control that edits a file runs in a throwaway clone (`git clone -q --shared . "$F/neg"`), never in a unit worktree. `F` is a directory the seat makes under its own scratchpad with a name no other seat would pick, and removes by that exact name. In table cells `\|` is the escape for a plain `|`: type it unescaped. `N` is the length of `TESTS` on the branch. Two variables carry the owner's answers so no command hard-codes them: `GATES="corpus-tonal corpus-anchor sweep-prime corpus-reset"` (drop `corpus-reset` if Q1 is no; loops read it as `$(echo $GATES)` because zsh, the agent shell here, does not split a bare `$GATES`) and `Q2=yes` (or `Q2=no`). Both are shell-literal as printed here: this paragraph is not a table, so nothing in it is table-escaped. Neither holds a regex. Every count and needle pinned to 36ce7777 is re-observed by the builder at G0 on the rebased branch, before it edits, and cited in its handoff: that head is not on main, and G0's rebase can move a count as easily as a mutation needle.

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| P1 | `npm test` green with no `node_modules`, the count agrees, the tree is byte-stable | `npm test 2>&1 \| tail -1; perl -0ne 'my ($b) = /const TESTS = \[(.*?)\];/s; my @m = $b =~ /"[^"]+\.mjs"/g; print scalar(@m), "\n"' test/run.mjs; git status --short \| wc -l` | the runner's pass line naming N files, then N, then `0`. N is 49 once U1 merges (48 at 36ce7777 plus `engine/corpus-sample.mjs`) | in the clone: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test > "$F/neg.log" 2>&1; echo "exit $?"` prints `exit 1` | 48 at 36ce7777 and at 3ce50daa |
| P2 | the ceiling holds in the figures of record, and an independent run agrees | `grep '^[\|] .npm test. [\|]' .sdlc/baseline.md \| awk -F'[\|]' '{n=split($5,t,"·"); m=0; for(i=1;i<=n;i++) if (t[i]+0>m) m=t[i]+0; print (n==3 && m<=120) ? "ok " m : "OVER " m}'`. Then the pre-land verifier's own single `npm test`, under the quiet-host rule, recorded in `.sdlc/verdicts/gate-split-prepr.md` with its load and hot readings before and after | `ok` and a number at or under 120 (pre-land, after U6b), and the verifier's own wall time at or under 120 s. The baseline figure is written by U6b, so the verifier's run is the half that is not self-reported. If the verifier gets no quiet slot it records the loud figure and the readings and grades 🟡, never 🟢 | in the clone, change one of the three figures to `121.00`: prints `OVER 121` | `ok 59.83` on main, which predates #681 and proves only that the command parses. At #681's landing the interim row reads near 300 and this prints `OVER` |
| P3 | coverage is not given back: every gate script runs its sweep on everything | `for g in $(echo $GATES); do npm run -s gate:$g > "$F/$g.log" 2>&1; echo "$g exit $?"; grep -c -e '(FULL: 343 curated documents, 3780 palettes)' -e '(FULL: 2000 determinism cases, 1500 poison renders, hue step 1)' "$F/$g.log"; done` | per gate in `GATES`: `exit 0` then `1` | two, both in the clone. (a) Delete ` --full` from one script in `package.json`: that gate's count prints `0`, because the file prints the SAMPLED line. (b) `perl -pi -e 's/process\.argv\.includes\("--full"\)/false/' test/engine/tonal.mjs; npm run -s gate:corpus-tonal > "$F/v.log" 2>&1; echo "exit $?"; grep -c '(FULL:' "$F/v.log"` prints `exit 0` and `0`: a gate that lost its flag cannot print the FULL line, so the count catches it. The same edit on `anchor.mjs`, `prime.mjs` and `headless-boot.mjs` for their gates. (c) The FULL-side vacuity check bites: in the clone, flag intact, edit the one substitution line so the FULL branch also takes the sampled list (the builder cites the line and its edit in the handoff; with the design's `FULL ? all : sampleCorpus(...)` shape it is `perl -pi -e 's/FULL \? all : /FULL ? sampleCorpus(byCategory) : /'`, and `git diff --stat` must show 1 line changed), then `npm run -s gate:corpus-tonal > "$F/vc.log" 2>&1; echo "exit $?"; grep -c 'FAIL' "$F/vc.log"; grep -c '35' "$F/vc.log"` prints `exit 1`, `1` or more, `1` or more: the vacuity FAIL names 35 documents where 343 are required. Run once per gate in `GATES`; for `gate:sweep-prime` the edit forces the 400-case list and the FAIL names 400 where 2000 are required | no `--full` flag exists; the scripts are absent, `npm run gate:corpus-tonal` exits 1 with `Missing script` |
| P4 | CI invokes every gate script on every PR, and a red leg reds the run's conclusion (what blocks a merge is procedural: see Landing) | `awk '/^  sweeps:/,/^  [a-z-]+:$/ && !/^  sweeps:/' .github/workflows/ci.yml \| grep -v '^ *#' > "$F/sweeps.yml"; for g in $(echo $GATES); do printf "$g "; grep -c "gate:$g" "$F/sweeps.yml"; done; grep -v '^ *#' .github/workflows/ci.yml \| grep -c 'gate:corpus-contrast'; grep -c '^  sweeps:$' .github/workflows/ci.yml; grep -cE '^\s+(if:\|continue-on-error:\|needs:)' "$F/sweeps.yml"; grep -c 'fail-fast: false' "$F/sweeps.yml"; grep -cE '^\s+pull_request:' .github/workflows/ci.yml` | each gate in `GATES` `1` or more, then `1` or more, `1`, `0`, `1`, `1`. Comment lines are stripped first, so a script named only in prose prints `0`, and both job-level figures are read inside the `sweeps` block only | in the clone, delete the `corpus-anchor` matrix entry and leave it in a comment: its line prints `0`. Add `continue-on-error: true` under `sweeps:`: the figure after the job count prints `1`. Move `fail-fast: false` to another job: its figure prints `0` | four gates `0`, then `1`, `0`, `0`, `0`, `1` (run by the planner at 3ce50daa, revision 2) |
| P5 | every moved sweep still reds on its mutation, in the FULL leg | seven runs, each in its own clone, listed in the P5 table below: apply the mutation, check its `git diff --stat` line, run the command, grep the needle | every row: the stated exit and a needle count of `1` or more | the same seven commands with no mutation applied all exit 0 with a needle count of `0` (P3 runs four of them) | all seven red today on the unsplit files, values in the mutation table |
| P6 | the sample is seeded and identical under a reversed and a shuffled corpus | `node test/engine/corpus-sample.mjs; echo "exit $?"` | last line `PASS: corpus sample is a pure function of the document set and the seed`, `exit 0`. The file prints `forward = reversed = shuffled: 35 documents, 392 palettes` and `seed 0 != seed 1` | in the clone, delete the `.sort()` on `vols` in `lib/corpus-sample.mjs`: `FAIL` naming the categories whose pick moved, `exit 1` (7 of 7 measured today on the existing picker) | the file does not exist; the existing picker differs in 7 of 7 categories |
| P7 | the landing rule ruled for every plan that lands after #691: the baseline's test-file figure equals `TESTS.length`, by script, at the pre-land head | `sh .sdlc/checks/baseline-agrees-check.sh; echo "exit $?"` | every line `ok`, `stale total: 0`, `exit 0`, including one `time <gate>` line per new gate (U6-5) | in the clone, lower the baseline's test-file figure by one: `STALE tests:` and `exit 1` | green on main at 48. Goes `STALE` the moment U1 registers its test file, and stays so until U6 reruns the baseline; that is expected on unit branches and a blocker at pre-land |
| P8 | branding clean, and no added line carries an em dash (U+2014) outside a backtick span. The en dash (U+2013) is not banned: the repo's own skills use it | `bash -c 'set -o pipefail; node test/repo/branding.mjs \| tail -1'; git diff $(git merge-base plan/gate-split HEAD) \| grep -v '^+++ ' \| grep '^+' \| perl -CSD -ne 's/`[^`]*`//g; print if /\x{2014}/' \| wc -l` | `branding: clean (N files scanned)`, then `0` | in the clone: `cp docs/reference/references/decision-records.md .sdlc/verdicts/x.md` reds the first; one added line with the dash makes the second `1`, and so does one whose content starts with `+` (the revision 1 filter missed that one) | clean, `0` |
| P9 | scope wall. No alternation inside a variable: every allowed path is its own `-e` pattern, and Q2 is a plain `yes` or `no` | `git diff --name-only $(git merge-base plan/gate-split HEAD) \| grep -v -E -e '^test/engine/(tonal\|anchor\|prime\|curated-contrast\|corpus-sample)\.mjs$' -e '^test/engine/lib/corpus-sample\.mjs$' -e '^test/ui/headless-boot\.mjs$' -e '^test/run\.mjs$' -e '^package\.json$' -e '^\.github/workflows/ci\.yml$' -e '^\.sdlc/' -e '^\.claude/skills/shipping-changes/SKILL\.md$' \| { if [ "$Q2" = yes ]; then grep -v -e '^\.claude/CLAUDE\.md$'; else cat; fi; } \| wc -l; git diff --name-only $(git merge-base plan/gate-split HEAD) -- src \| wc -l` | `0`, `0`. Generated files do not appear because nothing under `src/` or `scripts/` changes. `wc -l` always exits 0, so nothing here needs `\|\| true` | fixture of four names (`.claude/CLAUDE.md`, the shipping skill, `.sdlc/x.md`, `test/engine/tonal.mjs`) piped through the filter: `0` with `Q2=yes`, `1` with `Q2=no`, and `1` with `Q2=yes` plus `src/engine/hct.js` (all three run by the planner, revision 3; revision 2's `Q2PAT` printed `2` on the first because its pipe arrived escaped and stopped being alternation) | `0`, `0` on the plan branch at 90f47fd0 (run by the planner) |
| P10 | CI wall budget, read from the draft PR's newest completed run (pre-land only) | `R=$(gh run list --workflow ci.yml --branch plan/gate-split --status completed --limit 1 --json databaseId --jq '.[0].databaseId'); gh run view $R --json conclusion,createdAt,updatedAt,jobs --jq '.conclusion, ((.updatedAt\|fromdate) - (.createdAt\|fromdate)), ([.jobs[] \| select(.name\|startswith("sweeps")) \| ((.completedAt\|fromdate) - (.startedAt\|fromdate))] \| max), ([.jobs[] \| select(.name\|startswith("sweeps"))] \| length)'` | `success`, a number at or under 300, a number at or under 240, then `4` (`3` if Q1 is no) | run the same jq over run 35517479022: the third line is blank (jq's `null` for the largest of nothing) and the fourth is `0`, so a run without the sweeps job cannot pass | `success`, `117`, a blank line, `0` on 35517479022 (run by the planner) |

P5's seven runs. Each row is its own clone, mutated with the exact edit from the mutation section. The command is followed by `echo "exit $?"`; the needle is counted with `grep -c` on the log.

| row | mutation | command, output to `"$F/p5-<row>.log" 2>&1` | needle | expected |
|---|---|---|---|---|
| 1 | M-A | `npm run -s gate:corpus-tonal` | `(iv dip gate) peak:` | `exit 1`, `1` or more |
| 2 | M-A | `npm run -s gate:corpus-anchor` | `lone-spike allow-list` | `exit 1`, `1` or more |
| 3 | M-C | `npm run -s gate:corpus-tonal` | `(C6 i)` | `exit 1`, `1` or more |
| 4 | M-B | `npm run -s gate:sweep-prime` | `out-of-gamut rungs exceeds the pinned ceiling`; also `grep -cE ' [1-9][0-9]*/2000 palettes shifted'` | `exit 1`, `1` or more, `1` |
| 5 | M-C | `npm run -s gate:corpus-anchor` | `anchor-ramp monotone:` | `exit 1`, `1` or more |
| 6 | M-D | `npm run -s gate:corpus-reset` (skipped if Q1 is no) | `(rst-corpus)` | `exit 1`, `1` or more |
| 7 | M-E | `npm run -s gate:corpus-anchor` | `hueSpace-perceptual-bound` | `exit 1`, `1` or more |

Needle 2, 5 and 7 appear on a `pass` line in an unmutated run as well as on a `FAIL` line in a mutated one, so for those three the count is taken with `grep 'FAIL' "$F/p5-<row>.log" \| grep -c '<needle>'`.

## Units

Checklist (the Orchestrator ticks it; the table below carries grades and paths):

- [x] U1 (S) shared seeded sampler, gate scripts, `curated-contrast` moved onto it · builder-l2 · reviewer-l1 · verifier-l1 · verified at 7d51ba07, merged as 34ebbae6
- [~] U2 (M) `tonal.mjs`: sampled by default, full under `--full`, grid thinned · builder-l4 · reviewer-l2 · verifier-l2
- [~] U3 (M) `anchor.mjs`: the same · builder-l4 · reviewer-l2 · verifier-l2
- [~] U4 (S) `prime.mjs`: thinned determinism cases and grids by default, full under `--full` · builder-l3 · reviewer-l2 · verifier-l2
- [~] U5 (S) `headless-boot.mjs`: the reset sweep only (approval question 2: yes) · builder-l2 · reviewer-l1 · verifier-l1
- [x] U6a (S) the `sweeps` matrix job in CI · builder-l2 · reviewer-l1 · verifier-l1 · verified at 166b0ec6, merged as 50898d58
- [ ] U6b (M) figures of record, adapter, baseline, check script, shipping skill · builder-l3 · reviewer-l2 · verifier-l2 · also U6-9, the close-out step that re-points the baseline `ref` (owner ruling 2026-09-20) · also U6-10, the load under 5 rule (owner ruling 2026-09-20); TESTS reads 50 on this tree, by command · also U6-11, the adapter amendment for R8 to R10

Grades come from the Orchestrator's table: L1 and L2 builders get reviewer-l1 and verifier-l1; L3 and L4 get reviewer-l2 and verifier-l2. Order: U1, then U2 to U5 and U6a in any order or in parallel (they touch different files), then U6b last. Unit worktrees for U2 to U6a are cut only after U1 has merged into `plan/gate-split`; cut earlier, P1 reads N as 48 on them and fails for the wrong reason. `gate:sweeps` exists from U1 but is not meant to be run until U6b: before the legs are split it is about 480 s of the same work `npm test` already does.

| Unit | Size | Builder | Reviewer | Verifier | Touches |
|---|---|---|---|---|---|
| U1 shared seeded sampler, gate scripts, `curated-contrast` moved onto it | S | builder-l2 | reviewer-l1 | verifier-l1 | `test/engine/lib/corpus-sample.mjs`, `test/engine/corpus-sample.mjs`, `test/engine/curated-contrast.mjs`, `test/run.mjs`, `package.json` |
| U2 `tonal.mjs`: sampled by default, full under `--full`, grid thinned | M | builder-l4 | reviewer-l2 | verifier-l2 | `test/engine/tonal.mjs` |
| U3 `anchor.mjs`: the same | M | builder-l4 | reviewer-l2 | verifier-l2 | `test/engine/anchor.mjs` |
| U4 `prime.mjs`: thinned determinism cases and grids by default, full under `--full` | S | builder-l3 | reviewer-l2 | verifier-l2 | `test/engine/prime.mjs` |
| U5 `headless-boot.mjs`: the reset sweep only (runs only if Q1 is yes) | S | builder-l2 | reviewer-l1 | verifier-l1 | `test/ui/headless-boot.mjs` |
| U6a the `sweeps` matrix job in CI (rows U6-1, U6-2, U6-8) | S | builder-l2 | reviewer-l1 | verifier-l1 | `.github/workflows/ci.yml` |
| U6b figures of record, adapter, baseline, check script, shipping skill (rows U6-3 to U6-7) | M | builder-l3 | reviewer-l2 | verifier-l2 | `.sdlc/adapter.md`, `.sdlc/baseline.md`, `.sdlc/checks/baseline-agrees-check.sh`, `.claude/skills/shipping-changes/SKILL.md`, `.claude/CLAUDE.md` (Q2) |

U2 and U3 are L4 because the pinned-list semantics are easy to get subtly wrong: a sampled leg that still demands every cited name reds forever, and one that stops checking unlisted names is vacuous. U4 is L3 because it touches the #686 guard. U6 was one M unit in revision 1; it is split because the workflow edit needs no quiet host and unblocks the draft PR's CI and P10 early, while the fifteen timed runs each wait for a quiet slot on a shared ten-core host. Row ids U6-1 to U6-8 are kept so nothing cited moves. Every unit's step 1 is G0. Every unit runs P1, P8 and P9; U2 to U5 also run their rows of P3 and P5.

### U1: the sampler

Steps. (1) G0. (2) Write `lib/corpus-sample.mjs` as the design section states. (3) Write `test/engine/corpus-sample.mjs`: loads the 8 category mirrors, calls `sampleCorpus` on the corpus as loaded, with every category's `PRESETS` reversed, and shuffled by a fixed LCG; asserts the three results are deep-equal, that seed 1 gives a different set than seed 0, that `brands` is complete and the default kit present, and that the sample is at least 30 documents. Register it in `TESTS` (K17). (4) Move `curated-contrast.mjs` onto `pickVolume`; its sampled expectations are upper bounds and floors, so a different volume cannot red them, but the run decides. (5) Add the five gate scripts to `package.json`.

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U1-1 | P6 | as P6 | as P6 | as P6 | file absent |
| U1-2 | the sample's size is what the plan's mode line says | `node --input-type=module -e 'const m=await import("./test/engine/lib/corpus-sample.mjs"); const by={}; for (const c of ["architecture","brands","cuisine","film","literature","music","nature","travel"]) by[c]=(await import("./src/ui/categories/"+c+".js")).PRESETS; const s=m.sampleCorpus(by); console.log(s.length, s.reduce((a,d)=>a+d.palettes.length,0))'` | `35 392` (re-measure and amend the mode-line table if #681's landing moved the corpus) | in the clone, make `sampleCorpus` return its input unsampled: prints `343 3780` | `35 392` by the planner's probe |
| U1-3 | exactly one picker exists | `grep -rlE 'fnv1a\|% vols\.length' test/engine test/ui \| sort` (recursive, so it runs in zsh before `test/engine/lib/` exists; the revision 1 glob aborted there) | one line: `test/engine/lib/corpus-sample.mjs` | restore the old `pickVolume` in `curated-contrast.mjs`: two lines | one line, `test/engine/curated-contrast.mjs` (run by the planner) |
| U1-4 | `curated-contrast` is green in both modes on the shared picker, and its sampled line names the sorted pick | `node test/engine/curated-contrast.mjs > "$F/cc.log"; echo "exit $?"; grep 'SAMPLED seed 0, volumes' "$F/cc.log"; grep -c 'architecture V, cuisine III, film IX, literature V, music IV, nature X, travel XI' "$F/cc.log"; npm run -s gate:corpus-contrast \| tail -1` | `exit 0`, the volumes line (the builder copies it into the handoff as printed), `1`, then `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color`. The sorted pick was computed by the planner's probe, not by the file; if the file prints a different pick after U1-1 is green, the builder records the printed line, amends this needle in the same commit, and says so | in the clone, restore the unsorted pick: the count prints `0` | `exit 0`, `(SAMPLED seed 0, volumes architecture VI, cuisine III, film V, literature VI, music IV, nature X, travel XI)` (line 9 of 16, which is why revision 1's `tail -4` could never see it), `0`, then the PASS line |
| U1-5 | the scripts exist with exactly these commands, and `gate:sweeps` names every leg | `node -e 'const s=require("./package.json").scripts; const want={"gate:corpus-tonal":"node test/engine/tonal.mjs --full","gate:corpus-anchor":"node test/engine/anchor.mjs --full","gate:sweep-prime":"node test/engine/prime.mjs --full","gate:corpus-reset":"node test/ui/headless-boot.mjs --full"}; for (const k in want) console.log(k, s[k]===want[k] ? "ok" : "WRONG"); for (const l of [...Object.keys(want),"gate:corpus-contrast"]) console.log("sweeps has", l, (s["gate:sweeps"]\|\|"").includes("npm run "+l) ? "ok" : "MISSING")'` | four `ok` then five `ok` (with Q1 answered no, the `gate:corpus-reset` lines read `WRONG` and `MISSING` and are the only ones that may) | change one command to `echo gate:` in the clone: `WRONG`. Drop one leg from `gate:sweeps`: `MISSING` | four `WRONG`, five `MISSING` (run by the planner) |
| U1-6 | the sampler's order is total because its keys are unique: a uniqueness assertion on category plus name fails loudly before the sort, and no tiebreak code exists (it could never run) | the registered sampler test's synthetic duplicate-name leg, named in the handoff; `git grep -c 'contentKey' -- test/engine/lib` | the leg passes by observing the assertion throw on a planted duplicate and the key count equal the distinct key count on the real corpus; the grep prints nothing | remove the assertion in a scratch copy: the duplicate-name leg fails, and under reversal the pick for the planted pair differs |
| U1-7 | the new helper directory `test/engine/lib/` is named in `.sdlc/architecture.md`'s exception list, that one entry is the only line U1 moves there, and `.sdlc/debt.md` is untouched (its K17 count quote moves in U6b, after #709 has landed) | `npm test` green for the K17 gate; `git diff --numstat $BASE -- .sdlc/architecture.md .sdlc/debt.md` | one added line in `architecture.md`, no `debt.md` row | remove the entry in a scratch copy: the K17 gate reds naming the helper |

### U2: `tonal.mjs`

Steps. (1) G0. (2) `docs` becomes `FULL ? all : sampleCorpus(...)`; the default kit stays in both. (3) `KNOWN_BASELINE_DUP`, `DIP_BASELINE`, `EVEN_DIP_BASELINE`, `CAP_L_EXCEPTIONS`, the Adia carve-out and the C6 (v) pins read exact under FULL and as subsets or upper bounds under SAMPLED. (4) The two patched-engine dip controls and the above-100 control compare against the same mode's real count. (5) The `skew-lift-okhsl` grid runs every fifth hue when sampled; `GRID_R2_EXCEPTIONS` reads as a subset then. (6) Mode line and vacuity check.

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U2-1 | FULL is the old file: same gates, same verdicts, full corpus | `npm run -s gate:corpus-tonal > "$F/t.log" 2>&1; echo "exit $?"; grep -c '^  pass  ' "$F/t.log"; grep -c '^  FAIL' "$F/t.log"; grep -c '(FULL: 343 curated documents, 3780 palettes)' "$F/t.log"` | `exit 0`, `19` (as measured at 36ce7777; at G0 the builder runs `node test/engine/tonal.mjs \| grep -c '^  pass  '` on the rebased branch before editing, uses that number, and cites it in the handoff; the same for every PASS-line needle in this row), `0`, `1` | P5's M-A and M-C rows for tonal | `node test/engine/tonal.mjs`: exit 0, 19 pass lines, 0 FAIL lines, no mode line (run by the planner) |
| U2-2 | SAMPLED is green, says so, and no sweep was dropped | `node test/engine/tonal.mjs > "$F/ts.log" 2>&1; echo "exit $?"; grep -c '(SAMPLED seed 0: 35 curated documents, 392 palettes)' "$F/ts.log"; grep -c '^  pass  ' "$F/ts.log"` | `exit 0`, `1`, `19` | in the clone, empty the sampled list (`sampleCorpus` returns `[]`): vacuity `FAIL`, exit 1 | no sampled mode |
| U2-3 | the sample still catches a broad regression, and the plan is honest about a sparse one | in the M-A clone: `node test/engine/tonal.mjs > "$F/tsa.log" 2>&1; echo "exit $?"; grep -c '(iv dip gate) peak:' "$F/tsa.log"`. In the M-C clone the same run, exit code recorded, not graded | M-A: `exit 1`, `1`. M-C: whatever it prints goes in the handoff as `sampled M-C: exit N`; FULL must red it (P5) | the unmutated sampled run is U2-2 | FULL: 3987 dips under M-A, 4 rises under M-C |
| U2-4 | a sampled leg does not demand names it cannot see, and does not stop checking names it can | two clones. (a) Delete from `EVEN_DIP_BASELINE` one name the sampled run observes (the builder prints the observed names once and cites the one it picked): `node test/engine/tonal.mjs; echo "exit $?"`. If the sampled run observes no baselined dip, the builder records that fact and runs (a) against `npm run -s gate:corpus-tonal` instead. (b) Add the fictitious name `zz-not-in-corpus\|primary\|500` to the same list: the sampled run, then `npm run -s gate:corpus-tonal`, each with `echo "exit $?"` | (a) `exit 1`, the deleted name in an unlisted-dip line. (b) sampled `exit 0`, FULL `exit 1` with `were not observed` | the two halves are each other's control | FULL only: a missing cited name reds today |
| U2-5 | the file's share of `npm test` | `/usr/bin/time -p node test/engine/tonal.mjs 2>&1 >/dev/null \| grep real` with the quiet-host lines before and after | at or under 20 s on a quiet host; on a loud host the figure and the load go in the handoff and the verifier grades 🟡, not 🔴 | none: a timing | 132 to 161 s loud, 100.2 s Lane A |

### U3: `anchor.mjs`

Steps as U2, on `corpus`, `presetsByCat`, `controlSubjects` and `hueSpaceBoundSubjects`. The `corpus.length !== 3780` and `controlSubjects.length !== 3796` assertions become the FULL vacuity check; SAMPLED asserts its own floor. Window-clamp (10), gap-19 (72), distinct-25 (16), notch (15) and lone-spike (64) are named allow-lists: exact under FULL, subset under SAMPLED.

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U3-1 | FULL is the old file | `npm run -s gate:corpus-anchor > "$F/a.log" 2>&1; echo "exit $?"; grep -c '^  pass  ' "$F/a.log"; grep -c '^  FAIL' "$F/a.log"; grep -c '(FULL: 343 curated documents, 3780 palettes)' "$F/a.log"; grep -c 'gap-19 (72), distinct-25 (16) and notch (15' "$F/a.log"` | `exit 0`, `19` (as measured at 36ce7777; at G0 the builder runs `node test/engine/anchor.mjs \| grep -c '^  pass  '` on the rebased branch before editing, uses that number, and cites it in the handoff; the same for every PASS-line needle in this row), `0`, `1`, `1` | P5's M-A, M-C and M-E rows for anchor | exit 0, 19 pass lines, 0 FAIL lines, the PASS line carries those three counts (run by the planner) |
| U3-2 | SAMPLED is green and says so | `node test/engine/anchor.mjs > "$F/as.log" 2>&1; echo "exit $?"; grep -c '(SAMPLED seed 0: 35 curated documents, 392 palettes)' "$F/as.log"; grep -c '^  FAIL' "$F/as.log"` | `exit 0`, `1`, `0` | empty sample in the clone: vacuity `FAIL`, exit 1 | no sampled mode |
| U3-3 | broad regression caught by the sample; sparse one recorded | M-A clone: `node test/engine/anchor.mjs; echo "exit $?"` and grep `lone-spike allow-list`. M-E clone: the same, grep `hueSpace-perceptual-bound`. M-C clone: recorded, not graded | M-A `exit 1` and `1`. M-E `exit 1` and `1` (its worst witness is the default kit, which is always in the sample). M-C recorded | U3-2 | FULL: 1709 against 64, dE 0.0308, 13 sources |
| U3-4 | subset semantics, both halves | as U2-4 (a) and (b), on the `gap-19` allow-list, with the same fallback: if the sample observes no listed name, (a) runs against `npm run -s gate:corpus-anchor` and the handoff says so | (a) `exit 1`. (b) sampled `exit 0`, FULL `exit 1` | each other | FULL only |
| U3-5 | the file's share | as U2-5 on `anchor.mjs` | at or under 15 s quiet | none | 124 to 128 s loud, 80.0 s Lane A |

### U4: `prime.mjs`

Steps. (1) G0. (2) `DET_CASES` is the first 400 when sampled; `POISON_CASES` stays 1500. (3) `GAMUT_SWEEP` and `gamut-ceiling` step hues by 5 from `SAMPLE_SEED % 5` when sampled; the `checked < 15000` floor and the 151200 denominator become mode-aware and computed. (4) Mode line. `ladder-window` is untouched: it costs nothing.

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U4-1 | FULL is the old file | `npm run -s gate:sweep-prime > "$F/p.log" 2>&1; echo "exit $?"; grep -c '^  pass  ' "$F/p.log"; grep -c '0/2000 palettes shifted hex by call order' "$F/p.log"; grep -c '(FULL: 2000 determinism cases, 1500 poison renders, hue step 1)' "$F/p.log"` | `exit 0`, `20` (as measured at 36ce7777; at G0 the builder runs `node test/engine/prime.mjs \| grep -c '^  pass  '` on the rebased branch before editing, uses that number, and cites it in the handoff; the same for every PASS-line needle in this row), `1`, `1` | P5's M-B row | exit 0, 20 pass lines, the `0/2000` line once (run by the planner) |
| U4-2 | SAMPLED is green and says so | `node test/engine/prime.mjs > "$F/ps.log" 2>&1; echo "exit $?"; grep -c '0/400 palettes shifted' "$F/ps.log"; grep -c '(SAMPLED: 400 determinism cases, 1500 poison renders, hue step 5)' "$F/ps.log"` | `exit 0`, `1`, `1` | hue step 5 with the floor left at 15000 in the clone: gate `c` `FAIL`, exit 1, which proves the floor is live | no sampled mode |
| U4-3 | what the local tripwire does with the #686 defect, measured once | M-B clone: `node test/engine/prime.mjs > "$F/psb.log" 2>&1; echo "exit $?"; grep -E '[0-9]+/400 palettes' "$F/psb.log"; grep -c 'out-of-gamut rungs exceeds' "$F/psb.log"` | recorded in the handoff as `sampled M-B: exit N, D/400, ceiling line count C`, not graded. By proportion the sampled grid expects about 80 of 30240 rungs and the 400-case prefix 1 or 2 shifts, neither measured. If it exits 0 that is written down, and FULL carries the defect under P5 row 4, which is graded | U4-2 | FULL: 7/2000, 409/151200 |
| U4-4 | the file's share | as U2-5 on `prime.mjs` | at or under 25 s quiet | none | 82 to 88 s loud, 54.9 s Lane A |

### U5: `headless-boot.mjs`, the reset sweep only (if Q1 is yes)

Steps. (1) G0. (2) `corpusPresets` becomes full or `sampleCorpus`; the default kit stays. (3) `corpusChecked > 3000` becomes the FULL floor; SAMPLED asserts more than 300. (4) Mode line before the PASS line. Nothing else in the file moves: the lettered groups, the shim and the single-palette `(rst*)` groups run in both modes.

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U5-1 | FULL sweeps everything | `npm run -s gate:corpus-reset > "$F/h.log" 2>&1; echo "exit $?"; grep -c 'HEADLESS BOOT PASS' "$F/h.log"; grep -c '(FULL: 343 curated documents, 3780 palettes)' "$F/h.log"` | `exit 0`, `1`, `1` | P5's M-D row: `(rst-corpus) 3396 of 3396` | exit 0, no mode line |
| U5-2 | SAMPLED is green, says so, and M-D still reds it | `node test/ui/headless-boot.mjs \| tail -2`; in the M-D clone `node test/ui/headless-boot.mjs 2>&1 \| grep -c '(rst-corpus)'` | the SAMPLED line and the PASS line; then a number of 1 or more with exit 1 | the unmutated run | M-D reds 10 lines today |
| U5-3 | only the sweep block changed, by line range | `A=$(grep -n '^// (rst-corpus)' test/ui/headless-boot.mjs \| head -1 \| cut -d: -f1); Z=$(grep -n '^// ── report' test/ui/headless-boot.mjs \| tail -1 \| cut -d: -f1); git diff -U0 $(git merge-base plan/gate-split HEAD) -- test/ui/headless-boot.mjs \| perl -ne 'print "$1\n" if /^@@ -\d+(?:,\d+)? \+(\d+)/' \| awk -v a=$A -v z=$Z '$1 < a \|\| $1 > z {n++} END {print n+0}'` | the number the handoff cites, at most `2`, each outside hunk named there (the `--full` flag and sampler import near the top are the only ones expected; the mode line sits just before the report block, inside the range) | edit any lettered group in the clone: the figure rises by one and no longer equals the handoff's | not applicable: the block arrives with #681. At 36ce7777 `A` is 3841 and `Z` is 3906 |
| U5-4 | the file's share | as U2-5 | at or under 30 s quiet | none | 93 to 104 s loud, 61.0 s Lane A |

### U6a and U6b: CI, then the records

U6a steps. (1) G0, and U1 merged (the script names must exist for U6-2). (2) Add the `sweeps` matrix job as the design section states. (3) Push nothing: the Orchestrator opens the draft PR, and U6-8 is graded once a run completes. Until U2 to U5 merge, a leg runs its file unsplit and prints no FULL line, which is green for CI and red for P3, as it should be.

U6b steps. (1) G0, and U1 to U6a merged. (2) Under the quiet-host rule, run `npm test` three times and each gate script three times; the handoff's Runs table is `| # | command | load before | hot before | pgrep before | load after | hot after | exit | wall (s) | last line | git status lines |`, counted runs numbered `1` to `15`. A run that fails the rule goes in a second table headed `Rejected runs` with ids `R1`, `R2` and so on, and is rerun later, never averaged in. If no quiet slot arrives the builder says so and the unit waits; it does not grade a loud figure. (3) `baseline.md`: new `ref`, the three `npm test` figures and N, one Pass row per gate script, the #681 interim row moved to a labelled prior set. (4) Adapter §1: the test row's time range; the sentence `` `npm test` ceiling: 120 s, the largest of three sequential quiet-host runs. `` as a prose bullet under "Rules the gates imply", followed by the three quiet-host commands verbatim from this plan inside a fenced `sh` block (never in a gate-table cell: the second command contains a pipe, a table cell would need it escaped, and U6-6's fixed-string needle would then print `0` forever); one row per gate script (command, needs, what green means including the FULL line, time range, who runs it: CI always, builder or verifier when a unit touches what the row names), each saying the sampled leg is a canary and the FULL leg is the gate of record; the #681 interim budget note retired. §2 "CI on a PR": every PR job named in backticks, `deploy` stated as push-only. (5) `baseline-agrees-check.sh`: one `time <gate>` line per gate script, same rounding rule as the three it has. (6) `shipping-changes` SKILL.md, found by text and not by line number: the sentence that opens `CI (`.github/workflows/ci.yml`) runs`, the step that opens `6. Watch CI (~50` with its `Three legs must pass` sentence, and the closing line that says `all three legs`. (7) If Q2 is yes, the `.claude/CLAUDE.md` line that reads ``green CI (`build-test` + `panda-smoke`)`` names the jobs.

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U6-1 | P4 (U6a) | as P4 | as P4 | as P4 | as P4 |
| U6-2 | the workflow parses and the matrix lists exactly the scripts that exist | `node -e 'const y=require("fs").readFileSync(".github/workflows/ci.yml","utf8"); const m=(y.match(/gate:[a-z-]+/g)\|\|[]).filter((v,i,a)=>a.indexOf(v)===i).sort(); const s=Object.keys(require("./package.json").scripts).filter(k=>k.startsWith("gate:")&&k!=="gate:sweeps").sort(); console.log(JSON.stringify(m)===JSON.stringify(s)?"same":"DIFFER", m.length)'` | `same 5` (`same 4` if Q1 is no) | add a script with no CI leg in the clone: `DIFFER` | `same 1` |
| U6-3 | every counted run is quiet, green and leaves the tree clean, and the verifier reproduces two of them (U6b) | `HF=.sdlc/handoffs/gate-split-U6b.md; grep -cE '^[\|] [0-9]+ [\|] .npm (test\|run gate:)' $HF; grep -E '^[\|] [0-9]+ [\|] .npm' $HF \| awk -F'[\|]' -v c="$(sysctl -n hw.ncpu)" '{for(i=4;i<=8;i++) gsub(/ /,"",$i); if ($4+0>=c \|\| $7+0>=c \|\| $5!="0" \|\| $8!="0" \|\| $6!="none" \|\| $9+0!=0 \|\| $12+0!=0) n++} END{print n+0}'; grep -cE '^[\|] R[0-9]+ [\|]' $HF`. Then the verifier itself runs `npm test` once and one gate script once under the same rule and writes both rows, with its own readings, into its verdict | `15` (3 x `npm test` plus 3 x 4 gates; `12` if Q1 is no), then `0`, then the number of rejected runs, which may be anything. Counted runs are numbered `1` to `15` in the Runs table. A run that failed the quiet rule goes in a second table headed `Rejected runs`, ids `R1`, `R2` and so on, same columns, so the first two figures never see it. The verifier's two wall times sit inside half to double the handoff's range for the same command, else 🟡 | plant a counted row with load `11.2` or hot `2`: second figure `1`. Move that row to the rejected table: second figure back to `0` and the first drops by one, so a rejected run cannot be passed off as counted | no handoff. Run by the planner on a fixture of two quiet counted rows and one rejected row: `2`, `0`, `1`. With a loud row planted as counted row 3: `3`, `1`, `1` |
| U6-4 | P2 (U6b) | as P2 | as P2, including the verifier's own run | as P2 | as P2 |
| U6-5 | P7, with the new lines | `sh .sdlc/checks/baseline-agrees-check.sh \| grep -c '^ok    time gate:'; sh .sdlc/checks/baseline-agrees-check.sh \| tail -1` | `4` (`3` if Q1 is no), `stale total: 0` | in the clone, change one adapter gate range by a second: `STALE time gate:` and exit 1 | `0`, `stale total: 0` |
| U6-6 | adapter §1 carries every gate script, the ceiling sentence and the quiet-host command by their exact text; the interim note is gone; §2 names every PR job and says `deploy` is push-only (U6b) | `for g in $(echo $GATES); do grep -c "^[\|] [a-z-]* [\|] .npm run gate:$g. [\|]" .sdlc/adapter.md; done; grep -cF 'ceiling: 120 s, the largest of three sequential quiet-host runs' .sdlc/adapter.md; grep -cF "ps -Ao pcpu=,comm= \| awk '\$1 >= 50 {n++} END {print n+0}'" .sdlc/adapter.md; grep -cF "$INTERIM" .sdlc/adapter.md; for j in $(perl -ne '$j=1 if /^jobs:/; print "$1\n" if $j && /^  ([a-z-]+):$/' .github/workflows/ci.yml \| grep -v '^deploy$'); do printf "$j "; grep '^[\|] CI on a PR' .sdlc/adapter.md \| grep -c "\`$j\`"; done; grep '^[\|] CI on a PR' .sdlc/adapter.md \| grep -c 'deploy. runs only on a main push'` | one `1` per gate, `1`, `1`, `0`, then `1` for every PR job (`build-test`, `panda-smoke`, `corpus-contrast`, `sweeps`), then `1`. The quiet-host needle is matched in §1's fenced block, not in a table row. In the job loop the backticks around `$j` are backslash-escaped inside the double quotes exactly as printed, so the shell passes them to grep and does not run `$j` as a command. `INTERIM` is a fixed string of 20 characters or more from the interim budget note, with no backtick in it, which the builder copies at G0 from `git show origin/main:.sdlc/adapter.md \| grep -n '#681'` and cites in the handoff; `git show origin/main:.sdlc/adapter.md \| grep -cF "$INTERIM"` must print `1` there, which is the proof the needle is live (at 36ce7777 `budget moved, #681 U6` prints `1`, run by the planner; a needle that includes the note's backticks printed `0`) | drop a gate row in the clone: its `0` shows. Reword the ceiling sentence: `0`. Restore the interim note: `1`. Drop `corpus-contrast` from the CI row: `0` | gates `0 0 0 0`, ceiling `0`, rule `0`, interim not yet on main, jobs `build-test 1`, `panda-smoke 1`, `corpus-contrast 0`, then `1` (run by the planner at 3ce50daa) |
| U6-7 | the shipping skill names the new jobs, and none of its three stale statements survives (U6b) | `K=.claude/skills/shipping-changes/SKILL.md; grep -c 'gate:sweeps' $K; grep -c 'sweeps' $K; grep -c 'all three legs' $K; grep -c 'Three legs must pass' $K; grep -c 'Watch CI (~50' $K; grep -c 'Watch CI (~' $K` | `1` or more, `2` or more, `0`, `0`, `0`, `1`: the watch-time sentence stays and its figure is the CI wall U6-8 measured, rounded, not 50 to 90 s. The skill also says in one sentence that a red `sweeps` leg is a red run and that `gate:sweeps` is the local command | revert the file in the clone: `0`, `1`, `1`, `1`, `1`, `1` | `0`, `1`, `1`, `1`, `1`, `1` (run by the planner) |
| U6-8 | P10, once the draft PR has a completed run (U6a) | as P10 | as P10 | as P10 | as P10 |
| U6-9 | owner ruling of 2026-09-20: the plan-closing commit on main owns the baseline `ref`. `.sdlc/adapter.md` §5 gains one step: after a landing that changed a file outside `.sdlc/`, the close-out commit re-runs the gates of record under the quiet-host rule and sets `ref` to the squash sha, so `baseline-agrees-check.sh` prints `ok    head:` twice on main and no records plan is needed to re-point it | `awk '/^## 5\. /,/^## 6\. /' .sdlc/adapter.md \| grep -c 'sets .ref. to the squash sha'` | `1` | at the unit's base the same command prints `0`; in a clone of main with `ref` left at the pre-squash value the check prints a `note  head:` line, and with `ref` set to a branch-only sha it prints `STALE head:` and exits 1 |
| U6-10 | owner ruling of 2026-09-20 (`.sdlc/questions/records-followup-repoint-threshold.md` on main): the quiet-host rule for a set of record is load under 5 at the start of every run, since the prior set was taken near load 4 and a start under 10 let `npm test` read 110 s against 56 s on an unchanged tree. U6b writes the threshold into `.sdlc/adapter.md` where the rule lives and takes its own set under it | `grep -c 'load under 5' .sdlc/adapter.md`; the handoff's Runs table | at least `1`; every used run's `load before` cell is under 5, and any run at 5 or above sits in the Rejected runs table | at the unit's base the grep prints `0`; a Runs row retyped to load 6.3 fails the verifier's reading of the table |
| U6-11 | owner rulings R8 to R10 of 2026-09-20 (first recorded as R5 to R7, renumbered the same day) (`.sdlc/questions/standing-rulings-2026-09-20.md` on main) are amended into `.sdlc/adapter.md` §2.1: the light process for a change touching only `.sdlc/`, no new records tickets, and criteria needles limited to function names, ids and counts | `awk '/^### 2\.1/,/^### 2\.2/' .sdlc/adapter.md \| grep -c 'R8\|R9\|R10'` | at least `3` | at the unit's base the same command prints `0` |

## Not in scope

| Item | Why | Where it goes |
|---|---|---|
| Deriving the corpus ramps once and sharing them across the four files | Open question Q3. Each file is its own `node` process under `run.mjs`, so sharing means a cache on disk or one process for four files. Either is a second source of truth for rendered ramps, and #686 is exactly a shared cache that went order-dependent. The measured upside is bounded by the FULL legs, which leave the local loop in this plan anyway | its own ticket if the owner wants it |
| Any change under `src/` | The cost is test-side. Engine perf is a different risk class | none planned |
| Shrinking `poster-strip.mjs` (16 s loud) or `hct.mjs` (7 s) | Neither is a #681 sweep; both predate it and sit inside main's 56 to 60 s | a later perf ticket if the ceiling needs it |
| The lettered interaction groups of `headless-boot.mjs` | Not a sweep: one app instance driven through the shim. About 20 s quiet, pre-existing | none |
| Parallelising `test/run.mjs` | Would cut wall time on a quiet host and make every timing on this many-agent host worse. It also changes what the runner's output means | none planned |
| Branch protection that requires the `sweeps` job | `main` has no branch protection at all (adapter §2); the conclusion is checked by hand per `shipping-changes`. Requiring one job is a repo-settings decision | owner |
| #701 and the lone-spike carve-out | The allow-lists move through this plan untouched, names and counts | #701 |

## Risks

| Risk | What this plan does about it |
|---|---|
| The sample becomes the gate people trust, and a sparse regression (M-C: 4 and 13 hits) lands green locally | The adapter row says in words that the sampled leg is a canary and the FULL leg is the gate of record. P4 and P10 make the FULL legs a landing condition. U2-3 and U3-3 record what the sample does with M-C instead of pretending |
| Subset semantics quietly turn a pinned list into no check at all | U2-4 and U3-4 test both halves: an unlisted name in the sample reds the sampled run, a missing cited name reds the FULL run |
| #681 lands with different line numbers, counts or corpus than 36ce7777 | G0 forces a rebase first. Every needle is a text match with a `git diff --stat` check, so a moved needle voids the control loudly. U1-2 re-measures the mode-line numbers |
| The 120 s ceiling does not hold on a quiet host | It is arithmetic from loud measurements. The knob is the sample: prime's 400 cases and the hue step. If three quiet runs exceed 120 s with the stated sample, U6b stops and writes `.sdlc/questions/gate-split-U6b.md` with the per-file table; it does not raise the ceiling or shrink the sample on its own |
| No quiet slot ever arrives on this host | U6b waits and says so. The CI figures (P10) do not depend on this host, so coverage and the CI budget can be verified while the local figures of record wait. Landing without them is the owner's call (Q4 is not asked now; it is asked only if it happens) |
| Runner time drifts up and the `sweeps` legs pass 240 s | The matrix keeps each leg independent; the tonal leg has about 90 s of room on today's factor of 1.4 |
| `curated-contrast` changes its sampled volumes in U1 | Its sampled expectations are bounds, not exact counts, and the FULL leg is unchanged. U1-4 runs both |
| Two seats time gates at once and both record loud figures as quiet | The rule reads hot processes and `pgrep` before and after every run, and U6-3 rejects any row that fails either reading |

## Landing

One PR from `plan/gate-split` to `main`, title `chore(tooling): split the heavy sweeps into CI gates, seeded sample in npm test (#713)`. Draft at the first verified unit, so CI starts running the matrix as soon as U6's workflow edit exists. Pre-land per adapter §2.1: P1 to P10 at the branch head, U2-1, U3-1, U4-1 and U5-1 rerun by the pre-land verifier, record at `.sdlc/verdicts/gate-split-prepr.md` with the head sha. P7 is the post-#691 landing rule and P10 is the CI budget; neither is waivable by a seat.

What blocks a merge. `main` has no branch protection, so a red `sweeps` leg stops nothing mechanically. The block is procedural and has two halves: P10 demands the run's conclusion be `success`, which a red leg prevents because no leg carries `continue-on-error`; and the pre-land verdict lists every `sweeps` leg by name with its conclusion, read from `gh run view <id> --json jobs --jq '.jobs[] | select(.name|startswith("sweeps")) | [.name,.conclusion] | @tsv'`. A verdict that does not name each leg is not 🟢. U6-7 puts the same rule into `shipping-changes`, which is what every later plan lands through.

## Open questions for the owner

| # | Question | Default if unanswered |
|---|---|---|
| Q1 | The ticket names three files. `headless-boot.mjs` spends two thirds of its time (41 s quiet, estimated) in a fourth full-corpus sweep, `(rst-corpus)`. Include it as U5? | yes. Without it the projected `npm test` is near 137 s and the 120 s ceiling does not hold; the ceiling would be restated as 160 s |
| Q2 | `.claude/CLAUDE.md:99` names two required CI jobs; after this plan there are four job names on a PR. Adapter conflict row X9 needs the owner's yes for any edit there. One line? | yes, one line, graded by a grep in U6 |
| Q3 | Sharing derived ramps across files: book it as its own ticket, or drop it? | drop it, for the reason in Not in scope |

## Revisions

| date | what changed |
|---|---|
| 2026-09-20 | revision 2, on the checkability review of 5f4ea7c4 (`gate-split-checkability.md` in the Lane scratchpad; 21 🟢, 20 🟡, 1 🔴). Red fixed: U1-4 (`tail -4` could never see the volumes line, which is line 9 of 16). Broken rows fixed: U6-3 (rejected runs get their own table so they are never counted, and the verifier reproduces two runs), U6-6 (exact-text needles, an interim-note needle recorded at G0, PR jobs only with `deploy` stated as push-only). Yellows folded: P2 and U6-4 (the verifier's own run), P3 (`GATES`, control as a command), P4 and U6-1 (grep inside the job block, comments stripped, headline reworded), P5 (the seven runs as a table), P8 (diff filter, U+2014 only), P9 (exit code, `Q2PAT`), U1-3 (recursive grep), U1-5 (exact commands), U2-1, U3-1, U4-1 (counts re-observed at G0), U2-4 and U3-4 (fallback when the sample sees no listed name), U4-3 (recorded, not graded), U5-3 (line range), U6-7 (three stale statements, needles by text). Plan-level: U6 split into U6a and U6b with row ids kept; worktree cut order and the `gate:sweeps` note stated; Landing says what blocks a merge. Every changed command was run once at 3ce50daa or on a fixture, and each keeps a control that fails |
| 2026-09-20 | revision 3, on the recheck of 90f47fd0 (39 🟢, 3 🟡, 0 🔴). P9: `Q2PAT` retired, because a pipe defined in prose arrived escaped and stopped being alternation (the fixture printed `2` where `0` was due and rejected the shipping skill); every allowed path is now its own `-e` pattern and Q2 is a plain `yes` or `no`, fixture run three ways. P3: control (c) proves the FULL-side vacuity check bites. U6-6 and U6b step 4: the ceiling sentence and the quiet-host commands go in §1 prose and a fenced block, never a table cell, and the escaped backticks in the job loop are explained |
| 2026-09-20 | revision 4, conductor rulings on the U1 review at fbd4efd4: U1-6 (total order and uniqueness) and U1-7 (K17 exception entry in U1, `debt.md` count deferred to U6b after #709 lands); scope wall gains one `architecture.md` line. |
| 2026-09-20 | revision 5, from the U1 delta review at 98f26418: U1-6 keeps the uniqueness assertion alone, since it throws before the sort and the tiebreak ruled in revision 4 was dead code whose control could not fail; the registered test gains a synthetic duplicate-name leg so the guarantee has coverage in `npm test`. |
| 2026-09-20 | revision 6, from the U4 builder via Lane B at c8823976: P8 and P9 diff against `$(git merge-base plan/gate-split HEAD)`, the unit fork point, instead of `origin/main`. With G0 waived (Q5, Q7, Q8) the plan branch is not rebased, so the `origin/main` merge-base predates #681 and the diff pulled in #681 whole. For U2 to U5 the fork point is ebddc55d. No criterion changes meaning. |
| 2026-09-21 | revision 7, U4 carry-overs for the pre-land pass (R9, not a reopen of c8823976): (a) `prime.mjs` comments near the sweep-size and 114-rung sentences still describe the FULL leg as the file, with no clause naming FULL; runtime right, record stale; the pre-land fix commit reworks them. (b) The SAMPLED negative control keeps 3 witnesses against FULL 114; it asserts nothing and detection is intact (sampled M-B 73/30240), so no record may read 3 as strength. (c) U4-1 pass count is 21; the plan's 20 was read off a head with no `const DECLARED` line. |
| 2026-09-21 | revision 8, U3 carry-over for the pre-land pass (R9, not a reopen of 6db38ae0): the PASS line in `anchor.mjs` prints the FULL counts (`window-clamp (10), gap-19 (72), distinct-25 (16) and notch (15)`) in both modes, so a SAMPLED log claims coverage it did not do (it observes 8 gap-19, 3 lone-spike, 2 notch). Mode line above it is right, every U3 criterion passes. The pre-land fix commit makes the PASS line print the mode's own counts, and the pre-land verifier greps a SAMPLED log for `gap-19 (72)` expecting `0`. |
| 2026-09-20 | note from the U1 verdict for U2 onward: `sampleCorpus` silently drops a category whose presets lose `vol` (35 documents become 31), and the 30-document floor does not catch it; the first unit that consumes the sampler adds a per-category presence assertion with a control that fails. |
| 2026-09-20 | checklist added under Units, U1 ticked: the plan had only the grades table, so `board.py` and `progress.py` saw no units. |
| 2026-09-20 | U6-9 added to U6b: the plan-closing commit on main re-points the baseline `ref` (owner ruling, recorded in the approval doc as question 6). Three plans hit the gap the same day (#709, #713, #715). |
| 2026-09-20 | U6-10 added to U6b: sets of record start every run at load under 5 (owner ruling on the records-followup re-point, which dropped fourteen runs started between 6.31 and 7.76). U6b is now the one re-measure and the one `ref` re-point. |
| 2026-09-20 | U6-11 added to U6b: the adapter amendment for owner rulings R8 to R10 rides this unit, per R9 itself. |
