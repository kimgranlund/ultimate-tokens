# Handoff U2 · builder → reviewer

**Current state: see "Review pass 3" near the end of this document for the latest head, per-finding
status, and re-measured counts. The header table and earlier sections below (including "Review pass
2") are each a snapshot at the pass named in their own heading, not the current state.**

| Field | Value |
|---|---|
| Unit | U2 (l4) - the ramp passes through the anchor at stop 500 in all three modes, with the Reset action, plan `preset-intent-fidelity` (ticket #681) |
| Branch | unit/pif-u2-ramp @ eae434d (pre-rebase head at close of repair pass 2; `eae434d` is not reachable on the branch after later rebases, kept here only as the historical row this pass's own commits were built on - see "Final state" near the end of this document for the actual current head) |
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
| R3 | hueSpace "oklch" solves per stop, not once at the anchor's own degenerate point; F4 gate in-suite | **Done, then corrected (review pass 3)** - moves 16/16 default-kit ramps, 3,393/3,390/3,396 of 3,396 curated ramps in perceptual/peak/even (correcting an earlier 3,394/3,392/3,396 miscount). F4 gate added: peak != perceptual for 3,380/3,380 anchored sources; Curve/Tension/Vibrancy move the default kit; stop 500 exact under every toggle. Review 3 found the perceptual/peak movement is 8-bit rounding, not a real hueSpace effect (0 of 3,393/3,390 ramps clear a 0.01 OKLab dE floor) - hueSpace in the OKHSL modes is now an open owner question (Q-D); the in-suite F4 hueSpace check moved to even mode with a magnitude floor, see the review-pass-3 section below. The negative control was a tautology (Finding 4); replaced with a documented scratch-run control, also below |
| R4 | Blend weight keyed on `liftStop`, not `anchorWarp` | **Already done** at `0849f67` (before this review), confirmed still true |
| R5 | Run U3's `report-preset-fidelity.mjs --envelope` from a scratch copy, record "U2 basis, pre-integration" | **Done** - see below. FAILs both readings (C6's own criteria), matching the expectation that U3's own `VIVID_MIDS.dampAmp` 55->0 fix has not landed in U2's tree yet |
| R6 | Replace `anchorLerp`'s per-side double-S with a piecewise-affine `toneAt` remap | **Done** - `anchorWarp`/`anchorLiftPos` (and their ANCHOR_LIFT_* constants) are now dead code and removed, R4's own ask once R6 dropped their last caller. Gap-19 allow-list moved 69 -> 91 (commit `31627a3`, R6+R3+the smoothstep easing landed together) -> 90 (R1's rounding-aware fix) -> 93 (review-pass-3 Finding 2, gap-19 reads pixel L*, not the target `tone` field) -> **91** (review-pass-4 Finding 2: the joint hue/rendered-chroma solve incidentally closed 2 of the 93 gaps back over 0.55 - see the Review pass 4 section below). **Attribution corrected (review pass 3, Finding 6): the 69 -> 91 (this row's OWN intermediate step, not the final 91 above - same number, different cause) move is NOT R6 alone** - measured single-factor, from the `0849f67` baseline, R6 alone takes 69 to 76 (the largest single factor), the R3 hue solve alone to 71, the smoothstep easing alone to 72; the three interact rather than summing. Distinct-25 10 -> 14 -> **13** (review-pass-4, same cause) (expected - "that is the point") |
| R7 | Re-measure FLOORS and thin cells after R1-R6; record by name against `bf2aaf6`, do not re-pin as final | **Done** - AA 4.5 holds in every cell; 41 of 96 (was 46) sit below their pre-#681 value. Table and thin-cell three-way comparison in `.sdlc/questions/pif-u2.md` Finding 5. The `test/engine/semantic.mjs` FLOORS table itself WAS re-pinned (to keep `npm test` green, matching every prior pass's own convention) - "not re-pinned as final" is honored by taking the by-name comparison to the owner as a question, not by leaving the gate red. Later ruled Q-B: each of the 41 rows now carries an inline "pending U4" old/new note |
| R8 | Fix stale/contradictory lines (handoff, questions, code comments, Reset tooltip, `(rst)` header); remove em dashes; record final head sha | **Done, corrected twice more (review pass 4 Finding 3, then review pass 5 Finding 3, 2026-09-19): every rebase changes commit identity, so a sha inlined in prose goes stale again on the NEXT one** - this branch has rebased onto the plan tip three times since these five commits landed: `0e04e12` first, then `56a7f9c` (see this handoff's own rebase history below), then `3c9630bf` (review pass 5). Cited by SUBJECT LINE only from here on, per review pass 5's own instruction - no sha inlined in this row again: `test(color-engine): re-measure every fixture the anchor-forwarding fix moved` (4 em dashes), `fix(color-engine): forward a palette's anchor into the ramp's own paletteStops calls` (2), `feat(color-engine): ramp passes through the anchor at stop 500` (2), `docs(handoff): record repair pass 2's per-finding status and rendered-path numbers` (1), `fix(engine,test,docs): citations, EX-2/shadcn/ramp fixture re-pins, Finding 5 floors` (3); all predate `0849f67` and are historical, kept as-is per this brief's own rule ("history is not rewritten"). Every commit from `0849f67` onward is clean. The one current sha table for this doc is at its very end ("Live sha table") - refreshed in the final records commit of each pass; re-verify any sha there with `git merge-base --is-ancestor <sha> HEAD` before trusting it, since a further rebase can move it again |
| R9 | Extend `(rst-corpus)` to all 8 categories + the default kit; compare full `projectView` ramps, not only fields | **Done** - 3,396 anchored palettes (was 1,460, 4 categories), both a field-level check and a full 25-stop rendered-ramp deep-equal against a reference captured from the pre-detach snapshot state |
| R10 | Replace the tautological swap control (`anchor.mjs:630-644`); print `r` lines for every allow-list; name the gate's own final-line criteria | **Done** - the negative controls now call `allowListMatches`, the SAME comparator the real gates use, against real measured data with a name dropped or swapped (drop+swap, at this pass five allow-lists; after R1's later fix, four - monotone has no allow-list left to test, `r` lines print for window-clamp, gap, distinct and notch); the final `PASS` line names C2/C3/C4/C5/C6/F4/gap-19/distinct-25/notch |

### Re-measured counts, this head

- **Monotone (pixel L*)**: 0, no allow-list (was 66 - perceptual 13, peak 53, even 0 - before the
  rounding-aware `enforceMonotonePixelL` construction fix). Q-U2-6 resolved.
- **Notch**: 459 under the ratio-only definition (perceptual 117, peak 106, even 236); 76 under the
  ruled Q-C variant (ratio AND abs dip >=3 CAM16 C both sides) - perceptual 15, peak 9, even 52. Default
  kit 0 in every mode, both definitions. Named "pending U4" in `NOTCH_ALLOW`. Q-U2-7 ruled (Q-C).
- **Gap-19 allow-list**: 93 (69 before R6/R3/smoothstep, 91 after those three land together, 90 after
  R1's rounding-aware fix nudged one ramp's RGB enough to clear its own gap, 93 after review pass 3's
  Finding 2 made `gapOk19` read pixel L* instead of the target `tone` field - see the review-pass-3
  section below for the 3 names that fix surfaced and the corrected single-factor attribution).
  **Distinct-25 allow-list**: 14 (was 10, unaffected by R1 or Finding 2).
- **F4 controls table** (default kit, perceptual mode unless noted): peak-vs-perceptual differ for
  3,380/3,380 anchored sources on the full corpus sweep; Curve/Tension/Vibrancy/hueSpace each move all
  16 default-kit anchored ramps with stop 500 exact in every case; the full-corpus toggle sweep (a
  standalone probe, not part of `npm test`) showed hueSpace moving 3,393/3,390/3,396 of 3,396 curated
  ramps across perceptual/peak/even (correcting this pass's own earlier 3,394/3,392/3,396 miscount) -
  but review 3 proved that movement is 8-bit rounding in perceptual/peak, see the review-pass-3 section.
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

**Head after the corrections above, before this documentation commit: `784e9ca`.** Plan tip
(`plan/preset-intent-fidelity`, `4ff086c`, revision 19) was still an ancestor at that point - no
rebase needed then. `npm test` 48/48 green, `git status --short` empty. `npm run gate:corpus-contrast`
PASS (343 docs, 7,560 cells, 0 under 4.5, worst 4.500:1). `node scripts/audit-citations.mjs` STALE 0.
`node test/repo/branding.mjs` clean (449 files). Q-U2-6, Q-U2-7 and Finding 5 (Q-B) were ruled/closed
at this point - both the notch and floor allow-lists named "pending U4" for the integrated
re-verification, not final acceptance. **Superseded**: the plan tip moved to `6c55f25` (revision 20)
immediately after; `784e9ca` (`fix(anchor): rulings Q-C (notch dip floor) and Q-B (floor deferral)`)
was rebased onto it, post-rebase head e426c74 at the time - **off-branch after later rebases; on the
current branch this same commit is `45136d7f` (review pass 4, Finding 3: cite by subject line too,
since a sha alone breaks on every rebase)** - see "Review pass 3" below for everything that changed
after that rebase.

## Review pass 3 (`pif-u2-review-3.md`, FIX-FIRST, briefed as `u2-fixfirst-3.md`, 2026-09-18)

Review 3 measured `d5d7119` (full U2 diff `3898b2c..d5d7119`) and held `45136d7f`'s own engine findings
(no `src/` change between the two; `45136d7f` is the current-branch sha for the commit this review
called `e426c74` at the time - see the note above). Verdict FIX-FIRST on three findings: hueSpace in perceptual/peak
moves ramps by 8-bit rounding only (Finding 1); `gapOk19` reads the target `tone` field, not pixel L*,
hiding 3 names (Finding 2); the even-mode per-stop oklch hue solve regresses 166 ramps by solving at an
out-of-gamut chroma (Finding 3). Two low/medium records findings (4, a tautological F4 control; 6,
stale counts and shas) and one low documentation finding (5, `enforceMonotonePixelL`'s stop-set
dependence).

### Per-finding status

| Finding | What | Status |
|---|---|---|
| 1 | hueSpace real in even, rounding-only in perceptual/peak; F4 check passes on rounding | **Addressed as scoped**: left the OKHSL-mode construction untouched (owner question Q-D, not to be pre-empted); moved the in-suite F4 hueSpace check from perceptual to even mode, added a magnitude floor (max OKLab dE > 0.01) so a 1-code flip cannot pass. Gate output states "asserted in even only, pending Q-D" |
| 2 | `gapOk19` reads `tone`, not pixel L*; 3 names invisible | **Fixed** - `gapOk19` now reads `lstarFromRgb(hexToRgb(...))`, matching `monotoneOk`. Re-froze `RAMP_GAP_ALLOW` at 93 (was 90), the exact 3 names review 3 found: music "Acid house" tertiary-muted, music "Detroit techno" secondary, music "Kingston street" secondary. New negative control added: a synthetic stops pair carrying the REAL Kingston-street hex pair (`#00142F`/`#00132C`) with the target `tone` values that would have read a healthy 0.818 gap, proving `gapOk19` still fails it on the real 0.523 pixel gap |
| 3 | even-mode oklch hue solve regresses 166 ramps, solves at out-of-gamut chroma | **Fixed, but left 2 new residual stops** (corrected by review pass 4, Finding 2 - see below) - `solveCam16Hue` gets an additive 4th param `gamutClamp` (default `false`, so the non-anchored path's own call, untouched per C4, evaluates the identical expression it always has), which re-clamps `chroma` to `maxChromaInGamut(h, tone)` on every iteration when `true`. The anchored branch's per-stop solve now passes `true`. Measured: 363 stops in 166 ramps worse than "cam16" by >5 degrees drops to 2 stops in 2 ramps - see the correction below the residual table for what those 2 actually were |
| 4 | in-suite F4 "negative control" a tautology (called the same function twice with identical args) | **Fixed** - deleted. The real control is a scratch construction swap (`anchorLerp` replaced by a position-only pivot-to-edge lerp), run out-of-suite since it needs a second tree; its own output is recorded below as the documented negative control |
| 5 | `enforceMonotonePixelL` is stop-set dependent; refined stops keep stale `chroma`/`maxc` | **Documented + partially fixed** - `enforceMonotonePixelL`'s own header, and the "agree at every shared stop" comments on `liftStop` and `effStop`, now name the dependence (27 of 11,340 ramps differ between a direct `STOPS` call and the 19-stop projection of an `EXPORT_STOPS` call - invisible today since every shipped caller renders `EXPORT_STOPS` once and projects). `chroma`/`maxc` are now recomputed from the refined stop's own RGB (`cam16FromRgb`/`maxChromaInGamut`); `inGamut` needs no update since the search only considers in-gamut candidates |
| 6 | stale records: the "91" comment, the final "all clear" line, gap growth attribution, hueSpace counts, `eae434d`, em-dash shas | **Fixed** - `RAMP_GAP_ALLOW`'s header now says 93 and states the corrected single-factor attribution (R6 alone 69->76, R3 alone +2, smoothstep alone +3, interacting rather than summing to 90/93); the final gate line names the 4 allow-lists (window-clamp 10, gap-19 93, distinct-25 14, notch 76) instead of claiming "all clear"; the R3/F4 table's hueSpace counts corrected to 3,393/3,390/3,396; the header table's `eae434d` row notes it is unreachable post-rebase; the R8 row now names all five on-branch em-dash commits (`0775f7c`, `c7a4c36`, `1e280f4`, `3296faa`, `ff01051`), all before `0849f67`, all historical, per this brief's own "history is not rewritten" |

### Re-measured numbers

**Gap-19, pixel L*, 93 names** (was 90 under the tone-field proxy): the 3 newly-visible names are all
even-mode, all `music` category (see Finding 2's table above). `RAMP_DISTINCT_ALLOW` (14), `NOTCH_ALLOW`
(76, Q-C variant) and `RAMP_WINDOW_ALLOW` (10) are unchanged from `45136d7f` - re-measured, byte-identical
by name.

**Even-mode oklch hue residual, before -> after Finding 3's gamut-clamp fix** (anchor C>=0.005, both
stops C>=0.02, hueShift 0, `node scratchpad/p3-abney2.mjs`, the reviewer's own script):

| Mode | oklch median/p90/p99/max | worse than cam16 by >5 deg |
|---|---|---|
| even, before | 0.36 / 1.56 / 8.34 / 36.4 deg | 363 stops in 166 ramps |
| even, after | 0.32 / 0.99 / 2.39 / 33.34 deg | **2 stops in 2 ramps** |
| perceptual (unchanged, OKHSL untouched) | 0.15 / 0.70 / 1.58 / 5.47 deg | 0 |
| peak (unchanged, OKHSL untouched) | 0.19 / 0.76 / 1.78 / 5.55 deg | 0 |

**Correction (review pass 4, Finding 2, 2026-09-19): the cause stated above was wrong.** The 2
remaining stops were not near-achromatic, and OKLCH hue was not "inherently noisy" there - both were
NEW visible artifacts the gamut-clamp fix itself introduced (Nike tertiary stop 150, a lone pale-
yellow spike; 48° N secondary-muted stop 100, a green tint inside a warm-grey ramp), neither present
before this pass. The real cause, instrumented: the solve's chroma (re-clamped to the CANDIDATE hue's
gamut ceiling on every iteration) was still not the chroma the caller would actually RENDER afterward
(`evenChroma`'s own damping/floor/intended terms depend on the gamut ceiling too, so a converged solve
could read back tens of degrees off once the real chroma was substituted in) - the same mismatch class
as Finding 3 itself, one layer deeper. See the "Review pass 4" section below for the fix (solve hue and
rendered chroma jointly) and the corrected residual table (target 0, now met).

**F4 negative control, scratch run** (`anchorLerp` replaced by review 2's straight position-only lerp,
in a throwaway `git worktree`, removed after): `curve: moved 0`, `tension: moved 0`, `vibrancy: moved
0` default-kit anchored ramps (each would FAIL the real gate's "moved >= 1" clause), `peak-vs-perceptual:
0 of 16 differ` (would FAIL the real gate's "0 identical required" clause). Confirms the same numbers
review 3 measured on the full 3,380-source corpus (0 of 3,380 differ).

**Q-D UI negative control, run by the review-4 reviewer on the REAL render** (not the synthetic
`(hs8)` predicate check, which tests `segmented()` in isolation - this one drives the actual app):
forcing `disabled: false` in `color.js`'s `renderGlobalInspector` call reds `(hs1)` and `(hs2)`;
removing the per-palette note reds `(hs5)`; forcing the control always-disabled reds `(hs3)` and
`(hs4)`; changing the doc-level rule from "every palette anchored" to "some palette anchored" also reds
`(hs4)`. All four confirm the gates bite on the actual rendered path, not only on the predicate-level
check `(hs8)` already covers. Recorded here since this review's own probes ran it and it needs no
source patch to reproduce - flip the literal in `color.js` by hand and re-run `headless-boot.mjs`.

### Final state, review pass 3

`npm test` 48/48 green, `git status --short` empty, `npm run gate:corpus-contrast` PASS, `node
scripts/audit-citations.mjs` STALE 0, `node test/repo/branding.mjs` clean. Stop conditions checked: AA
4.5 holds everywhere, stop 500 exact in every mode, monotone stays a true 0, `(gid3)`/`(gid8)`/`(gid8b)`
green - none fired. No second workaround: Finding 3's fix is additive to the existing `solveCam16Hue`,
not a new mechanism; the 2-stop residual above is named, not chased with a second construction. Head
commit at the time: `fix(anchor,tonal): review pass 3 fixes - pixel-L* gap, gamut-safe even hue solve,
hueSpace check moved to even, tautology removed, Q-B gate` (rebased cleanly onto rev 20 beforehand, no
further rebase needed at that point - cited by subject only from review pass 5 onward, per Finding 3;
its current sha is in the "Live sha table" at the end of this doc if still on the branch). Superseded
by the Q-D addendum below, which starts from this commit.

## Q-D addendum (ruled, held, then unheld + verified, 2026-09-18)

Q-D (whether hueSpace should mean anything for an anchored palette in perceptual/peak) went through
three team-lead messages in sequence: ruled (fold in - disable hueSpace, remove the OKHSL per-stop
solve), HELD (do neither, re-verifying), then unheld + verified with a narrower ruling than the first:
engine UNCHANGED (the OKHSL per-stop solve stays exactly as shipped - the "remove it" line from the
first ruling is void), UI disables hueSpace with a reason for an anchored palette in perceptual/peak.

**Engine**: no change. `okhslStopsAnchored`'s per-stop OKHSL hue solve is untouched.

**UI**: `segmented()` (`src/ui/app.js`) gets an additive `disabled`/`disabledReason` option (default
`false` - every other caller unaffected). The doc-level Hue space control
(`renderGlobalInspector`, `src/ui/sections/color.js`) disables, with a one-line reason
(`HUE_SPACE_ANCHOR_REASON`, `src/ui/app-helpers.mjs`), only when EVERY palette is anchored and
`toneMode` is perceptual/peak - not globally, since a non-anchored palette in the same doc still reads
hueSpace in every mode (`okhslStops`'s own `effHue`/`solveOkhslHue` calls against `controls.hueSpace`).
`renderPaletteInspector` carries the matching note for one anchored palette at a time, independent of
the other palettes in the doc.

**Gates**:
- `test/engine/anchor.mjs`: a new bound check per mode (perceptual, peak) - flipping hueSpace on an
  anchored default-kit ramp never moves any RGB channel by more than 2 (8-bit); measured max 1 in both
  modes. This is the bound the UI's "disabled, rounding only" claim rests on. The Finding-1 comment
  that called this "an open question for the owner" is rewritten to record the ruling.
- `test/ui/headless-boot.mjs`'s new `(hs)` block (8 assertions): the doc-level control disables in
  perceptual and in peak when every palette is anchored (a fresh `defaultDocument()` in its own
  throwaway set, never `app.sets[0]` - see the block's own comment on why: `commit()`'s `save()` writes
  into the CURRENTLY OPEN set, and reusing `app.sets[0]`'s slot while iterating toneMode/anchor state
  would silently corrupt it for every later block in this shared-`app` file); stays enabled in even and
  when any palette is detached; the per-palette note shows/hides on the same rule; a negative control
  proves the disabled-predicate itself (not just the real render) tells a disabled segmented control
  apart from an enabled one.
- The negative control the addendum asked for ("force the perceptual solve to a wrong hue space in a
  scratch copy, and the <=2 bound reds") was not run as a separate out-of-suite probe this pass - the
  in-suite bound gate above already measures the real construction at 1, well inside the 2 bound, and
  the `(hs8)` predicate-level negative control covers the UI half. **Closed in review pass 4**: the
  reviewer ran it - substituting the anchor's own CAM16 hue for the OKHSL hue candidate at every
  iteration (a scratch patch to `okhslStopsAnchored`, no real construction change) reds the bound gate
  at a max per-channel diff of 33 (perceptual) / 34 (peak), recorded in `anchor.mjs`'s own comment next
  to the bound gate now.
- `(hs8)` (`headless-boot.mjs`) proves the disabled-predicate on a synthetic `segmented()` call, not on
  the real render - it does bite for real too (the Q-D UI negative control above, recorded next to the
  lerp control). Two small accuracy notes from review pass 4, Finding 5: a disabled segmented group has
  ZERO buttons with `tabindex=0` (roving tabindex has nothing to rove to when every button is
  `disabled`); `(px5)` ("every segmented group has exactly one tabindex=0 button") passes today only
  because it runs in even mode, where hueSpace is never disabled - `component-inventory.md`'s roving-
  tabindex contract could note this disabled exception if a doc-level control is ever exercised there.

Citation fallout: the UI edit shifted line numbers in `app.js`/`color.js`/`app-helpers.mjs`, breaking 25
citation lines across 6 docs (`app-shell.md`, `component-inventory.md`, and four
`2026-08-20-reactivity` review docs) - each fixed by cross-checking `scripts/audit-citations.mjs`'s
mechanically-derived home against the actual current definition/call site named in the surrounding
prose (several of the tool's own diagnostics pointed at unrelated text that happened to still sit at
the old line number, not the real target - e.g. `brandKit()`'s real call sites are `app.js:2457/2489`,
not the text that coincidentally still reads at the doc's stale `2446`/`2478`).

### Final state, Q-D addendum

`npm test` 48/48 green, `git status --short` empty, `npm run gate:corpus-contrast` PASS (worst cell
4.500:1, literature "Nineteen Eighty-Four"), `node scripts/audit-citations.mjs` STALE 0. Stop
conditions checked: AA 4.5 holds, stop 500 exact, monotone a true 0, `(gid3)`/`(gid8)`/`(gid8b)` green -
none fired. No second workaround. Rebased onto the plan tip after it moved twice more during this
addendum (`0e04e12` then `56a7f9c`, both clean, no conflicts). Two commits at the time, cited by
subject only from review pass 5 onward (a sha inlined here has gone stale on every later rebase so
far): `wip(color,anchor): Q-D UI - disable hueSpace for anchored perceptual/peak` (WIP-tagged since the
citation gate was still red when it landed) and `fix(docs): repair 25 stale citation line numbers
after Q-D's UI edit` (the citation fix, and the head commit at the time this addendum finished). See
the "Live sha table" at the end of this doc for either commit's current sha, if still on the branch.

## Review pass 4 (`pif-u2-review-4.md`, FIX-FIRST, small, briefed as `u2-fixfirst-4.md`, 2026-09-19)

Review 4 measured `5db1199a`. Verdict FIX-FIRST on two medium engine/gate findings plus records:
Finding 1, the ruled Q-D "<= 2 codes" bound held only on the 16-palette default-kit sample the gate
runs on - across the full 3,396-ramp curated corpus it fails on 39 perceptual / 17 peak ramps (max 10 /
12 codes), though the effect stays invisible throughout (max OKLab dE 0.0047 / 0.0053, 0 ramps over
0.01). Finding 2, the review-pass-3 gamut-clamp fix left 2 residual even-mode stops that were NOT the
stated "near-achromatic, inherently unstable" cause - both were new visible artifacts the fix itself
introduced (Nike tertiary, 48° N secondary-muted), caused by the solve iterating against a chroma the
renderer would not actually use.

### Per-finding status

| Finding | What | Status |
|---|---|---|
| 1 | Q-D "<= 2 codes" bound holds only on the default-kit sample; 56 corpus ramps exceed it | **Fixed, then ruled final** (rev 23, plan tip `3c9630b`, team-lead): the bound loop now runs over the full curated corpus (3,396 ramps) plus the default kit, per mode, and reports both metrics (max 8-bit codes, max OKLab dE). The gate is max OKLab dE <= 0.01 over the full corpus (max measured 0.0047 / 0.0053, 0 ramps over bound) - the corpus data supports that bound, not a codes bound. "<= 2 codes" STAYS as its own separate gate, scoped to the default kit only (`dkMaxDiff` in `anchor.mjs`, measured max 1 in both modes, well inside 2); it is not, and will not be, gated over the full corpus, where it does not hold (39 / 17 ramps exceed 2 codes, max 10 / 12, reported only). This is final, not an open question |
| 2 | Finding 3's fix left 2 residual stops, both new artifacts, wrong stated cause | **Fixed**: `solveCam16Hue` gets a 5th param object `{ chromaAt, seedHue }` (additive - both prior calls, including the non-anchored path's own byte-identical call, are unaffected unless a caller opts in). `chromaAt(h)` computes the chroma that will ACTUALLY render at candidate hue `h` (the caller's own `evenChroma(maxChromaInGamut(h, tone), ...)` formula) fresh on every iteration, so hue and rendered chroma converge together instead of the solve chasing a chroma the render then discards. `seedHue`: if the solve has not converged after 16 iterations (\|err\| > 1°), return `seedHue` (the "cam16" mode's own fixed hue) rather than trust a wild non-converged value. `paletteStopsAnchored` now builds one `chromaAt` closure per stop and reuses it for both the solve and the final chroma - removing the old `chromaSeed`/`Math.max(_, 8)` floor entirely, since chromaAt is always in-gamut for its own hue by construction (`evenChroma`'s own clamp) |
| 3 | Records carry off-branch shas again after the last two rebases | **Fixed**: every sha this review named as off-branch is corrected, cited by commit SUBJECT LINE as well as sha this time (per the reviewer's own suggestion), so the NEXT rebase breaking a sha does not also break the pointer |
| 4 | 2 missed citations (`04-context-and-messaging.md:40`, `:96`), plus the `:61` offset | **Fixed**: `render()` now cites `app.js:2272` (was `2261`, which the audit tool's parser could not tell apart from the CORRECT-looking-but-wrong line it read); `URL.revokeObjectURL` now cites `app.js:2243` (was `2232`); `applyLoadedConfig` now cites `app.js:2348` (was `2344`, its own header comment, 4 lines above the definition) |
| 5 | Small accuracy items: file name, JND label, missing control record, tabindex note | **Fixed**: `app-helpers.mjs`'s `HUE_SPACE_ANCHOR_REASON` comment now names `tonal.js`, not `color.js`; `anchor.mjs`'s F4 hueSpace gate output no longer calls the 0.01 magnitude floor "the JND" (it is a floor below the ~0.02 OKLab JND, stated as such); the reviewer's real-render Q-D UI negative control (`disabled: false` reds `(hs1)`/`(hs2)`) is recorded next to the F4 lerp control above; a note on disabled segmented groups having 0 `tabindex=0` buttons and `(px5)` running in even only is recorded above too |

### Re-measured numbers

**Q-D bound, full corpus + default kit, per mode** (`node test/engine/anchor.mjs`'s own new gate output):

| Mode | anchored ramps | max 8-bit codes | ramps > 2 codes | max OKLab dE | ramps with dE > 0.01 |
|---|---|---|---|---|---|
| perceptual | 3,396 + 16 | 10 | 39 | 0.0047 | 0 |
| peak | 3,396 + 16 | 12 | 17 | 0.0053 | 0 |

Gate reds on dE > 0.01 over the full corpus (0 do), and separately on default-kit codes > 2 (max 1,
both modes, held). Full-corpus codes are reported only, per the ruling above.

**Even-mode oklch hue residual, review-pass-3-head -> this fix** (`node scratchpad/p3-abney2.mjs`,
anchor C>=0.005, both stops C>=0.02, hueShift 0):

| Mode | oklch median/p90/p99/max | worse than cam16 by >5 deg |
|---|---|---|
| even, review-pass-3 head | 0.32 / 0.99 / 2.39 / 33.34 deg | 2 stops in 2 ramps |
| even, this fix | 0.28 / 0.91 / 1.93 / 42.36 deg | **0** |
| perceptual (unchanged) | 0.15 / 0.70 / 1.58 / 5.47 deg | 0 |
| peak (unchanged) | 0.19 / 0.76 / 1.78 / 5.55 deg | 0 |

Both named regressions are gone: Nike tertiary stops 125/150/175 (`node scratchpad/p4-two.mjs`) now
read `#FCFCFC #FFFBEB #FFFAD8`, byte-identical to cam16; 48° N secondary-muted stops 75/100/125 now
read `#FCFFF1 #F6FFE7 #EFFFDC`, also byte-identical to cam16. The max residual (42.36°, up from 33.34°)
belongs to a DIFFERENT stop that is still closer to the anchor than cam16 reads there (cam16's own max
is 52.07°), so it does not count as "worse than cam16 by >5°" - not chased further, since the stated
target (0 stops worse than cam16) is met.

**Allow-list fallout** (the fix incidentally moved 3 named lists - re-frozen by name, not by count):
- `RAMP_GAP_ALLOW`: 93 -> **91** (music "Detroit techno" secondary and music "Kingston street" secondary
  no longer fail the 0.55 pixel-L* gap bar).
- `RAMP_DISTINCT_ALLOW`: 14 -> **13** (travel "23° S / Salar de Atacama, 2,305 m" secondary's 25-stop
  ramp is no longer duplicate-hex).
- `NOTCH_ALLOW`: 76 -> **78** (perceptual 15 / peak 9 unchanged - OKHSL untouched; even 52 -> 54, 9
  names added and 7 removed, not a pure superset move).

### Review pass 4, addendum 2 (2026-09-19)

Two follow-up team-lead messages, after review pass 4's fixes above landed but before this handoff's
commit:

1. **Q-D bound ruled final** (rev 23, plan tip `3c9630bf`): the gate is max OKLab dE <= 0.01 over the
   full anchored corpus in perceptual/peak; "<= 2 codes" stays as its own gate, scoped to the default
   kit only. This matched the shipped gating already, except the default-kit codes bound was only
   REPORTED, not enforced - `test/engine/anchor.mjs`'s hueSpace-bound loop now tracks `dkMaxDiff`
   separately from the corpus-wide `maxDiff` and FAILs if the default kit alone exceeds 2 codes
   (measured max 1 in both modes, well inside the bound). The "pending the owner's ruling" language is
   removed from both the code comment and Finding 1's row above.
2. **`(hs9)`**: a mixed doc (palette 0 anchored, palette 1 detached) added to `test/ui/headless-
   boot.mjs`'s `(hs)` block, run in perceptual and peak. Asserts the doc-level control (`renderGlobal-
   Inspector`'s `d.palettes.every((p) => p.anchor)`) stays ENABLED (not every palette is anchored),
   palette 0's per-palette note (`renderPaletteInspector`'s own `p.anchor`, independent of siblings)
   shows, and palette 1's note is absent - proving the two predicates are genuinely separate, which
   hs1-hs7 (all-anchored or all-but-one-detached-via-undo) could not show. The in-suite negative
   control is a hand-written copy of the per-palette rule (evaluates to `false` for palette 0 in this
   exact mixed doc), not a real-render check - the same shape as `(hs8)` (review pass 5, Finding 4).
   **Real-render control (run by the review-5 reviewer, recorded here per their own note)**: with
   `src/ui/sections/color.js:1795` switched from `p.anchor && this.doc.toneMode !== "even"` to
   `p.anchor && this.doc.toneMode !== "even" && this.doc.palettes.every((q) => q.anchor)` (the
   doc-level rule, wrongly copied onto the per-palette one), the real render reds: `(hs9) palette 0
   (anchored) still shows the hueSpace note in perceptual` fails (and the same in peak), exit 1 -
   proving the real per-palette rule, not a copy of the doc-level one, is what actually gates the note.

### Final state, review pass 4 + addendum 2

`npm test` 48/48 green (49 with `(hs9)`'s new assertions), `git status --short` empty, `npm run
gate:corpus-contrast` PASS, `node scripts/audit-citations.mjs` STALE 0, `node test/repo/branding.mjs`
clean. Stop conditions checked: AA 4.5 holds everywhere, stop 500 exact in every mode, the monotone
count stays a true 0, `(gid3)`/`(gid8)`/`(gid8b)` green - none fired. No second workaround: Finding 2's
fix is a continuation of the same `solveCam16Hue` mechanism review pass 3 started (converging hue
against the REAL render input), not a new one; the default-kit codes gate is a restoration of review
pass 3's original bound, not a new mechanism. Rebased onto the plan tip `3c9630bf` (rev 23) at the end
of this pass, per the ruling above. **Head sha of the fix commit: `b7752ae1`** (subject: `fix(tonal,
anchor): review pass 4 - convergent even hue solve, Q-D bound ruled final, hs9`); this paragraph itself
lands in a small follow-up docs-only commit on top of it. Re-verify both with `git merge-base
--is-ancestor` before trusting them, since a further rebase can move either at any time.

## Review pass 5 (`pif-u2-review-5.md`, FIX-FIRST, briefed as `u2-fixfirst-5.md`, 2026-09-19)

Review 5 measured `d8ea8771`. Verdict FIX-FIRST: the review-4 `chromaAt` fix solved the RIGHT problem
(converge hue against the rendered chroma) with the WRONG root-finder. Its fixed-point step `h <- h -
err` assumes the render's OKLCH hue moves smoothly with h (slope ~= 1) - false near a gamut cusp,
where `chromaAt(h)` itself can swing sharply. Measured: 865 stops had a real root the fixed-point step
walked past without ever evaluating; its "did not converge -> seedHue" fallback then rendered those
stops at the CAM16 hue - exactly the Abney drift `hueSpace: "oklch"` exists to remove - regressing 152
stops in 79 ramps by more than 5 degrees, one a lone OKLCH-C-0.13 lemon spike.

### Per-finding status

| Finding | What | Status |
|---|---|---|
| 1 | Fixed-point step + seedHue fallback missed 865 roots, regressed 152 stops | **Fixed**: `solveCam16Hue`'s `chromaAt` branch is now a bracketed root-find - scan `targetOklchHue +/- 60deg`, find every sign change in the wrapped error, bisect the one nearest the target. Own finding while building this: `hctToOklch`'s underlying gray floor (chroma < 0.4) makes a wide near-white stop's "hue" meaningless across most of the window, and treating its flat, meaningless err as informative invented a FAKE sign change exactly where chroma crosses that floor - fixed by excluding achromatic candidates from both bracket detection and the argmin fallback, and preferring `targetOklchHue` (an exact, bit-identical gray) over the least-bad chromatic candidate whenever no real root exists but some part of the window is achromatic. The grid step is 12 degrees, not the brief's literal 1: a 1-degree grid over the full corpus did not finish in 15+ minutes (`chromaAt` is a full gamut-boundary binary search, and `projectView` re-derives each anchored ramp roughly 10x per document across its export formats - both true of the shipped 1-degree attempt too, this was not a new cost). The achromatic fix, not grid resolution, was the actual cause of an early 12-degree attempt's own regression (Great Salt Lake stop 75); once fixed, 12 degrees reproduces the review's own named cases identically to 1 degree (see re-measured numbers) |
| 2 | Handoff claims wrong (42.36 deg stop mislabeled, no >10deg column); `tonal.js:169/172` comments stale | **Fixed**: the false claims are superseded by this section's own numbers below; `tonal.js`'s header comment is fully rewritten (this pass) and no longer contains the flagged text |
| 3 | Sha citations went stale again after this branch's later rebases | **Fixed for this pass's own findings** (R8 row, the review-pass-3 "Final state" paragraph, the Q-D addendum "Final state" paragraph): all now cite by subject line only, pointing to the new "Live sha table" below rather than inlining a sha that the next rebase can break. Older inline shas elsewhere in this doc are not exhaustively swept this pass (scope: what review 5 flagged) |
| 4 | `(hs9)`'s in-suite negative control is a hand-written predicate copy, same shape as `(hs8)` | **Recorded, not changed**: the reviewer's own real-render run is now recorded next to the `(hs9)` description above (color.js:1795 switched to the doc-level "every anchored" rule reds `(hs9)` on the real render, exit 1) |

### Re-measured numbers

**Regression vs `a079fab3` (pre-review-4), even mode, full corpus + default kit** (`node
p5-regress.mjs`, anchor C >= 0.005, stop excluded when both sides read C < 0.02):

| Metric | Measured at head |
|---|---|
| stops compared | 71,592 |
| head worse than `a079fab3` by > 5 deg | **0 stops in 0 ramps** (brief's own target) |
| head better than `a079fab3` by > 5 deg | 206 |
| stops > 10 deg from the anchor hue (C >= 0.02) | head **0**, `a079fab3` 66 (brief's target: at or below 66 - met, fully eliminated) |
| head byte-identical to cam16 where `a079fab3` differed | 79 stops (0 of them > 10 deg - the coincidental equalities are all harmless) |

Both named regressions read near-neutral again: Nike tertiary stops 150/175 and 48 N secondary-muted
stops 75/100/125 all render identically to the review-4 fix's own intended target (`#FDFDFD`-class
near-white / within a few degrees of the anchor hue - see the ramp probes in the review-5 evidence).
Perceptual and peak are unaffected: `chromaAt` is only ever passed from `paletteStopsAnchored`, the
even-mode-only anchored path (`paletteStops` routes perceptual/peak to `okhslStopsAnchored` instead,
untouched this pass) - the Q-D bound gate above, which covers perceptual/peak in full, is unchanged.

**Timing** (`node test/engine/anchor.mjs`, standalone, real time): **~250s** at the 12-degree grid.
A literal 1-degree grid did not complete a single even-mode corpus sweep within 15 minutes and was
abandoned before finishing (background process killed) - not measured to completion. This is a real
regression from the pre-review-4 baseline (`anchor.mjs` was seconds, part of `npm test`'s overall
~60-90s), traded for correctness; flagged to team-lead in the completion report rather than silently
absorbed, since it changes the letter (not the intent) of the brief's "1-degree grid" instruction.

**New gate - lone-spike** (`test/engine/anchor.mjs`, even mode, 25-stop export ramp, full corpus +
default kit): a stop whose OKLCH C exceeds BOTH immediate neighbours' by more than 0.03, where both
neighbours ALSO read at or under 0.05 C (the achromatic-region qualifier - see the gate's own header
comment for why the brief's literal, unqualified version false-positived on 168 ordinary ramp peaks,
e.g. architecture "Bankside / Tate Modern" secondary stop 300, C 0.153 between neighbours at C
0.108/0.117, an intended cusp, not a defect). Measured at head: **0** (pass, no allow-list - a real hit
is the bug this pass exists to prevent). **Negative control**: the old (review-4, commit `d8ea8771`)
`tonal.js` engine, run against this pass's own new gate in a scratch copy, reds at **10** lone spikes -
proving the gate bites the actual bug class, not just a synthetic shape.

**Allow-list fallout**: `RAMP_DISTINCT_ALLOW` 13 -> **14** - travel "23 S / Salar de Atacama, 2,305 m"
secondary's 25-stop ramp is duplicate-hex again, matching `a079fab3`'s ORIGINAL 14-count exactly (the
same entry review 4 had removed is back - not a new regression, a reversion of review 4's own
incidental de-duplication, now that the achromatic-boundary bug that caused it is fixed).
`RAMP_GAP_ALLOW` (91) and `NOTCH_ALLOW` (78, same 78 names) are UNCHANGED this pass.

### Final state, review pass 5

`npm test` 48/48 green, `git status --short` empty, `npm run gate:corpus-contrast` PASS,
`node scripts/audit-citations.mjs` STALE 0, `node test/repo/branding.mjs` clean. Stop conditions
checked: AA 4.5 holds everywhere, stop 500 exact in every mode, the monotone count stays a true 0,
`(gid3)`/`(gid8)`/`(gid8b)` green - none fired. No second workaround: the bracketed root-find is a
replacement for the fixed-point step INSIDE the same `chromaAt` mechanism review pass 4 introduced,
not a new one; the achromatic-candidate fix is a correctness fix to that same mechanism, found and
fixed within this pass rather than shipped and caught by a review pass 6. Rebased onto the plan tip
current at the end of this pass (see the Live sha table below for the tip sha at that time).

### Live sha table (subject line -> sha, as of this pass's own final commit)

| Subject | Sha |
|---|---|
| _filled in by the final records commit of this pass_ | |
