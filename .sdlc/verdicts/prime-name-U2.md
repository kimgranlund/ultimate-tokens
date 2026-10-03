---
kind: verdict
plan: prime-name
unit: U2
seat: verifier
pass: 1
ticket: "#789"
written: 2026-10-03
---

# prime-name U2 · pass 1 · 🟡 at `fe6a31cb`

verdict: 🟡
sha: fe6a31cbead99f0abf96d32749e9a728d7e50419

`unit/pn-U2` at `fe6a31cb`, unit range `f70c3f94..fe6a31cb` (merge-base with main `f57abf5d`), against `.sdlc/plans/prime-name.md` C2.1 to C2.5 (criteria 🟢 at pass 4, `1869b4f9`). Evidence run: verifier-l2 (opus) in a throwaway clone; `npm test` once (the reviewer skipped it). The builder was sonnet, so the checker sits outside its family. The unit touches no `src`, `figma`, `mcp`, `scripts` or `test` file, so build and smoke were not run. The seat re-read `knowledge-04-export-formats.md:247-263` at `fe6a31cb` itself. Handoff and review passed `verdict.py check`; neither was used as evidence. Every criterion is met. The verdict is 🟡 for the reviewer's Medium, confirmed: the canonical prime tables still teach the retired name by derivation (Findings 1).

## Rows

| # | State | Evidence | Negative control |
|---|---|---|---|
| C2.1 | 🟢 | `git grep -l prime-prime -- docs plugin ':!docs/tickets' ':!docs/plan/archive' ':!docs/reference/data'` printed nothing, `rc 1` | `git checkout -q f70c3f94 -- docs/spec/spec-panda-park-ui-exports.md`, same grep: `docs/spec/spec-panda-park-ui-exports.md`, `rc 0`. Restored, porcelain empty |
| C2.2 | 🟢 | `grep -oE -- "--\{n\}-prime-(brightest\|brighter\|bright\|dim\|dimmer\|dimmest)\b" plugin/ultimate-tokens/skills/color-tokens/SKILL.md \| sort -u \| wc -l` prints `6`; SKILL.md:20-23 names all six plus the bare centre `--{n}-prime` | SKILL.md from `f70c3f94`: prints `2`. Restored, porcelain empty |
| C2.3 | 🟢 | `awk '/^## \[Unreleased\]/{f=1;next} /^## \[/{f=0} f' CHANGELOG.md \| grep -cF -- '-{n}-prime`'` prints `3`. Entry content true: `EXPORT_SCHEMA_VERSION = 4` (`src/engine/exports.js:55`), `version: "0.4.0"` (`mcp/brand-kit-core.mjs:15`) | CHANGELOG.md from `f70c3f94`: prints `0`. Restored, porcelain empty |
| C2.4 | 🟢 | `npm test` exit `0`, last line `✓ all 54 test files passed`; `git status --porcelain` after: empty | Adapter control: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json`; `node test/run.mjs` exit `1`, last line `✗ 1/54 test file(s) failed`. Restored, porcelain empty |
| C2.5 | 🟢 | `git grep -a -n 'brand-kit/3\|version: "0.3.0"' -- .claude/skills` printed nothing, `rc 1` | `foundations.md` from `f70c3f94`: prints lines 13, 41, 43 (`ultimate-tokens-brand-kit/3`, `version: "0.3.0"`), `rc 0`. Restored, porcelain empty |
| X1 no U+2014 added | 🟢 | `git diff f70c3f94 fe6a31cb \| grep '^+' \| grep -c $'—'` prints `0`; `node test/repo/em-dash.mjs` prints `em-dash: clean (1106 files scanned)`, exit `0` | Appended `a <U+2014> b` to CHANGELOG.md: `node test/repo/em-dash.mjs` exit `1`, `FAIL: 1 em dashes outside inline code spans in 1 files`. Restored, porcelain empty |
| X2 branding | 🟢 | `node test/repo/branding.mjs` prints `branding: clean (1098 files scanned)`, exit `0` | Appended the retired uppercase maker name to `.sdlc/handoffs/prime-name-U2.md`: exit `1`, `FAIL: 1 branding violation(s)`. Restored, porcelain empty |
| X3 U1 leftover knowledge-04:349 | 🟢 | `sed -n 349p docs/reference/references/knowledge-04-export-formats.md` reads `` `prime` links the bare `--{pfx}-{n}-prime` primitive (the Panda key path stays nested, `prime.prime` and `prime.DEFAULT`) ``; no `prime-prime` | knowledge-04 from `f70c3f94`: `git grep -n prime-prime` hits `:349: ... links the \`prime-prime\` pri...`. Restored, porcelain empty |
| X4 repo-wide `git grep -n prime-prime` | 🟢 | Hits only in `.sdlc/` records (plan, U1/U2 handoffs, reviews, verdicts, approval question: all describe the rename, history, correct as records) and `CHANGELOG.md:16` (the one breaking note R98 allows, naming the old name being retired). No hit in `src mcp plugin figma test docs` | Same as C2.1 and X3 controls: a restored stale line surfaces in this grep |
| X5 reviewer Medium (generic patterns) | 🟡 | `git grep -nE 'prime-\{step\}' -- docs plugin .claude/skills ':!docs/tickets' ':!docs/plan/archive'` prints 8 lines, all un-noted: `docs/reference/references/knowledge-04-export-formats.md:259` (CSS) and `:263` (Tailwind); `docs/spec/spec-muted-base-key-spikes.md:300`, `:302` (REQ-054), `:636` (R3); `docs/lld/lld-muted-base-key-spikes.md:128`, `:132`; `docs/reference/references/knowledge-02-tonal-scale.md:298` | No criterion covers it: C2.1 greps the literal `prime-prime`, which these lines never spell, so C2.1 is green with all 8 present (shown in the C2.1 evidence run) |

## Findings

1. 🟡 The canonical docs still derive the retired name. `docs/reference/references/knowledge-04-export-formats.md:248-249` lists the seven steps with `prime` among them, and the table right after gives CSS as `--{pfx}-{n}-prime-{step}` (`:259`) and Tailwind as `--color-{n}-prime-{step}` (`:263`), so `{step}=prime` yields the doubled name U1 retired. The same file's corrected `:349` now contradicts it. The same derivation stands in `knowledge-02-tonal-scale.md:295-298`, `spec-muted-base-key-spikes.md:300,302,636` and `lld-muted-base-key-spikes.md:128,132`. Only the consumer skill and the CHANGELOG spell out the bare-centre exception. No criterion covers it, because C2.1 greps the literal, which these lines never spell. The `docs/reference/` hits are the repo's canonical specs, so this is stale context in the authoritative layer. It is the Orchestrator's call whether to fold it into U2 or open a follow-up, but the plan should not close with these 8 lines unchanged. A criterion that would catch it: every `git grep -nE 'prime-\{step\}'` hit carries a bare-centre note.
2. Low (reviewer Low 2, confirmed): the Panda parenthetical at `knowledge-04:349` sits inside a sentence about Radix refs. It is true but misplaced. Not blocking.
