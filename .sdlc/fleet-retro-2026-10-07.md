# Fleet retro, ultimate-tokens, 2026-10-07

Measure only. Counts and costs are from `fleet_collect.py collect . --since 2026-10-06`: 31 deduped runs, $62.05, 21119 s of run time, 1 interrupted, 0 limit markers. By role: scout 2 ($0.54), architect 1 ($10.32), planner 3 ($22.17, 4013 s), filer 1 ($0.33), builder 8 ($10.97, 5420 s), verifier 7 ($9.44), solo 9 ($8.28, 8160 s). docs-reconcile alone is $45.79 on `board.py`.

## Part 1: environment (run just now)
1. Plugin path: `/Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.0` (holds `scripts/tickets.py`). The docs-reconcile chain ran under 0.20.11 and the 10-issue fanout under 0.20.11; 0.21.0 only for the #778 start.
2. `claude --version`: 2.1.292 (Claude Code).
3. `date`: Wed Oct 7 05:52 PDT 2026. `uptime`: load averages 14.70 12.09 9.76, 20 CPUs.

## Part 2: findings, ranked by cost

| Symptom | Evidence | Mechanism | Cost | Mark | Prevention |
|---|---|---|---|---|---|
| Planner ran 3 times (plan, then two replans) on docs-reconcile | `fleet_collect` planner count 3, `steps.py next` printed `replan` twice, `.sdlc/docs-reconcile/step-1.superseded-*`, `step-3.superseded-1` | Plan-written guards contradicted real tool behaviour: onboard adds `A` entry files that a guard demanded be `R100`; a required link edit dropped rename similarity to 33% so git reported D+A | planner $22.17 and 4013 s total, plus 2 wasted builder runs | [V] | Have the planner dry-run every guard on a temp copy before the split, and name `-M` similarity risk when a step edits a renamed file |
| Step 1 builder blocked before any work | `.sdlc/docs-reconcile/step-1.superseded-1/builder-L2.md` (stale lane) | The plan said the conductor creates `.worktrees/docs-reconcile`; the first run launched in main | 1 builder run, about 10 min | [V] | `dispatch.py prepare` or `run.sh` should create or check the plan worktree named in the handoff |
| Two fanout lanes red on the gate | `.worktrees/fanout/logs/gate-a-T-0005-1-a1.log`, `gate-e-T-0011-1-a1.log` (em-dash FAIL) | The lane commit included `verifier-L3.log` and `.run.lock`, which fail `test/repo/em-dash.mjs` | manual strip, amend and rerun of `npm test` on integration, about 15 min | [V] | `fanout.py` should never stage `*.log`, `.run.lock`, `*.attempt.json` |
| T-0009 (#784) solo run produced no change | `c-T-0009-verifier.log`, verdict `fail` in `.sdlc/gh-784/verifier-L3.md` | The solo agent hit a design choice (which fix) and stopped with a report only, the ticket gave no decision | solo run 824 s, one verifier run, one full rerun after the user chose | [V] | A design-choice ticket should be asked before the fanout (clarify), or the handoff names the default |
| Verifier could not finish the 14 min full sweeps | solo report for T-0009: two verifier runs killed at the 20 min limit | `npm run gate:sweeps` (about 14 min under load) does not fit the verifier time budget | 3 verifier runs, about $3 [U] on the exact figure | [V] | Give the verifier a longer limit for sweep criteria or record the conductor's own sweep run as the evidence |
| 0.21.0 scout dispatch cannot spawn | `dispatch.py prepare scout L1` prints model `claude-haiku-4-5`; Agent schema accepts only the alias; hook denies the alias; a stale `scout-L1.attempt.json` then blocked the next `prepare` until `run_lifecycle.py recover` | Model value in the dispatch row does not match the Agent tool enum | about 10 min and 1 extra scout run | [V] | Fixed patch (author says in progress); keep `run.sh` fallback until then |
| What keeps me from more parallel lanes | `uptime` load 14.7 of the 60 target; the lane report listed overlaps (a/b/c/e on `figma/plugin/ui.html`, a/b/e on `test/ui/headless-boot.mjs`); the user's "economical with GitHub Actions" rule | Not CPU: file overlap on shared files and generated artifacts, one push and one PR by user rule, and only 10 approved tickets (the other 4 open issues are claimed, blocked, big or owner-only) | 6 lanes for 10 tickets, solo run time 8160 s | [V] | Regenerate shared artifacts at merge instead of in lanes; have `plan_check` flag generated-file overlap before launch |

Faster: batching all 10 issues on one integration branch gave one push, one PR and one CI run (`gh run view 37620810393`, success) instead of ten. Prevention: keep. [V]

## Decisions blocked on the user (Part 2, question 3)
- Approach for docs migration and scope for .sdlc audit (before any work).
- Four architect decisions (data stays at `docs/reference/`, leave finished records, plan archive, local commits).
- Publish approvals: commit-only vs push vs merge for #801 and #802, then which issues to batch.
- Design choice for #784 (Fix III), the one blocker the solo agent could not decide.
- Waiting time on these was not measured. [U]

## Could not verify
- Per-ticket cost of the 10 fanout lanes: the lane worktrees and `report.md` were removed after merge. [U]
- Exact verifier cost of the killed sweeps runs. [U]
- Time lost per row is my estimate from log timestamps, not collector output, except where a count or dollar figure is quoted. [U]
