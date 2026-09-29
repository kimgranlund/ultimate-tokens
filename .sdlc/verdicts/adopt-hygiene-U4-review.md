---
kind: review
plan: adopt-hygiene
unit: U4
pass: 1
diff: 39b78dc..unit/hygiene-U4 (head 8ebf172)
reviewer: reviewer-l1 (fresh context)
date: 2026-09-17
verdict: 🟢 pass
---

# U4 review: pre-land fixes

Fresh-context review against `.sdlc/plans/adopt-hygiene.md` §U4 (3 rows), the pre-land verdict
`.sdlc/verdicts/adopt-hygiene-prepr.md` (🔴 on 29a2c06), and the handoff `.sdlc/handoffs/adopt-hygiene-U4.md`.
I ran every command in `.worktrees/hygiene-U4` (branch `unit/hygiene-U4` @ `8ebf172`, base `39b78dc`).
Every negative control was planted and reverted; the tree ended with `0` dirty paths.

## Criteria (3/3 pass)

| # | Criterion | State | Result | Negative control |
|---|---|---|---|---|
| 1 | U1 review paraphrases the retired brand/domain; only its P4 row changes | 🟢 | `branding: clean (410 files scanned)`; `git diff 29a2c06 --stat` → `1 file changed, 1 insertion(+), 1 deletion(-)` | replayed the 29a2c06 file content in place: `FAIL: 2 branding violation(s) across 410 files`; restored, rerun clean, status 0 |
| 2 | U1 row 7's stale-path grep excludes `.sdlc/tickets`, prints `0` on head | 🟢 | `moved`, `1`, `0` | same grep without the `.sdlc/tickets` exclusion: `1` (the historical-ticket match) |
| 3 | `npm test` green on head, tree clean | 🟢 | `✓ all 44 test files passed`; `git status --porcelain` → 0 | at 29a2c06: `1/44 test file(s) failed` (branding) |

## Scope and branding gate

- The full `39b78dc..8ebf172` diff touches exactly two files: `.sdlc/verdicts/adopt-hygiene-U1-review.md` (P4 row, one line changed) and the new `.sdlc/handoffs/adopt-hygiene-U4.md`. `.sdlc/plans/adopt-hygiene.md` is untouched in this diff, the plan-level U1-7 exclusion the handoff refers to was already in place at `39b78dc`, confirmed rather than re-edited, matching the handoff's own note.
- The retired brand name and its domain appear only on the diff's removed ("-") line, which is the superseded text being replaced, inherent to any diff of a redaction, not a new occurrence. No added ("+") line in the diff, and no line in the commit message, names the retired brand or domain; both instead paraphrase it. `node test/repo/branding.mjs` on the head is clean, so the gate that actually matters (committed file content, not diff text) passes.
- The commit message itself is scoped correctly: it states the P4 fix and confirms row 2 needed no edit, with no invented claims beyond what the diff shows.

## Findings

| Severity | Finding | Where |
|---|---|---|
| Blocking | none | |

## Verdict

🟢 **Pass.** All 3 U4 criteria hold on my own runs, every negative control bites, the diff is confined to the P4 row plus the handoff, and no retired brand string survives into the committed content, an added diff line, or the commit message.
