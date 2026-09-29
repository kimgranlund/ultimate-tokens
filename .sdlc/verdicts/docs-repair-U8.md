---
kind: verdict
plan: docs-repair
unit: U8
ticket: "#751"
branch: unit/dr-U8
base: 79aadcda
grade: verifier-l2 standing in for verifier-l3 (opus l5 build, same family, ruling b9044bb), the evidence run dispatched by the Verifier seat
pass: 1
written: 2026-09-29
---

# Verdict docs-repair U8 · 🟡 · main merged clean, eleven review records moved, pin (d) counts the live role table; two handoff sentences are imprecise

verdict: 🟡
sha: a3ce66915f575db6f13c61132824c87d0f065a0c

Head `a3ce6691` (the review commit); the handoff names fix `b3584192`, and `git diff --name-only b3584192 a3ce6691` lists only `.sdlc/handoffs/docs-repair-U8.md` and `.sdlc/reviews/docs-repair-U8-review.md`. Criteria: plan revision 17 at `53f3d7ce`. `$B` is the plan's `git merge-base origin/main HEAD`, `79aadcda`. The evidence run was verifier-l2 (Opus 5.5) in shared clones under the seat's job tmp. The seat re-read F1 to F3 itself. `verdict.py check` exits `0` on the handoff and the review.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U8-1 | 🟢 | at `b3584192`: `merged`, `0` | at `a731a3cf`: nothing, then `0` |
| U8-2 | 🟢 | `✓ verdict-frontmatter: verdicts 195 graded 195 bad 0, planted 2`, `em-dash: clean (875 files scanned)`, `0` | `docs-repair-U2-review.md` moved back: `MISSING docs-repair-U2-review.md: no verdict: line`, `✗ 1 verdict-frontmatter gate failure(s)`; U4-review moved back: `VALUE ... last verdict: PASS is not 🟢, 🟡 or 🔴`, exit `1`, count leg `1` |
| U8-3 | 🟢 | `1`; `✓ citations: parser self-test + STALE 0 across 10 discovered docs + 6 fact pins (HEAD b3584192)`; `citations.mjs:81` `Object.keys(JSON.parse(txt("docs/reference/data/role-table.json")).roleTable).length` | a 54th `roleTable` entry with `rolesPerPalette` left at 53: `fact pin "roles per palette": ... says \`a 53-role\` but the code holds 54`, `✗ 1 citation gate failure(s)`, `exit 1` |
| U8-4 | 🟢 | `1`; `ui-plan.md:51` `except in the ladder prototype ramp, which derives its own text size from each step height`, true against `geometry.mjs:185` `const ladderText = round(height / 4 + 6)` and `model.mjs:224-225` | at `a731a3cf`: `0` |
| U8-5 | 🟢 | `✓ all 54 test files passed` (1:20.52, `exit 0`); `npm ci` then build `exit 0`, `wrote figma/plugin/ui.html 4118.0 KB`; tree `0`; baseline `STALE time test: baseline 167 to 268 s, adapter 80 to 89 s`, `stale total: 1`, `ok    ui.html: baseline 4118.0 KB, tree 4118.0 KB`; `79aadcda` prints the same `stale total: 1`; smoke `1` (`SMOKE PASS, gallery · category · editor · export dialog all render in a real browser`), tree `0` after | build row set back to `4125.2`: `STALE ui.html: baseline 4125.2 KB, tree 4118.0 KB`, `stale total: 2` |
| P3 | 🟡 | `branding: clean (867 files scanned)`, `0`, `2`; the count equals the handoff's `2`, but its one quoted line matches `docs-repair-U3-review.md:50` and not `docs-repair-U3-progress.md:24`, which wraps the same quote in two extra `"` characters, see F2 | `decision-records.md` copied into `.sdlc/verdicts/`: `FAIL: 3 branding violation(s) across 868 files`, `exit 1`; one dashed prose line in `figma/README.md` makes leg 2 `1` |
| P4 | 🟢 | `0`, `0`, `0`, `0` | four-name fixture through the first filter: `2`; `const x = 1;` appended to `persist.js` makes leg 2 `1` |
| P8 | 🟢 | `H=b3584192`, `HAS-RAN`, `1 1 1 1 1`, `diff 0`; the U8 rows in `ran.sh` equal the plan's cells with the escape removed (`ROWS-IDENTICAL`), plus one `# setup` line that is the plan's `$B` definition and is read by no row | fixture handoff with U8-5 dropped and U8-2's `0` set to `1`: `1 1 1 1 0`, `6c6 < 1 --- > 0`, `diff 1` |
| Merge | 🟢 | `git diff 79aadcda b3584192 --name-status` lists 54 paths, all inside P4's filter, among them eleven `R100 .sdlc/verdicts/docs-repair-U*-review* -> .sdlc/reviews/`; the plan file diffs `0` across both merges; `.sdlc/board.md` diffs `0` against `5dcf23b9^2`, `a18c23cd^2` and `79aadcda`; Decision 5's merged lines hold (`SKILL.md:82-83`, `### B4: Exports` with `All ten color formats`, glossary Parity row plus rows 41 to 49) | P4 leg 1 reds any path outside the wall, as above |

### Findings

1. 🟡 F1, handoff Decision 5. It cites `app-shell-patterns.md:18`, `persist.js:50` and `docs/reference/SKILL.md:10` as lines "this plan rewrote" that "kept a dash main had removed". The dashed lines are one above, at `:17`, `:49` and `:9` at every head (`b3584192` reads `:18` `> pins how they behave.`, `:50` `// Renamed hct-palette-state-v1 ...`, `:10` `tonal-scale generation ...`), and `git diff -U0 282fca8d 152bf923` adds no dashed line to those files, so they were plan-side context lines inside conflict hunks, not rewrites. The merged text equals main's in each case.
2. 🟡 F2, handoff Figures. P3 asks for every dashed quote listed word for word; the handoff gives one quote for two lines that differ by two `"` characters. The count is right.
3. 🟡 F3, plan defect. U8-2's control and step 2's reason say a moved-back record reds as `MISSING`; `docs-repair-U4-review.md` carries `verdict: PASS` and reds as `VALUE`. The control still bites.
4. 🟡 F4, plan defect (review R1, R2). Plan `:225` says sixteen files conflict; `git merge-tree --write-tree --name-only 152bf923 3631b7a2` lists `17`. Plan `:183` and `:291` still name `.sdlc/verdicts/` paths for records now in `.sdlc/reviews/`.
5. Info, review R3. `docs/reference/SKILL.md:255` `unrelated to Ultimate Tokens; use spec-author directly.` joins with a semicolon where main uses a comma; introduced at `e7058994` (U2), not U8.
6. Info. Scope wall prose at plan `:21` omits `docs/reference/reviews/2026-08-20-reactivity/`, which P4's filter and the `2026-09-28` revision admit.
