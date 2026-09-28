---
kind: re-diagnosis
plan: docs-repair
unit: U3
ticket: "#751"
head: da8d48d1 (unit/dr-U3), B = 282fca8d
written: 2026-09-28
measured-at: a throwaway `--shared` clone of `.worktrees/dr-U3` at da8d48d1 under the job's tmp dir; `git rev-parse --short HEAD` printed `da8d48d1`; the unit worktree was not touched
inputs: `.sdlc/verdicts/docs-repair-U3.md` (both passes), `.sdlc/handoffs/docs-repair-U3.md` and `-rework.md`, `.sdlc/verdicts/docs-repair-U3-review-r2.md`, plan revision 14645215
---

# U3 re-diagnosis: two 🔴 passes on records copied, not measured

## 1. Root cause

Both pass 2 reds have one cause: the builder produced the record by copying an earlier text and never re-read it against the tree at the head it was committing.

- The header. The verifier's F3 yellow at 50a7f464 said the folded header had dropped the old block's contracts. The pass 1 fix restored them by transplanting B's mid-file block sentence for sentence, and B's block ended in `No dependencies.` (B `src/ui/persist.js:56`). That sentence was already false at B (the file's three `import` lines sat at 1 to 3, fifty lines above it, where nobody read the two together). The transplant put it on line 22, directly above `import { ICON_SYSTEMS ... }`, and promoted a buried stale remark into the file's contract. F3 asked for content back; it had no truth check on the content, and the builder read "restore" as "copy".
- The handoff figures. `.sdlc/handoffs/docs-repair-U3.md`'s Branch field still reads `unit/dr-U3 @ 0d1ebb55`, the unit's first head. Every later pass appended a section ("Resume pass", "Pass 1 fix") under the same Ran table and re-measured nothing above it. So the P2 row's `4125.5 KB` and its "npm run build reproduced twice" were true at 0d1ebb55, where the build did run with `node_modules`, and survived two header rewrites that moved the figure twice (4124.3 at 0484a300, 4125.2 at da8d48d1). The U3-9 row's baseline `1` was true when the baseline diff carried one correction paragraph; three paragraphs now quote the `wrote` line and the plan's command prints `3`. The P1 row's `tree stable at 10 files (pre-commit)` named no head because the table never carried one per row: a table whose Branch field names the head has one head for all rows, and that head was never bumped.

Why U3's criteria let both through:

- U3-7 reads `head -1 src/ui/persist.js | grep -c '^// persist.js'`, the first line's shape. No row reads the header's claims against the file that carries them. U3-9 proves the diff is comment-only, which is exactly why a false comment passes every source row: the plan treats comment text as free of truth conditions.
- Every P and U row measures the tree. None measures the record about the tree. Adapter §1 says a handoff's Ran row "is evidence for the reviewer, never for the verdict", so the handoff is checked by a reviewer reading it, and review r2 read the numbers as a story that hung together (it accepted `16 31` from its own run and did not compare the P2 row to the baseline cell). Step (7) and S7 check only the dash count of the handoff, so the one mechanical check on the handoff reads the one figure the builder did re-measure.
- The handoff shape has no per-figure head. "Figures below are true at the commit that carries this handoff" (the Pass 1 fix section) is a sentence, not a field, and it governs only the lines under it. The plan's own rows carry `Today ... at 282fca8d` per cell; the handoff copied the table shape without the head column.

The grade compounds it: builder-l2 (sonnet, medium) under a resume-and-append loop (`dr-U3-builder-l2-p1-resume`, `-fix`) treated each dispatch as a patch on the last handoff. Nothing in the dispatch required a fresh measurement of the whole table, and the level does not supply that discipline on its own.

## 2. Pass 2 scope

Four fixes, each exact. Nothing else in the unit changes; every doc row (U3-1 to U3-8) is 🟢 at da8d48d1 and stays untouched.

| # | Fix | Exact change |
|---|---|---|
| F1 | `src/ui/persist.js:22` | Replace the sentence `No dependencies.` with one the imports make true, on the same line, one line, so the header stays 22 lines and no `persist.js` cite in `docs/reference/reviews/2026-08-20-reactivity/` moves: `Its three imports are engine constants (icon systems, the default type, the collections); nothing from the DOM.` If the line runs long, wrap the sentence into line 22 by shortening the words before it, never by adding a line. Then `npm test` regenerates `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js`; commit them. If the `wrote` figure moves off 4125.2, re-point the `npm run build` cell and add one correction paragraph in the shape of the four already there, naming this pass |
| F2 | `.sdlc/handoffs/docs-repair-U3.md` | Two commits, not one. Commit A carries F1 and the mirrors (and the baseline if it moved); commit B carries the handoff and F3 only. The handoff's Branch field names commit A. Every row of the Ran table is re-run at commit A and rewritten from that run: P2 reads `npm run build owed at pre-land (no node_modules in .worktrees/dr-U3); baseline leg: baseline-agrees-check.sh stale total: 0 at <KB> KB, the committed ui.html measured the check's way`, with `<KB>` the figure `node -e 'console.log((require("fs").readFileSync("figma/plugin/ui.html","utf8").length/1024).toFixed(1))'` prints; U3-9's third figure is what the plan's third command prints (`3` today, `4` if F1 adds a paragraph); P1 names commit A. The Pass 1 fix section's "true at the commit that carries this handoff" becomes "true at <commit A>". No figure anywhere in the file is left without a head, and a figure quoted as history (`4125.5` at 0d1ebb55) says so |
| F3 | `.sdlc/handoffs/docs-repair-U3-rework.md:18` | `5 at 50a7f464` becomes `stripped 5 and raw 7 at 50a7f464` |
| F4 | verify, do not edit | `awk '/^import /{exit} {n++} END{print n}' src/ui/persist.js` prints `22` after F1 and `node test/repo/citations.mjs` reads `STALE 0`; if either moves, F1 broke the one-line rule and is redone |

### Criterion rows that catch the class

Three rows, measured at da8d48d1 in the clone. `B=282fca8d`; `H` is the handoff's own head.

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U3-10 | the `persist.js` header states no claim its own imports contradict, and stays 22 lines | `awk '/^import /{exit} {print}' src/ui/persist.js \| grep -ci -E 'no dependencies\|no imports\|dependency-free\|imports nothing'; grep -c '^import ' src/ui/persist.js; awk '/^import /{exit} {n++} END{print n}' src/ui/persist.js` | `0`, `3`, `22`. The grep is the recurrence guard; the class is read: the verifier reads lines 1 to 22 against lines 23 to 25 and the `export` list once and quotes in its verdict the header sentence that names the imports | the file at da8d48d1 prints `1`, `3`, `22`; a header that grew a line prints `23` and the reactivity cites go `STALE` in P5 | `1`, `3`, `22` at da8d48d1 |
| U3-11 | the handoff's bundle figure and baseline count equal what the tree at its head measures | `grep -o 'ui.html [0-9.]* KB' .sdlc/handoffs/docs-repair-U3.md \| sort -u \| wc -l; grep -o 'ui.html [0-9.]* KB' .sdlc/handoffs/docs-repair-U3.md \| sort -u \| grep -o '^ui.html [0-9.]*'; node -e 'console.log("ui.html "+(require("fs").readFileSync("figma/plugin/ui.html","utf8").length/1024).toFixed(1))'; grep -o 'baseline \x60[0-9]*\x60' .sdlc/handoffs/docs-repair-U3.md; git diff "$B" -- .sdlc/baseline.md \| grep -c '^+.*wrote figma/plugin/ui.html'` | `1` (one figure in the file; a second must be labelled history and carry its head, and then the `sort -u` count is `2` and the handoff says which is current), then two equal `ui.html N` lines, then `` baseline `N` `` with N equal to the last command's print | at da8d48d1: `1`, `ui.html 4125.5` against `ui.html 4125.2`, `` baseline `1` `` against `3` | `1`, `4125.5` vs `4125.2`, `1` vs `3` at da8d48d1 |
| P7 | every unit handoff names the head its figures were measured at, and nothing that produces a figure changed after that head | `H=$(grep -o '^\| Branch \| unit/[a-zA-Z0-9-]* @ [0-9a-f]\{8\}' .sdlc/handoffs/docs-repair-<unit>.md \| grep -o '[0-9a-f]\{8\}$'); [ -n "$H" ] \|\| echo NO-HEAD; git merge-base --is-ancestor "$H" HEAD && echo ancestor; git diff --name-only "$H" HEAD -- . ':(exclude).sdlc/handoffs' ':(exclude).sdlc/reviews' ':(exclude).sdlc/verdicts' ':(exclude).sdlc/board.md' \| wc -l` | no `NO-HEAD`, `ancestor`, `0` (after the handoff's head only records changed, so every figure in the table still describes the tree) | at da8d48d1: `H=0d1ebb55`, `ancestor`, `9` (nine tree files moved after the head the handoff names, among them `persist.js`, `ui.html` and `baseline.md`, the three the stale figures came from) | `0d1ebb55`, `ancestor`, `9` at da8d48d1 |

Permanence. P7 goes into the plan's P table for good: it is unit-agnostic (the handoff path is the unit's), costs three commands, and the pre-land record reruns P rows for every unit, so a handoff that drifted after its head reds at pre-land even when its unit's reviewer read it as a story. U3-10 and U3-11 stay in U3's table (rows are never removed from the plan); U3-11's shape is U3-specific because only U3 moves the bundle. The generic form of U3-10 (a file header that states no claim the file contradicts) belongs to a repo test, not this plan; if the class recurs on another file, that is a `/file-task` for `test/repo/`, not a P row.

## 3. Revisions row

Written into the plan verbatim:

`| 2026-09-28 | revision: U3 pass 2 from the re-diagnosis at da8d48d1 (.sdlc/plans/docs-repair-U3-rediagnosis.md). Root cause: records copied, not measured; the pass 1 fix transplanted B's persist.js block with its false No dependencies. sentence onto line 22, above the imports, and the handoff's Ran table was written at 0d1ebb55 and appended to twice without a re-run, so its P2 KB figure and build claim, its U3-9 baseline count and its P1 head are three heads stale. U3 gains U3-10 (the header states no claim its imports contradict, 22 lines held) and U3-11 (the handoff's bundle figure and baseline count equal the tree at its head); the plan gains P7 (every handoff names its measured head and no figure-producing file changed after it), permanent. Pass 2 is four fixes, two commits: the fix and mirrors first, the handoff second, so the handoff names a real head. Grade: builder-l5 (opus, medium; three above pass 1's L2, the floor the lead set), reviewer-l3 and verifier-l2 standing in for fable, capped | planner, re-diagnosis of verdict pass 2 at da8d48d1 |`

## 4. Builder grade

builder-l5 (opus, medium effort), with reviewer-l3 and verifier-l2 as the capped stand-ins for fable.

Why L5 and not higher: the pass 2 work is one comment sentence, one handoff rewritten from a fresh run, and one label; the difficulty was never reasoning, it was measurement discipline, and the three new rows now carry that discipline as commands with controls that bite on the exact failure (`9` files drifted, `4125.5` against `4125.2`, `1` against `3`). Opus at medium reads a table against a tree without being told twice; a higher effort buys nothing the rows do not already force. Why not lower: the lead's floor is L5, and pass 1's L2 twice produced a record that the model believed rather than ran, so the seat that writes the record has to be one that re-runs by default.

Dispatch note for the Orchestrator: the pass 2 dispatch says "re-run every Ran row at commit A and write the table from the run; nothing carries from the earlier handoff", names the two-commit shape, and says the verifier will run U3-10, U3-11 and P7 first.
