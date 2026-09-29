PASS: docs-repair U8 pass 1 at af9a4e8f (fix b3584192). The merge keeps every plan line and every main line it should, the generated files match their generators, the eleven moves are pure renames of review records, pin (d) counts the live table and its control bites, the ladder note is true against `geometry.mjs`, the light legs of the ran block reproduce, and P4 prints `0 0 0 0`.

Reviewer: reviewer-l3, fresh context, 2026-09-29. Criteria: U8-1 to U8-5, P3, P4, P8 from `plan/docs-repair` at 53f3d7ce (revision 17). Test, build and smoke were not run (the Verifier's). Every run below was in a `git clone --shared` of the worktree under the job tmp dir, never in the worktree.

## Findings, by severity

| # | Severity | Where | Finding |
|---|---|---|---|
| R1 | Low | `.sdlc/plans/docs-repair.md:183`, `:291`; `.sdlc/handoffs/docs-repair-U3.md:45`; `.sdlc/handoffs/docs-repair-U5.md:6`; `.sdlc/plans/docs-repair-U{1,3,7}-rediagnosis.md` | These still name `.sdlc/verdicts/docs-repair-U*-review*.md` paths that U8 moved to `.sdlc/reviews/`. Handoffs and rediagnoses are merged history, and the U8 handoff restates the two P3 quote paths at their new home, so nothing breaks: P3's raw count is `2` either way, and U4-3's filter only drops lines. The plan is live, though. The Orchestrator can repoint `:183` and `:291` or leave them as history. |
| R2 | Low | `.sdlc/plans/docs-repair.md:225` | Step (1) says sixteen files conflict. `git merge-tree --write-tree --name-only 152bf923 3631b7a2` lists seventeen, because the plan file itself also conflicts. The handoff and the merge commit say seventeen, which is correct. The plan text is the only thing wrong. |
| R3 | Low (carried from U2, not U8) | `docs/reference/SKILL.md:255` | `unrelated to Ultimate Tokens; use spec-author directly.` A semicolon cannot join a fragment to a clause, and main's own line uses a comma (`unrelated to the HCT Palette Generator, use ...`). The merge kept the plan's line, which is right because the plan rewrote it, but the right replacement for the removed dash is a comma. One character, inside the wall. |
| R4 | Info | handoff `~~~sh ran`, line 3 | The block adds a `# setup` line (`git fetch -q origin; B=...`) that is not a plan row. It does no harm: no U8 row reads `B`, and P8's per-id count is still `1 1 1 1 1`. |
| R5 | Info | `test/repo/citations.mjs:81` | `roleTable` is an array (checked: `Array.isArray` true, length 53), so `Object.keys(...).length` equals `.length`. The longer form was chosen to satisfy U8-3's grep, as handoff Decision 6 says. |

## (a) Merge resolution, 17 files

- Every line the plan side added since the merge base 282fca8d is in the merged tree, checked with a per-line exact match on each of the 14 hand-merged files. The one line missing is the plan's `npm run build` row in `.sdlc/baseline.md` (4125.2 KB). Main's row (4118.0 KB) replaces it, and the U8 correction paragraph explains why. The U3 correction paragraphs are all kept.
- Every line main added that is missing from the merged tree is a line the plan rewrote: the `.claude/CLAUDE.md` Layout lines, `app-shell.md` rule of thumb, the `SKILL.md` and `ui-plan.md` titles and counts, the `app.js` and `persist.js` headers, and the reactivity-review lines whose `persist.js:` cites moved by the header's -9. In each of these the merged line has the plan's content and no em dash. Word diffs main to merged in the three reviews show only the cite shifts plus a colon or parenthesis where main had used a comma, on lines the plan had rewritten.
- Cites spot-checked against the merged source: `clampTokenOverrides` is at `persist.js:660`, and its calls are at `:703` and `:821`. `mixinInto(HctApp, ...)` is at `app.js:2581` and `_appPrefsKey()` at `app.js:2280`, which match `app-shell.md`.
- `persist.js` main to merged: `22 31` numstat. The non-comment diff lines count `0`.
- `.claude/CLAUDE.md`: main has 117 lines and the merge has 117. The U5 edit is 3 lines for 3, so no DD row moves. `doc-drift-rows-check.sh`: `bad 0` at b3584192 against `bad 1` (`QUOTE DD9`) at 79aadcda.
- `.sdlc/plans/docs-repair.md` and `.sdlc/board.md` are identical to 79aadcda at a18c23cd, and the plan is identical to 152bf923.
- Generated files: the six `npm test` generators (`gen:figma-assets`, `gen:mcp-assets`, `gen:categories`, `gen:adia-exports`, `bundle`, `gen:figma-ui`) run at b3584192 in the clone leave `git status --short` empty and print `wrote figma/plugin/ui.html 4118.0 KB`. `ui.html` is 4243803 bytes, 29 below main's 4243832, and both round to the build row's 4118.0.

## (b) Record moves

`git diff -M --name-status b3584192^ b3584192` shows 11 `R100` renames. Every moved file opens with a review line (PASS, FAIL or FIX-FIRST), so none is a verdict. `.sdlc/verdicts/` keeps only `docs-repair-U1.md` to `-U7.md`. `verdict-frontmatter-check.sh`: `verdicts 195 graded 195 bad 0`.

## (c) Pin (d)

At b3584192 the citations gate reads `✓ ... STALE 0 ... 6 fact pins`. The control appends a 54th `roleTable` entry with `rolesPerPalette` left at 53. It prints `✗ ... fact pin "roles per palette": ... says \`a 53-role\` but the code holds 54` and `✗ 1 citation gate failure(s)`, and the gate exits 1. The same mutation with the pre-fix `citations.mjs` (reading `rolesPerPalette`) prints `✓ ... STALE 0`. The old pin was blind and the new one bites.

## (d) Ladder note

`ui-plan.md:51` (the Geometry row) reads: "except in the ladder prototype ramp, which derives its own text size from each step height". This is true. In `geomScale` (`geometry.mjs:282-285`), the ladder branch calls `buildSizeLadder` and `continue`s before the `uiSteps` composition. `buildSizeLadder` sets `font` to `round(height / 4 + 6)` unless a font override wins (`geometry.mjs:185-186`). The note matches README.md:166.

## (e) P8

The block's `# U8-1` to `# U8-5` commands are byte-identical to the plan's U8 rows with the cell escape removed, checked by script. Re-run at b3584192 in the clone, the non-heavy legs (sha; U8-1 to U8-4; the `baseline-agrees` leg `stale total: 1`, whose one line is `STALE time test`; P3 `branding: clean (867 files scanned)`) diff empty against the transcript's matching lines. The Branch field parses to `b3584192`, the block's first output line. The `npm test`, build and smoke legs are left to the Verifier.

## (f) P4 and P3 at af9a4e8f, B = 79aadcda

P4: `0`, `0`, `0`, `0`. P3: `0`, then raw `2`. The two raw lines are the two quotes of the old `persist.js` header in `.sdlc/reviews/docs-repair-U3-progress.md` and `-U3-review.md`, and the handoff lists both.
