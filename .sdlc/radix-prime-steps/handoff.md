---
id: T-0047
title: "Radix steps 7 to 10 read the prime ladder instead of base ramp stops"
type: feature        # feature | bug | chore | spike | idea
status: ready        # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L2             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-11
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
The Radix export and the Radix canvas view point steps 9, 10, 7 and 8 at the palette's prime ladder (the saturated brand identity rungs) instead of base ramp stops; steps 1 to 6, 11 and 12 stay base. Every gate stays green and one independent verifier passes.

## Intent
User ruling 2026-10-11 ("radix mappings should not just use base colors; think about which should point to primes and which to base"), chosen option "9 and 10 plus 7 and 8 to primes". Today steps 1..8 are raw ramp stops (`RADIX_RAW_STEPS`, `src/engine/exports.js`) and 9..12 are role stops (550/650/750/950, `RADIX_ROLE_STEPS`); the prime is only the extra `prime` leaf. Measured on the default kit: Primary step 9 is #1554B0 (chroma 64) while its prime is #0C5DCC (79); Danger #962115 vs #AD1A0D; Success #296324 vs #21701A.

## Design (the conductor's default; change only with a reason recorded in the ADR)
Prime rungs are `PRIME_STEPS` = brightest, brighter, bright, prime, dim, dimmer, dimmest (`src/engine/prime.mjs`, `primeSlug`), mode-independent swatches. Map, light / dark:
- step 9 (solid): `prime` / `prime` (the brand colour is the same in both modes, as in Radix).
- step 10 (hovered solid): `dim` / `bright`.
- step 7 (interactive border, focus ring): `brightest` / `dimmer`.
- step 8 (hovered border): `brighter` / `dim`.
- steps 1 to 6, 11, 12: unchanged (base ramp stops and roles).
Verify the lightness order per mode: borders 6 -> 7 -> 8 get progressively stronger against the surface and 9 -> 10 is a distinct hover; if a pair does not separate (check L* and contrast), adjust the rung pick for that pair only and record why.

## Context
- `radixColorGroup`, `RADIX_RAW_STEPS`, `RADIX_ROLE_STEPS`, `RADIX_VALUE_LEAVES`, `radixRefLeaves` (REFS form links `var(--{pfx}-{palette}-prime-{step})`, `primeSlug`) in `src/engine/exports.js`; `radix-projection.json` (`docs/reference/data/`, the canonical projection table, REQ-020..028 in `docs/specs/spec-panda-park-ui-exports.md`); the alpha steps a1..a12 are computed from the same step colours so they follow.
- The on-colour: `solid.fg` is `on-accent` (`-on-{palette}` role) computed against the old step 9 fill. With the prime as the fill, `on-accent` must clear AA against the prime (white or black, by the repo's on-colour policy); keep the contrast gate true.
- The Radix canvas view and tooltips (`RADIX_STEP_GUIDE`, `src/ui/sections/color.js`) read these steps; the shell tooltip text stays.
- Byte pins: `test/engine/fixtures/radix-baseline.json` and `shadcn-baseline.css` are `ramp@1`-pinned declared gaps (T-0040); the radix baseline must be re-captured for the changed steps with the repo's own generator and the diff reviewed (only steps 7..10 and a7..a10 and `solid.*` change). Update `test/engine/exports.mjs`, `test/ui/model.mjs` Radix checks and any headless-boot Radix group, the MCP and consumer-skill parity, and docs that state the mapping (spec REQ-021..024, `docs/reference/data/radix-projection.json` steps 7..10, knowledge docs, skills `adding-export-formats`).
- Append an ADR (ADR-038, before the Quick map in `docs/references/decision-records.md`, Status PROPOSED, with its Quick map row): the Radix steps that read the prime ladder, why 1..6/11/12 stay base, the mode mapping, the on-colour consequence. Do not renumber other ADRs.

## Acceptance criteria
- On the default kit, for every palette and both modes: Radix step 9 equals the prime hex, step 10 the mapped rung, step 7 and 8 the mapped rungs, and steps 1 to 6, 11, 12 are byte-identical to before: check by a node script over `exportRadix` output against `projectView` prime swatches and a base-vs-head compare.
- `solid.fg` (`on-accent`) clears WCAG AA against step 9 in light and dark for all 16 default palettes and the curated corpus sample the existing contrast gate uses.
- `node test/engine/exports.mjs`, `node test/ui/model.mjs`, `node test/ui/headless-boot.mjs` and `node test/repo/citations.mjs` pass; `npm test` passes; `npm run build` and `npm run smoke` pass.
- ADR-038 exists before the Quick map with a Quick map row; docs and the data file state the new mapping; `docs/reference/data/radix-projection.json` stays valid for its parity test.

## Constraints
Engine stays pure and DOM-free; no new dependency; no change to the prime ladder itself or to `ramp@2`; other exports (shadcn, Panda, CSS) stay unchanged; the reference form (`opts.refs`) must link existing primitives that the CSS export declares (no new names). Do not push or open a PR; the conductor does. One independent verifier at the end.

## Acceptance criteria (guard, added 2026-10-11 after the verifier's step 7 finding)
- Light Radix step 7 is never lighter than step 6 on the full corpus: 343 documents x 3 tone modes read 0 palette-modes with step 7 lighter than step 6 by 0.5 L* or more (own re-derivation from the rendered pixels).
- The default kit's Radix output is byte-identical to the unguarded build (all 16 keep `brightest`); dark mode and steps 9 and 10 are unchanged; AA on `solid.fg` stays 0 under 4.5 on the full corpus.
- `node test/engine/exports.mjs`, `node test/engine/curated-contrast.mjs` (incl. the `radix-order` leg), `node test/repo/citations.mjs` and `npm test` pass; with the guard disabled the new checks fail.
