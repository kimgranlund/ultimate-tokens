# gates-batch U1 handoff (pass 1)

Branch `unit/gb-U1` @ see `git log -1` (cut from `plan/gates-batch` @ 17edb2d2). Builder: gb-U1.

## Files

| File | Change |
|---|---|
| `test/repo/citations.mjs` | leg (4b) `bareLiteralSource` guard and fixture; leg (5) bare-filename resolve under `src/`, `ambiguous basename` FAIL, `BARE_EXEMPT`, `SYMBOL_HOME_FLOOR` 12 to 30 |

## Criteria

| Row | Result | Evidence | Negative control |
|---|---|---|---|
| U1-1 | 🟢 | gate exit 0, `11 fact pins` in the pass line | n/a |
| U1-2 | 🟢 | plant `async () => 15` on "type voices": `✗ ... fact pin "type voices": bare literal source`, exit 1 | old regex has no async shape |
| U1-3 | 🟢 | plant `() => { return 15; }`: same `✗` line, exit 1 | as U1-2 |
| U1-4 | 🟢 | plant `() => 59`: `bare literal` `✗` (plus the value mismatch) | old digit set `53\|15\|10\|4` misses 59 |
| U1-5 | 🟢 | fixture first use line 126, `];` closing FACT_PINS line 111; predicate inverted in a clone: 13 `✗` lines (positives missed, negatives flagged), exit 1 | inverted run above |
| U1-6 | 🟢 | `symbol homes: 37 checked, 0 stale`; 10 bare source-extension citations counted (37 minus 27), found by `grep -rnE '\`sym(...)?\` (in \`\|(\`\|(in \`)[^\`/ :]+\.(m?js\|json\|html\|css)' .claude/skills` (13 matches, 3 in BARE_EXEMPT) | restoring the `continue` prints `27 checked` (and reds the floor) |
| U1-7 | 🟢 | appended `` `brandKit` in `persist.js` `` to color-math SKILL.md: `✗ ... symbol home: ... brandKit is not defined in src/ui/persist.js`, exit 1 | pre-unit gate skips it |
| U1-8 | 🟢 | tracked `src/ui/x/model.mjs` added: `✗ ... ambiguous basename, src/ui/...` for each `model.mjs` citation, exit 1 | absent file resolves to `src/ui/model.mjs` (U1-1) |
| U1-9 | 🟢 | `grep -c 'startsWith("src/")'` prints 1; tree-wide resolve (clone, `src/` filter removed) reds with `ambiguous basename` | as stated |
| U1-10 | 🟢 | `BARE_EXEMPT` rows are `typeTokensX`, `geomTokensX`, `steps`, each with a reason; removing the `steps` reason gives `✗ BARE_EXEMPT entry without a sym + reason` | proved in a clone |
| U1-11 | 🟢 | `SYMBOL_HOME_FLOOR = 30` (above 12, count 37 minus 7 margin, at most 32) | floor 30 with the bare leg lost (27) reds |

11 green, 0 red. `npm test`: all 54 files pass, `git status --porcelain` clean apart from the unit's own files at run time.

## Left out

- U2's count-phrase scan; `.sdlc/board.md`; no skill `.md` edited.
- The `bareLiteralSource` regex needs a literal followed by `,`, `}` or newline; a literal followed by an expression (`() => 15 + x`) is not a bare literal and is not flagged.
