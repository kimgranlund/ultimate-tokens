<!-- role=filer level=L1 model=sonnet effort=medium -->
## Warnings
None

## PR title
T-0015: Hue space toggle (OKLCH/CAM16) also applies to anchored palettes

## PR body
Closes #805.

### Summary
The global Hue space toggle (`doc.hueSpace`) used to be ignored by anchored palettes, so on a kit where only Material is unanchored it appeared to change only Material. An anchored palette now holds the measured hue of its anchor in the chosen space while the anchor stays its key colour. The toggle moves every surface where the two hue models differ. Design: `.sdlc/hue-space-anchored/architect-L1.md`. ADR-031.

Decisions ruled by the user on 2026-10-07:
- Anchored perceptual and peak ramps move only within rounding (measured 0.0164 and 0.0169 OKLab dE, cap 0.02). The control's title says so.
- Saved kits at the default space (oklch, k 100) have their anchored prime ladders' outer rungs move, and exported prime tokens move with them. The before/after report is the ruling record.
- Legacy documents stamped cam16 by the old hydrate now render CAM16-constant anchored ramps and ladders, with no migration.
- `CURRENT_SCHEMA_VERSION` stays 8, and T-0017 takes v9.
- `dampStops` keeps holding OKLCH hue after damping.

### Changes
- Engine, `src/engine/prime.mjs`, `src/engine/tonal.js` and `src/ui/model.mjs`:
  - `solveCam16Hue` is exported.
  - A shared `rungHue(l)` solves the anchored ladder's hue in OKLCH. `deriveKeyColor` does the same at k != 1.
  - Anchored perceptual and peak ramps get the hue-space rule from `tonal.js`.
- UI, `src/ui/sections/color.js` and `src/ui/app-helpers.mjs`:
  - The Hue space control is live on every document, with `huespace-doc-reason`, `huespace-palette-reason` and `HUE_SPACE_ANCHOR_REASON` removed.
  - The label title now describes the anchored behaviour.
- Gates:
  - `anchor-identity`, key-anchor corpus and `anchor-k` now run in both hue spaces.
  - New gates `prime-huespace` and `prime-huespace control` are added.
  - The old per-mode `HUE_SPACE_*` bounds are replaced by `HUE_SPACE_MODE_BOUND` = 0.02.
  - The headless-boot group `(hse1)` to `(hse7)` replaces the old `(hs)` Q-D block.
- Re-pinned:
  - Panda EX-1 `prime.brightest` is now `oklch(0.7307 0.1399 259.24)` and `prime.dimmest` is now `oklch(0.2678 0.1038 258.99)`.
  - The prime ladder-span pin goes from 364 to 365.
  - The shadcn and radix baseline fixtures are re-captured: shadcn 19 lines differ in each of its 3 variants, radix 550, 306 and 286 leaves.
- Docs: ADR-031 is added with its Quick map row, the ADR-026 Q-D text is marked superseded, the spec and skill text is updated in four files, and the report `docs/reports/2026-10-07-hue-space-anchored.md` is new.
- Generated: `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js` are regenerated.
- Citations: line citations are repaired in `docs/references/component-inventory.md` and `docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md` (one line, citation move only).

Measured movement (report, step 4): ramps 0 of 94,900 cells differ and key tiles 0 of 3,796 move at the default space, while 3,147 of 3,796 prime strips move. The default-kit ladder hue drift from the anchor falls from 0.41 to 7.97 degrees before to 0.12 to 0.65 degrees after.

### Verification
Every step passed its independent verifier (step 1 L3, step 2 L3, step 3 L2, step 4 L2).
- Step 1, ladder and key:
  - Each red criterion is red at base and green on the built tree, and the 64-case identity guard stayed green. Examples: the key at k 50 reads `#49638C` in oklch against `#4F628D` in cam16; 16 of 16 default-kit ladders move.
  - `anchor.mjs` printed `pass` for all new and extended gates.
  - `npm test` passed all 54 files.
- Step 2, ramp bound:
  - Hue drift on default-kit stops with C >= 12 drops from 14.51 to 3.13 degrees (perceptual) and from 18.30 to 4.55 degrees (peak).
  - Max `projectView` dE is 0.0164, which is red at base (0).
  - `anchor.mjs --full` passed, and the 96-case stop-500 identity held.
  - `npm test` passed.
- Step 3, UI:
  - `headless-boot` passed `(hse1)` to `(hse7)`.
  - The builder's negative control (forcing `disabled: true`) failed `(hse1)`, `(hse2)`, `(hse3)` and `(hse6)`, then was restored.
  - The scope guard held.
  - The step left `repo/citations.mjs` red, and step 4 repaired it.
- Step 4, report, ADR and full gates:
  - Report headings and the movement script rerun matched.
  - ADR count went from 30 to 31.
  - `npm test` (54 files), `npm run build` and the 8 sweep legs all exited 0. The legs ran separately with `SDLC_GATE_WORKERS=10`, because the chained `gate:sweeps` exceeds the 600 s foreground limit.
  - `citations`, `em-dash` and `branding` are clean.
- Not run by the verifier: it did not rerun the 7:47 `anchor.mjs --full` measurement, but the `corpus-anchor` leg is the same command and passed.
- Not run in these records: `npm run smoke` (real headless Chrome).

## Changelog entry
- The Hue space toggle (OKLCH or CAM16) now also applies to anchored palettes. An anchored palette keeps its anchor as its key colour and holds the anchor's hue in the chosen space, so its prime ladder and even ramp move with the toggle. Its perceptual and peak ramps move only within rounding (at most 0.02 OKLab dE). The control is no longer disabled on anchored palettes. At the default space, anchored prime ladders' outer rungs shift slightly (max 0.037 dE), and exported prime tokens, the shadcn and radix baselines, and the Panda export shift with them.

## Follow-ups
- fix-now: `docs/specs/spec-panda-park-ui-exports.md:481` still quotes the old Panda EX-1 `prime.brightest` and `prime.dimmest` literals (`oklch(0.733 0.1374 264.49)` and `oklch(0.2669 0.1023 258.76)`); update them to the re-pinned values.
- note: the `capped` row flag is still produced by `src/engine/tonal.js` but nothing reads it since `HUE_SPACE_DELTA_E_BOUND_PEAK_CAPPED` and the capped scope were removed from `test/engine/anchor.mjs`.
- note: step 4 edited `docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md`, a finished dated record, for a one-line citation move that `test/repo/citations.mjs` required; the builder flagged it for the planner to rule on.
- note: legacy documents stamped cam16 by the old hydrate now render CAM16-constant anchored ramps and ladders with no migration (user decision 3); `dampStops` still holds OKLCH hue after damping (decision 4, default taken).
