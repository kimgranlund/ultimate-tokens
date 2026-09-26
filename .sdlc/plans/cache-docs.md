---
status: draft
ticket: "#750"
priority: P3
lane: docs (`docs/reference/references/knowledge-01-color-engine.md`; the geometry skill line moved to prompt-audit U6 in revision 2)
size: S (U1 S = 1 point; 1 point)
labels: status:backlog · size:S (as minted on #750; no kind label)
written: 2026-09-25
depends: rule-gates (#730) landing on `origin/main`. Its em-dash sweep rewrites lines in both files this plan edits, and its gate (`test/repo/em-dash.mjs`, registered in `TESTS` there) is what grades this plan's added lines. Gate G0 below decides it by command; U1 does not start before G0 prints green, and the Orchestrator merges `origin/main` into `plan/cache-docs` before cutting U1's worktree. The `_okL` line the ticket names first is not this plan's: chroma-floor (#701) U1 rewrites it at `unit/cf-U1` (e8627655), see Not in scope. The geometry skill line (`.claude/skills/geometry-system/references/best-practices.md`) is not this plan's either since revision 2: prompt-audit's U6 rewrites that file under its own rule on ticket cites, so the line moves there (Q4) and this plan touches nothing under `.claude/skills/`. Stated for the lead to square with prompt-audit, which this plan does not edit: prompt-audit's P4 wall admits `geometry-system/references/best-practices.md` and its U6 rewrites lines 9, 49 and 100 of it, while the stale cache claim sits at line 78 (`grep -c toFixed` prints `1`); prompt-audit's U6-4 strips ticket ids such as `#686` from skill narratives (its G2 rule reads a ticket cite in a skill as history), so the repaired line there should state the rule bare (the color engine keys its caches on the exact float; the type engine keeps no cache) with no `#686`, whereas knowledge-01, a reference document under `docs/`, keeps `#686` and `#738` as the rulings a reader follows (U1-1). Prompt-audit's depends line ("no dependency on cache-docs") is true from this revision on
head: 61225d0c (`origin/main`; `plan/cache-docs` is cut from it and carries this file only)
measured-at: 7d325b32 (`origin/main` earlier the same day; `git diff --stat 7d325b32 61225d0c -- . ':(exclude).sdlc'` prints nothing, so every figure below holds at 61225d0c), 2026-09-25, read in the main checkout without editing it
branch: plan/cache-docs
inputs: ticket #750; ticket #686 (the `hct.js` re-key) and #738 (the `tonal.js` memo deletion); `src/engine/hct.js` at 7d325b32 (the three `const key =` lines); `.sdlc/plans/archive/okl-memo.md` (the seven `color-math` lines it repaired, the shape of a one-unit docs repair); `unit/cf-U1` at 02700720 (the chroma-floor rewrite of the `_okL` line); `.sdlc/adapter.md` §1, §2.1, §5; owner ruling R46 (2026-09-25, plan the backlog in one batch)
---

# The `toFixed(2)` cache lines outside okl-memo's scope (#750)

Two documents still describe the `hct.js` caches as keyed on `toFixed(2)`: `docs/reference/references/knowledge-01-color-engine.md` on four lines (its `maxChromaInGamut`, `peakC`, `oklchToCam16Hue` sections and §9 Determinism and caching, whose claim wraps onto a fifth physical line) and `.claude/skills/geometry-system/references/best-practices.md` on one line (a cross-reference that says "the color/type engines key on `toFixed(2)`"). This plan repairs the first; the second is handed to prompt-audit U6, which rewrites that file (Q4). Since #686 the three `hct.js` caches key on the exact float (`hue + "|" + tone`, `String(hue)`, `target + ":" + cf`, each behind `boundedCache(CACHE_CAP)`), which is what closed the order-dependence defect #686 measured, and the type engine keeps no cache at all (`type.mjs`'s only `toFixed` is a unit formatter). Every one of the five lines is therefore false today, and a reader following knowledge-01 §9 would reason from a cache-hit rule (`0.01°` buckets) that no longer exists. U1 rewrites the four knowledge-01 claims (five physical lines) to state the live keys and cite #686; nothing in the engine changes.

The ticket's first item, the `_okL` line in `docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md`, is already claimed: chroma-floor (#701) U1 rewrites that exact line at `unit/cf-U1` 02700720 (the same review file's line-number pins move with `tonal.js`, so that unit owns the file). This plan does not touch that file (P4 refuses it) and Q1 asks what to do if chroma-floor drops the rewrite.

Scope wall. Paths this plan may change: `docs/reference/references/knowledge-01-color-engine.md` (four claims, five physical lines), this plan, its own handoffs, verdicts and questions (`.sdlc/{plans,handoffs,verdicts,questions}/cache-docs*`), and `.sdlc/board.md` (Orchestrator). Nothing under `src/`, `scripts/`, `test/`, `figma/` or `mcp/` (no bundled source changes, so `npm test` regenerates nothing and `npm run build` is not owed), nothing under `docs/reference/reviews/` (chroma-floor U1), nothing under `.claude/skills/` (the `color-math` lines were okl-memo's; the `geometry-system` line is prompt-audit U6's), no other `.sdlc/` record.

Prose rules for every line this plan adds. No em dash anywhere: once rule-gates lands, `test/repo/em-dash.mjs` is inside `npm test` and grades every tracked file including this one; the adapter's inline-span exemption still holds for a verbatim program quote, and this plan quotes none, so its raw count is `0`. No bold inline labels. The retired maker brand and the pre-rename element identifier are paraphrased, never written (`test/repo/branding.mjs` scans `.sdlc/`). Criteria needles are function names, ids, strings and counts, never line numbers (R10); the Measured table cites line numbers as "at 7d325b32" for the builder's orientation only. `grep -P` is absent on this host: PCRE runs through `perl`. The shell is zsh, where `${PIPESTATUS[0]}` is empty: a command that needs a pipe's exit code runs under `bash -c 'set -o pipefail; ...'`.

Diff bases. Every row diffs against `B=$(git merge-base origin/main HEAD)`, never against the plan branch's own tip; after G0's merge that is the `origin/main` tip rule-gates landed on, and it sees the unit whole. Every negative control that edits a file runs in a throwaway clone (`git clone -q --shared . "$F/neg"`), made from the unit's commit, never in a unit worktree (`git -C "$F/neg" log -1 --format=%h` prints the unit head). `F` is a directory the seat makes under its own scratchpad with a name no other seat would pick, and removes by that exact name. In table cells `\|` is the escape for a plain `|`: type it unescaped. `N` is the length of `TESTS` on the branch, read by command, never by number: `50` on `origin/main` at 7d325b32, `52` at rule-gates' `unit/rg-U5` (e8a56d7e adds `repo/svg-rules.mjs` and `repo/em-dash.mjs`), whatever `origin/main` carries at G0.

Criteria ids: P rows for the plan, numbered rows for the unit, cited as U1-3. G0 is the start gate.

## Measured by the planner on 2026-09-25

| Fact | Where | Value |
|---|---|---|
| the four knowledge-01 lines | 7d325b32 `docs/reference/references/knowledge-01-color-engine.md:131`, `:139`, `:155`, `:181` | `- **Memoized** by key \`hue.toFixed(2)+'|'+tone.toFixed(2)\`.` (§6 `maxChromaInGamut`); `its tone. Memoized by \`hue.toFixed(2)\`.` (§7 `peakC`); `memoize by h.toFixed(2)+'|'+chromaFrac.toFixed(3)` (§8, inside a fenced pseudo-code block); `chromaFrac). Keys use \`toFixed(2)\` (chromaFrac \`toFixed(3)\`) so cache hits are exact within` followed by `0.01° / 0.01 tone.` (§9) |
| `grep -c toFixed docs/reference/references/knowledge-01-color-engine.md` | 7d325b32 | `4` |
| the geometry line, handed to prompt-audit U6 | 7d325b32 `.claude/skills/geometry-system/references/best-practices.md:78` | `add memoization, key it deterministically (the color/type engines key on \`toFixed(2)\`).`; `grep -c toFixed` on the file prints `1`. Prompt-audit's P4 wall admits this file and its U6 rewrites lines 9, 49 and 100 of it; its U6-4 strips ticket ids from skill narratives, so the repaired line there states the rule bare (keys on the exact float; the type engine keeps no cache) without `#686` |
| the `_okL` line's dashes at `unit/cf-U1` | e8627655 (the branch tip; 02700720 is its ancestor) | `0` on the rewritten line (the tip's commit strips them); the lead's earlier warning about two dashes is moot |
| the live keys | 7d325b32 `src/engine/hct.js` | `maxChromaInGamut`: `const key = hue + "|" + tone;` behind `const _mc = boundedCache(CACHE_CAP);`; `peakC`: `const key = String(hue);` behind `_pk`; `oklchToCam16Hue`: `const key = target + ":" + cf;` behind `_oh`, where `target` is the wrapped hue and `cf` the clamped chroma fraction. `grep -c -E 'const key = (hue \+ "\|" \+ tone\|String\(hue\)\|target \+ ":" \+ cf)' src/engine/hct.js` prints `3` |
| a cache in the type engine | 7d325b32 `src/engine/type.mjs`, `src/engine/geometry.mjs` | none: the only `toFixed` in either file formats a `rem`/`em` unit (`parseFloat((px / 16).toFixed(4))`); no `Map`, no `boundedCache` |
| the `_okL` line and who owns it | 7d325b32 `docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md:71`; `unit/cf-U1` 02700720 | main still says `_okL` is a module-level `Map` keyed `L*.toFixed(2)`; cf-U1's diff against `plan/chroma-floor` replaces the line with one that says `REMOVED at \`#738\`` and re-pins `okhslLAt` to `tonal.js:958`. `00-synthesis.md:89` was already repaired by okl-memo and cf-U1 only moves its pin |
| what the same files look like after the sweep | `unit/rg-U5` e8a56d7e | the four knowledge-01 lines and the geometry line are byte-identical to main's (none carries the glyph); the `_okL` line lost its two dashes to commas. So rule-gates does not repair any of the five lines, and this plan's edits merge onto it without a conflict |
| `test/repo/citations.mjs` on main | 61225d0c | `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 61225d0c)`, exit 0; neither file this plan edits carries a `path:line` cite on the five lines, so the gate is unaffected by the rewrite and stays the guard that nothing else moved |
| `test/repo/branding.mjs` on main | 61225d0c | `branding: clean (792 files scanned)`, exit 0 |
| `TESTS` length | `origin/main` 7d325b32; `unit/rg-U5` e8a56d7e | `50`; `52` |
| `gh issue view 730 --json state` | 2026-09-25 | `OPEN`; no PR open from `plan/rule-gates` yet; its U5 (figures of record) is in flight at e8a56d7e |

## The design, stated once

Five prose edits, no code:

1. knowledge-01 §6 (`maxChromaInGamut`): the memo line says the cache keys on the exact `hue + "|" + tone` string, bounded by `boundedCache(CACHE_CAP)`, since #686.
2. §7 (`peakC`): keyed on `String(hue)`, the exact float, since #686, and why: a truncated key let the first caller into a 0.01° bucket decide every later caller's peak (#686's order dependence).
3. §8 (`oklchToCam16Hue`), inside the fenced pseudo-code: `memoize by target + ":" + cf` (the wrapped hue and the clamped chroma fraction, exact).
4. §9 Determinism and caching: the three caches key on the exact float, so a hit is an identical input; each is bounded by `CACHE_CAP`; the memo `tonal.js` used to keep in front of `okhslLAt` is gone (#738), so the engine's only caches are these three. The sentence about hits being exact "within 0.01" goes, with its wrapped second line, so §9 changes two physical lines.
5. The geometry best-practices cross-reference is prompt-audit U6's (Q4): this plan leaves the file untouched, and U1-2 proves it.

Each rewritten line carries `#686` (and item 4 also `#738`) so the next reader can find the ruling; knowledge-01 is a reference document under `docs/`, not a skill, so prompt-audit's rule on ticket ids in prompts does not reach it. The needles below quote the live key strings from `hct.js` itself, which is the independent derivation: the doc is graded against the source, not against this plan.

## G0: has rule-gates landed (U1's step 1, and the Orchestrator's before it cuts U1's worktree)

```sh
git fetch -q origin
gh issue view 730 --json state,stateReason --jq '.state + " " + .stateReason'
git show origin/main:test/run.mjs | grep -c '"repo/em-dash.mjs"'
git show origin/main:docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md | grep -c 'REMOVED at'
```

Expected `CLOSED COMPLETED` (a `NOT_PLANNED` close is not a landing) and `1` on the first two lines. Today `OPEN` followed by a space, `0`. Line 3 is informational, not a gate: `1` means chroma-floor has landed and the `_okL` line is repaired; `0` means it is still cf-U1's and this plan leaves it alone either way (Q1). The builder records the value in the handoff.

Post-merge check, the Orchestrator's own step once G0 is green: merge `origin/main` into `plan/cache-docs` (one plan commit on it, so a merge is clean), then `git merge-base --is-ancestor origin/main plan/cache-docs; echo $?` prints `0`, and only then is U1's worktree cut.

## Units

- [ ] U1 (S) four knowledge-01 cache claims rewritten to the live keys, #686 cited · builder-l1 · reviewer-l1 · verifier-l1 · starts at G0 green

| Unit | Size | Builder | Reviewer | Verifier | Touches |
|---|---|---|---|---|---|
| U1 four claims | S | builder-l1 | reviewer-l1 | verifier-l1 | `docs/reference/references/knowledge-01-color-engine.md` (five physical lines) |

Grades: l1 throughout. Documentation lines whose truth is a grep against three source lines; no engine, no test file, no generated artifact.

## Plan-level criteria

`B=$(git merge-base origin/main HEAD)` at the top of every row.

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| P1 | `npm test` green with no `node_modules`, the count agrees, the tree is byte-stable | `npm test 2>&1 \| tail -1; perl -0ne 'my ($b) = /const TESTS = \[(.*?)\];/s; my @m = $b =~ /"[^"]+\.mjs"/g; print scalar(@m), "\n"' test/run.mjs; git status --short \| wc -l` | `✓ all N test files passed`, then N, then `0`. The unit registers no test file, so N equals the base's N (`52` if rule-gates alone has landed since 7d325b32; the builder cites the number it reads) | in the clone: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test > "$F/neg.log" 2>&1; echo "exit $?"` prints `exit 1` (adapter §1's own control) | `50` at 7d325b32; the suite was not run by the planner (host under load, other seats' gates running) |
| P2 | no bundled or executable source changes, so build and smoke are not owed | `git diff --name-only "$B" -- src scripts test figma mcp plugin package.json \| wc -l` | `0`; the pre-land record states that `npm run build` and `npm run smoke` were not owed on this ground | a fixture of two names (`src/engine/hct.js`, `docs/reference/references/knowledge-01-color-engine.md`) piped through `grep -c -E '^(src\|scripts\|test\|figma\|mcp\|plugin)/'` prints `1` | `0` on the plan branch (this file only) |
| P3 | branding clean, no added line carries an em dash (U+2014) outside a backtick span, the raw count matches the enumerated quotes, and the em-dash gate itself is green | `bash -c 'set -o pipefail; node test/repo/branding.mjs \| tail -1'; git diff "$B" \| grep -v '^+++ ' \| grep '^+' \| perl -CSD -ne 's/\x60[^\x60]*\x60//g; print if /\x{2014}/' \| wc -l; git diff "$B" -- . ':(exclude).sdlc/handoffs' \| grep -v '^+++ ' \| grep '^+' \| perl -CSD -ne 'print if /\x{2014}/' \| wc -l; bash -c 'set -o pipefail; node test/repo/em-dash.mjs \| tail -1'; echo "exit $?"` | `branding: clean (N files scanned)`, `0`, `0` (this plan quotes no dashed program line; a handoff that needs one lists it word for word and the third count equals the list's length), the em-dash gate's pass line, `exit 0` | in the clone: `cp docs/reference/references/decision-records.md .sdlc/verdicts/x.md` reds the first; one added prose line with the glyph makes the second `1` and the em-dash gate `exit 1` | clean at 61225d0c (`792 files scanned` in the root checkout, which holds untracked files; a clean checkout of 65f8171c scans `723`, the checkability review's figure); this plan's own added lines: `0` and `0` (planner); the em-dash gate is not on main until G0 and is graded from then |
| P4 | scope wall: one file and this plan's own records, nothing else | `git diff --name-only "$B" \| grep -v -E -e '^docs/reference/references/knowledge-01-color-engine\.md$' -e '^\.sdlc/(plans\|handoffs\|verdicts\|questions)/cache-docs' -e '^\.sdlc/board\.md$' \| wc -l; git diff --name-only "$B" -- docs/reference/reviews .claude/skills \| wc -l` | `0`, `0` (the second command is the explicit refusal of chroma-floor U1's file and of every skill file, the `color-math` seven and prompt-audit's `geometry-system` line among them) | a fixture of three names (`docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md`, `.claude/skills/geometry-system/references/best-practices.md`, `docs/reference/references/knowledge-01-color-engine.md`) piped through the first filter prints `2` (run by the planner: `2`) | `0`, `0` on the plan branch |

## U1: four claims (#750), starts at G0 green

Steps. (1) G0, in the unit worktree the Orchestrator cut after the merge. (2) Read the three `const key =` lines in `src/engine/hct.js` and quote them into the four knowledge-01 claims per the design (five physical lines, §9's claim wrapping onto a second). (3) `npm test` (nothing regenerates; the tree stays clean). (4) Run U1-1 to U1-4 in the worktree and the controls in a clone. (5) The handoff quotes each changed line before and after, the G0 line-3 value, and the P3 counts. Probes that print several values do so in one template string, or under `NO_COLOR=1`: this host sets `FORCE_COLOR=3`, and a multi-argument `console.log` wraps numbers in ANSI codes.

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U1-1 | knowledge-01 names the three live keys, cites #686 and #738, and no `toFixed` cache claim survives | `cd docs/reference/references && grep -c 'toFixed' knowledge-01-color-engine.md; grep -c -F 'hue + "\|" + tone' knowledge-01-color-engine.md; grep -c -F 'String(hue)' knowledge-01-color-engine.md; grep -c -F 'target + ":" + cf' knowledge-01-color-engine.md; grep -c '#686' knowledge-01-color-engine.md; grep -c '#738' knowledge-01-color-engine.md; grep -c -E '0\.01°\|within 0\.01' knowledge-01-color-engine.md` | `0`, `1` or more, `1` or more, `1` or more, `1` or more, `1` or more, `0` (the bucket-width sentence is the claim §9 must lose) | the file at G0 prints `4`, `0`, `0`, `0`, `0`, `0`, `1` | at 7d325b32: `4`, `0`, `0`, `0`, `0`, `0`, `1` (planner, the last read by `grep -c '0.01°'`) |
| U1-2 | the geometry cross-reference is left to prompt-audit U6: no skill file changes here, and the handoff records the line's state so the hand-over is traceable | `git diff --name-only "$B" -- .claude/skills \| wc -l; grep -c 'toFixed' .claude/skills/geometry-system/references/best-practices.md` | `0`, then `1` (still stale, prompt-audit U6's) or `0` (U6 landed first); the handoff states which and cites prompt-audit's U6 row for the line | a fixture of one name (`.claude/skills/geometry-system/references/best-practices.md`) piped through `grep -c '^\.claude/skills/'` prints `1`, which is what the first command counts if the builder edits it | `0`, `1` at 65f8171c |
| U1-3 | the rewritten claims are true of the tree: the three key strings the doc quotes are the ones `hct.js` holds, and the type engine holds no memo | `grep -c -E 'const key = (hue \+ "\|" \+ tone\|String\(hue\)\|target \+ ":" \+ cf)' src/engine/hct.js; grep -c 'boundedCache(CACHE_CAP)' src/engine/hct.js; grep -c -E 'new Map\(\|boundedCache' src/engine/type.mjs src/engine/geometry.mjs \| grep -c ':0$'` | `3`, `3`, `2` (both files print `:0`) | in the clone, change `const key = String(hue);` to `const key = hue.toFixed(2);` in `peakC`: the first prints `2`, and the same edit reds `engine/prime.mjs` (#686's own gate, the PR #737 critic's mutant), so a doc that quoted the old key would be graded against a source that no longer holds it | `3`, `3`, `2` at 7d325b32 |
| U1-4 | the citations gate stays green, and the diff is exactly the five physical lines | `bash -c 'set -o pipefail; node test/repo/citations.mjs \| tail -1'; echo "exit $?"; git diff --numstat "$B" -- docs/reference/references/knowledge-01-color-engine.md \| cut -f1,2 \| tr '\t' ' '` | a line starting `✓ citations: parser self-test + STALE 0 across`, `exit 0`, then `5 5` (lines 131, 139, 155, 181 and 182 at 7d325b32: §9's claim wraps onto a second line that carries `0.01°`, which U1-1 requires to go); a rewrite that needs one more line for one section states why, and more than `6` added or `5` deleted lines reds the row | in the clone, `perl -pi -e 's/\x60app\.js:(\d+)\x60/\x60app.js:1\x60/ if /mixinInto/' docs/lld/app-shell.md` (docs-repair's P5 control): the gate prints `✗ 1 citation gate failure(s)` and `exit 1`; a sixth line edited in knowledge-01 makes its numstat `6 6` | `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 61225d0c)`, `exit 0` (`HEAD 65f8171c` at the checkability review); no diff |

## Not in scope

| Item | Why | Where it goes |
|---|---|---|
| the `_okL` line in `04-context-and-messaging.md` (the ticket's first bullet) | chroma-floor U1 rewrites that line at `unit/cf-U1` (e8627655, dash-free at the tip) and re-pins the review's `tonal.js` cites; two plans editing one line is a squash conflict for nothing | chroma-floor (#701); Q1 if its rewrite is dropped |
| the geometry best-practices line (the ticket's third bullet) | prompt-audit U6 rewrites that file (its P4 wall admits it, its evidence touches three other lines of it) and its U6-4 strips ticket ids from skill narratives, so the line's repair belongs to the plan that owns the file's voice; this plan touching it would land a `#686` cite U6 then removes | prompt-audit U6 (Q4); its planner is told the line is stale and that prompt-audit's depends line ("cache-docs touches nothing in the wall") is true from this revision on |
| `00-synthesis.md:89` | already repaired by okl-memo (revision 3); cf-U1 moves its pin | untouched |
| the seven `color-math` lines | repaired by okl-memo U1-6 (`grep -c toFixed` over the four files prints `0`) | untouched |
| `hct.js:276` and the `#686` comments that mention `toFixed(2)` as history | source comments describing what the key used to be are true statements about the past | untouched |

## Risks

| Risk | What this plan does about it |
|---|---|
| rule-gates lands with a rewrite of one of the five lines after all | the Measured table shows the five lines byte-identical at `unit/rg-U5`; if a later rule-gates pass changes one, the builder re-reads at G0 and the handoff quotes the line it found |
| chroma-floor lands before U1 and the `_okL` line is already repaired | G0 line 3 prints `1`; nothing changes for U1 |
| chroma-floor drops the `_okL` rewrite | Q1 |
| a `toFixed` mention survives in a code span the builder considered a quote | U1-1's first count is over the whole file and must print `0`; a quote of the old key is written in prose ("used to key on a two-decimal string") without the token |

## Landing

One PR from `plan/cache-docs` to `main`, title `docs(engine): the cache-key lines say exact float, #686 (#750)`, body `Closes #750`. Draft at U1's first verified state. Pre-land per adapter §2.1: P1 to P4 and U1-1 to U1-4 at the branch head, every `sh .sdlc/checks/*.sh` (with the two card checks read by their last line while #745 is open, see records-gates), record at `.sdlc/verdicts/cache-docs-prepr.md` with `verdict: 🟢` as its last `verdict:` line and `sha:` at the head; build and smoke not owed (P2, stated in the record). Then the `shipping-changes` squash and sync steps, and the plan-closing rule of adapter §5 (status `done`, U1 ticked, the file to `.sdlc/plans/archive/`, #750 closed by the PR's `Closes` line and `adapter.py close 750 --reason .sdlc/verdicts/cache-docs-prepr.md`).

## Owner questions

| Id | Question | Recommendation |
|---|---|---|
| Q1 | If chroma-floor (#701) lands without cf-U1's rewrite of the `_okL` line, does this plan take it (one more file in P4, one more U1 row) or does #750 stay open for it? | Take it by a revision row, same unit if U1 has not started, a U2 (S) if it has: the line is one bullet and the needle is `REMOVED at` plus `#738`. Today the rewrite is in cf-U1's diff, so nothing to do |
| Q2 | Does §9 keep a sentence about hit precision at all, or just state exact keys? | State exact keys and the bound (`CACHE_CAP`), drop the precision sentence: after #686 there is no precision to describe, a hit is an identical input |
| Q3 | Grade l1 as planned? | Yes: five lines, needles quoted from the source, no engine change |
| Q4 | The geometry best-practices line: hand it to prompt-audit U6 (this revision), or keep it here behind a start gate on prompt-audit landing? | Hand it over. U6 rewrites that file anyway and applies the skill-voice rule on ticket ids; a one-point docs plan should not wait on a fifteen-point one, and two plans on one file is the collision the review found. The hand-over is recorded in this plan's Not in scope, in prompt-audit's next revision, and in the U1 handoff (U1-2) |

## Revisions

| Date | Change | Why |
|---|---|---|
| 2026-09-25 | written, status draft. Every value read at 7d325b32 in the main checkout (unedited) and at `unit/rg-U5` e8a56d7e and `unit/cf-U1` 02700720 with `git show` and `git diff`; the tree outside `.sdlc/` is identical between 7d325b32 and the plan's head 61225d0c. P3's two counts on this file's own lines: `0` and `0` | ticket #750 (the okl-memo close-out's out-of-scope stale docs); owner ruling R46 (2026-09-25) plans the backlog in one batch |
| 2026-09-25 | revision 2, from the checkability review at 65f8171c (8 green, 3 yellow, 1 red): U1-4's numstat reads `5 5` (§9's claim wraps onto a second physical line, which the `0.01°` needle requires to go); design item 4 drops "never a neighbour within 0.01", which the U1-1 needle would have counted; the geometry best-practices line leaves this plan for prompt-audit U6 (the collision the review found; Q4), so the scope wall is one file, P4 refuses `.claude/skills/`, and U1-2 proves the hand-over; P3's Today names the checkout its count came from; the cf-U1 note reads the tip e8627655, where the rewritten line carries no dash; probes print one template string or run under `NO_COLOR=1` | checkability review, 2026-09-25 |
| 2026-09-25 | revision 3, from the lead's review notes: the depends line states the prompt-audit overlap in full (its wall admits the file, its U6 rewrites three other lines of it, the stale claim is at line 78, its U6-4 strips ticket ids so the repaired line there carries no `#686`, while knowledge-01 keeps its cites), so the lead can square it without this plan editing prompt-audit | lead's notes, 2026-09-25 |
