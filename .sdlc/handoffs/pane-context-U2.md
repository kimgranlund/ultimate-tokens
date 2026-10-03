# Handoff pane-context U2 · builder → reviewer and verifier (#785)

| Field | Value |
|---|---|
| Branch | `unit/pc-U2`, rebased onto `plan/pane-context` at `c7470c53` (U1 and U3 merged, revision 11; the C2 rows are unchanged from revision 9). One conflict, `.sdlc/questions/pane-context-group-chroma.md`: the plan branch had already rewritten the Answer table with R94 to R98, so its rows are kept and this unit adds only a `Built by` row (C2.3 greps still `2` and `0`). Pre-rebase head kept as local branch `pc-U2-prerebase-66d4fd0f`. Merge base with `origin/main` is now `2be8287a`; the C2.7 and C2.9 runs below used `e062eb42`, the merge base before the rebase, and `src/engine/`, `src/ui/persist.js` and `src/ui/model.mjs` are identical between the two |
| Change | the group base chroma is one whole-ramp damper, damp only (R94 to R98): `paletteStops` renders at 100, then multiplies each stop's emitted chroma coordinate by `g / 100`; `GROUP_DEFAULTS.material.baseChroma` is 100; no migration (`CURRENT_SCHEMA_VERSION` stays 6) |
| Ran | `npm test`: `✓ all 54 test files passed`, exit 0, `git status --short` empty, rerun on the rebased head, after the review pass 1 fixes, after the Q2 B move and after the review pass 2 fixes (each time `citations.mjs` STALE 0, `branding.mjs` clean 1106 files, `em-dash.mjs` clean 1114 files). mode-isolation, even-dips and chroma-envelope FULL rerun after the rebase, all pass. `node test/repo/em-dash.mjs`: clean (1086 files). `node test/repo/branding.mjs`: clean (1078 files). FULL sweeps, one by one: corpus-tonal (🔴 at chroma 95, then exit 0 after the Q2 B move, 207 s), corpus-anchor, sweep-prime, corpus-reset, corpus-contrast, mode-isolation, even-dips, chroma-envelope all exit 0 |
| Not run | `npm run build` and `npm run smoke`: no `node_modules` in the worktree and `npm ci` was not run. The bundles `npm test` regenerates (`figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js`) are committed |
| Owner rulings | `.sdlc/questions/pane-context-U2.md` (answered on main `5f479471`; the doc is not edited on this unit). Question 1: A, accepted: the two risen even cells stand and the recaptured fixtures are the record. Question 2: B: the `(iii c)` grid moves to chroma 100 and cites its 25 at-100 rises, test-only in `test/engine/tonal.mjs`, no extra damped-ramp bound |
| Load rule | two runs started while the hot-process count read 4 (rule: 3 or fewer): one early compare and capture run, and the Q2 drop-one-key control (FULL `test/engine/tonal.mjs` in a scratch copy). Every other heavy run started at 3 or fewer; the Q2 FULL gate itself started at 0 |

## Criteria rows

| Id | Command | Evidence | Negative control | State |
|---|---|---|---|---|
| C2.1 | `FORCE_COLOR=0 node scripts/report-preset-fidelity.mjs --group-chroma --group brand --values 100,40` | exit 0. Kept: Primary `18/19 dC@500 -32.17 max dC 33.37`, Secondary `17/19 -20.57 25.82`, Tertiary `17/19 -50.51 53.02`. Stripped: Primary `18/19 -36.37 36.87`, Secondary `17/19 -23.05 28.02`, Tertiary `17/19 -55.15 56.90`. Every kept `dC@500` is below -5.00 and every stripped one below -10.00 | `--values 100,100`: all six rows `hex moved 0/19 dC@500 0.00 max dC 0.00` | 🟢 |
| C2.2 | the same with `--group material --values 30,100` | kept Neutral `hex moved 17/19 dC@500 15.32 max dC 15.60`; stripped Neutral `18/19 52.09 52.16` | `--values 30,30`: Neutral `0/19 0.00 0.00`. Scratch clone `nc-revert` (tonal.js from `455c0454`): kept Neutral `0/19 dC@500 0.00`, stripped `18/19 57.06` | 🟢 |
| C2.3 | `grep -c 'R94' .sdlc/questions/pane-context-group-chroma.md; grep -c '^\| Chosen \| pending' ...` | `2` and `0`. The doc gains "Answer, revision 2 (supersedes R88 and R89)", R94 to R98, dated 2026-10-03 | `git show 306f9a9e:.sdlc/questions/pane-context-group-chroma.md \| grep -c R94` prints `0` | 🟢 |
| C2.4 | `FORCE_COLOR=0 node test/engine/tonal.mjs` | exit 0 (SAMPLED). The `group-chroma-damper` case: (i) Primary at 100 is byte-identical to the at-100 render in all three modes; (ii) 50 and 10 hold `abs(s_g - r * s_100) <= 0.02` (perceptual, peak) and `abs(C_g - r * C_100) <= max(0.5, 0.03 * C_100)` (even) on all 19 stops, stop 500 moves at 50; (iii) at 0 every stop is at most 0.02 s or 0.5 C; (v) tone held on 3200 rows. `grep -rcF 'group-chroma-damper' test/` totals 5; at `306f9a9e` 0 files match. The case now collects every red row with its count before one FAIL | `nc-min` (perceptual and peak bypass the damper, the old `min(group, anchor)` target): exit 1, `9 red`, among them `(ii) perceptual 50: 15/19 stops off`, `perceptual 50 stop 500 did not move`, `(ii) perceptual 10: 15/19`, `(iii) perceptual 0: 16/19`, the same four for peak, `(v) 778/3200 rows off`. `nc-input` (even damper on the input, `intended * r`): `4 red`, `(ii) even 10: 18/19` on the floored pale stops, plus chroma-target, damping-curve, chroma-floor, oklch-hue-anchor, intensity-legacy red. `nc-skip` (even damper skipped): `4 red`, `(ii) even 50: 18/19`, `even 50 stop 500 did not move`, `(ii) even 10: 18/19`, `(iii) even 0: 18/19` | 🟢 |
| C2.5 | `FORCE_COLOR=0 node test/ui/headless-boot.mjs`, the `(gid` lines | exit 0 (inside `npm test`, and `gate:corpus-reset` FULL exit 0: "HEADLESS BOOT PASS"). `(gid1b)` reads 100; `(gid2)` equals a direct chroma-100 call; `(gid3)` fresh differs from direct 50 and every stop's s is within 0.02 of 0.5 x the 100 ramp's (probe: max 0.0139; stop 500 `#576485` to `#5E6474`); `(gid3b)` 10 differs from 30; `(gid-damp500)` Global slider "Material base chroma" to 60 moves stop 500 `#576485` to `#5C6478`. `grep -cF '(gid-damp500)'` prints 2 (0 at `306f9a9e`) | `nc-revert`: `(gid3)` red, off at 22 stops including 500; `(gid-damp500)` red, `#576485 to #576485`. `nc-mat30` (only `GROUP_DEFAULTS` back to 30): `(gid1b)` red `got 30`, `(gid2)` red | 🟢 |
| C2.6 | `even-dips-gate.mjs`; `chroma-envelope-gate.mjs`; `mode-isolation-gate.mjs` (each `--full` via `npm run gate:*`); then `chroma-envelope-gate.mjs --compare <306f9a9e fixture>` | even-dips exit 0, `0 dips (19 + 25 stops, 3764 palettes + default kit 16)`, `PASS`. chroma-envelope exit 0, `pass chroma-envelope: 3 modes x 4 stops x 2 stats + 3 clause counts within fixture`. mode-isolation exit 0, `perceptual 86f6e551dc20e6d7 peak 5f0eabbbe9b3c154 match fixture`, was `8ae715d202be14b2` / `0ac42e3c6dc6c0ef`. `--compare`: `perceptual: moved against base`, `peak: moved against base`, `even: moved against base`, `2 cells rose (... even 300 p90, even above100)`, exit 1: Question 1, ruled A (accepted) | `nc-amp` (`r = g / 90`, applied at 100 too), captured and compared against `306f9a9e`: `12 cells rose (perceptual 300 median, perceptual 300 p90, perceptual 700 p90, perceptual 900 median, peak 300 median, peak 300 p90, peak 700 p90, peak 900 median, peak above100, even 300 median, even 300 p90, even above100)`, exit 1 | 🟢 by the Q1 A ruling |
| C2.7 | `FORCE_COLOR=0 node scripts/report-preset-fidelity.mjs --group-chroma --defaults --base e062eb42`; `--saved-material 30`; `node -e` on `GROUP_DEFAULTS` | `node -e` prints `100`. Defaults: perceptual and peak, all 16 palettes `0/19`; even, 15 at `0/19` and Neutral `hex moved 3/19 dC@500 0.00 max dC 2.65` (the R97 even shift, 19-stop render). Saved material 30: Neutral perceptual `17/19 dC@500 -15.32 max dC 15.60`, peak `17/19 -15.32 15.32`, even `18/19 -17.34 18.92`, every other palette `0/19` (45 rows) | `nc-mat30`: `node -e` prints `30`; `--defaults --base e062eb42` perceptual Neutral `17/19 dC@500 -15.32`, peak `17/19`, even `18/19 -17.34` | 🟢 |
| C2.8 | `grep -c 'CURRENT_SCHEMA_VERSION = 6' src/ui/persist.js; grep -c 'version: 7' src/ui/persist.js` | `1` and `0`. `git diff --stat c7470c53 HEAD -- src/ui/persist.js`: 1 file, the `material` default plus its comment | `nc-v7` (version 7 plus a `{ version: 7 }` entry): `0` and `1` | 🟢 |
| C2.9 | `npm test \| tail -3`; `--identity-control --base e062eb42 --authored`; the same `--only default-kit`; `git status --short` | `✓ all 54 test files passed` (TESTS.length 54), tree empty. Authored, corpus: `perceptual 358/3780 palettes, 8213/94500 cells`, `peak 358/3780, 8221/94500`, `even 358/3780, 8573/94500`; default kit `1/16` in each mode (23, 23, 24 of 400 cells, Neutral); `25077 differing cells`. `probe-c29.mjs` (the tool's own subjects and render, base `persist.js` and `rampChromaOf`): 359 palettes resolve below 100 at the base (358 corpus plus the kit's Neutral): 343 at 30 (each document's Neutral, 342 corpus plus the kit), and Adia's 16 (1 at 25, 8 at 27, 4 at 32, 3 at 41). In every mode the differing set equals that set: `differ but at 100: 0`, `below 100 but identical: 0` | `nc-revert`: `--only default-kit` prints `0/16` in all three modes, `0 differing cells`. The adapter's `--perturb` control was not rerun | 🟢 |
| C2.10 | `FORCE_COLOR=0 node test/ui/headless-boot.mjs`, `(gid-owner4)` | exit 0. owner4-span is 13 stops (200 to 800), 400/500/600 in, `s(4)/s(100)` from 0.0299 to 0.0505, 500 at 0.0393; prime 100 and 0 render identically. `grep -cF '(gid-owner4)'` prints 2 (0 at `306f9a9e`) | `nc-revert`: red, `outside: 200:0.292 ... 500:1.000 ... 800:0.297; 500 reads 1.000`. `nc-prime` (primeChroma wired into the ramp chroma): `(gid-owner4)` red `prime 100 and 0 render it the same: false`, and `(gid2)` red | 🟢 |
| C2.11 | `grep -c 'cappedTarget' test/ui/shell.mjs; grep -c 'min(group, anchor)' test/engine/anchor.mjs; grep -c 'Amendment (2026-10-03.*R94' decision-records.md; grep -c '^\| ADR-026 .*R94' decision-records.md` | `0`, `0`, `1`, `1`. ac003b passes inside `npm test` against the `damperRatio` model | the same four greps at `306f9a9e`: `4`, `1`, `0`, `0` | 🟢 |
| FULL | `npm run gate:corpus-tonal` | Before the ruling, at chroma 95: exit 1, `(iii c) ... ROSE on 47 of 10080 grid cells beyond the 12 cited exceptions, worst +0.2987 L*`. After the Q2 B move (grid at chroma 100, `GRID_R2_EXCEPTIONS` replaced by the 25 at-100 keys from `probe-grid.mjs`, each with its rise and L*): exit 0 in 207 s, `PASS: tonal-generation clears all [gate] predicates` (FULL, 3780 palettes); the FULL-only missing-key check means all 25 were seen. SAMPLED `node test/engine/tonal.mjs` also passes | Scratch copy with `peak\|oklch\|107\|100\|5\|100\|400&450` removed from the list, FULL: exit 1, `(iii c) measured CIELAB L* ROSE on 1 of 10080 grid cells beyond the 24 cited exceptions, worst +0.0915 L* at peak/oklch hue 107 skew 100 lift 5 vibrancy 100 stop 400->450`. The 25 keys read the same on the pre-#785 engine at 100 (`probe-grid.mjs`) | 🟢 by the Q2 B ruling |
| FULL | `gate:corpus-anchor`, `gate:sweep-prime`, `gate:corpus-reset`, `gate:corpus-contrast` | exit 0 each: `PASS (FULL): C2, C3, C4 ... clear` (227 s); `PASS: prime-system clears all AC-050 gates` (164 s); `HEADLESS BOOT PASS` (79 s); `PASS: every measured curated preset's accent clears 4.5:1` (41 s) | the C2.4, C2.5 and C2.10 controls above bite on the same files | 🟢 |

## tonal.js hunks (lane overlap with fh-U2, #766)

From `git diff c7470c53 HEAD -U0 -- src/engine/tonal.js` (`src/engine/` is identical at the pre-rebase cut `455c0454`):

- `@@ -84,4`, `@@ -561,2`, `@@ -582,2`, `@@ -716,2`, `@@ -828,2`, `@@ -1324`: comments only, the review pass 1 M1 repair (the group is a ratio applied by `dampStops` after an at-100 render), each line-neutral.

- `@@ -787,0 +788` in `enforceMonotonePixelL`: carries the `hue` field through the monotone pass.
- `@@ -851 +852`, `@@ -886 +887`, `@@ -894 +895` in `paletteStopsAnchored`: the anchored even stops carry `hue` (stop 500 and the returns), which the damper needs for the CAM16 hue.
- `@@ -922,0 +924` in `paletteStops`: the one-line hook, `if (palette.chroma !== 100) return dampStops(paletteStops({ ...palette, chroma: 100 }, controls, stops), groupDamper(palette.chroma), mode, controls.hueSpace);`.
- `@@ -1014 +1016` in `paletteStops`: the even return carries `hue`.
- `@@ -1466,0 +1469,45` after `okhslStops`: the "Group chroma damper" comment, `export function groupDamper`, `function dampStops`.
- Net +2 lines above `okhslLAt`; the line citation that reads it is NEAR +2 and passes.

## Fixtures and generated files changed

- `test/engine/fixtures/tonal-legacy.json`: recaptured, 512 of 800 cells moved (Secondary and Warning unmoved).
- `test/engine/fixtures/chroma-envelope.json`: recaptured at the engine commit (Question 1); `capturedAt` points at the rebased `1e3fe1eb`, whose `src/engine/tonal.js` equals the pre-rebase capture commit's.
- `test/engine/fixtures/mode-isolation.json`: recaptured at the engine commit, hashes above, `capturedAt` likewise `1e3fe1eb`.
- `docs/reference/data/adia-oklch-export.css`, `adia-radix-export.mjs`: `gen:adia-exports` (Adia stores its groups below 100).
- `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js`: the bundles `npm test` regenerates.

## Edits outside the named lane

- `src/ui/model.mjs`, `src/engine/resolve.mjs`: comments only (stale R69 cap wording; the `GROUP_DEFAULTS` block now says Material 100/60).
- `test/engine/anchor.mjs`: beyond the C2.11 comment, the C3 control and the `anchor-achromatic` stop-500 read move to chroma 100, and `skippedOk` loosens (see Gate tolerances loosened).
- `test/ui/shell.mjs`: `ac007` Neutral at 100, an unused import removed.
- `test/ui/persist.mjs`: the two expected default sets read Material `100/60` (R96), with the comment. Control: the file copied into `nc-mat30` prints 2 FAILs (`field-default`, `schema-rename`).
- `test/ui/model.mjs`: comments say Material 100/60; the Neutral-to-Brand pair now moves through the RP-1 group metadata only, so a new Material-50 pair asserts the damper reaches the CSS export, the DS bundle and `brandKit()`. The `brandKit()` assert compares `palettes` and `roles` only, net of `controls`, which carries the stored 50 whether or not the ramps moved. Control `nc-nogroup3` (the head tree with `rampChromaOf` returning 100): `model FAIL (3)`, all three Material-50 asserts, CSS, DS bundle and `brandKit() palettes and roles`.
- `CHANGELOG.md`, `knowledge-02`, `decision-records.md` (ADR-026 amendment and Quick map row), `.sdlc/questions/`: the stale-context repairs the plan names.

## Gate tolerances loosened

Both are tolerance changes, named here so the verdict sees them as such.

- `test/engine/anchor.mjs` `achromatic-anchor` `skippedOk`: from `<= 1` to `<= 3` of the 10 even cells. Mechanism: the damper halves the at-100 even CAM16 C at chroma 50, so `#FFFFFF` stop 300 (C 3.6) and `#000000`/`#010101` stop 700 (C 4.5) fall under the C 5 hue-skip, where before only `#FFFFFF` stop 300 (C 4.41) did.
- `test/engine/tonal.mjs` `oklch-hue-anchor` budget: from a flat 1 degree to `max(1, roundingBound(pixel))`. Mechanism: a damped low-chroma pixel's hue is quantized coarser than 1 degree; perceptual chroma 20 `#737D96` reads 1.00 degree off against its own 2.22 degree rounding bound.

## Review pass 1 fixes (reviewer FAIL on stale records, no engine change)

- M1: `src/engine/tonal.js` comments at `DEFAULT_CONTROLS`, `anchorChromaBasis`, `paletteStopsAnchored` (two blocks) and `okhslStopsAnchored` now say the inner render is at 100 and the group ratio is applied by `groupDamper` and `dampStops`. Line-neutral, so `okhslLAt` stays at 1028 and the `:1026` cite still reads NEAR +2.
- M2: `src/ui/model.mjs` `GROUP_DEFAULTS` comment says Material 100/60 (R96).
- M3: `.claude/skills/color-math/SKILL.md` describes the damper and where group muting belongs; the false `(gid3)`/`(gid8)`/`(gid8b)` no-op warning is gone.
- M4: `scripts/gen-tonal-fixture.mjs` header and inline comment record the #785 wholesale recapture; `test/engine/tonal.mjs` re-pin history gains the #785 entry (512 of 800 cells, regenerated, Secondary and Warning unmoved).
- m1: the `brandKit()` assert above, with its control.
- m2: the section above.
- m3: one `Superseded in part by R94 to R98 (#785)` line under the title of `docs/spec/spec-muted-base-key-spikes.md` and `docs/lld/lld-muted-base-key-spikes.md`.
- m5: C2.8 and the tonal.js hunk list read against `c7470c53`.
- m4 (README.md:33 per-palette Intensity wording) is out of this lane and left for a follow-up.

## Owner rulings applied

- Q1 A: accepted as built; no code change.
- Q2 B: `test/engine/tonal.mjs` `(iii c)` grid renders at `chroma: 100`, and `GRID_R2_EXCEPTIONS` holds the 25 at-100 keys with a #785 provenance comment. The #725 U3 history above it is kept, and the `(iii)` header notes the move. Test-only: no engine, fixture or question-doc edit. Damped-ramp monotonicity below 100 is not bounded, per the ruling.

## Review pass 2 fixes (comment-only)

- M6: `.claude/skills/color-math/references/foundations.md` anchored-branch bullet matches SKILL.md: the blend walks toward `min(groupValue, anchorValue)`, `groupValue` is always 100 since #785, and the group damps afterwards in `dampStops`.
- m6: `src/ui/model.mjs` (`derivePalette` comment) says the resolver yields the group damper value, not an absolute target.
- m7: `src/ui/sections/color.js` (Chroma slider comment) says the group damps the whole at-100 ramp by Base chroma / 100.
- n1: the Q2 B comment reads "the 12 keys described above".
- Sweep: `git grep -nE "absolute chroma target|absolute target|resolved ramp target|ramp-chroma target|30/60|genuinely mutes"`, plus Material-30 and absolute-chroma variants, over `src test docs/reference .claude/skills mcp plugin`. Live hits fixed: `src/ui/persist.js` (the `baseIntensity` comment called it a target and "not a per-stop multiplier", and said Material mutes by default), `src/engine/exports.js` (fallback comment), `test/engine/categories.mjs` (2 comments), `test/ui/headless-boot.mjs` (`(bpc)` header), `docs/reference/references/knowledge-02-tonal-scale.md` (the TOC line, the §8 intro and the line 439 basis sentence). Kept on purpose, all describing the pre-#785 model as history: `test/engine/tonal.mjs` re-pin entry and `:1905`, `src/ui/model.mjs` "30/60 before", `docs/reference/CHANGELOG.md:300`, and the superseded SPEC and LLD bodies under their banners. Other "absolute chroma" hits (`relChroma`, `tonal.js:46`, `anchor.mjs:733`, `tonal.mjs:181`) are about the hue-gamut sense, not Base chroma.

