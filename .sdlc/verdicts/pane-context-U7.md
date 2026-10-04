---
kind: verdict
plan: pane-context
unit: U7
seat: verifier
pass: 1
ticket: "#785"
written: 2026-10-04
---

# pane-context U7 · pass 1 · 🟢 at `9f43f3fe`

verdict: 🟢
sha: 9f43f3fe4e7ec65e1a909c596eb577e10106098d

Unit `unit/pc-U7` at `9f43f3fe` (pass 2 code `dbd7519b`, pass 1 code `d2311bef`), base `96409def` (the plan head at U7 activation; `git merge-base origin/plan/pane-context 9f43f3fe`), against C7.1 to C7.4 of plan revision 16 and the request `.sdlc/handoffs/pane-context-U7-regrade.md`. The builder was sonnet (builder-l4, both passes). The checker is this seat on opus (verifier-l2 grade, run in-seat under R86/R92), so the check is independent across families. Preflight: `verdict.py check` exits 0 on the request.

Every run is in fresh clones under this seat's job dir:
- `h` and `n` at `9f43f3fe` (`rev-parse` printed the head sha).
- `b` at `96409def`.
- `o` at `1e3fe1eb^` (`c7470c53`, the pre-#785 engine).

`NODE_OPTIONS` was unset throughout. The 1-minute load was 34 to 50, so no row is a timing row. The three out-of-lane finds in the handoff (`anchor.mjs:505`, `SPEC-muted-base.md` line 4, the REQ-007 banner) are not graded, per the request.

## Rows

| Criterion | State | Evidence | Negative control |
|---|---|---|---|
| C7.1 `tonal.js:108-112` comment true against the code | 🟢 | Head `:109-111` says `palette.chroma` is the chroma the ramp is rendered at, always 100 here, with `dampStops` applying the group value after. All three `hueAnchorFrac(` callers sit below the `:946` re-entry (`if (palette.chroma !== 100) return dampStops(paletteStops({ ...palette, chroma: 100 }, ...`): `:830` in `paletteStopsAnchored`, `:972` in `paletteStops` after `:946`, and `:1390` in `okhslStops`. Both private functions are called only at `:947` and `:949`. `git grep` finds no other caller in `src` or `scripts`, so "a direct call uses its own chroma" covers the export | `git show 94bcd8aa:src/engine/tonal.js \| sed -n 109,110p` prints "the absolute group target on the group-resolution callers"; `grep -c 'absolute group target'` reads `0` at head |
| C7.1 class sweep re-judged against the code | 🟢 | Own run of the C7.1 grep at head: 14 hits outside the excluded paths, matching the handoff's "17 at `94bcd8aa` less 3 fixed". Re-opened sample: `tonal.js:848` (says always 100 since #785), `:855`/`:889` (100-based, reached only past `:946`), `test/engine/tonal.mjs:1778` (a hypothetical target of 1 inside a control patch, true), `exports.mjs:480,490` and `shadcn-baseline.css:37,71` (dated re-capture log, history), spec `:104` (REQ-005 with the #785 parenthetical; `dampStops` holds hue through `solveOkhslHue`/`solveCam16Hue`, `:1516`, `:1520`), spec `:349` EX-2 (named by the `:14` banner as no longer holding). Sweep B sample: `tonal.js:578-584`, `anchor.mjs:462-466`, color-math `SKILL.md:67-68` all state the 100 render and the damper. The one measured claim, `model.mjs:279`, reproduces: head engine at 100 against the pre-#785 engine at 30 gives `0/25` differing hexes for Neutral on perceptual and peak, `4/25` on even (the sentence claims no even match). The three pass 2 fixes are true: `knowledge-02:258` (`okhslStops` is module-private), `headless-boot.mjs:4245` (`dampStops` carries a below-100 chroma), and AC-006 (next row) | the same Neutral comparator reads `4/25` on even, and the old engine's own 100 against 30 also reads `4` there, so a `0` is a real match, not a dead probe. The handoff's sums add up (17 and 170) |
| AC-006 re-measured | 🟢 | Own probe (`paletteStops({hue:267, skew:-20, lift:0})`, chroma g against 100, largest stop tone delta): perceptual `0.177 0.177 0.179`, peak `0.185 0.200 0.182`, even `0.000 0.000 0.000` at g = 30, 60, 95. This matches the new spec text, so the old "tones equal within 1e-9" claim was false. `group-chroma-damper` (v) asserts L* within the two pixels' rounding floors on perceptual and peak over 3200 rows | damper mutated in clone `n` (`hold.l * 0.98` in `dampStops`): `node test/engine/tonal.mjs` reads `FAIL group-chroma-damper, 3 red: ... (v) 2020/3200 rows off their at-100 L*` and `FAIL: 4 gate failure(s)`; restored, porcelain `0` |
| C7.2 LLD `:62` | 🟢 | Head `:62` reads `material: { baseChroma: 100, primeChroma: 60 }`, matching `persist.js:45` (`material: { baseChroma: 100, primeChroma: 60 }`), which `model.mjs:15,428` re-exports. `grep -n 'baseChroma: 30'` on the LLD prints nothing | base `96409def`: the same grep prints `:62` and `:149` |
| C7.3 reactivity review `:27` | 🟢 | The row now marks the `colorMode==="both"` deferral as historical (dated 2026-08-20, removed by #785 U4). Its live citations hold at head: the early return is `app.js:292` (`if (this.section !== "color") return;`), `liveRefresh()` starts at `:276`, `_liveRefreshNow()` ends at `:334`, and the method patches each scheme column (`_schemeOfColumn`, `_inScheme`). `app.js` has `0` `colorMode` reads | `git diff 96409def 9f43f3fe` on the file reads `2` changed lines (one row out, one in), so nothing else in the file moved |
| C7.4 `npm test` | 🟢 | clone `h`: `nt_rc=0`, `✓ all 54 test files passed`, porcelain `0` after (the committed `ui.html` and `describe-mcp-assets.js` equal their regeneration) | the damper mutation above reds `test/engine/tonal.mjs`, which is a `test/run.mjs` TESTS leg (count `1`); the full suite was not rerun under it |
| C7.4 `npm ci && npm run build` | 🟢 | `ci_rc=0`, `build_rc=0`, `wrote figma/plugin/ui.html 4170.9 KB` (unchanged from `.sdlc/baseline.md:36`), porcelain `0` | `const __neg: number = "x";` appended to `src/main.ts`: build rc `1`, `TS2322`; restored, porcelain `0` |
| C7.4 baseline-agrees, em-dash, branding | 🟢 | `stale total: 0`; `em-dash: clean (1158 files scanned)`; `branding: clean (1150 files scanned)` | baseline `:36` `4170.9` to `4170.8`: rc `1`, `STALE ui.html: baseline 4170.8 KB, tree 4170.9 KB`, `stale total: 1`; a U+2014 line in README: `FAIL: 1 em dashes ...`; restored |
| C7.4 diff scope, comments only | 🟢 | `git diff -U0 96409def 9f43f3fe -- src test scripts` (less `describe-mcp-assets.js`), minus header, comment-marker and whitespace-only lines: `0` lines. Changed paths are the lane files plus the handoff and two review records | the damper mutation in clone `n`, run through the same filter on its working tree: `2` lines |

## Findings

- 🟡 The LLD's `:149` document-shape example also moved from `baseChroma: 30` to `100`, a line the lane names only as `:62`. It is the same class and C7.2's control requires it, but it is a `schemaVersion: 4` shape, whose shipped default then was 30. The `:14` #785 banner covers it.
- 🟡 AC-006's "exactly on even" holds by construction: `dampStops` keeps `st.tone` on the even path, and the probe reads `0.000`. The case (v) gate only asserts perceptual and peak, as its own header says.
- 🟡 Carried from the pre-land pass 3 record, unchanged and not in U7's criteria: the vestigial `palette.chroma / 100` reads below `:946`, including the `groupTarget` name at `tonal.js:855`, which is now always `pk`. That is a follow-up with no pixel change.
- The three out-of-lane finds in the handoff go to the follow-up the Orchestrator named; they are not graded here.
