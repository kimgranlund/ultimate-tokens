# Verdict rg-U1 · 🔴

Unit `unit/rg-U1` at `40aae262`, base `b3961aa9`, plan `plan/rule-gates`. Read-only: a detached scratch worktree `wt-rgU1` and a `git clone --shared` at `40aae262` (`rgU1-neg`), both removed by exact name after the run. Load at start `18.68 17.27 19.20`, before smoke `27.15`, at end `30.44 28.08 24.11`.

One red, and it is a record fix: the handoff quotes the smoke pass line verbatim in a fenced block, and that line carries an em dash, so P8 prints `1`. The code, the gate and the two `styles.css` rules are all green with controls that bite.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U1-1 / P5 | the `html:` count gate agrees with the entry file and bites both ways | 🟢 | `svg-rules: 12 html: attributes (stated 12), 6 line classes qualified with fill: none, 1 area class`, `exit 0`; an independent `grep -o 'html:[[:space:]]*[A-Za-z0-9_]'` over the three section files counts `12`; `.claude/CLAUDE.md:68` states `12` | a 13th attribute appended to `color.js`: `FAIL html: 13 html: attributes, .claude/CLAUDE.md states 12`, `exit 1`; stated number edited to 13: `FAIL html: 12 html: attributes, .claude/CLAUDE.md states 13`, `exit 1` |
| U1-1 / P6 | every line-chart path is ruled `fill: none` through a qualified selector | 🟢 | path classes in the sections: `gp-font gp-icon gp-ref lc-applied lc-ceiling lc-toneline ty-line` (7), `lc-ceiling` the one AREA class; `styles.css` 826, 827, 1384, 1521 to 1523 each `.an-svg .<class> { ... fill: none ... }` | `ty-line` unqualified: `FAIL ty-line: no qualified rule .an-svg .ty-line`; `fill: none` dropped from `.an-svg .gp-ref`: `FAIL gp-ref: rule lacks fill: none`; dropped from U1's own `.an-svg .lc-toneline`: `FAIL lc-toneline: rule lacks fill: none`; U1's `.an-svg .lc-applied` unqualified: `FAIL lc-applied: no qualified rule .an-svg .lc-applied`; new `<path class="zz-line"`: `FAIL zz-line: no qualified rule .an-svg .zz-line`; each `FAIL: 1`, `exit 1` |
| U1-2 | exactly the two rules moved, only their selectors | 🟢 | `2	2	src/ui/styles.css`, `1`, `1`, `0`, `0`, `4`; declarations after `{` on 826 and 827 byte-identical to base (`diff` prints `same`) | only `lc-applied` qualified (the `lc-toneline` edit reverted in the clone): numstat `1	1`, `.an-svg .lc-toneline {` count `0` |
| U1-3 | the gate is registered and `npm test` runs it | 🟢 | `grep -c '"repo/svg-rules.mjs"' test/run.mjs` = `1`; `npm test` log `▶ repo/svg-rules.mjs       pass`, grep count `1` | entry removed in the clone: `0` |
| U1-4 | the charts render in a real browser with the qualified rules | 🟢 | `npm ci` then `npm run smoke`: `SMOKE PASS — ...` as its tail line (smoke's own output text), 43 `✓`, 0 `✗`, `exit 0`; every `lc-*` path in `color.js` (54, 55, 86, 110, 111, 213) renders inside `h("div", { class: "an-svg", ... })` (61, 89, 117, 216), so the qualified selector still matches; no other source uses the classes (`git grep` finds only `component-inventory.md`) | smoke would fail if a section threw or rendered blank (`SMOKE PASS` missing, `exit 1`). The qualified rule would stop matching if an `lc-*` SVG were built outside `h("div", { class: "an-svg" })`: the containment read would then show that path with no `an-svg` wrapper. Neither case was planted here; smoke checks no computed `fill` |
| P1 | `npm test` green with no `node_modules`, the count agrees, tree byte-stable | 🟢 | `✓ all 49 test files passed`, `exit 0` (2:35 wall under load 18 to 27), `TESTS` = `49` (48 plus U1's one), `git status --short \| wc -l` = `0` after the run | the unregister control in U1-3; the runner's red path is shared by every gate and was not re-proven here |
| P7 | baseline test-file figure equals `TESTS.length` | 🟡 | `STALE tests: baseline 48, test/run.mjs TESTS 49`, `stale total: 1`, `exit 1` | the plan's "Today" cell expects exactly this on unit branches until U5 reruns the baseline; a blocker at pre-land, not here |
| P8 | branding clean, no added record line carries an em dash outside a span | 🔴 | `branding: clean (569 files scanned)`; the added-line scan prints `1`: `.sdlc/handoffs/rule-gates-U1.md:99` `SMOKE PASS — gallery · ...` inside a fenced block (fences are not spans; the reviewer's scan caught `svg-rules.mjs:1` but missed this line). Fix: quote the smoke line in an inline span, or paraphrase it | `BASE` set to `HEAD` prints `0` (the wrong-reason case the plan names); the real hit above is itself the positive control |
| P9 | scope wall | 🟡 | the plan's command prints `1`: `figma/plugin/ui.html` (`-	-` under `--text --numstat`, 3906842 to 3906858 bytes, commit `12897b98` alone). It is the mirror `npm test` regenerates from `styles.css`; leaving it out would break P1's byte-stable tree. The plan's filter should name it; the lead pre-announced it as expected | the filter fed `src/ui/styles.css` and `figma/plugin/ui.html` prints `1`: in-scope files pass, the mirror does not |

## Findings

| # | Sev | Finding | Evidence |
|---|---|---|---|
| F1 | 🔴 | em dash in the U1 handoff's fenced smoke quote | `rule-gates-U1.md:99`; P8 prints `1` |
| F2 | 🟡 | the rule matcher's `\b` after the class accepts a hyphenated superset, so a stray `.an-svg .lc-applied-x { fill: none; }` satisfies `lc-applied` while the real rule is unqualified | probe in the clone: `.lc-applied {` unqualified plus `.an-svg .lc-applied-x { fill: none; }` appended: PASS line, `exit 0`. A `(?![\w-])` lookahead in `findRule` closes it. Not a plan criterion; a follow-up, not a blocker |
| F3 | 🟡 | P9's U1 filter omits the generated mirror `figma/plugin/ui.html` | P9 row above; plan text fix at pre-land or in U5 |

## Host

| Check | Result |
|---|---|
| Chrome on port 9333 after smoke | `lsof` and `pgrep -fl remote-debugging-port=9333` empty |
| Scratch cleanup | `wt-rgU1` removed via `git worktree remove`, `git worktree list \| grep -c wt-rgU1` = `0`; `rgU1-neg` removed |
| Unit tree `.worktrees/rg-U1` | not touched |

## Pass 2 · 🟢 (head `4a5fd7b2`, from `40aae262`)

Delta `40aae262..4a5fd7b2`: `git diff --stat` touches `.sdlc/handoffs/rule-gates-U1.md` and `test/repo/svg-rules.mjs` (one line, `findRule`) and nothing else; `git diff --name-only 40aae262 HEAD -- src` is `0`, so smoke was not rerun. Plan revision 7 on `plan/rule-gates` puts `^figma/plugin/ui\.html$` in the U1 filter. Scratch worktree `wt-rgU1p2` and clone `rgU1p2-neg` removed. Load `26.85` at start and `55.64` at end.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| P8 | branding clean, no added record line carries an em dash outside a span | 🟢 | `branding: clean (569 files scanned)`, added-line scan `0`; handoff line 98 now quotes the smoke line as an inline span | append `x <em dash> y` to the handoff in the clone: scan prints `1` |
| P9 | scope wall (revision 7 filter) | 🟢 | the revision 7 U1 command prints `0` | filter fed `figma/plugin/ui.html` and `src/ui/app.js` prints `1`: the mirror passes, an out-of-scope source does not |
| F2 | the decoy class no longer satisfies a real class | 🟢 | `findRule` now `(?![\\w-])` after the class; P5 PASS line unchanged, `exit 0`; `.an-svg .ty-line, .foo {` still passes | `.lc-applied` unqualified plus `.an-svg .lc-applied-x { fill: none; }`: `FAIL lc-applied: no qualified rule .an-svg .lc-applied`, `exit 1`; the same with `lc-applied_x`: same FAIL |
| P5/P6 regression | the earlier controls still bite at the new head | 🟢 | `svg-rules: 12 html: attributes (stated 12), 6 line classes ...`, `exit 0` | 13th `html:`: `FAIL html: 13 ...`; `ty-line` unqualified: `FAIL ty-line: ...`; `gp-ref` without `fill: none`: `FAIL gp-ref: rule lacks fill: none`; each `exit 1` |
| P1 | `npm test` at the new head | 🟢 | `✓ all 49 test files passed`, `exit 0`, `▶ repo/svg-rules.mjs       pass`, `git status --short \| wc -l` = `0` | carried from pass 1 (unregistering the gate prints `0`) |
| P7 | baseline figure | 🟡 | `sh .sdlc/checks/baseline-agrees-check.sh` as run in pass 1 (not rerun, since the delta leaves `test/run.mjs` and the baseline alone): `STALE tests: baseline 48, test/run.mjs TESTS 49`, `stale total: 1`, which the plan expects until U5 | lowering the baseline figure prints `STALE`, which the planner ran; the live `STALE` line here shows the check bites |
