# parallel-batch U3 re-diagnosis (review FAIL twice, same class)

Source: `.sdlc/reviews/parallel-batch-U3-review.md` (F1 at d72d7e5b) and `.sdlc/reviews/parallel-batch-U3-review-p2.md` (F5, F6 at fb7f69f1), both on `unit/pb-U3`. Builder passes so far: 2 (l3, then l4). The next builder pass is pass 3, which needs the owner (section 6). Criteria: `### U3` and `### U3 criteria` in `.sdlc/plans/parallel-batch.md`. Probes in this record were run on the `.worktrees/pb-U3` tree at ee0a38b0 with `node`, no `node_modules`.

## 1. What went wrong

The predicate models the emitted-name set as a property of the slug, derived from the exporters' *constants* (`EXPORT_STOPS`, `PRIME_STEPS`, `SCRIM_*`, the 53 suffixes). The exporters do not emit constants, they emit their own output grammar on top of them: Tailwind drops the zero padding (F1), Panda collapses `DEFAULT` and keys the centre prime step twice (pass 2 found `x-prime-prime` by accident), DESIGN.md writes a `-dark` sibling of every grammar token (F5). The constants under-determine the names; only the output has them. Each pass read one more exporter's source and added its grammar by hand, and each review found the next one, because nothing in the module or the test knows how many surfaces exist. C3.2 as written asks for equality against "whichever flat format `exports.js` keys by `n + suffix`" (singular), so the test proved only the surfaces the builder had already read.

The second defect is deeper and is new evidence, not in either review. For `ds-export.js` the emitted set is not a function of the slug. `dsColorRoles` gives the chrome palette (neutral-named, else the first enabled) 20 slots, every other fill family 7 (8 for the brand, which alone carries `-active`), and a `data-N` palette 2. Measured on DESIGN.md frontmatter keys:

| Palettes | Duplicate key |
|---|---|
| (`x`, `x-dark`) | `x-dark` (F5) |
| (`x`, `x-background-dark`) | `x-background-dark` (x is chrome) |
| (`Neutral`, `x`, `x-background-dark`) | none (x is a fill family, no `-background`) |
| (`Neutral`, `x`, `x-hover-dark`) | `x-hover-dark` |
| (`Neutral`, `x`, `x-active-dark`) | none (x is not the brand) |
| (`Neutral`, `Brand`, `Brand Active Dark`) | `brand-active-dark` |

So `emittedNames(slug)` cannot be exact for the DS bundles under any enumeration: the same pair collides or not depending on which palette the name regex and the order make chrome. The pass 2 review's "no context-dependent names in any object surface" holds for the object surfaces it checked; DESIGN.md is text and is context-dependent.

The answer to the lead's question: yes, the model is wrong in both ways. A third hand-table pass would be the third workaround.

## 2. The options, measured

Timings are means of 20 runs on a one-palette state (`qz`), `derivedAll` included where the exporter needs it.

| Call | ms |
|---|---|
| `emittedNames("qz")` (today) | 0.03 |
| `nameCollisions` on 8 palettes (today) | 0.43 |
| `derivedAll` (1 palette) | 1.33 |
| `exportAll` (10 formats) | 2.86 |
| `exportDesignSystemSpine` (DESIGN.md) | 1.19 |

| | (a) keep enumerating, add a completeness test | (b) read the names back from the exporters' output | (c) narrower contract, the rest reported |
|---|---|---|---|
| Mechanism | hand table per exporter stays; a test runs every exporter over a probe state and asserts the union equals the table | a one-palette probe state under a sentinel slug (`qzqz`) is run through every surface once per process; every emitted name containing the sentinel is a template; `emittedNames(slug)` substitutes the slug into the template (memoized) | whichever mechanism, plus a header and a criterion naming the surfaces the refusal protects and the cases it only reports |
| Engine purity | unchanged, `names.mjs` imports engine constants | unchanged in kind: `names.mjs` imports `exports.js` and `ds-export.js`, both engine, DOM-free, already in `scripts/bundle.mjs` MODS before where `names` would sit (U6 registers it after `dsExport`) | none |
| Runtime per name commit (U6, `onchange`) | as today, 0.03 ms per slug | first call about 5 ms (`derivedAll` + `exportAll` + DESIGN.md on one palette), then as today; the template is one Set per process | as the mechanism chosen |
| What drifts | the table drifts every time an exporter's grammar changes or a surface is added; the completeness test catches it only if its probe covers the new surface, which is the same registry problem one level up | the surface registry (which outputs to read and how to flatten each) drifts when a format is added; that list is the 10 documented formats plus 3 DS bundles, fixed and already documented in CLAUDE.md, and the test can assert it covers every key of `exportAll` and every text file of the three bundles | the contract itself, which is a sentence the owner rules once |
| Position dependence (DS) | cannot be exact; a table lists the chrome superset | the one-palette probe IS chrome and brand, so the template is the superset of every position; over-approximates for fill-family pairs (section 3) | can state the over-approximation as the contract |
| F1 (Tailwind unpadded) | caught, if the probe runs Tailwind (the registry rule forces it) | caught (reads the Tailwind text) | caught, Tailwind is one of the 10 |
| F2 (key colours, opt-in) | caught only if the probe palette carries `keyColors` | same: the probe palette must carry every key role; `nameCollisions` keeps `-key-{role}` names only for palettes whose `keyColors` carry the role | same |
| F5 (DESIGN.md `-dark`) | caught only if `ds-export.js` is in the probe; pass 2's test did not have it, which is the drift | caught, the DS bundles are in the registry and the completeness check reds `unread surface DESIGN.md` if they are dropped | caught if the DS bundles are in the promised set; reported if not |
| F6 (Panda + Radix presets in one config) | not caught (a combination, not a surface) | not caught | ruled: reported, not refused; no documented install combines them (`exports.js:1060`, `:1373`) |
| Cost in the unit | the smallest diff; the third table | a rewrite of `emittedNames` (about 40 lines) and of the C3.2 half of the test | a header paragraph and one criterion row |

## 3. Recommendation: (b) as the mechanism, (c) as the stated contract, (a)'s completeness test aimed at surfaces

Read the names from the exporters, never from a table. The template is computed once per process from a maximal probe palette (every key role present, `on: true`) named by a sentinel slug that appears in no constant; `emittedNames(slug)` replaces every occurrence of the sentinel (so `qzqz-on-qzqz` gives `x-on-x`). Names without the sentinel are the kit constants and the Stitch alias (`white`, `black`, `dialog-backdrop`, `primary`, `primary-dark`), excluded and listed in the test. The registry of surfaces lives in `names.mjs` as a small exported table, one reader per surface:

| Surface | Reader |
|---|---|
| `css`, `oklch`, `tailwind`, `shadcn` (text) | custom-property names declared (`--c-`, `--color-`, the shadcn prefix) |
| `json`, `dtcg`, `ui3` (objects nested under the slug) | the group key only, two palettes meet there only on equal slugs |
| `panda`, `radix`, `radixRef` (objects) | path joined with `-`, `DEFAULT` collapsed, the rule Panda 1.12.1's `TokenDictionary` was measured to agree with in pass 2 |
| Claude Design, Stitch, Make bundles (`ds-export.js`) | DESIGN.md frontmatter `colors:` keys; `tokens.json` keys; `styles.css` and `dsFullLayersCss` custom properties |

The completeness check: every key of `exportAll(probe)` and every text file of the three bundles is either read by a registry row or on an explicit no-flat-names list with a reason. Adding a format without a reader reds the test; that is the property both passes lacked.

The contract, written in the module header and graded by a criterion: a pair is refused when any arrangement of the two palettes would emit one flat name twice in any of the 10 documented formats or the 3 DS bundles, each installed as documented. Position-independent on purpose: chrome and brand are chosen by a name regex and by order, so a pair that is clean today and invalid after a reorder is not a pair the product should accept. Reported in the header, not refused: Panda and Radix presets loaded into one config (F6), a palette against a kit constant (`white`, `black`, `dialog-backdrop`, `primary`, `primary-dark`), and a single palette that duplicates itself (`Data 1` emits `data-1-on-data-1` twice in DESIGN.md at base, the pass 2 review's observation, its own issue).

Why not position-aware precision (refuse only what the current arrangement duplicates): it costs an N-palette export on every commit (about 1.3 ms per palette plus the readers, 10 to 15 ms at 8 palettes, still cheap), but it makes a name's validity depend on the palette order and on the chrome regex, so U6's badge would appear and vanish as the user reorders or renames an unrelated palette. The superset is the stable contract. If the owner wants precision anyway it is option B in section 6.

## 4. Criteria text (replaces C3.2, adds C3.5 and C3.6, extends C3.1; U3 design sentence)

`### U3` design sentence, replace "and whatever else `exports.js:253` onward joins onto `n`, enumerated by reading that file, not from a hand list" with: "read back from the output of every exporter (`exportAll`'s 10 formats and `ds-export.js`'s three bundles) for a one-palette probe state under a sentinel slug, never from a hand list; the template is computed once per process and the slug substituted".

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| C3.1 | as written, plus: (`x`, `x-50`), (`x`, `x-dark`), (`Brand`, `Brand Dark`) and (`Neutral`, `x`, `x-hover-dark`) collide; (`x`, `x-5000`) does not | `node test/engine/names.mjs \| tail -1` | PASS, all cases | a prefix heuristic planted: the lookalike reds; the `-dark` reader removed: (`x`, `x-dark`) reds | fb7f69f1 misses the three `-dark` cases |
| C3.2 | the emitted set is read from every surface, and the registry is complete | in `test/engine/names.mjs`: (i) `emittedNames("x")` equals the sentinel template with `x` substituted; (ii) every key of `exportAll(probe)` and every text file in the Claude Design, Stitch and Make bundles is read by a registry row or named on the no-flat-names list with a reason, printed `surfaces N read, M listed, 0 unread`; (iii) a two-palette oracle: for every emitted name of `x` taken as the partner's slug, plus `x-primer`, `x-5000`, `y`, with `x` as palette 0, the predicate's verdict equals a direct duplicate scan of every text surface (a custom property declared twice in one rule block, a frontmatter key twice) and of the Panda and Radix dictionaries, printed `oracle P pairs, 0 disagreements` | all three lines as stated | (ii) a registry row deleted: `1 unread`; (iii) the DESIGN.md reader's `-dark` line removed: the oracle reds on `x-dark` | the union is three hand-read exporters; no registry; no oracle |
| C3.3 | purity | as written | prints nothing | as written | 🟢 at fb7f69f1 |
| C3.4 | registered and counted | as written | `55` | as written | 🟢 at fb7f69f1 |
| C3.5 | the contract is stated and position-independent | `grep -c "Reported, not refused" src/engine/names.mjs`; `node -e` with `nameCollisions([{name:"Neutral"},{name:"x"},{name:"x-background-dark"}])` | `1`; the pair (`x`, `x-background-dark`) reported on `x-background-dark` although that arrangement's DESIGN.md is clean, and the header says why | the header paragraph removed: `0`; a position-aware predicate: the pair reads clean | no contract text |
| C3.6 | the exporters run once per process | in the test: `templateNames() === templateNames()` (the memoized Set is the same object) and `emittedNames("x")` called 1000 times completes, both printed | `memoized`, and the loop runs (no per-call export) | the memo removed: the identity check reds | n/a |

The handoff's name count moves from 100 to whatever the template holds (20 DS `-dark` names join; the count is read, not stated).

## 5. Lane and grade

Lane unchanged: `src/engine/names.mjs`, `test/engine/names.mjs`, the `TESTS` line of `test/run.mjs`, the handoff. `names.mjs` gains imports of `exports.js` (`exportAll`) and `ds-export.js` (the bundle exporters, `dsFullLayersCss`); no edit to either. Note for U6: `names` goes after `dsExport` in `scripts/bundle.mjs` MODS.

Grade: builder-l5 (opus, medium). Pass 1 ran l3, pass 2 l4; the precedent in this directory sets the floor for a re-diagnosed pass at l5 (`chroma-floor-U3-rediagnosis.md` §5) and never below the previous pass (`pane-context-U6-rediagnosis.md`). This is a rewrite of the module's core and of half the test, not a patch, which also argues for l5. Checkers per R92 (no Fable seat): reviewer-l3, then verifier-l2. The reviewer's pass 2 probe battery (272 candidate partners over every surface) is the verifier's oracle to re-run.

## 6. Owner questions (pass 3 is not dispatched until both are answered)

| # | Question | Options | Recommendation |
|---|---|---|---|
| Q1 | Contract of the refusal | A: section 3 as written (10 formats + 3 DS bundles as separately installed; position-independent superset; F6, palette-vs-constant and self-duplicates reported, not refused) · B: position-aware precision (refuse only what the current arrangement duplicates; N-palette export per commit; validity depends on order) · C: the 10 formats only, DS bundles reported | A |
| Q2 | Builder grade for pass 3 | l5 · l6 | l5, reviewer-l3, verifier-l2 |

## Default

Pass 3 is not dispatched until the owner answers Q1 and Q2. `unit/pb-U3` stays at ee0a38b0; nothing in it is reverted, pass 3 rewrites `emittedNames` and the C3.2 half of the test on top of it.
