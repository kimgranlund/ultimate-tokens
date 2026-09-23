# Review verdict-frontmatter U1 · pass 1 · 🟢 PASS
verdict: 🟢 PASS
sha: 8742b0ee353370a1e5bf8935c5655748159fc87b

| Field | Value |
|---|---|
| Reviewer | vf-U1-reviewer-l2-p1 (fresh context) |
| Unit | unit/vf-U1 @ 8742b0ee, base plan/verdict-frontmatter b2947fa0 |
| Contract | `.sdlc/plans/verdict-frontmatter.md` rows P1 to P4, U1-0 to U1-8; `.sdlc/questions/verdict-frontmatter-approval.md` |
| Where run | read-only rows in the unit worktree; every planted control and `npm test` in a `git clone -q --shared` scratch copy checked out at 8742b0ee, left clean |
| Verdict | PASS: every row reproduces with its control; four findings below, none blocking, the first worth folding before the backfill starts |

## Rows, rerun by the reviewer

| # | Criterion | State | Evidence (reviewer's run) | Negative control (reviewer's run) |
|---|---|---|---|---|
| U1-0 | pin is an ancestor | 🟢 | `git merge-base --is-ancestor f685529f HEAD` printed `0` | not planted; the plan's recorded `1` at 3b1d48b0 stands |
| U1-1 | exit 0 with list, 1 with empty list | 🟢 | `verdicts 68 graded 21 grandfathered 47 bad 0` `exit 0` | empty `mktemp` list via `sed`: `verdicts 68 graded 68 grandfathered 0 bad 47` `exit 1` (PIPESTATUS[1]) |
| U1-2 | A, C, D, D2, E | 🟢 | A `MISSING zz-control-U1.md: no verdict: line` bad 1 exit 1; C and D `VALUE zz-control-U1.md: last verdict: pass is not 🟢, 🟡 or 🔴` bad 1 exit 1; D2 bad 0 exit 0; E `STALE survey.md: grandfathered but absent`, `verdicts 67 graded 21 grandfathered 46 bad 1` exit 1 | B bad 0 exit 0; F (list moved away in the clone) `verdicts 68 graded 68 grandfathered 0 bad 47` exit 1 |
| U1-3 | list is the 47 names at the pin | 🟢 | hash `29d0eff2c1bccbc1b0dc033a9aba84ca99338869d5c4ef39658be557fc62e3c7`, `#`, `1` | one name dropped hashes `8db23fd7adbb2625...` |
| U1-4 | `#` skipped, substituted list read | 🟢 | `0`, `1` | the second figure is itself the control against a path the `sed` misses |
| U1-5 | no verdict modified | 🟢 | `0`, no added verdict at the unit head | field appended to `survey.md` in the clone: `1` |
| U1-6 | adapter names mandate, last line, check | 🟢 | `2`, `1`, `1` | `origin/main` and `plan/verdict-frontmatter` both `0 0 0` |
| U1-7 | adapter edit additive | 🟢 | `--numstat` removed column `0` | item 1 reworded in the clone: `1` |
| U1-8 | no em dash in script | 🟢 | `0` | glyph planted on header line 5 in the clone: `1` |
| P1 | `npm test` green, tree clean | 🟢 | `✓ all 48 test files passed`, `0` before and after (scratch clone; N matches `.sdlc/baseline.md` line 19) | regression guard only, as the plan says |
| P2 | branding, em dash in added lines | 🟢 | `branding: clean (547 files scanned)`, `0` | not planted |
| P3 | scope wall | 🟢 | no stray path, `0` | the three-name fixture prints `2` |
| P4 | list equals failing set at `origin/main` | 🟢 | re-derived with the unit's script in a detached clone at the local `origin/main` 6281cebd (not fetched: read-only seat): 47 names, same hash, `diff` empty | pre-land reruns it after `git fetch origin` |

## Grandfather list derivation

| Check | Result |
|---|---|
| Derivation at f685529f (unit script copied into a clone at the pin, no list file present) | `verdicts 68 graded 68 grandfathered 0 bad 47`; the `MISSING`/`VALUE` names, `LC_ALL=C` sorted, hash `29d0eff2...` and `diff` against the list body is empty |
| Same at local `origin/main` 6281cebd | identical 47 names |
| A reader can rerun it | yes, from the plan's measured table; the list file itself does not carry the command (finding 4) |

## Probes beyond the rows

Each probe is one planted file in the scratch clone, graded by the unit script and by a copy of `read_gate` from the plugin's `scripts/adapter.py:404-411`.

| Probe | Check | Adapter reads | Agrees |
|---|---|---|---|
| `verdict: 🟢` only inside a fenced block | bad 0 | `🟢` | 🟢 (both count fenced lines; 0 fenced `verdict:` lines in the 68 files today) |
| real 🔴, then fenced 🟢 last | bad 0 | `🟢` | 🟢 same rule |
| only in a table cell or a `>` quote | MISSING | none | 🟢 |
| second front-matter block, 🔴 last | bad 0 | `🔴` | 🟢 |
| CRLF, 🟢 / CRLF prose | bad 0 / VALUE | `🟢` / `pass` | 🟢 |
| trailing spaces, no final newline, no space after colon, NBSP after colon | bad 0 | `🟢` | 🟢 |
| 🟢 plus U+FE0F | VALUE | `🟢️` refused | 🟢 |
| indented, `Verdict:`, BOM on line 1 | MISSING | none | 🟢 |
| 🟢 then an empty `verdict:` last | VALUE | `🟢` | 🟡 check stricter (finding 3) |
| 🟢 then U+2028 then `verdict: pass` on the same physical line | bad 0 | `pass` | 🟡 check laxer, contrived (finding 3) |
| lone-CR line endings, 🔴 | MISSING | `🔴` | 🟡 check stricter, contrived |
| `.txt`, `.MD`, `sub/x.md` under verdicts | not graded | n/a | 🟡 (finding 2) |
| listed `survey.md` given the field, name kept | bad 0 | n/a | 🟡 (finding 1) |

No planted record that is wrong under the stated rule passes the check, except the U+2028 case.

## Findings

| # | Severity | Where | Finding | Suggested fix |
|---|---|---|---|---|
| 1 | 🟡 medium | `.sdlc/checks/verdict-frontmatter-check.sh:26`, `.sdlc/adapter.md:153` | A listed file is skipped without being read, so a backfill commit that adds the field but forgets to drop the name passes (`verdicts 68 graded 21 grandfathered 47 bad 0`, exit 0). The list then holds a name that no longer fails, and that file leaves enforcement for good: a later edit that strips its field again is never seen. The amendment's "removes its name in the same commit" is prose only; the script enforces the other direction (name gone, field absent: MISSING). | Grade listed files as well and red a listed file that passes, e.g. `CLEARED <name>: grandfathered but carries the field`. The summary line and every plan control keep their shape. Fold into U1 pass 2 or put it on the U2 ticket ahead of the first backfill commit. |
| 2 | 🟡 low | `.sdlc/adapter.md:153`, `.sdlc/checks/verdict-frontmatter-check.sh:15` | Amendment and script scope differ. The amendment says every file added from here on; the script grades every unlisted top-level `*.md` (the 21 pre-mandate passing files too) and reds `STALE` when a listed file is deleted or renamed, neither of which the amendment states. In the other direction it never reads non-`.md` files or subdirectories, which the amendment's "every file" covers. A directory named `x.md` crashes node with a stack trace instead of a named defect (still non-zero). | One clause in the amendment: every unlisted `.md` directly under `.sdlc/verdicts/` is graded, and a listed name whose file is gone is a defect. |
| 3 | ⚪ info | `.sdlc/checks/verdict-frontmatter-check.sh:28-31` vs `adapter.py:408-410` | Line splitting and the empty value differ from `read_gate`: JS splits on `\n` only and counts an empty `verdict:`; Python's `splitlines` also splits on U+2028 and lone CR and skips an empty value. Only the U+2028 case lets the check pass a record the adapter reads as prose; none occur in the corpus. | Optional: split on `/\r\n|\r|\n| | /` and skip empty values to match. |
| 4 | ⚪ low | `.sdlc/checks/verdict-frontmatter-grandfather.txt:1` | The header calls all 47 names field-less; three carry a prose value (`records-followup-U13-review.md`, `records-followup-U14-review.md`, `records-followup-U8.md`). It also omits the derivation command, so a reader of the list alone cannot rerun it without the plan. | When U2 rewrites line 1 for the ticket number: "failing (missing or prose value)", plus the plan path for the derivation. Keep in mind line 1 is outside the hash. |

## Handoff accuracy

Handoff quotes match the reviewer's runs; branding count differs by one file (546 vs 547) only because the handoff commit came after. The handoff's U1-6 and U1-8 controls were stated, not shown; both reproduced here.

## Round 2 · rework at d3f4ef4b · 🟢 PASS

verdict: 🟢 PASS
sha: d3f4ef4bb1662b8f4be3b2c9dbd682c519b3c6e2

| Field | Value |
|---|---|
| Delta read | `git diff 115b5791..d3f4ef4b`: check script (CLEARED, shared `gradeOne`), list header, §6 amendment reworded, plan revision 4 (row U1-9, R9), handoff rework block; the rest is main merged in (records-policy, small-fixes, board) |
| Where run | fresh `git clone -q --shared` at d3f4ef4b, left clean; read-only commands in the worktree |
| Findings 1, 2, 4 | 🟢 fixed. Finding 3 recorded only, as the plan's revision 4 says |

| # | Criterion | State | Evidence (reviewer's run) | Negative control (reviewer's run) |
|---|---|---|---|---|
| U1-9 | listed file that gains the field reds | 🟢 | `survey.md` plus `verdict: 🟢`: `CLEARED survey.md: grandfathered but carries the field`, `verdicts 70 graded 23 grandfathered 47 bad 1`, exit 1; name also dropped from the list: no CLEARED, `verdicts 70 graded 24 grandfathered 46 bad 0`, exit 0 | same plant under the 8742b0ee script: `verdicts 70 graded 23 grandfathered 47 bad 0`, exit 0 (the silent pass) |
| U1-0 | pin is an ancestor | 🟢 | `0` | not planted |
| U1-1 | exit 0 with list, 1 with empty list | 🟢 | `verdicts 70 graded 23 grandfathered 47 bad 0` exit 0 (68/21 moved up by `records-policy-U1.md` and this review, both carrying the field) | empty list: `verdicts 70 graded 70 grandfathered 0 bad 47` exit 1 |
| U1-2 | A, C, D, D2, E | 🟢 | A MISSING, C and D VALUE, all bad 1 exit 1; D2 bad 0 exit 0; E `STALE survey.md`, `verdicts 69 graded 23 grandfathered 46 bad 1` | B bad 0 exit 0 |
| U1-3 | list hash | 🟢 | `29d0eff2...e3c7`, `#`, `1`; header is outside the hash | header recipe run as written (list emptied): hash `29d0eff2c1bccbc1` at the unit head |
| U1-4 | `#` skipped, substituted list read | 🟢 | `0`, `1`; the fixture's `survey.md` still fails, so no CLEARED | second figure is the control |
| U1-5 | no verdict modified; added ones carry the field | 🟢 | `0`; the one added file (this review) passes | not replanted |
| U1-6 | adapter names mandate, last line, check | 🟢 | `2`, `1`, `1` | pass 1 control stands |
| U1-7 | adapter edit additive vs plan tip 0dab3839 | 🟢 | numstat `3 0` | pass 1 control stands |
| U1-8 | no em dash in script | 🟢 | `0` | pass 1 control stands |
| P1 | `npm test`, tree clean | 🟢 | `✓ all 48 test files passed`, `0` | regression guard |
| P2 | branding, em dash in added lines | 🟢 | `branding: clean (550 files scanned)`, `0` vs merge base 1bb720d9 | not planted |
| P3 | scope wall | 🟢 | `0`, `0` vs 1bb720d9 (the merged-in records-policy and small-fixes files drop out at that base) | pass 1 fixture stands |
| P4 | list equals failing set at main | 🟢 | derived in a clone at local `main` = `origin/main` 1bb720d9: `diff` `0` lines | pre-land reruns after `git fetch origin` |

CLEARED against the pass 1 edge cases, each planted in a listed file (`survey.md`):

| Plant | Result | Right? |
|---|---|---|
| last line 🟢, 🟡, 🔴, CRLF 🟢, no final newline | CLEARED, bad 1 | 🟢 each is a valid last line |
| fenced `verdict: 🟢` last | CLEARED | 🟢 same rule as the adapter, as in pass 1 |
| prose, 🟢 plus U+FE0F, 🟢 then an empty `verdict:` | no CLEARED, bad 0 | 🟢 still failing, so it stays listed |
| the three prose files given `verdict: 🟡 FIX-FIRST`, names kept | three CLEARED, bad 3 | 🟢 |
| CRLF list line `records.md` | trimmed, no false STALE | 🟢 |

CLEARED and MISSING/VALUE call the same `gradeOne`, so a listed file is CLEARED exactly when an unlisted one would pass. No gap between them is possible.

| # | Severity | Where | Finding |
|---|---|---|---|
| R2-1 | ⚪ info | `.sdlc/plans/verdict-frontmatter.md:92` | U1-9's Expected hard-codes `verdicts 68 graded 21`; the head prints 70/23. U1-1 carries the "moves up by added verdicts" note and U1-9 does not. Shape and exit codes hold. |
| R2-2 | ⚪ info | `.sdlc/checks/verdict-frontmatter-check.sh:35-38` | A name listed twice (or once more with trailing spaces) prints CLEARED twice and counts bad 2. A listed name that is a directory now crashes `gradeOne` with EISDIR. Both still exit non-zero. |
| R2-3 | ⚪ low | `.sdlc/handoffs/verdict-frontmatter-U1.md:53` | Head field reads `1439d285` (the merge); the rework commit is 4f65ba57 and the head is d3f4ef4b. |
| 3 | ⚪ info | carried | U+2028 split mismatch with `read_gate`, recorded only per revision 4. |
