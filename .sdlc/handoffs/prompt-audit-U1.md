# Handoff prompt-audit U1 · #758 consumer plugin prose

Builder, pass 1 (resumed after a session restart mid-pass). Written 2026-09-28.

## Branch

`unit/pa-U1`, worktree `.worktrees/pa-U1`. Prose commit `4b7afda3` on top of `8f5c6dc0`. `npm test` green in the worktree (53 test files passed, tree clean after: only the eight U1 files modified).

## Criteria

Positive commands ran in the worktree; expected values are the plan's.

| Id | Result | Evidence |
|---|---|---|
| U1-1 | 🟢 | thirteen `0`, eleven-role `0`, `fifteen[- ](voices?\|role)` `3` on SKILL.md, README `fifteen-voice` `1`, engine `15`. |
| U1-2 | 🟢 | header row `1`, engine-voice rows `15`, box rows `2`, universal-ramp claims `0` in all three files; engine emits `--type-ui-control-2xl-size` and not `--type-body-xl-size` (`true false`). |
| U1-3 | 🟢 | `fixed light` `0` and `0`; `default, \`onColorMode: contrast\`` `1`; `\`onColorMode: fixed\`` `1`; engine `contrast fixed,contrast`. |
| U1-4 | 🟢 | `chrome (→\|is) \`label\`` `0` and `0`; `UI-control` in prose.md `1`; body-for-prose-you-read `1`; engine `Label` static line present. |
| U1-5 | 🟢 | ids and dates `0` for all four files. |
| U1-6 | 🟢 | voice-parity PASS (15 voices), role-parity PASS, dimension-parity PASS, each `exit 0` under pipefail. |
| U1-7 | 🟢 | the merge-base diff is exactly the eight scope-wall paths. |

## Controls

| Row | Control | Result |
|---|---|---|
| U1-6 | appended `` `--type-label-3xl-size` `` to SKILL.md (backup restored after) and ran voice-parity | prints `✗ SKILL.md: --type-label-3xl-size, unknown step "3xl"`, `exit 1` (as planned) |
| U1-1..5 | the pre-edit text at HEAD~ is the negative state | git diff shows the stale phrases the greps count (thirteen, eleven-role, fixed light, TKT/SPEC/ADR ids, `chrome → label`) removed |

## Findings (P5)

| Id | Finding | State |
|---|---|---|
| F1 | the first draft printed 2 on U1-1's third grep (line-based count); the body intro now says `a fifteen-voice set`, giving 3 | fixed |
| F2 | law 6 also names the fixed mode in `references/feedback.md`, worded `under the fixed mode` | intended |

Quoted dashed lines (P3): none.
