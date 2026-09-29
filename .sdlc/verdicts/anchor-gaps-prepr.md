---
kind: verdict
plan: anchor-gaps
seat: verifier
pass: 1
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
