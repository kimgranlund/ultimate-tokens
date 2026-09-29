---
kind: verdict
plan: cache-docs
unit: U1
ticket: "#750"
branch: unit/cd-U1
base: 6d243283
grade: verifier-l1, the evidence run dispatched by the Verifier seat
pass: 2
written: 2026-09-26
---

# Verdict cache-docs U1 · 🔴 · every plan row is met; the review record has no verdict line

verdict: 🔴
sha: 26c046e506ffef06de3f116facadf6b4111e8998

`unit/cd-U1` at `26c046e5`, code `c0cca710`. The evidence run is `/tmp/v13/cd-U1-verify.md`; it ran every plan
command in a clone at the head and planted every control. I confirmed the red myself.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| R | the unit's records pass the repo's record checks | 🔴 | mine: `git show 26c046e5:.sdlc/verdicts/cache-docs-U1-review.md \| grep -c '^verdict:'` prints `0` (its first line is a bare `PASS`), so `verdict-frontmatter-check.sh` goes from `bad 0` at the base and on main to `bad 1`, exit `1`, at the head | the same check at the base and on main: `bad 0` |
| P1 | `npm test`, no `node_modules` | 🟢 | `✓ all 53 test files passed`, TESTS `53`, tree `0` | the `"scrimX` clone: exit `1` |
| P2 | no bundled or executable source changes | 🟢 | `0` | the plan's two-name fixture through the filter: `1` |
| P3 | branding, dashes, the em dash gate | 🟢 | `branding: clean`, `em-dash` self-test PASS and clean, added em dashes `0` | a planted dash line: `1` |
| P4 | scope wall | 🟢 | `0`, `0` | the three-name fixture: `2` |
| U1-1 | knowledge-01 names the three live keys, cites #686 and #738, no `toFixed` claim | 🟢 | `0`, `2`, `2`, `2`, `4`, `1`, `0` | the file at the base: `4`, `0`, `0`, `0`, `0`, `0`, `1` |
| U1-2 | the geometry cross-reference, one line | 🟢 | `0`, `1`, `1`, `0`, numstat `1 1` | the file at the base: `1`, `0`, `0`, `0`; ` #686` appended to the line: the fourth count `1` |
| U1-3 | the rewritten claims are true of the tree | 🟢 | `3`, `3`, `2` (`src/engine/type.mjs:0`, `src/engine/geometry.mjs:0`) | `const key = String(hue);` to `hue.toFixed(2)` in `hct.js`: first count `2`, and `node test/engine/prime.mjs` exit `1` |
| U1-4 | citations gate green, the diff is six lines in two files | 🟢 | `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 26c046e5)`, exit `0`; numstat `1 1` and `5 5` | a stale cite planted in `docs/lld/app-shell.md`: `✗ 1 citation gate failure(s)`, exit `1`; a sixth knowledge-01 line edited: numstat `6 6` |
| PK | the peakC line without the sketch's `0.01°` phrase | 🟢 | the rewrite keeps the step's meaning (the key is the exact float), and U1-1's needle forbids the phrase; no claim in either file is false of `hct.js`, `tonal.js`, `type.mjs`, `geometry.mjs` | the base's line fails U1-1 |
| K | carried checks | 🟡 | `baseline-agrees` `stale total: 1` (R53's `STALE time test`), `ceiling-counts` (#755) and `doc-drift-rows` `bad 1` (DD9) read the same at the base, the head and main | identical figures on main |

What unblocks: the review record given its `verdict:` line, then the frontmatter check reread at the new head.
The unit's rows carry on custody if only that record changes.

verdict: 🔴
sha: 26c046e506ffef06de3f116facadf6b4111e8998

## Pass 2 · 2026-09-26 · `127fef33`: 🟢

`26c046e5` to `127fef33` is one commit that adds two lines to `.sdlc/verdicts/cache-docs-U1-review.md` and nothing
else (`1 file changed, 2 insertions(+)`), so every pass 1 row carries on custody. I reread the records in a clone at `127fef33`.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| R | the unit's records pass the repo's record checks | 🟢 | mine: the review record's line 53 reads `verdict: 🟢`; `verdicts 163 graded 163 bad 0`; `verdict.py check` exit `0`; `branding: clean (788 files scanned)`, `em-dash: clean (796 files scanned)` | a planted verdict file with no `verdict:` line: `verdicts 164 graded 164 bad 1` |

verdict: 🟢
sha: 127fef33eec25edf63008c852215d47405a35ae3
