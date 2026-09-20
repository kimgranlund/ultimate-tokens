# Handoff U4 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/rf-U4 @ (this commit), cut from plan/records-followup @ e48e2d92 |
| Files | .sdlc/adapter.md, .sdlc/baseline.md, .sdlc/handoffs/records-followup-U4.md, .sdlc/handoffs/records-refresh-U3.md, .sdlc/verdicts/records-refresh-U1.md, .sdlc/verdicts/records-refresh-U3.md |

## The two program lines, observed directly (not transcribed from the plan)

- Gate line, from P1's negative control run in a throwaway `git clone -q --shared`, `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json`, `npm test > neg.log 2>&1`, then `grep -o 'FAIL  refs-canonical.*' neg.log`:
  `` `FAIL  refs-canonical  — ordered key set != canonical` ``
  Run at load averages 20:07 `17.28 19.80 39.12` before, `14.00 17.60 35.59` after (10 cores). Also confirmed against the U1 verdict's own recorded control cell.
- Smoke line, from a real `npm ci` + `npm run smoke` in this worktree (load 20:09 `9.83 15.61 34.22` before dropping to `9.83`/`15.61` after, quiet window, no other `ultimate-tokens` test/vite/headless process running):
  `` `SMOKE PASS — gallery · category · editor · export dialog all render in a real browser` ``
  Confirmed identical to `grep -o 'SMOKE PASS[^"]*' test/smoke/smoke.mjs`'s own output.

Neither line was typed from the plan text, a verdict, or the smoke.mjs source read alone; both were captured from the programs' own stdout on this run.

## Criteria run (BASE = d34b4fb1, UB = e48e2d92)

| # | Command | Printed | Match |
|---|---|---|---|
| 1 | `git grep -l 'Verbatim-quote rule (ticket #709' -- .sdlc ':!.sdlc/plans' \| paste -sd, -; grep -c ... adapter.md; awk '/^## 3\. /,/^## 4\. /' ... \| grep -c '...'` | `.sdlc/adapter.md`, `1`, `1` | yes |
| 2 | fresh P1 control + `grep -o 'FAIL  refs-canonical.*' "$F/neg.log" > line.txt`; `wc -l`; `grep -cFf line.txt` U1 verdict; `grep -c 'refs-canonical, ordered'` U1 verdict | `1`, `1`, `0` | yes |
| 3 | `grep -o 'SMOKE PASS[^"]*' test/smoke/smoke.mjs > smoke.txt`; `wc -l`; `git grep -cFf smoke.txt` the three files; `git grep -c 'SMOKE PASS: gallery\|SMOKE PASS (em dash)' ... \| wc -l` | `1`; `.sdlc/baseline.md:1`, `.sdlc/handoffs/records-refresh-U3.md:4`, `.sdlc/verdicts/records-refresh-U3.md:1`; `0` | yes |
| 4 | `grep -c '^Correction (20[0-9-]*, plan records-followup U4, #709)'` on the three files | `1` on each | yes |
| 5 | P6 (against BASE, backtick-stripped): `0`; then `git diff -U0 $UB -- .sdlc \| grep '^+' \| LC_ALL=C grep -c "$EM"`: `7`; then P4 branding: `branding: clean (470 files scanned)`, exit 0 | `0`, `7`, clean/exit 0 | yes |
| 6 | `git diff --name-only $UB \| sort \| paste -sd, -`; per-file `git diff -U0 $BASE` removed-line counts on the three history files; `baseline-agrees-check.sh` tail | six paths (listed above); `1,2,4`; `stale total: 0` | yes |

## Gates

- `npm test` (worktree, no prior node_modules): green, `✓ all 48 test files passed`, exit 0, `git status --short` empty after. Load 20:10 `9.45 15.43 33.35` before → `8.36 12.79 29.55` after.
- `npm run smoke` (worktree, after `npm ci`): green, `exit 0`, ended with the smoke line quoted above. Load recorded above.
- The P1 negative control that produced the gate-line quote ran twice, both in disposable clones under this session's scratchpad, both removed afterward (`rm -rf` on the clone directory; nothing left under `.worktrees/`).

## Scope

Six files touched, matching the plan's list exactly. The three history files (`records-refresh-U1.md` verdict, `records-refresh-U3.md` verdict, `records-refresh-U3.md` handoff) were touched only on their quote lines plus one appended `Correction` line each; `adapter.md` gained one appended `**Amendment (2026-09-19).**` paragraph inside §3; `baseline.md`'s smoke cell was re-quoted in a backtick span, no other line touched.

## Left out

Nothing. All six criteria matched their expected output on the first measurement; no number diverged from the plan's stated expectation.
