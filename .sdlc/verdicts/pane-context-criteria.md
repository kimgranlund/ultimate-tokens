---
kind: criteria-review
plan: pane-context
seat: verifier
pass: 1
ticket: none yet
written: 2026-10-01
---

# pane-context criteria review · pass 1 · 🔴 at `d23b42db`

verdict: 🔴
sha: d23b42db

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
