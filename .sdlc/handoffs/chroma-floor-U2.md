# Handoff U2 · builder → reviewer (pass 2, revision 14)

| Field | Value |
|---|---|
| Branch | unit/cf-U2 @ ed1658dc (code); this handoff is the next commit |
| Base | plan/chroma-floor via 82925a5f (revision 14 merged); U1 head 8b731da5; `<base>` 282fca8d |
| Pass 1 | fe65e640 code, 0427d587 handoff; review FAIL `.sdlc/verdicts/chroma-floor-U2-review.md` |
| Files (pass 2) | src/engine/tonal.js · test/engine/tonal.mjs · test/engine/fixtures/tonal-legacy.json · .sdlc/adapter.md · docs/reference/references/knowledge-02-tonal-scale.md · .claude/skills/color-math/references/foundations.md · docs/reference/reviews/2026-08-20-reactivity/{00-synthesis,04-context-and-messaging}.md (`tonal.js:974` to `:983`) · figma/plugin/ui.html, src/ui/describe-mcp-assets.js (regenerated) |
| Files (unit total) | the above plus test/engine/even-dips-gate.mjs (new) · package.json · .github/workflows/ci.yml · .sdlc/baseline.md · .sdlc/checks/baseline-agrees-check.sh |
| Host | 1-minute load 33 to 159; no timing here is a figure of record |
| Scratch | `/private/tmp/claude-501/cf-U2/`: `c13-probe.mjs`, `report-chroma-floor-movement.mjs` (U1's, unchanged), `dips.mjs`, `ratios.mjs`, `legacy.mjs`, `tonal-pass1.js` (fe65e640's engine, the C13 control); logs under `F2/` |

## The rule (revision 14)

`evenChroma` is unchanged from pass 1: `const floorC = Math.min(((chromaFloor ?? 0) / 100) * Math.min(maxc, floorRef), intended);` (the C3 and C4 patch target). What moved is `floorRef`, at both sites, with no `clamped ?` branch:

| Site | floorRef |
|---|---|
| `paletteStopsAnchored` | `Math.max(maxc500, maxChromaInGamut(seedHue, firstStepTone(450)), maxChromaInGamut(seedHue, firstStepTone(550)))`, `firstStepTone(s)` = the ramp's own `anchorLerp(pivotTone, ...)` at `s` |
| `paletteStops` | `Math.max(maxc500, maxChromaInGamut(baseHue, toneAt(450, ...)), maxChromaInGamut(baseHue, toneAt(550, ...)))`; the stop-500 seeds pass none (default `maxc`, unchanged) |

The comments in `tonal.js` and `foundations.md` now say it the way the review asked: no off-anchor dip can form when the damped value is non-increasing outward (constant `intended`); with `relChroma` or the anchored basis blend that is a measurement, gated at 0 on both paths, not a structural guarantee.

## Ran

| # | Command | Output | Negative control |
|---|---|---|---|
| C1 | `npm test` | `✓ all 50 test files passed`, exit 0; `git status --short` 0 after commit | pass 1: `scrimX` in role-table.json, `semantic.mjs` 2 FAIL, exit 1; this pass the first run red on `citations.mjs ✗ 2` (the line shift) before the repair |
| C3 | `npm run -s gate:corpus-tonal` (FULL, `F2/t.log`) | `PASS`; `grep -c EVEN_DIP_BASELINE` 0; `  dip-gate even rendered (anchor passed): 0 dips at stops other than 500 (19 + 25 stops, 3764 palettes + default kit 16, no baseline); 500: 32 (notch class, Q-C, not gated here)`; `pass  dip-gate-even` | in-gate: pre-#701 floor `24`, pre-#701 floor 1.6x `381` off-anchor |
| C4 | `npm run -s gate:even-dips` | exit 0; tail `  dip-gate even gate-path (no anchor): 0 dips (19 + 25 stops, 3764 palettes + default kit 16, no baseline)`, `PASS`; greps `1`, `1`, `1`, `0`, `3` | in-script pre-#701 floor 1.6x `120`; `--floor-scale 1.6` prints 120 and `FAIL`, exit 1 (pass 1 run; the control engine drops `floorRef`, so revision 14 does not change it) |
| C5 | `--envelope --gate-path`; `--envelope` | gate path even 10.9/16.2, 39.1/44.6, 39.0/44.6, 16.3/16.5, all OK, `above 100% of stop 500: 0 OK`; perceptual+peak md5 `6e558839ee9e43217e1e2f7afc898b7b` | `--gate-path --damp-amp 55`: even `above 100% of stop 500: 1916 FAIL` |
| C6 | `npm run -s gate:mode-isolation` | `pass  mode-isolation: perceptual 34e544942d500b9e peak f560f784d8a4883a match fixture (...)` | movement script: perceptual 0 / 3796, peak 0 / 3796 |
| C7 | captures | `anchor-ramp monotone: 0`; `distinct (25-stop) allow-list: 16 (expected 16)`; `pass skew-lift-okhsl`; `pass chroma-envelope`; `GRID_R2_EXCEPTIONS` 21, `KNOWN_BASELINE_DUP` 23; `chromaEnvelope(` 1 / 5 | second `export function chromaEnvelope` in a scratch copy: grep 2 |
| C8 | full tonal leg; `semantic.mjs`; `gate:corpus-contrast`; comparator | `pass chroma-floor`; `pass role-contrast`, `0 unlisted drops, 0 further erosion`; contrast `PASS`; `semantic.mjs` untouched by U2, so the comparator reads U1's `changed 4, down 4` (R44) | the first pass-2 run red `saturated stop 300: floor changed a vibrant ramp (#A6CD9E->#A5CD9C)` against pass 1's 10-stop list |
| C9 | `a.log`; headless boot | perceptual and peak bound 0.0048; even live `0.0256` (U1 0.0486, pass 1 0.0209); `HEADLESS BOOT PASS`; `(hs)` 4 | U1's hue-space control |
| C10 | regen; merge-base `docs/` diff | tree clean after commit; `docs/`: knowledge-02 plus the four revision-13(b) paths; `code.js`, `role-table.json`, `adia-oklch-export.css` absent | `citations.mjs ✗ 2` before the repair |
| C11 | greps | 0, 0, 0, 1, 1, 0, 2 | no list exists; an off-anchor dip reds `dip-gate-even` |
| C12 | `baseline-agrees-check.sh` | only `STALE ui.html: baseline 4130.1 KB, tree 4135.3 KB`; `ok time gate:even-dips`; `stale total: 1` | no `node_modules`, no build; KB cell left |
| C13 | `node /private/tmp/claude-501/cf-U2/c13-probe.mjs` (`/private/tmp/claude-501/cf-U2/F/c13.txt`, control `F/c13-ctl.txt`) | see below; the probe's retired loss-vs-reference `(i)` line exits 1 (pale 94.95/95.13, 2.77); revision 15's `(i-b)` lines all pass | `node c13-probe.mjs tonal-pass1.js`: far-side |dC| 13.19, 13.14, 10.72, 17.71 on the four straddling pairs, both reviewer pairs FAIL, 211 big cells in 93 anchors, 17 anchors under L* 15 |
| #739 | `a.log` | `pass  achromatic-anchor: 27 of 27 ... 3 skipped under CAM16 C 5`, no special case | pass 1 without its branch read 8 skipped (re-diagnosis) |

`SAT_FLOOR_EXCEPT` is back to its `<base>` 11 stops (100 to 300, 875 to 950).

## C13

Restated at plan revision 15 (C13 (i)) and revision 16 (the (iii) control). Every figure below was measured at `a4c78e3d` (the head this section was rewritten on; only `.sdlc/` moved since the engine last changed) by rerunning `c13-probe.mjs` in a scratch clone (`/private/tmp/claude-501/cf-U2-c13`, logs `F/c13-rev15.txt` and `F/c13-ctl-rev15.txt`). The control is pass 1's engine, `git show fe65e640:src/engine/tonal.js`, the same probe. The probe's `(i)` block still prints revision 14's loss-vs-reference check and its exit is 1 on the pale 94.95/95.13 line (2.77); that reading is retired and is not graded here. Revision 15's reading is the probe's `(i-b)` block.

C13 (i): each straddling pair's own far-side |dC|, the engine's largest |dC| over the five far-side stops (600 to 800 for L* above 50, 200 to 400 below), CAM16 C read from the rendered hex, at most 2 C.

| Sub-check | Expected | Evidence | State | Negative control (pass-1 engine) |
|---|---|---|---|---|
| (i) sat 9.55 vs 10.05 (straddles the dark edge) | far-side \|dC\| at most 2 | `0.49` | 🟢 | 13.19 FAIL |
| (i) sat 94.95 vs 95.13 (straddles the light edge) | at most 2 | `0.61` | 🟢 | 13.14 FAIL |
| (i) pale 9.55 vs 10.05 | at most 2 | `0.50` | 🟢 | 10.72 FAIL |
| (i) pale 94.95 vs 95.13 | at most 2 | `0.55` | 🟢 | 17.71 FAIL |
| (ii) `#E8EEFA` vs `#ECF1FC`, 700/750/800 | within 2 C | `14.1 / 13.9 / 13.8 vs 13.8 / 13.4 / 13.2` | 🟢 | FAIL |
| (ii) `#1C2030` vs `#161A28`, 300 to 450 | within 3 C | `22.9 / 21.3 / 18.2 / 16.1 vs 20.8 / 20.2 / 16.5 / 14.5` | 🟢 | FAIL |
| (iii) big cells | at most 20 | `17 in 8 anchors` | 🟢 | 211 cells in 93 anchors FAIL |
| (iii) anchors L* 88 to 95.05 | 0 | `0` | 🟢 | 1 FAIL |
| (iii) anchors below L* 15 | at most 5 | `5` | 🟢 | 17 FAIL |

The eight generated anchors (CAM16 hue 250 at the given L*; sat is 90% of the local ceiling, pale is C 6), each pair straddling its edge. L* and hue are read from the rendered hex, at `a4c78e3d`.

| Pair | Anchor | Hex | Rendered L* | CAM16 hue | Side of the edge |
|---|---|---|---|---|---|
| sat dark | 9.55 | `#051C2F` | 9.546 | 250.1 | out (below 10) |
| sat dark | 10.05 | `#051D31` | 10.052 | 250.7 | in |
| sat light | 94.95 | `#EAF1FD` | 94.948 | 251.3 | in |
| sat light | 95.13 | `#EAF2FD` | 95.198 | 246.6 | out (above 95.05) |
| pale dark | 9.55 | `#181B1F` | 9.617 | 251.5 | out |
| pale dark | 10.05 | `#191C20` | 10.118 | 251.4 | in |
| pale light | 94.95 | `#EFF0F6` | 94.876 | 254.9 | in |
| pale light | 95.13 | `#EFF1F7` | 95.151 | 250.0 | out |

Cross-check against the Verifier's evidence table (`chroma-floor-U2.md`, C13 (i) row): all eight hexes, rendered L* values and hues, and all four |dC| figures (0.49, 0.61, 0.50, 0.55), and the pass-1 control figures 13.19, 10.72, 13.14, 17.71, agree to the printed digit. No difference. The (iii) figures (17 cells in 8 anchors, 0 in L* 88 to 95.05, 5 below 15) also match the verdict, and the control's 211 cells in 93 anchors, 1 and 17 match revision 16. The earlier `9.99 vs 10.05` rows are dropped: both anchors generate `#051D31` (sat), so that pair does not straddle, and the pale pair (`#181C20`, `#191C20`) is not one of revision 15's four.

The 17 big cells (vs the pre-#701 floor): Nike tertiary-muted (`#FFFFFF`, clamped light; 650/700/750, 36.6 to 14.2 at 700), Night of the Hunter tertiary (150 to 250), Tongass secondary (150 to 250, 42.1 to 18.8 at 175), Hidaka coast tertiary-muted (150, 175), West-coast G-funk tertiary-muted (150), Acid house tertiary-muted (175), Khumbu teahouse tertiary-muted (250), Rub' al Khali primary-muted (250). The re-diagnosis read 16 in 6: the last two (L* 9.70) are extra here.

## Dip histograms (25 + 19 stops, 3764 + kit 16)

| Reading | `<base>` 282fca8d | U1 8b731da5 | pass 2 ed1658dc |
|---|---|---|---|
| rendered, by stop | 450: 57, 500: 32, 550: 1 | 400: 3, 450: 20, 500: 32, 550: 1 | 500: 32 |
| rendered, depth [3,4) / [4,6) / 6+ | 44 / 45 / 1 (326592d2) | 39 / 16 / 1 | 32 / 0 / 0 |
| gate path | 0 | 0 | 0 |

K = 32 at stop 500, the same 32 names as pass 1 (`diff` empty), full keys in `/private/tmp/claude-501/cf-U2/F2/k-names.txt`: 22° N Sapa primary; 23° S Salar de Atacama edge secondary; 23° S Salar de Atacama 2,305 m secondary; 26° N Sehwan tertiary-muted; 30° N Atchafalaya secondary-muted and tertiary; 34° N Fushimi Inari tertiary-muted; 37° N Patmos secondary-muted; 41° N Great Salt Lake tertiary-muted; 41° N Tbilisi secondary; 48° N Viennese kaffeehaus secondary-muted; 51° N English oak woodland primary; 55° N Kamchatkan taiga tertiary-muted; 59° N Lake Baikal primary; Alice's Adventures in Wonderland tertiary; Charleston single house primary; Falu-red farmstead tertiary-muted; Fresh pasta tertiary-muted; Gospel primary-muted; Habitat 67 tertiary-muted; Himeji Castle secondary; Icelandic turf house tertiary-muted; Katsura Imperial Villa primary; Macarons tertiary-muted; Mod & British Invasion tertiary-muted; New England saltbox tertiary-muted; Pop-punk tertiary-muted; Symphonic & gothic metal tertiary-muted; The Red Shoes primary-muted; The orchestra tertiary-muted; Touch of Evil tertiary-muted; Trulli of Alberobello primary.

## Envelope tables

| READING (a) even | 100 | 300 | 700 | 900 | above 100% | C6 (v) even |
|---|---|---|---|---|---|---|
| gate path, `<base>` | 10.9 / 16.2 | 39.1 / 52.2 | 39.0 / 44.6 | 16.3 / 16.5 | 0 | n/a |
| gate path, pass 2 | 10.9 / 16.2 OK | 39.1 / 44.6 OK | 39.0 / 44.6 OK | 16.3 / 16.5 OK | 0 OK | n/a |
| rendered, `<base>` | 15.6 / 37.0 | 48.4 / 113.7 | 42.5 / 80.2 | 22.9 / 52.0 | 670 | 1,205 / 3,764, max 17.18x |
| rendered, pass 2 (REPORTED, NOT BARRED) | 15.6 / 37.0 | 47.1 / 100.3 | 42.5 / 80.2 | 22.9 / 52.0 | 502 | 1,037 / 3,764, max 13.66x |

## Blast radius (rendered hex, CAM16)

| Field | U1 + U2 vs 282fca8d | U2 alone vs 8b731da5 |
|---|---|---|
| presets moved | 344 / 344 | 344 / 344 |
| palettes moved | perceptual 0, peak 0, even 2,991 / 3,796 | perceptual 0, peak 0, even 1,982 / 3,796 |
| even 25-stop cells moved | 11,311 / 94,900 (11.92%; the 15% line) | 6,780 / 94,900 (7.14%) |
| max dL* | 0.3848 (8-bit quantization; target tone unchanged) | 0.3209 |
| max dC overall | 23.38, Tongass secondary stop 175 | same |
| max dC by stop (U2 alone) | | 100: 7.29, 125: 11.85, 150: 20.29, 175: 23.38, 200: 21.87, 250: 19.80, 300: 16.49, 350: 11.25, 400: 6.33, 450: 0.67, 550: 0.08, 600: 13.72, 650: 17.30, 700: 22.47, 750: 16.32, 800: 11.12, 850: 8.11, 900: 6.42, 950: 2.34 |
| lone spikes | 64 + 1 to 0 (U1) | 0 to 0 |
| exports | even-mode cells of every format; `figma/plugin/ui.html` 4130.1 to 4135.3 KB; Adia OKLCH export unmoved | |

Default-kit even ratios, accent on its on-color, light / dark (`ratios.mjs`, the role-contrast gate's own `brandKit` read):

| Family | `<base>` | U1 8b731da5 | pass 1 fe65e640 | pass 2 |
|---|---|---|---|---|
| Neutral | 7.29 / 4.65 | 7.29 / 4.65 | 7.29 / 4.65 | 7.29 / 4.65 |
| Primary | 7.50 / 4.80 | 7.52 / 4.80 | 7.52 / 4.80 | 7.52 / 4.80 |
| Secondary | 5.61 / 5.53 | 5.60 / 5.52 | 5.60 / 5.52 | 5.60 / 5.52 |
| Tertiary | 8.28 / 5.26 | 8.29 / 5.27 | 8.29 / 5.27 | 8.29 / 5.27 |
| Info | 7.23 / 4.58 | 7.24 / 4.58 | 7.24 / 4.58 | 7.24 / 4.58 |
| Success | 7.72 / 4.91 | 7.76 / 4.94 | 7.76 / 4.94 | 7.76 / 4.94 |
| Warning | 9.91 / 5.33 | 9.88 / 5.28 | 9.88 / 5.28 | 9.88 / 5.28 |
| Danger | 8.70 / 5.65 | 8.74 / 5.61 | 8.74 / 5.61 | 8.74 / 5.61 |
| Data 1 | 6.31 / 4.97 | 6.33 / 4.95 | 6.33 / 4.95 | 6.33 / 4.95 |
| Data 2 | 6.67 / 4.65 | 6.70 / 4.67 | 6.70 / 4.67 | 6.70 / 4.67 |
| Data 3 | 6.52 / 4.83 | 6.46 / 4.80 | 6.46 / 4.80 | 6.46 / 4.80 |
| Data 4 | 6.05 / 5.14 | 6.09 / 5.11 | 6.09 / 5.11 | 6.09 / 5.11 |
| Data 5 | 5.83 / 5.36 | 5.77 / 5.34 | 5.77 / 5.34 | 5.77 / 5.34 |
| Data 6 | 5.55 / 5.55 | 5.55 / 5.53 | 5.55 / 5.53 | 5.55 / 5.53 |
| Data 7 | 5.68 / 5.48 | 5.66 / 5.43 | 5.66 / 5.43 | 5.66 / 5.43 |
| Data 8 | 5.86 / 5.33 | 5.80 / 5.30 | 5.80 / 5.30 | 5.80 / 5.30 |

U2 moves no default-kit accent ratio in either pass (every move in the table is U1's); all 32 cells are above AA 4.5. The 33 legacy-fixture cells moved against U1 are non-accent stops (the fixture renders the kit without anchors, and those stops are not the 450/550 accents).

Legacy fixture, 33 cells against U1's pins, all even: Secondary 175 to 300, Info 250 to 400, Success 125 to 400, Warning 350, Danger 400, Data 1 650, Data 4 350, Data 5 125 to 300, Data 6 200 to 300, Data 7 175 to 300.

## Reviewer items

| # | Item | Done |
|---|---|---|
| 1 | the clamped branch and the level cap | replaced by revision 14's first-step reference, both sites, no branch |
| 2 | controls as revised | C3: pre-#701 floor 24 and at 1.6x 381; C4: 120; the shipped-floor-at-1.6x member is gone (pass 1 already) |
| 3 | `adapter.md:36` sweeps row | `355 to 475 s`, `86+79+67+57+20+20+26 to 116+100+86+83+23+34+33`, "CI runs the seven" |
| 4 | per-family ratios | the table above |
| 5 | the overclaim | `tonal.js` evenChroma comment and `foundations.md` reworded to the conditional |
| 6 | nit `tonal.mjs:1202` | left for U3's sweep, as the review routes it |

## Left out

- 🟡 `gate:even-dips` timing row is still 0/3 quiet-host; owed at U3 or pre-land.
- No build (no `node_modules`); the baseline build KB cell is untouched and `ui.html` reads STALE as C12 allows.
