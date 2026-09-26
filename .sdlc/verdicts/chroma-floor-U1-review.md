FIX-FIRST

# chroma-floor U1 review, pass 1 (reviewer-l2, fresh context)

| Field | Value |
|---|---|
| Target | `unit/cf-U1` @ 02700720, diff `282fca8d..02700720` |
| Plan | `.sdlc/plans/chroma-floor.md` revision 12; criteria C1, C2, C5, C6, C7, C8, C9, C10 |
| Ruling read | R44 (`.sdlc/questions/chroma-floor-U1.md`, answer B): five downward even FLOORS cells, comparator `changed 4, down 4` |
| Spot-check host | scratch `git clone --shared` clones under `$TMPDIR` (head, base, three patched copies), deleted after; load average 40 to 177 throughout, so timings here are not baseline evidence |

The engine change is right and the retirement is complete. Three small test-output defects make two criterion literals unreadable as written, so they go back to the builder before the verifier sees them. None needs an engine change.

## Findings, by severity

### 🟡 F1 (medium) The lone-spike control's "missing target is a FAIL" guard can never fire

`test/engine/anchor.mjs:1017`: `if (patched === realSrc) FAIL(...)`. The two import-path `.replace` calls above it always change the source, so `patched !== realSrc` whatever happens to the plateau line. C2's own text requires that "a missing target is itself a FAIL". Shown two ways:

- A node probe on the head `tonal.js` with the plateau line rewritten prints `target present: false | guard fires (patched===src): false`.
- The scratch copy with the plateau line replaced by `uG *= 1;` printed no `patch target string was not found` line in its full run.

The gate still reds overall if someone rewrites that line while keeping the fix. The control then silently runs the real engine, finds 0 spikes and prints `DID NOT bite`, a red with the wrong diagnosis. Fix: test `realSrc.includes("uG *= t * t * (3 - 2 * t);")` before patching, the same way the dip gate's control is meant to.

### 🟡 F2 (medium) The C6 literal does not match what the gate prints

`test/engine/mode-isolation-gate.mjs:76` and `:82`. C6's command is `tail -1 "$F/mi.log"` and its Expected is the `pass  mode-isolation: ... (captured at <base sha>, 3780 corpus + 16 default kit, 25-stop, projectView)` line. The adapter row (`.sdlc/adapter.md:34`) also says "the last line reads `pass  mode-isolation: ...`". The real output differs in two ways:

- The last line is `PASS: mode-isolation clears its checkable [gate] predicate` (line 82), so `tail -1` never shows the hashes.
- The label reads `343 corpus + 16 default kit`: `presets.length` counts documents, not the 3,780 palettes the criterion and the file's own header name.

A verifier reading C6 literally reds it. Fix one side: either print the palette count and make the `pass  mode-isolation:` line last, or have the Orchestrator amend C6 and the adapter row to the real two-line output. Also in the same file:

- `:57` hardcodes `kitLabel === "Default" ? 16 : dk.palettes.length`, so a 17-palette default kit would still print 16. Use `dk.palettes.length`.
- `:76` prints `FAIL ... match fixture` on a mismatch. It should say `do not match`.

### 🟡 F3 (low) The in-gate lone-spike control prints no count

`test/engine/anchor.mjs:1004` to 1032 only prints on failure. C2's verifier note expects the patched copy to "read 65 (64 corpus + Data 7)". A green run leaves no evidence of that number, so the verifier has to rebuild the control by hand, as this review did. Print one line with `buggySpikeNames.size`.

### ⚪ F4 (info, disclosed, not reproduced) `gate:corpus-tonal` FULL reds on three new stop-400 dips

The handoff says the full leg reds on 3 new stop-400 dips that are not in `EVEN_DIP_BASELINE`. They appear because 450 rose above 400. The plan's probe predicted `400 3`, and C3/C4 belong to U2. So `sweeps (gate:corpus-tonal)` is red on the plan branch until U2 lands, and nothing here can reach `main` before U2. That full run was not repeated under this load.

### ⚪ F5 (info) Record nits

- The handoff header still names `b3268be1`. The only file changed since then is the handoff itself, so the code reviewed is the code described.
- The handoff's C6 control shows only that the gate is blind to even. The plan's biting control (OKHSL damping times 1.01 must FAIL) was not run there. This review ran it (see the table).
- `src/engine/tonal.js:398` says the C5 cells sit "at |sd| >= 0.222 for the innermost measured stop, 300/700". 0.222 is stop 400 at lift 0. Stops 300/700 read 0.444 at lift 0 and never fall below 0.2241 anywhere in the lift range [-40, 40] (measured). The claim holds and only the figure is off.
- `.sdlc/baseline.md`'s `gate:mode-isolation` row is 0/3 counted readings, and a quiet-host set is owed before pre-land (disclosed). On this host the gate took 195 s at load 40.

## What holds (checked against the diff and the color-math invariants)

| Item | State | Evidence |
|---|---|---|
| The term is even-only, zero at the anchor, a factor not an offset | 🟢 | `tonal.js:418` to 424: `uG *= smoothstep(min(1, abs(sd)/R))` inside `if (isEven)`, keyed on the same `sd` from `liftStop`. The `dampAmp` shoulder reads the plateaued `uG`, so it still vanishes at `sd = 0` and at `abs(sd) = 1` |
| `env(500) = 1` | 🟢 | `chromaEnvelope(500, 500, lift, ...)` returned exactly 1 on 1,215 of 1,215 combinations (3 modes, lift -40 to 40, damp, dampAmp, dampCurve, dampBias) |
| Vanishes by 300/700 under any lift | 🟢 | the smallest `abs(sd)` over lift -40..40 is 0.2241 for 300/700, above R = 0.2. Stops 400/600 can fall inside R at abs(lift) 40 (0.1598), which matches the handoff's movement note |
| The radius is documented, no new control | 🟢 | `EVEN_NEIGHBOURHOOD_R = 0.2` is an exported named constant with a derivation comment against the probe and the 50-unit steps. `damp`, `dampCurve` and `chromaFloor` are still read |
| One envelope function | 🟢 | the greps read `1` and `5`, and `GRID_R2_EXCEPTIONS` 21 and `KNOWN_BASELINE_DUP` 23 are unchanged |
| Lone-spike lists retired, one count | 🟢 | `LONE_SPIKE_ALLOW`, `DEFAULT_KIT_SPIKE_FINDING`, both echoes and both R10 `lone-spike` controls are gone. The kit names are unioned (`anchor.mjs:999`), and the pass/FAIL line reads `loneSpikeSorted.length === 0` |
| Legacy re-derivation and the fixture | 🟢 | `tonal.mjs`'s `damping-curve` legacy form adds the same plateau, read through the exported R. 26 `tonal-legacy.json` cells moved, all at 450/550 on even, matching the comment's list |
| Wiring | 🟢 | `package.json` has `gate:mode-isolation` and is a `gate:sweeps` member. The `ci.yml` `sweeps` matrix has the leg. The adapter §1 row and composite timing sum (329 to 442) are right. The `baseline-agrees-check.sh` row is added. `mode-isolation` is not in `test/run.mjs` |
| `--gate-path` | 🟢 | both `paletteStops` sites drop `anchor` under the flag, and the header line and usage name it |
| FLOORS | 🟢 | the comparator prints three `base 16, branch 16` lines, then even Warning 9.9/5.3 -> 9.8/5.2, Data 3 6.5 -> 6.4, Data 5 5.8 -> 5.7, Data 8 5.8 -> 5.7, all DOWN, then `FLOORS changed 4, down 4`. These are exactly R44's five cells, with no perceptual or peak line. Each new floor sits at or below the measured ratio in the handoff, and `pass  role-contrast` holds |
| Four extra docs repairs | 🟢 | `tonal.mjs:301`/`319` (`okhsl-modes`), `722`/`743` (`lift-monotonic`) and `tonal.js:958` (`okhslLAt`) all land on the cited symbol at head. `04-context-and-messaging.md` also rewords the `_okL` bullet into history, the same class as okl-memo's answer A |
| Scope | 🟢 | no `role-table.json`, `code.js`, type or geometry change. `adia-oklch-export.css` is unchanged. Regenerating (`gen:categories`, `gen:adia-exports`, `gen:mcp-assets`, `bundle`, `gen:figma-ui`) left `git status --short` at `0` |

## Controls run by this review

| Criterion | Run | Result |
|---|---|---|
| C2 head | `node test/engine/anchor.mjs --full` at 02700720 | `pass  anchor-ramp lone-spike ...: 0 (expected 0, corpus 3380 anchored + default kit 16, no allow-list)`, `anchor-ramp monotone: 0`, `distinct (25-stop) allow-list: 16 (expected 16)`, `hueSpace-perceptual-bound` and `hueSpace-peak-bound` max OKLab dE 0.0048 pass (C9's lines), exit 0 |
| C2 shoulder off | the same, with `uG *= t * t * (3 - 2 * t);` replaced by `uG *= 1;` | `FAIL  anchor-ramp lone-spike ...: 65`, the 64 + 1 of the plan, `FAIL: 1 gate failure(s)`, exit 1. No `patch target string was not found` line (F1) |
| C2 kit union | SAMPLED run with one planted name added to `defaultKitSpikeNames` before the union | `FAIL ... lone-spike ...: 1`, `unexpected member - default kit "Default" PLANTED #000000 stop 500`, exit 1. The union is live |
| C5 | `--envelope --gate-path`; `--gate-path --damp-amp 55`; `--envelope` at head and at base | gate-path even: 10.9/16.2, 39.1/52.2, 39.0/44.6, 16.3/16.5, all OK, `above 100% of stop 500: 0 OK`. The control prints `1916 FAIL`. The rendered report is byte-identical to base (`cmp`), and the perceptual+peak md5 is `6e558839ee9e43217e1e2f7afc898b7b` on both |
| C6 head | `node test/engine/mode-isolation-gate.mjs --full` | `pass`, perceptual `34e544942d500b9e` peak `f560f784d8a4883a`, exit 0 |
| C6 at base | the gate and fixture copied onto a 282fca8d clone | the same two hashes, exit 0. The fixture really is the base capture |
| C6 bites | OKHSL-path envelope scaled by 1.01 (`isEven ? 1 : 1.01`) | `FAIL`, perceptual `e3ac69b83ed5f14c` peak `5fcf90f2eabaa89a`, exit 1 |
| C6 blind to even | shoulder off | the same two fixture hashes, exit 0 |
| C8 | the plan's comparator, and `node test/engine/semantic.mjs` | `changed 4, down 4` as ruled; `pass  role-contrast`, `pass  role-contrast Q-B floor gate` |
| C10 | regenerate, then `git diff --stat 282fca8d -- docs/ code.js role-table.json` | tree clean; four docs paths, all citation repairs; no `code.js` or `role-table.json` |

C1 was not re-run here: `npm test` was not run in the worktree, as the dispatch requires. C9's anchor bound lines came from the full C2 run above. The headless boot half was not re-run at load 170. The handoff's evidence for both was read and has the right shape.

## To clear FIX-FIRST

1. F1: add a real target-present check at `anchor.mjs:1017`.
2. F2: make the `mode-isolation` output match C6 and the adapter row (palette count, the pass line last, `dk.palettes.length`, the FAIL wording), or get C6 amended to the real output.
3. F3: print the control's spike count.

verdict: 🟡 FIX-FIRST
