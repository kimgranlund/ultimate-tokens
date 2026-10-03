---
kind: criteria-review
plan: pane-context
seat: verifier
pass: 5
ticket: none yet
written: 2026-10-01
---

# pane-context criteria review · pass 5 · 🟢 at `600751b0`

Current state: pass 5 🟢 at `600751b0` (plan revision 7). The two pass 4 reds, C2.2 and C2.7, now read Neutral `17/19`, the figure a correct build produces. Every U2 row C2.1 to C2.10 is checkable; U1, U3 and U4 stay 🟢 from pass 2. The plan is mobilizable. Passes 4 to 1 follow as history.

verdict: 🟢
sha: 600751b0

Pass 4 lines: `verdict: 🔴` at `744e7dd1`.
Pass 3 lines: `verdict: 🔴` at `b59139a0`.
Pass 2 lines: `verdict: 🟢` at `11828f00`.
Pass 1 lines: `verdict: 🔴` at `d23b42db`.

Plan `.sdlc/plans/pane-context.md` at `d23b42db` (revision 0, head 38b0e8b1), rows C1.1 to C4.9. Graded by the Verifier seat directly. Every needle, label and "Today" value was read with `git show d23b42db:<path>` (`test/ui/headless-boot.mjs`, `test/run.mjs`, `src/ui/**`, `test/smoke/smoke.mjs`, the two docs, the question file, `scripts/report-preset-fidelity.mjs`); the default kit was counted with `node -e` on `src/ui/model.mjs` (unchanged since `d23b42db`). 🟢 means I can name now the command that fails if the unit is missing or wrong. 🔴 means the row as written cannot be graded: its Expected is false on a green tree, collides with an existing label, or depends on an unruled choice.

10 rows are 🔴, so the plan is not mobilizable as written. All are text fixes; none needs new measurement except the C2.5 and C2.7 side ruling.

## Rows

| # | State | Check I would run | Why / what to change |
|---|---|---|---|
| C1.1 | 🔴 | `FORCE_COLOR=0 node test/ui/headless-boot.mjs`, assert on a new label; control: revert `_deselect`'s `segment` write | `(j6b)` already exists: `/usr/bin/grep -cF '(j6b)' test/ui/headless-boot.mjs` = `1` (the deselected neutral gray backdrop assertion). A "new `(j6b)`" collides, and the existing line already passes. Use an unused label, for example `(j6-seg)` |
| C1.2 | 🟢 | shim run, new `(j7b)` (`grep -cF` = `0` today); `findFk("slider:Chroma")` is already used by the shim; control: revert `selectPalette`'s `segment` write | ok |
| C1.3 | 🟢 | shim run, new `(b2)` (`0` today); the Escape deselect is the existing `Esc with no drawer deselects` line in the `(b)` block; control as written | ok |
| C1.4 | 🟢 | `grep -c 'case "1":\|case "2":\|case "3":' src/ui/app.js` = `3` (confirmed); control: delete one case in a clone, prints `2` | replace the `n/a` control with that |
| C1.5 | 🔴 | `bash -c 'set -o pipefail; npm test 2>&1 \| tail -3'` exit `0`; `git status --short` empty | `all 56 test files passed` is false today: `TESTS` in `test/run.mjs` has `54` entries at `d23b42db` and at `main`, so a green tree prints `all 54 test files passed` and this Expected fails. Regrade to "exit 0, and `all N test files passed` where N is `TESTS.length` at the unit's head" (C2.9, C3.4 and C4.9 say "green" and are fine). The control is valid: `"scrim` counts `7` in the role table |
| C2.1 | 🟢 | `--group-chroma --group brand --values 100,40`, the pinned `dC@500` figures; control `--values 100,100` prints all `0` | ok (mode new; `--identity-control` and `--authored` exist, `--authored` is parsed at `args.includes("--authored")`) |
| C2.2 | 🟢 | `--group material --values 30,100`, kept Neutral `0/19` before, `> 0` with `dC@500` `0.00` after; control `--values 30,30` | ok |
| C2.3 | 🟢 | `grep -c '^\| Chosen \| pending' .sdlc/questions/pane-context-group-chroma.md` = `1` today (the file exists at `d23b42db`, all five fields plus `## Answer`); control: the same grep on a copy with the cell set to `A` prints `0` | replace the `n/a` control |
| C2.4 | 🔴 | `node test/engine/tonal.mjs`, case `group-chroma-ratio` | The Expected cannot be computed: "within 0.02 of `0.5 * s0`-blended value the pre-change basis gives at weight 1" mixes the new target with the pre-change basis, and it mixes units (group values are 0 to 100, `s0` is OKHSL 0 to 1). State one formula, for example "stops 100 and 900 have OKHSL `s` within 0.02 of `anchorChromaBasis(stop, 500, lift, s0, 0.5 * s0, false)`". With the target written down, the `Math.min` control is fine |
| C2.5 | 🔴 | shim `(gid` lines | (1) `(gid5)` already exists: `grep -cF '(gid5)'` = `2` (the Intensity and Prime chroma slider checks), so a "new `(gid5)`" collides. (2) "`(gid3)` passes unchanged" holds under A only if material's default moves to 100. `(gid3 precondition)` pins Neutral's anchor s in `(0.10, 0.30]`. At today's default of 30, A targets `0.3 * s0`, not `s0`, so the fresh doc's Neutral no longer equals the chroma-100 ramp and `(gid3)` reds. The Expected depends on the question's open side ruling; write it for both answers, or pin the side default into U2 |
| C2.6 | 🔴 | `node test/engine/chroma-envelope-gate.mjs --compare <base fixture>` on the even row, plus the three gates' exit `0` | `git diff --stat` on the fixture cannot show "no even-cell change", and under A the perceptual cells may legitimately move in the same file. The named control (the FLOOR_TARGET data URL) bites on the dip gate, not on even byte-identity. Use `--compare` on the even row, and as the control apply the ratio target on the `climb=true` path in a clone so the even row moves |
| C2.7 | 🔴 | `report-preset-fidelity.mjs --identity-control --authored --base 38b0e8b1` | (1) The Expected "max dC at default group values `0.00`" contradicts the plan itself. Blast radius and the question say A moves material palettes at 30, and the shim precondition above shows Neutral moves at 30 even with s at or below 0.30 (the blast-radius line "only where s exceeds 0.30" is wrong). (2) adapter §1's ramp-identity row says the control renders the BASE tree's `persist.js`/`hydrate()` and the default kit's inputs on both engines. A `GROUP_DEFAULTS` change plus migration (the side question's default) is therefore invisible to it, so this command cannot certify "the kit renders as before at defaults". Name a check that reads the head's defaults, for example C2.2's report mode at the head's `GROUP_DEFAULTS` |
| C2.8 | 🔴 | shim `(gid4)` lines, `.group-ceiling` count (`0` today) | `(gid4b)` already exists (`grep -cF` = `1`, the slider shows its default). Use a free label |
| C2.9 | 🟢 | `npm test` exit `0`, ramp-identity `0 differing cells` (adapter §1 last line), status empty; adapter controls | if U2 declares movement, copy the six `identity <mode>` lines per adapter §1 rather than reading nonzero as a fail |
| C3.1 | 🔴 | shim, new `(i-all)` (`0` today); default kit `16` enabled of `16` (confirmed) | Each `.roles-table` today holds a header row `class: "rrow rhead"` with its own `.sw-pair` (`src/ui/sections/color.js`, `renderRolesInspector`). One table is therefore `54` `.rrow`, and 16 tables are `864`, not `848`. Either exclude the header in the needle (rows whose class is exactly `rrow`) or count `864`; state whether each table keeps its header |
| C3.2 | 🔴 | shim, new `(i-one)` | "heading text" names no element. Today the palette name sits in `.insp-sub` as `<name>: 53 semantic roles · ...`, and no per-table heading exists. Name the heading's class (R10: needles are class names), then compare its text |
| C3.3 | 🔴 | `querySelectorAll(".rrow .sw-pair").length` | Same header issue: today one table has `54` `.rrow .sw-pair` (the header's L/D pair included), not `53`, so 16 tables give `864`. Fix with C3.1 |
| C3.4 | 🟢 | `npm test` exit `0`, status empty; adapter controls | ok (prefer the N-at-head wording from C1.5) |
| C4.1 | 🟢 | the three greps; today `2`, `7`, `1`/`1`/`1` (all confirmed); fails while any control remains | the today counts are the control; drop the `n/a` |
| C4.2 | 🟢 | the grep; today `21`, `10`, `1`, `1`, `2`, `0` (all confirmed) | as C4.1 |
| C4.3 | 🟢 | shim `(cm)` (exists, `7` lines), `.compare-col`, `canvas-scheme-light`/`-dark` in `src/ui`; control: one column in Geometry | ok |
| C4.4 | 🟢 | shim `(k)`, `.example-scheme` count `2` (`0` today); `grep -c resolvedCanvasScheme src/ui/app.js` `7` today (confirmed), `<= 2` after | ok; note `(k1b)`/`(k1d)` pin `.example-card` counts `1` and `3` that double under U4 and must be rewritten with it |
| C4.5 | 🟢 | shim `(set)`/`(pref)`/`(pst)`, `(pref-cm)` deleted (`4` lines today); planted-blob control | ok |
| C4.6 | 🟢 | the two greps; today `4` and `3` (confirmed); control: drop a column rule in a clone, the first falls below `2` | replace the `n/a` |
| C4.7 | 🟢 | `npm run smoke` `SMOKE PASS` (`grep -c 'SMOKE PASS' test/smoke/smoke.mjs` = `1`); smoke's `4` scheme lines confirmed; control as written | ok |
| C4.8 | 🟢 | the grep; today `8` and `0` (confirmed); the Claims ledger and ran pair per adapter §6 | control: the grep at today's tree prints `8`; drop the `n/a` |
| C4.9 | 🟢 | `npm test` exit `0`, `npm run build` exit `0`, status empty | ok |

## Findings

1. 🔴 Three label collisions: `(j6b)`, `(gid5)` and `(gid4b)` already exist in `test/ui/headless-boot.mjs`. A builder following the plan writes a duplicate label, and the "new line passes" check cannot tell old from new.
2. 🔴 The roles counts ignore the per-table header row `.rrow.rhead`, which carries its own `.sw-pair`: the totals are `54` and `864`, not `53` and `848`.
3. 🔴 U2 option A against the `material` default of 30: the plan's blast radius, C2.5 and C2.7 assume a move only where the anchor s exceeds 0.30. The shim's own `(gid3 precondition)` puts Neutral at or below 0.30, and under A at 30 Neutral still moves. C2.5's `(gid3)` claim and C2.7's `0.00` hold only under the side question's default (material to 100 plus migration), and C2.7's command cannot see a `persist.js` defaults change (adapter §1).
4. 🔴 The test count: `TESTS` is `54`, not `56`. Grade the count as `exit 0` plus `all N test files passed`, with N taken at the head.
5. 🟡 Five rows carry `n/a` controls (C1.4, C2.3, C4.1, C4.6, C4.8). Each has a natural control, named in its row; write them in so the unit verdicts can be 🟢.

## Pass 2 · 🟢 at `11828f00`: revision 1 closes all ten pass 1 reds and the five `n/a` controls

verdict: 🟢
sha: 11828f00

Plan revision 1 at `11828f00`, graded by the seat directly against the pass 1 rows. The owner's rulings (`.sdlc/questions/pane-context-group-chroma.md` `## Answer`: `Chosen` A, material default stays 30, the shift is accepted, the chrome theme stays) are folded into C2.3, C2.5 and C2.7. Labels and counts were re-read with `git show 11828f00:<path>`.

| # | State | Check I would run | What changed, and the control |
|---|---|---|---|
| C1.1 | 🟢 | shim run, new `(j6-seg)` (`grep -cF` = `0` at `11828f00`) | the label is free and the existing `(j6b)` is kept as is; control: revert `_deselect`'s `segment` write |
| C1.4 | 🟢 | the `case` grep = `3` | control written in: delete one case, prints `2` |
| C1.5, C2.8, C3.4, C4.9 | 🟢 | `npm test` exit `0`, `all N test files passed` with N = `TESTS.length` at head | N reads `54` at `11828f00` (`TESTS` counted from `test/run.mjs`); control: the `"scrim` rename (`7` hits in the role table) |
| C2.3 | 🟢 | `grep -c '^\| Chosen \| pending'` = `0` (the `Chosen` cell names A) | control written in: a copy with the cell set back to `pending` prints `1` |
| C2.4 | 🟢 | `tonal.mjs` case `group-chroma-ratio` | the Expected is now one formula: `anchorChromaBasis(stop, 500, lift, s0, 0.5 * s0, false)`, in OKHSL 0 to 1 units, which matches the signature `anchorChromaBasis(stop, anchorStop, lift, anchorValue, groupValue, climb = false)` in `src/engine/tonal.js`; the `Math.min` control reds the 50 row and spares the pin |
| C2.5 | 🟢 | shim `(gid` lines; new `(gid-ratio)` (`0` today) | `(gid3)` is rewritten to the ruling: fresh Neutral at 30 differs from 100 and equals an explicit 30, with stop 500 byte-identical; control: reverting the engine reds both `(gid3)` and `(gid-ratio)`. The colliding `(gid5)` is gone from the plan (`grep -c 'gid5'` = `0`) |
| C2.6 | 🟢 | `chroma-envelope-gate.mjs --compare <38b0e8b1 fixture>`, `even` row unchanged | the gate keys its rows per mode (`COUNT_KEY` `perceptual`, `peak`, `even`); control: the ratio target applied on `climb=true` moves the even row |
| C2.7 | 🟢 | `--group-chroma ... --base 38b0e8b1` rendering the head's `GROUP_DEFAULTS`, plus `node -e` printing material's default `30` | a check now reads the head's defaults (pass 1's adapter §1 blind spot is gone); controls: default set to 100 prints `100`, and option B moves the brand rows at 100 |
| C2.8 (option C) | 🟢 | dropped | the owner ruled A, so the row no longer exists and the `(gid4b)` collision with it |
| C3.1 | 🟢 | `(i-all)`: `16` tables, `848` role rows (`.rrow` without `rhead`), `16` `.rhead`, `864` `.rrow` | header policy stated (kept per table); Today now reads `54` `.rrow`; control: the selected-only branch prints `1` / `53` / `54` |
| C3.2 | 🟢 | `(i-one)`: one `.roles-table` and one `.roles-table-name` (new class, `git grep` finds it nowhere in `src` today) whose text equals `palettes[2].name` | the heading is now named; control: dropping the `sel.kind` branch renders `16` |
| C3.3 | 🟢 | `.rrow .sw-pair` = `864` | header pairs counted; Today `54`; control prints `54` |
| C4.1, C4.2, C4.6, C4.8 | 🟢 | the greps | controls written in: today's counts (`2`/`7`/`1`/`1`/`1`; `21`/`10`/`1`/`1`/`2`/`0`; `4`; `8`), and for C4.6 a dropped column rule |

Rows not listed (C1.2, C1.3, C2.1, C2.2, C4.3 to C4.5, C4.7) were 🟢 at pass 1 and are unchanged in substance.

### Findings, pass 2

1. 🟢 All ten pass 1 reds are closed, and the five `n/a` controls are written in.
2. 🟡 For U2's builder and verifier: `(gid2)` (a fresh doc's Neutral equals a direct engine call at chroma 30) is not named in C2.5. It should hold under A if the direct call goes through the same anchored basis. If it reds, that is a finding against the engine change, not a reason to rewrite it silently.
3. 🟡 For U4: `(k1b)` and `(k1d)` pin `.example-card` counts `1` and `3`, which double with two `.example-scheme` wrappers. U4 rewrites them, and the handoff should say so.

## Pass 3 · 🔴 at `b59139a0`: U2 rewritten to the damper (R94 to R96); four rows uncheckable, and C2.10's window excludes the ruled result

verdict: 🔴
sha: b59139a0

Plan revision 2 at `7bdc3c70`, U2 rows C2.1 to C2.9, plus revision 3 at `b59139a0` (`git diff 7bdc3c70 b59139a0 --stat`: one file, `+7 -1`: C2.10, the base and prime composition paragraph, the units line), graded by the seat directly. Everything was read with `git show 7bdc3c70:<path>`: the plan's section 2 "The ruled meaning", `evenChroma` in `src/engine/tonal.js`, the `--compare` branch of `test/engine/chroma-envelope-gate.mjs`, the `--identity-control` branch of `scripts/report-preset-fidelity.mjs`, `GROUP_DEFAULTS` and `RENAME_MAPS` in `src/ui/persist.js`, the question file and the shim labels.

| # | State | Check I would run | Why / what to change, and the control |
|---|---|---|---|
| C2.1 | 🟢 | `--group-chroma --group brand --values 100,40`, kept `dC@500` below `-5.00` for three palettes | ok; control `--values 100,100` |
| C2.2 | 🟢 | `--group material --values 30,100`, kept Neutral `19/19`, `dC@500` above `+5.00` | ok; Neutral's C@500 is `24.77`, so 0.3 to 1.0 moves it about 17 C; control: the engine reverted prints `0/19` |
| C2.3 | 🟢 | `grep -c 'R94'` on the question file (`2` already at `7bdc3c70`), `Chosen \| pending` `0` | ok; Today `0` is stale (the Answer was already updated), harmless; control: the `306f9a9e` copy prints `0` |
| C2.4 | 🔴 | `tonal.mjs` `group-chroma-damper` | Two gaps on the `even` rows. (1) Where the damper sits: section 2's even formula scales `intendedH` before `evenChroma`. `evenChroma` returns `min(maxc, max(intended * env, min(F, intended)))`, with `F` the chroma-floor constant, so wherever the floor binds (`F` below `r * intended`, the damped pale stops) the output is `F` at both `r = 1` and `r = 0.5`: not linear. The section's own sentence "multiplies whatever that path renders with the group at 100" puts it on the output instead. State one placement. Output placement makes the row hold; input placement needs a stated floor exception. (2) The unit: the even path damps CAM16 C (`intendedH`) and renders through the per-stop hue solve, so OKHSL `s` read back from the hex is not exactly linear in it, and `0.02` absolute may red a correct build at high `s`. Read the even rows in CAM16 C (`abs(C_g - r * C_100) <= tol`, tolerance named) or give a relative tolerance. Perceptual and peak rows are fine as written |
| C2.5 | 🟢 | shim `(gid` lines; `(gid-damp500)` is free (`grep -cF` = `0`) | ok; controls: revert the engine reds `(gid3)` (Neutral `s0` in `(0.10, 0.30]`, so 50 equals 100 under the cap) and `(gid-damp500)`, and revert only `GROUP_DEFAULTS` reds `(gid1b)`/`(gid2)` |
| C2.6 | 🔴 | `chroma-envelope-gate.mjs --compare` | The compare prints one line per mode (`<mode>: byte-identical to base` or `moved against base`) and the `rose:` cells. Its fixture cells are corpus statistics per mode, stop and stat, with no per-palette or per-group-value row. So "no moved cell on any row whose group value is 100" cannot be read from it, and the control ("a group-100 row still reports 0") cannot be run. Pin what the gate prints: each mode's `byte-identical`/`moved` line, plus `0 cells rose`. If a mode may move, say which and require `0 cells rose` (the ratchet's own rule, re-capture in the same change) |
| C2.7 | 🟢 | `--group-chroma --defaults --base <merge-base>` plus `node -e` material default | ok: base at 30 under the R69 cap and head at 100 with `r = 1` render the 16-palette kit alike in `perceptual`/`peak`; control: material back to 30 moves Neutral `19/19` |
| C2.8 | 🟢 | `test/ui/persist.mjs` `v7-material` (free, `0` in `test/`); `CURRENT_SCHEMA_VERSION` `6` today, `RENAME_MAPS` and `stampIntensity` exist | ok; controls as written |
| C2.9 | 🔴 | `--identity-control --base <merge-base> --authored`, `identity <mode>` lines | The Expected assumes the base side renders migrated values ("100 or migrated-to-100 on the base"). The tool hydrates through the BASE tree's `persist.js` and resolves chroma with the BASE `rampChromaOf` (`baseModule.persist.hydrate`, `baseModule.model.rampChromaOf`), then renders both engines at that chroma (adapter §1 says the same). At the merge base, material is `30` with no v7 migration. So the head engine gets `30` and damps every anchored material palette to 0.3, `default-kit` Neutral included: its `identity perceptual` line cannot print `0`. Also, the lines are `identity <mode><suffix>: P/T palettes, C/T cells differ` over the run, not per category (only `--only` scopes them). Restate it: expect material palettes to differ on the authored leg, run `--only default-kit` for the kit line, and leave the defaults claim to C2.7 |
| C2.10 (owner's case, revision 3) | 🔴 | shim `(gid-owner4)` (free); the prime half: `primeChromaOf` feeds only `primeSwatches` (`src/ui/model.mjs`, `projectView`), so the prime-100 vs prime-0 byte-identity and its control are sound | The ratio half reads CAM16 C, but R94 damps OKHSL `s`, and CAM16 C is not proportional to `s` near grey. Seat simulation (`$CLAUDE_JOB_DIR/tmp/c210/sim.mjs`): take the default kit Primary's 25-stop `fullRamp` at base 100, set each stop's OKHSL `s` to `0.04 * s` at the same `h` and `l` (R94's formula), round to hex, and read both units. `C(4) / C(100)` reads `0.079` at 500, `0.080` at 400, `0.085` at 600, `0.079` to `0.20` from 175 to 900, and up to `1.000` at 50: `outside [0.02,0.06] with C100>2: 24`, which is every stop with C100 above 2 (only 950, C100 `1.6`, is exempt). The OKHSL `s` ratio reads `0.039` at 500 and `0.030` to `0.044` from 200 to 800 (`0.030` to `0.061` from 125 to 875, `0.098` at 900), with hex quantization at the ends (`NaN` at 50, `0.000` at 75, 100, 925, 950). A correct R94 build therefore reds C2.10 as written. Fix: read the ratio in OKHSL `s` with an ends rule (for example stops whose at-100 `s` exceeds a named floor, or 200 to 800), or keep CAM16 C with a window measured from a prototype (the mid stops read about `0.08`). The owner-facing "about 4%" is then 4% of the at-100 saturation, which this row should say |

### Findings, pass 3

1. 🔴 C2.4 even rows: the damper's placement relative to `evenChroma`'s floor decides whether the linear law can hold, and the plan states both placements. The OKHSL `s` read-back is also the wrong unit for a CAM16-damped path.
2. 🔴 C2.6 asks the envelope `--compare` for per-group rows it does not print.
3. 🔴 C2.9's ramp-identity Expected relies on base-side migration the identity control never runs; at the merge base, material `30` reaches the head engine and moves the kit's Neutral.
4. 🔴 The owner's case is now pinned by C2.10 (revision 3), but its CAM16 C window `[0.02, 0.06]` excludes what R94 produces (about `0.08` mid-ramp, more at the ends, by the seat's simulation). In OKHSL `s`, R94's own unit, the same render reads about `0.04`. Restate the window in `s`, or measure a CAM16 window on a prototype. The prime half of C2.10 is checkable as written.
5. 🟢 C2.1, C2.2, C2.3, C2.5, C2.7 and C2.8 are checkable as written.


## Pass 4 · 🔴 at `744e7dd1`: revisions 4 to 6 fix every pass 3 red; C2.2 and C2.7 count two achromatic stops as movable

verdict: 🔴
sha: 744e7dd1

Plan revision 6 at `744e7dd1` (revision 5 at `348ccce7` plus C2.7 and C2.9 restated for R98), U2 rows C2.1 to C2.10, graded by the seat directly. Expected values that depend on the damper were checked against a simulation of a correct R94/R98 build on the current engine (`$CLAUDE_JOB_DIR/tmp/c210/q.mjs` and `e.mjs`): render the default kit with every group at 100, then scale each display stop's OKHSL `s` (perceptual) or CAM16 C (even, via `hctToRgb` at the same hue and tone) by `r`, round to hex, and read back.

| # | State | Check I would run | Why / what to change, and the control |
|---|---|---|---|
| C2.1 | 🟢 | the `--group-chroma --group brand --values 100,40` rows; control `--values 100,100` | Primary's C@500 is about 62 at 100, so a 0.4 damper puts `dC@500` far below `-5.00`; the stripped `-10.00` bound carries over from section 2 |
| C2.2 | 🔴 | `--group material --values 30,100`, the kept Neutral row | `19/19` cannot be met. Simulation, r = 0.3 on Neutral's 19 display stops: `moved 17`, unmoved `50 #FFFFFF` and `950 #111111`, both `s 0.000` at 100. Write `17/19` (or "every stop whose at-100 `s` is above 0", naming 50 and 950). `dC@500` above `+5.00` holds (Neutral C@500 `24.77`, so the move is about +17). Controls are sound |
| C2.3 | 🟢 | the two greps; control on `git show 306f9a9e:` copy | ok |
| C2.4 | 🟢 | `test/engine/tonal.mjs`, the `group-chroma-damper` case; three scratch-clone controls | Pass 3 red fixed: one law per path, read in that path's own unit. Simulation of a correct build: perceptual max `abs(s_g - r * s_100)` is `0.015` at r 0.5 and `0.009` at r 0.1 on Primary's 19 stops (bound `0.02`); even, CAM16 C at the same hue and tone, `0` stops outside `max(0.5, 0.03 * C_100)` at r 0.5, 0.1 and 0 for Primary and Neutral. The input-placement control reds on floored pale stops, as section 2 argues |
| C2.5 | 🟢 | shim `(gid` lines, `(gid-damp500)` (`grep -cF` `0`); both controls | the `(gid3)` 0.02 bound holds in simulation (Neutral max error `0.009` at r 0.5) |
| C2.6 | 🟢 | the three gates, then `--compare` | Pass 3 red fixed: the row now reads the per-mode lines and `N cells rose`, which `chroma-envelope-gate.mjs` prints (lines 103 and 105) and exits 1 on any rise (line 106), so the amplify control (`r = g / 90`) can fail it |
| C2.7 | 🔴 | `--group-chroma --defaults --base ...`, the new `--saved-material 30` leg, `node -e` on `GROUP_DEFAULTS` | The defaults leg is checkable. The `--saved-material 30` leg expects Neutral `19/19` moved in `perceptual`, and the control expects the same `19/19`; both read `17/19` on a correct build for the reason in C2.2 (stops 50 and 950 are achromatic at 100). Fix both counts |
| C2.8 | 🟢 | the two greps on `src/ui/persist.js`; control adds a v7 entry | ok, matches R98 |
| C2.9 | 🟢 | `npm test`, `--identity-control` twice, `git status --short` | Pass 3 red fixed: the base side's stored 30 is now the expected cause of the Neutral difference, `1/16` per mode on `--only default-kit`. One wording gap, not a red: the "skips the damper" control prints `0/16` only in `perceptual` and `peak`; in `even` a head that ignores the group renders Neutral at 100 against the base's 30, which section 2 measured as `4/25` moved, so `even` would still print `1/16`. Scope the control to `perceptual` and `peak` |
| C2.10 | 🟢 | shim `(gid-owner4)`; both controls | Pass 3 red fixed exactly as recommended: OKHSL `s`, `owner4-span` 200 to 800 with at-100 `s` above `0.05`, window `[0.025, 0.055]` against the pass 3 simulation's `0.030` to `0.044`; the prime half is unchanged and checkable |

### Findings

1. 🔴 C2.2 and C2.7 (its `--saved-material 30` leg and its control): Neutral `19/19` moved is unreachable; the correct figure is `17/19`, stops 50 and 950 being achromatic at 100.
2. 🟡 C2.9: scope the "skips the damper" control's `0/16` to `perceptual` and `peak`.
3. 🟢 Every other U2 row is checkable, and the owner's base 4 case is pinned by C2.10 in R94's own unit.

## Pass 5 · 🟢 at `600751b0`: C2.2 and C2.7 read 17/19

verdict: 🟢
sha: 600751b0

Revision 7 at `600751b0`, graded by the seat directly on `git diff 744e7dd1 600751b0 -- .sdlc/plans/pane-context.md` (three cells changed plus the revision row; no other row moved).

| # | State | Check I would run | What changed, and the control |
|---|---|---|---|
| C2.2 | 🟢 | `--group material --values 30,100`, the kept Neutral row | Expected is now `17/19`, naming stops 50 and 950 as achromatic at 100. Pass 4 simulation (r = 0.3 on Neutral's 19 display stops) reads `moved 17`, unmoved exactly `50 #FFFFFF` and `950 #111111`. Controls unchanged and sound: `--values 30,30` and the engine-revert clone print `0/19` |
| C2.7 | 🟢 | `--group-chroma --defaults --base ...`, its `--saved-material 30` leg, `node -e` on `GROUP_DEFAULTS` | The saved-doc leg and the control both read `17/19` with the same reason; the defaults leg is unchanged from pass 4. The control (default back to 30) can fail the row: it prints `17/19` where the row expects `0/19` and `30` where it expects `100` |

C2.1, C2.3 to C2.6 and C2.8 to C2.10 carry over 🟢 from pass 4 unchanged. Pass 4's wording note on C2.9 (the "skips the damper" control reads `0/16` only in `perceptual` and `peak`) is not taken up; it stays a note for the unit's verifier, not a red.
