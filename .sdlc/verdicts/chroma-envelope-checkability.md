# Criteria review chroma-envelope · 🟡 mobilizable at revision 2 (25 🟢, 3 🟡, 0 🔴 of 28); revision 1 was 🔴

| Field | Value |
|---|---|
| Plan | `.sdlc/plans/chroma-envelope.md` (draft, revision 1, R69 = B), read at `5eea7396` (`HEAD` = `origin/main`) |
| Asked by | Conductor, 2026-09-29: grade every criterion checkable by command with a negative control, U3's dL* bar included |
| Grade | verifier seat (opus), read-only; engine read at `origin/main:src/engine/tonal.js`, no gate run, no repo file edited |

Checkable means a named command, a stated pass value, and a control that turns it red.
🟢 checkable · 🟡 checkable, but the Expected or the control needs the rewrite named · 🔴 not checkable as written.

verdict: 🔴
sha: 5eea7396d40664542b0b091f2cf724bf9792969e

| Row | State | Evidence (the check I would run) | Negative control |
|---|---|---|---|
| C1.1 | 🟢 | `npm run gate:chroma-envelope`, exit 0 and the pass line the handoff names | fixture copy with `perceptual 300 median` lowered 1.0 exits 1 naming the cell (a lowered frozen cell sits below the measured one, past the 0.05 slack); `--damp-amp 55` exits 1 (the report already takes `--damp-amp N`, `report-preset-fidelity.mjs:13-15`) |
| C1.2 | 🟡 | `cat test/engine/fixtures/chroma-envelope.json` against the listed cells | as written, a `--capture` "at 282fca8d" needs the U1 gate copied into a scratch clone at that sha; the plan should say so. Also `capturedAt` = "the unit head" cannot hold: the commit that adds the fixture cannot name its own sha. Rewrite: `capturedAt` names the engine commit it measured (`33bd8920` or the unit's base) |
| C1.3 | 🟡 | `node test/engine/chroma-envelope-gate.mjs --capture && git diff --exit-code test/engine/fixtures/chroma-envelope.json` | as written the control does not bite: `sed` lowers a cell in the working copy, `--capture` rewrites it to the measured value, and `git diff` prints nothing. The control that bites: commit the `sed` edit in a scratch clone, then capture, then `git diff --exit-code HEAD` is nonzero |
| C1.4 | 🟡 | the named extraction and `md5` at the unit head and at `89135e46` in a scratch clone, byte-compared | `--damp-amp 55` changes the extraction. The "Today" md5 `6e558839...` is the perceptual plus peak READING (a) block, while the command's `grep` takes every `stop N:` line (even and READING (b) too), so the two md5s are of different spans. The plan should pin one extraction and name "the two clause lines" by their text |
| C1.5 | 🟢 | `npm run gate:mode-isolation`; `node scripts/report-preset-fidelity.mjs --identity-control --base $(git merge-base origin/main HEAD)` | `--perturb` (the mode's own control, `report-preset-fidelity.mjs:35-36`) reports nonzero |
| C1.6 | 🟡 | the `grep -c` counts per file; `sh .sdlc/checks/baseline-agrees-check.sh` exit 0 | "remove the `ci.yml` leg: adapter §1 and the workflow disagree" names no detector: `grep -c ci.yml .sdlc/checks/baseline-agrees-check.sh` prints `0` and no repo check compares the workflow to the adapter. The control is the grep count itself (`ci.yml` 1 to 0). The baseline-row control bites only once the new gate is added to the check's hard-coded list (the `baseline-agrees-check.sh` 1 count) |
| C1.7 | 🟡 | `grep -n '#725'` over the three files, 3 hits with the new text | the plan says n/a. Control: `grep -c 'U2 and U3 move'` over the same files at the base prints `0` |
| C1.8 | 🟡 | `npm test`, `git status --porcelain`, and the three `test/repo` checks | the plan says n/a. Control: a planted U+2014 in a scratch clone reds `node test/repo/em-dash.mjs` |
| C2.1 | 🟢 | `node -e` importing `anchorChromaBasis` (exported, `tonal.js:555`, signature `(stop, anchorStop, lift, anchorValue, groupValue)` matches) | on `main` the smoothstep blend reaches `groupValue` at stop 100 when lift is 0: `0.98` |
| C2.2 | 🟢 | `node scripts/report-preset-fidelity.mjs --envelope`, the two clause lines and the cells named | the engine at the base (the cap removed is `main`'s construction) prints `446` / `2592`. "Data-URL patched engine" cannot resolve `tonal.js`'s relative imports; a scratch copy with absolute imports (the planner's own `env-probe.mjs` method) does |
| C2.3 | 🟡 | `node test/engine/tonal.mjs --full`, the C6 (v) lines | `main` prints `3119` / `15.132599`. The Expected is conditional ("0 and 1.000000 ... if it is not 0 the builder names the count"), so any value passes. Rewrite: Expected `0` / `<= 1.000000`, and a nonzero count is 🔴 pending a plan revision |
| C2.4 | 🟡 | `node test/engine/tonal.mjs --full` and `node test/engine/anchor.mjs --full`, exit 0 and the three named lines | the control ("chroma > anchorChroma fallbacks or a tone miss") exercises the cap's tolerance at `:1330`, not the three gates the row grades, and it is a disjunction. Name one control per gate: a scratch engine that reds (iii c), `tone rose`, and `monotoneOk` each |
| C2.5 | 🟢 | the two `gate:mode-isolation` runs and `--identity-control`, six lines copied | the gate at the head against the base fixture reds on the old hashes |
| C2.6 | 🟡 | `npm run gate:chroma-envelope` after `--capture`; a cell-wise compare of the base and head fixture | "a rise in any cell is a defect" is a rule, not a control, and `git diff` of a JSON file is not a cell-wise test. Control: the compare, fed a head fixture with one cell raised 0.1, prints that cell |
| C2.7 | 🟡 | `node test/engine/semantic.mjs` (runs `checkFloors` against `FLOORS_BF2AAF6`, `semantic.mjs:346`, `:390`); `npm run gate:corpus-contrast`; `node scripts/gen-tonal-fixture.mjs && git diff --stat` | the hand-lowered floor bites. "A cell that drops is named and ruled" leaves the pass value open. Rewrite: a drop below `FLOORS_BF2AAF6` is 🔴 until a plan revision rules it |
| C2.8 | 🟡 | `npm test`, `git status --porcelain`, and the repo checks | the plan says n/a. Control: a generated export left uncommitted in a scratch clone makes `git status --porcelain` non-empty |
| C3.1 | 🟢 | `node -e` on `chromaEnvelope` (exported, `tonal.js:430`) at stops 300, 100, 500, damp 0, three modes | `main` prints `0.793` / `0.413`. The algebra checks out: at `d` 0.919 and `c` 1.585, `1 - 0.919 * (4/9)^1.585` = `0.7458` and `1 - 0.919 * (8/9)^1.585` = `0.2375` |
| C3.2 | 🟢 | `node scripts/report-preset-fidelity.mjs --envelope` exit 0 and the cells, perceptual 300 p90 `< 90.0` strictly | `--damp-amp 55` exits 1; a scratch copy at 70 / 1.5 prints U2's figures |
| C3.3 | 🔴 | none can be named that a verifier runs independently; see Findings | a solve stubbed to `l' = l` in a scratch copy is a fine control once the observable exists. "names the BZZR Primary cell" is a 92/0.5 witness, not a measured prediction at 91.9/1.585 |
| C3.4 | 🟡 | `node test/engine/tonal.mjs --full` exit 0 and the named lines | the stubbed-hold control at the new constants is a prediction (the 92/0.5 and 98/0.65 upticks were measured, 91.9/1.585 unheld was not). If it prints 0 upticks, the control has not bitten: fall back to the stub at 92/0.5, where the witness is on record. See also the C7 call-count note in Findings |
| C3.5 | 🟡 | `node test/engine/anchor.mjs --full` exit 0 and `C5 (monotone) is a true 0` | same as C3.4: "the stubbed engine reds on at least one anchored ramp" is unmeasured; name the fallback constants |
| C3.6 | 🟡 | `npm run gate:mode-isolation` and `npm run gate:chroma-envelope` (C2.5, C2.6) at U3's head | inherits C2.6's control rewrite |
| C3.7 | 🟡 | C2.7 and C2.8 again, plus three timed runs of `gate:corpus-tonal`, `gate:corpus-anchor`, `gate:chroma-envelope` | the plan says n/a, and "or the baseline row is re-timed" lets any time pass. Control for the timing: `sh .sdlc/checks/baseline-agrees-check.sh` reds when the adapter range and the baseline runs disagree |
| C4.1 | 🟢 | the named `sed ... \| grep -c 'Amendment (2026-'`, plus a read of the amendment's clauses | `main` prints `1` |
| C4.2 | 🟢 | `grep -n '#725'` over the three files, reading as history | at U3's head the U1 strings print their present-tense text |
| C4.3 | 🟡 | `grep -n '725' CHANGELOG.md` | the plan says n/a. Control: `grep -c 725 CHANGELOG.md` at the base prints `0`. `gh issue view 725` CLOSED and the roadmap row happen after landing, so no unit or pre-land verdict can grade them. Move them to the Orchestrator's close step (`.sdlc/adapter.md` §5) |
| C4.4 | 🟡 | `node test/repo/citations.mjs` STALE 0 and the other three | the plan says n/a. Control: `citations.mjs` at U4's base, after U2/U3 moved `tonal.mjs` lines, prints STALE above 0 |
| Constraint: even does not move | 🟢 | `ramp-identity` even lines `0 differing cells`; `npm run gate:even-dips` | `--perturb` |
| Constraint: `damp` 0 and stop 500 are the identity | 🟢 | C3.1's probe at damp 0 and stop 500; the `okhsl-modes` and `intensity-legacy` reads | a scratch engine that applies the hold at `env = 1` moves stop 500 |
| Constraint: `TARGET` unchanged | 🟡 | `git diff <base> -- scripts/report-preset-fidelity.mjs \| grep -c TARGET` prints `0` | the plan names no criterion row for it. Control: an edited `TARGET` line prints `2` |

### Findings

- 🔴 C3.3, the |dL*| <= 0.01 bar, has no observable a verifier can measure, and its measurement point is not defined.
  1. `okhslToRgb` returns 8-bit integers (`src/engine/okhsl.js`, `clamp255` is `Math.round`), and `paletteStops` returns `rgb`/`hex` after `enforceMonotonePixelL`. So "emittedContinuousRgb" exists nowhere a probe can reach, and 8-bit rounding alone moves L* by more than 0.01.
  2. `okhslStops` and `okhslStopsAnchored` are not exported. `s_basis` and `l` per stop are internal values.
  3. For `hueSpace: "oklch"` the hue is solved per stop at `(s, l)` (`tonal.js`, `solveOkhslHue(targetOklchHue, s, l)`). "(hue, s_basis, l)" does not say which hue: the one solved at the damped `(s, l')` or at `(s_basis, l)`.
  4. On peak the joint cap runs after the hold, and its fallback `hctToRgb` plus `refineNearestRgb` fires on "93.5% of capped stops" (`tonal.js:1330-1337`) and quantizes. Measured after the cap, peak cannot meet 0.01. Measured before it, the row must say so.
  
  Rewrite so it can be mobilized:
  - Name the point: the continuous colour after the hold, before the peak cap, 8-bit rounding and `enforceMonotonePixelL`.
  - Name the hue rule.
  - Name how the verifier reads the values. Either U3 exports one pure per-stop function (for example the hold taking `hue, sBasis, l, env` and returning `l'` and the continuous colour), which a verifier probe feeds the corpus's own inputs and checks with its own `lstarFromRgb`, or the row says the verifier instruments a scratch copy at that point.
  - Keep the stubbed-solve control. Assert it prints max dL* above 0.01 (the bar), not a named witness cell.
- 🟡 `test/engine/tonal.mjs:1190` requires exactly 5 `chromaEnvelope` occurrences (1 definition and 4 call sites). If U2's shared cap helper or U3's hold adds a call site, C2.4/C3.4 go red through C7, not through the envelope. The plan's lane and criteria should say whether C7 is re-counted.
- 🟡 Several rows carry conditional Expecteds (C2.3, C2.7, C3.7) that let any value pass. Each needs a fixed pass value, with a miss routed to a plan revision.
- Note: the plan names head `14a9b1cb`. `origin/main` is now `5eea7396`, which added this plan revision only.

## Revision 2 at 3f298808 · 🟡 mobilizable (25 🟢, 3 🟡, 0 🔴 of 28)

Re-read at `3f298808` (`origin/main`), same grade and method. Run here: the C1.4 extraction on `main` (`6e558839ee9e43217e1e2f7afc898b7b`, 17 lines, report exit 1, 3 min 30 s) and under `--damp-amp 55` (`3cf14766175041d45b2c119bc854f0da`). Checked in the tree: the new cites (`mode-isolation-gate.mjs:20-22`, `hct.js:237`, `anchor.mjs:750-754`, `tonal.mjs:314`, adapter corpus-tonal `86 to 116 s` and corpus-anchor `79 to 100 s`, `pif-u3.md:671`).

verdict: 🟡
sha: 3f298808c6e55d79210b9261d514a3a3556af506

| Row | State | Evidence (the check I would run) | Negative control |
|---|---|---|---|
| C1.1 | 🟢 | unchanged: `npm run gate:chroma-envelope` | lowered fixture cell and `--damp-amp 55`, as before |
| C1.2 | 🟢 | `capturedAt` names the measured engine commit, which matches the gate's own rule (`mode-isolation-gate.mjs:21`: capture writes the HEAD sha of the tree it measured) | a scratch clone at `282fca8d` with U1's gate copied in: `--capture` prints even above100 `670` |
| C1.3 | 🟢 | `--capture` then `git diff --exit-code` | a committed `sed` edit, then capture, then `git diff --exit-code HEAD` is nonzero. This bites |
| C1.4 | 🟢 | reproduced: the #701 C5 extraction prints `6e558839ee9e43217e1e2f7afc898b7b` on `main` | reproduced: under `--damp-amp 55` it prints `3cf14766175041d45b2c119bc854f0da` |
| C1.5 | 🟢 | unchanged: `npm run gate:mode-isolation` and `--identity-control` | `--perturb` |
| C1.6 | 🟢 | the `grep -c` counts, and the check script's list entry confirmed first | a `ci.yml` leg removed prints `0`; the baseline row removed makes the check exit `1` |
| C1.7 | 🟢 | `grep -n '#725'` over the three files | `grep -c 'U2 and U3 move'` at the base prints `0` |
| C1.8 | 🟢 | `npm test` and the repo checks | a planted U+2014 exits `1`; an uncommitted export makes `git status --porcelain` non-empty |
| C1.9 | 🟢 | `git diff <base> -- scripts/report-preset-fidelity.mjs \| grep -c TARGET` prints `0` | an edited `TARGET` line prints `2` |
| C2.1 | 🟢 | unchanged: the `anchorChromaBasis` probe | `main` prints `0.98` at stop 100 |
| C2.2 | 🟢 | `--envelope` clause lines; a scratch-copy engine, not a data URL | the base engine prints `446` / `2592` |
| C2.3 | 🟢 | fixed pass value `0` / `<= 1.000000`, any other value 🔴 | `main` prints `3119` / `15.132599` |
| C2.4 | 🟡 | `tonal.mjs --full` and `anchor.mjs --full` exit 0 | two of the three controls are not shown to bite. (a) The 92/0.5 witness on record (`pif-u3.md:670-671`) is `(C6 i) perceptual: 2 rise(s)`, a `tonal.mjs` C6 (i) failure, not an (iii c) or `anchor.mjs` monotone failure. (b) okhsl-modes fails at `rows[k].tone > rows[k - 1].tone + 0.5` (`tonal.mjs:314`) over 19 `STOPS`, so stop 500 to 550 sits about 5 L* apart. Adding 0.02 to `l` at 550 (about 2 L*) does not cross stop 500. Rewrite: set 550's `l` above 500's `l`, and name the gate the 92/0.5 run actually reds (C6 i), or measure the (iii c) and monotone reds before the unit relies on them |
| C2.5 | 🟢 | unchanged: `gate:mode-isolation -- --capture` and the six identity lines | old hashes red |
| C2.6 | 🟢 | `--compare <base fixture>` prints `0 cells rose` | a raised cell prints and exits `1` |
| C2.7 | 🟢 | `checkFloors` with a fixed pass value, a drop 🔴 | a hand-lowered floor reds |
| C2.8 | 🟢 | `npm test` and a clean tree | an uncommitted export and a planted U+2014 |
| C3.1 | 🟢 | unchanged (`0.7458` / `0.2375`) | `main` `0.793` / `0.413` |
| C3.2 | 🟢 | unchanged: `--envelope` exit 0 | `--damp-amp 55`; the 70 / 1.5 scratch run |
| C3.3 | 🟡 | now a defined point (continuous, after the hold, before the cap, rounding and `enforceMonotonePixelL`), reached through `holdTone`, `okhslToRgbFloat`, and `toneTarget`/`toneHeld` on each row. A probe can run it | the `l' = l` stub prints max above `0.01`, which bites. Concern: every figure the probe reads comes from the unit's own new code, so the probe as written checks the unit against itself. Add three independent cross-checks: `Math.round` of `okhslToRgbFloat` equals the existing `okhslToRgb` over a grid; `toneTarget` at the shipped `damp` equals `toneHeld` at `damp` 0 per stop (the basis and `l` do not read `damp`); and `lstarFromRgb` of the emitted 8-bit `rgb` sits within the rounding floor of `toneHeld` on perceptual rows |
| C3.4 | 🟢 | `tonal.mjs --full` exit 0 | the 92/0.5 unheld engine reds this command, on record through C6 (i) (`pif-u3.md:671`), whatever the row calls the gate |
| C3.5 | 🟡 | `anchor.mjs --full` exit 0, `monotoneOk` a true 0 | "92 / 0.5 reds `monotoneOk` on BZZR Primary" is not on record: the witness is a 0.209 L* rise in `tonal.mjs` C6 (i) on the non-anchored path, and `monotoneOk` reads pixel L* from the 8-bit hex, where a 0.2 rise can round away. Measure the stub against `anchor.mjs` before relying on it, or name a synthetic anchored control |
| C3.6 | 🟢 | C2.5 and C2.6 with `--compare <U2 fixture>` | a raised cell |
| C3.7 | 🟢 | fixed caps `<= 139 s` and `<= 120 s` from adapter `86 to 116 s` and `79 to 100 s`; a slower run 🔴 | an edited adapter figure makes `baseline-agrees-check.sh` exit `1` |
| C4.1 | 🟢 | unchanged: `grep -c 'Amendment (2026-'` inside ADR-026 prints `2` | `main` prints `1` |
| C4.2 | 🟢 | unchanged: `grep -n '#725'` reads as history | U1's present-tense strings |
| C4.3 | 🟢 | `grep -c 725 CHANGELOG.md` `>= 1`; the issue close moved to §5 | the base prints `0` |
| C4.4 | 🟢 | `citations.mjs` STALE `0` | a pin moved by one prints STALE `1` |

### Findings (revision 2)

- 🟡 C2.4 and C3.5: the stubbed and synthetic controls name gates the record does not show them reddening (the 92/0.5 witness is a `tonal.mjs` C6 (i) rise, and a +0.02 `l` bump does not cross the okhsl-modes 0.5 slack across a roughly 5 L* stop gap). The builder should measure each control before relying on it, and a control that does not bite is a finding in the handoff.
- 🟡 C3.3: the measurement is now defined and bites, but its inputs are the unit's own exports. The three cross-checks above tie them to code the unit did not write. I will run them at U3's verdict whether or not the plan adds them.
- No row is 🔴, so the plan can be mobilized. The three 🟡 rows are checkable as written. Their rewrites tighten the controls and do not block.
