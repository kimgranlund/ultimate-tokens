# Handoff U4 · builder → reviewer

| Field | Value |
|---|---|
| Branch | `unit/bf-U4` @ `37978b39` |
| Files | the eleven `.sdlc/verdicts/pif-u*.md` records named by the plan's U4 section: `pif-u1.md`, `pif-u2.md`, `pif-u3.md`, `pif-u4.md`, `pif-u5.md`, `pif-u6.md`, `pif-u7.md`, `pif-u7-review-1.md`, `pif-u7-review-2.md`, `pif-u8.md`, `pif-u8-review.md` |
| Ran | `sh .sdlc/checks/verdict-frontmatter-check.sh` → `verdicts 108 graded 108 bad 0` · `npm test` → `✓ all 49 test files passed`, exit 0, `git status --short` clean afterward |
| Left out | none |

## Build

Ten of the eleven files already had their `verdict:` line moved correctly by the prior session
(from line 2, above or in front matter, to the record's closing graded block); I read the diff,
checked each against U4-1/U4-2/U4-3 below, and kept all ten as left. `pif-u5.md` was the eleventh
and was still untouched: it carries one shared top-level YAML front-matter block (`---` at lines
1-11) used across five stacked re-verify passes in the same file, with `verdict: 🟢` at line 10
inside it. I removed that line from the front matter and added `verdict: 🟢` directly after the
final pass's closing paragraph (the "## Overall" section, "... with a working negative control.
The unit is 🟢.", now followed by the verdict line and then "## What this verdict does not
claim"), matching the placement the other ten already use for their own trailing sections
(`## Evidence`, `## Records`, appendix material after the graded verdict).

## Per-file: the block the line now sits under

| File | Line | Block |
|---|---|---|
| `pif-u1.md` | 12 | the opening `\| Field \| Value \|` summary table (no heading; it's the record's only graded block) |
| `pif-u2.md` | 48 | closing `**Verdict.**` paragraph under `## Records` |
| `pif-u3.md` | 4 | the single closing paragraph under the title `# Verdict U3 · 🟢` (no subheading) |
| `pif-u4.md` | 83 | closing summary paragraphs (counts + re-pins) under the final stacked pass's title, `# Verdict U4 pass 7 (main-merge delta) · 🟡` |
| `pif-u5.md` | 366 | closing paragraph under `## Overall` (final stacked pass, "Pass 4") |
| `pif-u6.md` | 28 | the criteria table under `## Verdict` |
| `pif-u7.md` | 19 | closing sentence under `## Verdict` |
| `pif-u7-review-1.md` | 218 | closing paragraph under `## Verdict` |
| `pif-u7-review-2.md` | 100 | closing paragraph under `## Verdict` |
| `pif-u8.md` | 36 | last table row's section, `## Regrade at 96f7d99a (verifier-l2, opus high under R17)` |
| `pif-u8-review.md` | 72 | closing paragraph under `## Pass 2 · 🟢 PASS` |

## Criteria, each row's actual output

`B` = `363e7ddb`.

| Id | Command | Printed | Match |
|---|---|---|---|
| U4-1 | per file: `grep -c '^verdict:' F; grep -n '^verdict:' F; wc -l < F` | each file: count `1`, the line number shown in the table above, matching its total line count (last line) for all but `pif-u1.md` (line 12 of 136) and `pif-u5.md` (line 366 of 390) | ✅ |
| U4-2 | `git diff $B -- .sdlc/verdicts/pif-u*.md \| grep '^[-+]verdict:' \| sort \| uniq -c` (also read unsorted to confirm pairing) | 11 `-verdict:` / 11 `+verdict:` lines, each removed value paired with an identical added value (9 🟢 pairs, 2 🟡 pairs: `pif-u4.md`, `pif-u7-review-1.md`) | ✅ |
| U4-3 | `git diff $B --numstat -- <the eleven>` | `1 1` for `pif-u1.md`, `pif-u3.md`, `pif-u4.md`, `pif-u6.md`, `pif-u7.md`; `2 1` (one added blank separator line) for `pif-u2.md`, `pif-u5.md`, `pif-u7-review-1.md`, `pif-u7-review-2.md`, `pif-u8.md`, `pif-u8-review.md` | ✅ |
| U4-4 | `sh .sdlc/checks/verdict-frontmatter-check.sh \| tail -1; git diff --name-only $B` | `verdicts 108 graded 108 bad 0`; the name-only diff lists exactly the eleven files (this handoff is a separate, later commit) | ✅ |

## Left out

Nothing from U4's rows. `pif-u9*`, `pif-u10*`, and `preset-intent-fidelity-*` are out of scope per
the plan's own U4 section (written with the line in place already). Pre-land and landing are the
Orchestrator's.
