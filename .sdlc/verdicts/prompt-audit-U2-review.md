PASS

# prompt-audit U2 review, pass 1 · #758

Reviewer-l3, fresh context. Reviewed `unit/pa-U2` at 5da7ea11 (code head 3d610264) against `plan/prompt-audit` 122b97b5: the U2 line, U2-1 to U2-5, and revision rows 5 (N2) and 6. Read only in the worktree; every control ran in a `git clone --shared` under the reviewer's job tmp. R66 held: no npm test, build, smoke or timing run.

## Criteria

| Id | Result | Reviewer evidence |
|---|---|---|
| U2-1 | 🟢 | `grep -c` `ninety` `4`, `README.md` `2`, `VOICE_PARITY_SKILL_DIR` `2`; `voice-parity PASS ... (15 voices; ...)`, exit 0. Retro control repeated: the skill and README from 8f5c6dc0 via `git archive`, the head script pointed at them: `✗ SKILL.md: thirteen-role, voice count drift, engine has 15`, `✗ ../../README.md: eleven-role, ...`, `voice-parity FAIL` |
| U2-2 | 🟢 | both wrappers print `5` `control ok` lines; needle grep `3`. Controls repeated: the doc-side `sed` names `**UI-control**` and `**UI-widget**` (`steps drift`); `"UI-widget"` cut to `[9, 10, 11]` in `type.mjs` names `**UI-widget** ... engine's steps ... are sm/md/lg` |
| U2-3 | 🟢 | `tonal.js` flipped to `"fixed"`: `✗ SKILL.md: default, \`onColorMode: contrast\`, onColorMode default drift, the engine default is fixed`. The deleted-sentence, `auto` and README legs run in-suite and print their lines |
| U2-4 | 🟢 | `0`, `0` on both scripts |
| U2-5 | 🟡 | npm test owed under R66, as the handoff says; the diff adds no test file |
| Rev 5 N2 | 🟢 | `Label`'s box flag flipped to `true`: exit 1, both fixed-shape statements named (`box-voice set drift, the skill names kicker/ui-control/ui-widget but the engine emits -line-single for kicker/label/ui-control/ui-widget`). Doc side, reviewer-added: `Label` added to responsive.md's list reds; SKILL.md's statement reworded out of shape reds with `no box-voice statement in the fixed shape`. The `ui + mono roles` comment is corrected and true against `type.mjs:111-114` (Label, Body-mono, Label-mono pass `box` false) |
| Wall | 🟢 | the diff touches `voice-parity.mjs`, `role-parity.mjs`, the two `test/plugin/` wrappers and the handoff, nothing else. `em-dash: clean`, `branding: clean` |

All the pins read the engine (`typeScale`, `DEFAULT_CONTROLS`, `DOMAINS`), not the prose. Each new pin fails when its needle is missing: a missing Steps row, a missing default statement or a missing box statement is a FAIL. Each wrapper runs the unmodified copy before any fixture leg.

## Findings

| Sev | Where | Finding |
|---|---|---|
| Low | `plugin/ultimate-tokens/skills/typography-tokens/scripts/voice-parity.mjs:132-148` | The new box-set comment and code were inserted between the existing "POSITIVELY ASSOCIATED ... within ~240 chars" comment (132-136) and the `near` code it describes (149). A reader now takes 132-136 as the doc for the box-set block. Move the box block and its comment above 132, or below the `near` loop |
| Low | `voice-parity.mjs:90` (count regex), plan grammar | `<word>[-\s]+voices?` does not read a count with an adjective or markup between the word and `voices`. U1's parent line 20, `thirteen named **voices**`, is the T1 wording, and the retro control reds only through `thirteen-role` on line 8, not through that line. The head prose uses `fifteen-voice`, so nothing drifts today. This follows the plan's grammar, so it is a plan note and not a builder defect |
| Low | `voice-parity.mjs:140-148` | The box pin reads the first fixed-shape statement in two files. The skill states the set in other places that stay unpinned: `SKILL.md:99` (`**UI-control, UI-widget, and Kicker**`) and responsive.md's second naming. A drift in one of those passes the new leg (the looser `near` check still runs) |
| Nit | `voice-parity.mjs:90` | Following the plan, `\s+role` also reads bare `<number> role`. A future `each voice has one role` would red as a false voice-count drift. No such phrase exists today |
| Nit | `test/plugin/typography-tokens.mjs` kicker leg | The row filter has no needle-missing guard like `edit()`. If the row's casing changed, the base-equal copy would exit 0 and the leg would fail as "did not exit 1". That failure is still loud, so the cost is a less helpful message |

None of these blocks the unit. The first Low is a small fix that could go into the same unit if another pass happens for any other reason.
