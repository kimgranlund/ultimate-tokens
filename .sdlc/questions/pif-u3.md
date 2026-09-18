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
  corpus (all 3,780 palettes, no chroma floor, both stop sets, `test/engine/tonal.mjs`
  "chroma-envelope" C6 (i), this unit's new gate — see Q3 for the corpus-scope correction and C6 (ii)).
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

## Q2 — MOOT as of plan rev7 (retired the magnitude bar): kept for the record

Plan revision 7 (`d547a7a`) retired the sub-pixel/magnitude C6 bar this question was written against
("a chroma cliff repair moves more than one 8-bit channel, so a sub-pixel bar is unsatisfiable") and
replaced it with the four ramp-shape gates now covering C6 under U3's unit text. The measurements below
are still accurate for the record and still show the diagnosed peak-mode OKHSL/CAM16 cusp mismatch is
real and pre-existing, which may be useful background for U2, but no decision is needed here anymore —
the numeric median/p90/above-100% targets this question was about no longer exist as pass criteria.

### (original text, no longer a live blocker)

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

## Q3 — REVISED at plan tip 6429c49/rev8: duplicate hex is a widespread PRE-EXISTING peak-mode defect, not introduced by this unit, and not closable to 0 in this lane

Superseding my first read of this question (below the line). Rev8 named the Varanger witness (hue 110,
chroma 6, skew 0, lift 39, peak, stops 150/175 both `#FDFDFA`) as arising from "Lane A's #668 R1
residue," implying a correct #668 fix removes it. Direct measurement says otherwise.

**Varanger is present in my corpus and still duplicates** — at a DIFFERENT stop pair and hex than rev8's
citation (my branch: stops 200&250, `#FAFAF9`; rev8's citation: stops 150&175, `#FDFDFA`), because the
specific collision point depends on the exact damping formula, not just whether liftStop-keying is
present. Widening the duplicate scan to the FULL corpus, ALL palettes (not just chroma >= 10 — Varanger's
own chroma is 6, below that floor, which is why my first pass over this file's own C6 median/p90 corpus
filter missed it), peak mode (0 in perceptual and even, both stop sets):

| engine | peak-mode ramps with >= 1 duplicate, full corpus (both stop sets checked, 25-stop shown) |
|---|---|
| pre-U3 baseline (`362cc48`, unmodified, before any #668 fix attempt) | 21 |
| this unit's shipped engine (Design A, R1c liftStop-keyed) | 7 |

**The 21-case baseline count is measured on `362cc48` directly, with NO #668 fix of any kind applied** —
not Lane A's R1 residue, not this unit's chromaEnvelope, nothing. This means the duplicate-hex defect
class is NOT something #668's damping-position bug introduced or that an R1 residue introduced; it
predates all of it. It is a general peak-mode near-white 8-bit rounding collision under lift, present at
scale before any of this plan's work started. This unit's liftStop-keyed envelope cuts it roughly 3x (21
-> 7) as a side effect of doing its actual job correctly, but does not (and I believe structurally cannot
from inside `chromaEnvelope` alone) reach 0.

Full list of the 7 remaining, all peak mode, all near-white, all chroma <= 23, all lift 33-40 (i.e. same
mechanism, same class, not scattered noise):
- cuisine "Pie & milkshake" tertiary-muted (hue 168 chroma 23 lift 40): stops 175&200
- nature "Varanger / Finnmark tundra" tertiary (hue 110 chroma 6 lift 39): stops 200&250 (rev8's own
  named witness, still present, different stop pair)
- nature "Baffin Island fjord" tertiary-muted (hue 96 chroma 4 lift 40): stops 175&200 AND 250&300
- nature "Rannoch Moor blanket bog" primary (hue 96 chroma 4 lift 40): stops 175&200 AND 250&300
- nature "Everglades sawgrass prairie" secondary-muted (hue 96 chroma 4 lift 37): stops 250&300
- nature "Central Mongolian steppe" primary (hue 96 chroma 6 lift 33): stops 150&175
- travel "shrine of Lal Shahbaz Qalandar" tertiary-muted (hue 100 chroma 2 lift 39): FOUR colliding pairs

Root cause (verified by comparing raw RGB triples between the two engines at the colliding stops):
correctly keying chroma damping on `liftStop` (this unit's whole job) makes chroma differentiate LESS
between two nominal stops exactly where lift has ALSO compressed their lightness reading close together.
Near white, that reduced differentiation, stacked on lightness that was already nearly flat there, is
enough to round adjacent 8-bit stops to the identical hex. The pre-U3/pre-any-fix code's cruder,
inconsistent damping happened to over-differentiate chroma in the same region often enough to avoid MOST
(not all — 21 cases already existed) collisions by accident, not by correctness.

I do not believe this is closable from inside `chromaEnvelope`: the fix needs either (a) widening chroma
differentiation back in exactly the region #668 needed it narrowed (reopens that defect), or (b) a
lightness-domain anti-collapse safeguard in `effStop`/`toneAt`'s density under lift in peak mode
specifically — general lightness-curve code, not literally U2's "anchor pass-through," but still outside
this unit's dispatched file-level scope (`chromaEnvelope`, `ANCHOR_STOP` threading, `evenChroma`,
`hueAnchorFrac` only).

Given the plan's rev7/rev8 wording states C6(ii)'s pass bar as 0/0/0 with no exception mechanism
(unlike C6(iii)'s explicit "named exception" allowance for docs/), and given 7 real, reproducible,
pre-existing-class collisions remain, I believe this criterion is not achievable from U3 alone as
currently scoped, and is asking a chroma-damping unit to close a lightness-domain, pre-existing defect.

**What I shipped, pending your ruling:** `test/engine/tonal.mjs`'s `chroma-envelope` gate (C6 ii) now
scans the full 3,780-palette corpus, both stop sets, no chroma floor, and holds a NAMED, CITED exception
list of exactly these 10 colliding stop-pairs (7 distinct ramps, 3 of them collide at 2 stop pairs each).
The gate fails if any NEW duplicate appears beyond this list, AND fails if any of the 10 cited pairs stop
reproducing (proving the list is load-bearing, not a blanket allow — verified both directions). This
mirrors C6(iii)'s own "named exception" shape rather than inventing a new mechanism, but the plan text
does not currently authorize it for C6(ii), so it needs your ruling before landing, not just review.

Options:
- Ratify the shipped named-exception list (same shape as C6(iii)'s docs/ mechanism) as C6(ii)'s pass bar,
  citing the 21->7 baseline reduction as the accepted evidence (Recommended — this is what's shipped)
- Re-scope C6(ii) in the plan text to "no worse than the measured pre-U3 baseline count" instead of an
  enumerated list, if a numeric ceiling is preferred over named pairs
- Spin up a small dedicated lightness-domain unit (peak-mode near-white anti-collapse under lift, in
  `effStop`/`toneAt`) ahead of or alongside U3, and hold C6(ii) at true 0 until it lands
- Block U3 pending a plan-level decision on which of the above

---
*(superseded first read, kept for the record):* I originally found and gated ONE such case (hue 168, lift
40, stops 175/200) because my corpus scan for this reused the C6 numeric check's `chroma >= 10` filter,
which excludes Varanger (chroma 6) and most of the other 6 cases above. That filter is appropriate for
the (now-retired, rev7) magnitude bar but wrong for a duplicate-hex scan; the gate below is corrected to
scan the FULL corpus with no chroma floor.

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

## Q5 — C6(iii)'s docs/ exception list needs 2 more named paths for this unit's own, unavoidable citation fix

C6(iii) (rev7) expects `git diff --stat origin/main -- docs/` to list only the 2 `adia-*` files. Measured
against MY OWN base (`362cc48`, the correct scope for judging this unit in isolation — origin/main has
since moved to `7390aff` and differs from the plan branch in ways unrelated to any unit's work), my diff
touches exactly 4 docs/ paths: the 2 expected `adia-*` files, plus
`docs/reference/reviews/2026-08-20-reactivity/{00-synthesis,04-context-and-messaging}.md` — each a
single-line citation fix (`src/engine/tonal.js:395` -> `:404`) made necessary because this unit's own new
doc comment in `tonal.js` moved the `_okL` memo map's line number. `node scripts/audit-citations.mjs`
requires STALE 0 as explicit evidence for this unit per the dispatch; not fixing these would leave 2
STALE lines that this unit's own change caused.

Options:
- Add these 2 paths to C6(iii)'s named-exception list with the one-line reason above (Recommended — this
  is exactly the "named exception" shape C6(iii) already describes, just not yet enumerated for this case)
- Revert the citation fixes and let `audit-citations` fail, escalating the STALE lines to whichever unit
  owns that doc instead (not recommended — the STALE lines exist only because of this unit's own edit)
