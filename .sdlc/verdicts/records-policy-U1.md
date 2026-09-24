---
kind: verdict
plan: records-policy
unit: U1
ticket: "#722"
branch: unit/rp-U1
base: plan/records-policy @ 0c3242e0
grade: verifier-l1 (worker `rp-U1-verifier-l1-p1`, opus medium), graded by the Verifier seat
pass: 1
written: 2026-09-22
---

# Verdict records-policy U1 · 🟢 · 9 of 9 criteria 🟢, plus one 🟡 note on the plan outside them

verdict: 🟢
sha: 2be1fc710b83d8cff544b902d9191a16402cd357

Graded at `unit/rp-U1` @ `2be1fc71`, against `.sdlc/plans/records-policy.md` at `0c3242e0` (main's
copy differs from it in one line, outside the U1 rows). The head adds only the review over
`cb944613`, the commit the review graded. The worker ran every row and every control in a throwaway
clone, and I re-derived U1-1, U1-3 and the block's byte identity myself before accepting its table.
Its full report is `/tmp/v13/rp-U1-verify.md`. The handoff and the review were read as claims. Both
pass `verdict.py check` (exit `0`), which is a shape check only.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P1 | `npm test` green in the unit worktree, tree clean after | 🟢 | worker: `✓ all 48 test files passed`, then `0` from `git status --short \| wc -l`; `.sdlc/baseline.md` at the head reads `all 48 test files passed`, so N matches | the plan's plant, the `minor` line's leading `//` turned to `/*` in a clone: `SyntaxError: Invalid or unexpected token`, exit `1` at the `gen:adia-exports` pre-step with no `test/run.mjs` run, the reason the plan names |
| P2 | branding clean, no added em dash outside a backtick span | 🟢 | worker: `branding: clean (548 files scanned)`, then `0` | a planted prose line with the glyph moved the second figure to `1`; a card quoting the retired maker name moved the first to `FAIL: 1 branding violation(s)` |
| P3 | scope wall | 🟢 | worker: `0`, `0`. The unit changes three paths: the script, the handoff, the review. I read the same three from `git diff --name-status 0c3242e0..2be1fc71` | the planner's two-name fixture prints `1`, and a real `// planted` line appended to `src/engine/exports.js` in a clone printed `1`, `1` |
| P4 | the generator's committed outputs are byte-identical | 🟢 | worker: `0`, `0` after running the generator | one artifact row's `version: "1.1.0"` to `"1.1.1"` in a clone: `1`, `2`. The plan says committing is what moves the second figure; it already reads `2` before the commit, because `git diff --stat "$B"` compares the working tree. The control still reds |
| U1-1 | the block names the engine-moved case under `minor` | 🟢 | mine and the worker's: `1`, `1`, `1`. Mine additionally: the six added lines are byte-identical to the plan's `Text to paste` block, `diff` empty | worker restored the block from `origin/main` in a clone: `1`, `0`, `0`. Mine: a one-word change to the landed text makes the byte comparison differ |
| U1-2 | the contract, not a version string, is the distinguishing question | 🟢 | worker: `1`, `1` | the two closing lines deleted in a clone: `0`, `0` |
| U1-3 | the case is a comment and nothing else moved; read with U1-1 | 🟢 | mine and the worker's, same run as U1-1: `0` with U1-1 at `1`, `1`, `1`. The full diff is two removed and five added lines, every one starting `//` | worker: one row's `1.1.0` to `1.1.1` prints `2`; and with the block restored, U1-3 alone prints `0` while U1-1 prints `1`, `0`, `0`, so the pairing is what stops an empty diff passing. The reviewer's point about this control is judged below |
| U1-4 | `patch`, `major` and per-artifact-tag lines byte-identical to main | 🟢 | worker: `0` | the `major` line reworded in a clone: `4` |
| U1-5 | the review cites the ruled case at its source by ref and line | 🟢 | worker: `1`, `1`, and both cited sources say what the review says they say: line 65 on `plan/preset-intent-fidelity` begins the `1.2.0 (#681, plan revision 28)` comment, and `pif-u5.md:76` is `### 3.1 The one generator line` | the paraphrase form `read the 1.2.0 comment and pif-u5.md` prints `0`, `0`; the cited form prints `1`, `1` |

## The reviewer's point on U1-3's control, judged

The reviewer says the control reproduces only on the pre-`#681` base. That is correct, and it
matters sooner than it sounds, so I tested it rather than reading it.

At this head the control works: the unit base and `origin/main` both still carry two
`version: "1.1.0"` rows, because `#681` is open. I then built the post-`#681` state in a scratch repo:
`#681`'s generator from `plan/preset-intent-fidelity` as the base, and U1's hunk three-way merged onto
it (`git merge-file`, no conflict, U1's block byte-identical after the merge, as the plan predicted).

| probe, post-`#681` | state | evidence | negative control |
| --- | --- | --- | --- |
| the check itself | 🟢 | U1-3 on U1-over-`#681` prints `0` | moving one of `#681`'s rows from `1.2.0` to `1.2.1` prints `2`, so the check still discriminates |
| the control as the plan words it | 🟡 | `#681`'s file has `0` rows reading `version: "1.1.0"` and `2` reading `1.2.0`. The planted edit therefore changes nothing: `git diff --stat` is empty and U1-3 prints `0` | a `0` from the inert plant is the same figure a passing check prints. That is the failure: the control would report the check as unable to fail when it never ran |

So the check is sound after `#681` and the control is not: it names a literal `#681` removes. That
makes no difference to this verdict, since at this head the control plants and reds. It does matter
at the pre-land rerun. The plan gates U2 on `#681` reaching `origin/main`, and the pre-land follows U2,
so on the plan's own ordering the rerun is certain to happen after `#681`, and the P4 control, which
names the same `1.1.0` literal, goes inert with it. That belongs to the plan's owner. It is not a
U1 defect.

## What would red this

A non-comment line in the diff, which U1-3 catches. The block drifting from the plan's paste text,
which the byte comparison catches. A review citing the paraphrase and not the source, which U1-5
catches. Each of those ran as a control above and red on its own plant.
