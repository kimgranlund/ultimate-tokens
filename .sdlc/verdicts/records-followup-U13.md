---
kind: verdict
plan: records-followup
unit: U13
ticket: "#709"
branch: unit/rf-U13
base: ee854932e2b03da92c17f666a63c60a5d3fc89b5
seat: verifier
grade: verifier-l2, run by the verifier seat itself
---

# Verdict records-followup U13 · 🔴 · 14 🟢, 1 🟡, 1 🔴

verdict: 🔴
sha: bb896a4e95159ecf1fcfa165fbf6bf57f41d731b

> **Model-independence label, owner ruling R17.** This verdict was produced at grade `verifier-l2`,
> opus at high effort, run by the verifier seat itself: the same model and effort as the seat writing
> this record. No fable seat checked it. The cross-model independence a `verifier-l3` would have
> supplied is absent, and every row below is opus checking opus. The gate rows are command output with
> controls that bit; the judgment rows (V8, V9) are the ones that label weighs on most.

Every claim was graded at the commit its record was written at, and reachability, not wall clock,
decided what a ref can see. Both rules came out of the citation census; this is the first unit graded
under them.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| V1 | R18: `.sdlc/roadmap.md` leaves the branch as it entered | 🟢 | blob `b3825864f7a7c0219d946ac1131892e901f79a1b` at both `ee854932` and `bb896a4e`; `git diff` prints 0 bytes | `git log ee854932..bb896a4e -- .sdlc/roadmap.md` lists nothing, so none of the four dropped roadmap commits reaches the branch |
| V2 | A3, the U5 handoff's R4 attribution | 🟢 | `:58` now names the owner ruling recorded under `Earlier today, same channel`. The sentence sits in that section at the repair's own commit `b6cfe922`, at the head, and on `main`. The `#713` clause beside it, which held, is untouched | the same sentence searched inside R4's section returns 0 at `b6cfe922` and at `main` |
| V3 | A17, the U12 handoff's span count | 🟢 | `eleven spans, six removed and five added`. Every figure the repair added reproduces over `712e63db ee854932^2 -- .sdlc/roadmap.md`: 6 and 5; per hunk 3 and 3 at `:90`, 3 and 2 at `:116`; porcelain 7 and 6 with 2 header lines, giving 6 and 5 | the control's `8` still prints `8` today and is a path count over an unrelated commit, so the retired figure is shown to be a different measurement, not a miscount |
| V4 | A14, the U11 handoff's commit counts and front matter | 🟢 | at `698e8916`: 11 commits, 4 touching the roadmap, 7 touching the handoff, exactly as repaired. The front matter's four shas are restored and are exactly that sha's roadmap commits | from `1f991877` the same commands give 15 and 6, and at the branch head they give 14 and 7, so the count moves with the anchor and the repair states the right one |
| V5 | A16, the review record's path | 🟢 | the repair names `.sdlc/verdicts/records-followup-U11-review.md` on `main` @ `5c6a0c13`, which carries it, and states that `3f6f1ebf` is not reachable from `698e8916`, which is true | the retired `.sdlc/runtime/rf-U11-review.md` has 0 commits on any ref, and `.gitignore:15` is `.sdlc/runtime/` |
| V6 | C1 to C12, the census leg 5 repairs | 🟢 | re-derived, not read: C1 at `698e8916` is 14 rows, `total 14`, `unranked 6`, `14 issues`; C2 is `nine of eleven` twice with `ten of eleven` once in the narration; C8 numstat `6 5`; C9 the inline form in exactly one file at `2`; C10 `#723` created 4m01s before `698e8916` with no row; C11 the six named commits | each C-row's own control reproduces: 13 rows and `total 10` at `3ee3c72b`, `ten of eleven` twice at `1fe53f5a`, 3 roadmap commits at `1fe53f5a` |
| V7 | no other cell re-read or re-worded | 🟢 | nine commits, each touching exactly one file. Every U11 hunk maps to a repair site. The one hunk with no C-label, `:100`, removes `No ranked row was added or dropped by U11`, which is false at `698e8916` because `66d40f70`, a U11 commit and an ancestor, added `#722`'s ranked row | the hunk list is exhaustive over `git diff -U0`, so a stray edit would appear as an unmapped hunk; `:100` is the only one and it is justified |
| V8 | every census site in scope is repaired | 🔴 | `:443`, now `:488`, still reads in present tense that the board contradicts itself. The census names it with `:123-125`. C3 repaired `:123-125` by dating the contradiction to `428f81ad` and left `:443` making the identical claim, so the file now contradicts itself: one row says the contradiction was resolved, a later row says it stands. There is no hunk at `:443` and no C-row for it | the U13 reviewer's table maps `:443` to C3 at its line 115, and C3's own evidence (`0` occurrences of `11 🟢` in the board at `698e8916`) falsifies `:443` the same way it falsifies `:123`. The map passes; the diff does not. Only a hunk-level check finds this |
| V9 | the two census-found failures the census record did not carry | 🟡 | `:6` `plan-revision: 17` while the body applies R14, which is revision 19; `:30` says a marker move and a strip widening shared a commit, when `1405ee77` touched only the roadmap and `b0003592` the handoff, both ancestors of `698e8916`. Both remain. Neither appears in the census record's leg 5 enumeration, which is what this unit repaired against, so the omission is mine and not the builder's | `:30` is false at every anchor since both commits are reachable and touch different files. `:6` cannot be decided by reachability, since the plan reachable from `698e8916` stops at revision 13; it stands on self-consistency alone |
| V10 | revision 31: no record cites the commit that wrote it | 🟢 | over all `9` commit and file pairs, `git show $c:$f \| grep -c $c` prints `0` for every pair; the U13 handoff cites `18` distinct shas and `git cat-file -e` succeeds on all `18` | the check detects `b6cfe922` in the handoff when it is present, and an invented sha returns unresolved, so both the search and the resolver can fail |
| V11 | no unsupported claim replaced by a stronger one | 🟢 | the one repair that changes a grade, C10, weakens it: the open-issue diff goes from clean to 🟡 with its 4m01s margin stated, because the row ran before `#723` existed. C12 declines to order two unrecoverable tree reads | C12's alternative, asserting which read came first, would need an artifact that does not exist, which is why the repair's refusal is correct |
| P1 | `npm test` | 🟢 | in `.worktrees/rf-U13` at load 19 on 10 cores: `✓ all 48 test files passed`, exit 0, tree clean after. Reproduced a second time in a clean scratch clone | the adapter's named control in the scratch clone: `"scrim` to `"scrimX`, 7 occurrences; exit 1, `engine/semantic.mjs` FAIL, `refs-canonical`, `1/48` |
| P4 | branding | 🟢 | `branding: clean (510 files scanned)`, exit 0 | the retired uppercase maker run planted under `.sdlc/runtime/` in the scratch clone: exit 1, one failure naming the plant; removed, exit 0 |
| P5 | scope wall | 🟢 | `git diff --name-only ee854932 bb896a4e \| grep -vc '^\.sdlc/'` prints `0` | the same pipeline over `20298cca~1 20298cca` prints `8` |
| P6 | em dashes in added lines under `.sdlc/` | 🟢 | `0` | the same count over `e9850935~1 e9850935` prints `17` |
| P7 | baseline agrees | 🟢 | `stale total: 0`, exit 0 | the baseline's count bumped from 48 to 49 in the scratch clone: exit 1, `STALE tests: baseline 49, test/run.mjs TESTS 48`; restored, exit 0 |

## What blocks

V8 alone. It is one row, in one file, and the repair is the one C3 already made two hundred lines
earlier. What makes it a 🔴 rather than a note is that the unit's own record asserts
`Every line-site leg 5 names has a row above`, and that sentence is false. The unit exists to repair
records that describe themselves inaccurately, and it closes with its own record describing its own
coverage inaccurately. That is the self-description class the census found worst, reproduced by the
unit built to repair it.

The mechanism is worth more than the row. The reviewer checked coverage by mapping every census site
to a C-row, and the map is complete: `:443` maps to C3. But a map from site to row does not show that
the row's edit reached the site. C3's evidence is true and its edit touched `:123` only. A coverage
check has to read the diff, not the table of repairs, because the table records intent and only the
diff records what changed.

## Two notes that do not block

The step 2 shape check exits 0 on all four records, and the only warnings it prints are tables
without a control column that exist identically on the base, so none is this unit's. Its green is
shape only; it exits 0 on a one-line prose file.

`.sdlc/verdicts/records-followup-roadmap-census.md` needs three corrections this verification surfaced,
all mine: leg 5's enumeration omits `:6` and `:30`, which the census seat reported and I confirmed; its
`Stale before its own last commit, 12` bucket does not reconstruct from the sites it names, which this
unit's handoff recorded honestly; and leg 5 graded the handoff's `No ranked row was added or dropped by
U11` as holding while leg 2 graded the roadmap's identical claim at `:118` as failing. Leg 2 was right
and the builder's repair of it is correct. They go into the census record, not here.

## Correction to V8, 2026-09-21, by the verifier

V8's 🔴 detected a real defect and diagnosed it backwards. The U13 pass 2 builder found it; I
re-derived it before recording.

At `bb896a4e` the U11 handoff did contradict itself about the board, as V8 said. But V8 took C3's
dated version at `:123` as the true one and blamed `:443` for not matching it. The opposite holds.
When the claim was written at `5cac5623`, `16:04:32-07:00`, `main`'s board at `b8c3be8f` showed the U5
row at 🟢 beside a notes cell of `11 🟢 1 🟡 0 🔴`, so `:443`'s present-tense sentence was true. The
disambiguation `428f81ad` is not an ancestor of `698e8916`, so the handoff could not see it. C3 used
wall clock to call the contradiction resolved before the handoff's last commit, and its evidence, `0`
occurrences of `11 🟢` in the board at `698e8916`, measures the branch's copy, which never carried the
contradiction at all. C3 was the false sentence, not `:443`.

So V8 stays 🔴 at `bb896a4e`, since the file held a false claim the unit introduced, but the claim is
C3's, not `:443`'s. Had a builder followed V8 as written, it would have edited `:443` to agree with
C3 and spread the wall-clock error to the one sentence that was right. The right repair was to
retract C3.

I verified V8's detection and not its direction. I checked that the two sentences disagreed and
assumed the one the unit had just repaired was the correct one. A repair is a claim like any other.
