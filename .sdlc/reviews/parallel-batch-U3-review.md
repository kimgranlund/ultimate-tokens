FAIL

# Review: parallel-batch U3 (#787 predicate) · reviewer

| Field | Value |
|---|---|
| Unit | U3, `unit/pb-U3` @ d72d7e5b, base 61bcd123 |
| Verdict | 🔴 FAIL on one major finding (F1): the emitted set misses the Tailwind/Panda unpadded stop names, so a real collision reads clean |
| Criteria | C3.1 🟢 · C3.2 🟡 (passes as written, design text not met, F1) · C3.3 🟢 · C3.4 🟢 |
| Gates | `npm test` exit 0, `all 55 test files passed`, `engine/names.mjs` ran, tree clean after (0 lines). Gate count read 4 before the run, `NODE_OPTIONS` unset |
| Scope | `git diff --name-only 61bcd123..HEAD`: the handoff, `src/engine/names.mjs`, `test/engine/names.mjs`, `test/run.mjs` (the `TESTS` line only). Lane plus handoff, nothing from `.claude/docs/other` |

## Findings, by severity

### F1 · major · the emitted set is the CSS exporter's, not every flat name the file joins onto `n`

The plan's U3 design says the set is "whatever else `exports.js:253` onward joins onto `n`, enumerated by reading that file". `names.mjs` reads `cssFrom` only. `exportTailwind` (`src/engine/exports.js:785`) emits the stops unpadded, `--color-${p.n}-${String(Number(key))}`, so palette `x` emits `x-50` and `x-75` in Tailwind, and neither is in `emittedNames("x")` (which holds `x-050`, `x-075`).

Measured (scratch probe, two-palette state `x`, `x-50`):

| Probe | Result |
|---|---|
| `nameCollisions([{name:"x"},{name:"x-50"}])` | `[]` (clean) |
| `exportTailwind` duplicate `--color-*` names | `[ 'x-50' ]`: palette `x`'s 50 stop and palette `x-50`'s accent role share one name, the later line wins |
| `exportCSS` duplicates | `[]` |
| Tailwind names for `x` absent from `emittedNames("x")` | `x-50`, `x-75` |

`exportPanda` keys the same stops as `"50"`, `"75"` under `colors.x`, so Panda's flattened `--colors-x-50` is the same overlap (not run through Panda here; Tailwind is the proven case). U6 will consume this predicate as the refusal guard, so it would let a user commit `X 50` beside `X` and ship a silently overwritten Tailwind token, the exact #787 defect.

Fix (small, in lane): add the unpadded stop name per stop (`${slug}-${String(stop)}` beside the padded one; only 50 and 75 differ), say so in the module header, and extend C3.2's in-test comparison to the union of `exportCSS` and `exportTailwind` names, with a `(x, x-50)` case in C3.1's block that must collide. The handoff's "96 names" count moves to 98.

### F2 · minor · key colours are knowable to `nameCollisions`, only not to `emittedNames(slug)`

The handoff's reason for leaving `n-key-{role}` out is that a slug cannot know them. True for `emittedNames(slug)`, but `nameCollisions` receives the palette objects, and `derivePalette` reads the same `palette.keyColors` (`exports.js:344`). Unioning `${slug}-key-${kc.role}` for each `p.keyColors` entry inside `nameCollisions` closes the documented edge (`x` with a `dominant` key against `x-key-dominant`) at no cost to C3.2's set equality, which stays on `emittedNames`. Recommended to fold into the F1 pass; not blocking alone.

### F3 · nit · the slug copy is acceptable as built

`slugOf` is a third copy of the rule. `exports.js` `slug` is module-local and `model.mjs` is UI-side (importing it would break C3.3), and exporting from `exports.js` is outside the lane. The parity loop pins all three on 7 names and bites: a `slugOf` without the trim step reds two lines on `"  --Odd__Name!! "`. Accepted; a follow-up could export `exports.js` `slug` and import it here.

### F4 · nit · the "prefix heuristic" control tests a local lambda

`prefixCollides("x", "x-primer")` asserts the test's own lambda, not the module, so the final line's "2 controls red" overstates. The real C3.1 negative control is the module re-plant below, which bites. Cosmetic.

## Negative controls re-planted by the reviewer (scratch copy of d72d7e5b, `git archive`)

| Plant in `names.mjs` | `node test/engine/names.mjs` |
|---|---|
| prefix heuristic in place of set intersection | `names FAIL (3)`: `x-prime-dim` missing, `x-primer` wrongly collides |
| scrim loop removed | `FAIL (2)`: `missing x-scrim-050` |
| prime loop removed | `FAIL (6)`: the (x, x-prime) cases and `missing x-prime-brightest` |
| `on !== false` filter removed | `FAIL (2)`: both disabled-palette cases |
| `slugOf` trim step removed | `FAIL (2)`: parity with `exports.js` and `model.mjs` |
| extra name `${slug}-bogus` added | `FAIL (1)`: `extra x-bogus` (the equality bites both ways) |
| `document.title;` appended | the C3.3 grep prints `57:document.title;` |
| `engine/names.mjs` removed from `TESTS` | the C1 perl count reads 54 (55 as committed) |

## Purity

`names.mjs` imports `semantic.js`, `tonal.js`, `prime.mjs`, `exports.js`, all engine, no DOM, no `../ui`. C3.3's grep prints nothing on the committed file.

## Next

Builder pass 2 on F1 (plus F2 if taken), re-run `node test/engine/names.mjs` and `npm test`, update the handoff's count and C3.2 evidence.
