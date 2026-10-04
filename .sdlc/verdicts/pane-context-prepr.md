---
kind: verdict
plan: pane-context
unit: prepr
seat: verifier
pass: 4
ticket: "#785"
written: 2026-10-04
---

# pane-context prepr · pass 4 · 🟢 at `06f7f553`

verdict: 🟢
sha: 06f7f553bba9aaea1570648bf1d0abfcf2ac6422
version: n/a (a plan landing, no release)

Pre-land record pass 4 for `plan/pane-context` (draft PR #797) at `06f7f553`, against C1.* to C7.* (plan revision 16), the unit verdicts U1 to U7, and the request `.sdlc/handoffs/pane-context-prepr-request.md`. Pass 3 (🔴 at `94bcd8aa`) is overwritten here; its history is in git.

The pair is `pane-context-prepr-reviewer-l3-p4` (reviewer-l3, opus, `FAIL` on comments only) and `pane-context-prepr-verifier-l2-p4` (verifier-l2, opus, all rows 🟢). It stands in for the adapter's reviewer-l4 plus verifier-l3 under R86/R92, since no Fable seats run while it is capped. U4, U5 and U7's checks share or cross the builder family as stated in pass 3 and the U7 record.

Grading policy: the owner ruling in `.sdlc/questions/ceremony-policy.md` (Q1, 2026-10-04, owner via AskUserQuestion, commit `18b8ea48`) applies. In pre-land only code or behavior findings block; doc, comment and wording findings go here as follow-ups and the verdict stays 🟢.

Preflight: `verdict.py check` exits 0 on the request. Since `94bcd8aa`, only U7's files moved outside `.sdlc/`, and the merge into main is clean (`git merge-tree --write-tree origin/main 06f7f553` rc 0). Load was 34 to 175 throughout, so no row is a timing row.

The reviewer's FAIL is one class: three live comments this diff made false. The seat confirmed them (below). Under the owner policy they are a comment-only follow-up and do not block. No code or behavior finding was raised by either seat. Every gate, check and sweeps leg is green, each with a planted control that went red.

## Rows

| Criterion | State | Evidence | Negative control |
|---|---|---|---|
| Pass 3 blocker (`tonal.js:109-110`) closed | 🟢 | `git show 06f7f553:src/engine/tonal.js` `:109-111` says `palette.chroma` is the chroma the ramp is rendered at, always 100 below the `:946` re-entry, with `dampStops` applying the group value after. All three `hueAnchorFrac` callers (`:830`, `:972`, `:1390`) are reached only through `:947` and `:949` (reviewer, and this seat's U7 record) | `git show 94bcd8aa:src/engine/tonal.js \| grep -c 'absolute group target'` is `1`, and `0` at head |
| "group target" class sweep | 🟢 | `git grep -niE 'group[ -]?target\|group-resolution\|groupIntended\|absolute group' 06f7f553`: the reviewer's own sweep gave 11 live hits, all true against the code or dated history. The worker's wider sweep gave 7, with no live false claim | the sweep hits `94bcd8aa:src/engine/tonal.js:109`, so it catches the old text |
| Live comments true at head (stale-record class) | 🟡 | Comment-only, follow-up per the owner policy. `typography.js:528-529` says the specimen "paints in the canvas preview scheme (var(--ink*) flips with the area's color-scheme)", and `headless-boot.mjs:2658-2659` (ty-cmp) and `:2887-2888` (geo-cmp) say "one column per breakpoint mode ... (mirrors Color's \"Both\")". The diff removed the `.canvas-area.canvas-scheme-*` rules and the "Both" mode, and the assertions just below (`:2666`, `:2894`) check `2 * nT` columns. Geometry's twin comment was fixed in this diff | `git show origin/main:src/ui/styles.css \| grep -c 'canvas-area.canvas-scheme'` is `2`, against `0` at head, so the comments were true before this diff. `git grep -nE "area's color-scheme\|Color's \"Both\"" 06f7f553 -- src test` prints the two source hits |
| Spec AC-006 tone-delta range | 🟡 | Wording, follow-up. `spec-muted-base-key-spikes.md:443-444` gives "0.177 to 0.200" without naming the stop set. This seat's probe and the reviewer's match it on the 19 display `STOPS`, but the reviewer reads `0.212` on the 25 `EXPORT_STOPS` (perceptual, g 60) | this seat's probe at `96409def` and `9f43f3fe` reads the same 19-stop values; the `group-chroma-damper` (v) gate, the actual bound, reds under a tone mutation (`2020/3200 rows off`, U7 record) |
| `npm test` | 🟢 | Worker clone a: `✓ all 54 test files passed`, rc 0, porcelain 0. Reviewer's clean clone: the same | peak dropped from the `:947` check: `✗ 3/54 test file(s) failed`, rc 1; restored |
| `npm ci && npm run build` | 🟢 | Worker clone d: ci rc 0, build rc 0, `wrote figma/plugin/ui.html 4170.9 KB`, porcelain 0 | TS2322 planted in `src/main.ts`: `Found 1 error`, rc 1; restored |
| `npm run smoke` | 🟢 | `SMOKE PASS, gallery · category · editor · export dialog all render in a real browser`, rc 0 | element renamed at `app.js:2605`: `SMOKE FAIL (3)`, rc 1; restored |
| panda-smoke | 🟢 | `node scripts/smoke-panda.mjs`: `smoke-panda: PASS, 7/7 assertions held.` | `exportRadixModule` short-circuited: `FAIL, missing: --colors-accent-9, ...`, rc 1; restored |
| `.sdlc/checks/*` and ceiling-counts | 🟢 | All rc 0: `baseline-agrees` `stale total: 0`, `card-amendment` `stale total: 0`, `card-source-range` `range mismatches: 0`, `doc-drift-rows` `bad 0`, `verdict-frontmatter` `bad 0`, `ceiling-counts: clean` | each planted red then restored: `stale total: 1`, `ceiling-counts: 1 failure(s)`, `bad 1`, `range mismatches: 54`, `bad 1`, `stale total: 2` |
| em-dash and branding | 🟢 | `em-dash: clean (1202 files scanned)`, `branding: clean (1194 files scanned)` | a planted U+2014 gave `FAIL: 1 em dashes`; a planted retired-maker token gave `FAIL: 1 branding violation(s)` |
| CI sweeps legs | 🟢 | All rc 0, all FULL: corpus-tonal `PASS` (343 documents, 3780 palettes), corpus-anchor `PASS (FULL)`, sweep-prime `PASS`, corpus-reset `HEADLESS BOOT PASS`, corpus-contrast `PASS`, mode-isolation `match fixture`, even-dips `PASS`, chroma-envelope `pass` | FULL plants: chroma-envelope `26 of 27 cells rose`, even-dips `124 dips ... FAIL`, mode-isolation `do not match fixture`, contrast `FAIL: 337 gate failure(s)`. SAMPLED plants: tonal `FAIL: 5`, anchor `FAIL: 3`, prime `FAIL: 1`, reset `✗ (rst-corpus-ramp) 91 of 91`; all restored |
| Diff since pass 3 is comment-only | 🟢 | `git diff -U0 94bcd8aa 06f7f553 -- src test scripts` (less `describe-mcp-assets.js`), minus header, comment-marker and blank lines, prints nothing | `export const PLANTED = 1;` appended to `tonal.js`: the same pipeline prints it |
| Contract invariants and R98 | 🟢 | Reviewer: `semantic.js`, `role-table.json` and `code.js` untouched; `html:` count `12` (6, 3, 3); `CURRENT_SCHEMA_VERSION = 7` on main and head; no added font-family, `<path` or fill line; zero live hits for `canvasTheme`, `colorMode`, `_schemeOverride` and the three removed buttons; R98 none found | the `(scheme-ctx)` probe at `headless-boot:4281-4308` requires zero scheme reads outside a column or wrapper, so a stray read reds it |

## Findings

- 🟡 Follow-up, comment-only (owner policy): `src/ui/sections/typography.js:528-529`, `test/ui/headless-boot.mjs:2658-2659` and `:2887-2888` describe the removed canvas preview scheme and Color's "Both". No pixel moves.
- 🟡 Follow-up, wording: spec AC-006 `:443-444` should name the 19 display stops, or widen the range to `0.212` for the 25 export stops.
- 🟡 Report only: four sweeps controls ran the sampled variant of the leg's script (same predicates, fewer cases), because a planted FULL run was too slow under this load. CI on GitHub is the Conductor's.
- Report only, unchanged from the request: the vestigial `palette.chroma / 100` reads below `tonal.js:946` (follow-up issue), the headless-boot `fails` dump, the integrate-question authority, the `decision-records.md:828` in-place edit, and the three U7 out-of-lane finds (`test/engine/anchor.mjs:505`, the SPEC-muted-base card line 4, the spec REQ-007 banner).
- User-visible changes, all in the CHANGELOG, as pass 3 listed: kits saved below group 100 load muted (no migration); a stored canvas pref is ignored; Breakpoint Compare renders 2 x (1 + modes) columns; mapping and token tables carry no scheme; Adia and other sub-100 presets moved.
