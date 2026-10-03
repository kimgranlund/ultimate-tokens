PASS

# Review md-prefix U3 · #791 Consumer plugin bump to 0.2.2

Reviewer, trivial lane, pass 1. Branch `unit/md-U3` at `9478e2c0`, base `17576b00`. Controls ran on throwaway copies under `$CLAUDE_JOB_DIR/tmp`, never in the unit tree.

## Criteria

| Id | Command | Expected | Evidence | Negative control | State |
|---|---|---|---|---|---|
| C3.1 | `grep -c '"version": "0.2.2"' plugin/ultimate-tokens/.claude-plugin/plugin.json` | `1` | `1` | 0.2.1 in a copy: reads `0` | 🟢 |
| C3.2 | `node test/plugin/hosted-pack.mjs` (`npm test` skipped, builder ran it) | exit 0, tree clean after | rc 0, `hosted-pack PASS, @ultimate-tokens/claude@0.2.2`; `git status --short` empty after | version `banana` in a copy: rc 1, `plugin.json version "banana" is not semver` | 🟢 |
| C3.3 | awk slice of `## [Unreleased]` to `grep -c '0\.2\.2'`, and to `grep -c md-sys` | at least `1`; `0` | `1`; `0` (`md-sys` is also `0` over all of `CHANGELOG.md`) | entry line removed in a copy: first reads `0` | 🟢 |
| C3.4 | `git diff --name-only 17576b00 HEAD` | plugin.json, CHANGELOG.md, the handoff (plus this record) | `.sdlc/handoffs/md-prefix-U3.md`, `CHANGELOG.md`, `plugin/ultimate-tokens/.claude-plugin/plugin.json` only | `plugin/ultimate-tokens/README.md` touched in a copy: `diff -rq` count grew from `4` to `5` | 🟢 |

## Diff checks

- U+2014 in the diff: `0`.
- `md-sys` in the diff: 2 hits, both in `.sdlc/handoffs/md-prefix-U3.md`, quoting the C3.3 command text; none in `CHANGELOG.md` or `plugin.json`. The U1 and U2 handoffs quote it the same way, so this is not a defect.
- `plugin.json`: one-line change, `"version"` `0.2.1` to `0.2.2`, nothing else.
- CHANGELOG line sits inside `## [Unreleased]` (header at line 9, next release header at line 743, entry at line 27), directly after the #791 Breaking entry. It is accurate: the plugin is 0.2.2 and the skill text names `--md-*`.

## Findings

None blocking.
