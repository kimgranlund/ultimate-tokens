---
kind: verdict
plan: docs-repair
unit: U1
ticket: "#751"
branch: unit/dr-U1
base: 282fca8d
grade: verifier-l2, the evidence run dispatched by the Verifier seat
pass: 1
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
