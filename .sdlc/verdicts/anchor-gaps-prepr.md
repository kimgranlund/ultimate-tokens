---
kind: verdict
plan: anchor-gaps
seat: verifier
pass: 2
ticket: "#740, #744"
written: 2026-09-29
---

# Pre-PR · anchor-gaps · pass 1 · 🔴 at `9f5a4bac`: every plan and unit row holds, but the backfill re-anchors a shipped preset opened from the gallery, and CI's mode-isolation sweep is red on U2's corpus change

Closes #740, #744

verdict: 🔴
sha: 9f5a4bac1e7cec001de27c70589d9fec4ea81e42
version: n/a (a plan landing, no release)

`plan/anchor-gaps` at `9f5a4bac` (PR #762, draft), a plan-file commit on merge `6f3691b0` (main `7006405c` into the U2 merge `3469b985`). `$B` = `7006405c`; main has since moved by `.sdlc/` records only. Checkers in fresh context under R72 (owner: continue to landing, fixes only from pre-land findings): verifier-l2 for the gates, unit rows, smoke and CI, and reviewer-l3 for the whole plan diff (FAIL), standing in for verifier-l3 and reviewer-l4 while fable is capped. The seat reproduced both reds itself.

### Red

| id | criterion | state | evidence | negative control |
|---|---|---|---|---|
| RE | the backfill reaches only pre-v5 stored kits, as the plan, Q2 and the CHANGELOG say | 🔴 | seat probe, every corpus preset through `hydrateStoredDoc` versus `hydrate`: `presets 343 stamped 1`, `brands \| Maison · The product's own design system \| Success \| #21701A \| 24/25`. `src/ui/app.js:2371` `openConfigAsSet` calls `hydrateStoredDoc`, reached from the gallery (`:806`), project restore (`:2358`), "Open saved palette" (`:1192`) and Figma variables (`:1227`); a curated preset has no `schemaVersion`, so it reads as pre-v5 | the same probe with `$B`'s `app-helpers.mjs` prints `presets 343 stamped 0` |
| CI | required jobs green on the head | 🔴 | `gh pr view 762` (seat read) headRefOid `9f5a4bac1e7cec001de27c70589d9fec4ea81e42`: `sweeps (gate:mode-isolation) FAILURE`, every other required job `SUCCESS`; locally `FAIL  mode-isolation: perceptual 990c17c5ae140e6e peak b59bd41501cd829a do not match fixture`, exit 1 | head with only `brands.js` reverted to `$B`: `pass`, exit 0; the plan head before the U2 merge (`55021569`) had CI `success` |

### Yellow

| id | criterion | state | evidence | negative control |
|---|---|---|---|---|
| CL | the CHANGELOG is true and dated at landing | 🟡 | #740 says the backfill runs `on load from the stored set list`, false while RE holds; the block heading is `### 2026-09-26`, the file groups by the day an entry lands on `main` | the #744 entry reads true against U2-1 (`36 36 #FFFFFF [1,0,0]`) |
| M37 | the plan's seam census | 🟡 | `.sdlc/plans/anchor-gaps.md:37` says `app.js` calls the seam for the stored set list (`rec.doc`, twice) and the Figma config round-trip; `grep -n 'hydrateStoredDoc\|openConfigAsSet' src/ui/app.js` shows the gallery, project restore and Figma variables callers too | the stored-set callers `:205` and `:682` it does name print |
| CK | every `sh .sdlc/checks/*.sh` | 🟡 | `card-source-range` exit 1 `range mismatches: 3`; the other four exit 0 (`stale total: 0`, `stale total: 0`, `bad 0`, `bad 0`) | `0` at `33bd8920^`, `3` at `33bd8920` (#701's squash) and at `$B`: inherited, outside the wall |

### Green

| id | criterion | state | evidence | negative control |
|---|---|---|---|---|
| MG | both merges are exact; the last commit is `.sdlc/` only | 🟢 | `3469b985` and `6f3691b0` trees equal `git merge-tree --write-tree` of their parents; `6f3691b0..9f5a4bac` is `.sdlc/plans/anchor-gaps.md` only | first parent paired with the wrong second parent: `ab388e86`, `eed98a9b` |
| P1 | `npm test` green, no node_modules, N 54, tree clean | 🟢 | `✓ all 54 test files passed`, `54`, `0` | `"scrimX`: `✗ 1/54 test file(s) failed`, exit 1 |
| P2 | build green, tree clean, KB agrees | 🟢 | `wrote figma/plugin/ui.html 4133.1 KB`, exit 0, `0`, `ok    ui.html: baseline 4133.1 KB, tree 4133.1 KB` | `backfillDefaultAnchors` brace removed: vite `Failed to parse code in '.../src/ui/app-helpers.mjs'`, exit 1 |
| SM | `npm run smoke` in real Chrome | 🟢 | `SMOKE PASS, gallery · category · editor · export dialog all render in a real browser`, exit 0 | the P2 control breaks the build smoke runs first |
| P3 | branding and em-dash clean | 🟢 | `branding: clean (925 files scanned)`, `0`, `0`, `em-dash: clean (933 files scanned)` | ADR copy: `FAIL: 3 branding violation(s)`; a glyph line: `FAIL: 1 em dashes` |
| P4 | scope wall | 🟢 | `0`, `1 1`, `0`, `0` | six-name fixture `3`; second `model.mjs` line `2 2`; FLOORS fixture `1` |
| U1 | U1-1 to U1-6 | 🟢 | `1 1 1 true`; persist gate `PASS`, `15`, `1`; `0 of 16 16`; `cam16 16 15 false`; `1`, `39 2`; `oklch false 15 cam16 false 15` | at `$B` `a.backfillDefaultAnchors is not a function`; `return stored;` gives `(a) ... got 16 of 16`; name-only equality gives `(b) ... got 16`; both-tables lookup gives `(f) cross-form ... got 16` |
| U2 | U2-1 to U2-5 | 🟢 | `36 36 #FFFFFF [1,0,0]`; `6 1 0 1`; `25 27.28 86.00 2 2.77 500:#F1F1F1 650:#B8988F 900:#3A211A`; tonal and anchor FULL `PASS`, greps `1 4 0 4`; `1`, `ok` | at `$B` `0 36`, `33.21 98.38`; hue-0 keys back: `2 of the 24 cited baseline duplicates were not observed` |
| U2R | generator reach and re-freeze (reviewer) | 🟢 | one chroma-`0` sample in the corpus (Nike `1.000 0 0`); `gen:categories` regenerates byte-stable; 22 keys, `3 8 11` | the base generator swapped in regenerates `brands.js` equal to `$B`'s |
| PR | title and body match Landing | 🟢 | title `fix(color): pre-v5 kits regain default anchors on load; hueless samples take the entry's neutral hue (#740, #744)`, `Closes #740`, `Closes #744` | a Q5 cut to #740 alone would differ |

### Findings

1. 🔴 RE: `openConfigAsSet` routes the preset gallery, project restore, "Open saved palette" and Figma variables through `hydrateStoredDoc`, so the backfill treats every schema-less config as a pre-v5 stored kit. Today that re-anchors Maison's Success palette to `#21701A` (24 of 25 stops) when opened from the gallery, while its tile and every corpus gate render it parametric. No row sees it: the stored-anchors gate never feeds a preset through the seam. The next pass needs the ruled reach stated in the plan, the code held to it, and a gate that feeds every corpus preset through the gallery path with Maison as its control. The Figma-variables path (a recovered `Secondary` at exactly the default numbers) falls under the same ruling.
2. 🔴 CI: `test/engine/fixtures/mode-isolation.json` fingerprints the rendered corpus, and U2's `brands.js` moves it. The fixture's `owner` field says a plan that edits a curated corpus document re-captures it in its own change. That rule arrived with #701 (`33bd8920`) after this plan was written, so the scope wall and P4 do not admit the fixture: a plan gap, not a builder error. The next pass needs the fixture in the wall and a row that re-captures it, with the revert of `brands.js` as the control.
3. 🟡 CL and M37 follow RE: the CHANGELOG's "from the stored set list" and the plan's `:37` census must match whatever reach the fix rules. Re-date the CHANGELOG block at landing.
4. 🟡 CK: `card-source-range-check` exits 1 on main as well (from #701); record it, it is not this plan's.
5. Notes: `test/engine/tonal.mjs`'s #744 comment cites "U1-4" for #739's plan row (name `achromatic-anchor` U1-4); the (C6 ii) comment still says the list is "currently empty"; U1-6's control shows only (f) because the gate keeps one message per name.
6. Pass 2 needs RE and CI fixed under a plan revision, then P1, P2, P4, smoke, U1-2 and U2-4 re-run on the new head and CI green.

## Pass 2 · 🔴 at `1d03eca5`: both pass 1 reds are fixed in the tree, but the #740 CHANGELOG entry says a pre-#681 preset palette stays parametric and a stored one does not, and CI never ran on the head

verdict: 🔴
sha: 1d03eca5fd946f0c65ef0262bbf6546c4e87af5b
version: n/a (a plan landing, no release)

`plan/anchor-gaps` at `1d03eca5` (PR #762, draft): U3 (merge `00d7bbb7`, gallery seam split onto `hydrateConfig`, mode-isolation fixture re-captured) plus a plan-file commit. `$B` = `5cdf9ed1`; `git diff --name-only $B origin/main -- . ':!.sdlc'` is empty. Checkers in fresh context: verifier-l2 for the gates, unit rows, build, smoke and CI (three fresh clones), reviewer-l3 for the whole diff (FAIL, one false shipped sentence), standing in for verifier-l3 and reviewer-l4 while fable is capped (b9044bb). The seat re-derived the red CL row itself.

### Red

| id | criterion | state | evidence | negative control |
|---|---|---|---|---|
| CL | the CHANGELOG is true at landing | 🔴 | the #740 entry (`CHANGELOG.md:26` to `:28` on the branch) says `a user-built or pre-#681 preset palette ... has no matching row there and stays parametric, unchanged`; plan `.sdlc/plans/anchor-gaps.md:114` asks for that sentence. Seat probe at the head: Maison from `git show 7d20c42d:src/ui/categories/brands.js` (an ancestor of #681's commit `b97d51fd`), stored as `schemaVersion: 4` and read through `hydrateStoredDoc`, the stored set list's seam: `v4 Success "#21701A" oklch` | the same doc stamped `schemaVersion: 6`: `v6 Success null oklch`, so the probe reads the backfill, not a baked anchor. U3-2/(j) intends this stamping (Q1's ruling on a stored kit); the sentence, not the code, is wrong |
| CI | required jobs green on the head | 🔴 | 26 polls, 21:03 to 21:29 UTC, and the seat's re-read: `gh pr view 762` headRefOid `1d03eca5fd946f0c65ef0262bbf6546c4e87af5b`, `mergeable UNKNOWN`, `statusCheckRollup` length `0`; no run exists for `17c80034`, `00d7bbb7` or `1d03eca5`; the newest run on the branch is `d017bbc9` (pre-U3) with `sweeps (gate:mode-isolation) failure` | that `d017bbc9` run reports a real failure, so the read separates a job that ran from one that never did |

### Yellow

| id | criterion | state | evidence | negative control |
|---|---|---|---|---|
| MG | every merge equals `git merge-tree --write-tree p1 p2` | 🟡 | `00d7bbb7` tree `2f36aed7` equals its merge-tree, exit `0`; `856b59ce` (`9f5a4bac` + `5cdf9ed1`) merge-tree exit `1`, `CONFLICT (content): Merge conflict in .sdlc/baseline.md`, the commit's tree differs in that file only (hand resolution to `4139.8 KB` plus a correction paragraph); its message does not name the conflict | wrong-parent pairs give `d86ac8ef` and `89e66ac8`, neither tree |
| DT | the CHANGELOG block is dated the landing day | 🟡 | `### 2026-09-26` under `## [Unreleased]`; the plan leaves the re-date to the landing commit | the file's other blocks carry their landing dates |
| CK | every `sh .sdlc/checks/*.sh` | 🟡 | four exit 0 (`stale total: 0`, `stale total: 0`, `bad 0`, `bad 0`); `card-source-range` `range mismatches: 3`, exit 1 | `0` at `33bd8920^`, `3` at `33bd8920`, at `$B` and at the head: inherited from #701 |
| RC | records at the head | 🟡 | U3 handoff `:75` still quotes `baseline 4141.0 KB` (head reads `4141.3`); U1-5's `A` reads `56 2` at the head and no handoff states `56` as one figure | the Pass 2 bundle row and `.sdlc/baseline.md` both carry `4141.3`, so the stale line is the only mismatch |

### Green

| id | criterion | state | evidence | negative control |
|---|---|---|---|---|
| RE | pass 1 red: no corpus preset re-anchored through the gallery seam | 🟢 | `presets 343 stamped 0 differ 0 maison #21701A` (verifier and seat) | `export const hydrateConfig = hydrateStoredDoc;`: `presets 343 stamped 1 differ 1 maison #21701A` |
| CIL | pass 1 red, locally: mode-isolation passes on the head | 🟢 | `pass  mode-isolation: perceptual 990c17c5ae140e6e peak b59bd41501cd829a match fixture (captured at 81ac5521...)`, exit 0 | `brands.js` at `$B`: `perceptual 34e544942d500b9e peak f560f784d8a4883a do not match fixture`, exit 1; fixture at `$B`: `(captured at 282fca8d...)` red, exit 1 |
| MG2 | `00d7bbb7..1d03eca5` is `.sdlc/` only | 🟢 | `.sdlc/plans/anchor-gaps.md \| 7 ++++---`, `1 file changed` | `git diff --stat $B 1d03eca5` names 11 paths outside `.sdlc/` |
| P1 | `npm test`, no node_modules, N 54, tree clean | 🟢 | `✓ all 54 test files passed`, exit 0, `54`, `0` | `"scrimX`: `✗ 1/54 test file(s) failed`, exit 1 |
| P2 | build green, tree clean, KB agrees | 🟢 | `wrote figma/plugin/ui.html 4141.3 KB`, exit 0, `0`, `ok    ui.html: baseline 4141.3 KB, tree 4141.3 KB` | `backfillDefaultAnchors` brace removed: vite `Expected \`}\` but found \`EOF\``, exit 1 |
| SM | `npm run smoke` in real Chrome | 🟢 | `SMOKE PASS, gallery · category · editor · export dialog all render in a real browser`, exit 0 | the P2 control: `smoke exit 1`, `✗ Build failed in 42ms` |
| P3 | branding and em-dash clean | 🟢 | `branding: clean (973 files scanned)`, `0`, `0`, `em-dash: clean (981 files scanned)` | ADR copy: `FAIL: 3 branding violation(s)`; a glyph line: `FAIL: 1 em dashes` |
| P4 | scope wall and bounded hunks | 🟢 | `0`, `1 1`, `0`, `0`, `3`, `0` | seven-name fixture `3`; `2 2`; FLOORS `1`; fifth `4`; sixth `2` |
| U1 | U1-1 to U1-6 | 🟢 | `1 1 1 true`; persist `PASS`, `15`, `1`; `0 of 16 16`; `cam16 16 15 false`; `2`, `56 2`; `oklch false 15 cam16 false 15` | at `$B` `a.backfillDefaultAnchors is not a function`; `return stored;` gives `(a) ... got 16 of 16`; `ensureAppTheme` rewrite `59 5`; both-tables lookup `(f) ... got 16` |
| U2 | U2-1 to U2-5 | 🟢 | `36 36 #FFFFFF [1,0,0]`; `6 1 0 1`; `25 27.28 86.00 2 2.77 ...`; tonal and anchor FULL `PASS`; `1`, `ok ... 4141.3 KB` | at `$B` `0 36`, `33.21 98.38`; hue-0 keys back: `2 of the 24 cited baseline duplicates were not observed` |
| U3 | U3-1 to U3-6 | 🟢 | `1 1 0 2 1`; `stamped 0 differ 0 maison #21701A`; `0 9`; `exit 0 3 15 1 8`; fixture `pass`; `1 0 2 1 1` | `openConfigAsSet` on `hydrateStoredDoc`: `FAIL  gallery-reach, (k)`; alias `9 9`; `>= 7`: `stored-anchors, (c)` and `gallery-reach, (k)` red |
| M37 | the plan's seam census | 🟢 | `:37` (dated `7d325b32`) lists `rec.doc` twice plus `openConfigAsSet`'s four callers, true at that sha; the head state is U3-1's split | pass 1 read the census incomplete, so the row does separate |
| PR | title and body match Landing | 🟢 | title `fix(color): pre-v5 kits regain default anchors on load; hueless samples take the entry's neutral hue (#740, #744)`, `Closes #740`, `Closes #744` | a Q5 cut to #740 alone would differ |

### Findings

1. 🔴 CL: the code does what Q1 and U3-2/(j) rule (a stored pre-v5 kit whose palette equals a default row is backfilled), and that includes a stored pre-#681 Maison, whose Success row `142 55 -20 -5` equals the OKLCH default Success. The #740 sentence and plan `:114` promise every pre-#681 preset palette stays parametric. The shipped sentence must match the rule; plan `:114` moves with it. A CHANGELOG edit is not record-only, so it makes a new head and needs pass 3.
2. 🔴 CI: no workflow run exists for the head. The new head from finding 1 needs a CI run with every required job green; the local mode-isolation `pass` says the pass 1 cause is fixed in the tree.
3. 🟡 DT: re-date the block to the landing day in the landing commit, as the plan says.
4. 🟡 MG, CK, RC: the `856b59ce` hand resolution is `.sdlc/` bookkeeping and the figure now agrees; CK is #701's; the U3 handoff line and the U1-5 figure are stale records.
5. Pass 3 needs the CL sentence and plan `:114` corrected, then P3, the em-dash gate and CI green on the new head; the tree-level rows here carry if `git diff 1d03eca5 <new head>` touches only `CHANGELOG.md` and `.sdlc/`.
