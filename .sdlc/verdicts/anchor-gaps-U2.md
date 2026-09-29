---
kind: verdict
plan: anchor-gaps
unit: U2
ticket: "#744"
branch: unit/ag-U2
base: 9f981140
grade: verifier-l2, the evidence run dispatched by the Verifier seat
pass: 2
written: 2026-09-29
---

# Verdict anchor-gaps U2 · 🔴 · the tree meets U2-1 to U2-5 and the re-freeze is exact; the handoff credits the hue-0 even keys to the wrong ticket

verdict: 🔴
sha: a333fa9ed989f907fd9de98b03761e7c224ffbcb

`unit/ag-U2` at `a333fa9e`, base `9f981140` (= `git merge-base origin/plan/anchor-gaps a333fa9e`). Evidence run: verifier-l2 (opus) in fresh clones. `verdict.py check` passes on the handoff and on `.sdlc/reviews/anchor-gaps-U2-review.md`, both created by the unit. The seat re-ran the red row itself.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U2-1 | 🟡 | probe `36 36 #FFFFFF [1,0,0]`; the word diff of `brands.js` is one token pair, `"hue":0` to `"hue":36`; numstat prints `- - src/ui/categories/brands.js`, the only file. Met; the plan's `1 1` cannot print for a binary-attributed file | base prints `0 36 #FFFFFF [1,0,0]`; Baikal's dominant swatch set neutral moves `travel.js` (`secondary 47 47`); the generator hunk reverted gives `brands.js == base bytes` |
| U2-2 | 🟢 | `6`, `1`, `0`, `1`; one chroma-0 value (`1.000 0 0`) across `2028`; `deriveNeutral` `36.428` with and without it | base prints `0` for `fallbackHue`; JSON set to `"1.000 0 36"` flips the last two legs to `1`, `0` |
| U2-3 | 🟡 | `25 27.28 86.00 2 2.77 500:#F1F1F1 650:#B8988F 900:#3A211A`, stop 650 hue `35`; fields 2 and 5 inside bounds. Field 3 is `86.00`, not the plan's `98.38`: the twin follows the stored hue (`twinAtHue0Max 98.38` when forced to 0) | base `25 33.21 98.38 7 ...`, stop 650 hue `360`; field 2 reds the `28.00` bound |
| U2-4 | 🟢 | `PASS: tonal-generation clears all [gate] predicates` and `PASS (FULL): C2, C3, C4 ...`, exit 0; `physical 22 unique 22 hue0 0`. An instrumented FULL run dumped `missing` = the five hue-0 keys and `dup` = the four hue-36 pairs, so the list is the gate's own output | two `peak\|0` keys added back: `(C6 ii) 2 of the 24 cited baseline duplicates were not observed`, exit 1; the hue-36 peak key dropped: `(C6 ii) peak: 1 duplicate-hex pair(s) beyond the cited list`, exit 1 |
| U2-5 | 🟢 | `#744` in CHANGELOG `1`; `ok    ui.html: baseline 4133.1 KB, tree 4133.1 KB`; the one STALE line is the time row, inherited from base | base with main's cell: `STALE ui.html: baseline 4130.3 KB, tree 4133.1 KB` |
| Handoff | 🔴 | `.sdlc/handoffs/anchor-gaps-U2.md:13` says `chroma-floor #701 added the \`even\` ones`. `git log -S'even\|0\|100.00\|0\|0\|25-stop\|50&75' origin/main -- test/engine/tonal.mjs` prints only `8ba4bee4 ... (#681) (#737)`, and `git show 7d325b32:test/engine/tonal.mjs \| grep -c '"even\|0\|100.00'` prints `3` | a #701 origin would show a chroma-floor commit in the pickaxe and `0` at `7d325b32` |
| Scope | 🟡 | eight files vs base, guarded paths `0`, tonal.mjs non-key code lines `0`; `npm test` regenerates to the committed bytes (status `0`). P4's first filter prints `1`: `.sdlc/reviews/anchor-gaps-U2-review.md` sits outside the wall's `(plans\|handoffs\|verdicts\|questions)` | the review file itself is the fixture (`1`); the generator revert shows ` M src/ui/categories/brands.js` |
| Suite | 🟢 | fresh clone, no node_modules: `✓ all 54 test files passed`, exit 0, status `0`; `✓ citations ... STALE 0`; `em-dash: clean (884 files scanned)`; `branding: clean (876 files scanned)`; `verdict-frontmatter ... bad 0` | one glyph appended to CHANGELOG: `FAIL: 1 em dashes`, exit 1; an ADR copy under `.sdlc/verdicts/`: `FAIL: 3 branding violation(s)`, exit 1 |
| Hygiene | 🟢 | both commits end `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, `a333fa9e` adds `Seat: reviewer`; U+2014 in messages and added lines `0`; board commits `0` | a planted glyph line through the same filter prints `1` |

### Findings

1. 🔴 `.sdlc/handoffs/anchor-gaps-U2.md:13`: the three hue-0 `even` keys came with #681 (`8ba4bee4`), before chroma-floor, not with #701. The planner's measurement missed them because the gate prints one message per gate name. A record repair; no tree change needed.
2. 🟡 Handoff text: `:3` says one deviation over a three-row table; `:25` describes the U2-4 control as hue-0 keys only, but its quoted `even: 3` output needs the `peak|36` key too; `:28` P3 counts `882`/`874` are the base's.
3. 🟡 Pre-land blocker: the review file under `.sdlc/reviews/` reds P4. Move it under `.sdlc/verdicts/` as U1's are, or widen the plan's wall.
4. 🟡 Plan text (`.sdlc/plans/anchor-gaps.md`): U2-1 expects `1 1` for a binary file (`- -`); U2-3 expects twin `98.38` (`86.00` by construction); `:82` and `:145` name two keys out and one in, the gate's set is five out and four in.
5. 🟡 `test/engine/tonal.mjs:1274` and `:1299` to `:1306`: stale counts and credits all four hue-36 keys to #739; comment only.
6. Pass 2 needs finding 1 fixed; 2, 3 and 5 are cheap in the same pass.

## Pass 2 · 🟡 · every row met, the hue-0 credits now match the pickaxe; one reviewer commit's Seat line sits outside its trailer block

verdict: 🟡
sha: 9435e47a822bcf21aef6abe041c663469bab879f

`unit/ag-U2` at `9435e47a`, plan base `55021569` (= `git merge-base origin/plan/anchor-gaps 9435e47a`), criteria revision 6. Grade verifier-l2, run by this seat itself (opus builder-l7 and reviewer-l3, same family per b9044bb; fable capped). Fresh clone, tree clean after every run. `verdict.py check` passes on the handoff (`--against` its `a333fa9e` copy), the plan (`--against` its `a333fa9e` copy), the rediagnosis brief, and the review-p2 record (warnings only, `table without a control column`, exit 0). Merge `4b64d3ac` equals `git merge-tree --write-tree a333fa9e 55021569`; since it, the unit changed only `//` lines of `tonal.mjs` (non-comment lines `0`) and two records.

Counter named: this seat pushes every `KNOWN_BASELINE_DUP.has(key)` hit into an array in a sibling copy of `tonal.mjs`, run `--full`. Physical = array length, unique = its `Set` size. Pass 1's `physical 22` was the `seenBaselineDup` size, so it counted unique keys; that figure is retired.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U2-1 | 🟢 | `36 36 #FFFFFF [1,0,0]`; numstat `- - src/ui/categories/brands.js` only; word diff `"name":"tertiary-muted","hue":0` then `"name":"tertiary-muted","hue":36` | the base's `brands.js` swapped in prints `0 36 #FFFFFF [1,0,0]` |
| U2-2 | 🟢 | `6`, `1`, `0`, `1` | carried from pass 1 (generator unchanged since): G0 tree prints `0` on the first needle |
| U2-3 | 🟢 | `25 27.28 86.00 2 2.77 500:#F1F1F1 650:#B8988F 900:#3A211A`, stop 650 hue `35` | hue forced to 0 prints `33.21 98.38`: field 2 over `28.00` reds |
| U2-4 | 🟢 | `PASS: tonal-generation clears all [gate] predicates` `exit 0`; `PASS (FULL): C2, C3, C4 ...` `exit 0`; greps `1`, `4`, `0`, `4` | two hue-0 `peak` keys added: `(C6 ii) 2 of the 24 cited baseline duplicates were not observed`, exit 1; `peak\|36` key dropped: `(C6 ii) peak: 1 duplicate-hex pair(s) beyond the cited list ... hue 36` |
| Count | 🟢 | `INSTR physical 24 unique 22 list 22`, doubled `even\|280 ... 850&875` and `even\|60 ... 900&925` (2 each); comment says `24 hits of 22 unique keys` | `even\|60 ... 900&925` dropped: `INSTR physical 22 unique 21 list 21` and `even: 2 duplicate-hex pair(s) beyond the cited list`, so both hits are real |
| Credits | 🟢 | `git log -S` per base key: three `even\|0` print `8ba4bee4 ... (#681)`, two `peak\|0` print `9638894c ... (#739)`; `git show 33bd8920 -- test/engine/tonal.mjs` hue-0 adds `0`; handoff `:15`, `:23` to `:29` and the comment block say the same | the pickaxe on a hue-36 key names `9b534f08`, not either ticket, so the command separates sources |
| U2-5 | 🟢 | `1`; `ok    ui.html: baseline 4133.1 KB, tree 4133.1 KB` | carried from pass 1: the figure left at `4125.3` printed `STALE ui.html:` |
| P1 | 🟢 | `✓ all 54 test files passed`, `54`, status `0` | `"scrim` to `"scrimX`: `FAIL  refs-canonical`, `exit 1` |
| P3 | 🟢 | `branding: clean (921 files scanned)`, `0`, `0`, `em-dash: clean (929 files scanned)` `exit 0` | a planted glyph line through the same filter prints `1` |
| P4 | 🟢 | `0`, nothing (U1 is in the base), `0`, `0`; nine files vs base, all inside the wall | the six-name fixture prints `3` |
| Hygiene | 🟡 | `562b077a`, `543bf159`, `4b64d3ac` parse `Seat: builder`; all four end with the Opus 5.5 co-author; U+2014 in messages `0`. `9435e47a` prints an empty `%(trailers:key=Seat)`: a blank line separates `Seat: reviewer` from `Co-Authored-By` | `a333fa9e` parses `[reviewer]` through the same format |

### Findings

1. 🟡 `9435e47a` (reviewer commit): `Seat: reviewer` sits in the body, not in the trailer block, so the trailer reader sees no seat. Record only; the squash does not carry it.
2. Note, no pass: the comment's `3 perceptual, 8 peak, 11 even` splits the 22 unique keys, not the 24 hits (by hit: 3, 8, 13). The review-p2 finding 1 says the same.
3. Pass 1 findings 1, 2 and 5 are repaired on the branch; 3 and 4 are carried by plan revision 6. The P2 build row was not re-run: the merge's bundle bytes pass P1's regenerate-then-clean check and U2-5's `ok`.
