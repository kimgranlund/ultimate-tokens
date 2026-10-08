# Fleet retro, ultimate-tokens, 2026-10-08

Measure only. Numbers are from `fleet_collect.py collect . --since 2026-10-07`: 91 deduped runs, $260.60, 0 interrupted, 0 limit markers. By role: planner 11 ($67.84), builder 26 ($78.88), verifier 27 ($47.87), architect 4 ($30.46), plan-reviewer 6 ($25.83), solo 12 ($8.28, 8160 s), filer 4 ($1.20), scout 1 ($0.25). By lane: full 77 runs ($248.47), solo 14 ($12.13). Plan review share 0.3594. 3 runs unmetered.

## Part 1: environment (run just now)
1. Plugin path: `/Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts` (holds `tickets.py`). Most of the window ran under 0.21.2; I updated mid-day.
2. `claude --version`: 2.1.294 (Claude Code).
3. `date`: Thu Oct 8 06:04 PDT 2026. `uptime`: load averages 6.75 6.09 5.38, 20 CPUs.

## Part 2: findings, ranked by cost

| Symptom | Evidence | Mechanism | Cost | Mark | Prevention |
|---|---|---|---|---|---|
| T-0017 (Maison geometry) planned 6 times and plan-reviewed 3 times before it built | collector `by_ticket` geometry-maison-ladder planner 6, plan-reviewer 3; `.sdlc/geometry-maison-ladder/planner-L3*.md`, `plan-reviewer-L1*.md` | Each review found small, concrete gaps (a guard contradicting a Do line, a test file with no owning step); the second replan verdict stopped the task for the user, who lifted it once, then a third replan verdict was overridden | planner $67.84 and plan-reviewer $25.83 across all tickets; per-ticket split unmeasured [U] | [U] | Let the reviewer's findings of the "add a Note to step N" kind pass as builder Notes without a replan; stop rule counts only structural findings |
| Build blocked twice on citation line numbers (T-0017 step 13) and once on the same cause in T-0015 | `.sdlc/geometry-maison-ladder/step-13.superseded-1`, `step-13.superseded-2`; `steps.py widen` refusal text | The `steps.py widen` allow-list form was refused (plan defect), and a prose guard forbade rewording a cite whose subject was removed, so two replans were needed for doc-only edits | 2 planner L3 runs plus 2 extra step-13 builder runs, 7 + 13 minutes wall [V] | [V] | Plan template: any step that shifts lines in a cited file owns `repo/citations.mjs`, with a `before <ADR>` rewording rule from the first plan; let `widen` take a path list |
| A step builder's final message was not written to its result file | every builder and verifier this window needed my transcript-extraction fallback before `dispatch.py record` (I used a helper script, e.g. `step-4/builder-L3.md` written by me) | The sub-agent reports its final text as the message; the file is only written if the agent also calls Write | about 1 minute per role, 30+ roles [V] | [V] | `dispatch.py record` reads the transcript's last assistant message when the result file is absent |
| Gate sweeps do not fit one foreground call | `gate:sweeps` ran as 8 separate `gate_lock.py` legs in builder and verifier reports (e.g. T-0015 step 4, T-0017 step 14) | The 8 legs total 14 to 30 minutes, past the 600 s Bash cap | 8 legs run serially by each of a builder and a verifier, about 30 min each [V] | [V] | A `gate_lock.py sweeps` subcommand that runs the legs in parallel within the slot limit and prints one verdict |
| My own context needed sdlc state after compaction | session compacted twice; I rebuilt helper scripts (`rec.sh`, `commit-next.sh`, `prompt.sh`) under the scratchpad | Per-step routing (record, next, prepare, commit, spawn) is 4 to 5 commands I repeated 14 times per ticket | about 5 conductor turns per step, unmeasured | [U] | A `steps.py advance <task dir>` that records, routes, commits and prints the next dispatch |
| Solo lanes made small tickets cheap | collector: solo 14 runs, $12.13 vs full lane 77 runs, $248.47; T-0019 and T-0020 each took one solo plus one verifier | `fanout.py prep` and `land` carry the lane, gate and close | solo ticket about $1 vs full-lane step about $3 to $5 per step [U on the per-ticket split] | [U] | keep |
| Lane commits no longer stage logs and lock files | 0.21.2 `land` merged T-0019 and T-0020 with no `.log` or `.run.lock` in the commit (`git diff --stat main fanout/2026-10-07`) | The earlier retro finding (T-0339, T-0341) shipped | the two red gates and 15 minutes of the prior retro, now gone [V] | [V] | keep |

## Decisions blocked on the user
- T-0017 third replan verdict: override and fold findings into step Notes (answered), and the step 13 widen (answered).
- Haiku 5.5 eval rerun waits on the user rotating an API key; the old key was exposed in a screenshot. Waiting time unmeasured [U].
- #748 (Lemon Squeezy walk) and #377 (domains) remain the user's.

## Could not verify
- Per-ticket cost of T-0017: the collector reports counts by ticket but dollars only by role and lane. [U]
- Time lost per row beyond the quoted wall times: my estimates from timestamps, not collector output. [U]
- Whether the 5.5 string-typed `families` quirk (sent to the maintainer) reproduces for other tools. [U]
