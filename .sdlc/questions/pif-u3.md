# Questions: preset-intent-fidelity U3 (chroma envelope)

date: 2026-09-18 (pass 2, answering review `pif-u3-review-1.md`)
asked by: pif-u3-envelope builder (continuation, p2)
refers to: `.sdlc/handoffs/pif-u3.md`, `src/engine/tonal.js` (`chromaEnvelope`), `docs/spec/spec-panda-park-ui-exports.md`

Pass 1's Q1 and Q3 are RESOLVED below and superseded in full: both rested on a corpus gate that
measured ramps the product never renders (raw `palette.chroma` instead of `rampChromaOf`'s resolved
chroma — 3,777 of 3,780 palettes differ). Every figure in this file is re-derived from the rendered
path (`rampChromaOf` + `hueShift`/`hueSameDir`/`cuspPull`, matching `src/ui/model.mjs`'s `projectView`
exactly), independently verified by the reviewer and reproduced again here. Nothing from pass 1 is
carried forward uncredited.

## Q1 — RESOLVED: Design B shipped, decided on the rendered corpus

Pass 1 shipped Design A (`sd` measured against the raw numeric anchor) on the strength of a
10,080-cell synthetic grid negative control and a corpus check that was, unknown to the builder at the
time, vacuous. Re-measured on the rendered path:

| corpus, 3,780 palettes x 3 modes x both stop sets | perceptual upticks | peak upticks | peak dup-hex ramps (25-stop) |
|---|---|---|---|
| pre-U3 base (362cc48, rendered) | 11 (worst +0.5105 L*) | 46 (worst +0.8312 L*) | 0 |
| Design A, shipped pass 1 (rendered) | 0 | 0 | 2 |
| Design B, shipped this pass (rendered) | 0 | 0 | 0 |

Design B (`sd = (liftStop(stop, lift) - liftStop(anchorStop, lift)) / 450`, i.e. position measured
against the anchor's OWN lifted reading rather than the raw numeric anchor) matches Design A's zero
upticks and closes BOTH duplicate-hex ramps A still shipped (nature "Varanger / Finnmark tundra"
tertiary and nature "English oak woodland" primary, 25-stop peak, stops 150&175, `#FDFDFB` — the
second one named nowhere in pass 1's own gate, which scanned a different ramp than either preset
renders). B also gives `env(anchorStop) = 1` exactly for every lift, not only lift 0, closing the
original Q1 gap outright rather than trading it for a different one.

The cost, measured directly (not assumed): 21 of the same 10,080 synthetic grid cells rise under B,
worst +0.1314 L* (20 near-white, tone 90.9-99.5, plus one near-black at tone 7.55, hue 287 skew -100
lift -40), about a sixth of the +0.83 L* #668 defect this unit repairs, at a skew/lift/hue/vibrancy
combination within the user-settable ranges but unused by any shipped preset or role default (the grid
probe pins chroma at 95 and sweeps skew to +-100). `test/engine/tonal.mjs` "skew-lift-okhsl" (iii c)
now carries these 21 cells as a named, cited exception list, verified both directions exactly like
C6(ii)'s own duplicate-hex list (deleting an entry FAILs naming that cell; an unlisted 22nd cell FAILs
too).

**Decision:** shipped Design B. On the corpus the product actually renders — which is what C6 is
worded against — B clears BOTH ramp-shape gates (0 upticks, 0 duplicates) while A clears only one. The
21-cell synthetic-grid cost is real and disclosed, not hidden inside a magnitude bar or a silently
loosened gate, and it never surfaces in shipped content. I did not find a genuine tie needing an owner
ruling — the rendered-corpus evidence decides it.

## Q2 — MOOT (plan rev7 retired the magnitude bar): kept for the record, not re-derived for R2

Unchanged from pass 1: the numeric median/p90/above-100% targets this question was written against are
no longer pass criteria (rev7). The two diagnosed mechanisms described there (a pre-existing peak-mode
OKHSL/CAM16 cusp mismatch, and Design A's non-exact anchor under lift) are historical background for
U2; Design B closes the second one outright (exact anchor at every lift), so mechanism 2 no longer
applies to the shipped engine. Mechanism 1 (the cusp mismatch) is unchanged by A vs B — both read
position through `liftStop`, and the mismatch lives in `effStop`/`toneAt`, U2's lane. Not re-measured
against R2 since no decision hangs on it; flagging only so a future reader does not mistake the old
numbers for current ones.

## Q3 — RESOLVED: the duplicate-hex "widespread pre-existing defect" was a proxy artefact, not a real finding

Pass 1's second read (after its own first read's `chroma >= 10` filter was corrected) concluded the
duplicate-hex class was a pre-existing, structurally unclosable defect (21 baseline ramps cut to 7 by
this unit's liftStop-keyed fix). That conclusion was built entirely on the same vacuous raw-chroma gate
finding 1 identifies. Measured on the RENDERED path:

| engine | peak-mode ramps with >= 1 duplicate hex, full corpus, rendered (25-stop) |
|---|---|
| pre-U3 baseline (362cc48) | **0** |
| Design A (pass 1 shipped) | 2 |
| Design B (this pass, shipped) | **0** |

The duplicate-hex class does not exist on the rendered corpus before this unit's work at all. Design
A's R1 chromaEnvelope introduced exactly 2 duplicate ramps (Q1's table); Design B's R2 closes them to
zero. `test/engine/tonal.mjs`'s `KNOWN_BASELINE_DUP` exception set is now empty — the infrastructure
(and its own load-bearing negative control) stays in place for a future, real, bounded case, but there
is currently nothing to cite. No plan-level ruling is needed for C6(ii); it is met at true 0/0/0.

## Q4 — Panda/shadcn normative spec literal drift (docs/spec, explicitly out of this unit's lane)

Unchanged by the R1 -> R2 switch: `Neutral` and `Primary` both carry lift 0, and `chromaEnvelope`'s
`sd` is identical under every design tried at lift 0 (`liftStop(stop, 0) === stop` always), so REQ-052
is the sole cause of this literal's move and the value is the same one pass 1 measured.
`docs/spec/spec-panda-park-ui-exports.md` still pins two NORMATIVE literals for
`tokens.colors.neutral["500"]` (EX-1, line 424) and `neutral.scrim` (EX-2, line 434, same value with a
`/30%` suffix): `oklch(0.5443 0.059 267.96)`. The shipped (now Design B) engine's value, re-confirmed
this pass: `oklch(0.5458 0.0462 266.73)`.

The MIRRORED test assertion (`test/engine/exports.mjs`, in-lane) already carries this value and needed
no change this pass. I did NOT edit `docs/spec/spec-panda-park-ui-exports.md` itself, per the
dispatch's explicit instruction that this doc is out of my lane.

Options (unchanged from pass 1):
- A docs-owning seat updates both spec literals (lines 424 and 434) to `oklch(0.5458 0.0462 266.73)`
  in lockstep with this landing, per the doc's own CARVE-OUT history convention (Recommended)
- Hold U3 from landing until the spec doc is updated in the same PR
- Revert REQ-052's basis change to avoid moving the normative literal at all (not recommended —
  REQ-052 is an explicit plan requirement, not incidental)

## Q5 — C6(iii)'s docs/ exception list needs 2 named paths for this unit's own, unavoidable citation fix

Unchanged in shape from pass 1, re-verified against this pass's own base: `git diff --stat 690b0a1 --
docs/` (690b0a1 is this unit's actual plan-tip base; 362cc48 is engine/generator/corpus-identical to it,
verified empty diff over `src/engine scripts/gen-categories.mjs src/ui/categories`) touches exactly 4
docs/ paths: the 2 expected `adia-*` regen files, plus
`docs/reference/reviews/2026-08-20-reactivity/{00-synthesis,04-context-and-messaging}.md` — each a
single-line citation fix. The line number moved AGAIN this pass (`tonal.js:404` -> `:410`, not pass
1's `:395` -> `:404`) because this pass's `chromaEnvelope` comment grew further; `_okL`'s home is
unchanged in kind, only in line number. `node scripts/audit-citations.mjs` reports STALE 0.

Options (unchanged from pass 1):
- Add these 2 paths to C6(iii)'s named-exception list with the one-line reason above (Recommended —
  this is exactly the "named exception" shape C6(iii) already describes, just not yet enumerated)
- Revert the citation fixes and let `audit-citations` fail, escalating the STALE lines to whichever
  unit owns that doc instead (not recommended — the STALE lines exist only because of this unit's own
  comment growth, across two passes now)

## Q6 — NEW this pass: perceptual Neutral dark's contrast floor drops for real, 4.9 -> 4.5 (0.03 headroom over AA)

The review's finding 3 flagged four `hpg-role-contrast` floors lowered under Design A without
disclosure. Re-measured against the TRUE pre-U3 landed floors (bf2aaf6, not Design A's own numbers)
and re-derived floor-for-floor (1-decimal truncated) under Design B: three of the four were never real
— they were the same raw-chroma-proxy-shaped measurement error as Q1/Q3, or simply Design A's own
regression that Design B does not share (peak Neutral dark 4.5->4.7, peak Success light/dark 7.2/11.9,
peak Warning dark 7.5, peak Data 2 light 4.8, peak Secondary/Data 6 dark all move UP from bf2aaf6, not
down). Exactly one floor drops for real under Design B: **perceptual Neutral dark, 4.9 -> 4.5**
(measured 4.98 -> 4.53, 0.03:1 of headroom over the ruled AA 4.5:1 floor).

This is NOT an R1-vs-R2 (Design A vs B) artefact: Neutral carries lift 0, so `chromaEnvelope` reads
identically regardless of which centring design ships (`liftStop(stop, 0) === stop` for every design
tried). The move is REQ-052 itself — the OKHSL path's saturation-basis change, chroma% of gamut to the
key colour's own OKHSL `s` — which the plan's own mechanism (2) text names as a foreseeable risk ("the
accent's own L* shift... which the 16-family ratchet... both catch"). It still clears the ruled AA
floor via #662's on-color contrast policy, which guarantees AA rather than a rising ratchet, so it is
not a gate failure — but the plan's C8 text says "re-pin only upward, or hand any downward move to
#662's policy," and 0.03 of headroom is thin: U1's anchor move and U6's ladder change, both in flight
on this same plan, can each move Neutral's accent lightness further, and either could tip this cell
under AA without touching this unit's own files.

Options:
- Accept the re-pinned floor (4.5, matching the measured 4.53) as within #662's policy scope — it
  guarantees AA, not a specific ratio — and flag U1/U6 to re-measure this one cell after they land,
  since either can move Neutral's accent lightness (Recommended: cheapest, and the mechanism is
  correctly diagnosed and disclosed rather than hidden)
- Hold this unit's Neutral dark floor at 4.9 by having U3 additionally adjust Neutral's on-color
  resolution or REQ-052's basis specifically for low-chroma families (scope creep beyond this unit's
  dispatched file list, and REQ-052 is an explicit plan requirement — not recommended)
- Block landing until U1 and U6 both report their own effect on this one cell, so the true post-plan
  floor is known before any unit re-pins it
