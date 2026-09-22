---
kind: verdict
plan: verdict-frontmatter
seat: verifier
pass: 2
passes: 1 at fbb19aec 🟢 (superseded: the critic's CHANGES on PR #733), 2 at 3c21930e 🟢
pr: 733
ticket: "#723"
written: 2026-09-22
---

# Pre-PR · verdict-frontmatter · passes 1 to 2

Current finding: 🟢 at `3c21930e`, in `## Pass 2` below, the block the adapter's `check_gate` reads.
Pass 1 is superseded and kept as history: it graded `fbb19aec`, which no longer describes the head.
For the verdict, read the last block, not this one.

## Pass 1, at `fbb19aec`

verdict: 🟢
sha: fbb19aeca55517e3fefde133a295e023df5cef49

`plan/verdict-frontmatter` at `fbb19aec`, `origin/main` merged in, draft PR #733, 7 paths. Pair per
`pre-land-review`, both fresh context and both labelled substitutes under the Conductor's R17:
`reviewer-l4` ran as `reviewer-l3` and `verifier-l3` as `verifier-l2`, each at opus high. Reports:
`/tmp/v13/vf-prepr-review.md` and `/tmp/v13/vf-prepr-verify.md`. Rulings applied: the Conductor's
ruling A on U1-1 (`.sdlc/questions/verdict-frontmatter-U1-counts.md`), and P4 derived after a fresh
`git fetch origin`. I re-derived P4 and the chain of custody myself, and shape-checked the four records
the plan adds (`verdict.py check`, exit `0` each).

`origin/main` moved after this head. `2f08e010` (my small-fixes U1 verdict) landed at 14:17:30,
after `fbb19aec` at 14:13:51. It touches no path this PR carries, the merge is clean, and P4 was
derived against it. If `origin/main` is merged in again, the head moves and this record must be
regraded.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P1 | `npm test` green, tree clean after, N = baseline | 🟢 | verify leg, own worktree at the head: `✓ all 48 test files passed`, exit `0`, `0` status lines; `.sdlc/baseline.md:19` agrees. Nothing the plan changes is on the test path, so this row is a regression guard | a planted retired-brand URL in a handoff: `✗ 1/48 test file(s) failed`, exit `1` |
| P2 | branding clean, no added em dash outside backticks | 🟢 | both legs: `branding: clean (555 files scanned)`, added-line count `0`; review leg also swept the 7 files for private paths (`0`) | a planted brand line reds `FAIL: 1 branding violation(s)`; a U+2014 appended to the list moves the count to `1` |
| P3 | scope wall | 🟢 | `0`, `0`; the 7 paths are all additions except `.sdlc/adapter.md`, which is additive (`--numstat` removal column `0`) | the plan's three-name fixture prints `2`; an appended line in `survey.md` moves the second figure to `1` |
| P4 | the list equals the failing set at `origin/main` | 🟢 | after `git fetch origin`, `origin/main` = `2f08e010`: the verify leg ran the plan's command verbatim, `0`. Mine, independently: the head's script over `git archive origin/main .sdlc/verdicts` with no list gives `47` failing names, and `diff` against the list has `0` lines. With the list in place main reads `verdicts 72 graded 25 grandfathered 47 bad 0`, so the mandate lands green. No re-pin needed | a field-less `zz-control-U1.md` planted in a main copy gives a `diff` of `< zz-control-U1.md` |
| U1-1 | exit 0 with the list, 1 with an empty list, graded per ruling A | 🟢 | `verdicts 73 graded 26 grandfathered 47 bad 0`, exit `0`. `grandfathered 47` equals the list's name count (`grep -vc '^#'` gives `47`), with `bad 0` and exit `0`. Totals at this instant, recorded as the ruling asks: `verdicts 73`, `graded 26` | the empty list: `verdicts 73 graded 73 grandfathered 0 bad 47`, exit `1` |
| U1-9 | a grandfathered file that gains a valid field reds until delisted | 🟢 | a clean run, then the plant: `CLEARED survey.md: grandfathered but carries the field`, `bad 1`, exit `1`, with the other three counts unchanged; delisted, `bad 0`, exit `0` | the same plant at `8742b0ee`: no `CLEARED`, `bad 0`, exit `0` |
| U2-1 | #734 exists with the labels and 47 distinct names | 🟢 | `N=734`, the plan's title, `P3,kind:chore,lane:docs,size:M,status:backlog`, `47` | a body copy missing one name: `46` |
| U2-2 | the first line names the ticket, names hash unchanged | 🟢 | `1`, `29d0eff2c1bccbc1` | one name renamed: `84891696f47b0e2c`. The grep half's weakness is carried below as N2 |
| C1 | CI, three required jobs at this head | 🟢 | `gh api .../commits/fbb19aec.../check-runs`: `build-test`, `panda-smoke`, `corpus-contrast` each `completed success`, each with `head_sha` = the head; `deploy` skipped | the same call on the first parent `eb2c973b`: `total_count 0` |
| C2 | the merge onto main | 🟢 | `git merge-tree --write-tree origin/main fbb19aec`: exit `0`, no conflicts; `gh pr view 733`: `headRefOid` = the head, `MERGEABLE`, `CLEAN` | two planted commits rewriting the same adapter line give `CONFLICT (content)`, exit `1` |
| C3 | every `.sdlc/checks/*.sh` passes at the head, per the new §2.1 line | 🟢 | all five exit `0`: baseline-agrees `stale total: 0`, card-amendment `stale total: 0`, card-source-range `range mismatches: 0`, doc-drift-rows `bad 0`, verdict-frontmatter `bad 0` | the verdict-frontmatter check reds on a planted field-less file in the post-squash shape: `MISSING zz-control-U1.md`, exit `1` |
| C4 | nothing ungraded lands | 🟢 | mine: each of the 7 blobs at `fbb19aec` equals the blob at `e5ae5b37`, the U2 head I graded, and five also equal `8fadefbe`, the U1 head I graded | a blob compared against a commit outside the graded heads differs, so the equality discriminates |

## Carried, none blocking

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| N1 | the adapter says `The list shrinks only that way`, and the script does not enforce it | 🟡 | review leg M1: a new field-less verdict with its name appended to the list gives `grandfathered 48 bad 0`, exit `0`; deleting `survey.md` and its name together gives `bad 0`, exit `0`. The pin (hash `29d0eff2...`) lives only in the plan's U1-3, not in the script, so once this gate is mandatory a list edit bypasses it. This plan exists to stop records asserting what nothing re-derives, and this is a new rule stating more than its check enforces. It does not block, because every list edit shows in the diff a pre-land reads | the same edits made to a verdict file instead of the list red at once, so the gap is only in the list |
| N2 | U2-2's `grep -c '#[0-9]'` and U2-1's `#TBD` control, from the U2 verdict | 🟡 | the header carries `#723 mandate`, so the grep printed `1` before U2 filled in the number, and a `#TBD` header gives `N=723`, not an empty `N`. Both legs reproduced it. The ticket number is established by U2-1's `N=734` and the right title | `N` reads `723` before and `734` after, so the extraction discriminates where the grep does not |
| N3 | U1-1's written figures, from the U1 verdict | 🟡 | settled for this pass by ruling A; the text is unchanged and keeps drifting, from `68`/`21` as written, through `70`/`23` at the unit verdict, to `73`/`26` now | each count moves by exactly the verdicts with the field that landed after the pin, all traced by name at the U1 verdict |
| N4 | #734's removal rule names the wrong signal for one case | 🟡 | review leg L2: #734 says the check goes `STALE` when a name is deleted without its file being fixed. It prints `MISSING`/`VALUE`: the list with `survey.md` removed gives `MISSING survey.md: no verdict: line`, exit `1`. So the U2 review's `line for line` does not hold for that clause. Editing #734 is outward-facing and belongs to the Orchestrator | `STALE` does appear when the file is deleted with its name kept (control E), which is the case the rule confused it with |
| N5 | a fenced `verdict:` line counts, in this check and in `read_gate` | 🟡 | review leg I1: a real 🔴 record followed by a fenced example `verdict: 🟢` passes the check, and `read_gate` reads `🟢`, so `land --gate` would accept it. The check matches the adapter, so this PR adds no defect, but the gate it mirrors has one. I scanned every gate record on main for a `verdict:` line inside a fence: none has one, my own included | a record whose only `verdict:` line is unfenced 🔴 is read as 🔴 by both |

Lows, recorded so they are not re-found: the U1 handoff's `Head` field at `:53` is still wrong and
lands as written (L3); `verdict-frontmatter-U1-review.md:67` carries a literal U+2028 and U+2029
inside a suggested regex, which GitHub may flag as hidden Unicode (L4); a directory or dangling
symlink named `*.md` crashes the script with a stack trace, which still fails safe (L5). The review
leg's 22 edge cases found no false green against the stated rule. PR #733 is still a draft.

verdict: 🟢
sha: fbb19aeca55517e3fefde133a295e023df5cef49

## Pass 2, at `3c21930e`

verdict: 🟢
sha: 3c21930e4dc5882628b08bbe5a9bdac3990857a1

`plan/verdict-frontmatter` at `3c21930e`, U3 merged, `origin/main` `70c2d5e5` merged in, PR #733, 9
paths. The pair ran fresh and labelled under R17: `reviewer-l4` as `reviewer-l3` and `verifier-l3`
as `verifier-l2`, each at opus high (`/tmp/v13/vf-prepr2-review.md`, `/tmp/v13/vf-prepr2-verify.md`).
Rulings applied: U1-1 under ruling A plus revision 11, and U1-4 under ruling B (revisions 9 and 10).
Mine: the chain of custody, P4, the critic's control (e), and every open item from pass 1 and the
U3 review, all in a clone of the head.

### Pass 1, owned

Pass 1 found this bypass and graded it too gently. Its N1 read: a list edit bypasses the gate,
`🟡`, not blocking, because a pre-land diff would show the edit. The critic judged the same finding
blocking, since it defeats "mandatory on new records". The critic was right. A diff showing a list
edit is only a defence if someone reads the list, and the gate this plan builds exists so that no
one has to. U3 closed it. What was wrong in pass 1 was the severity, not the finding.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| E | the critic's control (e): a field-less record plus its name appended | 🟢 | mine: `GROWN zz-e.md: not grandfathered at f685529f`, `bad 1`, exit `1` | the same plant at `fbb19aec`: `grandfathered 48 bad 0`, exit `0`, the bypass pass 1 let through |
| P1 | `npm test` green | 🟢 | verify leg: `✓ all 48 test files passed`, exit `0`, `0` status lines | a throw planted in `test/repo/branding.mjs`: `✗ 1/48 test file(s) failed`, exit `1`. Its first plant sat after the file's own `process.exit`, was unreachable and passed, and was discarded |
| P2 | branding, no added em dash | 🟢 | `branding: clean (563 files scanned)`, `0`; the review leg found `0` em or en dashes across 587 added lines | a planted retired-brand line with the glyph: `FAIL: 1 branding violation(s)`, glyph count `1` |
| P3 | scope wall | 🟢 | `0`, `0`; 9 paths, 587 insertions, 0 deletions | the plan's fixture prints `2` |
| P4 | the list equals the failing set at `origin/main` | 🟢 | the verify leg ran it as written: `0`. Mine: the head's script over `origin/main` `70c2d5e5`'s verdicts, inside a clone because the check now needs the pin's history: `47` failing, `0` lines of diff against the list; with the head's list in place, `verdicts 75 graded 28 grandfathered 47 bad 0` | a field-less plant in main's tree gives a `diff` of `< zz-p4-plant.md` |
| U1-1 | ruling A plus revision 11 | 🟢 | `verdicts 78 graded 31 grandfathered 47 bad 0`, exit `0`, where `47` is the list's name count; totals recorded at this instant `78`/`31` | the empty list: `verdicts 78 graded 78 grandfathered 0 bad 48`, exit `1`, with one `PIN MISMATCH` line |
| U1-4 | ruling B, revisions 9 and 10 | 🟢 | `0`, `1`, with `GROWN zz-absent.md` | a reader that does not skip `#` gives `GROWN # x`, first figure `1`; a list path the substitution cannot reach gives `0`, `0` |
| U1 | U1-0, U1-2, U1-3, U1-5 to U1-9, U2-1, U2-2 | 🟢 | verify leg, each as written at the head, each with its control; `12` rows, `12` 🟢 | each red on its own plant, and U1-9's pre-revision-4 head `8742b0ee` passes its plant silently |
| U3 | U3-1 to U3-7 | 🟢 | `7` rows, `7` 🟢, matching my U3 verdict at `174d5c48`, whose blobs all 9 landing paths equal | each U3 plant also run at `fbb19aec` or `bc868dd3`, where it passes silently |
| C1 | CI at this head | 🟢 | `build-test`, `panda-smoke`, `corpus-contrast` each `completed success`, each `head_sha` `3c21930e` | the parent `2c0dea6e` has `total_count 0` |
| C2 | the merge onto main | 🟢 | `git merge-tree --write-tree origin/main 3c21930e`: exit `0`; `MERGEABLE`, `CLEAN` | a planted adapter conflict: `CONFLICT (content)`, exit `1` |
| C3 | every `.sdlc/checks/*.sh` | 🟢 | all five print their clean figure: `stale total: 0`, `stale total: 0`, `range mismatches: 0`, `bad 0`, `bad 0`. Two of them exit `0` even when stale, so the figure is the reading, not the exit | each reds its figure on a planted fault |
| C4 | the post-squash tree | 🟢 | the real squash tree `1bd58778`: `verdicts 78 graded 31 grandfathered 47 bad 0`, exit `0` | a field-less plant there: `MISSING`, `bad 1`, exit `1` |
| C5 | nothing ungraded lands | 🟢 | mine: all 9 blobs at `3c21930e` equal the blobs at `174d5c48`, the U3 head I graded | the U1 head `8fadefbe` differs on 6 of them, so the equality is specific |
| C6 | the adapter says only what the script does | 🟢 | mine and the review leg's: `shrinks only that way` now occurs `0` times, and every sentence of the amendment is backed by the script: `MISSING`, `VALUE`, `STALE`, `CLEARED`, `GROWN`, `PIN MISMATCH`. Pass 1's unbacked sentence is gone | `fbb19aec`'s adapter still carries it (`1`) |

### Carried, none blocking

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| N1 | a pinned-failing name can carry any field-less content, and outlives the backfill | 🟡 | mine: `survey.md` rewritten field-less, still listed, gives `bad 0`, exit `0`. Review leg L2: a name backfilled off the list, or deleted with its file, can later be re-appended with a new field-less file and pass, `bad 0` both ways. So finishing #734 does not close the mandate for those 47 names. #734's comment reads as bounded to names still on the list | a field added instead reds `CLEARED`, so the list is read and the gap is field-less content under a pinned name |
| N2 | moving both pins together passes | 🟡 | mine: a field-less record committed, both pins moved to that commit and the name listed: `bad 0`, exit `0`. It needs an edit to the script, where the critic's attack needed only the list | moving only the list's pin reds `PIN MISMATCH` |
| N3 | the delete-with-name case | 🟡 | mine: `survey.md` deleted along with its name: `grandfathered 46 bad 0`, exit `0`. The adapter no longer says otherwise, and the plan names it on #734 | deleting the file but keeping the name reds `STALE` |
| N4 | the re-pin recipe went stale with U3 | 🟡 | review leg L1: the plan's P4 re-pin list names what moves together but not the script's `PIN=` or the comment repeating it, and `grep -c 'PIN='` in the adapter gives `0`. Followed as written, a re-pin reds `GROWN` on every added name, which fails safe but blocks the landing the re-pin exists for. No re-pin is due now, since P4 is `0` | the review leg's full-sha header plant shows the pin comparison is textual (`PIN MISMATCH` for the same commit written in full), so the pins must move as identical strings |
| N5 | the adapter names the header as the pin's authority; the script's constant is | 🟡 | review leg L3: grading uses `PIN=f685529f` from the script, and the header is only string-compared, so the sentence `pinned to the commit its own header names` inverts which side decides. The adapter also does not say the check now needs git and full history (`PIN unreadable` in a shallow clone) | a `--depth 1` clone gives `PIN unreadable`, exit `1`, which is the requirement the adapter leaves out |
| N6 | U2-2's first needle is vacuous | 🟡 | the header carries `#723`, so `grep -c '#[0-9]'` prints `1` on a `#TBD` header too. The verify leg proposes `grep -c 'ticket #734'`: `1` live, `0` on a `#TBD` copy | that substitute discriminates where the plan's needle does not |

Lows from pass 1 still standing: the U1 handoff's `Head` field (L3) and the U+2028/U+2029 pair at
`verdict-frontmatter-U1-review.md:67` (L4). PR #733 is still a draft.

verdict: 🟢
sha: 3c21930e4dc5882628b08bbe5a9bdac3990857a1
