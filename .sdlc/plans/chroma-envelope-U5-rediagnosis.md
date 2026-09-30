# chroma-envelope U5 re-diagnosis (pass 2, #725)

Unit/ce-U5 at `e3e4feaa`, base `$B` = `2d313964`. Review pass 1 FAIL: `.sdlc/reviews/chroma-envelope-U5-review.md`. Every figure below was re-measured by this seat (scripts under `$CLAUDE_JOB_DIR/tmp`, run in bash so `grep` is `/usr/bin/grep`).

## Stale figures the pass 2 builder fixes

| File:line | Current text | True text | Proof |
|---|---|---|---|
| `test/engine/anchor.mjs:530` | `and all 13 were already gap misses at U2's head` | `and all 14 were already gap misses at U2's head` | set diff of `RAMP_GAP_ALLOW` `b8142c16` (72) vs `2ab30df7` (79): 14 added, 7 removed. `git archive a07cc814` (U2 head), `node test/engine/anchor.mjs --full` with `gapSorted` dumped: 89 gap misses, all 14 added names present, 0 absent |
| `test/engine/anchor.mjs:532` to `:537` | `Removed: ` names six (Chocolate, The Godfather, Studio 54, Hidaka coast, Khumbu, Lake Baikal) beside `7 removed`; the seventh, travel "Sapa" secondary, sits in the next sentence as one of `Pass 1's 4 other members` | `Removed:` names all seven, Sapa included (`travel "Sapa" secondary (peak 0.605, 0.442 at U2)`), and the pass 1 sentence reads `Pass 1's 3 other members` (Bleak House tertiary-muted, Motown tertiary-muted, Pop-punk secondary) | same set diff: the 7 removed are Chocolate, Godfather, Studio 54, Sapa, Khumbu, Hidaka coast, Lake Baikal. Sapa IS in the U2 head's 89 gap misses (so it is a real removal, not a pass 1 only entry); Bleak House, Motown and Pop-punk secondary are in neither list |

Everything else swept is exact, no edit:

| Claim | Status | Proof |
|---|---|---|
| `anchor.mjs:642` RAMP_DISTINCT_ALLOW `16 -> 19, 6 added and 3 removed`, the six added `already duplicate-hex at U2's head` (four) or `duplicated peak 925&950 at U2's head` (two), Patmos and Viennese kaffeehaus `already not reproduced at U2's head` | 🟢 exact | set diff `b8142c16` (16) vs `2ab30df7` (19): 6 added, 3 removed, names match. U2 head `distinctSorted` (31): all 6 added present; Wadi Rum present, Patmos and Viennese absent |
| `anchor.mjs:528` `72 -> 79, 14 added and 7 removed`, Khumbu and Lake Baikal `already not reproduced at U2's head` | 🟢 exact | set diff above; U2 head gap set: Khumbu and Lake Baikal absent, the other five present |
| `shadcn-baseline.css:77` `residue r^2.1796` | 🟢 exact | `Math.log(1 - 0.9275) / Math.log(0.3)` = 2.1796 (`OKHSL_DAMP_RESIDUE_EXP`, `src/engine/tonal.js:446`) |
| spec `:504` `re-pinned five EX-2 literals` | 🟢 exact | the parenthesis names five: `primary.DEFAULT._dark`, two `primary.hover`, `neutral["on-surface"].base`, `data-1.DEFAULT.base` |
| `semantic.mjs:302` `measured 7.5994 / 4.8740` | 🟢 exact | the gate's own path (`defaultDocument`, `toneMode = "peak"`, `brandKit`, `kit.roles.success.{success,onSuccess}`, `contrastRatio`): 7.5994 / 4.8740 (perceptual 7.1885 / 5.0700, even 7.7621 / 4.9426) |
| CHANGELOG `:22` `15 of 3764, a peak count and the set the C6 (v) ratchet excludes, counted in test/engine/tonal.mjs` | 🟢 consistent | `node test/engine/tonal.mjs --full`: 72 excluded, `0/3692` measured, 3692 + 72 = 3764; the 15 is the U4 verdict's exclusion-off figure and `tonal.mjs:1930`'s own comment (`15/3764 with it off`), not re-measured here |
| CHANGELOG `:28` `maximum 0.7943 on peak and 0.4819 on perceptual` | 🟢 matches record | `.sdlc/verdicts/chroma-envelope-U4.md:68` probe (`PROBE peak max 0.7943`, `perceptual 0.4819`), not re-measured here |

## Corrected U5 commands (plan text)

The harness's `grep` is a shell function over ugrep, which reads `^` mid-pattern as an anchor; `/usr/bin/grep` reads it literally. Every corrected form below prints the same in both.

| # | Corrected command | head | `$B` |
|---|---|---|---|
| U5-1 | `grep -cF 'r^2.0875' test/engine/fixtures/shadcn-baseline.css; grep -cF 'r^2.1796' test/engine/fixtures/shadcn-baseline.css` | `0`; `1` | `1`; `0` |
| U5-3 | add: `grep -c 'all 13 were' test/engine/anchor.mjs; grep -c 'all 14 were' test/engine/anchor.mjs; grep -c "Pass 1's 4 other" test/engine/anchor.mjs; grep -c "Pass 1's 3 other" test/engine/anchor.mjs` | `0`; `1`; `0`; `1` | `1`; `0`; `1`; `0` |
| U5-4 third | `grep -c 'tonal.mjs\` C6 (v) ratchet)' CHANGELOG.md` (the old sentence, on one line at `$B`) | `0` | `1` |
| U5-5 | `grep -c 'maximum 0.7943 on peak and 0.4819 on perceptual' CHANGELOG.md` | `1` | `0` |
| U5-6 | `grep -c 'measured 7.59 /' test/engine/semantic.mjs; sed -n 302p test/engine/semantic.mjs \| grep -c '7.5994 / 4.8740'`; the figure itself from the gate path: `node -e` over `defaultDocument`/`brandKit`/`contrastRatio` with `toneMode = "peak"` on `kit.roles.success` (script `$CLAUDE_JOB_DIR/tmp/succ.mjs`) prints `peak 7.5994 4.8740` | `0`; `1` | `1`; `0` |

U5-2, U5-7, U5-8 stand as written.

## Root cause

The U5-3 fix edited the two numbers the plan's grep named and never re-read the sentence they anchor, and the plan's commands were written without a run in the reviewer's shell (ugrep semantics, `[^.]*` stopping at a decimal, a gate that prints no figures).
