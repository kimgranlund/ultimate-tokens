PASS

# gates-batch U1 review, pass 1 (reviewer-l3, #776; closes #769, #775)

Unit `unit/gb-U1` @ 997f4424 against `plan/gates-batch` @ 17edb2d2. Every run below was made in a scratch `git clone` of the unit branch under `$CLAUDE_JOB_DIR/tmp`, never in the worktree. `npm test` was not run (host load at 4 by the dispatch's `ps` count); `node test/repo/citations.mjs` was.

## Criteria, re-run

| Row | Reading | Result |
|---|---|---|
| U1-1 | `✓ citations: ... 10 discovered docs + 11 fact pins (HEAD 997f4424)`, exit 0 | 🟢 |
| U1-2 | `async () => 15` on "type voices": `✗ ... fact pin "type voices": bare literal source`, exit 1 | 🟢 |
| U1-3 | `() => { return 15; }`: same `✗`, exit 1; a multi-line `async () => {\n return 15\n }` also reds | 🟢 |
| U1-4 | `() => 59`: `bare literal` `✗` plus the value mismatch, exit 1 | 🟢 |
| U1-5 | first `bareLiteralSource` at line 126, `FACT_PINS` `];` at line 111 | 🟢 (inversion control taken from the handoff, not re-run) |
| U1-6 | `symbol homes: 37 checked, 0 stale`; my own scan finds 13 `/`-less source-extension `SHAPE` matches, 3 exempt, 10 checked, so 27 + 10 = 37 | 🟢 |
| U1-7 | `` `brandKit` in `persist.js` `` appended to color-math `SKILL.md`: `✗ ... brandKit is not defined in src/ui/persist.js`, exit 1 | 🟢 |
| U1-8 | tracked `src/ui/x/model.mjs`: five `ambiguous basename` `✗` lines, one per `model.mjs` citation, exit 1 | 🟢 |
| U1-9 | `grep -c 'startsWith("src/")'` = 1; with the filter removed, six `ambiguous basename` FAILs on `model.mjs` and `geometry.mjs` against `test/` | 🟢 |
| U1-10 | `geomTokensX,steps,typeTokensX`; dropping `steps`'s reason gives `✗ BARE_EXEMPT entry without a sym + reason`; an empty list reds all three | 🟢 |
| U1-11 | `SYMBOL_HOME_FLOOR = 30`; with the `continue` restored, `only 27 citations read, below SYMBOL_HOME_FLOOR 30`, exit 1 | 🟢 |

The floor move from 12 to 30 holds up. 30 is above 27, so losing the bare leg reds. It is 7 below the measured 37, which is inside the plan's "count minus 5" ceiling of 32.

## Findings, by severity

1. 🟡 Low: the literal guard reads number literals only, and 5 of the 11 pins are boolean-shaped (`test/repo/citations.mjs:86`, `:94`, `:96`, `:102`, `:106`). Swapping `btn home`'s source for `() => true` gives exit 0 with no `✗`, and that literal can never drift. The plan's design scopes the guard to numbers, so this is not a U1 defect. It is the same hole #769 names, carried by the other pin kind, and should become a follow-up issue.
2. 🟡 Low: shapes the guard misses that the plan did not name (`test/repo/citations.mjs:126`). A parameterised arrow `(_) => 15` gets through, and so do `async function () { return 15 }`, the parenthesised `() => (15)` and indirection through a named const (`source: fifteen`). All four exit 0. The parameter shape matters most, because the table already uses one (`async (needle) =>`, line 102). Widening `\(\s*\)` to `\([^)]*\)` would close that one cheaply.
3. ⚪ Nit: `BARE_EXEMPT` matches on `sym` alone, not `sym` plus `path` (`test/repo/citations.mjs:174`). A future real citation named `steps` in any bare file would be skipped without notice. Keying on the pair costs nothing.
4. ⚪ Nit: the `steps` reason says "a plain English word". At `type-scale/references/foundations.md:79` it is the voice object's `steps` field, so it names a data property rather than a word. The exemption is still valid, since no line in `src/engine/type.mjs` defines `steps`; only the wording is off.
5. ⚪ Nit: the bare resolve reads only under `src/`, per P7. A bare `role-table.json` (which lives in `docs/`) would red as "no tracked file matches" rather than resolve. No such citation exists today.

## Scope

- `git diff --name-only 17edb2d2...unit/gb-U1` lists `test/repo/citations.mjs` and `.sdlc/handoffs/gates-batch-U1.md`, nothing else.
- No U+2014 in the diff.
- No board, `.claude/docs/other/` or skill `.md` edits.
- No false positive on the 11 real pins: the clean run is green.
