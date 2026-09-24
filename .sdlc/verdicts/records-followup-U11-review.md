---
kind: review
plan: records-followup
unit: U11
seat: reviewer
head: 7b84d698
base: 1f991877
written: 2026-09-20
---

# Review: records-followup U11

Read only. Nothing in the worktree was edited; this file sits under `.sdlc/runtime/`, which
`.gitignore:15` ignores, so `git status --short` stays `0`.

Every row below is this seat's own run. The builder's handoff was read as a claim, never as evidence.

## Verdict

🟡 pass with notes. All four reds are genuine re-derivations and the criterion demonstrably
discriminates at the graded head. Findings 1 to 5 are all limits of the proposed criterion, not
falsehoods in the artifact that lands.

## Answer: what blocks landing, what rides with the criterion

The split that matters is not must-fix against carry. It is artifact against criterion, because
findings 1 to 5 are about a criterion that is proposed, not yet in the plan.

Nothing in findings 1 to 5 makes the shipped roadmap untrue. I re-derived all four repairs
independently and they hold.

| # | Finding | Gate it blocks | Why |
|---|---|---|---|
| 1a | the `cited:` span shape at `roadmap.md:116` | before land | in the landing artifact, one line, and this plan's own U3 wrote the clause it deviates from |
| 1b | the strip is an escape hatch | before U5-8 is folded in | criterion design, coupled to 1a (below) |
| 2 | the `## Revisions` cut | before U5-8 is folded in | the hole is the exact defect class the criterion exists to close |
| 3 | leg B's four-phrase needle list | before U5-8 is folded in | same, one rewording escapes |
| 4 | neither leg asserts | carry as a recorded limit | the plan's house style for all seven U5 rows; changing it is a plan-wide decision, not U11's |
| 5 | reach is a proxy | carry as a recorded limit | the error direction is the safe one; see below |
| 6 | `commit none` has no stated verdict | before U5-8 is folded in | one clause in the Expected column |
| 7 | two loose cells in the R1 fix | before land | in the landing artifact |

1a and 1b are one fix, not two. Changing `roadmap.md:116` to the precedent form makes leg B stop
stripping it, and leg B then flags U11's own row, so the criterion goes red at the fix head. Measured
below as probe 4. Whoever fixes the span must widen leg B's strip to cover a quote span followed by a
separate `cited:` marker span in the same motion, or the fix reds the check.

## The four reds, re-derived

| Red | State | This seat's own derivation |
|---|---|---|
| R1 | 🟢 repaired | `git log --format='%H %cI %s' plan/gate-split` and the branch's own checklist, board and approval file. Both of the builder's corrections to the dispatch timestamps hold: the `U6a` waiver is `0b02711b` at `12:28:58-07:00`, which is `19:28:58Z`, not 19:52Z; the `U6a` merge is `50898d58` at `19:54:46Z`, and `19:55Z` is `bf82ab11`, the checklist-tick commit. Checklist prints `[x] U1 [~] U2 [~] U3 [~] U4 [~] U5 [x] U6a [ ] U6b`: six of seven started, two merged. Approval questions 5, 7 and 8 carry the three waivers as the cell cites them. Board: two 🟢, four 🔵 each with a live `.worktrees/gs-U*` path, one ⚪ reading `waits on #681 landing (start gate G0)` for `U6b` alone. The numbers hold |
| R2 | 🟢 repaired | `rows 13`; `pri (p) 5`, `pri P1 4`, `pri P2 2`, `pri P3 2`; no `P0` row; parts sum to 13; `Count: ... total 13`; front matter `open (13 issues)`. Parts equal the stated total equal the row count |
| R3 | 🟢 repaired | `git show origin/main:.sdlc/plans/records-followup.md | grep -cE '^- \['` prints `11`, the same through `grep -cE '^- \[x\]'` prints `10`, U11 is the `[~]` row. `ten of eleven units 🟢` with U11 named is correct in both places |
| R4 | 🟢 repaired | `git show --numstat --format= 3ee3c72b -- .sdlc/roadmap.md` prints `4	0	.sdlc/roadmap.md`; two `@@` hunks under `--unified=0`; `git show -s --format=%cI` prints `2026-09-20T14:59:23-07:00`. The new `roadmap.md:115` states exactly that, drops the read claim, and names itself as the mechanism. It is a re-statement, not a softened claim kept |

## The criterion at the graded head

Both legs run UNMODIFIED in a throwaway clone at `3ee3c72b`, plan branches fetched. All four reds
reproduce from the criterion alone:

| Finding | What the unmodified criterion printed there |
|---|---|
| R2 | `rows 13` against `partsum 10 total 10` and `inputs 10` |
| R1 | `gateclaims 2` beside `plan gate-split at plan/gate-split units=7 merged=2 started=6` |
| R3 | `stated nine of ten units` and `stated ten of ten units`, neither equal to any derived tally |
| R4 | `line 115 commit 3ee3c72b at 2026-09-20T14:59:23-07:00 added 4 deleted 0 hunks 2 filelines 129 reach 0% instant 2026-09-20T22:00Z` |

Without the plan branches fetched, leg A degrades to `plan gate-split noplan` and loses the
`started=6` half of R1. `gateclaims 2` still reds the row, so the criterion still fires, but the
fetch is a precondition the row does not state.

The second half of the builder's claim also holds: at that same head the regeneration's own read
claim still prints `reach 41%` and is accepted. The check is not one that always fires.

## Findings

### 🟡 1. Leg B's `cited:` strip is an unconditional escape hatch

Probe 3, measured in a throwaway clone at the fix head. Planted one line in the body:

`This file was `cited: Read at one instant, 2026-09-21T09:00Z` and is current.`

Leg B output was byte-identical to the clean run: the two `7dde8cb1` lines and nothing else. The
planted claim is live, load-bearing and false. Any future false read claim is hidden by wrapping it
in a `cited:` span.

The span shape compounds it. Every other `cited:` in this repo writes the marker as a separate
adjacent span:

- `.sdlc/verdicts/records-followup-U4.md:29`, one span holding the quote, then `` `cited:` ``
- `.sdlc/verdicts/records-followup-U4.md:30` and `.sdlc/verdicts/records-followup-checkability.md:62`, the same shape
- `.sdlc/adapter.md:103`, the clause itself: "writes it as the record holds it, marks the span `cited:` next to it"

`.sdlc/roadmap.md:116` puts the marker inside the quote span. Both halves of the clause point the
other way: the span contents are not what the record held, and the marker is inside rather than next
to it. Against that, this plan's own U10 finding 1 says only that such a quote "carries `cited:`",
which U11 satisfies. The two ratified wordings disagree, so this is a call for the Orchestrator, not
a clear violation. It is one line either way.

Probe 4 measures the coupling. Under the precedent form, leg B does not strip and does flag:

`line 25 commit none claim "The retired line said `Read at one insta"`

So the strip regex `s/\x60cited:[^\x60]*\x60//g` is shaped to a span form that exists nowhere else in
`.sdlc/`, and the criterion's pass at the fix head depends on that shape.

### 🟡 2. Cutting at `## Revisions` is a real blind spot, and U11's own repairs live inside it

Probe 1. Planted below the cut:

`| 2026-09-20 | later note: the table now holds 40 ranked rows, total 40; plan/gate-split refuses to start any unit before #681 lands and nothing else is ready to start; twenty of twenty units green | planted |`

Three falsehoods, one per finding class R1, R2 and R3, verbatim in R1's case. Both legs printed
exactly the clean-run output: `rows 13`, `partsum 13 total 13`, `gateclaims 0`,
`stated six of seven units`, `stated ten of eleven units`.

Not hypothetical. `roadmap.md:115` and `:116` are the two rows U11 added, and between them they
assert a diffstat (`4 added lines and 0 deleted in two hunks`), five timestamps and two tallies.
Every one sits in the region nothing re-derives. The handoff's stated reason for the cut
(`.sdlc/handoffs/records-followup-U11.md:149`, the revision log "would match every needle forever")
is sound for leg B's needles and does not justify exempting the revision log from leg A's arithmetic,
which has no such problem.

### 🟡 3. Leg B's needles are a four-phrase allowlist fitted to what exists today

Probe 2. Planted in the body:

`Every cell below was re-read in full from live facts at 2026-09-21T09:00Z.`

Leg B printed nothing new. `Read at one instant|regenerated from live facts|full regeneration from
live|read fresh` is the entire surface. One rewording of the same claim class escapes.

### 🟡 4. Neither leg asserts, and there is no reach threshold to fit

Grepping leg B for any comparison constant returns only the `%.8s` format and the
`$(( del * 100 / fl ))` arithmetic. Nothing is compared, nothing exits nonzero. Both legs emit
numbers and the Expected column asks a reader to compare them.

So on the question of whether the threshold is fitted to the data: no constant was fitted, because no
constant exists. The 0 to 41 gap is genuine on the two points the handoff cites, but the separation
lives in a human's reading rather than in the check. Per `checks-that-bite`, a leg that cannot go red
is a reporter. This matches the house style of all seven existing U5 rows, so it is not a defect U11
introduced, which is why it is a carry rather than a fix.

### 🟡 5. Reach measures edit volume, not reading (in full)

Reach across every commit that ever touched the roadmap:

`354c2d7f added 2 deleted 2 lines 130 reach 1%`
`1fe53f5a added 7 deleted 6 lines 130 reach 4%`
`3ee3c72b added 4 deleted 0 lines 129 reach 0%` (R4's subject)
`7dde8cb1 added 54 deleted 52 lines 125 reach 41%` (the regeneration)
`28c2e8cc added 123 deleted 0 lines 123 reach 0%` (the file's own creation)

`28c2e8cc` wrote the whole roadmap and scores `reach 0%`, identical to the three-row patch that reach
is meant to separate it from. Deleted lines over file lines cannot see a whole-file write performed
as a create or as a pure append.

Two consequences. The error direction is the safe one: an honest whole-file write scores low and gets
flagged, which is a false red rather than a false green. But the inverse is open, because reach is a
proxy for edit volume and not for reading. A seat that deletes and re-adds lines cosmetically inflates
reach without re-deriving anything, and the check cannot tell the difference. The metric holds on the
two points cited and does not generalize past them. Worth recording beside the criterion so a later
seat does not read `reach` as evidence of a read.

### 🟢 6. `commit none` has no stated verdict

Probe 4 produced `line 25 commit none claim "..."`. The Expected column says "every line it prints
carries a `reach` consistent with a whole-file rewrite". A `commit none` line carries no reach at all,
and the row does not say whether that passes or fails. One clause fixes it.

### 🟡 7. Two loose cells in the R1 fix

`.sdlc/roadmap.md:32` says `U2` to `U5` were dispatched "off `plan/preset-intent-fidelity` @
`a2bb3c84`". The dispatch commit `7d811172` and every board row say off `plan/gate-split` @
`ebddc55d`, the merge that brought `a2bb3c84` in. The cell echoes the waiver's condition wording
rather than the dispatch itself. Approval question 8's Effect line does read "when built off
`plan/preset-intent-fidelity` @ a2bb3c84 or later", so the cell is traceable, but it states as the
dispatch target something that is the waiver's precondition.

Same cell: "six of seven units are under way" reads loosely, since two of the six are merged rather
than under way. The `Blocked by` cell states it precisely as "merged or in flight under a waiver".

## Negative controls NC1 to NC5

All five bite, each reproducing the handoff's stated output. Run in a throwaway clone, restored from
a pristine copy between controls, never in the unit worktree.

| # | Mutation | What my run printed | Bites |
|---|---|---|---|
| NC1 | `total 13.` to `total 12.` | `rows 13`, `partsum 13 total 12` | 🟢 |
| NC2 | `unranked 5` to `unranked 2` | `rows 13`, `partsum 10 total 13` | 🟢 |
| NC3 | old `#713` status cell restored verbatim | `gateclaims 1` beside `started=6`, and `stated six of seven units` gone from the output | 🟢 |
| NC4 | `ten of eleven units` to `ten of ten units` | `stated ten of ten units` against derived `ten of eleven units` and `eleven of eleven units` | 🟢 |
| NC5 | `open (13 issues)` to `open (10 issues)` | `rows 13` against `inputs 10` | 🟢 |

NC6 in the handoff is leg B at the graded head with nothing mutated, reproduced in the table above.

## U5-1 to U5-7 at the fix head

| Row | What it printed | State |
|---|---|---|
| U5-1 | `1`, then `anc 0` | 🟢 |
| U5-2 | no lines, then `diff 0` | 🟢 |
| U5-3 | `7`, then `7` | 🟢 |
| U5-4 | `14d13` with `< 722`, then `diff 1` | 🟡 |
| U5-5 | `0`, then `0` | 🟢 |
| U5-6 | `nonempty 0`; `.sdlc/roadmap.md` alone across all four roadmap-touching commits; then the four-file branch list | 🟢 |
| U5-7 | `0`, then `1` | 🟢 |

U5-4 is the live-facts case. Issue #722 opened after every commit on this branch; the builder declared
it and added no row, which is the plan's preamble applied correctly. The call on whether a further
landing refresh follows is the Orchestrator's.

U5-6 run under `bash` as plan revision 15 requires. The four roadmap-touching commits are U5's
regeneration, the Orchestrator's landing refresh, and U11's `1fe53f5a` and `354c2d7f`; the file list
across all four is `.sdlc/roadmap.md` and nothing else.

## P4 to P7 at the fix head

| Gate | What it printed | State |
|---|---|---|
| P4 | `branding: clean (508 files scanned)`, then `branding exit 0` | 🟢 |
| P5 | `0` paths outside `.sdlc/` | 🟢 |
| P6 | `0` stripped, and `0` raw | 🟢 |
| P7 | seven `ok` time and count lines, one `note  head:` line, one `ok    head:` line, `stale total: 0`, `p7 exit 0` | 🟢 |

P4 was run in THIS worktree with its exit code read directly from the command, never through a
pipeline a `tail` would swallow. `npm test` was not run; the verifier owns it.

## Scope and commit hygiene

Four commits. `1fe53f5a` and `354c2d7f` each touch `.sdlc/roadmap.md` alone; `24620ec9` and `7b84d698`
each touch `.sdlc/handoffs/records-followup-U11.md` alone. The branch touches four paths, all under
`.sdlc/`, zero outside. No `Seat:` trailer on any of the four; the `Seat: orchestrator` in the range
is on `3ee3c72b`, the Orchestrator's own landing refresh, outside this unit. The attribution trailer
`Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` is present on all four. No `.claude/docs/other/`
and no `node_modules` path in any commit. `git status --short` prints `0`.

## change-reviewer-agent §What to check, per adapter conflict X2

Run as a required pass, in order, skipping legs no changed file touches.

| Leg | State | Why |
|---|---|---|
| 1 privacy and repo hygiene | 🟢 | no `.claude/docs/other/` path, no `node_modules`, tree clean |
| 2 semantic-role parity | skipped | `src/engine/semantic.js` not touched |
| 3 browser traps | skipped | no CSS, no SVG, no `font-family` |
| 4 headless-shim safety | skipped | `test/ui/headless-boot.mjs` not touched |
| 5 editor-section pattern | skipped | no section or canvas file touched |
| 6 architecture | skipped | no runtime dependency, no engine, no generated artifact |
| 7 tests and commit | 🟢 | attribution trailer present; a docs-only change owes no test leg |

## For the Orchestrator

| Item | Ask |
|---|---|
| 1a and 7 | both are in the landing artifact and both are one line. Rule on the `cited:` span shape, since adapter §3 and U10 finding 1 disagree on it |
| 1a with 1b | if the span moves to the precedent form, leg B's strip must widen in the same change or the criterion reds at the fix head |
| 2, 3, 6 | close before folding U5-8 into the plan. Leg A's arithmetic has no reason to stop at `## Revisions`; leg B's needle list and its `commit none` case both need widening |
| 4, 5 | record beside the criterion as known limits. Neither is U11's to fix |
| fetch precondition | U5-8's Expected should say the plan branches must be fetched, or leg A silently degrades to `noplan` |
