---
kind: verdict
plan: chroma-floor
unit: U3
ticket: "#701"
branch: unit/cf-U3
base: 022e1443
grade: verifier-l1, the evidence run dispatched by the Verifier seat
pass: 1
written: 2026-09-28
---

# Verdict chroma-floor U3 · 🔴 · the gates and greps pass, but the CHANGELOG entry and the adapter's sweeps sum state false figures

verdict: 🔴
sha: 7cea7c41704ae1f8efe0e2576a53532b6624f259

The head is `7cea7c41`; the code and records head is `ba8eece2`, and `7cea7c41` adds only the review. U3's own diff is `27c513c1..ba8eece2`: 10 files, none of them under `src/`, `test/`, `scripts/`, CI or `package.json`, so C2 to C9 and C13 stand on the U1 and U2 verdicts and are rerun at pre-land. C1's base is `282fca8d` (N 50, as the plan states). C10's base is `git merge-base HEAD origin/main`, which prints `022e1443`. The unit's plan copy differs from `69031e01` only on the line 203 checkbox. Evidence comes from two throwaway shared clones.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| C1 | 🟢 | `✓ all 50 test files passed`, `exit 0`, `git status --short \| wc -l` prints `0`. N moves to 53 at the origin/main merge, a re-read owed at pre-land | the scrim sed gives `✗ 1/50 test file(s) failed`, `exit 1` |
| C10 | 🟢 | the generators leave the tree at `0`; `git diff --stat 022e1443 -- docs/` lists 8 paths, all inside the plan's ten | a line appended to `knowledge-01-color-engine.md` gives 9 paths, `grep -c knowledge-01` prints `1` |
| C11 | 🟢 | the seven greps print `0`, `0`, `0`, `1`, `1`, `0`, `2`. All three allow-lists are gone as live lists; the names survive only in history comments | scratch copies with `const LONE_SPIKE_ALLOW = [...]` and `const EVEN_DIP_BASELINE = [...]` appended print `1` each |
| C12 | 🟡 | on the branch, `baseline-agrees-check.sh` prints `ok time gate:mode-isolation: baseline 48 to 65 s, adapter 48 to 65 s`, `ok time gate:even-dips: baseline 19 to 23 s, adapter 19 to 23 s`, and `stale total: 1` (`STALE ui.html`, which main's merge moves). The plan grades it on the rebased head at pre-land | the adapter even-dips cell set to `~19 to 22 s` gives `STALE time gate:even-dips`, `stale total: 2` |
| Timing rows (C4, C6) | 🔴 | the six readings are real runs: the log mtimes match each duration and every log reads `PASS` with hashes `34e544942d500b9e` and `f560f784d8a4883a`; both rows quote load. Two false records follow. (1) `baseline.md:31` bases the even-dips row on `under owner ruling R57`. R57 covers mode-isolation only; R65 (`537de9db`) extended it to even-dips after the runs, and the branch never names R65. (2) Adapter §1's `sweeps` row still reads `355 to 475 s, derived by summing the seven rows' own low ends and high ends above (86+79+67+57+20+20+26 to 116+100+86+83+23+34+33)`. U3 changed two of those rows, so the sum is now `376 to 496 s` | `node test/engine/even-dips-gate.mjs --full --floor-scale 1.6` gives `120 dips`, `FAIL`, `exit 1` |
| Records against the engine | 🔴 | the formulas match `src/engine/tonal.js` everywhere (`floorC`, `floorRef` over 450/500/550, the smoothstep shoulder under `isEven`, `chromaFloor` default 40). Added lines carry `0` U+2014; branding is clean; `citations.mjs` prints STALE 0. Two false facts sit in the shipped CHANGELOG 1.65 entry. Line 10 says `90 named dips. Both are 0 now`, but 32 dips at stop 500 remain, as line 19 of the same entry says. Line 17 says `23.4 CAM16 C at one stop of one tertiary ramp`, but the U2 movement log and handoff read `23.3753` at Tongass `secondary stop 175` | not applicable: this row is a reading |

## Findings

- 🔴 F4 and F5: `docs/reference/CHANGELOG.md` lines 10 and 17 (the Records row).
- 🔴 F1: `.sdlc/baseline.md:31` cites R57 for even-dips, and R65 is named nowhere on the branch (the Timing row).
- 🔴 F2: the adapter §1 `sweeps` sum is stale because of U3's own edit (the Timing row).
- 🟡 F3: `.sdlc/baseline.md` lines 6 and 33 still say `load under 5` for every counted run. The two rows U3 made 3/3 were read at load 21 to 42. This predates U3, which made them counted rows. My runs at load 33 to 48 took 64.65 s and 204.46 s, so the ranges describe one load level, not the gate.
- 🟡 F6: the ADR amendment calls the floor `envelope-relative in the interior`. The formula on the same line has no envelope term; it is gamut-relative and capped at the 450/500/550 ceiling.
- 🟡 F7: the glossary `chromaFloor` row credits `the old chromaFloor% · maxc` with the whole retired dip baseline. `tonal.js:405` to `409` credits 57 of the 90 to the envelope's slope, and 32 are stop-500 notches.
- 🟡 F8: the `nothing beyond stops 400/600 moves` wording in `foundations.md` and knowledge-02 holds at lift 0 only. `0.2 lifted-stop units` is really 90 lifted-stop units, since `sd` is normalised by 450.
- 🟡 F9, a plan item: the plan does name ADR-025 (U3 bullet and C10), but ADR-025 is the on-color decision (`decision-records.md:696`). ADR-026 (`:767`) records #701's `chromaFloor` side. The plan's `both allow-lists` should read three, as C11 and the ADR line already say.
- 🟡 F10, a records item: the unit review sits in `.sdlc/reviews/`, while this plan's U1 and U2 reviews sit in `.sdlc/verdicts/`. The plan has no path-level wall, so no criterion moves.
- 🟡 In the handoff, `Host: 1-minute load 21 to 103 through the timing runs` does not match its own timing table, which spans 21.43 to 42.34. The C1 control it marks `not re-run` was run here: `exit 1`.
