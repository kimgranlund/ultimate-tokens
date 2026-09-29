# Handoff: anchor-gaps U4

| Field | Value |
|---|---|
| Branch | `unit/ag-U4` (off `plan/anchor-gaps` at 87e633cd), head in the reply |
| Files | `CHANGELOG.md`, `.sdlc/handoffs/anchor-gaps-U3.md`, this file. `npm test` rewrote no generated file |
| Ran | `npm test`: `✓ all 54 test files passed`, exit 0, `git status --short` empty before this commit |
| Date block | no `### 2026-09-29` block existed under Unreleased, so the `### 2026-09-26` block was re-dated in place |
| Baseline | `baseline-agrees-check.sh` reads ui.html 4141.3 KB baseline and tree, so `.sdlc/baseline.md` is unchanged; U3 handoff Left out line now reads 4141.3 |
| U4-1 | `0`; control: 221c1e57 prints `1` |
| U4-2 | `1`; control: the same count with the `pre-#681` lines removed prints `0` |
| U4-3 | `1` and `0`; control: 221c1e57 has one `2026-09-26` |
| U4-4 | `0` files outside the allowed set (only `CHANGELOG.md` outside `.sdlc/`); control not run, a `src/ui/app.js` touch would print `1` by construction |
| U4-5 | green, tree clean; control: a U+2014 appended to `CHANGELOG.md` makes `test/repo/em-dash.mjs` exit 1, then reverted |
| Left out | `npm run build`, `npm run smoke` (pre-land pass 3 reruns them) |
