# Verdict A7 adopt-hygiene plan · criteria review · 🟡
verdict: 🟡

Graded by sdlc-verifier on 2026-09-16 against `.sdlc/plans/adopt-hygiene.md` at `sdlc/adopt` @ f9e20c5. Every command was dry-run against the current tree or `origin/main`, and the risky negative controls were run in throwaway worktrees (since removed).
Key: 🟢 checkable as written · 🟡 checkable with the named tweak · 🔴 not checkable.
Tally: 34 criteria. 🟢 20 · 🟡 14 · 🔴 0. No criterion goes back to the planner as uncheckable, but X1 blocks dispatch as written.

## Cross-cutting

| # | Finding | Affects | Tweak |
|---|---|---|---|
| X1 | `.sdlc/` is untracked at f9e20c5 (`git ls-files .sdlc` = 0), so a unit worktree at `.worktrees/<unit>` has no `.sdlc/` | U1-7 (negative control), U1-9, U1-12, U2-1 | commit `.sdlc/` to `sdlc/adopt` before mobilizing, or name the root checkout as the place those four run |
| X2 | the root checkout carries the pre-existing `.claude/settings.json` modification the plan keeps unstaged | P1 at pre-land if run from root | run P1 in a clean worktree, or exclude that path from the status count |

## Plan-level

| # | State | Check I would run / what I found | Tweak |
|---|---|---|---|
| P1 | 🟡 | `npm test` tail + status count. Negative control verified: `"scrim` to `"scrimX` (7 keys) makes `semantic.mjs` exit 1 | X2 |
| P2 | 🟡 | `git ls-files` grep, 0 today. The negative control says "run on `origin/main`", but `git ls-files` reads the index, not origin/main | use `git ls-tree -r --name-only origin/main \| grep -cE '^\.claude/ops/'` (7, verified) |
| P3 | 🟡 | `git diff origin/main --stat` over the walled dirs | the negative control (dropping the exclusion prints 2) only bites once U2's branding line exists; for U1/U3 use a planted edit under `src/` |
| P4 | 🟢 | copy of decision-records.md to `docs/x.md` on origin/main: `FAIL: 3 branding violation(s)` (bit) | none |
| P5 | 🟢 | `grep -cE '^-[^-]'` on the diff; any removed non-blank line counts | none (a removed blank line is not counted; acceptable) |

## U1

| # | State | Check / finding | Tweak |
|---|---|---|---|
| 1 | 🟢 | awk ranges resolve (`## ADR-011 `, `014 `, `017 ` exist); baseline 0,0,0 | none |
| 2 | 🟢 | baseline prints `## ADR-022 —`, `## Quick map` | none |
| 3 | 🟢 | baseline 0, 0 | none |
| 4 | 🟢 | baseline 0 per file, `resolve.mjs` 0 | none |
| 5 | 🟢 | baseline 1, 1 | none |
| 6 | 🟢 | baseline: 2 plans, `status: active` ×2, `todo` counts 8 (adia) and 7 (export-schema); the plan lists them as "7 and 8" | cosmetic: order; note that any revision row containing the word "todo" also counts |
| 7 | 🟡 | first two parts fine. Negative control does not bite today: `git grep` skips untracked `.sdlc/records/index.md`, so origin/main prints 0, not ≥1 | X1 |
| 8 | 🟢 | baseline `not present yet` count 2 | none |
| 9 | 🟡 | cards/ledger paths are under `.sdlc/` | X1 |
| 10 | 🟢 | baseline 0, 0; `scripts/gen-font-test.mjs` exists | none |
| 11 | 🟢 | baseline tracked refs 0 outside `.sdlc`; `docs/reference/reviews/` has no reactivity entry | none |
| 12 | 🟡 | block extraction works (`K18:` then fenced bash). `.sdlc/architecture.md` absent in worktree (X1). The cited `persist.mjs:179-183` is the tail of the v3 case; the v4 snapshot case starts at 183 | X1; fix the line ref |

## U2

| # | State | Check / finding | Tweak |
|---|---|---|---|
| 1 | 🟡 | adapter's first ```` ```markdown ```` fence is §7 (lines 133-157, no nested fences); diff approach sound | X1 (`.sdlc/adapter.md` absent in worktree) |
| 2 | 🟢 | baseline 0, 1 | none |
| 3 | 🟡 | the sum is 12 today; the first grep only proves `html:` appears, not that CLAUDE.md states 12 | grep the convention line for the literal count, e.g. `grep 'html:' .claude/CLAUDE.md \| grep -c '\b12\b'` |
| 4 | 🟢 | baseline 3 (lines 17, 63, 84), 0, 0 | none |
| 5 | 🟢 | baseline 0 | none |
| 6 | 🟢 | negative control on origin/main: `.worktrees/zz/x.md` gives `FAIL: 3 branding violation(s)` (bit). Existing `SKIP_DIRS` has `worktrees`, not `.worktrees` | none |
| 7 | 🟡 | broken as written: without `--`, `git check-attr` reads `linguist-generated` as a pathname, so a `linguist-generated: diff: …` line always survives the filter and the count can never reach 0. With `--` the baseline is 28, not 15. Also "every generated file" omits the two adia artifacts and binder `code.js` (K9's watched set) | add `--` before the paths; restate baseline 28; add or explicitly exclude the adia outputs and binder `code.js` |
| 8 | 🟢 | baseline pages.yml `node-version: 20`, `npm install` | none |
| 9 | 🟢 | baseline 0, 1, `yaml ok` (ruby present), mcp diff 0 | none |
| 10 | 🟢 | baseline `undefined squash` | none |
| 11 | 🟢 | origin/main: preset `local`, exit 0. Token planted: `{"error": "tokens belong to gh auth, never .sdlc/config.json"}`, exit 2. `gh repo view`: `kimgranlund/ultimate-tokens` | none |
| 12 | 🟡 | a unit worktree has no `node_modules`, so `npm run build` exits 127 (`tsc: command not found`). The negative control does not bite: with the P1 role-table corruption, all six gen/bundle steps still exit 0 | run `npm ci` first; replace the negative control with one that fails the build, e.g. an unregistered engine import (bundle preflight throws, shown in A2 K7) or a type error in `src/main.ts` |

## U3

| # | State | Check / finding | Tweak |
|---|---|---|---|
| 1 | 🟡 | baseline 7, 3, 0. The negative control deletes "`.gitignore` line 14", and U2 edits `.gitignore` | delete the `.claude/ops/` line by content, not line number |
| 2 | 🟡 | count of deleted names works (single commit, no blank separators). "Index entries only" is not tested: `--diff-filter=D -- .claude/ops` hides any other path the same commit touches | add `git show --stat --format= <sha> \| grep -c '\|'` = 7 |
| 3 | 🟢 | baseline `[true,true,true]` (survey C6) | none |
| 4 | 🟡 | baseline gone = 15, local = 43, no extra worktrees checked out | record the pre-plan count (43), so the expected value is at most 28 |
| 5 | 🟡 | `git branch -r \| wc -l` = 42 today (includes `origin/HEAD`), not 41 | fix the stated number; the before/after comparison itself is sound |
