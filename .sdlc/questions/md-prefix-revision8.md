# Question md-prefix revision 8 · from orchestrator

| Field | Value |
|---|---|
| Blocks | PR #795 landing; the plan is at revision 7, past the cap of 5 (revision 7 was the 0.2.2 ruling) |
| Evidence | `.sdlc/verdicts/md-prefix-prepr.md` pass 2, 🔴 at `e8a8be11`: F1 the 0.2.2 manifest description says `eleven-voice` where the README, the typography skill and the engine say fifteen; F2 the CHANGELOG 0.2.2 line understates a first publish since 0.2.1 that carries 22 plugin commits, the breaking #792 prime rename among them |
| Why now | npm versions are immutable: landing publishes `@ultimate-tokens/claude@0.2.2` with the wrong description, and only a 0.2.3 repairs it |
| Question | May the plan take revision 8: U3 pass 2 (builder-l3) fixes the description count and rewrites the CHANGELOG 0.2.2 line to name the prime rename and the plugin commits since 0.2.1, same two files, then pre-land pass 3 at the new head? |
| Options | A (recommended): yes, both findings · B: fix F1 only, record F2 as a deliberate omission · C: no, land at 0.2.2 as is and ship 0.2.3 later |
| Diagnosis | none separately: the pre-land record states cause and fix for both findings, and no workaround has been tried |
| Default if unanswered | none: a revision past the cap needs the owner |

## Answer

| Field | Value |
|---|---|
| Asked | 2026-10-03, via AskUserQuestion |
| Chosen | A: "Fix both (Recommended)" |
| Ruling | revision 8: U3 pass 2 fixes the description count and the CHANGELOG 0.2.2 line, then pre-land pass 3 at the new head |
