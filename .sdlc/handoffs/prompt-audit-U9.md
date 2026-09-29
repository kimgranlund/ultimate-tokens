---
plan: prompt-audit
unit: U9
branch: unit/pa-U9
base: 1099acd3
---

# prompt-audit U9 handoff (#758)

Built: five skill fact pins and the symbol-home leg in `test/repo/citations.mjs`, plus the ui.html KB correction in `.sdlc/baseline.md`. `$B` is `5cfd2b08` (`git merge-base origin/main HEAD`). Step 1 (merge `origin/main`): main is seven records-only commits ahead (`.sdlc/` files including `board.md`), the merge is refused by the board guard hook, and `test/repo/citations.mjs` is byte-identical on main and here (`git diff HEAD origin/main -- test/repo/citations.mjs` empty), so the landed shape is read from this branch's copy and the merge is left to the Orchestrator.

## Design choices

| Choice | Fact |
|---|---|
| Pin shape | the landed `FACT_PINS` shape, no typed number on the code side; a word count (`fifteen voices`) reads through `NUM_WORDS`, the code side still supplies the value; `source(needle)` lets the hueSpace pin compare `DEFAULT_CONTROLS.hueSpace` with the doc's own quoted needle |
| Pin (b) | reuses the drawer Colors-group reader, hoisted to `drawerColorFormats` and shared with the existing `colour formats` pin |
| Pin (e) | H5 names are the backticked names before the first `;` in the H5 criterion cell; each must be a `jobs:` key of `ci.yml` and each key except `deploy` must be named |
| Leg constant | `SYMBOL_HOME_FLOOR = 12` |
| Leg scope | only full repo paths that resolve in `git ls-files` are read; a bare `type.mjs` is not (three false stales at head: `typeTokensX`, `geomTokensX` are a family name in prose, `steps` a field). N is therefore `27` at head (plan floor `14`) |

## Criteria (head 441c66e6 plus this handoff commit; tests on the unit head)

| Id | Command output at head | Negative control |
|---|---|---|
| U9-1 | `grep -c FACT_PINS` `3`; pass line `✓ citations: parser self-test + STALE 0 across 10 discovered docs + 11 fact pins (HEAD 441c66e6)`; `exit 0`; leg lines `1` | `origin/main`'s file: `6` pins, `0` leg lines |
| U9-2 | five doc edits, each `exit 1` and `1` ✗ line naming the doc and the pin (type-scale `fifteen voices`, adding-export-formats `ten colour formats`, color-math `"oklch"`, maintaining-brand-kit-mcp `list_palettes (16)`, rubric.md `panda-smoke`) | the same five edits under 1099acd3's gate: `exit 0`, `0` ✗ |
| U9-3 | (a) stub of eleven keys: ✗ on `src/engine/type.mjs`, `holds 11`; (b) drawer pair removed: ✗ on `src/ui/overlays/drawer.js` for the new pin and the old one (`holds 9`); (c) tonal.js `cam16`: ✗ on `src/engine/tonal.js`; (d) one `defaults` entry removed: ✗ on `docs/reference/data/role-table.json`, `holds 15`; (e) `panda-smokeX:` in ci.yml: ✗ on `.github/workflows/ci.yml`; each `exit 1`. I did not run the other suites for (b) to (d); the ✗ counts above are the citations gate's own | (c) and (e) source edits under 1099acd3's gate: `exit 0`, `0` ✗ |
| U9-4 | `symbol homes: 27 checked, 0 stale`; wrong home (`FORMAT_GROUPS` moved to `src/ui/app.js` in adding-export-formats/SKILL.md): `✗ ... SKILL.md:93 \`FORMAT_GROUPS\` is not defined in src/ui/app.js`, `symbol homes: 27 checked, 1 stale`, `✗ 1 citation gate failure(s)`, exit 1 (zsh `PIPESTATUS` was empty in my run, the process exit is the gate's `process.exit`); floor 999: `✗ test/repo/citations.mjs: symbol homes: only 27 citations read, below SYMBOL_HOME_FLOOR 999 (the scanner went vacuous)` | leg against `.claude/skills` at `$B` (`git checkout 5cfd2b08 -- .claude/skills`, then run, then restored): `symbol homes: 14 checked, 6 stale`: `FORMAT_GROUPS`, `downloadAllZip` and `ensureTypeFonts` in `src/ui/app.js`, `brandKit` on line 237 of `src/ui/model.mjs`, `downloadBrandKitMcp` on line 6565 of `src/ui/app.js`, `setGeomTokenOverride` in `src/ui/app.js`. The three pins at `$B` also red there (docs not yet rewritten), as expected |
| U9-5 | `grep -c want` `0`; typed-number grep `0`; `git diff --name-only 1099acd3 -- test/run.mjs` `0` (the `$B` form of the plan prints `1` for `.sdlc/baseline.md`, changed on the plan branch by U3 before this unit); check line `ok    tests: baseline 54, test/run.mjs TESTS 54` | `source: () => 16` would match the second grep; not run, the grep is the plan's own |
| $B / P1 | `npm test` `✓ all 54 test files passed`, TESTS count `54`, `git status --short` empty after the run, no generated file changed | plan's adapter §1 control not re-run by this unit |
| P2 | not run: `npm run build` needs `node_modules`, none in this worktree; the ui.html bytes are unchanged by this unit (tree clean after `npm test`, which runs `gen:figma-ui`) | |
| P3 | `branding: clean (936 files scanned)`, `em-dash: clean (944 files scanned)`, added lines carrying U+2014 in prose: `git diff 1099acd3` shows none | |
| P6 | added lines matching `TKT-[0-9]{4}` or `(#NNN)` in the diff to 1099acd3: `0` | |

## Baseline

`sh .sdlc/checks/baseline-agrees-check.sh` at 1099acd3 read `STALE ui.html: baseline 4130.3 KB, tree 4137.0 KB`; U3's bundle growth on this branch was not in the row. Row cell moved to 4137.0 KB and a dated Correction (2026-09-29) added, naming the measure. Now `ok    ui.html: baseline 4137.0 KB, tree 4137.0 KB`. `stale total: 1` remains: `STALE time test: baseline 167 to 268 s, adapter 80 to 89 s`, present before this unit and outside its scope.

## Claim-proof for the comment text I added

| Claim | Command at head | Control at `$B` or a synthetic |
|---|---|---|
| `app.js` imports and calls `ensureTypeFonts` and does not define it | `grep -n ensureTypeFonts src/ui/app.js` prints an import (line 53) and a call (line 1441); definition regex count `0` | same at `5cfd2b08`: `2` hits, `0` definitions; that is the 6-stale row above |
| a bare file name is ambiguous and `typeTokensX` is a family name in prose | `grep -c 'typeTokensX\|geomTokensX' src/engine/type.mjs src/engine/geometry.mjs` prints `0` and `0`; with bare names read, the leg printed `40 checked, 3 stale` (`typeTokensX`, `geomTokensX`, `steps`) | with full paths only: `27 checked, 0 stale` |
| `dimension` (`px`) style parentheticals are prose and skipped | `.claude/skills/geometry-system/references/rubric.md` carries that shape (`grep -c` `1`); it resolves to no tracked path and has no source extension, so it is not counted | n/a |
| a doc can spell a count as a word | `type-scale/SKILL.md` line 20 `the fifteen voices`; the pin passes at `11 fact pins` | edit to `eleven voices` reds (U9-2) |

## Findings fates

| Id | Fate | Note |
|---|---|---|
| U9 | applied | no finding ids in the plan's P5 list for U9 |
