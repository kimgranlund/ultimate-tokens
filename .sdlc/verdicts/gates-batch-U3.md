---
kind: verdict
plan: gates-batch
unit: U3
ticket: 776
branch: unit/gb-U3
base: ddeddfbd
grade: L2
pass: 2
written: 2026-09-30
---

# gates-batch U3 verdict, pass 2 (rework 1)

verdict: 🟡
sha: cf0da74ae2fb8a07a50430b2e5534c1b0408f8a7

Checker: verifier-l2 (opus) outside the sonnet builder family (R79). Graded by plan revision 4 (943d4b08). Every control ran in a throwaway clone at the named sha. Where a row names the origin/main merge base, both `17edb2d2` and the unit base `ddeddfbd` were run, and the readings were identical. Spot-checked here: `git check-attr diff` on the binder `code.js` reads `diff: unset`; the `--text` comment-only count is `0`; `node test/figma/binder.mjs` ends `PASS`; a fourth `GEOMETRY_FIELD_RENAME_MAP` exists at `figma/binder/mode-apply-plan.mjs:357`.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U3-1 declared and green | 🟢 | `node test/figma/binder.mjs` exit 0, last line `PASS: figma-plugin clears its checkable [gate] predicates`; `grep -c '"renameparity"'` prints `7`; `grep -c 'const DECLARED = .*"renameparity"'` prints `1` | removed `"renameparity"` from `DECLARED` (grep then `0`): exit 1, `FAIL  report-static, a FAIL(...) call site uses gate name "renameparity", which is not in the REPORT block's declared list` |
| U3-2 binder map drift reds | 🟢 | plant `legal: "tiny"` to `legal: "label"` in binder `LIBRARY_TYPE_VOICE_MAP`: `FAIL  renameparity, LIBRARY_TYPE_VOICE_MAP drifted between the binder and figma/binder/migrations.mjs (...)`, `exit 1` | same plant at `8945c618`: `exit 0`, only `pass  report-static`-style rows, no FAIL |
| U3-3 rename list drift reds | 🟢 | drop `"Color Modes"` from binder `SEMANTIC_RENAME_FROM`: `FAIL  renameparity, SEMANTIC_RENAME_FROM drifted between the binder and figma/binder/migrations.mjs (["Color Semantic"] vs ["Color Semantic","Color Modes"], ...)`, `exit 1` | same plant at `8945c618`: `exit 0` |
| U3-4 flagship field map drift reds | 🟢 | `radius: "pill-radius"` to `radius: "radius"` on `var GEOMETRY_FIELD_RENAME_MAP` in `figma/plugin/code.js`: `FAIL  renameparity, GEOMETRY_FIELD_RENAME_MAP drifted between the flagship and figma/binder/migrations.mjs`, `exit 1` | same plant at `8945c618`: `exit 0` |
| U3-5 missing constant is a FAIL | 🟢 | `perl -pi -e 's/\bGEOMETRY_FIELD_RENAME_MAP\b/GEOMETRY_FIELD_RENAME_MAP2/g'` on the binder: `FAIL  renameparity, binder is missing GEOMETRY_FIELD_RENAME_MAP`, `exit 1` (plus expected `floatparity` fallout, the executor body names the constant) | the plant itself is the control against an undefined-vs-undefined pass; `grab()` returns `{ missing: true }` on zero matches (binder.mjs:823), and at `8945c618` there is no gate at all (`exit 0` on U3-2 to U3-4 plants) |
| U3-6 canonical side is migrations.mjs | 🟢 | `grep -c 'figma/binder/migrations.mjs' test/figma/binder.mjs` prints `3`; import line content `import { FIGMA_MIGRATIONS, LIBRARY_TYPE_VOICE_MAP, GEOMETRY_FIELD_RENAME_MAP } from "../../figma/binder/migrations.mjs";` | U3-2 plant applied to `migrations.mjs` instead: `exit 1`; with FAIL's first-per-gate dedup lifted in the clone, both `RP> renameparity: LIBRARY_TYPE_VOICE_MAP drifted between the binder ...` and `... between the flagship ...` fire |
| U3-7 lockstep comments and README name the gate | 🟢 | `grep -c renameparity figma/README.md figma/binder/migrations.mjs figma/binder/figma-semantic-binder/code.js` prints `1`, `2`, `3` | at base `ddeddfbd` the same files have no `renameparity` (the unit diff adds every hit: `git diff --text ddeddfbd..HEAD` shows each as a `+` line); plan's recorded `0`,`0`,`0` |
| U3-8 code.js/migrations.mjs changes are comment lines only | 🟡 | plan command prints `0` on both bases, but vacuously for code.js (`git check-attr` shows `diff: unset`); with `git diff --text ... \| grep -avcE '^[+-]\s*//'` it prints `0` over `11` changed lines on both bases | plant (code line with trailing comment on `const GEOMETRY_FIELD_RENAME_MAP`, plus `"Color Prime"` to `"Color PrimeX"`), committed: `--text` form prints `4`; the plan's literal command still prints `0` (F1) |
| Rework fix: comment decoy | 🟢 | binder with a `// const LIBRARY_TYPE_VOICE_MAP = {true map};` line above the real declaration drifted to `heading: "DRIFT"`: rework gate `e2a95903` and head `cf0da74a` both `exit 1`, `LIBRARY_TYPE_VOICE_MAP drifted between the binder ... {"heading":"DRIFT",...}` | same plant against pass-1 gate `4d58a37d`: `exit 0` (unanchored regex read the comment) |
| Rework fix: key order | 🟢 | binder `LIBRARY_TYPE_VOICE_MAP` with `ui` and `heading` swapped (same entries): head `exit 1`, `drifted ... ({"ui":"ui-control","heading":"headline",...}` | same plant at `4d58a37d`: `exit 0` (pass 1 sorted keys) |
| Rework fix: floor | 🟢 | migrations `"Color Roles": []` and binder `const SEMANTIC_RENAME_FROM = [];`: head `exit 1`, `canonical SEMANTIC_RENAME_FROM in migrations.mjs is empty (floor: non-empty)` | same plant at `4d58a37d`: `exit 0` |
| Rework fix: duplicate declaration | 🟢 | second drifted `var GEOMETRY_FIELD_RENAME_MAP = {... radius: "radius" };` after flagship line 549: head `exit 1`, `flagship declares GEOMETRY_FIELD_RENAME_MAP 2 times` | same plant at `4d58a37d`: `exit 0` (read the first line only) |
| Rework fix: per-name try | 🟢 (F3) | binder `SEMANTIC_RENAME_FROM = [SEMANTIC_COLLECTION.replace("Roles", "Semantic"), "Color Modes"]` (valid in the file, throws in `new Function`) plus flagship radius drift, dedup lifted: head reports `could not load/compare SEMANTIC_RENAME_FROM in the binder: SEMANTIC_COLLECTION is not defined` AND `GEOMETRY_FIELD_RENAME_MAP drifted between the flagship ...` | same plant at `4d58a37d`: one message `could not load/compare the rename constants: SEMANTIC_COLLECTION is not defined`, flagship drift never compared (both `exit 1`) |
| Gate truth: copies agree today, each copy's one-entry drift reds naming it | 🟢 | `node $S/agree.mjs` at head: `SEMANTIC_RENAME_FROM` equal in migrations and binder; `LIBRARY_TYPE_VOICE_MAP` and `GEOMETRY_FIELD_RENAME_MAP` byte-equal JSON in migrations, binder, flagship. No copy exists in `src/engine/` (`git grep` finds none; the three homes are binder `code.js`, flagship `figma/plugin/code.js`, `migrations.mjs`) | one-entry drifts, each `exit 1` naming the copy: binder GFRM `gap` -> `drifted between the binder`; binder LTVM (U3-2); binder SRF (U3-3); flagship LTVM `code` -> `drifted between the flagship`; flagship GFRM (U3-4); migrations SRF `"Color Modez"` -> `... and figma/binder/migrations.mjs (... vs ["Color Semantic","Color Modez"])`; migrations LTVM (U3-6) |
| C1 npm test green, N unchanged | 🟢 | clone at head, no `node_modules`: `npm test` exit 0 in 171 s, `✓ all 54 test files passed`, `▶ figma/binder.mjs pass`; `git status --short \| wc -l` prints `0` | `"scrim` to `"scrimX` in `role-table.json`: `node test/engine/semantic.mjs` exit 1, `FAIL  refs-canonical, ordered key set != canonical` |
| C2 no em-dash | 🟢 | `node test/repo/em-dash.mjs \| tail -1`: `em-dash: clean (1017 files scanned)`, exit 0 | `printf '\xe2\x80\x94' >> .sdlc/plans/gates-batch.md`: exit 1, `✗ .sdlc/plans/gates-batch.md:206` |
| C3 no test file added, baseline untouched | 🟢 | `git diff --name-only <base>..HEAD -- test/run.mjs .sdlc/baseline.md \| wc -l` prints `0` on `17edb2d2` and `ddeddfbd` | committed `echo x >> test/run.mjs`: prints `1` |
| C4 chroma-envelope lane untouched | 🟢 | same command over `tonal.js hct.js okhsl.js model.mjs test/engine` prints `0` on both bases | committed appends to `src/engine/hct.js` and `test/engine/semantic.mjs`: prints `2` |
| C5 src changes are comments / generated only | 🟢 | name list `src/ui/figma-plugin-assets.js` on both bases (generated; its diff is the one embedded binder `code:` string line); both comment-stripped `wc -l` print `0`; tree clean after the full `npm test` (C1), so its bytes are generator output | hand edit `// hand edit` appended to `figma-plugin-assets.js`, committed, then `gen:figma-assets` (`gen-figma-binder-code.mjs && gen-figma-assets.mjs`): `M src/ui/figma-plugin-assets.js` (dirty, reds); `const C5_PLANT = 1; // c` in `type.mjs`: `wc -l` prints `2`; appending to `src/ui/app.js` puts a third path in the name list |

## Findings

1. 🟡 The U3-8 plan command cannot fail for the binder. `.gitattributes` sets `diff: unset` on `figma/binder/figma-semantic-binder/code.js`, so `git diff` prints `Binary files ... differ` and a committed code-line plant still reads `0`. The row is met only on the `git diff --text` form (`0` of 11 changed lines at head, `4` with the plant). The plan row needs `--text` so a pre-land rerun is not vacuous.
2. 🟡 Out of lane, live gap: a fourth hand copy, `export const GEOMETRY_FIELD_RENAME_MAP` at `figma/binder/mode-apply-plan.mjs:357`, is not read by `renameparity`. With a one-entry drift planted there, `binder.mjs`, `plugin.mjs`, `migrations.mjs`, `mode-apply.mjs` and `live-diff.mjs` all exit 0. P10 does not name it. Candidate follow-up issue: gate it or delete it.
3. `FAIL` keeps the first message per gate (`test/figma/binder.mjs:22`). The per-name try changes which message shows, not the exit code, and when two copies drift at once only the first is named.
4. The flagship leg overlaps `libraryparity` in `test/figma/plugin.mjs:1871,1876`. They agree; the redundancy is harmless.
5. The comment-decoy fix is confirmed: the planted decoy exits `0` on the pass-1 gate `4d58a37d` and `1` on `e2a95903` and head. Key order, floor and duplicate-declaration controls split the same way.
6. Process: plan revision 4's C5 change was not re-reviewed for checkability, and it keeps the comment-strip rewrap flaw from checkability pass 4. It read `0` here.
7. C1 wall time was 171 s, above the band, with concurrent verifier suites running.
