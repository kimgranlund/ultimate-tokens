# Question U1 · from cf-U1-builder-l4

| Field | Value |
|---|---|
| Blocks | U1 P1 (C1 `npm test` green, C8 `pass role-contrast`) |
| Question | Correction to this doc's first version: the shoulder's floor erosion is bigger than one cell. `EVEN_NEIGHBOURHOOD_R = 0.2` (`src/engine/tonal.js`) is the smallest radius the plan's own probe found that fully closes both lone-spike populations (C2 green: 64 corpus + 1 kit -> 0/0). Measuring ALL 16 default-kit families' even accent ratios before/after (table below, same `brandKit`/`contrastRatio` construction `test/engine/semantic.mjs`'s `role-contrast` uses) finds FIVE pinned-floor breaches, not the one `npm test` prints: Warning LIGHT (9.9148 -> 9.8756, floor 9.9), Warning DARK (5.3334 -> 5.2819, floor 5.3), Data 3 LIGHT (6.5224 -> 6.4562, floor 6.5), Data 5 LIGHT (5.8350 -> 5.7748, floor 5.8), Data 8 LIGHT (5.8570 -> 5.7955, floor 5.8). Only Warning LIGHT prints: `test/engine/semantic.mjs`'s `FAIL()` keeps one message per gate name (same dedup shape C3 already documents for `tonal.mjs`), so the other four are real but silent under the current gate. Six more cells pass by under 0.02 of their own floor (Secondary L/D, Danger D, Data 1 D, Data 4 D, Data 6 L/D, Data 7 L/D). Every cell stays far above the ruled AA floor (4.5:1); the lowest post-shoulder ratio is 4.5840 (Info dark). `FLOORS` itself is untouched (comparator: `changed 0, down 0, exit 0`) — C8's own text says a downward move stays OUT of the table and gets handed to #662's policy, but also expects a literal `pass role-contrast`; those two clauses conflict on real numbers, more broadly than first reported. |
| Options | A leave `FLOORS` untouched, let `role-contrast` red on Warning light (the one line the dedup surfaces), name all five breaches in the handoff, hand to #662's policy (recommended: matches C8's own instruction literally; #662 owns on-color/floor policy, not this plan) · B re-pin all five breached cells down to their new measured values (still far above AA) so `npm test` reads clean, naming every move in the handoff (a policy call C8's own text discourages) · C hold U1 pending a different construction (not attempted: 0.2 is the plan's own established minimum radius for 0/0 spikes; a fourth construction is a second workaround the dispatch rules out) |
| Default if unanswered | A |

Default-kit even accent ratios, before (patched copy of `tonal.js` at `unit/cf-U1~1`, i.e. `<base>` 282fca8d) vs after (this commit, `404ae7f5`), both independently re-measured via `brandKit`/`contrastRatio` (not read off the `FLOORS` comments, though they agree to 4dp):

| family | before L/D | after L/D | floor L/D | verdict |
|---|---|---|---|---|
| Neutral | 7.2938/4.6509 | 7.2938/4.6509 | 7.2/4.6 | OK/OK (unchanged: zero chroma) |
| Primary | 7.4983/4.7966 | 7.5205/4.7957 | 7.4/4.7 | OK/OK |
| Secondary | 5.6078/5.5335 | 5.6039/5.5238 | 5.6/5.5 | OK/OK (both within 0.02) |
| Tertiary | 8.2782/5.2571 | 8.2888/5.2722 | 8.2/5.2 | OK/OK |
| Info | 7.2338/4.5768 | 7.2400/4.5840 | 7.2/4.5 | OK/OK |
| Success | 7.7219/4.9081 | 7.7621/4.9426 | 7.7/4.9 | OK/OK |
| Warning | 9.9148/5.3334 | 9.8756/5.2819 | 9.9/5.3 | **FAIL/FAIL** |
| Danger | 8.6973/5.6465 | 8.7363/5.6087 | 8.6/5.6 | OK/OK (dark within 0.01) |
| Data 1 | 6.3149/4.9736 | 6.3272/4.9501 | 6.3/4.9 | OK/OK (dark within 0.05) |
| Data 2 | 6.6726/4.6487 | 6.6979/4.6740 | 6.6/4.6 | OK/OK |
| Data 3 | 6.5224/4.8271 | 6.4562/4.8036 | 6.5/4.8 | **FAIL**/OK |
| Data 4 | 6.0537/5.1407 | 6.0875/5.1149 | 6.0/5.1 | OK/OK (dark within 0.01) |
| Data 5 | 5.8350/5.3561 | 5.7748/5.3436 | 5.8/5.3 | **FAIL**/OK |
| Data 6 | 5.5494/5.5467 | 5.5464/5.5277 | 5.5/5.5 | OK/OK (both within 0.05) |
| Data 7 | 5.6846/5.4779 | 5.6572/5.4293 | 5.6/5.4 | OK/OK (both within 0.03) |
| Data 8 | 5.8570/5.3269 | 5.7955/5.3049 | 5.8/5.3 | **FAIL**/OK (dark within 0.005) |

Full measured picture, everything else green:
- C2 (lone spikes): `gate:corpus-anchor --full` exit 0, `anchor-ramp lone-spike ...: 0 (expected 0, corpus 3380 anchored + default kit 16, no allow-list)`.
- C5 (envelope cells + rendered-path report): `--gate-path` all four OK, `above 100% of stop 500: 0 OK`; rendered default run byte-identical to `<base>` (15.6/37.0, 48.4/113.7, 42.5/80.2, 22.9/52.0, above 100% 670); `--gate-path --damp-amp 55` control reads 1916 FAIL (bites).
- C6 (mode isolation): new `gate:mode-isolation` script + fixture, perceptual/peak fingerprints identical with/without the shoulder (`34e544942d500b9e` / `f560f784d8a4883a`), captured at `<base>` 282fca8d.
- C7 (ramp shape / one envelope): `anchor-ramp monotone: 0`, `distinct: 16`, `skew-lift-okhsl`/`chroma-envelope` pass, `chromaEnvelope(` greps 1/5 unchanged; the new term is named `t`/plateau, never `shoulder` (the `dampAmp` term's own name).
- C8: `chroma-floor` and `role-contrast Q-B floor gate` both pass; `FLOORS` comparator on the branch against `<base>` reads `changed 0, down 0, exit 0`. The live-measurement reds are this question's subject (table above).
- C9 (Q-D): unaffected.
- C10: regenerated assets clean; `docs/` diff has 4 paths beyond the named six, all one-line citation-number repairs forced by this unit's own line shift in `tonal.js`/`test/engine/tonal.mjs` (`SKILL.md:95`, `acceptance-criteria.md:25`, two lines in the `2026-08-20-reactivity` review docs) — same repair class already ratified for `okl-memo` U1 (`.sdlc/questions/okl-memo-U1.md`, answer A) for the identical citation. Not re-asking that half.

Rendered dips (real engine, full corpus + kit, both stop sets, dampAmp-0): 56 (400: 3, 450: 20, 550: 1, 500: 32 unchanged — the notch class, not this plan's). Gate-path (anchor omitted): 0, unchanged. These are U2's `EVEN_DIP_BASELINE` to retire, not gated here (C3/C4 are not U1's criteria); named for U2's head start.

State: committed and pushed at `unit/cf-U1` @ `404ae7f5`. This doc is the only thing between U1 and a written handoff — A/B/C above decides whether the handoff records one clean run or five named, deliberately-uncorrected floor exceptions.
