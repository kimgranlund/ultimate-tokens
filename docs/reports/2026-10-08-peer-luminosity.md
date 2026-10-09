# Peer luminosity: why the brightest steps do not share lightness across palettes (2026-10-08)

Evidence for T-0039 (spike, diagnose first). User report: in 16 stacked 12-step scales, "some of the
brightest colors dont seem to have 1:1 luminosity across peer palettes". No product file changed. The
fix options need a user decision (see Decision needed).

## Answer in five lines

1. The screenshots are the Color canvas "Radix" view (`src/ui/sections/color.js` `renderRadixScene`),
   which paints the engine's own `exportRadix` output: steps 1 to 8 are raw ramp stops 100 to 350
   (dark: 900 to 650), steps 9 to 12 are role-derived (stops 550, 650, 750, 950 in light).
2. Every Radix step inherits the ramp's lightness at that stop, so it is only as aligned as the 25-stop
   ramp is. The ramp is lightness-aligned across palettes in exactly one configuration: `toneMode:
   "even"`, no anchor, `skew` 0, `lift` 0. Measured CIELAB L* spread there: 0.2 to 0.4 at every stop.
3. The shipped default is none of those. Default kit: `perceptual`, all 16 palettes anchored, 7 with
   non-zero `skew` or `lift`. Measured OKLab L spread across the 16 palettes: 0.063 to 0.121 at Radix
   steps 1 to 9 (light), CIELAB L* spread 7 to 15.
4. The spread is by design in the shipped construction (ADR-026 anchors pin stop 500 to the user's
   colour; `skew`/`lift` are per-palette user controls). It does not violate any gate: no gate asserts
   cross-palette lightness outside `even` mode, and two gates assert the opposite for `perceptual`.
5. Not fixed. Every candidate fix either contradicts a ratified ruling or changes stored-document
   output for existing kits, so it is a product decision, not a bounded engine change.

## Method

Scripts were throwaway (scratchpad, not committed); every number below is reproducible with this
recipe against any tree at or after `88752594`.

- Subjects: `defaultDocument()` (16 palettes) read through `projectView` (`src/ui/model.mjs`), and the
  curated corpus (8 category files, 343 documents, 3,780 palettes) read through `hydrate` then
  `derivedAll` (`src/engine/exports.js`), `toneMode` as stored (all `perceptual`).
- Lightness measured from the emitted 8-bit sRGB pixel with an independent sRGB to OKLab conversion
  (Ottosson matrices), never from the ramp's own `tone` field (anti-tautology). CIELAB L* from
  `lstarFromRgb`, CAM16 J from `cam16FromRgb` (`src/engine/hct.js`). The Radix rows are parsed back
  out of the emitted `oklch(L C H)` strings.
- Spread = max minus min over the palettes compared, per stop or per Radix step.
- Variants (default kit, 16 palettes): strip `anchor`/`sourceAnchor`, zero `skew` and `lift`, and
  force `toneMode` to `perceptual`, `peak` or `even`.

## Which view the screenshots come from

The 12-step rows: Color canvas, view "Radix" (the `radix` view entry and `renderRadixScene` in `color.js`). The 19-stop
display ramp in the palette cards is the same ramp at the same stops, so it shows the same spread
(the 25-stop table below covers both). Stop 050 is `#FFFFFF` in every palette at `lmax` 100
(`knowledge-02-tonal-scale.md` section 7): the "pure white first swatch" is that, by design.

## Table 1: default kit, Radix 12-step, OKLab L spread across palettes

Light scheme (step 1 reads stop 100, step 9 stop 550):

| subset | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| all 16 | 0.063 | 0.084 | 0.099 | 0.111 | 0.118 | 0.121 | 0.105 | 0.100 | 0.119 | 0.091 | 0.045 | 0.016 |
| Data 1 to 8 only | 0.009 | 0.014 | 0.017 | 0.021 | 0.025 | 0.020 | 0.019 | 0.016 | 0.007 | 0.018 | 0.021 | 0.016 |
| the other 8 (Neutral, Primary, Secondary, Tertiary, Info, Success, Warning, Danger) | 0.063 | 0.084 | 0.099 | 0.111 | 0.118 | 0.121 | 0.105 | 0.098 | 0.116 | 0.088 | 0.041 | 0.016 |
| all but Warning | 0.039 | 0.053 | 0.064 | 0.075 | 0.083 | 0.089 | 0.096 | 0.100 | 0.077 | 0.064 | 0.045 | 0.016 |

Dark scheme (step 1 reads stop 900, step 9 stop 450; step 12 is white in every palette):

| subset | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| all 16 | 0.032 | 0.036 | 0.034 | 0.033 | 0.036 | 0.045 | 0.063 | 0.091 | 0.091 | 0.100 | 0.121 | 0.000 |
| Data 1 to 8 only | 0.016 | 0.018 | 0.020 | 0.018 | 0.019 | 0.021 | 0.020 | 0.018 | 0.004 | 0.016 | 0.020 | 0.000 |

Light-scheme per-palette rows for the two ends of the report (full 16 rows were measured; these show
the extremes): step 1 Warning 0.991 against Tertiary 0.928; step 6 Warning 0.872 against Danger 0.751;
step 9 Warning 0.397 and Success 0.440 against Data 6 0.516 and Secondary 0.513.

Reading: the 8 Data palettes, whose default anchors were picked at one lightness (OKLab L 0.558 to
0.560), are matched to within 0.025 at every step. The mismatch is almost entirely the 8 brand and
system palettes, and within those Warning is the largest single contributor (dropping it takes the
step 1 to 6 spread from 0.063 to 0.121 down to 0.039 to 0.089).

## Table 2: default kit, 25-stop ramp, spread across the 16 palettes

| stop | OKLab L | CIELAB L* | CAM16 J | lightest / darkest palette (OKLab L) |
|---|---|---|---|---|
| 050 | 0.000 | 0.00 | 0.00 | all white |
| 075 | 0.038 | 4.4 | 6.1 | Warning 0.997 / Danger 0.959 |
| 100 | 0.063 | 7.5 | 10.0 | Warning 0.991 / Tertiary 0.928 |
| 150 | 0.099 | 11.8 | 15.3 | Warning 0.967 / Danger 0.868 |
| 200 | 0.118 | 14.4 | 17.7 | Warning 0.928 / Danger 0.810 |
| 250 | 0.121 | 15.0 | 17.4 | Warning 0.872 / Danger 0.751 |
| 350 | 0.100 | 15.7 | 13.1 | Data 6 0.732 / Danger 0.632 |
| 500 | 0.112 | 15.4 | 12.1 | Data 3 0.560 / Warning 0.448 |
| 550 | 0.118 | 15.9 | 12.0 | Data 6 0.516 / Warning 0.397 |
| 650 | 0.091 | 12.1 | 8.2 | Data 6 0.426 / Warning 0.336 |
| 750 | 0.045 | 6.9 | 3.6 | Data 6 0.343 / Danger 0.298 |
| 850 | 0.034 | 4.7 | 2.3 | Warning 0.265 / Tertiary 0.231 |
| 950 | 0.016 | 1.5 | 0.9 | Success 0.182 / Tertiary 0.165 |

## Table 3: what moves the spread (default kit, OKLab L spread / CIELAB L* spread)

| configuration | stop 100 | stop 200 | stop 300 | stop 500 | stop 700 |
|---|---|---|---|---|---|
| perceptual, as shipped (anchored, skew/lift) | 0.063 / 7.5 | 0.118 / 14.4 | 0.105 / 14.5 | 0.112 / 15.4 | 0.063 / 8.6 |
| perceptual, anchored, skew and lift zeroed | 0.016 / 2.0 | 0.053 / 7.2 | 0.066 / 10.1 | 0.112 / 15.4 | 0.063 / 8.6 |
| perceptual, anchors removed, skew/lift zeroed | 0.032 / 3.8 | 0.092 / 11.3 | 0.145 / 18.7 | 0.260 / 33.7 | 0.172 / 21.0 |
| even, as shipped | 0.050 / 5.8 | 0.109 / 13.0 | 0.113 / 13.9 | 0.112 / 15.4 | 0.055 / 7.3 |
| even, anchored, skew and lift zeroed | 0.008 / 1.1 | 0.026 / 3.7 | 0.052 / 7.0 | 0.112 / 15.4 | 0.056 / 7.3 |
| even, anchors removed, skew/lift zeroed | 0.004 / 0.2 | 0.016 / 0.3 | 0.019 / 0.2 | 0.056 / 0.2 | 0.018 / 0.3 |
| peak, as shipped | 0.048 / 5.6 | 0.107 / 13.0 | 0.112 / 14.3 | 0.112 / 15.4 | 0.056 / 7.8 |

Only the sixth row (`even`, no anchors, no skew/lift) is tone-aligned (L* spread 0.2 to 0.3). Its OKLab spread is not zero
(0.056 at stop 500) because the engine aligns CIELAB L*, not OKLab L; the two differ by hue.

## Table 4: curated corpus, spread across the palettes of each document

343 documents, 3,780 palettes, 3,380 anchored. Median and 90th percentile of the per-document spread.

| stop | as shipped OKLab L (median / p90) | as shipped L* (median / p90) | even, no anchor, skew/lift zeroed L* (median / p90) |
|---|---|---|---|
| 100 | 0.040 / 0.052 | 4.6 / 6.0 | 0.2 / 0.2 |
| 200 | 0.127 / 0.167 | 14.8 / 19.5 | 0.2 / 0.2 |
| 300 | 0.225 / 0.293 | 26.3 / 34.3 | 0.2 / 0.2 |
| 500 | 0.449 / 0.590 | 52.3 / 68.5 | 0.3 / 0.3 |
| 650 | 0.290 / 0.377 | 33.9 / 43.8 | 0.3 / 0.3 |
| 850 | 0.098 / 0.127 | 11.3 / 14.6 | 0.4 / 0.4 |

The corpus is larger than the default kit because each curated document pins each palette to a real
sampled colour: the anchors in one document span near-white to near-black.

## Root cause, by cause

The spread has three independent sources. In the default kit they stack; none is a defect.

1. Anchor pivot lightness (the dominant one at stop 500, and the reason mid-ramp steps 6 to 9 differ).
   Every default palette carries an `anchor`. The anchored branches pin stop 500 to the anchor
   verbatim and run each side affinely from the anchor's own tone to the shared ends:
   `anchorLerp` (`src/engine/tonal.js:1090`) with `pivotTone` (even, `tonal.js:1249`) or `pivotL`
   (OKHSL, `tonal.js:1853`). Tone at a stop is therefore a function of the anchor's own lightness.
   Default anchors range OKLab L 0.448 (Warning `#774902`) to 0.560 (Data 3 `#D6153B`). Two palettes
   with different anchor lightness cannot share lightness at 500, and the offset decays toward the
   ends and is gone at 050 and 950. ADR-026 rules that the anchor is verbatim; this is its direct
   consequence, and `anchor-identity` (`test/engine/anchor.mjs`) would fail if it were removed.
2. Per-palette `skew` and `lift`. Default values: Neutral, Primary, Tertiary, Info, Success and Danger
   `skew` -20 (Success and Danger `lift` -5), Warning `skew` 40 `lift` -36. They warp the stop
   position the lightness is read at (`effStop`, `tonal.js` OKHSL path; `toneAt` on `even`), and apply
   in every tone mode (#647). Warning's step 1 at 0.991 and its step 9 at 0.397 are its `skew`/`lift`
   plus a dark anchor. Zeroing skew and lift on the anchored kit cuts the stop 100 to 200 spread by
   55 to 75 percent (Table 3, rows 1 and 2).
3. Cusp pull (`vibrancy`, default 50) on UNANCHORED palettes in `perceptual` and `peak`.
   `lightnessAt` (`tonal.js:2008`) blends an even distribution with one that puts the hue's chroma
   cusp at stop 500, so yellow reads lighter and blue darker (the engine's stated intent,
   `DEFAULT_CONTROLS` comment at the `toneMode` default in `DEFAULT_CONTROLS`). On anchored palettes this does not apply (the pivot
   is the anchor, `tonal.js:1853` blends two curve shapes about one pivot), so it is not the cause for
   the default kit. It is the cause for a user-created palette with no anchor: Table 3 row 3, spread
   0.260 at stop 500.

Radix steps 9 to 12 add no new mechanism: step 9 is the bare accent role, stop 550 light and stop 450
dark under the default `accentRef: "mode"` (`radix-projection.json`), so it carries the stop 550 and
450 spread in Table 2. The `on-accent` contrast policy picks text colour, not fill lightness.

## By design, and against the repo's own rule

By design (documented and tested):
- Stop 050 white at `lmax` 100 in every palette (`knowledge-02` section 7).
- Anchored stop 500 verbatim in every tone mode (ADR-026, `anchor-identity`, `anchor-ramp`), hence a
  per-palette stop 500 lightness.
- Per-palette `skew`/`lift` shifting where lightness lands (#647).
- `perceptual` and `peak` hue-dependent lightness on unanchored palettes: `test/engine/tonal.mjs`
  gates `vibrancy` (a yellow centre must lift L* by more than 10) and `cusp-pull` (the richest stop of
  yellow moves toward 500). Those gates would fail if the centre were lightness-aligned.
- Radix steps 1 to 8 are raw ramp stops by ruling (issue #588), steps 9 to 12 role-derived; neither is
  lightness-matched across palettes by construction. (The ticket's wording that Radix follows "its own
  per-hue steps 9 and 10" is not what the exporter does: it maps stops 550 and 650 of this ramp, not
  Radix's hand-picked per-hue solids.)

Against the repo's own rule: none found. The only stated "same L* for every hue" claim is for the
`even` path (the `toneAt` comment block in `tonal.js`, `.claude/skills/color-math/SKILL.md` line 42), and it holds: L* spread
0.2 to 0.4 for the unanchored, zero-skew, `even` configuration, measured on all 343 corpus documents
(Table 4, last column). `gate:corpus-tonal` (`test/engine/tonal.mjs --full`) checks per-palette
monotonicity, gamut, hue and curve fidelity; it has no cross-palette lightness assertion in any mode.
So the premise "within a set the engine tone-matches stops by design for the 25-stop ramp" is true
only for `even` and unanchored palettes, not for the shipped default; the ticket's context overstates
it, and the knowledge docs do not (they scope it to `even`).

## Options

| option | what changes | cost | risk |
|---|---|---|---|
| A. Document as by design | Add a short note to `knowledge-02` section 2 and the Radix view tooltip: step lightness follows each palette's anchor and skew/lift; only `even` plus no anchor is lightness-aligned | under 1 hour, docs only, no output change | none |
| B. Make the default kit's brand and system anchors lightness-matched, as the Data anchors already are (OKLab L about 0.56) | Edit `defaultDocument()` anchors in `src/ui/model.mjs` for 8 palettes, zero Warning's `skew`/`lift` | small code, but changes every default kit's stored output; outside the `ramp-identity` gate's reach (adapter section 1: head-only edits to the default kit's palette list are invisible to it), so needs the neutrality tool `scripts/report-compute-neutral.mjs`; changes brand colours the user chose | moves the visible brand identity of the default kit |
| C. A new opt-in control, "match peer lightness", that shares one pivot tone across palettes for the ramp and keeps the anchor only as the prime/key colour | New control in `DEFAULT_CONTROLS`, a persist schema bump, a third branch in each of the four ramp builders, UI and docs; contradicts ADR-026's "stop 500 is the anchor, verbatim" unless scoped to a mode that breaks it knowingly | large (L4 to L5): schema migration, four builders, new gates, `ramp-identity` declaration | highest; touches the engine core |
| D. Radix export only: rebuild steps 1 to 8 from a tone-aligned unanchored `even` ramp per palette | `exportRadix` gets a second ramp per palette | medium, but breaks the #588 ruling (raw stops) and the reference form (`var(--...-NNN)` links that must resolve to ratified primitives, `exports.js` `radixRefLeaves`) | Radix scale would no longer match the CSS/DTCG/Tailwind output of the same kit |
| E. Make `even` the default `toneMode` | One default | changes every stored-default document's ramp; fails `ramp-identity` for the whole corpus; reverses T-0014 / ADR-030 vibrancy default | highest regression surface; does not fix anchored palettes at all (Table 3, row 4 still 0.109 at stop 200) |

Option E is dominated: it does not remove the main cause (anchors). Options C and D each break a
ratified ruling. Options A and B are the cheap ones, and B only fits a user whose intent is "the
default kit should look evenly lit", not "my brand colours are pinned".

## Decision needed

The user decides what "1:1 luminosity across peer palettes" means for an anchored kit:

1. Accept it as the anchor and skew/lift consequence and document it (option A), optionally also
   levelling the default kit's brand and system anchors (option B); or
2. Want a real lightness-matched mode (option C), which is a new feature with its own plan, because it
   has to either unpin stop 500 or accept a kinked ramp at the pivot.

No fix was made, so no new gate was added. If option C is chosen, the gate to write first is a
cross-palette L* spread gate in the shipped default mode over the default kit, red today (Table 3, row
1: 15.4 at stop 500), green only when the new mode is on.
