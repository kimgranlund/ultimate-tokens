# chroma-envelope U5 handoff (pass 1, trivial lane)

Six comment or prose lines moved in five files. `$B` = 2d313964. No code token, number or fixture body moved.

| # | Evidence | Negative control (value at $B) |
|---|---|---|
| U5-1 | `grep -c 'r\^2.0875'` prints 0, `grep -c 'r\^2.1796'` prints 1 on `test/engine/fixtures/shadcn-baseline.css` | $B prints 1, 0 |
| U5-2 | `re-pinned four EX-2` 0, `re-pinned five EX-2` 1 in `docs/spec/spec-panda-park-ui-exports.md` | $B prints 1, 0 |
| U5-3 | `13 added and 6 removed` 0, `14 added and 7 removed` 1 in `test/engine/anchor.mjs` | $B prints 1, 0 |
| U5-4 | the `15 of 3764` sentence: `peak` 1, `exclu` 1; `in the C6 (v) ratchet` 0 in `CHANGELOG.md` | $B prints 0, 0, 1 |
| U5-5 | `within 0.8 L` clause contains `0.7943` (and 0.4819): 1 | $B prints 0 |
| U5-6 | `measured 7.59 /` 0 in `test/engine/semantic.mjs`; line 302 carries `7.5994 / 4.8740` | $B prints 1 |
| U5-7 | see the commit diff check in the return message | n/a |
| U5-8 | `npm test` exit 0, all 54 test files passed, tree shows only the five edited files; `em-dash.mjs` clean; `branding.mjs` clean | n/a |

Deviations from the plan's commands (each needs a spec fix, none a build defect):
- U5-1: macOS grep treats `r^2` as an anchor, so the written command prints 0 for both values at `$B` and head. Run with `r\^2.1796` (escaped), values above.
- U5-5: `grep -o 'within 0.8 L[^.]*\.'` ends at the first period, so no clause that names a decimal can contain `0.79` inside that match. Checked instead against `within 0.8 L.*Against a kit`.
- U5-6: `node test/engine/semantic.mjs` prints no contrast figures (only pass/fail lines). The Success peak ratios come from the same `brandKit`/`contrastRatio` path the gate uses: peak light 7.5994, dark 4.8740 (perceptual 7.1885 / 5.0700, not the line's table).
- `test/engine/anchor.mjs:529` still says "all 13 were already gap misses at U2's head", beside the corrected 14 added. Out of the six-line scope, left untouched.

## Pass 2 (review FAIL fix, re-diagnosis `chroma-envelope-U5-rediagnosis.md`)

| Item | Value |
|---|---|
| Branch | `unit/ce-U5` on e3e4feaa, pass 2 commit is this file's commit |
| Files | `test/engine/anchor.mjs` (RAMP_GAP_ALLOW comment only), this handoff |
| Fix 1 | `all 13 were` to `all 14 were` (the 14 added are all U2-head gap misses) |
| Fix 2 | `Removed:` names all seven, travel "Sapa" secondary added; `Pass 1's 4 other members` to `3` (Bleak House, Motown, Pop-punk) |

All counts run with `/usr/bin/grep` explicitly (the session `grep` is a shell function), head then `$B` = 2d313964.

| # | Command (re-diagnosis form) | Head | $B |
|---|---|---|---|
| 🟢 U5-1 | `grep -cF 'r^2.0875'`; `grep -cF 'r^2.1796'` on the fixture | 0; 1 | 1; 0 |
| 🟢 U5-2 | `re-pinned four EX-2`; `re-pinned five EX-2` | 0; 1 | 1; 0 |
| 🟢 U5-3 | `13 added and 6 removed`; `14 added and 7 removed`; `all 13 were`; `all 14 were`; `Pass 1's 4 other`; `Pass 1's 3 other` | 0; 1; 0; 1; 0; 1 | 1; 0; 1; 0; 1; 0 |
| 🟢 U5-4 | sentence `peak`; `exclu`; `in the C6 (v) ratchet`; ``tonal.mjs` C6 (v) ratchet)`` | 1; 1; 0; 0 | 0; 0; 0; 1 |
| 🟢 U5-5 | `maximum 0.7943 on peak and 0.4819 on perceptual` | 1 | 0 |
| 🟢 U5-6 | `measured 7.59 /`; line 302 has `7.5994 / 4.8740`; `succ.mjs` prints `peak 7.5994 4.8740` | 0; 1 | 1; 0 |
| 🟢 U5-7 | non-`.sdlc/` files vs `$B`: the five named; `.mjs` non-comment `uniq -u` count | five; 0 | n/a |
| 🟢 U5-8 | `npm test` (heavy count 0 at start) | exit 0, all 54 files passed, tree clean after but the edit | n/a |
| 🟢 U5-8 | `em-dash.mjs`; `branding.mjs` | clean; clean | n/a |

Left out: no code, literal or allow-list entry touched; the other five U5 lines untouched and re-checked above.
