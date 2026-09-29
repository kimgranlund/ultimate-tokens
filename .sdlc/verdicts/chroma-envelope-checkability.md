# Criteria review chroma-envelope · 🔴 not mobilizable (11 🟢, 18 🟡, 1 🔴 of 30)

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
