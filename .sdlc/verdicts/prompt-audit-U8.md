---
kind: verdict
plan: prompt-audit
unit: U8
ticket: "#758"
branch: unit/pa-U8
base: 0d8beaea
grade: verifier-l1 (opus), outside the builder's family (builder-l2 sonnet, reviewer-l1 sonnet), the evidence run dispatched by the Verifier seat
pass: 1
written: 2026-09-29
---

# Verdict prompt-audit U8 · 🟡 · intake routes one way, twenty-nine counted once, setter homes named, three §8 rows re-pointed; one SA7 word stays

verdict: 🟡
sha: 5ad596306b71e4b25faded9654aeb91e66a9caa2

Head `5ad59630`, the Orchestrator's merge of `plan/prompt-audit` at `0d8beaea` (my backfill) into `485c74cd`. It equals `git merge-tree --write-tree 485c74cd 0d8beaea`. `$B` = `5cfd2b08` (`git merge-base origin/main 5ad59630`). Criteria: U8-1 to U8-3 in `## U8: the docs-repair carve-out`, with step (4) scoping SA7 to "the count's history". I read `docs/reference/SKILL.md:74-77` and the plan's SA7 scoping at the head myself.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U8-1 | 🟢 | the plan's command, legs in order: `0`, `2`, `117`, `117`, `rows 56 drifted 11 holds 45 undetermined 0 bad 0` (head), `rows 56 drifted 11 holds 45 undetermined 0 bad 0` (`$F/neg` at `$B`), `0`, `0`, `0`, `0`, `0`. Full check output at head and at `$B` compared with `diff`: `diff 0`. The last leg run both with the plan's `\x60` and with a literal backtick: `0 0 0 0 0 0` | `$B`'s file: `3`, `1`. In `$F/neg` at head: a blank line above `## Layout` prints `118`, `21` QUOTE lines, `bad 21`; DD32 put back to its old quote prints `QUOTE DD32: not found at .claude/CLAUDE.md:30` and `bad 1`; DD8 re-pointed as well makes the row filter print `2`; the doc-cell leg on `$B`'s `architecture.md` prints `1 1 1` (both needle forms). Tree restored: `0` |
| U8-2 | 🟢 | `0`, `1`, `1`, `0`, `0`, `6`, `0`; the bare `three implementations` prints `1` (First Principle 4's live phrase at `:72`, now alone since the SA8 sentence is gone) | `$B`'s file: `1`, `0`, `1`, `1`, `1`, `6` |
| U8-3 | 🟢 | `0`, `1`, `1`, `1`, `1`; `grep -rn` shows the definitions at `src/ui/sections/typography.js:420` and `src/ui/sections/geometry.js:41`, and neither is defined in `app.js` | `$B`'s file: `1`, `0`, `0`; a brace-path fixture line (`src/ui/sections/{typography,geometry}.js`) prints `0`, `0` on the two citation legs |
| Claims: `.claude/CLAUDE.md` | 🟢 | `:30` `undocumented elsewhere, not one of the 10)` holds: `grep -c ds-export README.md` prints `0`. `:49-53` ADR-017 bullet holds: `/file-bug` and `/file-feature` are at `:101` (`grep -n` prints `50:` and `101:`); ADR-017's Decision reads `route to **GitHub Issues** via \`gh issue create\``; the docs plugin's `file-bug` Option B is `gh issue create`; `.sdlc/adapter.md` X3 reads `minted by the docs plugin's \`/file-bug\` / \`/file-feature\``; `git ls-files docs/tickets | wc -l` prints `31`, and `0` are not `tkt-*`. Line count `117` = `$B`'s `117` | n/a (the U8-1 controls cover these lines) |
| Claims: `.sdlc/architecture.md` DD10, DD32, DD56 | 🟢 | each quote sits on its cited line: `sed -n Np | grep -c -F` prints `1` for `:30`, `:50`, `:53`, and `1` for DD56's code-cell `:101`; DD10 `31` tkt files reproduced; DD32 `src/engine/ds-export.js:3` reads `// Split out of exports.js (TKT-0015 / architecture review MAJOR-1): ...`; all three stay `holds`, and no other row line changed (`0`) | the U8-1 row restore above |
| Claims: `docs/reference/SKILL.md` | 🟡 | `Twenty-nine` holds: a bracket-matched parse of the `"acceptance_criteria": [` array counts `29` `hpg-` ids of `29` ids. SA8's conditional agrees with First Principle 4 (`only when the same engine/table is reproduced across ≥2 independent implementations does parity become a real acceptance gate`), and `docs/reference/rubrics/parity-checklist.md` is tracked. The one-line shrink moves no live pin: `git grep 'docs/reference/SKILL\.md:[0-9]'` hits only archived plans and handoffs. Residue: `:76` still reads `The six child rubric cells **and** the six capability cells are now **validated**`, which SA7 names | the file at `$B`, above |
| Claims: `building-editor-sections/SKILL.md` | 🟢 | `:80` names the two section files. The "range literals are owned by" claim holds: `n = Math.max(1, Math.min(512, n))` at `typography.js:423` and `n = Math.max(8, Math.min(256, n))` at `geometry.js:44`, each commented as matching `clampTokenOverrides` | brace fixture, U8-3 |
| Suite | 🟢 | repo gates at head: `em-dash: clean (944 files scanned)` exit 0; `branding: clean (936 files scanned)` exit 0; `✓ verdict-frontmatter: verdicts 225 graded 225 bad 0, planted 2` exit 0; `✓ citations: parser self-test + STALE 0 across 10 discovered docs + 6 fact pins (HEAD 5ad59630)` exit 0. `npm test` in the fresh clone `suite` (`ls: node_modules: No such file or directory`), run after the pgrep wait, from 07:07:37 to 07:33:46 (host shared with another suite): `✓ all 54 test files passed`, `exit 0`, `git status --short | wc -l` `0`, TESTS `54` | not run (P1's scrim control belongs to the pre-land verdict) |
| Hygiene | 🟢 | `0a5aaa6a`, `bfb49981`, `485c74cd`, `5ad59630` each end `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; the merge carries `Seat: orchestrator`; board staged by none (`0`). U+2014 in added lines `0` and in messages `0`. The three retired-brand regexes in `test/repo/branding.mjs` match `0` in the messages and `0` in the added lines. `.claude/docs/other/` or `node_modules` paths: `0` in the diff, `0` across the commits. `git merge-tree --write-tree 485c74cd 0d8beaea` = `19558ed5a67a5715fe550079cbe8cfe4c8854329` = `5ad59630^{tree}`. P5 for U8: each id prints `1 1 1 1 1 1`, and the ERE prints `6`. P6 on U8's three prose files: `0` added, `2` removed | run by the seat: `git merge-tree --write-tree 485c74cd 0d8beaea^` prints `ba42d5b0...`, not the head tree `19558ed5...`, so the merge-equality leg can fail |

### Findings

1. 🟡 `docs/reference/SKILL.md:76` still reads `the six capability cells are now **validated**`. The evidence's SA7 row names both the `count grew from 27` clause and this `now` as migration-relative wording, and its own hunk drops `now`. The plan's U8 step scopes SA7 to "the count's history", which U8 cut. So the handoff's `SA7 | applied` row is true to the plan and the unit is not wrong, but one word of the finding survives. Either drop `now` (no line moves) in a later unit, or record the kept half in the plan.
2. 🟡 Plan text: U8-1's Expected still says `bad 1` (DD9). The check reads `bad 0` both at the head and at `$B`, so the equality the row asks for holds (the review flagged the same).
3. Info: the handoff skipped the blank-line clone control. The verification ran it (`118`, `21` QUOTE, `bad 21`), and it bites.
