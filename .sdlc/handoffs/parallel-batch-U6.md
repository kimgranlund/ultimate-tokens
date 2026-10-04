# U6 handoff · parallel-batch (#787 UI) · builder to orchestrator

| Field | Value |
|---|---|
| Unit | U6, branch `unit/pb-U6` from `plan/parallel-batch` @ 6537465d |
| Status | 🟢 C6.1 to C6.5 met, each with a red control; 🟡 one scope exception (docs citation repair, see Findings) |
| Gates | `npm test` 🟢 (55 files, `TESTS` 55, tree stable at the 10 files below) · `npm run build` 🟢 exit 0 · `npm run smoke` 🟢 `SMOKE PASS` · `em-dash` clean · `branding` clean · `citations` STALE 0 |

## What changed

| File | Change |
|---|---|
| `src/ui/sections/color.js` | `firstNameCollision(cand, skip)` (the one predicate call, `nameCollisions([cand, other])` per other palette) and `freePaletteName(proto, nameAt)`; the Name field `onchange` reverts a colliding name to the committed one and sets `nameRefusal`; `oninput` stays live and clears a stale note; one `.name-collision-badge` after the field; `addPalette`, `duplicatePalette` and `createNewPalette` pick their default name through `freePaletteName` |
| `scripts/bundle.mjs` | one MODS entry (`names`, after `dsExport`, which `names.mjs` imports with exports/type/geometry) and one KEY entry |
| `src/ui/styles.css` | `.name-collision-badge`; the "21-step" comment at the typography specimen (see below) |
| `test/ui/headless-boot.mjs` | group `(nm)` placed before `(n)`: nm1 to nm4 |
| `figma/plugin/ui.html` | regenerated bundle |
| `docs/lld/app-shell.md`, `docs/reference/references/component-inventory.md`, `docs/reference/reviews/2026-08-20-reactivity/{00,01,02}*.md` | `color.js:N` citations renumbered (outside the lane, see Findings) |

## Criteria

| # | Command | Result | Negative control (scratch clone, `/Users/kimba/.claude/jobs/8c58a81c/tmp/pb-U6/`) |
|---|---|---|---|
| C6.1 | `(nm1)` via `node test/ui/headless-boot.mjs` (inside `npm test`) | rename of palette 1 to `azur-hover` (palette 0 slug `azur`) via `change`: name stays `Primary`, exactly one badge naming palette 0 and `azur-hover`, rebuilt input shows `Primary` | guard `if (hit)` made `if (false)`: exit 1, `(nm1) colliding rename reverts to "Primary" (got "azur-hover")`, `(nm1) exactly one .name-collision-badge ... (got 0)`, `(nm1) the rebuilt name input shows the reverted value` |
| C6.2 | `(nm2)` | `input` events for `azur-hov` one char at a time: after every event `doc.palettes[1].name` equals the typed text (includes `azur`, which equals palette 0's own name); no badge; `change` commits a clean name | the same guard call at the top of `oninput`: exit 1, `(nm2) every intermediate value sticks, "azur" (got "azu")` and `"azur-"` |
| C6.3 | `(nm3)` | with palette 1 named `Palette N-hover`, palette 0 `Primary`, palette 2 `Primary copy-hover`: `addPalette()` does not return `Palette N`, `duplicatePalette(0)` does not return `Primary copy`, and `firstNameCollision` on each new palette is null | `freePaletteName` returning `nameAt(0)`: exit 1, `(nm3) addPalette skips the colliding "Palette 18" (got "Palette 18")` and the duplicate line (got "Primary copy") |
| C6.4 | `(nm4)` | rename to `azur-primer` sticks, no badge | a prefix test (`slug starts with other slug + "-"`) added to the rename guard: exit 1, `(nm2) a clean name commits (got "Primary", 1 badges)`, `(nm4) "azur-primer" sticks with no badge (got "Primary", 1 badges)` |
| C6.5 | `grep -n names scripts/bundle.mjs`; `npm test`; `npm run build; echo $?`; `npm run smoke`; C4 | one MODS line (33) and one KEY entry (60); `npm test` all 55 passed; build `exit=0`; `SMOKE PASS`; C4 below | MODS entry deleted in a clone: `node scripts/bundle.mjs` exit 1, `KEY["names.mjs"] -> "names" has no matching MODS entry` |

C4, `git diff --name-only 6537465d..HEAD` is the 10 files in the table above plus this handoff.

A first control for C6.4 (prefix test inside `freePaletteName` too) never ended: `Primary copy N` always starts with `primary-`, so the loop could not find a free name. That is the heuristic's own defect and a second argument for set intersection, not a flaw in the unit; the recorded control applies the heuristic to the rename guard only.

## Findings

| # | Finding |
|---|---|
| F1 🟡 | Scope exception, ask to ratify. `color.js` gained about 50 lines above most of its cited lines, so `test/repo/citations.mjs` (inside `npm test`) went red on 4 docs (STALE 33 lines). The U6 lane names no docs. I renumbered every explicit `color.js:N` cite in those five files with a script that maps old to new line numbers from `git diff -U0` (`1696` to `1738` was set by hand, the `commitDrag` site moved into the new `onchange`). No prose changed, 43 lines, the gate reads `STALE 0 across 10 discovered docs`. If the lane wall should win, drop the five docs from the merge and the gate is red until the docs are repaired in another unit |
| F2 | `styles.css:1359` said "21-step". `src/engine/type.mjs` carries 13 voices of 3 steps and UI-control and UI-widget of 6 each, 51 steps (`typeScale({})`), and the scene itself computes `total` and prints it in its header. Comment fixed to "every voice's steps", so it cannot drift again. Comment only |
| F3 | `createNewPalette` (the New-Palette modal commit) named palettes `"Palette " + (len + 1)` with the same hole as `addPalette`, so it goes through `freePaletteName` too (R98: one path). It is not named in the plan's U6 text |
| F4 | A disabled palette emits nothing (`nameCollisions` filters `on !== false`), so renaming it to a colliding name is accepted, and re-enabling it afterwards can create a collision no guard sees. The plan scopes refusal to "the other enabled palettes"; the enable toggle is outside U6. Worth a follow-up if the owner wants the toggle guarded |
| F5 | `names.mjs` is called only on `change`, `addPalette`, `duplicatePalette` and `createNewPalette`, never per keystroke; the first call costs about 120 ms (memoized). `templateNames()` is not used, nothing mutates its Set |
| F6 | The refusal note is keyed `{ i, name }` and shown only while palette `i` still has that name, so undo, delete or a reselect hides it with no extra reset hook |
