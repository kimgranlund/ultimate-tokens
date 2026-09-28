# Handoff prompt-audit U1 · #758 consumer plugin prose

Builder, pass 2, head 3b73f739 (pass 1 was ca3c6cc6, verified 🔴; its review rounds r1 and r2 are in .sdlc/verdicts/prompt-audit-U1-review*.md).

Written 2026-09-28. The head named above is the pass 2 prose commit; this handoff is committed on top of it.

## Branch

`unit/pa-U1`, worktree `.worktrees/pa-U1`. Pass 1 prose commits `4b7afda3`, `0fd362bb`, `0e507d10` on top of B = `8f5c6dc0`; revision 4 merged at `53966a8e`; pass 2 prose commit `3b73f739`. `npm test` green at `3b73f739` (tally in the Gates section), tree clean after.

## What pass 2 changed

| Item | File | Change | Engine fact it rests on |
|---|---|---|---|
| F1 | `typography-tokens/references/interface.md:33-37` | the re-diagnosis text verbatim: the geometry engine derives each control font from the UI-control voice `at every step, XS to 2XL`; the `SM ↔ SM` triple and `(every voice is sm/md/lg-only)` are gone | `geometry.mjs:285-287` reads `uiSteps[name].size` for every default-ramp step; U1-8's engine leg |
| F2 | `typography-tokens/references/prose.md:21` | the re-diagnosis text verbatim: `Every prose voice here rides the same **SM · MD · LG** ramp`, plus the pointer to the two interactive voices' six steps | `type.mjs` `SIZES`: only `UI-control`, `UI-widget` have six entries |
| F2, re-read | `prose.md:4-5` | the intro said `Interface text is \`label\``; it now names `UI-control`/`UI-widget` for operated text and `label` for static labels (same claim class as T4, found on the whole-file re-read) | `"Label": cat(..., false)` in `makeVoices` |
| F3 | `color-tokens/SKILL.md:90` | `in both modes instead` to `in both schemes instead`; law 6 now uses `mode` only for the on-colour mode | none (wording) |
| F4 | `typography-tokens/references/responsive.md:26` and `:44` | the box voices are `Kicker, UI-control, and UI-widget` in both places | `typeScale({})` emits `singleLineHeight` for exactly those three; paragraph ratio `1.00` for exactly those three |
| F4, re-read | `responsive.md:30`, `:43-44` | the box examples drop `cells` (a table cell is `label`, `-line`, per interface.md:18) for `badges`; the 0.75× prose list gains `body-mono`, `label`, `label-mono`, which left the box list and would otherwise sit in no list | MD-step `para/size`: Body-mono `0.75`, Label and Label-mono `0.77` (rounding of 13 × 0.75), prose fallback `PARA_PROSE` 0.75 |

Whole-file re-reads after each edit, for the claim class: interface.md (ramp and box: lines 5, 55-56 already right), prose.md (ramp, and the label-as-interface claim fixed above), responsive.md (box set: line 36 already right, the reading-voice list at 33-34 has all twelve non-box voices), color-tokens SKILL.md (every `mode` in law 6 now means the on-colour mode; line 7's `dark mode` is a user phrase). A plugin-wide `git grep` for `line-single` and `box voice` found no other box-set claim; the step-ramp sweep (`every|all|each|most ... voices`, `sm/md/lg`, `3-step`, `six-step`, `-only`) found no other universal ramp claim.

Left as is, outside the claim classes: `responsive.md:22` carries `(pre-2026-07)`, a date in a consumer skill (the S3 class, but not a finding on this file); `prose.md:40` sends interface metadata to `.type-label-sm` where interface.md:20 sends metadata to `.type-tiny-md`. Neither is in U1's finding list; flagged for the Orchestrator.

## Criteria

Positive commands ran in the worktree at `3b73f739`; controls ran in throwaway clones under the job scratch directory: `$F/neg` (`git clone <worktree> $F/neg; git -C $F/neg checkout 8f5c6dc0`) and `$F/pos` (same, `checkout 3b73f739`). No control touched a worktree.

| Id | Result | Head output | Control output |
|---|---|---|---|
| U1-1 | 🟢 | `0`, `0`, `3`, `1`, `15` | `$F/neg`: `3`, `1`, `0`, `0` |
| U1-2 | 🟢 | `1`, `15`, `2`, `0` `0` `0`, `true false` | `$F/neg`: `0`, `0`, `0`, then `1` `1` `1`; the row grep with bare pipes prints `140` |
| U1-3 | 🟢 | `0` and `0`, `1`, `1`, `contrast fixed,contrast` | `$F/neg`: `1` and `1`, `0`, `0` |
| U1-4 | 🟢 | `0` and `0`, `2`, `1`, `1` | `$F/neg`: `1` and `1`, `0` |
| U1-5 | 🟢 | `0` for each of the four | `$F/neg`: `5`, `1`, `3`, `4` |
| U1-6 | 🟢 | `voice-parity PASS ... (15 voices; -line-single voices verified)`, `role-parity PASS`, `dimension-parity PASS`, three `exit 0` under pipefail | see the U1-6 row of Controls: `printf '\n\x60--type-label-3xl-size\x60\n' >> $S/SKILL.md; node $S/scripts/voice-parity.mjs` prints `✗ SKILL.md: --type-label-3xl-size, unknown step "3xl"`, `voice-parity FAIL`, `exit 1`; reverted with `git checkout` in that clone |
| U1-7 | 🟢 | merge base `36a83732`; the diff is exactly the nine scope-wall paths (README, color SKILL and feedback, geometry SKILL, typography SKILL and interface, headings, prose, responsive) | any other path reds it; none present |
| U1-8 | 🟢 | `0` for each of the five files, `1`, `0`, `true true 11,13,15,16,19,22` | `$F/neg`: `1`, `2`, `1`, `1`, `0` (SKILL, interface, prose, headings, responsive), then `0`, `1`; engine leg with bare `geomScale({})`: `false 12,13,15,16,18,20` |
| U1-9 | 🟢 | `0`, `1`, `1` | `$F/neg`: `1`, `0`, `0`. Fixture, see note N1: in `$F/pos`, appending `Every voice rides the same ramp` leaves U1-8's first grep at `0` on prose.md; appending `Every voice rides the same **SM · MD · LG** ramp` reds it to `1` |
| U1-10 | 🟢 | `0`, `2`, `1` | `$F/neg`: `1`, `0`, `0`; at ca3c6cc6 the first leg printed `1` (`in both modes`) |
| U1-11 | 🟢 | `0`, `1`, `3` | the file at ca3c6cc6 prints `1`, `0`; fixture in the Records controls below |
| U1-12 | 🟢 | `1`, `0`, `1`, `1`, `11` | the file at ca3c6cc6 prints `0`, `1`, `0`, `0`, `10`; fixture in the Records controls below |
| U1-13 | 🟢 | `0`, `2`, `Kicker,UI-control,UI-widget` | `$F/neg`: `2`, `0`. Engine flip, see note N2: in `$F/pos`, `sed` flips `Label`'s `box` to `true`; the engine leg prints `Label,Kicker,UI-control,UI-widget` (the leg reads the engine); `voice-parity` stays `exit 0`, not red as the plan expected |

N1 (🟡, plan text, not prose). U1-9's planned fixture `Every voice rides the same ramp` does not match U1-8's needle, which needs `sm` or `3-step` after the optional `same `; the needle bites on the real wording (`rides the same **SM`). The needle is right for the claim; the fixture text in the plan is too short. Suggest the plan's U1-9 control cell read `Every voice rides the same **SM · MD · LG** ramp`.

N2 (🟡, plan text and U2's gap). With `Label` flipped to box, `voice-parity`'s semantic leg stays green because its only positive check is proximity: `Label` sits within 240 characters of a `line-single` mention in interface.md:6-8 (`Label is the STATIC ... no -line-single`), a negative statement the proximity test reads as an association. The third leg of U1-13 does read the engine (its output changes), which is what the row needs; the plan's claim that the flip reds voice-parity is false at this head. That gate gap is U2's to pin, not U1's.

## Controls

| Row | Control | Result |
|---|---|---|
| U1-1..5 | the negative state is B, 8f5c6dc0 (git merge-base origin/main unit/pa-U1), read with git show or a clone at B | thirteen 3, eleven-role 1, fixed light 1 and 1, ids 5/1/3/4, chrome → label 1 and 1, per the plan's own B column; rerun in `$F/neg` at 8f5c6dc0 with the same figures |
| U1-6 | in a clone at the head, $F/pos (`git clone <worktree> $F/pos; git -C $F/pos checkout 3b73f739`), appended `` `--type-label-3xl-size` `` to SKILL.md and ran voice-parity | `✗ SKILL.md: --type-label-3xl-size, unknown step "3xl"`, `exit 1` |
| U1-8..10, U1-13 | the files at B in `$F/neg`, the fixtures and the engine flip in `$F/pos` | as in the Criteria table |

Records controls (U1-11, U1-12), each on a copy of this file under the scratch directory: a fixture row reading at HEAD plus a tilde (the pass 1 wording) makes U1-11's first leg print `1`; a copy with the T4 row cut prints `10` on the P5 count leg. Figures recorded in the Gates section.

## Findings (P5)

| Id | State | Fate and proof |
|---|---|---|
| C1 | applied | law 6 opens `default, \`onColorMode: contrast\``, names `onColorMode: fixed`, and now says `both schemes` (F3); proved by U1-3 (`contrast fixed,contrast`) and U1-10 (`0`, `2`, `1`) |
| C2 | applied | feedback.md defers to `onColorMode`; `fixed light` grep `0` |
| T1 | applied | `fifteen-voice`/`fifteen-role` in SKILL.md; U1-1 `0`, `3` and engine `15` |
| T2 | applied | README says `fifteen-voice scale`; `eleven-role` `0` |
| T3 | amended | pass 1 applied the Steps column and the four quoted lines (U1-2: `15`, `2`, `0`, `true false`); pass 2 corrected the claim in other words: interface.md's composition paragraph now composes at every step, XS to 2XL, and prose.md scopes SM/MD/LG to the prose voices; proved by U1-8 (`0` on all five files, `1`, `0`, `true true 11,13,15,16,19,22`) and U1-9 (`0`, `1`, `1`) |
| T4 | applied | `label` is static, operable chrome is `UI-control`/`UI-widget` in the note, checklist, prose.md (Don't list and, pass 2, its intro) and the "no separate voice" sentence; U1-4 greps and `grep -n 'and \`label\`$' SKILL.md` empty |
| T5 | applied | responsive.md names `Kicker, UI-control, and UI-widget` as the box voices at :26 and :44, and moves Label, Body-mono, Label-mono to the 0.75× prose list; proved by U1-13 (`0`, `2`, `Kicker,UI-control,UI-widget`) |
| S1 | applied | SPEC/ADR ids removed from color-tokens; U1-5 `0` |
| S2 | applied | TKT-0010 removed from geometry-tokens; U1-5 `0` |
| S3 | applied | current-rule wording, no dates, in typography SKILL.md; U1-5 `0` |
| S4 | applied | interface.md states the current rule, no ids or dates; U1-5 `0` |

Quoted dashed lines (P3): none.

## Gates

| Gate | Result |
|---|---|
| `npm test` at 3b73f739 | 🟢 `✓ all 53 test files passed`, exit 0; `git status --short` after shows only this handoff (tree clean of generated drift) |
| `node test/repo/em-dash.mjs` | 🟢 `em-dash: clean (806 files scanned)` |
| `node test/repo/branding.mjs` | 🟢 `branding: clean (798 files scanned)` |
| records controls | 🟢 U1-11: a copy with a pass 1 style row appended prints `1` on the first leg (head `0`); the file at ca3c6cc6 prints `1`, `0`. U1-12: a copy with the T4 row cut prints `10` on the last leg (head `11`); the file at ca3c6cc6 prints `0`, `1`, `0`, `0`, `10` |
