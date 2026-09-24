# Handoff U1 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/rp-U1 @ b6b5f0384f1dd0fec39f3fcfb6f58d6067ae7347 |
| Files | scripts/gen-adia-derived-exports.mjs (BUMP POLICY comment block only) |
| Ran | `npm test` ✅ · `node test/repo/branding.mjs` ✅ |
| Left out | U1-5 (cites this handoff's own review doc, which does not exist until the reviewer writes it) |

## Criteria

Unit rows use `B=$(git merge-base plan/records-policy HEAD)` = `0c3242e023492bfaa278677b49160cacbbe20ffc`, run in this worktree.

| Id | Command | Evidence | Expected | State | Negative control result |
|---|---|---|---|---|---|
| U1-1 | `T=$(mktemp); awk '/BUMP POLICY/,/DO NOT EDIT/' scripts/gen-adia-derived-exports.mjs \| grep -v 'DO NOT EDIT' > "$T"; grep -c '^//   minor' "$T"; grep -c 'engine change' "$T"; grep -c '#681' "$T"` | `1`, `1`, `1` | `1`, `1`, `1` | 🟢 | scratch clone with `scripts/gen-adia-derived-exports.mjs` restored from `origin/main`: `1`, `0`, `0` (matches plan) |
| U1-2 | `T=$(mktemp); awk '/BUMP POLICY/,/DO NOT EDIT/' scripts/gen-adia-derived-exports.mjs \| grep -v 'DO NOT EDIT' > "$T"; grep -c 'CONTRACT changed' "$T"; grep -c 'never whether a version' "$T"` | `1`, `1` | `1`, `1` | 🟢 | scratch clone with the closing two lines deleted: `0`, `0` (matches plan) |
| U1-3 | `B=$(git merge-base plan/records-policy HEAD); git diff "$B" -- scripts/gen-adia-derived-exports.mjs \| grep '^[-+]' \| grep -v '^[-+][-+]' \| grep -v -c '^[-+]//'` | `0` (read with U1-1's `1,1,1`, so the diff is not empty) | `0`, and U1-1 green in the same run | 🟢 | scratch clone with `version: "1.1.0"` bumped on one artifact row only: `2` (matches plan) |
| U1-4 | `diff <(git show origin/main:scripts/gen-adia-derived-exports.mjs \| grep -E '^//   (patch\|major\|Any change\|file is untouched\|docs/reference)') <(grep -E '^//   (patch\|major\|Any change\|file is untouched\|docs/reference)' scripts/gen-adia-derived-exports.mjs) \| wc -l` | `0` | `0` | 🟢 | scratch clone with the `major` line reworded: `4` (matches plan) |
| U1-5 | `grep -c 'plan/preset-intent-fidelity:scripts/gen-adia-derived-exports\.mjs:6[5-9]' .sdlc/verdicts/records-policy-U1-review.md; grep -c 'pif-u5\.md.*§3\.1\|§3\.1.*pif-u5\.md' .sdlc/verdicts/records-policy-U1-review.md` | not run | `1` or more, `1` or more | ⚪ | reviewer-owned: the file this criterion greps does not exist yet. The builder read `git show plan/preset-intent-fidelity:.sdlc/handoffs/pif-u5.md` §3.1 (line 76) and the same branch's `scripts/gen-adia-derived-exports.mjs` lines 65-69 before editing, per the plan's instruction |

## Plan-level (P) rows, run in this worktree for information; the pre-land verifier reruns these against origin/main

`B=$(git merge-base origin/main HEAD)` = `0c3242e023492bfaa278677b49160cacbbe20ffc`.

| Id | Command | Evidence | Expected | State | Negative control result |
|---|---|---|---|---|---|
| P1 | `npm test 2>&1 \| tail -1; git status --short \| wc -l` | `✓ all 48 test files passed`, `1` (the 1 line is this worktree's own uncommitted-at-run-time edit before commit; `0` after commit) | `✓ all N test files passed`, `0` | 🟢 | not rerun by the builder; plan's own recheck at 0478a9a6 already measured the parse-error control |
| P2 | `bash -c 'set -o pipefail; node test/repo/branding.mjs \| tail -1'; git diff "$B" \| grep -v '^+++ ' \| grep '^+' \| perl -CSD -ne 's/\`[^\`]*\`//g; print if /\x{2014}/' \| wc -l` | `branding: clean (546 files scanned)`, `0` | `branding: clean (N files scanned)`, `0` | 🟢 | not rerun; the added lines contain no U+2014 by inspection |
| P3 | `git diff --name-only "$B" \| grep -v -E -e '^scripts/gen-adia-derived-exports\.mjs$' -e '^docs/reference/references/decision-records\.md$' -e '^\.sdlc/records/cards/ADR-02[567]\.md$' -e '^\.sdlc/records/(index\|decisions)\.md$' -e '^\.sdlc/(plans\|handoffs\|verdicts\|questions)/records-policy' -e '^\.sdlc/board\.md$' \| wc -l; git diff --name-only "$B" -- src test docs/reference/data \| wc -l` | `0`, `0` | `0`, `0` | 🟢 | not rerun; only `scripts/gen-adia-derived-exports.mjs` and this handoff changed |
| P4 | `node scripts/gen-adia-derived-exports.mjs >/dev/null; git status --short -- docs/reference/data \| wc -l; git diff --stat "$B" -- docs/reference/data \| wc -l` | `0`, `0` | `0`, `0` | 🟢 | not rerun; the block is a comment, generator code path untouched |

All U1 rows and all P rows the builder can run without the review doc are green. `npm test` is green and the tree is clean after the commit; `node test/repo/branding.mjs` is clean.
