---
kind: verdict
plan: parallel-batch
unit: U3
seat: verifier
pass: 1
ticket: "#786"
written: 2026-10-04
---

# parallel-batch U3 · pass 1 · 🟢 at `4fc91a1c`

verdict: 🟢
sha: 4fc91a1cf195f6c2f2a1a2e88bd927029fafa3ae

Unit `unit/pb-U3` (#787 predicate) at `4fc91a1c` (pass 3 code `a7f4897c`), base `61bcd123`, against C3.1 to C3.6 in plan revision 7 and the request `.sdlc/handoffs/parallel-batch-U3-verify.md` (`verdict.py check` rc 0).

Families: the pass 3 builder is opus (grade l5) and this checker is opus (verifier-l2 grade, run by the seat itself), so the families are shared. That is the R86/R92 standing exception while fable is capped. The pass 3 reviewer was a Sonnet session, outside the builder family.

Every run is in fresh clones under `$CLAUDE_JOB_DIR/tmp/pbu3` (`head` and `neg`, both `git rev-parse` `4fc91a1c`), with `NODE_OPTIONS` unset. Each plant was applied by script and reverted with `git checkout -- .` (porcelain `0` after). Load was 33 to 44, so no row is a timing row.

## Rows

| Criterion | State | Evidence | Negative control |
|---|---|---|---|
| C3.1 set intersection, the case list | 🟢 | `node test/engine/names.mjs`: rc 0, `names PASS, 164 template names read from 12 surface rows`. The test carries every planned case: (`x`,`x-prime`) on `x-prime-dim` and `x-prime`, (`x`,`x-hover`), (`x`,`x-primer`) clean, (`x`,`y`) clean, `on: false` both ways, (`x`,`x-50`), (`x`,`x-dark`), (`Brand`,`Brand Dark`), (`Neutral`,`x`,`x-hover-dark`), (`x`,`x-5000`) clean | prefix heuristic in place of the per-row intersection: rc 1, `names FAIL (58)`, including `(x, x-primer): the lookalike must not collide` and `(x, x-5000)`, plus `oracle 167 pairs, 47 disagreements`. Reader skips `-dark` keys: rc 1, `(x, x-dark): missing collision on the DESIGN.md -dark sibling` and `(Brand, Brand Dark)` |
| C3.2 (i) and (ii), read from every surface, registry complete | 🟢 | the same run prints `surfaces 26 read, 10 listed, 0 unread`. `renderSurfaces` covers all 10 `exportAll` keys, the three bundles' files, and `layers` (36 locators listed by this seat's own render) | `tokens.json` registry row deleted: `surfaces 25 read, 10 listed, 1 unread`, `(ii) unread surface: claude:tokens.json`. A new file `extra.css` planted in `exportDesignSystemBundle`: `(ii) unread surface: claude:extra.css`. A new `scss` key planted in `exportAll`: `(ii) unread surface: all.scss`. Every one exits rc 1 |
| C3.2 (iii), the oracle | 🟢 | `oracle 167 pairs, 0 disagreements`. Independent check by this seat (`oracle.mjs`, own scanners, nothing imported from the module but the function under test): 185 partners (the 164 emitted names plus 27 hand ones, such as `x-on`, `x-scrim`, `x-key`, `x-a13`, `x-dark-dark`, `x 50`, `X Hover`, `on-x` and `x-prime-50`), both orders, 370 ordered pairs. Each pair is scanned against the same positions with the partner renamed `wv`, across every rendered surface, JSON included. Result: `false negatives 0, predicate-only 17`. Of those 17, 13 are the DESIGN.md `-dark` cases with the partner first (the contracted position-independent superset). The other 4, `x-scrim-50` and `x-prime-prime` in both orders, are real Panda collisions under the dash-flattened name (`pd.mjs`: `dups 1 [ 'x-scrim-50' ]`), which this seat's object-leaf scan was too coarse to see | this seat's oracle against the `-dark` reader plant: `false negatives 7` (`x + x-dark: scan claude:DESIGN.md,stitch:DESIGN.md`), so it is live. The unit's oracle under the same plant reads `oracle 147 pairs, 0 disagreements` (see Findings) |
| C3.3 purity | 🟢 | `grep -n "document\|window\|from \"../ui" src/engine/names.mjs` prints nothing, rc 1. Imports are `exports.js`, `ds-export.js`, `type.mjs` and `geometry.mjs` only | `document.title;` planted: the same grep prints `172:document.title;` |
| C3.4 registered and counted | 🟢 | C1's perl count prints `55`, and `test/run.mjs:13` lists `"engine/names.mjs"` | `"engine/names.mjs",` removed from `TESTS`: the count prints `54`, and `grep -c names.mjs test/run.mjs` gives `0` |
| C3.5 contract stated, position-independent | 🟢 | `grep -c "Reported, not refused" src/engine/names.mjs` gives `1`. Running `nameCollisions([{name:"Neutral"},{name:"x"},{name:"x-background-dark"}])` gives `[["x","x-background-dark",["x-background-dark"],["DESIGN.md frontmatter"]]]`. The header (`:1-28`) names the refusal scope (10 formats plus 3 bundles) and the reported cases: Panda plus Radix in one config, kit constants, and self-duplication | phrase reworded: `grep -c` gives `0` and the test gives `(C3.5) ... appears on 0 lines`, rc 1. Position-aware predicate (DESIGN.md row skipped when the earlier palette is not palette 0): `(C3.5) (Neutral, x, x-background-dark) must be reported on x-background-dark`, rc 1 |
| C3.6 exporters run once | 🟢 | `memoized`, `emittedNames x1000 233 ms` (the loop completes; not a timing claim) | `if (memo) return memo;` removed: `NOT memoized`, `(C3.6) templateNames() must return the same memoized Set`, rc 1 |
| `npm test` | 🟢 | clean clone `head`: `npm test` rc 0, `✓ all 55 test files passed`, `▶ engine/names.mjs pass`, porcelain `0` after | in `neg`, `TESTS` cut to `["engine/names.mjs"]` with the prefix plant applied: `node test/run.mjs` rc 1, `▶ engine/names.mjs FAIL`, `✗ 1/1 test file(s) failed`. The runner propagates this file's failure; restored, porcelain `0` |
| Lane | 🟢 | `git diff --stat 61bcd123 4fc91a1c`: `src/engine/names.mjs` +232, `test/engine/names.mjs` +225, `test/run.mjs` 1 line, plus the handoff and three reviews. `exports.js` and `ds-export.js` are untouched | the stat lists any out-of-lane path; none appears |

## Findings

- 🟡 The unit's oracle (C3.2 iii) draws its partner list from `emittedNames("x")`, the module's own output. A reader that under-reads shrinks the predicate and the partner list together. Under the `-dark` reader plant the oracle stayed `0 disagreements` on `147 pairs`, so the plan's stated control ("the oracle reds on `x-dark`") does not hold as written. The plant is still caught, by C3.1's hand cases and by (i)'s fixed list. A follow-up could seed the oracle with a fixed partner list as well; this seat's 27-name hand list caught the plant.
- 🟡 The unit's oracle scans Panda and Radix as dash-flattened names, but not `all.json`, `dtcg`, `ui3` or `tokens.json`, where a duplicate would be a silent overwrite. This seat's object-leaf scan covered those surfaces and found no missed pair.
- Carried from review p3, low, follow-up: L1, a palette slugged `meta` or `constants` is overwritten in `all.json` beside the kit keys, a kit-constant case the header does not name. L2, `templateNames()` returns the mutable memo `Set`.
- Report only: the p3 review quotes `surfaces 12 read`, but the run prints `surfaces 26 read` (26 locators across the 12 rows).
