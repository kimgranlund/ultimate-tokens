PASS

# Review: chroma-envelope U1 (#725), pass 1

Reviewed at `31f56c89` (base `plan/chroma-envelope` at `afd415c0`) in throwaway `git clone --shared` copies under `/tmp/ce-U1-rev-14012/` (and one under the job tmp dir for the committed-cell control). The unit worktree was never written; `git status --porcelain` there is empty after every run. Host load 4.3 to 5.2 during the runs.

## Criteria, rerun

| Id | Ran | Got | Negative control | Control result |
|---|---|---|---|---|
| C1.1 | `npm run gate:chroma-envelope` | exit 0, last line `  pass  chroma-envelope: 3 modes x 4 stops x 2 stats + 3 clause counts within fixture; direction holds in 3 modes` | fixture copy with `perceptual 300 median` minus 1.0 via `--fixture` | exit 1, `1 of 27 cells rose past fixture (perceptual 300 median)` |
| C1.1 | same | same | `--damp-amp 55` | exit 1, `27 of 27 cells rose` |
| C1.2 | fixture read; fresh `--capture --fixture <tmp>` at head | every figure matches the plan's literal; `capturedAt` afd415c0 (the unit base, which the row allows); a fresh capture's body equals the committed body byte for byte apart from `capturedAt` | clone at 282fca8d with U1's gate and lib copied in: `--capture`, then the gate against U1's fixture | capture prints `even ... above100 670`; gate exit 1, `3 of 27 cells rose past fixture (even 300 median, even 300 p90, even above100)` |
| C1.3 | `--full --capture` at head | `capture: every value equals ... file left unchanged`, clone porcelain empty | `perceptual 300 median` set to 93.049 and COMMITTED (1cc1dbfb), then `--capture`, then `git diff --exit-code HEAD -- <fixture>` | diff exit 1; the cell is back at 94.049, `capturedAt` moved to 1cc1dbfb |
| C1.4 | #701's C5 extraction, verbatim | `6e558839ee9e43217e1e2f7afc898b7b`, 17 lines, report exit 1 | same under `--damp-amp 55` | `3cf14766175041d45b2c119bc854f0da` |
| C1.4 | full `--envelope` output, plain and `--gate-path`, head vs a base clone | `cmp` byte-identical, both | n/a | n/a |
| C1.5 | `npm run gate:mode-isolation`; `--identity-control --base afd415c0` | `pass  mode-isolation: perceptual 990c17c5ae140e6e peak b59bd41501cd829a match fixture`; `0 differing cells` | `--perturb` | `1 differing cells` |
| C1.6 | `grep -c 'gate:chroma-envelope'` over the five files; `sh .sdlc/checks/baseline-agrees-check.sh` | 2 / 1 / 3 / 1 / 1; `ok    time gate:chroma-envelope: baseline 12 to 12 s, adapter 12 to 12 s`, `stale total: 0`, exit 0 | clone: `ci.yml` leg deleted; `baseline.md` row deleted | `ci.yml` 0; `STALE time gate:chroma-envelope: baseline 0 to 0 s, adapter 12 to 12 s`, `stale total: 1`, exit 1 (the literal-list entry is at `baseline-agrees-check.sh:35`) |
| C1.7 | `grep -n '#725'` over the three files; `grep -c 'U2 and U3 move'` | owner wording at `mode-isolation-gate.mjs:25` and `:73`, `mode-isolation.json:2`, `adapter.md:34`; plus `adapter.md:36`, the new §1 row. `grep -c` 2 / 1 / 1 | the same `grep` at the base | base `#725` lines: gate `:24`, `:73`, fixture `:2`, adapter `:34` (4, not 3); `U2 and U3 move` 0 / 0 / 0 |
| C1.8 | `npm test` in its own clone; porcelain; em-dash; citations; branding | `✓ all 54 test files passed` (1:32.5), porcelain empty, `em-dash: clean (1000 files scanned)`, `STALE 0 across 10 discovered docs + 11 fact pins`, `branding: clean (992 files scanned)` | a U+2014 appended to `.sdlc/plans/chroma-envelope.md` in a clone | `FAIL: 1 em dashes ...`, exit 1 |
| C1.9 | `git diff $(git merge-base origin/main HEAD) -- scripts/report-preset-fidelity.mjs \| grep -c TARGET` | `0` | n/a | n/a |

## Check 2: no engine output moves

- `git diff plan/chroma-envelope...unit/ce-U1 --stat -- src/` is empty. `chromaEnvelope(` in `tonal.js` is still 5.
- Under `test/engine/fixtures/`, only the new `chroma-envelope.json` and the `owner` string of `mode-isolation.json` change; its `capturedAt`, `perceptual` and `peak` fields are byte-unchanged.
- The report's `--envelope` output is byte-identical to base in both path modes. The factoring into `scripts/lib/envelope-measure.mjs` moves the loop verbatim. The imports the report dropped (`readFileSync`, `defaultDocument`) have no remaining static use; `report-preset-fidelity.mjs:359` and `:402` name `defaultDocument` only through the base-module lookup.

## Check 3: the ratchet and the direction leg bite

| Probe (scratch clone, one `tonal.js` hunk or one fixture edit) | Result |
|---|---|
| mild muted regression: perceptual `damp` x 0.95 (`tonal.js:435`) | exit 1, 8 of 27 cells rose, every one a perceptual cell (100/300/900 median and p90, 700 p90, cuspRuns 460 > 446); peak and even untouched |
| improvement: perceptual `damp` x 1.05 | exit 0, perceptual cells fall (median 16.8 / 92.4 / 73.4 / 29.8, cuspRuns 436); the ratchet does not red on a fall, as the plan rules |
| slack edge: fixture cell minus 0.04 / minus 0.06 | exit 0 / exit 1 |
| count slack 0: `even above100` 501 in the fixture | exit 1, `even above100 502 > fixture 501` |
| fixture cell plus 5 (a looser fixture) | exit 0 |
| builder's direction control: `uG` inverted in every mode, every fixture cell loosened +1000 | exit 1, `direction fails: even 900<700` (the leg bites on its own) |
| vacuity: fixture `n` + 1 | exit 1, 12 vacuity failures |
| vacuity: fixture missing `peak 700 p90` | exit 1, `missing 1 cell(s): peak 700 p90` (also in `--compare`) |
| `--compare` self / head +0.1 / head +0.04 / head count +1 / head fall 3 | `0 cells rose` exit 0 / `1 cells rose (... perceptual 300 median)` exit 1 / exit 0 / `rose: peak above100 2593 > base 2592` exit 1 / exit 0 with `even: moved against base` |
| `--capture --fixture <new path>` | writes a full fixture, `capturedAt` = HEAD |
| `--capture --damp-amp 55`; `--capture --compare x`; bare `--fixture`; `--damp-amp abc` | each exit 2 with its own refusal line |

Registration is complete: `package.json:37` own script and `:38` `gate:sweeps` member (last, so the composite reaches it), `ci.yml:119` matrix leg (the job runs `npm run ${{ matrix.gate }}`), `adapter.md:36` §1 row, `adapter.md:37` `sweeps` row reading eight gates with the sums rechecked (388 to 508 s), `adapter.md:98` CI leg list, `baseline.md:36` timing row (3/3, load noted), `baseline-agrees-check.sh:35`.

## The builder's two 🟡

- C1.5 upheld as a plan-text fix, not a unit defect. 3a3f2031 (#740/#744) re-captured `mode-isolation.json` from `34e544942d500b9e` / `f560f784d8a4883a` to `990c17c5ae140e6e` / `b59bd41501cd829a` before U1's base. U1 moves neither hash, and the gate passes against the fixture as it stood at the base.
- C1.7: the duplicate is justified. `mode-isolation-gate.mjs:73` is the `owner` literal that `--capture` writes into the fixture, and `:25` is the header comment. If only the header had been updated, U2's re-capture would write the stale "#725 is the perceptual/peak plan today" text back into the fixture. The "3 hits" literal was already wrong at the base: 4 lines there too (the header then ran over two lines, `:24`). The plan's own control, `grep -c 'U2 and U3 move'`, reads 2 / 1 / 1 at head and 0 / 0 / 0 at base.

## Findings, ranked

| # | Severity | Where | Finding |
|---|---|---|---|
| 1 | 🟡 low | `test/engine/chroma-envelope-gate.mjs:87-101` | `--compare` never compares `n`. A base and a head fixture captured over different populations report `0 cells rose` without comment. The measuring mode does catch an `n` drift (`:150-152`), and U2/U3 re-capture over the same corpus, so today nothing slips past. Adding the `n` equality to `--compare` would make that evidence self-checking. Not blocking. |
| 2 | 🟡 nit | `test/engine/chroma-envelope-gate.mjs:61-62` | `--compare` silently ignores `--damp-amp`. It is refused only with `--capture`. Harmless, since compare measures nothing. |
| 3 | info | `test/engine/chroma-envelope-gate.mjs:163-173` | The direction leg is coarse by design. A perceptual/peak-only end inversion (`uG` = `(1 - \|sd\|) ** c` outside even) raised stop 100 and 900 medians by 11 to 26 points and passed the direction leg, because 100 stayed below 300 and 900 below 700. The ratchet caught it on 9 cells. The leg meets the plan's definition and bites on a gross inversion (even 900<700). The ratchet does the fine-grained work. |

No correctness defect found. Scope wall: no U2 to U4 work, no `src/` hunk, no `TARGET` hunk, no bar re-ruled. No U+2014 in any added line. The retired maker brand appears nowhere in the handoff or this record (branding clean).

## For the Orchestrator: plan and record text, not unit defects

| # | Where | Fix |
|---|---|---|
| P1 | `.sdlc/plans/chroma-envelope.md:99` (C1.5 Expected), `:113` (C2.5), `:42` (the diagnosis prose) | `34e544942d500b9e` / `f560f784d8a4883a` become `990c17c5ae140e6e` / `b59bd41501cd829a` (re-captured by 3a3f2031). C2.5's "the two hashes change" must be read against the new pair. |
| P2 | `.sdlc/plans/chroma-envelope.md:101` (C1.7) | "3 hits" becomes 4 owner lines (gate header plus the gate's `owner` literal, fixture, adapter §1 mode-isolation row). The Today column was also 4 at the base. `adapter.md:36` adds a fifth, non-owner `#725` line. U4's C4.x owner-retirement row should name both gate lines. |
| P3 | `.sdlc/baseline.md:34` (mode-isolation row) | Pre-existing: its evidence cell still prints the retired `34e544...` / `f560f7...` pair. Not U1's to fix. |
| P4 | `.claude/skills/shipping-changes/SKILL.md:35-38` | Pre-existing stale record: the `sweeps` legs and `gate:sweeps` are described as five gates. It was seven before U1 and is eight now. Outside the plan's named registration surfaces, so it goes to U4 or a records follow-up. |
