# Pre-PR · adopt-hygiene · 29a2c066cbb0f1ff945519f28115b128594b626a
verdict: 🔴
sha: 29a2c066cbb0f1ff945519f28115b128594b626a

Written by sdlc-verifier on 2026-09-16. I checked out `sdlc/adopt` @ 29a2c06 in a detached worktree, `.worktrees/prepr`, compared it with `origin/main` (23 commits, 105 files), and ran every command there myself. Every negative control was reverted; the tree ended with 0 dirty paths.
Tally: 4 🔴 · 5 🟡 · 10 🟢 (19 rows). Two blockers: `npm test` fails on this head, and the checks were not run at the grade the protocol requires. Every unit criterion was re-run; the rows below group them.

| Check | State | Evidence | Negative control |
|---|---|---|---|
| baseline `npm test` | 🔴 | `✗ 1/44 test file(s) failed`, exit 1: `repo/branding.mjs` finds 2 violations in `.sdlc/verdicts/adopt-hygiene-U1-review.md`. Its P4 row quotes the retired maker brand in capitals and the retired `.io` domain. The file came in at 54f96e4 and merged to the head at 4cf0686. U1's worktree was clean because the file was not on that branch; the merge makes the gate scan it. This breaks plan rule C12 ("paraphrase") and CLAUDE.md §SDLC | the failing gate is the control: it fires on a real file |
| baseline `npm run build` | 🟢 | `npm ci` 0; build exit 0, `wrote figma/plugin/ui.html 3695.6 KB`; status 0 | type error in `src/main.ts`: build exit 2; restored |
| checker grade and family | 🔴 | The skill requires `reviewer-l3` and `verifier-l3` in fresh context, from a model family that did not build the plan. This record was run by the L1 Verifier seat (Opus, the same family as the U1/U2 pass 2 builders), which has no Agent tool. The question is open: `.sdlc/questions/adopt-hygiene-prepr.md` | n/a: no fresh-context L3 run exists to test |
| P4 branding on head | 🔴 | same failure as baseline `npm test` | same |
| U1 rows 1-5, 8-12 | 🟢 | 1 1 1; ADR-022, 023, 024, Quick map; 1 1; amendments 1 per file and `resolve.mjs` 1; 0 1; 4 2 0; 3 3 3; 1 1 0; `moved` 1 0; K18 1 with an empty block | `CURRENT_SCHEMA_VERSION` set to 5: K18 prints the missing-case line; unit-pass controls for the rest (`.sdlc/verdicts/adopt-hygiene-U1.md`) |
| U1-6 plans closed, landings real | 🟡 | 0, 3, 2, `todo` 0 and 0; resolver prints nothing. Concern carried: the resolver does not check that a SHA belongs to its PR. I checked all 9 pairs by hand at U1 pass 2, and the rows have not changed since 89c9538 | `620ac4b` swapped for the branch tip `5a0e438`: 1 line; restored |
| U1-7 PLAN-overhaul stale path | 🟡 | `moved`, 1, but the grep prints **1**, not 0. The match is `.sdlc/tickets/T-0001.md`, the local ticket, which copies the plan's own U1 text (lines 45, 57), so it is a historical record rather than a live pointer. The exclusion list misses `.sdlc/tickets`, the same gap `.sdlc/handoffs` had | base `b885e67`: 3 |
| U2 rows 1, 2, 4, 5, 7, 8, 10, 11 | 🟢 | Shipping, SDLC, Always + `same`; 1 0; 0 1 1; 4; 0 (`--source=origin/main` gives 34); 1 0 1; `.sdlc/adapter.md squash`; `github main kimgranlund/ultimate-tokens false`, adapter preset `github`, exit 0 | `origin/main` attrs 34; unit-pass controls for the rest (`.sdlc/verdicts/adopt-hygiene-U2.md`) |
| U2-3 `html:` convention | 🟢 | 1, 12, 1, 0; `src/ui` has `innerHTML`, no `foreignObject` | 13th `html:` planted: 13; restored |
| U2-6 branding skips `.worktrees/` | 🔴 | `"\.worktrees"` 1, but the probe run prints `FAIL: 2 branding violation(s) across 407 files`, caused by the review file above, not by the probe | skip behavior proven at the unit pass; the gate is red on head |
| U2-9 describe-eval fails without the key | 🟡 | actionlint exit 0; `exit 1` 1; `stays green` 0; `yaml-ok`; `mcp/` 0; step-level secrets `if:` 0. Concern carried: the key is set in job-level `env`, so `npm ci` receives it | step-level `if: ${{ secrets… }}` planted in scratch: actionlint exit 1 |
| U2-12 build | 🟢 | see baseline build | see baseline build |
| U3-1, U3-2, U3-3 | 🟢 | `.claude/ops` tracked 0, on disk 3, status 0; one commit `untrack .claude/ops (D1, C6)`, 7 deletions, 7 paths; live `[true,false,false]` | unit-pass controls (`.sdlc/verdicts/adopt-hygiene-U3.md`) |
| U3-4, U3-5 branch counts | 🟡 | gone 0; `main` and `sdlc/adopt` kept (2); 31 local branches (32 lines include this worktree's `(no branch)`); 40 remote. Same causes as the U3 verdict: the three `unit/hygiene-*` branches, and two remote branches deleted before this plan | unit-pass controls |
| P2, P3, P5 | 🟢 | 0, 0, 0 | `src/engine/motion.mjs` probe: 2; deleted a line of decision-records: 1; restored |
| integration across units | 🟢 | Unit file sets are disjoint; the three merge commits applied cleanly. CLAUDE.md `## SDLC` names `.sdlc/adapter.md` §5, the archive paths U1 created, and the `.worktrees/` U2 ignores. No `package.json` or lockfile change | U2-6/P4 is the one cross-unit break (a U1 record trips the U2-era gate) |
| config smells | 🟡 | `.claude/settings.json` gains `"worktree": {"bgIsolation": "none"}` from f9e20c5, whose subject says "for the readiness drill". No `.sdlc/` record says the setting should outlive the drill, so a drill-only setting would land on `main` | `git grep -i 'bgIsolation\|readiness drill'` outside settings.json: 0 |
| secrets | 🟢 | no literal key, token, or password assignments in the full `main...sdlc/adopt` diff; the only secret reference is `${{ secrets.ANTHROPIC_API_KEY }}` | n/a (pattern scan) |
| docs current | 🟢 | CLAUDE.md Commands and Conventions updated (U2-2, U2-3); shipping-changes no longer says "no hooks" and no longer pins a model; README and project-docs updated (U1-8, U1-10) | `origin/main` counts in the unit-pass records |

## Gaps for the next pass

1. `npm test` is red on the head. A committed `.sdlc/verdicts/` record quotes the retired brand; every `.sdlc/` record must paraphrase it (C12).
2. Checker grade: waiting on `.sdlc/questions/adopt-hygiene-prepr.md`. A 🟢 record needs the answer, or an L3 run from a model family that did not build this plan.
3. Non-blocking, decide before landing: whether `bgIsolation: none` should ship; add `.sdlc/tickets` to the U1-7 exclusions; the carried concerns from U1-6, P1 control restore, and U2-9.
