---
status: draft
ticket: "#725"
priority: P2
lane: color-engine (`scripts/report-preset-fidelity.mjs`, `test/engine/`, `package.json` gate scripts, `.github/workflows/ci.yml`, `.sdlc/adapter.md` §1, `.sdlc/baseline.md`, `.sdlc/checks/baseline-agrees-check.sh`, `docs/reference/references/decision-records.md`; no line of `src/engine/` moves on the recommended path)
size: M+S (U1 M = 2, U2 S = 1; 3 points)
labels: kind:bug · size:big (on the issue from intake) · P2 · lane:color-engine (to mint per adapter X3)
written: 2026-09-29
head: ea3099e4 (`main`, the root checkout; every engine figure below was read at 89135e46 and ea3099e4 differs from it by one `.sdlc/questions/` file only, `git diff --stat 89135e46 ea3099e4`)
depends: #701 (chroma-floor) landed on `origin/main` at 33bd8920, the last commit to touch `src/engine/tonal.js` or `scripts/report-preset-fidelity.mjs` (`git log -1 -- src/engine/tonal.js scripts/report-preset-fidelity.mjs`). Blocked on the owner's answer to `.sdlc/questions/chroma-envelope-scope.md`: U1 and U2 are written for its recommended option (re-rule); the two other options are costed under 'If the owner rules otherwise' and would replace U1 and U2 by revision, never sit beside them
inputs: gh issue #725 (body and both comments), `.sdlc/questions/issue-triage-2026-09-22.md` row 3, `.sdlc/questions/preset-intent-fidelity-preland.md` Q2, `.sdlc/plans/archive/preset-intent-fidelity.md` (C6, U3, U10-5, revisions 18, 22, 39 / R27), `.sdlc/plans/archive/preset-intent-fidelity-u3-rediagnosis.md`, `.sdlc/plans/archive/chroma-floor.md` (C5, the md5 pin at 282fca8d), `.sdlc/questions/chroma-floor-approval.md` (Q2/R3), ADR-026 and its 2026-09-28 amendment, `scripts/report-preset-fidelity.mjs`, `src/engine/tonal.js` (`chromaEnvelope`, `anchorChromaBasis`, `okhslStopsAnchored`, `okhslStops`), `test/engine/tonal.mjs` C6 (iii-b) and (v), `test/engine/mode-isolation-gate.mjs` and its fixture, `.sdlc/adapter.md` §1, `.github/workflows/ci.yml`
measurements: read-only, planner, 2026-09-29, the root checkout on `main`, no source edited, no test file run. `node scripts/report-preset-fidelity.mjs --envelope > $CLAUDE_JOB_DIR/tmp/env-main.txt` (exit 1, host load 6 to 8, other agents' gates concurrent). Three counterfactuals ran on a scratch COPY of the report under the job's tmp dir (`env-probe.mjs`: the report with its relative imports made absolute, a `DEN` switch on the ratio denominator and a `DAMP` override on the four `controls` literals; nothing in the tree changed): `DEN=500` reproduces `env-main.txt` line for line (the control that the copy is the report), `DEN=max` and `DEN=500 DAMP=90` are the two figures under 'What the counterfactuals show'
---

# The chroma envelope's perceptual and peak bars are re-ruled from the measured rendered path, frozen per mode as a ratchet, and a CI sweep gates the muted direction so a regression reds

## What #725 owns

#681 landed with C6 open on the rendered path: `node scripts/report-preset-fidelity.mjs --envelope` exits 1 because the perceptual and peak median and p90 chroma bars miss, and nothing in `npm test` or CI runs that reading. The owner ruled twice to defer: preland Q2 (2026-09-20, "file a ticket for perceptual and peak, re-cite, accept C6 open") and triage row 3 (2026-09-22, "decide after #701 lands"). #701 landed 2026-09-28 and owned even mode only. This plan is the post-#701 decision and the gate.

The issue's acceptance, verbatim: "`--envelope` perceptual and peak cells all pass, or the targets are re-ruled by the owner with the measured figures. A gate in `npm test` or CI measures the muted direction and can fail." The second sentence is unconditional and is U1. The first sentence is the owner's choice in `.sdlc/questions/chroma-envelope-scope.md`; U2 carries the recommended branch.

## Does the miss still reproduce after #701? Yes, byte for byte

Command, on `main` at 89135e46 (engine-identical to ea3099e4):

```
node scripts/report-preset-fidelity.mjs --envelope        # exit 1
```

READING (a), emitted CAM16 chroma at each stop as % of stop 500, rendered (anchored) path, n = 2920 instances (curated palettes at source chroma >= 10 plus the 8 default-kit families):

| Mode | stop 100 median / p90 | stop 300 | stop 700 | stop 900 | Clause |
|---|---|---|---|---|---|
| Bar | <= 25 / <= 35 | <= 75 / <= 90 | <= 75 / <= 90 | <= 25 / <= 35 | |
| perceptual | 17.4 OK / 35.1 FAIL | 94.0 FAIL / 146.2 FAIL | 74.5 OK / 119.3 FAIL | 31.7 FAIL / 66.5 FAIL | cusp-run rule violations 446 FAIL (ruling (f): one run, bound 189.3005%) |
| peak | 11.7 OK / 23.6 OK | 84.0 FAIL / 137.7 FAIL | 68.8 OK / 111.1 FAIL | 29.4 FAIL / 62.1 FAIL | above 100% of stop 500: 2592 FAIL |
| even (context, #701's) | 15.6 / 37.0 | 47.1 / 100.3 | 42.5 / 80.2 | 22.9 / 52.0 | above 100%: 502 (was 670 before #701) |

READING (b), the `chromaEnvelope` multiplier itself: perceptual and peak both read 41.3 at stops 100 and 900 (median FAIL, p90 FAIL) and 79.3 at 300 and 700 (median FAIL, p90 OK); even reads 11.5 / 31.8, all OK. Both READING lines print FAIL.

Identity with #701's pin: the md5 of the perceptual plus peak READING (a) block on `main` is `6e558839ee9e43217e1e2f7afc898b7b`, the value `.sdlc/plans/archive/chroma-floor.md` C5 froze at 282fca8d before #701's units ran. #701 moved nothing in perceptual or peak, as its mode-isolation gate promised (`pass  mode-isolation: perceptual 34e544942d500b9e peak f560f784d8a4883a match fixture`). Eleven perceptual and peak median or p90 cells plus both clause counts miss today, the same eleven the issue was filed on. "Close as resolved by #701" is falsified by command.

## Diagnosis: two mechanisms, both ratified constructions, neither a tuning slip

**Mechanism 1, READING (b): the ruled multiplier bars are unreachable at the shipped defaults, by closed form.** `chromaEnvelope` (`src/engine/tonal.js:430`) returns `max(0, 1 + shoulder - (damp/100) * |sd|^dampCurve)` with `sd = (liftStop(stop) - liftStop(500)) / 450`. At `damp` 70 and `dampCurve` 1.5, stop 300 (|sd| 0.444) gives 0.793 and stop 100 (|sd| 0.889) gives 0.413, for every palette, which is exactly the 79.3 and 41.3 the report prints. The bars (75 and 25) need `damp` near 90. #681 U3 tried 92/0.5 and 98/0.65, each closed this table and each reopened a CIELAB L\* uptick in the OKHSL modes (Helmholtz-Kohlrausch, `#668`), both reverted byte for byte; the U3 re-diagnosis names a tone-held per-mode construction as the only route and R27 (revision 39) parks the per-side normalization that needs on this ticket. READING (b) is therefore a retune with a known cost, not a bug in the envelope.

**Mechanism 2, READING (a): the denominator is the sampled anchor, not the ramp's designed peak (ADR-026).** On the anchored path (`okhslStopsAnchored`, `tonal.js:1061`) stop 500 is the source hex verbatim and each side blends from the anchor's own OKHSL `s` toward the group target `palette.chroma / 100` (`anchorChromaBasis`, `tonal.js:555`, ruled Q-U2-5). A muted sample in a vivid group therefore has stops 300 and 700 ABOVE stop 500: perceptual 300 reads median 94.0 and p90 146.2 while its own multiplier is a flat 79.3. Perceptual's cusp pull (#55) is ratified to exceed stop 500 within one run, and the anchored peak path has no cap to the anchor's chroma (the cap at `tonal.js:1289` is on the non-anchored `okhslStops` only), so the clause counts (446 runs, 2592 above) are the same construction seen from the other side. ADR-026's Consequences already say this in words: "the pivot is no longer the ramp's designed peak". The figures are that sentence measured.

### What the counterfactuals show

| Probe | perceptual 100 / 300 / 700 / 900 (median) | peak 100 / 300 / 700 / 900 (median) | Clauses (perc runs / peak above) | READING (b) |
|---|---|---|---|---|
| main (`DEN=500`, shipped damp) | 17.4 / 94.0 / 74.5 / 31.7 | 11.7 / 84.0 / 68.8 / 29.4 | 446 / 2592 | FAIL (41.3, 79.3) |
| `DAMP=90`, stop-500 denominator | 11.6 / 85.4 / 71.1 / 21.0 | 8.6 / 75.2 / 64.6 / 20.5 | 365 / 2542 | PASS (24.6, 73.3) |
| shipped damp, `DEN=max` (ratio to the ramp's own peak stop) | 14.7 / 87.0 / 65.0 / 29.7 | 9.3 / 75.2 / 61.4 / 27.5 | 0 / 0 | FAIL (unchanged) |

Read together: the retune that clears READING (b) leaves READING (a)'s stop-300 medians (85.4, 75.2) and both clause counts red, because those come from mechanism 2, which no `damp` value touches. Changing the denominator to the ramp's own peak clears both clauses by construction (nothing can exceed its own max) but stop 300 still misses (87.0, 75.2) and stop 900 misses (29.7, 27.5) because the light side of an anchored ramp holds the group's chroma. Clearing the ruled bars on the rendered path needs BOTH a per-mode tone-held retune AND a change to how the anchored basis blends toward the group, the second of which reverses Q-U2-5 and moves 3,780 rendered ramps. That is the cost 'fix to the ruled targets' carries, and why this plan recommends re-ruling.

## Constraints every unit holds

- Engine-identical on the recommended path: `src/engine/` does not change, the mode-isolation fixture's two hashes stay `34e544942d500b9e` / `f560f784d8a4883a`, and `ramp-identity` prints `0 differing cells`.
- One measurement, two callers: the `--envelope` corpus loop (instances, controls, `rampChromaOf`, the anchored `paletteStops` call, the per-stop ratio and the two clause counters) is factored into one exported function that the report and the new gate both import; the report's printed numbers do not move (C4).
- The gate is a full-corpus sweep, so per #713 it is a `gate:*` script, a `gate:sweeps` member and a `sweeps` matrix leg, never a `test/run.mjs` TESTS entry; `--full` accepted and not read, the mode-isolation shape.
- The fixture is a RATCHET, not a bar: each cell (per mode, per stop, median and p90, plus the two clause counts) may fall and may not rise past its frozen value plus a tolerance the builder states (0.05 percentage points, 0 on the counts), and a plan that intends to move one re-captures with `--capture` in the same change and says so in its handoff, the mode-isolation rule. Even mode is captured too, so #701's 502 becomes gated instead of report-only; the issue scopes the DECISION to perceptual and peak, the gate has no reason to leave a mode out.
- The muted DIRECTION is an absolute leg, not a ratchet: in every mode, the stop-100 median is below the stop-300 median and the stop-900 median below the stop-700 median (today 17.4 < 94.0 and 31.7 < 74.5; 11.7 < 84.0 and 29.4 < 68.8; 15.6 < 47.1 and 22.9 < 42.5). This is what "measures the muted direction" means in the issue's acceptance.
- No U+2014 in any file this plan writes; the retired maker brand is paraphrased everywhere (`test/repo/branding.mjs` scans `.sdlc/`).

## Criteria (verifier-checkable; each with the command, the exact Expected, a negative control that reds, and today's value at 89135e46)

| # | Command | Expected | Negative control | Today |
|---|---|---|---|---|
| C1 | `npm run gate:chroma-envelope` | exit 0; last line `pass  chroma-envelope: 3 modes x 4 stops x 2 stats + 3 clause counts within fixture; direction holds in 3 modes` (wording the builder fixes in the handoff, the verifier reads the line it names) | `node test/engine/chroma-envelope-gate.mjs --fixture <copy with perceptual 300 median lowered by 1.0>` exits 1 naming `perceptual 300 median`; and `--damp-amp 55` (the report's own control, which lifts the shoulder) exits 1 on at least one ratchet cell | `npm run gate:chroma-envelope` prints `Missing script`, exit 1 |
| C2 | `cat test/engine/fixtures/chroma-envelope.json` | `capturedAt` = the unit head; perceptual 100/300/700/900 median 17.4 / 94.0 / 74.5 / 31.7, p90 35.1 / 146.2 / 119.3 / 66.5, cuspRuns 446; peak median 11.7 / 84.0 / 68.8 / 29.4, p90 23.6 / 137.7 / 111.1 / 62.1, above100 2592; even median 15.6 / 47.1 / 42.5 / 22.9, p90 37.0 / 100.3 / 80.2 / 52.0, above100 502 (at the report's one-decimal rounding; the fixture may hold more digits, the verifier compares rounded) | the same file on a `--capture` run at 282fca8d prints even above100 670 (the pre-#701 figure), which the current fixture must not | no fixture exists |
| C3 | `node test/engine/chroma-envelope-gate.mjs --capture && git diff --exit-code test/engine/fixtures/chroma-envelope.json` | exit 0 (re-capture on the unit head is a no-op: the fixture is the tree's own reading) | the same after `sed` lowers one cell: nonzero | n/a |
| C4 | `node scripts/report-preset-fidelity.mjs --envelope \| grep -E '^\s+stop [0-9]+:' \| grep -oE '[0-9]+\.[0-9]%' \| md5` and the two clause-count lines | the numbers are byte-identical to the same extraction at 89135e46 (the builder records both md5s in the handoff; the verifier re-runs at 89135e46 in a scratch clone); the READING lines and the exit code follow the re-ruled bars (U2): after U2, exit 0 | the extraction under `--damp-amp 55` differs | exit 1, 11 perceptual/peak cells FAIL, block md5 `6e558839ee9e43217e1e2f7afc898b7b` |
| C5 | `npm run gate:mode-isolation` | last line `pass  mode-isolation: perceptual 34e544942d500b9e peak f560f784d8a4883a match fixture (...)`, fixture untouched except its `owner` string (C8) | any engine hunk moves a hash | passes with those hashes |
| C6 | `node scripts/report-preset-fidelity.mjs --identity-control --base $(git merge-base origin/main HEAD)` | exit 0, last line `0 differing cells` (no ramp movement is declared) | `--perturb` reports nonzero | `0 differing cells` |
| C7 | `grep -c 'gate:chroma-envelope' package.json .github/workflows/ci.yml .sdlc/adapter.md .sdlc/checks/baseline-agrees-check.sh .sdlc/baseline.md` and `sh .sdlc/checks/baseline-agrees-check.sh` | `package.json` 2 (its own script and inside `gate:sweeps`), `ci.yml` 1 (a matrix leg), `adapter.md` >= 2 (its §1 row and the `sweeps` row's member list, whose sum and count read eight gates), `baseline-agrees-check.sh` 1, `baseline.md` 1 (a timing row, 3/3 runs, load noted per R57); the check script exits 0 | remove the `ci.yml` leg: the `adapter.md` §1 CI row and the workflow disagree, which the pre-land review reads; remove the baseline row: the check script exits 1 | all 0; the check script passes on seven gates |
| C8 | `grep -n '#725' test/engine/mode-isolation-gate.mjs test/engine/fixtures/mode-isolation.json .sdlc/adapter.md` | each hit reads as history ("#725 re-ruled the bars and left the rendered output unmoved; the next plan that moves perceptual or peak re-captures"), none says #725 is the plan that will move them | the strings at 89135e46 say "#725 is the perceptual/peak plan today" | 3 hits, all present tense |
| C9 | `sed -n '/^## ADR-026/,/^## ADR-027/p' docs/reference/references/decision-records.md \| grep -c 'Amendment (2026-'` | 2: the #701 amendment and a new `Amendment (<date>, #725)` that states the re-ruled bars as the measured figures per mode, names the fixture as the ratchet, names the direction leg, and says why the 75/25 bars were not fixable without reversing Q-U2-5 and the #681 U3 retune finding; the Quick map row for ADR-026 names both amendments | at 89135e46 the count is 1 | 1 |
| C10 | `npm test` in the unit worktree; `git status --porcelain` after; `node test/repo/em-dash.mjs`; `node test/repo/citations.mjs`; `node test/repo/branding.mjs` | `✓ all N test files passed` (N unchanged, the gate is not a TESTS entry), tree clean, 0 U+2014, STALE 0, branding 0 | n/a | green at 89135e46 |
| C11 | `gh issue view 725 --json state,comments` after landing | `CLOSED`, closed by the plan's PR, the closing comment quoting the ruling from `.sdlc/questions/chroma-envelope-scope.md` and the fixture's figures; `.sdlc/roadmap.md` row for #725 names this plan (archived) and the PR | n/a | open, no plan, no PR |

## Units

- [ ] U1 (M) the envelope measurement factored out of the report; `test/engine/chroma-envelope-gate.mjs` with its fixture (per-mode ratchet plus the direction leg, `--capture`, `--fixture`, `--damp-amp`); registered as `gate:chroma-envelope`, a `gate:sweeps` member, a `sweeps` matrix leg, an adapter §1 row, a baseline timing row and a check-script entry; the three #725 owner strings retired to history (C1 to C8, C10) · grade l5 · reviewer-l3 · verifier-l2
- [!] U2 (S) the re-ruling: the report's `TARGET` reads the fixture's per-mode figures instead of the literal 25/35/75/90 so `--envelope` exits 0 on the rendered path with unchanged numbers; ADR-026 amendment; CHANGELOG entry; the issue-facing PR text; `.sdlc/questions/chroma-envelope-scope.md` answer written back (C4, C9, C11) · grade l3 · reviewer-l2 · verifier-l1 · blocked: `.sdlc/questions/chroma-envelope-scope.md`

U1 does not wait on the question: the gate is owed under every option. U2 is the recommended option's shape; if the owner picks another, U2 is rewritten by revision (below) and U1's fixture is re-captured by the unit that moves the ramps.

## If the owner rules otherwise

| Option | What replaces U2 | Size, grade | Cost the owner accepts |
|---|---|---|---|
| Fix to the ruled targets | U2' (L, l7): per-mode tone-held damping for perceptual and peak (the U3 re-diagnosis's construction, R27's per-side normalization) so READING (b) clears at 75/25 without an L\* uptick, gated by C6 (i)/C7 as #681 did; U3' (M, l6): the anchored basis blend capped so stops 300 and 700 cannot exceed the anchor's chroma (reverses Q-U2-5), the peak clause dropped to 0 and perceptual's cusp run bounded at 100; both re-capture mode-isolation, declare the movement on `ramp-identity` (six identity lines in the verdict), re-read `hpg-role-contrast` FLOORS (`test/engine/semantic.mjs:252`), the `tonal-legacy.json` fixture and `gate:corpus-contrast`, and regenerate every colour export | 3 units, 7 points, two l6+ builders | every one of 3,780 curated ramps and the 16 default families move at stops other than 500 (a second export-wide movement after ADR-026's); the muted-sample-in-vivid-group intent that Q-U2-5 ruled is lost; the retune has failed twice on the L\* coupling |
| Close as resolved by #701 | nothing; the plan is superseded | 0 | the md5 identity above shows #701 moved no perceptual or peak cell; the issue's second sentence (a gate) stays unmet; the ruling would be false on the record |

## Blast radius (what U1 reports and what the PR body carries)

- `gate:sweeps` gains an eighth member; the adapter's `sweeps` row re-sums its low and high ends from the eight rows (today 376 to 496 s from seven); the CI `sweeps` matrix gains a leg, `fail-fast: false` unchanged.
- The report's `--envelope` output keeps every line the C5 pin of #701 reads (its md5 is a number pin; only the OK/FAIL suffixes and the exit code change after U2).
- No `src/engine/` hunk, no `dist/`, `figma/plugin/ui.html` or export regeneration.
- `docs/reference/SKILL.md` and `rubrics/acceptance-criteria.md` cite `chroma-envelope` lines in `test/engine/tonal.mjs` (the #701 U4 pins); U1 adds a file, it moves no existing line, and `node test/repo/citations.mjs` is the check (C10).

## Not in scope

- Any change to `chromaEnvelope`, `anchorChromaBasis`, `okhslStopsAnchored` or the shipped `damp` / `dampCurve` defaults (the 'Fix to the ruled targets' row, only on that ruling).
- The even-mode cells: #701 owns their construction; U1 gates them at their current figures as part of one fixture and nothing more.
- R27's end-stop chroma normalization as a rendered change; it is named in the ADR amendment as the route the owner declined, cited by ticket.
- The `--damp-amp` sweep, `env(500) = 1`, C6 (v) and the cusp-run gate in `test/engine/tonal.mjs`: unchanged and still the gates they are.

## Risks

| Risk | Where it bites | Mitigation |
|---|---|---|
| The factored measurement drifts from the report's loop by one field (the anchor omission the report itself once had, U4 pass 2 addendum 2) | C4's md5 | C4 is a byte pin on the printed numbers, and the gate imports the same function, so a drift shows in both or neither |
| The fixture's one-decimal rounding hides a real ratchet slip under 0.05 pp | C2, C3 | the fixture stores the unrounded percentile; the tolerance is stated in the gate header and in the adapter row |
| Sweeps timing under R57 load pushes the adapter's `sweeps` sum past the baseline-agrees check | C7 | the builder times three runs and records load, the R57 practice; the check script's derivation reads the rows |
| The ADR amendment restates the bars in words that a later reader takes as design intent rather than a measured freeze | C9 | the amendment says "measured at 89135e46, a ratchet, not a target" in its first sentence and names the fixture |

## Revisions

| Date | Change | Why |
|---|---|---|
| 2026-09-29 | Draft, planner (`chroma-envelope-planner`), measured on `main` 89135e46 / ea3099e4 | triage row 3 deferred #725 until #701 landed; #701 landed 2026-09-28 |
