---
kind: re-diagnosis
plan: preset-intent-fidelity
ticket: "#681"
unit: U3
written: 2026-09-19
inputs: `.git-worktrees/pif-u3-envelope/.sdlc/questions/pif-u3.md` Q7 pass-3 through pass-6 addenda
  (commits `997356e`, `f390308`/`39ba21e`, `54798a6`, `97652ad`, `72a15b2`, head `41b3aed`), Lane A's
  routing note `q7-p6-route.md`, the plan's own mechanism (E) text on Helmholtz-Kohlrausch (`#668`)
status: feeds a future plan revision, pending the owner's ruling on Question 2's recommendation
---

# U3 re-diagnosis: the damping retune and the uptick gate are the same coupling, not two bugs

## Why this doc exists

U3 is on pass 6. Two different `damp`/`dampCurve` retunes (92/0.5 and 98/0.65) each closed the
`--envelope` median/p90 table cleanly, and each reintroduced a real, different CIELAB-L* uptick
(C6 i / C7) on the real corpus when checked against `test/engine/tonal.mjs`'s own exit code, not a
fast-harness proxy. Both were reverted byte-for-byte. Per the standing rule ("a second workaround
means the model of the problem is wrong, stop and re-diagnose"), a third trial-and-error retune is
not attempted; this doc answers the three questions team-lead's brief posed instead.

## Question 1: mechanism, why does lowering the shoulder chroma raise measured L* at a neighbouring stop?

**Verdict: bug in the retune's chosen technique, not a new defect, the same coupling `#668` already
names, reopened by a steeper damping curve.**

The plan's own mechanism (E) text already names this exact coupling, for a different symptom (on-color
contrast): "the accent's own L* shift (Helmholtz-Kohlrausch: CIELAB L* rises when chroma falls at fixed
OKHSL `l`, `#668`)". The OKHSL/peak construction sets `s` (saturation) and `l` (lightness) independently
per stop; `chromaEnvelope`'s damping only ever intends to change rendered *chroma* (a function of both
`s` and `l` after conversion to RGB/CAM16). But because CIELAB L* is a measured, converted quantity, not
the OKHSL `l` the code sets directly, a big-enough chroma change at a fixed `l` measurably moves CIELAB
L* (Helmholtz-Kohlrausch), and how "big enough" it is depends on how *unevenly* damping falls across
two neighbouring stops, which is exactly what a lower `dampCurve` does: it concentrates the damping
curve's slope closer to the anchor (`uG = |sd|^dampCurve` rises far faster for small `|sd|` at a lower
exponent), so two adjacent stops that used to receive nearly the same damping now receive noticeably
different amounts.

Two named witnesses, same mechanism, different corpus cells (`.sdlc/questions/pif-u3.md` pass-6
addendum):
- `damp:92, dampCurve:0.5`: BZZR "Primary" (`docs/reference/colors/categories/brands.json:814`: hue 267,
  chroma 98, skew −20, lift 0; earlier named as default-kit Neutral, copied from Q7's error, corrected
  at U3 review 2 F4; the mechanism conclusion is unaffected), perceptual
  mode, stop 500 → 550: CIELAB L* rises 26.4403 → 26.6493.
- `damp:98, dampCurve:0.65`: peak mode, hue 110, chroma 100, skew 0, lift 22, stop 450 → 500: CIELAB
  L* rises 97.6484 → 97.7490.

Both fire only in the OKHSL-domain modes (perceptual, peak), never in even mode, which is the
diagnostic signal for Question 2: the even path's `toneAt` sets CIELAB L* **directly**, piecewise,
per stop, chroma damping there cannot move it, because L* is never derived from `(s, l)` in that
path. Three of the five pre-existing median/p90 misses (`even|100`, `even|300`, `even|900`) are even
cells, so they are not exposed to this coupling at all; the other two (`perceptual|300`,
`peak|700`) are, by construction, in the two modes where the coupling lives.

## Question 2: is "median/p90 met AND zero upticks in all three modes" achievable, or in tension?

**Verdict: in tension for a single shared `damp`/`dampCurve` pair (today's construction); not shown
to be in tension for a per-mode, tone-held construction, needs-owner because that construction is
new engine work, not a parameter retune, and is unbuilt.**

Two constructions, evaluated against the evidence above:

- **Even-only `dampCurve` retune.** Since even's L* is set directly, lowering `dampCurve` for the
  even path alone cannot reproduce the H-K coupling that caused both reverted upticks (both witnesses
  are perceptual/peak). This closes `even|100`, `even|300` (currently stuck at exactly 100.0% p90
  regardless of `damp`, per the pass-6 addendum, only a lower `dampCurve` moves that population under
  the cap), and `even|900`, without touching perceptual or peak at all. Recommended for pass 7 as the
  low-risk half of the fix; it needs building and measuring, not just asserting, but nothing in the
  evidence above predicts a C7 risk from it, the mechanism that broke C7 twice has no path to fire in
  a path that never reads `(s, l)` to get L*.
- **Tone-held damping in the OKHSL modes**, for `perceptual|300` and `peak|700`, the two misses that
  DO sit in the coupled modes. Pass 4/5 already built and shipped the precedent technique for a
  different problem (the peak cusp cap, `f21f589`/`54798a6`): a joint `(s, l)` solve that holds CIE L*
  fixed while capping chroma, so the cap cannot itself move measured lightness. The same technique
  applied to the damping curve, solve `l` per stop so that CIELAB L* is pinned to its pre-damping
  value as `dampCurve` reduces `s`, would remove the coupling by construction rather than by choosing
  a `dampCurve` value that happens not to trigger it (which is what both reverted attempts did, and
  why both failed differently: nothing about the parameter choice addresses the coupling itself). This
  is genuinely unbuilt and unmeasured; it is real new construction work, not a rescope, and not a third
  attempt at the same technique the "second workaround" rule blocks, since a joint-solve pin is a
  different mechanism from a parameter retune.

No evidence available in this pass shows either construction fails; equally, neither is measured on
the real corpus, so this is a recommendation to build and gate, not a closed result. The owner rules
on whether to fund the tone-held half (new construction) or accept `perceptual|300`/`peak|700` as
open per the "hold the bar" ruling's own precedent (revision 14) applied a second time, narrower , 
scoped now to exactly the two coupled-mode misses, not the whole table.

## Question 3: blast radius per viable construction

**Verdict: measurable and low for the even-only retune once built; unmeasured (and inherently
unmeasurable pre-build) for the tone-held construction, since it does not exist yet.**

- **Even-only retune.** Touches only `paletteStops`' even path; `okhslStops`/`okhslStopsAnchored`
  (perceptual, peak) are untouched by construction, so U4's blast-radius table gains movement only in
  even-mode rows: the "default kit ramps" row's even figure (currently a U2-era proxy, max `|dL*|` 5.9
  to 20.5, `.sdlc/plans/preset-intent-fidelity.md` line 244) would need a fresh rendered-path
  measurement once the even `dampCurve` value is chosen, and the corpus `dChroma`/`dL*` rows gain an
  even-only delta. Perceptual and peak rows are unaffected, the whole point of scoping the retune to
  the path immune to the coupling.
- **Tone-held OKHSL construction.** Would move perceptual and peak's shoulders (the two coupled-mode
  misses only, not the whole ramp, by the same logic pass 4/5's cap moved only 8 cells with max
  `|delta|` 0.0091), but the actual magnitude cannot be reported without building it, U3's own
  practice throughout this unit (measure before claiming, per pass 5 step 2's abandoned one-stop
  premise) argues against estimating this number here. U4's report gains a new row once pass 7 builds
  and measures it: "OKHSL tone-held damping, before/after, perceptual|300 and peak|700 only, plus any
  incidental movement outside those two cells."
- Neither construction changes `hpg-tonal-cusp-pull` (#55), the cusp-run exemption (revision 20/21),
  or `hueSpace` (revision 21), all three are independent of the damping shoulder.

## Recommendation for pass 7

Build and gate the even-only `dampCurve` retune first (closes 3 of 5 misses, no coupling risk shown).
Bring `perceptual|300` and `peak|700` to the owner as a named, narrower question: fund the tone-held
joint-solve construction (real new work, unmeasured blast radius) to close them, or accept them open
under a narrowed "hold the bar" ruling. Do not attempt a third plain parameter retune on the shared
`damp`/`dampCurve` pair in either mode, that is the workaround already shown, twice, not to remove
the coupling, only to relocate where it fires.
