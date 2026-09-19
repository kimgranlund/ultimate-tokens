# Handoff U2 · builder → reviewer

| Field | Value |
|---|---|
| Unit | U2 (l4) — the ramp passes through the anchor at stop 500 in all three modes, with the Reset action, plan `preset-intent-fidelity` (ticket #681) |
| Branch | unit/pif-u2-ramp @ 5fd214e |
| Base | ab9eaa6 (U1's last commit on this branch before U2's own work; `git merge-base HEAD origin/main` = bf2aaf659fde4db3bddaed8dfa23e2f485ab2c46, unchanged from U1's handoff) |
| Grade | l4 |
| Ran | `npm test` ✅ (48/48, "✓ all 48 test files passed") · `npm run build` ✅ (tsc clean, vite build, bundle, gen:figma-ui all succeeded) · `node scripts/audit-citations.mjs` ✅ (STALE 0) · `node test/repo/branding.mjs` ✅ (`branding: clean (448 files scanned)`) · `git status --short` ✅ empty after every commit |
| Left out | `src/engine/prime.mjs` / `test/engine/prime.mjs` (U6), the chroma envelope in tonal.js (U3, keyed on `liftStop`), `src/engine/hct.js` (U6's #686 cache fix), `docs/` except this handoff + `.sdlc/questions/pif-u2.md` — none touched |

## Criteria

| # | Criterion | Command | Observed | Negative control |
|---|---|---|---|---|
| C1 | `npm test` green, clean tree | `npm test` | `✓ all 48 test files passed`, exit 0; `git status --short` empty after commit | n/a |
| C3 | Ramp stop 500 = anchor, in-window sources | `node test/engine/anchor.mjs` | `anchor-ramp: 10110 exact, 0 off (in-window sources only, 3370 of 3380)` — the true, re-measured count (see Q-U2-1: 3,370 not the plan's 3,380, since the 10 window-clamped sources are a separate, named population) | `lift 40 on an anchored palette leaves stop 500 unchanged (${sample.palette.anchor}), while a non-anchored copy of the same palette MOVES at stop 500` — `test/engine/anchor.mjs:484-498`; also a synthetic predicate-discrimination check before the real sweep runs |
| C4 | Non-anchored identity, byte-identical to origin/main at branch creation | scratch script, see below | `paletteStops: 11340 checked, 0 mismatch(es)`; `primeSwatches: 11340 checked, 0 mismatch(es)` — 3,780 palettes × 3 modes | n/a (identity check; mismatch count itself is the control) |
| C5 | Monotone, 0.55 L* gap, no shared hex, named window allow-list | `node test/engine/anchor.mjs` | `anchor-ramp monotone: 0 non-monotone ramp(s) (expected 0, all three modes, all 3,380 sources)`; `anchor-ramp window-clamp allow-list: 10 (expected 10)`; `anchor-ramp gap/distinct allow-list: 118 (expected 118)` | synthetic rising-tone pair fails `monotoneOk()`, synthetic sub-0.55-gap duplicate-hex pair fails `gapOk()`, both asserted before the real sweep (`test/engine/anchor.mjs:475-481`); both allow-lists compared by sorted NAME array, not count, each with its own one-member-swap negative control |
| C12 | Reset action (Q6): detach on hue/chroma edit, restore on Reset | `node test/ui/headless-boot.mjs`, group `(rst)` | PASS — `HEADLESS BOOT PASS`; `(rst1)`-`(rst5b)` all pass; see below for the external verification | `(rst6b)`: Reset stubbed to a no-op inside the test, palette stays detached, the restoration check is proven to discriminate. Externally re-verified: the REAL `resetAnchor` was temporarily broken (`return;` inserted as its first line), and the SAME `npm run` of the file then failed with 6 distinct `(rst3)`-`(rst5b)` failures; reverted, re-confirmed green |

### C4's method

`test/engine/anchor.mjs`'s and the summary's own claim ("byte-identical to origin/main… for all 3,780 palettes in all three modes") was re-measured directly rather than assumed: `git archive` extracted the merge-base commit (`bf2aaf6`) into a scratch tree, that tree's OWN `gen-categories.mjs` was run to regenerate its own (pre-anchor, `liftForTone`-fitted) 3,780-palette corpus, and `paletteStops`/`primeSwatches` were computed for every palette × mode TWICE — once through this branch's tonal.js/prime.mjs (with `anchor`/`sourceAnchor` stripped from the object) and once through the base tree's own tonal.js/prime.mjs on the identical data. 11,340 checks each, 0 mismatches. This is also provable structurally: `git diff` on `src/engine/tonal.js` between base and this branch shows **zero removed or changed lines**, only additions — the non-anchored code path is byte-identical by construction, not just by measurement.

## Files changed

- `src/engine/tonal.js` — the anchored branch: `resolveAnchor`, `ANCHOR_HEX`/`RAMP_L_MIN`/`RAMP_L_MAX`, `anchorLiftPos`/`anchorWarp`/`anchorLerp`, `paletteStopsAnchored` (even path), `okhslStopsAnchored` (perceptual/peak path), wired into `paletteStops`/`okhslStops`.
- `scripts/gen-categories.mjs` — `liftForTone` retired, `lift: 0`, summary line reports anchor/window-outside counts.
- `src/ui/categories/*.js`, `src/ui/describe-mcp-assets.js`, `figma/plugin/ui.html` — regenerated artifacts.
- `test/engine/categories.mjs` — `lift-anchor` gate removed.
- `test/engine/anchor.mjs` — new `anchor-ramp` gate (C3/C5), with allow-lists and negative controls.
- `src/ui/model.mjs`, `src/engine/exports.js` — the subset-object-gap fix (`anchor` now forwarded into `paletteStops`).
- `test/engine/semantic.mjs`, `test/engine/exports.mjs`, `test/engine/fixtures/shadcn-baseline.css`, `test/ui/shell.mjs`, `test/mcp/png-swatch-board.mjs`, `test/ui/fixtures/default-doc-ramps.json` — re-measured downstream of the subset-object-gap fix.
- `src/ui/sections/color.js` — Hue/Chroma edits drop `anchor`; new `resetAnchor` method + "Reset to source color" button.
- `test/ui/headless-boot.mjs` — new `(rst)` group (C12) + the pre-existing `(hh)` group's stop-500 rewrite.
- `docs/reference/references/component-inventory.md`, `docs/reference/reviews/2026-08-20-reactivity/{00-synthesis,02-sections-and-resolvers,04-context-and-messaging}.md` — citation re-pins.
- `.sdlc/questions/pif-u2.md` — four flagged points (see below).

## Regenerated artifacts committed

`src/ui/categories/{architecture,brands,cuisine,film,literature,music,nature,travel}.js` + `index.js`, `src/ui/describe-mcp-assets.js`, `figma/plugin/ui.html`, `test/engine/fixtures/shadcn-baseline.css`, `test/ui/fixtures/default-doc-ramps.json`, `docs/reference/data/adia-oklch-export.css` / `adia-radix-export.mjs` (regenerated by `npm run build`'s `gen:adia-exports`, unchanged content — Adia's brand doc carries no `anchor` overrides today).

## Re-measured figures vs the plan's

- **C3**: plan says 0 misses over "3,380 checks" per mode; true in-window population is **3,370** (10 named sources window-clamp instead) — see Q-U2-1.
- **Role-contrast pinned floors** (`test/engine/semantic.mjs`): every entry across all three tone modes re-measured whole; perceptual and peak now measure IDENTICALLY for anchored families (the anchored ladder is mode-independent by construction — documented at `tonal.js`'s `okhslStopsAnchored`).
- **Panda EX-1/EX-2, shadcn-baseline**: re-captured from the live exporter, dated CARVE-OUT comments added matching each file's own existing convention (#647/#662's pattern).
- **118-source gap/distinct allow-list**: a NEW finding not named anywhere in the plan text (Q-U2-3) — confined to low-to-moderate chroma (max 29%) sources near the window's own edges.

## Risks for U3/U4/U5/U6

- **U3 (chroma envelope)**: builds its chroma work on top of this unit's tone/lightness construction (`liftStop`-keyed). If Q-U2-1's clamp reading is wrong, U3 inherits a different pivot shape for the 10 window-clamped sources.
- **U4 (blast-radius report)** and **U6's own gates**: this unit's subset-object-gap fix (model.mjs/exports.js) moved every ramp-derived value for every default AND curated palette, not just the anchor mechanism narrowly — a much larger blast radius than the plan's own "default kit ramps move via U3 only" line anticipated (Q-U2-2). U4's report should expect this.
- **U5 (SPEC docs)**: `docs/spec/spec-panda-park-ui-exports.md`'s EX-1/EX-2 (confirmed stale) and EX-4 (likely stale, unverified — no test gate mirrors it) need re-pinning. Same shape as U1's own `690b0a1`-routed drift, broader scope (whole-corpus, not three fields). See Q-U2-4.
- **U6 (prime ladder / hct.js cache)**: unaffected by this unit — `prime.mjs` untouched, confirmed via `git status` never listing it.

## Open questions

See `.sdlc/questions/pif-u2.md` — Q-U2-1 (C3 vs C5 stop-500 exactness, resolved as: token exact, ramp clamps), Q-U2-2 (default kit ramps move under U2 alone, resolved as: no suppression mechanism exists, built accordingly), Q-U2-3 (gap/distinct allow-list finding, now 119, updated below), Q-U2-4 (spec-panda-park-ui-exports.md now stale, out of lane, routed the same way as U1's `690b0a1`).

## Review response (`pif-u2-review-1.md`, FIX-FIRST, 2026-09-18)

An independent review found C5 (#681 U2's own monotone/gap gate) was measuring a raw `paletteStops(...)`
proxy under `DEFAULT_CONTROLS`, not the rendered product path (`projectView(hydrate(preset))`, which
resolves each preset's OWN controls). On the rendered path, 16 anchored ramps were non-monotone where
the proxy read 0 — caused by the anchored branches' chroma/`s` basis being `palette.chroma` (the
group's resolved ramp target, usually 100), not the anchor's own measured chroma, which put a chroma
notch/spike at stop 500 in 4,962 of 10,140 rendered cells (F2). Fixed, both parts of the team lead's
dispatch:

- **F1 (gate)**: `test/engine/anchor.mjs`'s `anchor-ramp` sweep now iterates `hydrate(preset)` ×
  `projectView(...).palettes[i].fullRamp` per mode (343 presets x 3 modes), not a `DEFAULT_CONTROLS`
  proxy call. `0 non-monotone` confirmed on the real rendered path.
- **F2 (basis)**: both anchored branches (`paletteStopsAnchored`, `okhslStopsAnchored` in
  `src/engine/tonal.js`) now LERP the chroma/`s` target from the anchor's own measured value at stop
  500 (`w`=0, matches the verbatim pivot exactly — no notch) toward the group's resolved ramp target
  at each side's endpoint (`w`=1), using the SAME warped `w` the tone ladder (`anchorLerp`/
  `anchorWarp`) already computes. A pure "anchor value everywhere" basis — what the review's fix text
  describes literally — was tried first and DID break a ratified requirement: REQ-002
  (`spec-muted-base-key-spikes` 0.3.0, `test/ui/headless-boot.mjs`'s `(gid6)`/`(gid8)`/`(gid8b)`) rules
  the group's Base chroma an ABSOLUTE per-group ramp target for every palette, anchored ones included
  — moving it must still move every ramp in the group. The blend satisfies both: no notch at the
  pivot, and Base chroma still moves an anchored ramp (less than a non-anchored one, by construction,
  since the pivot itself never moves — this partial-response degree is the SAME kind of question F4
  raises for Curve/Tension/Vibrancy/hueSpace, not separately re-litigated here).
- Re-measured everything the basis change touches a second time: the gap/distinct allow-list moved
  118 → **119** (re-frozen, sorted, compared by name); `test/engine/semantic.mjs`'s role-contrast
  FLOORS table (all 96 entries, all 3 modes); `test/engine/exports.mjs`'s panda EX-2 literals
  (`primary.DEFAULT`, `primary.hover`, `data-1.DEFAULT.base` — EX-1's raw/verbatim-anchor literals were
  unaffected, independently re-verified); `test/engine/fixtures/shadcn-baseline.css` (regenerated,
  dated CARVE-OUT note added, a pre-existing stale line-count claim in the #681 U2 paragraph — 124/
  115/124, should have read 124/115/115 — corrected in the same pass); `test/ui/fixtures/default-doc-ramps.json`
  (regenerated via `scripts/gen-ramp-fixture.mjs`); 2 stale citations. `npm test` (48/48), `npm run
  build`, `node test/repo/branding.mjs`, and `node scripts/audit-citations.mjs` all clean after.

### F3 — what the U2/U3 merge needs (advisory only; U3's branch/worktree not touched)

Both units edit `src/engine/tonal.js` with no textual conflict (`git merge-tree` auto-merges it), but
the merge is semantically broken: U2's `resolveAnchor`-gated branches (`paletteStopsAnchored`,
`okhslStopsAnchored`) early-return BEFORE U3's `chromaEnvelope` mechanism ever runs, so all 3,396
anchored palettes bypass U3's chroma shaping entirely post-merge — C7 (U3's own "0 old-formula-count"
grep gate, presumably) would read a non-zero count on the merged tree. Concretely, for the merge to
be semantically sound, one of these needs to happen, and it should be decided BEFORE either unit
merges, not discovered after:

1. **Route U2's anchored branches through U3's `chromaEnvelope`** before merge — replace this unit's
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
  — someone needs to decide whether the anchored branch's damping should read `anchorLiftPos` (as it
  does today, `okhslStopsAnchored` only — `paletteStopsAnchored`'s damping still reads the raw signed
  stop position, an existing pre-review asymmetry, not touched in this pass) or a reconciled function
  shared with U3.
- **Files that need re-measuring or regenerating post-merge, never hand-resolved**, the same class
  this unit's own subset-object-gap and F2 fixes both touched: `src/ui/categories/*.js`,
  `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js`, `test/engine/{semantic,exports,categories}.mjs`,
  `test/engine/fixtures/shadcn-baseline.css`, `test/ui/fixtures/default-doc-ramps.json`, plus whatever
  citation lines the merge shifts.
- **Review findings F4/F6-F9** (peak/perceptual collapse and Curve/Tension/Vibrancy/hueSpace/now Base
  chroma becoming reduced-or-no-ops for anchored palettes; default-kit movement after Reset; lowered
  contrast floors; hue failures at near-black/white anchors) are real, reviewed, and NOT fixed in this
  pass — they are owner-ruling questions, tracked in `.sdlc/questions/pif-u2.md`, that the U2/U3 merge
  decision should account for rather than resolve unilaterally.
