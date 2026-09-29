FAIL

# prompt-audit U6 pass 2 review (#758)

Reviewer-l3 stands in for reviewer-l4 while fable is capped, so this opus build is checked inside its own family (b9044bb).

Reviewed unit/pa-U6 @ 6cceeccf (code 301f281e), pass 1 head 60fd4668, B = 13346c1a (`git merge-base origin/main HEAD`). Criteria: U6-1 to U6-10 and P3 to P6 in `.sdlc/plans/prompt-audit.md` at 5e298d22. Every command ran in the unit worktree or a `git clone --shared` copy under the job tmp directory, under bash with `/usr/bin/grep` (BSD) and `git version 2.54.0 (Apple Git-157)`, not the seat shell's ugrep wrapper. Every fact below was read from code.

## Findings

| # | Severity | Finding | Evidence |
|---|---|---|---|
| 1 | 🔴 High | A line approximation survives in the wall, the same class as pass 1's F3. `adding-semantic-roles/references/foundations.md` line 90 cites `exportShadcn` as `exports.js ~504`; `export function exportShadcn` is at `src/engine/exports.js` line 837 (`SHADCN_ORDER` at 811). U6-8's criterion reads "no line pin or line approximation remains in the wall"; its command prints `0` only because `\.[a-z]{2,4}:[0-9]+` and `\(line ~[0-9]+\)` do not match the `file ~N` shape. The line is pre-existing (present at B) in a file this unit edited in both passes. Fix: cite `exportShadcn` in `src/engine/exports.js` with no number | `grep -n -E '~ ?[0-9]{2,}' <wall files>` hits foundations.md:90 (and rubric.md:9 `(~line 433)`, which the plan rules outside the wall and U9's); `grep -n 'export function exportShadcn' src/engine/exports.js` prints `837` |
| 2 | 🟡 Medium | U6-8's needle is narrower than its criterion, so it cannot catch finding 1 (plan defect, the planner's). A widened leg such as `grep -n -E '[a-z]\.[a-z]{2,4} ~[0-9]+'` beside the two existing ones would print `1` at 6cceeccf and `0` after the fix | the fixture that appends `(line ~12)` to foundations.md prints `1`; `exports.js ~504` in the same file prints nothing |
| 3 | 🟢 Low | The handoff carries a literal backspace byte (0x08) inside a code span in the SB9 row: "(`\x08` does not)", where `\b` was meant. Introduced by 42aa0d53. Records only, no gate reads it | `od -c` of the SB9 line shows `` ` \b ` ``; a control-character scan of every file changed against B finds only this one |

## Rows re-run at 6cceeccf

| Row | Got | Expected | Control (run) |
|---|---|---|---|
| U6-1 | `0 2 0 1 1 1` | `0`, `1`+, `0`, `1`, `1`, `1` | not re-run this pass |
| U6-2 | `1 1 0 1 0 1 2 1` | matches | same |
| U6-3 | `0 0 3 1` | `0`, `0`, `2`+, `1` | same |
| U6-4 | `0` and `0`, `0`, `0`, `0` | matches | same |
| U6-5 | `1 1 1 2 1 1` | matches | same |
| U6-6 | `1 0 1 1` | `1 0 1+ 1` | at 60fd4668 `1 1 0 0`; head plus step 5's derive sentence restored: second grep `1` |
| U6-7 | `27 236 63 236 6`, then `0` | five counts `1`+, then `0` | at 60fd4668 `0 0 0 0 0`, `5`; head with the first recipe typed back to `-nE "\b<oldcount>\b"`: `0 236 63 236 6`, `1` |
| U6-8 | `0`, `1` | `0`, `1` | at 60fd4668 `4`, `1`; head plus `(line ~12)`: `1`. Passes as typed, fails as worded (finding 1) |
| U6-9 | `0 0 2 0 0`, groups `2 1 1 1 1`, imports `2 2 2 1 1 1 1 1 1 2 1 2 3`, `1` | matches | at 60fd4668 the plan's figures exactly; head with the DESTINATION list restored: `1` on `by DESTINATION`, `0` for `Colors` |
| U6-10 | `1 1 1` | `1 1 1` | at 60fd4668 `0 0 0` |
| P3 | branding clean (812), em-dash clean (820), added U+2014 lines `0` | matches | not re-run |
| P4 | `0`, `0`, `0` | matches | not re-run |
| P5 | 22 ids each `1`; ERE total `37`; `F<n>` rows `15`; `37 = 22 + 15` | matches | not re-run |
| P6 | added `0`; removed vs B `25`, unit share (`5e298d22..HEAD`) `23` | `0`; share reported | not re-run |

## Every prescribed search, executed

The five `git grep` recipes in `adding-semantic-roles` (SKILL.md 61, 81, 100; best-practices.md 41, 69) were extracted, run with `53` substituted, and print `27 236 63 236 6`; the `\b` form prints `0` on this git. The `37|49` hits are CHANGELOG, decision-records, a 2026-07-17 review and a `model.mjs` comment, all historical. The other searches the wall prescribes also hit: `grep 'semantic roles' src/ui/sections/color.js` finds line 2250; `grep '(geo)' test/ui/headless-boot.mjs` finds `14`. Noted, not a finding: `-w` also matches decimals such as `5.53`, which step 5's "update every role-count hit" already asks the reader to classify.

## Facts checked against code

- `test/ui/counts.mjs`: `export const ROLES = 53;`, header "kept independent of the engine". `headless-boot.mjs` imports it and `(s4)` compares `=== ROLES` (line 727). `test/smoke/smoke.mjs` does not import `ROLES`, as the handoff says.
- `semExpect = expect(bundle["Light_tokens.json"])` in `test/figma/plugin.mjs`: derived.
- `test/engine/semantic.mjs`: `validPrim` (44), `scrims.length !== 7` under `FAIL("roles", ...)` (52), `okScrim` (54). `(z)` in headless-boot exists.
- `test/engine/geometry.mjs`: the reference-ramp `REF` holds `height`, `icon`, `font`; `caret's own ramp` assert (48); control-font ramp assert (177); `JSON.stringify(composed) === JSON.stringify(base)` "value-neutral at defaults" (186); `"UI-control|MD": 17` flows into `MD.font` and leaves `LG` (187 to 189); `GAP calibration` block (200). A second `REF` in the ladder block carries every field; G7 scopes its claim to the reference-ramp block, so it holds.
- `FORMAT_GROUPS` in `src/ui/overlays/drawer.js`: `Colors`, `Typography`, `Geometry`, `Design System`, `Project`.
- `ds-export.js`'s `./exports.js` import: thirteen names, all in the export skill.
- `hydrateStoredDoc` exported from `src/ui/app-helpers.mjs`, stamps `"cam16"` when `hueSpace == null`.

## Handoff figures re-derived at 301f281e

Branding `812`, em-dash `820`, P6 unit share `23`: all match. `npm test` in a clone at 6cceeccf (no other `node test/run.mjs` running): `✓ all 53 test files passed`, exit 0, tree clean after; TESTS `53`, `ok    tests: baseline 53, test/run.mjs TESTS 53`.
