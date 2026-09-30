# gates-batch U4 review, pass 1 (#776, carrying #764)

Reviewer: reviewer-l3 (R79). Branch `unit/gb-U4` @ `228e4bb5`, judged on its two commits over `plan/gates-batch`.

**FAIL**: the eight plan rows are met, but a replay of real historic lines shows the new E1/E2 binding changes outputs the old tool got right. The string-boundary scan it now depends on can't handle escaped quotes or a template literal that spans lines.

## Rows

| Row | Result | Evidence (scratch clone) |
|---|---|---|
| U4-1 | 🟢 | self-test PASS, exit 0; name grep 6 |
| U4-2 | 🟢 | staged `f.js` -> `const c = "a, b"; const d = "## Head: tail";` |
| U4-3 | 🟢 | fix case reverted: FAIL 2 (both two-string fixtures), exit 1 |
| U4-4 | 🟢 | E2 whole-line: FAIL on `E2 template literal`; E1 whole-line: FAIL 2 |
| U4-5 | 🟢 | `g.mjs:80` -> all commas, as expected |
| U4-6 | 🟢 | R2s/R3s grep 4, PASS |
| U4-7 | 🟡 | grep 2, PASS, but the leg runs `md=true`, so it never reaches E1/E2 (F3) |
| U4-8 | 🟢 | unit diff: `test/repo/em-dash.mjs` and the handoff only |

`npm test` not run: the heavy-suite count was 5, over the cap of 2. The only file the unit changes is `em-dash.mjs`. I ran its self-test and zero-glyph gate in the clone: exit 0.

## Findings

| # | Sev | Where | Finding |
|---|---|---|---|
| F1 | 🔴 | `test/repo/em-dash.mjs:345-356`, used at `:454-461` | E1/E2 now depend on `enclosingStringContent`, which pairs quotes by odd/even count per kind. It ignores `\"`/`` \` `` escapes and never looks past the line. Replay: I ran the `plan/gates-batch` tool and the U4 tool with `--fix` over the whole pre-sweep tree (`37b04676^`, staged scratch clone). R2s went from 17 to 16 lines and R3s from 24 to 14; 12 output lines differ. 6 are regressions against text already on main: `src/engine/ds-export.js:739` (famBullet) and `:769-771` plus the `-container` bullet (escaped backticks shift the pairing, so the bold label reads as outside its string and the colon becomes a comma), and `mcp/describe-rubric.mjs:63` (`` `# Interpretation rubric `` opens a multi-line template, has no closing backtick on the line, and goes from R2s to R8). Main carries the colon on every one of these. The plan's Risks row ("odd/even counting ... not widened by U4") is false: before U4, E1/E2 never called the scan, and now they are gated on it. This is a plan-design gap as much as a build gap. The lead's focus named escapes and `${}`, and neither is handled. |
| F2 | 🟡 | `em-dash.mjs:458`, `:461` | `E1_RE`/`E2_RE` aren't anchored at the dash under test (`slice(0, upto+1)` still contains earlier dashes). `const s = "## A? [dash] b [dash] c";` used to be refused (R0). Now the first dash fails the guard, and the regex, reached from the second dash, matches on the first dash's text. So the colon lands on the heading's SECOND dash (`"## A? [dash] b: c"`). R2's rule says a second dash on a heading falls to R8. So a refusal became a guess. Mutating either slice to the whole content still passes the self-test (unpinned). |
| F3 | 🟡 | `em-dash.mjs:991-992` | The idempotence leg runs `fixLines(idemSrc, true)`. E1/E2 are `!md` only, so the two new `idemSrc` lines take the `.md` path (R8), and U4-7 passes without exercising R2s/R3s. A mutant running the leg with `md=false` also passes. It proves nothing about the new code. |
| F4 | 🟡 | `em-dash.mjs:461`, `:855-858` | Two surviving mutants. (a) Dropping `idx: di` from the R3s return still PASSes: no fixture has an E2 dash that isn't the line's first. My probe `const c = "a [dash] b"; const d = "- **Pro** [dash] paid";` shows the U4 tool gets it right, but nothing pins it. (b) Replacing the `expectFinal` leg with `if (false)` still PASSes: the two `expectFinal` fixtures stop checking their whole-line result, and the self-test stays green. |
| F5 | ⚪ | `em-dash.mjs:381-383` | The `classifyLine` header still says the rule "governs its first actionable dash". R2s/R3s now govern `decision.idx`. The comment is stale. |

Improvements the replay confirms: `describe-rubric.mjs:78, 80, 83, 142, 204` move from the old E2 colon to commas, which matches main. Line 80 is the issue's case.

## Scratch probes (old tool vs U4 tool, `md=false`)

| Input shape | old | U4 |
|---|---|---|
| `` `- **A \`x\`** [dash] note` `` | R3s colon | R8 comma (F1) |
| `` export const R = `# Title [dash] sub `` (unclosed) | R2s colon | R8 comma (F1) |
| `"## A? [dash] b [dash] c"` | R0 | R2s on the 2nd dash (F2) |
| `x [dash] "## Head [dash] tail"` | colon on `x` (bug) | colon in the heading |
| `"a [dash] b"; "- **Pro** [dash] paid"` | colon on `a` (bug) | colon on Pro |
| escaped `\"` before, or `'it\'s'` before, a `"## ..."` string | R2s | R2s (same) |

Every U4 output was idempotent on a second pass. Leaving E3 on `idxs[0]` follows Q1.

## To go green

1. Make the string scan escape-aware (skip a quote preceded by an odd run of backslashes). Decide what an unclosed opener counts as: treat the rest of the line as its content, so the multi-line template's first line still reads E1. Or, as the fallback, keep the old whole-line E1/E2 test and use the scan only to pick the dash. Then add fixtures for `ds-export.js:739` and `describe-rubric.mjs:63` shapes.
2. Anchor E1/E2 at the tested dash: the first dash in the string, and the dash right after the bold, respectively.
3. Run the idempotence leg with `md=false` over the non-md lines, and add an E2 second-string fixture.
4. Re-run the pre-sweep replay: its diff against the old tool should list only the intended lines.
