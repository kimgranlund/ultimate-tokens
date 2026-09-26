# rule-gates U5 review (rg-U5-reviewer-l2-p1)

Target `unit/rg-U5` @ `236e9535`. Base `047b2951`. Main side `db33b460`, merge `c2b58d50`, sweep `e8a56d7e`. Every control ran in `scratchpad/rg-U5-rev1`, a `git clone --shared` of the unit worktree, HEAD proven `236e9535f5a1cb8f6b7ed5cb96404358b22a9604`, no `node_modules`.

## Verdict: FIX-FIRST

One 🔴, a one-commit records fix: the under-load ruling is cited as R47 in the handoff and in five places in `.sdlc/baseline.md`. Checks 1, 2, 4, 5 and 6 are 🟢.

| # | Check | State | Evidence | Control |
|---|---|---|---|---|
| 1 | merge `c2b58d50` keeps main plus this plan's work | 🟢 | merge-base `ae4206ac`. 378 files plan-only, 168 main-only, 30 touched by both. Every plan-only file at HEAD is byte-equal to `047b2951`, so the gates, `test/run.mjs`, `.sdlc/checks/`, U6's `n/a` surfaces, `.claude/CLAUDE.md`, E1 to E4, R37 and the store-copy colons are all intact. Every main-only file at the merge is byte-equal to `db33b460`. No file that neither side touched differs from main. Only 13 files change after the merge: the 11 swept files plus `baseline.md` and the handoff. For the 30 files both sides touched, every line the plan added is at HEAD except 20. Each of the 20 is a line main rewrote (#713 FULL/SAMPLED, #738 memo removal, the new `shipping-changes` CI figure), and at HEAD it holds main's text, dash-free. Of the plan's removed lines in conflicted files, only lines carrying the glyph or R7 pairs were dropped | a plan-only file drifting from `047b2951` or a main-only file drifting from `db33b460` would print its name; both loops printed none |
| 2 | sweep `e8a56d7e` | 🟢 | 11 files, 386 insertions and 386 deletions, `numstat` has no unequal row. Pair check over the removed lines, generated files excluded: `1`, and that one is `prime.mjs:555`'s `them` line, the R0 (g) pair the handoff lists as a hand rewrite. `node test/repo/em-dash.mjs \| tail -1` prints `em-dash: clean (763 files scanned)` in the clone | the pair check's one hit is the known `//      —` line-start case, so the awk reads real lines |
| 3 | U5-2, three runs under load | 🔴 | the three runs are sound: all exit 0, `✓ all 52 test files passed`, tree clean after each, heavy-run count `0` before each, clock spans 06:17:20 to 06:19:51, 06:21:23 to 06:23:09 and 07:10:20 to 07:15:37 (no overlap). Load and wall are recorded per run, the row is marked `under load`, and the table reads `3/3`, `151 · 106 · 317`. The citation is wrong. `.sdlc/runtime/owner-rulings-2026-09-22.md` R47 is "Call a window now (Recommended)", the quiet window. R49 is the under-load ruling, recorded in `rule-gates-U5-load.md` and marked "Supersedes R47 for U5". The handoff (section "Third window" and the U5-2 row) and `baseline.md` lines 6, 21, 35, 280 and 300 all call the under-load ruling R47. The file path they give is the right one | `grep -n '^## R4[79]' .sdlc/runtime/owner-rulings-2026-09-22.md` in the root checkout |
| 4 | U5-1 / P7 | 🟢 | `sh .sdlc/checks/baseline-agrees-check.sh; echo "exit $?"` prints `ok` on tests (52 = 52), ui.html (4120.9 = 4120.9) and eight time rows, exactly one `STALE time test: baseline 106 to 317 s, adapter 80 to 89 s` (R53), `note head`, `ok head`, `stale total: 1`, `exit 1`. The perl `TESTS` count is `52` | with the summary set to 51 files: `STALE tests: baseline 51, test/run.mjs TESTS 52`, total 2. With the KB set to 4121.9: `STALE ui.html: baseline 4121.9 KB, tree 4120.9 KB`, total 2. Clone restored, status `0` |
| 5 | P1 | 🟢 | `npm test` in the clone at `236e9535`, heavy-run count `0` before it: `exit 0`, `✓ all 52 test files passed`, perl `TESTS` count `52`, `git status --short \| wc -l` `0`. The run went past the 600 s Bash timeout and the harness moved it to the background; it finished there and the notification confirmed the exit code. No timing figure is taken from it | P7's 51-file control in row 4 shows the count check bites |
| 6 | style and branding | 🟢 | the only em dash in `.sdlc` lines added since the merge sits inside a single-line double-backtick span (the prime.mjs "before" quote). No bold inline labels were added. `branding: clean (755 files scanned)`, `svg-rules: 12 html: attributes (stated 12)` | the dash grep bites: over the same added lines, `grep -c '—'` after stripping single-backtick spans printed `1`, which is the double-backtick quote read by hand, so the grep finds a dash that is really there |

## Findings

1. 🔴 Wrong ruling ID. The under-load ruling is R49, not R47, in `.sdlc/handoffs/rule-gates-U5.md` and in `.sdlc/baseline.md` (frontmatter `host:` line 6, the `npm test` row line 21, the superseded note line 35, the Correction lines 280 and 300). R47 is the quiet-window ruling, which says the opposite. Fix: change R47 to R49 in those places. `baseline.md` line 300's "the wall-time variance R47 anticipated" also becomes R49.
2. 🟡 Plan text lags the ruling. The U5-2 row still expects "every counted run's load-before cell under 5", and the Revisions table has no row folding R49 (or R53's carried STALE into U5-1's expected `stale total: 0`). Under R45 (no new scope) this may stay a ruling-record override, but pre-land will read the plan as written. The Orchestrator should add a revision row or state the override in the pre-land record.
3. 🟡 Plan step 3 asks for `ref` to point at the unit's base; `baseline.md` keeps `ref: main @ a62ec020`. A plan-branch sha would fail the check's `ok head: ... in origin/main's history` line, and the Landing section re-points `ref` at close-out, so leaving it is defensible. The handoff does not say so.
4. Nit, inherited from U4 and not new in U5: `test/engine/anchor.mjs:1437` `console.error(`, ${f...}`)` was a bullet-dash output prefix that R-rules turned into a leading comma. It was already at `047b2951:1312`.
5. Nit: the handoff's U5-2 cell says adapter §1's test range was "both updated (adapter's own figure held unchanged per R53)". That contradicts itself. The adapter was not changed.

## Round 2, at `4df34cc8`

Records-only commit on `236e9535`: `.sdlc/baseline.md` (5 lines) and `.sdlc/handoffs/rule-gates-U5.md`. No runs needed and none taken, since nothing outside `.sdlc/` moved.

| # | Check | State | Evidence | Control |
|---|---|---|---|---|
| R2-1 | the 🔴 ruling citation | 🟢 | `grep -n 'R47\|R49' .sdlc/baseline.md .sdlc/handoffs/rule-gates-U5.md` prints one line, `handoffs/rule-gates-U5.md:64: ## Second polling window (owner R47, "window open")`, which names the quiet-window call correctly. All five baseline.md sites and the handoff's third-window, U5-2 and closing lines now cite `.sdlc/questions/rule-gates-U5-load.md` by path | at `236e9535` the same grep printed the five baseline.md R47 sites, so the grep finds them |
| R2-2 | the fix commit adds no dash or bold label | 🟢 | `git diff -U0 HEAD~1 HEAD \| grep '^+' \| grep -c '—'` prints `0`; the same with `'\*\*'` prints `0`. `git show --stat HEAD` lists only the two `.sdlc/` files | the dash grep printed `1` on the round 1 range (row 6), so it can find a dash |

Nit: the handoff frontmatter moved from `pass: 3` to `pass: 2`. It probably counts review-fix passes, but it reads as a step backwards.

Findings 2 and 3 of round 1 (🟡: the plan's U5-2 text still says load under 5; the `ref` is not repointed) stand for the Orchestrator and pre-land. Neither blocks this unit.

verdict: PASS

altered: the Orchestrator added the line below when committing, since the frontmatter check needs an emoji first token (`verdict: PASS` above is the reviewer's own).
verdict: 🟢 PASS
