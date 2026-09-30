---
kind: verdict
plan: chroma-envelope
unit: U2
ticket: "#725"
branch: unit/ce-U2
base: b149f8dd
grade: verifier-l2 (opus), stand-in while fable is capped; an opus build's checkers are opus per b9044bb; evidence run chroma-envelope-U2-verifier-l2-p2, spot-checked by the Verifier seat
pass: 2
written: 2026-09-29
---

# Verdict chroma-envelope U2 · 🔴 · every C2 row reproduces under revision 5 and every control bites, but the unit's C6 (v) comment states 15 excluded and 3,749 measured where the gate measures 72 and 3692

verdict: 🔴
sha: 0627f87480424c34b09c3ac7ffd7bc277f51bfd2

Graded against `.sdlc/plans/chroma-envelope.md` revision 5 (`b149f8dd`, the unit's merge-base with the plan). Pass 1 (`ec496bd0`) stopped for re-diagnosis and was never graded; this is the first verdict, recorded as pass 2 to match the unit's pass. Five fresh clones (`gates`, `neg`, `neg2`, `build` with `npm ci`, `base` at `b149f8dd`); host load 4.4 to 7.4. `verdict.py check` passed on the handoff, the pass 2 review and the re-diagnosis record. The seat re-read F1's comment and the baseline row at the head.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| C2.1 | 🟢 | `anchorChromaBasis(s, 500, 0, 0.30, g)`: g 0.98 `0.300000` at all 19 stops; g 0.20 `50:0.200000 100:0.203429 300:0.258299 500:0.300000 ... 950:0.200000` | base engine, g 0.98: `50:0.980000 100:0.956680 300:0.583567` (climbs) |
| C2.2 | 🟢 | `--envelope` prints `gate path` and `anchored` per mode; gate-path perceptual `stop 300: median 79.9% (<=75 FAIL) / p90 97.9% (<=90 FAIL)`; anchored peak `above 100% of stop 500: 0 OK`; `over 90 at stop 300: 1042 of 2920`; each equal to the plan's head row | `pal.anchor` fed to the gate-path set: that heading prints `p90 106.7% (<=90 FAIL)`; base `tonal.js`: anchored perceptual `445 FAIL`, peak `2592 FAIL` |
| C2.3 | 🔴 | gate: `C6 (v) white-pixel exclusion (stop 500 CAM16 C < 2.869): 72 palette(s)`, `anchored peak overshoot: 0/3692 violator(s)`; `#FFFFFF` CAM16 C `2.8690352`. The unit's comment at `test/engine/tonal.mjs:1850` to `:1851` reads `the 15 near-grey anchors below WHITE_PIXEL_C are excluded above, leaving 3,749 measured`: false at the head | `WHITE_PIXEL_C = 0`: `0 palette(s)`, `15/3764`, `max 2.023757x`, ratchet FAIL `violator count rose to 15` |
| C2.4 | 🟢 | `anchor-ramp monotone: 0`; reds only the deferred `gap (19-stop) allow-list: 89`, `distinct (25-stop) allow-list: 31`, `notch ...: 15`; achromatic `even 9 of 9`, `perceptual/peak 20 of 20 cells CAM16 C below 5`; f4 `max OKLab dE 0.0184 (want <= 0.02)`; the four list bodies untouched | 92 / 0.5 engine: `(iii c) ... ROSE on 96 of 10080 grid cells`; tone rose at 550: `tone rose at stop 550`; synthetic rise: `monotone: 13520`; climb engine: `11 of 20 cells`; f4 bound 0.01: FAIL |
| C2.5 | 🟢 | `pass mode-isolation: perceptual a874ac86f2e113b4 peak 815dcec4262382da match fixture (captured at 351eee68...)`, committed; `--identity-control --authored --base b149f8dd`: `identity perceptual: 3023/3780 palettes, 67892/94500 cells differ`, `identity peak: 3378/3780 ...`, `identity even: 0/3780 palettes, 0/94500 cells differ`, default kit `16/16`, `16/16`, `0/16` | `b149f8dd`'s fixture on the head engine: `FAIL mode-isolation ... do not match fixture`, exit 1 |
| C2.6 | 🟢 | gate `--full` exit 0 `pass chroma-envelope ...`; `--capture` byte-identical; `--compare` against the base fixture: `0 cells rose`, exit 0 | perceptual 300 median raised 0.1: `1 cells rose`, exit 1 |
| C2.7 | 🟢 | `semantic.mjs` exit 0 `0 unlisted drops, 0 further erosion`; `gate:corpus-contrast` `worst overall 4.500:1`; `tonal-legacy.json` unchanged; peak Tertiary light `8.2001` to `8.1825`, pinned `8.1` | pin left at 8.2: `FAIL role-contrast, peak Tertiary LIGHT ... 8.18:1, below its pinned floor 8.2:1` |
| C2.8 | 🟢 | `npm test`: `✗ 2/54 test file(s) failed`, exactly three FAIL lines: `gap (19-stop) allow-list: 13`, `distinct (25-stop) allow-list: 6`, `(C6 ii) perceptual: 3 duplicate-hex pair(s)`; porcelain `0`; em-dash, branding, `citations ... STALE 0` | planted U+2014: `FAIL: 1 em dashes`; a byte in `describe-mcp-assets.js`: porcelain `M` |
| Scope | 🟢 | `git diff ec496bd0 0627f874 -- src/engine/`: `0` lines; every other path is a C2 row, a regenerated export, or an R69 re-pin (`citations.mjs` STALE 0; spec EX-2 literals equal `exports.mjs:532` to `:542`) | anchor-stripped identity-control: `0` cells in all six lines, so only anchored perceptual and peak moved |
| Build | 🟡 | `npm run build` exit 0 `wrote figma/plugin/ui.html 4148.2 KB`, porcelain empty; `baseline-agrees-check.sh` exit 1 `STALE ui.html: baseline 4141.3 KB, tree 4148.2 KB`; handoff `:54` says `not run (no build-chain change)` | at `b149f8dd`: `ok ui.html: baseline 4141.3 KB, tree 4141.3 KB`, `stale total: 0` |
| Records | 🟡 | handoff figures reproduce (C2.1 to C2.8, 72 / 0/3692, all six `--authored` lines); imprecise: `anchor.mjs --full` `114.5 s` single reading (measured `122` to `160 s`, base `93`, `97 s`); 31 of 32 moved FLOORS cells undeclared per cell (none crosses a pin); `test/ui/shell.mjs:286` control compares a row with itself | the one declared cell (`8.2001` to `8.1825`) is the one the pin control reds |
| Hygiene | 🟡 | `git log --format='%h [%(trailers:key=Seat,valueonly)]' b149f8dd..0627f874`: `[]` on all nine; none stages `.sdlc/board.md` | plan merges read `[orchestrator]` in the same format |

### Findings

1. 🔴 C2.3: the gate is right (72 excluded, 0/3692) and the handoff says so, but the comment the unit wrote above `PEAK_VIOLATOR_PIN` (`test/engine/tonal.mjs:1850` to `:1851`) states 15 and 3,749. The review's F3 named it; it is unfixed at the head.
2. 🟡 Build: the unit moved the committed bundle to `4148.2 KB`, so `baseline-agrees-check.sh` exits 1 at the head. By the standing precedent the unit that moved the figure corrects `.sdlc/baseline.md` in its own change; fix it in pass 3.
3. 🟡 Plan text (revision 6 material): C2.3 Expected says `0/3749` and "15 excluded" (the rule excludes 72; 15 are the violators among them); C2.5's command needs `--authored` to show the declared movement; C2.7's `8.2782` for peak Tertiary is the even figure (peak was `8.2001`); the lane line does not list `test/ui/`, `docs/spec/` or `docs/reference/reviews/`, admitted here by R69.
4. 🟡 Timing: `anchor.mjs --full` runs about 28% slower than base (paired `122 s` against `93` to `97 s`). No U2 row binds it; U3's C3.7 (at most 120 s) will read red unless U3 recovers the time or a revision re-times the row.
5. 🟡 Records: declare the 31 other FLOORS moves (peak Data 6 dark now `5.6007`, over the one-decimal line), and replace the vacuous `shell.mjs:286` control.
6. Pass 3 needs the comment corrected and the baseline KB row moved; every other row carries if the diff from `0627f874` touches only `test/engine/tonal.mjs` comments and `.sdlc/`.
