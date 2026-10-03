---
kind: criteria-review
plan: prime-name
seat: verifier
pass: 4
ticket: 789
written: 2026-10-03
---

# prime-name criteria review · pass 4 · 🟢 at `1869b4f9`

Current state: pass 4 🟢 at `1869b4f9` (revision 4, ticket #789). The new U2 row C2.5 is checkable; no other criterion changed since pass 3, so every row C1.1 to C2.5 is checkable. Passes 3 to 1 follow as history.

verdict: 🟢
sha: 1869b4f9

Pass 3 lines: `verdict: 🟢` at `95b9f30a`.
Pass 2 lines: `verdict: 🔴` at `9fcb2c45`.
Pass 1 lines: `verdict: 🔴` at `63d0b409`.

## Pass 4 · 🟢 at `1869b4f9`: C2.5 added

`git diff 95b9f30a 1869b4f9 -- .sdlc/plans/prime-name.md` adds only the frontmatter (`approved`, ticket 789), C2.5, a `## Units` checklist and a `## Revisions` table. Rows 🟢 at pass 3 stand unchanged.

### Rows

| # | State | Evidence | Negative control |
|---|---|---|---|
| C2.5 | 🟢 | The command as written (`git grep -a -n` with the BRE `\|` alternation) runs on the root at `1869b4f9` and prints exactly the five Today lines: `foundations.md:13`, `:41`, `:43`, `best-practices.md:70`, `:73` under `.claude/skills/maintaining-brand-kit-mcp/references/`. They are stale on `unit/pn-U1` at `37e0fabb`, where `SERVER` reads `version: "0.4.0"` and `model.mjs` `brandKit()` stamps `ultimate-tokens-brand-kit/${EXPORT_SCHEMA_VERSION}` (4). | Leave one line: grep prints it. The unchanged root is that control today: five lines, exit 0. |

### Findings

- 🟢 Pass 2's 🟡 on `SERVER.version` is met in practice: `unit/pn-U1` moves it to `0.4.0`; C2.5 now names the records that move with it.
- 🟡 C2.5 pins the literal `/3` and `0.3.0`. It shows the old values are gone, not that the new ones were written (deleting the lines also passes), and the next bump (compute-layers U4, md-prefix C1.9) makes the same two references stale with no gate. A needle for the new value (`brand-kit/4`, `0.4.0` present) or a parity test that reads them from the source would close both; not blocking for this plan.

## Pass 3 · 🟢 at `95b9f30a`: C2.3 repaired

Plan `.sdlc/plans/prime-name.md` at `95b9f30a`; `git diff 9fcb2c45 95b9f30a` touches only the head line and C2.3 in the plan. Rows 🟢 at pass 2 stand unchanged.

### Rows

| # | State | Evidence | Negative control |
|---|---|---|---|
| C2.3 | 🟢 | Needle read with the table escape removed: fixed string `-{n}-prime` plus a closing backtick, in the awk `## [Unreleased]` slice. Today it prints 0 (also 0 over the whole file), matching the plan. A scratch copy of `CHANGELOG.md` with one Unreleased line naming `` `--{pfx}-{n}-prime` `` prints 1. | A scratch copy whose added line names only the old `` `--{pfx}-{n}-prime-prime` `` prints 0, and the unchanged file prints 0, so dropping the entry reds the check. |

### Findings

- 🟢 Pass 2 red closed.
- 🟡 The changelog no longer has to name the schema move; the move itself is still gated in code by C1.6. If the owner wants it in the entry too, that needs its own row.

## Pass 2 · 🔴 at `9fcb2c45`: one red, C2.3

Plan `.sdlc/plans/prime-name.md` at `9fcb2c45`, graded by the Verifier seat directly. Every Today value was rerun on the root (no tracked change under `src figma plugin docs test` since `9fcb2c45`). Rows unchanged from pass 1 and still 🟢 (C1.3, C1.4, C1.7, C2.4) are not repeated.

### Rows

| # | State | Evidence | Negative control |
|---|---|---|---|
| C1.1 | 🟢 | Pathspec now `figma`. `git grep -l prime-prime -- src mcp plugin figma test docs/reference/data` prints exactly the 5 listed files, `figma/plugin/ui.html` included. Constraint 4 makes the test needle built, so the grep can reach empty. | Revert `primeSlug`, run `npm test` (regenerates the css and bundle): grep lists files. Runnable. |
| C1.2 | 🟢 | Scratch script on `stateOf(defaultDocument())` today: old forms CSS 1, Tailwind 1, `exportRadix(st, {refs:true})` `var(--c-primary-prime-prime)` 2; new bare forms 0, 0, 0 (`var(--c-primary-prime)` with its closing paren does not match the doubled form). Matches the plan's Today. | As C1.1: new counts back to 0. Runnable. |
| C1.5 | 🟢 | `git diff --stat <base> -- figma/binder/migrations.mjs` empty is observable. | Append a comment line in the unit tree: `--stat` prints one file. An action now. |
| C1.6 | 🟢 | `EXPORT_SCHEMA_VERSION = 3` today; merge-base plus 1 holds in both landing orders (Q2). | Leave the constant unchanged: equal values, check reds. |
| C2.1 | 🟢 | Grep prints exactly the 3 listed files; `docs/reference/data` excluded and owned by U1 C1.1, so one owner. | Leave one: grep prints it. |
| C2.2 | 🟢 | Run with each `\|` read as the table escape for a bare pipe: prints 2 today (`--{n}-prime-brightest`, `--{n}-prime-dimmest`), Expected 6. Fails without the unit. Note: copied literally with the backslashes, BSD grep prints 0; the builder and verifier must unescape. | Revert the skill edit: prints 2. |
| C2.3 | 🔴 | The `## [Unreleased]` slice already has one hit today: line 83 of the slice, `` `EXPORT_SCHEMA_VERSION` moves 2 → 3 ``. Today is 1, not 0. With Expected "at least 2", any second `EXPORT_SCHEMA_VERSION` line passes it, e.g. compute-layers' own entry for its bump landing first, with no prime entry at all. `grep -c` counts lines, so one line naming both terms also counts once. | Gap: check the two facts separately, e.g. `prime-prime` count in the slice at least 1 (today 0) and a line naming the move from the merge-base value to the new one (today absent). Control as stated (drop the entry) then reds both. |

### Findings

- 🔴 C2.3 not checkable as written (above). Repair and resubmit for pass 3.
- 🟢 Pass 1 finding on Q1's Panda premise is closed: the ruling drops the `prime.DEFAULT` reasoning.
- 🟢 Pass 1 finding on the `adia-oklch-export.css` owner is closed: U1 owns it, C2.1 excludes it.

## Pass 1 · 🔴 at `63d0b409`: draft

Plan `.sdlc/plans/prime-name.md` at `63d0b409`, rows C1.1 to C2.4, graded by the Verifier seat directly. Every Today value was rerun on the root at `63d0b409`; emitter counts come from a scratch script importing `src/engine/exports.js` and `src/ui/model.mjs` (`stateOf(defaultDocument())`). 🟢 means I can name now the command that fails if the unit is missing or wrong. 🔴 means the row as written cannot be graded: its Today or Expected is false, its control is n/a or not an action, or its value depends on an unruled choice.

### Rows

| # | State | Evidence | Negative control |
|---|---|---|---|
| C1.1 | 🔴 | `git grep -l prime-prime -- src mcp plugin figma/binder test docs/reference/data` lists 4 files today (`docs/reference/data/adia-oklch-export.css`, `src/engine/exports.js`, `src/ui/describe-mcp-assets.js`, `test/engine/exports.mjs`), not the plan's "7 files". The plan's list names `figma/plugin/ui.html`, which holds the string but is outside the pathspec (`figma/binder` only), so the generated bundle is never checked. Also: C1.3 asks the test to assert absence of `prime-prime`; a literal needle in `test/engine/exports.mjs` keeps this grep non-empty forever. | Gap: add `figma/plugin` to the pathspec, correct the Today list, and say the C1.3 needle is built (`"prime-" + "prime"`) or exclude that one line. With those, the control (leave one emitter unchanged, grep prints it) runs. |
| C1.2 | 🔴 | Today counts for the old names on `defaultDocument()`: CSS `--c-primary-prime-prime:` 1, Tailwind `--color-primary-prime-prime:` 1, `exportRadix(st, {refs:true})` `var(--c-primary-prime-prime)` 2, `exportPanda(st)` 0 and contains no `prime` substring at all. The row names `exportPanda (radix refs)`; `radixRefLeaves` is used by `exportRadix` with `opts.refs`, not by `exportPanda`. As written the third count is 0 after a correct build, so Expected "at least 1" can never be met. | Gap: name `exportRadix(state, { refs: true })` for the third count. Control (revert the emitter, counts fall to 0) then runs. |
| C1.3 | 🟢 | `test/engine/exports.mjs` gains a prime group; `npm test` exit 0 is observable. | Revert one emitter to `prime-${step}`: the per-format bare-name assertion reds. Runnable. |
| C1.4 | 🟢 | UI3, JSON, DTCG of `defaultDocument()` HEAD versus merge-base with the stamp masked: a byte compare. Today n/a is fine (it is a diff against the base). | Change the `primeVars` key to `${p.n}/prime-${step}`: diff non-empty. Runnable. |
| C1.5 | 🔴 | `git diff --stat <base> -- figma/binder/migrations.mjs` empty is checkable, but the control "if C1.4 reds on UI3, this must be non-empty instead" is a condition, not an action that shows the check can fail. | Gap: give an action, e.g. append a line to `migrations.mjs` in a scratch copy of the unit tree: `--stat` prints one file. |
| C1.6 | 🔴 | `EXPORT_SCHEMA_VERSION = 3` today. Expected "per Q2 ruling"; Q2 A gives 4 or 5 depending on landing order with compute-layers, so no fixed value can be checked, and the control is n/a. | Gap: state Expected as the merge-base value plus 1 (both landing orders then satisfy it), with control: leave the constant unchanged, the check reds. |
| C1.7 | 🟢 | `npm test`, `npm ci && npm run build`, `git status --porcelain`: exits and an empty status are observable. | Adapter §1 control (break a gate input, `npm test` exits 1; edit a generated source without regenerating, porcelain non-empty). Runnable. |
| C2.1 | 🔴 | Today the grep prints `docs/reference/data/adia-oklch-export.css`, `knowledge-04-export-formats.md`, `spec-muted-base-key-spikes.md`, `spec-panda-park-ui-exports.md`. The plan lists `lld-muted-base-key-spikes.md` (no hit) and omits `adia-oklch-export.css`. The command itself is checkable. | Gap: correct the Today list (and say which unit regenerates `adia-oklch-export.css`, since U1 C1.1 also covers it). Control (leave one, grep prints it) runs. |
| C2.2 | 🔴 | `grep -c "bare \`--{n}-prime\`"` on `plugin/ultimate-tokens/skills/color-tokens/SKILL.md` already prints 1 at `63d0b409`, so Expected "at least 1" passes without the unit; the plan's own Today says "false until U1" but the grep cannot see that. It does not check the six suffixed names. Control n/a. | Gap: a needle that fails today (e.g. absence of `prime-prime` in the skill, or a count of the seven names), with a control: revert the skill edit, the check reds. |
| C2.3 | 🔴 | `grep -n prime CHANGELOG.md \| head -3` "an Unreleased entry naming the rename and the schema move" is a reading, not a fixed needle; control n/a. | Gap: a needle under `## Unreleased` (e.g. `prime-prime` and `EXPORT_SCHEMA_VERSION` in that section), with control: drop the entry, the check reds. |
| C2.4 | 🟢 | `npm test`, `git status --porcelain`: observable. | Adapter §1 control. Runnable. |

### Findings

- 🔴 Seven rows not checkable (above). Repair and resubmit for pass 2.
- 🟡 Q1 A's reason says "Panda already exposes `prime.DEFAULT`", but `exportPanda(stateOf(defaultDocument()))` contains no `prime` substring. If the claim refers to `exportPandaModule`, say so; otherwise Q1's recommendation rests on a false premise.
- 🟡 C1.1 and C2.1 both claim `docs/reference/data/adia-oklch-export.css`; name one owner unit.
