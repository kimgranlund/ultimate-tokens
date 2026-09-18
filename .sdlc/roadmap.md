---
kind: roadmap
repo: ultimate-tokens
status: draft (planner proposal; the Conductor owns this file and the owner ranks it)
written: 2026-09-18
head: bf2aaf6 (origin/main)
inputs: gh issue list --state open (11 issues), gh pr list --state open (3 PRs), git worktree list, .sdlc/board.md, .sdlc/debt.md, .sdlc/plans/records-refresh.md, origin/plan/preset-intent-fidelity @ d547a7a, .sdlc/questions/survey-2026-09-18-approval.md (Q0 to Q4)
---

# Roadmap

The only place plans and tickets are ranked. One row per item, ordered P0 to P3, then by rank inside a priority.

Your move: rank the 8 proposed priorities (marked `(p)`), then answer the two questions at the bottom.

How to read a cell:

| Mark | Meaning |
|---|---|
| plain | read from a GitHub label or a plan's frontmatter |
| `(p)` | proposed by this draft, no label exists yet |
| `(d)` | derived from a gh or git fact (PR state, worktree, commit), not from a label |
| `(legacy)` | read from a pre-taxonomy label: `size:small` reads as S, `size:big` as L, `kind:bug` as defect, `task` as chore |

Owner column: `sdlc` means these seats may plan and build it. `other session` means hands off, by owner ruling Q4 (`.sdlc/questions/survey-2026-09-18-approval.md`, decede0): another session owns #681, #638, #668 and #674, and the sdlc seats only list them.

Count: P0 0 · P1 3 · P2 8 · P3 2 · total 13. Of those, 6 belong to the other session (#674, #681, #668, #638, #673, #672, the last two found by the conductor after this draft was first written) and 7 are ours or the owner's. #674 closed on 2026-09-18 and its follow-up PR #685 also merged (7390aff) during this session; it stays listed for the record. PR #158 is held by the owner and is listed unranked below.

| Rank | Ticket | Plan | Title | Kind | Pri | Size | Lane | Owner | Status | Blocked by | Target |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | none; `ticket: pending`, minted on approval | `records-refresh`, `.sdlc/plans/records-refresh.md` (`status: draft`, committed as 8919292 on `plan/records-refresh`) | Small records unit: rerun the baseline, fix the stale test-count lines, add the two ignore rules, land with the refreshed survey as one PR | chore | P1 (plan draft frontmatter; not yet ranked by the owner) | S | docs | sdlc | claimed (d): plan drafted, awaiting approval | nothing | one PR this cycle |
| 2 | #681 | `preset-intent-fidelity`, `.sdlc/plans/preset-intent-fidelity.md` on `origin/plan/preset-intent-fidelity` @ d547a7a (not on main), `status: approved` 2026-09-18, 6 units | Preset intent fidelity: exact prime anchors, muted chroma envelope, perceived-lightness prime ladder | feature | P1 | L | color-engine | other session | in flight outside sdlc (d): U1 committed on `unit/pif-u1-anchor` (first seen as 7a317e0, since rebased onto 362cc48; the unit commit is now a6324da, tip ed6ac8e, 5 ahead of main, clean); U3 and U6 trees open. Label still reads `status:backlog` | per its plan, #668 (#662 landed as 1ea2f80, #674 as bf2aaf6); the other session's call | theirs |
| 3 | #674 (closed 2026-09-18 by PR #683, squash bf2aaf6) | none | Adia brands.json Warning accent/on-color contrast regressed 3.22 to 2.19 after #647 | defect | P1 (p) | S (legacy) | color-engine | other session | in flight outside sdlc (d): follow-up PR #685 open (widen the corpus AA floor to all three tone modes), mergeable, `panda-smoke` and `corpus-contrast` green, `build-test` not finished when read | nothing | theirs |
| 4 | #668 | none | Perceptual ramp: measured L* rises at stop 800 on nine presets with lift <= -34 | defect | P2 | S (legacy) | color-engine | other session | in flight outside sdlc (d): one commit c4b8962 on local `fix/668-stop800-uptick`, not pushed, no PR | nothing | theirs; gates #681 U3 |
| 5 | #638 | none on main | Dual Radix export: raw OKLCH values plus a token-referencing variant | feature | P2 (p) | L (legacy) | exports (p) | other session | in flight outside sdlc (d): PR #684 open, mergeable, `build-test`, `panda-smoke`, `corpus-contrast` green | nothing | theirs |
| 6 | #673 | none | libraryMode: cover the color-variable prune in applyBundle | feature | P2 (p) | S (legacy) | figma (p) | other session (d, conductor 2026-09-18: unpushed commit 8dac051 plus a handoff doc found in `.git-worktrees/673-color-prune-librarymode` after this row was drafted) | in flight outside sdlc (d): full unit built, not pushed, no PR, no ticket | nothing | theirs |
| 7 | #672 | none | audit-citations: any-anchor-on-line predicate is too loose, and NOFILE exits 0 | defect (legacy) | P2 (p) | S (legacy) | tooling (p) | other session (d, conductor 2026-09-18: `scripts/audit-citations.mjs` modified, uncommitted, in `.git-worktrees/672-citation-predicate`, found after this row was drafted) | in flight outside sdlc (d): mid-edit, uncommitted | nothing | theirs |
| 8 | #496 | none | ADIA Colors Figma library: bring up to current standards (names, type, geometry, text styles) | chore (legacy) | P2 (p) | L (legacy) | figma (p) | owner (the Figma steps are run by hand) | claimed (d): steps 1 and 2 ticked, steps 3 on open, 36 comments, last touched 2026-09-13 | nothing open (#495 closed) | next cycle |
| 9 | #602 | none | CLAUDE_CODE_SESSION_ID override for subagent identity minting does not persist across later tool calls | defect | P2 | S (p) | tooling | owner (assigned; fix tracked in the upstream harness repo per the 2026-09-12 comment) | claimed (label `claimed`) | the upstream fix | close here when upstream lands |
| 10 | #519 | none | session_identity.py mint derives an invalid GitHub login from email/display name | chore | P2 | S (p) | tooling | owner (assigned; upstream comment 2026-09-12 says built) | claimed (label `claimed`) | confirm the upstream build, then close | close here when confirmed |
| 11 | #514 | none | check_merge_agent_dispatch_guard.py denies the critic's own check-merge-agent dispatch from an interactive session | defect | P2 | S (issue body) | tooling (p); label `plugin:sdlc` | owner (the fix lives in the sdlc plugin repo, not here) | backlog (p) | nothing | next cycle |
| 12 | #676 | none | Flagship adoption consent pass can over-ask: guard fontPrimitivesModes on msg.stylePlans | defect (legacy) | P3 (p) | S (legacy) | figma (p) | sdlc | backlog (p) | nothing; unreachable from today's UI per the issue body | ride the #673 plan: same file, `figma/plugin/code.js` |
| 13 | #377 | none | hosted describe-palette MCP surface on the Phase B Worker | chore (legacy) | P3 (p) | L (p) | mcp (p) | sdlc, once unblocked | blocked (d): title and body name domains and Phase B accounts | domains (spec step zero), Phase B accounts/OAuth; both the owner's | someday |

## Ours to take next

| Order | Item | Why |
|---|---|---|
| 1 | `records-refresh` (S, docs) | owner approved it (Q2); plan drafted, checkability review 🟢 14/14, needs approval and a ticket |

The planner's original #2 and #3 (`#673` with `#676` riding, then `#672`) are withdrawn: the conductor found both already in flight from the other session while assembling this roadmap for approval (`#673` has an unpushed unit commit plus a handoff doc, `#672` is mid-edit uncommitted). Nothing else on this list is currently free for our seats; #676 loses its ride since #673 is not ours to plan.

Lanes to stay out of while the other session runs: color-engine (#681, #668, #674), exports (#638), figma (#673, #676's ride), tooling (#672).

## Held by the owner, not ranked

| PR | Branch | Title | State | Why held | Blocked by |
|---|---|---|---|---|---|
| #158 | `feat/go-live-flip-held` | feat(monetization): flip TIERS_ENFORCED to true (HELD for go-live) | draft, opened 2026-06-30, last touched 2026-07-18, no ticket | its own body says do not merge until go-live is configured; merging enforces tiers for every user (web and Figma plugin) | two owner-side go-live steps named in the PR body; debt R2 (`hostedMcp` wired in the pro flags) and R5 (licensing Phase 1 never built) touch the same flip |

## In flight outside sdlc

Nine worktrees under `.git-worktrees/`, all the other session's: five by ruling Q4, four (`672-citation-predicate`, `673-color-prune-librarymode`, `pif-u3-envelope`, `pif-u6-ladder`) found by the conductor while assembling this roadmap for approval and covered by the same ruling's logic (this session's seats did not create them and are not building #672 or #673). None has a board row or a unit verdict here, and none gets one. Facts from `git worktree list`, `git -C <tree> log/status` and `gh pr list`, re-read 2026-09-18 on origin/main @ 7390aff (moved from bf2aaf6 when PR #684 and #685 merged during this session).

| Worktree | Branch | Head | Ahead of main | Pushed | PR | Ticket | Tree state |
|---|---|---|---|---|---|---|---|
| `.git-worktrees/674-adia-warning` | `fix/674-adia-warning-lift` | 7390aff | 0 | yes | #685 merged as 7390aff (#683 merged as bf2aaf6) | #674 (closed) | clean |
| `.git-worktrees/668-stop800-uptick` | `fix/668-stop800-uptick` | c4b8962 | 1 | no | none | #668 | clean |
| `.git-worktrees/638-dual-radix` | `feat/638-dual-radix` | c269dbf | 0 | yes | #684 merged as 381b8d5 | #638 | clean |
| `.git-worktrees/672-citation-predicate` | `fix/672-citation-predicate` | 7390aff | 0 | no | none | #672 | 1 uncommitted path (`scripts/audit-citations.mjs`), no unit commit yet |
| `.git-worktrees/673-color-prune-librarymode` | `feat/673-color-prune-librarymode` | 8dac051 | 1 | no | none | #673 | 1 uncommitted path (`.sdlc/673-handoff.md`); unit commit 8dac051 |
| `.git-worktrees/pif-u1-anchor` | `unit/pif-u1-anchor` | ab9eaa6 | ? | no | none | #681 U1 | clean; further commits since the a6324da/ed6ac8e read a few minutes earlier |
| `.git-worktrees/pif-u3-envelope` | `unit/pif-u3-envelope` | f72c39e | 3 | no | none | #681 U3 | clean; unit commit ed1e6a3, two handoff commits |
| `.git-worktrees/pif-u6-ladder` | `unit/pif-u6-ladder` | b0e05b0 | 1 | no | none | #681 U6 | clean; wip commit b0e05b0, two handoff commits |

Two worktrees (`638-dual-radix`, `674-adia-warning`) merged into main during this session (PRs #684, #685); their rows are kept for the record even though ahead-of-main is now 0.

## Unticketed debt (from `.sdlc/debt.md`, not ranked here)

Open debt rows carry no GitHub issue, so they have no roadmap row until the owner asks for a ticket. Ids only; sizes and grades live in `debt.md`.

| Group | Open rows |
|---|---|
| Hot untested | H1 to H9 |
| Records drift | R2, R3 (drawer half), R5, R6 (Figma run, owner), R8 (secret, owner), R9, R10, R12 |
| Config | C2, C3, C4 (delete-branch-on-merge and protection, owner), C7 (owner) |
| Generated | G1, G2 (header line) |
| Architecture exceptions | K14, K17 |
| Process | P3 (debt id, serial `npm test`), D2 (overhaul Phase 4 items 1, 3, 4) |

R12 waits for the first sdlc plan that opens `scripts/` or `test/`; #672 is the nearest one of ours.
Approval Q2 already rules that `architecture.md` and `debt.md` get re-checked per plan, where a plan touches them.

## Label repairs this ranking implies

Applied by the Conductor after the owner ranks, through `adapter.py`, and only on tickets the sdlc seats own. Nothing here has been applied. The other session's four tickets are left to that session.

| Ticket | Add |
|---|---|
| #673, #676 | the ranked priority, `lane:figma`, `size:S`, `status:backlog` |
| #672 | the ranked priority, `lane:tooling`, `kind:defect`, `size:S`, `status:backlog` |
| #496 | the ranked priority, `kind:chore`, `lane:figma`, `size:L` |
| #377 | the ranked priority, `kind:chore`, `lane:mcp`, a `size:` label, `status:blocked` |
| #602, #519, #514 | a `size:` label; #514 also a lane |
| records-refresh | its ticket, minted on approval with the labels in the plan's frontmatter |

No `.sdlc/lanes.json` exists, so lane globs are unrecorded.

## Questions for the owner

1. Go-live (PR #158, with #377 and debt R2 and R5 behind it) has no priority anywhere. Is go-live on this roadmap this cycle, next, or someday?
2. After `records-refresh`, which of ours goes first: the figma pair #673 with #676 (recommended), or the citation gate #672?

Answered by ruling Q4 and dropped: whether #668 should rise to P1, and whether #638 finishes before #681. Both are the other session's to order.

## Revisions

| Date | Change | Why |
|---|---|---|
| 2026-09-18 | first draft from the open issues, open PRs, the board, the debt map and the approved #681 plan | owner approval Q3 in `.sdlc/questions/survey-2026-09-18-approval.md` |
| 2026-09-18 | Owner column added; #681, #674, #668, #638 set to in flight outside sdlc, owner other session; #674 shown closed (PR #683, bf2aaf6) with follow-up PR #685; #638 now has PR #684; two more #681 unit trees listed; `records-refresh` row reads its plan file; two owner questions dropped, one added; "Ours to take next" added | owner ruling Q4 (decede0), and main moved to bf2aaf6 |
