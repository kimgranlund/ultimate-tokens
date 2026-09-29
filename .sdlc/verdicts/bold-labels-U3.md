---
kind: verdict
plan: bold-labels
unit: U3
ticket: "#752"
branch: unit/bl-U3
base: 7c355327
grade: verifier-l1 (opus), the evidence run dispatched by the Verifier seat; builder-l1 sonnet
pass: 1
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
