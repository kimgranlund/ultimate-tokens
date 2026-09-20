# Verdict k17-rerun U1 · 🟡 5 🟢, 2 🟡, 0 🔴

| Field | Value |
|---|---|
| Unit | U1, plan k17-rerun |
| Branch | `unit/k17-U1` @ 3600ad6e, merge base d34b4fb1 |
| Graded | 2026-09-20, verifier seat, grade l1 |
| Scope | U1-4, U1-5, U1-6, U1-7, P1, P4, P5. U1-1, U1-2, U1-3 are pre-land's |
| Evidence | two independent runs: this seat's own, and a dispatched `verifier-l1` worker's in fresh context. They agree on every number. The builder's handoff was read as the claim under test |
| Blocks landing | no. The two 🟡 rows need one rerun after the Orchestrator commits Pass 6, named below |
| Not done | I did not commit, and I did not touch `.sdlc/architecture.md` |

## Criteria

| # | Criterion | State | Evidence, measured twice | Negative control |
|---|---|---|---|---|
| U1-4 | the title names the highest `## Pass N` and the count of conventions whose newest row is 🟢, both computed | 🟡 | at the graded head the block reads `0`, then `5 17`. That is the criterion NOT met at this head, and it cannot be met here: the builder wrote the title, and `## Pass 6` is the Orchestrator's to commit, so the file is deliberately inconsistent between the two commits. On the Pass 6 text below, applied to a clean clone: `1`, then `6 18` | fixture with Pass 6 and the old title: `0`. Fixture with Pass 6's K17 state 🔴: `0`, `6 17`. Both bite |
| U1-5 | the seven counts the plugin's C31 regrade reads | 🟡 | at the graded head: `18`, `18`, `18`, `30`, `1`, `7`, `18 18`, which is the plan's own before column. On the Pass 6 text below: `18`, `18`, `19`, `31`, `1`, `7`, `19 19`. Line 6 reads `7`, so nothing in Pass 6 uses the counted word | one pass 5 K row deleted: first line `17`. Pass 6 reworded to use the counted word once: line 6 `8` while the fold on line 5 still prints `1` |
| U1-6 | passes 1 to 5 untouched, the only deleted line is the old title | 🟢 | `1`, then `0`. The file's entire diff against the merge base is the one title line, quoted below | pass 5's own K17 state flipped in place: `2`, `1` |
| U1-7 | the handoff is a claim with numbers, measured at an equivalent head, with a recorded hit count | 🟢 | `0`, `1`, `1`, `1`. The handoff says `measured at c2c7a1fe`, the parent commit. I ran `git diff c2c7a1fe 3600ad6e -- test .sdlc/architecture.md` myself: empty, so the claim is measured at a head whose `test/` and map equal this one's. See finding 2 on the first leg | sha set to `d814500`: `22`. Plant mentioned with no count: last line `0`. `own plant: ..., 2 hits`: last line `1` |
| P1 | `npm test` green with no `node_modules`, tree byte-stable | 🟢 | in a throwaway clone with no `node_modules`: `✓ all 48 test files passed`, then `git status --short` `0`. No generator drift | role table key renamed: `FAIL refs-canonical`, `✗ 1/48 test file(s) failed`, exit 1; clone back to `0` |
| P4 | branding gate clean | 🟢 | `branding: clean (465 files scanned)`, `exit 0`. N is unpinned per the plan's revision | records doc copied to `docs/x.md`: `FAIL: 3 branding violation(s)`, `exit 1` |
| P5 | scope wall | 🟢 | `0`, with Pass 6 applied and this verdict file present. Seven paths differ, all inside the naming rule: board, handoff, plan, approval, A2 verdict, criteria review, this record | one byte appended to `.sdlc/architecture.md`: `1` |

## Why U1-4 and U1-5 are 🟡 and not 🟢

Their subject does not exist at the head I graded. Pass 6 is written by this seat and committed by the
Orchestrator, so at 3600ad6e both blocks read their before values by design, and the plan's step 4 already
assigns the rerun to the Orchestrator. Grading them 🟢 on a fixture would be grading text that is not yet
in any commit. The dispatched worker reached 🟡 on these two independently, before I did; I had drafted
🟢 and it was right and I was wrong.

What clears them, mechanically, after Pass 6 is committed:

| Block | Must read |
|---|---|
| U1-4 | `1`, then `6 18` |
| U1-5 | `18`, `18`, `19`, `31`, `1`, `7`, `19 19` |

I reduced the risk as far as evidence allows: I extracted the fenced Pass 6 below programmatically,
confirmed it is byte-identical to the text I tested (1959 bytes both ways), appended it to a fresh clone of
this head, and reran the blocks there. They read `1` / `6 18` and `18 18 19 31 1 7 19 19`, and U1-1, U1-2 and
U1-3 read `1` / one K row / `1` / `3600ad6e`, `0`, `1`, `1`. That holds only if what is committed is these
bytes.

## The two runs agree

| Measurement | Mine at 3600ad6e | The worker's | The handoff's claim |
|---|---|---|---|
| framework half | no output, 0 hits | 0 hits | 0, agrees |
| the seven names before the filter | the seven below | identical seven | identical, agrees |
| count before the filter | `7` | `7` | 7, agrees |
| count after the filter | `0` | `0` | 0, agrees |
| plant, clean first | 0 and 0 | 0 and 0 | not claimed |
| plant, as the map's bite cell writes it | 2 hits, 1 per half: `test/engine/hct.mjs:172` and `engine/zzz.mjs` | 1 plus 1, 2 | 2 hits, 1 per half, agrees |
| clone status after reset | `0` | `0` for all three clones | clone deleted |

The seven before the filter: `gate-report.mjs`, `repo/fixtures/gate-report-clean.mjs`,
`repo/fixtures/gate-report-mismatch.mjs`, `repo/fixtures/gate-report-singlequote.mjs`, `run.mjs`,
`smoke/smoke.mjs`, `ui/counts.mjs`. The handoff is corroborated on every figure it claims, and relied on
for none.

## The builder's whole diff to the A2 verdict

```
-# Verdict A2 architecture · pass 4 · 🟢
+# Verdict A2 architecture · pass 6 · 🟢 18 of 18 (pass 5: 17 of 18, K17 🔴; pass 6 reruns K17)
```

One line, matching §Texts byte for byte. No `## Pass 6` at this head, which is correct.

## Findings for the Orchestrator

| # | Finding |
|---|---|
| 1 | §Texts writes the intro as one paragraph carrying both the graded sha and pass 5's `d46ae48`. Written that way it breaks U1-3: `grep -m1 -oE` caps the first matching LINE, not the first match, so `-o` emits both shas, `$S` becomes two lines, and `git diff` exits `fatal: bad revision`. I hit this on my own first draft and measured it. The text below puts pass 5's sha in a second paragraph so the first matching line carries exactly one sha. Every fixed part of §Texts is intact. Pre-land needs the same care if it rewrites that intro |
| 2 | the G3 repair went into U1-3's block (`if [ -n "$S" ] ... else echo "no sha"`) but not into U1-7's identical construct, which still runs `git diff --name-only "$S" HEAD` unguarded. Measured: with the `measured at` line removed, it prints `0` on stdout and sends `fatal: bad revision ''` to stderr. `0` is also the pass value, so that leg cannot tell a good handoff from one with no sha at all. The plan's negative control for U1-7 claims it errors "instead of printing `0`"; it does both. U1-7 is 🟢 here on my own diff of `c2c7a1fe` against the head, not on that leg |
| 3 | P1's stated negative control says "3 in the records-refresh verdicts". Both runs measured `1` failing file from the role table plant. The expected value that matters is non-zero, which holds; the parenthetical is a stale lead from a different plant |

Nothing here is a fix. The next pass is the Orchestrator's to own.

## `## Pass 6`, to be committed verbatim

```markdown
## Pass 6 (U1 of plan k17-rerun, K17 only)

Graded 2026-09-20 at `3600ad6e` (branch `unit/k17-U1`). The control ran read-only in the unit worktree at the graded head; the plant ran in a throwaway shared clone of it, reset afterwards. Both runs are this verifier's own, and the builder's handoff was read as the claim under test, never as evidence.

Why this pass exists: pass 5 graded K17 at `d46ae48` against the three-name filter, and `28c2e8cc` widened that filter in the map without any pass here grading the new text. Rule from this pass on: a change to a section 6 control cell lands with a pass in this file grading the new text.

| # | Convention | State | Evidence | Negative control |
|---|---|---|---|---|
| K17 | Tests use no framework and every test file is in `run.mjs` TESTS | 🟢 | own run at `3600ad6e` of the control as the map's K17 cell states it, filter `grep -vxE "run.mjs\|smoke/smoke.mjs\|ui/counts.mjs\|gate-report.mjs\|repo/fixtures/gate-report-(clean\|mismatch\|singlequote).mjs"` lifted from that cell and not retyped: framework half 0 hits; registration half 7 before the filter, 0 after; the seven are `gate-report.mjs`, `repo/fixtures/gate-report-clean.mjs`, `repo/fixtures/gate-report-mismatch.mjs`, `repo/fixtures/gate-report-singlequote.mjs`, `run.mjs`, `smoke/smoke.mjs`, `ui/counts.mjs`. The builder's handoff claims the same figures and they agree with mine | own plant in a throwaway shared clone, as the map's bite cell writes it: the framework import appended to `test/engine/hct.mjs` plus a new tracked `test/engine/zzz.mjs` carrying no such import. 2 hits in total, 1 per half: `test/engine/hct.mjs:172` on the framework half and `engine/zzz.mjs` on the registration half. The same clone clean before the plant: 0 and 0. Clone reset after, `git status --short` 0 lines |

Result: 18 of 18 🟢, with K1 to K16 and K18 read from pass 5 at `d46ae48` and K17 from this pass. The title now names this pass and its count.
```
