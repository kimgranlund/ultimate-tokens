---
kind: verdict
plan: docs-repair
unit: U1
ticket: "#751"
branch: unit/dr-U1
base: 282fca8d
grade: verifier-l2 (passes 1 and 2), the evidence runs dispatched by the Verifier seat
pass: 2
written: 2026-09-29
---

# Verdict docs-repair U1 · 🔴 · every plan row passes, but the rewritten ui-plan.md says the Typography and Geometry scenes do not pan or zoom, and they do

verdict: 🔴
sha: 597b4fba81b652beb9cda2726c8b17f84900b7d7

Head `597b4fba`; code commits `15c562ed`, `3d9faa56`, `658c2237`, all in `docs/reference/references/ui-plan.md`. Unit base plan/docs-repair `5d8b1c30`; B `282fca8d` (`git merge-base origin/main HEAD`). Criteria from `5d8b1c30:.sdlc/plans/docs-repair.md`. The evidence run was verifier-l2 (Opus 5.5) in shared clones under the seat's job tmp. `verdict.py check` passes on the handoff, review r2 and the plan, `exit 0` each.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U1-1 | 🟢 | `1`, `1`, Color `3`, Typography `8`, Geometry `8` | the file at `5d8b1c30`: `0 0 0 0 0` |
| U1-2 | 🟢 | doc counts specimen `3`, typeSpecMode `1`, geomMode `1`, compare `3`, renderCompareArea `1`, renderTypeInspector `1`, renderGeomInspector `1`, radius `2`; source `2 3 36 1 3 2 1 1` | the file at `5d8b1c30`: all eight `0` |
| U1-3 | 🟢 | gallery `11`, categor `3`, `CATEGORY_INDEX` in app.js `4` | the file at `5d8b1c30`: `9`, `0` |
| U1-4 | 🟢 | `0`, `2`, `1` | the file at `5d8b1c30`: `2`, `0`, `0` |
| U1-5 | 🟢 | audit `STALE 0`, cite grep `0` | the plan's bare `app.js:1` cite reads `UNDECIDABLE 1`, `exit 0` (see F3); an anchored cite gives `1 STALE/NOFILE citation line(s)`, `exit 1` |
| U1-6 | 🟢 | `0`, `0`, `269` lines | skill lines 57 to 90 pasted in: `Flip to` `1`, `scrollport` `2`, `303` |
| Claim accuracy | 🔴 | `ui-plan.md:42` (from `15c562ed`, per `git blame`) reads `the Typography and Geometry scenes start fit and do not pan or zoom`; the seat counts `wirePanZoom` in `sections/typography.js` `3` (two calls, at `:351` and `:370`) and `sections/geometry.js` `2`; both headers carry zoom buttons and `drag to pan, wheel to zoom` labels | the non-panning views (`_tokensTableArea`, Color's Mapping table) carry `0` `wirePanZoom`, so the count separates the two kinds |
| P1 | 🟢 | fresh clone at the head, no `node_modules`: `✓ all 50 test files passed`, `50`, tree `0` | scrim sed on `role-table.json`: `✗ 1/50 test file(s) failed`, `exit 1` |
| P2 | 🟡 | owed at pre-land: `npm run build`; U1 touches no bundled file | owed |
| P3 | 🟢 | `branding: clean (739 files scanned)`; U1's own raw count `0` | decision-records copied into `.sdlc/verdicts/`: `FAIL: 3 branding violation(s)`, `exit 1` |
| P4 | 🟢 | `0`, `0`, `0`, `0` | four-name fixture `2`; a line appended to `persist.js`: `1` |
| P5 | 🟢 | `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 597b4fba)`, `exit 0` | the `mixinInto` cite bumped to `app.js:1`: `✗ 1 citation gate failure(s)`, `exit 1` |
| P6 | 🟢 | ui-plan.md count `0` (was `2` at `5d8b1c30`: `5 formats`, `5 format tabs`) | the file at `5d8b1c30`: `2` |
| P7 | 🟡 | `H=658c2237`, `ancestor`, `0` | Branch sha stripped: `NO-HEAD`; the Ran table's head `3d9faa56` against the head: `1` (see F2) |

### Findings

- 🔴 F1, false text in the file U1 rewrote. `ui-plan.md:42` says the Typography and Geometry scenes `do not pan or zoom`. Their Specimen, Controls and Compare views call `wirePanZoom` and render zoom controls; only their Tokens tables do not pan. The sentence repeats the stale comment at `app.js:1439` (`type/geom scenes don't pan/zoom`), which sits outside U1's wall. Both reviews passed it.
- 🟡 F2, handoff: the Branch field names `658c2237`, but every Ran figure was measured at `3d9faa56`, and several moved: U1-1 Typography and Geometry `7` to `8`, U1-3 categor `4` to `3`, branding `738` to `739`. The handoff says so itself; every row still passes at the head.
- 🟡 F3, plan: U1-5's written control (a bare `app.js:1` cite) does not bite; it reads `UNDECIDABLE`. Planner's to fix.
- 🟡 F4, `ui-plan.md`: `(and skips the Mapping table)` reads as if Mapping is hidden in `both`; the code renders it once, normally. The Geometry row also omits `when at least one mode exists` for its All item.
- Note: the `app.js:1439` comment is itself stale; outside this plan's U1 wall, worth a follow-up.

## Pass 2 · 🟡 · the pan and zoom sentence is true, all 100 ledger anchors carry their needle in code; three true clauses have no ledger row

verdict: 🟡
sha: 7cdcf423a7fbfb32b60a8c09050a12455644f815

Head `7cdcf423`; the handoff names `4201a242`, and `git diff --name-only 4201a242 HEAD` lists only the handoff and `docs-repair-U1-review-p2.md`. Code commit `8f5153eb`. Plan revision 12 at `1e263b2f`; the U1 rows are byte-identical to the handoff's brief `7cba788a`. The evidence run was verifier-l2 (Opus 5.5) in shared clones under the seat's job tmp, and it opened all 100 ledger anchors. The seat reread `ui-plan.md:39-45` and the `wirePanZoom` call sites itself. `verdict.py check` exits `0` on the handoff and on review p2. P2 (build, smoke) is owed at pre-land.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U1-1 | 🟢 | `1 1 4 8 8` | file at B: `0 0 0 0 0` |
| U1-2 | 🟢 | doc `specimen 3 typeSpecMode 1 geomMode 1 compare 3 renderCompareArea 1 renderTypeInspector 1 renderGeomInspector 1 radius 2`; source `2 3 36 1 3 2 1 1` | file at B: eight doc counts `0` |
| U1-3 | 🟢 | `11 3 4` | file at B: `9 0 4` |
| U1-4 | 🟢 | `0 2 1` | file at B: `2 0 0` |
| U1-5 | 🟢 | `0 0` | an anchored `src/ui/app.js:1` cite: `STALE 1`, `✗ 1 citation gate failure(s)`, `exit 1` (pass 1's F3 control now bites) |
| U1-6 | 🟢 | `0 0 271` | the skill's table-view section appended: `Flip to` `1`, `scrollport` `2` |
| U1-7 | 🟢 | `0 2 2 1` | tree at `597b4fba`: `1 2 2 0` |
| U1-8 | 🟢 | no `NO-LEDGER`, `100` rows, `0` failing | at `597b4fba`: `NO-LEDGER`; a six-row fixture: `3` failing, including a comment anchor `0 present src/ui/sections/color.js:868` |
| F1 sentence | 🟢 | `ui-plan.md:42-44`: `reset to `fit` on entry and pan and zoom like Color's (the same `wirePanZoom` shell); only the Tokens tables ... scroll`; `this.wirePanZoom(area)` at `typography.js:351`, `:370`, `geometry.js:423`, `:442`, `color.js:884`, `:944`, and nowhere else; the Tokens views return `_tokensTableArea` first (`typography.js:341`, `geometry.js:413`); the scroll is `styles.css:671` `overflow: auto` | pass 1's text `do not pan or zoom` against the same six call sites |
| P1 | 🟢 | fresh clone, no node_modules: `✓ all 50 test files passed`, `exit 0`, TESTS `50`, tree `0` | scrim sed: `✗ 1/50 test file(s) failed`, `exit 1` |
| P3 | 🟢 | `branding: clean (742 files scanned)`; U1's diff adds `0` U+2014 lines | one dashed prose line in `ui-plan.md`: count `1` |
| P4 | 🟢 | `0`, `0`, `0`, `0` | four-name fixture: `2` |
| P5 | 🟢 | `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 7cdcf423)`, `exit 0` | a bumped `mixinInto` cite: `✗ 1 citation gate failure(s)`, `exit 1` |
| P6 | 🟢 | `10`, `10`, all U2's files, `ui-plan.md` none | at B `ui-plan.md` carried `2` (U1-4's control) |
| P7 | 🟢 | `H=4201a242`, `ancestor`, `0` | Branch set to `8f5153eb`: `3` |
| P8 | 🟢 | `H=4201a242`, `HAS-RAN`, `diff 0` | Branch set to `597b4fba`: `1c1`, `33,34c33,34` and more, `diff 1` |

Pass 1 findings: F1 🟢 fixed and true against code. F2 🟢 fixed (Branch names `4201a242`, P8 `diff 0`). F3 🟢 fixed by the planner's control. F4 🟢 fixed: the Mapping view falls through `color.js:870` and renders once, its table shows both modes at `color.js:1367`, `:1380`, `:1381`; Geometry's All item is conditional at `geometry.js:225`.

### Findings

1. 🟡 V1. Three true clauses have no ledger row: `is ui-session state` (`ui-plan.md:39`; `grep -c section src/ui/persist.js` prints `0`), `The document persists per set` (`:67`; `app.js:65`, `:1156`), and `like Color's` (`:42`; `color.js:884`, `:944`). The first two are absent from the re-diagnosis table too.
2. 🟡 V2. Two true clauses sit on anchors that do not show them: C12 `already shows both modes` on `color.js:870` (the code is `:1367`); C6 `scroll instead` on the class string at `app.js:1759` (the scroll is `styles.css:671`).
3. 🟡 V3 (plan). U1-8 checks anchors, not coverage: a missing sentence or a weak anchor passes with `0` failing.
4. 🟡 V4 (plan). P8's "with the cell escape removed" is ambiguous where `\|` is regex; the builder's reading keeps the rows' meaning and `diff 0` holds.
5. Note. `ui-plan.md` carries `27` U+2014 lines inherited from the base (`28` there); they clear at the pre-land merge of main, where the em-dash gate lives.

Cleared to merge.
