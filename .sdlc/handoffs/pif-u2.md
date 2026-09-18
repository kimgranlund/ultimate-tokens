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

See `.sdlc/questions/pif-u2.md` — Q-U2-1 (C3 vs C5 stop-500 exactness, resolved as: token exact, ramp clamps), Q-U2-2 (default kit ramps move under U2 alone, resolved as: no suppression mechanism exists, built accordingly), Q-U2-3 (new 118-source gap/distinct allow-list finding), Q-U2-4 (spec-panda-park-ui-exports.md now stale, out of lane, routed the same way as U1's `690b0a1`).
