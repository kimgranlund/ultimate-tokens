---
kind: re-diagnosis
plan: preset-intent-fidelity
ticket: "#681"
unit: U2
written: 2026-09-18
inputs: Lane A's review `pif-u2-review-1.md` (diff `ab9eaa6..3cfa605`, verdict FIX-FIRST, ten findings
  F1-F10), `.git-worktrees/pif-u2-ramp/.sdlc/questions/pif-u2.md` (Q-U2-1..4), `.git-worktrees/pif-u2-ramp/.sdlc/handoffs/pif-u2.md`
status: feeds plan revision 14 (Part 2's integration step and blast-radius/wording fixes)
---

# U2 re-diagnosis: the ramp's anchored branch has one root construction bug, not several

## Why this doc exists

U2 is on its second review pass and its reviewer returned ten findings, three of them plan-level. U3
made a proxy-measurement mistake earlier in this plan (revision 12 retracted numbers built on raw
`palette.chroma` instead of the rendered `rampChromaOf` path); U2's own C3/C5/Q3 figures turn out to
be built the same way, on `test/engine/anchor.mjs`'s direct `paletteStops(rawPalette, DEFAULT_CONTROLS)`
calls rather than the product's real entry point, `projectView(hydrate(preset))`. Two units making the
same mistake independently is the standing rule's trigger ("a second workaround means the model of the
problem is wrong, stop and re-diagnose"): the model that needs fixing is not U2's ramp construction
alone, it is *how this plan writes a rendered-path gate*, and this doc treats that as its own finding
before anything else.

## Finding 0 (root, cross-cutting): the proxy-measurement pattern, not U2's bug specifically

**Verdict: bug (test-harness pattern), recommend a standing rule.**

- **Mechanism.** `test/engine/anchor.mjs` (U1's own gate, extended by U2) calls
  `paletteStops(p, { ...DEFAULT_CONTROLS, toneMode, hueSpace }, EXPORT_STOPS)` directly on the raw
  stored palette object. The product never does this: every real render goes through
  `projectView(hydrate(preset))`, which resolves `rampChromaOf` (group chroma, `dampAmp`, `chromaFloor`)
  before calling `paletteStops`. `test/engine/curated-contrast.mjs` already uses the correct entry
  point, this plan already has one gate that gets it right, which is why C8 caught nothing wrong
  while C3/C5 measured a fiction.
- **Evidence.** Review F1: on the rendered path, 16 anchored ramps are non-monotone in perceptual and
  16 in peak (0 in even) where the proxy gate prints 0; the gap/distinct allow-list is 120 real sources
  against the proxy's frozen 118 (16 not in the frozen list, 14 frozen names that pass). U3's
  independent occurrence: revision 11/12 of this plan, retracted.
- **Recommendation.** Before any further rendered-path gate is written in this plan (U2's own repair,
  U3, U6, U4's report), it must build its sweep from `projectView(hydrate(preset)).palettes[i].fullRamp`
  (or the equivalent for the structure under test), never from a raw palette object plus
  `DEFAULT_CONTROLS`. This is not a one-unit fix: name it once, in the criteria preamble (revision 14
  covers this, see Part 2), so a third unit does not repeat it. Every number in U2's Q1-Q3 and this
  plan's own C3/C5/C11 text sourced from U2 must be treated as unverified until re-measured on the
  rendered path, do not build on them.

## Finding 1 (F2 in the review): wrong saturation/chroma basis on the anchored branches

**Verdict: bug.**

- **Mechanism.** `tonal.js:590` (`okhslStopsAnchored`) and `tonal.js:393` (`paletteStopsAnchored`) both
  scale from `palette.chroma`, the GROUP's resolved ramp chroma (typically 100), not from the
  anchor's own rendered chroma. Stop 500 renders the anchor verbatim at ITS OWN saturation/chroma;
  stops 475/525 render at `ramp chroma × damping`, which at `dampAmp 55` clamps near saturation 1. The
  anchor stop is a chroma NOTCH relative to its neighbours in 4,962 of 10,140 rendered cells (e.g.
  architecture "Barbican" primary even mode: C 81/33/70 at 450/500/550).
- **Evidence.** This single mismatch is the mechanism behind Finding 0's non-monotone ramps (a chroma
  notch at the pivot inverts lightness under skew, e.g. nature "Camargue" secondary-muted at skew −20:
  stop 450 `#D600F8` L* 53.03 s 1.00, stop 500 (the anchor) L* 54.53 s 0.149, the ramp gets LIGHTER
  going darker), a large share of Finding 3's default-kit movement (Warning's tints darken because the
  hand-tuned lift now runs through a different construction around a chroma-notched pivot), and half of
  Finding 5's (F9) hue failures on near-black/near-white clamped sources (an achromatic source keeping
  `s` near 0 removes most of the wrong-hue renders).
- **This is also Finding 4 (F3), read from the other side.** U3's `chromaEnvelope` already solves
  "damping normalised to 1 at the pivot" for the non-anchored path. The plan's own U3 mechanism-E text
  says "saturation at 500 = the anchor's own OKHSL `s`", U2 built the anchored branch before that
  function existed and used the nearest available quantity (`palette.chroma`) instead. Wiring the
  anchored branches through `chromaEnvelope(stop, 500, lift, controls)`, keyed on `liftStop` (the same
  discipline U3 uses), fixes F2 AND resolves F3's "3,396 anchored palettes never reach chromaEnvelope,
  so ruling 2 never reaches a preset or the default kit" gap in one change, because it is one change:
  route the anchor's own chroma/saturation through the shared envelope instead of `palette.chroma`.
- **Recommendation.** Fix first, before re-measuring anything else in this unit, Findings 0's rebuild,
  3's true inherent-vs-defect split, and 5's (F9) hue count all change once this lands, so measuring
  them first would be wasted work. This is the single highest-leverage fix in the whole list.

## Finding 2 (F4 in the review): a tone mode and four global controls went dead for anchored palettes

**Verdict: needs-owner, but the CURRENT state is already a bug against the plan's own written text.**

- **Mechanism.** The plan's U2 line specifies the even path as `toneAt` piecewise through
  `(500, anchor L*)`, i.e. keep `toneAt`'s curve/tension shape on each side of the pivot. The shipped
  code (`tonal.js:401`, `:578`) instead does a straight lerp to `lmin`/`lmax`, which is why Curve and
  Tension have no effect in any mode, Vibrancy has none in perceptual, hueSpace has none anywhere, and
  peak/perceptual render byte-identical for all 3,396 anchored palettes (the Peak option does nothing
  for any preset or the default kit). Against the plan text as written, this is a bug: the plan did not
  ask for a straight lerp.
- **Why it still needs an owner ruling.** "Ramp passes through the anchor, skew/lift warp each side"
  may or may not compose cleanly with a full `toneAt` curve/tension/vibrancy pass, the U2 builder's
  choice (a straight lerp) may have been the only tractable construction, in which case the plan's own
  mechanism text is the part that was wrong, not the code. The owner needs to choose:
  (a) keep `toneAt`'s curve/tension/vibrancy/hueSpace composed with the anchor pivot (repair the code
  to match the plan), or
  (b) rule that anchored palettes intentionally ignore those controls, and have the inspector hide
  them for an anchored palette rather than render dead sliders (repair the plan to match the code, plus
  a small UI fix).
  There is no question record for this today (the review's own finding: "It appears only in a
  `semantic.mjs` comment and one handoff line").
- **Recommendation.** Raise as an owner question in `.sdlc/questions/pif-u2.md` (or this plan's Q-slot)
  before the next builder pass, since the answer changes how much of U2's even/perceptual construction
  needs rebuilding.

## Finding 3 (F7 in the review): Reset does not restore the default kit and drifts hue on the corpus

**Verdict: bug.**

- **Mechanism.** `resetAnchor` (`color.js:1944-1956`) does not restore the pre-detach state, it
  RE-DERIVES a new one, calling `seedFromKeyColor(hexToOklch(sourceAnchor))` to re-seed `hue`/`chroma`
  and setting `lift = 0` unconditionally. Q6's ruling ("a Reset action that re-attaches") describes
  restoring the original palette, not minting a fresh one from the anchor. Re-seeding is a lossy
  one-way function: the default kit's Warning/Success/Danger keep neither their original chroma nor
  their original lift after detach+Reset, and 1,902 of 3,380 corpus palettes get a DIFFERENT `hue` than
  before detach (worst case 90° drift on pure white), because `seedFromKeyColor` derives hue from the
  anchor colour itself rather than reading back whatever `hue` the palette held before the edit.
- **Evidence.** `(rst3b)`'s test passes only because it exercises a single palette (`TP[1]` primary);
  no test in the `(rst)` group exercises Reset over the full corpus or the default kit.
- **Recommendation.** Snapshot `hue`, `chroma`, and `lift` at the moment of detach (alongside
  `sourceAnchor`, which is already stamped) and restore those exact values on Reset, rather than
  re-deriving anything. Extend C12's coverage to the full anchored corpus and the default kit, not one
  sample palette. Fold in Finding 4 below in the same pass, since it touches the same test group.

## Finding 4 (F6 in the review): C12's skew/lift assertions cannot fail

**Verdict: bug (test correctness), folds into Finding 3's repair pass.**

- **Mechanism.** `(rst5)`/`(rst5b)` assign `skew`/`lift` through `app.commit` directly, never through
  the Skew/Lift sliders (which render only in even mode, `color.js:1818-1819`). Proven vacuous: making
  both slider handlers delete `anchor` in a scratch copy still prints `HEADLESS BOOT PASS`. `(rst6b)`
  stubs Reset and then asserts the stub did nothing, a tautology by construction. The REAL control
  (stubbing `resetAnchor` itself and re-running) does bite, so the builder's external verification
  claim is confirmed independently; only the two named in-suite assertions are hollow.
- **Recommendation.** Switch the assertion to even mode, dispatch a real `input` event on the Skew and
  Lift sliders, then `commitDrag()`. Replace `(rst6b)` with a real run of `(rst3)`'s predicate against
  the stub, or keep the external, out-of-suite control as the documented negative control and say so
  in the handoff (checks-that-bite: a documented, reproducible external control is legitimate, but the
  in-suite copy must not claim to be one if it cannot fail).

## Finding 5 (F8 in the review): the default kit moves under U2, and 40 contrast floors dropped silently

**Verdict: split, partially inherent, partially bug; needs-owner only after the bug's share is removed.**

- **What's inherent.** Q2(b) minted the 16 default-kit anchors from today's stop-550 hexes. A ramp
  passing through a NEW pivot point at stop 500 (instead of the old cusp construction) WILL move every
  neighbouring stop to some degree, this is the ruled design working as intended, not a defect. C3/C2
  already require all 16 defaults to carry `anchor` and move accordingly; the plan's blast-radius row
  "default-kit ramps move via U3 only" is simply wrong (Q-U2-2's own reading is mechanically correct:
  there is no suppression mechanism, and none was ever specified) and needs a text fix, not a code fix.
- **What's a defect, not inherent.** Finding 1 (F2)'s wrong saturation basis inflates this movement
  beyond what passing through the anchor requires: Warning's tints darken (stops 100/200/250 read 99,
  91, 84 L* and now read 94, 77, 68 in perceptual) because the hand-tuned `lift −36` now runs through a
  chroma-notched pivot via a different lift function (`anchorLiftPos`, not U3's `liftStop`), two
  compounding causes, not one. The 40 lowered `hpg-role-contrast` floors (none below 4.5, lowest 4.62)
  and the 5-9× growth in thin-margin curated cells (77→400 perceptual, 44→392 peak, both under 4.55)
  are downstream of the SAME two causes and cannot be attributed to "inherent design" until F2 is fixed
  and the movement is re-measured.
- **Recommendation.** Do not ask the owner to ratify these 40 floor drops or this movement magnitude
  yet, fix Finding 1 first, then re-measure. Whatever residual movement and floor drift remains after
  F2 lands is the true inherent cost of Q2(b) + stop-500 pass-through, and THAT is what should go to
  the owner (per #662's policy for a downward contrast move) alongside the corrected blast-radius text.
  Record the current (pre-fix) numbers in `.sdlc/questions/pif-u2.md` now so the before/after delta is
  visible when F2 lands, but label them explicitly as "includes the F2 defect, not yet the inherent
  figure."

## Finding 6 (F5 in the review): the 118-source gap/distinct list's stated root cause is mostly wrong

**Verdict: bug (wrong diagnosis, correct instinct to allow-list).**

- **Mechanism.** U2's Q-U2-3 blamed OKHSL-`l` non-uniformity near the gamut's dark/light corners. The
  review's re-derivation: `RAMP_L_MIN/MAX = [9.95, 95.05]` was derived for the 19-stop DISPLAY ramp's
  0.55 L* gap requirement (5 + 9×0.55), but the gate checks the 25-stop EXPORT ramp, whose half-steps
  are finer (1/18 of a side, needing a window of about [14.9, 90.1] for the same 0.55 gap), a window/
  stop-set mismatch, not an OKHSL-uniformity problem. OKHSL non-uniformity explains at most 56 of the
  118 (the ones inside (15, 90), where Finding 1 also contributes).
  Confirms the reverted alternative (retargeting the ladder to interpolate in true L*) was correctly
  reverted, it tested a cause that wasn't dominant, which is why it made things worse (358 violations).
- **Recommendation.** Either derive the window per the stop set actually being gated, or gate the 0.55
  L* requirement on the 19-stop ramp and distinctness separately on the 25-stop ramp. Re-state the
  allow-list with the corrected cause once re-measured on the rendered path (Finding 0) and after
  Finding 1 lands (which will change some of these 118 names).

## Finding 7 (F9 in the review): the window-clamp reading is right, one part of its justification and its rendered-path execution are not

**Verdict: bug (a correct design reading, an incorrect implementation of the pivot's own math).**

- **Mechanism.** Q-U2-1's reading, token exact (`prime.DEFAULT`), ramp clamps at the window edge for
  the 10 out-of-window sources, matches Q3(b) and C5's own text; that part stands. But the STATED
  justification (verbatim-anchor-at-500 "inverts the ramp") is not what actually distinguishes the two
  options on the gate's own path (both clamped and unclamped fail the gap bar there); the real
  justification is the ruling itself, not the inversion argument. Separately, on the rendered
  (perceptual/peak) path, `pivotL = okhslLAt(RAMP_L_MIN)` computes the achromatic (`s=0`) grey's `l` at
  the window bound, but the clamped stop renders near `s=1`, so 9 of the 10 clamped sources land at
  7.69-9.77 L*, not the intended 9.95, and near-black/near-white neutrals render hue-shifted (violet,
  navy, brown) at the clamp instead of staying achromatic. Finding 1's fix (anchor's own saturation,
  not a flat 1) removes most of this, since an achromatic source would then keep `s` near 0 through the
  clamp too.
- **Recommendation.** Re-derive the pivot's `l` (or `s`) so the clamped stop's rendered lightness
  actually lands at the window bound once Finding 1 lands; re-word C5/C3's justification to cite the
  ruling rather than the (non-discriminating) inversion argument; re-measure the hue-shift count after
  Finding 1.

## Finding 8 (F10 in the review): records/output: low severity, no owner ruling needed

**Verdict: bug (minor), repair alongside the others.**

- Commit `0b2e8a0`'s claim that #668's fix landed for the unanchored path is false on this branch
  (`c4b8962` lives only on `fix/668-stop800-uptick`); the unanchored `okhslStops` still keys damping on
  the raw stop. `test/engine/anchor.mjs`'s printed line omits the C5-specified `r`-tagged name lines.
  `scripts/gen-tonal-fixture.mjs` narrows the palette without `anchor`, which needs a one-line
  statement that this is deliberate (the legacy fixture predates the anchor field by design), not an
  oversight, wherever U3 documents its own fixture regeneration.

## Finding 9 (F3 in the review, the structural half): U2/U3/U6 cannot merge as built

**Verdict: needs-owner (process gap), the plan has no integration step.**

- **Mechanism.** `git merge-tree unit/pif-u2-ramp unit/pif-u3-envelope` auto-merges `tonal.js` and
  `gen-categories.mjs` textually with no conflict marker, but the merged tree is semantically broken:
  C7's greps read 1/3/2 (the required 0 for the old-formula count fails, because U2's construction
  never touches the `chromaEnvelope`/`m`-formula code U3 replaced, see Finding 1); anchored palettes
  (all 3,396) skip `chromaEnvelope` entirely, so U3's Q4-ruled envelope targets never reach a preset or
  the default kit; U2 and U3 use different lift semantics (`anchorLiftPos` vs `liftStop`). Separately,
  U6 branches from `690b0a1` without U1, so `prime.mjs`/`test/engine/prime.mjs` conflict textually
  against U1-carrying branches (U2 included). None of this is a defect in any one unit; it is the
  absence of a plan step that decides merge order and re-verifies the shared surfaces.
- **Recommendation.** Fold an explicit integration step into U4 (this plan's revision 14 is expected to
  direct this): U4 becomes "corpus regeneration, the U1→U2→U3→U6 integration, and the blast-radius report,"
  not blast-radius reporting alone. Sequence: U1 (already the common ancestor for U2), then U2's own
  repair pass above (Findings 1-8) lands first since it fixes the exact seam F3 describes (routing the
  anchored branches through `chromaEnvelope`), then U3 merges on top (now textually AND semantically
  compatible, since U2 no longer owns a competing chroma-basis construction), then U6 is rebased onto
  the result (resolving the prime.mjs/U1 conflict once, at the integration point, not per-unit). After
  each merge: re-run C7's three greps, and re-run every rendered-path gate (C3, C5, C6, C8, C11) on the
  INTEGRATED tree, a unit's own isolated green is not sufficient once its neighbours have merged.

## Recommended next unit shape

**Repair U2 in place; do not split it.** All of Findings 1-8 live inside U2's existing file scope
(`tonal.js`'s anchored branches, `color.js`'s Reset, `test/engine/anchor.mjs`, `test/ui/headless-boot.mjs`'s
`(rst)` group) or are text-only plan corrections (Findings 5's blast-radius row, Finding 9's process
gap). Splitting would only fragment one coherent repair (Finding 1 alone resolves or shrinks Findings 0,
3, 5, 7).

Sequence for U2's next pass:
1. Finding 2 (F4): raise the owner question now, the answer may change how much of steps 2-4 is needed.
2. Finding 1 (F2/F3's chroma-basis fix): route the anchored branches through `chromaEnvelope`, keyed on
   `liftStop`, using the anchor's own OKHSL `s` / CAM16 chroma as the pivot basis. Highest leverage.
3. Findings 3+4 (F7+F6): snapshot-restore Reset, drive the real sliders in the test.
4. Finding 0 (F1) + Finding 6 (F5) + Finding 7 (F9): rebuild the rendered-path sweep, re-derive the
   window per stop set, re-freeze the allow-lists with corrected causes and counts.
5. Finding 5 (F8): re-measure default-kit movement and contrast floors on the now-fixed construction;
   record the true inherent figure in `.sdlc/questions/pif-u2.md` for the owner.
6. Finding 8 (F10): fix the records/output loose ends.
7. Route Q-U2-4 (`docs/spec/spec-panda-park-ui-exports.md` EX-1/EX-2/EX-4 staleness, whole-corpus scope)
   to U5, same shape as U1's `690b0a1` precedent.

Finding 9's integration step (U4's expanded scope) is a separate plan-level change, expected in
revision 14, not part of U2's own repair pass, U2 cannot resolve a seam that only exists once U3 also
exists.
