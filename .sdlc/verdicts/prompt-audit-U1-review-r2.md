PASS

# Review prompt-audit U1 pass 2 · #758 consumer plugin prose

Reviewer, fresh context, 2026-09-28. Branch `unit/pa-U1` at `0e507d10`. `B` = `8f5c6dc0` (merge base with `origin/main` and with `plan/prompt-audit`, both read by command). Baseline files came from `git archive 8f5c6dc0 plugin`. Edit-based controls ran in a scratch clone (`git clone -q --shared`) at `/private/tmp/claude-501/pa-U1-r2-8182/neg`, head `0e507d10`, reset after each control.

## Round 1 findings

| Id | Result | Evidence at 0e507d10 | Negative control |
|---|---|---|---|
| R1 | 🟢 fixed | `typography-tokens/SKILL.md:79-81` now reads "quote"/"caption"/"legal" voice on `lead`, `tiny`, `body`, and "UI text lives on `UI-control`/`UI-widget`". `grep -c '"UI" voice'` prints `0`; no line in `plugin/ultimate-tokens` routes UI or chrome text to `label` | the file at `0fd362bb` restored in the clone prints `1`; restored head prints `0` |
| R2 | 🟢 fixed | P5 id greps print `1` for each of C1 C2 T1 T2 T3 T4 S1 S2 S3 S4; the bracketed ERE prints `10`; every row is `applied`, so no row owes a proving command | clone: deleting the T4 row prints `0` for T4 and `9` for the ERE; the bare-pipe ERE prints `44`, the file's line count |
| R3 | 🟢 fixed | `interface.md:55` says "the two interactive voices'"; engine box voices are `Kicker,UI-control,UI-widget`, so "box voices" would have been wrong and "interactive voices" is right | `0fd362bb`'s interface.md counts `1` for `the box voices'`; head counts `0` |
| R4 | 🟢 fixed | the Branch line names `4b7afda3`, `0fd362bb` and "the review-fix commit (see `git log`)", and claims green at the final head; this review's run at `0e507d10` agrees | not applicable, a record line |
| `BOTH` | 🟢 in scope | `color-tokens/SKILL.md:90`, law 6, `BOTH` to `both`; the file is in U1's wall and the line is C1's rewritten law, the round 1 caveat. `grep -n BOTH` on the file prints nothing | not applicable, a case change |

## Criteria

| Id | Result | Evidence at 0e507d10 | Negative control |
|---|---|---|---|
| U1-1 | 🟢 | `0`, `0`, `3`, `1`, engine `15` | files at `B`: `3`, `1`, `0`, `0` |
| U1-2 | 🟢 | header `1`, rows `15`, box rows `2`, universal ramp `0`/`0`/`0`, engine `true false` | files at `B`: `0`, `0`, `0`, then `1`, `1`, `1`; the row grep with bare pipes prints `140`, every line of the `B` file |
| U1-3 | 🟢 | `fixed light` `0` and `0`, `1`, `1`, engine `contrast fixed,contrast` | files at `B`: `1` and `1`, `0`, `0`; clone: rewriting `` default, `onColorMode: contrast` `` to `default fixed light` prints `1` and `0` |
| U1-4 | 🟢 | `0` and `0`, `1`, `1`, `1` | files at `B`: `1` and `1`, `0` |
| U1-5 | 🟢 | `0` for each of the four files | files at `B`: `5`, `1`, `3`, `4` |
| U1-6 | 🟢 | voice-parity PASS (`15 voices`), role-parity PASS, dimension-parity PASS, three `exit 0` under pipefail | clone: appending `` `--type-label-3xl-size` `` prints `✗ SKILL.md: --type-label-3xl-size, unknown step "3xl"` and `exit 1` |
| U1-7 | 🟢 | exactly the eight scope-wall paths | clone: a committed `stray.md` passes the same filter (count `1`) |
| Step 5 / P5 | 🟢 | see R2 | see R2 |
| P3 (unit share) | 🟢 | `branding: clean (786 files scanned)`, `em-dash: clean (794 files scanned)`, `exit 0`; added-line U+2014 count `0` with and without the backtick strip | the gates' own suites carry their fixtures, exercised inside `npm test` |
| P6 (unit share) | 🟢 | added-line history ids `0`, removed `2` | fixture `+the rule (TKT-0010)` prints `1` through the same filter |

## Gate

| Gate | Result | Evidence | Negative control |
|---|---|---|---|
| `npm test` (full, in the worktree) | 🟢 | `✓ all 53 test files passed`, `EXIT 0`, 603 s wall at load average 105 to 129; `git status --short` prints `0` after. Started in the foreground at timeout 600000; the harness moved it to the background at the 600 s ceiling and it exited 3 s later, awaited by a monitor, not left idle | not applicable to the gate itself; the per-row controls above prove the pins bite |

## Handoff control column (hook warning)

The handoff's Criteria table (`| Id | Result | Evidence |`) has no Negative control column; controls sit in a separate Controls table covering U1-6 and "U1-1..5", and U1-7 has none. The U1-1..5 control names "the pre-edit text at HEAD~", which at `0e507d10` resolves to `9be7a18f`, a verdict commit whose tree already carries the rewritten prose, so that line no longer names a negative state. This does not change the verdict: plan step 5 asks the handoff for the P5 table and the P3 list only, and every criterion's control was rerun here against `B` and in the clone. Recorded as L1.

## Findings

| Id | Severity | Finding | Fix |
|---|---|---|---|
| L1 | Low | handoff Criteria table lacks a Negative control column; its "HEAD~" control reference is stale (see above) | optional: name `8f5c6dc0` as the negative state on the next record touch |

No High or Medium finding.

verdict: 🟢
