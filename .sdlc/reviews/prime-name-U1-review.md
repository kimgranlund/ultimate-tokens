PASS

# Review prime-name U1 (#789), reviewer l3

Unit branch `unit/pn-U1`, head `fc8b43b3` (code `f0a3ffd0`), base `1df6d897` (also `git merge-base origin/main HEAD`). Criteria `.sdlc/plans/prime-name.md` U1, C1.1 to C1.7. Verdict: PASS, with one Medium stale-record finding that must be closed before the pre-land record (it is not a U1 criterion, route below).

## Criteria

| # | Result | Evidence (mine, not the handoff's) |
|---|---|---|
| C1.1 | 🟢 | `git grep -a -l prime-prime -- src mcp plugin figma test docs/reference/data` prints nothing, rc 1. Generated assets are fresh: `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js` contain `primeSlug`; `adia-oklch-export.css` holds `--c-*-prime:` |
| C1.2 | 🟢 | Own script on `stateOf(defaultDocument())`, HEAD versus the base `src` extracted with `git archive`: HEAD `--c-primary-prime:` 1 in CSS and 1 in OKLCH, `--color-primary-prime:` 1 in Tailwind, `var(--c-primary-prime)` 2 in Radix refs; doubled form 0 in CSS, OKLCH, Tailwind, Radix refs and Radix values. Base: doubled 16, 16, 16, 18, 0. Six suffixed names present once each; 112 prime declarations in both trees (7 x 16 palettes), so nothing added or lost |
| C1.3 | 🟢 | `node test/engine/exports.mjs` PASS (all gates, `prime`, `radix-refs-*`, `design-system-prime`, `hpg-export-schema-stamp`). The test restates the name rule instead of importing `primeSlug`, so it cannot pass by reading the helper back; the old needle is built, not literal |
| C1.4 | 🟢 | `exportUI3`, `exportJSON`, `exportDTCG` dumped from HEAD and base and diffed: the only differences are the schema stamp (UI3 `$schema` `...schema.v3` to `v4`, JSON `schemaVersion`, three DTCG `schemaVersion`). Hash of the Panda and Radix values forms equal, unmasked |
| C1.5 | 🟢 | `git diff --stat $(git merge-base origin/main HEAD) -- figma/binder/migrations.mjs \| wc -l` is 0; no `figma/binder` or `figma/plugin/code.js` file in the unit diff |
| C1.6 | 🟢 | `EXPORT_SCHEMA_VERSION = 4` at HEAD, `3` at the merge-base and on `origin/main` (4a66f80d), so merge-base plus 1. Literals moved: `hpg-export-schema-stamp` `v`, radix-refs-module line, `test/figma/plugin.mjs` `schemaVersion !== 4`, `brand-kit/4` in `test/mcp/{brand-kit,describe-kit-core,describe-mcp,describe-rubric}.mjs`, the three shadcn fixture stamps, `SERVER.version` 0.4.0 and the generated `MCP_BRAND_KIT_VERSION` 0.4.0, Adia headers. No code or test literal `3` of the export schema survives (grep below) |
| C1.7 | 🟡 | Not reproduced by me: the host load was 43 with two `npm test` runs live, and you barred `npm run build`. I ran only `node test/engine/exports.mjs` and `node test/engine/adia-derived-exports.mjs` (both PASS), and `git status --porcelain` is empty after both. The builder's `npm test` 54/54 and build exit 0 stand as its floor; the Verifier owns the full gate |

## Callers of the name rule

| Surface | Result |
|---|---|
| CSS, OKLCH (`cssFrom`) | bare centre via `primeSlug`, six suffixed |
| Tailwind (`exportTailwind`) | same |
| Radix refs (`radixRefLeaves.primeStep`) | `link(p.n, primeSlug("prime"))` gives `var(--c-{n}-prime)`; the helper is called, no inline ternary |
| Claude Design, Stitch, Make bundles | `dsFullLayersCss` uses `primeSlug` (Make styles.css: 32 bare plus 192 suffixed declarations, 0 doubled; base had 32 doubled). The bare-centre sentence appears in the Claude `DESIGN.md` spine, the Stitch bundle and Make `foundations/color.md` (one file each) |
| Prose | both `ds-export.js` sites keep the `prime-{step}` pattern line and add the bare-centre sentence |
| Nested JSON, DTCG, Panda, UI3, Radix values | unchanged (C1.4); `PRIME_STEPS` loops there never call `primeSlug` |
| Other `PRIME_STEPS` users | `mcp/brand-kit-core.mjs` and `model.mjs` address steps by word, no CSS name composed |

## Adia artifact versions: in scope, keep

`scripts/gen-adia-derived-exports.mjs` states its own policy: any change to a generated file bumps that file's `version` and cuts that file's tag; renamed or removed keys are `major`, a schema-stamp-only re-export is `minor` (the 1.1.0 precedent). `npm test` regenerates both files with the stamp and, for the CSS artifact, a renamed custom property, so leaving 1.2.0 would ship changed bytes under an unchanged provenance version. oklch 2.0.0 (key renamed) and radix 1.3.0 (stamp only) apply that policy correctly. Not a revert. Two follow-ups, neither a U1 defect: the tags `adia-oklch-export@2.0.0` and `adia-radix-export@1.3.0` are a release step (handoff says so), and U2's CHANGELOG entry should name the oklch major so a pinned consumer sees it.

## Findings, ranked

| Sev | Finding | Action |
|---|---|---|
| Medium | Stale records the bump invalidates: `.claude/skills/maintaining-brand-kit-mcp/references/foundations.md` lines 13, 41, 43 and `references/best-practices.md` lines 70, 73 still state `ultimate-tokens-brand-kit/3` and server `version: "0.3.0"`. Both were true at the base and are false at HEAD. The standing rule is that a change repairing nothing it invalidates is a defect. Neither U1 nor U2 lists `.claude/skills` | Add to U2 (new criterion: `git grep -a -n 'brand-kit/3\|version: "0.3.0"' -- .claude/skills` empty) or one small U1 commit. Orchestrator's call; must land before the pre-land pair |
| Low | `radix-refs-shape` regex `prime(?:-[a-z]+)?` still admits `prime-prime`. The doubled form is caught by `radix-refs-extras` and the built needle, so no hole today, but the shape gate no longer pins the seven-name set | Optional: `prime(?:-(?:brightest\|brighter\|bright\|dim\|dimmer\|dimmest))?` |
| Low | The bare-centre sentence in `DESIGN.md` / Stitch is not asserted; only Make `color.md` is. I confirmed all three carry it at HEAD | Optional one-line assert in `design-system-prime` |
| Info | Q1 consequence for U2 prose: the Panda tree keeps nested `prime.prime` plus `prime.DEFAULT`, so a Panda consumer's own compiled variable for the centre can still read doubled or bare depending on which key they reference; that is Panda's generation, not our emission, and Q1 ruled it | U2 docs should say which Panda path to use |
| Info | Remaining `prime-prime` text: `docs/reference/references/knowledge-04-export-formats.md:349`, `docs/spec/spec-muted-base-key-spikes.md:392`, `docs/spec/spec-panda-park-ui-exports.md:320` | Already U2 C2.1 |
| Info | Compute-layers collision: the handoff's merge note is right; the second lander re-bumps the constant, `SERVER.version`, the stamp literals, the Adia versions and the "(#789)" comment text | Orchestrator sequencing |

## R98

R98: none found. No alias, no old-name emit, no mapping entry, no fallback key, no special case outside the single `primeSlug` rule. The one `step === "prime"` branch lives in that helper by design (plan section 4); the test file's restated `primeName` ternary is a deliberate independent oracle, commented as such, not an emitter. `figma/binder/migrations.mjs` untouched.

## Checked and clean

- Em dash count in the unit diff: 0.
- `git status --porcelain` in the unit tree: empty before and after my runs.
- `git grep -a` for `brand-kit/3`, `schema 3`, `EXPORT_SCHEMA_VERSION = 3`, `v = 3`, `0.3.0` outside archives and `.sdlc`: only the Medium finding's files, historical comments, and `test/ui/persist.mjs` (document `schemaVersion`, a different counter).
- No file outside the handoff's table changed; no `.claude/docs/other/` path in the diff.
