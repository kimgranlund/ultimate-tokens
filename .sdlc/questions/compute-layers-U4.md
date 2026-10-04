# Questions compute-layers U4 · builder to orchestrator

The U4 lane names the engine, model, persist, the app.js preset-tile call, `test/engine/`, the TESTS line, `scripts/bundle.mjs` and the gen scripts, the ADR, the CHANGELOG and the regenerated bundles. Two required consequences of C4.5 reach past it. I carried on with the narrower reading: each out-of-lane edit below is the smallest one that keeps an existing gate green, none changes behaviour.

1. The schema bump moves every pinned schema number. `EXPORT_SCHEMA_VERSION` 5 to 6 is also the brand-kit MCP's `brand-kit/N` stamp and the Figma bundle's `schemaVersion`, so these assert the new value: `mcp/brand-kit-core.mjs` (SERVER 0.6.0, comment), `test/mcp/{brand-kit,describe-kit-core,describe-mcp,describe-rubric}.mjs`, `test/figma/plugin.mjs`, and the two maintaining-brand-kit-mcp references. Question: should the MCP server version move with the export schema in a later unit instead? I bumped it because its own test pins the pair.
2. The pins line is line 2 of every comment-stamped export. Gates that read line 1 to 3 of an export accept the optional pins line: `test/ui/headless-boot.mjs` (3 regexes), `test/smoke/smoke.mjs` (2 regexes), `scripts/smoke-panda.mjs` (passes `{ layers }` to the module exporters, as model.mjs does). `test/ui/persist.mjs`'s fuzz state gains `layers`, the new hydrated field, so its roundtrip compares like for like.
3. Line-number citations in `docs/reference/reviews/2026-08-20-reactivity/0{0,1,2,3}-*.md` re-pointed (the citations gate; persist.js and model.mjs lines moved).
4. Docs that state the schema or the Panda/Radix stamp: `docs/reference/references/knowledge-04-export-formats.md`, `.claude/skills/adding-export-formats/SKILL.md`.

No answer blocks U4; each is reversible by a follow-up unit.
