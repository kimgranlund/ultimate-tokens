FAIL

# Review prompt-audit U1 pass 2 (post re-diagnosis) · #758 consumer plugin prose

Reviewer, fresh context, 2026-09-28. Stands in for `reviewer-l4` because fable is capped; this reviewer is opus, inside the opus L5 builder's own model family, so the generator and critic share a family. Branch `unit/pa-U1` at `5c03faef` (prose fix `3b73f739`, handoff on top). Pass 1 head `ca3c6cc6`. `B` = `8f5c6dc0`. Criteria: `.sdlc/plans/prompt-audit.md` U1 rows U1-1 to U1-13 at revision 4, and `.sdlc/plans/prompt-audit-U1-rediagnosis.md`. Every edited file was read whole for each claim class and checked against `src/engine/type.mjs` (`makeVoices`, `cat(..., box)`, `PARA_PROSE`) and `src/engine/geometry.mjs:270-287`. Edit controls ran in throwaway clones under the job scratch (`rv-pa-U1-p2/neg` at `B`, `rv-pa-U1-p2/pos` at `5c03faef`), each reverted, tree clean after. No worktree was edited except this record.

## Findings, ranked

| Id | Severity | Finding | Fix |
|---|---|---|---|
| H1 | Medium, blocking | `typography-tokens/references/headings.md:31` says kicker has `--type-kicker-{step}-line-single` because "it rides the `mono` role, so it has one". The causal clause is false by the engine: Body-mono, Label-mono, Tiny-mono and Sub-title all ride `mono` and pass `box=false`, so none has a line-single; Kicker has one because it is a box voice (default `box` true, never overridden). It contradicts the file's own sibling `responsive.md:34-36` (monos ride the mono role but are prose flow). This is the pass 1 failure shape (role implies box, T4/T5) in other words, in a wall file, unchanged since `B`. The handoff's whole-file re-read list names interface.md, prose.md, responsive.md and the color SKILL but not headings.md, and the re-diagnosis swept headings.md only for the ramp class. U1-13's greps do not catch it because the sentence names no box set | one clause: "(Kicker is a box voice, so it has one; leading 1.0)" |
| N2 | 🟡 gate gap, not blocking U1 | U1-13 control: flipping Label to `box` true moves the engine box list to `Label,Kicker,UI-control,UI-widget`, but `voice-parity` stays PASS, exit 0. Its semantic leg checks each single-line voice by proximity (name within 240 chars of `line-single`), satisfied here by `interface.md:6-8`'s negative statement. The plan's claim that this flip reds voice-parity is false, so nothing but U1-13's own greps pins the prose box set. The same file's comment "engine emits singleLineHeight for the ui + mono roles" is stale (the role-implies-box error). U1-13's own legs are unaffected | U2 (voice-parity.mjs is in its wall): assert the prose box set equals the engine set, and fix the comment |
| N1 | 🟡 plan text, not blocking | U1-9's planned fixture "Every voice rides the same ramp" prints `0` on U1-8's needle; the real wording "...the same **SM · MD · LG** ramp" prints `1`, and prose.md at `B` already prints `1`, so the needle bites. Only the plan's fixture is short | plan: quote the real sentence in U1-9 |
| L1 | Low | `responsive.md:22` "(pre-2026-07)" is a date in consumer prose; it is a functional consumer fact, builder flagged it | optional |
| L2 | Low | `responsive.md:28` lists helper text and tooltips as `-line` uses under the box voices; those are reading voices in the routing tables | optional rewording |
| L3 | Low | `interface.md:33-37` "at every step" is silent on the opt-in ladder ramp (`linear4`, font from its own `ladderText`) and a geometry `fontOverride`, both of which do not compose from UI-control | optional qualifier |
| L4 | Low | `prose.md:41` routes metadata to `.type-label-sm`, `interface.md:20` to `.type-tiny-md`; outside U1's classes, builder flagged it | a later unit |
| L5 | Low | `color-tokens/references/feedback.md:33` "mode-flat" uses mode for scheme, outside law 6 | optional |
| L6 | Low | `typography-tokens/SKILL.md:104` and `headings.md:14,16,52` say sub-heading and kicker are uppercase "by treatment"; the engine hardcodes both, and Sub-title is uppercase by default. Pre-existing, outside U1's classes | a later unit |

## Claim classes, read whole

| Class | Result | Evidence |
|---|---|---|
| Voice step counts | 🟢 | SKILL says fifteen voices, the Steps column has 15 rows; UI-control/UI-widget on six ranks XS to 2XL, thirteen on SM/MD/LG, matching `makeVoices` |
| Box vs reading voices | 🔴 | SKILL.md:36-37, :99-100, responsive.md:26, :33-36, :44 name exactly Kicker, UI-control, UI-widget, matching the engine; headings.md:31 is H1 |
| Scheme vs mode, law 6 | 🟢 | color SKILL.md:87-94 uses mode only for the on-colour mode, scheme for light/dark; `DEFAULT_CONTROLS.onColorMode` is `contrast`, DOMAINS `fixed,contrast`; fixed mode holds -on-primary at `50` in both schemes |
| Label vs operable chrome | 🟢 | SKILL.md:75-81, :142, prose.md:3-5, interface.md:6-8 send operable text to UI-control/UI-widget and keep `label` static |
| History ids | 🟢 | TKT-0010 gone from geometry SKILL; the only dated token across the nine files is L1 |

## Builder's three extra fixes

| Extra | Result | Evidence |
|---|---|---|
| prose.md:4 "Interface text is `label`" | 🟢 true, in wall | operable text is UI-control/UI-widget; label is `box=false` static text |
| responsive.md:30 "cells" as box text | 🟢 true, in wall | table cells use label, a prose voice with no line-single; "badges" is right |
| responsive.md 0.75× list | 🟢 true, in wall | measured MD para/size: Sub-title, Lead, Body, Body-mono 0.75, Label, Label-mono 0.77, Tiny, Tiny-mono 0.80 (all `PARA_PROSE` body/0.75 fallback, rounding); 4 display/heading at 0.7 + 8 at 0.75 + 3 box at 1.0 = 15 |

## Criteria, run by this reviewer

| Row | Head `5c03faef` | `B` `8f5c6dc0` |
|---|---|---|
| U1-1 | 0,0,3,1,15 | 3,1,0,0 |
| U1-2 | 1,15,2; 0/0/0; `true false` | 0,0,0; 1/1/1 |
| U1-3 | 0/0,1,1; `contrast fixed,contrast` | 1/1,0,0 |
| U1-4 | 0/0,2,1,1 | 1/1,0 |
| U1-5 | 0/0/0/0 | 5,1,3,4 |
| U1-6 | three gates PASS, exit 0; voice-parity `15 voices` | not applicable |
| U1-7 | merge-base `36a83732`; exactly the nine wall paths | not applicable |
| U1-8 | 0x5,1,0; engine `true true 11,13,15,16,19,22` | 1,2,1,1,0; 0,1 |
| U1-9 | 0,1,1 | 1,0,0 |
| U1-10 | 0,2,1 | 1,0,0 |
| U1-11 | 0,1,3 | not rerun |
| U1-12 | 1,0,1,1,11 | not rerun |
| U1-13 | 0,2; engine `Kicker,UI-control,UI-widget` | 2,0 |
| P5 | each of the 11 ids prints 1 | not applicable |

Edit controls in `pos`, each reverted: the old F1 wording in interface.md prints `1`; a bare `geomScale` gives `false 12,13,15,16,18,20`; a `3xl` append gives the unknown-step line, `voice-parity FAIL`, exit 1; the Label box flip is N2; the U1-9 fixture is N1.

## Scope

The unit's own non-merge commits (`4b7afda3`, `a229432b`, `0fd362bb`, `9be7a18f`, `0e507d10`, `ca3c6cc6`, `3b73f739`, `5c03faef`) touch only the nine wall files plus U1 handoff and review records. Other paths in `git diff B..HEAD` arrive through merge `53966a8e` of `plan/prompt-audit` (U4 and U5 lands). 🟢 inside the wall.

One Medium finding (H1) blocks; everything else passes.

verdict: 🔴
