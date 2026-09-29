# Handoff prompt-audit U2 · #758 consumer plugin pins

Builder, pass 1. Code head 3d610264 on `unit/pa-U2` (cut from `plan/prompt-audit` at 122b97b5); this handoff is committed on top. Four files changed, all inside U2's wall: `voice-parity.mjs`, `role-parity.mjs`, `test/plugin/typography-tokens.mjs`, `test/plugin/color-tokens.mjs`. No prose file touched (no `<number> voices` subset phrase tripped the new gate, so U2-1's subset clause needed no edit).

## Gates

| Gate | Result |
|---|---|
| npm test | 🟡 owed: heavy slot held by R66, to run before the verdict |
| `node test/plugin/typography-tokens.mjs` | 🟢 exit 0, five `control ok` lines |
| `node test/plugin/color-tokens.mjs` | 🟢 exit 0, five `control ok` lines |
| `node test/repo/em-dash.mjs` | 🟢 clean (813 files) |
| `node test/repo/branding.mjs` | 🟢 clean (805 files) |

## Criteria

Positive commands ran in the worktree at 3d610264. Controls ran in throwaway clones under the job scratch directory (`$F/neg`: clone with U1's parent prose, 8f5c6dc0; `$F/pos`: clone at the head with one edit reset between runs). No control touched the worktree.

| Id | Result | Head output | Control output |
|---|---|---|---|
| U1-13 leg, revision 5 N2 | 🟢 | the new box-set leg passes at the head | in `$F/pos`, `Label`'s `box` flipped to `true` in `type.mjs`: `voice-parity` exit 1, `✗ SKILL.md: ... box-voice set drift, the skill names kicker/ui-control/ui-widget but the engine emits -line-single for kicker/label/ui-control/ui-widget`, and the same for `references/responsive.md` |
| U2-1 | 🟢 | `grep -c` for `ninety`, `README.md`, `VOICE_PARITY_SKILL_DIR`: `4`, `2`, `2`; pass line `voice-parity PASS, every type token/class in 6 files matches the engine (15 voices; -line-single voices verified)`, exit 0 | retro, `VOICE_PARITY_SKILL_DIR` at U1's parent prose: exit 1, `✗ SKILL.md: thirteen-role, voice count drift, engine has 15` and `✗ ../../README.md: eleven-role, voice count drift, engine has 15`, plus a missing Steps row for every voice |
| U2-2 | 🟢 | wrapper exit 0, `5` control lines, `grep -c` needle `3`; per-voice step check and Steps column live | doc side: the Steps `sed` on both interactive rows exits 1 naming `**UI-control**` and `**UI-widget**` (`steps drift`); source side: `"UI-widget"` cut to `[9, 10, 11]` in `type.mjs` exits 1 (`**UI-widget** Steps "xs/sm/md/lg/xl/2xl", steps drift, ... are sm/md/lg`); `test/engine/type.mjs` not run (R66) |
| U2-3 | 🟢 | `DEFAULT_CONTROLS` `1`, `DOMAINS` `2`, `onColorMode` `9`; wrapper exit 0, `5` control lines | engine side: `tonal.js` default flipped to `"fixed"`: exit 1, `default, onColorMode: contrast, onColorMode default drift, the engine default is fixed`; doc side: SKILL.md flipped to `fixed`: exit 1 (`the engine default is contrast`); the deleted-sentence and `onColorMode: auto` legs are fixture legs 3 and 5 (below) |
| U2-4 | 🟢 | `grep -c` comparisons against `15\|13\|16\|53`: `0`, `0` | a fixture line `if (n !== 15) {}` through the same needle prints `1` |
| U2-5 | 🟡 | `git status` after the plugin wrappers is clean of generated drift; N unchanged (no file added or registered) | npm test owed: heavy slot held by R66, to run before the verdict |

The nine new fixture legs, each an exit-1 assertion plus a named stderr pattern, with the unmodified copy asserted to pass first (so no leg reds for an unrelated reason):

| Wrapper | Leg output line (quoted) | Named error asserted |
|---|---|---|
| typography | `control ok: voice-parity reds on a stale count word (thirteen voices)` | `thirteen`, `voice count drift` |
| typography | `control ok: voice-parity reds on a magnitude count word (hundred voices)` | `hundred`, `outside the range` |
| typography | `control ok: voice-parity reds on a step outside its own voice (--type-body-xl-size)` | `--type-body-xl-size`, `not a step of voice "body"` |
| typography | `control ok: voice-parity reds on a wrong Steps cell (ui-control saying sm/md/lg)` | `UI-control`, `steps drift` |
| typography | `control ok: voice-parity reds on a voice table missing the kicker row` | `kicker`, `no row with a Steps cell` |
| color | `control ok: role-parity reds on an unresolvable count word (hundred palettes)` (the pre-existing leg, now with its own line) | `hundred`, `outside the range` |
| color | `control ok: role-parity reds on a wrong on-colour default (default, onColorMode: fixed)` | `onColorMode`, `default drift` |
| color | `control ok: role-parity reds on no on-colour default statement` | `onColorMode`, `exactly one` |
| color | `control ok: role-parity reds on a README role count (the 59-role semantic layer)` | `59-role`, `role count drift` |
| color | `control ok: role-parity reds on an illegal on-colour value (onColorMode: auto)` | `auto`, `DOMAINS` |

## What changed

| Item | Where | Note |
|---|---|---|
| count parser | `voice-parity.mjs` | `parseNumWord` in role-parity's shape, one to ninety-nine, magnitude words fail loudly; applied to `<word>[-\s]+(voices?\|role)`, which covers `fifteen-voice` and `fifteen-role` |
| README scanned | both scripts | `SKILL_DIR/../../README.md` joins the file list when it exists |
| per-voice steps | `voice-parity.mjs` | a token or class step is checked against its own voice's steps; the union check stays for the unknown-step message |
| Steps column | `voice-parity.mjs` | every `**<voice>**` row in a table headed `Steps` equals the engine's steps; every engine voice must have such a row |
| box set (N2) | `voice-parity.mjs` | reads the two fixed-shape box statements (SKILL.md ``` `line-single` on the box voices, A/B/C, only ``` and responsive.md `BOX voices, **A, B, and C**`) and requires each to equal the engine's single-line voices; a missing statement is a FAIL. The stale `ui + mono roles` comment now says box voices, by the box flag |
| hook | `voice-parity.mjs` | `VOICE_PARITY_SKILL_DIR`, mirroring `ROLE_PARITY_SKILL_DIR` |
| on-colour | `role-parity.mjs` | default read from `DEFAULT_CONTROLS`, legal values from `DOMAINS.onColorMode.values`, behind the same `existsSync` guard; exactly one ``default, `onColorMode: <v>` `` match, and every named value must be legal |

## Left out

| Item | Why |
|---|---|
| a sixth fixture leg for the box set | U2-2 counts exactly five control lines; the box leg's control is the clone flip above |
| rows with a bold voice first cell in a table with no `Steps` header | ignored, so other tables cannot red; deleting the column or a row still reds through the every-voice-required rule |
| npm test | owed: heavy slot held by R66, to run before the verdict |
