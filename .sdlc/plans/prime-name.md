---
status: draft
ticket: none yet (the Orchestrator mints one kind:feature issue per adapter X3 once the owner rules Q1 to Q3)
priority: P2
lane: color-engine (`src/engine/prime.mjs`, `src/engine/exports.js`, `src/engine/ds-export.js`, `test/engine/exports.mjs`, `mcp/brand-kit-core.mjs` on a schema bump, `plugin/ultimate-tokens/skills/color-tokens/SKILL.md`, `docs/reference/`, `docs/spec/`, `docs/lld/`, `CHANGELOG.md`; regenerated `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js`, `dist/`)
size: S+S (U1 S = 1, U2 S = 1; 2 points)
labels: kind:feature · status:backlog · size:small · P2 · lane:color-engine
written: 2026-10-03
head: 2d86b64e (`origin/main`)
depends: owner rulings Q1 to Q3 below; Q2 couples to `.sdlc/plans/compute-layers.md` (schema 4)
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
| Radix refs (`radixRefLeaves.primeStep`) | `link(p.n, "prime-prime")` | `var(--c-primary-prime-prime)` | `var(--c-primary-prime)` |
| Design-system bundle CSS (`ds-export.js` prime raw vars) | `--${pfx}-${p.n}-prime-${step}` | same doubled name | same fix |
| Design-system bundle prose (`ds-export.js`, two sites) | `` `--${pfx}-${f}-prime-{step}` `` | pattern only | pattern plus the bare-centre note |

Unchanged, by key shape (nested, no hyphen join): JSON `palettes[n].prime.prime`, DTCG `{n}.prime.prime`, Panda/Radix values `colors.{n}.prime.prime` plus `prime.DEFAULT`, UI3 and the Figma plugin's `Color Prime` collection `{n}/prime` (already single). See Q1.

## 2. Findings

- Figma: the `Color Prime` variable names are `{n}/{step}` (`exportUI3` `primeVars`, `figma/plugin/code.js` `PRIME_COLLECTION`), so the centre is already `primary/prime`. No emitted Figma variable, collection or style is renamed, so `FIGMA_MIGRATIONS` gets no entry. U1 C1.4 proves the UI3 output byte-identical; if that criterion ever reds, the rename has reached Figma and the map entry becomes mandatory in the same change.
- Binder: `figma-semantic-binder/code.js` reads nothing from `Color Prime` (RP-6, #575). No parity change.
- MCP: `brand-kit-core.mjs` returns `[{ step, hex, oklch }]` by step word, never a CSS name. Only the generated `src/ui/describe-mcp-assets.js` text and `SERVER.version` move (version moves only with Q2).
- Consumer plugin: `plugin/ultimate-tokens/skills/color-tokens/SKILL.md` already says "centered on bare `--{n}-prime`", which is false today and true after U1. U2 keeps it and adds the six named steps explicitly.
- Collision, within a palette: none. No role suffix in `docs/reference/data/role-table.json` contains `prime` (grep returns nothing); stops are numeric (`--c-{n}-050`), scrims are `scrim-*`, key colours `key-*`. The bare `--{pfx}-{n}-prime` is unused today.
- Collision, across palettes: a palette slugged `x-prime` emits its accent role as `--c-x-prime`, which would equal palette `x`'s new centre step. This is the same class that already exists for every role suffix (palette `x`'s `--c-x-hover` versus a palette slugged `x-hover`), and nothing guards that class today. See Q3.

## 3. Owner questions

| # | Question | Recommended | Alternative |
|---|---|---|---|
| Q1 | Nested formats keep the step key `prime` (`{n}.prime.prime` in JSON, DTCG, Panda). A Style Dictionary build of the DTCG file flattens that to `n-prime-prime`. Rename the nested key too? | A: keep nested keys; the ask names the flat token, and Panda already exposes `prime.DEFAULT` which flattens to the bare name | B: rename the step to `DEFAULT` in DTCG/JSON, which changes the JSON shape and `PRIME_STEPS` consumers (MCP `get_prime`) |
| Q2 | Emitted names change, so `EXPORT_SCHEMA_VERSION` should bump. compute-layers plans 3 to 4 (R101). | A: ride compute-layers' bump to 4 if both land in one release; otherwise this plan lands first and bumps to 4, and compute-layers takes 5 | B: no bump (names are not shape); rejected by RP-8, which versions emitted names |
| Q3 | Cross-palette slug collision (`x` plus `x-prime`) | A: accept, same unguarded class as `-hover`; file a separate kind:bug for a slug-collision guard covering all suffixes | B: block slugs ending in `-prime` in this plan |

## 4. Constraints

- R98: the old name is not emitted, aliased or mapped anywhere in exports. No `prime-prime` survives in `src/`, `mcp/`, `plugin/`, `docs/reference/`, generated assets.
- One helper owns the rule: `primeSlug(step)` exported from `src/engine/prime.mjs` (`step === "prime" ? "prime" : \`prime-${step}\``); every flat emitter calls it, no inline ternaries.
- Gates per `.sdlc/adapter.md` §1 in the unit worktree: `npm test` (tree clean after), `npm ci && npm run build`. No em dash; needles are symbols, never line numbers.

## 5. Units and criteria

### U1: engine emitters, tests, generated assets (builder L2, reviewer l3, verifier l2)

| # | Command | Expected | Today | Negative control |
|---|---|---|---|---|
| C1.1 | `git grep -n "prime-prime" -- src mcp plugin figma/binder test docs/reference/data` | no output | 7 files hit (`src/engine/exports.js`, `test/engine/exports.mjs`, `src/ui/describe-mcp-assets.js`, `figma/plugin/ui.html`, `docs/reference/data/adia-oklch-export.css`, ...) | revert `primeSlug` to `` `prime-${step}` ``, run `npm test` (regenerates): grep hits again |
| C1.2 | `node -e` script importing `exportCSS`, `exportTailwind`, `exportPanda` (radix refs) on `defaultDocument()`: count `/--c-primary-prime:/`, `/--color-primary-prime:/`, `var(--c-primary-prime)`; and that `--c-primary-prime-brightest` and `-dimmest` still exist | 1, 1, at least 1; both present | 0, 0, 0; both present | as C1.1: counts 0 |
| C1.3 | `test/engine/exports.mjs` prime group: asserts the bare centre name per format, the six suffixed names, leaf count 7 per palette, and absence of `prime-prime` | exit 0 | test pins `prime-prime` | revert the emitter: `npm test` reds in group `prime` |
| C1.4 | `exportUI3` and `exportJSON`, `exportDTCG` of `defaultDocument()` with the schema stamp masked, HEAD versus merge-base | byte-equal | n/a | change `primeVars` key to `${p.n}/prime-${step}`: diff non-empty |
| C1.5 | `git diff --stat $(git merge-base origin/main HEAD) -- figma/binder/migrations.mjs` | empty (no Figma rename, section 2) | n/a | if C1.4 reds on UI3, this must be non-empty instead |
| C1.6 | `grep -n "EXPORT_SCHEMA_VERSION =" src/engine/exports.js` | per Q2 ruling | `3` | n/a |
| C1.7 | `npm test`; `npm ci && npm run build`; `git status --porcelain` | exit 0, exit 0, empty | n/a | adapter §1 control |

### U2: records (builder L1, reviewer l3, verifier l2)

| # | Command | Expected | Today | Negative control |
|---|---|---|---|---|
| C2.1 | `git grep -n "prime-prime" -- docs plugin ':!docs/tickets' ':!docs/plan/archive'` | no output | `knowledge-04-export-formats.md`, `spec-muted-base-key-spikes.md`, `spec-panda-park-ui-exports.md`, `lld-muted-base-key-spikes.md` | leave one: grep prints it |
| C2.2 | `grep -c "bare \`--{n}-prime\`" plugin/ultimate-tokens/skills/color-tokens/SKILL.md`; `node test/plugin/*.mjs` parity | at least 1; exit 0 | 1 (stated, false until U1) | n/a |
| C2.3 | `grep -n "prime" CHANGELOG.md \| head -3` | an Unreleased entry naming the rename and the schema move | none | n/a |
| C2.4 | `npm test`; `git status --porcelain` | exit 0, empty | n/a | adapter §1 control |

## 6. Progress

| Unit | Size | Status |
|---|---|---|
| U1 | S | not started |
| U2 | S | not started |
