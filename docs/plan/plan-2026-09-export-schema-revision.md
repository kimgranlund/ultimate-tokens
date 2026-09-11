---
doc-type: plan
id: plan-2026-09-export-schema-revision
status: active          # active | complete | abandoned (the PLAN enum; the rulings below are ratified, see `ratified:`)
ratified: 2026-09-11    # H-1..H-4 ruled by the owner via team-lead; the plan is approved to build
date: 2026-09-11
owner: Kim Granlund
review-cadence: weekly
audience: builder, planner, reviewer
---
# PLAN — Align every export surface with the 0.3.0 color system and stamp the export schema

Intent record: GitHub issue #569 (planning charter, `size:big`). Governing contracts:
`docs/spec/spec-muted-base-key-spikes.md` 0.3.0 (REQ-030..034, REQ-054, REQ-057) and
`docs/lld/lld-muted-base-key-spikes.md` 0.3.0. Format shapes of record:
`docs/reference/references/knowledge-04-export-formats.md`. Audited at `origin/main` ae621c9
(2026-09-11), with #566 (absolute per-group base chroma, #559) in flight and NOT touched here.

## Audit: what main already emits

The prime system (#533, P4..P6) and the data palettes (#503, U6/U7) are already on every surface,
so this plan is smaller than the charter feared. What is NOT on any surface is the palette group
(editor-only by ruling #556), the group chroma controls (they change values, never names), and any
detectable schema stamp on most formats.

Legend: **E** emitted · **P** partial · **M** missing · **X** deliberately excluded (ruled).

| Surface | Data palettes (16 default) | Prime group | Palette group | Group chroma controls | Schema stamp |
|---|---|---|---|---|---|
| CSS (`exportCSS`) | E, ordinary palettes | E `--{n}-prime-{step}` | M | X (values only) | M (no header) |
| CSS OKLCH (`exportOKLCH`) | E | E | M | X | M |
| JSON (`exportJSON`) | E | E `prime[step] = {hex, oklch}` | M | M (no `meta` at all; knowledge-04 §3 says "meta + per-palette", the code has no meta) | M |
| DTCG (`exportDTCG`, 3 files) | E | E `{n}.prime.{step}` in the raw tree | M | X | M (no `$extensions`) |
| UI3 (`exportUI3`) | E | E, own `Color Prime` collection, mode `Base` | M | X | P `$schema: figma-ui3-variables.color.schema.v1` (string, unbumped since the prime collection was added) |
| Tailwind (`exportTailwind`) | E | E `--color-{n}-prime-{step}` | M | X | M |
| ShadCN (`exportShadcn`) | P `chart-1..5` from data-1..5; data-6..8 have no slot | X (fixed contract, REQ-054) | X | X | M |
| DS bundle, Claude Design (`tokens.json` + DESIGN.md) | E `data` tier + "Data series" section | E `prime` block + "Prime swatches" section | M (`families` is a flat list) | X | P `version: alpha` in DESIGN.md frontmatter; `$note` prose in tokens.json |
| DS bundle, Stitch profile (DESIGN.md only) | E (same spine) | E (same spine; `primeSection` is in the canonical section list) | M | X | P (`version: alpha`) |
| DS bundle, Figma Make profile (guidelines tree) | E (same spine) | E, to be gate-proven per profile (the existing `design-system-prime` gate exercises the Claude Design profile) | M | X | P |
| Figma plugin apply (`figma/plugin/code.js`) | E | E creates/updates `Color Prime` (#540/#554) | X (no Figma folder or metadata; ruled #556) | X | M (collections carry no version; the provenance registry key is the only marker) |
| Figma binder (`figma/binder/`) | E, binds 53 roles per palette from `role-table.json` defaults | X reads nothing from `Color Prime` (LLD "Figma plugin apply" row); the dry-run report does not mention the collection | X | X | n/a |
| MCP brand-kit (`brandKit` + `brand-kit-core.mjs`) | E, 16 palettes; `list_palettes` gives no family kind | E `get_prime`, `brand://palette/{slug}/prime` | M | M (kit carries no controls) | P `$schema: ultimate-tokens-brand-kit/1` (unbumped after `prime` was added); `SERVER.version 0.1.0` |
| Consumer plugin `color-tokens` skill | P (data-viz prose exists; `data-1..8` and the shadcn chart mapping are not named) | E (prime paragraph, #557) | M | X | n/a |
| knowledge-04 | P (§1 table predates data/prime; JSON row claims a `meta`) | E §10 | M | X | M (no versioning section) |

## Rulings proposed per gap

All four ratification items were ruled 2026-09-11 (owner via team-lead); the text below carries the
ruling, and H-3 records a change from the proposed default.

- **RP-1 Palette group becomes exported METADATA, never a name** (Open 1). Emit the group where a
  format has a metadata slot and nowhere else: JSON `palettes[n].group`; DTCG a
  `$extensions["com.ultimate-tokens"].group` on each palette's group node in `palette.tokens.json`
  (raw file only; the theme files stay untouched); brand-kit `palettes[i].group` and `list_palettes`
  returning it; DS bundle `families` becomes `familiesByGroup: { material, brand, system, data }`
  alongside the existing flat `families` (kept for consumers), and DESIGN.md's family table gains a
  Group column; CSS/OKLCH/Tailwind get a comment line per palette block (`/* neutral · material */`),
  which is not a token; UI3 and the Figma collections get nothing (Figma variables have no
  metadata slot short of `description`, and #556 ruled no Figma folders); ShadCN nothing. Rationale:
  a consumer (an agent reading the brand-kit, a DS bundle reader) needs to know which families are
  chart series and which are brand without name-matching, and the ruling only forbids names and
  folders. **Ratified 2026-09-11 (H-1), exactly as proposed.**
- **RP-2 Group chroma controls ride only the round-trippable formats.** JSON gains a top-level
  `meta` (`generator`, `schemaVersion`, `controls: { baseIntensity, primeChroma, paletteGroups }`),
  and the brand-kit gains the same `controls` block, so a kit states the chroma policy it was
  generated under; no other format carries controls (values already reflect them). Rationale: the
  brand-kit is the one surface agents interrogate for "why is neutral muted"; CSS consumers never
  need it. **Ratified 2026-09-11 (H-2).**
- **RP-3 ShadCN extends to `chart-1..8`, mapped from `data-1..8`.** **Ratified 2026-09-11 (H-3),
  a deliberate departure from the proposed default and from shadcn's stock five chart slots.**
  `chart-1..5` stay byte-identical to today (data-N when enabled, else the existing fallback chain);
  `chart-6..8` are added, bound to `data-6..8` when enabled and OMITTED when the palette is absent
  or disabled (no fallback: an invented sixth colour would be exactly what the stock contract
  lacks). `SHADCN_ORDER` grows by three; the `@theme inline` block mirrors them. The SPEC non-goal
  "no prime tokens in ShadCN" stands: these are role-backed chart slots, not prime tokens. Owned by
  step E5 below.
- **RP-4 The DS bundle documents the prime tier per profile through the shared spine, proven by
  gate.** No per-profile prose fork: the Stitch and Make profiles already render the same section
  list; the gap is proof, not emission. Add the per-profile assertion to the existing
  `design-system-prime` gate. No ratification.
- **RP-5 UI3 keeps `Color Prime` at one `Base` mode.** R2 (mode-independent prime) is ratified;
  a Light/Dark mode on that collection would contradict it. No ratification.
- **RP-6 The binder stays unaware of `Color Prime` but says so.** Roles never alias prime tokens
  (SPEC non-goal), so the binder has nothing to bind; its dry-run report gains one line naming the
  collection as "present, not bound by roles" so a user does not read silence as a miss. No
  ratification.
- **RP-7 Consumer plugin names the data families and the chart mapping.** `color-tokens` gains a
  short "Data series" paragraph: `data-1..8` are ordinary families, chroma peers by construction
  (0.3.0), bound to `--chart-1..5` in ShadCN; prime swatches of a data family are its series
  shades. Parity-gated by the existing `role-parity` script only for role counts; the data list is
  prose. No ratification.
- **RP-8 Export schema versioning** (Open 2): one constant, `EXPORT_SCHEMA_VERSION = 2`, in
  `src/engine/exports.js`, stamped on every surface that can carry it: JSON `meta.schemaVersion`;
  DTCG `$extensions["com.ultimate-tokens"].schemaVersion` at the root of each of the three files;
  UI3 `$schema: "figma-ui3-variables.color.schema.v2"`; CSS, OKLCH, Tailwind, and ShadCN a first-line
  comment `/* ultimate-tokens export schema 2 */`; DS `tokens.json` `$schemaVersion: 2` and DESIGN.md
  frontmatter `tokensSchema: 2`; brand-kit `$schema: "ultimate-tokens-brand-kit/2"` and `SERVER.version`
  `0.2.0`. Version 1 is defined retroactively as the pre-#503 shape (8 palettes, no prime, no data,
  unstamped), so absence of a stamp means 1. Bump rule: any additive or shape change to an emitted
  format bumps the constant once, in the same PR, across all surfaces; a value-only change (a chroma
  default) never bumps. Alternative: per-format versions. Rejected because consumers of the zip get
  several files from one generator run and one number is what they can compare. **Ratified
  2026-09-11 (H-4), including the DTCG root `$extensions` placement**; the E6 gate proves our own
  Figma apply path tolerates it, and a strict third-party importer that rejects root `$extensions`
  is handled in a follow-up, not by moving the stamp.
- **RP-9 knowledge-04 becomes the shape of record for all of the above** and its §1 table lists all
  eight formats plus the DS bundle and brand-kit with their stamps. No ratification.

## Steps

Concept-major, never format-major: each step lands one concept across EVERY surface that carries
it, with its gates, so no format ever emits a half-shape. The version stamp lands last, once the
shapes it certifies exist. Each step is one PR with `npm test` green; sizes use the repo's
small/big ladder.

1. **E1 Group metadata everywhere it may go** (RP-1, after H-1). Owner: builder lane. Status: todo.
   Touches `exports.js` (JSON `group`, DTCG `$extensions` on the raw palette node, CSS/OKLCH/Tailwind
   comment lines), `ds-export.js` (`familiesByGroup`, DESIGN.md Group column across the three
   profiles), `model.mjs` `brandKit` (`group`), `mcp/brand-kit-core.mjs` (`list_palettes`),
   `test/engine/exports.mjs` (a `hpg-export-group-metadata` gate: every emitted group is one of the
   four, matches `paletteGroup(p)`, appears in no token NAME on any surface, and is absent from UI3
   and ShadCN), `test/mcp/brand-kit.mjs`. Done when: the gate is green, `git grep -n "material\|brand\|
   system" test/engine/fixtures` shows no group word inside a token name, and the CSS byte-diff
   against main differs only by comment lines. Size: big. Serves REQ-030, RP-1.
2. **E2 Controls metadata on JSON and the brand-kit** (RP-2, after H-2). Owner: builder. Status:
   todo. `exportJSON` gains `meta` (`generator`, `controls`), `brandKit` gains `controls`; the JSON
   `meta` is created here WITHOUT `schemaVersion` (E6 adds it) so the shape is complete for this
   concept on its own. Gates: `hpg-export-json-meta` (controls deep-equal `stateOf(doc)`'s resolved
   values and `paletteGroups`), brand-kit test. Done when: green and knowledge-04 §3's "meta" claim is
   finally true. Size: small. Serves REQ-010, RP-2.
3. **E3 DS bundle prime parity per profile** (RP-4). Owner: builder. Status: todo. Extend
   `hpg-export-design-system-prime` to assert the "Prime swatches" section and the `prime` block (where
   the profile has tokens.json) in the Stitch and Make outputs. Done when: three profiles asserted,
   green with no emitter change (if a profile lacks it, the fix is in the shared spine, same PR).
   Size: small. Serves REQ-054.
4. **E4 Binder report line + consumer plugin prose** (RP-6, RP-7). Owner: builder. Status: todo.
   `figma/binder/figma-semantic-binder/code.js` dry-run report names `Color Prime` as present and
   unbound (regenerated `code.js` outside the `GENERATED:ROLE_TABLE` markers; `collparity` unchanged);
   `plugin/ultimate-tokens/skills/color-tokens/SKILL.md` "Data series" paragraph (naming
   `--chart-1..8` per H-3). Done when: the
   binder shim test sees the line and `npm test` is green. Size: small. Serves REQ-033, REQ-040.
5. **E5 ShadCN `chart-6..8`** (RP-3, H-3). Owner: builder. Status: todo. `exportShadcn`: extend
   `SHADCN_ORDER` and `MAP` with `chart-6..8` from `dataN(6..8)`, omitted when absent; `chart-1..5`
   unchanged. Gates: `hpg-export-shadcn` byte-identical for 1..5 on the default doc; a new
   `hpg-export-shadcn-chart-6-8` (present with data-6..8 enabled, absent with them disabled, values
   equal the data palette's prime ROLE per scheme). Done when: green and the default-doc shadcn
   output differs from main only by the three added lines per block. Size: small. Serves REQ-031.
6. **E6 Schema stamp** (RP-8, H-4; LAST code step). Owner: builder. Status: todo.
   `EXPORT_SCHEMA_VERSION = 2` and every stamp listed in RP-8; `collections.js` unchanged; the Figma
   plugin's own DTCG reader tolerates the root `$extensions` (gate: apply the stamped bundle in
   `test/figma/plugin.mjs`). Gates: `hpg-export-schema-stamp` (every surface carries the same number;
   removing the constant turns every surface red, a negative control run once in the PR). Done when:
   green, and the smoke run's Figma apply reports the same variable counts as before. Size: small.
   Serves RP-8.
7. **E7 Docs of record**. Owner: docs lane (P8-style sweep). Status: todo. knowledge-04 §1 table
   (all formats + stamps), §3 `meta`, a new §11 "Group metadata" and §12 "Schema versioning";
   `mcp/README.md` (`list_palettes` group, `controls`); `docs/marketing/fact-sheet.md` (formats row
   unchanged in count, stamp mentioned); CHANGELOG entry; `adding-export-formats` skill gains the
   "bump `EXPORT_SCHEMA_VERSION` on any shape change" rule. Done when: the AC-040-style greps find no
   stale "two-collection" or "meta + per-palette" claims. Size: small. Serves REQ-040.

Ordering: E1 → E2 (E2's `meta` object must not pre-empt E1's `group` placement decisions) → E3, E4,
E5 in parallel → E6 → E7. E3, E4, and E5 are independent of E1 and may run first. Nothing here
touches #566's files' resolvers; E2 reads `paletteGroups` through the model's resolver once #566 has
merged, so E2 is blocked until then. Final list: E1 group metadata (big) · E2 controls meta (small)
· E3 DS prime parity gate (small) · E4 binder line + consumer prose (small) · E5 shadcn chart-6..8
(small) · E6 schema stamp (small, last code step) · E7 docs of record (small).

## Ratification record (2026-09-11, owner via team-lead)

- **H-1** Groups exported as metadata per RP-1, exactly as proposed. Ratified.
- **H-2** Controls block on JSON `meta` and the brand-kit per RP-2. Ratified.
- **H-3** CHANGED from the proposed default: ShadCN extends to `chart-1..8` from `data-1..8`, 1..5
  byte-identical, 6..8 added (RP-3, step E5). Ratified.
- **H-4** One `EXPORT_SCHEMA_VERSION = 2` stamped everywhere including the DTCG root `$extensions`
  (RP-8, step E6). Ratified.
No ratification remains open; the plan is approved to build.

## Validation

- `npm test` green at every step; the new gates named per step exist and bite (each PR shows the
  red-then-green run for its gate, and E6 runs the remove-the-constant negative control).
- `npm run smoke` after E6: the built single-file exports every format with the stamp and the Figma
  apply path accepts the stamped DTCG.
- Byte-diff discipline: E1 changes CSS/OKLCH/Tailwind only by comment lines; E2 changes JSON only by
  the `meta` key; E5 changes shadcn only by the three chart lines per block; E6 changes each surface
  only by its stamp. Each PR includes the diff summary.
- Name freeze: `git grep -nE "\-(material|brand|system|data)-" src/engine/exports.js` returns
  nothing new (groups never enter names), and no existing token is renamed (charter non-goal).
- knowledge-04 rubric re-check by `docs:doc-checker` after E7.

## Rollback

- E1, E2, E4, E5, E6 are additive keys, comment lines, chart slots, or a tool field: revert the PR; no consumer
  breaks because absence already meant "v1".
- E3 changes only tests unless a profile lacked the section; then the revert is the spine line.
- E6's UI3 `$schema` bump is the one consumer-visible string change; rollback restores `.v1` and
  is safe because no consumer is known to key on it, and the stamp lands last so a rollback of E6
  alone leaves every shape intact and merely unstamped (which reads as v1: acceptable for one
  release, noted in CHANGELOG if it happens).
- Nothing here migrates documents; `persist.js` is untouched.

<!-- LIVING STATE: one canonical copy. On completion: status flip, learnings promoted to
     knowledge-04 and the adding-export-formats skill, file moved to docs/plan/archive/. -->
