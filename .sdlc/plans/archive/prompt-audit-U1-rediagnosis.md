---
kind: rediagnosis
plan: prompt-audit
unit: U1
ticket: "#758"
against: .sdlc/verdicts/prompt-audit-U1.md (pass 1, 🔴 at ca3c6cc6)
branch: unit/pa-U1
head: ca3c6cc6 (code commit 0e507d10)
base: 8f5c6dc0 (B, `git merge-base origin/main unit/pa-U1`)
written: 2026-09-28
seat: planner, read-only; every figure below was re-run at ca3c6cc6 and at B from the pa-U1 worktree, engine facts by `node --input-type=module -e`
---

# prompt-audit U1, pass 2 re-diagnosis

The verdict's 🔴 row is a reading, not a failed needle: every plan row passed and every control failed as it should, yet `interface.md:35` still says every voice is sm/md/lg-only. That is the shape of a needle built from the audit's quotes rather than from the claim. Section 1 says why and lists every ramp statement in the consumer plugin with its truth value; section 2 gives pass 2 its rows; section 3 places F4; section 4 gives the revision row and the grade.

## 1. Root cause

**Why T3 listed `:5` and `:55` and not `:30-36`.** The audit's T3 row (`prompt-audit-evidence.md:931`) is a quote list: four sentences that say "3-step" or "fixed sm/md/lg ramp" in the same words (`SKILL.md:51`, `interface.md:5`, `interface.md:55`, `headings.md:5`). Its hunk (`:1027-1050`) patches those four lines and nothing else. `interface.md:35` states the same false fact in a parenthetical, `(every voice is sm/md/lg-only)`, inside a paragraph about geometry, so a phrase search for the audit's wording never reached it. `prose.md:20` (`Every voice rides the same **SM · MD · LG** ramp`) was missed the same way: "rides the same", not "is a fixed".

Three layers then inherited the miss, each reading the layer above instead of the file:

| Layer | What it read | What it did not do |
|---|---|---|
| the audit | its own phrase search | sweep each file for the claim class (a universal ramp statement in any wording) |
| the plan, U1-2's fourth grep | the audit's four quotes: `every voice is (now )?a (fixed )?(\*\*)?(sm.lg\|3-step\|sm/md/lg)` | match `every voice is sm/md/lg-only` (no article after `is`) or `Every voice rides` (a different verb); `prose.md` is not even in the file list |
| the builder | the audit's hunks line by line, then the plan's greps | re-read the rewritten file for the claim it had just corrected at line 5 (U1 step 1 asked for the engine read; the diff shows the paragraph at `:30-36` untouched) |
| the reviewer, r1 and r2 | the diff hunks and the plan's greps (`review.md:34` reached `:55-56`, the neighbouring bullet) | read the unchanged paragraph between the two hunks |

So yes, the needle method is the problem, in two ways. The audit's needle was a phrase, not a claim, so it under-listed the lines. The plan's needle was then built to the audit's list, so U1-2 could only ever confirm the four known lines had gone, never that the fact had gone. A criterion that greps for the wording the audit happened to quote is a regression test for the audit, not for the file.

**Every statement of the voice step ramp in `plugin/ultimate-tokens/` at ca3c6cc6**, against the engine (`type.mjs:32-49`: thirteen voices on `SM/MD/LG`, `UI-control` and `UI-widget` on `XS/SM/MD/LG/XL/2XL`; `geometry.mjs:285-287` composes `uiSteps[name].size` for every control step). The grep was `git grep -n -i -P '\b(every|all|each|most) (heading |prose )?voices?\b'` plus a second pass for `sm/md/lg`, `3-step`, `six-step`, `2xl` and `-only` over every `.md` under the plugin; the table keeps every hit that states a ramp.

| File:line | Statement | Engine says | Verdict |
|---|---|---|---|
| `typography-tokens/SKILL.md:51-53` | every voice is its own ramp: most `sm/md/lg`, the two interactive voices `xs/sm/md/lg/xl/2xl` | as stated | true |
| `typography-tokens/SKILL.md:59-73` | the `Steps` column, fifteen rows | U1-2 measured `15` rows, `2` six-step rows, `true false` | true |
| `typography-tokens/references/interface.md:5` | both interactive voices a six-step `xs/sm/md/lg/xl/2xl` ramp | `SIZES["UI-control"]`, `SIZES["UI-widget"]` have six entries | true |
| `typography-tokens/references/interface.md:33-36` | geometry derives the control font from the voice at `SM ↔ SM, MD ↔ MD, LG ↔ LG`; XS, XL and 2XL have no voice counterpart, `(every voice is sm/md/lg-only)` | `geomScale({}, { typeScale })` composes the voice at all six steps: voice `12,13,15,16,18,20`, geometry font `12,13,15,16,18,20`; with `overrides: { "UI-control\|XS": 11, "UI-control\|XL": 19, "UI-control\|2XL": 22 }` the geometry font follows, `11,13,15,16,19,22`, where a bare `geomScale({})` stays `12,13,15,16,18,20` | **false**, F1; also contradicts line 5 of its own file |
| `typography-tokens/references/interface.md:55-56` | each voice's own ramp is fixed, `sm/md/lg` or the two interactive voices' `xs/sm/md/lg/xl/2xl` | as stated | true |
| `typography-tokens/references/prose.md:20` | `Every voice rides the same **SM · MD · LG** ramp` | true of the eight voices in the table above it, false of the two interactive voices; the sentence says `Every voice` | **false as written**, F2 |
| `typography-tokens/references/headings.md:5-6` | each heading voice here is its own `sm/md/lg` ramp | Display, Headline, Sub-heading, Title, Kicker are all three-step | true (U1 already fixed it) |
| `typography-tokens/references/responsive.md:26` | the box voices are `Label, Body-mono, Label-mono, and Kicker` | `singleLineHeight` is emitted for `Kicker`, `UI-control`, `UI-widget` only (the engine run: `line-single: true` on exactly those three); `Label`, `Body-mono`, `Label-mono` are `box: false` | **false**, F4 (a box-voice claim, not a step claim, but it sits in the same file family) |
| `typography-tokens/references/responsive.md:36` | reach for `-line-single` on a Kicker/UI-control/UI-widget element | as stated | true |
| `typography-tokens/references/responsive.md:43-44` | `1.0×` para for the box voices, `Label, Body-mono, Label-mono, and Kicker` | same three-voice set as line 26 | **false**, F4 |
| `geometry-tokens/SKILL.md:31`, `:50` | control geometry is per-size, steps XS to 2XL | `SIZE_KEYS` are XS to 2XL | true (geometry steps, not voice steps) |
| `geometry-tokens/references/controls.md:46` | control font = the UI-control voice at the matching step | the composition above | true |
| `agents/token-integrator.md:48-49` | "line vs line-single; per-role rhythm" | names no voice set | not a ramp statement |

Nothing else under the plugin states a ramp. `voice-parity.mjs` is green on all of this because its semantic leg (`:69-93`) checks token names (`--type-label-<step>-line-single`) and voice-to-`line-single` proximity, not prose claims; U2's `Steps` column pin reads the table only. Prose stays a reading, which is why pass 2 needs a claim-shaped needle and not a wider phrase list.

## 2. Pass 2 scope

Five items. Each row gives the exact change, then the criterion in the plan's six-cell shape. Controls run in a throwaway clone under the seat's scratch, `$F/neg` checked out at B, never in a worktree. `S=plugin/ultimate-tokens/skills/typography-tokens`, `C=plugin/ultimate-tokens/skills/color-tokens`, `H=.sdlc/handoffs/prompt-audit-U1.md`.

### F1 (must fix): `interface.md:30-36`, "Composing with control geometry"

Replace lines 33 to 36 (from `UI-control voice at the matching step` to `the box fits the text.`) with:

> UI-control voice at every step, XS to 2XL: the voice's six sizes are the six control font sizes,
> and a per-cell override on the voice (`UI-control|XL`, say) moves geometry's XL font with it.
> Match the step across the two systems, `.control-md` with `.type-ui-control-md`, and let the
> box fit the text; the control ramp never needs a size the voice does not have.

The first sentence carries the pin phrase `at every step, XS to 2XL`. Do not keep `SM ↔ SM, MD ↔ MD, LG ↔ LG`; it is true and misleading (three of six).

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U1-8 | no universal three-step ramp claim remains in any typography file, in any wording, and the composition paragraph names all six steps | `grep -c -i -E '(every\|all) voices? (is\|are\|rides?) (now )?(a \|the )?(fixed \|same )?(\*\*)?(sm\|3-step)' $S/SKILL.md $S/references/interface.md $S/references/prose.md $S/references/headings.md $S/references/responsive.md; grep -c 'at every step, XS to 2XL' $S/references/interface.md; grep -c 'SM ↔ SM, MD ↔ MD, LG ↔ LG' $S/references/interface.md; node --input-type=module -e 'import { typeScale } from "./src/engine/type.mjs"; import { geomScale } from "./src/engine/geometry.mjs"; const ts = typeScale({ overrides: { "UI-control\|XS": 11, "UI-control\|XL": 19, "UI-control\|2XL": 22 } }); const v = Object.values(ts.categories["UI-control"]).map(s => s.size).join(","); const f = Object.values(geomScale({}, { typeScale: ts }).sizes).map(s => s.font).join(","); const f0 = Object.values(geomScale({}).sizes).map(s => s.font).join(","); console.log(v === f, f !== f0, f)'` | `0` for each of the five files, `1`, `0`, `true true 11,13,15,16,19,22` (the ERE's alternation is bare, escaped here only because it sits in a table cell, per the prose rules; the needle has no literal pipe; it keys on the subject `every voice` plus a ramp verb, not on the audit's adjectives, so `is sm/md/lg-only`, `rides the same **SM` and `is now a fixed **SM` all count while `is its own ramp` at `SKILL.md:51` does not) | the files at `$B` print `1`, `2`, `1`, `1`, `0` (SKILL, interface, prose, headings, responsive), then `0`, `1`; the engine leg with `geomScale({})` in place of the composed call prints `false` on the first value (the bare call keeps the ratified rows, `12,13,15,16,18,20`), which is the proof the composition is real and not a coincidence of the default table | `0`, `1`, `1`, `0`, `0`; `0`; `1`; `true true 11,13,15,16,19,22` |

### F2: `prose.md:20`

Replace the sentence with:

> Every prose voice here rides the same **SM · MD · LG** ramp (`.type-{voice}-sm|md|lg`); default to `-md`. The two interactive voices are not prose and have six steps, see interface.md.

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U1-9 | the prose reference scopes its ramp claim to the prose voices and points at the six-step exception | `grep -c -E '^Every voice rides' $S/references/prose.md; grep -c -E '^Every prose voice here rides' $S/references/prose.md; grep -c -E 'interactive voices.*six steps' $S/references/prose.md` | `0`, `1`, `1` (U1-8's first grep also reads this file and must stay `0` on it) | the file at `$B` prints `1`, `0`, `0`; a fixture line `Every voice rides the same ramp` appended in the clone reds U1-8's first grep to `1` on prose.md | `1`, `0`, `0` |

### F3: law 6 of `color-tokens/SKILL.md:87-94`, "modes"

Two words. Line 90 `in both modes instead` becomes `in both schemes instead`; line 88 already says `in each scheme`. After that, inside law 6, `mode` means the on-colour mode only (`the default mode`, `whichever mode is active`, `the other mode's behavior`) and `scheme` means light or dark. Line 7 (`dark mode` in the trigger list) is a user's phrase and stays.

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U1-10 | law 6 uses `mode` for the on-colour mode and `scheme` for light and dark, and does not use `modes` for the schemes | `awk '/^6\. \*\*On-colou?rs/,/^## /' $C/SKILL.md \| grep -c -i -E '\b(both\|either\|each) modes?\b'; awk '/^6\. \*\*On-colou?rs/,/^## /' $C/SKILL.md \| grep -c -i 'scheme'; awk '/^6\. \*\*On-colou?rs/,/^## /' $C/SKILL.md \| grep -c -E 'default, \x60onColorMode: contrast\x60'` | `0`, `2` or more, `1` (the third leg keeps U1-3's pin inside the edited law) | the file at `$B` prints `1`, `0`, `0` (its law 6 is the fixed-light text: one `both modes`, no `scheme`, no pin); at the head the first leg prints `1` (`in both modes`, line 90) | `1`, `1`, `1` |

### H1: the handoff's controls row

The row `| U1-1..5 | the pre-edit text at HEAD~ is the negative state | ... |` is false at every head the handoff has sat at (`git grep -c -i thirteen ca3c6cc6~ -- $S/SKILL.md` prints nothing and exits `1`; at B it prints `3`). Rewrite it as: `| U1-1..5 | the negative state is B, 8f5c6dc0 (git merge-base origin/main unit/pa-U1), read with git show or a clone at B | thirteen 3, eleven-role 1, fixed light 1 and 1, ids 5/1/3/4, chrome → label 1 and 1, per the plan's own B column |`.

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U1-11 | the handoff names B, not `HEAD~`, as the negative state, and quotes the B figures | `grep -c 'HEAD~' $H; grep -c -E '^\| U1-1\.\.5 \|.*(8f5c6dc0\|\$B).*\bthirteen 3\b' $H; git grep -c -i thirteen 8f5c6dc0 -- $S/SKILL.md \| cut -d: -f3` | `0`, `1`, `3` | the file at the head prints `1`, `0`; a fixture row reading `at HEAD~` prints `1` on the first grep | `1`, `0`, `3` |

### H2: the handoff's header and U1-6 control cell

Header line 3 becomes `Builder, pass 2, head <sha> (pass 1 was ca3c6cc6, verified 🔴; its review rounds r1 and r2 are in .sdlc/verdicts/prompt-audit-U1-review*.md).` The U1-6 control cell drops `backup restored after` and says `in a clone at the head, $F/pos` with the clone command. The Findings table gains a `T3 | amended` row stating that the interface.md composition paragraph and prose.md were corrected in pass 2 with U1-8 and U1-9 as proof, and keeps the pass 1 `applied` figures for the rest; P5's count for U1 then reads `10` rows (T3 stays one row, its state `amended`, its proof cell naming both passes).

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U1-12 | the handoff is the pass 2 record and its U1-6 control ran in a clone | `grep -c -E '^Builder, pass 2, head [0-9a-f]{8}' $H; grep -c 'backup restored' $H; grep -c -E '^\| U1-6 \|.*in a clone' $H; grep -c -E '^\| T3 \| amended \|.*U1-8' $H; grep -c -E '^[\|] [A-Z0-9]+ [\|] (applied\|amended\|dropped) [\|]' $H` | `1`, `0`, `1`, `1`, `10` | the file at the head prints `0`, `1`, `0`, `0`, `10`; P5's own control (a copy with the T4 row cut) prints `9` on the last leg | `0`, `1`, `0`, `0`, `10` |

The pass 1 rows U1-1 to U1-7 are re-run at the pass 2 head as well; U1-7's expected list grows by one path if section 3's recommendation is taken.

## 3. F4: `responsive.md:26` and `:43-44`

Recommendation: **U1 takes it, by widening its wall by one file**, `plugin/ultimate-tokens/skills/typography-tokens/references/responsive.md`. Reasons, in order of weight:

1. It is the same defect class as T4 (the box-voice set: `Label` is static, the box voices are `Kicker`, `UI-control`, `UI-widget`), in the same skill, one directory over from the three references U1 already rewrote. The builder who re-derived T4 from `type.mjs`'s `box` flag is the seat that already holds the fact.
2. `voice-parity.mjs` already reads every `references/*.md`, so the file is inside the gate U1-6 runs; no other unit's gate changes.
3. U2 is a pins unit (scripts and test fixtures, no prose); routing a prose fix there mixes kinds and would make U2's own U2-1 retro control (which checks out U1's parent skill directory) read a half-fixed skill. A third unit for two lines is a dispatch for its own sake.

Cost: U1-7's expected becomes nine paths; P4's exact filter gains `references/(interface|headings|prose|responsive)\.md` and its wall count becomes 56; the plan's Scope wall sentence for U1 and the Grade table's `Touches` cell say nine files. The finding needs an id for P5: mint `T5` in the Re-verification table (`responsive.md names Label, Body-mono, Label-mono and Kicker as the box voices; the engine emits line-single for Kicker, UI-control and UI-widget only; line 36 of the same file names the right three`), add it to U1's P5 id list (eleven ids; U1-12's last leg then expects `11`), and run `python3 <plugin>/scripts/board.py ids .sdlc` once before dispatch, since the `T` prefix's ownership is what P7 proved on the evidence file, not on a new id.

Exact change: lines 26 and 43-44 name `Kicker, UI-control, and UI-widget` as the box voices; line 44's `1.0× for the box (control-text) voices` keeps its rate. Line 31-34 (the reading voices list) already includes `label`, `body-mono`, `label-mono` and is right.

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U1-13 | the responsive reference names the engine's three box voices in both places and no other set | `grep -c 'Label, Body-mono, Label-mono, and Kicker' $S/references/responsive.md; grep -c -E 'Kicker, UI-control,? and UI-widget' $S/references/responsive.md; node --input-type=module -e 'import { typeScale } from "./src/engine/type.mjs"; const s = typeScale({}); console.log(Object.entries(s.categories).filter(([, st]) => Object.values(st).some((x) => x.singleLineHeight != null)).map(([v]) => v).join(","))'` | `0`, `2`, `Kicker,UI-control,UI-widget` | the file at `$B` prints `2`, `0` (responsive.md is byte-identical at B and at ca3c6cc6, `git diff --stat` empty); in the clone, `sed -i '' 's/"Label": cat("ui", "Label", \(.*\), false)/"Label": cat("ui", "Label", \1, true)/' src/engine/type.mjs` adds `Label` to the engine list and reds `voice-parity`'s semantic leg (a reading voice named with `-line-single` nowhere), which is the proof the third leg reads the engine and not the prose | `2`, `0`, `Kicker,UI-control,UI-widget` |

If the Orchestrator prefers to keep U1's wall as ratified, the fallback is U2's `subset-phrasing line in U1's files` clause widened to this file, with the same U1-13 row moved under U2; that is weaker for reason 3 and is not recommended.

## 4. Revision row and grade

Proposed row for the plan's Revisions table (one row, six cells by an unescaped-pipe count):

`| 2026-09-28 | revision 4, status approved, against .sdlc/verdicts/prompt-audit-U1.md (pass 1, 🔴 at ca3c6cc6, F1 to F4, H1, H2). Root cause: U1-2's fourth grep was shaped to the audit's four T3 quotes, so it could confirm those lines had gone and never that the fact had; interface.md:35 (a parenthetical, "sm/md/lg-only") and prose.md:20 ("rides the same") state the same false fact in other words and were untouched by the builder and both review rounds. U1 gains six rows: U1-8 (a claim-shaped needle, subject plus ramp verb, over all five typography files, plus the composition pin "at every step, XS to 2XL" and an engine leg proving geomScale composes a UI-control override at XS, XL and 2XL: voice 11,13,15,16,19,22 equals geometry, a bare geomScale({}) does not), U1-9 (prose.md scopes its ramp to the prose voices), U1-10 (law 6 says scheme for light and dark and mode for the on-colour mode only), U1-11 and U1-12 (the handoff names B as the negative state, is headed pass 2, and its U1-6 control ran in a clone), U1-13 (F4: responsive.md:26 and :43-44 name Kicker, UI-control and UI-widget as the box voices). U1's wall widens by responsive.md (nine files; U1-7 expects nine paths; P4's filter and count, 56; P5's U1 ids gain T5, eleven). U1-2's fourth grep is kept as is and now reads as a subset of U1-8. Builder grade for pass 2 raised to L5 per the two-grade rule, checkers reviewer-l3 and verifier-l2 (fable capped). Every Today figure for the new rows measured at ca3c6cc6 and at B on 2026-09-28 (prompt-audit-U1-rediagnosis.md) | the U1 pass 1 verdict's 🔴 and its F1 to F4, H1, H2 |`

**Builder grade for pass 2: L5 (opus, medium)**, two grades above the L3 the plan assigned, per the rule the dispatch named. The plan graded U1 L3 because "each rewrite is a factual claim the builder must re-derive from the engine before writing it"; pass 1 shows the builder applied the audit's hunks and the plan's greps and did not re-read the rewritten file for the claim it had just corrected, which is the exact failure L3 was meant to cover. A stronger model on the same instructions is the right lever, not more needles: U1-8 is one claim-shaped needle, and the rest of the file is still a reading. The builder's pass 2 brief should say so in one line: after every edit, re-read the whole file for the claim class, not the line.

Reviewer and verifier: the plan's grade paragraph pairs only L1/L2 and L3/L4 builders. For an L5 builder the Orchestrator's table decides; the planner's recommendation is reviewer-l3 (opus high) and verifier-l2; the Orchestrator ruled reviewer-l3 and verifier-l2 (fable capped) on 2026-09-28, which is what the plan's revision 4 records. Pass 2 is dispatched on `unit/pa-U1` at ca3c6cc6, in the same worktree, with the six new rows and the widened wall as its criteria, and the eight pass 1 rows re-run at the new head.
