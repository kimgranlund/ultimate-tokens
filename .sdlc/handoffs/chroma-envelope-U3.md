# Handoff chroma-envelope U3 pass 1 · builder → orchestrator

| Field | Value |
|---|---|
| Branch | unit/ce-U3: the engine commit is 67cc0cde and this handoff is the commit after it, on base ee6fadbe (plan/chroma-envelope, revision 6, U1 and U2 merged) |
| Scope | the perceptual/peak damp retune (`OKHSL_DAMP_D` 0.9275, `OKHSL_DAMP_CURVE_GAIN` log2(3)/1.5, a power residue), the per-stop tone hold (`holdTone`, `okhslToRgbFloat`, `toneTarget`/`toneHeld` rows), the peak cap's own `capped` flag read by `anchor.mjs` f4, the one-time allow-list freeze, the fixture re-captures and re-pins |
| Status | 🔴 open on Q5, Q6 and F2. R76 ruled Q1 to Q3 and R77 ruled Q4 and Q7. `npm test` exits 1 on `anchor.mjs` f4 only (Q6). C3.3 x2 anchored oklch is red (Q5). C3.5 has `monotoneOk` at a true 0 but exits 1 on f4 (Q6). The corpus-tonal and chroma-envelope absolute times are over their rows on this host (F2) |
| Files, engine | `src/engine/tonal.js`, `src/engine/okhsl.js`, `src/ui/model.mjs` (one line: carries `capped` onto the projected row) |
| Files, report | `scripts/report-preset-fidelity.mjs`, `scripts/lib/envelope-measure.mjs` (`--damp`, `--damp-curve`) |
| Files, tests | `test/engine/tonal.mjs`, `test/engine/anchor.mjs`, `test/engine/exports.mjs`, `test/engine/semantic.mjs` |
| Files, fixtures | `chroma-envelope.json`, `mode-isolation.json`, `tonal-legacy.json`, `shadcn-baseline.css`, `radix-baseline.json`, `test/ui/fixtures/default-doc-ramps.json` |
| Files, generated | `docs/reference/data/adia-*`, `src/ui/describe-mcp-assets.js`, `figma/plugin/ui.html` |
| Files, docs | `docs/spec/spec-panda-park-ui-exports.md`, the two reactivity review citations, `.sdlc/baseline.md`, `.sdlc/questions/chroma-envelope-U3.md`, this handoff |
| Untouched | `FLOORS_BF2AAF6`, `PENDING_U4`, the FLOORS `// measured` comments (U4's), the plan file, `.sdlc/board.md`, `test/engine/chroma-envelope-gate.mjs` |

## Criteria

| Id | Evidence at head | Control run | State |
|---|---|---|---|
| C3.1 | With damp 70 and dampCurve 1.5, perceptual and peak both read 0.7435 at 300/700 and 0.2304 at 100/900. Each is within 0.02 of its bar (0.75, 0.25). All three modes read 1.0 at stop 500. At damp 0, perceptual and peak read 1.0 at 300, 100 and 900. Even reads 0.3175 / 0.1150, byte-identical to base. The effective constants are d = 0.9275 (`OKHSL_DAMP_D`) and c = 1.5 × log2(3)/1.5 = log2(3) = 1.585 | The same probe at base ee6fadbe prints perceptual and peak 0.7926 / 0.4134 (the plan's 0.793 / 0.413) | 🟢, d 0.9275 per R76 Q3; deviations D2 and D4 |
| C3.2 | `--envelope`, READING (b): perceptual and peak read 74.3 at 300/700 and 23.0 at 100/900. READING (a), gate path: perceptual 6.1 / 74.6 / 59.1 / 13.9 median and 10.1 / 89.3 / 63.8 / 17.4 p90, so 300 p90 is 89.3, strictly under 90. Peak gate path is at most 38.1 / 67.5. Anchored: perceptual 300 p90 is 100.2 (U2 106.7); over 90 is 610 (U2 1042); peak is 99.5 (U2 97.4), over 90 is 507 (U2 575). Peak `above 100% of stop 500` is 0 on both blocks. Even is byte-identical. Perceptual `rule violations` is exactly 1: Kea primary-muted `#E1F5DA` at 227.26% (226.02 at U2), the named authored exception R76 Q2 rules, reported and not excluded. Southern trap does not fire, and there is no second name. Two anchored peak cells rose past U2's plus 0.05, the declared R76 Q1 cost (see C3.6) | `--damp-amp 55` exits 1, with gate path 300 at 109.8 / 123.6 FAIL and peak above-100 1375 FAIL. The damp 70 / 1.5 override is a no-op on this corpus, which already sits at 70 / 1.5 (D3), so the U2 figures were read from the base run instead. Base gate path perceptual 300 is 79.9 / 97.9 FAIL, anchored 106.7 | 🟢 per R76 Q1 and Q2 (revision 7), with finding F1: the row's `exit 0` and `rule violations exactly 1` cannot both hold, the report exits 1 on the Kea line alone |
| C3.3 | The probe (`$T/c33.mjs`) reads 15936 cases (report 5840, kit variants 16, grid 10080), both stop sets, and finds 0 rows missing the fields. At env < 1 (668096 rows), the max \|held - target\| is 6.0e-8. At env = 1, `held === target` on 731840 of 731840 rows, and `holdTone` returns `l' === l` on 8316 of 8316 points. x1 finds 0 mismatches over 8316 points. x2: cam16 0, oklch non-anchored 0, anchored oklch 1.00725 at default Warning perceptual stop 150, against a bar of 0.01 (Q5). x3 finds 0 of 128224 perceptual rows outside the rounding floor | On the unheld stub (`holdTone` returning `l' = l` at the new constants), env < 1 max is 4.592. x3 puts 36862 rows outside the floor (e.g. Maison Success stop 150, \|84.259 - 86.994\| > 0.265). The x1 control (+0.6 per channel) gives 7527 mismatches | 🟢 held, 🔴 x2 anchored (Q5) |
| C3.4 | `tonal.mjs --full` exits 0, with 23 pass lines, `pass  skew-lift-okhsl`, and a real time of 130.1 s at load 5.0. `GRID_R2_EXCEPTIONS` goes from 21 to 12. The 21 old keys are all fixed by the hold, and each is named in the comment. The 12 new keys are the sub-rounding quantization rises R77 Q4 rules in (hue 165, lift 40, stops 250 to 350, +0.011 to +0.037 L\*), and all 12 are observed at head. `okhsl-modes` passes, with tone rose 0. `cusp-pull` passes. C6 (v) is still pinned at 0/3692 and max 0.000000. `chromaEnvelope(` appears 5 times. `chroma-envelope` passes. | The unheld stub at the new constants (`holdTone` returning `l' = l`) through the same (iii c) grid probe gives 28 rises beyond the list, and 4 of the 12 keys are not observed. So the new-constant stub bites and the 92/0.5 fallback was not needed. With one key removed (`peak|cam16|165|0|40|100|300&350`), the probe reports exactly that key | 🟢 per R77 Q4 |
| C3.5 | `anchor.mjs --full`: `anchor-ramp monotone: 0` and `default-kit monotone: 0` (a true 0, no list). The exit is 1 on f4 only: the default kit's codes bound reads 3 > 2 (Q6) | Synthetic anchored rise (stop 550 = 500 + 20 per channel): `anchor-ramp monotone: 13520` and `default-kit monotone: Neutral #576485 [perceptual, 19-stop]`, exit 1. The unheld new-constant stub prints `anchor-ramp monotone: 0`, so it does not bite. That is recorded as a finding (D8), as the plan predicts | 🟢 monotone, 🔴 exit on f4 (Q6) |
| C3.6 | Mode-isolation re-captured: perceptual `5590d6df3c42b90f`, peak `d39b856cbac5627b` (were a874ac86 / 815dcec4). Identity lines against base: perceptual 3779/3780 palettes, 75339/94500 cells, max dL\* 2.4410; peak 3779/3780, 74138/94500, 2.3142; even 0/3780, 0; kit perceptual 16/16, 333/400, 2.4127; kit peak 16/16, 334/400, 2.2460; kit even 0/16, 0. The envelope fixture is re-captured and even is byte-identical. `--compare <U2 fixture>` prints `2 cells rose` (peak 100 median 8.5306 to 8.8953; peak 300 p90 97.4215 to 99.4957) | Before the re-capture, the gate reds `mode-isolation: perceptual 5590d6df... do not match fixture`. `--compare` fed a head fixture with one raised cell prints it | 🟢 per R76 Q1: exactly the two named cells. Cause: the `#2E7D4F` success anchor's stop 300 was 97.42% uncapped at U2 (#83CE99). Under the retune it crosses stop 500's chroma, and the peak cap sets it to 99.50% (#7DD1A1, `capped`). The unheld engine rises the same, so the cause is the retune, not the hold. The handoff commit's message names both |
| C3.7 | C2.7: the FLOORS moves are listed below. 34 of 96 cells move and 2 cross their pins, both accepted as declared costs by R77 Q7. `semantic.mjs` exits 0. C2.8: `npm test` exits 1 on `anchor.mjs` f4 only (Q6). Flag probe (`paletteStops` peak, anchor #2E7D4F, hue 150, chroma 60, 25 stops): row 350 #6EBC8D is `capped: true`, row 50 #FFFFFF is `capped: false`, and 3 of 25 rows are capped. The flag agrees with the diff it replaces on 7464 of 7464 stops, 0 disagreements either way (D9). Timing pairs are below. corpus-anchor misses 120 s (head slowest 174.54 s) and takes the ruled paired ratio, 174.54 / 181.58 = 0.961, which is at most 1.2. corpus-tonal (207.57 s against 139) and chroma-envelope (21.31 s against U1's row times 1.2) miss their absolute rows, and the plan rules no fallback for them. Their paired ratios are 1.058 and 1.051 (finding F2) | `baseline-agrees-check` in a scratch clone with adapter corpus-tonal edited to 126 prints `STALE time gate:corpus-tonal`, exit 1. With the flag forced true on every peak row, f4 reds on 74050 stops the diff never moved, exit 1 | 🟢 floors, flag and anchor ratio; 🔴 tonal and envelope absolute time (F2); C2.8 🔴 on Q6 |
| C3.8 | Freeze at head, each list's header comment naming its movement. RAMP_GAP_ALLOW 72 to 83: 17 added, 6 removed; every addition is peak 50&100, 100&150 or 900&950. RAMP_DISTINCT_ALLOW 16 to 19: 6 added, 3 removed; additions at stops 50 to 125 or 825 to 875. NOTCH_ALLOW 17 to 15: 0 added, 2 removed (the #739 pair, already gone at U2). KNOWN_BASELINE_DUP 22 to 32 keys: 20 added, 10 removed; additions at stops 50 to 150 or 800 to 925, or Nike's clamped #FFFFFF. After the freeze, the three C2.8 rows are green in `npm test`, and `anchor.mjs --full` and `tonal.mjs --full` show no allow-list line | In-file `allowListMatches`: at U2's values the same rows red (`gap 83 (expected 72)`, `distinct 19 (expected 16)`, `notch 15 (expected 17)`, C6 ii `3 duplicate-hex pair(s)`). The mid-ramp member rule is for the verifier to read in the diff | 🟢 lists, with `gate:corpus-tonal` green after R77; 🔴 `npm test` and `gate:corpus-anchor` until Q6 |

## Sweep timing pairs (C3.7)

Host: this Mac, the same session, `npm run -s <gate>`. The order ran per sweep, rounds 1 to 3, head (`.worktrees/ce-U3` at 67cc0cde) then base (a code-identical copy of ee6fadbe), back to back. The load is the three `uptime` averages at the start of each run. Every tonal and anchor run exits 1: tonal on (iii c) before R77, anchor on f4. Envelope runs exit 0.

| Sweep | Round | Head s | Head load | Base s | Base load |
|---|---|---|---|---|---|
| corpus-tonal | 1 | 207.57 | 4.48 4.62 4.80 | 196.25 | 6.12 5.04 4.91 |
| corpus-tonal | 2 | 197.69 | 5.49 5.31 5.05 | 178.61 | 5.74 5.26 5.06 |
| corpus-tonal | 3 | 196.20 | 5.54 5.22 5.06 | 177.59 | 4.93 5.93 5.49 |
| corpus-anchor | 1 | 174.54 | 4.67 5.39 5.34 | 181.58 | 5.79 5.31 5.29 |
| corpus-anchor | 2 | 171.97 | 4.69 5.27 5.29 | 176.17 | 4.55 4.96 5.15 |
| corpus-anchor | 3 | 172.29 | 5.38 5.01 5.13 | 178.03 | 3.57 4.66 4.98 |
| chroma-envelope | 1 | 21.00 | 4.10 4.40 4.81 | 19.83 | 3.98 4.36 4.78 |
| chroma-envelope | 2 | 21.31 | 5.85 4.73 4.90 | 20.28 | 5.34 4.72 4.89 |
| chroma-envelope | 3 | 20.94 | 5.25 4.73 4.89 | 19.76 | 4.60 4.62 4.85 |

Slowest of three, head over base:

- corpus-tonal: 207.57 / 196.25 = 1.058.
- corpus-anchor: 174.54 / 181.58 = 0.961. The flag removed the uncapped re-render, so head is faster than base.
- chroma-envelope: 21.31 / 20.28 = 1.051.

**F2:** at this load, base also misses every absolute row (tonal 196 s, anchor 182 s, envelope 20 s). The absolute bars measure the host, not the change.

## FLOORS moves (C3.7, C2.7 repeated)

Moves are head vs base ee6fadbe on `brandKit(defaultDocument())` accent on its on-colour, to 4 dp. 34 of 96 cells move and even moves 0. Two cells cross their pin, both re-pinned rounded down in FLOORS:

- **Peak Success light:** 7.6022 to 7.5925. Re-pinned 7.6 to 7.5; its bf2aaf6 floor is 7.2.
  - Control: with the pin left at 7.6, the test reds `7.59:1, below its pinned floor 7.6:1`.
- **Perceptual Data 3 dark:** 4.9376 to 4.8869. Re-pinned 4.9 to 4.8 in FLOORS.
  - Its `PENDING_U4` pin also goes from 4.9 to 4.8, per R77 Q7, and `semantic.mjs` exits 0.
  - Control: with `PENDING_U4` left at 4.9, it reds `perceptual Data 3 dark: 4.8 is below its PENDING_U4 pinned floor 4.9`.

R77 Q7 accepts both crossings as declared costs of the retune.

No other cell crosses its FLOORS or PENDING_U4 pin. The largest drop is the Data 3 cell above.

| Mode | Family | Side | Base | Head | Delta |
|---|---|---|---|---|---|
| perceptual | primary | dark | 4.9787 | 5.0444 | +0.0658 |
| perceptual | secondary | dark | 5.2155 | 5.2092 | -0.0063 |
| perceptual | tertiary | light | 7.8298 | 7.8533 | +0.0234 |
| perceptual | tertiary | dark | 5.6234 | 5.6543 | +0.0309 |
| perceptual | danger | light | 8.2388 | 8.2409 | +0.0021 |
| perceptual | data-1 | light | 6.0201 | 6.0807 | +0.0606 |
| perceptual | data-1 | dark | 4.6849 | 4.7670 | +0.0822 |
| perceptual | data-2 | light | 6.3203 | 6.3308 | +0.0105 |
| perceptual | data-2 | dark | 4.7586 | 4.7470 | -0.0116 |
| perceptual | data-3 | light | 6.1005 | 6.1470 | +0.0465 |
| perceptual | data-3 | dark | 4.9376 | 4.8869 | -0.0507 |
| perceptual | data-4 | dark | 4.7971 | 4.8226 | +0.0255 |
| perceptual | data-5 | dark | 5.0616 | 5.0581 | -0.0035 |
| perceptual | data-6 | dark | 5.2838 | 5.2632 | -0.0206 |
| perceptual | data-7 | dark | 5.1565 | 5.1459 | -0.0106 |
| perceptual | data-8 | dark | 4.9924 | 4.9969 | +0.0045 |
| peak | primary | dark | 4.7798 | 4.7826 | +0.0028 |
| peak | secondary | dark | 5.6082 | 5.6014 | -0.0068 |
| peak | tertiary | light | 8.1825 | 8.2563 | +0.0738 |
| peak | tertiary | dark | 5.3795 | 5.4085 | +0.0290 |
| peak | success | light | 7.6022 | 7.5925 | -0.0098 |
| peak | success | dark | 4.8796 | 4.8717 | -0.0079 |
| peak | warning | dark | 5.2841 | 5.3328 | +0.0487 |
| peak | danger | dark | 5.6824 | 5.7191 | +0.0367 |
| peak | data-1 | light | 6.3659 | 6.4511 | +0.0852 |
| peak | data-1 | dark | 4.9949 | 5.0826 | +0.0876 |
| peak | data-2 | light | 6.6314 | 6.6471 | +0.0157 |
| peak | data-2 | dark | 4.5605 | 4.5981 | +0.0376 |
| peak | data-3 | dark | 4.7212 | 4.7512 | +0.0300 |
| peak | data-4 | dark | 5.0917 | 5.0864 | -0.0053 |
| peak | data-5 | dark | 5.3320 | 5.3284 | -0.0037 |
| peak | data-6 | dark | 5.6007 | 5.6404 | +0.0398 |
| peak | data-7 | dark | 5.4753 | 5.4640 | -0.0113 |
| peak | data-8 | dark | 5.3246 | 5.3293 | +0.0047 |

## Deviations

- **D1 d = 0.9275, not 0.919.** Ruled by R76 Q3.
  - At 0.919 to 0.9263, gate-path perceptual 300 p90 is 90.0013: 14 identical hue-86 yellows held on one 8-bit code.
  - The window is 0.9267 to 0.928.
- **D2 damp mapping.** The residue is `r^2.0875`, not the linear `0.27 r`.
  - The linear form damps at damp 0, which would break "1.0 everywhere at damp 0".
  - Both forms meet at damp 70.
- **D3 report flags.** `--damp N` and `--damp-curve N` are added to the report.
  - The damp 70 / 1.5 control is a no-op, because the corpus already runs at 70 / 1.5.
  - The U2 figures come from the base run instead.
- **D4 even at damp 0.** Even reads 0.2824 / 0.4467 at damp 0 on base too, so "1.0 at damp 0" holds for perceptual and peak only.
- **D5 env > 1 not held.** The dampAmp shoulder (1216 rows, Adia only) is outside both clauses and is not held; max \|held - target\| is 1.4270.
- **D6 test edits.** Three changes, each stated in its comment:
  - The `lift-monotonic` OKHSL bound widens to the palette's own damp 0 ramp. U2's damp 0 stop 950 already reads L\* 4.03 to 4.19, below lmin 5.
  - `skew-lift-okhsl` (i) reads at damp 0, with CAP_L_EXCEPTIONS re-measured: Data 1 and Data 2 stop 450 added, both `capped`; cam16 Secondary 550 removed.
  - A new (i b) check: 0 of 1600 rows fail at head, and the unheld stub fails 326.
- **D7 GRID_R2_EXCEPTIONS.** The 21 old keys are removed because none reproduces at head. The 12 R77 Q4 quantization keys replace them, so the list goes from 21 to 12.
- **D8 unheld stub.** The unheld stub does not bite C3.5 (monotone 0); the synthetic rise is the control that bites.
- **D9 flag agreement at U3's head, not at U2's engine.**
  - U2 has no flag, so the diff and the flag were compared on the same engine.
  - Full corpus plus the default kit, peak, both hueSpace sides: 84900 anchored stops, flag 7464, diff 7464, 0 disagreements each way.
  - With the flag forced true: flag 81514, of which 74050 the diff never moved (e.g. Barbican primary 50), exit 1.
  - U2's 7841 is a different engine's count.
- **D10 model.mjs.** One line outside the engine lane.
  - `projectView` carries `capped` so f4 can read it from the projected rows it already renders.
- **D11 re-pins.** The Panda EX-1/EX-2 literals in `exports.mjs` and the spec, and the shadcn and radix fixtures, are re-captured by script. Each carries a U3 note.
  - The spec's EX-4 table was already stale at base; it is left as found.
- **D12 citations.** Two reactivity-review `tonal.js:1003` citations are repointed to `:1024` (`okhslLAt` moved); `citations.mjs` is STALE 0.

## Open questions (`.sdlc/questions/chroma-envelope-U3.md`)

- **Q1 to Q3:** ruled by R76 (`.sdlc/questions/chroma-envelope-U3-conflicts.md`, written into C3.1, C3.2 and C3.6 by revision 7).
  - Q1: the two peak cells are a declared cost.
  - Q2: Kea is a named exception.
  - Q3: d is 0.9275.
- **Q5 and Q6:** open. ce-U3-planner is re-diagnosing the coupling between the hold and the hue solve (R77).
  - Q5: the x2 hue re-solve residual.
  - Q6: the f4 codes bound is 3 > 2.
  - The damped-s solve is kept, as instructed. The basis-s variant is measured (x2 0 of 251064; f4 perceptual 1, peak 11) and not adopted.
- **Q4 and Q7:** ruled by R77 (`.sdlc/questions/chroma-envelope-U3-conflicts-2.md`).
  - Q4: the 12 quantization keys are added.
  - Q7: both FLOORS crossings are declared costs, with Data 3 dark moved into `PENDING_U4` at 4.8.

## Gates

| Gate | Evidence | State |
|---|---|---|
| `npm test` | exit 1, `✗ 1/54 test file(s) failed`: `anchor.mjs` f4 (Q6) only. The three C2.8 rows and `semantic.mjs` are green. Wall time 100.0 s at load 5.0. The tree is clean after, apart from this pass's edits | 🔴 on Q6 |
| `npm run build` | in a throwaway clone at 67cc0cde: exit 0, `wrote figma/plugin/ui.html 4158.0 KB`, tree clean after. The baseline row was updated. `baseline-agrees-check` exits 0 with stale total 0; the control (adapter corpus-tonal edited to 126) prints `STALE time gate:corpus-tonal`, exit 1 | 🟢 |
| em-dash, branding, citations | all clean in `npm test` | 🟢 |
