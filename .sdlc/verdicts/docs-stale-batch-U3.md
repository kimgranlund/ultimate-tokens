---
kind: verdict
plan: docs-stale-batch
unit: U3
ticket: "#779"
branch: unit/dsb-U3
base: 30f7ba10
grade: verifier-l2 (opus) per R79; the builder was builder-l1 (sonnet), so the checker sits outside the builder's family; evidence run docs-stale-batch-U3-verifier-l2-p1, spot-checked by the Verifier seat
pass: 1
written: 2026-09-30
---

# Verdict docs-stale-batch U3 · 🟡 · both generator headers name gen:figma-assets truthfully and the assets carry it; the handoff ledger lacks its condition row and two P rows have plan defects

verdict: 🟡
sha: 756f4163c969357d529dddb1b693bbd7bc6ab982

This grades the unit against `.sdlc/plans/docs-stale-batch.md` as committed on the branch (identical to the root copy). The unit's base is `plan/docs-stale-batch` at `30f7ba10`; `git merge-base origin/main HEAD` is `17edb2d2`, which also carries U2's merged work. The code commit is `1bff0594`. Controls ran in throwaway clones at `756f4163`. I spot-checked U3-1 (head `0` `0`, base `1` `1`), the header greps and U3-4 (`0`) in the unit worktree myself; the tree stayed clean (`git status --short` `0`).

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U3-1 | 🟢 | the grep loop reads `0` `0` at head (seat-reproduced); `grep -c gen:figma-assets` reads `1` in each header | the base `30f7ba10` reads `1` `1` (seat-reproduced); a planted `// via the gen:figma-binder-code script` reads `1` `0` |
| U3-2 | 🟢 | the probe prints `true true node scripts/gen-figma-binder-code.mjs` | in a clone, `test` edited to call `npm run gen:figma-binder-code` prints `false true ...` |
| U3-3 | 🟢 | `src/ui/figma-plugin-assets.js:0`, `figma/plugin/ui.html:0`, `git status --porcelain \| wc -l` reads `0` | both assets reverted to `30f7ba10` and committed read `:1` `:1`; the asset chain then reproduces the `756f4163` bytes exactly (`git diff --quiet 756f4163 --`) |
| U3-4 | 🟢 | `node scripts/gen-figma-binder-code.mjs >/dev/null && git status --porcelain -uno \| wc -l` reads `0` (seat-reproduced) | a stale line planted above `// === GENERATED:FLOAT_EXECUTOR END ===` and committed reads `1` |
| P1 | 🟢 | clone at `756f4163`, no `node_modules`: exit `0`, `✓ all 54 test files passed`, 125 s, tree clean after | `"scrim` to `"scrimX`: `node test/engine/semantic.mjs` exit `1`, `FAIL  refs-canonical` (one full suite only, per the heavy-suite cap) |
| P2 | 🟡 | `em-dash: clean (1018 files scanned)` / `branding: clean (1010 files scanned)` | a U+2014 planted in the handoff: `em-dash.mjs` exit `1` naming the file; see finding 1 |
| P3 | 🟡 | with escapes removed as the plan says: `7` rows, `7 ok`, `1`, `1` | needle edited to `zzqxnotthere`: `1 MISS zzqxnotthere`; `~~~sh ran` deleted: `0`; see findings 2 and 3 |
| P4 | 🟢 | the ran block replayed at its named head `1bff0594` prints `SAME`; at `756f4163` only the sha line differs, since `1bff0594..756f4163` touches only the handoff and review | replayed at base `30f7ba10`: sha, U3-1 `1` `1` and U3-3 `:1` differ, `diff` exit `1` |
| P5 | 🟢 | U3 does not claim the trivial lane; `git diff --name-only 30f7ba10..HEAD \| grep -v '\.md$'` lists four non-`.md` paths | the same filter over the `.md`-only span `1bff0594..HEAD` reads `0` |
| P6 | 🟢 | not required for U3 (no `src/engine/` or `model.mjs` path); run anyway: `0 differing cells` against both `30f7ba10` and `17edb2d2` | `--perturb` reads `1 differing cells` |

## Findings

1. **P2 (plan defect).** The committed P2 cell is complete. Each gate's last line ends in a file count that grows with every record, so the handoff's ran block appends `cut -d' ' -f1-2` to keep `em-dash: clean` / `branding: clean`. That is a faithful workaround. The plan should say only the leading words are compared in a replayed block.
2. **P3 (plan defect).** Run with the escapes left literal, `(Claim\|---)` excludes nothing, so the ledger's header row is the eighth line. It prints no tally line, so only `wc -l` is off by one. P3 also expects "the row count the unit states", and the handoff states none.
3. **P3 (unit record gap).** The plan's U3 steps and the U3-1 cell call for a `condition` ledger row for U3-2. The ledger has none: its stand-in is a `present` row, `node scripts/gen-figma-binder-code.mjs` in `package.json`, which the standalone `gen:figma-binder-code` script also satisfies, so the row does not prove the "first command of gen:figma-assets" claim. Handoff Decision 1 describes an in-awk `condition` probe this ledger does not have (carried over from U2). The claim itself is proved by U3-2, so this is a record defect, not a code defect.
4. **P4 wording.** The P4 cell says "at the unit head" but the record-shape section says "at the named head". Every handoff committed after its code commit meets this. Read literally at `756f4163`, P4 fails only on the sha line.

Scratch the evidence run could not delete: `$CLAUDE_JOB_DIR/tmp/dsbu3` (clean clones at `756f4163`).
