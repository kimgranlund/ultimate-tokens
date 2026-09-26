# Verdict: docs-repair U4 (figma/README.md), #751, pass 2

verdict: 🟢 8 green, 0 yellow, 0 red
sha: 1a3d8703fff23a6fb9dfc03ea6d914aa99905387

Seat: verifier-l1. Clone: `/private/tmp/claude-501/dr-U4-v` (detached at the sha after `git fetch origin`). Controls ran in the throwaway clone `/private/tmp/claude-501/dr-U4-vneg`, moved to the same sha. `B=282fca8ddc84703a9bffc0bcc0f3b8462747cca5` (`git merge-base origin/main HEAD`); unit base `9be5b5c8f1b082bc37514b12f94d09f4be6f4ca8` (`git merge-base origin/plan/docs-repair HEAD`, the plan tip after the merge into the unit).

## What changed since pass 1 (6449bca3)

`git diff --name-only 6449bca3..HEAD` lists only `.sdlc/plans/docs-repair.md` (revision `9be5b5c8`, U4-3 now filters the unit's handoff and review) and `.sdlc/verdicts/docs-repair-U4-review.md` (`3d963cb7`, dashes removed). `git diff --quiet 6449bca3 HEAD -- figma/README.md` holds, so U4-1, U4-2 and P1 carry over from pass 1. P4 and P5 were re-run because the diff moved `.sdlc/` files and the citations gate prints the head.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U4-1 | the file exists and names both plugins, both manifests, the generator and the skill | 🟢 | carried from pass 1, file unchanged: `ok` then `1 2 2 3 1 1` for `plugin/manifest.json`, `figma-semantic-binder`, `gen:figma-ui`, `ui.html`, `maintaining-figma-plugins`, `test/figma` | pass 1: at `B` the file is `absent`; replacing `maintaining-figma-plugins` made that grep `0` |
| U4-2 | every module it names exists, and every `binder/*.mjs` is named | 🟢 | carried from pass 1, file unchanged: both loops printed nothing; all six `figma/binder/*.mjs` named, each description matches the file's `head -1` | pass 1: an appended `binder/splice.mjs` printed `missing binder/splice.mjs`; deleting the `binder/live-diff.mjs` line printed `unnamed figma/binder/live-diff.mjs` |
| U4-3 | the unit changes one source file (revision `9be5b5c8` filters its own handoff and review) | 🟢 | the revised command at the sha printed exactly `figma/README.md`; unfiltered it lists `.sdlc/handoffs/docs-repair-U4.md`, `.sdlc/verdicts/docs-repair-U4-review.md`, `figma/README.md`, so the filter removes only the two named records | in the clone, a committed extra `README.md` edit plus a `.sdlc/handoffs/docs-repair-U5.md` file made the filtered command print `.sdlc/handoffs/docs-repair-U5.md`, `README.md`, `figma/README.md`: the filter does not swallow another unit's record or a product path |
| U4-4 | branding and dash rules (P3's three commands on the unit branch) | 🟢 | `node test/repo/branding.mjs \| tail -1` printed `branding: clean (724 files scanned)`, exit `0`; dash leg 1 printed `0`, dash leg 2 printed `0` (pass 1 printed `13`, `13`, all from the review record) | in the clone, one appended review-record line carrying U+2014 made dash leg 1 print `1`; copying `decision-records.md` to `.sdlc/verdicts/docs-repair-x.md` printed `FAIL: 3 branding violation(s) across 725 files`, exit `1` |
| P1 | `npm test` green with no `node_modules`, the count agrees, the tree is byte-stable | 🟢 | carried from pass 1 at `6449bca3`: `✓ all 50 test files passed`, TESTS `50`, `git status --short \| wc -l` = `0`. The pass 2 delta touches two `.sdlc/*.md` files only, which no generator reads; the one `npm test` leg that scans them, `test/repo/branding.mjs`, was re-run at the sha: clean | pass 1: `sed 's/"scrim/"scrimX/'` on `role-table.json`, then `node test/engine/semantic.mjs` (registered in `TESTS`): `FAIL refs-canonical`, exit `1` |
| P3 | branding clean and no added prose line carries an em dash | 🟢 | same run as U4-4: `branding: clean (724 files scanned)`, `0`, `0`; no handoff quotes a dashed program line, so Expected is `0` | as U4-4 |
| P4 | scope wall; source files comment-only; no `test/run.mjs`/`scripts`/`.github`/`package.json`; only DD41 in `architecture.md` | 🟢 | first command re-run at the sha: `0`; `git diff --name-only $B` lists `.sdlc/board.md`, `.sdlc/handoffs/docs-repair-U4.md`, `.sdlc/plans/docs-repair.md`, `.sdlc/questions/docs-repair-approval.md`, `.sdlc/verdicts/docs-repair-U4-review.md`, `figma/README.md`, none of which the other three commands match, so they stay `0` | pass 1: the plan's four-name fixture through the same filter printed `2` |
| P5 | the citations gate is live inside `npm test` and reds on a bumped citation | 🟢 | `grep -c '"repo/citations.mjs"' test/run.mjs` = `1`; re-run at the sha: `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 1a3d8703)`, `exit 0` | pass 1: the plan's `perl` bump of the `mixinInto` cite printed `✗ 1 citation gate failure(s)`, `exit 1` |

## Rows not graded here

P2 (build and the `baseline.md` KB figure) and P6 (stale format-count strings) measure U3's bundle and U2's doc edits. U4 touches neither, and `figma/README.md` is not bundled, so they are left to the pre-land review.
