---
status: approved
ticket: "#786 (anchor; the plan also closes #787, #796, #783, #748, #784)"
priority: P2
lane: batch of six, two waves. Wave A (now): `docs/marketing/**` (U1); `src/ui/overlays/drawer.js`, `src/ui/sections/typography.js` (U5, hunk-level per Q1 B); `test/repo/citations.mjs` (U7, hunk-level per Q1 B); `figma/binder/mode-apply-plan.mjs`, `test/repo/em-dash.mjs` and its fixtures, `src/engine/ds-export.js` (one prose line), `.sdlc/adapter.md` §1 (U2); new `src/engine/names.mjs`, new `test/engine/names.mjs`, the `TESTS` line of `test/run.mjs` (U3). Wave B (after #785 lands on `main`): `src/ui/sections/color.js`, `test/ui/headless-boot.mjs`, `.sdlc/questions/pane-context-U1-f1.md` (U4, then U6 on top of it, U6 adding `scripts/bundle.mjs` MODS/KEY and `src/ui/styles.css`); `src/engine/tonal.js`, `test/engine/tonal.mjs`, `test/engine/even-dips-gate.mjs`, `test/engine/fixtures/*.json`, `CHANGELOG.md` (U8). Regenerated bundles (`dist/`, `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js`) on every unit that touches `src/`
size: S + S + S + S + S + S + S + M (U1 to U7 S = 1 point each, U8 M = 2; 9 points)
labels: as minted: #786 kind:bug · size:small; #787 kind:bug · size:small; #796 kind:bug · size:small; #783 kind:bug · status:backlog · size:S; #748 kind:chore · status:backlog · lane:docs · size:S; #784 kind:bug · size:small
written: 2026-10-04
depends: wave A on nothing landed. Wave B on #785 (`plan/pane-context`, PR #797, open at planning with no check results yet) landing on `main`; U6 also on U3 and U4; U8 also on the compute-layers ordering in section 2. The #748 wait on #730 is already satisfied (#730 CLOSED, `rule-gates` archived)
head: 9375f7c1 (`main` = `origin/main` at planning, tree clean; `plan/parallel-batch` is cut from it at activation)
measured-at: 9375f7c1, the root checkout, 2026-10-04, read-only (greps, `git diff --stat main...origin/plan/<x>`, two `node -e` imports of pure engines; no `npm test`, no edit, no clone)
inputs: issues #786, #787, #796, #783, #748, #784; `.sdlc/plans/pane-context.md` and `git diff --stat main...origin/plan/pane-context`; `.sdlc/plans/compute-layers.md` and `git diff --stat main...origin/plan/compute-layers`; `.sdlc/plans/archive/prime-name.md` Q3; `.sdlc/plans/archive/floorref-hue-U2-rediagnosis.md` §4 (the "Not in scope, add" paragraph that filed #784); `.sdlc/questions/pane-context-U1-f1.md`; `.sdlc/reviews/pane-context-U1-review.md` F1; `.sdlc/runtime/owner-rulings-2026-09-22.md` R37, R92, R98; `.sdlc/adapter.md` §1, §2.1, §5, §6 (the 2026-09-30 doc-shaped-unit amendment); `.sdlc/plans/archive/gates-batch.md` (the multi-issue frontmatter precedent); `src/engine/exports.js` (`slug`, the flat-name joins), `src/engine/semantic.js` (`semanticRoles(name)`), `src/engine/prime.mjs` (`PRIME_STEPS`, `primeSlug`), `src/ui/model.mjs` (`slug`, `radixKeyCollision`, `radixExportKey`), `src/ui/sections/color.js` (`selectPalette`, `addPalette`, `duplicatePalette`, the name `oninput` at :1762, the three row `onclick` callers at :1006, :1057, :1218), `src/ui/app.js` (`_selectRelative`), `test/repo/citations.mjs`, `test/repo/em-dash.mjs`, `test/figma/binder.mjs` (`renameparity`), `figma/binder/mode-apply-plan.mjs:357`, `test/engine/even-dips-gate.mjs` ((b1), (b2))
branch: plan/parallel-batch
---

# Six small issues in two waves: three lanes that nothing in flight touches now, five more once pane-context lands

Six open issues, one unit each, except that #787 (a pure predicate, then its UI) and #783 (two file lanes with different gates) each split in two, and #796's marketing lines move into #748's unit so one seat owns every `docs/marketing/**` word. Two plans are in flight and the lead's rule for this batch is file-level: a unit here never opens a file that `plan/pane-context` (#785) or `plan/compute-layers` (#788) changes, except two single lines named in section 2 and, by the owner's Q1 B ruling, U5 and U7, whose hunks are disjoint from pane-context's. Where a target file is touched by an in-flight plan, the unit waits for #785 to land on `main` (wave B), and its lane row records the in-flight hunk ranges as the evidence that the wait is a rule, not a textual conflict.

| Wave | Units | Starts | Parallel |
|---|---|---|---|
| A | U1 (#748 + #796 marketing), U2 (#783, non-citations half), U3 (#787 predicate), U5 (#796 code + #783 `:534`), U7 (#783 citations half) | now (U5 and U7 per Q1 B, hunk-level: their hunks are disjoint from pane-context's) | all five at once, disjoint lanes |
| B | U4 (#786), U6 (#787 UI), U8 (#784) | when #785 lands on `main` and the plan branch is rebased onto it | U4 and U8 at once; U6 after U4 (both edit `src/ui/sections/color.js`) and after U3 |

## 1. Measured by the planner at 9375f7c1 (2026-10-04, read-only)

| Fact | Value |
|---|---|
| `plan/pane-context` diff against `main` | 72 files. Of this plan's targets it touches `src/ui/sections/color.js` (205 lines), `src/ui/app.js` (147), `src/ui/sections/typography.js` (hunks at 134, 322, 336 to 390, 613), `test/repo/citations.mjs` (hunks at 58 and 82 to 89: a comment word and the removed `colorMode states` pin), `test/ui/headless-boot.mjs` (472), `src/engine/tonal.js` (137), `test/engine/tonal.mjs`, `test/engine/even-dips-gate.mjs`, `test/engine/fixtures/{chroma-envelope,mode-isolation,tonal-legacy}.json`, `test/run.mjs`. It does not touch `src/ui/overlays/drawer.js`, `test/repo/em-dash.mjs`, `figma/binder/mode-apply-plan.mjs`, `src/engine/ds-export.js`, `docs/marketing/**`, `.sdlc/adapter.md` |
| `plan/compute-layers` diff against `main` | 17 files: new `src/engine/{controls,layers}.mjs`, `src/engine/exports.js`, `src/ui/model.mjs`, `test/engine/{anchor,controls,layers}.mjs`, `test/run.mjs` (the `TESTS` line), `scripts/bundle.mjs` (4 lines), `decision-records.md`, `CHANGELOG.md`. Its plan reaches `src/engine/tonal.js` and `src/ui/sections/color.js` only at U5, after the U4 freeze (`.sdlc/plans/compute-layers.md:5,10,26`) |
| #785 state | OPEN; PR #797 open, `statusCheckRollup` empty at planning; the board's last rows are U7 with the builder (`9375f7c1` subject) |
| #786 site | `src/ui/sections/color.js:258` `this.segment = "palette"` inside `selectPalette`, identical on `main` and on `origin/plan/pane-context`; non-click callers on `main`: `app.js:530` (`_selectRelative`, ArrowUp/ArrowDown at :471 to :477), `color.js:349` (`addPalette`), `:478` (new-palette commit), `:2019`, `:2029` (`duplicatePalette`, `deletePalette`); row clicks at `:1006`, `:1057`, `:1218`. The owner chose option A on 2026-10-03 (`.sdlc/questions/pane-context-U1-f1.md`: keep, file a follow-up); #786 is that follow-up, so this unit amends that record |
| #787 sources | `exports.js:73` `slug()`, `:253` `const n = slug(palette.name)`, the flat name is `n + suffix`; `semanticRoles("x")` yields 53 roles with 53 distinct suffixes (`-dim`, `-bright`, `-low`, `-high`, `-hover`, `-active`, `-disabled`, `-on-x`, ...); `prime.mjs:60` `PRIME_STEPS` (7), `:66` `primeSlug(step)` is `prime` or `prime-<step>`. Model-side precedent: `model.mjs:353 to 375` `radixKeyCollision` (a name check) and `radixExportKey` (the engine's own disambiguation rule, `-palette` appended), surfaced in `color.js:1136 to 1150` as one `.radix-badge` text node. The palette name field is `color.js:1762` `oninput` through `editDrag` |
| #796 lines | `drawer.js:529` (`The eleven-voice type scale`), `typography.js:1003` (comment) and `:1013` (`Each of the eleven voices at MD`), `docs/marketing/product/claude-plugin.md:19` and `:60` (both carry `<!-- fix-old-names: keep -->`), `docs/marketing/web/landing.md:41`, and one the issue missed: `docs/marketing/product/boilerplate.md:38` (`eleven type voices`). `Object.keys(makeVoices()).length` is `15`; `citations.mjs:84` already pins `15 voices` in `docs/lld/app-shell.md` against it |
| #783 sites | `figma/binder/mode-apply-plan.mjs:357` exports a `GEOMETRY_FIELD_RENAME_MAP` that nothing imports (`figma/plugin/code.js:521` names the file in a comment only); `test/figma/binder.mjs:810 to 836` `renameparity` reads `migrations.mjs` (canonical), the binder `code.js` and the flagship `code.js`, not `mode-apply-plan.mjs`. `citations.mjs:125 to 140` the bare-literal guard (`bareLiteralSource`, with its own positives/negatives self-test), `:193 to 235` the count-phrase scan. `test/repo/fixtures/gate-report-singlequote.mjs` is `gate-report.mjs`'s fixture, not `em-dash.mjs`'s, so no fixture pins E1 on a single-quoted heading. `typography.js:534` says 07-13; `type.mjs:41` and `:111` say 2026-07-16. `ds-export.js:769 to 770` is the two-line bold label the issue names |
| #748 state | #730 CLOSED, `.sdlc/plans/archive/rule-gates.md` done; `docs/marketing/` holds `store-copy.md` (§10 at :637, the dashboard re-paste checklist), `web/landing.md`, `product/{boilerplate,brand-kit-mcp,claude-plugin,figma-plugin}.md`, `launch/launch-kit.md`, `voice/voice-platform.md`, `fact-sheet.md`, `INDEX.md`. `store-drift-check.mjs` lives at `.claude/skills/ultimate-tokens-brand-voice/scripts/` and needs `LEMONSQUEEZY_API_KEY` (SKILL.md:71). R37: product names `Ultimate Tokens Pro` and `Ultimate Tokens Studio`, re-pasted by the owner at the next dashboard walk |
| #784 state | `model.mjs:296`: `{ name: "Warning", hue: 70, chroma: 100, skew: 40, lift: -36, hueShift: 0, anchor: "#774902" }`. The notch is 17.73 / 11.80 / 15.51 C at stops 100 / 200 / 300 under `hueShift` -30 or -45, oklch anchored path (`okhslStopsAnchored`, `tonal.js:1294 to 1392`, the rotation at its line 69: `(hOkStop + shift * dir) % 360`). `even-dips-gate.mjs` (b1) reads the kit's 16 anchored palettes at `hueShift` ±60 only, because of this notch (rediagnosis §4: "4 of base's 6 a-kit dips, which this rule keeps at 4"); (b2)'s random anchored count is pinned at 7. #766 is CLOSED (landed), so the base the issue measured against is on `main` |
| `test/run.mjs` `TESTS` length | 54 |
| Grades ruling | R92 (2026-10-03): no Fable seat anywhere, no end date. Every unit here runs reviewer-l3 then verifier-l2; the pre-land pair is reviewer-l3 plus verifier-l2 |

## 2. Constraints

- File-level isolation from the two in-flight plans (the lead's rule for this batch), loosened to hunk-level for U5 and U7 only by the owner's Q1 B ruling: those two edit `typography.js`, `drawer.js` and `citations.mjs` at lines pane-context's hunks do not reach (section 1), and the Orchestrator re-checks the hunk ranges at dispatch. A unit's scope row (`git diff --name-only <unit base>..HEAD`) lists only its lane; a file from section 1's in-flight lists outside wave B is a scope red. Two single lines are the exception, because no unit can avoid them: the `TESTS` array line in `test/run.mjs` (U3 adds `"engine/names.mjs"`; compute-layers adds its own entries to the same line) and `scripts/bundle.mjs` MODS/KEY (U6 registers `names.mjs`; compute-layers adds 4 lines). Both are append-only list edits; the Orchestrator rebases whichever lands second and the merge is textual, not semantic.
- Wave B does not start before `origin/main` contains #785's squash. The Orchestrator rebases `plan/parallel-batch` onto it first (`git merge-base --is-ancestor <#785 squash> plan/parallel-batch` exits 0) and every wave B criterion reads line numbers on that head, not the ones in section 1, which are `main` at planning.
- U8 and compute-layers. Compute-layers freezes `ramp@1` at its U4 (a module never edited after it lands, hash-gated) and builds `ramp@2` at U5. This plan assumes U8 lands before that freeze, so the frozen `ramp@1` carries the fix and no pinned document keeps the notch. If compute-layers U4 lands first, U8 does not edit the frozen module: the builder lands the fix in the latest ramp version only, says so in the handoff, and the Orchestrator asks the owner whether a pinned-to-1 document keeping the notch is acceptable (section 7, Q3). Either way U8's gates are the engine gates, not compute-layers' byte-neutrality row, because U8 declares a movement.
- Engines stay pure and DOM-free, zero runtime deps (`names.mjs` imports only `./semantic.js`, `./prime.mjs` and the slug rule). The UI builds markup with `h()`, light DOM. R98 (computation first, no per-caller special cases) rules U4 and U6: the segment write moves to the one place that means "a click", and the collision rule is one predicate, not a list of exceptions.
- Gates per `.sdlc/adapter.md` §1 in the unit worktree, never in the root checkout: `npm test` (tree clean after), `npm run build` after `npm ci` on every unit touching `src/`, `scripts/` or `figma/binder/`, `npm run smoke` for the verifier on U4, U5, U6, plus U8's engine gates (`even-dips`, `chroma-envelope`, `mode-isolation`, `ramp-identity --authored`, `corpus-tonal`, `corpus-anchor` FULL).
- No U+2014 anywhere; `node test/repo/em-dash.mjs` and `node test/repo/branding.mjs` are green on every unit head, and this file passes both.
- Doc-shaped units (U1, and U2's adapter paragraph) close on the §6 amendment shape: a `## Claims` ledger and a `~~~sh ran` / `~~~out ran` pair in the handoff.

## 3. Design, stated once per unit

### U1 (#748, and #796's marketing lines): the marketing corpus reread under the no-em-dash rule, 15 voices everywhere

`marketing-manager-agent` with the `ultimate-tokens-brand-voice` skill rereads every line the em-dash sweep rewrote in `docs/marketing/store-copy.md` and `docs/marketing/web/landing.md` (the lines `git log -p --since=2026-09-20 -- docs/marketing` shows as rewritten by the sweep PR) and polishes those that read mechanically, then fixes the four stale voice counts (`claude-plugin.md:19`, `:60`, `landing.md:41`, `boilerplate.md:38`) to the 15-voice fact, keeping both `<!-- fix-old-names: keep -->` markers on their lines. Item 2 of #748 (the Lemon Squeezy dashboard walk of §10 and the R37 name re-paste) is the owner's hand with a live key; it is listed under Owner's actions in section 7, not built.

### U2 (#783, the half outside `citations.mjs`): one rename-map copy fewer, one E1 fixture, one hand repair, four pitfalls recorded

Delete `GEOMETRY_FIELD_RENAME_MAP` and its header comment from `figma/binder/mode-apply-plan.mjs` (nothing imports it; the canonical copy is `migrations.mjs:117`, parity-gated). Add a self-test fixture to `test/repo/em-dash.mjs` pinning E1 on a single-quoted heading string (the widening #764 shipped without a pin). Repair `src/engine/ds-export.js:769 to 770` by hand if the bold label there still fails `em-dash.mjs --fix`'s line-local rule, else record that it is already clean. Append one paragraph to `.sdlc/adapter.md` §1 "Rules the gates imply" carrying the four plan-criteria pitfalls (`--text` for `code.js` diffs under `.gitattributes` `diff: unset`; anchor fixture greps on `name: "`; compare against the unit base, not `origin/main`, on a plan branch; comment-stripped diffs miss rewraps), so the next planner reads them where the gates are defined.

### U3 (#787, the predicate): `src/engine/names.mjs`

One pure module exporting `emittedNames(slugOf)` (the set of flat names one palette slug emits: `slug + suffix` for the 53 `semanticRoles` suffixes, `slug + "-" + primeSlug(step)` for the 7 prime steps, and whatever else `exports.js:253` onward joins onto `n`, enumerated by reading that file, not from a hand list) and `nameCollisions(palettes)` (every pair of enabled palettes whose emitted-name sets intersect, with the first colliding name). Pure set intersection, so the lookalike pair (`x`, `x-primer`) is not a collision and the two-level pair (`x` with `prime-dim`, `x-prime` with `-dim`) is. Tests in new `test/engine/names.mjs`, registered in `TESTS`.

### U4 (#786): only a row click moves the inspector to Palette

Move the `this.segment = "palette"` write out of `selectPalette` into the three row `onclick` handlers (the palette list, the ramps scene, the mapping scene rows on the post-#785 head), so `_selectRelative`, `addPalette`, the new-palette commit, `duplicatePalette` and `deletePalette` leave the current tab alone. `_deselect` keeps its `global` write (pane-context U1's other decision). Amend `.sdlc/questions/pane-context-U1-f1.md` with a dated line under Answer (`2026-10-xx: the follow-up is #786, built by parallel-batch U4 as option B`) and `docs/lld/app-shell.md` only if it states the selection rule. Add a `(b3)` shim assertion: on Roles, ArrowDown keeps `segment === "roles"` and moves `sel.id`; a row click lands on `palette`.

### U5 (#796 code lines, #783's `:534`): three strings and a date

`drawer.js:529` and `typography.js:1013` say "15 voices" (the comment at `:1003` the same); `typography.js:534` reads 07-16. One commit, bundles regenerated.

### U6 (#787, the UI): refuse a colliding name on commit, never while typing

The palette name field gets a `onchange` commit step: if `nameCollisions` reports the new name against the other enabled palettes, the name reverts to the last non-colliding value and the inspector shows one `.name-collision-badge` text node naming the colliding palette and the first colliding token (the `radix-badge` pattern, `color.js:1136 to 1150`). `addPalette` and `duplicatePalette` pick their default name past any collision (`Palette 7`, `Primary copy 2`). `oninput` stays live, because typing passes through non-colliding prefixes. `names.mjs` is registered in `scripts/bundle.mjs` MODS/KEY. Refusal is the default; auto-disambiguation at export (the radix precedent) is section 7 Q2.

### U7 (#783, the `citations.mjs` half): two gate-breadth legs

`bareLiteralSource` grows the boolean and arrow-body shapes (`source: () => true`, `source: () => { return 7 }` with a boolean) with positives and negatives in its self-test; the count-phrase scan (4c) reds a narrowed noun (a pin whose `noun` is `roles?` but whose doc now reads `role` only) rather than letting it pass on the per-pin floor. Both legs carry a planted-red control in the unit's handoff.

### U8 (#784): the anchored notch at stop 200

A measurement unit first, a fix second. The builder reproduces the three readings in a committed report mode (`scripts/report-preset-fidelity.mjs` or `test/engine/tonal.mjs`, the floorref-hue probe recipe), reads `okhslStopsAnchored` at `hueShift` -30 and -45 for the kit's `#774902` palette stop by stop (floor, ceiling, solved hue, rendered C), names the mechanism in the handoff (the issue's "edge rotation" is a classification, not a diagnosis), then fixes it in the anchored path so stop 200 reads at or above `min(C100, C300)` under the even-floor rule at every `hueShift` in the (b1) grid. The fix declares a ramp movement: `ramp-identity --authored` lines are copied into the handoff and compared against the declaration, `mode-isolation` is the confinement control (perceptual and peak hashes unchanged, or the handoff says which cells moved and why), `chroma-envelope --compare` prints `0 cells rose`, and (b1) widens to `hueShift` ±30 / ±45 / ±60 reading 0 with the merge-base engine as its control.

## 4. Criteria (plan-level: each builder runs them in its unit worktree, each verifier reruns them, pre-land runs them all)

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| C1 | `npm test` green with no `node_modules`, the count agrees, the tree is byte-stable | `npm test 2>&1 \| tail -1; perl -0ne 'my ($b) = /const TESTS = \[(.*?)\];/s; my @m = $b =~ /"[^"]+\.mjs"/g; print scalar(@m), "\n"' test/run.mjs; git status --short \| wc -l` | the pass line naming N files, then N (54 at planning, 55 after U3), then `0` | in a clone carrying the unit commit (`git -C <clone> rev-parse HEAD` equals it): `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test; echo "exit $?"` prints `exit 1`, `engine/semantic.mjs` the one failing file, `refs-canonical` the failing gate | not run (read-only planning); `TESTS` 54 |
| C2 | `npm run build` green, tree clean after, on every unit touching `src/`, `scripts/` or `figma/binder/` | `npm ci && npm run build; echo "exit $?"; git status --short \| wc -l` | `exit 0`, `0` | in the clone, a type error planted in `src/main.ts` (`const x: number = "s";`): `tsc` reds, exit 1 | not run |
| C3 | repo gates green on every unit head | `node test/repo/em-dash.mjs \| tail -1; node test/repo/branding.mjs \| tail -1; sh .sdlc/checks/verdict-frontmatter-check.sh \| tail -1` | `em-dash: clean ...`, `branding: clean (N files scanned)`, the check's clean line | one U+2014 planted in this plan file: `em-dash.mjs` exits 1 naming `.sdlc/plans/parallel-batch.md` | this file: both clean at write time (section 8) |
| C4 | scope wall: every unit's diff stays in its lane | `git diff --name-only $(git merge-base plan/parallel-batch HEAD)..HEAD` in the unit worktree | only the unit's lane files (section 5 rows) plus regenerated bundles for `src/` units; no in-flight file outside the two single-line exceptions of section 2 | a stray edit to `src/ui/model.mjs` (compute-layers' file) shows as an extra line and reds the row | no unit diff yet |
| C5 | wave B gate | `git merge-base --is-ancestor <#785 squash sha> origin/main && git merge-base --is-ancestor <#785 squash sha> plan/parallel-batch; echo $?` | `0` before any wave B dispatch | run at planning: #785 has no squash sha, the command cannot pass, and no wave B unit is dispatched | not landed |
| C6 | the six issues close on landing, each with the pre-land verdict as reason | `for n in 786 787 796 783 748 784; do gh issue view $n --json state,closedAt --jq '"\(.state) \(.closedAt)"'; done` | six `CLOSED <date>` lines, after the squash | before the squash the same loop prints six `OPEN null` | all OPEN |

## 5. Units

Grades per R92: every unit reviewer-l3 then verifier-l2; the pre-land pair reviewer-l3 plus verifier-l2. Builder grades below.

- [x] U1 (S) #748 voice reread of the swept store copy and landing page, plus #796's four marketing voice counts · wave A · `marketing-manager-agent` with `ultimate-tokens-brand-voice` as the builder seat · grade l2 · lane `docs/marketing/**` only · C1.1 to C1.5
- [x] U2 (S) #783 outside citations: delete the fourth rename-map copy, pin E1 on single-quoted headings, hand-repair `ds-export.js:770`, record the four checkability pitfalls in adapter §1 · wave A · grade l2 · lane `figma/binder/mode-apply-plan.mjs`, `test/repo/em-dash.mjs`, `test/repo/fixtures/`, `src/engine/ds-export.js` (one prose line), `.sdlc/adapter.md` · C2.1 to C2.5
- [ ] U3 (S) #787 predicate: `src/engine/names.mjs` with `emittedNames` and `nameCollisions`, `test/engine/names.mjs`, `TESTS` entry · wave A · grade l3 · lane those two new files plus the `TESTS` line · C3.1 to C3.4
- [ ] U4 (S) #786 the segment write moves from `selectPalette` into the row click handlers; `(b3)` added; the U1-f1 question amended · wave B · grade l3 · lane `src/ui/sections/color.js`, `test/ui/headless-boot.mjs`, `.sdlc/questions/pane-context-U1-f1.md`, `docs/lld/app-shell.md` if it states the rule · C4.1 to C4.5
- [x] U5 (S) #796 code lines and #783's date: `drawer.js:529`, `typography.js:1003`, `:1013`, `:534`, and the "all 11 voices live" comment at about `:673-675` (revision 3, the same stale count, found by the builder) and the "all 11, matching 1:1" comment at about `:737` (revision 4; a whole-file grep of `typography.js` and `drawer.js` for eleven or 11 voices finds no other hit) · wave A (Q1 B) · grade l2 · lane those two files plus bundles · C5.1 to C5.3
- [ ] U6 (S) #787 UI: refusal on name commit, collision badge, collision-free default names, `names.mjs` in bundle MODS/KEY · wave B, after U3 and U4 · grade l3 · lane `src/ui/sections/color.js`, `src/ui/styles.css`, `scripts/bundle.mjs`, `test/ui/headless-boot.mjs` · C6.1 to C6.5
- [x] U7 (S) #783 citations half: `bareLiteralSource` covers boolean and arrow-body shapes; the count-phrase scan reds a narrowed noun · wave A (Q1 B) · grade l2 · lane `test/repo/citations.mjs` · C7.1 to C7.3
- [ ] U8 (M) #784 the anchored notch at stop 200: measured, diagnosed, fixed, (b1) widened to ±30 / ±45 / ±60 · wave B, last to land, before compute-layers U4 (section 2) · grade l5 · lane `src/engine/tonal.js`, `test/engine/tonal.mjs`, `test/engine/even-dips-gate.mjs`, `test/engine/fixtures/{chroma-envelope,mode-isolation}.json` if re-captured, `scripts/report-preset-fidelity.mjs` if the report mode lands there, `CHANGELOG.md` · C8.1 to C8.8

### U1 criteria (#748, #796 marketing)

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| C1.1 | no stale voice count in the corpus | `grep -rn "eleven" docs/marketing \| grep -i voice` | prints nothing | `git stash` the unit: prints the four lines of section 1 | 4 lines |
| C1.2 | the `fix-old-names` markers survive | `grep -c "fix-old-names: keep" docs/marketing/product/claude-plugin.md` | the same count as at the unit base (`3` at 9375f7c1) | a marker deleted: the count drops and `node test/repo/branding.mjs` or the `fix-old-names` tooling reds per its own rule | 3 |
| C1.3 | the em-dash gate stays clean and the word count fact holds | `node test/repo/em-dash.mjs \| tail -1; node -e 'import("./src/engine/type.mjs").then(m=>console.log(Object.keys(m.makeVoices()).length))'` | `clean`, `15`; every edited voice-count line reads `15` or `fifteen` | a U+2014 planted in `landing.md`: exit 1 naming the file | clean, 15 |
| C1.4 | scope | C4 in the unit worktree | only `docs/marketing/**` | an edit to `docs/lld/app-shell.md` shows as a second path | none |
| C1.5 | the voice verdict and the claims ledger | the handoff carries the agent's rubric verdict per rewritten line (polished or kept, with the reason) and the §6 `## Claims` table, one row per changed sentence, needle present | every row's needle greps in its anchor (`grep -c <needle> <anchor>` is 1 or more); the verifier reruns the `ran` block, empty diff against `out` | a needle edited in the ledger but not the file: `grep -c` prints `0` | no handoff |

### U2 criteria (#783 outside citations)

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| C2.1 | the fourth copy is gone and nothing needed it | `grep -rn "GEOMETRY_FIELD_RENAME_MAP" figma/binder/mode-apply-plan.mjs; git grep -n "GEOMETRY_FIELD_RENAME_MAP.*mode-apply-plan" -- figma src scripts test; git grep -nE "\b(MAP\|A)\.GEOMETRY_FIELD_RENAME_MAP" -- figma src scripts test` (revision 5: the old second grep is file-level and names two tests that import the map from `migrations.mjs`) | both print nothing; `npm test` green | the export re-added at the unit base in a clone: the first grep prints one line. Recorded in the handoff, not a criterion: planting `padding: "paddin-narrow"` in that copy and running `node test/figma/binder.mjs` passes at the base, the issue's claim | 1 export, 0 importers |
| C2.2 | E1 is pinned on a single-quoted heading | `node test/repo/em-dash.mjs 2>&1 \| head -1; grep -c "single-quoted heading\|singleQuote" test/repo/em-dash.mjs` (the self-test runs on every invocation, `em-dash.mjs:1051`; the fixture's label is named in the handoff) | `self-test: PASS`, `1` or more | the `"'"` dropped from `enclosingStringContent` (`em-dash.mjs:346`, the only quote list that feeds E1; `:229` is `insideStringAt` and does not) in a clone: the self-test reds on that fixture | no fixture |
| C2.3 | `ds-export.js:769 to 770` is clean under the line-local fix | in a clone at the unit base: `node test/repo/em-dash.mjs --fix; git diff --stat -- src/engine/ds-export.js` (the script has `--fix` and `--sample` only, `em-dash.mjs:1048`) | the diff is empty or touches lines 769 to 770 only, and `node test/repo/em-dash.mjs` prints `clean` after; the handoff states whether a hand edit was needed | the pre-sweep shape re-planted on line 769 to 770 in a clone: the gate names the line | gate clean on `main`; `--fix` behaviour unmeasured |
| C2.4 | the four pitfalls are in adapter §1 | `awk '/^## 1/,/^## 2/' .sdlc/adapter.md \| grep -c "diff: unset\|name: \"\|unit base\|comment rewrap"; sh .sdlc/checks/baseline-agrees-check.sh \| grep -c "ok    head:"` | `4` or more; the second count equals the unit base's (`1` at 2d19f63e; the paragraph adds no gate time figure) | the paragraph placed after `## 2.`: the `awk` slice count drops to `0` | 0; 1 |
| C2.5 | scope and the claims ledger | C4; the §6 ledger for the adapter paragraph | only the five lane paths; every needle present | as C1.5 | none |

### U3 criteria (#787 predicate)

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| C3.1 | the two-level pair is a collision, the lookalike is not | `node test/engine/names.mjs \| tail -1` with cases: (`x`, `x-prime`) collides on `x-prime-dim` (palette `x`'s `prime-dim` against palette `x-prime`'s `-dim`) and on `x-prime` itself; (`x`, `x-hover`) collides on `x-hover`; (`x`, `x-primer`) does not; (`x`, `y`) does not; a disabled palette (`on: false`) is ignored | PASS, all five cases | a prefix heuristic planted in place of set intersection (`slugB.startsWith(slugA + "-")`): the lookalike case reds | no module |
| C3.2 | the emitted set is the exporter's, not a hand list | `node -e` comparing `emittedNames("x")` against the names `exportCss`/`exportJson` (whichever flat format `exports.js` keys by `n + suffix`) actually emit for a one-palette state named `x` | set equality on the per-palette names (constants excluded), printed `equal` | a suffix removed from `emittedNames`: `missing <name>` | 53 role suffixes + 7 prime names at planning; the builder measures the exporter's own list |
| C3.3 | purity | `grep -n "document\|window\|from \"../ui" src/engine/names.mjs` | prints nothing | `document.title;` planted in `names.mjs` in a clone: the same grep prints one line | none |
| C3.4 | registered and counted | C1's perl count | `55`; `names.mjs` listed in `TESTS` | not registered: the count stays 54 and the new file never runs (the vacuity #783 warns of) | 54 |

### U4 criteria (#786, wave B head)

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| C4.1 | `selectPalette` no longer writes the segment | `grep -n 'segment = "palette"' src/ui/sections/color.js src/ui/app.js` | hits only inside the row `onclick` handlers and the two constructor/reset sites (`app.js:94`, `:210` at planning); none inside `selectPalette` | the write re-added to `selectPalette` in a clone: `(b3)` reds | inside `selectPalette` at `:258` |
| C4.2 | ArrowDown on Roles stays on Roles | `node test/ui/headless-boot.mjs 2>&1 \| tail -1; grep -c "(b3)" test/ui/headless-boot.mjs` (the shim's `ok()` at `:17` records failures only, so a passing assertion prints nothing) | `HEADLESS BOOT PASS`; `2` or more, the labels `(b3) ArrowDown on Roles keeps segment roles and moves sel.id` and `(b3) row click lands on palette` present in the source | C4.1's clone: the run prints `✗ (b3) ArrowDown on Roles ...` and does not end in `PASS` | no assertion |
| C4.3 | add, duplicate, delete keep the tab | the same group, labels `(b3) addPalette keeps roles`, `(b3) duplicatePalette keeps roles`, `(b3) deletePalette keeps roles`; `node test/ui/headless-boot.mjs 2>&1 \| tail -1; grep -c "(b3) .*keeps roles" test/ui/headless-boot.mjs` | `HEADLESS BOOT PASS`; `3` | C4.1's clone: three `✗ (b3) ... keeps roles` lines | none |
| C4.4 | `(b2)`, `(j7b)`, `(i-all)`, `(i-one)` still pass; smoke green | `node test/ui/headless-boot.mjs 2>&1 \| grep -c "^  ✗ .*(b2)\|^  ✗ .*(j7b)\|^  ✗ .*(i-all)\|^  ✗ .*(i-one)"; node test/ui/headless-boot.mjs 2>&1 \| tail -1; npm run smoke \| tail -1` | `0`, `HEADLESS BOOT PASS`, `SMOKE PASS` | `_deselect`'s `global` write removed in a clone: `  ✗ (b2) ...` printed (the shim's two-space prefix, `headless-boot.mjs:4214`), the first count `1` or more | green on `origin/plan/pane-context` |
| C4.5 | the record is repaired | `grep -n "#786" .sdlc/questions/pane-context-U1-f1.md .sdlc/plans/archive/pane-context.md` | the question file carries a dated Answer line naming #786 and option B as built; the archived plan is read-only history and is not edited | `grep -c "#786" .sdlc/questions/pane-context-U1-f1.md` prints `0` at the unit base | `0` |

### U5 criteria (#796 code, #783 `:534`)

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| C5.1 | no `eleven` voice wording in the two files or the bundles | `grep -n "eleven" src/ui/overlays/drawer.js src/ui/sections/typography.js; grep -c "eleven-voice" figma/plugin/ui.html dist/ultimate-tokens.html` | nothing; `0` and `0` after `npm test` and `npm run build` | `git stash`: 3 source lines, bundle count 1 or more | 3 lines |
| C5.2 | the date agrees with its source (revision 3) | `grep -n "07-13" src/ui/sections/typography.js; grep -c "2026-07-16" src/engine/type.mjs` | the `07-13` hits are only the fixed-table rewrite date at `:671` (correct per `type.mjs:8`); none on the `:535` voices-shape comment line; `2` or more | `type.mjs` is the source; a `:534` reading `07-13` is the stale line | `07-13` at `:534` |
| C5.3 | scope and gates | C4; C1; C2; `npm run smoke` | two source files plus bundles; green | an edit to `src/engine/type.mjs` shows as a third path | none |

### U6 criteria (#787 UI, after U3 and U4)

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| C6.1 | a colliding rename is refused on commit | shim group `(nm1)`: rename palette 1 to `<slug of palette 0>-hover` via `change`; read `doc.palettes[1].name` and the inspector | the name reverts to its pre-edit value; exactly one `.name-collision-badge` node, text naming palette 0 and the token `…-hover` | the guard call removed in a clone: the name sticks, no badge, `(nm1)` reds | no guard |
| C6.2 | typing is not refused | `(nm2)`: `input` events spelling `primary-hov` one character at a time | every intermediate value sticks; no badge until `change` | the guard moved to `oninput`: the final character is refused mid-word, `(nm2)` reds | n/a |
| C6.3 | defaults avoid collisions | `(nm3)`: with palettes `Palette 3` and `Palette 3-hover` present, `addPalette()` then `duplicatePalette(0)` | both new names are collision-free per `nameCollisions` | the default-name step skipping the check: `nameCollisions` returns a pair | n/a |
| C6.4 | the lookalike is allowed end to end | `(nm4)`: rename to `<slug0>-primer` | sticks, no badge | C3.1's prefix heuristic planted: badge appears | n/a |
| C6.5 | bundle registration, gates, scope | `grep -n "names" scripts/bundle.mjs; npm test; npm run build; npm run smoke; C4` | one MODS entry and one KEY entry; green; the four lane files plus bundles | `names.mjs` unregistered: `scripts/bundle.mjs`'s MODS/KEY check reds (its own rule, `bundle.mjs:73`) | unregistered |

### U7 criteria (#783 citations half, wave A, hunk-level per Q1 B)

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| C7.1 | boolean and arrow-body shapes are bare literals | `node test/repo/citations.mjs \| tail -1` with the self-test positives extended by `source: () => true`, `source: async () => { return 7; }`, `source: () => (7)` | PASS; the negatives (a `source` that reads a file) still pass | one new positive planted as a real pin in a clone: `bare literal source` FAIL names it | positives cover numbers only |
| C7.2 | a narrowed noun reds | in a clone at the unit head: `sed -i '' 's/noun: "roles?"/noun: "role"/' test/repo/citations.mjs; out=$(mktemp); node test/repo/citations.mjs > "$out" 2>&1; echo "exit $?"; grep -c 'roles per palette' "$out"` (the run's own status, captured before the grep) | `exit 1`, then a count of `1` or more (the FAIL line names fact pin `roles per palette` and the narrowed noun) | the same `sed` at the unit base: `exit 0` and count `0` (measured at 580df2dd by the verifier; the gap #783 names: `a 53-role` still matches `role`, so the per-pin floor is met) | passes at base |
| C7.3 | scope and the gate's own self-test | C4; `node test/repo/citations.mjs \| grep -c FAIL` | `test/repo/citations.mjs` only; `0` | as C7.1 | none |

### U8 criteria (#784, wave B, last)

| # | Criterion | Command | Expected | Negative control | Today |
|---|---|---|---|---|---|
| C8.1 | the notch is reproduced in a committed mode before the fix | `node scripts/report-preset-fidelity.mjs --notch --palette "#774902" --hue-shift -30,-45` (or the `tonal.mjs` probe the builder lands; shape named in the handoff) at the unit base | prints stops 100 / 200 / 300 as 17.73 / 11.80 / 15.51 (±0.01) at -30 and the -45 triple | `--hue-shift 0`: no dip (the kit renders `hueShift` 0 today) | the rediagnosis §4 figures |
| C8.2 | the mechanism is named | the handoff's Findings: which quantity at stop 200 (floor, ceiling, solved hue, clamp) moves under rotation and why the floor does not hold it | one paragraph with the numbers from C8.1's per-stop dump; the reviewer checks it against the dump | a Findings that restates "edge rotation" without a quantity is a FIX-FIRST | unknown |
| C8.3 | the dip is gone | C8.1's command at the unit head | stop 200 at or above `min(C100, C300)` at -30 and -45; the three values printed | `git stash`: C8.1's base figures return | dips |
| C8.4 | (b1) widens and reads 0 | `npm run gate:even-dips 2>&1 \| grep "(b1)"` | the (b1) line names `hueShift +/-30/45/60` and reads `0 dips`; the merge-base engine on the widened grid reads `4` (the control line the gate prints, as (b2) does today) | the control not biting (`0` on the base engine): the gate's own `DID NOT BITE` red | (b1) is ±60 only, 0 |
| C8.5 | (b2) holds and the pre-#701 control bites | `npm run gate:even-dips \| tail -2; node test/engine/tonal.mjs \| tail -1` | (b2) at or under its pinned 7, `PASS`; the in-script negative control above 0 | `--floor-scale 1.6`: dips above 0 | 7, PASS |
| C8.6 | movement declared, confined | `node scripts/report-preset-fidelity.mjs --identity-control --authored --base $(git merge-base origin/main HEAD)`; `npm run gate:mode-isolation \| tail -1`; `node test/engine/chroma-envelope-gate.mjs --compare <base fixture>` | the six `identity` lines copied into the handoff and matching the declaration (only anchored palettes with nonzero `hueShift`, or the exact wider set the Findings justify); `mode-isolation` `pass` unchanged, or re-captured with the moved cells named; `0 cells rose` | an unanchored palette moving: a non-declared identity line, FAIL | 0 cells (no fix) |
| C8.7 | the sweeps of record | `npm run gate:corpus-tonal -- --full \| tail -1; npm run gate:corpus-anchor -- --full \| tail -1; npm run gate:sweep-prime -- --full \| tail -1` | three PASS lines with FULL mode lines | C1's control | green on `main` |
| C8.8 | gate timing and the baseline | paired `even-dips` runs, base and head, quiet host, five each | median ratio head/base at or under 1.3 (the grid triples); `.sdlc/baseline.md`'s row re-timed if it moves, named in Revisions | a ratio above 1.3 is a 🟡 for the owner, not a silent pass | 36 to 54 s |

## 6. Not in scope

| Item | Why | Where it goes |
|---|---|---|
| #748 item 2, the Lemon Squeezy dashboard walk of `store-copy.md` §10 and the R37 name re-paste | needs the owner's hand and a live `LEMONSQUEEZY_API_KEY`; `store-drift-check.mjs` warns until done | section 7, Owner's actions; #748 closes on U1 with a comment that item 2 is the owner's |
| Export-time auto-disambiguation of colliding palette slugs (the radix `-palette` precedent applied to every flat format) | changes emitted names in ten formats, `semantic.js` keying and the Figma binder; not size:small, and `exports.js` is compute-layers' file | section 7 Q2; a new issue if the owner picks it |
| Any edit to `src/engine/exports.js`, `src/ui/model.mjs`, `src/ui/app.js`, `src/ui/persist.js` | in-flight files | the plans that own them |
| The `(b2)` random anchored dip count going to 0 | #784 is one kit palette; (b2)'s 7 are a separate population the floorref-hue plan pinned | stays pinned; U8 reports the head count without changing the bound unless the fix lowers it |
| Rewriting `.sdlc/plans/archive/pane-context.md`'s Decision | archived plans are history | the question file's dated line (C4.5) |

## 7. Risks and open questions

| Risk | What this plan does about it |
|---|---|
| #785 slips, wave B waits | wave A lands as its own value; the Orchestrator may open the draft PR after wave A and keep it open, or split wave B into `plan/parallel-batch-b` (one revision row, no new ticket) if the owner wants wave A merged first |
| U4 and U6 both edit `color.js` | serialized: U6 branches from the plan head after U4's merge; C4's base is the plan branch so U4's lines are not U6's diff |
| compute-layers U4 freezes `ramp@1` before U8 lands | section 2's rule: the fix enters the latest version only; Q3 asks the owner about pinned docs |
| U8's fix moves curated presets | `ramp-identity --authored` lists them; a movement outside anchored nonzero-`hueShift` palettes is undeclared and FAILs C8.6 unless the Findings widen the declaration with a reason |
| The lead's file-level rule is stricter than the hunks need | ruled by the owner (Q1 B): hunk-level for U5 and U7, which start in wave A; section 1 records the hunk ranges the ruling rests on, and the Orchestrator re-checks them against `origin/plan/pane-context` at dispatch (`git diff -U0 main...origin/plan/pane-context -- <file> \| grep '^@@'`) |

Open questions for the owner, answered 2026-10-04 (revision 1); the Answer column is the ruling and binds the units:

| # | Question | Options | Answer |
|---|---|---|---|
| Q1 | May U5 (`typography.js:1003/:1013/:534`, `drawer.js:529`) and U7 (`citations.mjs:125 to 235`) start now, since their hunks are disjoint from pane-context's (134 to 390, 613; 58, 82 to 89)? | A: keep the file-level rule, wave B · B: hunk-level, start now | B (owner, 2026-10-04): U5 and U7 are wave A |
| Q2 | #787: refuse a colliding name on commit (U6 as written), or auto-disambiguate at export like the radix key? | A: refuse with a badge · B: auto-disambiguate (new issue, exports lane) | A (owner, 2026-10-04): U6 as written |
| Q3 | If compute-layers freezes `ramp@1` before U8 lands, may a document pinned to `ramp@1` keep the notch? | A: yes, the fix is `ramp@2`'s · B: no, U8 lands first and compute-layers U4 waits | B (owner, 2026-10-04): U8 lands before compute-layers U4; the Orchestrator sequences the two plans |

Owner's actions (not units): the §10 dashboard walk with the R37 names, then `node .claude/skills/ultimate-tokens-brand-voice/scripts/store-drift-check.mjs` printing no warning.

## 8. Landing

One PR from `plan/parallel-batch` after U8 verifies, pre-land pair reviewer-l3 plus verifier-l2 (R92), a 🟢 `.sdlc/verdicts/parallel-batch-prepr.md`, green CI (`build-test`, `panda-smoke`, `corpus-contrast`, `sweeps`), then `shipping-changes` squash and sync, then §5 close-out: status `done`, units ticked, file to `.sdlc/plans/archive/`, `adapter.py close` for #786 with the five others closed with the same reason, board rows 🟢, `.sdlc/baseline.md` `ref` to the squash and re-timed rows if U8 moved `even-dips`. This file was checked with `node test/repo/em-dash.mjs` and `node test/repo/branding.mjs` at write time (section Revisions row 0).

## Revisions

| Date | Change | Why |
|---|---|---|
| 2026-10-04 | revision 0, draft at 9375f7c1 | the lead's ask: one plan over #786, #787, #796, #783, #748, #784, isolated from `plan/pane-context` and `plan/compute-layers` |
| 2026-10-04 | revision 1 at 2d19f63e: C2.4, C3.3, C4.2, C4.3, C4.4, C7.2 reworded per `.sdlc/verdicts/parallel-batch-criteria.md` pass 1 (the shim prints failures only; named controls; the exact `sed` for the narrowed noun); Q1 B, Q2 A, Q3 B recorded; U5 and U7 moved to wave A | the verifier's six 🔴 rows and the owner's three answers |
| 2026-10-04 | revision 2 at 580df2dd: C4.4 greps the shim's `  ✗ ` prefix (`headless-boot.mjs:4214`); C7.2 captures `citations.mjs`'s own exit status into a file before the grep | pass 2 of `.sdlc/verdicts/parallel-batch-criteria.md`, two 🔴 rows |
| 2026-10-04 | revision 3: C5.2 reworded (the `:671` "since 2026-07-13" is correct per `type.mjs:8`, so the literal grep cannot be empty; it now excludes `:671` and checks the voices-shape comment line) and the U5 lane gains the "all 11 voices live" comment at about `:673-675` (same stale count as #796, hunk clear of pane-context) | pb-U5 builder finding, `.worktrees/pb-U5/.sdlc/handoffs/parallel-batch-U5.md`; no owner question (revision count 4, under the cap of 5) |
| 2026-10-04 | revision 4: the U5 lane gains the "all 11, matching 1:1" comment at about `:737` (same stale count; the builder found it on pass 2; hunk clear of pane-context) | pb-U5 pass 2 report; no owner question (revision rows still at or under the cap of 5) |
| 2026-10-04 | revision 5: C2.1 second grep replaced (the old one is file-level and cannot print nothing) and C2.2's control names `em-dash.mjs:346` | pb-U2 review `.sdlc/reviews/parallel-batch-U2-review.md` and the builder handoff; no owner question (five revision rows, at the cap) |
