---
status: approved
ticket: to mint at activation (Q0: `adapter.py create --title docs-stale-batch --label kind:chore --label lane:docs --size S`; the five issues #774, #773, #771, #770, #768 are closed by the same PR, `Closes` lines in the body)
priority: P3
lane: docs (`figma/README.md`, `.claude/skills/building-editor-sections/references/best-practices.md`, `scripts/gen-figma-binder-code.mjs` header comment, `figma/binder/figma-semantic-binder/code.js` header comment, `src/ui/model.mjs` comments, `src/ui/sections/typography.js` comments, `src/ui/sections/geometry.js` comments, `.sdlc/adapter.md` §6, plus the regenerated `figma/plugin/ui.html` and `src/ui/figma-plugin-assets.js` those comment edits move; no `lanes.json` exists, so the globs are this list)
size: S+S+S+S+S (U1 to U4 and U6, 1 point each; 5 points; U5 dropped to gates-batch U2 at revision 2, the id is not reused)
labels: kind:chore · lane:docs · size:S · P3
written: 2026-09-30
head: ef630848 (`main`, the root checkout; every figure below was read here)
measured-at: ef630848, read-only, root checkout, no file edited; the counts under Measured came from `node --input-type=module -e` imports of `src/engine/type.mjs` and `src/ui/model.mjs` and from `grep -c`
depends: #725 (chroma-envelope, `plan/chroma-envelope`, running) declares `.sdlc/adapter.md` §1 and `figma/plugin/ui.html` in its lane. U6 touches the adapter (§6 only) and is ordered last (Q1); U3 and U4 regenerate `figma/plugin/ui.html`, which `git diff --name-only main...plan/chroma-envelope` lists among 23 non-`.sdlc/` paths (measured; none of the other paths above is in that list). A generated file is never hand-merged: whichever plan lands second merges `origin/main`, reruns `npm test` and commits the result (Q3)
inputs: gh issues #774, #773, #771, #770, #768 (bodies, no comments), `.sdlc/plans/gates-batch.md` (U2 owns #776 and the `type.mjs` comments), `.sdlc/adapter.md` §1 (gates, control-clone rule), §2.1 (R8 to R10), §6 (records), `.sdlc/plans/archive/docs-repair.md` (P8 at row 128, U7-4 at row 210, revisions 15 and 16), `.sdlc/handoffs/docs-repair-U7.md` (the `## Claims` ledger and `~~~sh ran` shape this plan reuses), `.sdlc/verdicts/docs-repair-prepr.md`, `test/figma/plugin.mjs` (the `libraryparity` gate), `test/figma/binder.mjs` (`DECLARED`), `package.json` scripts, plan-rules (trivial lane boundary)
---

# Five stale-doc issues and one stale engine comment, batched as one docs plan

Every unit corrects a sentence that says something the code does not do. No unit changes behaviour: U4's dead guard stays as it is (Not in scope), and no engine or UI value moves, which the ramp-identity gate proves on U4. Three units are comment or Markdown edits in the product tree, one is a Markdown-only edit in a skill, one is an adapter amendment.

## Measured at ef630848, where it changes the issue text

| # | What the issue says | What the tree says at head | Effect on the unit |
|---|---|---|---|
| M1 | #774: `figma/README.md` is only on `plan/docs-repair`, not yet on `main` | it landed in #753 (`git log -1 --format=%h -- figma/README.md` prints `ed759f6a`) | U1 edits the file on this plan's branch, no cross-branch wait |
| M2 | #774: `migrations.mjs` is imported at `figma/apply-gate.js:106` | that path does not exist; the imports are `src/ui/app.js` and `src/ui/overlays/apply-gate.js` (`grep -rln FIGMA_MIGRATIONS src figma` names both) | U1's sentence names the app as the importer, no file line |
| M3 | #774: `LIBRARY_TYPE_VOICE_MAP` parity is checked by `libraryparity` | true, and the gate lives in `test/figma/plugin.mjs` (the `JSON.stringify(LIBRARY_TYPE_VOICE_MAP)` compare under the `libraryparity` header), not in `binder.mjs` | U1 names `plugin.mjs` as the gate's home |
| M4 | #771: only the generator header carries the false wiring claim | the binder's own hand-kept header in `figma/binder/figma-semantic-binder/code.js` says `npm test / npm run build run it as gen:figma-binder-code` too, and that header is embedded in `src/ui/figma-plugin-assets.js` (by `gen:figma-assets`) and in `figma/plugin/ui.html` (by `gen:figma-ui`) | U3 fixes both headers and commits the regenerated assets |
| M5 | #770: the `only when ≥1 mode` guard is a doc drift | `typeEffectiveModes({})` and `geomEffectiveModes({})` both return length `2` (the standard Tablet and Mobile rungs), so `modes.length ? [All] : []` in `typography.js` `typeModeControl` and `geometry.js` `geomModeControl` never takes the empty branch; the comment above each is false and the guard is dead | U4 corrects the two comments only; the guard stays (Not in scope) |
| M6 | #776 comment: `type.mjs:4` and `:27` say SM/MD/LG | three lines in `type.mjs` carry it (`each a 3-step SM/MD/LG ramp`, `each voice's SM/MD/LG are literal px`, `[SM, MD, LG] literal px`), and the same fact sits at four lines of `src/ui/sections/typography.js`: `all 33 steps, 11 named voices × 3 steps each` and `every voice is now a 3-step SM/MD/LG ramp, no more XL` in `renderTypographyScene`, and `the eleven named voices` twice (once there, once in the tokens matrix above it). Measured: `makeVoices()` has 15 keys, `typeScale({})` renders 15 groups and 51 steps, `UI-control` and `UI-widget` carry 6 steps each | dropped at revision 2: gates-batch U2 owns `type.mjs`; the four `typography.js` sites are handed to it (see Dropped below) |
| M7 | comment edits are invisible to the build | `figma/plugin/ui.html` embeds the app source with its comments (`grep -c '3-step SM/MD/LG ramp' figma/plugin/ui.html` prints `4` at head); `npm test` regenerates it | U3 and U4 commit the regenerated `figma/plugin/ui.html`; the criterion is `npm test` green and `git status --porcelain` empty after |

## The record shape this plan uses (and U6 names)

Every handoff carries a `## Claims` ledger, one row per doc sentence the unit wrote or changed, columns `Claim | Needle | Anchor | Kind`, kinds `present` (a code line carries the needle), `absent` (a file is free of it) and `condition` (a probe of the deciding function, run, its output matched whole-line to the needle), the shape of `.sdlc/handoffs/docs-repair-U7.md`. Every handoff also carries its criterion commands as a `~~~sh ran` block (first line `git rev-parse --short=8 HEAD`, then the unit's own rows under a `# <id>` line each in plan order, then `# P2` with P2's two commands, then `# P6` where the unit runs it) and their verbatim output as a `~~~out ran` block, the P8 shape of `.sdlc/plans/archive/docs-repair.md`. P1, P3, P4 and P5 stay out of the block (P1 is timed and its log is quoted in the handoff's `Ran` row; P3 and P4 read the handoff itself; P5 runs in the unit worktree before merge) and are reported in the `Ran` row. A verifier or lane reviewer re-runs the block at the named head and diffs it empty.

Table escapes (docs-repair revisions 13 and 14): a `\|` in a command cell is the table's escape and is removed before the row runs; a literal pipe inside a pattern is written `[\|]`, which survives the removal. A backtick inside a command cell is written `\x60`.

Needles follow R10: a function name, an id, a count, a script name; never a line number and never a whole sentence. The positive leg of a criterion is a `condition` probe or a count; the absent leg (the stale phrase gone, measured present at the base) is what the grep proves, so no row pins the builder's new wording.

Two shell variables recur in the command cells: `F` is the runner's scratch directory (`F=$(mktemp -d)`), `HF` is the handoff under test (`HF=.sdlc/handoffs/docs-stale-batch-U<n>.md`); both are set before any row runs and exported into P4's re-run. A ledger `Anchor` is a bare repo path, never `path:line` (R10; P3's loop greps the anchor as a file, so `.sdlc/handoffs/docs-repair-U7.md`'s `path:line` anchors would read `MISS` there; that precedent is the column shape, not the anchor shape). A `present` needle is an identifier or a phrase, never a bare number (`19` in `test/figma/binder.mjs` is satisfied by any `19`; U1's count claim is U1-2's compare, and its ledger row's needle is `DECLARED`).

Command cells are bash (P4 re-runs the ran block with `bash`); a variable followed by `:` is written `${B}:` because zsh reads `$B:s` as a modifier and `git show` then receives the bare sha.

Every negative control runs in a throwaway `git clone -q --shared . "$F/neg"` made from the COMMITTED unit head, never in the unit worktree, and the control's first line of output is `git -C "$F/neg" log -1 --format=%h`, which must print the unit head (adapter §1 control rule). A base-tree control reads the plan branch's merge base instead (`git -C "$F/neg" checkout -q $(git merge-base origin/main HEAD)`).

## Criteria (plan-level; the builder runs them, the lane reviewer or verifier reruns them, pre-land runs them all)

| Id | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| P1 | `npm test` green at the unit head with no `node_modules`, tree clean after | `npm test > "$F/t.log" 2>&1; echo $?; tail -1 "$F/t.log"; git status --porcelain \| wc -l` | `0`, `✓ all 54 test files passed` (54 measured at ef630848; a unit that adds no test file keeps it), `0` | adapter §1's role-table corruption in the control clone (`"scrim` to `"scrimX` in `docs/reference/data/role-table.json`): exit 1, `engine/semantic.mjs` the failing file |
| P2 | no U+2014 and no retired brand anywhere the unit touched | `node test/repo/em-dash.mjs \| tail -1; node test/repo/branding.mjs \| tail -1` | both lines start `em-dash: clean` / `branding: clean` | one planted U+2014 in the control clone's copy of the unit's Markdown file: `em-dash.mjs` exits 1 naming the file |
| P3 | the handoff carries the P8 pair and a `## Claims` ledger with at least one row per changed sentence, every `present` needle found in its anchor, every `absent` needle absent | `awk '/^## Claims/,0' "$HF" \| grep -E '^[\|] ' \| grep -v -E '^[\|] (Claim\|---)' > "$F/claims"; wc -l < "$F/claims"; while IFS='\|' read -r _ claim needle anchor kind _; do n=$(printf '%s' "$needle" \| sed 's/^ *\x60//; s/\x60 *$//'); a=$(printf '%s' "$anchor" \| sed 's/^ *\x60//; s/\x60 *$//'); case "$kind" in *present*) grep -qF -- "$n" "$a" && echo ok \|\| echo "MISS $n";; *absent*) grep -qF -- "$n" "$a" && echo "STILL $n" \|\| echo ok;; *condition*) echo cond;; esac; done < "$F/claims" \| sort \| uniq -c; grep -c '^~~~sh ran' "$HF"; grep -c '^~~~out ran' "$HF"` | the row count the unit states, every line `ok` or `cond`, `1`, `1` | a ledger row whose needle is edited to a word not in its anchor prints `MISS`; the handoff with its `~~~sh ran` line removed prints `0` |
| P4 | the `~~~sh ran` block re-run at the unit head reproduces the `~~~out ran` block | `awk '/^~~~sh ran/{f=1;next} /^~~~$/{f=0} f' "$HF" > "$F/ran.sh"; awk '/^~~~out ran/{f=1;next} /^~~~$/{f=0} f' "$HF" > "$F/want"; F="$F" HF="$HF" bash "$F/ran.sh" > "$F/got" 2>&1; diff "$F/want" "$F/got" && echo SAME` | `SAME` | run at the merge base instead of the unit head: the first line (the sha) differs, `diff` exits 1 |
| P5 | trivial lane boundary holds for every unit that claims it | in the unit worktree before merge: `git diff --name-only $(git merge-base plan/docs-stale-batch HEAD)..HEAD` | U1, U2 and U6: every path ends in `.md`, none under `scripts/`, `githooks/`, `hooks/`; U3 and U4 do not claim the lane | a lane unit that also touched `scripts/gen-figma-binder-code.mjs` would list it; the reviewer refuses the lane and the unit is regraded with a verifier |
| P6 | ramp-identity holds on every unit that touches `src/engine/` or `src/ui/model.mjs` (U4) | `node scripts/report-preset-fidelity.mjs --identity-control --base $(git merge-base origin/main HEAD) \| tail -1` | `0 differing cells` | `--perturb` (the report's own control) reports nonzero |

## Units

- [ ] U1 (S) `figma/README.md` says what the ROLE_TABLE splice carries, how many binder gates there are, and which voice map is hand-mirrored (#774) · trivial lane · grade l1
- [x] U2 (S) `best-practices.md` says non-color scenes reset to a top-left inset (#773) · trivial lane · grade l1
- [x] U3 (S) the two generator headers name `gen:figma-assets` as the wiring point; regenerated assets committed (#771) · grade l1
- [x] U4 (S) `model.mjs` CONTROL_FONT comments and the two dead `only when ≥1 mode` comments match the deciders (#770) · grade l2
- [ ] U6 (S) `.sdlc/adapter.md` §6 names the `## Claims` ledger and the P8 ran-block pair as the doc-unit standard (#768) · trivial lane · grade l1 · after #725 or per Q1

### U1: `figma/README.md` (#774) · trivial lane · l1

Three sentences change; nothing else in the file moves. (1) The ROLE_TABLE sentence says the splice carries `semanticRoles()`'s body plus its three supporting `SCRIM_*` constants (`SCRIM_STRENGTH_STEPS`, `SCRIM_SUFFIXES`, `SCRIM_KEYS`). (2) The `npm test runs six verifiers` paragraph says `binder.mjs` declares 19 gates, of which `parity`, `floatparity` and `colorparity` prove the generated sections, and that it also imports `mode-apply-plan.mjs`. (3) The `migrations.mjs` bullet says the app (`app.js`, `apply-gate.js`) imports the maps, while the flagship `figma/plugin/code.js` keeps its own hand-mirrored `LIBRARY_TYPE_VOICE_MAP`, checked by the `libraryparity` gate in `test/figma/plugin.mjs`; the words `every executor path` go.

| Id | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| U1-1 | the SCRIM constants are named beside ROLE_TABLE | `for n in SCRIM_STRENGTH_STEPS SCRIM_SUFFIXES SCRIM_KEYS; do grep -c "$n" figma/README.md; done` | `1` `1` `1` | at the merge base all three print `0` |
| U1-2 | the gate count the README states equals the `DECLARED` length, and the fourth module is named | `R=$(grep -o -E '[0-9]+ gates' figma/README.md \| head -1 \| cut -d' ' -f1); D=$(node -e 'const s=require("fs").readFileSync("test/figma/binder.mjs","utf8");const m=s.match(/const DECLARED = \[([^\]]*)\]/);process.stdout.write(String(m[1].split(",").filter(Boolean).length))'); echo "$R $D"; [ "$R" = "$D" ] && echo SAME; grep -c 'mode-apply-plan.mjs' figma/README.md` | `19 19`, `SAME`, `2` or more | in the control clone, `sed -i '' 's/19 gates/18 gates/' figma/README.md` prints `18 19` and no `SAME`; the base prints ` 19` (no README number) and `1` for the module count |
| U1-3 | the hand-mirrored voice map and its gate are named; the overclaim is gone | `grep -c 'libraryparity' figma/README.md; grep -c 'executor path' figma/README.md; grep -c 'libraryparity' test/figma/plugin.mjs` | `1` or more, `0`, `1` or more | the base prints `0`, `1` (the phrase wraps across two README lines at the base, so the needle is `executor path`, one line) |
| U1-4 | P1, P2, P3, P4, P5 | as above | as above | as above |

Steps. (1) Edit the three sentences. (2) `npm test` (the README is not embedded anywhere, so no generated file moves; `git status --porcelain` stays empty after). (3) Handoff with the ledger: three `present` rows (`SCRIM_KEYS` in `scripts/gen-figma-binder-code.mjs`, `19` as the `DECLARED` length in `test/figma/binder.mjs`, `LIBRARY_TYPE_VOICE_MAP` in `figma/plugin/code.js`) and one `absent` row (`import` of `migrations.mjs` absent from `figma/plugin/code.js`).

### U2: `best-practices.md` (#773) · trivial lane · l1

One sentence changes: `their scenes start centered, not at the color pan` becomes a sentence saying `fit()` resets the viewport to zoom 1 and insets the scene's top-left corner via `_fitTopLeftInset`, not the color pan and not centered.

| Id | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| U2-1 | the stale phrase is gone and the decider is named | `f=.claude/skills/building-editor-sections/references/best-practices.md; grep -c 'start centered' "$f"; grep -c '_fitTopLeftInset' "$f"; grep -c '_fitTopLeftInset' src/ui/app.js` | `0`, `1`, `2` or more | the base prints `1`, `0` |
| U2-2 | the sentence's claim holds in code: `fit()` sets zoom 1 and schedules `_fitTopLeftInset` | `awk '/^  fit\(\) \{/,/^  \}/' src/ui/app.js \| grep -c -E 'zoom: 1\|_fitTopLeftInset'` | `3` (the `zoom: 1` line, the comment naming the helper, and the call) | in the control clone, rename the call inside `fit()` to `this._fitCenter()`: prints `2` |
| U2-3 | P1, P2, P3, P4, P5 | as above | as above | as above |

Steps. (1) Edit the sentence. (2) `npm test`. (3) Handoff: one `present` row (`_fitTopLeftInset` in `src/ui/app.js`) and one `condition` row (the `awk` probe of U2-2).

### U3: the generator headers name `gen:figma-assets` (#771) · l1

Two header comments say the same false thing. (1) `scripts/gen-figma-binder-code.mjs`: `Wired into npm test / npm run build via the gen:figma-binder-code script` becomes a sentence saying `npm test` and `npm run build` reach this generator as the first command of `gen:figma-assets`, and that `gen:figma-binder-code` is the standalone hand-run script. (2) `figma/binder/figma-semantic-binder/code.js` header: `npm test / npm run build run it as gen:figma-binder-code` is corrected the same way (M4). Because (2) is embedded by `gen:figma-assets` into `src/ui/figma-plugin-assets.js` and by `gen:figma-ui` into `figma/plugin/ui.html`, the unit runs `npm test` and commits both regenerated files. Not trivial lane: the unit touches `scripts/`.

| Id | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| U3-1 | neither header claims `gen:figma-binder-code` is the wiring point (the positive claim is U3-2's probe and the ledger's `condition` row) | `for f in scripts/gen-figma-binder-code.mjs figma/binder/figma-semantic-binder/code.js; do grep -c -E 'via the .?gen:figma-binder-code\|run it as gen:figma-binder-code' "$f"; done` | `0` `0` | the base prints `1` `1` (measured) |
| U3-2 | the sentence's claim holds in `package.json`: `test` and `build` call `gen:figma-assets`, whose first command is the generator, and neither calls `gen:figma-binder-code` | `node -e 'const s=require("./package.json").scripts;console.log(["test","build"].map(k=>s[k].includes("gen:figma-assets")&&!s[k].includes("gen:figma-binder-code")).join(" "), s["gen:figma-assets"].split("&&")[0].trim())'` | `true true node scripts/gen-figma-binder-code.mjs` | in the control clone, `sed` `gen:figma-assets` to `gen:figma-binder-code` in the `test` script: prints `false true ...` |
| U3-3 | the regenerated assets carry the corrected header and the tree is clean | `grep -c 'run it as gen:figma-binder-code' src/ui/figma-plugin-assets.js figma/plugin/ui.html; git status --porcelain \| wc -l` | `0` and `0` (per file), `0` | the base prints `1` or more per file; the control clone with the assets reverted to the base and `code.js` at head prints `1` per file, and `npm test` there leaves them modified (`git status --porcelain` non-empty) |
| U3-4 | idempotence: a second generator run moves no tracked file | `node scripts/gen-figma-binder-code.mjs >/dev/null && git status --porcelain -uno \| wc -l \| tr -d " "` | `0` (the `wrote ...` line is silenced; `-uno` ignores untracked files so the root checkout's stray plan files do not count) | in the control clone, insert a stale line above `// === GENERATED:FLOAT_EXECUTOR END ===` in `figma/binder/figma-semantic-binder/code.js` and `git commit -qam plant`; the same command then prints `1` (the run rewrites the section; dry-run at ef630848) |
| U3-5 | P1, P2, P3, P4 | as above | as above | as above |

Steps. (1) Edit both headers. (2) `npm test`; `git add` the regenerated `src/ui/figma-plugin-assets.js` and `figma/plugin/ui.html`. (3) Handoff: `condition` row for U3-2, `present` rows for `gen:figma-assets` in each header.

### U4: `model.mjs` CONTROL_FONT and the dead `only when ≥1 mode` comments (#770) · l2

Four comments change, no code. (1) `src/ui/model.mjs` above `geometryScale`: `XS/XL/2XL fall back to the engine's fixed CONTROL_FONT ramp` becomes a sentence saying the UI-control voice composes at every step of the XS..2XL ramp and `CONTROL_FONT` is the fallback for whichever step the voice lacks (and for the no-opts form), per `geomScale`. (2) The same above `geomScaleFor`. (3) `src/ui/sections/typography.js` `typeModeControl`, the `Meaningless with only the base, so only when ≥1 mode` comment above the `compare` item: says `_typeEffectiveModes()` returns the standard Tablet and Mobile rungs when the document has no modes, so the guard never takes its empty branch and All is always offered; the guard itself stays. (4) The same in `src/ui/sections/geometry.js` `geomModeControl`. Grade l2 because the builder must read `geomScale` in `src/engine/geometry.mjs` and both deciders to write the sentences, not copy the issue.

| Id | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| U4-1 | the XS/XL/2XL trio claim is gone from `model.mjs` (the fallback rule is U4-2's probe and a `condition` row) | `grep -c 'XS/XL/2XL fall back' src/ui/model.mjs` | `0` | the base prints `2` (measured) |
| U4-2 | the composition claim holds in the engine: UI-control composes at every one of its six steps, and the no-opts form falls back to CONTROL_FONT | `node --input-type=module -e 'import {geomScale} from "./src/engine/geometry.mjs"; import {typeScale} from "./src/engine/type.mjs"; const t=typeScale({bodyBase:18}); const uc=t.categories["UI-control"]; const g=geomScale({},{typeScale:t}); const g0=geomScale({}); const steps=Object.keys(g.sizes).filter(k=>uc[k]); console.log(steps.length, steps.every(k=>g.sizes[k].font===uc[k].size), steps.every(k=>g0.sizes[k].font===uc[k].size))'` | `6 true false` (measured at head: composed fonts 14 15 18 20 22 24, the fallback 12 13 15 16 18 20) | in the control clone, `sed -i '' 's/const uiSteps = opts.typeScale \&\&/const uiSteps = false \&\&/' src/engine/geometry.mjs` (a `geomScale` that ignores the voice): the probe prints `6 false false` (dry-run at ef630848). The probe reads at `bodyBase` 18 because at the default 16 the fallback equals the voice at every step by design (`6 true true`, vacuous) |
| U4-3 | the `only when ≥1 mode` comments are gone and each replacement names its decider by identifier | `for f in src/ui/sections/typography.js src/ui/sections/geometry.js; do grep -c 'only when ≥1 mode' "$f"; done; grep -c '_typeEffectiveModes' src/ui/sections/typography.js; grep -c '_geomEffectiveModes' src/ui/sections/geometry.js` | `0` `0`, then `8` or more twice (the base's 7 mentions plus at least one in the new comment; `grep -c` counts lines) | the base prints `1` `1` `7` `7` (measured) |
| U4-4 | the comments' claim holds: both deciders return 2 rungs on a document with no modes | `node --input-type=module -e 'import {typeEffectiveModes as t, geomEffectiveModes as g} from "./src/ui/model.mjs"; console.log(t({}).length, g({}).length, t({type:{modes:[]}}).length)'` | `2 2 2` | a probe with one materialized mode, `t({type:{modes:[{id:"x"}]}}).length`, prints `1` (the function returns the doc's own list, so the reading is not a constant) |
| U4-5 | the guard is untouched (no behaviour change): the files are identical to the base once `//` comments are stripped and whitespace-only lines dropped, so a rewrapped comment is free and a code edit is not | `B=$(git merge-base origin/main HEAD); for f in src/ui/model.mjs src/ui/sections/typography.js src/ui/sections/geometry.js; do diff <(git show "${B}:$f" \| sed 's#//.*$##' \| grep -v '^[[:space:]]*$') <(sed 's#//.*$##' "$f" \| grep -v '^[[:space:]]*$') \| wc -l \| tr -d " "; done` | `0` `0` `0` (dry-run at head: deleting the `Compare = all breakpoints` comment line in `geometry.js` still reads `0`) | in the control clone, `sed -i '' 's/modes.length ?/modes.length >= 1 ?/' src/ui/sections/geometry.js`: the third value reads `4` (dry-run); a trailing-comment line such as `const modes = ...; // ...` is a code line, which is why the filter strips comments rather than skipping `//`-led lines |
| U4-6 | P1, P2, P3, P4, P6 (the regenerated `figma/plugin/ui.html` committed) | as above | as above | as above |

Steps. (1) Read `geomScale` in `src/engine/geometry.mjs` and both deciders. (2) Edit the four comments. (3) `npm test`, commit `figma/plugin/ui.html`. (4) P6. (5) Handoff: `condition` rows for U4-2 and U4-4, `absent` rows for the two stale phrases.

### U6: `.sdlc/adapter.md` §6 names the Claims ledger and the P8 ran-block pair (#768) · trivial lane · l1 · after #725 or per Q1

One dated amendment paragraph under `## 6. Records`, in the shape of the three amendments already there (`**Amendment (2026-09-30, #768).**`): a doc-shaped unit's handoff carries a `## Claims` ledger (`Claim | Needle | Anchor | Kind`, kinds `present`, `absent`, `condition`; anchors bare paths; needles per R10) and a `~~~sh ran` / `~~~out ran` pair whose first line is `git rev-parse --short=8 HEAD`, re-run at the named head and diffed empty. The paragraph describes the shape in full (the #768 `generalized description` option) and cites `.sdlc/plans/archive/docs-repair.md` P8 and U7-4 as where it was proved; it does not cite this plan, whose path moves to `plans/archive/` at close. Nothing else in the file moves. Trivial lane: one `.md` file, nothing under `scripts/`, and R8's light process for a `.sdlc/`-only change (one builder, one reviewer, no verifier) is the same dispatch.

| Id | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| U6-1 | §6 gained one amendment paragraph that names both record shapes | `awk '/^## 6\. Records/,/^## 7\./' .sdlc/adapter.md \| grep -c '^\*\*Amendment ('; awk '/^## 6\. Records/,/^## 7\./' .sdlc/adapter.md \| grep -c '## Claims'; awk '/^## 6\. Records/,/^## 7\./' .sdlc/adapter.md \| grep -c '~~~sh ran'; awk '/^## 6\. Records/,/^## 7\./' .sdlc/adapter.md \| grep -c '#768'` | `4`, `1` or more, `1` or more, `1` or more | the base prints `3` `0` `0` `0` (measured); a paragraph naming only the ledger prints `0` on the third |
| U6-2 | the amendment cites the archived plan and the P8 row exists there | `grep -c 'plans/archive/docs-repair.md' .sdlc/adapter.md; ls .sdlc/plans/archive/docs-repair.md; grep -c '^[\|] P8 ' .sdlc/plans/archive/docs-repair.md` | `1` or more, the path, `1` (measured) | a citation of `.sdlc/plans/docs-repair.md` (the pre-archive path) prints `0` on the first grep, and `ls` of that path fails; the base prints `0` on the first |
| U6-3 | nothing outside §6 moved (the #725 §1 amendment, if landed, is inherited, not edited) | `B=$(git merge-base origin/main HEAD); diff <(git show "${B}:.sdlc/adapter.md" \| awk '/^## 6\. Records/{s=1} /^## 7\./{s=0} !s') <(awk '/^## 6\. Records/{s=1} /^## 7\./{s=0} !s' .sdlc/adapter.md) \| wc -l \| tr -d " "` | `0` (the awk is a flag toggled on at `## 6. Records` and off at `## 7.`, printing only the lines outside; dry-run: a copy with one amendment paragraph added inside §6 reads `0`, the base reads `0`) | in the control clone, `sed -i '' 's/^## 1\./## 1x./' .sdlc/adapter.md` (one edit outside §6): reads `4` (dry-run) |
| U6-4 | the unit's handoff ledger carries the amendment's own row, `present`, needle `## Claims`, anchor the bare path `.sdlc/adapter.md` | `awk -F'[\|]' '/^## Claims/{f=1} f && $3 ~ /## Claims/ && $4 ~ /\.sdlc\/adapter\.md/ && $4 !~ /adapter\.md:[0-9]/ {c++} END{print c+0}' "$HF"` | `1` (dry-run on a fixture ledger with that row: `1`; the awk splits on the literal pipe, so no `-F`/`\x60` question arises) | on a copy of the handoff with the anchor edited to `.sdlc/adapter.md:200` the same command reads `0` (dry-run); a ledger with no `## Claims` row reads `0` |
| U6-5 | P1, P2, P3, P4, P5 | as above | as above | as above |

Steps. (1) Merge `origin/main` into the unit branch first (Q1). (2) Write the paragraph. (3) P2, P5. (4) Handoff with the ledger row of U6-4 and the ran block.

### Dropped: the #776 ramp comments belong to gates-batch U2

`.sdlc/plans/gates-batch.md` U2 (#776) owns the three `src/engine/type.mjs` comment sites (its P9 and U2-9: `each a 3-step SM/MD/LG ramp`, `each voice's SM/MD/LG are literal px`, `[SM, MD, LG] literal px`), so this plan does not touch `type.mjs`. Four sites gates-batch U2 does not list carry the same stale fact in `src/ui/sections/typography.js`: `all 33 steps, 11 named voices × 3 steps each` and `every voice is now a 3-step SM/MD/LG ramp, no more XL` in `renderTypographyScene`, and `the eleven named voices` twice (once there, once in the tokens matrix above it). Measured at ef630848: `makeVoices()` has 15 keys, `typeScale({})` renders 15 groups and 51 steps, `UI-control` and `UI-widget` carry 6 steps each; `grep -c -E 'every voice is now a 3-step\|11 named voices\|the eleven named voices\|all 33 steps' src/ui/sections/typography.js` prints `4`. They are handed to gates-batch U2 as discovered scope (the team lead dedupes; that plan's Revisions row records the widening), and this plan's U4 builder, who edits the same file, leaves them alone and names them in the handoff's Decisions.

## Not in scope

- #776 and its `type.mjs` comment: gates-batch U2 (`.sdlc/plans/gates-batch.md`), which also receives the four `typography.js` sites named under Dropped.
- #775 (bare-filename citations).
- The dead `modes.length ?` guard in `typeModeControl` and `geomModeControl` (M5): removing it is a behaviour change with a UI reading; if the owner wants it gone it is a `/file-task` item, not this plan.
- `src/engine/tonal.js`, the chroma-envelope lane, `.sdlc/adapter.md` §1 and `.sdlc/baseline.md` (#725's).
- Any sentence the issues do not name and M4 did not find; a builder who finds another stale comment in a file the unit touches reports it in the handoff's Decisions and leaves it.
- `README.md`, `docs/reference/`, `docs/lld/` (docs-repair landed those).

## Risks

| Risk | Mitigation |
|---|---|
| U3 and U4 each regenerate `figma/plugin/ui.html`, so two units merged out of order conflict on a generated file | merge in unit order (U3, U4); on a conflict in `figma/plugin/ui.html` or `src/ui/figma-plugin-assets.js`, take either side and rerun `npm test`, never hand-merge |
| #725 lands with its own §1 amendment to `.sdlc/adapter.md` while U6 is open | U6 starts after Q1 and merges `origin/main` first; U6-3 proves only the §6 amendment is this unit's |
| #725 and this plan both regenerate `figma/plugin/ui.html` (it is in `plan/chroma-envelope`'s diff against `main`) | whichever plan lands second merges `origin/main`, takes either side of the generated file, reruns `npm test` and commits what it writes; pre-land's P1 (tree clean after `npm test`) is the proof |
| a lane reviewer passes a wrong sentence (a prompt is behaviour) | every unit's ledger has a `condition` row that runs the decider; P4 makes the reviewer re-run it |
| the U4-2 probe reads `6 true true` at the default body size and proves nothing about the fallback | the row runs at `bodyBase` 18, where the composed and fallback fonts differ at every step (measured) |

## Landing

One PR from `plan/docs-stale-batch` to `main`, title `docs(stale): five stale-doc issues`, body `Closes #774`, `Closes #773`, `Closes #771`, `Closes #770`, `Closes #768` (and the plan's own ticket from Q0). Draft PR at the first passed unit. Pre-land per adapter §2.1 (the pair is kept, lane units included): P1 to P6 at the branch head, every `sh .sdlc/checks/*.sh`, `npm run build` (needs `npm ci`), `npm run smoke` (U4 touches `src/ui/`), record at `.sdlc/verdicts/docs-stale-batch-prepr.md`. Lane units (U1, U2, U6) close on `.sdlc/reviews/docs-stale-batch-U<n>-review.md` first line `PASS`, no verdict section; U3 and U4 get a reviewer and a verifier and close on `.sdlc/verdicts/docs-stale-batch-U<n>.md`.

## Open questions for the owner

| Id | Question | Recommendation |
|---|---|---|
| Q0 | mint the plan ticket at activation | yes, `kind:chore`, `lane:docs`, `size:S`, P3 |
| Q1 | U6 edits `.sdlc/adapter.md`, a file in #725's declared lane. Land U6 here after #725 lands, or ride the amendment on the chroma-envelope PR per R9 | land here after #725: R9 is about review findings on `.sdlc/` files, and #768 is a filed chore with its own done-when; U6 is ordered last either way |
| Q2 | the four `typography.js` sites (M6) sit outside gates-batch U2's listed scope | handed to gates-batch U2 by the team lead; this plan edits none of them |
| Q3 | `figma/plugin/ui.html` is regenerated by both #725 and U3 to U4 (M7, depends) | no wait: the file is generated, the second lander reruns `npm test` after merging `origin/main` (Risks); only `.sdlc/adapter.md` (Q1) needs an order |

## Revisions

| Date | Change | Why |
|---|---|---|
| 2026-09-30 | revision 1, the plan as written at ef630848, status draft | the team lead's ask: one plan for #774, #773, #771, #770, #768 plus the #776 `type.mjs` comment |
| 2026-09-30 | revision 4: U6-3 gets a true awk complement of §6, U6-4 becomes a pipe-split awk over the ledger with its own control, U6-1 greps the two shapes separately, U4-5 drops whitespace-only lines so a rewrapped comment is free; cells write `${B}:` | `.sdlc/verdicts/docs-stale-batch-checkability.md` pass 2 🔴, findings 1 to 3 |
| 2026-09-30 | revision 3: U6 section and criteria restored (lost in the revision 2 splice), P3 carries the `F`/`HF` definitions and the bare-path anchor rule, U3-4 and U4-2 gain reddening controls | `.sdlc/verdicts/docs-stale-batch-checkability.md` 🔴 on U6, 🟡 on P3, U3-4, U4-2 |
| 2026-09-30 | revision 2: U5 dropped, its `type.mjs` scope is gates-batch U2's, the four `typography.js` sites recorded under Dropped for that unit | team lead dedupe: #776 is owned by `.sdlc/plans/gates-batch.md` U2 |
