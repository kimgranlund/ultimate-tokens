---
kind: verdict
plan: verdict-frontmatter
unit: U3
ticket: "#723"
branch: unit/vf-U3
base: plan/verdict-frontmatter @ 68de4634
grade: verifier-l2, run by the Verifier seat itself (same model and effort)
contract: U3-1 to U3-7 and, through U3-5, every earlier row; U1-4 and U1-1 re-graded under plan revisions 9 to 11 (main 62ee7782; 11 is not in the unit)
pass: 1
written: 2026-09-22
---

# Verdict verdict-frontmatter U3 · 🟢 · 7 of 7 U3 rows 🟢, every earlier row re-graded, 3 notes carried

verdict: 🟢
sha: 174d5c48ae0139e5b293d25764c0ba802c124af3

U3 closes what the critic found: a field-less record can no longer be grandfathered by appending
its name to the list, nor by reusing the name of a file that already passed at the pin. A header
pin that disagrees with the script's, or a pin the check cannot read, fails loud. I ran every row in
the worktree, which was clean after, and every control in a throwaway clone at the same head
(`/tmp/v13/u3c-*`), which was also clean after. The handoff and the review pass `verdict.py check`,
a shape check only.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U3-1 | the clean run still passes | 🟢 | `verdicts 77 graded 30 grandfathered 47 bad 0`, exit `0`; the totals are recorded at this instant under ruling A | U3-2 reds on the same head |
| U3-2 | a field-less record appended to the list reds | 🟢 | `GROWN zz-grown-U1.md: not grandfathered at f685529f`, `bad 1`, exit `1` | the same plant at `fbb19aec`: no `GROWN`, `grandfathered 48 bad 0`, exit `0`, the critic's attack succeeding |
| U3-3 | an unreadable pin fails loud | 🟢 | with the pin replaced by `0000000f`: one line, `PIN unreadable: cannot read commit 0000000f (no git, no repo, or shallow clone)`, exit `1`, and `0` summary lines reading `bad 0` | the unmodified script on the same clone: exit `0` |
| U3-4 | the adapter states what the check enforces | 🟢 | `0` for `shrinks only that way`, `1` for `GROWN` | `fbb19aec`'s adapter: `1`, `0` |
| U3-5 | every earlier row still holds | 🟢 | `15` earlier rows run as written at this head (P1 to P3, U1-0 to U1-9, U2-1, U2-2), `15` 🟢, itemised in the next table | `15` controls run, each red on its own plant; the pre-U3 heads `fbb19aec`, `bc868dd3` and `8742b0ee` pass their plants silently, so the controls discriminate by head and not only by plant |
| U3-6 | a name that passed at the pin cannot exempt a field-less rewrite | 🟢 | `records-tidy-prepr.md` reads `verdict: 🟢` at `f685529f`; rewritten field-less and listed, it gives `GROWN records-tidy-prepr.md: not grandfathered at f685529f`, `bad 1`, exit `1` | the same plant at `bc868dd3`: `bad 0`, exit `0`, the review's F1 succeeding |
| U3-7 | the header pin and the script pin agree, and disagreement reds | 🟢 | the header's pin edited to `1f991877`: `PIN MISMATCH: header names 1f991877, script pin is f685529f`, `bad 1`, exit `1` | the unmodified clone: exit `0` |

## U3-5, the earlier rows at this head

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P1 | `npm test` green, tree clean after | 🟢 | worktree: `✓ all 48 test files passed`, exit `0`, `0` status lines; the baseline agrees. Nothing U3 touches is on the test path | `"scrim` renamed in the clone: `✗ 1/48 test file(s) failed`, `FAIL  refs-canonical`, exit `1` |
| P2 | branding, no added em dash | 🟢 | `branding: clean (561 files scanned)`, `0` | a planted prose line with the glyph moves the second figure to `1` |
| P3 | scope wall | 🟢 | `0`, `0` | the plan's three-name fixture prints `2` |
| U1-0 | the pin is an ancestor | 🟢 | `0` | re-derived at U1 against `3b1d48b0`, which printed `1`. The pin and the check are unchanged since |
| U1-1 | exit 0 with the list, 1 with an empty list, under ruling A and revision 11 | 🟢 | clean: `grandfathered 47` equals the list's `47` names, `bad 0`, exit `0`, totals `77`/`30`. Empty list: `verdicts 77 graded 77 grandfathered 0 bad 48`, exit `1`, which is 47 records plus one `PIN MISMATCH`, as revision 11 states | the empty-list run is the row's own control. My probe below shows revision 11's extra line makes it stronger |
| U1-2 | each defect class reds, and the last line is read | 🟢 | A `MISSING`, C and D `VALUE ... pass`, E `STALE survey.md: grandfathered but absent`, each exit `1`; D2 exit `0` | B, the well-formed file, prints `bad 0`, exit `0` |
| U1-3 | the list is the 47 pinned names | 🟢 | `29d0eff2...e3c7`, `#`, `1` | one name removed hashes `8db23fd7...` |
| U1-4 | `#` lines are not names, and a name absent at the pin is `GROWN`, under revisions 9 and 10 | 🟢 | `0`, `1`. The fixture's full output has `GROWN zz-absent.md` and no line naming `# x` | a reader that does not skip `#` prints `1` on the first figure (`GROWN # x: not grandfathered at f685529f`, which revision 10's any-prefix match exists to catch); a substitution that cannot match prints `0`, `0` |
| U1-5 | no existing verdict modified; added verdicts carry the field | 🟢 | `0`, then `1` for `verdict-frontmatter-U3-review.md` | `survey.md` given the field moves the first figure to `1` |
| U1-6 | the adapter names the mandate, the last-line rule and the check | 🟢 | `2`, `1`, `1` | `origin/main`'s adapter: `0`, `0`, `0` |
| U1-7 | the adapter edit is additive, read against `origin/main` as U3-5 directs | 🟢 | against `origin/main`: `0`. Against the unit base it is `1`, which is U3 rewording the amendment line the plan itself added, the case U3-5 names | a reworded existing line gave `1` at U1 |
| U1-8 | no em dash in the script | 🟢 | `0` | a glyph in the header comment prints `1` |
| U1-9 | a grandfathered file gaining the field reds until delisted | 🟢 | `CLEARED survey.md`, `bad 1`, exit `1`, other counts equal to the clean run; delisted: `bad 0`, exit `0` | the same plant at `8742b0ee`: no `CLEARED`, `bad 0`, exit `0` |
| U2-1 | #734 with its labels and 47 distinct names | 🟢 | `N=734`, the plan's title, `P3,kind:chore,lane:docs,size:M,status:backlog`, `47` | the body minus one name: `46`. My first run of this control read `0`, `0` because `gh` could not resolve the clone's remote: a wrong-reason result, discarded and rerun from the repo |
| U2-2 | the header names the ticket; the names hash is unchanged | 🟢 | `1`, `29d0eff2c1bccbc1`, the same as at U2 | a renamed name hashes `84891696f47b0e2c`. The grep half's weakness from the U2 verdict is unchanged and carried below |

## Revisions 9 to 11, judged

All three change acceptance text on rows that already carried a verdict. That is the case I objected
to at V13, and this time the order is right: a Conductor ruling first
(`verdict-frontmatter-U1-4-prefix.md`, answer B), then each change written down with the reason, then
the affected row handed back to a verifier with a control. None of the three is weaker than what it
replaced.

- Revision 9 moves U1-4's second needle from `STALE` to `GROWN`, because U3 changed the output on
  purpose. The new needle is still defeated by its own vacuous-path control (`0`, `0`).
- Revision 10 widens U1-4's first needle to any prefix. Under U3 a reader that does not skip `#`
  prints `GROWN # x`, which the old `STALE # x` needle would have missed, so that control would
  have passed vacuously. Widening makes it catch the fault again.
- Revision 11 moves U1-1's empty-list figure from `bad 47` to `bad 48`. I tested whether the extra
  line helps or hurts. On a tree where every record passes, the pre-U3 script with an empty list
  prints `verdicts 1 graded 1 grandfathered 0 bad 0`, exit `0`: a mistyped list path passed. U3's
  script on the same tree prints `PIN MISMATCH: header names no pin ...`, `bad 1`, exit `1`. So the
  revision describes a control that is now strictly stronger. It can red even when nothing else is
  wrong, which is what control F was always meant to do.

## Carried, none a U3 defect

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| N1 | a grandfathered file rewritten with different field-less content still passes | 🟡 | open and not claimed, per revision 11. Reproduced: `survey.md` rewritten field-less, still listed, gives `grandfathered 47 bad 0`, exit `0`. The check asks only whether the name failed at the pin, never whether the content is still the pinned content | giving the same file a valid field instead reds `CLEARED`, so the list is read and the gap is specific to field-less rewrites. It is named on #734 |
| N2 | moving both pins together passes | 🟡 | open and not claimed. Reproduced as a real attack: a field-less `zz-new-U1.md` committed, both pins moved to that commit (`352b0c30`) and the name listed gives `grandfathered 48 bad 0`, exit `0`. It needs an edit to the script, which shows in any diff, where U3-2's attack needed only the list | moving only the list's pin reds `PIN MISMATCH` and `GROWN`, `bad 2`. My first probe of N2 used `1f991877` and got 9 refusals; that commit predates some listed files, so it was a poor attack, not a refutation |
| N3 | U2-2's `grep -c '#[0-9]'` cannot tell the ticket from `#723` | 🟡 | unchanged since the U2 verdict: the header still carries `#723 mandate`. The ticket number stands on U2-1's `N=734` | `N` reads `723` on the pre-U2 header and `734` now |

The check now reads git, one `git show` per listed name. A shallow clone or a checkout without
history exits `1` at the pin test, by design, as U3-3 shows. It is not in `npm test` or CI (Q1), so
only a pre-land run in a full clone meets it today.
