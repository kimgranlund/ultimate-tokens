PASS: anchor-gaps U2 pass 2 at 543bf159; findings 1, 2 and 5 repaired, the tree matches every U2 row, 24 physical hits of 22 unique keys confirmed by an independent instrumented run

# Review anchor-gaps U2, pass 2

Reviewer: reviewer-l3 (opus, high), fresh context. Branch `unit/ag-U2` at `543bf159`, pass 1 head `a333fa9e`, `$B` = `git merge-base plan/anchor-gaps HEAD` = `55021569`. Criteria: `.sdlc/plans/anchor-gaps.md` revision 6, U2 rows; brief `.sdlc/plans/anchor-gaps-U2-rediagnosis.md`. Every command below was run by this seat with `git -C` or absolute paths. `npm test` not re-run (builder ran it; only comment lines and records changed since pass 1).

## Pass 1 findings

| Finding | State | Evidence |
|---|---|---|
| 1 hue-0 credit | 🟢 | `git log -S'<key>' origin/main -- test/engine/tonal.mjs` per key: the three `even\|0` keys print `8ba4bee4 ... (#681) (#737)`, the two `peak\|0` keys print `9638894c ... (#739) (#746)`. `git show 33bd8920 -- test/engine/tonal.mjs \| grep -cE '^[+].*\|0\|100\.00\|0\|0\|25-stop\|'` prints `0`. `#701` appears twice in the handoff, both saying it added none |
| 2 handoff text | 🟢 | No deviation table; header says none. U2-4 greps at this head `1`, `4`, `0`, `4` as stated. P3 `branding: clean (920 files scanned)`, `em-dash: clean (928 files scanned)` as stated. The controls table names the list state for each line and explains the one-message-per-gate masking |
| 5 tonal.mjs comments | 🟢 | `git diff a333fa9e 543bf159 -- test/engine/tonal.mjs` changes only `//` lines (non-comment `+`/`-` lines: `0`). Against `$B`, the only non-comment lines are the five removed `\|0\|` keys and the four added `\|36\|` keys. Set per mode: `perceptual 3`, `peak 8`, `even 11`, `22` keys; the four hue-36 keys are the last four, so "18 keys come first" holds. The Nike block credits even 50&75, 100&125, 175&200 to #681 and peak 75&100, 150&175 to #739, matching the pickaxe |

## Criteria at 543bf159

| Row | State | Output |
|---|---|---|
| U2-1 | 🟢 | `36 36 #FFFFFF [1,0,0]`; numstat names only `src/ui/categories/brands.js`; word diff prints `"name":"tertiary-muted","hue":0` then `"name":"tertiary-muted","hue":36` |
| U2-2 | 🟢 | `6`, `1`, `0`, `1` |
| U2-4 | 🟢 | instrumented FULL run (below) ends `PASS: tonal-generation clears all [gate] predicates`; greps `1`, `4`, `0`, `4` |
| U2-5 | 🟢 | `1`; `ok    ui.html: baseline 4133.1 KB, tree 4133.1 KB`; `stale total: 0` |
| P3 | 🟢 | branding and em-dash clean as above, `exit 0`; added U+2014 outside backticks `0` |
| P4 | 🟢 | `0`, nothing, `0`, `0` with the revision 6 class; the unit's eight files vs `$B` are all inside the wall |
| Tree | 🟢 | `git status --short \| wc -l` `0` after every run here (the instrumented copy was a sibling file, removed) |
| Hygiene | 🟢 | `562b077a` and `543bf159` carry `Seat: builder` and the Opus 5.5 trailer |

## Physical 24 versus unique 22

Independent run: a copy of `tonal.mjs` with the `KNOWN_BASELINE_DUP.has(key)` branch pushing every hit into an array, printed just before the FULL `seenBaselineDup.size` check, run `--full`. Output: `INSTR physical 24 unique 22 list 22`. The doubled keys: `even|280|100.00|0|0|25-stop|850&875` (two `primary` palettes) and `even|60|100.00|0|0|25-stop|900&925` (a `tertiary-muted` and a `primary-muted`), exactly the builder's pair.

Ruling: the builder's 24 is right, and pass 1's `physical 22` counted distinct keys (the `seenBaselineDup` size), not hits. Records should state both numbers with their counters named: 22 unique keys is what the gate enforces (`seenBaselineDup.size === KNOWN_BASELINE_DUP.size`, the figure every criterion and the `2 of the 24` control arithmetic rest on), and 24 is the count of `has(key)` hits across the FULL corpus. The tonal.mjs comment already says "24 hits of 22 unique keys"; the pass 2 verdict should say the same and retire "physical 22".

## Findings

1. 🟡 nit, non-blocking. `test/engine/tonal.mjs` comment near `:1268`: "24 hits of 22 unique keys, 3 perceptual, 8 peak, 11 even". The per-mode split sums to 22, so it is per unique key, while the replaced text's split (3, 7, 13) summed to the physical count. Accurate as read, but the basis changed silently; by hit the split is 3, 8, 13. A later edit could say "unique keys: 3 perceptual, 8 peak, 11 even". No pass needed for it.
2. No other finding. Pass 1 findings 3 and 4 were plan-side and revision 6 carries them (U2-1 `- -`, U2-3 `86.00`, the `reviews` class in P4).
