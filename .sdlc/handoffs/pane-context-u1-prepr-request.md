# Pre-land request: pane-context U1 split out (PR #790)

| Field | Value |
|---|---|
| Branch | plan/pane-context-u1 @ b1579ec27a1da2d02f7e6b8c3eff6967e5cf27c5 (cut from origin/main a6eed831, plus the U1 merge b1579ec2) |
| PR | #790 (draft), ticket #785 |
| Scope | the whole diff `origin/main...plan/pane-context-u1`: 4 files, `src/ui/app.js`, `src/ui/sections/color.js`, `test/ui/headless-boot.mjs`, `figma/plugin/ui.html` |
| Criteria | C1.1 to C1.5 in `git show plan/pane-context:.sdlc/plans/pane-context.md`; unit verdict `.sdlc/verdicts/pane-context-U1.md` 🟢 at d233cf4c |
| Record to write | `.sdlc/verdicts/pane-context-u1-prepr.md` with `sha: b1579ec27a1da2d02f7e6b8c3eff6967e5cf27c5` |
| Pair | reviewer-l3 plus verifier-l2 (R86/R92, no Fable); name the substitution in the record header |
| Why | the owner asked to land U1 alone to preview it; U2 to U4 stay on plan/pane-context |
| Baseline gates | npm test, npm ci and npm run build on this head; CI legs are the Conductor's |
