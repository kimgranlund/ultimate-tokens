# Handoff U6 · builder → reviewer

Plan `records-followup` (#709), unit U6. Branch `unit/rf-U6`, cut from `plan/records-followup` @ `e0e5b551a8aec3f1b0e0d53182ecc2d441af83f6` (`BASE` = `UB` = `e0e5b551`).

| Field | Value |
|---|---|
| Branch | unit/rf-U6 @ (this commit) |
| Files | .sdlc/plans/archive/records-refresh-corrections.md (new), .sdlc/plans/archive/records-refresh.md, .sdlc/verdicts/records-refresh-prepr-review.md (new), .sdlc/verdicts/architecture.md, .sdlc/verdicts/records-refresh-U1.md, .sdlc/verdicts/survey.md, .sdlc/verdicts/records-refresh-checkability.md, .sdlc/verdicts/records-refresh-prepr.md, .sdlc/adapter.md, .sdlc/handoffs/records-refresh-U3.md, .sdlc/verdicts/records-refresh-U3.md, .sdlc/handoffs/records-followup-U4.md, plus this handoff |

## What was built

F8's archive correction: `.sdlc/plans/archive/records-refresh-corrections.md` (`kind: corrections`, four archive rows: P2, U2-7, lines 306/342, the closing sentence), one appended `## Revisions` row on the archived plan, the pre-land review copied byte for byte to `.sdlc/verdicts/records-refresh-prepr-review.md`, and one appended note under `architecture.md`'s pass 5.

U4 review 2's seven notes (N1 to N7), added as a second section of the same corrections file and applied to the live records: N1 and N2 are restorations of program output (the runner's `FAIL` line derived with the plan's own `perl` command, and the smoke `missing <ROOT>/dist/...` line from a real run in a throwaway `--shared` clone with no `dist/`), N3 to N5 rewrite the verbatim-quote amendment in `.sdlc/adapter.md`, N6 fixes two wording errors in the U3 history files, N7 appends a correction line to the U4 handoff.

## Runs

| Criterion | Command(s) | Printed |
|---|---|---|
| 1 | corrected-commands check (see plan) | `ui.html 3780.5 KB`; `1`; `1`; `1` |
| 2 | `shasum -a 256` on the copied review | `6a3a285e91555f7b545a828969402d227e35c58626ec47e473bf273f041c1481` (matches) |
| 3 | archive numstat + corrections-row grep | `1\t0\t.sdlc/plans/archive/records-refresh.md`; `1` |
| 4 | corrections-file row/source checks | `1`, `3`, `1`, `7`, `1` |
| 5 | architecture.md numstat + board check | `2\t0\t.sdlc/verdicts/architecture.md` (blank separator line + note); `found 0`; `exit 0` |
| 6 | N1/N2 restoration checks | `1`; `1`; `1,1,1`; `0`; **`1` (plan expects `0`, see Left out)**; `0`; `1,1,1` |
| 7 | N3-N7 rule/correction checks | `1`, `1`, `0`, `1`, `1`, `1` |
| 8 | dash count + P6 + P4 + U4-3 + U4-4 | `4`; `0`; `branding: clean (476 files scanned)`, `exit 0`; `0`; `1` five times |
| 9 | scope wall (13 paths) + per-file removed counts | 13 paths (below); history-file removed-line counts `1,1,1,1,1,1,1,0` |

Scope wall's 13 paths (`git diff --name-only $UB`, sorted): `.sdlc/adapter.md`, `.sdlc/handoffs/records-followup-U4.md`, `.sdlc/handoffs/records-followup-U6.md`, `.sdlc/handoffs/records-refresh-U3.md`, `.sdlc/plans/archive/records-refresh-corrections.md`, `.sdlc/plans/archive/records-refresh.md`, `.sdlc/verdicts/architecture.md`, `.sdlc/verdicts/records-refresh-U1.md`, `.sdlc/verdicts/records-refresh-U3.md`, `.sdlc/verdicts/records-refresh-checkability.md`, `.sdlc/verdicts/records-refresh-prepr-review.md`, `.sdlc/verdicts/records-refresh-prepr.md`, `.sdlc/verdicts/survey.md`.

## Gates

`npm test` with no `node_modules` present: `✓ all 48 test files passed`, exit 0, no drift from the `gen:*` regeneration step (`git status --short` unchanged at 13 lines, exactly the 13 files this unit touches). `node test/repo/branding.mjs`: `branding: clean (476 files scanned)`, exit 0.

## Left out / disagreement

Criterion 6's fifth sub-check (the plan's `git grep` sweep for the two old un-rooted forms of the smoke line, outside `plans/`) prints `1`, not the plan's expected `0`. The extra hit is `.sdlc/verdicts/records-followup-U4.md:30`, the reviewer's pass-2 verdict, which names the old smoke phrase as descriptive prose citing where the defect sat ("The quote is cut before the dash, unmarked, in `.sdlc/verdicts/survey.md:11`..."). That file was committed at `18e00516`, after `b9e70950` (the head the plan's own "fold simulated at b9e70950 in a clone" was measured against), so it did not exist in the plan author's simulation and the expected `0` does not account for it. It is not one of the three files N2 names (`survey.md`, `records-refresh-checkability.md`, `records-refresh-prepr.md`), and it is not in the plan's own §Texts N2 scope, so it is not edited here; editing it would also add a 14th path past criterion 9's wall. Recorded as a disagreement, not adjusted on either side, per the brief.

Nothing else was left out. All other measured values matched the plan's stated expectations on the first measurement taken after this handoff existed and the tree was committed.

Two authoring bugs were caught and fixed by the post-commit measurement pass itself (not plan disagreements, my own construction errors, fixed before this final record): the double-backtick spans in N2's three restored files needed a nested single-backtick pair around the whole quote (`` `content` `` , not `` content ``) for the P6 strip to consume the whole span; and the corrections file's own N2 documentation row had re-quoted the restored line's em dash directly, adding a fifth raw dash the plan's enumerated four does not expect, fixed by describing the byte instead of repeating it. Both were caught because the untracked corrections file was invisible to `git diff` until staged, so the first pre-commit pass of criterion 8 under-counted; this second, post-commit pass is the real one.
