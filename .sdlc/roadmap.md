---
kind: roadmap
repo: ultimate-tokens
status: draft (planner proposal; the Conductor owns this file and the owner ranks it)
written: 2026-09-20
head: 5f2c3787 (origin/main)
inputs: gh issue list --state open (13 issues), gh pr list --state open (1 PR), git worktree list, .sdlc/board.md, .sdlc/debt.md, plan/gate-split (#713, approved, local only), plan/preset-intent-fidelity (#681, local only), .sdlc/plans/records-followup.md, ticket #709
---

# Roadmap

Revision 2026-09-20: regenerated from live facts at `origin/main` @ 5f2c3787, plan records-followup U5, ticket #709. Every row below is read fresh; nothing here is patched forward from the 2026-09-18/19 draft.

The only place plans and tickets are ranked. One row per item, ordered P0 to P3, then by rank inside a priority.

How to read a cell:

| Mark | Meaning |
|---|---|
| plain | read from a GitHub label or a plan's frontmatter |
| `(p)` | proposed by this draft, no label exists yet |
| `(d)` | derived from a gh or git fact (PR state, worktree, commit), not from a label |
| `(legacy)` | read from a pre-taxonomy label: `size:small` reads as S, `size:big` as L, `kind:bug` as defect, `task` as chore |

Count: P0 0 · P1 4 · P2 2 · P3 2 · unranked 5 (no priority label yet) · total 13.

| Rank | Ticket | Plan | Title | Kind | Pri | Size | Lane | Owner | Status | Blocked by | Target |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | #681 | `preset-intent-fidelity` on `plan/preset-intent-fidelity` (local only, not on main) | Preset intent fidelity: exact prime anchors, muted chroma envelope, perceived-lightness prime ladder | feature | P1 | L | color-engine | sdlc | in flight outside sdlc (d): six worktrees under `.git-worktrees/pif-u1-anchor` through `pif-u6-ladder`, unit U5 (`pif-u5-records`) 203 commits ahead of main, none pushed, no PR | nothing | landing this cycle |
| 2 | #686 | none yet | Shared gamut cache in `hct.js` is order-dependent: `exportPanda` emits different bytes for the same state | defect | P1 | S | color-engine | sdlc | backlog (d): found during #681 U6 (`.sdlc/handoffs/pif-u6.md` finding S3), not itself blocked on #681 | nothing | after #681 lands |
| 3 | #709 | `records-followup`, `.sdlc/plans/records-followup.md`, ten of eleven units 🟢, U11 (this unit) in progress, closing the roadmap now | records-refresh follow-up: nine pre-land findings and one falsified quotation landed on main with #708 | chore | P1 | L | docs | sdlc | in progress (d): PR 1 landed as #716 (squash `e9850935`); this row's own regeneration is U5 and its pre-land fixes U11, both on PR 2 | nothing | this cycle |
| 4 | #713 | `gate-split`, `.sdlc/plans/gate-split.md` on `plan/gate-split` (local only, not on main), status approved | `npm test` takes about 296 s after #681: split the full corpus sweeps into CI gate scripts, keep seeded samples in `npm test` | chore | P1 | L | tooling | sdlc | in flight (d): the start gate G0 is waived, so six of seven units are under way. `U1` merged `34ebbae6`, `U6a` merged `50898d58`, `U2` to `U5` dispatched at `2026-09-20T21:35:09Z` off `plan/preset-intent-fidelity` @ `a2bb3c84`, `U6b` not dispatched. Waivers: approval questions 5 (`U1`), 7 (`U6a`) and 8 (`U2` to `U5`) in `.sdlc/questions/gate-split-approval.md` on that branch | `U6b` only, on #681 landing; every other unit is merged or in flight under a waiver | `U6b` and the PR after #681 lands |
| 5 | #668 | rides `preset-intent-fidelity`'s inputs | Perceptual ramp: measured L* rises at stop 800 on nine presets with lift <= -34 | defect | P2 | S | color-engine | sdlc | in flight outside sdlc (d): worktree `.git-worktrees/668-stop800-uptick`, one unpushed commit `c4b8962`, no PR; cited as an input of `preset-intent-fidelity` | nothing; folded into #681's inputs | riding #681 |
| 6 | #715 | none yet | Gate coverage gaps left by #681: default kit in every sweep, C4 ramp identity control | chore | P2 | S | color-engine | sdlc | backlog: two yellow rows recorded in `.sdlc/verdicts/pif-u4.md` on `plan/preset-intent-fidelity` | #681 landing | after #681 lands |
| 7 | #377 | none | hosted describe-palette MCP surface on the Phase B Worker (blocked: domains, accounts) | chore | P3 | L | mcp | owner | blocked: title and body name domains and Phase B accounts (standing ruling 2026-09-20: keep open, labelled blocked) | domains, Phase B accounts; both the owner's | someday |
| 8 | #717 | none | `npm run smoke` leaves headless Chrome orphans on its fixed CDP port 9333 | defect | P3 | S | tooling | sdlc | backlog (d): filed this session after the port 9333 squatters were reaped for the baseline re-point (`.sdlc/questions/records-followup-repoint.md`) | nothing | next cycle |
| 9 | #496 | `adia-library-uplift` on `plan/lane-b-tickets` (local only, not on main); units `au-U1` (Geometry), `au-U3` (Text styles) built | ADIA Colors Figma library: bring up to current standards (names, type, geometry, text styles) | chore (legacy) | (p) | L (legacy) | figma (p) | owner | parked (d, standing ruling 2026-09-20): the owner does the remaining Figma steps by hand; `au-U1` and `au-U3` unit commits exist but are not landed | the owner's Figma pass | when the owner resumes it |
| 10 | #701 | rides `preset-intent-fidelity`'s U4 spike fix (standing ruling: name the 64, gate the count, fix joins #701) | `chromaFloor` redesign so even ramps have no floor/envelope crossover dips (follow-up to #681) | defect (legacy) | (p) | S | color-engine | sdlc | ready (d): planned in parallel with #681 per standing ruling R3, so it is checkable the moment #681 lands | nothing; waits for #681 to land, not for a decision | after #681 lands |
| 11 | #718 | none | `baseline-agrees-check.sh`'s time check reads only the first range in a gate cell, so a second range in the same cell goes unchecked | defect | (p) | S | tooling | sdlc | backlog (d): filed this session by the U5 verifier's rerun of P7; the ticket's own wording that the check cannot fail is corrected on the ticket, a wrong first range does print a stale time line and exit 1 | nothing | unranked |
| 12 | #719 | none | `shipping-changes`, the landing procedure of record, never names the `panda-smoke` or `corpus-contrast` CI jobs | defect | (p) | S | tooling | sdlc | backlog (d): filed this session; the adapter and CLAUDE.md name three PR jobs, the skill names one | nothing | unranked |
| 13 | #721 | none | ADR: a seat cites only what it measured, at the ref it is writing about | chore | (p) | S | sdlc | sdlc | backlog (d): filed this session; would ratify the practice the verbatim-quote rule and the U5 live-facts rule already enforce piecemeal | nothing | unranked |

## Ours to take next

| Order | Item | Why |
|---|---|---|
| 1 | `records-followup` U11, #709 (this unit) | ten of eleven units 🟢; this regeneration, its pre-land fixes and the PR are all that is left |
| 2 | `preset-intent-fidelity`, #681 | approved, in flight, six units deep on `.git-worktrees/pif-u*`, far ahead of main; every other color-engine row rides its landing |
| 3 | `gate-split`, #713 | already building, not waiting: six of its seven units are merged or in flight under the owner waivers of approval questions 5, 7 and 8; only `U6b` still needs #681 on main |
| 4 | the small set (#701, #686, #715, #668) | already scoped, wait only on #681's landing or (for #686) can start any time |

Lanes to stay out of: figma (#496, parked, owner's hand); mcp (#377, blocked on the owner's domains and accounts).

## Held by the owner, not ranked

| PR | Branch | Title | State | Why held | Blocked by |
|---|---|---|---|---|---|
| #158 | `feat/go-live-flip-held` | feat(monetization): flip TIERS_ENFORCED to true (HELD for go-live) | draft, opened 2026-06-30, last touched 2026-07-18, now conflicting with `main`, no ticket | its own body says do not merge until go-live is configured; merging enforces tiers for every user (web and Figma plugin) | two owner-side go-live steps named in the PR body; debt R2 (`hostedMcp` wired in the pro flags) and R5 (licensing Phase 1 never built) touch the same flip |

## In flight outside sdlc

7 worktrees under `.git-worktrees/`. Facts from `git worktree list` and `git -C <tree> log/status`, re-read 2026-09-20 at `origin/main` @ 5f2c3787.

| Worktree | Branch | Head | Ahead of main | Pushed | PR | Ticket | Tree state |
|---|---|---|---|---|---|---|---|
| `.git-worktrees/668-stop800-uptick` | `fix/668-stop800-uptick` | c4b8962 | 1 | no | none | #668 | clean |
| `.git-worktrees/pif-u1-anchor` | `unit/pif-u1-anchor` | ab9eaa6 | 13 | no | none | #681 U1 | clean |
| `.git-worktrees/pif-u2-ramp` | `unit/pif-u2-ramp` | 959c43d | 78 | no | none | #681 U2 | clean |
| `.git-worktrees/pif-u3-envelope` | `unit/pif-u3-envelope` | 78a9018 | 74 | no | none | #681 U3 | clean |
| `.git-worktrees/pif-u4-integration` | `unit/pif-u4-integration` | 67d4df9 | 189 | no | none | #681 U4 | clean |
| `.git-worktrees/pif-u5-records` | `unit/pif-u5-records` | 6e4d33f | 203 | no | none | #681 U5 | 4 uncommitted paths |
| `.git-worktrees/pif-u6-ladder` | `unit/pif-u6-ladder` | 3df582d | 30 | no | none | #681 U6 | clean |

## Unticketed debt (from `.sdlc/debt.md`, not ranked here)

Open debt rows carry no GitHub issue, so they have no roadmap row until the owner asks for a ticket. Ids only; sizes and grades live in `debt.md`.

| Group | Open rows |
|---|---|
| Hot untested | H1 to H9 |
| Records drift | R2, R3 (drawer half), R5, R6 (Figma run, owner), R8 (secret, owner), R9, R10, R12 |
| Config | C2, C3, C4 (delete-branch-on-merge and protection, owner), C7 (owner) |
| Generated | G1, G2 (header line) |
| Architecture exceptions | K14, K17 |
| Process | DP3 (serial `npm test`, riding #713's split), D2 (overhaul Phase 4 items 1, 3, 4) |

R12 waits for the first sdlc plan that opens `scripts/` or `test/`; `gate-split` (#713) is the nearest one of ours.
Approval Q2 of `records-followup` already rules that `architecture.md` and `debt.md` get re-checked per plan, where a plan touches them.

## Label repairs this ranking implies

Applied by the Conductor after the owner ranks, through `adapter.py`. Nothing here has been applied.

| Ticket | Add |
|---|---|
| #686, #715, #668 | `size:S` where absent, the ranked priority where absent |
| #701 | a priority label (proposed P1 or P2, rides #681) |
| #496 | a `size:` label; keep `status:blocked` while parked |
| records-followup, preset-intent-fidelity, gate-split | already carry their labels from mint |

## Questions for the owner

Ruled by the owner on 2026-09-20. The second question asked in the first pass was retired as moot in an amendment the same afternoon; see `.sdlc/questions/roadmap-2026-09-20.md`.

1. Go-live (PR #158, with #377 and debt R2 and R5 behind it) has no priority anywhere. Is go-live on this roadmap this cycle, next, or someday? open: .sdlc/questions/roadmap-2026-09-20.md

## Revisions

| Date | Change | Why |
|---|---|---|
| 2026-09-18 | first draft from the open issues, open PRs, the board, the debt map and the approved #681 plan | owner approval Q3 in `.sdlc/questions/survey-2026-09-18-approval.md` |
| 2026-09-18 | Owner column added; #681, #674, #668, #638 set to in flight outside sdlc, owner other session; #674 shown closed (PR #683, bf2aaf6) with follow-up PR #685; #638 now has PR #684; two more #681 unit trees listed; `records-refresh` row reads its plan file; two owner questions dropped, one added; "Ours to take next" added | owner ruling Q4 (decede0), and main moved to bf2aaf6 |
| 2026-09-19 | row 1 updated on landing of records-refresh (#691, four units 🟢); every other row left as the 2026-09-18 snapshot | records-refresh landed as PR #708, squash 28c2e8cc |
| 2026-09-20 | full regeneration from live facts, plan records-followup U5, ticket #709. Eight tickets from the 2026-09-18/19 draft closed (`#638` PR #684 squash `381b8d5c`, `#672` PR #694 squash `92ad4274`, `#673` PR #690 squash `841e1857`, `#674` PR #683 squash `bf2aaf65`, `#676` PR #692 squash `1abda155`, `#602`/`#519`/`#514` closed without a PR); `records-refresh` (#691) landed as PR #708 squash `28c2e8cc`; `k17-rerun` (#710) landed as PR #711 squash `41b2877e`; `records-tidy` (#712) landed as PR #714 squash `aa197cbe`. Four new tickets opened since (`#701`, `#713`, `#715`, `#717`). Ownership of the color-engine lane (`#681`, `#668`, `#701`, `#686`) and the new tooling ticket `#713` moved from "other session" to sdlc per standing ruling R4 of 2026-09-20 (`.sdlc/questions/standing-rulings-2026-09-20.md`): the other conductor session no longer touches this repo's plans. `#496` moved from claimed to parked per the same day's ruling. Debt's Process rows are cited here as `DP1` to `DP4` (records-followup U7 renamed them from `P1` to `P4`) | records-followup U5, ticket #709 |
| 2026-09-20 | landing refresh, plan records-followup U5, ticket #709: ranked rows added for `#718`, `#719` and `#721`, all three opened after the regeneration commit (`21:45:38Z`, `21:53:29Z`, `21:57:04Z`). Read at one instant, `2026-09-20T22:00Z`; an issue opened after that instant is the live-facts rule's case again, a note for the verifier, not a second refresh. Admitted by criterion U5-6 as reworded in plan revision 14 under owner ruling R5, which counts roadmap-only commits rather than commits | the plan's live-facts rule |
| 2026-09-20 | pre-land fixes, plan records-followup U11, ticket #709. Three assertion repairs, no row added or dropped. R1: the `#713` status and `Blocked by` cells and the `Ours to take next` row for `gate-split` said the plan's own gate refuses to start any unit before #681 lands and that nothing else was ready to start. That was already false when the regeneration commit was written at `21:36:16Z`: on `plan/gate-split` the gate was waived for `U6a` at `19:28:58Z` and for `U2` to `U5` at `20:52:48Z`, `U6a` merged at `19:54:46Z` and `U2` to `U5` were dispatched at `21:35:09Z`. Both cells are now re-derived from that branch's checklist, board rows and approval file. R2: the front matter said 10 open issues and the Count line said total 10 over a table the landing refresh had grown to 13 rows; both are recomputed from the table, and the per-priority breakdown now sums to it (`unranked` 2 to 5). R3, found by U11's own new criterion rather than by the review: the `#709` row and the first `Ours to take next` row counted this plan's units as nine of ten and ten of ten, where the plan carries eleven units with ten green | the roadmap PR's pre-land review, and U11's assertions criterion |

## Landed since the last revision

| Ticket | PR | Squash |
|---|---|---|
| #638 dual Radix export | #684 | `381b8d5c` |
| #672 citation-gate predicate | #694 | `92ad4274` |
| #673 libraryMode color-variable prune | #690 | `841e1857` |
| #674 Adia Warning contrast | #683 | `bf2aaf65` |
| #676 Type Primitives consent guard | #692 | `1abda155` |
| #691 records-refresh | #708 | `28c2e8cc` |
| #710 k17-rerun | #711 | `41b2877e` |
| #712 records-tidy | #714 | `aa197cbe` |
| #602, #519, #514 | none (closed as completed, upstream/manual) | n/a |
