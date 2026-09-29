PASS

# prompt-audit U9 review, pass 1 round 2 (#758)

Head `f727a9d8` on `unit/pa-U9` (fix commit over the revision 21 merge `915e6849`). `$B` = `5cfd2b08` (`git merge-base origin/main HEAD`). Negative controls ran in a clone of the head at `$CLAUDE_JOB_DIR/tmp/pa9r2neg`, restored with `git checkout` after each edit (`git status --short` `0` at the end). F2, F3, F4 and F6 are out of scope for this round (follow-up issue).

verdict: 🟢

## Round-1 findings

| # | Round 1 | Fix at f727a9d8 | Status |
|---|---|---|---|
| F1 | U9-5 leg 3 printed `1` (`.sdlc/baseline.md`); handoff row used a different command | Plan revision 21 (`fa17369a`) scopes leg 3 to `test/run.mjs`. The handoff's U9-5 row now states the revision 21 command and its outputs at head, and the `$B` side (`want` `0`, typed-number grep `0` on `5cfd2b08:test/repo/citations.mjs`, both rechecked) | 🟢 |
| F5 | boolean pins printed `false`; H5 needle printed with a doubled backtick; `NUM_WORDS` plain-object lookup | `Object.hasOwn(NUM_WORDS, ...)` guards the lookup. The hueSpace pin returns the held string when it differs; the H5 pin returns `{ named, jobs }`. The H5 needle is `panda-smoke` without backticks, so the ✗ line reads `` `panda-smoke` `` | 🟢 |
| F7 | "length over 1024" ambiguous | baseline Correction reads "string length over 1024" | 🟢 |

## Criteria rerun at f727a9d8

| Id | Expected | Measured | Status |
|---|---|---|---|
| U9-1 | `1`+, pass line `+ 11 fact pins`, `exit 0`, `1` | `3`; `✓ citations: parser self-test + STALE 0 across 10 discovered docs + 11 fact pins (HEAD f727a9d8)`; `exit 0`; `symbol homes: 27 checked, 0 stale` (1 line). Control: 1099acd3's gate prints `+ 6 fact pins` | 🟢 |
| U9-2 | each doc edit `exit 1`, `1` ✗ naming doc and pin; green at the parent | a to e each `exit 1 ✗=1`, naming type-scale `fifteen voices`, adding-export-formats `ten colour formats`, color-math `"oklch"` on the `DEFAULT_CONTROLS.hueSpace` line, maintaining-brand-kit-mcp `list_palettes (16)`, rubric.md `panda-smoke` on the H5 line. Under 1099acd3's gate all five `exit 0 ✗=0` | 🟢 |
| U9-3 | each source edit `exit 1` with a ✗ naming the source; green at `$B` | (a) stub of 11: two ✗ on `src/engine/type.mjs`, `holds 11`; (b) `["json", "JSON"]` removed: two ✗ on `src/ui/overlays/drawer.js`, `holds 9`; (c) `cam16`: ✗ on `src/engine/tonal.js`, `the code holds "\"cam16\""`; (d) one `defaults` entry popped: ✗ on `role-table.json`, `holds 15`; (e) `panda-smokeX:`: ✗ on `.github/workflows/ci.yml`, `holds {"named":[...,"panda-smoke",...],"jobs":[...,"panda-smokeX",...,"deploy"]}`. Each `exit 1`. Under `$B`'s gate c, d, e `exit 0 ✗=0` | 🟢 |
| U9-4 | `N checked, 0 stale` N ≥ 14; wrong home reds; floor reds; `$B` skills `6 stale` | `27 checked, 0 stale`. Wrong home: `✗ ...SKILL.md:93 \`FORMAT_GROUPS\` is not defined in src/ui/app.js`, `27 checked, 1 stale`, `exit 1`. Floor 999: `✗ test/repo/citations.mjs: symbol homes: only 27 citations read, below SYMBOL_HOME_FLOOR 999`, `exit 1`. `.claude/skills` at `5cfd2b08`: `14 checked, 6 stale`, the six the plan names | 🟢 |
| U9-5 (rev 21) | `0`, `0`, `0`, `ok    tests: baseline N, test/run.mjs TESTS N` | `0`, `0`, `0`, `ok    tests: baseline 54, test/run.mjs TESTS 54`. Controls: `source: () => 16` makes the second grep print `1`; a 55th TESTS entry makes the check read `STALE tests: baseline 54, test/run.mjs TESTS 55` | 🟢 |
| P1 | `✓ all N test files passed`, tree clean | `npm test` in the worktree (0 suites running before), `exit 0`, `✓ all 54 test files passed`, `git status --short` `0` after | 🟢 |
| P2 | `stale total: 0` | `ok    ui.html: baseline 4137.0 KB, tree 4137.0 KB`; `stale total: 1` is `STALE time test`, present at 1099acd3, outside U9 | 🟡 carried, not U9's |
| P3 | no added U+2014 | added lines in `126ca889..f727a9d8` carrying it: `0` | 🟢 |

## Pin controls after the F5 change

Every pin still goes red with a ✗ naming its source when its source changes. Beyond the five U9 pins above, the three older boolean pins were rerun against the new `held !== true` path:

| Pin | Edit | ✗ line |
|---|---|---|
| colorMode states | `this.colorMode = "light"` in app.js | `src/ui/app.js: ... says \`system\` but the code holds false`, `exit 1` |
| btn home | `export const btnX` in app-helpers.mjs | `src/ui/app-helpers.mjs: ... says \`app-helpers.mjs\` but the code holds false`, `exit 1` |
| delete mode methods | `deleteGeomModeX(id)` in geometry.js | `src/ui/sections/{typography,geometry}.js: ... but the code holds false`, `exit 1` |

## New findings

| # | Severity | Finding | Evidence |
|---|---|---|---|
| N1 | 🟡 Low | The hueSpace pin JSON-encodes a string that already carries quotes, so the ✗ reads `holds "\"cam16\""`. It names the value (F5's point) but escapes it twice; returning the bare `hueSpace` would read `holds "cam16"` | U9-3 (c) above |
| N2 | 🟡 Low | The pre-existing `delete mode methods` pin still prints its needle with doubled backticks (``` ``deleteTypeMode`/`deleteGeomMode`` ```), the F5 shape on a pin U9 did not add; the message format is 1099acd3's | the delete-mode control above |
| N3 | 🟡 Low | The handoff does not record the fix round: no row for the F5/F7 edits, and its criteria heading still reads head `441c66e6`. The commit message names them, and this record carries the reruns at f727a9d8 | `grep -n 'F5\|hasOwn' .sdlc/handoffs/prompt-audit-U9.md` empty |

None blocks. N1 to N3 can ride the F2/F3 follow-up issue.
