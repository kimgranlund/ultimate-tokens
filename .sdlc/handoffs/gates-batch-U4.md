# gates-batch U4 handoff (pass 1)

Branch `unit/gb-U4` (cut from `plan/gates-batch`). Builder: gb-U4 (#764).

## Files

| File | Change |
|---|---|
| `test/repo/em-dash.mjs` | E1/E2 legs iterate the dash indices and bind to `enclosingStringContent(line, idx)`; the decision carries `idx`; the `R2s`/`R3s` fix case uses `decision.idx`; three fixtures plus two `idemSrc` lines |

## Criteria

| Row | Result | Evidence | Negative control |
|---|---|---|---|
| U4-1 | 🟢 | self-test `PASS`, exit 0; fixture-name grep count 4 | fixtures removed: count 0 |
| U4-2 | 🟢 | clone, `f.js` staged, `--fix`: `const c = "a, b"; const d = "## Head: tail";` | base run gives the issue's `"a: b" ... "## Head, tail"` (U4-3 mutant reproduces it) |
| U4-3 | 🟢 | fix case reverted to `masked.indexOf(DASH)`: self-test FAIL (41 `FAIL` lines matched, two-string fixtures among them) | this is the control |
| U4-4 | 🟢 | classifier reverted to whole-line `E1_RE`/`E2_RE`: FAIL on the two-string fixtures and `E2 template literal` (`matched R3s, expected R8`) | this is the control |
| U4-5 | 🟢 | clone, `g.mjs` staged, `--fix`, line 80: `- NOT "exotic, wild jungle cat energy", INSTEAD: **"Bengal tiger, burnt orange"**, the Sundarbans` | classifier mutant (U4-4) produces the `R3s` colon shape |
| U4-6 | 🟢 | `E1 heading in a string` and `E2 bold label in a string` unchanged and green; `R2s`/`R3s` grep count 2 | dropping E1/E2 reds them |
| U4-7 | 🟢 | `idemSrc` carries `## Head` and `Sundarbans` (count 2); second pass makes 0 edits | an unstable fix reds `idempotence` |
| U4-8 | 🟢 | unit commits touch `test/repo/em-dash.mjs` and this handoff only (the merge-base diff against origin/main also lists the plan branch's earlier U1 and plan files) | n/a |

8 green, 0 red. `npm test`: all 54 files pass, tree clean after.

## Notes

- The replay line's quotes pair up, so the dashes do have enclosing strings, but neither string matches E1 (no heading) or E2 (no `**` inside the string), so both fall to R8 as the plan expects.
- E2 tests the string content up to one character past the dash (its regex needs the trailing space); E3 still keys on the line's first dash, untouched (Q1 keep).

## Pass 2 (rework of review `.sdlc/reviews/gates-batch-U4-review.md`)

| Finding | Result | Evidence | Negative control |
|---|---|---|---|
| F1 | 🟢 | `enclosingStringContent` skips backslash-escaped quotes; E1/E2 pass `openEnded` so a template open at the line end runs to the line end. Fixtures: `ds-export.js:739` shape, a `:769` continuation line, `describe-rubric.mjs:63` shape, all keep the colon. Replay over `37b04676^` (old vs new tool, staged clone): the cited lines are identical to the plan tool and main | removing the escape skip or the open-ended branch reds the self-test |
| F2 | 🟢 | E1 needs the string to open with a heading and the tested dash to be its first; E2's regex is anchored at the dash (`$`). `"## A? D b D c"` stays refused (R0 fixture) | dropping the `indexOf(DASH) === upto` anchor reds |
| F3 | 🟢 | new `idempotence-code` leg runs the non-`.md` fixtures through `fixLines(..., false)`, requires R2s and R3s on pass 1 and zero edits on pass 2 | running it with `md=true` reds |
| F4 | 🟢 | fixture `E2 second string, dash is not the line's first`; `expectFinal-leg` counter fails if any whole-line result goes unchecked | dropping `idx: di` reds; `if (false)` in place of the `expectFinal` leg reds |
| F5 | 🟢 | `classifyLine` header comment names the `idx` exception | n/a |

Replay note: old (plan) vs new over the pre-sweep tree differs on 7 hunks, all toward main (`brand-kit-core.mjs:68` and `describe-rubric.mjs:78,80,83,142,204` now match main) except `ds-export.js:770`, a line with two bold-label dashes: the tool cannot emit two colons (R3s fires once per line), old put the colon on the first and new puts it on the second (the one with its bold label on that line); main has two colons either way.

`npm test`: all 54 files pass, tree clean after.
