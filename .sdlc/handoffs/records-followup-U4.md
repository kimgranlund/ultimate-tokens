# Handoff U4 pass 2 · builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/rf-U4, cut from plan/records-followup revision 3 @ 07ecb44c (UB) |
| Files | .sdlc/adapter.md, .sdlc/verdicts/records-refresh-U1.md, .sdlc/verdicts/records-refresh-U3.md, .sdlc/verdicts/survey.md, .sdlc/handoffs/records-refresh-U1.md, plus this handoff (pass 1 already carried .sdlc/baseline.md and .sdlc/handoffs/records-refresh-U3.md) |

## Pass 2 changes on top of pass 1

Pass 1's two restored program lines (the gate line and the smoke line) were byte-exact and are kept, untyped, exactly as pass 1 copied them from the programs.

1. Restored two more altered smoke quotes found by review 1:
   - `.sdlc/verdicts/survey.md:11` (C3 evidence cell): ASCII hyphen-minus `SMOKE PASS - gallery ...` `cited:` became the smoke line as printed (em dash).
   - `.sdlc/handoffs/records-refresh-U1.md:26` (run 8's summary cell): backtick-then-colon with commas for the middots became the smoke line as printed, in one backtick span. Lines 27-28 (`same SMOKE PASS line`) were left as prose, per the plan.
   - Each of the two files gained the appended `Correction (2026-09-19, plan records-followup U4, #709): ...` line, worded exactly as §Texts gives it.
2. `.sdlc/verdicts/records-refresh-U3.md`'s existing Correction line was rewritten to carry the F6 sentence §Texts spells out verbatim (`Note 2 above no longer holds on its face: ...`). Note 2 itself was left untouched (prose, flagged not rewritten).
3. `.sdlc/adapter.md` §3's amendment was replaced with revision 3's text: added the per-unit re-derivation-of-the-raw-count sentence, the third `altered:` case for a glyph the file cannot hold, and the leading-whitespace sentence. Diffed against §Texts; empty.
4. `.sdlc/verdicts/records-refresh-U1.md:37`'s gate span gained `(altered: two leading spaces dropped)` next to the quote, per the new leading-whitespace sentence.

## Runs

Load at start of session: `11.37 10.55 9.98` on 10 cores (`uptime`, `sysctl -n hw.ncpu`); no other `ultimate-tokens` test/vite/headless process found in `pgrep`. `node_modules` was already present in the worktree from an earlier pass's `npm ci`; not removed, since `npm test` does not depend on it (zero-dependency gate) and nothing stages it (`git ls-files | grep -c node_modules` is 0).

| # | Command | Exit | Last line | git status after |
|---|---|---|---|---|
| 1 | `npm test` | 0 | `✓ all 48 test files passed` | 5 modified files (this unit's own pending edits) |
| 2 | `node test/repo/branding.mjs` | 0 | `branding: clean (472 files scanned)` | unchanged |
| 3 | negative control for C2: `git clone -q --shared .` to scratchpad, `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json`, `npm test` | 1 | `✗ 1/48 test file(s) failed` | clone removed after (`rm -rf`) |

No run dropped or retried. No unexplained red run (the one red run is the intended negative control).

## Criteria, re-measured against the committed tree (BASE = d34b4fb1, UB = 07ecb44c)

Measured after this pass's edits were committed, with the six criterion commands run from scratchpad scripts (no nested one-line shell quoting), never before the handoff existed.

| # | Command (as the plan types it) | Printed | Expected | Match |
|---|---|---|---|---|
| 1 | `git grep -l 'Verbatim-quote rule (ticket #709' -- .sdlc ':!.sdlc/plans' ':!.sdlc/handoffs/records-followup-U4.md' \| paste -sd, -`; `grep -c ... adapter.md`; `awk '/^## 3\. /,/^## 4\. /' adapter.md \| grep 'Verbatim-quote rule (ticket' \| grep -c 'byte for byte.*strips backtick spans.*has no quote exemption'` | `.sdlc/adapter.md`, `1`, `1` | `.sdlc/adapter.md`, `1`, `1` | yes |
| 2 | fresh P1 negative control (`"scrim` to `"scrimX`) in a disposable clone; `grep -o 'FAIL  refs-canonical.*' neg.log > line.txt`; `wc -l`; `grep -cFf line.txt` U1 verdict; `grep -c 'refs-canonical, ordered'` `cited:` U1 verdict | `1`, `1`, `0` | `1`, `1`, `0` | yes |
| 3 | `grep -o 'SMOKE PASS[^"]*' test/smoke/smoke.mjs > smoke.txt`; `wc -l`; `git grep -cFf smoke.txt` the five files; `git grep -c -e 'SMOKE PASS: gallery' -e 'SMOKE PASS.: gallery' -e 'SMOKE PASS - gallery' -e 'SMOKE PASS (em dash)' -- .sdlc ':!.sdlc/plans' ':!.sdlc/handoffs/records-followup-U4.md' \| wc -l` `cited:` | `1`; `.sdlc/baseline.md:1`, `.sdlc/handoffs/records-refresh-U1.md:1`, `.sdlc/handoffs/records-refresh-U3.md:4`, `.sdlc/verdicts/records-refresh-U3.md:1`, `.sdlc/verdicts/survey.md:1`; `0` | same | yes |
| 4 | `grep -c '^Correction (20[0-9-]*, plan records-followup U4, #709)'` on the five history files | `1` on each of the five | `1` on each of the five | yes |
| 5 | P6's command (BASE, backtick-stripped): `0`; then `git diff -U0 $UB -- .sdlc ':!.sdlc/handoffs/records-followup-U4.md' \| grep '^+' \| LC_ALL=C grep -c "$EM"`; then P4's command | `0`, `9`, `branding: clean (472 files scanned)`, exit 0 | `0`, `9`, clean/exit 0 | yes |
| 6 | `git diff --name-only $UB \| sort \| paste -sd, -`; per-file `git diff -U0 $BASE` removed-line counts on the five history files; `baseline-agrees-check.sh` tail | eight paths (adapter, baseline, this handoff, U1 handoff, U3 handoff, U1 verdict, U3 verdict, survey verdict); `1,2,4,1,1`; `stale total: 0` | eight paths, `1,2,4,1,1`, `stale total: 0` | yes |

## Scope

Eight files touched from UB, matching the plan's list exactly: `.sdlc/adapter.md`, `.sdlc/baseline.md`, this handoff, `.sdlc/handoffs/records-refresh-U1.md`, `.sdlc/handoffs/records-refresh-U3.md`, `.sdlc/verdicts/records-refresh-U1.md`, `.sdlc/verdicts/records-refresh-U3.md`, `.sdlc/verdicts/survey.md`. The five history files were touched only on their quote lines plus one appended `Correction` line each (or, for the U3 verdict, a rewritten existing Correction line); `adapter.md`'s §3 amendment was replaced in place; `baseline.md`'s smoke cell (pass 1) is unchanged this pass.

## Left out

Nothing. All six criteria matched the plan's expected values on the first measurement taken after this handoff existed and the tree was committed. No number disagreed with the plan's stated expectation, so nothing was adjusted on either side.

Correction (2026-09-19, plan records-followup U6, #709): the P1 row above is not P1 evidence, since `node_modules` was present and the tree carried five modified files during that run. P1 was measured by review pass 2 at b9e70950 in a clean detached worktree with no `node_modules`: `✓ all 48 test files passed`, 48 in `TESTS`, tree clean.

Correction (2026-09-20, plan records-followup U10, #709): three spans in this handoff quote a defective form as the subject of a finding or count it with a grep, and now carry the `cited:` marker beside them: the hyphen-minus smoke form in the enumeration above, and the two patterns in criteria rows 2 and 3. Rule: `.sdlc/adapter.md` §3, the cited-quote clause under the Verbatim-quote rule.
