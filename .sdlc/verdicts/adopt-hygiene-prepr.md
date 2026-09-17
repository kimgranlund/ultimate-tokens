# Pre-PR · adopt-hygiene · b44883d05ca4ca891432d1422490c30cf0456344
verdict: 🔴
sha: b44883d05ca4ca891432d1422490c30cf0456344

Written by sdlc-verifier on 2026-09-17, replacing the 🔴 record on 80ae4d8 (a run on 39db0a9 was stopped when U7 was added and left no record). Two fresh-context workers ran against `origin/main` @ 7faf3aa...`sdlc/adopt` (51 commits, 125 files): `adopt-hygiene-prepr-verifier-p3` (verifier-l3, Fable 5.1) ran every gate and criterion in detached scratch worktrees (removed; root untouched; head unchanged start to end), and `adopt-hygiene-prepr-reviewer-p3` (reviewer-l3 on Fable, read-only: 0 blocker, 0 major, 8 minor, 7 nit, "ship-quality"). The Verifier seat reconfirmed the head sha, `.sdlc/records/index.md` lines 77 and 80, and `git ls-files .claude/ops` = 0 itself.
Tally: 30 rows. 🟢 20 · 🟡 9 · 🔴 1. Every prior blocker is closed. One new blocker: a live record this plan edited (`.sdlc/records/index.md`) states two things the plan made false. Both workers found it independently; it is the same stale-record class the 80ae4d8 record blocked on, so it blocks here too, overruling the reviewer's minor rating.

| Check | State | Evidence | Negative control |
|---|---|---|---|
| gate `npm test` | 🟢 | Node 24 and Node 22: exit 0, `✓ all 44 test files passed`, tree clean | role-table `"scrim`→`"scrimX`: exit 1, `✗ 1/44` |
| gate `npm ci && npm run build` | 🟢 | build exit 0, `wrote figma/plugin/ui.html 3695.6 KB`, tree clean | type error in `src/main.ts`: exit 2 |
| gate `npm run smoke` | 🟢 | Chrome Canary: `SMOKE PASS: gallery · category · editor · export dialog`, tree clean. Closes the prior smoke 🟡 | throw at line 1 of `src/ui/app.js`: exit 1, `SMOKE FAIL (3)` |
| U1-1..12 | 🟢 | all expected values on head (ADR amendments and placement, LLD/runbook amendments, OD-004, plans closed with resolver silent, overhaul plan moved, PRD stub, cards, README, reactivity report, K18) | origin/main differs on every row; `PR #592`→`#578`: resolver line; `CURRENT_SCHEMA_VERSION = 5`: K18 line |
| U2-1..8, 10, 11 | 🟢 | `## SDLC` equals adapter §7; CLAUDE.md lines; shipping-changes; ignores 4; `.worktrees` skip; 34 attrs; pages.yml; workflow.json; config.json preset github | one-word CLAUDE.md edit: no `same`; 13th `html:`: 13; origin/main branding with plant: FAIL 3; radix line dropped: 2; `github.token`: exit 2 |
| U2-9 / U6-3 eval key scope | 🟢 | actionlint 0; parsed YAML: no workflow or job `env`, key only on the guard and eval steps; guard exits 1 without the key. Closes the prior 🟡 | step-level `if: secrets`: actionlint exit 1; at 80ae4d8 job-level `true` |
| U2-12 build | 🟢 | see gate row | see gate row |
| U3-1, U3-2, U3-3 | 🟢 | ops tracked 0; one 7-path commit; live `[true,false,false]` | ignore line removed: status 1; b885e67: 52 paths; another repo `[true,true,true]` |
| U3-4 local branch count (carried) | 🟡 | gone 0; 36 local = 29 non-unit + 7 `unit/hygiene-*`, over "at most 28" by 1 beyond the unit branches | `git remote prune --dry-run` empty |
| U3-5 remote count (carried) | 🟡 | 40; the 2 external deletes predate the plan | carried |
| U4-1, U4-3 | 🟢 | branding clean (425); U1 review diff +1/−1 | 29a2c06 file: `FAIL: 2` |
| U5-1..3 | 🟢 | no `worktree` block; flags `true false` | 39b78dc: 1; trailing comma: SyntaxError |
| U6-1, U6-2, U6-4 | 🟢 | pointers 0 and 4; archive paths resolve; debt rows, dated adapter amendments (4 insertions, 0 deletions vs 80ae4d8), T-0001 names #643 | 80ae4d8: 4 files match, old path exit 128, 0 0 0 0 |
| U7-1, U7-2 | 🟢 | `nonoun` entry, 6 added lines only; debt block silent, `7 / 7`, `45 / 45` | 39db0a9 `undefined`; ac52be8 `clash C13`, em 2; C7→C8 plant: `clash C8` |
| P1 | 🟢 | green, tree clean; restore recipe now in U6-5 and U7-3 (closes the prior 🟡) | FAIL 3, exit 1 |
| P2, P3, P5 | 🟢 | 0, 0, 0 | origin/main ops tree 7; motion.mjs probe 2; decision-records line deleted 1 |
| P4 branding | 🟢 | clean (425) | `docs/x.md` copy: FAIL 3 |
| prior 🔴 stale pointers to archived plans | 🟢 | plain `git grep -n 'docs/plan/plan-2026-09'`: 10 hits, all historical records or the two behind-wall files; line-wrap scan finds only the resolving archive pointer | on origin/main the old paths exist |
| behind-wall pointers as debt | 🟡 | debt R12 names both files and P3. Concern: owner "a unit that can", no ticket or trigger | 80ae4d8: 0 |
| stale live record `.sdlc/records/index.md` | 🔴 | line 77 lists `.claude/ops/plan.md, .claude/ops/reports/*.md` as tracked records, but U3 untracked them (`git ls-files .claude/ops` = 0). Line 80 says "No PRD, RFC, RDD, or IDR files exist" while the same file's PRD-0001 row and `docs/prd/prd-0001-app-shell.md` exist (U1). The plan edits this file (U1-7, U1-9), so it is live and in scope. Reviewer also notes line 19 still calls ADR-004's superseder "unstated" though line 38 names ADR-023 | `git cat-file -e HEAD:.claude/ops/plan.md` fails, `HEAD:docs/prd/prd-0001-app-shell.md` succeeds; the same dead-path scan resolves the pointer U1 fixed at `index.md:52` |
| merge styles in canonical records | 🟡 | live `[true,false,false]`, but `.sdlc/adapter.md:42` (§2 Merge row, no amendment) and `.sdlc/debt.md` C4 and P1 still say all three styles are allowed | another repo's query returns `[true,true,true]` |
| debt rows this plan closed | 🟡 | 17 rows (R1, R4, R6, R7, R8, R11, C1, D1-D4, G2-G4, K11, K18, P2) read as open; only C5, C6, C7, R12 carry unit notes | C5 row matches `resolved by U7`; the 17 match nothing |
| `.claude/skills/project-docs/SKILL.md:24` | 🟡 | SPEC row says `docs/spec/` "not present yet"; two SPEC files exist. Pre-existing, but U1 edited the neighbouring rows of that table | `git ls-tree docs/spec/`: 2 files |
| `docs/site/describe-palette-spec.md:579` | 🟡 | links `.sdlc/plans/adopt-hygiene.md`, which resolves now; the §U6 preamble schedules the repoint for close-out, but the plan's Landing section does not list the step (count 0), so nothing holds it | `HEAD:.sdlc/plans/archive/adopt-hygiene.md` fails today |
| marketplace and home paths | 🟢 | `nonoun` declared; `gh repo view kimgranlund/sdlc-orchestration` cannot resolve, tracked as debt C7 (human, after landing); home paths debt C6 accepted (list names 6 of 8 files; row carries its grep) | 65bbda3: C7 absent |
| writing contract: em dashes | 🟡 | 32 added lines outside verdicts and handoffs carry U+2014; 4 follow the ADR heading format; about 28 are plan-authored (CLAUDE.md 1, shipping-changes 3, project-docs 2, adapter 1, decision-records 1, README 1, runbook 1, LLD 1, PRD 1, branding.mjs comment 1, 13 card headers, U2-p2 plan 1, overhaul archive 2). No criterion covers them outside `debt.md` | `grep -c` on `debt.md`: 0 on head, 2 at ac52be8 |
| checker family (carried) | 🟡 | both workers Fable 5.1, fresh context; commit trailers: 40 Opus 5, 1 Opus 5 (1M), 9 Fable 5.1 (seat records, drill reports), 1 without (f9e20c5) | self-declared; nothing in the tree can falsify a model name |
| integration, secrets, dependencies | 🟢 | all seven units integrate; no `package*.json` change; only `secrets.ANTHROPIC_API_KEY` references; `.sdlc/config.json` has no token | P3 probe |
| reviewer nits | 🟢 | guard step could precede `npm ci`; `.sdlc/survey.md:145` cites `docs/reference/spec-draft.md` (dated survey, real path under `references/`); `.sdlc/questions/A2.md` naming; dead `sdlc@adia: false`; trailer variants (squash collapses) | n/a, non-blocking |

## Gaps for the next pass

1. 🔴 `.sdlc/records/index.md` line 77 (untracked `.claude/ops` records) and line 80 ("No PRD ... files exist") contradict the head; line 19 too. Needs a criterion whose check fails on b44883d.
2. 🟡 `.sdlc/adapter.md` §2 Merge row and debt C4/P1 still say all merge styles are allowed; the 17 debt rows this plan closed read as open.
3. 🟡 `project-docs` SPEC row stale; the `describe-palette-spec.md:579` repoint is not held by the Landing steps; R12 has no trigger.
4. 🟡 About 28 plan-authored added lines carry em dashes against the user's writing contract.
5. Carried: U3-4/U3-5 counts, checker family self-declared.
6. Any new commit on `sdlc/adopt` invalidates this record; rerun on the new head.
