---
kind: rediagnosis
plan: bold-labels
unit: U3
ticket: "#752"
pass: 2
trigger: .sdlc/verdicts/bold-labels-U3.md (pass 1 🔴 at 41ef16fc)
measured-at: unit/bl-U3 41ef16fc, plan/bold-labels 7c355327, 2026-09-29
---

# bold-labels U3 re-diagnosis for pass 2

The six edits of `84d107c2` are right and every plan row but P1 holds (verdict, finding 5). Pass 1 went 🔴 on the handoff alone: two cells state a cause the tree does not support, and one figure was read at a sha the merge has since moved past. Pass 2 is a records pass. No source file changes.

## The three cells, each cause verified by command

| Cell | Handoff says | What the tree says | Command |
|---|---|---|---|
| `:10` P1 cause | the 11 reactivity labels are missing because `U1 unmerged` | U1 merged into the plan branch at `575e8334`, an ancestor of the handoff's own base `5096d7fe`. That base is the `origin/main` merge, and it resolved `02-sections-and-resolvers.md` to main's side (main had changed the same file: #753 at `ed759f6a` gave `**B4 [LOW]**` its colon), so the 11 U1 colons went back to commas there. `7c355327` restored them; `aa60de32` carries that into the unit | `git merge-base --is-ancestor 575e8334 5096d7fe` succeeds. Colon count in the file: `575e8334` 13, `5096d7fe` 2, `7c355327` 13, `41ef16fc` 13. `git diff --numstat 06dc3766 5096d7fe -- <file>` is empty (the merge took main's copy); `git diff --numstat 7841cf58 5096d7fe -- <file>` is `13 13` |
| `:10` P1 figure | `28` | `28` was true at `84d107c2` (17 kept + 11 reactivity commas from the dropped merge). At the head `41ef16fc` the predicate reads `17`, and `diff` against the kept list prints one line, K17 | per-file `grep -cE` summed over `git ls-tree 84d107c2`: `28`; over `7c355327`: `23` (17 kept + 6 U3 hits); P1's own command at the head: `17`, `17d16 < plugin/ultimate-tokens/skills/typography-tokens/references/prose.md	**sub-title**` |
| `:15` P6 cause | `plan said 53; #761 added one` | #759 (`347e7103`) added `repo/verdict-frontmatter.mjs` to `TESTS`; #761 (`fc839d14`) changed nothing there | `TESTS` length: `347e7103~1` 53, `347e7103` 54, `fc839d14~1` 54, `fc839d14` 54, `41ef16fc` 54. Set diff of the two `TESTS` arrays across `347e7103`: `> "repo/verdict-frontmatter.mjs"` |

The handoff's true claims hold under the same reads: row 5 (`**easy to miss**`) is gone, `git log -1 -S'easy to miss'` names `fc839d14` (#761); K17 no longer matches because #761 reflowed `**sub-title**` to mid-line (`prose.md:6` now opens `and **tiny** ...`).

## Root cause, stated once

The builder read its base as `5096d7fe` before the plan branch was repaired at `7c355327`, saw the reactivity lines as commas, and inferred "U1 unmerged" instead of reading the merge. The second false cell is the same shape: the test count moved and the builder named the PR it had been told to wait for (#761) rather than the commit that moved it (#759). Both are inference in place of a read; neither touched the six edits.

## What pass 2 changes

Records only, in `.worktrees/bl-U3` on `unit/bl-U3`:

1. `.sdlc/handoffs/bold-labels-U3.md` line 5: base reads `7c355327` (the merge `aa60de32` moved it).
2. Line 10 (P1): `17`, `kept-exact` fails on K17 alone, with the cause as the table above states it (merged at `575e8334`, dropped by `5096d7fe`, restored at `7c355327`). No mention of U1 being unmerged.
3. Line 15 (P6): `all 54 test files passed` (plan revision 5 said 53; #759 at `347e7103` added `repo/verdict-frontmatter.mjs`).
4. Line 20 (Left out): K17 stays out (a plan defect, revision 6 drops it); the reactivity lines are no longer an owner's gap, they are in the head.

The review record `.sdlc/reviews/bold-labels-U3-review.md` repeats neither cause (its row 13 already reads the P1 figure as `17` at `aa60de32`), so it stands. No edit under `.claude/`, `docs/`, `plugin/`, `mcp/`, `README.md`, `CHANGELOG.md`.

Plan side, in `.worktrees/plan-bold-labels`: revision 6 (drafted uncommitted with this file, default A of `.sdlc/questions/bold-labels-revision6.md`) drops K17 so P1 and U3-1 expect `17`, `kept-exact`.

## Pass 2 criteria

`W=.worktrees/bl-U3`, run at its root; `B=$(git merge-base origin/main HEAD)` = `06dc3766`.

| id | criterion | command | expected | negative control |
|---|---|---|---|---|
| R1 | the handoff no longer states the two false causes | `grep -cE 'U1 unmerged\|#761 added one' .sdlc/handoffs/bold-labels-U3.md` | `0` | the pass 1 handoff at `41ef16fc`: `git show 41ef16fc:.sdlc/handoffs/bold-labels-U3.md \| grep -cE 'U1 unmerged\|#761 added one'` prints `2` |
| R2 | the handoff names the true chain and the true PR | `grep -c '575e8334' .sdlc/handoffs/bold-labels-U3.md; grep -c '7c355327' .sdlc/handoffs/bold-labels-U3.md; grep -c '#759' .sdlc/handoffs/bold-labels-U3.md` | `1` or more, three times | at `41ef16fc` the same three greps print `0`, `0`, `0` |
| R3 | P1 in the handoff reads the head's figure | `grep -E '^\| P1' .sdlc/handoffs/bold-labels-U3.md \| grep -c '`17`'` | `1` | at `41ef16fc`: `0` (the cell reads `28`) |
| R4 | P6 in the handoff reads the head's count and its cause | `grep -E '^\| P6' .sdlc/handoffs/bold-labels-U3.md \| grep -cE '54 test files passed.*#759'` | `1` | at `41ef16fc`: `0` |
| R5 | pass 2 is records only | `git diff --name-only 41ef16fc -- ':!.sdlc' \| wc -l` | `0` | any edit outside `.sdlc/` prints `1` or more; the unit's own `84d107c2` against its parent prints `5` |
| R6 | the six edits are still the head's | `git diff --numstat "$B" -- .claude/skills/geometry-system/SKILL.md .claude/skills/geometry-system/references/foundations.md .claude/skills/type-scale/references/foundations.md .claude/skills/maintaining-brand-kit-mcp/SKILL.md docs/reference/references/ui-plan.md \| awk '{a+=$1; d+=$2} END{print a, d}'` | `6 6` | reverting `**Analysis**:` to a comma in `ui-plan.md`: `5 5` |
| R7 | P1 with revision 6's kept list | P1's command, with `.sdlc/plans/bold-labels-kept.tsv` at revision 6 (17 rows) | `17`, `kept-exact` | the revision 5 list (18 rows): `17`, then `17d16 < ...prose.md	**sub-title**`, no `kept-exact` |
| R8 | the records carry no em dash and no bold inline label | `git diff "$B" -U0 -- .sdlc/handoffs/bold-labels-U3.md \| grep -cE "^\+.*($(printf '\xe2\x80\x94')\|\*\*[^*]+\*\*:)"` | `0` | a planted `**Note**: text` line: `1` |

R7 depends on revision 6 merging into `plan/bold-labels` before the Verifier reruns U3-1; until then the Verifier grades U3-1 against `17` as the question's option B says and names the dependency.

## What this changes upstream

- Revision 6 also fixes P6's expected string (`54`, #759) and U3-3's control (`2`, a `description:` edit shows a `-` and a `+` line), and notes on U1 rows 7 to 18 that B4's colon reached `origin/main` by #753, so P3 against a base holding #753 reads U1's reactivity rows as 11 removed, total removed `68`, added `67`.
- The builder guidance for a pass 2 builder: read the base with `git log -1 --format=%h HEAD^2` on the merge and `git merge-base --is-ancestor` before writing a cause; a count that moved is dated by `git log -S`, not by the PR the unit waited on.
