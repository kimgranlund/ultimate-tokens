---
plan: preset-intent-fidelity
unit: U3 (chroma envelope), pass 7 retune record
base: 3c9630b
head: 05bf4cf6
---

# U3 pass 7 retune: damp/dampCurve mapping, corpus movement, C8 before/after

This is the record `.sdlc/handoffs/pif-u3-retune.md` the pass-7 brief requires. It covers step 1 (shipped,
`6a4821e`) only, step 2 was tried once and reverted; see `.sdlc/questions/pif-u3.md`'s "Q7 pass-7
addendum" for that construction, its uptick witnesses, and the two p90 figures it could not close
without one. U4's blast report reads this doc for the retune's own contribution, separate from U1-U2's
anchor/envelope movement already covered in `.sdlc/handoffs/pif-u3.md`.

## damp/dampCurve: before/after, and the per-mode mapping

Nothing changed for `perceptual`/`peak`: both still read `controls.damp`/`controls.dampCurve` directly,
byte-identical to before this pass (confirmed by a full corpus + default-kit hex-diff, 334,048 cells, 0
changed, both `STOPS` and `EXPORT_STOPS`). `DEFAULT_CONTROLS.damp` (80), `DEFAULT_CONTROLS.dampCurve`
(1.5), `VIVID_MIDS`'s curated-corpus defaults (`damp: 70, dampCurve: 1.5`), and the UI's `DOMAINS.damp`/
`DOMAINS.dampCurve` are all unchanged.

For `toneMode: "even"` only, `chromaEnvelope` (src/engine/tonal.js) now derives a mapped pair from the
SAME two sliders, so neither becomes a dead control (the F4 principle):

```
damp'       = 100 - (100 - damp) * EVEN_DAMP_FACTOR      // compresses damp's headroom
dampCurve'  = dampCurve * EVEN_DAMP_FACTOR                // scales the falloff exponent
EVEN_DAMP_FACTOR = 0.25 (exported, ratified against the corpus + full gate suite)
```

At the curated corpus's own default (`damp: 70, dampCurve: 1.5`), even mode now renders as if
`damp: 92.5, dampCurve: 0.375`, but only for the even path; the two sliders still visibly move the even
ramp (a user who raises `damp` or lowers `dampCurve` sees the effect, just compressed).

Why not `dampCurve` alone (the brief's own first framing): `uG = |sd|^dampCurve` rises toward 1 as
`dampCurve` falls toward 0 at ANY off-anchor stop, so the envelope's floor there is `1-damp/100`,
set by `damp` alone. A synthetic sweep down to `dampCurve x0.001` at the corpus's own `damp` left
`even|100`'s p90 at exactly 39.0% and `even|900`'s median at exactly 34.5-34.7% throughout, proof this
population's ceiling does not respond to `dampCurve` at all when `damp` is held fixed
(`u3fix/retune-even-only.mjs`, kept in the session scratchpad, not committed).

## Median/p90 per mode, at bf2aaf6, 4362180, and the new head

Reading (a) methodology (`scripts/report-preset-fidelity.mjs --envelope`): emitted CAM16 chroma at a
stop as % of the same ramp's own stop-500 chroma, over the curated corpus (chroma >= 10) plus the 8
default-kit semantic families, on the rendered path (`rampChromaOf` + `projectView`'s own resolution).
Cells shown as `median / p90`.

| ref | mode | stop 100 | stop 300 | stop 700 | stop 900 |
|---|---|---|---|---|---|
| bf2aaf6 (pre-U3) | perceptual | 10.2 / 20.8 | 80.0 / 122.4 | 74.4 / 76.2 | 25.1 / 30.4 |
| bf2aaf6 (pre-U3) | peak | 6.9 / 12.4 | 55.4 / 70.4 | 77.3 / 149.9 | 28.5 / 41.0 |
| bf2aaf6 (pre-U3) | even | 8.9 / 39.0 | 60.9 / 129.3 | 66.9 / 72.6 | 40.6 / 49.6 |
| 4362180 (U3 pass 3, even cap) | perceptual | 11.1 / 19.7 | 68.9 / 93.7 | 59.6 / 68.5 | 19.2 / 30.3 |
| 4362180 (U3 pass 3, even cap) | peak | 6.6 / 13.5 | 46.4 / 58.0 | 65.5 / 105.5 | 19.0 / 28.8 |
| 4362180 (U3 pass 3, even cap) | even | 8.8 / 39.0 | 61.1 / 100.0 | 66.9 / 72.7 | 40.2 / 48.0 |
| 6a4821e (this pass's head) | perceptual | 11.1 / 19.7 | 68.9 / 93.7 | 59.6 / 68.5 | 19.2 / 30.3 |
| 6a4821e (this pass's head) | peak | 6.6 / 13.5 | 46.4 / 58.0 | 65.5 / 96.1 | 19.0 / 28.8 |
| 6a4821e (this pass's head) | even | 8.8 / **19.8** | 40.3 / **51.7** | 36.5 / **50.6** | 16.3 / **27.1** |
| new head (U3 review 3, N2) | perceptual | 11.1 / 19.7 | 68.9 / 93.7 | 59.6 / 68.5 | 19.2 / 30.3 |
| new head (U3 review 3, N2) | peak | 6.6 / 13.5 | 46.4 / 58.0 | 65.5 / **96.8** | 19.0 / 28.8 |
| new head (U3 review 3, N2) | even | 8.8 / 19.8 | 40.3 / 51.7 | 36.5 / 50.6 | 16.3 / 27.1 |

Targets: stop 100/900 median <=25, p90 <=35; stop 300/700 median <=75, p90 <=90. perceptual and peak are
IDENTICAL at 4362180 and 6a4821e (step 1 never touches those paths; the 4362180->bf2aaf6 differences in
those two modes are pass 4-6's already-documented, already-ruled work, the anchor cap and the cusp-run
gate, not this pass's). Only even mode moves between 4362180 and 6a4821e, and it now clears all four
cells (bold above) for the first time since U3 began. The two remaining misses this pass does not close,
`perceptual|300` (p90 93.7) and `peak|700` (p90 96.1 at this pass's own head), are unchanged from
4362180 as of this pass, see the Q7 pass-7 addendum for the one step-2 attempt and why it was reverted.

Re-measured fresh at the new head for U3 review 3 (N2): `peak|700`'s p90 moved from 96.1 to 96.8 after
F1's peak-cap solver fix (a rendering-precision fix at capped stops, not a retune), the only cell in
either table that changed since 6a4821e. Every other perceptual/peak/even cell above is unchanged.

## Reading (b), the `chromaEnvelope` multiplier itself, at head (U3 review 4 R7)

Added per U3 review 4 (R7): step 1's `EVEN_DAMP_FACTOR` mapping is internal to `chromaEnvelope`'s
`toneMode === "even"` branch, so it moves reading (b) too, not only reading (a) above, but no record
carried the new numbers and Q `:205`'s table still read (accurately, AT THE TIME) "perceptual/peak/even
identical". At head (`node scripts/report-preset-fidelity.mjs --envelope`, N6's `toneMode` fix applied):

| mode | stop 100 median/p90 | stop 300 median/p90 | stop 700 median/p90 | stop 900 median/p90 | above 100% |
|---|---|---|---|---|---|
| perceptual/peak (still identical to each other and to Q's pass-3 table) | 42.6% / 72.2% FAIL | 79.6% / 89.1% FAIL/OK | 78.9% / 84.4% FAIL/OK | 40.1% / 57.7% FAIL | 0 OK (16 Adia carve-out) |
| even (own numbers since pass 7 step 1; ALL 8 CELLS PASS) | 12.0% / 26.6% OK | 32.1% / 41.9% OK | 31.4% / 36.5% OK | 11.0% / 18.2% OK | 0 OK (16 Adia carve-out) |

Reading (b) overall verdict is unchanged (still FAIL, since perceptual/peak still miss every median
target), but describing it as one line ("mostly-passing", commit `60b8c6de`'s message) undersells it:
`even`'s reading (b) is not "mostly" passing, it passes outright, all 8 cells.

## Default-kit emitted movement: 16 palettes x 3 modes, bf2aaf6 -> new head

Max and median deltaE76 (CIELAB, sRGB-derived) across the 19-stop display ramp, per default palette, on
the rendered path. Only palettes with max deltaE76 >= 0.05 are listed (the rest are byte-identical or
within 8-bit rounding noise).

| mode | palette | max deltaE76 | median deltaE76 |
|---|---|---|---|
| perceptual | Neutral | 4.97 | 2.19 |
| perceptual | Success | 4.49 | 0.76 |
| perceptual | Warning | 14.19 | 4.44 |
| perceptual | Danger | 2.39 | 1.36 |
| peak | Neutral | 4.73 | 2.72 |
| peak | Primary | 3.09 | 0.00 |
| peak | Secondary | 3.44 | 0.00 |
| peak | Tertiary | 5.14 | 0.00 |
| peak | Info | 2.80 | 0.00 |
| peak | Success | 2.56 | 0.67 |
| peak | Warning | 12.95 | 5.26 |
| peak | Danger | 2.39 | 1.40 |
| peak | Data 2 | 0.60 | 0.00 |
| peak | Data 5 | 5.85 | 0.00 |
| peak | Data 6 | 13.48 | 0.00 |
| peak | Data 7 | 1.08 | 0.00 |
| even | Neutral | 1.58 | 0.00 |
| even | Primary | 41.09 | 25.61 |
| even | Secondary | 35.85 | 11.90 |
| even | Tertiary | 56.97 | 36.80 |
| even | Info | 24.02 | 10.11 |
| even | Success | 48.87 | 10.06 |
| even | Warning | 38.88 | 1.20 |
| even | Danger | 46.02 | 17.66 |
| even | Data 1 | 64.38 | 17.41 |
| even | Data 2 | 49.40 | 28.47 |
| even | Data 3 | 29.38 | 11.35 |
| even | Data 4 | 40.00 | 14.38 |
| even | Data 5 | 43.29 | 11.27 |
| even | Data 6 | 45.16 | 15.13 |
| even | Data 7 | 25.94 | 8.30 |
| even | Data 8 | 25.87 | 12.17 |

perceptual: 4 of 16 moved (all pre-existing, pass 4-6 work). peak: 12 of 16 moved (the pass-5 anchor cap
construction; re-measured fresh at the new head for U3 review 3, N2, 5 of those 12 magnitudes shifted
again, Primary 4.17->3.09, Tertiary 4.14->5.14, Info 3.36->2.80, Data 6 15.98->13.48, Data 7 0.54->1.08,
since F1's peak-cap solver fix changed capped-stop rendering precision; the same 12 families still move,
none newly crosses the 0.05 listing threshold or drops out of it). even: 16 of 16 moved, expected, since
step 1 is a formula-wide reshape of the even path's damping, not a localized fix. The large even deltas
(up to 64.38, Data 1) are the intended, measured consequence of closing the median/p90 targets: those
families were the ones sitting furthest above the ceiling.

## C8 (hpg-role-contrast): before/after, all 96 cells

`node test/engine/semantic.mjs` passes at the new head (`role-contrast` green), no PINNED floor in
`test/engine/semantic.mjs`'s `FLOORS` table dropped, and AA 4.5:1 holds in all three modes, both schemes,
every one of the 16 families. Re-measured fresh at the new head for U3 review 3 (N2): 43 of the 96 cells
move by more than 0.0005 versus `bf2aaf6` (was reported as 44 at `6a4821e`; F1's peak-cap solver fix
moved two `peak` cells, Primary dark and Info dark, to just under the 0.0005 listing threshold, dropping
them out of the table, so the net count is one lower even though nothing was reverted). The `even` cells
are step 1's own; the `perceptual` and most `peak` cells are pre-existing, already-named (the 41 team-lead
named "pending U4" at plan revision 20). Per the U4 integration note in the plan (C8), no re-pin happens
this pass; the table below is the record U4 re-measures against.

Only cells that moved by more than 0.0005 are listed (26 of 96 rows; the rest are byte-identical to
`bf2aaf6` or move by 0.0005 or less, see `test/engine/semantic.mjs`'s `FLOORS` comments for those
sub-threshold drifts, e.g. peak Primary dark 4.6253->4.6257, peak Info dark 7.7182->7.7186, peak
Tertiary dark 5.5770->5.5767):

| mode | family | light before | light after | delta | dark before | dark after | delta |
|---|---|---|---|---|---|---|---|
| perceptual | Neutral | 5.8876 | 5.9007 | +0.0131 | 4.9841 | 4.5327 | -0.4514 |
| perceptual | Success | 6.1815 | 6.1018 | -0.0797 | 4.8728 | 4.8771 | +0.0043 |
| perceptual | Danger | 7.1662 | 7.1662 | +0.0000 | 5.1324 | 5.1315 | -0.0009 |
| even | Primary | 7.1597 | 7.1593 | -0.0004 | 4.5104 | 4.5308 | +0.0204 |
| even | Secondary | 5.2314 | 5.2550 | +0.0236 | 5.8367 | 5.8375 | +0.0008 |
| even | Tertiary | 7.1043 | 7.1366 | +0.0323 | 4.5145 | 4.5071 | -0.0073 |
| even | Info | 7.1164 | 7.1291 | +0.0127 | 4.5225 | 4.5072 | -0.0154 |
| even | Success | 8.0496 | 8.0496 | +0.0000 | 5.1852 | 5.1987 | +0.0135 |
| even | Warning | 9.4559 | 9.4559 | +0.0000 | 5.0231 | 5.0587 | +0.0356 |
| even | Danger | 8.0463 | 8.0763 | +0.0300 | 5.1543 | 5.1694 | +0.0151 |
| even | Data 1 | 5.2342 | 5.2562 | +0.0220 | 5.8396 | 5.8662 | +0.0266 |
| even | Data 2 | 5.2436 | 5.2623 | +0.0187 | 5.8765 | 5.8548 | -0.0216 |
| even | Data 3 | 5.2402 | 5.2581 | +0.0178 | 5.8614 | 5.8520 | -0.0094 |
| even | Data 4 | 5.2616 | 5.2754 | +0.0138 | 5.8562 | 5.8833 | +0.0271 |
| even | Data 5 | 5.2857 | 5.2773 | -0.0084 | 5.8518 | 5.8501 | -0.0017 |
| even | Data 6 | 5.2624 | 5.2887 | +0.0262 | 5.8526 | 5.8247 | -0.0279 |
| even | Data 7 | 5.2355 | 5.2855 | +0.0500 | 5.8380 | 5.8234 | -0.0146 |
| even | Data 8 | 5.2365 | 5.2489 | +0.0123 | 5.8757 | 5.8451 | -0.0305 |
| peak | Neutral | 6.2637 | 6.2782 | +0.0145 | 4.5077 | 4.6977 | +0.1899 |
| peak | Secondary | 11.5512 | 11.5603 | +0.0091 | 15.1950 | 15.1950 | +0.0000 |
| peak | Success | 7.2072 | 7.2142 | +0.0070 | 11.8740 | 11.9037 | +0.0297 |
| peak | Warning | 4.8188 | 4.8392 | +0.0204 | 7.4923 | 7.5065 | +0.0142 |
| peak | Danger | 7.1662 | 7.1662 | +0.0000 | 5.1324 | 5.1315 | -0.0009 |
| peak | Data 2 | 4.7957 | 4.7957 | +0.0000 | 5.5943 | 5.5797 | -0.0146 |
| peak | Data 6 | 11.6401 | 11.6430 | +0.0029 | 15.0969 | 15.0969 | +0.0000 |
| peak | Data 7 | 11.8825 | 11.8835 | +0.0010 | 15.5544 | 15.5544 | +0.0000 |

`perceptual Neutral dark` (-0.4514) and `peak Neutral dark` (+0.1899) are pre-existing moves from earlier
passes (R2, the pass-5 peak cap), not step 1's, step 1 touches only `even`, and the `even` deltas above
(max +0.0500, `Data 7` light) are all small fractional moves; none cross a pinned floor digit.

Re-measured fresh for U3 review 3 (N2), after F1's peak-cap solver fix: `peak Primary dark` and
`peak Info dark` dropped out of this table (both now move by 0.0004, under the 0.0005 listing
threshold, see `test/engine/semantic.mjs`'s `FLOORS` comments), `peak Warning dark`'s delta corrected
from +0.0228 to +0.0142 (the `6a4821e`-era figure of 7.5150 was pre-F1; the current value is 7.5065),
`peak Data 6 light`'s delta flipped sign, -0.0009 to +0.0029 (F1 moved this cell's direction, not just
its magnitude), and `peak Data 7 light` newly crosses the threshold (+0.0010, was untracked before).
No other row in this table changed from its `6a4821e` figure.

## Thin cells [4.50, 4.55) per mode, at the new head

| mode | family | scheme | ratio |
|---|---|---|---|
| perceptual | Neutral | dark | 4.5327 |
| even | Neutral | dark | 4.5280 |
| even | Primary | dark | 4.5308 |
| even | Tertiary | dark | 4.5071 |
| even | Info | dark | 4.5072 |

All five clear the ruled AA floor (4.5:1); none is below it. `peak` has no cell in this band. `perceptual
Neutral dark` is pre-existing (the R2 re-pin, `.sdlc/questions/pif-u3.md` Q6); the four `even` entries are
new this pass (step 1's retune moved them closer to, not below, the floor) and are named here per the
brief's "no floor drops without old/new values" gate, none of the four is a PINNED-floor drop (the
`FLOORS` table's own even-mode entries for Primary/Tertiary/Info are 4.5 already, at their AA minimum,
and `Neutral` at 4.5), so this is a report line, not a gate change.

## Methodology notes

All figures measured fresh for this record via scratch scripts under
`u3fix/{medianp90-at-ref,kit-movement,c8-measure}.mjs` (session scratchpad, not committed), using
`file://` imports of each ref's own `src/ui/model.mjs` + `src/engine/tonal.js` + `src/ui/persist.js` (a
`git archive` checkout for `bf2aaf6`/`4362180`, the live worktree for the new head) so each ref is
measured with its OWN code, not a mix of versions. The C8 measurements reuse `model.mjs`'s own
`brandKit`/`contrastRatio`/`slug`, identical to `test/engine/semantic.mjs`'s own gate.

Re-run again for U3 review 3 (N2), against the live worktree at its current head (after F1, F2, F3, and
this review's own N1/N4/N5/N6 fixes), reusing the same three scripts and the same `bf2aaf6` archive
checkout unchanged. F1 (the peak-cap solver fix) is the only landed change between `6a4821e` and the
current head that touches rendered output, so the only tables above with a real re-measured delta are
the ones with a `peak`-mode cell reachable through a capped stop; `perceptual` and `even` are confirmed
byte-identical to their `6a4821e` figures throughout.
