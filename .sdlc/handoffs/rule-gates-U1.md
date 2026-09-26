---
kind: handoff
plan: rule-gates
unit: U1
branch: unit/rg-U1
written: 2026-09-22
pass: 3
---

# U1 handoff: `svg-rules.mjs`: the `html:` count and the `fill: none` gate

Base sha: `b3961aa9` (the commit the U1 worktree was cut from).

## Files

- `test/repo/svg-rules.mjs`: new gate, both rules (a) the `html:` count against `.claude/CLAUDE.md`'s
  stated number, (b) every `<path class="...">` class outside the AREA set (`lc-ceiling`) must have
  a `.an-svg .<class>` rule in `src/ui/styles.css` declaring `fill: none`.
- `src/ui/styles.css:826-827`: `.lc-toneline {` and `.lc-applied {` qualified to `.an-svg .lc-toneline {`
  and `.an-svg .lc-applied {`; declarations untouched.
- `test/run.mjs`: `"repo/svg-rules.mjs"` registered in `TESTS` after `"repo/gate-report.mjs"`.
- `figma/plugin/ui.html`: a forced departure from the unit's file list, not a touched source: `npm
  test` regenerates it from the changed `styles.css`, and it was committed separately so the tree
  stays byte-stable after a test run.

## Ran (root command, then negative controls in a throwaway clone at each commit's head)

### P5/P6: `node test/repo/svg-rules.mjs; echo "exit $?"`

```
svg-rules: 12 html: attributes (stated 12), 6 line classes qualified with fill: none, 1 area class
exit 0
```

Negative controls, in the clone (each reverted before the next):

- P5(a) `printf '\nexport const zz = h("div", { html: svg });\n' >> src/ui/sections/color.js`:
  ```
  FAIL html: 13 html: attributes, .claude/CLAUDE.md states 12
  FAIL: 1
  exit 1
  ```
- P5(b) `sed -i '' 's/exception: 12 live/exception: 13 live/' .claude/CLAUDE.md`:
  ```
  FAIL html: 12 html: attributes, .claude/CLAUDE.md states 13
  FAIL: 1
  exit 1
  ```
- P6(a) `sed -i '' 's/^\.an-svg \.ty-line /.ty-line /' src/ui/styles.css`:
  ```
  FAIL ty-line: no qualified rule .an-svg .ty-line
  FAIL: 1
  exit 1
  ```
- P6(b) `sed -i '' 's/^\.an-svg \.gp-ref { fill: none; /.an-svg .gp-ref { /' src/ui/styles.css`:
  ```
  FAIL gp-ref: rule lacks fill: none
  FAIL: 1
  exit 1
  ```
- P6(c) `printf '<path class="zz-line" d=""/>' >> src/ui/sections/geometry.js`:
  ```
  FAIL zz-line: no qualified rule .an-svg .zz-line
  FAIL: 1
  exit 1
  ```

All five match the plan's expected text exactly.

### U1-2: the two rules moved, and only their selectors

Command run against `$BASE` = `b3961aa9`:

```
2	2	src/ui/styles.css
1
1
0
0
4
```

Matches expected (`2	2	src/ui/styles.css`, `1`, `1`, `0`, `0`, `4`).

### U1-3: registered and run

```
1
1
```

(`grep -c '"repo/svg-rules.mjs"' test/run.mjs` → `1`; `npm test 2>&1 | grep -c '^▶ repo/svg-rules.mjs'` → `1`.)

### U1-4: real-browser smoke (verifier row, run here too since `src/ui/styles.css` changed)

`npm ci` in the clone, then `npm run smoke | tail -1`:

`SMOKE PASS — gallery · category · editor · export dialog all render in a real browser`

### P1: full `npm test`, no `node_modules`, tree byte-stable, in a clone at HEAD `12897b98`

```
✓ all 49 test files passed
```

`git status --short | wc -l` after the run: `0`.

### `node test/repo/branding.mjs`

```
branding: clean (568 files scanned)
```

## Pass 2

Review found one FIX-FIRST item: `test/repo/svg-rules.mjs`'s header comment (the line right after
the shebang) used an em dash. Reworded to a colon, committed alone as `b7bd514a`:

```
// svg-rules.mjs: the entry file's two SVG-chart rules, gated (#727, #728).
```

`grep -c $'\xe2\x80\x94' test/repo/svg-rules.mjs` after the fix: no match (grep exit 1).

P5/P6 rerun at the new head `b7bd514a`, in a fresh clone (`git fetch` + `git reset --hard` onto
the new head, tree clean before the run):

```
svg-rules: 12 html: attributes (stated 12), 6 line classes qualified with fill: none, 1 area class
exit 0
```

All five negative controls rerun in the same clone, byte for byte identical to pass 1:

- P5(a): `FAIL html: 13 html: attributes, .claude/CLAUDE.md states 12` / `FAIL: 1` / `exit 1`
- P5(b): `FAIL html: 12 html: attributes, .claude/CLAUDE.md states 13` / `FAIL: 1` / `exit 1`
- P6(a): `FAIL ty-line: no qualified rule .an-svg .ty-line` / `FAIL: 1` / `exit 1`
- P6(b): `FAIL gp-ref: rule lacks fill: none` / `FAIL: 1` / `exit 1`
- P6(c): `FAIL zz-line: no qualified rule .an-svg .zz-line` / `FAIL: 1` / `exit 1`

`git status --short | wc -l` after all five controls (each reverted): `0`.

## Pass 3

Review found two items:

- F1: the U1-4 smoke line was quoted in a fenced block rather than an inline backtick span, and a
  fence is not a span (adapter §3). Fixed above: the SMOKE PASS line is now an inline span.
- F2 (code): `findRule`'s `\b` boundary after the class name let `.an-svg .lc-applied-x` pass as a
  match for `lc-applied`, since `\b` sits between a word character and a hyphen too, so a decoy
  class with a hyphenated suffix satisfied the gate in place of the real rule, a false pass.
  Swapped `\b` for a `(?![\w-])` lookahead, committed alone as `9a98e2be`.

P5/P6 rerun at the new head `9a98e2be`, in a fresh clone (tree clean before the run):

```
svg-rules: 12 html: attributes (stated 12), 6 line classes qualified with fill: none, 1 area class
exit 0
```

All five prior negative controls rerun in the same clone, byte for byte identical to pass 1 and
pass 2:

- P5(a): `FAIL html: 13 html: attributes, .claude/CLAUDE.md states 12` / `FAIL: 1` / `exit 1`
- P5(b): `FAIL html: 12 html: attributes, .claude/CLAUDE.md states 13` / `FAIL: 1` / `exit 1`
- P6(a): `FAIL ty-line: no qualified rule .an-svg .ty-line` / `FAIL: 1` / `exit 1`
- P6(b): `FAIL gp-ref: rule lacks fill: none` / `FAIL: 1` / `exit 1`
- P6(c): `FAIL zz-line: no qualified rule .an-svg .zz-line` / `FAIL: 1` / `exit 1`

New F2 control, in the same clone: unqualify `.an-svg .lc-applied {` back to `.lc-applied {` and
append a decoy `.an-svg .lc-applied-x { fill: none; }`:

```
FAIL lc-applied: no qualified rule .an-svg .lc-applied
FAIL: 1
exit 1
```

Before the fix this decoy would have matched `lc-applied` via the old `\b` boundary and passed
falsely; after the fix it correctly FAILs, naming the real class with no qualified rule for it.

`git status --short | wc -l` after all six controls (each reverted): `0`.

## Head

`9a98e2be` on `unit/rg-U1`.

## Disagreed with the plan

Nothing in the design or the criteria text disagreed. `figma/plugin/ui.html` is a forced departure
from the unit's file list (see Files): `npm test` regenerates it from the changed `styles.css`, so
it had to be committed as its own follow-up commit to satisfy P1's byte-stable requirement,
otherwise a fresh clone at the first commit shows `M figma/plugin/ui.html` after running the gate.
