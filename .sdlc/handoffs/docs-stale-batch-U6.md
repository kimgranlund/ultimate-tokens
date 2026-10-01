# Handoff U6 pass 1 · builder to lane reviewer

| Field | Value |
|---|---|
| Branch | unit/dsb-U6 @ 20b5cfea |
| Base | plan/docs-stale-batch @ 0d71383a |
| Files at 20b5cfea | .sdlc/adapter.md (§6: one `**Amendment (2026-09-30, #768).**` paragraph after the #742 amendment; nothing else moved) |
| Files in this handoff commit | .sdlc/handoffs/docs-stale-batch-U6.md |
| Ran | the `~~~sh ran` block below at 20b5cfea (checked out, handoff copy supplied as `HF`), output pasted unedited; U6-1 to U6-4 and P2 negative controls in a `--shared` clone at 20b5cfea (first line `20b5cfea`): U6-3 with `## 1.` edited reads `4`; U6-2 and U6-1 at the parent read `0` and `3 0 0 0`; P2 with a planted U+2014 fails `FAIL: 1 em dashes`; P1 `npm test` at 20b5cfea: exit 0, 93 s, `✓ all 54 test files passed`, `git status --porcelain` 0 lines; P3 8 rows, all `ok`, `1`, `1`; P4 `SAME`; P5 lists only `.sdlc/adapter.md` |
| Left out | `npm run build`, smoke (no `node_modules`, owed at pre-land); P6 (U4 only) |
| Merge | `origin/main` (550becc2) not merged into the unit: its only delta over the base is `.sdlc/board.md`, and the `Seat: orchestrator` trailer rule for that file blocks a builder's merge commit; `adapter.md` is identical on both, so U6-3 (which diffs against the merge base) is unaffected |

## Decisions

1. The paragraph describes the shape in full (#768 `generalized description` option) and cites only `.sdlc/plans/archive/docs-repair.md`; it does not name the live plan path (an `absent` row proves it).
2. The ledger has no row whose needle contains a pipe, since the row is pipe-split; the column list is covered by the `kinds are defined` row instead.

## Ran

~~~sh ran
git rev-parse --short=8 HEAD
# U6-1
awk '/^## 6\. Records/,/^## 7\./' .sdlc/adapter.md | /usr/bin/grep -c '^\*\*Amendment ('; awk '/^## 6\. Records/,/^## 7\./' .sdlc/adapter.md | /usr/bin/grep -c '## Claims'; awk '/^## 6\. Records/,/^## 7\./' .sdlc/adapter.md | /usr/bin/grep -c '~~~sh ran'; awk '/^## 6\. Records/,/^## 7\./' .sdlc/adapter.md | /usr/bin/grep -c '#768'
# U6-2
/usr/bin/grep -c 'plans/archive/docs-repair.md' .sdlc/adapter.md; ls .sdlc/plans/archive/docs-repair.md; /usr/bin/grep -c '^[|] P8 ' .sdlc/plans/archive/docs-repair.md
# U6-3
B=$(git merge-base origin/main HEAD); diff <(git show "${B}:.sdlc/adapter.md" | awk '/^## 6\. Records/{s=1} /^## 7\./{s=0} !s') <(awk '/^## 6\. Records/{s=1} /^## 7\./{s=0} !s' .sdlc/adapter.md) | wc -l | tr -d " "
# U6-4
awk -F'[|]' '/^## Claims/{f=1} f && $3 ~ /## Claims/ && $4 ~ /\.sdlc\/adapter\.md/ && $4 !~ /adapter\.md:[0-9]/ {c++} END{print c+0}' "$HF"
# P2
node test/repo/em-dash.mjs | tail -1; node test/repo/branding.mjs | tail -1
~~~

~~~out ran
20b5cfea
4
1
1
1
1
.sdlc/plans/archive/docs-repair.md
1
0
1
em-dash: clean (1064 files scanned)
branding: clean (1056 files scanned)
~~~

## Claims

| Claim | Needle | Anchor | Kind |
|---|---|---|---|
| §6 gained a dated amendment citing #768 | `**Amendment (2026-09-30, #768).**` | `.sdlc/adapter.md` | present |
| the amendment names the ledger | `## Claims` | `.sdlc/adapter.md` | present |
| the amendment names the ran-block pair | `~~~sh ran` | `.sdlc/adapter.md` | present |
| the amendment names the out block | `~~~out ran` | `.sdlc/adapter.md` | present |
| the kinds are defined | `(the anchor file carries the needle)` | `.sdlc/adapter.md` | present |
| the ran block's first line is stated | `git rev-parse --short=8 HEAD` | `.sdlc/adapter.md` | present |
| it cites the archived plan where the shape was proved | `plans/archive/docs-repair.md` | `.sdlc/adapter.md` | present |
| it does not cite the live plan path | `plans/docs-stale-batch` | `.sdlc/adapter.md` | absent |
