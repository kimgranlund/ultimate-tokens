# Question pane-context U2 · from planner

| Field | Value |
|---|---|
| Blocks | pane-context U2's engine half (C2.4 to C2.7). U2's report mode (C2.1, C2.2) and U1, U3, U4 do not wait |
| Raised by | the planner, `.sdlc/plans/pane-context.md` section 2, measuring the owner's ask 2 of 2026-10-01 ("the `* base chroma` slider does not seem to apply uniformly to the group") |
| Finding | The UI is uniform: every palette in a group receives the same `paletteGroups[g].baseChroma` through `rampChromaOf`. The engine is not: on the anchored perceptual and peak path `anchorChromaBasis(..., climb=false)` pins stop 500 to the anchor's own saturation and walks the ends toward `min(groupValue, anchorValue)`, so the group value is a ceiling, never a target. Default kit, perceptual, anchors kept: brand 100 to 40 moves Primary/Secondary/Tertiary by at most 9.34 / 13.26 / 13.83 CAM16 C with stop 500 at 0.00 for all three; material 30 to 100 moves Neutral by 0 of 19 hexes. Anchors stripped, the same moves shift stop 500 by -42.49 / -18.67 / -51.25 and +57.1. Every default-kit palette is anchored |
| Governed by | R69 (2026-09-29, #725 U2, "Fix the engine"): the climb toward a vivid group was removed on purpose; `(gid3)` in `test/ui/headless-boot.mjs` ratifies the cap in words ("group chroma above it is ignored"). #701 owns the even path (`climb=true`), which this question does not touch |
| Question | What should the `<group> base chroma` slider mean for an anchored palette? |
| Options | A the group value scales the anchor's own saturation, 100 meaning the anchor as sampled; the target at the ramp ends becomes `anchorValue * groupValue / 100`, stop 500 stays byte-exact, every palette in the group moves by the same ratio, nothing climbs above its own anchor at 100, `(gid3)` and `(gid3b)` keep passing (recommended) · B restore the pre-R69 climb (`climb=true`) on the perceptual and peak path: uniform in absolute terms, reopens the #725 finding (stop 300 at a 94% median of stop 500) and flips `(gid3)` · C engine untouched; the Global inspector shows each anchored palette's effective ceiling under its group slider and greys the dead range |
| Default if unanswered | A |
| Side question (A only) | `GROUP_DEFAULTS.material.baseChroma` is 30. Under A a material palette whose anchor saturation exceeds 0.30 renders muter than today at defaults (the kit's Neutral has C 24.77 at 500 and would move at the ends). Either accept the move (C2.7 reports it) or ship A with material's default at 100 and a persist migration so the kit renders as today at defaults. Default: material default to 100 with migration, so no shipped render moves at defaults |
| Why not decided by the planner | It reverses or reinterprets an owner ruling (R69) and changes what a shipped slider does to every anchored curated preset |

## Answer

| Field | Value |
|---|---|
| Ruled by | owner, via the Conductor's AskUserQuestion, 2026-10-01 (R88, R89, R90); revised by the owner 2026-10-03 (R94 to R98), which supersede R88 and R89. R90 stands |
| Source, verbatim | "A: scale each palette (Recommended)" · side question: "Accept the shift" · chrome theme: "Keep chrome theme (Recommended)" |
| Chosen | R94: the slider is a magnitude damper on the whole anchored ramp, stop 500 included: chroma at every stop is the value R69's anchored path renders at group 100 times `g / 100`; at 100 the ramp equals today's byte for byte. R95: range 0 to 100, damp only, never above the sample. R96: `GROUP_DEFAULTS.material.baseChroma` moves to 100, with no migration (R98, 2026-10-03: computation first, no overrides or legacy layers; one damper multiplies every path's emitted chroma). R97 accepts the even-mode Neutral shift at the new defaults. Chrome theme stays (R90); only the canvas and preview scheme toggles go |
| Superseded | 2026-10-01 answer: A as a ratio at the ramp ends with stop 500 pinned, material staying 30, no migration (R88, R89) |
