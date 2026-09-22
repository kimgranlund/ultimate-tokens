---
status: proposed
ticket: #730 (anchor; the plan also closes #727, #728, #724)
priority: P1
lane: tooling (test/repo, one styles.css edit; U4 touches the whole tree once, which is why it waits for G0)
size: S + S + S + M + S (U1 S = 1 point, U2 S = 1, U3 S = 1, U4 M = 2, U5 S = 1; 6 points)
labels: kind:bug · size:small on all four issues as minted; the plan is size:big by the U4 sweep
written: 2026-09-22
head: 3438864b (`origin/main`; `plan/rule-gates` is cut from it, local only, never pushed by the planner)
measured-at: 3438864b and 88905891 (the two heads differ only under `.sdlc/`), in detached scratch worktrees and shared clones, 2026-09-22
depends: #681 landed on `origin/main` before U4 starts (G0 below decides it by command); U1, U2, U3 and U5 do not wait
inputs: issues #730, #727, #728, #724; the triage of 2026-09-22 and the owner's answers (`.sdlc/questions/issue-triage-2026-09-22.md`, copied in with this plan); `.sdlc/adapter.md` §1 to §3 (gates, landing, the verbatim-quote rule); `.sdlc/plans/gate-split.md` (the plan shape and its P1, P7, P8 rows, reused here); `test/repo/branding.mjs`; `test/run.mjs`; `.claude/CLAUDE.md` lines 66 to 68 and the `## Always` block; the `unslop` skill's rule 13 (periods or commas, never an en dash or a hyphen in the dash's place)
---

# Four house rules get a gate each, and the em dash is swept off main before its gate lands at zero

Four rules in `.claude/CLAUDE.md` have no enforcer: the count of `html:` attributes the SVG-chart exception allows (#727), the `fill: none` rule for line-chart paths (#728), the no-em-dash rule (#730), and the claim that `test/repo/branding.mjs` scans every record under `.sdlc/` (#724, it skips `.txt` and `.log`). Each gets a check in `npm test`, each check has a control that fails, and the two that red today (#728 on two `styles.css` rules, #730 on the whole tree) get the fix that turns them green.

The owner ruled on #730 (question 1 of the triage): sweep main first, then gate at zero, no grandfather list. Three things the measurement found that the triage did not say. They change the work, so they come first.

1. The sweep is not 61 lines in `tonal.js` plus a handful of records. At 3438864b the tracked tree carries 16,744 em dashes outside inline code spans, on 12,371 lines in 343 of the 547 tracked text files. By directory: `figma/plugin` 4,374 (2,563 of them in the generated `ui.html`), `src/ui` 3,108, `docs/reference` 2,661, `.claude/skills` 1,199, `src/engine` 894, `test/engine` 519, `docs/marketing` 366, `test/ui` 343, `docs/tickets` 308, `plugin/ultimate-tokens` 297, `figma/binder` 296, `test/figma` 262, `docs/site` 233, `CHANGELOG.md` 148, and 30 in `.claude/CLAUDE.md` itself (27 lines). A hand sweep at that size is an L unit with a wide review; a mechanical one is an M unit whose diff can be checked by invariant. So the gate ships with a `--fix` mode, and the sweep is one run of it (measured below: the whole suite stays green after it).
2. The backtick exemption belongs to Markdown only. `.sdlc/adapter.md` §3 exempts an inline code span because a span quotes program output byte for byte. In a `.js` or `.mjs` file a backtick opens a template literal, which is a string the program prints. The first dry run exempted those too and left 66 dashes in 11 generated files (the Stitch and Figma Make README headings, `adia-oklch-export.css`, the category mirrors), and `test/engine/exports.mjs` went red because its regex had been swept while the template it matched had not. The rule the gate applies: in `*.md`, a dash inside an inline span does not count; everywhere else every dash counts.
3. Two lines of code name the glyph on purpose. `.claude/skills/ultimate-tokens-brand-voice/scripts/voice-check.mjs:89` counts em-dash pivots in marketing copy with a regex that carries the literal glyph; a blind sweep turns it into `/, (?:not|never|no)\b/`, which matches every ordinary ", not" and silently changes what the voice gate measures. `.sdlc/checks/doc-drift-rows-check.sh:19` already writes it as `String.fromCharCode(0x2014)`. The rule: code that must name the glyph writes the escape `\u2014`, never the character, and the gate's own file follows it (P2 checks that the gate is not exempt from itself).

Scope wall. U1: `test/repo/svg-rules.mjs` (new), `test/run.mjs` (one entry), `src/ui/styles.css` (two lines). U2: `test/repo/branding.mjs`. U3: `test/repo/em-dash.mjs` (new). U4: every tracked file that carries the glyph, and only the lines that carry it, plus `test/run.mjs` (one entry), one hand edit in `voice-check.mjs`, and one line added to `.claude/CLAUDE.md` `## Always` (adapter X9: the owner's approval of this plan is the approval of that edit and of the 27 swept lines there). U5: `.sdlc/baseline.md`, `.sdlc/adapter.md` §1 (the test row's time range only). Every unit: its own handoff, verdict and questions under `.sdlc/`. `package.json` and `.github/workflows/ci.yml` are untouched: no new script, no new CI job, because every gate here runs in well under a second and belongs in `npm test` (#713 moves slow sweeps out; these are not slow).

Prose rules for every line this plan adds. No em dash outside an inline backtick span that quotes program output. No bold inline labels. The retired maker brand is paraphrased, never quoted. `grep -P` is absent on this host: PCRE runs through `perl -CSD`, and a flagless `perl -ne '/\x{2014}/'` on a byte stream never matches (#730 names this trap; measured below).

Criteria ids: P rows for the plan, numbered rows per unit, cited as U3-2. G0 is U4's start gate.

## Measured by the planner on 2026-09-22

### The em dash on main (3438864b, tracked files, `git ls-files`, binaries skipped)

| Fact | Value |
|---|---|
| Tracked text files read | 547 (`git ls-files` minus `png ico woff2 ttf otf jpg gif webp zip pdf`) |
| Dashes outside Markdown inline spans | 16,744 in 343 files, on 12,371 lines |
| Dashes inside Markdown inline spans | 46 (exempt: verbatim quotes of program output, most of them `SMOKE PASS` and gate lines in `.sdlc/verdicts/`) |
| Generated files that carry them | `figma/plugin/ui.html` 2,563, `src/ui/categories/*.js`, `src/ui/*-assets.js`, `docs/reference/data/adia-oklch-export.css`, `docs/img/palette-preview.svg`; all regenerate from swept sources (the first dry run proved it: with template literals exempt, exactly these files kept 66 dashes) |
| Code whose logic reads the glyph | `voice-check.mjs:89` (a regex with the literal glyph), `doc-drift-rows-check.sh:19` (already `0x2014`). Nothing splits, indexes or compares on it elsewhere (searched `src scripts mcp test figma plugin .claude` for `split(`, regex literals, `includes(`, `indexOf(`, `===` carrying the glyph) |
| Lines that would double up punctuation under a plain comma rule | 17, all of the shape `sentence. — PR #300`; the fix rule drops the dash after `.` as well as after `, : ; (` |
| Empty table cells written as a lone dash | 45 |
| Numeric ranges written with the dash | 128 |
| Added by live branches, `git diff origin/main <branch>`, added lines, spans stripped | `plan/preset-intent-fidelity` (#681) 601; `plan/gate-split` (#713) 602 (it includes #681); `plan/lane-b-tickets` 2; `plan/adia-library-uplift` 2; `plan/gate-gaps`, `plan/chroma-floor`, `plan/records-followup-roadmap` 0 |

### The dry run: prototype `--fix` on a detached worktree at 88905891, then `npm test` with no `node_modules`

| Step | Result |
|---|---|
| `--fix`, revision 1 (template literals exempt like Markdown spans) | 342 files, 9,046 lines replaced; `npm test` `✗ 1/48 test file(s) failed`: `engine/exports.mjs`, `FAIL  design-system-stitch` and `FAIL  design-system-make` (the README heading regex swept, the template literal not); 66 dashes left in 11 generated files after regeneration |
| `--fix`, revision 2 (Markdown spans exempt, code swept whole, rules run on the whole line with spans masked) | 343 files changed, 9,334 insertions, 9,334 deletions, every file's insertions equal its deletions, no file changes line count; dashes outside spans after the run: 0 |
| `npm test` on that tree, 2:56 wall at load about 6 | exit 0, `✓ all 48 test files passed`; `git status --short` lists the same 343 files, so every regenerated asset is byte-stable against the swept sources; dashes outside spans after regeneration: 0 |
| Removed diff lines that did not carry the glyph | 1 of 9,334, the no-newline-at-end line of `docs/img/palette-preview.svg`; every other removed line carried it |
| `.claude/CLAUDE.md` | 27 lines changed, 27 removed, 27 added |
| `voice-check.mjs:89` after the blind sweep | `if (/, (?:not|never|no)\b/i.test(text)) pivots += 1;`, the defect described above; U4 writes it as `—` by hand |

### The fixture the fix rules were run on (a two-file git repo, then `--fix` twice)

| Input line (file) | After the first `--fix` | Second `--fix` |
|---|---|---|
| `a — b` (`f.md`) | `a, b` | unchanged |
| `\| x \| — \|` (`f.md`) | `\| x \| none \|` | unchanged |
| `2026-07-17 — 2026-07-29` (`f.md`) | `2026-07-17 to 2026-07-29` | unchanged |
| a span carrying the dash, then ` — not me` outside it (`f.md`) | the span byte for byte, then `, not me` | unchanged |
| `— lead` (`f.md`) | `- lead` | unchanged |
| `trail —` (`f.md`) | `trail.` | unchanged |
| a template literal and a comment each carrying the dash (`f.mjs`) | both swept to `, ` | unchanged |

`git diff --stat` read `2 files changed, 7 insertions(+), 7 deletions(-)` after both runs, which is the idempotence control.

### The other three gates, prototyped against 3438864b

| Gate | Today |
|---|---|
| #727 `html:` count | `/\bhtml:\s*\w/` over the three section files: color 6, geometry 3, typography 3, total 12; `.claude/CLAUDE.md` line 68 states `12 live attributes`; every one of the 12 sits on an `h("div", { class: "an-svg...", html: svg })` call. No other `html:` attribute is passed to `h()` anywhere under `src/ui` (the two other `html:` hits in `src/engine` are object keys in the design-system bundle, not `h()` attributes) |
| #728 line paths | seven `<path class="...">` classes in the three files: `lc-ceiling` (an area: filled band with `stroke: none`, the one intended fill), `lc-toneline`, `lc-applied`, `gp-ref`, `gp-icon`, `gp-font`, `ty-line`. Qualified `.an-svg .<class>` rules with `fill: none` exist for the four `gp-*`/`ty-*` classes; `lc-toneline` and `lc-applied` are ruled at `styles.css:826-827` unqualified. The prototype prints `FAIL lc-toneline (color)`, `FAIL lc-applied (color)`, four `pass`. Every one of the 12 containers carries class `an-svg`, so qualifying the two rules cannot lose them |
| #724 branding filter | `node test/repo/branding.mjs` in a shared clone: `branding: clean (532 files scanned)`; with `.sdlc/records/x/run.log` and `run.txt` planted, each carrying the retired maker name in uppercase: still `branding: clean (532 files scanned)`, the count does not move, which is the defect. Tracked files the `TEXT` allow-list never opens: four `.sh`, `LICENSE`, `.gitignore`, `.gitattributes` (7 text files) plus five `.png` and one `.ico` (binary). A deny-list of binary extensions reads the 7 and skips the 6: expected count in a clone 539 |

### Host and record facts

| Fact | Value |
|---|---|
| `TESTS` in `test/run.mjs` | 48 at 3438864b. #681 adds `engine/anchor.mjs`, #713 adds `engine/corpus-sample.mjs`; this plan adds `repo/svg-rules.mjs` (U1) and `repo/em-dash.mjs` (U4). N at pre-land is measured by P1, not typed in |
| `sh .sdlc/checks/baseline-agrees-check.sh` | `stale total: 0` with a `note  head:` line (the tree moved since `20298cc`). In a clone with the baseline's figure lowered to 47: `STALE tests: baseline 47, test/run.mjs TESTS 48`, `stale total: 1`. The exit code is read only without a pipe after the script: `sh ...; echo "exit $?"`, since `\| tail` hides it |
| Newest completed CI run on `main` | `success`; jobs `build-test`, `panda-smoke`, `corpus-contrast`, `deploy` all `success` |
| The byte-read trap (#730) | `perl -ne 'print if /\x{2014}/'` on a one-line file carrying the glyph prints 0 lines; `perl -CSD -ne ...` prints 1. In node, `readFileSync(f, "utf8")` finds 62 in `src/engine/tonal.js`, `readFileSync(f, "latin1")` finds 0 |
| Open PRs | #720 (draft, the #709 roadmap), #158 (draft, held). #681's branch has no PR yet |

## The design, stated once

Four gates, three files. `test/repo/svg-rules.mjs` (U1) holds #727 and #728, because both are the entry file's SVG-chart rules and both read the same three section files. `test/repo/branding.mjs` (U2) keeps its shape and inverts its filter. `test/repo/em-dash.mjs` (U3, registered by U4) is the em-dash gate and its fix.

`svg-rules.mjs`. (a) Reads `.claude/CLAUDE.md`, takes the number from the line matching `SVG-chart exception: (\d+) live attributes`, counts `/\bhtml:\s*\w/g` over `src/ui/sections/{color,geometry,typography}.js`, fails on any difference, naming both numbers. (b) Collects every `<path class="<first-class>` in the same three files, in order of first appearance; for each class not in the AREA set (`lc-ceiling`, with the reason: a filled band, `stroke: none`, the rule at `styles.css` must declare a `fill` that is not `none`), requires `src/ui/styles.css` to hold a rule whose selector line starts `.an-svg .<class>` and whose block declares `fill: none`; fails naming the class and which half is missing (no qualified rule, or the rule without `fill: none`). An unknown class with no rule at all fails the same way, which is how a new line chart is caught. Its PASS line prints the two counts: `svg-rules: 12 html: attributes (stated 12), 6 line classes qualified with fill: none, 1 area class`.

`branding.mjs`. `TEXT` (an allow-list of 11 extensions) becomes `BINARY`, a deny-list: `woff2 woff ttf otf png jpg jpeg gif ico webp zip pdf`. Everything else the walk reaches is opened. Nothing else in the file moves: the walk, `SKIP_DIRS`, `SKIP_FILES`, `RECORDS`, the three patterns and the allow-list stay as they are. The scanned count rises by the 7 files named above.

`em-dash.mjs`. Reads `git ls-files -z` from the repo root (tracked files are what a commit ships; the gitignored `.sdlc/runtime/` and any scratch file never count), skips the same `BINARY` set, reads each file as `utf8`, and counts U+2014 per line. In a `.md` file the inline spans (a backtick, any run of non-backtick characters, a backtick; the same strip adapter §3 rules) are masked first; in every other file nothing is masked. Any count above zero is a FAIL that names `path:line` for the first 40 hits and the totals: `FAIL: N em dashes outside inline code spans in M files`. Zero prints `em-dash: clean (K files scanned)`. The glyph is written in the source as `\u2014` only, so the gate's own file passes the gate. Before the tree scan it runs its self-test on in-memory fixtures (the seven fixture rows above plus a `.md` line whose dash is inside a span, a `.mjs` line whose dash is inside a template literal, and idempotence), so a broken rule fails before it can go vacuously green on the tree; the self-test runs inside `npm test` every time, like `citations.mjs` runs the audit's self-test.

`--fix`. The same walk and the same masking, then per line, in this order, with the spans masked: a lone table cell `| — |` becomes `| none |`; a digit, the dash, a digit becomes `<digit> to <digit>`; a dash that opens the line becomes `- `; a dash that ends the line becomes `.`; a dash after `, : ; ( .` is dropped; every remaining dash, with the spaces around it, becomes `, `. Spans are restored, the file is written only if it changed, and the line count is asserted equal before and after. The rules are context-free on purpose: a late-landing branch runs the same command on its own tree and gets the same bytes main got, so a rebase conflict on a swept file is settled by taking the branch's side and running `--fix` again. Prose quality after the rule is that of a comma splice where an em dash stood, which the `unslop` skill's rule 13 accepts and the owner's question 1 chose over a grandfather list; polishing any file by hand afterwards is ordinary editing under a gate that stays at zero. `--fix` never touches a Markdown inline span, so the verbatim quotes in `.sdlc/` records keep their bytes, and never touches the `\u2014` escape, so the two code lines that name the glyph keep working.

How a late-landing branch is caught. Once U4 is on `main`, `npm test` reds on any tree that carries the glyph, so `build-test` reds on the branch's PR the moment it rebases, and locally the moment its builder runs the gate. The repair is `node test/repo/em-dash.mjs --fix` on that tree, then `npm test` to regenerate the mirrors, then a commit. No allow-list, no baseline count, no merge-base arithmetic: the tree is clean or it is not. #681's 601 added dashes are swept by U4 itself because U4 starts only after #681 has landed (G0). `plan/gate-split` (#713) carries the same 601 plus one of its own; if it lands before U4, U4 sweeps it; if after, its rebase reds and the command above repairs it (question Q4 recommends the first).

## G0: has #681 landed (U4's step 1, and the Orchestrator's before it cuts the U4 worktree)

```sh
git fetch -q origin
gh issue view 681 --json state --jq .state
git cat-file -e origin/main:test/engine/anchor.mjs; echo $?
git merge-base --is-ancestor origin/main plan/rule-gates; echo $?
```

Expected `CLOSED`, `0`, `0`. Today `OPEN`, `128` (with git's `fatal:` line), `0`. The last line is the Orchestrator's own step: once the first two are green it merges the new `origin/main` into `plan/rule-gates` (a merge, not a rebase, because U1 to U3 may already be on the branch and verified) and only then cuts the U4 worktree. `test/run.mjs` conflicts on the `TESTS` line with #681 (and with #713 if it has landed): every entry is kept. A U4 builder that sees any other value stops and reports `G0 red`.

## Criteria (plan-level: each builder runs the rows its unit names, each verifier reruns them, pre-land runs them all)

Every negative control that edits a file runs in a throwaway clone (`git clone -q --shared . "$F/neg"`), never in a unit worktree, and the handoff says how the clone carries the change under test (cloned from the unit's commit, or the working tree copied in) with a command that proves it (adapter §2.1, U6-12 of gate-split). `F` is a directory the seat makes under its own scratchpad with a name no other seat would pick, and removes by that exact name. In table cells `\|` is the escape for a plain `|`: type it unescaped. `BASE` is `$(git merge-base plan/rule-gates HEAD)` on a unit branch and `origin/main` at pre-land. `N` is the length of `TESTS` on the branch, by P1's command. `B` is the retired maker name in uppercase, typed by the seat at the keyboard and never written into a record (the branding gate has no quote exemption, adapter X12).

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| P1 | `npm test` green with no `node_modules`, the count agrees, the tree is byte-stable | `npm test 2>&1 \| tail -1; perl -0ne 'my ($b) = /const TESTS = \[(.*?)\];/s; my @m = $b =~ /"[^"]+\.mjs"/g; print scalar(@m), "\n"' test/run.mjs; git status --short \| wc -l` | the runner's pass line naming N files, then N, then `0`. N is 48 at 3438864b plus one per registered file: U1 adds `repo/svg-rules.mjs`, U4 adds `repo/em-dash.mjs`, and #681 and #713 add one each when they land; the builder cites the value it measured | in the swept dry-run tree: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test > "$F/neg.log" 2>&1; echo "exit $?"` prints `exit 1` (run by the planner on the swept tree: `✗ 1/48 test file(s) failed`, `exit 1`) | `✓ all 48 test files passed`, `48`, `0` on the swept tree at 88905891 (run by the planner); the same at 3438864b unswept is main's live baseline |
| P2 | the em-dash gate is at zero over the tracked tree, is Unicode-aware, and is not exempt from itself | `node test/repo/em-dash.mjs; echo "exit $?"; grep -c 'u2014' test/repo/em-dash.mjs; grep -c "$(printf '\xe2\x80\x94')" test/repo/em-dash.mjs; grep -c '"utf8"' test/repo/em-dash.mjs` | `em-dash: clean (K files scanned)` with K at or above 547, `exit 0`, then `1` or more, `0`, `1` or more | three, in the clone. (a) `printf 'x \xe2\x80\x94 y\n' >> README.md; git add README.md`: `FAIL: 1 em dashes outside inline code spans in 1 files`, the line `README.md:<n>`, `exit 1`. (b) `printf 'x \x60\xe2\x80\x94\x60 y\n' >> README.md` (`\x60` is the backtick): `clean`, `exit 0` (the Markdown span is exempt). (c) `printf 'const s = \x60\xe2\x80\x94\x60;\n' >> test/run.mjs`: `FAIL: 1 ...`, `exit 1` (a template literal is not exempt). (d) In the gate's source, change `"utf8"` to `"latin1"`: (a) prints `clean`, which is the #730 vacuity trap, caught by the third grep. The planner ran the equivalents against the prototype: (a) to (c) as the fixture table (a `.md` span kept, a template literal swept), (d) as the `latin1` read of `tonal.js` printing 0 against 62 | file absent. The prototype at 3438864b: 16,744 in 343 files |
| P3 | `--fix` is deterministic, idempotent, line-count-preserving, and leaves zero | in the clone: `node test/repo/em-dash.mjs --fix; git diff --stat \| tail -1; node test/repo/em-dash.mjs --fix; git diff --stat \| tail -1; git diff --numstat \| awk '$1!=$2{n++} END{print n+0}'; node test/repo/em-dash.mjs \| tail -1` | the two stat lines identical, `0`, then `em-dash: clean (K files scanned)` | the fixture table above, run through `--fix` twice in a two-file repo: seven rows as printed, second run `2 files changed, 7 insertions(+), 7 deletions(-)` unchanged (run by the planner on the prototype) | prototype revision 2 at 88905891: `343 files changed, 9334 insertions(+), 9334 deletions(-)` both times, `0`, `clean` |
| P4 | `branding.mjs` opens every text file it walks past, by deny-list | in the clone: `mkdir -p .sdlc/records/x; for e in log txt foo; do printf "$B\n" > .sdlc/records/x/run.$e; done; node test/repo/branding.mjs \| tail -1; rm -r .sdlc/records/x; node test/repo/branding.mjs \| tail -1` | `FAIL: 3 branding violation(s) across <K+3> files`, then `branding: clean (K files scanned)` with K = 539 in a clone of 3438864b (re-measured at the unit's base: every tracked text file the old allow-list skipped adds one) | the same three planted files against the old filter: `branding: clean (532 files scanned)` twice (run by the planner) | `clean (532)` with and without the planted files |
| P5 | the `html:` count gate agrees with the entry file and bites both ways | `node test/repo/svg-rules.mjs; echo "exit $?"` | `svg-rules: 12 html: attributes (stated 12), 6 line classes qualified with fill: none, 1 area class`, `exit 0` | two, in the clone with the two rules qualified. (a) `printf '\nexport const zz = h("div", { html: svg });\n' >> src/ui/sections/color.js`: `FAIL html: 13 html: attributes, .claude/CLAUDE.md states 12`, `exit 1` (an attribute with an empty string value, `html: ""`, is not counted by `\bhtml:\s*\w`, so the control uses a value). (b) `sed -i '' 's/exception: 12 live/exception: 13 live/' .claude/CLAUDE.md`: `FAIL html: 12 html: attributes, .claude/CLAUDE.md states 13`, `exit 1`. Both run by the planner against the prototype | prototype at 3438864b with the two rules qualified: the PASS line as expected; file absent |
| P6 | every line-chart path is ruled `fill: none` through a qualified selector | as P5 (same file) | as P5 | three, in the clone. (a) `sed -i '' 's/^\.an-svg \.ty-line /.ty-line /' src/ui/styles.css`: `FAIL ty-line: no qualified rule .an-svg .ty-line`, `exit 1`. (b) `sed -i '' 's/^\.an-svg \.gp-ref { fill: none; /.an-svg .gp-ref { /' src/ui/styles.css`: `FAIL gp-ref: rule lacks fill: none`, `exit 1`. (c) `printf '<path class="zz-line" d=""/>' >> src/ui/sections/geometry.js`: `FAIL zz-line: no qualified rule .an-svg .zz-line`, `exit 1`. All three run by the planner against the prototype in a clone with the two rules qualified, each printing exactly that line and `FAIL: 1` | prototype at 3438864b, rules unqualified: `FAIL lc-toneline: no qualified rule .an-svg .lc-toneline`, `FAIL lc-applied: no qualified rule .an-svg .lc-applied`, `FAIL: 2` |
| P7 | the landing rule for every plan after #691: the baseline's test-file figure equals `TESTS.length`, by script, at the pre-land head | `sh .sdlc/checks/baseline-agrees-check.sh; echo "exit $?"` | every line `ok` or `note`, `stale total: 0`, `exit 0` | in the clone, lower the baseline's test-file figure by one: `STALE tests: baseline 47, test/run.mjs TESTS 48`, `stale total: 1`, `exit 1` (run by the planner) | `stale total: 0`, one `note  head:` line. Goes `STALE` the moment U1 registers its file, and stays so until U5 reruns the baseline; expected on unit branches, a blocker at pre-land |
| P8 | branding clean, and no line this plan's records add carries an em dash outside a span (until U4 lands, after which P2 covers every file) | `bash -c 'set -o pipefail; node test/repo/branding.mjs \| tail -1'; git diff $BASE \| grep -v '^+++ ' \| grep '^+' \| perl -CSD -ne 's/`[^`]*`//g; print if /\x{2014}/' \| wc -l` | `branding: clean (K files scanned)`, then `0` | in the clone: `cp docs/reference/references/decision-records.md .sdlc/verdicts/x.md` reds the first (the RECORDS exemption is by path); one added `.md` line with the dash makes the second `1` | clean, `0` on the plan branch (run by the planner after the plan commit) |
| P9 | scope wall, and the sweep touched only lines that carried the glyph | U1, U2, U3, U5: `git diff --name-only $BASE \| grep -v -E -e '^test/repo/(svg-rules\|em-dash\|branding)\.mjs$' -e '^test/run\.mjs$' -e '^src/ui/styles\.css$' -e '^\.sdlc/' \| wc -l`. U4: `git diff -U0 $BASE -- . ':!docs/img' \| grep -v '^--- ' \| grep '^-' \| grep -vc "$(printf '\xe2\x80\x94')"; git diff --numstat $BASE -- . ':!test/run.mjs' ':!.claude/CLAUDE.md' ':!.sdlc' \| awk '$1!=$2{n++} END{print n+0}'` | `0` for the four small units. U4: `0` (every removed line outside `docs/img` carried the glyph) and `0` (insertions equal deletions in every swept file; `test/run.mjs`, `.claude/CLAUDE.md` and the unit's records are excluded because they gain a line each). `wc -l` and `grep -c` always exit 0, so nothing here needs `\|\| true`; `grep -vc` prints `0` on an empty input | the U4 pair on the revision-2 dry run: `1` before `':!docs/img'` was added (the SVG's no-newline line) and `0` with it; `0` for the numstat. A fixture name `src/engine/hct.js` through the small-unit filter prints `1` (run by the planner) | dry run: `1` then `0`, `0` |
| P10 | CI green on the draft PR's newest completed run, every job named | `R=$(gh run list --workflow ci.yml --branch plan/rule-gates --status completed --limit 1 --json databaseId --jq '.[0].databaseId'); gh run view $R --json conclusion,jobs --jq '.conclusion, (.jobs[] \| [.name,.conclusion] \| @tsv)'` | `success`, then one `success` row per job: `build-test`, `panda-smoke`, `corpus-contrast`, and `sweeps` legs if #713 has landed; `deploy` is absent on a PR run | the same jq over the newest `main` run prints a `deploy` row, which a PR run never has; a PR run missing a job the workflow defines is not 🟢 | newest `main` run: `success`, four `success` rows (run by the planner) |

## Units

Checklist (the Orchestrator ticks it; the table below carries grades and paths):

- [ ] U1 (S) `svg-rules.mjs`: the `html:` count and the `fill: none` gate, two `styles.css` rules qualified · builder-l2 · reviewer-l1 · verifier-l1
- [ ] U2 (S) `branding.mjs`: allow-list of text extensions becomes a deny-list of binary ones · builder-l1 · reviewer-l1 · verifier-l1
- [ ] U3 (S) `em-dash.mjs`: the gate, its self-test and `--fix`, unregistered until U4 · builder-l3 · reviewer-l2 · verifier-l2
- [ ] U4 (M) the sweep of main after G0, the gate registered, the two hand edits · builder-l3 · reviewer-l2 · verifier-l2
- [ ] U5 (S) figures of record: baseline `npm test` row and N, adapter §1 test-row range · builder-l2 · reviewer-l1 · verifier-l1

Grades come from the Orchestrator's table: L1 and L2 builders get reviewer-l1 and verifier-l1; L3 builders get reviewer-l2 and verifier-l2. Order: U1, U2 and U3 in any order or in parallel (different files; U1 alone touches `test/run.mjs`), then U4 after G0, then U5 last. U3 is L3 because the Markdown-only span rule and the code-whole rule are easy to get subtly wrong in either direction (the first dry run got it wrong and went red in `exports.mjs`); U4 is L3 because its diff is 343 files and its review is by invariant, not by reading.

| Unit | Size | Builder | Reviewer | Verifier | Touches |
|---|---|---|---|---|---|
| U1 `svg-rules.mjs`, two rules qualified | S | builder-l2 | reviewer-l1 | verifier-l1 (runs `npm run smoke`: `src/ui/` changed) | `test/repo/svg-rules.mjs`, `test/run.mjs`, `src/ui/styles.css` |
| U2 `branding.mjs` deny-list | S | builder-l1 | reviewer-l1 | verifier-l1 | `test/repo/branding.mjs` |
| U3 `em-dash.mjs` gate and `--fix` | S | builder-l3 | reviewer-l2 | verifier-l2 | `test/repo/em-dash.mjs` |
| U4 the sweep, registered | M | builder-l3 | reviewer-l2 | verifier-l2 (runs `npm run smoke`) | every tracked file carrying the glyph; `test/run.mjs`; `voice-check.mjs:89`; one `.claude/CLAUDE.md` line |
| U5 figures of record | S | builder-l2 | reviewer-l1 | verifier-l1 | `.sdlc/baseline.md`, `.sdlc/adapter.md` §1 |

### U1: `svg-rules.mjs`

Steps. (1) Write the file as the design states, two gates, one PASS line. (2) Qualify `styles.css:826-827`: `.lc-toneline {` becomes `.an-svg .lc-toneline {` and `.lc-applied {` becomes `.an-svg .lc-applied {`, declarations untouched. (3) Register `"repo/svg-rules.mjs"` in `TESTS` after `"repo/gate-report.mjs"`.

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U1-1 | P5 and P6 | as P5, P6 | as P5, P6 | as P5, P6 | as P5, P6 |
| U1-2 | exactly the two rules moved, and only their selectors | `git diff --numstat $BASE -- src/ui/styles.css; grep -c '^\.an-svg \.lc-toneline {' src/ui/styles.css; grep -c '^\.an-svg \.lc-applied {' src/ui/styles.css; grep -c '^\.lc-toneline {' src/ui/styles.css; grep -c '^\.lc-applied {' src/ui/styles.css; git diff -U0 $BASE -- src/ui/styles.css \| grep '^[-+]' \| grep -v '^[-+][-+]' \| grep -c 'fill: none;'` | `2	2	src/ui/styles.css`, `1`, `1`, `0`, `0`, `4` (both lines, both sides, still declare `fill: none`) | qualify only one rule in the clone: numstat `1	1` and one of the first pair `0` | `0	0`, `0`, `0`, `1`, `1`, `0`; with the two rules qualified in a clone the planner read `2	2` and `4` |
| U1-3 | the gate is registered and `npm test` runs it | `grep -c '"repo/svg-rules.mjs"' test/run.mjs; npm test 2>&1 \| grep -c '^▶ repo/svg-rules.mjs'` | `1`, `1` | remove the entry in the clone: `0`, `0` | `0`, `0` |
| U1-4 | the charts still render in a real browser with the qualified rules | `npm run smoke \| tail -1` (verifier; needs `node_modules` and Chrome) | the `SMOKE PASS` line | none: a real-browser run | green on main |

### U2: `branding.mjs`

Steps. (1) Replace the `TEXT` allow-list with the `BINARY` deny-list named in the design, and the `!TEXT.test(rel)` guard with `BINARY.test(rel)`. (2) Reword the comment above it to say what is skipped and why (binaries only; a new text-ish extension is covered by default, which is #724's point). (3) Run the gate in a clone with the three planted files.

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U2-1 | P4 | as P4 | as P4 | as P4 | as P4 |
| U2-2 | the filter is a deny-list and names no text extension | `grep -c 'const TEXT' test/repo/branding.mjs; grep -c 'const BINARY' test/repo/branding.mjs; grep -cE 'BINARY = /.*\b(md\|mjs\|txt\|log)\b' test/repo/branding.mjs` | `0`, `1`, `0` | add `txt` to the deny-list in the clone: the third prints `1`, and P4's planted `.txt` goes uncounted (`FAIL: 2`) | `1`, `0`, `0` |
| U2-3 | the untracked-worktree guard still holds: the root checkout's count does not include nested worktrees | `node test/repo/branding.mjs \| tail -1` in the root checkout and in a clone | both `clean`; the root count exceeds the clone's only by the root's untracked text files (the builder lists them with `git status --short --ignored \| wc -l` and cites the two counts) | none: an observation the handoff records | root 602, clone 532 |

### U3: `em-dash.mjs`

Steps. (1) Write the gate, the self-test and `--fix` as the design states, the glyph written as `\u2014` throughout. (2) Do not register it: on the unswept tree it reds, and the plan branch stays green until U4. (3) Run P2's four controls and P3 in a clone; run the gate on the unit's own tree and cite its FAIL totals in the handoff (they are the figure U4 sweeps).

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U3-1 | the gate reds on the unswept tree with the measured totals, and the self-test passes first | `node test/repo/em-dash.mjs > "$F/g.log" 2>&1; echo "exit $?"; grep -c '^self-test: ' "$F/g.log"; tail -1 "$F/g.log"` | `exit 1`, `1`, `FAIL: <N> em dashes outside inline code spans in <M> files` with N and M as measured on the unit's base (16,744 in 343 at 3438864b; #681 adds about 601 lines' worth) | in the clone, break one rule of the self-test's fixture expectations (change `| none |` to `| - |` in the fixture): the run stops at `self-test: FAIL` before the tree scan, `exit 1`, and no `FAIL: <N> em dashes` line prints | file absent |
| U3-2 | P2's controls (a) to (d) and P3, in the clone | as P2, P3 | as P2, P3 | as P2, P3 | as P2, P3 |
| U3-3 | not registered, and the plan branch is green | `grep -c '"repo/em-dash.mjs"' test/run.mjs; npm test 2>&1 \| tail -1` | `0`, the runner's pass line | none: registration is U4's | `0`, green |
| U3-4 | `--fix` leaves a Markdown span and the `\u2014` escape alone | in the clone, after `--fix`: `grep -c 'SMOKE PASS \x60' .sdlc/verdicts/records-refresh-U3.md` (with the backtick typed in place of `\x60`); `grep -c '\\u2014' .claude/skills/ultimate-tokens-brand-voice/scripts/voice-check.mjs` (run after U4's hand edit exists; on U3 alone this second grep is `0` and is recorded, not graded) | the first `1` or more, the verdict's span intact byte for byte (`git diff --stat -- .sdlc/verdicts/records-refresh-U3.md` shows the file changed only if it carried a dash outside a span) | a `--fix` that strips spans changes that line: the grep prints `0` | the span exists |

### U4: the sweep

Steps. (1) G0. (2) `node test/repo/em-dash.mjs --fix`, then `npm test` so every generated mirror regenerates from the swept sources (the drift gate proves them byte-stable). (3) By hand: `voice-check.mjs:89` reads `/ \u2014 (?:not|never|no)\b/i`; register `"repo/em-dash.mjs"` in `TESTS` after `"repo/svg-rules.mjs"`; add one bullet to `.claude/CLAUDE.md` `## Always` reading: No U+2014 anywhere in the tree; `test/repo/em-dash.mjs` gates it in `npm test`, and `node test/repo/em-dash.mjs --fix` repairs a branch. (4) `npm test` green, `npm run build` green, `npm run smoke` green (the verifier's, since `src/ui/` changed). (5) The handoff lists the by-directory counts the gate printed before the fix and the diff stat after.

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U4-1 | G0 | as G0 | `CLOSED`, `0`, `0` | none: a gate | `OPEN`, `128`, `0` |
| U4-2 | P2, P3, P9 (the U4 pair), P1 | as those rows | as those rows | as those rows | as those rows |
| U4-3 | the gate is registered | `grep -c '"repo/em-dash.mjs"' test/run.mjs; npm test 2>&1 \| grep -c '^▶ repo/em-dash.mjs'` | `1`, `1` | remove the entry in the clone: `0`, `0` | `0`, `0` |
| U4-4 | the voice gate's pivot regex survived the sweep and still bites | `grep -c 'u2014 (?:not' .claude/skills/ultimate-tokens-brand-voice/scripts/voice-check.mjs; printf 'Ships today \xe2\x80\x94 not someday.\n' > "$F/v.md"; node .claude/skills/ultimate-tokens-brand-voice/scripts/voice-check.mjs "$F/v.md" 2>&1 \| grep -ci 'pivot'` | `1`, then `1` or more (the pivot is counted or warned on; the builder quotes the line it prints) | with the blindly swept regex (`/, (?:not...`) the first prints `0`, and a fixture line `Ships today, not someday.` counts a pivot it should not | the file carries the literal glyph: first `0` |
| U4-5 | the entry file states the rule and the repair | `grep -c 'test/repo/em-dash.mjs' .claude/CLAUDE.md; grep -c 'em-dash.mjs --fix' .claude/CLAUDE.md; git diff --numstat $BASE -- .claude/CLAUDE.md` | `1` or more, `1`, `28	27	.claude/CLAUDE.md` (27 swept lines plus the one added; re-measured if the file changed at G0) | drop the line in the clone: `0`, `0`, `27	27` | `0`, `0` |
| U4-6 | the three record checks under `.sdlc/checks/` still pass on the swept records | `for c in doc-drift-rows-check card-source-range-check card-amendment-check; do sh .sdlc/checks/$c.sh > "$F/$c.log" 2>&1; echo "$c exit $?"; done` | three `exit 0` | none: a rerun of existing checks (a quote cell and its source line are swept by the same rule, so `doc-drift-rows-check` keeps matching; a sweep that changed line counts would move every cited range, which P3 forbids) | three `exit 0` on main (run by the planner) |

### U5: figures of record

Steps. (1) U1 to U4 merged. (2) Under the quiet-host rule of `.sdlc/adapter.md` §1 (load under 5 at the start of every counted run, no hot process, nothing matching `[t]est/run.mjs`), run `npm test` three times in the unit worktree with no `node_modules`; the handoff's Runs table is the one gate-split U6-3 specifies, rejected runs in their own table. (3) `.sdlc/baseline.md`: the `npm test` row's three figures and its summary cell (byte for byte from the runner, in a span), `ref` to the unit's base, a `supersedes` note; the prior row moves to the prior set. (4) `.sdlc/adapter.md` §1 test row: the time range only, rounded as the check script rounds. (5) `sh .sdlc/checks/baseline-agrees-check.sh` green.

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U5-1 | P7 | as P7 | `stale total: 0`, `exit 0`, including `ok    tests:` and `ok    time test:` | as P7 | `STALE` from U1 on |
| U5-2 | the baseline's `npm test` row names N and three quiet runs | `grep '^[\|] .npm test. [\|]' .sdlc/baseline.md \| awk -F'[\|]' '{print $3, $5, $6}'`; the handoff's Runs table read as gate-split U6-3 reads it | `3/3`, three figures, a span reading `✓ all N test files passed` with N from P1; every counted run's load-before cell under 5 | a counted row retyped to load 6.3 fails the verifier's reading; a figure of two runs prints `2/3` and the check script's `time test:` line reads `STALE` | `3/3`, `56.27 · 56.43 · 59.83`, 48 |

## Not in scope

| Item | Why | Where it goes |
|---|---|---|
| Hand-polishing prose the comma rule left flat (marketing copy, README, palette narratives, skill bodies) | The owner chose a sweep over a grandfather list; the sweep is mechanical so a late branch can reproduce it. Any file can be rewritten afterwards under a gate that stays at zero | the owning seat, on its own schedule (`marketing-manager-agent` for `docs/marketing/`, the palette researcher for category JSON) |
| An en dash or hyphen in the dash's place | `unslop` rule 13 bans the substitution; the en dash stays unbanned as punctuation the repo's skills already use (gate-split P8) | none |
| A diff-based gate with a merge-base | The tree is zero after U4, so a whole-tree scan is simpler and has no base to get wrong | none |
| Gating `<path>` fills in `src/ui/icons.js` (28 paths) | Icons are filled glyphs, not line charts; the entry file's rule names the section charts | none |
| A shared walker for `branding.mjs` and `em-dash.mjs` | Branding walks the checkout (it also catches an untracked file about to be added); em-dash reads `git ls-files` (a tracked tree is what ships, and the gitignored `.sdlc/runtime/` carries the glyph). Two walks, two reasons | none |
| `shipping-changes` text about the repair command | The gate lives in `npm test`, which the skill already runs; the entry file's one line names the repair | none unless the owner wants it |
| Branch protection requiring `build-test` | #726, the owner's setting | owner |

## Risks

| Risk | What this plan does about it |
|---|---|
| A live branch rebases onto the swept main and conflicts on hundreds of punctuation hunks | The fix is context-free and idempotent: take the branch's side, run `--fix`, run `npm test`, commit. Q4 recommends landing after #713, the branch with the most overlap (the four heavy test files) |
| The sweep changes user-visible strings (exports, plugin toasts, palette narratives, store copy) | Every consumer test is swept by the same rule and the dry run is green; the strings change punctuation, not meaning. The marketing corpus is the owner's to polish later (Not in scope) |
| A generated file keeps a dash its source lost, or the reverse | `npm test` regenerates every mirror and the drift gate demands a clean tree (P1); the gate scans generated files too, so either direction reds |
| A verbatim quote in `.sdlc/` stops matching the program that no longer prints the dash | The quote records what the program printed at the head it names, inside a span the gate exempts; new quotes are of the swept program. `.sdlc/adapter.md` §3's `altered:` marker is not needed because no quote is changed |
| The Markdown span rule hides a dash smuggled into prose inside backticks | Adapter §3 already rules that a span is a quote, a path or a command; a prose dash in a span is a reviewer's finding, and P8 counts raw dashes on records until U4 lands |
| `--fix` mangles a construct the fixture did not cover | P3's invariants (line count, insertions equal deletions, idempotence) and P9's removed-line check catch structural damage; `npm test` catches semantic damage. The 17 `sentence. — PR` lines were found this way and the rule was extended before the plan was written |
| The 12-attribute count moves because a later unit adds a chart | The gate fails and names both numbers; the fix is to update the entry-file line in the same change, which is what the line itself asks for |

## Landing

One PR from `plan/rule-gates` to `main`, title `chore(gates): gate the html: count, the fill: none rule, the em dash and the branding text filter (#730, #727, #728, #724)`. Draft at the first verified unit. Pre-land per adapter §2.1: P1 to P10 at the branch head, U4-4 and U4-6 rerun by the pre-land verifier, record at `.sdlc/verdicts/rule-gates-prepr.md` with the head sha. P7 is the post-#691 landing rule; `sh .sdlc/checks/baseline-agrees-check.sh` runs at the pre-land head and must print `stale total: 0`. The close-out commit re-points the baseline `ref` to the squash sha per adapter §5 (gate-split U6-9). `adapter.py close 730 --reason .sdlc/verdicts/rule-gates-prepr.md`, then #727, #728 and #724 closed with the same reason.

## Open questions for the owner

| # | Question | Default if unanswered |
|---|---|---|
| Q1 | The triage showed 61 lines in `tonal.js` and 19 in one handoff; the tree holds 16,744 across 343 files, product copy and category narratives included. Still sweep everything mechanically (recommended: it is one command, the suite is green after it, and no allow-list ever needs maintaining), or narrow the gate to records and code and leave `docs/marketing/` and `docs/reference/colors/` for hand rewriting first? | sweep everything |
| Q2 | The replacement: a comma (recommended, per `unslop` rule 13), `to` for numeric ranges, `none` for a lone table cell, a period when the dash ends a line. Or a period everywhere a sentence allows it, which needs a capitalization rule and is not context-free? | the comma set as written |
| Q3 | The three files `branding.mjs` exempts as records (`CHANGELOG.md`, `docs/reference/CHANGELOG.md`, `decision-records.md` with its accepted ADRs, append-only by `doc-writing-rules`) and the `docs/tickets/` archive carry 970 dashes. Sweep them too (recommended: punctuation only, the ADR rule guards decisions, and the two card checks are rerun in U4-6), or exempt them by path in the gate? | sweep them |
| Q4 | U4 starts after #681 (G0). Also wait for #713 (`plan/gate-split`, at its last unit, 602 dashes on the four test files it rewrites) so its rebase never conflicts? | yes, if #713's PR is open when U4 is ready; otherwise proceed and let its rebase run `--fix` |

## Revisions

| Date | Change | Why |
|---|---|---|
| 2026-09-22 | plan written at 3438864b, status proposed | the triage of 2026-09-22 and the owner's answer to question 1 |
