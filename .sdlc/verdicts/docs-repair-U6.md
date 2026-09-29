---
kind: verdict
plan: docs-repair
unit: U6
ticket: "#751"
branch: unit/dr-U6
base: 282fca8d
grade: verifier-l1, the evidence run dispatched by the Verifier seat
pass: 1
written: 2026-09-29
---

# Verdict docs-repair U6 · 🟡 · six fact pins bite on both sides; the roles pin reads a typed JSON field, and two U6-3 plan clauses are false

verdict: 🟡
sha: 60f5cf312639bfe884bdc68102b41e579974877a

Head `60f5cf31`; the handoff names `08cdec61` (`test/repo/citations.mjs`, block (4) `FACT_PINS`), handoff `4c75c608`, review `60f5cf31`. Unit base `5c139146`. Criteria: plan revision 14 at `5a404495`; the U6 and P rows are byte-identical to the unit's copy. B `282fca8d`. The evidence run was verifier-l1 (Opus 5.5) in shared clones under the seat's job tmp. The seat reread pin (d)'s source and its readers itself. `verdict.py check` exits `0` on the handoff and the review.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U6-1 | 🟢 | `3`, `✓ citations: parser self-test + STALE 0 across 10 discovered docs + 6 fact pins (HEAD 60f5cf31)`, `exit 0` | at `5c139146`: `0`, and the pass line carries no `fact pins` |
| U6-2 | 🟢 | each of the six doc edits: `exit 1`, `1` ✗ line naming doc and needle; all six together: `6` | the same six edits at `5c139146`: `✓ citations: ... (HEAD 5c139146)`, `exit 0` |
| U6-3 | 🟡 | each source edit reds naming its path: (a) `code holds false`, (b) `code holds 11`, (c) `code holds 9`, (d) `code holds 59`, (e) `code holds false`, (f) the two section files. Two plan clauses are false: (d) does not also red `engine/semantic.mjs` (`exit 0`), and (f) is not green at B (`exit 1`, the reactivity review's line-63 cite) | (a) to (e) at B and `5c139146`: `exit 0`; for (f) the run's own isolating edit `deleteTypeMode(id)  {` is green at `5c139146` and reds only the pin at the head |
| U6-4 | 🟢 | `0`, `0`, `3` with the cell escape removed | pin (d)'s source set to `source: () => 53`: `1`; `  want: 15,` appended: first leg `1` |
| U6-5 | 🟢 | `50`, `0`, `0`, `ok    tests: baseline 50, test/run.mjs TESTS 50`, `1` | a registered `repo/xx.mjs`: `51`, `STALE tests: baseline 50, test/run.mjs TESTS 51` |
| P1 | 🟢 | fresh clone, no node_modules: `✓ all 50 test files passed`, `exit 0`, TESTS `50`, tree `0`, `▶ repo/citations.mjs pass` | scrim sed: `✗ 1/50 test file(s) failed`, `exit 1` |
| P3 | 🟢 | `branding: clean (748 files scanned)`; U6's diff adds `0` dashed lines; the raw `2` are U3's records | a copied ADR: `FAIL: 3 branding violation(s) across 749 files`, `exit 1` |
| P4 | 🟢 | `0`, `0`, `0`, `0` | `const x = 1;` in `persist.js`: middle leg `1` |
| P5 | 🟢 | `1`, the U6-1 pass line, `exit 0` | a bumped `mixinInto` cite: `✗ 1 citation gate failure(s)`, `exit 1` |
| P6 | 🟢 | `0`, `10` | at B: `15` |
| P7 | 🟢 | `H=08cdec61`, `ancestor`, `0` | the Branch sha removed: `NO-HEAD` |
| P8 | 🟢 | `H=08cdec61`, `HAS-RAN`, `1 1 1 1 1`, `diff 0` | the escaped U6-4 form on a `source: () => 53` copy: `0` (the vacuous reading the handoff names) |

### Findings

1. 🟡 F1 (plan). Pin (d) reads `rolesPerPalette` from `role-table.json` (`citations.mjs:81`), a typed field no source or test reads: `git grep rolesPerPalette` finds only this line and the generated `describe-mcp-assets.js`. A 54th `roleTable` entry with the field left at 53 keeps the pin green. The block comment `source() reads the code and returns what it holds` is imprecise for this pin. The plan named the field, so the fix is the planner's: count `roleTable` or `semanticRoles`.
2. 🟡 F2 (plan). U6-3's Expected `(d) also reds engine/semantic.mjs` is false (`exit 0` with the field at 59), and its control `the same edits at $B are green for all six` is false for (f). The handoff did not record the other-test effects the cell asked for, so neither was measured before this run.
3. 🟡 F3 (plan). U6-4's regex misses `source: async () => 15`, `source: () => { return 15; }` and numbers outside `53\|15\|10\|4`; its own control bites, its coverage is narrow.
4. 🟡 F4. The handoff's U6-4 note says the block `carries \| with the escape removed` (it carries a bare pipe), and the controls ran in the worktree although U6-2 and U6-3 say "in the clone". Both disclosed; no figure false.
5. Note. Pin (a) reds with `code holds false` on a comment-only reword of `app.js:98`, and pin (f) reds on a whitespace change: fail-safe, misleading messages. `ran.sh` defaults `F` to `${TMPDIR:-/tmp}`.

Cleared to merge.
