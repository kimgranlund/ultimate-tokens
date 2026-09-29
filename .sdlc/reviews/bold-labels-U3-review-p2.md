PASS

# bold-labels U3 review, pass 2

Reviewed `unit/bl-U3` at `c61728e8` (pass 2 handoff), unit base `7c355327`, plan-row base `B` = `06dc3766` (`git merge-base origin/main HEAD`). Fresh context, read-only on source. Checker family: opus, the builder's own family, standing in for reviewer-l4 while fable is capped, under the owner ruling `.sdlc/questions/seat-reliability-approval.md` in the sdlc-orchestration repo at `b9044bb`. Controls ran in scratch clones under `$CLAUDE_JOB_DIR/tmp`, clean after each.

## Findings

| Rank | Finding | State | Evidence | Negative control |
|---|---|---|---|---|
| none | No blocking or major finding. Both pass 1 false causes are gone and every replacement cause checks out by my own command. | 🟢 | R1 `0`; the cause rows in Evidence below | R1 on the pass 1 handoff at `41ef16fc` prints `2` |
| 1 | P1 and U3-1 read `17`, diff one line (K17). Owner item, revision 6 drops K17; with K17 filtered the diff is `kept-exact`. Not the builder's. | 🟡 | P1 `17`, `17d16 < ...prose.md	**sub-title**` | a planted `**Probe**` line: `18`, `17a18 > README.md	**Probe**` |
| 2 | P4 reads `1`, the Orchestrator's `.sdlc/plans/bold-labels-U3-rediagnosis.md` (from `416a5312`, merged in at `b4d50ae5`), outside the wall regex. Owner item, revision 6. No builder file is outside the wall. | 🟡 | P4 `1` then `2` | a planted `src/planted.js`: R5 `1` |
| 3 | `git diff --name-only 41ef16fc HEAD` lists the rediagnosis file as well as the handoff; it came in with the plan merge `b4d50ae5`, and the builder commit `c61728e8` touches only the handoff. The brief's "pass 2 changed only the handoff" holds for the builder's commit. | 🟢 | `git show --stat c61728e8`: 1 file, the handoff | `git show --stat 416a5312` lists only the rediagnosis file; `c61728e8` lists only the handoff |

## Evidence

| Check | State | Evidence | Negative control |
|---|---|---|---|
| U1 merged at `575e8334` | 🟢 | `git merge-base --is-ancestor 575e8334 5096d7fe` succeeds; `575e8334` is `merge unit/bl-U1 into plan/bold-labels` | reactivity colon count at `06dc3766` (main) is `2` vs `13` at `575e8334`, so the count tells the copies apart |
| `5096d7fe` dropped the colons | 🟢 | parents `7841cf58 06dc3766`; `git diff --numstat 06dc3766 5096d7fe -- <02-sections-and-resolvers.md>` empty, `5096d7fe^1..5096d7fe` `13 13`; colon count `575e8334` `13`, `06dc3766` `2`, `5096d7fe` `2` | `ed759f6a` (#753) touched the file `2 2` and is an ancestor of `06dc3766`: the source of main's copy |
| `7c355327` restored them | 🟢 | `git diff --numstat 7c355327^ 7c355327 -- <file>` `11 11`; count `7c355327` `13`, head `13`; `7c355327` is an ancestor of the head | at `5096d7fe` the same count is `2` |
| #759 added the 54th test file | 🟢 | `"*.mjs"` entries in `TESTS` of `test/run.mjs`: `347e7103~1` `53`, `347e7103` `54`, `fc839d14~1` `54`, `fc839d14` `54`, head `54`; the `347e7103` (#759) diff adds `repo/verdict-frontmatter.mjs` | `fc839d14` (#761) leaves the count at `54`, so #761 added none |
| Row 5 gone at #761 | 🟢 | `git log -1 --format=%h -S'easy to miss' -- .claude/skills/adding-semantic-roles/SKILL.md` prints `fc839d14` | `grep -c 'easy to miss'` on the file at `fc839d14~1`: `1`, at `fc839d14`: `0` |
| Six edits stand | 🟢 | `git diff --numstat 7c355327 HEAD -- ':!.sdlc'`: `1 1` x4, ui-plan `2 2`; word diff shows only six `**,` to `**:` swaps (`glyph)/2`, `` `gap` ``, `channel`, `groups`, `Analysis`, `Semantic`); R6 `6 6` | `**Analysis**:` reverted to a comma: R6 `5 5` |
| P1 / U3-1 | 🟡 | `17`, `17d16 < plugin/ultimate-tokens/skills/typography-tokens/references/prose.md	**sub-title**`; kept list minus K17: `kept-exact` | `**Probe**, a planted line` appended to `README.md`: `18`, `17a18 > README.md	**Probe**`, no `kept-exact` |
| P4 | 🟡 | `1` then `2`: the `1` is the rediagnosis record, the `2` is the admitted generated pair `figma/plugin/ui.html` and `src/ui/mcp-assets.js` (revision 5) | a planted `src/planted.js` (`git add -N`): R5 reads `1` |
| R1 false causes gone | 🟢 | `grep -cE 'U1 unmerged\|#761 added one'` on the handoff: `0` | pass 1 handoff at `41ef16fc`: `2` |
| R2 true chain named | 🟢 | `575e8334` `1`, `7c355327` `8`, `#759` `1` | at `41ef16fc`: `0 0 0` |
| R3, R4 | 🟢 | P1 row carries `` `17` `` (`1`); P6 row matches `54 test files passed.*#759` (`1`) | the same two greps on the pass 1 handoff at `41ef16fc`: `0`, `0` |
| R5 records only | 🟢 | `git diff --name-only 41ef16fc -- ':!.sdlc' \| wc -l` `0` | planted `src/planted.js`: `1` |
| R8 no dash, no bold label | 🟢 | `0` | a planted `**Note**: text` line in the handoff: `1` |
| P6 npm test | 🟢 | fresh clone at `c61728e8`: `✓ all 54 test files passed`, exit 0, `git status --short \| wc -l` `0` after | the builder's `"scrimX` control stands; not rerun here |
| Hygiene | 🟢 | `c61728e8` carries the Opus 5.5 co-author; no Seat trailer, which the adapter asks only of board commits | `b4d50ae5` prints `orchestrator` through the same trailer read |
