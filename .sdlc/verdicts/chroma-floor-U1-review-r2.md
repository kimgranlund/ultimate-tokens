FAIL

# chroma-floor U1 review, pass 1, round 2 (reviewer-l2, fresh context)

| Field | Value |
|---|---|
| Target | `unit/cf-U1` @ d154909c, delta `b1261f9e..d154909c` |
| Round 1 | `.sdlc/verdicts/chroma-floor-U1-review.md` (FIX-FIRST at 02700720), findings F1, F2, F3 |
| Plan | `.sdlc/plans/chroma-floor.md` revision 12, C2 and C6 |
| Host | three scratch `git clone --shared` copies of d154909c under `$TMPDIR` (head, plateau text moved, OKHSL damping x1.01), deleted after; load average 39 to 107, so no timing here is baseline evidence |

F1 and F2 are fixed and verified both ways. F3 is only half fixed: the control now prints its count, but at d154909c the count is 7, not the 65 that C2's verifier note names and that round 1 measured with the same neutralisation applied to the real engine. The control bites (7 > 0), so this is an evidence defect, not a hole in the gate, but the fix round's own claim ("the 65-witness number") is not what the committed code prints.

## Round-1 findings at d154909c

| Finding | State | Evidence |
|---|---|---|
| F1 plateau-moved guard can fire | 🟢 fixed | `test/engine/anchor.mjs:1011` defines `PLATEAU_TARGET`, `:1016` tests `realSrc.includes(PLATEAU_TARGET)` before any `.replace`. Run both ways below: head prints no guard line and exits 0; a copy with the line rewritten to `uG *= t * t * (3.0 - 2 * t);` (same maths, moved text) prints `lone-spike negative control: a patch target string was not found - the neighbourhood plateau text moved, update this control`, `FAIL: 1 gate failure(s)`, exit 1. The per-gate first-FAIL rule (`anchor.mjs:50`) keeps the guard's diagnosis ahead of the later `DID NOT bite` line, so the red carries the right reason |
| F2 C6 literal and the adapter row | 🟢 fixed | `test/engine/mode-isolation-gate.mjs:84` prints the `pass`/`FAIL` hash line last; `:81` prints the `expected` line before it on a mismatch; `:85` exits 1. `tail -1` at head reads `pass  mode-isolation: perceptual 34e544942d500b9e peak f560f784d8a4883a match fixture (captured at 282fca8ddc84703a9bffc0bcc0f3b8462747cca5, 3780 corpus + 16 default kit, 25-stop, projectView)`, exit 0, which matches C6's Expected (plan line 182) and `.sdlc/adapter.md:34` word for word. `:62` derives the label from `corpusPaletteCount` (counted once, on the perceptual pass, `:39` to 49) and `dk.palettes.length`; no hardcoded 16 remains. The mismatch wording reads `do not match` |
| F3 control prints its count (65) | 🔴 not met | `anchor.mjs:1038` prints the count, but at d154909c it reads `lone-spike negative control: plateau-neutralised engine produced 7 spike(s) over the corpus + kit (want > 0)`. See F6 |

## New findings

### 🔴 F6 (medium) The in-gate lone-spike control undercounts: 7, not 65

`test/engine/anchor.mjs:1017` to 1040 at d154909c. The control imports the plateau-neutralised `tonal.js` and drives its `paletteStops` with a hand-built `controls` object, not through `hydrate()` + `projectView()`, which is the path the real sweep two blocks up takes (hue space, group chroma and the rest are resolved there first). Round 1's shoulder-off copy of the real engine read `FAIL ... lone-spike ...: 65`, the plan's 64 + Data 7; the in-gate copy of the same neutralisation reads 7. So the printed number is not evidence for C2's "65 (64 corpus + Data 7)", and a verifier still has to rebuild the control by hand, which is the thing F3 asked to stop.

Fix: run the neutralised module through the same render path as the real sweep (a data-URL `model.mjs` whose `tonal.js` import points at the neutralised module, then its `projectView`), and have the printed line match 65 on a full run. Optionally assert the count equals the real-engine shoulder-off figure rather than only `> 0`, so a future undercount reds.

Note for the Orchestrator: the worktree `.worktrees/cf-U1` carries an uncommitted edit to `test/engine/anchor.mjs` (43 insertions, 8 deletions) whose comment names exactly this undercount ("7, not 65") and patches `model.mjs`'s import. It is not part of d154909c and this review did not run it. This record's commit stages only its own path.

### ⚪ F7 (info) The pass line's corpus label is the fixture's string, not the live count

`mode-isolation-gate.mjs:84` prints `${FX.corpus}`; the live `corpusLabel` (`:62`) is written only on `--capture`. The fixture's `corpus` field was hand-edited from `343 corpus` to `3780 corpus` (`test/engine/fixtures/mode-isolation.json:4`) while `capturedAt` stayed 282fca8d. A `--capture` at d154909c in the scratch clone printed `captured perceptual 34e544942d500b9e peak f560f784d8a4883a ... (3780 corpus + 16 default kit)`: the same two hashes and the same label, so the hand edit equals a real capture. A palette-count change would also move the hashes, so the fixture string cannot go stale silently in practice. No action required.

## Delta review, b1261f9e..d154909c

| Item | State | Evidence |
|---|---|---|
| No engine change | 🟢 | `git diff --stat b1261f9e..d154909c -- src/` is empty. The four changed paths are the handoff, `anchor.mjs`, `mode-isolation-gate.mjs` and the fixture's `corpus` string |
| FLOORS unchanged beyond R44's five cells | 🟢 | no `src/` or `docs/reference/` path in the delta, so round 1's `FLOORS changed 4, down 4` (R44's five cells) still stands |
| mode-isolation logic | 🟢 | the refactor keeps the fingerprint input identical (same line format, same order); head hashes equal the fixture |
| anchor gate at head | 🟢 | `node test/engine/anchor.mjs --full` exit 0, `pass  anchor-ramp lone-spike ...: 0 (expected 0, corpus 3380 anchored + default kit 16, no allow-list)`, `PASS (FULL)` |

## Runs

| Run | Result |
|---|---|
| anchor `--full`, head | exit 0; lone-spike 0; control line `produced 7 spike(s)` |
| anchor `--full`, plateau text moved | guard line printed, `FAIL: 1 gate failure(s)`, exit 1 |
| mode-isolation, head | exit 0; `tail -1` is the `pass  mode-isolation:` line with `3780 corpus + 16 default kit` |
| mode-isolation, OKHSL envelope x1.01 on non-even | exit 1; `expected perceptual 34e544942d500b9e peak f560f784d8a4883a`, then last line `FAIL  mode-isolation: perceptual e3ac69b83ed5f14c peak 5fcf90f2eabaa89a do not match fixture (...)`, the same hashes round 1 measured |
| mode-isolation `--capture`, head clone | same hashes, label `3780 corpus + 16 default kit` |

## To clear

1. F6: make the in-gate control take the `projectView` path and print 65 on a full run; commit it, then rerun `anchor.mjs --full` and quote the line in the handoff.

verdict: 🔴 FAIL
