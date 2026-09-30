---
kind: verdict
plan: gates-batch
unit: U1
ticket: "#776"
branch: unit/gb-U1
base: 17edb2d2
grade: verifier-l2 (opus) per R79; the builder was builder-l3 (sonnet), so the checker sits outside the builder's family; evidence run gates-batch-U1-verifier-l2-p1, spot-checked by the Verifier seat
pass: 1
written: 2026-09-30
---

# Verdict gates-batch U1 · 🟢 · the bare-literal source guard and the bare-filename symbol homes hold, every control bites

verdict: 🟢
sha: 7a12fd264f9c44b3c3829f699fbd722a639433e3

This grades the unit against `.sdlc/plans/gates-batch.md` as committed on the branch; it is identical to the root copy. The unit changes only `test/repo/citations.mjs`, plus its handoff and review. Every control ran in a throwaway clone at `7a12fd26`, and each control's first line printed that sha. I spot-checked U1-1, U1-6, U1-9 and U1-11 in the unit worktree myself: `37 checked, 0 stale`, `SYMBOL_HOME_FLOOR = 30`, `startsWith("src/")` `1`, and the `✓ citations` line. C6 and C7 do not apply to U1 (they belong to U2 and pre-land, and to the PR stage).

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U1-1 | 🟢 | `node test/repo/citations.mjs \| tail -1` prints `✓ citations: parser self-test + STALE 0 across 10 discovered docs + 11 fact pins (HEAD 7a12fd26)`, exit 0 | each U1-2 to U1-5 plant exits 1 |
| U1-2 | 🟢 | the "type voices" source planted as `async () => 15`: `✗ ... fact pin "type voices": bare literal source`, exit 1 | the same plant on the pre-unit `citations.mjs` (`17edb2d2`) prints `✓`, exit 0 |
| U1-3 | 🟢 | plant `() => { return 15; }`: the same `✗ ... bare literal source`, exit 1 | the pre-unit file with the same plant: `✓`, exit 0 |
| U1-4 | 🟢 | plant `() => 59`: `✗ ... bare literal source` plus the value-mismatch `✗`, exit 1 | the old digit-set pattern reads `0` on `source: () => 59`; the pre-unit file gives only the value-mismatch `✗` |
| U1-5 | 🟢 | the first `bareLiteralSource` is at line `126`, the FACT_PINS `];` is at `111`, and the fixtures start at `133`, outside the scanned slice | predicate inverted in a clone: `✗ 12 citation gate failure(s)`, exit 1 |
| U1-6 | 🟢 | `symbol homes: 37 checked, 0 stale`, reproduced by the seat; 27 slash-path plus 10 bare citations | `continue` for bare names restored: `27 checked`, exit 0 |
| U1-7 | 🟢 | `` `brandKit` in `persist.js` `` appended to a skill: `✗ ... \`brandKit\` is not defined in src/ui/persist.js`, exit 1 | the same plant against the pre-unit gate: `27 checked, 0 stale`, exit 0 |
| U1-8 | 🟢 | tracked `src/ui/x/model.mjs`: `✗ ... ambiguous basename, src/ui/model.mjs or src/ui/x/model.mjs`, exit 1 | clean clone: `37 checked, 0 stale`, exit 0 |
| U1-9 | 🟢 | `grep -c 'startsWith("src/")'` reads `1` (seat-reproduced), and the clean run is `0 stale` | `src/` filter removed: 6 `ambiguous basename` FAILs (`model.mjs` against `test/ui/model.mjs`, `geometry.mjs` against `test/engine/geometry.mjs`), exit 1 |
| U1-10 | 🟢 | the plan's `node -e` prints `geomTokensX,steps,typeTokensX` | reason removed from `steps`: `✗ ... BARE_EXEMPT entry without a sym + reason`, exit 1; empty list: 3 stale, exit 1 |
| U1-11 | 🟢 | `SYMBOL_HOME_FLOOR = 30` (seat-reproduced), within the band of 12 to `37 - 5` | `continue` restored at floor 30: `✗ ... only 27 citations read, below SYMBOL_HOME_FLOOR 30`, exit 1 |
| C1 | 🟢 | clone at `7a12fd26`: `npm test` prints `✓ all 54 test files passed`, exit 0; `git status --short \| wc -l` reads `0` after | `"scrim` to `"scrimX` in `role-table.json`: exit 1, `▶ engine/semantic.mjs FAIL`, `✗ 1/54 test file(s) failed` |
| C2 | 🟢 | `node test/repo/em-dash.mjs \| tail -1` prints `em-dash: clean (1016 files scanned)`, exit 0 | a U+2014 appended to the plan in the clone: `FAIL: 1 em dashes ...`, exit 1 |
| C3 | 🟢 | `git diff --name-only 17edb2d2..HEAD -- test/run.mjs .sdlc/baseline.md \| wc -l` reads `0` | a committed `// x` in `test/run.mjs` reads `1` |
| C4 | 🟢 | the chroma-envelope lane diff `\| wc -l` reads `0` | a committed `// x` in `src/engine/hct.js` reads `1` |
| C5 | 🟢 | the `src/` name list is empty; both comment-stripped diffs read `0` | a space inside the `TYPE_TREATMENTS` code token: name list `src/engine/type.mjs`, `wc -l` `4` |

## Findings

- **Reviewer low 1 is confirmed but outside scope.** The guard reads number literals only, so a `btn home` source of `() => true` still passes. The Design scopes the predicate to "a number literal". This is a follow-up candidate: 5 of the 11 pins are boolean.
- **Reviewer low 2 is confirmed but outside scope.** `(_) => 15`, `async function () { return 15 }` and `() => (15)` all pass. Every shape the Design lists is caught (U1-2 to U1-5).
- **The plan's U1-9 control wording slipped.** A tree-wide resolve does not red `type.mjs`, because its bare citations are all in BARE_EXEMPT. It reds `model.mjs` and `geometry.mjs` instead, so the control still bites.
