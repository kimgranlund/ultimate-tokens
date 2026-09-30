PASS

# Review chroma-envelope U4 (#725) pass 2 · reviewer-l3

| Field | Value |
|---|---|
| Branch | unit/ce-U4 @ 880585a5, pass 1 head 5aa90430, unit base febaa601 |
| Graded against | plan C4.1 to C4.5 (revision 9); pass 1 verdict findings 1 to 3; `.sdlc/plans/chroma-envelope-U4-rediagnosis.md`; handoff pass 2 section |
| Where it ran | a throwaway clone of the worktree at 880585a5 (`$CLAUDE_JOB_DIR/tmp/rv`); probe lines added to the clone's `scripts/report-preset-fidelity.mjs` and two scratch scripts, all reverted, clone tree clean after (`git status --short \| wc -l` = 0) |
| Heavy suite | load count `0` before the run; `npm test` in the clone: `✓ all 54 test files passed`, status 0, 1:33 total, tree clean after |

## Claims reproduced over `afd415c0`

Command: `node scripts/report-preset-fidelity.mjs --identity-control --authored --base afd415c0` (exit 1, as the moved modes must), with probe lines in the compare loop for stop 500, the hold residual, and the base drift.

| Record sentence | Evidence | Negative control | State |
|---|---|---|---|
| CHANGELOG "90 to 91% of cells move: 86008 of 94500 perceptual and 85463 of 94500 peak"; ADR "3780 of 3780 palettes and 86008 of 94500 cells, peak 3780 of 3780 and 85463 of 94500" | `identity perceptual: 3780/3780 palettes, 86008/94500 cells differ, max dL* 2.4410` · `identity peak: 3780/3780 palettes, 85463/94500 cells differ, max dL* 2.3142` (91.0%, 90.4%) | pass 1 verdict: `--base b8142c16` prints `76998` / `75804`, so the base flag discriminates; ADR-026 grep `76998\|75804\|3779` = `1` at 5aa90430, `0` at head | 🟢 |
| ADR default kit "16 of 16 palettes and 347 of 400 cells, peak 16 of 16 and 352 of 400, even 0 of 16"; "even 0 in both"; CHANGELOG "Even mode does not move" | `identity perceptual default kit: 16/16 palettes, 347/400` · `identity peak default kit: 16/16 palettes, 352/400` · `identity even: 0/3780 palettes, 0/94500` · `identity even default kit: 0/16 palettes, 0/400` | same run reports `172170 differing cells` on the moved modes, so the even `0` comes from a compare that ran | 🟢 |
| CHANGELOG "stop 500 moves in one palette of 3780 per mode (film "The Night of the Hunter" primary, `#1C1B1E` to `#1B1C1E`, one code on R and on G)" | `PROBE corpus perceptual: stop500 moved 1 [film/The Night of the Hunter ... /primary #1C1B1E->#1B1C1E]`, peak the same, kit `0` both. R `1C`→`1B`, G `1B`→`1C`, B equal | even mode in the same probe: `stop500 moved 0` | 🟢 |
| CHANGELOG "a damped stop keeps the CIE L\* it had before the envelope was applied (to within 0.8 L\*)" | `PROBE corpus perceptual: tt 94500 holdMax 0.4819` · `PROBE corpus peak: tt 94500 holdMax 0.7943` · kit `0.2118` / `0.2115`. `holdTone` (`tonal.js:1095`) sets `target` from the undamped colour, so `toneTarget` is the pre-envelope L\* | base engine against the same target: `baseMax 2.4290` / `2.2158`, so the residual metric sees drift when it is there | 🟢 |
| Builder's report that the re-diagnosis swapped the hold maxima | confirmed: perceptual `0.4819`, peak `0.7943`; the re-diagnosis's "0.7943 perceptual, 0.7 peak" is wrong. The record says only "within 0.8", true either way | the same probe on the base engine reads `baseMax 2.4290` / `2.2158`, so the hold metric separates engines per mode | 🟢 |
| CHANGELOG "a cell's L\* moves by up to 2.4 ... the lightness drift the old chroma coupling carried" | `max dL* 2.4410` / `2.3142`; cells over 1 L\*: `792` perceptual, `401` peak; base off-target `2.4290` / `2.2158` | see above | 🟢 |
| CHANGELOG "on the cap's own path no stop's envelope reads above stop 500's" | `--envelope` reading (b): perceptual and peak `above 100% of stop 500: 0 OK`, each followed by `(16 additional instance(s) from the named Adia carve-out, exempt from this clause)` | even reading (a) on the anchored rows reports `502 (reported, not barred)`, so the counter fires | 🟢 (wording, L1) |
| CHANGELOG "a near-grey palette's white stop 50 can still read above its stop 500 (15 of 3764 in the `test/engine/tonal.mjs` C6 (v) ratchet)" | `peak (gated in test/engine/tonal.mjs C6 (v)): 15/3764 violator(s), max 2.023757x`. Scratch listing of the 15: every one is stop `50:#FFFFFF:2.869` over a stop 500 chroma of 1.42 to 2.15, e.g. Boston City Hall tertiary-muted `c500 2.145`. Full 25-stop authored peak export: `31/3780` = `{"white":15,"adia":16}`, nothing else | pass 1 verdict: the same probe at `afd415c0` reads `3134` palettes over stop 500 | 🟢 |
| CHANGELOG "0.74 at stops 300/700 and 0.23 at 100/900" | reading (b) perceptual and peak: `stop 300: median 74.3%`, `stop 700: median 74.3%`, `stop 100: median 23.0%`, `stop 900: median 23.0%` | pass 1 verdict: d 0.919 reads `0.2375 0.7458` | 🟢 |
| CHANGELOG `c` = log2 3, `d` 0.9275; ADR `r^2.1796` | `OKHSL_DAMP_D 0.9275`, `OKHSL_DAMP_RESIDUE_EXP 2.179591355961476`, `OKHSL_DAMP_CURVE_GAIN * 1.5 = 1.584962500721156 = Math.log2(3)` | pass 1 verdict: d 0.919 gives exp `2.0875` | 🟢 |
| CHANGELOG floors "peak Success light to 7.5, perceptual Data 3 dark to 4.8" | `semantic.mjs:302 ["Success", 7.5, 4.8]` (under `peak:`), `:371 ["perceptual", "Data 3", "dark", 4.8]` | pass 1 verdict: floor 7.6 exits 1 | 🟢 |
| CHANGELOG "eighth `gate:sweeps` member" | `package.json` `gate:sweeps` runs 8 `npm run gate:*`, last `gate:chroma-envelope` | pass 1 verdict: base passage names five | 🟢 |

## Criteria and gates

| Id | State | Evidence | Negative control |
|---|---|---|---|
| C4.1 | 🟢 | ADR-026 amendment counts now over `afd415c0` and name the command; `grep -c '86008.*85463\|347 of 400'` in the ADR-026 section = `2`; old-count grep = `0` | old-count grep at 5aa90430 = `1` |
| C4.2, C4.5 | 🟢 | untouched since pass 1 (`git diff 5aa90430..HEAD --stat` lists only CHANGELOG, decision-records, the two reactivity docs, the handoff) | pass 1 verdict rows |
| C4.3 | 🟢 | CHANGELOG block carries the cap, retune, tone hold, `gate:chroma-envelope`, R69, and every figure above reproduces | pass 1 verdict: base grep `725` = 0 |
| C4.4 | 🟢 | `citations.mjs`: `STALE 0 across 10 discovered docs + 11 fact pins (HEAD 880585a5)`; `em-dash: clean (1012 files scanned)`; `branding: clean (1004 files scanned)`; added-line U+2014 count in `git diff febaa601 HEAD` = `0` | clone: `00-synthesis.md` pin moved to `tonal.js:1126`, `citations.mjs` exit 1; planted U+2014 in `CHANGELOG.md`: `FAIL: 1 em dashes outside inline code spans in 1 files` |
| Finding 3 (cites) | 🟢 | `audit-citations.mjs`: both `00-synthesis.md:89` and `04-context-and-messaging.md:71` `OK ... matched okhslLAt at src/engine/tonal.js:1026`; `sed -n 1026p` = `export function okhslLAt(lstar) {` | pin at `:1126` exits 1 (above) |
| Lane | 🟢 | `git diff febaa601 HEAD -- src scripts \| wc -l` = `0` | the clone's probe edit showed in `git status` until reverted |

## Findings

1. 🟡 L1 (wording, non-blocking). The CHANGELOG sentence "on the cap's own path no stop's envelope reads above stop 500's; on an anchored export a near-grey palette's white stop 50 can still read above its stop 500 (15 of 3764 ...)" is true as scoped, but two scopes are implicit: the 16 Adia carve-out instances (dampAmp above 0, the shoulder term) are exempt and unnamed, and the 15 is a peak figure while the sentence names no mode. In perceptual, emitted chroma above stop 500 is common (`2892/3780` palettes on the 25-stop authored export, by design; the envelope multiplier is what stays at or under 1). A reader could take the 15 as the perceptual count too. A one-word fix at the close step: "a near-grey palette's white **peak** stop 50" and "(dampAmp 0)". Not a false figure, so not a FAIL.
2. The re-diagnosis's hold maxima were swapped as the builder said: perceptual `0.4819`, peak `0.7943`. The record's "within 0.8 L\*" is true.
3. Carried over from pass 1 finding 5: `semantic.mjs:302`'s comment says `7.59` while the cell prints `7.60:1`; outside U4's lane, a close-step follow-up.
