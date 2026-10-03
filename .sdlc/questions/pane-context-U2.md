# Question pane-context U2 · from builder

| Field | Value |
|---|---|
| Blocks | C2.6's `--compare` leg only (`0 cells rose`). Every other U2 criterion and the three C2.6 gates themselves pass on the unit head with the re-captured fixtures |
| Raised by | the U2 builder (l6), `unit/pc-U2`, measuring C2.6 on the damper head |
| Finding | `node test/engine/chroma-envelope-gate.mjs --compare <the fixture at 306f9a9e>` against the re-captured head fixture prints `perceptual: moved against base`, `peak: moved against base`, `even: moved against base` and `2 cells rose (... even 300 p90, even above100)`, exit 1. The plan's premise for `0 cells rose` was "the damper only lowers them", but the gate reads each stop's chroma as a percent of stop 500's, and R94's law `X_g = (g / 100) * X_100` keeps that ratio at its at-100 value for every g. A subject whose old render below 100 had a flatter shape now shows its at-100 shape, so its ratio can rise while every absolute chroma falls. Both risen cells trace to named subjects (`$CLAUDE_JOB_DIR/tmp/pcU2/probe-even-above.mjs`, head against 455c0454, even mode, all 25 stops): `even above100` 502 to 503 is `default/Neutral` (stops 400 and 450 above stop 500, its #701 at-100 shape, reached through R96's material 100 or, at material 30, through the damper: a clone with `baseChroma: 30` prints the same 503); `even 300 p90` 100.3224 to 101.1588 is the Adia preset, the only corpus document that stores group values below 100 (brand 41, system 32, data 27, material 25): Primary 75.12 to 106.90, Success 87.16 to 116.70, Data 5 93.10 to 128.90, Data 6 and Data 7 100.00 to about 117, Info and Danger to about 102. Perceptual and peak raise no cell |
| Governed by | R94 and R98 (one damper, one law, no per-mode, per-palette or floor exception) and R97 (the even-mode Neutral shift is accepted). Plan C2.6 states `0 cells rose` |
| Question | Accept the two risen even cells as the ruled law's consequence, or change something? |
| Options | A accept: the fixtures stay re-captured at the damper head (both are in this change), C2.6's `--compare` leg is read as "only the two named even cells rose, both attributed", and the handoff records it (recommended: R94 fixes the shape at the at-100 render, so no implementation lowers these ratios without an exception R98 rules out) · B exempt Adia from the even ratio ratchet the way `ADIA_CARVEOUT` already exempts it from the above-100 count, which is a gate change outside U2's lane and still leaves `default/Neutral`'s +1 · C re-author Adia's stored group values to 100 so its ramps render at their at-100 shape at full chroma, a corpus edit that moves Adia's exports |
| Default if unanswered | A |
| Why not decided by the builder | It contradicts a stated criterion (`0 cells rose`), and the alternatives touch a gate or a curated document outside the unit's lane |

## Answer

| Field | Value |
|---|---|
| Chosen | open, default A |

# Question 2 pane-context U2 · from builder

| Field | Value |
|---|---|
| Blocks | the FULL `corpus-tonal` leg (`npm run gate:corpus-tonal`, a CI `sweeps` landing blocker). `npm test`'s SAMPLED leg passes (its thinned hue grid misses these cells); the other seven FULL legs pass on the unit head |
| Raised by | the U2 builder (l6), `unit/pc-U2`, running the FULL sweeps on the damper head |
| Finding | `test/engine/tonal.mjs --full` exits 1 on one case, `skew-lift-okhsl (iii c)`: "measured CIELAB L* ROSE on 47 of 10080 grid cells beyond the 12 cited exceptions, worst +0.2987 L* at perceptual/cam16 hue 165 skew -100 lift 40 vibrancy 100 stop 250->300 (90.5003 -> 90.7990)", and none of the 12 cited `GRID_R2_EXCEPTIONS` keys is observed any more (the FAIL helper prints only the first message per case). The grid renders every cell at `chroma: 95`, so under R94 each cell is now the at-100 render damped by 0.95, not a native 95 render. Measured by `$CLAUDE_JOB_DIR/tmp/pcU2/probe-grid.mjs` (the case's own loop): the merge-base engine at 95 reads 0 beyond the list and 12 of 12 cited seen; the head at 95 reads 47 beyond and 0 of 12. Of the 47, 12 are the at-100 render's own rise at the same stop pair (inherited through the ratio law) and 35 are re-quantization: the damped 8-bit pixel misses its held L* by up to 0.18, which flips a near-flat at-100 step (all lift 40, -40 or 5; L* 5.6 to 99.6). The at-100 render itself, on the merge base and the head alike (byte-identical at 100), reads 25 rises the grid never measured because it sat at 95: max +0.0915 L*, all near white (L* 90.66 to 99.50), hues 107, 145, 152 and 165, lift 40 or 5, none at lift 0 |
| Tried | an 8-bit L* polish in `dampStops` (the 27 one-step RGB neighbours, nearest held L*) in a scratch clone: 47 drops to 37 (25 of them the at-100 rises), and it reds `oklch-hue-anchor` (1.44 degrees at stop 500), `intensity-legacy` and `group-chroma-damper` (ii)/(iii) (the s law breaks at stop 100). Refuted: no engine change under R94 removes the inherited rises, so the list has to change either way |
| Governed by | R94 and R98 (one law, the damped ramp keeps the at-100 shape), the case's own rule "re-diagnose before loosening further", and R77 Q4 (the last re-list of this list went through an owner ruling) |
| Question | How does the `(iii c)` grid read under the damper? |
| Options | A re-cite at 95: keep `chroma: 95`, replace the 12 keys with the 47 observed at the head (worst +0.2987 L*, above the 8-bit floor the 12 were cited under) · B move the grid to `chroma: 100` (recommended): the grid exists to measure where the paths' own envelope damping travels against skew and lift (#647, #668), and at 100 that is the path with no group layer; cite the 25 at-100 rises (max +0.0915 L*, near white, the same quantization class as the 12, `$CLAUDE_JOB_DIR/tmp/pcU2/grid100.out` holds the keys); the damper's tone accuracy stays gated per stop by `group-chroma-damper` (v), which does not gate monotonicity at g below 100 · C a gate on the damped ramp's monotonicity (for example the grid at both 100 and 95 with separate lists), larger and new |
| Default if unanswered | none implemented: the gate is unchanged in this unit, so the FULL leg stays red until a ruling. B is a test-only edit inside U2's lane (`test/engine/tonal.mjs`) |
| Why not decided by the builder | it loosens a cited allow-list whose last re-list was owner-ruled, and A, B and C gate different things |

## Answer 2

| Field | Value |
|---|---|
| Chosen | open, recommended B |
