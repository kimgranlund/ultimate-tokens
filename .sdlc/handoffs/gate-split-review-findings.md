---
kind: handoff
plan: gate-split
unit: review carry-over, U2 to U5
branch: plan/gate-split
written: 2026-09-21
pass: 1
---

# Review findings carried to pre-land, #713 U2 to U5

Written by the Orchestrator because the U3 verifier could not find these anywhere and had to infer them from a handoff's Corrections section. Until now they existed only in seat messages, which are not records. Every finding below was raised by the named unit reviewer, graded non-blocking by it, and left unfixed on purpose; each unit's verdict is unaffected.

Anchors are given as a symbol plus a line at the head named in the row, because a line alone moves (owner ruling R10). All four units are on `plan/gate-split` after their merges.

## Why each was carried rather than fixed in its unit

A fix invalidates a reviewed head and costs a re-review. That is worth paying when the finding rides a pass that is happening anyway, and not worth paying for a lone cosmetic one. U3's findings 1 to 3 were fixed in its pass 2 for that reason; U3's 4 to 6, and everything from U2, U4 and U5, were not.

## The findings

| # | Unit | Severity | Where | What | Suggested fix |
|---|---|---|---|---|---|
| C1 | U4 | 🟡 | `test/engine/prime.mjs`, the `hueShift ... 151,200` and `114/151,200 every time` comment sentences, lines 308 and 320 at `a9daea10` | Both describe the FULL leg's sweep with no clause saying so, so under SAMPLED the comment states coverage the run did not do. The sampled run prints `gamut-ceiling: 0/30240 real out-of-gamut rungs (pinned ceiling 0); negative control (private truncated-key reconstruction, same sweep): 3/30240`. Runtime is correct, the record is not | qualify both sentences as FULL, name the sampled denominator |
| C2 | U4 | 🟡 | `test/engine/prime.mjs`, the sampled `vulnViolations` control | Its witness count thins to 3 against FULL's 114. It asserts nothing (`vulnViolations` is printed, never asserted) and real detection is unharmed: sampled M-B measured `73/30240`. The risk is a record that reads 3 as proof of strength | say in the pre-land record what the sampled control does and does not prove |
| C3 | U3 | 🟡 | `test/engine/anchor.mjs`, `dropCheck` and `swapCheck` inside the `if (FULL)` block, line 1078 at `a9daea10` | U3 gated the in-file negative controls to FULL, so the leg that actually runs inside `npm test` ships `allowListOk`'s subset branch with no in-file control. The subset half is still graded, by the plan's U3-4 against a real clone mutation, in both modes, and the builder's own comment above the block says so; this is an improvement, not a hole | a measured-side control, a fictitious name injected into `measuredSorted` asserted to red, would bite in both modes |
| C4 | U3 | 🟢 nit | `test/engine/anchor.mjs`, the `seenCats` per-category presence assertion, line 186 at `a9daea10` | It skips `brands`, the one category `sampleCorpus` ships complete, so an emptied `brands` is caught only if the document count also falls below 30 | assert `brands` by its own count rather than by the corpus floor |
| C5 | U3 | 🟢 nit | `test/engine/anchor.mjs`, `allowListOk` called at lines 414 and 419, declared at 969, at `a9daea10` | Valid by hoisting and proven green; the comment at the call site forward-references a header about 550 lines below | move the declaration above its first use, or point the comment at the line |
| C6 | U2 | 🟢 nit | `.sdlc/handoffs/gate-split-U2.md`, the quote on line 220 | A FAIL line is quoted with the preset name silently shortened, `Trulli of Alberobello · vernacular · Puglia, Italy` written as `Trulli of Alberobello ...`, and presented as literal program output with no disclosure, unlike the U2-4 observed-names list which discloses its own transcription. `.sdlc/adapter.md` §3 wants the bytes | restore the full name, or mark it `altered:` |
| C7 | U5 | 🟢 nit | `.sdlc/handoffs/gate-split-U5.md`, the P8 row | It ran `branding.mjs` at the base `ebddc55d` (514 files) rather than at the unit's own head (515 files, also clean). Citation fidelity, not a functional gap | re-quote at the unit head |

## Findings already closed, recorded so nobody re-raises them

| # | Unit | What | Closed by |
|---|---|---|---|
| X1 | U3 | The final PASS line printed the FULL frozen counts `window-clamp (10), gap-19 (72), distinct-25 (16) and notch (15, Q3-resolved)` and the biting-control claim under SAMPLED too, after observing 3, 8, 3 and 2 members with the controls skipped | U3 pass 2, `86c2487e`: `allowListTail` branches on `FULL`, SAMPLED prints its measured counts and states it is a subset read with no in-file control that run. U3-1's `gap-19 (72)` needle now counts `0` on a SAMPLED log and `1` on FULL, where in pass 1 it matched both |
| X2 | U3 | `codesNote` said `full-corpus codes reach N` under SAMPLED, and the `343 x 3 = 1,029 renders` comment was FULL-only without saying so | U3 pass 2, same commit |
| X3 | U3 | Two handoff quotes were not byte-for-byte, a comma where the program prints an em dash separator | U3 pass 2, verified by the reviewer against its own pass 1 clone logs, not the builder's |

## A related check that came back clean, and why

U2 was checked for the same defect as X1 and has none: `test/engine/tonal.mjs` prints a fixed literal PASS line with no counts interpolated, so it cannot carry a mode-specific coverage claim either way, and its mode line is separate and correctly conditioned. `anchor.mjs` named frozen counts, which is why only U3 was affected. The difference is the reason the two units were treated differently, not an inconsistency.
