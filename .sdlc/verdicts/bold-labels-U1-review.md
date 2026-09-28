PASS

# Review: bold-labels U1 pass 1 (#752)

Head `bfb7e4b2` on `unit/bl-U1`, base `0b551835` (merge-base with `plan/bold-labels`). Criteria read at `plan/bold-labels` revision 3 (`105d7a28`). Every row below was run by the reviewer, not copied from the handoff.

## Criteria

| Row | Evidence (reviewer's own run) | Expected | State | Negative control |
|---|---|---|---|---|
| U1-1 | removed `31`, added `3` | `31`, `3` | 🟢 | the base side of row 31 (`storage-and-sync-spec.md`) is one of the 31; the builder's control (30 without it) holds by arithmetic, and the three added are K1, K2, K18 (read in the diff) |
| U1-2 | `18` rows, `11` distinct files | `18`, `11` | 🟢 | the reviewer diffed the tsv against the plan's Kept table: same 18 file and label pairs, no missing or extra row; dropping K17 (`prose.md`) would read 17 and 10 |
| U1-3 | `12` at head, `0` at base | `12` | 🟢 | base reads `0` for the same pattern |
| U1-4 | head sum `10`, base sum `0` | base + 10 | 🟢 | base sum `0`, so a skipped row leaves the sum at `0` |
| U1-5 | runner lines `plugin/color-tokens.mjs pass`, `plugin/typography-tokens.mjs pass`, `plugin/geometry-tokens.mjs pass` | 3 | 🟢 | runner would name any failing file; see note 1 on the command's literal text |
| P1 | predicate reads `57` at head, `85` at base; every tsv row is a live hit (`diff` prints zero `<` lines) | `57` | 🟢 | probe line `README.md<TAB>**Probe**` added to the hit list: count `58` and a `>` line for `README.md` appears; the 39 other `>` lines are exactly U2's 32 store-copy labels and U3's seven wall lines |
| P2 | `em-dash: clean (807 files scanned)`, exit 0; added lines carrying U+2014: `0` | clean, `0` | 🟢 | the gate's own `self-test: PASS` plants a dash and expects red; the grep on a planted `x U+2014 y` line counts `1` |
| P3 | `branding: clean (799 files scanned)`; added bold-label lines `30`, removed `31` | added = removed minus 1 | 🟢 | a planted `**Planted**: text` would make added `31`, equal to removed; the one-short gap is row 29 (`run **npm test**;`) as the plan says |
| P4 | files outside the wall: `0`; files under `src test scripts figma mcp/*.mjs package*`: `2` (`figma/plugin/ui.html`, `src/ui/mcp-assets.js`) | `0`, and only the two regenerated bundles | 🟢 | a path outside the allow-list (for example `docs/spec/planted.md`) matches no `-e` pattern and would print `1`; the two bundles are admitted by revision 3 because `mcp/README.md` is bundled |
| P5 | `line-for-line` | line-for-line | 🟢 | awk on a synthetic `1 2 file` numstat row prints `UNEQUAL` and exits 1 |
| P6 | full `npm test` in the worktree: `all 53 test files passed`; `git status --short` after: `0` lines | green, clean | 🟢 | the em-dash sub-gate self-test and the per-file runner would name any red; host load average 75 to 133 stretched the run well past 90 s, and it still finished green with no timeout or retry |
| P7 | `1`, `1`, `1` | `1`, `1`, `1` | 🟢 | at the base the same three greps read `0` (the old lines had a comma after the label) |
| P8 | live URL count in `README.md`: head `3`, base `3` | equal | 🟢 | removing the URL from the line makes head `2`, below base `3` |
| count | predicate over tracked `.md` outside `.sdlc/`: `57` | `85 - 28` | 🟢 | base reads `85` |

## Spot-read of kept and rewritten rows against the Enumeration

| Row | Read | Result |
|---|---|---|
| K1, row 5 (`voice-platform.md`) | now `**Layer 2, the judged axes**, scored 1-5.` with the trailing `, scored` an appositive | 🟢 matches the plan's rewrite text |
| K2, row 6 (`typography/README.md`) | now `**2026-07-13: size is now a FIXED, hand-authored table**, not a modular scale:` | 🟢 matches |
| K18, row 31 (`storage-and-sync-spec.md`) | now `**hosted-MCP use**, or **sign-in**. After that trigger the device's docs replicate and stay replicated.` | 🟢 matches, line count unchanged |
| Row 29 (`best-practices.md`) | now `run **npm test**; its commit body literally records ...` | 🟢 matches |
| Row 30 (`CHANGELOG.md`) | now `**Primary accent**: ...` and the parenthetical stays on its two lines | 🟢 matches |
| Rows 1 to 4, 19 to 28 | colon after each label, remainder unchanged | 🟢 read in the diff |

## Walls

| Wall | Evidence | Result |
|---|---|---|
| prompt-audit | no diff line touches `geometry-system`, `type-scale`, `maintaining-brand-kit-mcp`, `adding-semantic-roles`, or `typography-tokens/references/prose.md` (K17, in the tsv only) | 🟢 |
| docs-repair | `docs/reference/references/ui-plan.md` not in the diff; `README.md` change is line 6 only | 🟢 |
| store-copy (U2) | `docs/marketing/store-copy.md` not in the diff | 🟢 |

## Notes for the Orchestrator

1. U1-5's literal command greps `^✓ .*plugin/...`, but `test/run.mjs` prints per-file lines as `▶ plugin/color-tokens.mjs  pass`; run as written it reads `0`. The substance (three files pass) is confirmed above. The plan's command text should read `▶ ... +pass`. Not a builder defect.
2. The handoff's U1-2 table still lists expected `12`; revision 3 corrected it to `11`, which the builder's `11` matches. Stale handoff text only.
3. The handoff's P4 note is correct: `npm test` regenerates `src/ui/mcp-assets.js` and `figma/plugin/ui.html` from `mcp/README.md`, and both are committed.

No findings that block. The 39 remaining predicate hits are exactly U2's 32 and U3's 7.

verdict: 🟢
