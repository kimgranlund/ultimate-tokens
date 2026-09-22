---
kind: verdict
plan: verdict-frontmatter
unit: U1
ticket: "#723"
branch: unit/vf-U1
base: plan/verdict-frontmatter @ 0dab3839 (unit rows); origin/main merge base 1bb720d9 (P rows)
grade: verifier-l2, run by the Verifier seat itself (same model and effort)
contract: plan revision 5 at fc86f211, as the Orchestrator directed, for U1-9; every other row is unchanged between revisions 4 and 5
pass: 1
written: 2026-09-22
---

# Verdict verdict-frontmatter U1 · 🟡 · 13 🟢, 1 🟡, 0 🔴

verdict: 🟡
sha: 8fadefbedbbfb3aa2f6ac237a6dfd1ed50ae4eb1

The unit does what it says. The one yellow is a stale figure in the plan's U1-1, the same drift
revision 5 removed from U1-9 and left in U1-1. Nothing in the unit's work causes it. Every row
was run by me at `8fadefbe`: gates in the worktree, which was clean after, and every control in a
throwaway clone at the same head (`/tmp/v13/vfU1-ctl-1790109952`), which was also clean after. The
handoff and the review pass `verdict.py check` (exit `0`), a shape check only, and were read as
claims.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P1 | `npm test` green, tree clean after | 🟢 | `✓ all 48 test files passed`, npm exit `0`, then `0` status lines; `.sdlc/baseline.md` reads `all 48 test files passed`. As the plan says, nothing this unit touches is on the test path, so this is a regression guard and not a discriminator | the plan plants none, so I showed the gate can red in this tree: the `defaults` key removed from `docs/reference/data/role-table.json` in the clone gives `✗ 18/48 test file(s) failed`, npm exit `1` |
| P2 | branding clean, no added em dash outside a backtick span | 🟢 | `branding: clean (550 files scanned)`, then `0` | a prose line with the glyph appended to the handoff in the clone moves the second figure to `1` |
| P3 | scope wall | 🟢 | `0`, `0`. The five paths against `1bb720d9` are the adapter, the check, the list, and this unit's handoff and review | the plan's three-name fixture prints `2`; editing `.sdlc/verdicts/survey.md` in the clone moves the second figure to `1` |
| P4 | the list equals the failing set at `origin/main` | 🟢 | run now, although the plan asks for it at pre-land: `0` against `origin/main` `40cf8567`. Pre-land must re-derive it after a fetch, as the row says | a stale name reds `STALE` (control E, below) and a missing list reds all 70 (U1-1's second run), which are the two ways the diff can go non-zero |
| U1-0 | the pin is an ancestor of the head | 🟢 | `git merge-base --is-ancestor f685529f HEAD` prints `0` | the same against the revision 2 tip `3b1d48b0` prints `1` |
| U1-1 | exit 0 with the list, exit 1 with an empty list | 🟡 | `verdicts 70 graded 23 grandfathered 47 bad 0` `exit 0`, then `verdicts 70 graded 70 grandfathered 0 bad 47` `exit 1`. The row expects `68` and `21`, allowing them to rise only by this unit's own verdict files. That allows `69`/`22`. The extra one is `records-policy-U1.md`, another lane's verdict carrying `verdict: 🟢`, which reached the unit through the plan merge `1439d285`. `comm` over `.sdlc/verdicts/` at `f685529f` and at the head lists exactly those two added files and none removed. Everything the row tests holds: `grandfathered 47`, `bad 0`, exit `0`, and the empty-list run reds | the empty-list run is the row's own control and it reds as written. The yellow is on the figures, not the behaviour |
| U1-2 | each defect class reds on one planted file, and the last line is the one read | 🟢 | in the clone, byte for byte after the file name as the row asks: A `MISSING zz-control-U1.md: no verdict: line` exit `1`; C and D `VALUE zz-control-U1.md: last verdict: pass is not 🟢, 🟡 or 🔴` exit `1`; D2 `bad 0` exit `0`; E `STALE survey.md: grandfathered but absent` exit `1`. The summaries read `71`/`24` where the measured table has `69`/`22`, the same `+2` as U1-1 | control B prints `bad 0` exit `0`, so the reds belong to the plants. A copy of the script reading the first `verdict:` line prints `bad 0` on D, which is the revision 1 red |
| U1-3 | the list is the 47 pinned names | 🟢 | `29d0eff2c1bccbc1b0dc033a9aba84ca99338869d5c4ef39658be557fc62e3c7`, `#`, `1` | one name removed hashes `8db23fd7...` |
| U1-4 | the list is read through its `#` line, and the substituted list is read at all | 🟢 | `0`, `1` | a copy of the script that does not skip `#` lines prints `1` on the first figure; a substitution that cannot match, the vacuous case, prints `0`, `0`, and the second figure catches it |
| U1-5 | no existing verdict modified; every added verdict carries the field last | 🟢 | `0`, then `1` for the one added file, `verdict-frontmatter-U1-review.md`, whose last line `verdict: 🟢 PASS` has `🟢` as its first token | `survey.md` given the field in the clone moves the first figure to `1` |
| U1-6 | the adapter names the mandate, the last-line rule and the check | 🟢 | `2`, `1`, `1` | `origin/main`'s adapter prints `0`, `0`, `0` |
| U1-7 | the adapter edit is additive | 🟢 | `git diff --numstat` removal column prints `0` | rewording adapter line `60` in place in the clone prints `1` |
| U1-8 | the script carries no em dash | 🟢 | `0` | one glyph appended to the header comment in the clone prints `1` |
| U1-9 | a grandfathered file that gains a valid field reds until delisted, graded per revision 5 | 🟢 | clean run `verdicts 70 graded 23 grandfathered 47 bad 0`; with `verdict: 🟢` appended to `survey.md`: `CLEARED survey.md: grandfathered but carries the field`, `verdicts 70 graded 23 grandfathered 47 bad 1`, exit `1`, so the three counts equal the clean run and `bad` is `1`; with `survey.md` also delisted: no `CLEARED`, `bad 0`, exit `0` | the same plant at `8742b0ee`, before revision 4: no `CLEARED`, `verdicts 68 graded 21 grandfathered 47 bad 0`, exit `0`, the silent pass the review found. See below on revision 5 itself |

## Revision 5, judged rather than applied

I was directed to grade U1-9 against revision 5, which is not in the unit. After V13 on another plan
I do not take a moved criterion as given. So the question is the same one: did the criterion
move to fit the work?

It moved to fit the measurement, and the measurement moved for a reason outside the unit. Revision 4
pinned the summary at `verdicts 68 graded 21`. The head prints `70`/`23` because two verdicts landed
that carry the field, and one of them belongs to another lane. Under revision 4's literal text the
unit fails U1-9 for something it did not do. Revision 5 replaces the absolute figures with "equal to
the same head's clean run" and keeps everything the row tests: the `CLEARED` line, `bad 1`, exit
`1` and the delist leg.

The test that matters is whether the new wording loses a red the old one had. I planted
`survey.md`'s field and one extra graded file together, a plant that also moves a count. The run
printed `verdicts 71 graded 24`, which differs from the clean run, so revision 5 reds it too. What
revision 5 gives up is an absolute count pinned inside U1-9, and that pin still lives in U1-1 and
P4. So revision 5 stops one false red and keeps every true one. It was committed at 13:42:56, fifteen
seconds after the review that found the drift and before any verdict existed, and its revision row
names the Orchestrator as the author of the stale figures. This is repair, not a bend.

## The yellow, and why it will get worse

U1-1 carries the same stale pin revision 5 removed from U1-9. P4 says a re-pin moves U1-1's `68`,
`21` and `47`, but a re-pin only fires when `origin/main` gains a verdict without the field. The
file that moved U1-1 has the field, so no re-pin will ever correct it.

The drift can only grow from here. This unit's mandate requires every new verdict to carry the
field, so each verdict that lands on main, this one included, raises `verdicts` and `graded` by one
and never trips P4. By pre-land, U1-1 will be further off its written figures than it is today, for
a reason the unit cannot control. That is the plan owner's to settle. It is not a U1 defect, and it
stops at 🟡 because every property the row tests holds and each unit of the gap is traced to a named
file.

## Noted, not graded

- `.sdlc/handoffs/verdict-frontmatter-U1.md:53`, the review's R2-3. `Head` names `1439d285` and
  describes it as `after the merge and the rework commit`, but `1439d285` is the merge alone, and
  the rework is `4f65ba57`. It describes its own evidence against the wrong commit. It is low, and
  no row rests on it, since adapter §1 makes a handoff's `Ran` row evidence for the reviewer and
  never for the verdict. Every figure above is my own run.
- This verdict carries `verdict: 🟡` as its last `verdict:` line, so the check this unit adds passes
  on it.
