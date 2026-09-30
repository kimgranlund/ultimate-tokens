# Criteria review gates-batch · 🔴 not mobilizable (42 of 45 checkable, U2-9, U4-2 and U4-5 🔴)

| Field | Value |
|---|---|
| Plan | `.sdlc/plans/gates-batch.md` (draft, uncommitted in the root checkout), base 8945c618 |
| Asked by | conductor, 2026-09-30: grade each criterion 🟢/🟡/🔴 |
| Grade | L1 seat, ran the checks itself: greps in the root checkout (read-only) and a throwaway shared clone at 8945c618 under `$CLAUDE_JOB_DIR/tmp/gb` |

Checkable means a command exists now that prints one value before the unit and a different value after, and the expected value is one a builder following the plan's own Design can reach.

verdict: 🔴

## Criteria

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| C1 | `npm test` green, N 54 | 🟢 | `test/run.mjs:33` prints `✓ all ${TESTS.length} test files passed`, the expected line | adapter §1's role-table control, as stated |
| C2 | em-dash gate clean | 🟢 | `node test/repo/em-dash.mjs` exit and last line | appended glyph, as stated |
| C3 | no test file added, baseline untouched | 🟢 | `git diff --name-only ... -- test/run.mjs .sdlc/baseline.md \| wc -l` reads `0` today | registering a file reads `1` |
| C4 | chroma-envelope lane untouched | 🟢 | same shape, `0` today | any edit there reads `1` or more |
| C5 | `src/` changes are `//` comments only | 🟢 | `type.mjs` header comments are `//` lines (`src/engine/type.mjs:4`, `:10`, `:27`); `printf '+  // x\n+ code\n' \| grep -vcE '^[+-]\s*//'` reads `1`, so BSD grep honours `\s` | a changed code line counts |
| C6 | ramp identity | 🟢 | `scripts/report-preset-fidelity.mjs:588` prints `${totalDiff} differing cells` as the last line, matching adapter §1's `0 differing cells` | adapter row's own reading |
| C7 | five ids on the PR body | 🟢 | `gh pr view --json body` grep, count `5` | a body missing one reads `4` |
| U1-1 | gate green, 11 pins | 🟢 | `FACT_PINS` rows: 11 `id:` entries from `test/repo/citations.mjs:84` to `:111` | U1-2 to U1-5 |
| U1-2 | async literal source reds | 🟢 | pins carry `source:` functions (`citations.mjs:88` is `async () => Object.keys(...)`); planting `async () => 15` on `type voices` equals its needle `15 voices`, so the base run exits 0 as the plan says | base run exit 0 on the plant |
| U1-3 | block-bodied literal reds | 🟢 | plant `source: () => { return 15; }` on the same pin, exit code read | as U1-2 |
| U1-4 | literal outside the old digit set reds | 🟢 | the archived regex on `source: () => 59` reads `0` | as stated |
| U1-5 | fixture below the slice, predicate bites | 🟢 | `awk` on today's file prints the close `];` at line `111`; the comparison is two line numbers | inverted predicate, as stated |
| U1-6 | bare citations counted | 🟢 | `citations.mjs:147` `if (!path.includes("/")) continue;` is the line the control restores; `27 checked` today (plan P1) | restored skip reads `27 checked` |
| U1-7 | stale bare citation reds | 🟢 | `persist.js` resolves to one tracked `src/ui/persist.js`, which does not carry `brandKit` | base run exit 0 on the plant |
| U1-8 | ambiguous basename FAILs | 🟢 | `git ls-files src` holds one `model.mjs`; adding `src/ui/x/model.mjs` makes two | with the file absent the citations pass |
| U1-9 | resolve scoped to `src/` | 🟢 | `test/engine/type.mjs`, `test/engine/geometry.mjs`, `test/ui/model.mjs` exist beside the `src/` homes (P7) | a tree-wide resolve reds U1-6 |
| U1-10 | three reasoned exemptions | 🟢 | the `node -e` reader prints a sorted list or throws on a missing list | reason removed reds, as stated |
| U1-11 | floor rises | 🟢 | `const SYMBOL_HOME_FLOOR = 12;` at `citations.mjs:131` | as stated |
| U2-1 | pass line names the phrase count | 🟢 | pass line text today has no `count phrases` | U2-2 to U2-6 |
| U2-2 | issue repro reds | 🟢 | pin `skill colour formats` doc is `.claude/skills/adding-export-formats/SKILL.md` | base run exit 0, as stated |
| U2-3 | `eight voices` reds | 🟢 | pin `skill type voices` doc is `.claude/skills/type-scale/SKILL.md` | as U2-2 |
| U2-4 | sibling reach | 🟢 | the pin names one `doc`; a `references/` plant is unread today | base run exit 0 |
| U2-5 | reasoned allow list | 🟡 | the command cell is `node -e '...'`, a placeholder; the check is nameable by U1-10's shape, so checkable, but the plan should carry the command | removing a row or reason, as stated |
| U2-6 | magnitude word loud, adjective gap ignored | 🟢 | plants `hundred voices` and `two interactive voices`, exit codes | as stated |
| U2-7 | needle leg stands | 🟢 | `adding-export-formats/SKILL.md:18` and `:71` carry `ten colour formats` | the plant itself is the red; the clean tree is the green |
| U2-8 | phrase floor | 🟢 | `grep -oE 'COUNT_PHRASE_FLOOR = [0-9]+'` reads nothing today | emptied nouns red, as stated |
| U2-9 | `type.mjs` comments say the split | 🔴 | today `grep -c 'SM/MD/LG'` reads `3` from lines `:4`, `:10`, `:42`; line `:27` (`[SM, MD, LG] literal px`) does not match, and line `:10` (`Now each voice's SM/MD/LG are literal px values`) is a universal claim P9 does not name. Applying the Design's own wording (`thirteen voices ride SM/MD/LG, UI-control and UI-widget ride XS to 2XL`) to lines `:4` and `:27` in the clone reads `after=4`, not the expected `1` | the unfixed file reads `3`; but no edit that follows the Design reaches `1`, so the criterion cannot tell a correct unit from a wrong one |
| U2-10 | comments only in `src/` | 🟢 | C5's `grep -vcE` pipeline | C5 |
| U2-11 | U1 legs survive | 🟢 | reruns of `node test/repo/citations.mjs` for U1-1, U1-6, U1-7 | U1's own controls |
| U3-1 | gate declared and green | 🟡 | `DECLARED` at `test/figma/binder.mjs:817`; the expected `1` for `grep -c '"renameparity"'` is fragile: the sibling `"colorparity"` reads `6` because each `FAIL("colorparity", ...)` line counts | an undeclared gate reds `gateReport`; the expected value should be `1 or more`, or a grep on the `DECLARED` line |
| U3-2 | drifted binder map reds | 🟢 | `legal: "tiny"` is in `code.js:83` | base exit 0 (no `renameparity` today) |
| U3-3 | drifted rename list reds | 🟢 | `code.js:33` `["Color Semantic", "Color Modes"]` | as U3-2 |
| U3-4 | drifted flagship map reds | 🟢 | `radius: "pill-radius"` is in `figma/plugin/code.js:549` | as U3-2 |
| U3-5 | missing constant is a FAIL | 🟢 | plant `const GEOMETRY_FIELD_RENAME_MAP2`, expected message `binder is missing GEOMETRY_FIELD_RENAME_MAP` | a vacuous `undefined` compare, as stated |
| U3-6 | canonical side is `migrations.mjs` | 🟢 | `migrations.mjs:99` and `:117` export the maps | plant on `migrations.mjs`, as stated |
| U3-7 | lockstep comments name the gate | 🟡 | `migrations.mjs:98`, `:115` and `code.js:80`, `:86` carry the lockstep comments; `figma/README.md` has none (`grep -in lockstep` finds nothing; its `hand-kept` at `:24` is about the binding loop), so the Design's "three lockstep comments" is imprecise. The grep is still checkable | unfixed files read `0` |
| U3-8 | binder/migrations changes are comments only | 🟢 | both files use `//` comments; grep as C5 | a code line counts |
| U4-1 | self-test green with two new fixtures | 🟢 | `grep -c 'two strings on one line\|template literal'` reads `0` today | U4-2 to U4-4 |
| U4-2 | two-string line fixes per string | 🔴 | `test/repo/em-dash.mjs:972` to `:980`: `--fix` reads no path argument, and `runFix` walks `git ls-files` only (`:646`, `:478`). In the clone at 8945c618, `--fix f.js` on an untracked `f.js` leaves both dashes in place, not the stated base shape; only after `git add f.js` does the base reproduce `const c = "a: b"; const d = "## Head, tail";` | the stated base reading cannot be produced by the stated command; there is no "per-path form" to name |
| U4-3 | fix side pinned by the fixture | 🟢 | `masked.indexOf(DASH)` restored in the fix case (today at `em-dash.mjs:545`, `:578`, `:623`), self-test exit | as stated |
| U4-4 | classifier side pinned | 🟢 | `em-dash.mjs:451` and `:454` test the whole line today | as stated |
| U4-5 | replay line no worse than base | 🔴 | same mechanism as U4-2: `g.mjs` written by `git show ... > g.mjs` is untracked, so `--fix g.mjs` never opens it and `sed -n 80p g.mjs` prints the unfixed line at base and at head alike | the stated base reading `energy": INSTEAD` cannot be produced by the stated command |
| U4-6 | E1/E2 still fire inside a string | 🟢 | `expectRule: "R2s"` and `"R3s"` at `em-dash.mjs:813`, `:816`, count `2` | dropping E1/E2 reds them |
| U4-7 | idempotence on the new fixtures | 🟡 | the idempotence leg (`em-dash.mjs:946` to `:960`) runs one fixed fixture; "covers the two new fixtures" holds only if the builder adds their lines to it, and the criterion names no check that it did | a second pass that edits reds `idempotence` |
| U4-8 | no tree-wide `--fix` | 🟢 | `git diff --name-only` path list | a swept `.md` would list |

## The three 🔴

1. U2-9: the expected `1` contradicts both the Design's replacement wording, which keeps the string `SM/MD/LG`, and today's matches, which are lines `:4`, `:10`, `:42`, not the `:4`, `:27`, `:42` P9 describes. Line `:10` also states a universal SM/MD/LG claim that the plan does not list. The criterion needs a pass condition a Design-following edit reaches, and P9 needs the true line set.
2. U4-2 and U4-5: `em-dash.mjs --fix` takes no path and rewrites tracked files only, so both commands, as written, leave the scratch file untouched at base and head. The base readings the plan states come out only once the file is tracked in the clone. The criteria need a command that makes the tool open the file.

## Plan notes (🟡, not criteria)

- Front matter `size:` reads `S + M + S + S + M ... U5 M = 2; 7 points`, but the plan has four units and U4 is `M` in the Units list.
- U3 Design extracts `const NAME = <literal>;`, but the flagship declares `var GEOMETRY_FIELD_RENAME_MAP` (`figma/plugin/code.js:549`). U3-1 would catch a builder who follows the Design literally (a `flagship is missing` FAIL on the clean tree), so this is a Design imprecision, not a checkability gap.

## Verdict

🔴 not mobilizable: 42 of 45 criteria checkable (37 🟢, 5 🟡), 3 🔴 (U2-9, U4-2, U4-5).

## Pass 2 · revision 1 (uncommitted, root checkout at f47a0bf8) · 🔴 43 of 45 checkable, U2-9 and U4-7 🔴

Re-graded the six rows revision 1 changed; every other row is unchanged in the plan and carries.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U2-5 | reasoned allow list | 🟢 | the command is now written out; on today's file it prints an empty line (no `phrase:` rows inside `FACT_PINS`) | a row without `reason` drops out of the printed list |
| U2-9 | ramp comments say the split | 🔴 | today the stale-phrase grep reads `3` and the split grep `1`, as the plan says. But the revised Design (plan line 61) words the rewrite as `thirteen voices ride a 3-step SM/MD/LG ramp`, and `printf '// thirteen voices ride a 3-step SM/MD/LG ramp, UI-control and UI-widget ride a 6-step XS to 2XL ramp\n' \| grep -cE "3-step SM/MD/LG ramp\|..."` reads `1`: the Design's own sentence is one of the stale needles | a Design-following rewrite of all three lines reads `3`, the same as the unfixed file, so the first leg cannot tell a correct unit from an untouched one |
| U3-1 | declared and green | 🟢 | expected is now a floor plus `grep -c 'const DECLARED = .*"renameparity"'`, which reads `0` today on the one-line `DECLARED` at `test/figma/binder.mjs:817` | an undeclared gate reads `0` on the second grep |
| U3-7 | lockstep comments and README name the gate | 🟢 | the README row is now stated as a new sentence, not an existing lockstep comment; `grep -c renameparity` reads `0` on all three today | unfixed files read `0` |
| U4-2 | two-string line fixes per string | 🟢 | clone at 8945c618, `f.js` staged, `node test/repo/em-dash.mjs --fix`: `const c = "a: b"; const d = "## Head, tail";`, the stated base shape | unstaged, both dashes stay (pass 1 run), which the row now names |
| U4-5 | replay line | 🟢 | clone at 8945c618, `g.mjs` from `git show 37b04676^:mcp/describe-rubric.mjs`, staged, `--fix`, `sed -n 80p`: `- NOT "exotic, wild jungle cat energy": INSTEAD: **"Bengal tiger, burnt orange"**, the Sundarbans`, the stated `energy": INSTEAD` | the unstaged run leaves the line unfixed |
| U4-7 | idempotence on the new fixtures | 🔴 | `sed -n '/idempotence/,/^}/p' test/repo/em-dash.mjs` is case-sensitive and repeats: it prints lines `589` to `643` (the `runFix` area, unrelated) and `959` to `969`. The leg's fixture array `idemSrc` sits at lines `950` to `956`, before the first lowercase `idempotence` at `:959`, so a builder who adds the two fixture lines to `idemSrc`, the natural reading of "the builder adds both", reads `0` | a correct unit and an untouched one both read `0`; only a name written between `:959` and the function's `}` reads `2` |

### The two 🔴

1. U2-9: the stale-phrase needle `3-step SM/MD/LG ramp` also matches the Design's replacement sentence. The needle and the rewrite wording must not overlap.
2. U4-7: the range misses the fixture array it is meant to read and includes an unrelated one. The criterion must read the `idemSrc` array (or whatever the leg re-runs), not the lines after the first lowercase match.

### Plan note (🟡, not a criterion)

- P9 says `grep -c 'SM/MD/LG' src/engine/type.mjs` prints `4`; at 8945c618 and at f47a0bf8 it prints `3` (lines `:4`, `:10`, `:42`). The line P9 counts as the fourth, the size-table `[SM, MD, LG]` comment at `:27`, does not match that string.

### Verdict

verdict: 🔴

🔴 not mobilizable: 43 of 45 checkable (all 🟢), 2 🔴 (U2-9, U4-7).
