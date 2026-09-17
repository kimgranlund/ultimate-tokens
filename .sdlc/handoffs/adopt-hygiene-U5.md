# Handoff U5 · builder-l1 → reviewer

| Field | Value |
|---|---|
| Branch | unit/hygiene-U5 @ 806bc03, plus this unit's commit |
| Files | `.claude/settings.json` only — removed the `worktree: { bgIsolation: "none" }` block |
| Human answer | A (`.sdlc/questions/adopt-hygiene-bgisolation.md`): drop it from the branch, keep it only in the local checkout while the drill runs |
| Ran | every U5 criterion + negative control below |
| Left out | nothing in scope; `npm test` is red for a reason outside this unit (see note) |

## U5 criteria (3 total)

| # | Criterion | Result | Negative control |
|---|---|---|---|
| 1 | committed settings carry no `worktree` block; everything else unchanged | `true`, `0` 🟢 | at 39b78dc: `false`, `1` 🟢 (matches) |
| 2 | valid JSON, plugin flags from f9e20c5 kept | `true false` 🟢 | trailing comma planted on a scratch copy: `node` throws (`SyntaxError`), restored 🟢 |
| 3 | `npm test` green, tree clean | 🔴 `FAIL: 2 branding violation(s)`, `1/44 test file(s) failed`; tree clean otherwise (only `.claude/settings.json` modified) | — |

## Note on criterion 3

The red is not caused by this unit's change. `test/repo/branding.mjs` fails on
`.sdlc/verdicts/adopt-hygiene-U1-review.md` (P4 row: it names the retired maker brand and its
domain). That row's fix is already committed on `unit/hygiene-U4` @ 8ebf172
("paraphrase retired brand in U1 review") but `unit/hygiene-U4` has not merged into `sdlc/adopt`
yet — the plan head (`806bc03`) that this unit's worktree branched from still carries the
unparaphrased row. Confirmed by diffing `806bc03:.sdlc/verdicts/adopt-hygiene-U1-review.md`
against `unit/hygiene-U4`'s copy: only the P4 cell differs, exactly the U4 fix.

This unit's scope is `.claude/settings.json` only (per plan); it does not touch
`.sdlc/verdicts/`. Once U4 merges ahead of or alongside U5, `npm test` on the merged tree will
be green with no further action needed here.

**Combined-tree verification (2026-09-17).** `git worktree add --detach /tmp/u5-probe fe89fc9`,
`git -C /tmp/u5-probe merge --no-commit --no-ff 8ebf172` (U4's head) merged clean; `npm test`
there printed `✓ all 44 test files passed`. Probe removed
(`git worktree remove /tmp/u5-probe --force`). Confirms U5 + U4 together are green; the
criterion-3 red on U5 alone is exactly the missing U4 merge, nothing else.

## Plan-level scope wall

No file outside `.claude/settings.json` changed. No `--no-verify`. `.sdlc/board.md` untouched.
