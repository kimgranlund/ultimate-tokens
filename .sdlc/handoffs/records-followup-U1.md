# Handoff U1 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/rf-U1 @ 78f1c3e5, merged into plan/records-followup as 5361bc79 |
| Files | .sdlc/debt.md, .sdlc/architecture.md, .sdlc/adapter.md, .sdlc/baseline.md, .sdlc/handoffs/records-followup-U1.md |
| F3 measured count | 3, at d34b4fb1, matches the plan's number: throwaway clone, `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json`, `npm test` exit 1, `engine/semantic.mjs` FAIL, `refs-canonical` FAIL, `grep -c FAIL` = 3 |
| Ran | criterion 1-5 greps ✅ all match expected · `sh .sdlc/checks/baseline-agrees-check.sh` tail: `stale total: 0` ✅ |
| Criterion 6 | added-lines grep = 5 ✅; removed-lines grep = 4, not 5 (see Left out) |
| Left out | Criterion 6's removed-line count: the adapter.md edit sits inside a markdown bullet (`- The verifier's...`). A unified diff removal line is the diff `-` plus the bullet's own `-`, so it reads `-- The verifier...`, which the check's `grep -c '^-[^-]'` excludes by design (that pattern exists to skip `--- a/file` diff headers). All five lines changed and match their §Texts wording exactly; the four non-bulleted removals count normally and the fifth (adapter.md) is invisible to this specific grep only because of where the plan's own text places the edit inside an existing bullet, not because of any extra edit. Flagging for the Orchestrator/Verifier rather than rewording the bullet, since the contract says follow §Texts literally. |
