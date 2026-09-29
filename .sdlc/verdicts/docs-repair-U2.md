---
kind: verdict
plan: docs-repair
unit: U2
ticket: "#751"
branch: unit/dr-U2
base: 282fca8d
grade: verifier-l1, the evidence run dispatched by the Verifier seat
pass: 1
written: 2026-09-29
---

# Verdict docs-repair U2 · 🔴 · every criterion holds, but two handoff Ran cells are false at the head they name

verdict: 🔴
sha: be13a2104766aae9e53a0092cb7461a47036aaf4

Head `be13a210`; code commits `4095ddbf` and `e7058994`. Unit base `5d8b1c30`; B `282fca8d` (`git merge-base origin/main HEAD`). Criteria from the plan copy at `5d8b1c30`. The evidence run was verifier-l1 (Opus 5.5) in shared clones under the seat's job tmp; the seat reproduced the 🔴 row itself. `verdict.py check` passes on the handoff and review r2, `exit 0` each.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U2-1 | 🟢 | `5`, `2`, `3`, `0`, `1` (`name: hct-palette-generator-spec`, kept per Q2) | at B: `0`, `0`, `0`, `5`, `1` |
| U2-2 | 🟢 | `1`, `1`, `1`, `ok` | at B: `0`, `0`, `0`, `ok` |
| U2-3 | 🟢 | `spec-draft.md:0`, `acceptance-criteria.md:0`, `quality-rubric.md:0`, then `0` | at B: `:2`, `:1`, `:1`, then `1` |
| U2-4 | 🟢 | nine `1`s, Mode row `1`, rows `42` | at B: nine `0`s, `0`, `33` |
| U2-5 | 🟢 | `this.section=1 canvas-scene=1 seg-example=1 an-card=1 this.view=2 colorMode=1` | at B: all six `0` |
| Handoff Ran table | 🔴 | the handoff says `every row below at e7058994`; its U2-1 cell reads `` `2`, `2`, `3`, `0`, `1` `` and its U2-5 cell `` `this.view` 1 ... `colorMode` 2 ``. Measured `grep -c` at `4095ddbf`: `2 2 1`, at `e7058994`: `5 2 1`, at `be13a210`: `5 2 1` (Ultimate Tokens, this.view, colorMode) | the same greps at B print `0` for all three needles, so they discriminate |
| P1 | 🟢 | fresh clone, no node_modules: `✓ all 50 test files passed`, `exit 0`, TESTS `50`, tree `0` after | scrim sed on `role-table.json`: `✗ 1/50 test file(s) failed`, `exit 1` |
| P2 build | owed at pre-land | not run; U2 touches no bundled file | not run |
| P3 | 🟢 | `branding: clean (739 files scanned)`, `exit 0`; U2's own dashed added lines `0`; the raw `2` against B are U3's records | a copied ADR under `.sdlc/verdicts/`: `FAIL: 3 branding violation(s) across 740 files`, `exit 1`; a dashed line in glossary.md: `1` |
| P4 | 🟢 | `0`, `0`, `0`, `0`; U2's files are the five docs and its records | a line appended to `knowledge-01-color-engine.md`: `1` |
| P5 | 🟢 | `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD be13a210)`, `exit 0` | `mixinInto` cite bumped to `app.js:1`: `✗ 1 citation gate failure(s)`, `exit 1` |
| P6, U2's share | 🟢 | all ten stale count lines in U2's files gone (SKILL.md 5, spec-draft.md 3, acceptance-criteria.md 1, quality-rubric.md 1); drawer Colors pairs `10` | at B: `15` lines |
| P6, plan-wide | 🟡 | prints `2`, both `ui-plan.md` (`5 formats`, `5 format tabs`), U1's file, fixed on U1's branch | as above |
| P7 | 🟢 | `H=e7058994`, `ancestor`, `0`; past it only the handoff and review r2 changed | the round-1 head `4095ddbf`: `ancestor`, `3`; a Branch field with no sha: `NO-HEAD` |

### Findings

1. 🔴 F1. The handoff's Ran table states two cells that were not true at the head it names. U2-1's first figure is `2` (the round-1 count at `4095ddbf`; `5` at `e7058994`). U2-5's `this.view 1, colorMode 2` is swapped and was never true at any U2 commit (`2`, `1`). Every criterion still passes; the defect is the record. Review r2 caught U2-5, not U2-1. Fix the two cells and re-derive the rest of the table at the head it names.
2. 🟡 F2. `docs/reference/SKILL.md` contract checks say "all ten" for the disabled-palette and theme-invariant rules; the gates exercise CSS and DTCG (disabled) and CSS, JSON, DTCG, Panda, Radix (theme). True of the code, stronger than the enforcement, same shape as the old "five".
3. 🟡 F3. Glossary wording: the Section row attaches "never persisted" to the frame (`app.js` says the section is never persisted); the Inspector row calls `.seg-example` a live control (the code: a live component preview); the Analysis card row's "each section's renderLeftPane body" reads as if sections own a `renderLeftPane`.
4. 🟡 F4. P6 plan-wide prints `2` until U1 lands (its `ui-plan.md`).
5. Note. The handoff's `branding: clean (736 files scanned)` does not reproduce (`738` at `e7058994`, `739` at head); the result, clean, agrees. `test/engine/exports.mjs` still has a `5 formats non-empty` comment, and `spec-draft.md` keeps the old product name in three lines; both outside U2's steps.
