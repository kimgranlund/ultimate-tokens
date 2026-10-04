# Handoff: parallel-batch U3 (#787 predicate) · builder

| Field | Value |
|---|---|
| Unit | U3, branch `unit/pb-U3`, base `plan/parallel-batch` @ 61bcd123 |
| Status | 🟢 C3.1 to C3.4 met, `npm test` green (55 files, exit 0, tree stable) |
| Lane | `src/engine/names.mjs` (new), `test/engine/names.mjs` (new), the `TESTS` line of `test/run.mjs` |

## What was built

`names.mjs` exports `emittedNames(slug)` (a Set), `nameCollisions(palettes)` and `slugOf(name)`. Collision is plain set intersection over enabled palettes (`on !== false`). Each collision is `{ a, b, aSlug, bSlug, name, names }`: `name` is the first colliding name, `names` all of them.

The emitted set is read off the constants the flat exporter (`exports.js` `cssFrom`) joins onto the slug: 25 `EXPORT_STOPS` via `refSlug`, 7 `PRIME_STEPS` via `primeSlug`, `SCRIM_BASES x SCRIM_STEPS` via `refSlug`, 53 `semanticRoles` suffixes. 96 names for `x` (25 + 7 + 11 + 53). The plan's "53 + 7" undercounted: stops and scrims are emitted too.

## Decisions worth a look

| Item | Choice |
|---|---|
| `slug` copy | `exports.js` `slug` is module-local and `model.mjs` is UI-side, and both are outside the lane, so `names.mjs` carries `slugOf`. `test/engine/names.mjs` pins all three to agree on 7 awkward names. |
| Key colours | `n-key-{role}` is opt-in per palette and not knowable from a slug, so it is not in the set (documented in the module header). Edge not covered: a palette `x` with a `dominant` key colour against a palette named `x-key-dominant`. |
| Also collides | (`x`, `x-prime`) collides on `x-prime-bright` too (role `-bright`), so the test checks `includes`, not the full list. |

## Criteria evidence

| # | Result |
|---|---|
| C3.1 | `node test/engine/names.mjs \| tail -1` prints `names PASS, 96 emitted names equal the exporter's, set intersection (not prefix), 2 controls red`. Cases: (x, x-prime) on `x-prime-dim` and `x-prime`; (x, x-hover); (x, x-primer) clean; (x, y) clean; disabled palette ignored (both orders). |
| C3.2 | In-test: `compare(emittedNames("x"), exportCSS names)` is `equal` (document constants `dialog-backdrop`/`white`/`black` excluded); `exportJSON` has 53 role leaves, all in the set. |
| C3.3 | `grep -n "document\|window\|from \"../ui" src/engine/names.mjs` prints nothing (rc 1). A first draft matched my own comment ("document constants"); reworded. |
| C3.4 | perl count prints `55`; `names.mjs` is on the `TESTS` line; `npm test` ends `all 55 test files passed`. |

## Negative controls (planted, run, reverted)

| Plant | Result |
|---|---|
| prefix heuristic in `nameCollisions` | `names FAIL (4)`: (x, x-prime) missing `x-prime-dim`, (x, x-primer) wrongly collides, (Brand A, brand-a), control line |
| `-hover` suffix dropped from `emittedNames` | `names FAIL (3)`: `missing x-hover` against `exportCSS`, plus (x, x-hover) and the JSON leaf check |
| `document.title;` appended to `names.mjs` | the C3.3 grep prints that line |

## Gates

`node test/repo/em-dash.mjs` clean, `node test/repo/branding.mjs` clean. `npm test`: exit 0, all 55 files, `git status` shows only the three lane paths. `npm run build` not run (no `src/` consumer yet; U6 registers the module in `scripts/bundle.mjs`). No `node_modules` needed. Load: the gate-count grep read 4 (two real runs, each counted twice with its `sh -c` wrapper) when I ran, per the Orchestrator's updated rule of 5 or fewer.

## Note for U6

`names.mjs` imports `exports.js` (for `SCRIM_BASES`/`SCRIM_STEPS`), `semantic.js`, `tonal.js`, `prime.mjs`; bundle MODS/KEY registration must carry all of them (they are already in the bundle).

## Pass 2 · builder (review F1, F2, F4)

| Field | Value |
|---|---|
| Status | 🟢 F1, F2, F4 fixed; C3.1 to C3.4 re-run, see Gates |
| Lane | unchanged: `src/engine/names.mjs`, `test/engine/names.mjs`, the handoff |

| Finding | Fix |
|---|---|
| F1 🔴 | `emittedNames` is now the union of CSS, Tailwind and Panda names (100 for `x`, was 96). Added per exporter, read from `exports.js`: the unpadded stops (`x-50`, `x-75`, Tailwind `--color-x-50` and Panda `colors.x.50`), Panda's bare scrim step (`x-scrim-50`, the other ten coincide with the padded names), and Panda's `x-prime-prime` (its prime group holds the `prime` step beside DEFAULT, which the review did not list; found by the equality test). |
| F2 🟡 | `nameCollisions` unions `n-key-{role}` from each `palette.keyColors` (`keyNames`). `emittedNames(slug)` is unchanged, a slug cannot know them. Case: `x` with a `dominant` key against `x-key-dominant` collides; the same pair without the key colour is clean. |
| F4 nit | The control now calls `nameCollisions` on three pairs where the prefix rule and the truth disagree ((x, x-primer), (x, x-5000), (Brand A, brand-a)) and requires the module to side with the truth on all three. No helper's own output is asserted. |

What each format keys (measured by reading the preset or text each exporter returns for a one-palette state `x`):

| Format | Per-palette names | Outside the CSS set |
|---|---|---|
| CSS | 25 padded stops, 7 prime, 11 padded scrims, 53 roles | none (96 names) |
| Tailwind | `--color-x-{unpadded stop}`, prime, 53 roles; no scrims | `x-50`, `x-75` |
| Panda | `colors.x.{unpadded stop}`, `x.scrim.{bare step}`, `x.prime.{step}` plus DEFAULT, 53 role keys with the accent as DEFAULT, flattened with `-` | `x-50`, `x-75`, `x-scrim-50` (only the 050 and 075 stops and the 050 scrim differ once unpadded), `x-prime-prime` |
| Radix | own vocabulary (`x.1` .. `x.12`, `x.a1` .. `x.a12`, `x.solid.bg`, `x.on-accent`, `x.prime`), 45 leaves | all 45, but no pair of palettes can share one: the test checks no leaf ends in another leaf, which is the only way two distinct slugs reach one flat name. Reserved group keys are #630's `radixPaletteKeys`. |

Panda was read from the preset object, not run through Panda's own CSS-variable flattening; the `-` join with DEFAULT dropped is the documented token-path to variable rule, an assumption the test does not prove.

C3.2 is now `emittedNames("x")` equal to the union of the three exporters' names, each a subset, CSS and Panda each adding a name the others lack, plus the JSON role leaves.

Controls planted and run (reverted): unpadded stops removed (`names FAIL (5)`, `(x, x-50)` and the union), `prime-prime` removed (`FAIL (3)`), Panda scrim line removed (`FAIL (3)`), key names removed (`FAIL (1)`), CSS-only set (in-test control, reds `missing`).

Gates (pass 2): `node test/engine/names.mjs | tail -1` prints `names PASS, 100 emitted names equal the CSS + Tailwind + Panda union, set intersection (not prefix), controls red`. C3.3 grep prints nothing (rc 1). `npm test` exit 0, `all 55 test files passed`, `git status --short` showed only the three lane paths. em-dash and branding clean. Gate count read 2 when `npm test` started (it read 6 first; polled until 5 or fewer).

## Pass 3 · builder (rework: sentinel probe, registry, oracle)

| Field | Value |
|---|---|
| Status | 🟢 C3.1 to C3.6 run, each negative control run and reverted; see Gates |
| Lane | `src/engine/names.mjs` (rewritten), `test/engine/names.mjs` (rewritten), the handoff. `test/run.mjs` unchanged (TESTS stays 55). `exports.js` and `ds-export.js` untouched. |

What changed. `emittedNames` no longer unions a hand table of exporters. A probe palette (slug `qzqz`, every key role, `on: true`; the chrome palette, the widest design-system slot set) is run through every surface once per process, memoized. Every name containing the sentinel is a template and `emittedNames(slug)` substitutes the slug. The surfaces are the registry `SURFACES`, 12 rows, one reader each:

| Row | Reads |
|---|---|
| css, oklch | custom properties |
| tailwind | custom properties under `--color-` |
| shadcn | custom properties (reads 0 slug names, asserted) |
| json, dtcg, ui3 | group keys |
| panda | preset paths joined with `-`, `DEFAULT` collapsed |
| radix | preset paths of `radix` and `radixRef` |
| DESIGN.md frontmatter | `colors:` keys (Claude and Stitch), carries every `-dark` sibling |
| tokens.json | the colour section keys (Claude) |
| preview :root | custom properties of the Claude components pages |
| styles.css, layers | custom properties of the Make styles.css and `dsFullLayersCss` |

`NO_FLAT_NAMES` lists the 10 outputs that declare no flat name (the three READMEs, Make Guidelines/setup, foundations/color.md, typography/spacing, components/*.md) each with a reason. Collision is per surface row, so a Radix leaf `x-1` does not collide with the `x-1` palette's CSS accent (the Panda plus Radix preset in one config is the reported case). Retained key colours (`n-key-{role}`) come from a second probe carrying one key colour, minus the base set.

Contract (module header, the phrase on one line): the 10 formats plus the 3 design-system bundles, position-independent superset. Reported, not refused: Panda and Radix presets in one config, a palette against a kit constant, a single palette duplicating itself. The probe is the chrome palette, so for a fill-family partner the template over-approximates: (Neutral, x, x-background-dark) is reported although that arrangement's DESIGN.md is clean; the oracle checks the arrangement with x first, where it does duplicate.

Measured (not stated):

| Quantity | Value |
|---|---|
| templates read for `x` | 164 (was 100): the 45 Radix leaves and the 20 DESIGN.md `-dark` names are new, and nothing the old table listed is missing |
| key template | `qzqz-key-zzrl` |
| first call (3 probe renders, all surfaces) | about 120 ms on an idle machine, 354 ms measured at load 32; the pass 2 estimate of 5 ms was wrong. Once per process. |
| `emittedNames` x1000 | 49 to 71 ms (about 0.05 ms a call) |

Printed lines (real output):

```
surfaces 26 read, 10 listed, 0 unread
oracle 167 pairs, 0 disagreements
contract 1 line(s) carry the phrase
memoized
names PASS, 164 template names read from 12 surface rows, set intersection (not prefix), controls red
```

The oracle is written in the test and shares no code with the module's readers. Text scans: a custom property declared twice in one `{...}` rule block, a YAML key twice under one parent of the DESIGN.md frontmatter. Object scans: Panda and Radix dictionaries flattened and compared as strings. A single palette's own duplicates are subtracted (self-duplicates are reported, not refused). Partners are every emitted name of `x` taken as a slug, plus `x-primer`, `x-5000`, `y`. The verdict is compared to `nameCollisions`. tokens.json is a JSON object, so an overwrite leaves no text trace; the DESIGN.md frontmatter lists the same names, which is how the oracle covers it. No disagreement appeared, so no handling was needed for the chrome over-approximation.

Negative controls (planted, run, reverted; real output):

| Control | Result |
|---|---|
| DESIGN.md frontmatter row removed (the `-dark` reader) | `surfaces 24 read, 10 listed, 2 unread`, `names FAIL (8)`: `(x, x-dark)`, `(Brand, Brand Dark)`, `(Neutral, x, x-hover-dark)` missing, `emittedNames("x") lacks x-dark` |
| the `-dark` names dropped inside the DESIGN.md reader | `surfaces 26 read, 10 listed, 0 unread`, `oracle 147 pairs, 0 disagreements`, `names FAIL (7)` on the same three collisions |
| tokens.json row deleted | `surfaces 25 read, 10 listed, 1 unread`, `(ii) unread surface: claude:tokens.json` |
| header phrase changed | `contract 0 line(s)`, `(C3.5) ... appears on 0 lines, expected 1` |
| position-aware predicate (the second palette loses its DESIGN.md names) | `oracle 167 pairs, 20 disagreements`, `(iii) oracle: x-background-dark: scan collides, predicate clean`, `names FAIL (24)` |
| prefix heuristic as `nameCollisions` | `oracle 167 pairs, 46 disagreements`, `names FAIL (66)`: `(x, x-primer): the lookalike must not collide` and more |
| memo removed | `NOT memoized`, `(C3.6) templateNames() must return the same memoized Set`, exit 1. The check runs first and stops: with no memo the oracle takes several minutes. |
| `document.title;` appended for C3.3 | the grep prints `233:document.title;`; clean file prints nothing (rc 1). I reworded two header comments that said "documented" and "document" so the clean file is silent. |
| `engine/names.mjs` removed from TESTS | count 54; committed count 55 |

Gates (pass 3): C3.3 grep prints nothing. C3.4 TESTS count 55. `node test/repo/em-dash.mjs` clean (1176 files), `node test/repo/branding.mjs` clean (1168 files).

Note for U6. `scripts/bundle.mjs` MODS: `names` imports `exports.js`, `ds-export.js`, `type.mjs` and `geometry.mjs`, so it goes after `dsExport` and must see the type and geometry engines. It stays DOM-free (C3.3). Cost: the first call renders every export surface three times (about 120 ms), so call it lazily, not at module load.

`npm test` exit 0, `all 55 test files passed`, `engine/names.mjs` among them; the machine ran at load 32 for the whole run (other seats), well past the 5-or-fewer guidance, so it took many minutes, no test failed. `git status --short` after it showed only the three lane paths.
