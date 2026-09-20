# Handoff U5 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/rf-U5 off plan/records-followup-roadmap, cut from origin/main @ 1f991877 |
| Commit 1 (roadmap alone) | chore(sdlc): regenerate the roadmap from live facts (#709); touches only `.sdlc/roadmap.md`. Sha not pinned here: this commit was amended more than once while the unit was in review, so a pinned sha in this file would go stale again; the reviewer or verifier reads the live sha off the branch (`git log --oneline -2`) rather than this line |
| Commit 2 (this handoff) | touches `.sdlc/handoffs/records-followup-U5.md` and `.sdlc/questions/roadmap-2026-09-20.md` |
| Files, commit 1 | `.sdlc/roadmap.md` |
| Files, commit 2 | `.sdlc/handoffs/records-followup-U5.md`, `.sdlc/questions/roadmap-2026-09-20.md` |
| Left out | nothing scoped to U5; `.sdlc/board.md` and the plan file are the Orchestrator's, not staged here |

Host load 98 to 127 on 10 cores throughout (well above the 56 quoted at dispatch). `npm test` (P1) was run once, in the foreground; it auto-moved to a background task at the harness's 120 s default timeout, not by my choice, and was not re-run or polled with a sleep loop. It finished green.

## Criteria (unit-level)

| # | Criterion | Command | Result | Expected | State |
|---|---|---|---|---|---|
| U5-1 | one head sha, on main | `sed -n '/^head:/p' .sdlc/roadmap.md \| perl ...`; `git merge-base --is-ancestor ... origin/main` | `1`, `anc 0` | `1`, `anc 0` | 🟢 |
| U5-2 | worktree table is the live set | `diff <(git worktree list \| grep -oE '\.git-worktrees/[^ ]+' \| sort) <(grep ...)` | no lines, `diff 0` | no lines, `diff 0` | 🟢 |
| U5-3 | stated count equals row count | `grep -oE '^[0-9]+ worktrees under' ...; grep -cE '^\| `\.git-worktrees/`'` | `7`, `7` | same number twice | 🟢 |
| U5-4 | one ranked row per open issue, none closed | `diff <(gh issue list --state open ...) <(grep ...)` | no lines, `diff 0` | no lines, `diff 0` | 🟢 |
| U5-5 | no unanswered prompt left | `grep -c '^Your move' ...; awk range \| grep -vcE 'answered ...\|open: ...'` | `0`, `0` | `0`, `0` | 🟢 |
| U5-7 | debt ids cited as debt.md defines them after U7 | `grep -c 'debt id' ...; awk range \| grep -c 'DP[1-4]'` | `0`, `1` | `0`, `1 or more` | 🟢 |
| U5-6 | alone: one commit, that commit touches only the roadmap | `C=$(git log --format=%H $BASE..HEAD -- .sdlc/roadmap.md)`, etc. | `nonempty 0`; `1`; `.sdlc/roadmap.md`; branch file list `.sdlc/roadmap.md` (commit 2 not yet added when this row was run); `branding: clean (506 files scanned)`, `exit 0`; `0` | see plan row | 🟢 (branch file list will read three paths once this handoff commit lands; re-check below) |

## Criteria (plan-level, this ticket's rerun)

| # | Criterion | Result | State |
|---|---|---|---|
| P1 | `npm test` tail, TESTS count, tree-clean count | `✓ all 48 test files passed`; `48`; tree-clean count `1` while `.sdlc/roadmap.md` was still uncommitted (not test-generated drift); re-checked `0` after commit | 🟢 |
| P4 | branding gate | `branding: clean (506 files scanned)`, `exit 0` | 🟢 |
| P5 | scope wall | `0`, `1`, no `.claude/CLAUDE.md` line | 🟢 |
| P6 | no em dash added, backtick-stripped | `0` | 🟢 |
| P7 | baseline-agrees-check | seven `ok` lines, one `note head:` line (baseline ref `20298cc`, tree moved outside `.sdlc/` since, expected on this branch since U9 merged main in), one more `ok` (ref is in origin/main's history), `stale total: 0`, `exit 0` | 🟢 |

P2 and P3 are pre-land only per the plan; not run here.

## Re-check after this handoff commit landed

Cannot amend this note into commit 2 without breaking the alone rule a second time, so it is recorded here for the reviewer instead: after this handoff commit, `git diff --name-only $BASE` reads `.sdlc/handoffs/records-followup-U5.md,.sdlc/questions/roadmap-2026-09-20.md,.sdlc/roadmap.md`, exactly the three paths the plan row expects. U5-6 and P5 re-run clean at this two-commit head: `nonempty 0`, `1`, `.sdlc/roadmap.md` as the sole file in the roadmap commit, branding `clean (507 files scanned)` `exit 0`, `0` raw dashes; P5 `0`, `1`, no `.claude/CLAUDE.md` line. `git status --short` is empty (tree clean).

## Mistake caught and fixed before handing off

First draft wrote the worktree count as the word "Seven" in the lead sentence of `## In flight outside sdlc`; the plan requires a digit. Caught by U5-3 reading empty instead of `7`, fixed, re-verified. First draft also wrapped both `open: .sdlc/questions/...` pointers in backticks, which broke U5-5's literal match (`2` failures instead of `0`); backticks removed from that one span, re-verified `0`.

## Owner questions: ruled by the owner (not this builder's proposal)

The Conductor asked the owner directly, twice. First pass: both questions still open, neither answered nor dropped. Q2 was then found to have been asked in error (its three named tickets had all closed before it was first asked) and was re-asked the same afternoon; the owner retired it as moot. Both states are the owner's ruling, not a builder proposal or judgment call. Q1 alone keeps a pointer line in the roadmap; Q2 keeps none, per the retirement. Criterion U5-5's second leg reads `0`.

| Question | Ruling | Note |
|---|---|---|
| Q1: go-live priority (PR #158) | still open | one pointer line in the roadmap |
| Q2: which of ours goes next (the figma pair #673 with #676, or the citation gate #672) | retired as moot | asked in error by the Conductor: `#673` closed 2026-09-18T22:32:34Z, `#676` closed 2026-09-19T00:26:06Z, `#672` closed 2026-09-19T15:15:22Z, all before the question was first asked; no pointer line in the roadmap |

## Notable facts this regeneration found (for the Conductor, not a criterion)

- Eight tickets from the 2026-09-18/19 roadmap closed since: `#638` (PR #684, squash `381b8d5c`), `#672` (PR #694, squash `92ad4274`), `#673` (PR #690, squash `841e1857`), `#674` (PR #683, squash `bf2aaf65`), `#676` (PR #692, squash `1abda155`), `#602`, `#519`, `#514` (closed as completed, no PR).
- `#681`, `#668`, `#701`, `#686`, and the new `#713` (its own approved plan `gate-split`, gated on `#681` landing) all read as sdlc-owned now, not "other session", per standing ruling R4: the other conductor session no longer touches this repo's plans.
- `#496` reads as parked, not claimed: `plan/lane-b-tickets` (local, unpushed) shows units `au-U1` and `au-U3` built but marked `[!]` (paused), commit message "`#496` parked by the owner", matching the standing ruling to park it while the owner does the Figma steps by hand.
- PR #158 (go-live, held) is now `CONFLICTING` against `main` (it read `UNKNOWN` in the prior draft); still no ticket, still held by its own body.
- The `.git-worktrees/pif-u5-records` worktree (#681 U5) carries 4 uncommitted paths; the other six worktrees are clean.
