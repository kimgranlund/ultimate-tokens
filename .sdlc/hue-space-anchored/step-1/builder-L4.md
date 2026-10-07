<!-- role=builder level=L4 model=opus effort=xhigh -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/hue-space-anchored/src/engine/tonal.js: `solveCam16Hue` exported, body unchanged, one header line naming prime.mjs and model.mjs as importers.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/hue-space-anchored/src/engine/prime.mjs: imports `rgbToOklchHue` and `solveCam16Hue`; shared `rungHue(l)` (oklch solve on the anchored path, `hOk` otherwise) used by `rungHex`, the final map and rung 3 at k != 1; header `hue` sentence and ANCHOR BRANCH paragraph rewritten with the HUE SPACE rule.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/hue-space-anchored/src/ui/model.mjs: `deriveKeyColor` anchored k != 1 solves the hue under oklch with its own `solveCam16Hue` call; imports added; header gains the hue-space sentence.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/hue-space-anchored/test/engine/anchor.mjs: `deltaEOk` hoisted to module scope (F4 block reads it from there); `BOTH_HUE_SPACES`; anchor-identity (including the derivedAll leg), key-anchor corpus, anchor-k and anchor-k scale control iterate oklch and cam16; new `prime-huespace` gate and `prime-huespace control`, both in the REPORT list.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/hue-space-anchored/test/engine/exports.mjs: panda EX-1 `prime.brightest` and `prime.dimmest` re-pinned.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/hue-space-anchored/test/engine/prime.mjs: ladder-span `SPAN_PX_EXPECTED` re-pinned.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/hue-space-anchored/src/ui/describe-mcp-assets.js: regenerated (gen:mcp-assets).
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/hue-space-anchored/figma/plugin/ui.html: regenerated (bundle + gen:figma-ui).

## Checks
- (guard) `grep -qF "anchor-k scale control" test/engine/anchor.mjs`: exit 0.
- (red) solveCam16Hue export one-liner: exit 0.
- (red) default-kit oklch ladder hue drift one-liner: exit 0 (n 112, worst 0.654 deg).
- (red) 16 of 16 default-kit ladders move outer rungs between spaces: exit 0 (moved 16).
- (red) Primary key at k 50 equals oklch rung 3 and differs from cam16: exit 0 (#49638C, #49638C, cam16 #4F628D).
- (guard) 64-case distinct/key/anchor one-liner: exit 0 (bad 0, n 64).
- (red) derivedAll Primary brightest/dimmest move, prime held: exit 0 (#71A8FF vs #7DA6FF, #002257 vs #002256, prime #0C5DCC both).
- (red) `node test/engine/anchor.mjs` grep criterion for prime-huespace, prime-huespace control, and the three `(hueSpace oklch and cam16)` lines: exit 0. SAMPLED reads `prime-huespace: default kit 16 of 16 ladders moved, corpus 273 of 300, max OKLab dE 0.0307 (want > 0.01), rung 3 moved 0 (want 0)`.
- (guard) six-file loop (engine/prime, engine/exports, ui/model, ui/headless-boot, mcp/brand-kit, figma/plugin): each exit 0.
- (guard) file-set guard with `SDLC_BASE_SHA=10352b1a44689d3167c800339e8065baef05f8f2`: exit 0; diff is exactly the 8 allowed files.
- `node test/engine/prime.mjs --full` before the re-pin: one red, `ladder-span ... 365 != expected 364`; after the re-pin, `node test/engine/prime.mjs` exit 0 (in the six-file loop and in npm test).
- `node test/engine/anchor.mjs --full`: exit 0, 0 FAIL lines; anchor-ladder order-allow-list 26 (expected 26), dupe-allow-list 3 (expected 3); anchor-identity 6760 exact, 0 off; prime-huespace corpus 3131 of 3380, kit max dE 0.0307.
- Generators `gen:figma-assets`, `gen:mcp-assets`, `gen:categories`, `gen:adia-exports`, `bundle`, `gen:figma-ui`: each exit 0; only describe-mcp-assets.js and figma/plugin/ui.html moved.
- `npm test`: exit 0, "all 54 test files passed" (3:47 wall at load average about 21); tree unchanged after.

## Notes
Re-pinned literals (for step 4's report):
- test/engine/exports.mjs:531 panda EX-1 `ddRaw.primary.prime.brightest`: old `oklch(0.733 0.1374 264.49)`, new `oklch(0.7307 0.1399 259.24)`.
- test/engine/exports.mjs:532 panda EX-1 `ddRaw.primary.prime.dimmest`: old `oklch(0.2669 0.1023 258.76)`, new `oklch(0.2678 0.1038 258.99)`.
- test/engine/prime.mjs:1192 ladder-span `SPAN_PX_EXPECTED`: old 364, new 365 (measured on this tree, matches the prototype); `SPAN_CONSTRUCTED_EXPECTED` 363 held.

Runtime: `node test/engine/anchor.mjs` (SAMPLED) took 27.5 s at base and 36.3 s on this tree, measured back to back in a throwaway worktree (removed); the FULL run took 5:03 at high host load. The growth comes from the identity legs now running two hue spaces and from the new gate's corpus renders.

The prime-huespace printed dE is the default kit's max, the gated number; rung 3 moved is the kit plus corpus sum. The control runs the same `huespaceMoves` predicate on the planted cam16-on-both-sides render and also asserts that the gate's pass predicate rejects it.

Left alone as the handoff says: the F4 block apart from the deltaEOk hoist, the `HUE_SPACE_*` constants, the Q-D comments, the key-anchor rendered leg and the negative controls (they still read the preset's own hue space), test/ui/shell.mjs, and the baselines. No commit.
