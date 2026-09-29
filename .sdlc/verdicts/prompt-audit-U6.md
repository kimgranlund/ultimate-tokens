---
kind: verdict
plan: prompt-audit
unit: U6
ticket: "#758"
branch: unit/pa-U6
base: 13346c1a
grade: verifier-l2, the evidence run dispatched by the Verifier seat
pass: 2
written: 2026-09-29
---

# Verdict prompt-audit U6 · 🔴 · every plan row holds, but the semantic-roles skill says ROLES derives, its count search finds nothing, and a false line pin remains

verdict: 🔴
sha: 60fd46689852da3f97bc0d641daeaf47943ed83d

Head `60fd4668`; code commits `5ca1ffe4`, `91b6f571`, `60fd4668`. Unit base plan/prompt-audit `f6cd69cb`; B `13346c1a` (`git merge-base origin/main HEAD`). Criteria from `bee7574d:.sdlc/plans/prompt-audit.md` (revision 7). The evidence run was verifier-l2 (Opus 5.5) in shared clones under the seat's job tmp; the seat reproduced the three 🔴 rows itself at the head. `verdict.py check` passes on the handoff, review r2 and the plan, `exit 0` each.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U6-1 | 🟢 | `0 2 0 1 1 1` | at B: `4 0 3 0 1 1` |
| U6-2 | 🟢 as written | `1 1 0 1 0 1 2 1` | at B: `0 0 2 0 2 1 2 1`; the row has no needle for other `:NNN` pins, so it misses the pin in the Pins row |
| U6-3 | 🟢 | `0 0 3 1`; the three `37` hits are the live "36 vs 37" guidance | at B: `1 1 1 1` |
| U6-4 | 🟢 | `0 0 0 0 0` | at B: `4 2 5 6 2` |
| U6-5 | 🟢 | `1 1 1 2 1 1` | a copy with the `MCP_BRAND_KIT_VERSION` lines dropped prints `0`; with the `"oklch"` lines dropped, `0` |
| SB1 to SB7, SB11 to SB23 | 🟢 | each rewritten claim read against source: caret `round(3.5*h^0.39)`, `CONTROL_FONT`, `GAP_UNIT`, `paddingNarrow`/`paddingWide` (live `geomScale` paddingWide `4.5/6/7.5/11/16/23`), caret < font asserted, `FORMAT_GROUPS` and `downloadAllZip` defined in `drawer.js`, Colors group `10`, `hueSpace: "oklch"`, `hydrateStoredDoc` stamps `cam16`, `chromaEnvelope(stop, anchorStop, lift, controls)` | a definition scanner at B flags `FORMAT_GROUPS` and `downloadAllZip` in `app.js` as stale |
| SB8 | 🔴 | `adding-semantic-roles/SKILL.md` step 5: `Some tests derive the count (semExpect, headless-boot's ROLES) and need no edit`; `test/ui/counts.mjs` reads `export const ROLES = 53;`, a hand literal its header calls `kept independent of the engine's own source of truth`, imported by `headless-boot.mjs` and read by `(s4)` | the step's own search, `git grep -nE '\b53\b' 60fd4668 -- test`, prints `0` on `git version 2.54.0 (Apple Git-157)`; `git grep -nwE '53'` prints `27` |
| SB9 and the count search | 🔴 | the new recipe `git grep -nE "\b<oldcount>\b"` (SKILL.md step 5, the verify line, the migration line; best-practices.md) prints `0` hits for `53` in `test` | `-w` on the same tree prints `27`, so the recipe finds nothing and the verify line always passes |
| Kept handles | 🟢 | `(#252/#253)` and `(#264)` lines unchanged, diff lines carrying those ids `0`; `(s4)` stays on the `npm test` comment line | a reflow shows as a diff line carrying the id; that count prints `0` |
| Pins | 🔴 | `adding-semantic-roles/references/foundations.md` still cites `test/engine/semantic.mjs:30`; the `scrims.length !== 7` assert is at `:52` | plan step 2 and the Units paragraph drop every `:NNN` pin in U6's files; the grep for `semantic.mjs:30` prints `1` at head and at `f6cd69cb` |
| P1 | 🟢 | fresh clone at the head, no node_modules: `✓ all 53 test files passed`, `exit 0`, tree `0`; `ok    tests: baseline 53, test/run.mjs TESTS 53` | scrim sed on `role-table.json`: `✗ 1/53 test file(s) failed`, `exit 1` |
| P3 | 🟢 | `branding: clean (810 files scanned)`, `em-dash: clean (818 files scanned)`, `exit 0`; added U+2014 lines `0` | fixtures: `FAIL: 3 branding violation(s) across 811 files`, `FAIL: 1 em dashes`, both `exit 1` |
| P4 | 🟢 | out-of-wall files `0`, `0`, `0`; the unit's diff is 13 skill files plus U6 records | a fixture path outside the wall prints `3` |
| P5 | 🟡 | every SB1 to SB9, SB11 to SB23 id prints `1`, SB10 `0`; the ERE total prints `27`, not the planned `22` (the round-2 table adds five review rows) | a fixture with SB14 dropped prints `0`; the plan's bare-pipe control errors under BSD grep 2.6.0 (`empty (sub)expression`) instead of printing a count |
| P6 | 🟢 | added history-id lines `0`; removed `23` against `f6cd69cb` | `+the rule (TKT-0010)` prints `1` |
| P2 build | owed at pre-land | `npm run build`; U6 touches no build input | not run |

### Findings

1. 🔴 F1. `adding-semantic-roles/SKILL.md` step 5 says headless-boot's `ROLES` derives the count and needs no edit. It is the literal `53` in `test/ui/counts.mjs`, kept independent on purpose, so a role-count change that follows the skill leaves it at 53 and reds `(s4)`. The handoff repeats the claim. The plan's SB8 row (`(s4)` derives) seeded it, but the text is the unit's.
2. 🔴 F2. The search the unit wrote, `git grep -nE "\b<oldcount>\b"`, finds nothing on this machine's git: `\b` is not a word boundary in its ERE. It appears in SKILL.md step 5, the verify line and the migration line, and in best-practices.md. The step silently misses every literal (the failure SB8 targeted) and the SB9 verify line always passes. `-w` finds `27`.
3. 🔴 F3. A `:NNN` pin remains in a U6 file and is false: `foundations.md` cites `test/engine/semantic.mjs:30`, the assert is at `:52`. The `(line ~N)` approximations beside it and in best-practices.md (knowledge-03) are off too (🟡).
4. 🟡 F4. `geometry-system/references/rubric.md` G7 still says `unless the REF table is updated` for constants `REF` does not hold (caret, `GAP_UNIT`); fixed in best-practices, not in the rubric.
5. 🟡 F5. `geometry-system/references/best-practices.md` cites a `composed.paddingNarrow === standalone.paddingNarrow` assert and a bodyBase assert that do not exist; the test uses JSON equality, which implies the first.
6. 🟡 F6. `adding-export-formats/SKILL.md` step 4, not rewritten by U6, says groups are by destination (`CSS · Frameworks · Design tools`); `FORMAT_GROUPS` groups are Colors, Typography, Geometry, Design System, Project.
7. 🟡 F7. The ds-export import list omits `whiteOklch`, `blackOklch`, `isDataPalette`, `oklchStr`, `EXPORT_SCHEMA_VERSION`.
8. 🟡 F8. `hydrateStoredDoc` is cited by bare filename (`app-helpers.mjs`), so U9's path-shaped scanner will not read it; `src/ui/app-helpers.mjs` would.
9. 🟡 F9. The handoff is stale against the head: it does not name `60fd4668`, runs are "at HEAD 5ca1ffe4", P6 `22` (now `23`), branding and em-dash `807`/`815` (now `810`/`818`).
10. 🟡 F10. Plan defects for the planner: U6 is "twelve files" in the grade table, the wall lists 13; SB8's `(s4)` derives; P5 expects `22` and misses review rows; P5's bare-pipe control errors rather than bites; U6-2 has no needle for leftover `:NNN` pins.

## Pass 2 · 🟡 · every row and every pass 1 finding holds at 87789311; the handoff's measuring sentence reads as B, and two plan cells drift

verdict: 🟡
sha: 877893117b432889ef9985de5f1b5551de4c29e5

Head `87789311`; pass 2 code commits `301f281e` and `ef2115bb`, handoff commits `42aa0d53`, `6cceeccf`, `e1a10b08`. The unit merged plan/prompt-audit (U7's skill files, outside U6's wall, not graded here). B `13346c1a`. Criteria U6-1 to U6-10 from `4fa7561c:.sdlc/plans/prompt-audit.md` (revision 9) and `prompt-audit-U6-rediagnosis.md`. Evidence run verifier-l2 (Opus 5.5) in shared clones under the seat's job tmp; the seat re-ran the `-w` count search (`27` for `53` in `test`) and the `\b` absence (`0`) itself. `verdict.py check` exits `0` on the handoff (against its `60fd4668` copy), review p2, the plan and the re-diagnosis.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U6-1 | 🟢 | `0 2 0 1 1 1` | at B: `4 0 3 0 1 1` |
| U6-2 | 🟢 | `1 1 0 1 0 1 2 1` | at B: `0 0 2 0 2 1 2 1` |
| U6-3 | 🟢 | `0 0 3 1` | at B: `1 1 1 1` |
| U6-4 | 🟢 | `0`, `0`, `0`, `0`, `0` | at B: `4` and `2`, `5`, `6`, `2` |
| U6-5 | 🟢 | `1 1 1 2 1 1` | the `MCP_BRAND_KIT_VERSION` line deleted: `0` |
| U6-6 | 🟢 | `1 0 1 1`; step 5 says `(s4)` reads `ROLES`, a hand literal in `test/ui/counts.mjs` (`export const ROLES = 53;`), and `semExpect` derives from the bundle | the pass 1 sentence restored: second leg `1` |
| U6-7 | 🟢 | the five prescribed recipes, run verbatim on `git version 2.54.0 (Apple Git-157)`: `27 238 63 238 6`; `\b` count `0` | the first recipe typed back to `\b`: `0 238 63 238 6`, then `1` |
| U6-8 | 🟢 | `0`, `1` | at `60fd4668`: `5` (`semantic.mjs:30`, three `(line ~N)`, `exports.js ~504`); at `6cceeccf`: `1` |
| U6-9 | 🟢 | `0 0 2 0 0`, groups `2 1 1 1 1`, imports all present, `1` | the DESTINATION list restored: `1`, `Colors` `0`; a fake import added to ds-export.js: last leg `0` |
| U6-10 | 🟢 | `1 1 1` (`branding: clean (818 files scanned)`, `em-dash: clean (826 files scanned)`, `ef2115bb`) | at `60fd4668`: `0 0 0` |
| SB1 to SB9, SB11 to SB23 | 🟢 | every rewritten claim in the seven changed wall files read true against code: `validPrim`, the `roles` gate's `okScrim` and `scrims.length !== 7`, `export function exportShadcn` with `SHADCN_ORDER` and `MAP`, the 13 ds-export imports equal to its import line, `FORMAT_GROUPS` Colors/Typography/Geometry/Design System/Project, `export function hydrateStoredDoc` in `src/ui/app-helpers.mjs`, the reference `REF` holding `height`, `icon`, `font`, the composition block's `JSON.stringify(composed) === JSON.stringify(base)` | the row controls above |
| P1 | 🟢 | fresh clone, no node_modules: `✓ all 53 test files passed`, `exit 0`, tree `0`; `ok    tests: baseline 53, test/run.mjs TESTS 53` | scrim sed: `✗ 1/53 test file(s) failed`, `exit 1` |
| P3 | 🟢 | `branding: clean (818 files scanned)`, `em-dash: clean (826 files scanned)`, added U+2014 `0` | a copied ADR: `FAIL: 3 branding violation(s) across 819 files`, `exit 1`; a dashed line: `FAIL: 1 em dashes`, `exit 1` |
| P4 | 🟢 | `0`, `0`, `0` | six-name fixture: `3`; a DD row fixture: `1` |
| P5 | 🟢 | the 22 ids each `1`; ERE total `40` = 22 + 18 F rows | SB14 row deleted: `0`, `39` |
| P6 | 🟢 | added `0`; removed `23` over U6's files | `+the rule (TKT-0010)` prints `1` |
| P2 build | owed at pre-land | U6 touches no build input | not run |

Pass 1 fates: F1, F2, F3 (the three 🔴) fixed; F4 to F8 fixed and true; F9 fixed except the wording in F1 below; F10 closed by plan revisions 8 and 9.

### Findings

1. 🟡 F1. The handoff header names the head code commit `ef2115bb`, then B, then says `Every figure below was measured at that commit`, which reads as B (at B the gates print `790` and `798` files, not `818` and `826`). The Ran and per-criterion sections say "at the head code commit", so the figures are recoverable and all reproduce. Say "the head code commit".
2. 🟡 F2 (plan). U6-10's third leg reads the newest commit touching any skill, not U6's wall; a later plan merge carrying U8's skill edit would red a correct handoff. Scope it to the wall.
3. 🟡 F3 (plan). U6-7's Expected cell annotates `27 229 63 229 6`; the head prints `27 238 63 238 6` (records grew). The criterion is `1` or more, so the row stands.
4. Note. The re-diagnosis says `ROLES` is shared with the smoke test; `test/smoke/smoke.mjs` does not import it. The unit did not copy the error. `git grep -nw 53` also hits decimals like `5.53`; the step asks the reader to classify hits, so this is not false.

Cleared to merge.
