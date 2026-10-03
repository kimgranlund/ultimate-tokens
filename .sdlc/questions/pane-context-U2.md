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
