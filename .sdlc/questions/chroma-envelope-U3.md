# chroma-envelope U3: three plan conflicts found mid-build (#725)

Builder, pass 1, on `unit/ce-U3` (base ee6fadbe), 2026-09-29. The build continues while these are ruled. Each row below is measured, not predicted.

Rulings, 2026-09-30:

- R76 (`.sdlc/questions/chroma-envelope-U3-conflicts.md`) rules Q1 to Q3. The two peak cells are a declared cost, Kea is a named exception, and d is 0.9275.
- R77 (`.sdlc/questions/chroma-envelope-U3-conflicts-2.md`) rules Q4 and Q7. The 12 keys are added, and Data 3 dark goes into `PENDING_U4` at 4.8.
- Q5 and Q6 are with ce-U3-planner's re-diagnosis.

| # | Conflict | Measured | What the builder does meanwhile |
|---|---|---|---|
| Q1 | C3.2 and C3.6 require every anchored ratchet cell at or below U2's plus 0.05, and the Constraints call a rise a defect. The plan's own matrix row "hold + retune" predicts peak 100 median 9.1 and peak 300 p90 99.6 against U2's 8.5 and 97.4 | `chroma-envelope-gate.mjs --compare <U2 fixture>`: `2 cells rose`, peak 100 median 8.5306 to 8.8953 (8.9270 was an earlier d; 8.8953 is the committed fixture), peak 300 p90 97.4215 to 99.4957. Cause: the corpus-wide `#2E7D4F` success anchor's stop 300 was 97.42 percent uncapped at U2 (#83CE99, C 41.32). Under the retune it crosses stop 500's chroma and the peak cap sets it to 99.50 percent (#7DD1A1, `capped`). The unheld scratch engine (hold off, same constants) shows the same two rises, so the retune causes it, not the hold | declares the two rises; does not re-capture over them silently |
| Q2 | C3.2 needs perceptual `rule violations` 0, or the named anchors ruled by a plan revision the handoff cites. No such revision exists | Kea primary-muted `#E1F5DA` reads 227.26 percent (226.02 at U2, carried). Southern trap does not fire. The report exits 1 on this line alone once d is settled (Q3) | reports it; C3.2 stays 🔴 until a revision rules it |
| Q3 | The plan's `d` 0.919 (and its "92 margin") does not clear the strict `perceptual 300 p90 < 90.0` | p90 is 90.0013 at d 0.919 to 0.9263: a cluster of 14 identical hue 86, chroma 100 gate-path yellows (`#DBB14E` at stop 300), fixed by 8-bit rounding. It first steps to 89.2982 (`#DBB14F`) at d 0.9267. C3.1's "within 0.02 of 0.25" caps d at 0.928 | takes d 0.9275 (env 0.7435 at 300, 0.2304 at 100, c = log2 3), which gives a 0.0008 window, and declares it |

Also declared (no ruling needed unless the lead disagrees):

- Damp mapping: `r = (100 - damp)/100` is mapped to `r^2.0875` instead of the plan's linear `0.27 * r`. The linear form reads 73 at damp 0, which breaks C3.1's "1.0 everywhere at damp 0". Both forms meet at the corpus damp 70.
- Even mode: byte-identical over a 148,000-cell envelope grid. It does not read 1.0 at damp 0 on `main` either (0.2824 / 0.4467 at 100 / 300), so C3.1's "1.0 everywhere at damp 0" holds for perceptual and peak only.

## Found later in pass 1 (2026-09-29, while C3.3 and C3.4 ran)

| # | Conflict | Measured | What the builder does meanwhile |
|---|---|---|---|
| Q4 | C3.4 needs (iii c) `measured CIELAB L* ROSE` 0 beyond `GRID_R2_EXCEPTIONS`, and lets the list only shrink | The hold fixes all 21 cited keys (none observed at head). It leaves 12 new keys, all hue 165, lift 40, skew 0 or -50, stops 250 to 350, L* 94 to 97.5 (for example `perceptual/cam16 165 skew 0 lift 40 vib 100`, stop 300 to 350, 97.498 to 97.535). Each rise is 0.011 to 0.037 L*, under the row's own 8-bit rounding floor. The continuous held L* descends there (97.629 to 97.395), and the 8-bit pixel near the G = 255 wall rounds it back up. Damp 0 at head and at the U2 base both read 0 upticks | removes the 21 keys (named as fixed by the hold); does not add the 12; C3.4 stays 🔴 until ruled. Options: add the 12 as quantization keys, or a plan revision for a pixel-monotone pass on the non-anchored path |
| Q5 | C3.3 x2 bars anchored `oklch` rows at `<= 0.01` | 42,112 of 251,064 anchored oklch rows exceed it, max 1.007 L* (default Warning, perceptual, stop 150). Cause, verified: the per-stop `solveOkhslHue` reads the 8-bit staircase (`tonal.js:128`), so the hue it solves at the damped `s` differs from the hue at the basis `s`. A scratch copy that solves the hue at the basis `s` reads 0 on all 251,064 rows. The plan's "one solve per stop, reused" construction is what the builder kept | reports x2 anchored as 🔴 against the bar; every other C3.3 line is green |

Also changed in tests (declared, the lead may overrule):

- `lift-monotonic` range bound on the OKHSL paths widens to the palette's own damp 0 ramp. On the U2 engine at damp 0, Primary and Data 1 to 3 stop 950 already read CIE L* 4.03 to 4.19, below lmin 5. The damping used to grey that stop up to 5, and the hold now keeps the undamped L*. A stop outside both the undamped ramp and [lmin, lmax] still reds.
- `skew-lift-okhsl` (i) reads the unwarped distribution at damp 0, where the hold is the identity. Its `CAP_L_EXCEPTIONS` are re-measured there: Data 1 and Data 2 stop 450 are added, both flagged `capped`, and cam16 Secondary 550 is removed. Each cited row must now carry the `capped` flag. A new (i b) checks that the shipped damp emits the damp 0 L* within the rounding floor: 0 of 1600 rows fail at head, and the unheld stub fails 326.

| # | Conflict | Measured | What the builder does meanwhile |
|---|---|---|---|
| Q6 | `anchor.mjs` f4 gates the default kit's hueSpace flip at `<= 2` codes (ruled final, `anchor.mjs:1290`) | At head it is 3 in two places: perceptual Warning stop 150 (`#F4F4F3` / `#F1F1F0`) and peak Info stop 350. The unheld stub and the U2 base both read at most 2. The corpus OKLab bound holds at head (max 0.0090 perceptual, 0.0059 peak, under 0.01). Mechanism: the hold targets the L* of the undamped colour at the hue solved per hueSpace, so a hue difference that is invisible at the damped `s` becomes a lightness shift. Solving the hue at the basis `s` (the Q5 variant) brings perceptual to 1 but takes peak to 11 (Secondary stop 450), so it is not a fix | reports f4 🔴; changes no bound |
| Q7 | C3.7 repeats C2.7: the 96 FLOORS pins are re-read rounded down, and a drop below the frozen snapshot is 🔴 until a plan revision rules it | 34 of 96 cells move against the U2 base; 2 cross a pin. Peak Success light 7.6022 to 7.5925 is re-pinned 7.6 to 7.5 (above its bf2aaf6 floor 7.2). Perceptual Data 3 dark 4.9376 to 4.8869 is re-pinned 4.9 to 4.8, but that cell is in `PENDING_U4` at 4.9, so `checkFloors` reds `perceptual Data 3 dark: 4.8 is below its PENDING_U4 pinned floor 4.9 - an already-accepted drop eroded further`. The accent is `#E92A47` on black | re-pins both FLOORS cells rounded down; leaves `PENDING_U4` and `FLOORS_BF2AAF6` untouched, so `semantic.mjs` reds on that one Q-B line until ruled. Options: rule the 4.8 into `PENDING_U4`, or send it to U4 with the other 41 |
