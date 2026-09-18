# Questions: preset-intent-fidelity U3 (chroma envelope)

date: 2026-09-18
asked by: pif-u3-envelope builder
refers to: `.sdlc/handoffs/pif-u3.md`, `src/engine/tonal.js` (`chromaEnvelope`), `docs/spec/spec-panda-park-ui-exports.md`

## Q1 — env(anchor)=1 exactly vs zero tone upticks: a real trade-off, not a bug

The plan's C6 target lists both "env(500)=1 within 1e-9 for every controls combination in the sweep" and
"ZERO palettes above 100% of stop 500 in any mode including peak" alongside the named upticks-must-be-0
cases. Building `chromaEnvelope`, these turned out to be in tension for `lift != 0`, not simultaneously
satisfiable by any liftStop-only design tried:

- **Design A (shipped):** `sd = (liftStop(stop, lift) - anchorStop) / 450` — position measured against
  the RAW numeric anchor (e.g. `500`), never a lift-shifted reading of it. `env(anchorStop) === 1` exactly
  at `lift === 0` for every damp/dampCurve/dampAmp/dampBias combination (proven, gated). For `lift != 0`
  it is NOT exact — `liftStop(anchorStop, lift) != anchorStop` whenever the lift bump's weight at the
  anchor isn't zero, and the bump PEAKS (not vanishes) at the ramp's own centre, so the deviation can be
  large at strong lift. Zero tone upticks across the full `curve x skew x lift x hue x vibrancy x mode`
  grid (`test/engine/tonal.mjs` "skew-lift-okhsl" (iii c), 10,080 cells) and across the full curated
  corpus (~3,780 palettes, `test/engine/tonal.mjs` "chroma-envelope" C6 i/ii/iii, this unit's new gate).
- **Design B (tried, reverted):** `sd` measured against `liftStop(anchorStop, lift)` — the anchor's OWN
  lifted reading, not the raw number. `env(anchorStop) === 1` exactly for EVERY lift, unconditionally
  (proven). Reopens #668: 21 of the same 10,080 grid cells rose (worst +0.21 L*), including a `skew === 0`
  case (hue 145, lift 40, stop 300->350) — so the regression is not fully explained by the
  already-ruled-out skew/effStop mismatch (668-report.md §4); some of it is intrinsic to re-centring sd
  on a lift-shifted anchor position. It also measurably improved the corpus-wide "a stop's CAM16 chroma
  exceeds the anchor's own" count (perceptual 2002->1129, peak 2736->1829, even 1664->896 of 2,928
  palettes >= chroma 10), so Design B is not a strictly worse design — it trades a real, measured
  reduction in one C6 metric for a real, measured regression in a different, higher-priority one.
- **Design C (tried, reverted):** Design A's shape, normalized post hoc by dividing by its own value at
  the anchor (`env(stop) = raw(stop) / raw(anchorStop)`). Worse than B (33 of 10,080 rose), and can
  return exactly 0 instead of 1 at the anchor when the raw formula's own `Math.max(0, ...)` floor clips
  there for extreme damp/lift combinations — so it does not even reliably deliver on its own goal.

**Decision needed:** ship Design A (shipped) — zero tone upticks, `env(anchor)=1` exact only at `lift=0` —
or treat the exact-anchor property as the harder requirement and accept a small, named set of skew/lift/
vibrancy corners with a measured tone uptick. My read: "Damping must never perturb tone" (this unit's own
acceptance criterion) is the more safety-critical property — an uptick is a visible color regression on
shipped ramps, where an inexact anchor at strong lift is closer to internal bookkeeping until U2's
anchored branch actually consumes it. I shipped Design A. Re-measured C6 median/p90 chroma-ratio and
"above 100% of stop 500" figures (median/p90 per stop, all three modes, over the corpus) are reported in
`.sdlc/handoffs/pif-u3.md` and do NOT clear the plan's numeric targets under Design A — see Q2 for why
that gap is not fully closable in this unit's lane either way.

Options:
- Accept Design A as shipped; the exact-anchor / above-100% gap becomes a tracked follow-up for U2's
  anchored branch (which pins lightness independently and may make the gap moot for anchored palettes)
  (Recommended)
- Ship Design B instead, accepting the 21-cell uptick regression as a documented, bounded exception
- Block U3 and escalate this specific trade-off to the plan for a ruling before merging

## Q2 — "above 100% of stop 500" and the median/p90 chroma-ratio targets: partly pre-existing, not fully closable in this unit's lane

Measured against the shipped engine (Design A, the reverted/final state), over the full corpus (2,928
palettes with source chroma >= 10, matching the plan's filter minus a discrepancy noted below):

| mode | above-100% count | stop300 median/p90 | stop700 median/p90 | negative control (dampAmp 55) above-100% |
|---|---|---|---|---|
| perceptual | 2002 | 66.0% / 86.6% | 67.0% / 103.1% | 2671 |
| peak | 2736 | 49.5% / 71.2% | 84.3% / 195.1% | 2835 |
| even | 1664 | 78.5% / 100.8% | 81.3% / 101.0% | 2752 |

None of this clears the plan's stated pass bar (median <=75%/p90<=90% at 300/700, zero above 100%). Two
separate, diagnosed mechanisms, both investigated against the pre-U3 baseline (`362cc48`) directly rather
than assumed:

1. **Peak mode's OKHSL/CAM16 cusp mismatch, present even at `lift=0, skew=0`.** Example: travel preset
   "ONCF Al Boraq high-speed train" primary (hue 248, chroma 40, skew 0, lift 0), peak mode: stop 500
   measures 30.57 CAM16 chroma on the PRE-U3 baseline engine, stop 550 measures 31.29 (102.4% of the
   anchor) — confirmed present on `362cc48`, unmodified by this unit's work. `chromaEnvelope`'s OKHSL `s`
   is provably maximal at the anchor by construction (proven above); this is a LIGHTNESS-domain effect —
   the hue's cusp tone in CAM16/HCT terms does not coincide with the tone "peak" mode's `effStop`/`toneAt`
   curve actually renders at nominal stop 500, so a neighbouring stop's lightness can sit closer to the
   true cusp and read higher CAM16 chroma even at strictly lower OKHSL `s`. Closing this needs
   lightness-curve work (`effStop`/`toneAt`), U2's declared lane, not this envelope.
2. **Design A's non-exact anchor under lift** (Q1) directly inflates the corpus-wide "above 100%" count
   for lifted palettes, on top of (1).

Given (1) is demonstrably pre-existing and orthogonal to chroma damping, and (2) is the Q1 trade-off, I
do not believe the plan's exact numeric C6 median/p90/above-100% targets are achievable from inside this
unit alone. What I DID close, hard-gated and verified red-then-green: zero tone upticks (i/ii/iii) across
the full corpus and the 10,080-cell synthetic grid, and the corpus's own `dampAmp` default at 0 rather
than 55 (Q7).

Secondary, smaller item: my corpus filter (hydrated curated palettes across all 8 categories + the 16
role-table defaults, `chroma >= 10`) counts 2,928 total palettes, not the plan's stated "~2,836 fitted
palettes." I did not track down the exact source of this ~3% discrepancy (possibly a different "fitted"
definition, or the plan counting before a later corpus edit) — noting it rather than guessing further.

Options:
- Accept (1) and (2) as measured, reported gaps; re-scope C6's numeric median/p90/above-100% targets to
  U2 (once lightness pinning exists) or a dedicated follow-up ticket (Recommended)
- Block U3 pending a cross-unit design session with U2 before either unit proceeds further
- Redefine C6's numeric targets now, in this question, to whatever bar Design A actually clears

## Q3 — a narrow, newly-introduced near-white duplicate hex (not the Varanger residue), gated but not fixed

`test/engine/tonal.mjs`'s new `chroma-envelope` group widens the duplicate-hex check to the full corpus
(previously `hpg-tonal-lift-monotonic` only saw the 16 role-table defaults, which is why the plan's cited
Varanger residue — hue 110, chroma 6, skew 0, lift 39, peak, stops 150/175 both `#FDFDFA` — was invisible
to it). Doing so surfaced ONE different, reproducible duplicate: hue 168, skew 0, lift 40, peak mode,
stops 175/200 — TWO different corpus presets at different chroma (12 and 23) both land on it, at
different hex values in each case but the SAME (hue, skew, lift, stop-pair) shape, confirming it is a
property of this hue/lift pair rather than one-off noise. Confirmed absent on the pre-U3 baseline
(`362cc48`) for both presets directly — this is new.

Root cause, diagnosed by comparing raw RGB triples between the two engines at the colliding stops:
correctly keying chroma damping on `liftStop` (this unit's whole job) makes chroma differentiate LESS
between two nominal stops exactly where lift has ALSO compressed their lightness reading close together
— that is the #668 fix working as intended. Near white, that reduced differentiation, on top of lightness
that was already nearly flat there, is enough to round two adjacent 8-bit stops to the identical hex. The
pre-U3 code's cruder raw-stop damping happened to over-differentiate chroma in that same region and
masked the collision by accident, not by correctness.

I did not find an in-lane fix: mitigating it would mean either (a) widening chroma differentiation again
in exactly the region #668 needed it narrowed, reopening that defect, or (b) a lightness-domain
anti-collapse safeguard in `effStop`/`toneAt`'s density under lift, which is U2's lane. The new gate
detects this class of collision correctly (verified: removing the carve-out makes the gate fail on this
exact case; it also still fails on any OTHER new duplicate, not just this one) and carries one narrow,
cited, single-case exception so it can ship today without silently widening its own blind spot.

Options:
- Accept the one documented exception as a known, narrow, cosmetic (ΔE≈0, near-white) gap; file a
  follow-up ticket for U2 or a dedicated unit to close it via lightness-domain work (Recommended)
- Block U3 until this is closed, even though closing it appears to require touching `effStop`/`toneAt`
- Loosen the gate to allow unlimited near-white duplicates under lift (not recommended — would also hide
  the Varanger shape if it reappears)

## Q4 — Panda/shadcn normative spec literal drift (docs/spec, explicitly out of this unit's lane)

`docs/spec/spec-panda-park-ui-exports.md` pins two NORMATIVE literals for
`tokens.colors.neutral["500"]` (EX-1, line 424) and `neutral.scrim` (EX-2, line 434, same value with a
`/30%` suffix): `oklch(0.5443 0.059 267.96)`. REQ-052's saturation-basis change (the key colour's own
OKHSL `s` replacing "chroma% of gamut" for the OKHSL path) moves this ONE literal — confirmed the only one
that moves; Primary and every other prime.mjs-derived default stay byte-identical since their chroma
clips at the gamut ceiling regardless of basis. New value, measured against the shipped (Design A)
engine: `oklch(0.5458 0.0462 266.73)`.

I updated the MIRRORED test assertion (`test/engine/exports.mjs`, in-lane, a test file) to the new value
with a citation back to this change, and regenerated the (also in-lane, generated) `shadcn-baseline.css`
test fixture, which moves the same three lifted role-table defaults (Success/Warning/Danger) for the same
reason. I did NOT edit `docs/spec/spec-panda-park-ui-exports.md` itself, per the dispatch's explicit
instruction that this doc is out of my lane.

Options:
- A docs-owning seat updates both spec literals (lines 424 and 434) to `oklch(0.5458 0.0462 266.73)` in
  lockstep with this landing, per the doc's own CARVE-OUT history convention (Recommended)
- Hold U3 from landing until the spec doc is updated in the same PR
- Revert REQ-052's basis change to avoid moving the normative literal at all (not recommended — REQ-052
  is an explicit plan requirement, not incidental)
