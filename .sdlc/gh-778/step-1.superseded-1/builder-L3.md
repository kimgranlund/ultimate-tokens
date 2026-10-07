<!-- role=builder level=L3 model=opus effort=high -->
## Status
blocked

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/gh-778/src/engine/tonal.js: added `ENVELOPE_PRESETS` (7 entries, in the order the handoff gives) and `envelopePresetOf`. Every stop record now carries `env` and `model`. The even paths also carry `basis` and `floor`, plus `anchorCap` on the non-anchored path when `dampAmp === 0`. `enforceMonotonePixelL` sets `refined: true` on a swapped stop. `dampStops` sets `damper: r` on every record and scales `model`. The floor expression moved into an `evenFloor` helper that `evenChroma` calls. On the anchored even path, `chromaAt` now returns `{chroma, basis, floor}`, and the solver gets the wrapper `(h) => chromaAt(h).chroma`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/gh-778/test/engine/tonal.mjs: new `envelope-presets` gate covering (a) through (d), including the `dampCurve: 3` negative control. Added the gate to `DECLARED`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/gh-778/src/ui/app-helpers.mjs: imports `ENVELOPE_PRESETS` from tonal.js and sets `export const DAMP_PRESETS = ENVELOPE_PRESETS;`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/gh-778/src/ui/sections/color.js: imports `chromaEnvelope, envelopePresetOf`. A chip is active when `envelopePresetOf(this.doc) === p.name`. `graphDamping` computes `M(stop)` as `chromaEnvelope(stop, 500, 0, { ...doc })`, and the inline legacy formula is gone. Chip `title` text is unchanged.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/gh-778/docs/references/component-inventory.md: remapped 41 `color.js` / `app-helpers.mjs` cites to the new lines, using a diff-derived line map.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/gh-778/docs/specs/app-shell.md: remapped 3 `color.js` cites (807→799, 866→858, 482→474).

## Checks
- (red) c1 `ENVELOPE_PRESETS` / `envelopePresetOf` node -e: exit 0.
- (red) c2 env/model/basis/floor/damper node -e: prints `.`, exit 0.
- (guard) `node scripts/report-preset-fidelity.mjs --identity-control --base 46273403ebe867323cc7f8b3618cec5380bb7329` (`$SDLC_BASE_SHA` was unset in the shell, so I passed the sha from the brief): 0 differing cells in perceptual, peak and even (0/94500 cells each), and 0/400 on the default kit. Exit 0.
- (red) `node test/engine/tonal.mjs`, first run: exit 1. `dip-gate-even` failed with "(negative control) the patch target string was not found", because moving the floor expression into the helper changed the line its patch targets. Fix: `evenFloor` keeps the `const floorC = ...` line verbatim and takes `maxc` as a parameter, so that gate's patch replacements, which read `maxc`, still compile. Rerun: exit 0, every gate passes, including `pass  envelope-presets` (grep criterion OK).
- (red) `grep -qF '(envelope-presets negative control)' test/engine/tonal.mjs`: OK.
- (red) `DAMP_PRESETS = [` gone and `ENVELOPE_PRESETS` present in app-helpers.mjs: OK.
- (red) color.js has `envelopePresetOf(` and `chromaEnvelope(`, and no `Math.abs(s) ** gamma`: OK.
- (guard) `node test/ui/headless-boot.mjs`: exit 0 (HEADLESS BOOT PASS).
- (guard) `node test/repo/citations.mjs && node test/repo/em-dash.mjs`: **FAIL**. em-dash passes, but citations exits 1 with 4 failures, all in docs/reports/2026-08-20-reactivity/:
  - 00-synthesis.md lines 57, 76, 89
  - 01-core-reactivity.md lines 24, 29, 30, 39
  - 02-sections-and-resolvers.md lines 19, 20
  - 04-context-and-messaging.md line 71
- Pre-build check for the citations gate: ran `node test/repo/citations.mjs` in a detached worktree at 46273403 (under the brief's tmp prefix, now removed). Result: `STALE 0 across 10 discovered docs`, exit 0. Green at base, so this is not inherited.
- (guard) scope allowlist command: exit 0.
- Extra check: compared every string literal in test/ and scripts/ that appears in the base tonal.js against the current file. No patch target's occurrence count changed (105 literals; the only count drifts are prose words). This covers even-dips-gate.mjs's `CHROMA_AT_TARGET`, `GRID_TARGET`, `FLOOR_TARGET` and `FLOOR_MAXC_TARGET`.

## Notes
plan defect: (guard) `node test/repo/citations.mjs` contradicts the (guard) scope allowlist. The color.js and tonal.js edits this step requires shift lines that are cited from four report files in docs/reports/2026-08-20-reactivity/ (00-synthesis, 01-core-reactivity, 02-sections-and-resolvers, 04-context-and-messaging), 10 cite lines in all. Those cites now read STALE, and the allowlist does not let this step edit those files. The handoff's "42 cites into 4 docs" count missed them, because the gate discovers 10 docs.
- Every cite that went STALE in those reports is into `color.js` (now 8 lines shorter before line 255) or `src/engine/tonal.js:1061`.
- Planner options:
  - Add the four report files to the scope allowlist and to the Do's cite-repair list. The repair is a diff-derived line remap, as done here for component-inventory and app-shell.
  - Or exclude `docs/reports/` from the gate's discovery.
- The work stays uncommitted in the tree, including the in-scope cite repairs. Every other criterion passes.
- `evenFloor(maxc, intended, chromaFloor, floorRef, floorMaxc)` takes a `maxc` it does not read. This is deliberate: the dip-gate-even negative controls (test/engine/tonal.mjs:1833-1836 and test/engine/even-dips-gate.mjs:80) patch the verbatim `floorC` line into forms that read `maxc`. A comment on the helper says so.
- On the anchored even path the parts function is still named `chromaAt`, and its final call still reads `chromaAt(hue, resolvedHue)`, because even-dips-gate.mjs's `CHROMA_AT_TARGET` patches that exact text.
- `dampStops` returns copies with `damper: 1` when r >= 1 (previously it returned `at100` itself). They render byte-identically.
- `chromaEnvelope(` still appears 5 times. `chromaEnvelope(stop, 500, lift, controls)` and `let rgb = okhslToRgb(hue, s, l1);` are unchanged.
- Not run, as the handoff says: `npm test`, the sweeps, and the regeneration of describe-mcp-assets.js and figma/plugin/ui.html (step 3 owns it).
