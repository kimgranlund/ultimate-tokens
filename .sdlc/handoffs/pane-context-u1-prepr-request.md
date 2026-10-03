# Pre-land request: pane-context U1 split out (PR #790)

| Field | Value |
|---|---|
| Branch | plan/pane-context-u1 @ a5e0bf2dd49b50157efc34e45c4b50b33b3b9bdc (cut from origin/main a6eed831, the U1 merge b1579ec2, then the baseline figure repair a5e0bf2d for pass 1 red) |
| PR | #790 (draft), ticket #785 |
| Scope | the whole diff `origin/main...plan/pane-context-u1`: 4 files, `src/ui/app.js`, `src/ui/sections/color.js`, `test/ui/headless-boot.mjs`, `figma/plugin/ui.html` |
| Criteria | C1.1 to C1.5 in `git show plan/pane-context:.sdlc/plans/pane-context.md`; unit verdict `.sdlc/verdicts/pane-context-U1.md` 🟢 at d233cf4c |
| Record to write | `.sdlc/verdicts/pane-context-u1-prepr.md` with `sha: a5e0bf2dd49b50157efc34e45c4b50b33b3b9bdc` (pass 2) |
| Pair | reviewer-l3 plus verifier-l2 (R86/R92, no Fable); name the substitution in the record header |
| Why | the owner asked to land U1 alone to preview it; U2 to U4 stay on plan/pane-context |
| Baseline gates | npm test, npm ci and npm run build on this head; CI legs are the Conductor's |
