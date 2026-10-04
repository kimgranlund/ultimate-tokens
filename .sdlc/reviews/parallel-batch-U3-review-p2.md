FAIL

# Review pass 2: parallel-batch U3 (#787 predicate) · reviewer

| Field | Value |
|---|---|
| Unit | U3, `unit/pb-U3` @ fb7f69f1, base 61bcd123 |
| Verdict | 🔴 FAIL on one major finding (F5): the design-system DESIGN.md (Claude Design and Stitch bundles) joins `-dark` onto every grammar role name, and the union misses it, so (`Brand`, `Brand Dark`) reads clean and ships a duplicate YAML key |
| Pass 1 findings | F1 🟢 closed · F2 🟢 closed · F4 🟢 closed · F3 accepted in pass 1, unchanged |
| Criteria | C3.1 🟢 · C3.2 🟡 (passes as written; the union still misses one exporter's join, F5) · C3.3 🟢 · C3.4 🟢 |
| Gates | `npm test` exit 0, `✓ all 55 test files passed`, `engine/names.mjs pass`, 479 s wall, `git status --short` 0 lines after. `NODE_OPTIONS` unset; heavy-process count read 4 before the run (polled from 7) |
| Scope | `git diff --name-only 61bcd123..HEAD`: the handoff, the pass 1 review, `src/engine/names.mjs`, `test/engine/names.mjs`, `test/run.mjs` (the `TESTS` line only, 1 line out, 1 in). Nothing from `.claude/docs/other`. U+2014 in the diff: 0 |

## Pass 1 findings, re-checked with my own probes

| Finding | Probe | Result |
|---|---|---|
| F1 (x, x-50) | `nameCollisions` on (x, x-50), (x, x-75), (x, x-500), (x, x-5000) | collide, collide, collide, clean |
| F1 every exporter, one palette | per-surface name sets for a one-palette state `qz` across `exportCSS`, `exportOKLCH`, `exportJSON`, `exportDTCG`, `exportUI3`, `exportTailwind`, `exportShadcn`, `exportPanda`, `exportRadix`, both preset modules, and `ds-export.js`'s Claude Design, Stitch and Make bundles plus `dsFullLayersCss` and `dsColorRoles`; constants = names two unrelated palettes both emit; 272 candidate partners (every dash prefix of every tail after `qz` in any emitted name, plus a battery) | 100 pairs collide and the predicate agrees on each; the only misses are F5's 20 |
| F1 every exporter, two palettes | the same 272 pairs rendered as one two-palette state, every text surface scanned for a custom property declared twice in one rule block or a YAML key repeated under one parent; object surfaces checked for names the pair emits that neither single does | CSS, OKLCH, Tailwind, shadcn, Make `styles.css`, `dsFullLayersCss`: 0 duplicates the predicate misses. No context-dependent names in any object surface. DESIGN.md: F5 |
| Panda join (the builder's stated assumption) | Panda 1.12.1's own `TokenDictionary` (the code `cssgen` names variables with), one dictionary per palette preset, `--colors-*` sets intersected over the 272 pairs; and a real `panda cssgen tokens` run on 12 pairs | dictionary, Panda preset alone: 99 colliding pairs, 0 misses. `cssgen`: (x, x-prime-prime), (x, x-scrim-50), (x, x-50) each lose one variable (363 against the (x, y) control's 364), (x, x-prime) loses 4. The assumption holds, measured |
| Radix | the same dictionary on the Radix preset alone | 0 colliding pairs across the 272; the builder's structural argument holds |
| F2 key colours | a palette with `keyColors` [dominant, accent] against one without, every surface | extra names only `x-key-{role}` (CSS, OKLCH, DTCG `x.key.{role}`, UI3 `raw/x/key/{role}`) and JSON's `keyColors` array. Pair (x with keys, `x-key-accent`): `exportCSS` declares `--c-x-key-accent` twice, `nameCollisions` reports `["x-key-accent"]` |
| F4 control | the prefix plant below | the four `control:` lines red against the module, not a helper |

## Findings, by severity

### F5 · major · DESIGN.md `-dark` siblings are a slug join the union misses

`exportDesignSystemSpine` (`src/engine/ds-export.js:326`) writes every grammar token twice into the frontmatter `colors:` map, `${t.name}` and `${t.name}-dark`, where `t.name` is `{slug}{suffix}`. Palette `x` therefore emits `x-dark` (its accent's dark sibling), and a palette named `x-dark` emits `x-dark` as its own accent. The same DESIGN.md ships in the Claude Design bundle and, byte-identical, in the Stitch bundle.

Measured on two-palette states (frontmatter `colors:` keys counted):

| Pair | Duplicate key | `nameCollisions` |
|---|---|---|
| (`x`, `x-dark`) | `x-dark` | `[]` |
| (`Brand`, `Brand Dark`) | `brand-dark` | `[]` |
| (`Primary`, `Primary Dark`) | `primary-dark` | `[]` |
| (`x`, `x-hover-dark`) | `x-hover-dark` | `[]` |
| (`x`, `x-y`) control | none | `[]` |

The 272-pair scan finds 20 such pairs, one per grammar role (`qz-dark`, `qz-hover-dark`, `qz-surface-dim-dark`, `qz-on-qz-dark`, ...). A mapping key twice is invalid YAML 1.2, and a last-wins parser keeps one palette's value. `Brand` beside `Brand Dark` is a likely real naming, and U6 will use this predicate as its refusal guard, so it would pass the exact #787 defect in this export.

Fix (in lane): add `${slug}${suffix}-dark` for each DS grammar role, read from `ds-export.js` (for example `dsColorRoles` on a one-palette state, or an exported grammar-suffix list) so the set moves with the exporter instead of a hand list; extend C3.2's union with the DESIGN.md frontmatter `colors` keys for a one-palette state; add C3.1 cases (`x`, `x-dark`) and (`Brand`, `Brand Dark`) that must collide. The handoff's 100-name count moves with it.

### F6 · minor, informational · Panda and Radix presets loaded together

The documented installs are separate (`presets: ['@pandacss/preset-panda', preset]` and `presets: [parkPreset, utRadixPreset]`, `exports.js:1060`, `:1373`), and each alone is clean above. `scripts/smoke-panda.mjs` loads both into one config. In that combination the dictionary finds 46 pairs the predicate misses: Radix's `x.1` .. `x.12`, `x.a1` .. `x.a12`, `x.solid.bg`, `x.on-accent` against a palette named `x-1`, `x-a3`, `x-on-accent`, ... (real `cssgen` confirms (x, x-1), (x, x-12), (x, x-a3), (x, x-solid-bg), (x, x-on-accent) each lose a variable; Panda-only and Radix-only runs of the same pairs lose none). Not blocking: no documented setup combines them. The orchestrator decides whether the predicate should cover it.

### Observations, outside the pairwise predicate (no action in U3)

- A single palette named `white` or `black` redeclares the kit constant (`--c-white` twice in CSS, OKLCH, Make `styles.css`; `--color-white` in Tailwind). A single palette named `primary-dark` repeats the Stitch alias key `primary-dark` in DESIGN.md. These are palette-against-constant, which the plan's C3.2 excludes; U6 may want them.
- A single palette named `Data 1` repeats `data-1`, `data-1-dark`, `data-1-on-data-1` in DESIGN.md with no second palette. Present at base 61bcd123 (U3 does not touch `ds-export.js`), a candidate for its own issue.

## Negative controls re-planted by the reviewer (scratch copy of fb7f69f1, `git archive`)

| Plant in `names.mjs` | `node test/engine/names.mjs` |
|---|---|
| prefix heuristic in place of set intersection | rc 1, `names FAIL (9)`: `x-prime-dim` missing, `x-primer` and `x-5000` wrongly collide, the four `control:` lines red |
| unpadded stop line removed | rc 1, `FAIL (5)`: `(x, x-50)`, `(x, x-75)`, union `missing x-50` |
| `prime-prime` line removed | rc 1, `FAIL (3)`: union `missing x-prime-prime` |
| Panda bare-scrim line removed | rc 1, `FAIL (3)`: union `missing x-scrim-50` |
| `keyNames` reads no key colours | rc 1, `FAIL (1)`: the key-colour case |
| extra name `${slug}-bogus` | rc 1, `FAIL (1)`: `extra x-bogus` |
| `on !== false` filter removed | rc 1, `FAIL (2)`: both disabled-palette cases |
| `document.title;` appended | C3.3 grep prints `72:document.title;` |
| `engine/names.mjs` removed from `TESTS` | C1 perl count reads 54 (55 as committed) |

The scratch copy was restored and re-ran `names PASS`.

## Next

Builder pass 3 on F5; F6 only if the orchestrator rules the combined-preset setup in scope. Re-run `node test/engine/names.mjs` and `npm test`, update the handoff's count and C3.2 evidence.
