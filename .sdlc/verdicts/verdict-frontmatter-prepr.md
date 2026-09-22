---
kind: verdict
plan: verdict-frontmatter
seat: verifier
pass: 1
pr: 733
ticket: "#723"
written: 2026-09-22
---

# Pre-PR · verdict-frontmatter · pass 1 · 🟢 at `fbb19aec`

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
