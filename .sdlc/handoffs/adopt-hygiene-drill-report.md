# Adoption drill report · ultimate-tokens → sdlc-orchestration

Written 2026-09-17 by the target repo's Conductor. Progress plus plugin findings the drill surfaced.

## Progress

| Item | State | Where |
|---|---|---|
| Plan adopt-hygiene, 7 units | 🔵 6/7 merged on `sdlc/adopt`, U7 in pass 3 | `.sdlc/board.md` |
| Pre-land record | 🔴 rerun pending after U7 | `.sdlc/verdicts/adopt-hygiene-prepr.md` |
| Ticket | 🟢 GitHub #643 (mirrored from local T-0001 when U2 switched the preset) | `.sdlc/questions/adopt-hygiene-ticket-backend.md` |
| Human decisions taken | 🟢 7 | `.sdlc/questions/adopt-hygiene-*.md` |

## Plugin findings

| # | Finding | Evidence | Suggested owner |
|---|---|---|---|
| 1 | `agents/verifier.md` lists no `Agent` tool, yet its procedure dispatches `verifier-l<n>`; pre-land could not run | `plugins/sdlc/agents/verifier.md` line 6; `.sdlc/questions/adopt-hygiene-prepr.md`. I added `"Agent"` in your working tree, uncommitted | plugin-author |
| 2 | Pre-land needs a reviewer outside the builders' model family, but the only L3 reviewer is opus, same as `builder-l7` | same question doc | plugin-author |
| 3 | A `--bg` seat's `--dangerously-skip-permissions` is not observable afterwards (`ps`, `~/.claude/sessions/<pid>.json`, `claude agents --json`) so "did bypass take" cannot be checked | this session's checks on pid 79294 | session.sh |
| 4 | A partial `up` (verifier missing) followed by another `up` left two orchestrators; `status` printed no duplicate warning at the time | `.sdlc/questions/adopt-hygiene-verifier.md`; seats [9b82e7] and [f95d31] | session.sh |
| 5 | `SDLC_YOLO=1` in `.sdlc/launcher.env` works; the file is not in `.gitignore`, so each target must exclude it by hand | `.git/info/exclude` here | adopt-repo skill |
| 6 | Uncommitted `bgIsolation` edit in the target root blocks unit merges; the drill setting belongs in `settings.local.json` | `.sdlc/questions/adopt-hygiene-U5-merge.md` | readiness plan C29 |

## Plugin findings, addendum (2026-09-17, after the host's 96f0e58 fixes)

| # | Finding | Evidence | Suggested owner |
|---|---|---|---|
| 7 | The conductor boot prompt says "Read .sdlc/roadmap.md", but adopt-repo never writes one; the first thing the seat did was fail on a missing file | this repo has no `.sdlc/roadmap.md`; boot_prompt in `session.sh` | adopt-repo skill or session.sh |
| 8 | `session.sh up` advertises `claude logs <job>`; run from a seat it returned a model reply ("logs is ambiguous, pick 1 to 4"), not the job's output | this session, `claude logs f775f0bb`, Claude Code 2.1.273 | session.sh (drop or replace the hint) |
| 9 | Seat names collide across repos: two `sdlc-conductor` and, during the other drill, two `sdlc-verifier`, so the orchestrator asked "which is ours" twice and a bare-name send is ambiguous | `.sdlc/questions/adopt-hygiene-verifier.md`; ListAgents rows [dd6ce6] [ec5403], [5db45a] [1cf3b6] | session.sh (repo-scoped PREFIX by default, or refs in the boot prompt) |
| 10 | A unit that flips `.sdlc/config.json` to the github preset mid-plan breaks adapter reads of the plan's own local ticket; the ticket had to be mirrored to #643 by hand | `.sdlc/questions/adopt-hygiene-ticket-backend.md` | adopt-repo (choose the backend before the first ticket) or adapter.py (read local when the id is `T-`) |
| 11 | Pre-land went red twice on things no unit criterion covered: a committed review record tripping the target's branding gate, and live pointers to docs a unit archived. The record rule was in the plan text and still missed | `.sdlc/verdicts/adopt-hygiene-prepr.md`, U4 and U6 | planner agent (a move criterion carries a dangling-pointer grep; verdict/handoff writers run the target's content gates before commit) |
| 12 | Debt ids clashed with adapter ids (C13 in both), caught only by the verifier at U7 pass 2 | `.sdlc/verdicts/adopt-hygiene-U7.md` | plan-rules (one id namespace per `.sdlc/` doc, prefixed) |

## Final drill report (2026-09-17, before landing PR #653 at 360950e)

Readiness rows R17 to R20, graded by running the readiness plan's C29 to C33 blocks against this repo on `sdlc/adopt` @ 360950e. Where a block's literal grep did not match this repo's spelling, the substitution is stated in the row and the fact behind it was graded instead.

| Row | Check | State | Evidence (this repo) | Negative control run | Substitutions |
|---|---|---|---|---|---|
| R17 A1 survey | C30 | 🟢 | `.sdlc/survey.md` (9 scout sections, `## Claims to verify`, 14 claims); `.sdlc/verdicts/survey.md` (14 graded rows, 0 ungraded) | copy with one claim row appended: 15 vs 14, differ by one | the verdict table's header starts with `#`, so the block's grep undercounts it by one; rows compared after dropping headers on both |
| R18 A2 architecture | C31 | 🟡 | `.sdlc/architecture.md` §1 to §7 (18 convention rows, 18 with a command); `.sdlc/verdicts/architecture.md` (passes 1 to 4, "18/18 K rows", exceptions listed) | copy with one convention's command blanked: 17 vs 18 | sections are `Layering and dependency direction` for Module map and `Counts` for Doc drift; the doc-drift table lives in `.sdlc/debt.md` §Records drift, not in the map; the verdict grades the convention set in one row with a count rather than one row per convention |
| R19 A3 records | C32 | 🟢 | `.sdlc/records/index.md`: ADRs (carded) 24 rows by number in order; Specs, LLDs, plans 14 rows by first-commit date in order; 38 carded rows = 38 files in `cards/`; `decisions.md` one live set; `.sdlc/questions/adopt-a3-drift.md` has `## Answer` | ADR section with its last two rows swapped: out-of-order | the index has no `type` column; ADRs sit in their own section, so order was checked per section; the date cell carries a `(last …)` suffix, compared on its first 10 characters; a third section lists uncarded reference material and is excluded from the card count |
| R20 A4 to A7 | C33 | 🟢 | `.sdlc/baseline.md` (3 gates, 3 runs each with 3 timings, `## Flaky` "None observed"); `.sdlc/adapter.md` §4 (13 conflict rows, `needs human` column: 4 ruled per `.sdlc/questions/adopt-a5-conflicts.md`, 9 `no`); `.sdlc/debt.md` (all rows carry a size and a grade or `human`); `.sdlc/verdicts/adopt-hygiene-prepr.md` `verdict: 🟢` at 360950e over U1 to U10 | debt copy with one size cell blanked: 12 vs 11 rows outside the strict pattern | runs are `3/3` plus three seconds values, not `Run 1 \| Run 2 \| Run 3`; decisions read `ruled 2026-09-16` not `keep\|replace`; grades are `L1`..`L7` and combos like `human + L1`; the A7 verdict is the pre-land record, not `adopt-A7.md` |
| C29 preflight | C29 | 🟡 | today: `sdlc@nonoun` ✔ enabled, `sdlc@adia` ✘ disabled, branch `sdlc/adopt`, tree clean but for the orchestrator's open verdict edit | none (state check) | `bgIsolation: none` now lives in `.claude/settings.local.json`, per host fix 6, not in the tracked file the block reads; the host repo's own seats were up during this drill, so its "0 seats" leg did not hold |

Landing follows this report: PR #653 (CI run 35288439124 green), then `session.sh down && up` here on the plugin at 825b140.
