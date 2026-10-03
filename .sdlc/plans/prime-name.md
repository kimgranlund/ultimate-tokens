---
status: draft
ticket: none yet (the Orchestrator mints one kind:feature issue per adapter X3 once the owner rules Q1 to Q3)
priority: P2
lane: color-engine (`src/engine/prime.mjs`, `src/engine/exports.js`, `src/engine/ds-export.js`, `test/engine/exports.mjs`, `mcp/brand-kit-core.mjs` on a schema bump, `plugin/ultimate-tokens/skills/color-tokens/SKILL.md`, `docs/reference/`, `docs/spec/`, `docs/lld/`, `CHANGELOG.md`; regenerated `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js`, `dist/`)
size: S+S (U1 S = 1, U2 S = 1; 2 points)
labels: kind:feature · status:backlog · size:small · P2 · lane:color-engine
written: 2026-10-03
head: 2d86b64e (`origin/main`, revision 0); revision 1 folds the owner's Q1 to Q3 answers and criteria pass 1 (`.sdlc/verdicts/prime-name-criteria.md`, 🔴 at 63d0b409)
depends: nothing; Q1 to Q3 are ruled (section 3). Q2 couples to `.sdlc/plans/compute-layers.md` (schema 4)
inputs: owner ask "token naming convention change `*-prime-prime` -> `*-prime`" (2026-10-03), R98 (no overrides or legacy alias layers), `src/engine/prime.mjs` (`PRIME_STEPS`), `src/engine/exports.js` (`exportCSS` prime loop, `exportTailwind` prime loop, `radixRefLeaves` `primeStep`, `EXPORT_SCHEMA_VERSION`), `src/engine/ds-export.js` (prime raw vars, prime prose), `figma/binder/migrations.mjs` (`FIGMA_MIGRATIONS`)
measurements: read-only greps at 2d86b64e
---

# Prime step name: `--{pfx}-{n}-prime-prime` becomes `--{pfx}-{n}-prime`

## 1. Where the doubled name comes from

The seven identity swatches are `PRIME_STEPS = ["brightest", "brighter", "bright", "prime", "dim", "dimmer", "dimmest"]` (`src/engine/prime.mjs`). Every hyphen-flat emitter composes `prime-${step}`, so the centre step renders as `prime-prime`. The fix is one name rule, applied at every flat emitter: the `prime` step drops its suffix, the other six keep theirs.

| Surface | Composer today | Today | After |
|---|---|---|---|
| CSS and OKLCH (`exportCSS`) | `--${pfx}-${p.n}-prime-${step}` | `--c-primary-prime-prime` | `--c-primary-prime` |
| Tailwind (`exportTailwind`) | `--color-${p.n}-prime-${step}` | `--color-primary-prime-prime` | `--color-primary-prime` |
| Radix refs (`exportRadix(state, { refs: true })`, via `radixRefLeaves.primeStep`) | `link(p.n, "prime-prime")` | `var(--c-primary-prime-prime)` | `var(--c-primary-prime)` |
| Design-system bundle CSS (`ds-export.js` prime raw vars) | `--${pfx}-${p.n}-prime-${step}` | same doubled name | same fix |
| Design-system bundle prose (`ds-export.js`, two sites) | `` `--${pfx}-${f}-prime-{step}` `` | pattern only | pattern plus the bare-centre note |

Unchanged, by key shape (nested, no hyphen join): JSON `palettes[n].prime.prime`, DTCG `{n}.prime.prime`, the Radix values form `colors.{n}.prime`, UI3 and the Figma plugin's `Color Prime` collection `{n}/prime` (already single). See Q1.

## 2. Findings

- Figma: the `Color Prime` variable names are `{n}/{step}` (`exportUI3` `primeVars`, `figma/plugin/code.js` `PRIME_COLLECTION`), so the centre is already `primary/prime`. No emitted Figma variable, collection or style is renamed, so `FIGMA_MIGRATIONS` gets no entry. U1 C1.4 proves the UI3 output byte-identical; if that criterion ever reds, the rename has reached Figma and the map entry becomes mandatory in the same change.
- Binder: `figma-semantic-binder/code.js` reads nothing from `Color Prime` (RP-6, #575). No parity change.
- MCP: `brand-kit-core.mjs` returns `[{ step, hex, oklch }]` by step word, never a CSS name. Only the generated `src/ui/describe-mcp-assets.js` text and `SERVER.version` move (version moves only with Q2).
- Consumer plugin: `plugin/ultimate-tokens/skills/color-tokens/SKILL.md` already says "centered on bare `--{n}-prime`", which is false today and true after U1. U2 keeps it and adds the six named steps explicitly.
- Collision, within a palette: none. No role suffix in `docs/reference/data/role-table.json` contains `prime` (grep returns nothing); stops are numeric (`--c-{n}-050`), scrims are `scrim-*`, key colours `key-*`. The bare `--{pfx}-{n}-prime` is unused today.
- Collision, across palettes: a palette slugged `x-prime` emits its accent role as `--c-x-prime`, which would equal palette `x`'s new centre step. This is the same class that already exists for every role suffix (palette `x`'s `--c-x-hover` versus a palette slugged `x-hover`), and nothing guards that class today. See Q3.

## 3. Owner rulings (2026-10-03, relayed by the Conductor; all the recommended option)

| # | Question | Ruling |
|---|---|---|
| Q1 | Rename the nested step key too (`{n}.prime.prime` in JSON, DTCG)? | Keep nested keys. The ask names the flat hyphen token; nested keys are path segments, not one name. |
| Q2 | `EXPORT_SCHEMA_VERSION` bump | Bump. Share compute-layers' bump to 4 if both land in one release; otherwise this plan lands first at 4 and compute-layers takes 5. C1.6 checks merge-base plus 1, which holds in both orders. |
| Q3 | Cross-palette slug clash (`x` plus `x-prime`) | Accept here. The Orchestrator files one kind:bug for a slug-collision guard covering every role suffix and the prime centre, via `/file-bug`. |

## 4. Constraints

- Test needles for the old name are built, never literal (`["prime", "prime"].join("-")`), so C1.1's grep can reach empty.
- R98: the old name is not emitted, aliased or mapped anywhere in exports. No `prime-prime` survives in `src/`, `mcp/`, `plugin/`, `docs/reference/`, generated assets.
- One helper owns the rule: `primeSlug(step)` exported from `src/engine/prime.mjs` (`step === "prime" ? "prime" : \`prime-${step}\``); every flat emitter calls it, no inline ternaries.
- Gates per `.sdlc/adapter.md` §1 in the unit worktree: `npm test` (tree clean after), `npm ci && npm run build`. No em dash; needles are symbols, never line numbers.

## 5. Units and criteria

### U1: engine emitters, tests, generated assets (builder L2, reviewer l3, verifier l2)

| # | Command | Expected | Today | Negative control |
|---|---|---|---|---|
| C1.1 | `git grep -l prime-prime -- src mcp plugin figma test docs/reference/data` | no output | 5 files: `docs/reference/data/adia-oklch-export.css` (regenerated by `gen:adia-exports` inside `npm test`, owned by U1), `figma/plugin/ui.html`, `src/engine/exports.js`, `src/ui/describe-mcp-assets.js`, `test/engine/exports.mjs` | revert `primeSlug` to `` `prime-${step}` ``, run `npm test` (regenerates): grep lists files again |
| C1.2 | scratch `node` script on `stateOf(defaultDocument())` (`src/ui/model.mjs`): count `--c-primary-prime:` in `exportCSS`, `--color-primary-prime:` in `exportTailwind`, `var(--c-primary-prime)` in `exportRadix(st, { refs: true })`, and the old doubled forms in the same three | new 1, 1, 2; old 0, 0, 0 | new 0, 0, 0; old 1, 1, 2 | as C1.1: new counts back to 0 |
| C1.3 | `test/engine/exports.mjs` prime group: asserts the bare centre name per format, the six suffixed names, leaf count 7 per palette, and absence of the built old needle | exit 0 | test pins the doubled name | revert one emitter: `npm test` reds in group `prime` |
| C1.4 | `exportUI3`, `exportJSON`, `exportDTCG` of `defaultDocument()` with the schema stamp masked, HEAD versus merge-base | byte-equal | n/a (diff against base) | change `primeVars` key to `${p.n}/prime-${step}`: diff non-empty |
| C1.5 | `git diff --stat $(git merge-base origin/main HEAD) -- figma/binder/migrations.mjs` | empty | empty | append a comment line to `figma/binder/migrations.mjs` in the unit tree: `--stat` prints one file; revert |
| C1.6 | `grep -o "EXPORT_SCHEMA_VERSION = [0-9]*" src/engine/exports.js` versus the same on `$(git merge-base origin/main HEAD)` | HEAD value is merge-base value plus 1 | `3` on both | leave the constant unchanged: values equal, check reds |
| C1.7 | `npm test`; `npm ci && npm run build`; `git status --porcelain` | exit 0, exit 0, empty | n/a | adapter §1 control |

### U2: records (builder L1, reviewer l3, verifier l2)

| # | Command | Expected | Today | Negative control |
|---|---|---|---|---|
| C2.1 | `git grep -l prime-prime -- docs plugin ':!docs/tickets' ':!docs/plan/archive' ':!docs/reference/data'` | no output | `docs/reference/references/knowledge-04-export-formats.md`, `docs/spec/spec-muted-base-key-spikes.md`, `docs/spec/spec-panda-park-ui-exports.md` (`docs/reference/data` is U1's, C1.1) | leave one: grep prints it |
| C2.2 | `grep -oE -- "--\{n\}-prime-(brightest\|brighter\|bright\|dim\|dimmer\|dimmest)\b" plugin/ultimate-tokens/skills/color-tokens/SKILL.md \| sort -u \| wc -l` (distinct names, not lines) | 6 (all six suffixed steps named) | 2 (`brightest`, `dimmest`) | revert the skill edit: prints 2 |
| C2.3 | `awk '/^## \[Unreleased\]/{f=1;next} /^## \[/{f=0} f' CHANGELOG.md \| grep -c -e "prime-prime" -e "EXPORT_SCHEMA_VERSION"` | at least 2 | 0 | drop the entry: prints 0 |
| C2.4 | `npm test`; `git status --porcelain` | exit 0, empty | n/a | adapter §1 control |

## 6. Progress

| Unit | Size | Status |
|---|---|---|
| U1 | S | not started |
| U2 | S | not started |
