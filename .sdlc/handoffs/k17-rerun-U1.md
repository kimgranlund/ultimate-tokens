---
kind: handoff
plan: k17-rerun
unit: U1
branch: unit/k17-U1
written: 2026-09-19
pass: 1
---

# U1 handoff: A2 verdict title, pass 6 K17 rerun claim

measured at c2c7a1fe

## Files

- `.sdlc/verdicts/architecture.md`: line 1 only, the title, per the plan's Texts section.

## Block K17, own run at c2c7a1fe

- Framework half (`git grep -nE 'from "(vitest|jest|mocha|node:test|uvu|ava)"' -- test`): no output, 0 hits.
- Registration half before the filter: 7 names,
  `gate-report.mjs`, `repo/fixtures/gate-report-clean.mjs`, `repo/fixtures/gate-report-mismatch.mjs`,
  `repo/fixtures/gate-report-singlequote.mjs`, `run.mjs`, `smoke/smoke.mjs`, `ui/counts.mjs`.
- Filter lifted from the map's own K17 cell (`CF=` line, not retyped): `grep -vxE "run.mjs|smoke/smoke.mjs|ui/counts.mjs|gate-report.mjs|repo/fixtures/gate-report-(clean|mismatch|singlequote).mjs"`.
- After the filter: 0 lines.
- Result: 7 before the filter, 0 after.

## Plant, own run in a throwaway shared clone

`git clone -q --shared . "$CLAUDE_JOB_DIR/tmp/plant-clone"` (the plan's `$CLAUDE_JOB_DIR/tmp` existed; used
directly, no substitute path needed). In the clone: appended `import test from "node:test";` to
`test/engine/hct.mjs` and added a new tracked `test/engine/zzz.mjs` with no framework import in it.

own plant: import appended to test/engine/hct.mjs plus new tracked test/engine/zzz.mjs, 2 hits total, 1 on the
framework half (`test/engine/hct.mjs:172:import test from "node:test";`), 1 on the registration half
(`engine/zzz.mjs`). Matches the map's bite cell (2). Clone deleted after.

## Title diff

Old line 1:
```
# Verdict A2 architecture · pass 4 · 🟢
```

New line 1:
```
# Verdict A2 architecture · pass 6 · 🟢 18 of 18 (pass 5: 17 of 18, K17 🔴; pass 6 reruns K17)
```

## Ran

- Block K17 as above: matches the plan's expected values at this head (nothing from the first three
  lines, then `7`).
- U1-4: `0` then `5 17`, expected, since pass 6 does not exist yet (the verifier appends it next).
- U1-6: `1`, `0`, only deletion against the merge base is the old title line.
- U1-7 (this handoff, self-checked before commit): `0` (a sha is present, `test/` and the map match
  this head), `1` (the registration-half count line present once), `1` (the post-filter count line
  present once), `1` (a `plant ... N hits` line is present, not just the bare word).
- P1 `npm test`: `all 48 test files passed`; `git status --short` after shows exactly the two
  intended files (the edited verdict line, this new handoff), no generator drift.
- P4 branding: `branding: clean (465 files scanned)`, exit 0.
- P5 scope wall: `0`, only this handoff and the verdict title line differ from the merge base.

## Left out

- Nothing in the builder's division of labour was skipped. No fix attempted on the K17 control:
  the post-filter count is clean at this head, so the row stays 🟢 and the unit does not return as
  a question.
- No edit to the map, no other line of any file under `.sdlc/verdicts/`, no file outside the two
  named in scope.
