---
kind: criteria-review
plan: prime-name
seat: verifier
pass: 1
ticket: none yet
written: 2026-10-03
---

# prime-name criteria review · pass 1 · 🔴 at `63d0b409`

Current state: pass 1 🔴 at `63d0b409`. Seven of eleven rows are not checkable as written (C1.1, C1.2, C1.5, C1.6, C2.1, C2.2, C2.3); the plan is not mobilizable until they are repaired. Q1 to Q3 were graded against their recommended answers (A, A, A).

verdict: 🔴
sha: 63d0b409

## Pass 1 · 🔴 at `63d0b409`: draft

Plan `.sdlc/plans/prime-name.md` at `63d0b409`, rows C1.1 to C2.4, graded by the Verifier seat directly. Every Today value was rerun on the root at `63d0b409`; emitter counts come from a scratch script importing `src/engine/exports.js` and `src/ui/model.mjs` (`stateOf(defaultDocument())`). 🟢 means I can name now the command that fails if the unit is missing or wrong. 🔴 means the row as written cannot be graded: its Today or Expected is false, its control is n/a or not an action, or its value depends on an unruled choice.

## Rows

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

## Findings

- 🔴 Seven rows not checkable (above). Repair and resubmit for pass 2.
- 🟡 Q1 A's reason says "Panda already exposes `prime.DEFAULT`", but `exportPanda(stateOf(defaultDocument()))` contains no `prime` substring. If the claim refers to `exportPandaModule`, say so; otherwise Q1's recommendation rests on a false premise.
- 🟡 C1.1 and C2.1 both claim `docs/reference/data/adia-oklch-export.css`; name one owner unit.
