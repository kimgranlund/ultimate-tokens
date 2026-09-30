FAIL

# chroma-envelope U5 review, pass 1 (trivial lane, #725)

Head ac4c8a00 on unit/ce-U5, base $B = 2d313964. Reviewer ran every criterion with its control in the unit worktree. `npm test` exit 0, all 54 test files passed, tree clean after; `em-dash.mjs` and `branding.mjs` clean.

## Findings

| Sev | Finding | Evidence |
|---|---|---|
| High | `test/engine/anchor.mjs:529` says "all 13 were already gap misses at U2's head" beside the U5-3 fix "14 added and 7 removed". The count is stale; the claim is true of all 14. Pre-land pass 2 would red on a 13 against a 14 in one comment. | Set diff of `RAMP_GAP_ALLOW` between `b8142c16` (U3 base, 72 names) and merge `2ab30df7` (79 names): 14 added, 7 removed, matching the header. U2 head `a07cc814` run with `node test/engine/anchor.mjs --full` and a one-line dump of `gapSorted` (89 gap misses): all 14 added names are in it, 0 are not. |
| Low | Plan text defect U5-1: `r^2.0875` is a BRE with `^` mid-pattern on macOS grep, prints 0 for both values at `$B` and head, so the control does not bite as written. | Corrected form `r\^2.0875` / `r\^2.1796`: head 0, 1; `$B` 1, 0. |
| Low | Plan text defect U5-5: `[^.]*` stops at the decimal point in `0.8 L`, so `0.79` can never be inside the match. | Corrected form `grep -o 'within 0.8 L.*Against a kit' \| grep -c '0.79'`: head 1, `$B` 0. The clause reads "within 0.8 L\*, the measured maximum 0.7943 on peak and 0.4819 on perceptual". |
| Low | Plan text defect U5-6: `node test/engine/semantic.mjs` prints no contrast figures, so "the Success light ratio it prints" is unsatisfiable. | Reproduced through the gate's own path (`defaultDocument`, `toneMode`, `brandKit`, `contrastRatio`, the `success` / `onSuccess` pair): peak 7.5994 / 4.8740 (perceptual 7.1885 / 5.0700, even 7.7621 / 4.9426). Line 302 is the peak row and carries `7.5994 / 4.8740`; `measured 7.59 /` prints 0 at head, 1 at `$B`. |
| Low | U5-4 third check (`grep -c 'in the C6 (v) ratchet' CHANGELOG.md`) is vacuous: prints 0 at `$B` too, because the phrase wraps across a line break and carries `` `test/engine/tonal.mjs` `` between "the" and "C6". | Joined-line control `tr '\n' ' ' \| grep -c 'in the `test/engine/tonal.mjs` C6 (v) ratchet'` prints 1 at `$B`, 0 at head. The sentence now reads "a peak count and the set the C6 (v) ratchet excludes". |

## Criteria

| # | Result | Evidence | Negative control |
|---|---|---|---|
| U5-1 | pass (corrected form) | `0`; `1` | `$B`: `1`; `0` |
| U5-2 | pass | `0`; `1` | `$B`: `1` for four |
| U5-3 | pass | `0`; `1` | `$B` has the 13/6 wording (header read) |
| U5-4 | pass (corrected third check) | `peak` 1, `exclu` 1, old phrase 0 | `$B`: peak 0, exclu 0, old phrase 1 (joined form) |
| U5-5 | pass (corrected form) | `1` | `$B`: `0` |
| U5-6 | pass (corrected, figures reproduced) | `measured 7.59 /` 0; line 302 carries 7.5994 / 4.8740 | `$B`: `1` |
| U5-7 | pass | only CHANGELOG.md, the spec, anchor.mjs, shadcn-baseline.css, semantic.mjs outside `.sdlc/`; comment-stripped `.mjs` diff prints `0` | the `["Success", 7.5, 4.8]` row is identical on both sides of the diff (only the trailing comment moved), so the `2` planted-change control was not run |
| U5-8 | pass | `npm test` exit 0, 54 of 54, tree clean; em-dash and branding clean | self-test PASS |

## Fix required

Change `all 13 were already gap misses at U2's head` to `all 14 were already gap misses at U2's head` at `test/engine/anchor.mjs:529`. Comment only; no code token moves. Re-check with `grep -c 'all 13 were' test/engine/anchor.mjs` printing 0 and `grep -c 'all 14 were' test/engine/anchor.mjs` printing 1. The plan's U5-1, U5-4, U5-5 and U5-6 commands need the corrected forms above in the plan text.
