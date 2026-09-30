# Criteria review docs-stale-batch · 🔴 not mobilizable (U6 has no criteria; 24 of 24 stated criteria checkable, 3 🟡)

| Field | Value |
|---|---|
| Plan | `.sdlc/plans/docs-stale-batch.md` revision 2 (draft, uncommitted in the root checkout), head ef630848 |
| Asked by | conductor, 2026-09-30 |
| Grade | L1 seat, ran every Today/base reading itself in the root checkout at 7ecd1a51 (`git diff ef630848 7ecd1a51 -- . ':!.sdlc'` is empty, so the readings are the plan's head) |

Checkable means a command exists now that prints one value before the unit and a different value after, or a code-truth probe with a control that reds it.

verdict: 🔴

## Criteria

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| P1 | `npm test` green, tree clean | 🟢 | `test/run.mjs:33` pass line `✓ all ${TESTS.length} test files passed`, N `54` | adapter §1 role-table corruption, as stated |
| P2 | em-dash and branding clean | 🟢 | `node test/repo/em-dash.mjs \| tail -1` and `branding.mjs` last lines | planted glyph, as stated |
| P3 | Claims ledger and P8 pair | 🟡 | the loop runs as written on BSD sed (`sed 's/^ *\x60//'` strips the backtick: `abc`); on the named precedent `.sdlc/handoffs/docs-repair-U7.md` it prints `7 cond` and 59 `MISS` lines, because that ledger's anchors are `src/ui/app.js:74` (path plus line) and the loop greps the anchor as a file. The plan's own Steps give bare-path anchors, so the expected all-`ok` reading is reachable, but the plan calls the precedent "the shape" without saying anchors must be bare paths. Separately, U1's `present` row `19` in `test/figma/binder.mjs` is a `grep -F 19`, which any `19` in the file satisfies (U1-2 is the real check). `$F` and `$HF` are used but never defined in the plan | a needle edited off its anchor prints `MISS`; `~~~sh ran` removed prints `0` |
| P4 | ran block reproduces | 🟢 | extracts two fenced blocks and `diff`s | run at the merge base: the sha line differs |
| P5 | trivial lane boundary | 🟢 | `git diff --name-only` path list | a `scripts/` path listed |
| P6 | ramp identity (U4) | 🟢 | `scripts/report-preset-fidelity.mjs:588` last line `${totalDiff} differing cells`; `--perturb` exists (`:31`, `:35`) | `--perturb` reads nonzero |
| U1-1 | SCRIM constants named | 🟢 | base `0` `0` `0` in `figma/README.md` | the base reading |
| U1-2 | gate count equals `DECLARED` | 🟢 | base `R=[] D=19`; `mode-apply-plan.mjs` count `1` | `18 gates` plant, as stated |
| U1-3 | voice map gate named, overclaim gone | 🟢 | base `libraryparity` in README `0`, `executor path` `1`, in `test/figma/plugin.mjs` `59` | the base reading |
| U1-4 | P1 to P5 | 🟢 | the `P1` to `P5` rows above | as above |
| U2-1 | stale phrase gone, decider named | 🟢 | base `start centered` `1`, `_fitTopLeftInset` `0` in the skill, `4` in `src/ui/app.js` | the base reading |
| U2-2 | `fit()` sets zoom 1 and schedules the inset | 🟢 | `awk '/^  fit\(\) \{/,/^  \}/' src/ui/app.js \| grep -c -E 'zoom: 1\|_fitTopLeftInset'` reads `3` today | rename the call, as stated |
| U2-3 | P1 to P5 | 🟢 | the `P` rows above | as above |
| U3-1 | wiring overclaim gone | 🟢 | base `1` `1` | the base reading |
| U3-2 | `package.json` wiring | 🟢 | today `true true node scripts/gen-figma-binder-code.mjs` | the `test` script edit, as stated |
| U3-3 | regenerated assets clean | 🟢 | base `src/ui/figma-plugin-assets.js:1`, `figma/plugin/ui.html:1` | assets reverted, as stated |
| U3-4 | generator idempotence | 🟡 | `node scripts/gen-figma-binder-code.mjs && git status --porcelain \| wc -l` | the control cell is `n/a`; a criterion without a control cannot be 🟢. A control is nameable (a stale generated section in the binder `code.js` in the control clone makes the run write it and the count read `1`) |
| U3-5 | P1 to P4 | 🟢 | the `P` rows above | as above |
| U4-1 | trio claim gone | 🟢 | base `2` | the base reading |
| U4-2 | UI-control composes at six steps; no-opts falls back | 🟡 | today `6 true false` at `bodyBase` 18, and `default 6 true true` at the default, both as the plan says | the stated control is the default-scale run, which shows a vacuous reading, not that this row can fail: the row reads `6 true false` before and after the unit. A control that reds it is nameable (a `geomScale` that ignores `typeScale` in the control clone reads `6 false false`) |
| U4-3 | dead-guard comments gone, deciders named | 🟢 | base `1` `1` `7` `7` | the base reading |
| U4-4 | deciders return 2 rungs on no modes | 🟢 | today `2 2 2` | one materialized mode: `ctl 1` |
| U4-5 | comment-stripped files identical | 🟢 | `diff` against `git show "$B:$f"` after the same `sed` strip on both sides | an edited `modes.length ?` line counts |
| U4-6 | P1 to P4, P6 | 🟢 | the `P` rows above | as above |
| U6 | `.sdlc/adapter.md` §6 names the ledger and the P8 pair (#768) | 🔴 | the Units list names U6, and Risks cites `U6-3`, but the plan has no `### U6` section and no U6 criterion row: `grep -n '^### U6' .sdlc/plans/docs-stale-batch.md` prints nothing. §6 exists (`.sdlc/adapter.md:197`) | none can be stated: there is nothing to check |

## The 🔴

U6 (#768) has no criteria. Its done-when, the §6 wording it must carry, and the scope wall that keeps the #725 §1 amendment out (the `U6-3` that Risks cites) all need rows before the plan can be mobilized.

## Plan notes (🟡, not criteria)

- The "U5 dropped" choice leaves the four `typography.js` sites to gates-batch U2. That plan's revision 3 adds them (U2-12), so the handoff note here holds.

## Verdict

🔴 not mobilizable: U6 carries no criteria. The 24 stated rows are all checkable (21 🟢, 3 🟡: P3, U3-4, U4-2).

## Pass 2 · revision 3 (uncommitted, root checkout at 1174bcd6) · 🔴 27 of 29 checkable, U6-3 and U6-4 🔴

This pass re-grades the rows revision 3 changed (P3, U3-4, U4-2) and the restored U6 (U6-1 to U6-5). It also corrects pass 1's U4-5. Every other row is unchanged and carries. Controls ran in a throwaway shared clone at 1174bcd6 under `$CLAUDE_JOB_DIR/tmp/dsb`, and `.sdlc/adapter.md` was read at `origin/main`.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| P3 | Claims ledger and P8 pair | 🟢 | the loop, with table escapes removed, on a handoff with bare-path anchors (`DECLARED` present in `test/figma/binder.mjs`, one `absent`, one `condition`): `3`, `1 cond`, `2 ok`, `1`, `1`. `F` and `HF` are now defined, and the bare-path anchor rule and the no-bare-number needle rule are stated | needle edited to `NOTAWORD_XYZ`: `1 MISS NOTAWORD_XYZ`; `~~~sh ran` removed: the first fence count reads `0` |
| U3-4 | generator idempotence | 🟢 | clean clone: `0` | measured: a stale line planted above `// === GENERATED:FLOAT_EXECUTOR END ===` and committed, then the generator run reads `1` |
| U4-2 | UI-control composes at six steps; no-opts falls back | 🟢 | probe at `bodyBase` 18 reads `6 true false` | measured: `const uiSteps = false &&` in `geometry.mjs` reads `6 false false` |
| U4-5 | comment-stripped files identical (corrects pass 1's 🟢) | 🟡 | `sed 's#//.*0#'` leaves one whitespace-only line per comment line, so the diff counts comment lines | measured: deleting the `geometry.js:224` comment line reads `2`; see finding 1 |
| U6-1 | §6 gained one amendment naming both shapes | 🟢 | base reads `3` `0` `0`, as stated; one planted `**Amendment (2026-09-30, #768).**` paragraph naming both shapes reads `4` `1` | the base reading is the control |
| U6-2 | cites the archived plan, P8 row exists | 🟢 | base `grep -c 'plans/archive/docs-repair.md'` reads `0`; `ls` prints the archive path; `grep -c '^[\|] P8 '` reads `1` | the pre-archive path `.sdlc/plans/docs-repair.md` does not exist, so a citation of it reads `0` |
| U6-3 | nothing outside §6 moved | 🔴 | `awk '!/^## 6\. Records/,/^## 7\./'` is not the complement of the range: `!/re/` starts a range at line 1, so it prints all `260` of `260` lines, §6 included | measured: the correct unit (one amendment paragraph added inside §6) reads `3`, not `0`; see finding 2 |
| U6-4 | handoff ledger row for the amendment | 🔴 | `grep -c -F '\x60## Claims\x60'` reads `0` on a handoff that carries `` `## Claims` ``: `-F` takes `\x60` literally, where the same pattern without `-F` reads `1` | the stated control (`.sdlc/adapter.md:200` anchor) is P3's, and this row's second grep reads `1` on it; see finding 3 |
| U6-5 | P1 to P5 | 🟢 | inherits the P rows; `P3` is 🟢 above | as the P rows |

### Findings

1. **U4-5 reds a legitimate rewrap.** This is the same flaw as gates-batch C5 (pass 4). U4 rewrites comments (3) and (4) into longer sentences, and the `:224` and `:171` lines are already long. A builder who wraps either one onto a second line gets a nonzero diff. The expected `0` is reachable only by rewriting each comment in place, keeping the same line count, and the plan does not say so. Dropping whitespace-only lines on both sides removes the flaw. Pass 1 graded this row 🟢, which was wrong.
2. **U6-3 cannot read `0` for a correct unit.** In awk, `!/a/,/b/` negates only the range's start pattern. It does not print the lines outside the range. The criterion needs a real complement, such as a flag toggled at `## 6. Records` and cleared at `## 7.`.
3. **U6-4's first grep cannot read `1` or more.** Under `-F`, the table's `\x60` convention reaches grep as four literal characters. The row also has no control of its own that reds its command.

### Verdict

verdict: 🔴

🔴 not mobilizable: 27 of 29 criteria checkable. U6-3 and U6-4 are 🔴. U4-5 is corrected to 🟡.

## Pass 3 · revision 4 (uncommitted, root checkout at eddcc477) · 🟢 29 of 29 checkable, mobilizable

This pass re-grades the four rows revision 4 rewrote. Every other row carries from pass 2. All readings come from a throwaway shared clone at eddcc477 under `$CLAUDE_JOB_DIR/tmp/dsb`.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U4-5 | comment-stripped, blank-dropped files identical | 🟢 | clean: `0 0 0`; the `geometry.js` `Compare = all breakpoints` comment line deleted: `0 0 0`; the `typography.js` comment rewrapped onto two lines: `0 0 0` | measured: `modes.length ?` to `modes.length >= 1 ?` in `geometry.js` reads `0 0 4` |
| U6-1 | amendment names both shapes | 🟢 | base `3 0 0 0`; one planted amendment naming both shapes `4 1 1 1` | measured: a paragraph naming only the ledger reads `4 1 0 1` |
| U6-3 | nothing outside §6 moved | 🟢 | the flag awk prints `240` of `260` lines, §6 excluded; base vs itself `0`; an amendment added inside §6 `0` | measured: `## 1.` to `## 1x.` reads `4` |
| U6-4 | ledger row for the amendment, bare anchor | 🟢 | fixture ledger with the row: `1` | measured: anchor `.sdlc/adapter.md:200` reads `0`; row deleted reads `0` |

Note (not a 🟡): U6-4's awk does not read the Kind column. A row of kind `absent` still reads `1`, but P3's loop then prints `STILL ## Claims` for it, so the pair of criteria covers the stated kind.

### Verdict

verdict: 🟢

🟢 mobilizable: 29 of 29 criteria checkable, no 🔴 and no 🟡 rows. Pass 2's three findings are closed.
