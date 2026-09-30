PASS

# chroma-envelope U3 review, pass 1 (#725)

- Seat: reviewer-l3 (R79), fresh context.
- Target: `unit/ce-U3` @ 31bba1e6 (engine 0bbae01b). Base: `plan/chroma-envelope` @ b8142c16.
- Verdict: PASS. There are no blocking or high findings. One medium and four low findings are record defects in comments and the handoff. None of them changes behavior or a gate.

## Evidence (my own runs, in the unit worktree, tree clean after)

| Check | Result |
|---|---|
| `node test/engine/anchor.mjs --full` (the one heavy suite, load 4.8 to 5.2) | exit 0, 136 s. monotone 0 and default-kit monotone 0. gap 79, distinct 19, notch 15, window 10 all matched by name. f4 perceptual and peak bounds max dE 0.0000 over uncapped stops. Cap-moved stops 7364. |
| `scripts/report-preset-fidelity.mjs --envelope` | exit 0. Gate path, perceptual stop 300: median 74.6, p90 89.3. Anchored: Kea named at 227.26%. Peak above-100 is 0. |
| `--compare` against the U2 fixture from b8142c16 | Exactly `2 cells rose`: peak 100 median 8.53 to 8.91, peak 300 p90 97.42 to 99.50. Even is byte-identical (C3.6). |
| `chroma-envelope-gate --full`, `mode-isolation-gate --full`, `semantic.mjs` | All exit 0. The mode-isolation fixture matches. |
| Negative control: NAMED_EXCEPTIONS emptied from an importer | Unnamed count 1, so the control bites. |
| C3.1 probe | At stop 100/300: perceptual and peak 0.2304 / 0.7435, and 1.0 at stop 500. At damp 0, every stop is 1.0. Even is unchanged. holdTone at env 1 returns `l` exactly; at env 0.3 the residual is 2e-8. |
| Default kit anchored oklch vs cam16 | 0 of 800 hex diffs. |
| C3.8: added allow-list members | Every added RAMP_GAP_ALLOW member fails only at peak 50&100, 100&150 or 900&950. Every added RAMP_DISTINCT_ALLOW member duplicates at 50&75, 75&100, 825&850 or 875&900. The three dark mid-ramp gap failures (late-night club, UK '77, Carlsbad) were already on the gap list at base. |
| Hygiene | em-dash and branding gates are clean. The two U+2014 hits in the diff are unchanged context lines of `.sdlc/baseline.md`. No `.sdlc/board.md`, `.claude/docs/other/` or `node_modules` in any of 67cc0cde, 9db4d8ab, bd304e93, 0bbae01b or 31bba1e6. |

## Construction (criterion 2)

- `hOkStop = oklchSpace ? targetOklchHue : hOkSeed` in `src/engine/tonal.js`, with no per-stop `solveOkhslHue` on the anchored path.
- The non-anchored path keeps its single stop-500 solve.
- `okhslToRgb` equals `okhslToRgbFloat(...).map(Math.round)`, so it is byte-identical.
- The only special cases are the named R76/R77 exceptions: Kea, the 12 GRID_R2 quantization keys, and PENDING_U4 4.8. There are no per-hue constants (R78 holds).

## Findings, by severity

1. **Medium.** `test/engine/anchor.mjs:1342` records the wrong provenance.
   - The f4 comment says the `capped` flag "was measured against that diff at U2's engine before the diff was removed: 7841 stops".
   - Handoff D9 (`.sdlc/handoffs/chroma-envelope-U3.md:129`) says the measurement was taken at U3's head, over 84900 stops.
   - The full run reports 7364 cap-moved stops.
   - The comment is the permanent record of why f4 may trust the flag, so it has to name the engine and count that were actually measured.
2. **Low.** The handoff contradicts itself on the flag count.
   - C3.5 and C3.7 (`chroma-envelope-U3.md:24,26`) say 7364.
   - D9 (`chroma-envelope-U3.md:129`) says "flag 7464, diff 7464".
   - My run confirms 7364, so D9 is the typo.
3. **Low.** `test/engine/tonal.mjs:1336` says KNOWN_BASELINE_DUP was re-frozen "to 32 keys".
   - The list and its own note say 22 to 30.
   - I count 30.
4. **Low.** The damp residue exponent is stale in the records.
   - The plan's C3.1 (`.sdlc/plans/chroma-envelope.md:155`) and handoff D2 (`chroma-envelope-U3.md:113`) say `r^2.0875`.
   - The code derives `ln(1-D)/ln(0.3)` = 2.1796 from D 0.9275. The value 2.0875 corresponds to D 0.919.
   - The code is self-consistent; only the records are stale.
5. **Low.** Two `// measured` comments sit beside re-pinned FLOORS and now disagree with the pins.
   - `test/engine/semantic.mjs:264`: Data 3 says "measured 6.10 / 4.92" but is pinned 4.8.
   - `test/engine/semantic.mjs:302`: Success says "measured 7.60" but is pinned 7.5.
   - The handoff defers this to U4, and PENDING_U4 carries the cause. Refresh these comments when the pins are re-read at U4.
6. **Note.** `scripts/lib/envelope-measure.mjs:46`: NAMED_EXCEPTIONS exempts Kea by name with no magnitude bound.
   - If Kea regresses further (currently 227.26%), the report still exits 0.
   - A ceiling beside the name would keep the exception honest. This is not required by any criterion.

## Test-bar changes (criterion 3)

- The four allow-list re-freezes each name their movement (added and removed members, with the U2 head comparison): gap 72 to 79, distinct 16 to 19, notch 17 to 15, KNOWN_BASELINE_DUP 22 to 30.
- The PASS line now reads the list lengths from the lists themselves.
- Two tests were loosened: the lift-monotonic bound now uses the palette's own damp-0 ramp, and skew-lift (i) now reads at damp 0.
  - Both are declared in D6.
  - The new (i b) hold check compensates, and CAP_L_EXCEPTIONS entries must carry `capped`.
- F3 (the C6 (v) needle now calls holdTone) and F4 (f4 reads the engine's `capped` flag in place of the removed scratch-engine diff) are sound: the full f4 bound holds at 0.0000.

## Scope (criterion 4)

The unit also touches `docs/spec/spec-panda-park-ui-exports.md`, the `test/engine/exports.mjs` Panda EX-1/EX-2 re-pins, the generated assets, `.sdlc/baseline.md` and the reactivity citations. Each follows from the re-pins or from a gate regeneration. None is scope creep.
