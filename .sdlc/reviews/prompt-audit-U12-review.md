PASS: prompt-audit U12 pass 1 at `26b3f4eb` (code commit `3a03c8e4`, base `plan/prompt-audit` `ba60879f`), U12-1 to U12-5 hold and every control the handoff skipped bites as the plan says

Reviewer: pa-U12 reviewer, pass 1, fresh context. Source: plan `## U12` and revision 24 in `.sdlc/plans/prompt-audit.md`; `## Pass 2` of `.sdlc/verdicts/prompt-audit-prepr.md` (main), findings 1 to 4. `npm test` not rerun (builder's run quoted, diff is four Markdown files, host loaded); tree clean after every control below (`git status --short` prints `0` lines).

## Criteria

| Id | State | Evidence (this tree, `26b3f4eb`) | Negative control |
|---|---|---|---|
| U12-1 | 🟢 | `0`, `2`, `0`, `15 13 2` | `best-practices.md` at `HEAD~2` (`ba60879f`) prints `1`, `0`, `2` |
| U12-2 | 🟢 | `0`, `2`, `15`, `1`, `1`, `3`, `3` | `, UI-widget \`uw-\`` removed from a copy (not run by builder): `14`, `1`, `0`, as the plan says |
| U12-3 | 🟢 | `2`, `2`, `2`; the two lines are `type-scale/SKILL.md:40` and `type-scale/references/foundations.md:52`, both naming the thirteen | fixture `every voice rides the uniform SM/MD/LG ramp` appended to the grep output: `3`, `2`, `2`; appended for real to `plugin/.../references/prose.md` then restored: `3`, `2`; `Thirteen` deleted from `foundations.md:52` then restored: `2`, `1`, `2` (none run by builder) |
| U12-4 | 🟢 | `0`, `1`, `1`, `1`, `1` | KB cell typed `4130.3` then restored (not run by builder): `STALE ui.html: baseline 4130.3 KB, tree 4137.0 KB`, `stale total: 1` |
| U12-5 | 🟢 | `branding: clean (957 files scanned)`, `em-dash: clean (965 files scanned)` (the builder's 956/964 predate its handoff file), added U+2014 lines `0`; P6 added ids `0` against both `ba60879f` and `adf300e2`; builder's `npm test`: `all 54 test files passed`, status `0` | P6 filter: `+the rule (TKT-0008)` prints `1`, `+since 2026-07-16 the two` prints `0` |

## The class, not just the lines

| Check | State | Evidence | Negative control |
|---|---|---|---|
| Rewritten lines true of `src/engine/type.mjs` | 🟢 | `SIZES` holds nine three-entry rows and two six-entry rows (`UI-control` `[12, 13, 15, 16, 18, 20]`, `UI-widget` `[9, 10, 11, 12, 13, 14]`); `makeVoices()` returns 15, 13 on three steps, 2 on six; the four mono aliases (Body-mono, Label-mono, Kicker, Tiny-mono) make 9 + 4 = 13; `TYPE_TREATMENTS` length `5`; knobs `o.ucLead/ucWeight/ucTrack` and `o.uwLead/uwWeight/uwTrack` at `type.mjs:120-121` | the pre-edit text (`[SM, MD, LG] px triplet per voice-scale`, `every voice now rides`) is false of the same table |
| The history the past tense claims | 🟢 | `type.mjs` at `4bf3dc52` (last 2026-07-13 commit): nine rows, 13 `cat(` voices; at `4ddd76f9` (#310, 2026-07-16) UI-control `[13, 15, 16]` and UI-widget `[10, 11, 12]`; at `de1873bb` (#311, same day) the six-entry rows. So "the 2026-07-13 table put thirteen voices on a three-step row" and "the 2026-07-16 extension moved UI-control and UI-widget to the six-step row" are both accurate | a claim that the interactive voices existed on 2026-07-13 would fail: they are absent at `4bf3dc52` |
| No present-tense uniform ramp claim under `.claude` or `plugin` | 🟢 | wider sweep `SM ?/ ?MD ?/ ?LG\|SM · MD · LG\|3-step\|three-step\|triplet\|every voice\|all voices\|each voice`: every hit is true or scoped. `best-practices.md:13` `every voice's SM/MD/LG is a literal px value` holds (the six-step rows contain SM, MD, LG); `foundations.md:73` and `best-practices.md:70` speak of alias triplets; `prose.md:21` scopes to prose voices and names the six-step pair; the consumer `typography-tokens` table lists xs..2xl for the two UI voices | the U12-3 needle stays the gate; these wordings sit outside it and were read by hand |
| Handoff records each leg and names its head | 🟢 | `.sdlc/handoffs/prompt-audit-U12.md` quotes every leg at `3a03c8e4`, says the handoff commit follows, lists the controls it did not run | those controls are now run above |

## Findings

| Severity | Finding |
|---|---|
| Low (no action) | `best-practices.md:110` "a literal three-entry `SM · MD · LG` row per voice" is loose by the alias count (nine rows shared by thirteen voices); `foundations.md:101-102` states the nine-plus-aliases split precisely, so the sibling file carries the exact form. Not an engine-fact error. |
