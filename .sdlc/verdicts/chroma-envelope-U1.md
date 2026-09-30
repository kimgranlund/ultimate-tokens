---
kind: verdict
plan: chroma-envelope
unit: U1
ticket: "#725"
branch: unit/ce-U1
base: afd415c0
grade: verifier-l2 (opus), stand-in while fable is capped; an opus L5 build's checkers are opus per b9044bb; evidence run chroma-envelope-U1-verifier-l2-p1, spot-checked by the Verifier seat
pass: 1
written: 2026-09-29
---

# Verdict chroma-envelope U1 · 🟡 · the gate and its fixture ratchet the envelope, the report's output is byte-identical, every C1 row holds under plan revision 4; the one yellow is commit hygiene

verdict: 🟡
sha: ea76d9348b46185c86bcdfee6f5715ef82205f11

Graded against `.sdlc/plans/chroma-envelope.md` revision 4 (`b95a41b0`). `$(git merge-base origin/main HEAD)` resolved to `afd415c0` (the unit base; its merge-base with origin/main is itself). Five fresh clones (gates, controls, reruns, base, `282fca8d`), every control reverted to a clean status. `verdict.py check` passed on the handoff, the review, and `.sdlc/adapter.md` and `.sdlc/baseline.md` against their base copies. Runs under host load 8.7 to 17.7.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| C1.1 | 🟢 | `npm run -s gate:chroma-envelope` three times, exit 0, last line `pass  chroma-envelope: 3 modes x 4 stops x 2 stats + 3 clause counts within fixture; direction holds in 3 modes` | fixture with `perceptual 300 median` lowered 1.0: `FAIL  chroma-envelope: 1 of 27 cells rose past fixture (perceptual 300 median)`, exit 1; `--damp-amp 55`: `27 of 27 cells rose`, exit 1 |
| C1.2 | 🟢 | `capturedAt` `afd415c06ff3d96314b41129c8aceaa7800df912`, `n` `2920`; `perceptual: median 17.4 / 94.0 / 74.5 / 31.7; p90 35.1 / 146.2 / 119.3 / 66.5; cuspRuns 446`, peak `above100 2592`, even `above100 502`, each equal to the plan literal | at `282fca8d` with U1's gate and lib: `even: median 15.6 / 48.4 ... above100 670`, and against U1's fixture `3 of 27 cells rose past fixture (even 300 median, even 300 p90, even above100)`, exit 1 |
| C1.3 | 🟢 | `--capture`: `capture: every value equals test/engine/fixtures/chroma-envelope.json ...; file left unchanged`; `git diff --exit-code` exit 0 | a committed `93.0493` edit then `--capture`: `git diff --exit-code` exit 1, `+    "300": 94.04928010984135`, `capturedAt` moved |
| C1.4 | 🟢 | #701's C5 extraction: head `6e558839ee9e43217e1e2f7afc898b7b`, base `afd415c0` the same; full `--envelope` and `--envelope --gate-path` output `cmp` identical head versus base | same extraction under `--damp-amp 55`: `3cf14766175041d45b2c119bc854f0da` |
| C1.5 | 🟢 | `pass  mode-isolation: perceptual 990c17c5ae140e6e peak b59bd41501cd829a match fixture`, exit 0; `--identity-control --base afd415c0`: `0 differing cells`, exit 0 | one `tonal.js` perceptual/peak hunk (`controls.damp * 0.95`): `FAIL  mode-isolation: perceptual 38e9b0a78440fe02 peak 6ff56f60e8c1c525 do not match fixture`, exit 1; `--perturb`: `1 differing cells`, exit 1 |
| C1.6 | 🟢 | `grep -c 'gate:chroma-envelope'`: `2`, `1`, `3`, `1`, `1`; `baseline-agrees-check.sh`: `ok    time gate:chroma-envelope: baseline 12 to 12 s, adapter 12 to 12 s`, `stale total: 0`; sweeps sum `388` to `508` s rechecked | `ci.yml` leg deleted: `0`; baseline row deleted: `STALE time gate:chroma-envelope ...`, `stale total: 1`, exit 1 |
| C1.7 | 🟢 | four owner lines, `mode-isolation-gate.mjs:25`, `:73`, `mode-isolation.json:2`, `adapter.md:34`, each `#725 U2 and U3 move perceptual and peak and re-capture; U4 retires this note`; `adapter.md:36` is the new §1 row | at `afd415c0` `grep -c 'U2 and U3 move'`: `0`, `0`, `0` |
| C1.8 | 🟢 | `✓ all 54 test files passed`, exit 0, porcelain empty after; `em-dash: clean (1001 files scanned)`; `✓ citations: ... STALE 0 ...`; `branding: clean (993 files scanned)` | a U+2014 in the plan: `FAIL: 1 em dashes`, exit 1; a line in generated `describe-mcp-assets.js`: porcelain ` M src/ui/describe-mcp-assets.js` |
| C1.9 | 🟢 | `git diff afd415c0 -- scripts/report-preset-fidelity.mjs \| grep -c 'TARGET'`: `0` | `TARGET` stop-100 median 25 to 26: `2` |
| One measurement | 🟢 | `grep -rl envelope-measure` lists only the lib, `scripts/report-preset-fidelity.mjs` and `test/engine/chroma-envelope-gate.mjs`; the gate calls `measureEnvelope` once, no loop of its own; the removed report loop and the lib body match line for line in `ff0489f5` | C1.4's byte-identical `cmp`: a drifted loop would change the output |
| Mode-isolation edit | 🟢 | `mode-isolation.json` changes line 2 (`owner`) only; `capturedAt` `81ac5521`, both hashes byte-unchanged; the gate's `owner` literal equals the fixture's (JSON-string check `true`) | C1.5's engine-hunk control reds the unchanged hashes |
| gate:sweeps | 🟢 | `npm run gate:sweeps` (all eight, `--full`): `grep -c FAIL` `0`, last gate `pass  chroma-envelope: ...`, `exit 0`, `secs 634` | C1.1's lowered-fixture and C1.5's engine-hunk controls red their gates inside the same sweep chain |
| Records | 🟢 | every checkable handoff figure reproduced (`54`, both hashes, both md5s, `93.049` to `94.049`, `2/1/3/1/1`, `388` to `508`, lines `:25 :73 :2 :34 :36`, `above100 670`); Deviations 3 and 4 hold (`git log -1 afd415c0 -- src/engine/tonal.js` is `33bd8920`) | the handoff's timings (`88.8 s`, `12.04 s`) did not reproduce under load (`242 s`, `19.11 s`), stated as quiet-host runs, not false |
| Hygiene | 🟡 | `git log --format='%h [%(trailers:key=Seat,valueonly)]' afd415c0..ea76d934`: `ea76d934 []`, `31f56c89 []`, `d9a078cc []`, `9dd7ad82 []`, `ff0489f5 []`; none stages `.sdlc/board.md` | the merge commits on `plan/*` read `[orchestrator]` in the same format, so an absent trailer reads `[]` |

### Findings

1. 🟢 The unit is right: one measurement with two callers, the report unchanged byte for byte, a ratchet gate whose fixture re-captures exactly, CI and sweep wiring recorded in the adapter and baseline, mode-isolation hashes untouched.
2. 🟡 Hygiene: no Seat trailer on the five unit commits. Adapter X7 requires one only on board commits, so this is recorded per the standing precedent, not a defect in the work.
3. 🟡 Records, no action: the handoff's Deviations 1 and 2 and its C1.5/C1.7 🟡 states describe revision 3's literals; revision 4 adopted both, so they are dated history. `.sdlc/baseline.md:34` still prints the retired `34e544942d500b9e` / `f560f784d8a4883a` pair, which C4.5 owns.
4. Info from the review: `--compare` never compares `n` (`chroma-envelope-gate.mjs:87` to `:101`), and the direction leg is coarse by design; neither blocks U1.
