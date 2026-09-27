---
kind: burndown
written: 2026-09-27
by: orchestrator
status: proposed (for the Conductor to take to the owner)
source: `gh issue list --state open` at main e3a114d6, 16 open
---

# Issue burn-down

16 issues are open. 11 already sit inside a running plan, 3 have no plan yet and can start, and 2 are blocked outside the repo. The plan is to land the running plans in dependency order, open the 3 unplanned ones as they unblock, and ask the owner to rule on the 2 blocked ones.

## Wave 1: land what is running (11 issues, 7 plans)

| Order | Plan | Issues it closes | Where it is | Next step |
|---|---|---|---|---|
| 1 | records-gates | #741 #742 #745 #747 #755 | U1 merged; U2 in review round 2, U3 in review, U4 building; U5 after U2 | merge U2 to U4, build U5, pre-land |
| 2 | chroma-floor | #701 | U1 merged; U2 with the Verifier | U3 records sweep (includes the 3 under-load timing readings, R57), pre-land |
| 3 | anchor-gaps | #740 #744 | U1 merged; U2 waits for chroma-floor to land | U2, pre-land |
| 4 | docs-repair | #751 | U4 and U5 merged; U3 in bundle regeneration | U3 review, then U1, U2, U6, U7 |
| 5 | prompt-audit | #758 | U4 and U5 merged; U1 and U3 building | U2 after U1, U6 and U7 after U2, U8 and U9 after docs-repair lands |
| 6 | bold-labels | #752 | U2 in review, U1 building | U3 after prompt-audit (#761) and docs-repair (#753) land |

Landing order follows the dependencies: chroma-floor unblocks anchor-gaps U2; docs-repair unblocks prompt-audit U8 and U9; prompt-audit and docs-repair together unblock bold-labels U3. records-gates depends on nothing else and can land first.

## Wave 2: open the unplanned issues (3 issues)

| Issue | What it needs | Starts when | Size | Owner |
|---|---|---|---|---|
| #726 main has no branch protection | one `gh api` call making `build-test`, `panda-smoke`, `corpus-contrast` and `sweeps` required on `main`; the owner's precondition (#681 and #720 landed) is met, and `main` reads "Branch not protected" today | now, on the owner's go (a repo-settings change) | S | Orchestrator on the Conductor's go, or the owner |
| #748 marketing voice reread | `marketing-manager-agent` rereads the swept lines in `store-copy.md` and `landing.md`, then the owner walks the Lemon Squeezy store §10 | after bold-labels U2 lands (it edits the same `store-copy.md` labels) | S | marketing seat, then the owner |
| #725 chroma envelope misses in perceptual and peak | a planner design: 11 of 14 misses sit in perceptual and peak mode, and nothing gates the direction | after chroma-floor lands (same engine file, and #701's floor changes the baseline it measures) | L | planner, then builder-l5 or above |

## Wave 3: owner rulings on blocked work (2 issues)

| Issue | Blocked on | Ask the owner |
|---|---|---|
| #496 ADIA Colors Figma library to current standards | marked blocked, big | unblock and plan it, or park it with a dated note |
| #377 hosted describe-palette MCP surface | domains and Phase B accounts, outside the repo | keep it parked until the domains exist, or close it as not planned |

## Burn-down path

| After | Open issues |
|---|---|
| today | 16 |
| records-gates lands | 11 |
| chroma-floor and anchor-gaps land | 8 |
| docs-repair, prompt-audit and bold-labels land | 5 |
| #726 and #748 done | 3 |
| #725 lands | 2 |
| the owner rules on #496 and #377 | 0 to 2 |

## Risks

| Risk | Mitigation |
|---|---|
| Host load: many parallel `npm test` runs slow every builder | keep at most 6 builders running; the timing rows use the R57 under-load rule |
| Plan branches drift from main as others land | merge `origin/main` into each plan branch before its pre-land, never copy files across |
| Records fail the record gates (em dashes, missing `verdict:` line) | every reviewer brief now names both rules |
| Seats writing into the root checkout | every dispatch names absolute worktree paths |
