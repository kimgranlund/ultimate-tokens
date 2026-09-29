PASS

# Review docs-repair U7 pass 2 (#751)

| Field | Value |
|---|---|
| Seat | reviewer, fresh context, standing in for reviewer-l4 (fable capped); Opus 5.5, same family as builder-l7 per b9044bb |
| Head reviewed | unit/dr-U7 @ 6b56a074 (handoff commit); commit A ac3f6974 |
| Base | plan/docs-repair @ baaf06ab; B = 282fca8d (merge-base with origin/main, as the verdict) |
| Criteria | U7-1 to U7-6, P3, P4, P7, P8 at plan revision 15 |
| Where run | a `git clone -q --shared` of `.worktrees/dr-U7` under the job tmp dir, origin re-pointed at the local repo; the unit worktree was not touched until this record's commit |

## Behaviour sentences against their deciders

Every sentence pass 2 adds or changes, read against the function that produces the value, not the guard that tests it.

| Sentence | Decider opened | Holds |
|---|---|---|
| README.md:160 `Breakpoint modes sit beside it, Tablet and Mobile by default` | `typeEffectiveModes` (src/ui/model.mjs:89-93): no `doc.type.modes` returns the two STANDARD_TYPE_RUNGS | 🟢 |
| README.md:160-161 `an **All** button shows every breakpoint` (no condition now) | the same decider can never return `[]`, so the `modes.length` guard at typography.js:172 always emits All; `deleteTypeMode` (typography.js:210-216) deletes an emptied array, which brings the standard pair back | 🟢 |
| README.md:164-165 Geometry `the same breakpoint modes and All button` | `geomEffectiveModes` (model.mjs:96-101), guard geometry.js:225 | 🟢 |
| README.md:165-166 `text size composes from the Type scale (the ladder prototype ramp is the one exception)` | `geomScaleFor` (model.mjs:169-176) always passes `typeScaleFor(doc, modeKey)`; `geomScale` (src/engine/geometry.mjs:258-290) takes `composed` at :286-287 on the default ramp and `buildSizeLadder` (:180-190) on the ladder; `fontOverrides` has no caller in src/ui (`grep -rn fontOverrides src/ui` prints nothing outside the generated assets); the ladder is reachable from the Ramp tab (geometry.js:751 to `_setGeomRamp` :305-309) | 🟢 |
| ui-plan.md:50-51 `Tablet and Mobile are live from typeEffectiveModes (geomEffectiveModes) until a mode is materialized` | the deciders' own test `(t.modes \|\| []).length` | 🟢 |
| glossary.md:45 `always offered, since the standard Tablet and Mobile modes are live until the document materializes its own` | same two deciders | 🟢 |
| .sdlc/architecture.md DD9 `rounds to 80 to 89 s, inside "80 to 90 s"` | 79.93 rounds to 80, 89.10 to 89 | 🟢 |
| DD41 `README.md:174` | U7-3 leg 1 prints `1`, drift check `bad 0` | 🟢 |

No sentence in the section, ui-plan.md or glossary.md still conditions All on a mode existing: a tree-wide `git grep -i -E 'only when (at least one|≥ ?1|a) mode|once (one|a mode) exists|when (any )?modes? exists?|at least one (breakpoint )?mode'` outside `.sdlc` finds only the two known source comments (typography.js:171, geometry.js:224), already routed to the U1 /file-task chore.

## Criteria

| Row | State | Evidence (clean clone) | Negative control |
|---|---|---|---|
| P8 | 🟢 | `F=$F bash p8.sh` at 6b56a074: `H=ac3f6974`, `HAS-RAN`, `1 1 1 1 1 1`, no diff lines, `diff 0`. Each `# U7-n` line of `ran.sh` equals the plan cell with `\|` unescaped (a backtick-aware cell split; all six `equal`); `# P3` is P8's own prescribed line | the builder's `66` to `65` control stands; not rerun |
| U7-1 to U7-3 | 🟢 | reproduced inside P8 (`145:## Views and sections`, `172:## License`, eight counts, `28`, `0`, `1`, `bad 0`, `0`, `2`) | pass 1's controls stand |
| U7-4 | 🟢 | `66`, `0` failing, `7` condition; each probe run alone prints its Needle (`single-compare`, `Tablet,Mobile` x2, `Mode 1` x2, `all-shown`, `composed-unless-ladder`) | (a) no `## Claims`: `NO-LEDGER 0 0 0`. (c) the four-row fixture: `4 1 2`, line 2 `0 condition node --input-type=module -e 'import {typ reachable`. (d) deciders `return t.modes \|\| []`: `66 3 7`, the three decider rows red. (e) `false ? composed`: `66 2 7`. (f) `&& !isTable` removed: `66 2 7`, `single-compare` reds. Mine: (g) ladder fed the composed/999 font: `66 1 7`, `composed-unless-ladder` reds; (h) `typeEffectiveModes` ignores own modes: `66 1 7`, `typ Mode 1` reds. Every condition row reds on its own mutation |
| U7-5 | 🟢 | at ac3f6974: `0 0 0 1 2 2 2 2` | the three docs at 96455bdd: `1 2 1 0` |
| U7-6 | 🟢 | at 6b56a074: `0`, `1`, `1`, `S=baaf06ab H=ac3f6974`, `base-ok` | architecture.md and handoff at 96455bdd: `1 0 0`. A later-plan-tip Base could not be built: plan/docs-repair is still `baaf06ab` |
| P3 | 🟢 | `branding: clean (751 files scanned)`, `0`, `2` (U3's records, as the handoff says); U7 adds `0` U+2014 lines against baaf06ab | not rerun |
| P4 | 🟢 | `0`, `0`, `0`, `0` | not rerun |
| P7 | 🟢 | `H=ac3f6974`, `ancestor`, `0` | not rerun |
| P5 (extra) | 🟢 | `✓ citations: parser self-test + STALE 0 across 10 discovered docs + 6 fact pins (HEAD 6b56a074)`, `exit 0`; clone tree `0` dirty after | not rerun; pass 1 verdict ran the bumped `mixinInto` cite: `✗ 1 citation gate failure(s)`, `exit 1` |

`npm test` not run: the change is docs and records only, P8 reproduced the handoff's figures, and the handoff's own run at ac3f6974 stands.

## Findings

1. 🟡 R1 (plan, the builder's disclosed defect 1, confirmed). U7-6 reads `.sdlc/handoffs/docs-repair-U7.md` from the tree, not `"${HF:-...}"`. At ac3f6974 that file is the pass 1 handoff (`git show ac3f6974:.sdlc/handoffs/docs-repair-U7.md | head -1` prints `# Handoff U7 pass 1 · builder to verifier`), so the `~~~out ran` block records `0 1 0 base-ok`, and its `base-ok` compares pass 1's Base and Branch, not this handoff's. P8's `diff 0` on those four lines proves only that the old handoff is unchanged. The criterion itself passes at 6b56a074 (above). Rating: 🟡, not blocking; same class as pass 1 F2. Fix in the plan: U7-6 reads `"${HF:-.sdlc/handoffs/docs-repair-U7.md}"` for its three handoff reads.
2. 🟡 R2 (plan, disclosed defect 2, confirmed and wider than disclosed). A plain `|` inside a table cell splits the cell in GFM even inside a code span, and any cell-split extractor cuts there. Counting unescaped pipes per criterion row (`perl -ne 'my $n = () = /(?<!\\)\|/g'`, 7 for a six-column row): `P8 9` (the `\|\| echo NO-RAN` the builder named), and also `P4 10`, `U1-8 9`, `U2-4 10`, `U3-5 11`, `U6-5 9`, `U7-4 9`, `U7-6 8`. The extra pipes outside P8 are revision 14's `[|]`, which the escape paragraph calls safe: safe for the shell, not for the table. A reader who copies from the rendered plan gets a cut command; the verifier must extract with a backtick-aware split (this review did). Rating: 🟡, a pre-land plan item for the Orchestrator, not U7's.
3. 🟡 R3 (handoff Decision 1, rationale only). It says `addTypeMode appends to a materialized set ... so Tablet and Mobile stay after you add your own`. On a document with no modes (the default) it does not append to anything: `const modes = d.type.modes ? [...d.type.modes] : []` (typography.js:204). Probe with a stub `commit`: before `Tablet,Mobile`, after `+` on a default doc `Mode 1`. So the brief's `live until you add your own` was true for the `+` path; the builder's other reason (a first token edit materializes both rungs, typography.js:406 via setTypeTokenOverride, :411-414) is right. The README wording chosen, `by default`, is true either way, and the `Mode 1` condition rows prove the replacement; no doc changes.
4. ℹ️ R4 (out of the wall). `src/ui/model.mjs:46` and `:167` still say `XS/XL/2XL fall back to the engine's fixed CONTROL_FONT ramp`; `geometry.mjs:234` says the UI-control voice rides the full XS..2XL ramp, and the ledger's `composed-unless-ladder` probe confirms every default step composes. Same class as the `only when ≥1 mode` comments; add it to the U1 /file-task chore rather than this unit (model.mjs is outside P4's wall).
5. ℹ️ R5 (scope). The handoff commit `git mv`s `.sdlc/verdicts/docs-repair-U6-review.md` (another unit's record) and U7's pass 1 review to `.sdlc/reviews/`, which the re-diagnosis brief's scope list does not name. P4 admits the paths, and `git grep 'verdicts/docs-repair-U(6|7)-review' 6b56a074` finds only the handoff itself and the re-diagnosis's historical `inputs:` line, so nothing breaks. The five older docs-repair records still failing main's verdict-frontmatter gate remain a pre-land item, as the dispatch says.

No 🔴. The pass 1 🔴 (All conditioned on a mode existing) is repaired in all three docs, and the new `condition` rows each red on a mutation of their decider.
