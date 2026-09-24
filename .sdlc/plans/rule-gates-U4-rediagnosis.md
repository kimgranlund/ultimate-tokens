---
kind: rediagnosis
plan: rule-gates
unit: U4
ticket: "#730"
written: 2026-09-24
author: rg-U4-rediagnosis-planner
measured-at: 5091460f (unit/rg-U4, pass 3) against c5f7bb2c (the unit's merge base), plan revision 12 at 2c81590c
inputs: `.sdlc/plans/rule-gates.md`, `.sdlc/plans/rule-gates-U3-rediagnosis.md`, `.sdlc/handoffs/rule-gates-U4.md` (pass 3), `.sdlc/verdicts/rule-gates-U4-review.md` (rounds 1 and 2), the verifier's 🔴 at 5091460f, `.sdlc/checks/card-source-range-check.sh`, `.sdlc/checks/card-amendment-check.sh`
method: read-only. Every removed line of `git diff c5f7bb2c 5091460f` that carried the glyph was classified by construct with four positive predicates (E1 to E4 below) and its replacement at the head read back; the two record checks were run at the head and on main with their exit codes read without a pipe. No source edited, nothing committed.
---

# U4 re-diagnosis: three passes, two FIX-FIRST reviews, still 🔴

Short answer: the tool is no longer the bottleneck, the criterion is. The rule table picks a replacement by the line's syntax habitat, so every label separator that lives in a habitat R2 and R3 do not enumerate (a code string that emits Markdown, a UI title string, a blockquoted bullet, a `•` bullet) got R8's comma and now reads as a list. The backstop row for exactly that case, U4-10, is a read-all with no enumeration and no control, so each of the five readers found the lines their own sample reached and none could reach zero. U4-6 never bit at all: both checks exit 0 whatever they find. One bounded pass closes all of it if the pass is bounded by an enumeration rather than by the verdict's list.

## 1. Root cause

| # | Defect | Evidence at 5091460f | State |
|---|---|---|---|
| 1 | The rule table discriminates by habitat, not by construct. R2 (heading, colon) and R3 (label bullet, colon) fire in `.md` files only and only on `#` lines and `- **x**` lines. The same label-separator construct also lives in a JS string that emits Markdown (`ds-export.js` writes 57 heading strings; `brand-kit-core.mjs`, `drawer.js`, `describe-rubric.mjs` too), in a UI title, card, toast or tool-description string, in a blockquoted bullet (`> - **x** U+2014`) and in a `•` bullet inside a fenced spec block. All of those fall to R8, whose comma turns `label U+2014 a, b, c` into a list. The U3 re-diagnosis fixed the guard (is this a pause between two words) and not the discriminator (which pause: a label separator wants a colon, a clause join wants the owner's comma) | E1 headings inside code strings: 17 at base, 16 still comma. E2 bold-label bullets inside code strings: 37 at base, 26 still comma. E3 short-label title/label/aria/card/toast/note strings: 75 at base, 42 still comma (33 hand-fixed to a colon in pass 2). E4 blockquoted or `•` label bullets in `.md`: 26 at base, 26 still comma, 23 of them under `docs/marketing/`. About 110 lines in all; the verdict names 15 code lines and 6 store lines, a sample of that population | 🔴 |
| 2 | U4-10 is a read-all with no positive enumeration and `none` as its control. The builder sampled by keyword grep ("about 80 lines" out of about 567 string dashes in the swept code), review round 1 by a different grep (about 130 lines), round 2 by rereading round 1's list, the verifier by a 70-line read. Five readers, five subsets, three of them called FIX-FIRST or 🔴 on lines the earlier reader did not reach. This is the same open-set failure the U3 re-diagnosis named for the tool's negative list, moved into the criterion | pass 1 rewrote about 10 strings; pass 2 rewrote 73 diff pairs on the reviewer's list; pass 3 rewrote the 2 lines round 2 named; the verifier then named 14 more plus 6 store lines; this measurement finds about 90 beyond those. Each list was true and none was complete | 🔴 |
| 3 | U4-6 was vacuous as written. `card-source-range-check.sh` and `card-amendment-check.sh` end in `echo` and exit 0 whatever their count (three of the five `.sdlc/checks/*.sh` are output-line checks; only `baseline-agrees` and `verdict-frontmatter` exit by code). The plan's row expects "three `exit 0`" with the control `none`, so it could not fail. adopt-hygiene, which wrote the scripts, read them by their last line (`range mismatches: 0` and no line) | at the head: `range mismatches: 24` (`no heading ADR-001` to `ADR-024`), exit 0; the amendment check reads no ADR body (`empty-body 24`, `amended-seen 0` in the verifier's instrumented run), exit 0. On main both print 0 and exit 0. Cause: R2 rewrote every `## ADR-NNN U+2014 title` to `## ADR-NNN: title` and both scripts match `^## ADR-NNN ` with a trailing space. R2 did what the plan says it does; the plan's check row never read what the scripts print | 🔴 |
| 4 | The plan's risk row answered a meaning risk with a test result. "The sweep changes user-visible strings (exports, plugin toasts, palette narratives, store copy)" was answered "every consumer test is swept by the same rule and the dry run is green". A test that is swept by the same rule cannot see the meaning change; only one export assertion pins heading text at all (`exports.mjs:2003`, the word `IMPORTANT`, which a colon keeps) | the Not-in-scope table names later owners for prose polish (marketing, palette JSON) and none for product strings or export output, so the comma in a `DESIGN.md` heading had nowhere to go but U4-10 | 🟡 |

Is the mechanical comma rule the wrong model for user-visible text? Not as such. The comma is right for a clause join, which is what the owner accepted in Q2 and what unslop rule 13 allows, and 348 of the 372 clause-join dashes in code strings read fine that way (the verifier's own sample of 55 agrees). It is wrong for a label separator anywhere, and strings are where label separators concentrate: 129 of about 567 swept string dashes are a heading, a bold label or a short title (E1 to E3), against 565 of 12,338 lines tree-wide. So the fix is a discriminator by construct, applied where the construct lives, not a ban on touching strings.

The four predicates, so the next pass and its reviewer run the same enumeration (each over the removed lines of `git diff --text -U0 c5f7bb2c HEAD`, comment lines dropped, then the matching line read back at the head at the same line number, since insertions equal deletions):

| Id | Where | Predicate on the removed line (glyph written as the escape) | Right replacement |
|---|---|---|---|
| E1 | `src/ui`, `src/engine`, `mcp`, `figma/plugin/code.js`, the binder `code.js` | a string opens with `#{1,6} ` and carries the dash: `["\`]#{1,6} [^"\`]*\x{2014}` | `: ` (R2's) |
| E2 | same paths | `\*\*[^*]+\*\* \x{2014} ` outside a `//` comment and outside the generated `"data":` mirrors | `: ` (R3's) |
| E3 | same paths | the line carries `title:`, `ariaLabel:`, `labelTitle:`, `label:`, `note:`, `description:`, `hint:`, `card(`, `toast(`, `notify(`, `_tokensTableArea(` or a `class: "...title"`/`insp-sub`/`empty-note`/`settings-note` div, and the text between the string's opening quote and the dash is one to four words with no `. , ; : ! ?` | `: ` for a title or card, a sentence break for a toast; a toast whose comma already reads as a sentence may stay, listed as kept with its read |
| E4 | every `.md` | `^\s*(>\s*[-*]?\s*\*\*[^*]+\*\* \x{2014}|• [^\x{2014}]{1,40} \x{2014})` | `: ` (R3's; the `> ` prefix and the `•` glyph are the two bullet forms R3 does not match) |

## 2. Options, measured

| | A. One bounded pass on the verdict's named lines plus the two checks | A+. One bounded pass, bounded by E1 to E4 plus the two checks (recommended) | B. Rule change: user-visible strings and headings are never auto-rewritten, hand list, redo those files | C. Split: the non-user-visible sweep lands now, strings and store copy go to a second unit |
|---|---|---|---|---|
| Lines touched by hand | 15 code lines, 6 store lines, 2 scripts | about 110 (16 E1, 26 E2, 42 E3, 26 E4), each listed before and after or listed as kept with its read; 2 scripts; `npm test` regenerates the mirrors | 567 string dashes to hand-read if "strings" is the boundary (above the 120-line read-all limit the U3 re-diagnosis set), or about 130 if the boundary is E1 to E3, in which case this is A+ plus a tool change | the same 110 lines, in a later unit, after a landing that ships them as commas |
| Tool, sweep, reviews | untouched | untouched; the enumeration is a criterion, not a rule | U3 reopens (pass 6, which revision 12 ruled out); the sweep reruns from c5f7bb2c; the 94 plus 73 hand pairs replay onto it; two reviews and 12 verifier greens are invalidated | the gate is whole-tree, so the split cannot keep it at zero: either the second unit's files keep the glyph and the gate stays unregistered (defeats U4-3 and the owner's Q1 ruling, gate at zero with no grandfather list) or they land with the comma |
| Checkable end state | the verdict's lines read as sentences; nothing says the rest do | each of E1 to E4 run at the head prints exactly the handoff's kept list (count equal, names equal); control: drop one kept line from the list, the counts differ; revert one rewritten line, the run prints it | a fixture per new rule in the self-test; the sweep's determinism re-measured | as A+ but later |
| Risk of a pass 5 | high: about 90 list-reading label lines the verdict did not name still stand (among them `brand-kit-core.mjs:114` and `:118`, the MCP tool descriptions; `ds-export.js:739` the family bullets, `:767` Surfaces, `:894` the motion list, `:1437` to `:1438` the font lines, the headings at `:1059`, `:1089`, `:1133`, `:1247`, `:1403`, `:1447`; `drawer.js:533` the zip README heading; `color.js:857`; `geometry.js:413`, `:578` to `:581`; `typography.js:24` to `:27`, `:341`) and a verifier that samples differently reds again | low to medium: a construct outside E1 to E4 is possible; graded 🟡 on the enumeration rather than 🔴 on the unit once the four print clean, and folded into a fifth predicate, which is how the U3 guard closed | medium on the work, high on the schedule: the replay conflicts on every line the new rules now handle, and the plan's determinism claim (a late branch reruns `--fix` and gets main's bytes) must be re-measured | high on the product: `# Acme, Design System`, `## Hard rules, IMPORTANT` and the Pro bullets ship to customers for the interval, which is the verifier's red made policy |
| Size and passes | S, 1 pass, then likely 1 more | M, 1 pass | L (U3 pass 6 plus U4 pass 4 plus re-review) | M plus a new unit plus two extra merges of a 355-file diff |
| Owner rulings kept | Q1 to Q4 | Q1 to Q4 | Q2 narrowed again | Q1 broken (grandfathering by unit) |

Recommendation: A+. The four reds are one population, and a population is closed by enumeration, not by a fourth reader. The tool change B would buy is protection for late branches, which add a handful of dashes each and are refused or hand-fixed under the gate anyway; that goes to a follow-up ticket, not into this unit.

What changes in the plan under A+ (revision 13):

| # | Change |
|---|---|
| 1 | U4-10 is rewritten: the command is the four enumerations E1 to E4 over `c5f7bb2c..HEAD`; expected: each prints exactly the handoff's kept list for that predicate, and the kept list carries a read per line; control: one kept line dropped from the list, or one rewritten line reverted, changes the count. The row stops saying "every auto-fixed line inside a program string is listed", which was 567 lines and unread |
| 2 | U4-6 is rewritten: expected is the scripts' last line, `range mismatches: 0` and `stale total: 0` with no line above it, not the exit code; control: adopt-hygiene's own (shift one card's end range, the run prints `end ADR-011 says ...`). U4 repairs the heading match it broke: `grep -nE "^## $id[: ]"` in the range check and `/^## ADR-$num[: ]/` in the amendment check's awk, with a rerun of adopt-hygiene's plant control (an `Amendment (2026-09-16)` line under `## ADR-011` prints `stale card ADR-011`) so the amendment check is shown to read bodies again |
| 3 | U4 step 3 gains the E4 rewrite of the 23 `docs/marketing/` lines with R3's colon, and a ticket to `marketing-manager-agent` (section 3) |
| 4 | Two tickets minted (section 4), one optional |

## 3. Whose is the store copy

| Question | Answer | Why |
|---|---|---|
| Who owns the sweep of `docs/marketing/`? | U4 | the owner's Q1 (all 329 files) and Q4 (no path exemptions); the gate at zero admits no marketing carve-out |
| Who owns the words? | `marketing-manager-agent` | `CLAUDE.md` names it the author of the corpus; the plan's Not-in-scope row sends polish there |
| Is a list-reading Pro bullet polish or a regression? | a regression U4 introduced | `> - **Unlimited brand kits** U+2014 every client...` is R3's construct; R3 missed it only because of the `> ` prefix (and the `•` glyph in the fenced spec block). A colon is what the rule table would have written and is mechanical, so U4 applies it, exactly as U4-9 applied the rule table's own replacement to the guard's over-refusals |
| What goes to marketing? | one ticket: reread the 23 lines (and the rest of the 366 swept marketing dashes) for voice under the gate, then the Lemon Squeezy dashboard walk of `store-copy.md` §10, since the live store carries the pre-sweep text and `store-drift-check.mjs` probes presence only (`derived, not guessed`, the product names), so it stays green either way | the words are marketing's and the live store is a deployed surface the repo cannot grep |

## 4. The vacuous exit: its own ticket

| Question | Answer |
|---|---|
| Is it U4's? | No. It predates U4 (both scripts since 180eca0e, the sdlc adoption); U4 owns only the heading match it broke, which it repairs in the same pass |
| Why not fold the `exit 1` into U4? | the exit code is a contract other records cite (preset-intent-fidelity U9-P5 reads `exit 0` for every `.sdlc/checks/*.sh`; adapter §2.1 has the pre-land verifier run them all and record each); changing it is a records-policy edit with its own control, and U4 is on pass 3 with a 355-file diff. A plan-row rewrite (U4-6 reads the output line) is enough for U4 to bite now |
| Ticket | kind:bug, size:small: `.sdlc/checks/card-source-range-check.sh` and `card-amendment-check.sh` exit 0 on a non-zero count; fix `exit $((n > 0))` on both, state in adapter §1 that every check under `.sdlc/checks/` is read by its last line and its exit code, control: one planted mismatch gives exit 1. Include the third output-only script, `doc-drift-rows-check.sh`, if its `bad` count is meant to gate |
| Second, optional ticket | kind:feature, size:small: `test/repo/em-dash.mjs --fix` applies R2 and R3 by construct inside string literals (E1, E2) and refuses E3 and E4 to the residual list, one fixture each; protects late branches, not needed for U4 |

Not changed by this re-diagnosis: the gate, the guard, the sweep commits e55a2ce9 and c90402b2, Q1 to Q4, U1, U2, U3, U5, U6, G0.
