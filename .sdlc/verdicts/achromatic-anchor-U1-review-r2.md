PASS

# Review achromatic-anchor U1 · #739 · round 2 at aa2368cd

Reviewer-l2, fresh context, 2026-09-24. Head `aa2368cd` on `unit/aa-U1` (pushed, `origin/unit/aa-U1` agrees), diff base `a17fa1ef`, criteria plan revision 3 (`plan/achromatic-anchor`). Controls ran in one `git clone -q --shared` scratch clone under `$TMPDIR/aaU1-rev-r2` at `aa2368cd`, every edit reverted with `git checkout` (tree `0` after each), clone removed after this review. `npm test` was not run by this review; the builder's `27fe4815` message reports it and `npm run build` green.

## Round-1 findings

| # | Round-1 finding | State at aa2368cd | Evidence |
|---|---|---|---|
| F1 | gate can pass vacuously | 🟢 fixed | `test/engine/anchor.mjs:1325` `skippedOk = (skipped) => skipped <= 3`; `:1347` FAILs when it does not hold. My control below (every achromatic-anchored ramp forced neutral) now reds the gate itself: `FAIL  achromatic-anchor: 0 of 0 ... 30 skipped` |
| F2 | em dashes (P3) | 🟢 fixed | `src/engine/okhsl.js:184` now uses a hyphen; handoff and `00-synthesis.md:89` likewise. P3 second count `0`, third count `0`, `branding: clean (648 files scanned)` |
| F3 | P4 scope wall | 🟢 fixed by plan revision 3 | the revision 3 row in the plan's log admits `.sdlc/baseline.md` and `00-synthesis.md`; P4 first command `0`, second `0` |
| F4 | §9 wording | 🟢 fixed | `docs/reference/references/knowledge-02-tonal-scale.md:453-461`: "its own MEASURED hue" (OKLCH on the CIE branch, OKHSL on the OKHSL branch) is residue; the OKHSL branch uses `palette.hue`, the CIE branch seeds through `effHue(palette.hue, controls.hueSpace, hueAnchorFrac(...))`. Matches `src/engine/tonal.js:729-730` and `:1004,1006` |
| F5 | handoff controls not real | 🟢 fixed | `.sdlc/handoffs/achromatic-anchor-U1.md:39-42` cite the forced-false control, four drop/restore controls and the prime `* 1.01` control; the two I reran reproduce exactly (below) |

## Diff review (a17fa1ef..aa2368cd)

| Area | State | Evidence |
|---|---|---|
| achromatic rule, `tonal.js` | 🟢 | `resolveAnchor` sets `achromatic: rgbToOklabChroma(rgb) < ACHROMATIC_ANCHOR_C` (`:567`); `paletteStopsAnchored` swaps both `targetOklchHue` and `seedHue` only under `anchor.achromatic` (`:729-730`); `okhslStopsAnchored` swaps `targetOklchHue` and `hOkSeed` (`:1004,1006`). The chromatic path reads byte-for-byte as at base. Comments name #739 and carry no em dash |
| `okhsl.js` | 🟢 | `rgbToOklabChroma` (`:188`) is `hypot(a, b)` over the same OKLab conversion `rgbToOkhsl` uses; white guard `L >= 1 - 1e-6` (`:209`) mirrors the black one. `test/engine/okhsl.mjs` white gate passes (`grep -c white` `1`) |
| new gates | 🟢 | `achromatic-anchor` pass line at head: `27 of 27 ... 3 skipped`, `#808082 ... true`. Both sides of the constant are pinned (`:1348-1363`) |
| allow-list additions | 🟢 | each names its mechanism: `NOTCH_ALLOW` +2 `#ACADAE` (`anchor.mjs:628-635`, the `anchorChromaBasis` vs `maxChromaInGamut` pivot notch after the hue-seed move); `KNOWN_BASELINE_DUP` +2 Nike near-white 8-bit collisions and the two dip-baseline keys (`tonal.mjs`). Nike counts `anchor.mjs 4`, `prime.mjs 2`, `tonal.mjs 0`, all within U1-6's Expected; `anchor`, `okhsl`, `tonal`, `prime` all `exit 0` in the clone |
| docs | 🟢 | §9 paragraph covers every item U1-8 lists (constant, pivot lightness and chroma, the hue per branch, black and white `s = 0`, the ruling date) |
| scope (P4) | 🟢 | both P4 commands `0`; `baseline-agrees-check.sh` `stale total: 0` |

## Controls I ran

| Control | Result | Restored |
|---|---|---|
| U1-5: `achromatic` forced to `< -1` in `resolveAnchor` | `anchor.mjs` exit `1`, `FAIL  achromatic-anchor: 0 of 26 ... 4 skipped` | `git checkout`, tree `0` |
| F1 floor: both anchored call sites (`tonal.js:835`, `:1080`) passed `{ ...palette, chroma: 0 }` when `anchor.achromatic` (a neutral-ramp regression; `#808080` renders `#B7B7B7 #808080 #4E4E4E` perceptual) | exit `1`, `FAIL  achromatic-anchor: 0 of 0 ... 30 skipped`, the gate itself reds, not only the notch count | `git checkout`, tree `0` |
| U1-6: drop `#ACADAE [peak]` from `NOTCH_ALLOW` | exit `1`, `FAIL ... notch allow-list ...: 17 (expected 16)`; restore: `pass ... 17 (expected 17)` | yes |
| U1-6 plan control (1): drop Nike tertiary-muted `#FFFFFF` from `RAMP_WINDOW_ALLOW` | exit `1`, `2` FAIL lines, `FAIL  anchor-ramp allow-list: 10 (expected 9)`; restore exit `0` | yes |

## Findings, by severity

1. 🟡 `.sdlc/handoffs/achromatic-anchor-U1.md:49` still says "`npm run build` and `npm run smoke` not run", while `:7` and the `27fe4815` message say `npm run build` was rerun (exit 0, 4125.1 KB). The Left-out line is stale; say build ran and only smoke did not. Records fix, no code impact.
2. 🟡 `.sdlc/handoffs/achromatic-anchor-U1.md:39` quotes the pass line as ending `skippedOk floor holds`; the real line (`test/engine/anchor.mjs:1364`) prints no such text. Quote the line as printed.
3. 🟡 Plan step (9) asks the handoff for the P3 raw count; the handoff does not state it. The value at head is `0` (this review).
4. Info: the inline planted control `skippedOk(30)` (`anchor.mjs:1326`) only tests a constant predicate; the real bite is the neutral-ramp control above, which this review ran. The floor sits exactly at today's count (`3`), so any added skip reds; that is deliberate and deterministic.

None of the findings touches the engine, the gates or the docs; the Orchestrator may fold 1 to 3 into the next records commit without another review round.

verdict: 🟢
