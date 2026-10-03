# Handoff md-prefix U3 · #791 Consumer plugin bump to 0.2.2

Builder, pass 1, trivial lane. Branch `unit/md-U3`, worktree `.worktrees/md-U3`, cut from `plan/md-prefix` at `17576b00`. Owner ruling: `.sdlc/questions/md-prefix-plugin-version.md`, answer A. The handoff is in the head commit with the code.

## Files

| File | Change |
|---|---|
| `plugin/ultimate-tokens/.claude-plugin/plugin.json` | `"version"` `0.2.1` to `0.2.2` (that line only; the npm pack takes its version from it) |
| `CHANGELOG.md` | one entry in `## [Unreleased]` under 2026-10-03 "Changed", right after the #791 Breaking entry: the consumer plugin `@ultimate-tokens/claude` is 0.2.2 and its skill text now names the `--md-*` Material variables (#791) |

Not touched: `.sdlc/board.md`, the plan file, `src/`.

## Ran

Controls ran in the unit tree, each a one-line mutation of a file backed up under `$CLAUDE_JOB_DIR/tmp/md-U3/bak`, restored with `cp` and checked byte-identical (`cmp`) before commit.

| Id | Command | Evidence | Negative control | State |
|---|---|---|---|---|
| C3.1 | `grep -c '"version": "0.2.2"' plugin/ultimate-tokens/.claude-plugin/plugin.json` | `1` | 0.2.1 put back: reads `0`; restored | 🟢 |
| C3.2 | `unset NODE_OPTIONS`, `node test/plugin/hosted-pack.mjs`, then `npm test` | hosted-pack rc 0, `hosted-pack PASS, @ultimate-tokens/claude@0.2.2`; `npm test` rc 0, `all 54 test files passed`; `git status --porcelain` lists only the two edited files | version set to `banana`: rc 1, `plugin.json version "banana" is not semver`; restored | 🟢 |
| C3.3 | the awk slice of `## [Unreleased]` piped to `grep -c '0\.2\.2'`, and to `grep -c md-sys` | `1`; `0` (`md-sys` also reads `0` over all of `CHANGELOG.md`) | new entry dropped: first reads `0`; restored | 🟢 |
| C3.4 | `git diff --name-only $(git merge-base HEAD plan/md-prefix) HEAD` | `.sdlc/handoffs/md-prefix-U3.md`, `CHANGELOG.md`, `plugin/ultimate-tokens/.claude-plugin/plugin.json` (the review record does not exist yet) | `plugin/ultimate-tokens/README.md` touched: the unit diff against the merge-base lists it as a fourth path (`git status --porcelain` showed it); `git checkout` restored | 🟢 |
| Extra | `node test/repo/em-dash.mjs`; `node test/repo/branding.mjs` | `em-dash: clean (1133 files scanned)`, `branding: clean` | U+2014 appended to `plugin/ultimate-tokens/README.md`: `node test/repo/em-dash.mjs` reds; restored with `git checkout` | 🟢 |

Load before the gates: 2 matching processes (limit 3), so `npm test` ran straight away.

## Notes for the reviewer

- C3.3 first command reads `1`: the slice holds one `0.2.2`, the new entry.
- The entry avoids the retired maker brand, the string `md-sys` and U+2014.
