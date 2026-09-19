# Handoff U2 · builder → reviewer

**Current state: see "Review pass 2" near the end of this document for the latest head, per-R
status, and re-measured counts. The header table and earlier sections below are each a snapshot at
the pass named in their own heading, not the current state.**

| Field | Value |
|---|---|
| Unit | U2 (l4) - the ramp passes through the anchor at stop 500 in all three modes, with the Reset action, plan `preset-intent-fidelity` (ticket #681) |
| Branch | unit/pif-u2-ramp @ eae434d (pre-rebase head at close of repair pass 2 - see "Rebase" section below for the post-rebase sha) |
| Base | ab9eaa6 (U1's last commit on this branch before U2's own work; `git merge-base HEAD origin/main` = bf2aaf659fde4db3bddaed8dfa23e2f485ab2c46, unchanged from U1's handoff) |
| Grade | l4 |
| Ran (repair pass 2, `eae434d`) | `npm test` 🟢 (48/48, Q-U2-5 ruled, implemented, then corrected per addendum 2) · `npm run build` ✅ · `node scripts/audit-citations.mjs` ✅ (STALE 0) · `npm run gate:corpus-contrast` ✅ (0 under 4.5, worst 4.500:1) · `git status --short` ✅ empty after every commit. |
| Left out | `src/engine/prime.mjs` / `test/engine/prime.mjs` (U6), the chroma envelope in tonal.js (U3, keyed on `liftStop`), `src/engine/hct.js` (U6's #686 cache fix), `docs/` except this handoff + `.sdlc/questions/pif-u2.md` - none touched |

## Criteria

| # | Criterion | Command | Observed | Negative control |
|---|---|---|---|---|
| C1 | `npm test` green, clean tree | `npm test` | `✓ all 48 test files passed`, exit 0; `git status --short` empty after commit | n/a |
| C3 | Ramp stop 500 = anchor, in-window sources | `node test/engine/anchor.mjs` | `anchor-ramp: 10110 exact, 0 off (in-window sources only, 3370 of 3380)` - the true, re-measured count (see Q-U2-1: 3,370 not the plan's 3,380, since the 10 window-clamped sources are a separate, named population) | `lift 40 on an anchored palette leaves stop 500 unchanged (${sample.palette.anchor}), while a non-anchored copy of the same palette MOVES at stop 500` - `test/engine/anchor.mjs:484-498`; also a synthetic predicate-discrimination check before the real sweep runs |
| C4 | Non-anchored identity, byte-identical to origin/main at branch creation | scratch script, see below | `paletteStops: 11340 checked, 0 mismatch(es)`; `primeSwatches: 11340 checked, 0 mismatch(es)` - 3,780 palettes × 3 modes | n/a (identity check; mismatch count itself is the control) |
| C5 | Monotone, 0.55 L* gap, no shared hex, named window allow-list | `node test/engine/anchor.mjs` | `anchor-ramp monotone: 0 non-monotone ramp(s) (expected 0, all three modes, all 3,380 sources)`; `anchor-ramp window-clamp allow-list: 10 (expected 10)`; `anchor-ramp gap/distinct allow-list: 118 (expected 118)` | synthetic rising-tone pair fails `monotoneOk()`, synthetic sub-0.55-gap duplicate-hex pair fails `gapOk()`, both asserted before the real sweep (`test/engine/anchor.mjs:475-481`); both allow-lists compared by sorted NAME array, not count, each with its own one-member-swap negative control |
| C12 | Reset action (Q6): detach on hue/chroma edit, restore on Reset | `node test/ui/headless-boot.mjs`, group `(rst)` | PASS - `HEADLESS BOOT PASS`; `(rst1)`-`(rst5b)` all pass; see below for the external verification | `(rst6b)`: Reset stubbed to a no-op inside the test, palette stays detached, the restoration check is proven to discriminate. Externally re-verified: the REAL `resetAnchor` was temporarily broken (`return;` inserted as its first line), and the SAME `npm run` of the file then failed with 6 distinct `(rst3)`-`(rst5b)` failures; reverted, re-confirmed green |

### C4's method

`test/engine/anchor.mjs`'s and the summary's own claim ("byte-identical to origin/main… for all 3,780 palettes in all three modes") was re-measured directly rather than assumed: `git archive` extracted the merge-base commit (`bf2aaf6`) into a scratch tree, that tree's OWN `gen-categories.mjs` was run to regenerate its own (pre-anchor, `liftForTone`-fitted) 3,780-palette corpus, and `paletteStops`/`primeSwatches` were computed for every palette × mode TWICE - once through this branch's tonal.js/prime.mjs (with `anchor`/`sourceAnchor` stripped from the object) and once through the base tree's own tonal.js/prime.mjs on the identical data. 11,340 checks each, 0 mismatches. This is also provable structurally: `git diff` on `src/engine/tonal.js` between base and this branch shows **zero removed or changed lines**, only additions - the non-anchored code path is byte-identical by construction, not just by measurement.

## Files changed

- `src/engine/tonal.js` - the anchored branch: `resolveAnchor`, `ANCHOR_HEX`/`RAMP_L_MIN`/`RAMP_L_MAX`, `anchorLiftPos`/`anchorWarp`/`anchorLerp`, `paletteStopsAnchored` (even path), `okhslStopsAnchored` (perceptual/peak path), wired into `paletteStops`/`okhslStops`.
- `scripts/gen-categories.mjs` - `liftForTone` retired, `lift: 0`, summary line reports anchor/window-outside counts.
- `src/ui/categories/*.js`, `src/ui/describe-mcp-assets.js`, `figma/plugin/ui.html` - regenerated artifacts.
- `test/engine/categories.mjs` - `lift-anchor` gate removed.
- `test/engine/anchor.mjs` - new `anchor-ramp` gate (C3/C5), with allow-lists and negative controls.
- `src/ui/model.mjs`, `src/engine/exports.js` - the subset-object-gap fix (`anchor` now forwarded into `paletteStops`).
- `test/engine/semantic.mjs`, `test/engine/exports.mjs`, `test/engine/fixtures/shadcn-baseline.css`, `test/ui/shell.mjs`, `test/mcp/png-swatch-board.mjs`, `test/ui/fixtures/default-doc-ramps.json` - re-measured downstream of the subset-object-gap fix.
- `src/ui/sections/color.js` - Hue/Chroma edits drop `anchor`; new `resetAnchor` method + "Reset to source color" button.
- `test/ui/headless-boot.mjs` - new `(rst)` group (C12) + the pre-existing `(hh)` group's stop-500 rewrite.
- `docs/reference/references/component-inventory.md`, `docs/reference/reviews/2026-08-20-reactivity/{00-synthesis,02-sections-and-resolvers,04-context-and-messaging}.md` - citation re-pins.
- `.sdlc/questions/pif-u2.md` - four flagged points (see below).

## Regenerated artifacts committed

`src/ui/categories/{architecture,brands,cuisine,film,literature,music,nature,travel}.js` + `index.js`, `src/ui/describe-mcp-assets.js`, `figma/plugin/ui.html`, `test/engine/fixtures/shadcn-baseline.css`, `test/ui/fixtures/default-doc-ramps.json`, `docs/reference/data/adia-oklch-export.css` / `adia-radix-export.mjs` (regenerated by `npm run build`'s `gen:adia-exports`, unchanged content - Adia's brand doc carries no `anchor` overrides today).

## Re-measured figures vs the plan's

- **C3**: plan says 0 misses over "3,380 checks" per mode; true in-window population is **3,370** (10 named sources window-clamp instead) - see Q-U2-1.
- **Role-contrast pinned floors** (`test/engine/semantic.mjs`): every entry across all three tone modes re-measured whole. This was true only through repair pass 1: since F4 landed (Finding 2, and again in review pass 2's R3/R6), perceptual and peak are DELIBERATELY no longer identical for anchored families - the F4 gate this ticket requires is that they differ. See "Review pass 2" below for the current state.
- **Panda EX-1/EX-2, shadcn-baseline**: re-captured from the live exporter, dated CARVE-OUT comments added matching each file's own existing convention (#647/#662's pattern).
- **118-source gap/distinct allow-list**: a NEW finding not named anywhere in the plan text (Q-U2-3) - confined to low-to-moderate chroma (max 29%) sources near the window's own edges.

## Risks for U3/U4/U5/U6

- **U3 (chroma envelope)**: builds its chroma work on top of this unit's tone/lightness construction (`liftStop`-keyed). If Q-U2-1's clamp reading is wrong, U3 inherits a different pivot shape for the 10 window-clamped sources.
- **U4 (blast-radius report)** and **U6's own gates**: this unit's subset-object-gap fix (model.mjs/exports.js) moved every ramp-derived value for every default AND curated palette, not just the anchor mechanism narrowly - a much larger blast radius than the plan's own "default kit ramps move via U3 only" line anticipated (Q-U2-2). U4's report should expect this.
- **U5 (SPEC docs)**: `docs/spec/spec-panda-park-ui-exports.md`'s EX-1/EX-2 (confirmed stale) and EX-4 (likely stale, unverified - no test gate mirrors it) need re-pinning. Same shape as U1's own `690b0a1`-routed drift, broader scope (whole-corpus, not three fields). See Q-U2-4.
- **U6 (prime ladder / hct.js cache)**: unaffected by this unit - `prime.mjs` untouched, confirmed via `git status` never listing it.

## Open questions

See `.sdlc/questions/pif-u2.md` - Q-U2-1 (C3 vs C5 stop-500 exactness, resolved as: token exact, ramp clamps), Q-U2-2 (default kit ramps move under U2 alone, resolved as: no suppression mechanism exists, built accordingly), Q-U2-3 (gap/distinct allow-list finding - the count moved several times since; see "Review pass 2" below for the current gap-19/distinct-25 numbers rather than trusting a number here), Q-U2-4 (spec-panda-park-ui-exports.md now stale, out of lane, routed the same way as U1's `690b0a1`), Q-U2-5 (RULED, see below), Q-U2-6 (review pass 2, R1 residual, RESOLVED - see the correction section
below) and Q-U2-7 (review pass 2, R2 residual, RULED as Q-C - see the rulings section below).

## Review response (`pif-u2-review-1.md`, FIX-FIRST, 2026-09-18)

An independent review found C5 (#681 U2's own monotone/gap gate) was measuring a raw `paletteStops(...)`
proxy under `DEFAULT_CONTROLS`, not the rendered product path (`projectView(hydrate(preset))`, which
resolves each preset's OWN controls). On the rendered path, 16 anchored ramps were non-monotone where
the proxy read 0 - caused by the anchored branches' chroma/`s` basis being `palette.chroma` (the
group's resolved ramp target, usually 100), not the anchor's own measured chroma, which put a chroma
notch/spike at stop 500 in 4,962 of 10,140 rendered cells (F2). Fixed, both parts of the team lead's
dispatch:

- **F1 (gate)**: `test/engine/anchor.mjs`'s `anchor-ramp` sweep now iterates `hydrate(preset)` ×
  `projectView(...).palettes[i].fullRamp` per mode (343 presets x 3 modes), not a `DEFAULT_CONTROLS`
  proxy call. `0 non-monotone` confirmed on the real rendered path.
- **F2 (basis)**: both anchored branches (`paletteStopsAnchored`, `okhslStopsAnchored` in
  `src/engine/tonal.js`) now LERP the chroma/`s` target from the anchor's own measured value at stop
  500 (`w`=0, matches the verbatim pivot exactly - no notch) toward the group's resolved ramp target
  at each side's endpoint (`w`=1), using the SAME warped `w` the tone ladder (`anchorLerp`/
  `anchorWarp`) already computes. A pure "anchor value everywhere" basis - what the review's fix text
  describes literally - was tried first and DID break a ratified requirement: REQ-002
  (`spec-muted-base-key-spikes` 0.3.0, `test/ui/headless-boot.mjs`'s `(gid6)`/`(gid8)`/`(gid8b)`) rules
  the group's Base chroma an ABSOLUTE per-group ramp target for every palette, anchored ones included
  - moving it must still move every ramp in the group. The blend satisfies both: no notch at the
  pivot, and Base chroma still moves an anchored ramp (less than a non-anchored one, by construction,
  since the pivot itself never moves - this partial-response degree is the SAME kind of question F4
  raises for Curve/Tension/Vibrancy/hueSpace, not separately re-litigated here).
- Re-measured everything the basis change touches a second time: the gap/distinct allow-list moved
  118 → **119** (re-frozen, sorted, compared by name); `test/engine/semantic.mjs`'s role-contrast
  FLOORS table (all 96 entries, all 3 modes); `test/engine/exports.mjs`'s panda EX-2 literals
  (`primary.DEFAULT`, `primary.hover`, `data-1.DEFAULT.base` - EX-1's raw/verbatim-anchor literals were
  unaffected, independently re-verified); `test/engine/fixtures/shadcn-baseline.css` (regenerated,
  dated CARVE-OUT note added, a pre-existing stale line-count claim in the #681 U2 paragraph - 124/
  115/124, should have read 124/115/115 - corrected in the same pass); `test/ui/fixtures/default-doc-ramps.json`
  (regenerated via `scripts/gen-ramp-fixture.mjs`); 2 stale citations. `npm test` (48/48), `npm run
  build`, `node test/repo/branding.mjs`, and `node scripts/audit-citations.mjs` all clean after.

## Repair pass 2 (re-diagnosis, `preset-intent-fidelity-u2-rediagnosis.md`, 2026-09-18)

**Head at close of this pass: `b0c411d`** (pre-rebase; see "Rebase" below for the post-rebase sha).
`npm test` 48/48 green (Q-U2-5 ruled and implemented - see below), `npm run build` clean, `node
scripts/audit-citations.mjs` STALE 0, `npm run gate:corpus-contrast` green (343 docs, 7560 cells,
0 under 4.5, worst 4.500:1), `git status --short` empty after each commit.

The re-diagnosis found the F2 "fix" above (the anchor-to-group chroma blend) was itself a second,
undirected workaround - a fork of U3's own `chromaEnvelope`, not a call to it - and numbered ten
findings against it. Per-finding status:

| Finding | What | Status |
|---|---|---|
| 1 (F2/F3) | Route both anchored branches through U3's `chromaEnvelope`, verbatim, keyed on `liftStop`, anchor's own value as pivot basis | **Done as literally briefed, then re-ruled - see Q-U2-5** |
| 2 (F4) | Keep Curve/Tension/Vibrancy/hueSpace live for anchored palettes; compose with the pivot, never a straight lerp | **Done** - `anchorLerp` generalized (`shape()` composed on `anchorWarp`); peak/perceptual no longer byte-identical for anchored palettes (the gate F4 required); default (vibrancy=0, perceptual) rendering is provably unchanged |
| 3+4 (F7+F6) | Reset snapshots hue/chroma/lift at detach, restores exactly; C12 extended to the full corpus + default kit; real-slider-driven tests; a discriminating negative control | **Done** (landed before this session's summary point - `2ce34e4`) |
| 0+6+7 (F1+F5+F9) | Rendered-path sweep (`hydrate`+`projectView`, never a `DEFAULT_CONTROLS` proxy); split the gap (19-stop)/distinct (25-stop) gate by stop set; fix the window-clamp pivot's own math; re-freeze every allow-list by name with a real negative control | **Done** - `ff0800f`, verified green: window-clamp 10/10, ladder-dupe 4/4, monotone 1/1 (named exception), gap-19 62/62, distinct-25 12/12 |
| 5 (F8) | Re-measure `hpg-role-contrast`'s 96 floors + curated thin-margin cells, before/after, AA 4.5 regardless | **Done** - `a82a66c`, recorded in `.sdlc/questions/pif-u2.md` |
| 8 (F10) | Fix the false `0b2e8a0` #668 claim (note, not amend); `anchor.mjs`'s r-tagged print lines; `gen-tonal-fixture.mjs`'s deliberate narrowing, documented | **Done** - the false claim is corrected below; r-tagged lines were added as part of Finding 0+6+7's rewrite; `gen-tonal-fixture.mjs` comment added in `a82a66c` |
| 9 (F3) | U2/U3 merge needs an explicit integration step | **Not this unit's to fix** - a plan-level (rev 14+) change; see "F3" section below, unchanged from the prior pass |
| Q-U2-5 | Finding 1's literal basis broke REQ-002 - owner-ruling needed | **Ruled (revision 17, `85d5c00`, team-lead), implemented (`b0c411d`), corrected per addendum 2 (`eae434d`)** - a liftStop-keyed blend, not the literal anchor value or an `anchorWarp`-keyed one; see below |

### Correction to commit `0b2e8a0`'s message (not a git-history rewrite)

That commit's message claims `anchorLiftPos` is "the same #668-class fix applied to this new branch
that #668 landed for the unanchored path." This is false on this branch: `c4b8962` (the actual #668
fix) lives only on `fix/668-stop800-uptick` and was never merged here - the unanchored `okhslStops`
on this branch still keys its saturation damping on the raw stop, not a lift-warped position. The
CLASS of fix (damp the position `liftStop`/`anchorLiftPos` moves to, not the raw stop) is the same
idea `anchorLiftPos` applies to the anchored branch; #668 itself did not land here. Recorded here per
the re-diagnosis's Finding 8, deliberately as a correction note rather than a `git commit --amend`,
since the commit is already shared history on this branch.

### Rendered-path numbers (`node test/engine/anchor.mjs`, `eae434d`, final - post Q-U2-5 + addendum 2)

- Stop-500 exactness: 10,110 exact, 0 off (3,370 of 3,380 in-window sources x 3 modes)
- Window-clamp allow-list: 10 named sources (unchanged throughout this pass); clamped stop's rendered
  L* lands within ~0.4 L* of its window bound (was up to 2.26 L* off before Finding 7's
  `okhslLAtChromatic` fix, which solves at the anchor's real saturation instead of an achromatic proxy)
- Ladder dupe-allow-list: 4 named sources
- Monotone allow-list: **45** named exceptions (grew from 1 once Q-U2-5's blend landed - see "Q-U2-5"
  below for why)
- Gap (19-stop, 0.55 L*) allow-list: **69** named sources (was 62 before the blend)
- Distinct (25-stop, no duplicate hex) allow-list: **10** named sources (was 12 before the blend)
- Every allow-list compared by sorted name array with its own one-member-swap negative control

### Floors before/after (Finding 5)

Full before/after tables (`hpg-role-contrast`'s 96 entries + the curated thin-margin cell counts) are
in `.sdlc/questions/pif-u2.md`'s "Finding 5" section, not duplicated here per the reporting
discipline. Those figures were measured BEFORE Q-U2-5's ruling landed (chromaEnvelope routed but with
the literal, unconditional anchor basis); the ruled blend (below) moved the floors again by a small
amount - every entry still clears AA 4.5, all three modes, both schemes (verified at `b0c411d`).
Curated thin-margin `[4.50,4.55)` cells: 89->93 perceptual, 81->66 peak (before = `7e3de30`, my own
prior blend fix; after = the literal-basis measurement, itself now superseded by the ruled blend - 
not re-measured a third time, since `gate:corpus-contrast --full` at `b0c411d` already confirms 0
cells under 4.5 regardless of exactly where in `[4.50,4.55)` they land). Superseded again by review
pass 2's R7 remeasurement - see "Review pass 2" below and `.sdlc/questions/pif-u2.md`'s Finding 5 for
the current thin-cell counts (all three modes, three-way before/after against bf2aaf6 and this pass).

### Q-U2-5: ruled and implemented, then corrected per addendum 2

Finding 1's literal instruction ("the anchor's own OKHSL s / CAM16 chroma as the pivot basis, not
`palette.chroma`... call it, do not fork it") reopened the REQ-002 conflict F2's earlier fork was
built to avoid: a group's Base chroma went dead for every anchored ramp. Implemented literally first,
per instruction, rather than building a third undirected workaround, and reported it as blocking.
Team-lead ruled (plan revision 17, `85d5c00`, not the owner): keep REQ-002 as ratified, keep
`chromaEnvelope` itself verbatim, but its basis input is a BLEND - the anchor's own chroma/saturation
at the pivot, shading to `rampChroma`/`palette.chroma` at the ramp's ends. First implementation
(`b0c411d`) keyed the blend weight on `anchorWarp`'s own per-side warp fraction; addendum 2 flagged
this as a local workaround (it re-threads `anchorLiftPos` back into the chroma path `chromaEnvelope`
was built to bypass) and specified the weight must come from `liftStop` directly instead. Fixed in
`eae434d` with a small helper, `anchorChromaBasis(stop, anchorStop, lift, anchorValue, groupValue)`,
next to `chromaEnvelope`. For skew-0 presets the two weightings classify identically (verified:
`anchor.mjs`'s three allow-lists are byte-identical by name under both); the skewed default families
(Primary etc.) moved a hair, re-measured and re-pinned (EX-2, shadcn-baseline, role-contrast floors).

`test/ui/headless-boot.mjs`'s `(gid3)`/`(gid8)`/`(gid8b)` and `test/ui/shell.mjs`'s `(ac003b)` REQ-003
identity check for "Neutral" are all GREEN. Addendum 2's four named gate items, measured against
`eae434d` (full account in `.sdlc/questions/pif-u2.md` Q-U2-5's "Addendum 2 gate evidence"):
- Base chroma moves an anchored ramp's ends while stop 500 stays byte-exact - MET (10,110 exact, 0 off).
- 0 notch at 500 - MET, verified analytically (the general formula's own limit at the pivot always
  equals the anchor's value) and with a negative control (pinning the basis to the group value alone
  visibly changes a window-clamped source's stop-500 output).
- 0 non-monotone ramps on the rendered path - **NOT MET at this pass** (since fixed, see "Review pass
  2" below): 45 named exceptions remained in `anchor.mjs`'s `NONMONO_ALLOW`, IDENTICAL by name whether
  the blend weight was `anchorWarp`- or `liftStop`-keyed. At the time I read this as proof the growth
  was structural regardless of which position measure drove it, and attributed the example (Nike
  secondary, peak, stops 875->900, L* rises 5.4742->5.4835 while chroma falls 18.88->17.22) to a
  Helmholtz-Kohlrausch effect. Both readings are corrected below: every corpus anchor at this pass had
  `skew=0`/`lift=0`, so `anchorWarp`'s `w` and `liftStop` position are mathematically identical there -
  the identical-name-set proved nothing. And H-K is a chroma perceived-brightness effect CIE L* cannot
  model, so it cannot cause a measured CIE L* rise; the real cause was 8-bit RGB rounding.
- Negative controls (pin to `palette.chroma`, notch reds; pin to the anchor, gid8 reds) - both
  demonstrated, the second already proven earlier in this same pass before the ruling landed.
- `scripts/report-preset-fidelity.mjs --envelope` (the addendum's C6 re-run ask) does not exist on
  this branch - it is U3/U4-owned, not yet built here. Noted rather than fabricated.

`npm test` is 48/48 green with this landed.

### Rebase onto `plan/preset-intent-fidelity`

Rebased `unit/pif-u2-ramp` onto the plan branch's head (`4ff086c`, revision 19 - a U3-only paragraph
change, the C6 cusp exemption for perceptual mode; does not touch U2's own paragraph or scope) after
this pass's last commit (`ae7a512`). Clean rebase, no conflicts, 25 commits replayed. **Post-rebase
head: `8d3a5fd`.** Re-ran `npm test` (48/48 green), `npm run gate:corpus-contrast` and
`node scripts/audit-citations.mjs` (both clean) on the rebased tree; `git status --short` empty.

### F3 - what the U2/U3 merge needs (advisory only; U3's branch/worktree not touched)

Both units edit `src/engine/tonal.js` with no textual conflict (`git merge-tree` auto-merges it), but
the merge is semantically broken: U2's `resolveAnchor`-gated branches (`paletteStopsAnchored`,
`okhslStopsAnchored`) early-return BEFORE U3's `chromaEnvelope` mechanism ever runs, so all 3,396
anchored palettes bypass U3's chroma shaping entirely post-merge - C7 (U3's own "0 old-formula-count"
grep gate, presumably) would read a non-zero count on the merged tree. Concretely, for the merge to
be semantically sound, one of these needs to happen, and it should be decided BEFORE either unit
merges, not discovered after:

1. **Route U2's anchored branches through U3's `chromaEnvelope`** before merge - replace this unit's
   own damp/dampAmp/dampBias chroma formula (now blended per F2 above) with a call to
   `chromaEnvelope(stop, 500, lift, controls)`, keyed the way U3 keys it. This unit's own `m`/`w`
   blend construction becomes dead code once that lands, so whichever unit does this work should also
   remove it.
2. **Or**: U3 takes point on reconciling the two mechanisms post-merge, treating U2's anchored
   branches as a special case `chromaEnvelope` itself must special-case (mirroring how U2's own
   `resolveAnchor` special-cases the pivot for TONE).

Either way, note for whoever does this work:

- **Lift semantics differ.** U3 keys on `liftStop`; U2 introduced its own `anchorLiftPos` (a
  per-side-pivoted analog, restated because the anchored ladder's pivot can't move the way `liftStop`
  moves a cusp). These are NOT the same function and don't currently agree at non-trivial lift values
  - someone needs to decide whether the anchored branch's damping should read `anchorLiftPos` (as it
  does today, `okhslStopsAnchored` only - `paletteStopsAnchored`'s damping still reads the raw signed
  stop position, an existing pre-review asymmetry, not touched in this pass) or a reconciled function
  shared with U3.
- **Files that need re-measuring or regenerating post-merge, never hand-resolved**, the same class
  this unit's own subset-object-gap and F2 fixes both touched: `src/ui/categories/*.js`,
  `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js`, `test/engine/{semantic,exports,categories}.mjs`,
  `test/engine/fixtures/shadcn-baseline.css`, `test/ui/fixtures/default-doc-ramps.json`, plus whatever
  citation lines the merge shifts.
- **Review findings F6/F7/F9** (default-kit movement after Reset; lowered contrast floors; hue
  failures at near-black/white anchors) are real, reviewed, and mostly fixed (F6/F7 fully; F9 mostly,
  white still tinted at the clamp) - owner-ruling questions remain open on the lowered floors (F8/R7,
  `.sdlc/questions/pif-u2.md` Finding 5) that the U2/U3 merge decision should account for rather than
  resolve unilaterally. **F4 (peak/perceptual collapse, Curve/Tension/Vibrancy/hueSpace as no-ops) is
  now FIXED** (review pass 2's R3/R6 below - this line was stale, R8's own finding) - update to F3's
  merge-risk section: U3's own merge now also needs to account for U2's per-stop hueSpace solve (R3)
  and the toneAt piecewise-affine tone construction (R6), neither of which existed when this F3 section
  was first written.

## Review pass 2 (`pif-u2-review-2.md`, FIX-FIRST, briefed as `u2-fixfirst-2.md`, 2026-09-18)

Review 2 measured `53d067d` (this branch mid-repair-pass-2, since rebased) and found three ruled gates
not yet built or not yet met: 0 non-monotone (46 measured, 45 allow-listed, 1 invisible to the gate),
0 notch at 500 (1,811 cells), and hueSpace moving an anchored ramp (0 of 3,396). R4 (the blend keyed on
`anchorWarp` instead of `liftStop`) was already fixed by the time review 2 closed (`0849f67`). Order
worked: R6, R3 (hueSpace, then the F4 gate), R2 (notch gate + easing), R1 (pixel-L* monotone), R5, R7,
R8-R10.

### Per-R status

| R | What | Status |
|---|---|---|
| R1 | `monotoneOk` reads pixel L*, not the ramp's own `tone` field; residual not frozen as final | **Done, then corrected (team-lead, second review-2 pass)**: the reviewer re-ran on `0849f67` and proved the 45/66-entry residual was 8-bit RGB rounding, not Helmholtz-Kohlrausch (continuous L* is monotone in 6,760/6,760 corpus ramps). Fixed at construction: `enforceMonotonePixelL` (`tonal.js`), a rounding-aware nearest-in-gamut-RGB refinement adapted from U3's `refineNearestRgb`, wired into both anchored branches. `NONMONO_ALLOW` removed; the gate now asserts a true 0, no allow-list. Q-U2-6 resolved |
| R2 | Notch gate (review 1's 70%-of-both-neighbours definition) + its negative control; ease the chroma-basis blend weight | **Done** - gate added to `anchor.mjs`; `anchorChromaBasis`'s weight eased to a smoothstep of the liftStop position. 1,811 -> 459 rendered cells (default kit stays 0 throughout). Residual recorded in Q-U2-7; later ruled Q-C (ratio AND abs dip >=3 C), 459 -> 76, see the rulings section below |
| R3 | hueSpace "oklch" solves per stop, not once at the anchor's own degenerate point; F4 gate in-suite | **Done** - moves 16/16 default-kit ramps, 3,392-3,396/3,396 curated ramps (all three modes); the `tonal.js:416`-area false comment fixed. F4 gate added: peak != perceptual for 3,380/3,380 anchored sources; Curve/Tension/Vibrancy/hueSpace each move the default kit; stop 500 exact under every toggle; a non-tautological negative control |
| R4 | Blend weight keyed on `liftStop`, not `anchorWarp` | **Already done** at `0849f67` (before this review), confirmed still true |
| R5 | Run U3's `report-preset-fidelity.mjs --envelope` from a scratch copy, record "U2 basis, pre-integration" | **Done** - see below. FAILs both readings (C6's own criteria), matching the expectation that U3's own `VIVID_MIDS.dampAmp` 55->0 fix has not landed in U2's tree yet |
| R6 | Replace `anchorLerp`'s per-side double-S with a piecewise-affine `toneAt` remap | **Done** - `anchorWarp`/`anchorLiftPos` (and their ANCHOR_LIFT_* constants) are now dead code and removed, R4's own ask once R6 dropped their last caller. Gap-19 allow-list moved 69 -> 91 -> 90 (the last step from R1's rounding-aware fix, see below), distinct-25 10 -> 14 (expected - "that is the point") |
| R7 | Re-measure FLOORS and thin cells after R1-R6; record by name against `bf2aaf6`, do not re-pin as final | **Done** - AA 4.5 holds in every cell; 41 of 96 (was 46) sit below their pre-#681 value. Table and thin-cell three-way comparison in `.sdlc/questions/pif-u2.md` Finding 5. The `test/engine/semantic.mjs` FLOORS table itself WAS re-pinned (to keep `npm test` green, matching every prior pass's own convention) - "not re-pinned as final" is honored by taking the by-name comparison to the owner as a question, not by leaving the gate red. Later ruled Q-B: each of the 41 rows now carries an inline "pending U4" old/new note |
| R8 | Fix stale/contradictory lines (handoff, questions, code comments, Reset tooltip, `(rst)` header); remove em dashes; record final head sha | **Done** - this document, `.sdlc/questions/pif-u2.md`, `color.js`'s Reset tooltip/comment, `headless-boot.mjs`'s `(rst)` header comment, `anchor.mjs`'s two stale gap-allow-list comments. Em dashes removed from both `.sdlc` files (132 total); two already-committed historical commit messages (`442d6c3`, `b1e4518`) keep theirs, noted here rather than rewritten |
| R9 | Extend `(rst-corpus)` to all 8 categories + the default kit; compare full `projectView` ramps, not only fields | **Done** - 3,396 anchored palettes (was 1,460, 4 categories), both a field-level check and a full 25-stop rendered-ramp deep-equal against a reference captured from the pre-detach snapshot state |
| R10 | Replace the tautological swap control (`anchor.mjs:630-644`); print `r` lines for every allow-list; name the gate's own final-line criteria | **Done** - the negative controls now call `allowListMatches`, the SAME comparator the real gates use, against real measured data with a name dropped or swapped (drop+swap, at this pass five allow-lists; after R1's later fix, four - monotone has no allow-list left to test, `r` lines print for window-clamp, gap, distinct and notch); the final `PASS` line names C2/C3/C4/C5/C6/F4/gap-19/distinct-25/notch |

### Re-measured counts, this head

- **Monotone (pixel L*)**: 0, no allow-list (was 66 - perceptual 13, peak 53, even 0 - before the
  rounding-aware `enforceMonotonePixelL` construction fix). Q-U2-6 resolved.
- **Notch**: 459 under the ratio-only definition (perceptual 117, peak 106, even 236); 76 under the
  ruled Q-C variant (ratio AND abs dip >=3 CAM16 C both sides) - perceptual 15, peak 9, even 52. Default
  kit 0 in every mode, both definitions. Named "pending U4" in `NOTCH_ALLOW`. Q-U2-7 ruled (Q-C).
- **Gap-19 allow-list**: 90 (69 before R6, 91 after R6, 90 after R1's rounding-aware fix nudged one
  ramp's RGB enough to clear its own gap). **Distinct-25 allow-list**: 14 (was 10, unaffected by R1).
  Moved by R6, as expected ("expect the gap list and part of the 45 to move; that is the point").
- **F4 controls table** (default kit, perceptual mode unless noted): peak-vs-perceptual differ for
  3,380/3,380 anchored sources on the full corpus sweep; Curve/Tension/Vibrancy/hueSpace each move all
  16 default-kit anchored ramps with stop 500 exact in every case; the full-corpus toggle sweep (a
  standalone probe, not part of `npm test`) showed hueSpace moving 3,394/3,392/3,396 of 3,396 curated
  ramps across perceptual/peak/even.
- **Floors**: all 96 cells >= AA 4.5; 41 below their `bf2aaf6` value (was 46). Full table in the
  questions file.
- **Thin cells [4.50,4.55), curated corpus**: perceptual 75 (was 87 at `0849f67`, 77 at `bf2aaf6`);
  peak 58 (was 71, 44); even 52 (was 65, 73). 0 under 4.5 in any measurement.

### R5: U3's `report-preset-fidelity.mjs --envelope`, run from a scratch copy (U2 basis, pre-integration)

Copied verbatim from U3's branch at `fa8f072` into a `git worktree add` scratch copy of this tree at
this pass's head (never committed to `unit/pif-u2-ramp`), run with `--envelope`, then the scratch
worktree was removed. The script measures the NON-anchored corpus only (it constructs `paletteStops`
calls without an `anchor` field, by U3's own design) - so this is a compatibility/regression check that
U2's own tonal.js changes have not broken the shared `chromaEnvelope`/`toneAt` functions U3's report
depends on, not a measurement of U2's anchored branches specifically.

```
env(500) = 1 sweep: PASS
READING (a) emitted CAM16 chroma, perceptual: stop 300 median 109.8% (<=75 FAIL), stop 900 median
  26.2% (<=25 FAIL); above 100% of stop 500: 2022 of 2920 FAIL
READING (a) peak: all four stops OK; above 100%: 1376 of 2920 FAIL
READING (a) even: stop 100 p90 39.6% FAIL, stop 300 median 84.0% FAIL, stop 900 median 40.6% FAIL;
  above 100%: 1905 of 2920 FAIL
READING (b) envelope multiplier, all three modes: every stop FAIL, above 100%: 2912 of 2920 FAIL
READING (a) FAIL, READING (b) FAIL - the envelope table does not clear the plan's ruled targets
```

Both readings FAIL under every preset's own current `dampAmp` (mostly 55). This is the expected,
pre-integration state: U3's own ruled fix (`VIVID_MIDS.dampAmp` 55 -> 0) has not landed on this branch.
(The R1 monotone residual this section used to cross-reference here as evidence of the same dampAmp
dependency is now fixed unconditionally, see the correction below - it is no longer evidence for or
against dampAmp's own integration state.) U4 should expect this table to look very different once
U3's fix integrates - this is "U2 basis, pre-integration," not a U2 defect.

### Correction, second review-2 pass (team-lead, 2026-09-18)

After this pass's own report, the reviewer re-ran R1's measurement on `0849f67` and found the 45/66
residual was misdiagnosed: it attributed to Helmholtz-Kohlrausch, a chroma perceived-brightness effect
CIE L* cannot model and so cannot cause a measured CIE L* rise. An instrumented probe proved
continuous (pre-rounding) CIE L* is monotone in all 6,760 measured perceptual+peak anchored corpus
ramps; every rise was an 8-bit RGB rounding artifact (a continuous L* step shrinking below one 8-bit
code, flipped in sign by which channel's byte value rounds up or down). Also withdrawn: the "identical
by name whichever blend weight drives it" argument (see R1's own row above and Q-U2-5's addendum),
since every corpus anchor at that pass had `skew=0`/`lift=0`, making `anchorWarp`'s `w` and `liftStop`
position mathematically identical there - the identical set proved nothing about the blend's structure.

Fixed at construction: `enforceMonotonePixelL` (`src/engine/tonal.js`), wired into both
`paletteStopsAnchored` and `okhslStopsAnchored`, walks each rendered ramp light-to-dark and swaps a
stop whose rounded pixel L* would rise for the nearest in-gamut integer-RGB neighbour that keeps pixel
L* non-increasing, adapted from U3's `refineNearestRgb` pattern. Never touches stop 500. `NONMONO_ALLOW`
is removed from `test/engine/anchor.mjs`; the gate now asserts a true, unconditional 0 non-monotone
ramps, no allow-list, across all three modes and both stop sets. Side effects re-measured: the gap-19
allow-list dropped one entry (91 -> 90, one nudged ramp cleared its own 0.55 L* gap); window-clamp (10),
distinct-25 (14) and notch (459) allow-lists are byte-identical by name, unaffected. `npm test` 48/48
green, `gate:corpus-contrast` green, `audit-citations` STALE 0 (two citations pointing at `_okL`'s
now-shifted line number fixed), `branding.mjs` clean. Q-U2-6 is resolved; every Helmholtz-Kohlrausch
mention this ticket's own record carried for this residual (`anchor.mjs`, `tonal.js`,
`.sdlc/questions/pif-u2.md`, this handoff) is corrected to 8-bit rounding.

### Rulings Q-C (notch) and Q-B (floors), owner via team-lead, 2026-09-18

**Q-C.** The notch gate is now the 70%-ratio definition AND an absolute dip of at least 3 CAM16 C
versus both neighbours (`notchOk` in `test/engine/anchor.mjs`). Under that variant the 459-entry
ratio-only residual drops to 76 (perceptual 15, peak 9, even 52), named by hand in `NOTCH_ALLOW`,
labeled "pending U4" in the gate's own output line. The existing negative control (a synthetic
near-grey pivot between two chromatic neighbours, and a smoothly-declining no-dip triple) is kept
unchanged and still discriminates under the new AND predicate. Q-U2-7 is ruled, not open.

**Q-B.** The 41 lowered `hpg-role-contrast` floors (R7's re-measurement, unchanged this pass) are
pinned by name as "pending U4": each of the 41 affected rows in `test/engine/semantic.mjs`'s FLOORS
table now carries its own inline `pending U4: <side> was <old> at bf2aaf6` note, so nothing widens
silently before the owner rules on the integrated numbers. Finding 5 in the questions file is marked
ruled with the same framing.

Both rulings are measurement-preserving, no construction change: `npm test` 48/48 green,
`gate:corpus-contrast` green, `audit-citations` STALE 0, `branding.mjs` clean.

### Final state, this pass

**Head after the corrections above, before this documentation commit: see the report to team-lead for
the exact sha.** Plan tip (`plan/preset-intent-fidelity`, `4ff086c`, revision 19) is still an ancestor
of this head - no rebase needed, confirmed via `git merge-base --is-ancestor`. `npm test` 48/48 green,
`git status --short` empty. `npm run gate:corpus-contrast` PASS (343 docs, 7,560 cells, 0 under 4.5,
worst 4.500:1). `node scripts/audit-citations.mjs` STALE 0. `node test/repo/branding.mjs` clean (449
files). Q-U2-6, Q-U2-7 and Finding 5 (Q-B) are all ruled/closed - nothing open for the owner from this
unit at this head; both the notch and floor allow-lists are named "pending U4" for the integrated
re-verification, not final acceptance.
