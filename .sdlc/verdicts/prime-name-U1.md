---
kind: verdict
plan: prime-name
unit: U1
seat: verifier
pass: 1
ticket: "#789"
written: 2026-10-03
---

# prime-name U1 · pass 1 · 🟢 at `37e0fabb`

verdict: 🟢
sha: 37e0fabb726348068f31cc6d470745018da9a29c

`unit/pn-U1` at `37e0fabb` (code `f0a3ffd0`), merge-base `1df6d897`, against `.sdlc/plans/prime-name.md` C1.1 to C1.7 as at `37e0fabb` (criteria 🟢 at pass 4, `1869b4f9`). Evidence run: verifier-l2 (opus) in a throwaway clone with a merge-base worktree, `npm test` and `npm ci && npm run build` once each at a quieter host (load 15 to 21; the reviewer could not run them at 43). The builder was grade l2 (sonnet), so the checker sits outside its family. The seat re-read C1.1 (`git grep -l prime-prime 37e0fabb -- ...` exit 1), C1.6 (`EXPORT_SCHEMA_VERSION = 4`), the one-helper rule (`prime-${` only in `prime.mjs:64,66`) and `SERVER.version` (`0.4.0`) itself. Handoff and review passed `verdict.py check`; neither was used as evidence.

## Rows

| # | State | Evidence | Negative control |
|---|---|---|---|
| C1.1 | 🟢 | `git grep -l prime-prime -- src mcp plugin figma test docs/reference/data` printed nothing, `exit=1` | Set `primeSlug` to `` (step) => `prime-${step}` `` in `src/engine/prime.mjs`, ran the six `gen:*`/`bundle` steps of `npm test` (`gen exit=0`): the same grep printed `docs/reference/data/adia-oklch-export.css`. Only 1 file, not the plan's 5: the bundles no longer carry a literal (the Radix link now calls `primeSlug("prime")`) and the test needle is built. Restored with `git checkout -- .`, porcelain empty |
| C1.2 | 🟢 | scratch `c12.mjs` on `stateOf(defaultDocument())`, HEAD: `new 1 1 2 old 0 0 0`; same script on base: `new 0 0 0 old 1 1 2` (CSS `--c-primary-prime:`, Tailwind `--color-primary-prime:`, Radix refs `var(--c-primary-prime)`, then the doubled forms) | Same primeSlug revert as C1.1: `new 0 0 0 old 1 1 2`. Restored, porcelain empty |
| C1.3 | 🟢 | `npm test` exit 0, `▶`-line for engine/exports.mjs pass, `✓ all 54 test files passed`; group `prime` asserts the bare centre per format (CSS, OKLCH, Tailwind, Radix refs), the six suffixed names, `7 * enabledCount` leaves per format, and absence of `OLD_PRIME_NEEDLE = ["prime", "prime"].join("-")`; `git grep -n prime-prime -- test` printed nothing | (a) primeSlug revert: `node test/engine/exports.mjs` `exit=1`, `FAIL  radix-refs-extras, ...`, `FAIL  prime, CSS missing --c-neutral-prime (hex)`, `FAIL  design-system-prime, ...`, `FAIL: 3 gate failure(s)`. (b) one emitter only (Tailwind line back to `--color-${p.n}-prime-${step}`): `exit=1`, `FAIL  prime, Tailwind missing --color-neutral-prime`, `FAIL: 1 gate failure(s)`. Both restored, porcelain empty |
| C1.4 | 🟢 | scratch `c14.mjs` writes `exportUI3`/`exportJSON`/`exportDTCG` of `stateOf(defaultDocument())` with schema stamps masked (`schemaVersion`, `ultimate-tokens.../N`, `export schema N`, `schema.vN`), HEAD vs base: `ui3 byte-equal`, `json byte-equal`, `dtcg byte-equal`. First pass without the `schema.vN` mask showed only `"$schema": "figma-ui3-variables.color.schema.v4"` vs `v3`, the stamp itself | Changed `primeVars[\`${p.n}/${step}\`]` to `primeVars[\`${p.n}/prime-${step}\`]` in `src/engine/exports.js`: `ui3 DIFFERS`, `json equal`, `dtcg equal`. Restored, porcelain empty |
| C1.5 | 🟢 | `git diff --stat $(git merge-base origin/main HEAD) -- figma/binder/migrations.mjs` printed nothing | Appended `// verifier control` to `figma/binder/migrations.mjs`: `--stat` printed ` figma/binder/migrations.mjs \| 1 +`. Restored, porcelain empty |
| C1.6 | 🟢 | HEAD `EXPORT_SCHEMA_VERSION = 4`, merge-base `EXPORT_SCHEMA_VERSION = 3`; check script `PASS head=4 base=3` | Set the constant back to 3: `FAIL head=3 base=3`; restored: `PASS head=4 base=3`, porcelain empty |
| C1.7 | 🟢 | `npm test` `exit=0`, `✓ all 54 test files passed`, `4:07.51 total` (load averages `14.90 19.73 20.87` at start); `git status --porcelain` empty after | Adapter §1 control: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json`, `node test/run.mjs` `exit=1`, `▶ engine/semantic.mjs      FAIL`, `FAIL  refs-canonical, ordered key set != canonical`, `✗ 1/54 test file(s) failed`, `grep -c FAIL` printed `3`. Ran `test/run.mjs` directly, not the gen chain, to keep `npm test` to one full run under load. Restored, porcelain empty |
| Build | 🟢 | `npm ci && npm run build` `exit=0`, `✓ built in 1.05s`; `git status --porcelain` empty after | Appended `export const broken = ;` to `src/engine/prime.mjs`, `npm run build`: `build exit=1`, `SyntaxError: Unexpected token ';'`. Restored, porcelain empty |

## Findings

1. 🟢 One helper owns the rule. `git grep -n 'prime-\${' -- src mcp scripts plugin figma/binder` (assets excluded) hits only `src/engine/prime.mjs:64` (comment) and `:66` (`primeSlug`). Every flat emitter calls it: `exports.js:462` (CSS/OKLCH `cssFrom`), `:791` (Tailwind), `:1219` (Radix `primeStep`, `primeSlug("prime")`), `ds-export.js:1586-1587` (`dsFullLayersCss`). Nested `primeVars` (`exports.js:730`, `${p.n}/${step}`) is untouched, per Q1.
2. 🟢 Test needles are built. No literal old name in `test/`. `test/engine/exports.mjs` restates the rule locally as `primeName` (not imported from the engine, by design) and builds `OLD_PRIME_NEEDLE`; the design-system-prime block builds its needle inline with `["prime", "prime"].join("-")` and a second local ternary `wantName` (test-side restatement, not an emitter, so outside the constraint).
3. 🟢 Q2 SERVER.version moved. `mcp/brand-kit-core.mjs` `SERVER.version` is `"0.3.0"` at 1df6d897 and `"0.4.0"` at 37e0fabb. `test/mcp/brand-kit.mjs:29` pins `MCP_BRAND_KIT_VERSION === SERVER.version`; generated `src/ui/mcp-assets.js` reads `MCP_BRAND_KIT_VERSION = "0.4.0"` (base `"0.3.0"`), and the test passed in the `npm test` run. The `$schema` needles in the four MCP tests moved `/3` to `/4`.
4. 🟢 Scope. `git diff 1df6d897 37e0fabb --stat`: 19 files, 171 insertions, 45 deletions. Code: `src/engine/{prime.mjs,exports.js,ds-export.js}`, `mcp/brand-kit-core.mjs`, `scripts/gen-adia-derived-exports.mjs` (artifact versions oklch `2.0.0`, radix `1.3.0`). Generated: `docs/reference/data/adia-{oklch-export.css,radix-export.mjs}`, `figma/plugin/ui.html`, `src/ui/{describe-mcp-assets.js,mcp-assets.js}`. Tests: `test/engine/exports.mjs`, `test/engine/fixtures/shadcn-baseline.css` (schema stamp lines only), `test/figma/plugin.mjs`, four `test/mcp/*`. Records: the handoff and review. Nothing outside U1's remit; `figma/binder/migrations.mjs` untouched.
5. 🟡 R98 not yet complete repo-wide, owned by U2. `git grep -n prime-prime -- docs/reference` hits `docs/reference/references/knowledge-04-export-formats.md:349` (`` `prime` links the `prime-prime` primitive ``). That path is in U2's C2.1, not U1's C1.1, so it does not red U1, but the plan cannot close until U2 lands it.
6. 🟡 C1.1's control is weaker than the plan's "Today" column implies: reverting `primeSlug` brings back 1 file (`adia-oklch-export.css`), not 5, because the other four held the old name only as a literal that U1 deleted. The control still bites; a future grep regression in `ui.html` or `describe-mcp-assets.js` would appear only through a regenerated CSS-like artifact.
7. Note: `test/engine/exports.mjs`'s `FAIL` keeps only the first message per group (line 48), so control (b) shows one `prime` failure even though the "still emits the retired doubled prime name" Tailwind check would also have tripped.
8. Note: the `ds-export.js` prose list (`:803`, `:1338`) still prints each family as `--{pfx}-{f}-prime-{step}`, a placeholder pattern; the added sentence right above it names the bare centre, and the Make test asserts that sentence.
