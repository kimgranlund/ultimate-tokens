PASS

Review pass 2 of unit/dr-U3 at 0484a300 (ticket #751), against `.sdlc/plans/docs-repair.md` section U3. Diff base `B` is the merge base `dc5c6e49` with `plan/docs-repair`. Every count below is my own run in `.worktrees/dr-U3`; negative controls ran in a `--shared` clone at 0484a300 (`git rev-parse --short HEAD` printed `0484a300`), removed afterward.

## Round 1 findings

| Finding | Status | Evidence | Negative control |
|---|---|---|---|
| 1. `persist.js` kept a stale second header naming the retired product | fixed | `grep -c 'HCT Palette Generator' src/ui/persist.js` prints `0`; the mid-file block is deleted and its content folded into the line-1 header (invariants, schemaVersion, RENAME_MAPS all kept) | round 1 tree had the name at `persist.js:29`; ui.html keeps 5 and the mcp mirror 2 hits, all from `model.mjs`/`exports.js` headers the plan leaves out of scope |
| 2. `HctApp` lost its backticks on `app-shell.md:13` | fixed | line 13 now reads ``(`mixinInto`, `app.js:2581`) of `HctApp` ``; the audit prints `OK docs/lld/app-shell.md:13 cites app.js:2581 -> matched `mixinInto``; U3-3 still holds | the builder's earlier pushback was moot: the fix keeps both backticks and the audit still anchors on `mixinInto` |

## Criteria

| Id | Result | Evidence | Negative control |
|---|---|---|---|
| U3-1 | pass | `1`, `1`, `1`, `1` | `$B` file prints `0`, `0`, `0` per the plan |
| U3-2 | pass | `0`, `1`, `15` | `$B` file has `11 voices` once |
| U3-3 | pass | `L=2581`, `1`, `1` (no `NO-CITE`) | `$B` cite line sits inside the function body, audit read `NEAR` |
| U3-4 | pass | `0`, `1`, `1`, `1`, `1`, `1`, `1` | `$B` prints `1`, `0`, `0`, `1`, `1`, `0`, `0` |
| U3-5 | pass | ten `1`s interleaved, then `1`, `0` (no `slider()` row) | `$B` doc greps print `0` |
| U3-6 | pass | `0`, `1`, `0` | `$B` prints `1`, `0`, `1` |
| U3-7 | pass | `0`, `1`, `1`, `0`, `0` (regenerated mirror is clean) | `$B` prints `1`, `0`, `0`, `1`, `2` |
| U3-8 | pass | `0` files under `docs/marketing` | any marketing edit prints `1` or more |
| U3-9 | pass with note | P4 middle command prints `0`; the only non-comment changed line is a deleted blank line, which the command's `[^+-]` filter ignores; numstat `2 2 geometry.mjs`, `1 1 app.js`, `16 31 persist.js`; baseline row carries the `wrote figma/plugin/ui.html` line | a code line changed would print `1` or more; the plan expected `A 0` for `persist.js` (add-only), which the round 1 fix deliberately breaks by deleting the stale block, so the plan's numstat expectation is superseded by the finding |
| P3 | pass | branding clean; added-line em dash count is `7` raw, all pre-existing text, see below | see below |
| P4 | pass except four paths | tests, scripts, CI, package.json: `0`; DD rows: no `architecture.md` change; four `docs/reference/reviews/2026-08-20-reactivity/*.md` files fall outside the wall filter | see rework judgment |
| P1 | pass | foreground `npm test`: `all 50 test files passed`, exit 0, `git status --short` prints `0` afterward | not repeated; the gate's own controls are the plan's |
| P2 (baseline leg) | pass | `baseline-agrees-check.sh` ends `stale total: 0`; `npm test` regenerated `wrote figma/plugin/ui.html 4124.3 KB`, matching the baseline | clone with the figure set to `4125.5 KB`: check prints `stale total: 1` |
| P5 | pass | `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 0484a300)` | see rework judgment |

## Em dash grep of added lines

`git diff B | grep '^+'` finds `7` lines carrying U+2014, and none is new prose. Five sit in the four reactivity review docs: each line is an existing review sentence whose only change is a `persist.js:NNN` cite, and the removed line carries the same dash (`5` removed lines with a dash). Two sit in `.sdlc/verdicts/docs-repair-U3-review.md` and `.sdlc/reviews/docs-repair-U3-progress.md`, where they quote the old stale header line word for word (the branch predates the gate). Net new dashes in prose: `0`. The unit branch will need `node test/repo/em-dash.mjs --fix` or a quote rewrite when it meets the gate at merge; that is a merge-time chore for the Orchestrator, not a U3 defect.

## Rework judgment 1: persist.js header and the four reactivity review docs

The header rework is correct and in scope: `persist.js` is in the wall as comment lines, the diff outside comments is one deleted blank line, and no content of the old block was lost. The cascade into `docs/reference/reviews/2026-08-20-reactivity/*.md` is required, not optional. Clone with those four files reverted to `$B` on top of 0484a300: `node test/repo/citations.mjs` prints `✗ 4 citation gate failure(s)` (cites like `persist.js:712`, `:646`, `:664-668` now read code that moved). The builder's re-point shifts every cite by exactly 15 (16 lines added, 31 removed), and spot reads match: `validLead` comment at 649, `clampTokenOverrides` at 654, its `clampTokenOverrides(... 1, 512 ...)` call at 697, the RENAME block at 335 to 353 and 460 to 462. The one defect is a plan gap: those four files are not in the P4 wall list, and P4's filter prints four names for them. I rule them in scope by the stale-context rule (a change that invalidates a record repairs it in the same change) and recommend the Orchestrator amend the U3 wall to admit `docs/reference/reviews/2026-08-20-reactivity/`, so P4 reads `0`.

## Rework judgment 2: baseline ui.html figure 4125.5 to 4124.3 KB

Correct and in scope (the wall admits the KB figure and one correction paragraph). The figure equals the program output of the regenerated build (`wrote figma/plugin/ui.html 4124.3 KB`) and the check agrees, with the control above biting. The correction paragraph adds a second dated entry beside the round 1 one; the pair is accurate history (4125.3 at base, 4125.5 after the first header pass, 4124.3 after the rework). Its row text names the unit.

verdict: 🟢
