FAIL

# prompt-audit U9 review, pass 1 (#758)

Head `126ca889` on `unit/pa-U9`, base `plan/prompt-audit` `1099acd3`, `$B` = `5cfd2b08` (`git merge-base origin/main HEAD` after `git fetch`). Negative controls ran in a clone of the head at `$CLAUDE_JOB_DIR/tmp/neg`, restored after each edit.

verdict: 🔴

One criterion leg misses its Expected (U9-5, third leg) and the handoff row for it drops the file that makes it miss. The gate code is correct against every plan control. The fix is records only: a handoff row and a plan ruling. No code rework is required.

## Findings, ranked

| # | Severity | Finding | Evidence |
|---|---|---|---|
| F1 | 🔴 Medium (blocking) | U9-5's third leg, `git diff --name-only "$B" -- test/run.mjs .sdlc/baseline.md \| wc -l`, has Expected `0` and prints `1`. The handoff reports `git diff --name-only 1099acd3 -- test/run.mjs` `0`, which leaves out `.sdlc/baseline.md`. It blames the `$B` miss on U3 alone, but this unit's own commit 126ca889 also edits that file (the ui.html KB cell plus a Correction paragraph). With the plan's two paths, the `1099acd3` form prints `.sdlc/baseline.md`, so the leg misses at both bases. The edit itself is right: at 1099acd3 the check read `STALE ui.html: baseline 4130.3 KB, tree 4137.0 KB` (`stale total: 2`), and P2 needs that row to agree. Needed: (a) restate the handoff's U9-5 row with the plan's command and its real output at `$B` and at 1099acd3, naming both causes, U3 and U9's KB repair; (b) the Orchestrator rules on U9-5 leg 3 (the plan meant "the tests row untouched", which leg 4 already proves). Leg 3 cannot print `0` once U3 has touched the file, so this is a plan defect as well as a handoff one | `git diff --name-only 5cfd2b08 -- test/run.mjs .sdlc/baseline.md \| wc -l` `1`; `git diff --name-only 1099acd3 -- test/run.mjs .sdlc/baseline.md` prints `.sdlc/baseline.md`; baseline check at 1099acd3 in the clone: `stale total: 2` |
| F2 | 🟡 Medium (follow-up, not blocking) | The symbol-home leg skips every bare-filename citation, so ten real citations (eight symbol/file pairs) have no guard. They are `figmaBundle` in `model.mjs`, `RADIX_VALUE_LEAVES` in `exports.js`, `_oh` in `hct.js` (x2), `geomModeScales` in `model.mjs`, `buildSizeLadder` in `geometry.mjs`, `geometryScale` in `model.mjs`, `brandKit` (`model.mjs`) (x2, the same symbol whose full-path pin went stale at `$B`) and `refKey` (in `semantic.js`. Each basename resolves to exactly one `src/` file, and all ten are defined there today (checked with the gate's own `defines`), so nothing is stale now. This fits the plan: its N (14 at `$B`) counts full paths only, and the handoff states the choice. A unique-basename resolve with a named exemption for the three prose false stales (`typeTokensX`, `geomTokensX`, `steps`) would cover them. The `homes` array, `homes.some` and `join(" or ")` are leftovers of that resolve and always hold at most one path | a scan with the gate's `SHAPE` over `git ls-files '.claude/skills/**/*.md'`: 30 read, 28 skipped for a bare name; definition lines at head 679, 1201, 368, 214, 180, 53, 689, 83 |
| F3 | 🟡 Low | A whole-doc pin bites only when every copy of the needle changes. `fifteen voices` appears on four lines of `type-scale/SKILL.md` and `ten colour formats` on two of `adding-export-formats/SKILL.md`. Editing one site (line 40 to `eleven voices`, or line 71 to `eight colour formats`) leaves the gate green. The plan's U9-2 edits replace every site, so the Expected is met. This is how the landed `FACT_PINS` shape works (the older `15 voices` pin has the same gap), not a defect U9 added | clone: single-site edits `a1 exit 0 ✗=0`, `b1 exit 0 ✗=0` |
| F4 | 🟡 Low | U9-3(b) at `$B` is red, not green, because the older `colour formats` pin shares `drawerColorFormats`. The plan's "same edits at `$B` are green" holds for (c), (d) and (e); (a) does not apply at `$B`. The handoff lists (c) and (e) only, which is accurate but does not mention (b) | `$B` gate: b `exit 1 ✗=1`, c/d/e `exit 0 ✗=0` |
| F5 | 🟡 Low | Boolean pins report `the code holds false`, which does not name the actual value (for (c) that would be `"cam16"`). The H5 message prints the needle with a doubled backtick (``` ``panda-smoke`` ```). `NUM_WORDS[...]` is a plain-object lookup, so a needle whose first word is `constructor` or `toString` would resolve to a function. `Object.hasOwn` closes that. All cosmetic or latent | the U9-3 (c) and (e) ✗ lines |
| F6 | 🟡 Low | Out of the plan shape, noted only: a slashed path with an extension outside `m?js\|json\|html\|css` (`.ts`, `.cjs`, `.md`) that resolves to nothing is skipped without counting, and dotted symbols such as `SERVER.version` in `mcp/brand-kit-core.mjs` are never read | the same scan |
| F7 | 🟡 Low | The Correction paragraph's figures are right, but "length over 1024" means the UTF-16 string length (`readFileSync(...,"utf8").length`, as `baseline-agrees-check.sh:8,16` does). Byte length gives 4156.7 and 4163.4. The paragraph already says "the way `baseline-agrees-check.sh` measures it", so it reproduces; "string length" would remove the ambiguity | string length: `5cfd2b08` 4130.3, `1099acd3` 4137.0, `HEAD` 4137.0; byte length 4156.7, 4163.4, 4163.4 |

## Criteria rerun

| Id | Expected | Measured | Status |
|---|---|---|---|
| U9-1 | `1`+, pass line `+ 11 fact pins`, `exit 0`, `1` | `3`; `✓ citations: parser self-test + STALE 0 across 10 discovered docs + 11 fact pins (HEAD 126ca889)`; `exit 0`; `1`. Control: the origin/main and 1099acd3 files print `+ 6 fact pins` and `0` | 🟢 |
| U9-2 | five doc edits, each `exit 1`, `1` ✗ naming doc and pin; green at the parent | a to e each `exit 1 ✗=1`, naming type-scale `fifteen voices`, adding-export-formats `ten colour formats`, color-math `"oklch"` on the `DEFAULT_CONTROLS.hueSpace` line, maintaining-brand-kit-mcp `list_palettes (16)`, rubric.md `panda-smoke` on the H5 line. With 1099acd3's gate, all five `exit 0 ✗=0` | 🟢 |
| U9-3 | each source edit `exit 1` with a ✗ naming the source | (a) stub of 11: `src/engine/type.mjs ... holds 11`; (b) `json` pair removed: two ✗ on `drawer.js` (`holds 9`); (c) `cam16`: ✗ on `tonal.js`; (d) one `defaults` entry popped: ✗ on `role-table.json`, `holds 15`; (e) `panda-smokeX:`: ✗ on `ci.yml`. Each `exit 1`. At `$B`: c/d/e green, b red (F4) | 🟢 |
| U9-4 | `N checked, 0 stale`, N ≥ 14; wrong home reds; floor reds; `$B` skills `6 stale` | `symbol homes: 27 checked, 0 stale`. Wrong home: `✗ ...SKILL.md:93 \`FORMAT_GROUPS\` is not defined in src/ui/app.js`, `27 checked, 1 stale`, `exit 1`. Floor 999: `✗ test/repo/citations.mjs: symbol homes: only 27 citations read, below SYMBOL_HOME_FLOOR 999`, `exit 1`. `.claude/skills` at `5cfd2b08` (ref stated): `14 checked, 6 stale`, the six the plan names (`FORMAT_GROUPS`, `downloadAllZip`, `ensureTypeFonts` in app.js; `brandKit` line 237 of model.mjs; `downloadBrandKitMcp` line 6565; `setGeomTokenOverride`) | 🟢 |
| U9-5 | `0`, `0`, `0`, `ok    tests: baseline N, test/run.mjs TESTS N` | `0`, `0`, **`1`**, `ok    tests: baseline 54, test/run.mjs TESTS 54`. Control: `source: () => 16` through the second grep prints `1` | 🔴 F1 |
| P1 | `✓ all N test files passed`, N = TESTS, run.mjs unchanged, tree clean | `npm test` exit 0, `✓ all 54 test files passed`, TESTS `54`, `git status --short` `0` after | 🟢 |
| P2 | build green, `stale total: 0` | build not run (no `node_modules`). Check: `ok    ui.html: baseline 4137.0 KB, tree 4137.0 KB`, `stale total: 1` (`STALE time test`, also present at 1099acd3, outside U9) | 🟡 carried, not U9's |
| P3 | no added U+2014 | added prose lines with the glyph: `0` | 🟢 |
| P6 | no history ids added to prompt files | the unit touches no prompt file (`git diff 1099acd3 HEAD -- .claude plugin docs/reference/SKILL.md` empty) | 🟢 |

## Comment and doc claims checked against code

| Claim | Check | Holds |
|---|---|---|
| app.js imports and calls `ensureTypeFonts` and does not define it | `src/ui/app.js:53` import, `:1441` call; the skill cites `src/ui/app-helpers.mjs` at head | yes |
| `typeTokensX` is a family name in prose | `adding-export-formats/SKILL.md:84`; no definition in `type.mjs` | yes |
| `ci.yml` jobs are the lines two spaces in under `jobs:` | keys `build-test`, `panda-smoke`, `corpus-contrast`, `sweeps`, `deploy`; the comment lines inside `jobs:` are indented and do not stop the scan | yes |
| `(`dimension` (`px`))` parentheticals are skipped | `geometry-system/references/rubric.md:16` falls into the bare-name skip | yes |
| "U9 itself changes only `test/repo/citations.mjs`, which no generator inlines" | tree clean after `npm test`, which runs every generator | yes (as code; the unit also changes `.sdlc/baseline.md`, a record) |
| Handoff line 10: main is seven records-only commits ahead, citations.mjs identical | `git log 1099acd3..origin/main` `7`; non-`.sdlc/` files changed `0`; `git diff 1099acd3 origin/main -- test/repo/citations.mjs` empty | yes |
| Correction figure 4130.3 at `5cfd2b08`, 4137.0 at 1099acd3 and head | string-length measure above | yes (F7 wording) |

## To clear

1. The handoff's U9-5 row: the plan's full command at `$B` and at 1099acd3, printing `.sdlc/baseline.md`, with both causes named.
2. The Orchestrator rules U9-5 leg 3 (plan amendment or accepted deviation). F2 to F7 are optional follow-ups.
