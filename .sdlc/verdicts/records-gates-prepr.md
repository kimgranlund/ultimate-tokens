---
kind: verdict
plan: records-gates
seat: verifier
pass: 1
ticket: "#741, #742, #745, #747, #755"
written: 2026-09-28
---

# Pre-PR · records-gates · ca8d56d5 · 🟢, with the R53 and DD9 carries unchanged from main and one em-dash follow-up owed

Closes #741, Closes #742, Closes #745, Closes #747, Closes #755

verdict: 🟢
sha: ca8d56d5a360e7a6aef615c47e8423917c9467a4

`plan/records-gates` is at `ca8d56d5`. B is `git merge-base origin/main ca8d56d5` = `f3af8229`. origin/main is two `.sdlc/board.md`-only commits past B (`80fbe483`, `7da7d7da`). The pair ran in fresh context per `pre-land-review`: `reviewer-l4` and `verifier-l3`, both at their own grade with no substitute. Every figure below comes from their throwaway clones and was spot-checked by the Verifier seat: P4 `0`, `repo/verdict-frontmatter.mjs` registered `1` at head against `0` at B, the U5 pointer grep `1`, and #764 `OPEN`. Smoke is not owed: `git diff --name-only f3af8229 ca8d56d5 -- src/ui | wc -l` prints `0`. The review reads PASS.

| Check | State | Evidence | Negative control |
|---|---|---|---|
| P1 npm test | 🟢 | `✓ all 54 test files passed`, `exit 0`, `git status --short \| wc -l` `0`; TESTS `54`; `ok    tests: baseline 54, test/run.mjs TESTS 54` | the scrim sed gives `✗ 1/54 test file(s) failed`, `exit 1`; the baseline row at `all 53` gives `STALE tests: baseline 53, test/run.mjs TESTS 54` |
| P2 build | 🟢 | the product-path diff prints `0`; `npm ci` gives `exit 0`; `npm run build` gives `exit 0` with `wrote figma/plugin/ui.html 4118.0 KB`, tree `0` | the two-name fixture gives `1` |
| P3 glyphs and branding | 🟢 | `branding: clean (819 files scanned)`; stripped `0`; raw `4`, all in `records-gates-U2-review.md` inside code spans, and the U2 handoff states `4` and names them; `em-dash: clean (827 files scanned)`, `exit 0` | the decision-records copy gives branding `FAIL: 3`, `exit 1`; a glyph line gives stripped `1` and em-dash `FAIL: 1`, `exit 1` |
| P4 scope wall | 🟢 | `0`, `0`, `2 2`, `0`. `prompt-audit.md` is absent from the diff and equals main. The `reviews` admission is the plan's revision 5 row and admits `records-gates` names only | the four-name fixture gives `2`; a `git mv` of a verdict gives `1`; a third line gives `3 3`; an unlisted `verdict:` line gives `1`; `other-U1-review.md` through the reviews pattern is not admitted |
| U1-1 to U1-3 exits | 🟢 | `range mismatches: 0`, `exit 0`; `stale total: 0`, `exit 0`; `exit $((n > 0))` twice; adapter greps `1`, `1`, `1`; other checks untouched `0` | a planted ADR-025 range gives `range mismatches: 2`, `exit 1`; an amendment cut gives `stale total: 1`, `exit 1`; B's adapter gives `0`, `0`, `0` |
| U2-1 to U2-3 §6 | 🟢 | the slice greps print `0`, `0`, `1`, `1`, `0`, `1`; headings `27`, `27`, `0`; numstat `2 2` | B's slice gives `2`, `3`, `0`, `0`, `1`, `0`; a hyphen heading gives `27`, `26`, `1`; a blank line above ADR-026 gives `range mismatches: 4`, `exit 1` |
| U3-1 to U3-3, U3-5 verdict check | 🟢 | `verdicts 181 graded 181 bad 0`, `exit 0`; `✓ verdict-frontmatter: verdicts 181 graded 181 bad 0, planted 2`; runs of `.338`, `.356` and `.300` s from the root, and `exit 0` from `test/` | a last line cut gives `MISSING gate-split-U1.md`, `exit 1`; a planted unmarked record gives `exit 1`; the shell check forced to exit 0 gives `the planted leg exited 0`, `exit 1`; `ROOT = process.cwd()` gives `exit 1` from `test/` |
| U3-4 baseline | 🟡 | `ok    tests: baseline 54`; `stale total: 1` from `STALE time test: baseline 167 to 268 s, adapter 80 to 89 s`, byte-identical on origin/main `7da7d7da`: the R53 carry, not this plan's | the row at `all 53` gives `stale total: 2` |
| U4-1 to U4-3 colons in strings | 🟢 | `36`, `4`, `em-dash: clean`, `exit 0`; `--fix` gives `R0 0` at B and at head, tree `0`; the four-line plant gives `1`, `1`, `2`, glyphs `2` | the `R2s` line deleted gives `✗ E1 heading in a string: matched R8`, `exit 1`; at B the plant gets R8's commas: `"## Hard rules, IMPORTANT"` |
| U5-1 to U5-4 ceiling pointer | 🟢 | `ok    adapter note count == rows  (note 20, rows 20)`, `ok    adapter note max == series max  (note 1670.43, series 1670.43)`, `ceiling-counts: clean`, `exit 0`; U5-2 `20`, `1670.43`, `1`, `1`, `1`, `1`; the script diff `0` | B's adapter gives `FAIL  adapter pointer found`, `exit 1`; `19` gives `FAIL  adapter note count == rows`, `exit 1`; the sentence moved gives a retired-paragraph count of `0` |
| Landing checks | 🟡 | card-amendment `0`, card-source-range `0`, verdict-frontmatter `0`, and ceiling-counts `0` (it exits `1` on main; U5 fixes it) all pass. Two checks exit `1`, both byte-identical on origin/main: `baseline-agrees-check.sh` (the R53 carry) and `doc-drift-rows-check.sh` (`QUOTE DD9: not found at .claude/CLAUDE.md:95`, named in the plan's Not-in-scope table) | each check's own control as above |
| Integration and review | 🟡 | U1 (§1, §2.1), U2 (§6) and U5 (§3) do not overlap in `adapter.md`; U3's baseline edit leaves U5's §Interim rows alone. No dependency, CI, secret or private-doc path; `claims.py` prints no finding | the review's `--fix` plants below |

## Owed follow-ups (🟡, nothing on main is hit today: `0` tracked non-`.md` lines carry the glyph at the head or on main)

- #764 (OPEN): E1 and E2 bind to the line's first dash, not the enclosing string's. It reproduces at the head: `"a: b"` and `"## Head, tail"`.
- Not covered by #764, found by the review's plants:
  - E1 has no after-side guard (`test/repo/em-dash.mjs:451`), so `"## Title <U+2014>"` becomes `"## Title: "`, which R2 would refuse.
  - `E1_RE` (`:363`) misses single-quoted strings.
  - `E4_RE` (`:377`) misses a code-span label in a blockquoted bullet.
  These want a ticket, or an addendum to #764.
- Adapter §2.1 (`.sdlc/adapter.md:110`, a line U1 rewrote) still has the pre-land verifier run `every sh .sdlc/checks/*.sh`, which never reaches `ceiling-counts-check.mjs`. This record ran it anyway.
