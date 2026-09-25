---
status: draft
ticket: "#750"
priority: P3
lane: docs (`docs/reference/references/knowledge-01-color-engine.md`, `.claude/skills/geometry-system/references/best-practices.md`)
size: S (U1 S = 1 point; 1 point)
labels: status:backlog · size:S (as minted on #750; no kind label)
written: 2026-09-25
depends: rule-gates (#730) landing on `origin/main`. Its em-dash sweep rewrites lines in both files this plan edits, and its gate (`test/repo/em-dash.mjs`, registered in `TESTS` there) is what grades this plan's added lines. Gate G0 below decides it by command; U1 does not start before G0 prints green, and the Orchestrator merges `origin/main` into `plan/cache-docs` before cutting U1's worktree. The `_okL` line the ticket names first is not this plan's: chroma-floor (#701) U1 rewrites it at `unit/cf-U1` (02700720), see Not in scope
head: 61225d0c (`origin/main`; `plan/cache-docs` is cut from it and carries this file only)
measured-at: 7d325b32 (`origin/main` earlier the same day; `git diff --stat 7d325b32 61225d0c -- . ':(exclude).sdlc'` prints nothing, so every figure below holds at 61225d0c), 2026-09-25, read in the main checkout without editing it
branch: plan/cache-docs
inputs: ticket #750; ticket #686 (the `hct.js` re-key) and #738 (the `tonal.js` memo deletion); `src/engine/hct.js` at 7d325b32 (the three `const key =` lines); `.sdlc/plans/archive/okl-memo.md` (the seven `color-math` lines it repaired, the shape of a one-unit docs repair); `unit/cf-U1` at 02700720 (the chroma-floor rewrite of the `_okL` line); `.sdlc/adapter.md` §1, §2.1, §5; owner ruling R46 (2026-09-25, plan the backlog in one batch)
---

# The `toFixed(2)` cache lines outside okl-memo's scope (#750)

Two documents still describe the `hct.js` caches as keyed on `toFixed(2)`: `docs/reference/references/knowledge-01-color-engine.md` on four lines (its `maxChromaInGamut`, `peakC`, `oklchToCam16Hue` sections and §9 Determinism and caching) and `.claude/skills/geometry-system/references/best-practices.md` on one line (a cross-reference that says "the color/type engines key on `toFixed(2)`"). Since #686 the three `hct.js` caches key on the exact float (`hue + "|" + tone`, `String(hue)`, `target + ":" + cf`, each behind `boundedCache(CACHE_CAP)`), which is what closed the order-dependence defect #686 measured, and the type engine keeps no cache at all (`type.mjs`'s only `toFixed` is a unit formatter). Every one of the five lines is therefore false today, and a reader following knowledge-01 §9 would reason from a cache-hit rule (`0.01°` buckets) that no longer exists. U1 rewrites the five lines to state the live keys and cite #686; nothing in the engine changes.

The ticket's first item, the `_okL` line in `docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md`, is already claimed: chroma-floor (#701) U1 rewrites that exact line at `unit/cf-U1` 02700720 (the same review file's line-number pins move with `tonal.js`, so that unit owns the file). This plan does not touch that file (P4 refuses it) and Q1 asks what to do if chroma-floor drops the rewrite.

Scope wall. Paths this plan may change: `docs/reference/references/knowledge-01-color-engine.md` (four lines), `.claude/skills/geometry-system/references/best-practices.md` (one line), this plan, its own handoffs, verdicts and questions (`.sdlc/{plans,handoffs,verdicts,questions}/cache-docs*`), and `.sdlc/board.md` (Orchestrator). Nothing under `src/`, `scripts/`, `test/`, `figma/` or `mcp/` (no bundled source changes, so `npm test` regenerates nothing and `npm run build` is not owed), nothing under `docs/reference/reviews/` (chroma-floor U1), no `.claude/skills/color-math/` line (okl-memo repaired all seven), no other `.sdlc/` record.

Prose rules for every line this plan adds. No em dash anywhere: once rule-gates lands, `test/repo/em-dash.mjs` is inside `npm test` and grades every tracked file including this one; the adapter's inline-span exemption still holds for a verbatim program quote, and this plan quotes none, so its raw count is `0`. No bold inline labels. The retired maker brand and the pre-rename element identifier are paraphrased, never written (`test/repo/branding.mjs` scans `.sdlc/`). Criteria needles are function names, ids, strings and counts, never line numbers (R10); the Measured table cites line numbers as "at 7d325b32" for the builder's orientation only. `grep -P` is absent on this host: PCRE runs through `perl`. The shell is zsh, where `${PIPESTATUS[0]}` is empty: a command that needs a pipe's exit code runs under `bash -c 'set -o pipefail; ...'`.

Diff bases. Every row diffs against `B=$(git merge-base origin/main HEAD)`, never against the plan branch's own tip; after G0's merge that is the `origin/main` tip rule-gates landed on, and it sees the unit whole. Every negative control that edits a file runs in a throwaway clone (`git clone -q --shared . "$F/neg"`), made from the unit's commit, never in a unit worktree (`git -C "$F/neg" log -1 --format=%h` prints the unit head). `F` is a directory the seat makes under its own scratchpad with a name no other seat would pick, and removes by that exact name. In table cells `\|` is the escape for a plain `|`: type it unescaped. `N` is the length of `TESTS` on the branch, read by command, never by number: `50` on `origin/main` at 7d325b32, `52` at rule-gates' `unit/rg-U5` (e8a56d7e adds `repo/svg-rules.mjs` and `repo/em-dash.mjs`), whatever `origin/main` carries at G0.

Criteria ids: P rows for the plan, numbered rows for the unit, cited as U1-3. G0 is the start gate.

## Measured by the planner on 2026-09-25

| Fact | Where | Value |
|---|---|---|
| the four knowledge-01 lines | 7d325b32 `docs/reference/references/knowledge-01-color-engine.md:131`, `:139`, `:155`, `:181` | `- **Memoized** by key \`hue.toFixed(2)+'|'+tone.toFixed(2)\`.` (§6 `maxChromaInGamut`); `its tone. Memoized by \`hue.toFixed(2)\`.` (§7 `peakC`); `memoize by h.toFixed(2)+'|'+chromaFrac.toFixed(3)` (§8, inside a fenced pseudo-code block); `chromaFrac). Keys use \`toFixed(2)\` (chromaFrac \`toFixed(3)\`) so cache hits are exact within` followed by `0.01° / 0.01 tone.` (§9) |
| `grep -c toFixed docs/reference/references/knowledge-01-color-engine.md` | 7d325b32 | `4` |
| the geometry line | 7d325b32 `.claude/skills/geometry-system/references/best-practices.md:78` | `add memoization, key it deterministically (the color/type engines key on \`toFixed(2)\`).` |
| `grep -c toFixed .claude/skills/geometry-system/references/best-practices.md` | 7d325b32 | `1` |
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
4. §9 Determinism and caching: the three caches key on the exact float, so a hit is an identical input, never a neighbour within 0.01; each is bounded by `CACHE_CAP`; the memo `tonal.js` used to keep in front of `okhslLAt` is gone (#738), so the engine's only caches are these three.
5. geometry best-practices: the cross-reference says the color engine keys its caches on the exact float (#686) and the type engine keeps no cache, so a new memo here would be the geometry engine's first and needs a bound.

Each rewritten line carries `#686` (and line 4 also `#738`) so the next reader can find the ruling. The needles below quote the live key strings from `hct.js` itself, which is the independent derivation: the doc is graded against the source, not against this plan.

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

- [ ] U1 (S) five cache lines rewritten to the live keys, #686 cited · builder-l1 · reviewer-l1 · verifier-l1 · starts at G0 green

| Unit | Size | Builder | Reviewer | Verifier | Touches |
|---|---|---|---|---|---|
| U1 five lines | S | builder-l1 | reviewer-l1 | verifier-l1 | `docs/reference/references/knowledge-01-color-engine.md` (4 lines), `.claude/skills/geometry-system/references/best-practices.md` (1 line) |

Grades: l1 throughout. Five documentation lines whose truth is a grep against three source lines; no engine, no test file, no generated artifact.

## Plan-level criteria

`B=$(git merge-base origin/main HEAD)` at the top of every row.

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| P1 | `npm test` green with no `node_modules`, the count agrees, the tree is byte-stable | `npm test 2>&1 \| tail -1; perl -0ne 'my ($b) = /const TESTS = \[(.*?)\];/s; my @m = $b =~ /"[^"]+\.mjs"/g; print scalar(@m), "\n"' test/run.mjs; git status --short \| wc -l` | `✓ all N test files passed`, then N, then `0`. The unit registers no test file, so N equals the base's N (`52` if rule-gates alone has landed since 7d325b32; the builder cites the number it reads) | in the clone: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test > "$F/neg.log" 2>&1; echo "exit $?"` prints `exit 1` (adapter §1's own control) | `50` at 7d325b32; the suite was not run by the planner (host under load, other seats' gates running) |
| P2 | no bundled or executable source changes, so build and smoke are not owed | `git diff --name-only "$B" -- src scripts test figma mcp plugin package.json \| wc -l` | `0`; the pre-land record states that `npm run build` and `npm run smoke` were not owed on this ground | a fixture of two names (`src/engine/hct.js`, `docs/reference/references/knowledge-01-color-engine.md`) piped through `grep -c -E '^(src\|scripts\|test\|figma\|mcp\|plugin)/'` prints `1` | `0` on the plan branch (this file only) |
| P3 | branding clean, no added line carries an em dash (U+2014) outside a backtick span, the raw count matches the enumerated quotes, and the em-dash gate itself is green | `bash -c 'set -o pipefail; node test/repo/branding.mjs \| tail -1'; git diff "$B" \| grep -v '^+++ ' \| grep '^+' \| perl -CSD -ne 's/\x60[^\x60]*\x60//g; print if /\x{2014}/' \| wc -l; git diff "$B" -- . ':(exclude).sdlc/handoffs' \| grep -v '^+++ ' \| grep '^+' \| perl -CSD -ne 'print if /\x{2014}/' \| wc -l; bash -c 'set -o pipefail; node test/repo/em-dash.mjs \| tail -1'; echo "exit $?"` | `branding: clean (N files scanned)`, `0`, `0` (this plan quotes no dashed program line; a handoff that needs one lists it word for word and the third count equals the list's length), the em-dash gate's pass line, `exit 0` | in the clone: `cp docs/reference/references/decision-records.md .sdlc/verdicts/x.md` reds the first; one added prose line with the glyph makes the second `1` and the em-dash gate `exit 1` | clean at 61225d0c (`792 files scanned`); this plan's own added lines: `0` and `0` (planner); the em-dash gate is not on main until G0 |
| P4 | scope wall: the two files and this plan's own records, nothing else | `git diff --name-only "$B" \| grep -v -E -e '^docs/reference/references/knowledge-01-color-engine\.md$' -e '^\.claude/skills/geometry-system/references/best-practices\.md$' -e '^\.sdlc/(plans\|handoffs\|verdicts\|questions)/cache-docs' -e '^\.sdlc/board\.md$' \| wc -l; git diff --name-only "$B" -- docs/reference/reviews .claude/skills/color-math \| wc -l` | `0`, `0` (the second command is the explicit refusal of chroma-floor U1's file and okl-memo's seven lines) | a fixture of three names (`docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md`, `src/engine/hct.js`, `docs/reference/references/knowledge-01-color-engine.md`) piped through the first filter prints `2` (run by the planner: `2`) | `0`, `0` on the plan branch |

## U1: five lines (#750), starts at G0 green

Steps. (1) G0, in the unit worktree the Orchestrator cut after the merge. (2) Read the three `const key =` lines in `src/engine/hct.js` and quote them into the four knowledge-01 lines per the design. (3) Rewrite the geometry best-practices line. (4) `npm test` (nothing regenerates; the tree stays clean). (5) Run U1-1 to U1-4 in the worktree and the controls in a clone. (6) The handoff quotes each of the five lines before and after, the G0 line-3 value, and the P3 counts.

| Id | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| U1-1 | knowledge-01 names the three live keys, cites #686 and #738, and no `toFixed` cache claim survives | `cd docs/reference/references && grep -c 'toFixed' knowledge-01-color-engine.md; grep -c -F 'hue + "\|" + tone' knowledge-01-color-engine.md; grep -c -F 'String(hue)' knowledge-01-color-engine.md; grep -c -F 'target + ":" + cf' knowledge-01-color-engine.md; grep -c '#686' knowledge-01-color-engine.md; grep -c '#738' knowledge-01-color-engine.md; grep -c -E '0\.01°\|within 0\.01' knowledge-01-color-engine.md` | `0`, `1` or more, `1` or more, `1` or more, `1` or more, `1` or more, `0` (the bucket-width sentence is the claim §9 must lose) | the file at G0 prints `4`, `0`, `0`, `0`, `0`, `0`, `1` | at 7d325b32: `4`, `0`, `0`, `0`, `0`, `0`, `1` (planner, the last read by `grep -c '0.01°'`) |
| U1-2 | the geometry cross-reference no longer claims a `toFixed(2)` key and says the type engine has no cache | `cd .claude/skills/geometry-system/references && grep -c 'toFixed' best-practices.md; grep -c '#686' best-practices.md; grep -c -i 'no cache' best-practices.md` | `0`, `1`, `1` or more | the file at G0 prints `1`, `0`, `0` | at 7d325b32: `1`, `0`, `0` |
| U1-3 | the rewritten claims are true of the tree: the three key strings the doc quotes are the ones `hct.js` holds, and the type engine holds no memo | `grep -c -E 'const key = (hue \+ "\|" \+ tone\|String\(hue\)\|target \+ ":" \+ cf)' src/engine/hct.js; grep -c 'boundedCache(CACHE_CAP)' src/engine/hct.js; grep -c -E 'new Map\(\|boundedCache' src/engine/type.mjs src/engine/geometry.mjs \| grep -c ':0$'` | `3`, `3`, `2` (both files print `:0`) | in the clone, change `const key = String(hue);` to `const key = hue.toFixed(2);` in `peakC`: the first prints `2`, and the same edit reds `engine/prime.mjs` (#686's own gate, the PR #737 critic's mutant), so a doc that quoted the old key would be graded against a source that no longer holds it | `3`, `3`, `2` at 7d325b32 |
| U1-4 | the citations gate stays green, and the diff is exactly the five lines | `bash -c 'set -o pipefail; node test/repo/citations.mjs \| tail -1'; echo "exit $?"; git diff --numstat "$B" -- docs/reference/references/knowledge-01-color-engine.md .claude/skills/geometry-system/references/best-practices.md \| cut -f1,2 \| tr '\t' ' '` | a line starting `✓ citations: parser self-test + STALE 0 across`, `exit 0`, then `4 4` and `1 1` (a rewrite that needs a second line for one section states the numstat it produces and why; a numstat above `6 4` on knowledge-01 reds the row) | in the clone, `perl -pi -e 's/\x60app\.js:(\d+)\x60/\x60app.js:1\x60/ if /mixinInto/' docs/lld/app-shell.md` (docs-repair's P5 control): the gate prints `✗ 1 citation gate failure(s)` and `exit 1`; a sixth line edited in knowledge-01 makes its numstat `5 5` | `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 61225d0c)`, `exit 0`; no diff |

## Not in scope

| Item | Why | Where it goes |
|---|---|---|
| the `_okL` line in `04-context-and-messaging.md` (the ticket's first bullet) | chroma-floor U1 rewrites that line at `unit/cf-U1` 02700720 and re-pins the review's `tonal.js` cites; two plans editing one line is a squash conflict for nothing | chroma-floor (#701); Q1 if its rewrite is dropped |
| cf-U1's rewrite of that line carries two em dashes | not this plan's file; once rule-gates lands, the em-dash gate will red that line at chroma-floor's next `npm test` | the lead is told in this plan's report; chroma-floor's own review |
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

## Revisions

| Date | Change | Why |
|---|---|---|
| 2026-09-25 | written, status draft. Every value read at 7d325b32 in the main checkout (unedited) and at `unit/rg-U5` e8a56d7e and `unit/cf-U1` 02700720 with `git show` and `git diff`; the tree outside `.sdlc/` is identical between 7d325b32 and the plan's head 61225d0c. P3's two counts on this file's own lines: `0` and `0` | ticket #750 (the okl-memo close-out's out-of-scope stale docs); owner ruling R46 (2026-09-25) plans the backlog in one batch |
