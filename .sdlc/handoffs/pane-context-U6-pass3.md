# Pass 3 brief: pane-context U6 (#785)

Owner ruled A on pass 3 (`.sdlc/questions/pane-context-prepr-p2.md`, Question 2). Worktree `.worktrees/pc-U6` (unit/pc-U6 @ edeeb8d9). Builder-l4. Wording and comments only; R98 (no shims, no logic). No U+2014.

Read first: `.sdlc/verdicts/pane-context-U6.md` (🔴), `.sdlc/plans/pane-context-U6-rediagnosis.md` (the five-line table and the plan), and the U6 section and Lane on plan/pane-context (`git show plan/pane-context:.sdlc/plans/pane-context.md`, lane widened).

Do:
1. Fix the five lines: `.claude/skills/color-math/references/foundations.md:132`, `src/engine/tonal.js:631-633`, `src/ui/persist.js:150`, `scripts/gen-categories.mjs:131` (comments only), `docs/lld/lld-muted-base-key-spikes.md:169` (or its #785 banner). Copy the qualifier wording already at `docs/reference/references/knowledge-02-tonal-scale.md:428`.
2. Run the class sweep from C6.1: collapse line breaks, grep `stop 500`, `verbatim`, `rampChroma`, `byte for byte`, `0.2.0 output` over docs, .claude, plugin, mcp, src, scripts, test. History (amendments, CHANGELOG, archives, verdicts, reviews, handoffs, questions) is excluded. Put the full hit list in the handoff with one disposition per hit (fixed, already qualified, history, true as written).
3. The comment edits move `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js`: `npm test` regenerates them, commit them, and fix the baseline ui.html KB figure with a Correction line if `baseline-agrees-check.sh` goes stale.
4. `git diff -U0 edeeb8d9 -- src test scripts`: every changed line is a comment (starts with // after trim); say so in the handoff.

Gates: `unset NODE_OPTIONS`; heavy count `ps -Ao command | grep -E 'test/run.mjs|gate:|--full' | grep -vc grep` 3 or fewer; `npm test` after the last edit; `npm run build`; `baseline-agrees-check.sh` stale total 0; em-dash; `card-amendment-check.sh`.

Handoff: Pass 3 section in `.sdlc/handoffs/pane-context-U6.md`. Commit with `Seat: builder` and the Co-Authored-By line in one trailer block. Scratch only `/Users/kimba/.claude/jobs/8c58a81c/tmp/pc-U6-p3`. Return the head sha. Do not merge plan into the branch.
