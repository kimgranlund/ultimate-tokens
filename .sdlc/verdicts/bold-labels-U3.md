---
kind: verdict
plan: bold-labels
unit: U3
ticket: "#752"
branch: unit/bl-U3
base: 7c355327
grade: pass 1 verifier-l1 (opus) evidence run; pass 2 verifier-l2 (opus, stand-in for verifier-l3 while fable is capped, same family per b9044bb), run by the Verifier seat; builder-l1 sonnet
pass: 2
written: 2026-09-29
---

# Verdict bold-labels U3 · 🔴 · the six colons are right and every plan row holds, but the handoff states two false causes

verdict: 🔴
sha: 41ef16fc1401686d1a88ce0eedba2cc725537a99

`unit/bl-U3` at `41ef16fc`, unit base `7c355327` (= `git merge-base 41ef16fc origin/plan/bold-labels`), plan-row base `06dc3766` (`git merge-base origin/main HEAD`). Evidence run: `bl-U3-verifier-l1-p1` in its own clone. `verdict.py check` passes on the handoff and the review, both created by the unit. The seat re-read the two red handoff lines and re-measured their causes itself.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U3-2 | 🟢 | `1 1 1 1 1 0 2`; the `0` is row 5, `git log -1 -S'easy to miss'` = `fc839d14` (#761) | at `7c355327`: `0 1 0 0 0 0 0`; `**Analysis**:` reverted to a comma: ui-plan `1` |
| Six lines | 🟢 | word diff of `84d107c2` prints only the six `,` to `:` swaps after the label; numstat `1 1` x4, `2 2` | the same diff from the wrong parent `7c355327` shows eleven extra reactivity lines |
| U3-3 | 🟢 | `0 0 0`; frontmatter identical on all five files | a `description:` edit prints `2` (plan's cell says `1`, finding 3) |
| U3-1 / P1 | 🟡 | `17`, diff only `< plugin/ultimate-tokens/skills/typography-tokens/references/prose.md	**sub-title**` (K17, reflowed mid-line by #761) | a planted `**Probe**, a planted line` in README.md: `18`, `18a18 > README.md	**Probe**` |
| P0 | 🟢 | `MERGED` `MERGED`; `fc839d14` and `ed759f6a` ancestors of the head | at `fb84cc29`: both `not ancestor` |
| P2 | 🟢 | `em-dash: clean (977 files scanned)`, added U+2014 `0` | a planted glyph: `FAIL: 1 em dashes`, exit 1 |
| P3 | 🟢 | `branding: clean (969 files scanned)`; plan added `67` removed `68`; unit `6`/`6` | a planted `**Planted**: text`: `added=68 removed=68` |
| P4 | 🟢 | vs `06dc3766` `0` then `2` (generated bundles, revision 5); vs `7c355327` `0 0` | a planted `docs/spec/planted.md`: `1` |
| P5 | 🟢 | `line-for-line` | the Analysis line split: `UNEQUAL 3	2	docs/reference/references/ui-plan.md`, exit 1 |
| P6 | 🟢 | `✓ all 54 test files passed`, exit 0, status `0` | `"scrimX`: `✗ 1/54 test file(s) failed`, exit 1 |
| P7 | 🟢 | `1`, `1`, `1` | the URL dropped from README line 6: `0` |
| P8 | 🟢 | head `3`, base `3` | the URL dropped: `2` |
| Merge | 🟢 | `git merge-tree --write-tree 84d107c2 7c355327` = `ab5b1816` = `aa60de32^{tree}` | neither parent's tree equals `ab5b1816` |
| Hygiene | 🟡 | Opus 5.5 co-author on all three; `%(trailers:key=Seat)` `41ef16fc []`, `aa60de32 [orchestrator]`, `84d107c2 []` | `7c355327` prints `[orchestrator]` through the same read |
| Handoff | 🔴 | `:10` says the 11 reactivity labels are missing because `U1 unmerged`: `git merge-base --is-ancestor 575e8334 5096d7fe` succeeds (U1 merged at `575e8334`; the `5096d7fe` main merge dropped the colons, restored at `7c355327`). `:15` says `#761 added one` test file: TESTS reads `53` at `347e7103~1`, `54` at `347e7103` (#759), `54` at `fc839d14~1` and `fc839d14` | the same reads confirm the handoff's true claims: row 5 by `-S` names `fc839d14`, P1 `28` at `84d107c2` |

### Findings

1. 🔴 Handoff `.sdlc/handoffs/bold-labels-U3.md` `:10` and `:15` give false causes: U1 was merged (`575e8334`), and #759, not #761, added the 54th test file. Records only: pass 2 corrects the two cells and updates the stale P1 `28` to the head's `17`. No product change is needed.
2. 🟡 P1 and U3-1 read `17`, not `18`: K17 no longer matches after #761. A plan defect awaiting revision 6 (`.sdlc/questions/bold-labels-revision6.md`, default A drops K17), not the unit's.
3. 🟡 Plan text for revision 6: U3-3's control expects `1`, a `description:` edit reads `2` (the `-` and `+` lines); U1's reactivity rows remove 11 labels, not 12 (B4 was already a colon on main), total removed `68`.
4. 🟡 `84d107c2` and `41ef16fc` carry no Seat trailer; the adapter requires one only on board commits.
5. The six edits, every plan row but P1 and the merge are right; the review record matches these measurements.

## Pass 2 · 🟡 · the handoff's causes now match the tree; P1 and P4 wait on revision 6 (cleared to merge)

verdict: 🟡
sha: 79b737d9730dfb0fa42b660fb423bc18dd431abe

`unit/bl-U3` at `79b737d9`. Pass 2 is records only: the Orchestrator's re-diagnosis `416a5312` (merged in at `b4d50ae5`), the builder's handoff `c61728e8` and review p2 `79b737d9`. The Verifier seat ran every row itself at L2. `verdict.py check` exits 0 on the handoff, the re-diagnosis and review p2, with only the no-control-column warning on non-evidence tables.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| Records only (R5) | 🟢 | `git diff --name-only 41ef16fc 79b737d9 -- . ':!.sdlc' \| wc -l` prints `0`, so every pass 1 product row (six edits, P2, P5, P6 `54`, P7, P8, U3-2, U3-3) stands on an identical tree | the unit's own `84d107c2` against its parent lists `5` files |
| Merge b4d50ae5 | 🟢 | `git merge-tree --write-tree 41ef16fc 416a5312` = `162b5f22` = `b4d50ae5^{tree}` | `416a5312` alone lacks the six edits, `41ef16fc` alone lacks the re-diagnosis file |
| False causes gone (R1) | 🟢 | `grep -cE 'U1 unmerged\|#761 added'` on the head handoff: `0` | on the pass 1 handoff at `41ef16fc`: `2` |
| True chain named (R2 to R4) | 🟢 | head: `575e8334` `1`, `7c355327` `8`, `#759` `1`; P1 row carries `` `17` `` `1`; P6 row matches `54 test files passed.*#759` `1` | the same five greps at `41ef16fc`: `0 0 0`, `0`, `0` |
| U1 cause, re-measured | 🟢 | `git merge-base --is-ancestor 575e8334 5096d7fe` succeeds; reactivity colon count `575e8334` `13`, `06dc3766` `2`, `5096d7fe` `2`, `7c355327` `13`, head `13`; `git diff --numstat 06dc3766 5096d7fe` on the file is empty, `5096d7fe^1` (`7841cf58`) to `5096d7fe` `13 13`, `7c355327^` to `7c355327` `11 11` | main's copy at `06dc3766` reads `2`, not `13`, so the count separates the two copies |
| Test-count cause, re-measured | 🟢 | `TESTS` entries parsed from `test/run.mjs`: `347e7103~1` `53`, `347e7103` `54`, `fc839d14~1` `54`, `fc839d14` `54`, head `54` | `fc839d14` leaves it at `54`, so #761 added none; a naive line grep over the array reads `6` at every commit, which is why the count parses the array |
| Row 5 | 🟢 | `git log -1 --format=%h -S'easy to miss' 79b737d9 -- .claude/skills/adding-semantic-roles/SKILL.md` prints `fc839d14` | pass 1 U3-2 control at `7c355327` reads `0` for the row as well |
| Six edits (R6) | 🟢 | numstat vs `06dc3766` over the five files sums `6 6` | pass 1 control: `**Analysis**:` back to a comma reads `5 5` (review p2 and the re-diagnosis agree) |
| R8 | 🟢 | added lines in the handoff vs `06dc3766` matching U+2014 or a bold label with a colon: `0` | the head handoff plus a planted `**Note**: text` line: `1` |
| P1 / U3-1 | 🟡 | P1 predicate over `git grep` at `79b737d9` (`.sdlc` excluded): `17`, `diff` prints only `17d16 < ...typography-tokens/references/prose.md	**sub-title**`; the kept list without K17 prints `kept-exact-minus-K17` | a planted `README.md	**Probe**` hit: `18a18 > README.md	**Probe**` |
| P4 | 🟡 | first count `1`: `.sdlc/plans/bold-labels-U3-rediagnosis.md`, the Orchestrator's record, not admitted by the plan's wall regex `bold-labels(\.md\|-kept\.tsv)`; second count `2`, the admitted generated pair `figma/plugin/ui.html`, `src/ui/mcp-assets.js` | pass 1 control stands (a planted `docs/spec/planted.md` reads `1`); the revision 6 draft in `.worktrees/plan-bold-labels` admits `-U[0-9]+-rediagnosis\.md` |
| Review p2 | 🟢 | `.sdlc/reviews/bold-labels-U3-review-p2.md` at `79b737d9` reads `PASS`; its causes, counts and R-rows match every figure above | its R1 control on `41ef16fc` reads `2`, as mine does |
| Hygiene | 🟡 | `c61728e8` and `79b737d9` carry the Opus 5.5 co-author and no Seat trailer (`%(trailers:key=Seat)` prints empty); `416a5312`, `b4d50ae5` print `orchestrator` | the same read on `b4d50ae5` prints `orchestrator`, so an empty read means absent |

### Findings (pass 2)

1. 🟢 Pass 1's only red is cleared: the handoff now states the merged-at-`575e8334`, dropped-by-`5096d7fe`, restored-at-`7c355327` chain and #759 for the 54th test file, and each re-measures true.
2. 🟡 P1 and U3-1 read `17`, K17 alone; revision 6 (default A of `.sdlc/questions/bold-labels-revision6.md`) must land on `plan/bold-labels` before pre-land, or pre-land's P1 stays yellow.
3. 🟡 P4 reads `1` on the Orchestrator's re-diagnosis record; the plan's wall, not the unit, is short. Revision 6's draft admits it; until it lands the row is yellow.
4. 🟡 The builder and review commits carry no Seat trailer (adapter asks it only of board commits; precedent rates it yellow).
