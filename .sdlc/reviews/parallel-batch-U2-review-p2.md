PASS

# parallel-batch U2 review, pass 2 (reviewer, #783 outside citations)

| Field | Value |
|---|---|
| Unit | U2, branch `unit/pb-U2` @ `f2f2e299` (code `1d2f65c1`), base `61bcd123` |
| Criteria | plan `### U2 criteria` C2.1 to C2.5 at revision 5 (`plan/parallel-batch`) |
| Pass 1 | `.sdlc/reviews/parallel-batch-U2-review.md`, FAIL on F1 and F2 |
| Verdict | 🟢 PASS: all four adapter pitfalls now state the mechanism their sources record, each re-measured here. One 🟡 for the Orchestrator: the revision 5 C2.1 third grep is vacuous on this host (finding 1); the unit's result holds under a form that bites |

## Findings, by severity

1. 🟡 Plan text, for the Orchestrator (revision 6). C2.1's third command `git grep -nE "\b(MAP|A)\.GEOMETRY_FIELD_RENAME_MAP"` cannot print anything on this host: Apple Git 2.54 `git grep -E` does not honour `\b`. Measured in a clone of `f2f2e299`: `git grep -nE '\bexport const' -- figma/binder/migrations.mjs` prints `0` lines, the same without `\b` prints `3`, `git grep -nP` prints `3`. With `const z = A.GEOMETRY_FIELD_RENAME_MAP;` planted in `test/figma/live-diff.mjs`, the revision 5 form exits 1 (misses it); `(MAP|A)\.` without `\b` and `git grep -P` both exit 0 (catch it). So the pass 1 review's "both exit 1 at head and base" and this handoff's "covering the `A` alias" were vacuous evidence. Suggested revision 6 form: `git grep -nP '\b(MAP|A)\.GEOMETRY_FIELD_RENAME_MAP' -- figma src scripts test`. Not a unit defect: the builder used the form the brief named, and the result is true (next row).
2. ⚪ C2.1 substance re-proven with forms that bite. Importers of `mode-apply-plan.mjs` bind it as `MAP` (`test/figma/binder.mjs:8`) and `A` (`live-diff.mjs:7`, `migrations.mjs:12`, `mode-apply.mjs:5`) or by named imports that do not include the map (`app.js:47`, `apply-gate.js:5`, `drawer.js:6`, `plugin.mjs:15`). `git grep -nP '\w\.GEOMETRY_FIELD_RENAME_MAP'` finds one member read, `test/figma/plugin.mjs:196` `loaded.GEOMETRY_FIELD_RENAME_MAP`, which reads the plugin `code.js` VM, not the planner. Every named import of the map comes from `migrations.mjs`.
3. ⚪ Pitfall 3 wording. "returns the plan's fork point" is exact only until the plan merges `main`. Here `git merge-base origin/main unit/pb-U2` is `8d07d532`, the second parent of the merge `61bcd123`, not the plan's original branch point. The hazard the sentence draws holds either way (measured below), so no rework; a later edit could read "the plan's fork point, or the last `main` commit merged into it".
4. ⚪ Pitfall 4 edge. The cure covers a rewrap that adds or drops a whole comment line. Moving a trailing comment onto its own line still reads nonzero after the cure (`const a = 1; // note` to `const a = 1;` plus `// note`: `4`), because the strip keeps the trailing space. The adapter does not claim to cover that case.
5. ⚪ The `out` block's line 1 reads `aee7bdf7`, the head before the pass 2 commit; the handoff says so.

## Pitfalls, each read against its source and re-measured

| Pitfall | Source | New text | Measured here |
|---|---|---|---|
| 1 `code.js` under `-diff` | #783 body; `gates-batch-prepr.md:86` | 🟢 `.gitattributes` `-diff` (line 11; `git check-attr` reads `diff: unset`), pass `--text` | `.gitattributes:11` `figma/binder/figma-semantic-binder/code.js linguist-generated -diff`; `check-attr` `diff: unset`. At `74850019` (last `code.js` commit): plain diff `Binary files ... differ`, `--numstat` `-	-`, changed lines `0`; `--text` `3` |
| 2 anchor on `name: "` | `gates-batch-U4.md:27,47`; `gates-batch-prepr.md:86` | 🟢 comment prose in the same file; prefix-tolerant `name: ".*<words>` | `test/repo/em-dash.mjs`, words `two strings` / `template literal`: at `7b953fb4` bare `3` (prose, no fixture), `name: "<words>` `0`, `name: ".*<words>` `0`; at head bare `7`, `name: "<words>` `0` (the `E1 ` prefix defeats it), `name: ".*<words>` `3` |
| 3 unit base | `gates-batch-U4.md:47`; `archive/gates-batch.md:80` | 🟢 merge-base with `origin/main` also lists earlier merged units' files; use `git merge-base plan/<slug> HEAD` | live: a unit cut from `plan/parallel-batch` today (`f0f6c480`) lists 11 files under the `origin/main` merge-base (U1's `citations.mjs` and handoffs, U7's marketing files, plan, board), `0` under the unit base. The four live wave A units read equal on both (6/6, 6/6, 5/5, 3/3), since all were cut before U1 and U7 merged. The builder's scratch repo also reads `2` against `1` |
| 4 comment rewrap | `gates-batch-checkability.md:135`; `gates-batch-U2.md:46`; `docs-stale-batch-checkability.md:73` | 🟢 the strip leaves whitespace-only lines, a rewrap is a false red; drop them on both sides; blind past `//` in a string | real `src/ui/sections/typography.js`, C5's own `diff \| wc -l` form: one continuation line added to the comment at `:151` reads `2` stripped, `0` with blank lines dropped; `export const` to `export let` reads `4` (still discriminates); `data-x="1"` inserted after `xmlns="http://...` reads `0` (the stated blind spot) |

The #783 body says comment-stripped diffs "miss comment rewraps"; the three verdict sources it cites say the strip reds them. The new text follows the sources, which is right.

## Criteria

| Id | Result | Evidence |
|---|---|---|
| C2.1 | 🟢 (🟡 plan text, finding 1) | first grep prints nothing at head; planted export at `:514` prints one line. Second grep exits 1. Third grep exits 1 but is vacuous; substance per finding 2 |
| C2.2 | 🟢 | `self-test: PASS`; count `1`. Pass 1's `:346` control stands (code unchanged) |
| C2.3 | 🟢 | `em-dash: clean (1173 files scanned)`; `ds-export.js` diff from base `0`. Code unchanged since pass 1, which ran the `--fix` clone |
| C2.4 | 🟢 | slice count `5` (`4` or more); paragraph moved after `## 2.` in a clone: `0`; at base `0`. `baseline-agrees` `ok    head:` count `1` at head and `1` at `61bcd123` |
| C2.5 | 🟢 | `61bcd123..f2f2e299` lists `.sdlc/adapter.md`, the handoff, the pass 1 review, `mode-apply-plan.mjs`, `ui.html`, `em-dash.mjs`: the lane plus records and the regenerated bundle. Claims rows for pitfalls 3 and 4 now state the corrected claims, each read against its source above, not by needle |

## Code half unchanged

`git diff --name-only 72d57335 f2f2e299 -- src test figma scripts` prints nothing; `git diff --stat 72d57335 f2f2e299` touches `.sdlc/adapter.md`, the handoff and the pass 1 review only.

## The `ran` block

Rerun under `sh` in a fresh clone (`git clone --shared` of the worktree, `git checkout f2f2e299`, `rev-parse` `f2f2e299`), scratch path redirected to this reviewer's dir: exit 0, matches `out` on every line but line 1 (`f2f2e299` against `aee7bdf7`, finding 5).

## Gates

| Gate | Result |
|---|---|
| `npm test` | 🟢 `✓ all 54 test files passed`, exit 0, `NODE_OPTIONS` unset, probe count `2` at start (bound 5); 1-minute load rose to 50 during the run (other seats). Tree clean after |
| `em-dash.mjs`, `branding.mjs` | 🟢 clean (1173, 1165 files); no U+2014 in `61bcd123..f2f2e299` |
| `.claude/docs/other` | 🟢 absent from the diff |
