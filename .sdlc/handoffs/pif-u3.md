---
kind: handoff
plan: preset-intent-fidelity
unit: U3
branch: unit/pif-u3-envelope
base: 690b0a1a395cee0bad122443c3441d5f35412030
head: bbf3ff8f923cc38e141fbb84652fcbb59f6497ca
written: 2026-09-19
pass: 6
---

# U3 handoff — anchor-centred chroma envelope, all modes, grade l4 (pass 3, root-cause fix)

Ticket #681, priority P1. Pass 1 shipped a `chromaEnvelope` unifying the even path's and the OKHSL
path's per-stop chroma damping, keyed on `liftStop` (#668's R1c fix), with the OKHSL path's saturation
basis switched to the key colour's own OKHSL `s` (REQ-052) and `VIVID_MIDS.dampAmp` dropped to 0 (Q7).
It received a FIX-FIRST review (`scratchpad/pif-u3-review-1.md` in the review dispatch's scratchpad):
the engine change itself was correct and closed #668's uptick class to 0/0/0 on the rendered corpus,
but the C6 gate measured a proxy (raw `palette.chroma` instead of the resolved chroma the product
renders with), which made most of pass 1's reported figures — the corpus upticks count, the "21 to 7"
duplicate-hex rescope, and by extension the Design A vs B trade-off it was based on — unreliable. C8's
contrast floors also moved down in four places without disclosure.

This pass fixes the gate to measure the rendered path, re-derives every figure from scratch, and
re-decides Design A vs B on the corrected evidence: **Design B ships** (see
`.sdlc/questions/pif-u3.md` Q1). A second verifier pass then found this unit's own gate suite never
asserted C6's PRIMARY envelope-shape table (the Q4-ruled median/p90 numeric targets) — a real gap, not
a nitpick: `.sdlc/questions/pif-u3.md` Q2 misread revision 7 as retiring it, when rev7 retired only the
unrelated #668 magnitude bar. `scripts/report-preset-fidelity.mjs --envelope` is now built and run for
the first time (Q7, new), and it fails the numeric table under both readings of C6's ambiguous prose —
reported honestly with real numbers, not silently made to pass. Q1, Q3 and Q6 are resolved (Q6 by
owner ruling, widened this pass to its true scope per a second verifier finding); Q4 and Q5 are
unchanged from pass 1.

**Pass 3 (this pass): the owner held the C6 bar (no rescope of median/p90/"0 above 100%") and asked for
the named root cause — lift sign x hue-cusp tone — fixed, with a named Adia carve-out.** Fixed the
"even" toneMode path cleanly: `paletteStops` now caps every stop's chroma at the anchor's own emitted
value for generated (`dampAmp` 0) palettes, closing "0 above 100%" from 2,285 violating instances to
exactly the 16 named Adia ones, with zero collateral damage (verified: `npm test` 47/47, `gate:corpus-
contrast` green, no pinned floor drops, no new `skew-lift-okhsl` grid upticks). The identical technique
on the OKHSL path (perceptual/peak — an iterative saturation rescale, since OKHSL saturation isn't
chroma-uniform across lightness) was implemented, measured, and **reverted**: it closed the same gap
there too, but caused two disallowed regressions the brief explicitly named as stop conditions — a
pinned `hpg-role-contrast` floor dropping below its old value, and 18 new `skew-lift-okhsl` synthetic
grid cells rising beyond the cited 21. Per "if a second workaround is needed, stop", perceptual/peak's
"0 above 100%" stays open, written up in Q7 rather than patched further. Separately, and NOT part of
the lift x hue-cusp mechanism: several C6 median/p90 targets (even/900 median+p90, even/100 p90,
even/300 p90, perceptual/300 p90, peak/700 p90) were proven, via a fresh bf2aaf6 baseline re-measurement,
to be PRE-EXISTING — unrelated to lift (a lift=0 subset shows a HIGHER, not lower, even/900 median) and
unmoved by Design A, Design B, or this pass's own fix. These also stay open in Q7. A new C6(iii) gate
(the named Adia carve-out plus a negative control that reds on an unlisted `dampAmp>0` preset) is now
wired into `npm test`, scoped to even mode only pending the OKHSL-path fix. Q7 needs the owner's ruling
on: (a) the OKHSL-path scope, (b) the pre-existing median/p90 gaps.

## Criteria table

| # | Criterion | Command | Observed | Negative control |
|---|---|---|---|---|
| C7-1 | One `chromaEnvelope` definition | `grep -c "export function chromaEnvelope(" src/engine/tonal.js` | `1` | n/a (mechanical) |
| C7-2 | Exactly 3 total appearances | `grep -c "chromaEnvelope(" src/engine/tonal.js` | `3` | n/a (mechanical) |
| C7-3 | Zero stale two-copy dampAmp expressions | `grep -c "1 + ((controls\.dampAmp" src/engine/tonal.js` | `0` | n/a (mechanical) |
| C6-anchor | `env(anchorStop)=1` exactly at EVERY lift (not only lift 0 — R2 closes the Q1 gap), every damp/dampCurve/dampAmp/dampBias combo | `test/engine/tonal.mjs` "chroma-envelope" (C6 env-anchor sub-check), now swept over lift in `[-40,-20,0,20,40]` too | pass | perturbing the return value by +0.01 fails as `1.01 != 1` |
| C6-i | perceptual/peak/even: 0 tone upticks, full corpus, both stop sets, RENDERED path | `test/engine/tonal.mjs` "chroma-envelope" (C6 i) | `upticks.{perceptual,peak,even} = 0`, rendered via `rampChromaOf` + hueShift/hueSameDir/cuspPull, matching `src/ui/model.mjs`'s `projectView` | pointed at the pre-U3 base with the OLD (raw-chroma) method: reports 0/0/0 (vacuous — the gate this negative control exists to catch); pointed at the pre-U3 base with the FIXED (rendered) method: reports 11 perceptual / 46 peak AFFECTED PALETTES on the 25-stop ramp (43 peak on the 19-stop), matching the plan's own #668 figures exactly. The gate's own `upticks` counters sum BOTH stop sets, so they print 22 perceptual / 89 peak, not 11/46 — confirmed non-vacuous either way |
| C6-ii | 0 duplicate hex, full corpus, both stop sets, RENDERED path | same file, (C6 ii) | **0** duplicate-hex ramps in every mode, both stop sets — `KNOWN_BASELINE_DUP` is an empty Set; no exception needed | the pre-U3 base also measures 0 on the rendered path (Q3); pass 1's Design A measured 2 (both named in Q1's table) — Design B's own negative control: patching back to Design A's `sd` formula in a scratch copy reproduces both |
| iii-c | measured CIELAB L* never rises beyond a NAMED exception list, 10,080-cell synthetic grid | `test/engine/tonal.mjs` "skew-lift-okhsl" | 21 of 10,080 rise under Design B (worst +0.1314 L*; 20 near-white, one near-black at tone 7.55); all 21 named and cited in `GRID_R2_EXCEPTIONS`, verified both directions | deleting one cited cell reproduces a FAIL naming it; an unlisted 22nd cell also fails |
| C6-iii | no docs/ literal moves without a named exception | `git diff --stat 690b0a1 -- docs/` | 4 paths: 2 expected `adia-*` regen files, 2 citation-line fixes (this pass moved the SAME two lines again, `:404`->`:410`, not repeated from pass 1's `:395`->`:404`) — Q5 | n/a |
| C6-envelope | Q4-ruled median/p90 chroma-envelope table (reading a is the ruled bar) | `node scripts/report-preset-fidelity.mjs --envelope` | STILL FAILS overall: even mode's "0 above 100%" now closes to exactly 16 (all Adia); perceptual/peak's "0 above 100%" stays open (1793/1521, unfixed this pass, root cause the same but the fix attempted there was reverted — see pass 3 note above and Q7); 5 median/p90 cells fail in all 3 modes, proven PRE-EXISTING via a bf2aaf6 baseline re-measurement (unrelated to lift x hue-cusp). Script remains standalone, not wired into `npm test` | `--damp-amp 55`: above-100% count jumps 16->2920 (reading b) and ~1500-2300->2400-2900 (reading a) — the mechanism discriminates correctly |
| C6-iii-new | "0 above 100%" (reading a), GENERATED palettes (dampAmp 0), even mode, with the named Adia carve-out | `test/engine/tonal.mjs` "chroma-envelope" (C6 iii, new this pass) | pass — 0 non-Adia above-100% instances; Adia's own 16 confirmed still present (the carve-out isn't stale) | a scratch copy of a non-Adia doc with `dampAmp` forced to 70 produces an above-100% instance NOT in `ADIA_CARVEOUT`, caught as unlisted; renaming `ADIA_CARVEOUT` to a wrong string reproduces a real FAIL naming an actual Adia palette |
| C8 | `hpg-role-contrast` floors re-pinned vs the TRUE pre-U3 baseline (bf2aaf6, not pass 1's own numbers), re-measured PRECISELY (not floor-truncated) | `test/engine/semantic.mjs` | Exactly ONE pinned floor moves down, still: perceptual Neutral dark 4.9->4.5 (Q6, owner-ruled). Several unpinned fractional moves exist beyond that (peak Data 2/Danger dark, perceptual Warning/Danger dark from pass 2; even Primary/Tertiary/Info/Secondary/Success/Data 1/2/4-8 dark or light from pass 3's own anchor-cap fix) — none crosses a floor digit, worst move is even/Tertiary/dark -0.0014 (4.5145->4.5130, still floors to 4.5). Full precise before/after for every moved cell is in `.sdlc/questions/pif-u3.md` Q7 pass-3 addendum | restoring Neutral dark to 4.9 in a scratch copy reds at measured 4.5327; reverting pass 3's even-path cap in a scratch copy reproduces the pre-pass-3 values exactly |
| gate:corpus-contrast | 0 of 7,560 cells under 4.5 | `npm run gate:corpus-contrast` | `168 named per cell, 0 carried below 4.5`, worst cell 4.503:1 | n/a |
| contrastLint | 0/0/0 across modes | `contrastLint(brandKit(defaultDocument()))` per mode | `0 0 0` | n/a |
| Q4 | Panda literal | `test/engine/exports.mjs` | unchanged from pass 1 — `oklch(0.5458 0.0462 266.73)`, confirmed design-invariant (Neutral/Primary both lift 0) | n/a |
| Q7 | `VIVID_MIDS.dampAmp` 55 -> 0 | `scripts/gen-categories.mjs` | unchanged from pass 1 | n/a |
| citations | 0 STALE | `node scripts/audit-citations.mjs` | 0 STALE-WRONG-LINE / STALE-MISS, exit 0 (this pass's own comment growth moved `tonal.js:404`->`:410`, fixed) | n/a |
| branding | clean | `node test/repo/branding.mjs` | `branding: clean (446 files scanned)` | n/a |
| full suite | 47/47 green | `npm test` | `✓ all 47 test files passed` | n/a |
| tree | clean after | `git status --short` | empty after commit | n/a |

## C6, the Design A -> Design B re-decision (Q1, full detail)

Rendered-path measurement (`rampChromaOf` + `hueShift`/`hueSameDir`/`cuspPull`, matching
`projectView`), 3,780 palettes x 3 modes x both stop sets, independently reproduced (not trusted from
the review):

| | perceptual upticks | peak upticks | peak dup-hex ramps (25-stop) |
|---|---|---|---|
| pre-U3 base (362cc48) | 11 (worst +0.5105) | 46 (worst +0.8312) | 0 |
| Design A (pass 1 shipped) | 0 | 0 | 2 |
| **Design B (this pass, shipped)** | **0** | **0** | **0** |

Design B's cost, also independently reproduced: 21 of 10,080 synthetic grid cells rise (worst +0.1314
L*; 20 near-white, tone 90.9-99.5, one near-black at tone 7.55, hue 287 skew -100 lift -40), at
skew/lift/hue/vibrancy combinations within the user-settable ranges but unused by any shipped preset or
role default. Full rationale and the rejected third draft are in `src/engine/tonal.js`'s
`chromaEnvelope` comment and `.sdlc/questions/pif-u3.md` Q1.

## Files changed this pass (commit `c5a5be3`, on top of pass 1's `0a8d1c6`/`ed1e6a3`/`ce23ec0`)

- `src/engine/tonal.js` — `chromaEnvelope`'s `sd` re-centred on `liftStop(anchorStop, lift)` (Design B/
  R2); rewrote the function's own rationale comment; deleted the stale comment at the old `:492` that
  described a formula ("chroma% of the gamut... damping multiplier m") no longer present three lines
  below it.
- `test/engine/tonal.mjs` — `damping-curve`'s independent legacy-reproduction formula updated to read
  `liftStop` on both sides of the subtraction (matching R2) and floored at 0 (matching
  `chromaEnvelope`'s own `Math.max(0, ...)`); `skew-lift-okhsl` (iii c) gained the named
  `GRID_R2_EXCEPTIONS` list (21 cells); `chroma-envelope`'s C6-anchor sub-check swept over lift, not
  only lift 0; the C6 (i)/(ii) corpus scan rebuilt on the rendered path (`rampChromaOf` +
  `hueShift`/`hueSameDir`/`cuspPull`, `defaultDocument()`'s own palettes for the 16 role defaults
  instead of the reduced role-table.json shape); `KNOWN_BASELINE_DUP`'s key gained `chroma` and the
  stop-set label (review finding 5) and is now an empty Set (Q3).
- `test/engine/semantic.mjs` — `hpg-role-contrast` `FLOORS` fully re-measured against bf2aaf6 (not pass
  1's own numbers), with the one genuine drop (Neutral perceptual dark) disclosed in-line and in Q6.
- `docs/reference/reviews/2026-08-20-reactivity/{00-synthesis,04-context-and-messaging}.md` — the same
  2 citation lines pass 1 fixed, moved again by this pass's own comment growth (`:404` -> `:410`).

## Files changed, verifier FIX-FIRST response (this round, on top of `9bb813b`/`4f3378b`)

- `scripts/report-preset-fidelity.mjs` (NEW) — `--envelope [--damp-amp N]`, the plan's own named C6
  command, never built before this round. Reports BOTH plausible readings of C6's prose (emitted
  chroma vs the envelope multiplier itself) over the corpus C6 names, all three modes, on the rendered
  path. Standalone; not wired into `npm test` pending Q7's owner ruling.
- `test/engine/semantic.mjs` — `FLOORS`'s header comment corrected: the stale `Q3` cross-reference now
  reads `Q6` (the actual owner-ruling question), and the "peak holds or improves at every family" claim
  is corrected to name the several small non-floor-crossing drops the precise (not floor-truncated)
  re-measurement actually shows.
- `.sdlc/questions/pif-u3.md` — Q7 added (the envelope-table gap, both readings' real numbers, the
  Adia `dampAmp` carve-out question). Q6's re-measure obligation's scope corrected.
- `.sdlc/handoffs/pif-u3.md` — this file, updated in place.

## Files changed, pass 3 (root-cause fix, on top of `b0ef117`/`fa8f072`)

- `src/engine/tonal.js` — `paletteStops` (even toneMode path) gained `anchorChroma` (the anchor's own
  emitted chroma, by the SAME per-stop formula the map uses at stop 500) and caps every stop's chroma
  at it for generated (`dampAmp` 0) palettes. `chromaEnvelope`'s own `liftStop`-keyed position math is
  untouched, as the brief required. `okhslStops` (perceptual/peak) was ALSO given an analogous fix (an
  iterative saturation rescale) this pass, measured, found to cause a pinned contrast-floor drop and 18
  new `skew-lift-okhsl` grid upticks, and reverted byte-for-byte back to its pre-pass-3 form (diffed
  against `fa8f072:src/engine/tonal.js` to confirm) rather than shipped broken.
- `test/engine/tonal.mjs` — `damping-curve` (a)'s independent legacy formula now also caps at the
  anchor's own value (re-derived independently, not by calling the engine's private `evenChroma`);
  `rel-chroma` (b)'s cross-hue harmonization check now skips stops where the anchor cap fires for
  either probe hue (a disclosed, expected divergence, not a silently loosened tolerance); the big
  `intensity-legacy` carve-out comment gained a new "#681 U3 pass 3" entry naming the 7 even-mode
  ramps that moved (Secondary, Data 1/4/5/6/7/8 — all skew 0 lift 0, so this is the hue-cusp half of
  the mechanism standing alone, not lift); a NEW C6(iii) sub-check in the `chroma-envelope` gate asserts
  "0 above 100%" for even mode with the named `ADIA_CARVEOUT` and a negative control (see criteria
  table). Two citation-line fixes for comment growth (`SKILL.md:95`'s `246-264`->`275-293`,
  `tonal.js:410`->`:430` in two review docs).
- `test/engine/fixtures/tonal-legacy.json` — regenerated (`node scripts/gen-tonal-fixture.mjs "<label>"`)
  to capture the 7 newly-moved even-mode ramps; the other 25 of 32 fixture ramps are byte-identical to
  before, confirmed by a structural diff before committing.
- `.sdlc/questions/pif-u3.md` — Q7 gained a pass-3 addendum: the fix, its OKHSL-path revert and why, the
  pre-existing (bf2aaf6-proven) median/p90 gaps, and the precise C8 before/after table.
- `.sdlc/handoffs/pif-u3.md` — this file.

## Regenerated artifacts (committed)

- `test/engine/fixtures/tonal-legacy.json` (CARVE-OUT header updated for R2), `test/engine/fixtures/
  shadcn-baseline.css` (CARVE-OUT header updated for R2 — the header's closing `*/` was dropped by an
  earlier draft of the regen script and restored before committing), `test/ui/fixtures/
  default-doc-ramps.json`.
- `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js` — `npm test`'s own `bundle`/`gen:figma-ui`/
  `gen:mcp-assets` steps. `src/ui/categories/*.js` and `docs/reference/data/adia-*` regenerate
  byte-identical to pass 1 (an engine-only change does not move the stored palette definitions
  `gen-categories.mjs` reads), so they are not part of this pass's diff.

## Out of lane, not touched

Unchanged from pass 1: `src/engine/prime.mjs` / `test/engine/prime.mjs` (U6); `src/ui/model.mjs`
anchors / `src/ui/persist.js` (U1); the ramp's anchor pass-through in `okhslStops`/`toneAt`, and
`effStop`/`toneAt`'s lightness-curve density under lift (U2); `docs/spec/spec-panda-park-ui-exports.md`
(Q4, reported not edited).

## Landing sequencing

Unchanged from pass 1: per the plan text, U3 merges into the plan branch only after U4's
`scripts/report-preset-fidelity.mjs --movement` report exists and the plan owner records 🟢 acceptance
in `.sdlc/questions/preset-intent-fidelity-u3-movement.md` (C6 iv).

## Pass 4: OKHSL ceiling attempted, then reverted (blocked on an owner ruling, C6 status unchanged)

Pass 4's brief asked for the OKHSL-path twin of pass 3's even-path anchor cap, holding CIE L* fixed via
a joint (s, l) solve. Built and measured across three iterations (plain joint solve; `CAP_MARGIN` for
8-bit quantization noise; `refineNearestRgb` for a tone-drift contrast regression), this DID close
reading (a)'s "0 above 100%" count to exactly 16 (Adia-only) in all three modes, and cleared
`role-contrast`, `skew-lift-okhsl`, `shadcn-baseline`, `ac003b`, and `intensity-legacy` (WIP commit
`8cfee15`). A subsequent full `npm test` run then surfaced `engine/tonal.mjs` failing on a 20th gate,
`hpg-tonal-cusp-pull` (#55, pre-existing, unrelated to this plan), whose name has apparently never been
in this file's own REPORT print list — a separate, pre-existing bug that hid its status, not fixed here.

That gate's failure is real, not cosmetic: the OKHSL anchor cap collides with perceptual mode's own
defining behavior. Scanned against the full 16-palette default kit (dampAmp 0, perceptual, cuspPull
absent), pass 3's head (986c032) shows each hue's richest stop naturally spread 350-550 by its own
gamut cusp; the pass-4 OKHSL cap collapses ALL 16 to exactly stop 500, making perceptual mode behave
like "peak" mode for every generated palette. Full table and the ratified-vs-ratified conflict this
exposes (C6's anchor ceiling vs the pre-existing, gated, hue-cusp-following richness `hpg-tonal-
cusp-pull` depends on) are in `.sdlc/questions/pif-u3.md`'s Q7 pass-4 addendum, with 4 options for the
owner.

Per "a second workaround needed means the model is wrong," reverted `src/engine/tonal.js` byte-for-byte
to 986c032 (commit `103920c`) rather than patch further. `npm test` (47/47), `audit-citations` (STALE
0), `branding`, and `gate:corpus-contrast` are all green at this head. **C6's status is therefore
UNCHANGED from pass 3**: even mode's "0 above 100%" is closed (Adia carve-out named, negative-control
gated); perceptual/peak's is still open, now with a documented structural reason rather than an
unexplored gap. Step 2 (median/p90 retune) was not started — it depends on step 1's shape, which is
blocked pending the owner's ruling on Q7.

## Pass 5: peak capped and gated (step 1, done); perceptual's one-stop exemption measured, not built (step 2)

Owner ruling on Q7 pass-4 (via team-lead, 2026-09-19): cap even (shipped) and peak at the anchor's
chroma for generated palettes; perceptual keeps #55's cusp-pull untouched with a named, bounded
one-stop cusp exemption instead; median/p90 applies to all three modes.

**Step 1, peak cap:** restored pass 4's joint (s, l) solve, this time scoped to `toneMode === "peak"`
only (peak is already defined to center richness at 500, so the cap doesn't fight peak's own design the
way it did perceptual's). Peak's "0 above 100%" closes to exactly the 16 named Adia palettes. The C6
(iii) gate now covers even + peak, each with its own Adia carve-out and negative control. C8: 8/96 cells
moved, all peak, max `|delta|` 0.0091, no floor crossed, peak has zero thin cells. Committed at
`8160d33`. Full C8 table and the `skew-lift-okhsl` `CAP_L_EXCEPTIONS` detail are in Q7's pass-5
addendum.

**Step 2, perceptual's one-stop exemption:** measured first, per the brief. Of 2,207 generated
perceptual palettes with at least one above-anchor stop, only 538 (24%) have exactly one; 1,669 (76%)
have 2-5 ADJACENT above-anchor stops clustered around the cusp shoulder. Worst example (Sushi & sashimi
/ primary-muted, lift 40): stops 550-700 all read 136%-189% of the anchor, peaking at stop 650. Capping
every stop but one to the anchor would leave that one stop nearly double its now-flattened neighbours —
a lone spike, not a graceful exemption, exactly the failure mode the brief pre-authorized stopping for.
Per that instruction, step 2 is measured and reported, NOT built; no gate, no cap, no third mechanism.
Full histogram, both examples' per-stop tables, and options for the owner are in Q7's pass-5 addendum.

**Step 3, median/p90 retune: not started.** Held pending the owner's read of step 2's finding, since
retuning damp/dampCurve now risks needing to redo its own C7/C8 sweep once perceptual's shape is
decided.

## Pass 6: perceptual's cusp-run gate shipped (step 1); the retune reverted twice (step 2, blocked)

Owner ruling (f) on Q7 pass-5 (conductor lane-A-routing-6.md, 2026-09-19): perceptual ships exactly as
today (no ramp change), gated instead with a one-contiguous-run, <=189.31% clause; the median/p90
retune goes ahead after.

**Step 1, done, shipped at `f45f9b2`.** `test/engine/tonal.mjs`'s (C6 iii-b) gates a generated
(dampAmp 0) perceptual palette to at most one contiguous above-anchor run, every stop in it at or under
189.31% (the fresh cusp-stop bound, confirmed twice — Q7 pass-5 and pass-6 addenda). Measured against
the CURRENT, unchanged engine: 0 violations (the natural cusp shoulder is always already one contiguous
run; smooth unimodal curves don't produce disjoint humps), confirming ruling (f)'s design matches the
data shape ruling (e)'s one-stop design fought. `src/engine/tonal.js` untouched, byte-identical to
`d5c09c3`. `scripts/report-preset-fidelity.mjs --envelope` now reports each mode under its own ruled
clause with Adia's own instances named separately (both readings a and b, pass 6's second commit).

**Step 2, blocked, reverted twice.** Two damp/dampCurve retune candidates (`92/0.5` and `98/0.65`, both
matching `VIVID_MIDS`/`DEFAULT_CONTROLS`/`DOMAINS` and both closing the FULL `--envelope` median/p90
table with real margin in a fast harness) each produced a genuine, DIFFERENT C6(i) CIELAB-L* uptick
when checked against the real corpus (`test/engine/tonal.mjs`'s own exit code): the default kit's
Neutral palette in perceptual mode (skew -20), then a travel-hued palette in peak mode (lift 22). Lowering
`dampCurve` well below 1.5 is what's needed to close `even|300`'s p90 (stuck at exactly 100%, the even
path's own anchor cap, regardless of `damp`) — the same departure reintroduces the #668-class "damping
travelling to where the lightness is not" mechanism this whole unit otherwise fixed. Per "if a second
workaround is needed, stop," not attempted a third time; reverted byte-for-byte to `f45f9b2` (step 1's
head). `npm test` 47/47, tree clean, citations STALE 0, `gate:corpus-contrast` green at the reverted
head. Full diagnosis, both witnesses, and 3 options for the owner in Q7's pass-6 addendum.
`.sdlc/handoffs/pif-u3-retune.md` is NOT written — step 2 did not land.

## Risks for U2 / U4 (unchanged from pass 1, plus one addition)

- **U2:** the near-white duplicate-hex class this pass closed to 0 and the peak-mode OKHSL/CAM16 cusp
  mismatch (Q2) both live in `effStop`/`toneAt`. If U2 touches that density under lift for the anchored
  branch, re-measure both against the new lightness curve rather than assuming unrelated.
- **U2:** review finding 8 (latent hazard): `chromaEnvelope(stop, anchorStop, lift, controls)` genuinely
  takes `anchorStop` as a parameter and both call sites pass the module constant, so U3 composes behind
  the parameter as specified — but the surrounding code still hardcodes 500 in `tone500`/`maxc500`/
  `intended500` (`paletteStops`) and `lightnessAt(500, t500)` (`okhslStops`). If U2 threads a
  per-palette anchor stop, the seed's saturation will follow it while the seed's lightness stays at 500.
- **U4:** the movement-table report (C6 iv) should measure against the SAME full-corpus, rendered,
  both-stop-set scope this unit's gate now uses.
- **U1 / U6, OBLIGATION (Q6, owner-ruled 2026-09-18, WIDENED per verifier re-review, RE-MEASURED pass
  3):** the owner accepted this unit's C8 re-pin (perceptual Neutral dark, 4.9 -> 4.5, measured 4.5327)
  ON THE CONDITION that the cell is re-measured once U1 and U6 both land. The full set of cells under
  4.55 (headroom under 0.05 over the ruled AA 4.5 floor), sorted thinnest first, AS OF THIS PASS'S HEAD
  (pass 3's own even-path fix moved several of these — see the full precise before/after table in Q7):
  `even|Tertiary|dark` 4.5130 (+0.0130, was 4.5145 before pass 3 — moved DOWN slightly by this pass's
  own fix, still the same pinned floor digit), `even|Primary|dark` 4.5215 (+0.0215, was 4.5104 — moved
  UP by this pass), `even|Neutral|dark` 4.5280 (+0.0280, unchanged by this pass), `perceptual|Neutral|
  dark` 4.5327 (+0.0327, unchanged by this pass — the one cell this unit's Q6 re-pin moved).
  `even|Info|dark` graduated OUT of this band this pass (4.5225 -> 4.6780) and is no longer in the
  obligation set. Whoever integrates the plan (U4 or the Orchestrator) MUST re-run
  `test/engine/semantic.mjs`'s `hpg-role-contrast` after U1 and U6 both land and confirm ALL FOUR cells
  above still clear 4.5 before the plan ships — U1's anchor move and U6's ladder change can each move
  Neutral's AND Primary's/Tertiary's accent lightness. This is not optional cleanup; it is the condition
  the owner's Q6 acceptance rests on, restated for its current true scope.
- **U4 / whoever picks up the OKHSL-path fix:** perceptual/peak's "0 above 100%" clause is still open
  (Q7 pass-3 addendum). The even-path technique (an absolute `Math.min(chroma, anchorChroma)` cap) does
  NOT transfer safely to the OKHSL path — an iterative saturation rescale was tried and caused a pinned
  contrast-floor drop plus new `skew-lift-okhsl` grid upticks (both reproduced, both reverted). A
  DIFFERENT technique is needed there (candidates and the measured failure modes are in Q7); do not
  re-attempt the same saturation-rescale approach without addressing why it perturbs tone.

## Open questions

See `.sdlc/questions/pif-u3.md`: Q1 (RESOLVED — Design B shipped, both tables shown), Q2 (moot, kept
for the record), Q3 (RESOLVED — the "21 baseline duplicates" story was a proxy artefact; true count is
0/0 before/after), Q4 (Panda/shadcn spec literal drift, needs a docs-owning seat, unchanged), Q5 (2
docs/ exception paths, unchanged in shape), Q6 (RESOLVED — owner accepted the C8 re-pin conditioned on
a re-measure after U1 and U6 land, carried as an OBLIGATION in this handoff's Risks section above, now
4 cells after pass 3's re-measurement), Q7 (STILL OPEN, pass-6 addendum added — even AND peak both close
"0 above 100%" to exactly the named Adia carve-out (peak since pass 5), each gated with its own negative
control. Perceptual keeps #55's cusp-pull richness fully untouched, per the owner's ruling (f): a
one-contiguous-cusp-run, <=189.31%-per-stop clause replaces "0 above 100%" for that mode only, gated and
measuring 0 violations against the shipped (unchanged) engine — ruling (f)'s design matches the data
shape (the natural cusp is always one contiguous run) where ruling (e)'s one-stop design did not. The
median/p90 retune (step 2/3) is BLOCKED, not closed: two different damp/dampCurve candidates that both
cleared the full numeric table each produced a genuine, different C6(i) CIELAB-L* uptick against the
real corpus — the #668-class mechanism this unit otherwise fixed, reintroduced by lowering dampCurve far
enough to close even|300's stuck-at-100% p90 ceiling. Both reverted byte-for-byte per the brief's own
stop condition; not attempted a third time. Owner ruling needed on how (or whether) to close the
median/p90 gap without reopening #668 before C6's numeric table can be called fully met; the ramp-shape
and "0 above 100%"/cusp-run clauses are unconditionally shipped and correct as of this head).
