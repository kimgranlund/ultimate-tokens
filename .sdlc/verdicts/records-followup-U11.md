---
kind: verdict
plan: records-followup
unit: U11
seat: verifier
grade: verifier-l2
pass: 1
written: 2026-09-20
---

# Verdict records-followup U11 · 🔴 9 🟢, 1 🟡, 2 🔴

verdict: 🔴
sha: 089e0e4418dd7db7219d25cb45e834dff82f34db

| Graded at | `unit/rf-U11` @ 089e0e44, BASE 1f991877, plan text from `origin/main` at revision 17 |
|---|---|
| Legs | this seat's own runs, at grade l2, which matches this seat's own model and effort |
| Shape check | `scripts/verdict.py check` on the handoff, on the reviewer record and on `roadmap.md --against` its BASE copy: warnings only (`table without a control column`), exit 0 on all three. No file is unchecked evidence |

The unit repairs three of the four pre-land reds and adds a criterion that genuinely catches all four.
Two rows are 🔴. One is a new false assertion of the same class R3 was, which the new criterion
certifies rather than catches. The other is a live-facts exemption claimed against the wrong commit.

## Criteria

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| R1 | the #713 gating claims re-derived from that plan's own state | 🟢 | `roadmap.md:49` now reads `already building, not waiting: six of its seven units are merged or in flight ... only U6b still needs #681 on main`. `git show plan/gate-split:.sdlc/plans/gate-split.md` gives 7 checklist rows, `[x] U1 [~] U2 [~] U3 [~] U4 [~] U5 [x] U6a [ ] U6b`: six started, two merged, U6b alone waiting. The handoff's two corrections to the dispatched times hold on my own `git log`: `50898d58` 19:54:46Z is the U6a merge and `bf82ab11` 19:55:04Z the checklist tick, `7852ff12` 20:52:48Z the G0 waiver, `7d811172` 21:35:09Z the dispatch. My own pre-land record said `U6a merged bf82ab11`; the builder is right and that record was imprecise | the criterion run unmodified at `3ee3c72b` prints `gateclaims 2` beside `plan gate-split ... started=6`; at the fix head `gateclaims 0`. The same read at `ebddc55d`, 65 s before the dispatch, shows all of U2 to U5 unstarted, where the retired claim would have been true |
| R2 | the header counts recomputed from the table | 🟢 | leg A at the fix head prints `rows 13`, `partsum 13 total 13`, `inputs 13`, and `pri (p) 5 / P1 4 / P2 2 / P3 2` summing to 13. `roadmap.md:7` now reads `(13 issues)` | the same leg unmodified at `3ee3c72b` prints `rows 13` against `partsum 10 total 10` and `inputs 10`, the shipped defect |
| R3 | the file agrees with itself about this plan's unit tally, and does not call a unit 🟢 before it was graded 🟢 | 🔴 | the two rows now agree, at `:31` and `:47`, on `ten of eleven units 🟢`. That number counts merge ticks, not verdicts. Of the ten `[x]` units, nine carry a 🟢 verdict and one does not: `.sdlc/verdicts/records-followup-U5.md` reads `verdict: 🟡` and titles itself `🟡 11 🟢, 1 🟡, 0 🔴, 1 ⚪`. So the true tally is nine of eleven 🟢, with U5 🟡. R3's original defect was `:47` counting U5 as 🟢 before U5 was graded 🟢; U5 has since been graded, 🟡, and both rows still call it 🟢. The number changed, the false predicate about the same unit did not | derive the tally from verdict headlines instead of ticks: `[x]` count 10, 🟢-verdict count 9. The two sources disagree by exactly U5. `.sdlc/board.md`'s U5 row does show 🟢, and its own notes cell reads `11 🟢 1 🟡 0 🔴`, so the board contradicts itself and the adapter makes the verdict authoritative, not the board. Reconciling the board is the Orchestrator's, not this unit's |
| R4 | the refresh's stated method re-derived from its own diff | 🟢 | `roadmap.md:115` now states it was not a re-read and was a three-row patch. My own measurement of `3ee3c72b`: `4 0 .sdlc/roadmap.md`, two `@@` hunks at `--unified=0`, committed `2026-09-20T14:59:23-07:00`. The retired instant is quoted with the `cited:` marker in an adjacent span, which is the form `adapter.md` §3 ratifies | leg B unmodified at `3ee3c72b` prints `line 115 commit 3ee3c72b ... added 4 deleted 0 hunks 2 filelines 129 reach 0% instant 2026-09-20T22:00Z`; at the fix head no such line survives, only the regeneration's `reach 41%` with no instant. Diff reach discriminates, so leg B does not always fire |
| U5-8 | the proposed assertions criterion | 🟡 | I extracted both legs verbatim from the handoff's fenced blocks and ran them as scripts. At the fix head they print exactly what the handoff records, span for span. Run unmodified in a throwaway clone at `3ee3c72b` they red all four: R2 on the count triple, R1 on `gateclaims 2`, R3 on two stated tallies matching no derived one, R4 on the `reach 0%` line. That is a control on a defect that actually shipped, which is stronger than a mutation. Two gaps keep it from 🟢. It derives unit tallies from `[x]` ticks, so at the fix head it prints `stated ten of eleven units` matching `merged-tally=ten of eleven units` and certifies R3's new false claim. And without the plan branches fetched it degrades to `noplan` | I ran leg A in a clone with the plan branches absent: `plan gate-split noplan`, losing the `started=6` corroboration, while `gateclaims 2` still fired. So the degradation is partial, not total, but it is silent. The handoff flags the fetch requirement to the Orchestrator; it does not flag the tick-versus-verdict source |
| U5-1 | one head sha, on main | 🟢 | one sha, `5f2c3787`; `git merge-base --is-ancestor` gives `anc 0` | the `d34b4fb1` copy yields two shas and git exits `fatal: --is-ancestor takes exactly two commits` |
| U5-2 | the worktree table is the live set | 🟢 | `diff` prints no lines | against the `d34b4fb1` copy the diff prints the stale entries, `638-dual-radix` and `672-citation-predicate` among them |
| U5-3 | the stated worktree count is the row count | 🟢 | `7`, then `7` | the `d34b4fb1` copy states `8` with no row matching the current format |
| U5-4 | one ranked row per open issue, none for a closed one | 🔴 | `diff` prints `14d13` with `< 722`, exit 1. The handoff grades this 🟡 under the plan's live-facts rule, anchored on the landing refresh `3ee3c72b` at 21:59:23Z. That is the previous unit's commit. The rule reads `created after the unit's commit time`, and #722 was created `2026-09-20T22:12:36Z`, which is before every commit on `unit/rf-U11`: the three roadmap-touching ones are `1fe53f5a` 22:16:57Z, `354c2d7f` 22:28:25Z and `1405ee77` 22:40:32Z, and the head is 22:49:03Z. The handoff's sentence `after every commit on this branch` is false as written. With the right anchor the exemption does not apply and the row is 🔴 | the exemption does apply to the three rows the refresh added: #718 21:45:38Z, #719 21:53:29Z, #721 21:57:04Z all precede those same commits and all have rows. So the rule is not being read as never exempting anything; #722 alone fails it |
| U5-5 | no unanswered prompt is left | 🟢 | `0`, then `0` | the `d34b4fb1` copy prints `1` leftover prompt |
| U5-6 | the alone rule, under bash | 🟢 | `nonempty 0`; five roadmap-touching commits above BASE whose united file list is `.sdlc/roadmap.md` alone; branch file list is the roadmap, the two unit handoffs and the questions file, four paths, all under `.sdlc/` | run in this seat's default zsh the loop dies with an ambiguous-argument error, which is revision 15's recorded case; under bash it prints the single path |
| U5-7 | debt ids as `debt.md` defines them | 🟢 | `0`, then `1` | the `d34b4fb1` copy gives `1`, then `0`, the exact inverse |
| P1 | `npm test`, no `node_modules`, tree byte-stable | 🟢 | clean clone at 089e0e44, foreground, once: `✓ all 48 test files passed`, exit 0, 130 s wall, `TESTS` length 48, `git status --short` 0 after. Load 10.32 before, 15.02 after | the P4 plant below reds this same run, since `repo/branding.mjs` is one of the 48 |
| P4 | branding gate, which scans `.sdlc/` | 🟢 | `branding: clean (508 files scanned)`, exit 0, read unpiped | a records doc copied to `.sdlc/plant.md`: `FAIL: 3 branding violation(s) across 509 files`, exit 1. Planted inside `.sdlc/`, so it proves the gate reaches this branch's own directory |
| P5 | scope wall | 🟢 | zero paths outside `.sdlc/`; four paths total; `git ls-files \| grep -c node_modules` is `0` | U5-6's list is the same measurement from the other direction |
| P6 | no em dash added in prose | 🟢 | `0` | one em dash appended to the roadmap in the clone: `1` |
| P7 | baseline agrees with the tree | 🟢 | `stale total: 0`, exit 0 | the baseline test figure bent to 47: `STALE tests: baseline 47, test/run.mjs TESTS 48`, `stale total: 1`, exit 1 |

## The two 🔴, stated once

R3 is not a wording slip. The unit was asked to stop the roadmap calling a unit 🟢 that no verdict
graded 🟢. It changed `ten of ten` to `ten of eleven`, which fixes the arithmetic and leaves U5 counted
as 🟢 against a verdict file that says 🟡. The new criterion then reports agreement, because it derives
the tally from merge ticks in the plan checklist. A merge tick records that the Orchestrator merged the
unit; a verdict records whether it was graded. U5-8 re-derives the number and not the predicate, so it
converts a visible contradiction into an invisible one. That is worth fixing before U5-8 is folded in,
and it is a different point from the reviewer's findings 1b, 2, 3, 4 and 6, none of which names the
source of the tally.

U5-4 is a rule read against the wrong commit. Anchoring the live-facts exemption on the previous unit's
refresh rather than on this unit's own commits is what turns the row 🟡. Every U11 commit postdates
#722 by between four and thirty seven minutes.

## Not evidenced

Nothing. Every row above has a measurement this seat ran and a control this seat ran. The builder's
handoff and the reviewer's record were read as claims throughout; where they agree with my runs I say
so, and the two places they do not are the two 🔴.
