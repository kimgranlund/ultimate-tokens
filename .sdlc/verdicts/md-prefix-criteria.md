---
kind: criteria-review
plan: md-prefix
seat: verifier
pass: 1
ticket: none yet
written: 2026-10-03
---

# md-prefix criteria review · pass 1 · 🔴 at `65ad60d0`

Current state: pass 1 🔴 at `65ad60d0`. Five of twelve rows are not checkable as written (C1.3, C1.4, C2.1, C2.2, C2.3); the plan is not mobilizable until they are repaired. Q1 and Q2 graded against their recommended answers (A, A): C1.8 is in scope, C1.9 is not.

verdict: 🔴
sha: 65ad60d0

## Pass 1 · 🔴 at `65ad60d0`: draft

Plan `.sdlc/plans/md-prefix.md` at `65ad60d0`, graded by the Verifier seat directly. Every Today value and cited line was rerun on the root at `b7332999` (the plan's head). 🟢 means I can name now the command that fails if the unit is missing or wrong. 🔴 means the row as written cannot be graded: its Today or a named symbol is false, it passes without the unit, or its control reds a different row.

### Rows

| # | State | Evidence | Negative control |
|---|---|---|---|
| C1.1 | 🟢 | `git grep -c md-sys -- src test mcp figma/binder figma/plugin/code.js scripts` today: 57 lines over 12 files (settings.js 8, tests 35, engine comments 7, drawer 1, `describe-mcp-assets.js` 4, ds-export 2). "40+" holds. `settings.js:119` is the apply line today. | Leave the `:119` triple: grep prints it. Runnable. |
| C1.2 | 🟢 | `grep -c md-sys` prints `figma/plugin/ui.html:19`, `src/ui/describe-mcp-assets.js:4`, matching Today. | Grep before regenerating: counts nonzero. Runnable. |
| C1.3 | 🔴 | Every emitter takes the prefix as an argument (plan section 1), so a script that passes `colorPrefix:"md-color"`, `prefix:"md-typescale"`, `prefix:"md"` produces the new forms on today's engine. The row is true without the unit; its own Today column says so. The control (revert test edits, C1.1 reds) reds C1.1, not C1.3. | Gap: the new forms only depend on the unit through the preset. Check the preset's output instead (apply Material via the settings path, then export), which reads `md-sys-*` today, with control: put the old triple back, the new forms vanish. Or fold this into C1.4. |
| C1.4 | 🔴 | `rxr4` exists in `test/ui/headless-boot.mjs` and asserts `--md-sys-color-*` today (lines 1850, 1852). But `_schemeId()` does not exist: `grep -n _schemeId src/ui/overlays/settings.js` prints nothing; the detector is `_namingScheme()`. | Gap: name `_namingScheme()`. Control (old triple back in settings.js, rxr4 reds) then runs. |
| C1.5 | 🟢 | UI3 names never carry the CSS prefix (plan section 2; `git grep md-sys -- figma/binder figma/plugin/code.js` is empty). Byte compare is observable. | Inject the prefix into a UI3 name: names differ. Runnable. 🟡 the diff base is `origin/main`, not the merge-base; once #789 lands main moves, so use `$(git merge-base origin/main HEAD)` as C1.6 does. |
| C1.6 | 🟢 | Default `exportCSS` hash HEAD versus merge-base: observable. | Change the default `colorPrefix`: hashes differ. |
| C1.7 | 🟢 | `npm test` exit, porcelain empty: observable. | Leave a generated asset stale: tree dirty. Runnable. |
| C1.8 | 🟢 | `serialize` (`persist.js:487`) and `hydrate` (`:496`) exist; the exact old triple returns `md-sys-*` today, so the first assertion reds without the unit. | Drop the rewrite: first assertion reds. |
| C2.1 | 🔴 | `git grep -c md-sys -- plugin .claude/skills docs/marketing` today: 17 lines over 13 files (plugin 8, geometry-system skill 2, marketing 7). Today says "10 hits (plugin 7, skill 2, marketing 6)", which is neither the line count nor its own sum. Command and control (`token-integrator.md:35` is a hit) are runnable. | Gap: correct Today to the measured count. |
| C2.2 | 🔴 | `npm test` exits 0 today and after the unit; no `test/plugin/` file greps `md-sys` (C1.1's `test` pathspec finds none there), so plugin parity cannot see the rename. The control reds C2.1, not C2.2. | Gap: either drop the row (C2.1 owns the needle) or give a control that reds `npm test`, as the adapter §1 control does in C2.4. |
| C2.3 | 🔴 | No command: "one new entry naming ... and saying old names are not kept" is a reading. The control's needle `--md-*` in the Unreleased slice reads 0 today (`grep -cF -- '--md-*'`), so it could be the check. Also `CHANGELOG.md:438` is inside the `## [Unreleased]` section (slice line 429), not a released entry: "left as history" leaves an unreleased note describing `--md-sys-*` that will be false at release. | Gap: state the command (`awk` Unreleased slice, `grep -cF -- '--md-*'`, at least 1, today 0; control: drop the entry, 0), and rule whether the `:438` Unreleased text is rewritten or kept. |
| C2.4 | 🟢 | `node test/repo/em-dash.mjs`, `node test/repo/branding.mjs` exit 0 today. | Add a U+2014 to a touched file: em-dash exits 1. |

### Findings

- 🔴 C1.3, C1.4, C2.1, C2.2, C2.3 not checkable as written (above). Repair and resubmit for pass 2.
- 🟡 Controls cite line numbers (`settings.js:119`, `token-integrator.md:35`, `SKILL.md:43`, `CHANGELOG.md:438`); all are correct at `b7332999`, but #789 lands first and edits `CHANGELOG.md`, so `:438` will move. Symbols or needles survive the rebase.
- 🟡 Q1 A rewrites stored prefixes inside `hydrate`. The plan calls it a migration, not an alias; whether that meets R98 is the owner's ruling, not a criteria question.
