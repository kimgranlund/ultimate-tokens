---
kind: verdict
plan: prompt-audit
unit: U3
ticket: "#758"
branch: unit/pa-U3
base: 8f5c6dc0
grade: verifier-l2, the evidence run dispatched by the Verifier seat
pass: 1
written: 2026-09-28
---

# Verdict prompt-audit U3 · 🟡 · every MCP string holds against the engine; P2's stale time line predates the unit, and three handoff lines are stale

verdict: 🟡
sha: c5b2503ecbe3113c3a86f2a78a1709098214cded

The head is `c5b2503e` and the code commit is `b148acad`. B is `8f5c6dc0`, from `git merge-base origin/main HEAD`. The unit's plan copy differs from plan/prompt-audit `2fa99271` only in the ticket line and the checklist. Q3 is ruled A (fix and pin). Evidence comes from four throwaway shared clones. The negative controls either read the rows at B or plant an edit in a clone.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U3-1 | 🟢 | the plan's legs print `0`, `7`, `4`, `true false`, `brand-kit MCP PASS`, `exit 0`; the merged-core check prints `PASS` | at B: `1`, `0`, `0`, `false true`; a static tool list planted in `handle()` gives merged-core `FAIL (2)`, `exit 1` |
| U3-2 | 🟢 | `missing 0`; the five needles print `2`, `4`, `2`, `2`, `2` | at B: `missing 7`; the needles print `0` |
| U3-3 | 🟢 | `true true`, `0`, `0`, `1` and `1`, `1` and `1`, `error-result` | at B: `false false`, `1`, `1`, `0` and `0`, `0` and `0` |
| U3-4 | 🟢 | `all-named`, `0`, `3` | at B: `Sub-title`, `1`, `0`; the Sub-title clause deleted from the guide gives `missing: Sub-title`, `exit 1` |
| U3-5 | 🟢 | `0`, `0`, `1`, `1`, `describe-rubric PASS`, `exit 0` | at B: `1`, `2`, `0`; `an additive L* bump` planted gives `describe-rubric FAIL (1)`, `exit 1` |
| U3-6 | 🟢 | the count-claim grep over the added mcp lines prints `0` | `All 53 roles per palette, i.e. 848 entries,` planted gives `1` |
| U3-7 | 🟢 | nearest for `#fff` returns `{"palette":"Neutral","stop":50,"hex":"#FFFFFF","distance":0}`; `grep -c '#fff' test/mcp/brand-kit.mjs` prints `4` (my read: `4` at head, `0` at B) | at B it returns `Data 3` at `distance 72`; B's `brand-kit-core.mjs` with the test kept gives `exit 1` |
| U3-8 | 🟢 | `3`, `0`, `ok    ui.html: baseline 4124.7 KB, tree 4124.7 KB`, `1` | the baseline cell reverted to `4118.0 KB` gives `STALE ui.html`, `stale total: 2` |
| P0 (G0) | 🟢 | `git show origin/main:test/run.mjs \| grep -c '"repo/em-dash.mjs"'` prints `1` | the plan's figure at `61225d0c` is `0` |
| P1 | 🟢 | `✓ all 53 test files passed`, `exit 0`, `53`, status `0`, `ok    tests: baseline 53, test/run.mjs TESTS 53` | the scrim sed gives `✗ 1/53 test file(s) failed`, `exit 1` |
| P2 | 🟡 | `npm run build` exits 0 and writes `wrote figma/plugin/ui.html 4124.7 KB`, with status `0`. The baseline check prints `stale total: 1`, the line `STALE time test`, which prints the same at B | the KB cell reverted gives `stale total: 2`. The row expects `stale total: 0`; the one stale line predates the unit (the R53 carry), so the pre-land record owes it |
| P3 | 🟢 | `branding: clean`, `em-dash: clean`, `exit 0`; added-prose glyph count `0` | the decision-records copy gives branding `exit 1`; a glyph line gives em-dash `FAIL: 1`, `exit 1` and count `1` |
| P4 | 🟢 | the three filters print `0`, `0`, `0` | the six-name fixture gives `3` |
| P5 (U3 ids) | 🟢 | each of M1 to M10 and R1 to R3 prints `1`; the ERE prints `13` | at B there is no handoff and every id prints `0` |
| P6 | 🟢 | `0` and `0`; U3 touches no prompt-file path | the fixture `+the rule (TKT-0010)` gives `1` |
| P7 | 🟢 | `0`, `0`, `2`, and `board.py ids` gives `exit 0` | the synthetic evidence file gives `1`, `1`, `exit 1` |

These rows are left to pre-land: G1 of P0, P5's other units, the P6 sum, and smoke (the two generated assets change).

## Findings

- 🟡 Low, open by ruling. The `generate_kit` description in `mcp/describe-mcp-core.mjs` reads `plus a lint array` (my read: `1` at head). This is not false, but it reads as a second lint item beside the `lint` field it names.
- 🟡 In the handoff, the second-rework paragraph (line 93) calls the last two M6 nits `both closed`. Its own rework table and review r4 leave the `plus a lint array` nit open.
- 🟡 In the handoff, line 58 reads `## Negative controls (run in the worktree, file restored after each)`. The plan's Diff bases paragraph requires controls that edit a file to run in a clone. The evidence run reran every control in clones, and the figures agree.
- 🟡 In the handoff, line 76 reads `` `npm run build` and the `smoke` leg: not run ``. That is stale now: the build is green (`exit 0`, 4124.7 KB, tree clean). Smoke is still owed.
