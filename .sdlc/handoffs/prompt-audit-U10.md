# prompt-audit U10 handoff, pass 1

| Row | State | Evidence | Control |
|---|---|---|---|
| U10-1 | 🟢 | fixture with `## The fourteen roles`: stderr `✗ SKILL.md: fourteen roles, voice count drift, engine has 15`, `exit 1`. Unmodified copy: `voice-parity PASS ... (15 voices ...)`, `exit 0` | in Evidence |
| U10-2 | 🟢 | `It gives fourteen named **voices**.`: stderr `✗ SKILL.md: fourteen named **voices, voice count drift, engine has 15`, `exit 1` | in Evidence |
| U10-3 | 🟢 | `Label` added to the second box statement (`box-text voices, **...**`): stderr `box-voice set drift, the skill names kicker/label/ui-control/ui-widget but the engine emits -line-single for kicker/ui-control/ui-widget`, `exit 1`. The f6cd69cb voice-parity on the same fixture: `voice-parity PASS`, `exit 0` | in Evidence |
| U10-4 | 🟢 | `node test/plugin/typography-tokens.mjs`: `exit 0`, needle count `8`. Control: the f6cd69cb voice-parity under the new wrapper prints `plugin FAIL: voice-parity did not exit 1 on a count heading naming roles (## The fourteen roles) (exit 0)`, exit 1 | in Evidence |
| U10-5 | 🟢 | `grep -c -E 'sub-heading\|Heading-Kicker'` prints `0`; the file at f6cd69cb prints `2` | in Evidence |
| U10-6 | 🟢 | `npm test`: `all 53 test files passed`, exit 0; N unchanged, no test file added | in Evidence |

New pass lines: `control ok: voice-parity reds on a count heading naming roles (## The fourteen roles)`, `control ok: voice-parity reds on a qualified count word (fourteen named voices)`, `control ok: voice-parity reds on a drifted second box-voice statement (Label added)`. Real skill files: `voice-parity PASS, every type token/class in 6 files matches the engine (15 voices; -line-single voices verified)`.

## Notes for the orchestrator

- The count grammar takes an allowlisted qualifier between number and noun (`named|distinct|separate|different|total|typographic|type`) plus optional `**` before the noun. A free word was tried first and reddened five true subset phrases in the real files (`two interactive voices`, `Five family roles`, `one per voice`), so it is an allowlist by measurement.
- The box leg now runs three (file, shape) pairs, each reading every match: SKILL.md `on the box voices, ..., only`, SKILL.md `box-text voices, **...**` (the second statement), responsive.md `BOX voices, **...**`. Each pair still fails when its shape is absent.
- Comments: POSITIVELY ASSOCIATED block moved above `near`; `:19` names Headline/Title/Kicker; the stale Heading-Kicker example now says Kicker.
