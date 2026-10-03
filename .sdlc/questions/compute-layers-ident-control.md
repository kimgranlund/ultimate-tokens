# Question compute-layers U3 · from orchestrator

| Field | Value |
|---|---|
| Blocks | compute-layers plan revision 5 (a sixth revision row, past the cap of 5); cl-U3 and cl-U5 criteria |
| Evidence | `.sdlc/verdicts/compute-layers-U1.md` Finding 1: `IDENT` renders both sides from the base-hydrated doc, so a wrong `resolveControls` default never reaches it; C1.4's own control cannot go nonzero. C3.3 and C5.6 say "as C1.4" and inherit the dead control. |
| Proposed text | C3.3 and C5.6 control column becomes: "add `* 1.05` to the chroma `compute(doc)` returns for the default kit (C3.3) or to `ramp@2`'s output (C5.6): `IDENT --only default-kit` prints `117 differing cells`, the verifier's own control from the U1 pass". The `resolveControls` default stays pinned by C1.2 in `npm test`. No new criteria, no engine work. |
| Question | May the plan take revision 5 with that one-line control rewrite of C3.3 and C5.6? |
| Options | A (recommended): yes, revision 5 as above; the Verifier runs a checkability pass before cl-U3 is cut. · B: no, leave "as C1.4"; C1.2 pins the default and C3.3 and C5.6 stay met as written with a known-dead control |
| Default if unanswered | none: a revision past the cap needs the owner |

## Answer

| Field | Value |
|---|---|
| Asked | 2026-10-03, via AskUserQuestion |
| Chosen | Allow revision 5 (Recommended), option A |
| Ruling | revision 5 as proposed; the Verifier runs a checkability pass before cl-U3 is cut |
