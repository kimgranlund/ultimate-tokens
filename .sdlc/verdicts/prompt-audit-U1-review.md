FAIL

# Review prompt-audit U1 pass 1 · #758 consumer plugin prose

Reviewer, fresh context, 2026-09-28. Branch `unit/pa-U1` at `0fd362bb`. `B` = `8f5c6dc0` (merge base with `origin/main`, also the merge base with `plan/prompt-audit`). Baseline files for the negative controls were extracted with `git archive 8f5c6dc0 plugin`. Edit-based controls ran in a throwaway clone (`git clone -q --shared`), clone head `0fd362bb`.

## Gate

| Gate | Result | Evidence | Negative control |
|---|---|---|---|
| `npm test` (full, in the worktree, foreground-then-polled) | 🟢 | `✓ all 53 test files passed`, `EXIT 0`, 19m43s wall under load average 67 to 136; `git status --short` empty after | not applicable to the gate itself; the per-row controls below prove the pins bite |

## Criteria

| Id | Result | Evidence at 0fd362bb | Negative control |
|---|---|---|---|
| U1-1 | 🟢 | `0`, `0`, `3`, `1`, engine `15` | files at `B`: `3`, `1`, `0`, `0` |
| U1-2 | 🟢 | header `1`, rows `15`, box rows `2`, universal-ramp `0`/`0`/`0`, engine `true false`. Independent check: every table row's Steps cell equals the step set `typeTokensCSS` emits for that voice (13 voices `sm/md/lg`, `ui-control`/`ui-widget` `xs/sm/md/lg/xl/2xl`), and every Font role cell matches the `cat("<role>", ...)` first argument in `src/engine/type.mjs:96-121` | files at `B`: `0`, `0`, `0`, then `1`, `1`, `1`; the row grep with bare pipes prints `145` of 145 lines |
| U1-3 | 🟢 | `0` and `0`, `1`, `1`, engine `contrast fixed,contrast`. Law 6's contrast-mode wording matches `applyOnColorContrast` (`src/engine/semantic.js:292`, a no-op unless `contrast`) | files at `B`: `1` and `1`, `0`, `0`; in the clone, rewriting law 6 back to `default fixed light` prints `1` and `0` |
| U1-4 | 🟢 by its greps, see finding R1 | `0` and `0`, `1`, `1`, `1` | files at `B`: `1` and `1`, `0` |
| U1-5 | 🟢 | `0` for each of the four files | files at `B`: `5`, `1`, `3`, `4` |
| U1-6 | 🟢 | voice-parity PASS (`15 voices`), role-parity PASS, dimension-parity PASS, three `exit 0` under pipefail | clone: appending `` `--type-label-3xl-size` `` prints `✗ SKILL.md: --type-label-3xl-size, unknown step "3xl"`, `exit 1`; appending `xl` instead stays `exit 0` (the union-check gap U2 closes, as the plan predicts) |
| U1-7 | 🟢 | exactly the eight scope-wall paths | clone: a committed `stray.md` shows up in the same filter (count `1`) |
| Step 5 / P5 | 🔴 | the handoff's findings table carries `F1`, `F2` with states `fixed`/`intended`; `grep -c "^| $id |"` prints `0` for each of C1 C2 T1 T2 T3 T4 S1 S2 S3 S4, and the `(applied|amended|dropped)` row grep prints `0` (expected `10`) | a handoff with the ten rows would print `1` per id; bare-pipe form counts every line |
| P3 (unit share) | 🟢 | `branding: clean (785 files scanned)`, `em-dash: clean (793 files scanned)`, `exit 0`, added-line U+2014 count `0` | not rerun; the gates' own suites carry their fixtures |
| P6 (unit share) | 🟢 | added-line history ids `0`; removed `2` (U1's share of the fossil sum) | fixture `+the rule (TKT-0010)` prints `1` through the same filter |

## Findings

| Id | Severity | Finding | Fix |
|---|---|---|---|
| R1 | High | T4 is only partly applied. `plugin/ultimate-tokens/skills/typography-tokens/SKILL.md:79-80` still reads "There's no separate "quote"/"caption"/"legal"/"UI" voice, those jobs live on `lead`, `tiny`, `body`, and `label` respectively." That is the exact quote the evidence's T4 row names. It routes the UI job to `label`, two sentences after the rewrite says operable chrome is `UI-control`, and it denies the two UI voices the table now lists. U1-4's greps do not reach this sentence, so the row is green while the finding stands | drop `"UI"` and `label` from that sentence (quote, caption and legal map to `lead`, `tiny`, `body`), or state that UI text lives on `UI-control`/`UI-widget` |
| R2 | High | U1 step (5) requires the handoff to carry the P5 findings table: one row per finding id (C1 C2 T1 T2 T3 T4 S1 S2 S3 S4) with state `applied`, `amended` or `dropped`, and an `amended`/`dropped` row naming its proving command. The handoff has none of the ten rows, so P5 is red for U1 at pre-land | add the ten rows to `.sdlc/handoffs/prompt-audit-U1.md` in the pinned shape |
| R3 | Low | `references/interface.md:55-56` says "sm/md/lg, or the box voices' xs/sm/md/lg/xl/2xl", but SKILL.md:36 names Kicker a box voice (engine agrees: `kicker` emits `-line-single`) and Kicker is `sm/md/lg`. Say "the two interactive voices'" instead | reword |
| R4 | Low | the handoff's Branch line names prose commit `4b7afda3` and a green `npm test` there; HEAD is `0fd362bb` (a later prose commit). This review's full run at `0fd362bb` is green, so only the record is stale | refresh the Branch line on the next pass |

C1 caveat, not a finding: the rewritten law 6 keeps `BOTH` capitalized, a trace of the evidence's G1a shouting note; it now describes the fixed mode accurately, so it is left to the builder.

verdict: 🔴
