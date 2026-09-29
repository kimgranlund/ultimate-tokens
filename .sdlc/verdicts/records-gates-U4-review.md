PASS

# records-gates U4 review, pass 1 (#741, #747)

| Field | Value |
|---|---|
| Unit | U4, `em-dash.mjs --fix` takes the colon inside string literals (E1, E2), refuses E3 and E4 |
| Branch | `unit/rc-U4` at 768d1c78 (code commit 9045acbd) |
| Base | `B = git merge-base origin/main HEAD` = 8f5c6dc0 |
| Diff | `test/repo/em-dash.mjs` (+89 -6), `.sdlc/handoffs/records-gates-U4.md` (new); inside the scope wall |
| Clones | `/private/tmp/claude-501/rcU4-rev/{base,head,e1,e3,fix,fixbase,neg}`, each checked out at the named sha; `--fix` never ran in the worktree |
| `npm test` | `✓ all 53 test files passed`, exit 0, run in the worktree at 768d1c78 under load average 90 to 140; afterwards `git status --short` lists only this record (written during the run), so the regenerated assets left the tree clean |

## Criteria

| Id | Command (abridged) | Got | Negative control | Control result |
|---|---|---|---|---|
| U4-1 | `grep -c 'expectRule:'`; `grep -c -E 'name: "E[1-4] '`; `node test/repo/em-dash.mjs \| tail -1` with pipefail, in the worktree | `36` (base `32`), `4`, `em-dash: clean (797 files scanned)`, `exit 0` | clone `neg` at 768d1c78, the `E1_RE ... return { rule: "R2s" }` line deleted | exit `1`, `✗ E1 heading in a string: matched R8, expected R2s` |
| U4-2 | `--fix` in clone `base` (8f5c6dc0) and clone `head` (768d1c78), `grep -E '^R0 [0-9]+$'`; the plan's perl E1 count over its paths in the worktree | `R0 0` and `R0 0`, equal; `git status --short` empty in both afterwards; perl count `0` | (a) clone `e1`: one E1 line appended to `src/ui/app-helpers.mjs`, `git add`ed; (b) clone `e3`: one E3 line the same way; (c) the perl predicate on a planted E1 file | (a) `R0 0`, `R2s 1`, diff shows `+const zz = "## Hard rules: IMPORTANT";`; (b) `R0 1`, residual lists `app-helpers.mjs:832 (E3)`, the glyph kept; (c) prints `1`, so the tree's `0` is not vacuous |
| U4-3 | the plan's four-line plant in clone `fix` (768d1c78), `git add`, `--fix`, the three greps and the glyph count | `1`, `1`, `2`; glyph count over both planted files `2`; residual block lists `docs/zz-e.md:1 (E4)` and `src/ui/zz-e.js:3 (E3)` | the same plant in clone `fixbase` (8f5c6dc0); and in clone `neg` without the `git add` | base: `0`, `0`, `0`, glyphs `0`, strings read `Hard rules, IMPORTANT` and `Pro**, the paid` (R8's comma, the ticket's defect); no `git add`: `0` on the head, the vacuous form the plan names |

The handoff's numbers match mine on every row (its gate tail says 796 files scanned against my 797, which is the handoff file itself landing in 768d1c78 after the run).

## Findings

| # | Severity | Finding | Evidence | Negative control |
|---|---|---|---|---|
| 1 | 🟡 minor, non-blocking | E1 and E2 test the whole line, but `applyRule` writes the colon at the line's first dash (`idxs[0]`). On a line holding a plain string with a dash before a heading string, the colon lands on the wrong dash and the heading dash takes R8's comma | clone `head`, planted `const c = "a <dash> b"; const d = "## Head <dash> tail";` became `const c = "a: b"; const d = "## Head, tail";` | the single-string E1 plant rewrites correctly (U4-2 control a); `--fix` on the unmodified head tree touches nothing (`git status` empty), so no line on main hits this today |
| 2 | 🟡 minor, non-blocking | E1 to E3 apply to every non-`.md` file, not only the re-diagnosis's paths (`src/ui`, `src/engine`, `mcp`, the two `code.js`); E2 also fires in a block comment (` * **Pro** <dash> x` took a colon). E2 matches the design's predicate as written (outside a `//` comment, generated mirrors excluded via `shouldSkipFix`), and the wider habitat changes no line today | clone `head` probe file `src/ui/zz-p.js` | a `//`-commented bold label and a trailing `// **Pro** <dash>` comment both took R8's comma, so the comment exclusion bites |

Neither finding breaks a U4 criterion. Finding 1 is worth a follow-up that binds E1 and E2 to the string enclosing `idx` (`enclosingStringContent` already exists), so a late branch's `--fix` cannot misplace the colon.

## Scope

Only `test/repo/em-dash.mjs` and the unit's own handoff changed. The four fixtures build the glyph from `DASH`, so no U+2014 was added to a tracked file; the em-dash gate is clean at the head.

verdict: 🟢
