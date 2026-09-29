PASS

# docs-repair U6 pass 1 review (#751)

Reviewed `unit/dr-U6` at 4c75c608 (code commit 08cdec61, base plan/docs-repair 5c139146), in a `git clone --shared` copy, `/usr/bin/grep` under bash. The unit worktree was not edited.

## Criteria

| Row | Result | Evidence |
|---|---|---|
| U6-1 | 🟢 | `grep -c FACT_PINS` prints `3`; pass line `✓ citations: parser self-test + STALE 0 across 10 discovered docs + 6 fact pins (HEAD 08cdec61)`, `exit 0`; parent prints `0` |
| U6-2 | 🟢 | six doc-side edits each `exit 1`, one ✗ line naming the doc path and the needle; the same six edits together on parent 5c139146 print the green pass line, exit 0 (the gap this unit closes); (d) leaves Revision A's `the 53-role table` alone and still reds |
| U6-3 | 🟢 | (a) constructor line alone and both lines: `exit 1`, ✗ names `src/ui/app.js`; (b) stub import: `code holds 11`; (c) pair removed reads 9, pair added reads 11; (d) `59`; (e) `btn2`; (f) each of `deleteTypeMode` and `deleteGeomMode` renamed alone reds. (f) also reds the reactivity review's cite at line 63, expected (the audit leg) |
| U6-4 | 🟢 | `0`, `0`, `3`; controls: `source: () => 15,` prints `1` with the digit regex, `want: 15` / `want: 150` prints `1` with the ERE |
| U6-5 | 🟢 | `50`, `0`, `0`, `ok    tests: baseline 50, test/run.mjs TESTS 50`, `1` |
| P3 | 🟢 | `branding: clean (747 files scanned)` in the clone at 4c75c608 (the handoff's 746 is at 08cdec61, before the handoff file existed; the P8 re-run at 08cdec61 diffs empty) |
| P7 | 🟢 | `H=08cdec61`, `ancestor`, `0` files moved after it outside the record paths |
| P8 | 🟢 | `H=08cdec61`, `HAS-RAN`, `1 1 1 1 1`, no diff lines, `diff 0`. Each of the five plan cells (U6-2 and U6-3 are prose rows the builder approximated with `perl` edits, the same edits I ran) is present in `ran.sh` verbatim with the cell escape removed for U6-1, U6-4, U6-5 |
| gate | 🟢 | `npm test` in the clone: `✓ all 50 test files passed`, tree clean after |

## Ruling: U6-4 plain `|`

The builder is right. In the plan cell `\|` is a markdown table-cell escape for a pipe, and P8 says the commands are the plan's rows with the cell escape removed. Measured under `/usr/bin/grep -E`: the regex with `\|` prints `0` on `source: () => 15,` (a literal pipe, vacuous), the regex with `|` prints `1`. This matches the U1 ruling, which kept `\|` only where it is a regex alternation in the shell command itself. The handoff note wording ("the block carries `\|` with the escape removed") is muddled but its figures are true.

## Findings

| # | Severity | Finding |
|---|---|---|
| 1 | 🟡 low | Substring needles: `15 voices` and `a 53-role` are checked with `includes`, so a doc that says `115 voices` or `a 153-role` keeps the doc side green, and the number test then reads the needle's first digit run (`15`) against the code. The doc-side control the plan asks for (11 for 15) reds, so no row fails; a word-boundary regex would close it. |
| 2 | 🟡 low | The prefs-reset `this.colorMode = "system"` (app.js line 2303) is unpinned: editing it alone leaves the gate green. The plan requires only the constructor line (U6-3 (a)), so this is a scope note, not a miss. |
| 3 | ℹ️ info | `test/repo/citations.mjs` line 2 carries one U+2014 in the file header, present at the base 5c139146 and not part of this diff; the builder added none (the handoff carries zero). |
| 4 | ℹ️ info | The pin loop's `try`/`catch` around `source()` turns a thrown reader into a FAIL naming the source, so a moved file cannot pass silently. |

Nothing blocks the unit.
