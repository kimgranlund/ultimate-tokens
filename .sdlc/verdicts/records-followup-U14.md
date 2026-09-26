---
kind: verdict
plan: records-followup
unit: U14
ticket: "#709"
branch: unit/rf-U14
seat: verifier
grade: verifier-l2, run by the verifier seat itself
---

# Verdict records-followup U14 · 🟢 · 18 🟢, 0 🟡, 0 🔴

verdict: 🟢
sha: 79dc31ed9e78825a59b22d8f1320c3e4fc8b8196

> **Model-independence label, owner ruling R17.** Grade `verifier-l2`, opus at high effort, run by the
> verifier seat itself: the same model and effort as the seat writing this record. No fable seat
> checked it.

Graded per R20 at the snapshot's recorded instant, `2026-09-21T12:35:49Z`, not against live `gh`. The
world check is `.sdlc/verdicts/records-followup-U14-window.md`, taken inside the R19 freeze and cited
here rather than repeated.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| V1 | one read, never re-read across the three later renders | 🟢 | all `9` snapshot blocks are byte-identical at `e147ae0b`, `a6ee67ee`, `0deb2a54` and `5b1fff17`, by sha256; `INSTANT` reads `2026-09-21T12:35:49Z` at every one | `6` of the `11` recorded refs have since moved, and one branch is deleted, so any re-read would have changed `REFS`; the blocks did not change |
| V2 | each render reproduces from the snapshot under the generator that made it | 🟢 | `--verify` exits `0` on all five pairs: `e147ae0b`/`e147ae0b` 756 lines, `a6ee67ee`/`6952f7a6` 767, `0deb2a54`/`418a8ced` 769, `5b1fff17`/`9006eb7a` 770, `79dc31ed`/`79dc31ed` 770 | V4's two mutations |
| V3 | no render moved a data cell | 🟢 | `195` table rows outside the fences at `e147ae0b`; render 2 changes `2` lines, both a column header and a rule sentence; render 3 changes none; render 4 adds `1` revisions row anchored on `e147ae0b`, which `--verify` derives | the same diff reports the `2` header lines and the `1` added row, so it discriminates a changed line from an unchanged one |
| V4 | `--verify` fails when either half is wrong | 🟢 | at the head, exit `0`, `770` lines | one snapshot value altered (`#377` `P3` to `P2` in `ISSUES`): exit `1` at line `46`, re-render `P2 4, P3 1` against the file's `P2 3, P3 2`. One rendered cell altered: exit `1` at line `61`, file `P2` against re-render `P3` |
| V5 | a reader can rerun a cell's command and get the cell | 🟢 | the file's own recipe, run by hand in bash, gives `Order` `8`, `Issue` `#377`, `Title` `hosted describe-palette MCP surface on the Phase B Worker (blocked: domains, accounts)`, matching the rendered row at `:63` | the same rows command places `#715` at `6`, so the order command returns different values for different inputs |
| V6 | the legend's marking contract holds by construction | 🟢 | `(p)`, `(d)` and `(legacy)` appear `0` times. Over all `20` issue rows, `0` cells assert a label the `ISSUES` block does not carry; `#377` renders `Pri P3`, `Status blocked`, `Other task` against its recorded `task,P3,status:blocked` | this is census A22 and A23's exact class: in the old file `#721` read `chore` against `kind:feature`, and about twenty cells cited labels that did not exist. The same check over the old file is what found them |
| V7 | `Count:` and `inputs:` are outputs of the generation | 🟢 | `inputs:` reads `20 issues`, `3 PRs`, `35 worktrees`, `11 refs`, `28 reflog entries`, each matching its snapshot block's own size | V4's snapshot mutation moves the `Count:` line, so those figures are derived and not typed |
| V8 | `head:` and `instant:` are never moved by a later patch | 🟢 | both fields are byte-identical at all five commits, `head: 959b1bb7...` and the same read window | the three re-renders changed the file's length from `756` to `770` lines without touching either field |
| V9 | the snapshot was true at its recorded instant | 🟢 | `gh`: the window record, `ISSUES` 20 of 20 and `PRS` 3 of 3 against live, twice. Git: `10` of the `11` recorded refs are witnessed correct at the instant by this repo's own reflogs, `0` mismatched | the reflog witness under census correction 12's conditions; see the note below on the eleventh |
| V10 | the re-pointed criteria pass on the rebuilt file | 🟢 | U5-5 prints `0`, `0` and U5-7 prints `0`, `1`, each its stated Expected; U5-6 prints `nonempty 0`, roadmap commits touching `.sdlc/roadmap.md` alone, and exactly the file list revision 36 refreshed | at `d34b4fb1` the same legs print `1`, `2` and `1`, `0`, the values the plan records as the failing state |
| V11 | scope, self-citation, and cited shas | 🟢 | each of the `11` commits touches exactly `1` file; `0` of `11` commit and file pairs cite their own commit; `154` cited commit shas, `0` on no ref | a known dangling commit is contained in `0` refs, so the orphan test sees one when there is one |
| V12 | step 2 shape check | 🟢 | `verdict.py check` exits `0` on the U14 handoff and on the roadmap | a `🟢` row whose evidence cell has no backtick span exits `1` |
| V13 | `the generation is one roadmap-only commit` | 🟡 | the unit carries `4` roadmap-only commits: the generation `e147ae0b` and three re-renders. Every one touches `.sdlc/roadmap.md` alone, so U5-6 holds, and all three renders derive from `e147ae0b`'s snapshot with no new read, so the clause holds in substance | the handoff does not overstate this: at `:15` it retires its own earlier claim by name, `Not true at any later head: e147ae0b wrote the roadmap and a6ee67ee rendered it again`. Literally the clause says one commit and there are four. Whether they land as one is the Orchestrator's call at merge, which is why this is 🟡 and not 🟢 |
| P1 | `npm test` | 🟢 | `✓ all 48 test files passed`, exit `0`, tree clean after | the adapter's control bit at `bb896a4e`; `test/run.mjs` and `role-table.json` are byte-identical here |
| P4 | branding | 🟢 | `branding: clean (512 files scanned)`, exit `0` | the planted retired maker run exited `1` at `bb896a4e`; `test/repo/branding.mjs` is byte-identical here |
| P5 | scope wall | 🟢 | `0` paths outside `.sdlc/` | the same over `20298cca~1 20298cca` prints `8` |
| P6 | em dashes in added lines | 🟢 | `0`, through the generator's own backtick-stripping leg | the same over `e9850935~1 e9850935` prints `17` |
| P7 | baseline agrees | 🟢 | `stale total: 0`, exit `0` | the `48` to `49` bump exited `1` at `bb896a4e`; the script is byte-identical here |

## The eleventh ref

`refs/heads/plan/baseline-regex` at `880b4a36` cannot be witnessed: the branch was deleted after the
read and its reflog went with it. The object still exists and is still reachable from another ref, so
the sha was real, but nothing now records that this branch pointed at it at `12:35:49Z`. I record it
as corroborated and not witnessed rather than counting it as correct. It is the reflog's known limit
from census correction 12, arriving in the first unit graded under that rule.

## What this rebuild settles

The census found 45 blocking defects in the old file, almost all of them a sentence asserting
something about a source that did not say it. This file cannot carry that defect in a table cell,
because no cell is typed: `--verify` re-renders every one from the snapshot and compares byte for
byte, and I confirmed by hand that the recipe reproduces a cell outside the tool. A23, the legend
contract broken across about twenty cells, is closed by construction rather than by inspection.

What the rebuild does not settle, and says so itself at `:44`, is whether the snapshot matched the
world. A wrong value in both the snapshot and its cell passes `--verify`. That is why the window
record exists and why R20 points the grade at the recorded instant. The file states this limitation in
its own text, which is the first time in this plan a record has named the check it cannot pass.

## Regrade of V13, pass 2

Same head `79dc31ed`, same evidence, V13 only. The acceptance moved: plan revision 37 at main
`2836d727` now reads `one commit carrying the live generation and one per re-render of that same
recorded read`. The L0 seat accepted the revision and required that the regrade carry a control,
not a reading, which is this plan's own rule and the right thing to ask of me.

I wrote the criterion as a script, `/tmp/v13/check.sh`, with one leg per clause, and ran it twice:
once over the unit, once over three falsifiers planted on a branch in a scratch clone
(`/tmp/v13/r1790103310`, cloned so no shared checkout moved). The legs are ONLY, every U14 commit
touching `.sdlc/roadmap.md` touches nothing else; READ, every re-render carries the nine original
snapshot blocks byte-identical to the generation `e147ae0b`; KIND, every such commit reproduces
under `roadmap-gen.mjs --verify` against the generator committed at it, so no cell was typed.

| commit | ONLY | READ | KIND |
| --- | --- | --- | --- |
| `e147ae0b` the live generation | ok | ok | ok, 756 lines |
| `a6ee67ee` re-render | ok | ok | ok, 767 lines |
| `0deb2a54` re-render | ok | ok | ok, 769 lines |
| `5b1fff17` re-render | ok | ok | ok, 770 lines |
| `e131aa25` control B, re-read live | ok | **RED**, 9 of 9 blocks differ | ok |
| `3609c295` control C, hand-edited cell | ok | ok | **RED** at line 137 |
| `52ec0c55` control A, also touches `.sdlc/debt.md` | **RED** | ok | RED |

Run 1 exit `0`, `V13 PASS`. Run 2 exit `1`, `V13 FAIL`. Control B is the one the L0 seat named: I ran
the committed generator's own live-read mode, `--out .sdlc/roadmap.md --ticket 709 --by "V13 control
B" --final`, and committed the result as a roadmap-only commit. It passes ONLY and passes KIND. Only
READ catches it, and it catches it on every one of the nine blocks, `INSTANT` moving from
`2026-09-21T12:35:49Z` to `2026-09-22T18:58:04Z`. That is the discrimination that matters: a live
re-read is invisible to the clause about commit count and visible only to the clause about the read.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| V13 | the generation is one commit for the live generation and one per re-render of that same recorded read | 🟢 | four roadmap-only commits, `e147ae0b` plus three re-renders; all three legs pass on all four, run 1 exit `0` | three planted falsifiers, each red on a different leg: `e131aa25` re-reads live and reds READ on 9 of 9 blocks, `3609c295` hand-edits one cell and reds KIND at line 137, `52ec0c55` adds `.sdlc/debt.md` and reds ONLY. Run 2 exit `1` |

## Is the revision the criterion bending to fit the work

Yes, in the plain sense, and the plan says so in its own revision row. The acceptance moved on
2026-09-22 at 11:51, twelve minutes after my verdict raised V13 at 11:39, and it was written by the
seat that owns both the plan and the graded unit. I also found that the mechanism the new text
blesses did not exist when the unit started: `--rerender`, the no-new-read mode, is absent from the
first generator `5feddebb` and enters at `6952f7a6`, the generator commit eighteen seconds before the
first re-render it justifies. The work invented the mechanism and the acceptance then described it.
That is the shape of a criterion bending, and I will not call it anything else.

What decides the grade is a different question: whether the moved criterion is weaker. It is not, and
I can show it. The old text tested one thing, a count. It did not test reads at all, so control B, a
roadmap commit carrying a fresh live read of the whole world, satisfies the old text completely and
reds under the new one. The revision replaced a proxy with the thing the proxy stood for and left
three falsifiers where there had been one. Under the revised text more things fail, not fewer.

Two further facts weigh the same way. At `6952f7a6` the easier path was to rerun the live generation,
which would have produced one roadmap-only commit per fix and passed the old text without comment;
the builder instead built the mode that makes the read checkable. And the refusal to squash is
grounded outside this unit: orphaning a cited sha is the defect U13 spent two passes repairing, and
my own census found the same class independently at correction 6 and A16. Squashing to satisfy the
old text literally would have manufactured the defect this plan exists to remove.

So the row is 🟢 on the criterion as it stands, and my objection is not to the text but to the
ordering. The acceptance moved after the work and after the grade, authored by the graded seat. Here
that was safe because the new text is stronger and because the move was declared, named its shas,
named what it refused, and routed the override to L0. Nothing structural made it safe. The only
reason it surfaced at all is that I graded the old clause 🟡 and said so; had I graded it 🟢 by
reading past the count, the same revision would have landed unexamined. A criterion that can be
rewritten by its own author after the verdict needs a gate that does not depend on the verifier
happening to object. That belongs in the debt register, which is not mine to write, so I am naming
it here for the Orchestrator rather than red-flagging this row, because it is not V13's subject.

verdict: 🟢
sha: 79dc31ed9e78825a59b22d8f1320c3e4fc8b8196
