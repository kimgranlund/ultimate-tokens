PASS

# prompt-audit U10 pass 1 review

Head c22f34c4 (unit/pa-U10, on plan/prompt-audit f6cd69cb). Every figure below was run at that sha under bash with /usr/bin/grep; the handoff was not trusted.

| Row | State | Evidence | Control |
|---|---|---|---|
| U10-1 | 🟢 | fixture with `## The fourteen roles` appended: `fourteen roles, voice count drift, engine has 15`, exit 1. Unmodified copy: `voice-parity PASS`, exit 0 | in Evidence |
| U10-2 | 🟢 | `It gives fourteen named **voices.` appended: names `fourteen`, exit 1. The `named` example in the row is met | in Evidence |
| U10-3 | 🟢 | `Label` added to the SKILL.md line 99 statement: `box-voice set drift`, exit 1. Unmodified: exit 0 | in Evidence |
| U10-4 | 🟢 | `node test/plugin/typography-tokens.mjs`: exit 0, needle count `8` | in Evidence |
| U10-5 | 🟢 | `grep -c -E 'sub-heading\|Heading-Kicker'` prints `0` at head, `2` at f6cd69cb | in Evidence |
| U10-6 | 🟢 | clone at c22f34c4: `npm test` all 53 test files passed, TESTS array 53, test/run.mjs diff vs f6cd69cb 0 lines, tree clean after | in Evidence |

Diff scope: three files (handoff, voice-parity.mjs, test/plugin/typography-tokens.mjs). No U+2014 added. The box leg reads all matches in three (file, shape) pairs and each pair still fails when its shape is absent; both real-file statements (SKILL.md:36, :99, responsive.md:26) are read and match the engine set.

## Findings

1. Medium. The count-grammar allowlist leaves a false pass. Row U10-2 says "a word between the number and `voices` still reds"; the gate reds only `named|distinct|separate|different|total|typographic|type`. Measured on fixtures appended to SKILL.md: `fourteen typographic voices` reds; `fourteen text voices`, `fourteen UI voices`, `fourteen semantic voices`, `fourteen unique voices`, `fourteen individual voices`, `fourteen core voices`, `fourteen full voices`, `fourteen reading voices` all print `voice-parity PASS`, exit 0. The builder's measurement is sound (a free word reddened true subset phrases such as `two interactive voices`), and the row's own named example is met, so this does not fail the unit. But it is the same drift class the unit exists to close, moved one word over. Cheaper closure than an ever-growing allowlist: keep a free qualifier and exempt by the number instead (a count claim is a number at or near the engine's, for example only 10 or more can be a whole-scale claim, since every true subset in the files is under 10), or add a denylist of subset words instead. Recommend recording this in the plan as a known limit rather than blocking the merge.
2. Low. The new count-grammar comment in voice-parity.mjs is one long line (over 150 columns) against the surrounding wrapped comments; cosmetic.
3. Low. The `\*{0,2}` before the noun makes the reported token read `fourteen named **voices` (unbalanced bold). Harmless; the needle `fourteen` still matches.

Nothing else found. The plan's P1 to P3 shapes hold on the unit diff (test count unchanged, no test file added, tree byte-stable).
