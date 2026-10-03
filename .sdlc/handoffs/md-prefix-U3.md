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

## Pass 2 (after pre-land pass 2, owner ruling A, `.sdlc/questions/md-prefix-revision8.md`)

Builder, trivial lane. Same branch and worktree, cut from `plan/md-prefix` at `18a6d981`. Criteria: plan revision 8, C3.1 to C3.6.

### Files

| File | Change |
|---|---|
| `plugin/ultimate-tokens/.claude-plugin/plugin.json` | F1: the description's `eleven-voice` to `fifteen-voice`; nothing else in the description moved |
| `CHANGELOG.md` | F2: the 0.2.2 entry in `## [Unreleased]` rewritten: first publish since 0.2.1, `--md-*` Material variables (#791), the breaking prime rename (#792), and the plugin changes since 0.2.1 that were verified in the log (#310, #316, #615, #684) |

### Verified before editing

| Claim | Read |
|---|---|
| fifteen is the count | `plugin/ultimate-tokens/README.md:11` ("the fifteen-voice scale"), `skills/typography-tokens/SKILL.md:8,20,49` ("fifteen-voice", "The fifteen-role scale"), `src/engine/type.mjs:2,67` ("Fifteen named voices", "the FIFTEEN named type VOICES") |
| the description reaches the npm package | `scripts/gen-plugin-pack.mjs:64,76` copy `manifest.description` into the in-package `marketplace.json` and the npm `package.json`; nothing else carries the count there |
| 22 plugin commits since 0.2.1 | `git log --oneline e6fca1a9..origin/main -- plugin/ultimate-tokens` (22 lines); `8e7157cd` (#792) edits `skills/color-tokens/SKILL.md` to the bare `-prime`, which `SKILL.md:20-23` now reads; `4ddd76f9` (#310), `17b2d496` (#316), `fcdeb1d6` (#615), `381b8d5c` (#684) each touch `plugin/ultimate-tokens` |
| `plugin.json` `version` was 0.2.1 across that range | `git diff e6fca1a9 origin/main -- plugin/ultimate-tokens/.claude-plugin/plugin.json` changes the description only |

### Ran

Controls ran on throwaway copies under `$CLAUDE_JOB_DIR/tmp/md-U3p2/` (a `git archive HEAD` extract, or a mutated copy of one file), never in the unit tree.

| Id | Command | Evidence | Negative control | State |
|---|---|---|---|---|
| C3.1 | `grep -c '"version": "0.2.2"' plugin/ultimate-tokens/.claude-plugin/plugin.json` | `1` | copy with 0.2.1: reads `0` | 🟢 |
| C3.2 | `unset NODE_OPTIONS`, `node test/plugin/hosted-pack.mjs`, then `npm test` | hosted-pack rc 0 (`hosted-pack PASS, @ultimate-tokens/claude@0.2.2`); `npm test` rc 0, `all 54 test files passed`; `git status --porcelain` lists only `CHANGELOG.md` and `plugin.json` | extract with version `banana`: hosted-pack rc 1, `plugin.json version "banana" is not semver` | 🟢 |
| C3.3 | the awk slice of `## [Unreleased]` to `grep -c '0\.2\.2'`, and to `grep -c md-sys` | `1`; `0` | slice with the 0.2.2 lines dropped: first reads `0` | 🟢 |
| C3.4 | `git diff --name-only $(git merge-base HEAD plan/md-prefix) HEAD` | `.sdlc/handoffs/md-prefix-U3.md`, `CHANGELOG.md`, `plugin/ultimate-tokens/.claude-plugin/plugin.json` | a modified `plugin/ultimate-tokens/README.md` in a scratch index tree: the list grows by that path (four paths) | 🟢 |
| C3.5 | `grep -c 'eleven-voice'` and `grep -c 'fifteen-voice'` on `plugin.json`, `grep -c 'fifteen-voice'` on the README | `0`, `1`, `1` | `eleven-voice` put back in a copy: `1`, `0` | 🟢 |
| C3.6 | the awk slice, `grep -F -A6 '@ultimate-tokens/claude'`, then `grep -c '#792'` and `grep -c 'since 0\.2\.1'` | `1`, `2` | the pass-1 entry (`git show HEAD:CHANGELOG.md`): `0`, `0` | 🟢 |
| Extra | `node test/repo/em-dash.mjs`; `node test/repo/branding.mjs` | `em-dash: clean (1136 files scanned)`; `branding: clean (1128 files scanned)` | U+2014 appended to the README in a git-initialised extract: em-dash reds (`README.md:51`, `FAIL: 1 em dashes`) | 🟢 |

Load before the gates: 0 matching processes (limit 3) for hosted-pack; 2 before `npm test`.

### Notes for the reviewer

- Out of scope, not changed: the repo-root `.claude-plugin/marketplace.json:14` (the GitHub-channel catalog, not in the npm package) still says `eleven-voice scale`. C3.4 allows no other file; a follow-up would need its own unit.
- The pass-1 Breaking prime entry in the CHANGELOG cites #789 for the rename; the commit `8e7157cd` and the criteria cite #792. The new entry uses #792 as C3.6 requires; the older cite is untouched.
- The README's "first publish since 0.2.1" rests on the owner ruling and `plugin.json` having stayed at 0.2.1 through the 22 commits; the builder did not query the npm registry.
