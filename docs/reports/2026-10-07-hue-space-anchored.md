# Hue space on anchored palettes: before and after (2026-10-07)

Evidence for T-0015 (#805) and ADR-031 in `docs/references/decision-records.md`. The global Hue space
toggle now names the space in which an anchored palette holds its anchor's own measured hue constant:
`oklch` holds the anchor's OKLCH hue, `cam16` its CAM16 hue, and the anchor pixel stays verbatim in
both. This report is the ruling record user decision 2 names: saved kits at the default space move
their anchored prime ladders, and nothing else at that space moves.

## Command

```
node scripts/report-preset-fidelity.mjs --identity-control --migrate --authored --base "$(git merge-base HEAD main)"
node test/engine/anchor.mjs --full
```

- Base: `git merge-base HEAD main` = `10352b1a44689d3167c800339e8065baef05f8f2`, the fork point after
  T-0014 landed (PR #808, `e268835c`) plus its task records.
- Head: `plan/hue-space-anchored` at `77d9230d2a2e62c5ae19b8225b054e92dd9d1e1a` (steps 1 to 3). This
  step changed no engine or UI file, so the reading is the step 3 tree's.
- Subjects: the base tree's 8 category files (343 documents, 3,780 palettes) and the default kit (16
  palettes), 3,796 palettes, 25 export stops each, 94,900 cells per tone mode.
- `--migrate`: T-0015 changes no persisted field, so the head-side `hydrate` equals the base one;
  `--migrate` is used because it is the only mode that prints the prime strip and key tile reads.
  `--authored` keeps every `anchor`. Every subject is `hueSpace: "oklch"` (the corpus and the default
  kit), so this is the default-space reading. The script exited 0 in 2 min 28 s (144.4 s user).
- `node test/engine/anchor.mjs --full` exited 0 in 7 min 47 s (389.5 s user); its `prime-huespace`
  and `anchor-f4` lines are quoted below.
- Default-kit ladder drift, run against this tree and against a throwaway worktree at the base
  `10352b1a` (removed after): for every anchored default-kit palette with `hueShift` 0, the largest
  OKLCH hue distance between a rung with OKLCH C at least 0.05 and rung 3, from
  `primeSwatches(p, { hueSpace: "oklch", primeChroma: 100 })` (the step 1 criterion's predicate).
  Run as `node drift.mjs <this tree>` and `node drift.mjs <base worktree>`, with `drift.mjs`:

```
const root = process.argv[2];
const { defaultDocument } = await import(root + "/src/ui/model.mjs");
const { primeSwatches } = await import(root + "/src/engine/prime.mjs");
let worst = 0, min = Infinity, n = 0; const per = [];
for (const p of defaultDocument().palettes) {
  if (!p.anchor || (p.hueShift ?? 0) !== 0) continue;
  const sw = primeSwatches(p, { hueSpace: "oklch", primeChroma: 100 });
  const h0 = sw[3].oklch[2]; let w = 0;
  for (const r of sw) { if (r.oklch[1] < 0.05) continue; n++; w = Math.max(w, Math.abs(((r.oklch[2] - h0 + 540) % 360) - 180)); }
  per.push(`${p.name} ${w.toFixed(2)}`); worst = Math.max(worst, w); min = Math.min(min, w);
}
console.log(`n ${n} palettes ${per.length} min ${min.toFixed(2)} max ${worst.toFixed(2)}`); console.log(per.join("; "));
```
- Gates, each through `gate_lock.py run` with `SDLC_GATE_WORKERS=10`: `npm test`, `npm run build`
  and `npm run gate:sweeps`. The sweeps ran as their 8 legs, one
  `gate_lock.py run --name sweeps-<leg> -- npm run gate:<leg>` each, because the whole chain is
  longer than one 10-minute foreground call (the T-0014 precedent). Measured `gate:sweeps` time:
  corpus-tonal 332 s, corpus-anchor 360 s, sweep-prime 173 s, corpus-reset 412 s,
  corpus-contrast 165 s, mode-isolation 65 s, even-dips 180 s, chroma-envelope 117 s, 1,804 s in
  total (30 min 4 s, lock waits included, load average about 10 to 13), all green with no re-pin.
  `npm test` took 348 s (54 files) and `npm run build` 6 s (generators, `tsc`, `vite build`, bundle).

## Movement

The printed lines:

```
ramp perceptual: 0 of 94900 cells differ
ramp peak: 0 of 94900 cells differ
ramp even: 0 of 94900 cells differ
prime: 3147 of 3796 strips moved
key: 0 of 3796 tiles moved
0 differing cells
```

- Ramps, all three modes: 0 cells. At `oklch` the anchored perceptual and peak ramps already held
  the anchor's OKLCH hue and the even ramp already solved per stop, so the default space renders the
  base bytes.
- Key tiles: 0 of 3,796. At the default Prime chroma k 100 the anchored key tile is the stored anchor
  in both spaces, and a non-anchored tile is untouched.
- Prime strips: 3,147 of 3,796. Before, every anchored ladder held the anchor's CAM16 hue in both
  spaces; at `oklch` each rung now solves the CAM16 hue whose render reads back at the anchor's OKLCH
  hue. The movers are the 3,131 corpus anchored ladders that the `prime-huespace` gate counts (of
  3,380, the rest land on the same codes) plus the 16 default-kit ladders. The plan-time prototype
  of step 1 read the same 3,147; the architect's scratch estimate against the T-0014 worktree was
  3,128 of 3,380 corpus. Rung 3 moves 0 times (`prime-huespace: ... rung 3 moved 0`).
- Largest move: `prime-huespace: default kit 16 of 16 ladders moved, corpus 3131 of 3380, max OKLab
  dE 0.0307 (want > 0.01), rung 3 moved 0 (want 0)`. The printed 0.0307 is the default kit's maximum
  (the gated number); the gate does not print a corpus maximum, and the architect's corpus estimate
  of 0.037 was a scratch reading. At `oklch` and k 100 the `cam16` branch renders the base ladder
  byte for byte, so this cross-space reading is the before and after.
- Default-kit outer-rung OKLCH hue drift from the anchor (112 rungs over 16 palettes):

| Palette | Before | After |
|---|---|---|
| Neutral | 2.69 | 0.64 |
| Primary | 5.50 | 0.25 |
| Secondary | 0.80 | 0.36 |
| Tertiary | 2.30 | 0.42 |
| Info | 1.62 | 0.46 |
| Success | 1.39 | 0.18 |
| Warning | 0.74 | 0.29 |
| Danger | 0.41 | 0.12 |
| Data 1 | 7.97 | 0.33 |
| Data 2 | 1.92 | 0.28 |
| Data 3 | 0.76 | 0.20 |
| Data 4 | 1.14 | 0.44 |
| Data 5 | 0.50 | 0.53 |
| Data 6 | 1.08 | 0.19 |
| Data 7 | 0.65 | 0.65 |
| Data 8 | 2.40 | 0.64 |

  Before 0.41 to 7.97 degrees, after 0.12 to 0.65 degrees, against step 1's 1.5-degree criterion
  (plan-time prototype 0.65). Exported `prime.*` tokens move with the ladder.

## Hue-space bounds

From the same `node test/engine/anchor.mjs --full` run:

```
pass  anchor-f4 hueSpace-even: moved 16 default-kit anchored ramps, stop 500 moved 0 (want >=1, 0), max OKLab dE 0.0281 (want > 0.01, ...), asserted in even only
pass  anchor-f4 hueSpace-perceptual: moved 16 default-kit anchored ramps, stop 500 moved 0 (want >=1, 0), max OKLab dE 0.0164 over full corpus + default kit (want <= 0.02, worst default kit "Default" Data 1 stop 350)
pass  anchor-f4 hueSpace-peak: moved 16 default-kit anchored ramps, stop 500 moved 0 (want >=1, 0), max OKLab dE 0.0169 over full corpus + default kit (want <= 0.02, worst travel "31° N · April · 18:45 · Souk Semmarine, Marrakech medina" primary-muted stop 350)
pass  anchor-f4 hueSpace bound control: planted render (default kit Primary perceptual, hueShift 45) reads max OKLab dE 0.0474 at stop 650 (want > 0.02), so the per-mode bound reds on it
```

- Perceptual 0.0164 and peak 0.0169 match the plan-time prototype (0.0164 and 0.0169), under the
  per-mode bound of 0.02 (decision 1). The even ramp reads 0.0281, above its 0.01 magnitude floor.
- The cap ruling (step 2 item 3): the peak cap call `capChromaAtHeldTone(hue, s, l, rgb, chroma,
  ceiling, null, true)` (`src/engine/tonal.js:1951`) passes `null` in both spaces, so a capped stop
  keeps its own pre-cap OKLCH hue, which the `cam16` solve already put on the anchor's CAM16 line. The
  architect's interface passed the anchor's CAM16 hue instead; step 2's plan-time prototype over the
  full corpus and default kit measured the cap-moved peak stops at 0.0202 OKLab dE between spaces
  with that (worst film "Hereditary" tertiary stop 450), over the 0.02 bound, and 0.0166 with `null`.
  It is the principle of decision 4: a chroma reduction applied after the hue is set holds the
  stop's own OKLCH hue.

## Re-pinned gates

Every literal, fixture and constant steps 1 and 2 moved. Old values are the ones recorded in each
re-pin's own inline note and in the step 1 and step 2 builder results.

| Gate | File:line | Old | New |
|---|---|---|---|
| panda EX-1 `prime.brightest` (step 1) | `test/engine/exports.mjs:531` | `oklch(0.733 0.1374 264.49)` | `oklch(0.7307 0.1399 259.24)` |
| panda EX-1 `prime.dimmest` (step 1) | `test/engine/exports.mjs:532` | `oklch(0.2669 0.1023 258.76)` | `oklch(0.2678 0.1038 258.99)` |
| `ladder-span` `SPAN_PX_EXPECTED` (step 1) | `test/engine/prime.mjs:1192` | 364 | 365 (`SPAN_CONSTRUCTED_EXPECTED` 363 held) |
| shadcn baseline (step 2) | `test/engine/fixtures/shadcn-baseline.css`, T-0015 note `:88` | T-0014 capture | re-captured at `hueSpace: "cam16"`: 19 / 19 / 19 lines moved (ALL / BRAND_ONLY / ALL_DATA_OFF), line counts 124 / 115 / 115 unchanged |
| radix baseline (step 2) | `test/engine/fixtures/radix-baseline.json`, note `test/engine/exports.mjs:903` | T-0014 capture | re-captured: 550 / 306 / 286 leaves moved (ALL / BRAND_ONLY / COLLIDING), leaf counts and key order unchanged; the unanchored Accent and Error palettes byte-identical |
| `anchor-f4` hue-space case (step 2) | `test/engine/anchor.mjs:1609` `HUE_SPACE_MODE_BOUND` | one even-only case and the Q-D invisibility block: `HUE_SPACE_DELTA_E_BOUND` 0.01, `HUE_SPACE_DELTA_E_BOUND_PEAK_CAPPED` 0.02, `HUE_SPACE_CODES_BOUND` 2 with its default-kit codes gate, `maxChannelDiff`, the `capped` scope and its vacuity check, the recorded 33/34-code control | removed; three cases `hueSpace-even` (floor 0.01 kept), `hueSpace-perceptual` and `hueSpace-peak` (bound 0.02 each), and the `hueSpace bound control` |
| `prime-huespace` and its control (step 1) | `test/engine/anchor.mjs` | none | new: at least one default-kit ladder moves above 0.01 OKLab dE between spaces, rung 3 moves 0 |
| `anchor-identity`, `key-anchor corpus`, `anchor-k`, `anchor-k scale control` (step 1) | `test/engine/anchor.mjs` | `hueSpace` of the preset only | both spaces, 6,760 renders each |
| `(hs)` Q-D block (step 3) | `test/ui/headless-boot.mjs` | the control disabled on an all-anchored perceptual document, with a note | `(hse1)` to `(hse7)`: the control is live and the click moves Primary's prime ladder |

The `oklch-native` bar in `test/ui/shell.mjs` (45 RGB, ADR-030) did not move: the architect expected
a re-pin, and steps 1 to 3 and this step's `npm test` ran green without one. No `tonal.js` constant
moved, and every `gate:sweeps` leg is green with no re-pin, `mode-isolation` included (its fixture
reads the corpus and the default kit, all `oklch`).

Step 3 removed lines from `src/ui/sections/color.js`, which shifted the `color.js` line citations in
`docs/references/component-inventory.md` and `docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md`;
this step moved them to the new lines so `test/repo/citations.mjs` reads green.

## Follow-ups

- Legacy documents stamped `cam16` by the old `hydrateStoredDoc` (a stored document that predates
  `hueSpace`) now render CAM16-constant anchored perceptual and peak ramps and keep their
  CAM16-constant ladders. No migration (decision 3): the flag now means what it says, and a stamp
  cannot tell a chosen `cam16` from a legacy one. There is no such document in the repo to measure.
- `dampStops` keeps holding the OKLCH hue after damping on perceptual and peak in both spaces
  (decision 4), the same rule the peak cap now follows.
- No schema bump: no field is added, renamed or translated, and nothing derived is stored.
  `CURRENT_SCHEMA_VERSION` stays 8 (`src/ui/persist.js`) and T-0017 takes v9.
- `docs/specs/spec-panda-park-ui-exports.md:481` still quotes the pre-T-0015 EX-1 literals
  (`oklch(0.733 0.1374 264.49)`, `oklch(0.2669 0.1023 258.76)`); no gate reads it. The new values are
  in the table above.
- The `capped` row flag in `src/engine/tonal.js` is still produced, but no test reads it after the
  Q-D block's removal.
