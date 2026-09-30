# gates-batch U2 handoff (pass 1)

Branch `unit/gb-U2` (cut from `plan/gates-batch` @ ddeddfbd, U1 merged). Builder: gb-U2, grade L4.

## Files

| File | Change |
|---|---|
| `test/repo/citations.mjs` | leg (4c): `noun` on five count pins, `allow` (reasoned) on `skill type voices`, whole-skill-directory reach for skill pins, number grammar one to ninety-nine with loud magnitude refusal, `COUNT_PHRASE_FLOOR = 25`, pass line gains `+ 35 count phrases` |
| `src/engine/type.mjs` | three ramp comments reworded to the split (13 x 3, UI-control and UI-widget x 6); comments only |
| `src/ui/sections/typography.js` | four stale-voice comments now say fifteen voices, 51 steps; comments only |
| `.claude/skills/adding-export-formats/references/best-practices.md` | line 20 "the other seven formats" to "the other formats" (the scan's one real stale count on the clean tree; the sentence was ambiguous, so reworded rather than allowed) |
| `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js` | regenerated committed assets (`npm test` gen step embeds the edited source) |

## Criteria

| Row | Result | Evidence |
|---|---|---|
| U2-1 | 🟢 | `✓ citations: parser self-test + STALE 0 across 10 discovered docs + 11 fact pins + 35 count phrases`, exit 0 |
| U2-2 | 🟢 | plant `eight colour formats` in adding-export-formats SKILL.md: `✗ ... line 160: eight colour formats but the code holds 10`, exit 1 |
| U2-3 | 🟢 | plant `Eight voices ride the ramp.` in type-scale SKILL.md: `✗ ... line 107: Eight voices`, exit 1 |
| U2-4 | 🟢 | plant `fourteen voices` in `references/foundations.md`: `✗` naming that file, exit 1 |
| U2-5 | 🟢 | allow rows are `thirteen voices`, `13 voices`, `five voices`, each with a reason; removing `thirteen voices` reds `references/best-practices.md`, `references/foundations.md` (and `SKILL.md` for `13 voices`); emptying a reason reds `allow entry without a phrase + reason` |
| U2-6 | 🟢 | `hundred voices`: `✗ ... hundred is outside the parser's range`; `two interactive voices`: no `✗` |
| U2-7 | 🟢 | flipping `ten colour formats` to `eight`: `doc no longer carries` plus the phrase `✗` lines, exit 1 |
| U2-8 | 🟢 | `COUNT_PHRASE_FLOOR = 25` (35 read, so at most 30); emptying every `noun`: `only 0 read, below COUNT_PHRASE_FLOOR 25` |
| U2-9 | 🟢 | stale-phrase grep `0`; split-wording grep `4` |
| U2-10 | 🟢 | C5: name list `src/engine/type.mjs src/ui/sections/typography.js`, comment-stripped diffs `0` and `0` |
| U2-11 | 🟢 | `symbol homes: 37 checked, 0 stale` (U1-6 reading unchanged); bare-literal guard and BARE_EXEMPT legs still run in the same gate |
| U2-12 | 🟢 | stale grep `0`, fifteen/51 grep `3` |

12 green, 0 red.

## Ran

| Check | Result |
|---|---|
| `npm test` | `✓ all 54 test files passed` (rerun after rework 1); tree clean after |
| C3, C4 | `test/run.mjs`, `.sdlc/baseline.md`, tonal/hct/okhsl/model/test/engine untouched |
| C6 | `node scripts/report-preset-fidelity.mjs --identity-control --base <merge-base>`: `0 differing cells` |
| C2 | `em-dash: clean` |

## Rework pass 1 (reviewer-l3 FAIL @ bca0a33a)

| # | Result | Change |
|---|---|---|
| 1 | 🟢 | each `noun` pin must read at least one phrase, else `count phrases: fact pin "<id>" read 0 phrases`; total floor kept. Negative control per pin (noun misspelled to `zz<noun>`): `type voices`, `colour formats`, `roles per palette`, `skill type voices`, `skill colour formats` each red naming that pin. The reviewer's repro (misspelled `skill colour formats` noun plus a planted `eight colour formats`) now reds. |
| 2 | 🟡 declared | the plan's U2 design fixes the singular as outside the grammar and names `roles?` as that pin's noun, so singular handling stays as specified; `roles?` reading `a 53-role` and a qualifier outside `named/colour/color/semantic/export` (`14 type voices`) not being read are declared in the code comment and here, not widened |
| 3, 4 | no change | as instructed; finding 4 (typography.js:672, :1002-1003, :1012 say eleven/11 voices) is for the Orchestrator's follow-up issue |

## Left out

- `.sdlc/board.md`; no question file needed.
- The scan reads only plural nouns and numbers directly before them (per the plan grammar); `one voice`, `two interactive voices`, `13 voices x 3` continuation forms are outside or allowed.
- The one real stale count found was the "other seven formats" sentence; a fifteen-voices phrase in adding-export-formats stays out of the voices pin's reach, as the plan states (P5).
