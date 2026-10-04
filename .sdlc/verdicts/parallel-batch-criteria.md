---
kind: criteria-review
plan: parallel-batch
seat: verifier
pass: 2
ticket: 786
written: 2026-10-04
---

# parallel-batch criteria review · pass 2 · 🔴 at `580df2dd`

Current state: pass 2 🔴 at `580df2dd` (revision 1, ticket #786). Four of pass 1's six reds are closed: C2.4, C3.3, C4.2 and C4.3. Two remain, both in the rewording. (1) C4.4 counts `^✗` lines, but the shim prints each failure as `"  ✗ " + f` (`test/ui/headless-boot.mjs:4214`, two leading spaces), so the count is `0` whether `(b2)` passes or fails and the planted control cannot raise it. (2) C7.2's `echo "exit $?"` follows a pipe into `grep -c`, so it prints grep's status, not `citations.mjs`'s: a correct build (count 1 or more) prints `exit 0`, the opposite of the row's Expected `exits 1`. The rest of the revision (Q1 B moving U5 and U7 to wave A, Q2 A, Q3 B) changes no row's checkability. Pass 1 follows as history.

verdict: 🔴
sha: 580df2dddfbdba2d840aaf0f968d7be67680dfaa

## Rows

| # | State | Check I would run | Why / what to change, and the control |
|---|---|---|---|
| C2.4 | 🟢 | `awk '/^## 1/,/^## 2/' .sdlc/adapter.md \| grep -c ...`; `baseline-agrees \| grep -c "ok    head:"` equal to the base | the paragraph placed after `## 2.` drops the slice count to `0` |
| C3.3 | 🟢 | the purity grep on `names.mjs` | `document.title;` planted prints one line |
| C4.2 | 🟢 | shim `tail -1` = `HEADLESS BOOT PASS`; `grep -c "(b3)"` in the source, 2 or more | the C4.1 clone prints `  ✗ (b3) ArrowDown on Roles ...` (an unanchored grep finds it) |
| C4.3 | 🟢 | shim `tail -1`; `grep -c "(b3) .*keeps roles"` = `3` | the C4.1 clone prints three `✗ (b3) ... keeps roles` lines |
| C4.4 | 🔴 | `node test/ui/headless-boot.mjs 2>&1 \| grep -c "^✗.*(b2)\|..."` | Dead count: failures print as `"  ✗ " + f` (`:4214`), so `^✗` never matches and the `_deselect` control still reads `0`. Drop the `^` anchor (or anchor on `^  ✗`); the `tail -1` and smoke parts of the row are fine |
| C7.2 | 🔴 | the `sed` on `noun: "roles?"`, then the run | The `sed` and the base control work: run at `580df2dd`, the run exits `0` and `grep -c 'roles per palette'` prints `0`, which is the gap. But `echo "exit $?"` after the pipe prints grep's status (`exit 1` on that base run, where the count was `0`), so on a correct build it prints `exit 0` and cannot show the Expected `exits 1`. Capture the run's own status: `node test/repo/citations.mjs > out 2>&1; echo "exit $?"; grep -c 'roles per palette' out` |

Rows C1 to C6, C1.1 to C3.4 other than those above, C4.1, C4.5, C5.1 to C6.5, C7.1, C7.3 and C8.1 to C8.8 are unchanged in revision 1 and stay 🟢 as in pass 1. U5 and U7 moving to wave A changes no check: their criteria read their own files at the unit base.

## Pass 1 · 🔴 at `2d19f63e`: six rows whose command or control could not work

Current state: pass 1 🔴 at `2d19f63e` (revision 0, draft, ticket #786 and five more). 38 of 44 rows are checkable. Six are not, because their command or control cannot fail or pass the way the row says: C2.4, C3.3, C4.2, C4.3, C4.4 and C7.2. The main cause: `test/ui/headless-boot.mjs` `ok()` (`:17`) only pushes failures and never prints a passing line, so every row that greps for `ok` lines reads nothing whether the unit is built or not. Each fix is a wording change in the plan; no unit design moves.


Facts read at `2d19f63e` (root `main`, read-only): `ok = (cond, msg) => { if (!cond) fails.push(msg); }` at `headless-boot.mjs:17`; `baseline-agrees-check.sh` prints `ok    head:` once today (`grep -c` = `1`); `test/engine/flags.mjs` verifies the feature-flag substrate (`flags.js`), not DOM use; `bundle.mjs` preflight (c) at `:100` reds an import that has no KEY entry; `even-dips-gate.mjs` has `--floor-scale` (`:74`) and `DID NOT bite` (`:24`); `type.mjs` carries `2026-07-16` 4 times; `claude-plugin.md` has 3 `fix-old-names: keep` markers; the citations pin `roles per palette` (`:91`) has noun `roles?` and needle `a 53-role`.

### Pass 1 rows

| # | State | Check I would run | Why / what to change, and the control |
|---|---|---|---|
| C1 | 🟢 | `npm test \| tail -1`, the perl `TESTS` count, `git status --short \| wc -l` | the `"scrim` rename control reds `refs-canonical` (seen at pane-context and compute-layers) |
| C2 | 🟢 | `npm ci && npm run build; echo "exit $?"` | planted TS2322 in `src/main.ts` reds `tsc` (seen at compute-layers U2) |
| C3 | 🟢 | `node test/repo/em-dash.mjs`, `branding.mjs`, `verdict-frontmatter-check.sh` | a planted U+2014 reds em-dash naming the file (run today on README) |
| C4 | 🟢 | `git diff --name-only <unit base>..HEAD` against the section 5 lane | a stray path shows as an extra line |
| C5 | 🟢 | the two `--is-ancestor` calls with the #785 squash sha | fails today: no squash exists |
| C6 | 🟢 | the `gh issue view` loop | prints six `OPEN null` before the squash |
| C1.1 | 🟢 | `grep -rn "eleven" docs/marketing \| grep -i voice` | prints 4 lines today (`landing.md:41`, `boilerplate.md:38`, `claude-plugin.md:19`, `:60`) |
| C1.2 | 🟢 | `grep -c "fix-old-names: keep" docs/marketing/product/claude-plugin.md` = `3` | the count drop is the control; the row's "branding.mjs reds" clause is unproven, so the verifier will use the count only |
| C1.3 | 🟢 | em-dash plus the `makeVoices()` count `15` | planted U+2014 in `landing.md` reds |
| C1.4 | 🟢 | C4 | extra path shows |
| C1.5 | 🟢 | each ledger needle `grep -c` in its anchor, the `ran` block rerun | an edited needle prints `0` |
| C2.1 | 🟢 | the two greps | export re-added prints one line |
| C2.2 | 🟢 | `node test/repo/em-dash.mjs \| head -1` (`self-test: PASS`, `:1042`) and the fixture grep | the E1 branch reverted in a clone reds the self-test (`self-test: FAIL`, `:1038`) |
| C2.3 | 🟢 | `--fix` in a base clone, `git diff --stat -- src/engine/ds-export.js` | re-planted pre-sweep shape: the gate names the line |
| C2.4 | 🔴 | `grep -c` inside the §1 slice, plus `baseline-agrees` | Expected says `ok    head:` prints twice; today it prints once, and an `.sdlc/`-only edit cannot change that, so the row fails on a correct build. Change it to "the same `ok    head:` lines as at the unit base". Also make the count read the `awk '/^## 1/,/^## 2/'` slice in the Command, not the whole file, since the Expected and the control both depend on the slice |
| C2.5 | 🟢 | C4 plus the ledger | as C1.5 |
| C3.1 | 🟢 | `node test/engine/names.mjs` five cases | the prefix heuristic reds the lookalike case |
| C3.2 | 🟢 | `node -e` set equality of `emittedNames("x")` against the exporter's own flat names | a removed suffix prints `missing <name>` |
| C3.3 | 🔴 | `grep -n "document\|window\|from \"../ui" src/engine/names.mjs` | The named control does not exist: `test/engine/flags.mjs` checks feature flags, and no bundle check reds DOM use in an engine. Name a control that runs: plant `document.title;` in `names.mjs` and the row's own grep prints one line |
| C3.4 | 🟢 | the perl count `55` and the `TESTS` entry | unregistered leaves `54` |
| C4.1 | 🟢 | `grep -n 'segment = "palette"'` in `color.js` and `app.js` | the write re-added inside `selectPalette` shows a hit there |
| C4.2 | 🔴 | `node test/ui/headless-boot.mjs 2>&1 \| grep "(b3)"` | The shim never prints a passing assertion (`:17`), so on a correct build the grep prints nothing, the same as when `(b3)` is missing. State it as: the run ends `HEADLESS BOOT PASS`, `grep -c "(b3)" test/ui/headless-boot.mjs` is 2 or more, and in the C4.1 clone the run prints `✗ (b3) ...` |
| C4.3 | 🔴 | the same group, "3 ok lines" | Same cause: no `ok` line ever prints. Name the assertion labels, check the source grep plus `HEADLESS BOOT PASS`, and keep the C4.1 clone showing 3 `✗` lines |
| C4.4 | 🔴 | `grep -c "^ok.*(b2)\|^ok.*(j7b)"` | Prints `0` on every build, so it cannot tell pass from fail. Use `HEADLESS BOOT PASS` with `(b2)`, `(j7b)`, `(i-all)`, `(i-one)` absent from the `✗` lines; the `_deselect` control then shows `✗ (b2)` |
| C4.5 | 🟢 | `grep -n "#786"` in the question file | `0` at the unit base |
| C5.1 | 🟢 | the source grep and `grep -c "eleven-voice"` in `figma/plugin/ui.html` and `dist/ultimate-tokens.html` (written by `bundle.mjs:199`) | `git stash` shows the source lines |
| C5.2 | 🟢 | `grep -n "07-13" src/ui/sections/typography.js`; `type.mjs` count `4` | the base prints `:534` |
| C5.3 | 🟢 | C4, C1, C2, smoke | extra path shows |
| C6.1 | 🟢 | shim `(nm1)` fails into the `✗` list, run ends `HEADLESS BOOT PASS` | guard removed: `✗ (nm1)` |
| C6.2 | 🟢 | `(nm2)` | guard on `oninput`: `✗ (nm2)` |
| C6.3 | 🟢 | `(nm3)` | default step without the check: a collision pair |
| C6.4 | 🟢 | `(nm4)` | prefix heuristic: badge appears |
| C6.5 | 🟢 | `grep -n "names" scripts/bundle.mjs`, gates | `color.js` importing an unregistered `names.mjs` trips preflight (c) at `bundle.mjs:100`, so `npm run build` reds |
| C7.1 | 🟢 | `node test/repo/citations.mjs`, extended self-test | a new positive planted as a real pin names `bare literal source` |
| C7.2 | 🔴 | the narrowed-noun clone edit | The edit is not named: "change the doc line from a `53-role` grammar so the doc reads the singular only where the pin wants the plural" does not say which file, which line or which text, and `ui-plan.md` has 3 matching phrases. Name the exact `sed` against `docs/reference/references/ui-plan.md` (or the pin's `noun` change in `citations.mjs`) and the expected FAIL text; the control is the same edit passing at the unit base |
| C7.3 | 🟢 | C4; `grep -c FAIL` = `0` | as C7.1 |
| C8.1 | 🟢 | the committed report mode at the unit base, three figures ±0.01 | `--hue-shift 0` shows no dip |
| C8.2 | 🟢 | each number in the Findings paragraph greps in C8.1's per-stop dump | a Findings without a quantity is FIX-FIRST |
| C8.3 | 🟢 | C8.1 at the head | `git stash` returns the base figures |
| C8.4 | 🟢 | `npm run gate:even-dips \| grep "(b1)"` with the widened label and the merge-base control line | the gate's own `DID NOT bite` red (`:24`) |
| C8.5 | 🟢 | `gate:even-dips` (b2) at or under 7, `tonal.mjs` PASS | `--floor-scale 1.6` (`:74`) prints a non-zero count |
| C8.6 | 🟢 | `--identity-control --authored`, `mode-isolation`, `chroma-envelope --compare` | an undeclared palette moving shows as an extra identity line; the amplified fixture shows `1 cells rose` (seen at pane-context) |
| C8.7 | 🟢 | three `--full` sweeps | planted per leg (as at pane-context pre-land) |
| C8.8 | 🟢 | five paired `even-dips` runs, median ratio | checkable, but the host has run at load 4 to 7 for days, so "quiet host" may never hold; a noisy ratio is the row's own 🟡 |
