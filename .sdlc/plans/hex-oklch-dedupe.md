---
status: approved
ticket: #731
priority: P3
lane: ui (`src/ui/model.mjs`, `test/ui/model.mjs`, the bundle files `npm test` regenerates)
size: S (U1 S = 1 point; 1 point)
labels: kind:bug · size:small (as minted on #731)
written: 2026-09-22
depends: #681 landing on `origin/main`. Gate G0 below decides it by command; U1 does not start before G0 prints green, and the Orchestrator merges `origin/main` into `plan/hex-oklch-dedupe` before cutting U1's worktree
head: 3e1483e4 (`origin/main`; `plan/hex-oklch-dedupe` is cut from it, local only, never pushed by the planner)
measured-at: 65b3bf27 (the local `plan/preset-intent-fidelity` tip, in a detached scratch worktree and a `--shared` clone of it, both removed by exact name) and 3e1483e4 (`origin/main`, read with `git show`), 2026-09-22
branch: plan/hex-oklch-dedupe
inputs: ticket #731; the U2 design drafted in `.sdlc/plans/small-fixes.md` at adf9e5a9 (`git show adf9e5a9:.sdlc/plans/small-fixes.md`, §U2 and rows G0, U2-1 to U2-4) and the checkability review of it (`policy-plans-checkability.md`, Plan C: G0 line 3, U2-1's split needle and its count, U2-3's control cell); `src/ui/model.mjs`, `test/ui/model.mjs`, `test/engine/anchor.mjs`, `src/ui/categories/*.js` on 65b3bf27; `.sdlc/adapter.md` §1 and §2.1; `.sdlc/baseline.md`
---

# `model.mjs` keeps one hex-to-OKLCH conversion (#731)

`src/ui/model.mjs` on `plan/preset-intent-fidelity` carries `anchorRgbOf` and `rgbToOklchLocal`, a private pair that converts an anchor hex to an OKLCH triple for `deriveKeyColor`'s anchored branch, under a comment saying there is no shared full-triple converter to import. The same file exports `rgbToOklchArr` and `hexToOklch` 60 lines above, on the same matrices, and #681's pre-land reviewer measured 0 differences over 3,387 hexes. The fix deletes the pair and the false comment, calls `hexToOklch` from the anchored branch, and adds one assertion so the two paths cannot exist again unnoticed. Behaviour-neutral by construction and measured twice (U1-3).

This design was drafted as U2 of `small-fixes` at adf9e5a9 and split out when the owner ruled that #731 waits for #681 (revision 2 of that plan). It is reused here with the checkability review's three notes folded: G0's third line is a post-merge check, not a gate, with its Today value measured rather than claimed; U1-1's `no shared full-triple converter` needle was split across two comment lines and never matched, so it is `no shared full-triple` and the count is `7`, not `5`; U1-3's control cell keeps only `cmp` for the coefficient change, and the assertion's control is the `hexToOklch("#000000")` edit named in U1-2.

What the measurement on 65b3bf27 adds to the ticket. `rgbToOklchArr` (`:821`) and `rgbToOklchLocal` (`:881`) differ formally only in the hue wrap, `((x + 360) % 360)` against `(((x % 360) + 360) % 360)`; for `atan2` output in the closed range (-180, 180] both give the same number, and over the anchored corpus the model's `keyOklch` already deep-equals `hexToOklch(key)` on all 3,380 anchored palettes and all 16 default-kit families (measured, below), so the assertion U1 adds is true of the tree it lands on and false of any tree where the two drift. `hexToOklch` has callers in `src/ui/app-helpers.mjs`, `src/ui/app.js`, `src/ui/sections/color.js` and two tests, so it is the survivor and the private pair is the deletion. `src/engine/prime.mjs` and `src/engine/exports.js` carry their own private copies; the ticket names `model.mjs` only, and those two are out of scope (see Not in scope).

Scope wall. Paths this plan may change: `src/ui/model.mjs`, `test/ui/model.mjs`, the generated files `npm test` rewrites because a bundled source changed (`figma/plugin/ui.html`; `src/ui/*-assets.js`, `src/ui/categories/*.js` and `docs/img/` only if the generators move them, which the builder reports), this plan, its own handoffs, verdicts and questions (`.sdlc/{plans,handoffs,verdicts,questions}/hex-oklch-dedupe*`), and `.sdlc/board.md` (Orchestrator). Nothing under `src/engine/`, `scripts/`, `.github/`, `test/run.mjs`, any other `test/` file, or any other `.sdlc/` record.

Prose rules for every line this plan adds. No em dash outside an inline backtick span that quotes program output. No bold inline labels. The retired maker brand is paraphrased, never quoted. `grep -P` is absent on this host: PCRE runs through `perl`. The shell is zsh, where `${PIPESTATUS[0]}` is empty: a command that needs a pipe's exit code runs under `bash -c`.

Diff bases. Every row diffs against `B=$(git merge-base origin/main HEAD)`, never against the plan branch's own tip; after G0's merge that is the `origin/main` tip #681 landed on, and it sees the unit whole. Every negative control that edits a file runs in a throwaway clone (`git clone -q --shared . "$F/neg"`), made from the unit's commit, never in a unit worktree (`git -C "$F/neg" log -1 --format=%h` prints the unit head). `F` is a directory the seat makes under its own scratchpad with a name no other seat would pick, and removes by that exact name. In table cells `\|` is the escape for a plain `|`: type it unescaped. `N` is the length of `TESTS` on the branch, read by command, never by number: `48` on `origin/main` at 3e1483e4, `49` on 65b3bf27 (#681 adds `engine/anchor.mjs`), one more per gate-split unit that lands first.

Criteria ids: P rows for the plan, numbered rows for the unit, cited as U1-3. G0 is the start gate.

## Measured by the planner on 2026-09-22

| Fact | Where | Value |
|---|---|---|
| `grep -c -e rgbToOklchLocal -e anchorRgbOf src/ui/model.mjs` | `origin/main` 3e1483e4 | `0` |
| the same | 65b3bf27 | `5` (lines 871, 874, 880, 881, 913) |
| `grep -c -e rgbToOklchLocal -e anchorRgbOf -e 'third identically-scoped private copy' -e 'no shared full-triple' src/ui/model.mjs` (U1-1's needle set) | 65b3bf27 | `7` (871, 874, 875, 877, 880, 881, 913); with the review's split needle `no shared full-triple converter` the count is `6`, since the phrase breaks across lines 877 and 878 |
| `grep -n 'export function rgbToOklchArr\|export function hexToOklch\|const ANCHOR_HEX = ' src/ui/model.mjs` | 65b3bf27 | `821`, `836`, `879` |
| `hexToOklch` shape | 65b3bf27 `:836` | `return rgbToOklchArr(hexToRgb(String(hex)));`, a `[L, C, H]` array, the shape `deriveKeyColor` returns as `keyOklch` |
| the anchored branch | 65b3bf27 `:911` to `:913` | `if (typeof p?.anchor === "string" && ANCHOR_HEX.test(p.anchor)) { const keyHex = p.anchor.toUpperCase(); return { keyOklch: rgbToOklchLocal(anchorRgbOf(keyHex)), keyHex }; }` |
| callers of `rgbToOklchLocal` and `anchorRgbOf` | 65b3bf27 | one, `deriveKeyColor` at `:913` |
| `keyOklch` readers | 65b3bf27 | `projectView`'s per-palette entry at `:1011` and `:1029` |
| the corpus probe (U1-3's command) | 65b3bf27, detached scratch worktree | `3780` rows with a `keyOklch`; `3380` of them where `keyOklch` deep-equals `hexToOklch(key)` (the anchored set #681 names); the default kit: `16` palettes, `16` anchored-equal |
| the coefficient control (U1-3) | a `--shared` clone of 65b3bf27, `0.4122214708 * r` changed to `0.4122214709 * r` in `rgbToOklchArr`, `1 file changed, 1 insertion(+), 1 deletion(-)` | `cmp` of the two dumps: `differ: char 4, line 1`, `cmp 1` |
| `PRESETS` entries | `src/ui/categories/brands.js` on 65b3bf27 | each entry is a document (keys `name, vol, story, curve, ..., palettes`), so the probe passes `d` itself to `projectView` |
| `defaultDocument()` palettes | 65b3bf27 `:492` | `DEFAULT_PALETTES.map((p) => ({ ...p, ..., sourceAnchor: p.anchor }))`, so each of the 16 carries `anchor` (spread from `p`) as well as `sourceAnchor`; `deriveKeyColor` reads `anchor` |
| `test/ui/model.mjs` lines naming `keyOklch` | 65b3bf27 | `0` |
| `test/engine/anchor.mjs` lines naming `key-anchor` | 65b3bf27 | `11`; the file does not exist on `origin/main` |
| `TESTS` length | `origin/main`, 65b3bf27 | `48`, `49` |
| `gh issue view 681 --json state --jq .state` | 2026-09-22 | `OPEN`; the branch tip on origin is b4be472c, local 65b3bf27, no PR open |
| `git merge-base --is-ancestor origin/main plan/hex-oklch-dedupe; echo $?` | 2026-09-22, the minute the branch was cut | `0`, trivially: the branch is `origin/main` plus this file. It prints `1` as soon as main moves, and `0` again only after the Orchestrator's G0 merge |

## The design, stated once

Delete `anchorRgbOf` and `rgbToOklchLocal` and the comment lines that explain them (`:871` and `:874` to `:878` on 65b3bf27, keeping `:872` and `:873`, the two lines about `ANCHOR_HEX` mirroring `prime.mjs`); the anchored branch of `deriveKeyColor` becomes `return { keyOklch: hexToOklch(keyHex), keyHex };`. `hexToOklch` is declared 75 lines above its new caller, both are module-level functions, so no hoisting question arises. Nothing is exported that was not exported before, and `ANCHOR_HEX` stays.

The test that outlives the fix: one block in `test/ui/model.mjs` asserting that for every anchored palette of `defaultDocument()` (the 16 families carry `anchor`; the builder confirms the field `deriveKeyColor` reads is set on the palettes the test feeds it, and constructs one anchored palette from a corpus hex if it is not) `projectView(doc).palettes[i].keyOklch` deep-equals `hexToOklch(palette.anchor)` and `.key` equals the anchor upper-cased, and that the subject count is at least 1, printed. It is the ticket's "a test asserts the two agree" acceptance restated for one implementation: the key colour a consumer sees is the file's public conversion of the anchor. The block prints exactly one pass line reading `keyOklch agrees with hexToOklch: subjects <n>`, `<n>` the subject count, so U1-4 greps a pinned text and not whatever the builder chose.

## G0: has #681 landed (U1's step 1, and the Orchestrator's before it cuts U1's worktree)

```sh
git fetch -q origin
git show origin/main:src/ui/model.mjs | grep -c -e rgbToOklchLocal -e anchorRgbOf
gh issue view 681 --json state,stateReason --jq '.state + " " + .stateReason'
```

Expected `5`, `CLOSED COMPLETED` (a `NOT_PLANNED` close is not a landing). Today `0`, `OPEN` followed by a space (`stateReason` is null while open). The duplicate does not exist on main until #681 lands, so line 1 cannot go green early and decides whether U1 still has work; line 2 is the gate. If line 1 prints a number other than `5` once #681 has landed (the branch moved before landing), the builder re-reads the lines, cites the new count in its handoff, and the rows below read the same needles.

Post-merge check, the Orchestrator's own step once G0 is green: merge `origin/main` into `plan/hex-oklch-dedupe` (local, unpushed; one plan commit on it, so a merge is clean), then `git merge-base --is-ancestor origin/main plan/hex-oklch-dedupe; echo $?` prints `0`, and only then is U1's worktree cut. A builder that sees any other G0 value stops and reports `G0 red`; it does not build against `plan/preset-intent-fidelity`.

## Units

- [~] U1 (S) one hex-to-OKLCH conversion in `model.mjs`, the comment gone, an agreement assertion · builder-l1 · reviewer-l1 · verifier-l1 · starts at G0 green

Grades follow the Orchestrator's rule: an L1 builder gets reviewer-l1 and verifier-l1. U1 is L1: a deletion and a one-line call, with a test whose control is named.

| Unit | Size | Builder | Reviewer | Verifier | Touches |
|---|---|---|---|---|---|
| U1 one conversion | S | builder-l1 | reviewer-l1 | verifier-l1 | `src/ui/model.mjs`, `test/ui/model.mjs`, plus the regenerated bundle files `npm test` rewrites |

## Plan-level criteria

`B=$(git merge-base origin/main HEAD)` at the top of every row.

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| P1 | `npm test` green with no `node_modules`, the count agrees, the tree is byte-stable | `npm test 2>&1 \| tail -1; perl -0ne 'my ($b) = /const TESTS = \[(.*?)\];/s; my @m = $b =~ /"[^"]+\.mjs"/g; print scalar(@m), "\n"' test/run.mjs; git status --short \| wc -l` | the runner's pass line naming N files, then N, then `0`. The unit registers no test file, so N equals the base's N | in the clone: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test > "$F/neg.log" 2>&1; echo "exit $?"` prints `exit 1` (adapter §1's own control) | `48` at 3e1483e4; the suite was not run by the planner |
| P2 | `npm run build` green, tree clean after (a bundled source changes) | `npm run build > "$F/b.log" 2>&1; echo "exit $?"; tail -1 "$F/b.log"; git status --short \| wc -l` | `exit 0`, a line starting `wrote figma/plugin/ui.html`, `0` (after the regenerated `ui.html` is committed with the source) | in the clone, delete the `export` keyword from `hexToOklch`: `npm run build` exits non-zero on the unresolved import in `src/ui/app.js` (the builder records the first error line) | not run by the planner |
| P3 | branding clean, and no added line carries an em dash (U+2014) outside a backtick span, and the raw count matches the enumerated quotes | `bash -c 'set -o pipefail; node test/repo/branding.mjs \| tail -1'; git diff "$B" -- . ':(exclude)figma/plugin/ui.html' ':(exclude)src/ui/*-assets.js' ':(exclude)src/ui/categories' \| grep -v '^+++ ' \| grep '^+' \| perl -CSD -ne 's/\x60[^\x60]*\x60//g; print if /\x{2014}/' \| wc -l; git diff "$B" -- . ':(exclude)figma/plugin/ui.html' ':(exclude)src/ui/*-assets.js' ':(exclude)src/ui/categories' ':(exclude).sdlc/handoffs' \| grep -v '^+++ ' \| grep '^+' \| perl -CSD -ne 'print if /\x{2014}/' \| wc -l` | `branding: clean (N files scanned)`, `0`, then the number of quoted program lines the unit's added text carries that hold the glyph, stated in the handoff and derived from the output quoted, never from the diff (`0` if the handoff quotes only the pass line and the numstat) | in the clone: `cp docs/reference/references/decision-records.md .sdlc/verdicts/x.md` reds the first; one added prose line with the glyph makes the second `1` | clean at 3e1483e4; this plan's own added lines: `0` and `0` (planner) |
| P4 | scope wall | `git diff --name-only "$B" \| grep -v -E -e '^src/ui/model\.mjs$' -e '^test/ui/model\.mjs$' -e '^\.sdlc/(plans\|handoffs\|verdicts\|questions)/hex-oklch-dedupe' -e '^\.sdlc/board\.md$' -e '^figma/plugin/ui\.html$' -e '^src/ui/[a-z-]+-assets\.js$' -e '^src/ui/categories/' -e '^docs/img/' \| wc -l; git diff --name-only "$B" -- src/engine test/run.mjs scripts .github package.json \| wc -l` | `0`, `0` | a fixture of three names (`src/engine/prime.mjs`, `test/run.mjs`, `src/ui/model.mjs`) piped through the first filter prints `2` (run by the planner) | `0`, `0` on the plan branch (this file only) |

## U1: one conversion (#731), starts at G0 green

Steps. (1) G0, in the unit worktree the Orchestrator cut after the merge. (2) In `src/ui/model.mjs` delete `anchorRgbOf`, `rgbToOklchLocal` and their comment lines; keep `ANCHOR_HEX` and its two-line comment; the anchored branch of `deriveKeyColor` calls `hexToOklch(keyHex)`. (3) Add the agreement block to `test/ui/model.mjs`. (4) `npm test`; commit the regenerated bundle files with the source. (5) Run U1-3 in a clone at `$B` and in the unit worktree and `cmp` the two dumps. (6) The handoff states the line numbers it deleted, the P3 raw count, and the subject count U1-4 printed.

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U1-1 | one conversion, the false comment gone, the public one and the regex kept | `grep -c -e rgbToOklchLocal -e anchorRgbOf -e 'third identically-scoped private copy' -e 'no shared full-triple' src/ui/model.mjs; grep -c 'export function rgbToOklchArr' src/ui/model.mjs; grep -c 'keyOklch: hexToOklch(keyHex)' src/ui/model.mjs; grep -c 'const ANCHOR_HEX = ' src/ui/model.mjs` | `0`, `1`, `1`, `1` | the file at G0 (before the edit) prints `7` on the first grep and `0` on the third; a left-behind comment line prints `1` or more on the first | on 65b3bf27: `7`, `1`, `0`, `1`; on 3e1483e4: `0`, `1`, `0`, `1` (why G0 line 1 gates) |
| U1-2 | the engine's own anchor gate still agrees with the model | `node test/engine/anchor.mjs > "$F/a.log" 2>&1; echo "exit $?"; grep -c 'key-anchor' "$F/a.log"; grep -c '^  FAIL' "$F/a.log"` | `exit 0`, `1` or more, `0` (the `key-anchor` gate reads `paletteKeyColors` against the anchor over the corpus and carries its own one-digit corruption control; if gate-split has landed first the file runs sampled by default, which is fine for this row) | in the clone, make the anchored branch return `hexToOklch("#000000")` for `keyOklch` but keep `keyHex`: this row stays green (it reads hex only), which is why U1-4 exists and why that edit is U1-4's control | the file names `key-anchor` 11 times on 65b3bf27; absent on main |
| U1-3 | behaviour-neutral, measured: the key OKLCH of every palette is byte-identical before and after, and the anchored ones equal the public conversion | in the clone at `$B` and in the unit worktree, the same probe, output to `"$F/before.json"` and `"$F/after.json"`: `node --input-type=module -e 'const m=await import("./src/ui/model.mjs");const out=[];for (const c of ["architecture","brands","cuisine","film","literature","music","nature","travel"]) for (const d of (await import("./src/ui/categories/"+c+".js")).PRESETS) { const v=m.projectView(d); for (const p of v.palettes) if (p.keyOklch) out.push([c, d.name, p.name, p.key, p.keyOklch]); } console.log(JSON.stringify(out)); console.error(out.length, out.filter((r)=>m.hexToOklch(r[3]).every((x,i)=>x===r[4][i])).length)'` (the second line, on stderr, is the row count and the anchored-equal count); then `cmp "$F/before.json" "$F/after.json"; echo "cmp $?"` | `cmp 0`; stderr `3780 3380` both times, or the counts the corpus carries at G0 (the builder cites the numbers it sees; at least `3380` anchored-equal) | in the clone at the unit head, change one matrix coefficient of `rgbToOklchArr` in its last digit (`0.4122214708 * r` to `0.4122214709 * r`): `cmp` prints a `differ:` line and `cmp 1` (run by the planner on 65b3bf27). Only `cmp` is this row's control: a coefficient change moves `hexToOklch` and the model together, so the assertion of U1-4 stays green under it by design | on 65b3bf27: `3780 3380`, and `keyOklch` already deep-equals `hexToOklch(key)` on all 3380 (the ticket's 0 differences, re-measured); not runnable on 3e1483e4, where the anchored branch does not exist |
| U1-4 | the agreement assertion is in `npm test` and bites | `node test/ui/model.mjs > "$F/m.log" 2>&1; echo "exit $?"; grep -c 'keyOklch agrees with hexToOklch: subjects [0-9][0-9]*' "$F/m.log"; grep -o 'keyOklch agrees with hexToOklch: subjects [0-9]*' "$F/m.log" \| awk '{print $NF}'` | `exit 0`, `1`, then `16` (the default kit's anchored families) or the count the builder constructed, at least `1` | in the clone, the U1-2 edit (`hexToOklch("#000000")` for `keyOklch`, `keyHex` kept): `exit 1`, a FAIL line naming the first palette whose `keyOklch` is not `hexToOklch(anchor)`; `ui/model.mjs` is in `TESTS` on main, so the same red is `npm test`'s | `test/ui/model.mjs` has `0` lines naming `keyOklch` on 3e1483e4 and on 65b3bf27 |
| U1-5 | the deletion is the whole source change: `model.mjs` loses the pair and the comment, gains one call | `git diff --numstat "$B" -- src/ui/model.mjs \| cut -f1,2 \| tr '\t' ' '; git diff "$B" -- src/ui/model.mjs \| grep -c '^+[^+]'` | `1 D` where D is the deleted-line count the handoff states (the pair, its comment lines and the old call: `20` on 65b3bf27's numbering, `:871`, `:874` to `:878`, `:880` to `:892`, `:913`; `21` if the blank line at `:893` goes too), then `1` | a diff with more than one added line reds the row; the builder names any extra line | no diff |

## Not in scope

| Item | Why | Where it goes |
|---|---|---|
| The private `rgbToOklch` copies in `src/engine/prime.mjs` and `src/engine/exports.js` | The ticket names `model.mjs`. The engine copies sit in DOM-free modules with their own dependency rules (`prime.mjs` may not import `model.mjs`), so consolidating them is an engine-lane decision with a `color-math` review, not a small fix | a follow-up ticket if the owner wants one; the U1 handoff names both lines |
| A shared converter under `src/engine/` that `model.mjs` and the two engine copies all import | the same lane question, and #681's comment about module boundaries was false of `model.mjs` only, not of the engine modules | the same follow-up |

## Risks

| Risk | What this plan does about it |
|---|---|
| #681 lands with the pair renamed or moved | G0 line 1 prints a number other than `5`; the builder re-reads and cites; the needles are the function names, which a rename would change, so the builder then stops and asks |
| Gate-split lands between now and U1 and `key-anchor` runs sampled | U1-2 accepts either mode; U1-3 sweeps the corpus itself and does not read the gate |
| The default kit's palettes lose `anchor` and keep `sourceAnchor` only | the design says the builder constructs one anchored palette in the test from a corpus hex; the subject count is printed and must be at least 1 |
| The plan branch drifts behind main while waiting | the branch holds one plan commit and is unpushed; G0's merge is the Orchestrator's step and nothing shared is rewritten |

## Landing

One PR from `plan/hex-oklch-dedupe` to `main`, title `fix(ui): model.mjs keeps one hex-to-OKLCH conversion (#731)`, body `Closes #731`. Draft at U1's first verified state. Pre-land per adapter §2.1: P1 to P4 and U1-1 to U1-5 at the branch head, every `sh .sdlc/checks/*.sh`, record at `.sdlc/verdicts/hex-oklch-dedupe-prepr.md` with `verdict: 🟢` as its last `verdict:` line and `sha:` at the head; smoke is a pre-land gate here because `src/ui/` changed (adapter §1). Then the `shipping-changes` squash and sync steps, and the plan-closing rule of adapter §5 (status `done`, U1 ticked, the file to `.sdlc/plans/archive/`, #731 closed by the PR's `Closes` line and `adapter.py close 731 --reason .sdlc/verdicts/hex-oklch-dedupe-prepr.md`). The closing comment on #731 carries one named line for the two engine-side private copies the U1 handoff cites (`src/engine/prime.mjs`, `src/engine/exports.js`, line numbers as the handoff states them), per Q1's ruling.

## Owner questions

| Id | Question | Recommendation |
|---|---|---|
| Q1 | Mint a follow-up ticket now for the two engine-side private copies (`src/engine/prime.mjs`, `src/engine/exports.js`), so the U1 handoff's line about them has a home? | Ruled by the Conductor 2026-09-22: no ticket now; the Orchestrator carries them as one named line in #731's closing comment (Landing), and triage decides later |

## Revisions

| Date | Change | Why |
|---|---|---|
| 2026-09-22 | written, status proposed, reusing the U2 design of `small-fixes` at adf9e5a9 with the checkability review's notes folded (G0 line 3 a post-merge check with its Today measured; U1-1's needle `no shared full-triple` and count `7`; U1-3's control `cmp` alone, the assertion's control named in U1-2 and U1-4). Every value measured at 65b3bf27 in a detached scratch worktree and a `--shared` clone of it, or read off 3e1483e4 with `git show`. P3's two counts on this file's own lines: `0` and `0` | owner ruling 2026-09-22: #731 waits for #681 and becomes its own small plan |
| 2026-09-22 | revision 2, from the checkability review (`backfill-731-checkability.md`: 8 green, 1 yellow). U1-4's pass line is pinned to `keyOklch agrees with hexToOklch: subjects <n>` so the grep no longer depends on the builder's wording (was yellow); G0 line 2 reads `state` and `stateReason` and expects `CLOSED COMPLETED`; Q1 recorded as ruled: no ticket, one named line in #731's closing comment | checkability review at 827d62e1 |
