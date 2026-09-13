---
doc-type: plan
id: plan-2026-09-adia-derived-export-artifacts
status: active          # active | complete | abandoned
date: 2026-09-13
owner: Kim Granlund
review-cadence: weekly
audience: builder, reviewer
---
# PLAN: Publish sha256-pinned derived OKLCH + Radix export artifacts for the Adia brand document

Intent record: GitHub issue #631 (`kind:feature`, `size:big`, `lane:exports`). Upstream rulings:
#616's 2026-09-12 per-artifact tag scheme (comments `5647614190`, `5647640551`); #618's committed
Adia document (commit `770297b`, tag `adia-brand-document@1.0.0`). Adjacent, not subsumed: #452
(in-house apply), #630 (Radix alias-key collision, open). Precedents followed:
`docs/reference/data/radix-projection.json` (versioned, pinnable, externally consumed reference
file) and `scripts/gen-categories.mjs` (the `gen:*` generator shape). Planned at `origin/main`
`770297b`, 2026-09-13; the numbers below were measured by running the real pipeline in a scratch
probe against that commit, not estimated.

## Rulings (the ticket's open questions, resolved)

### R-1 Scope: OKLCH + Radix only. Panda is NOT added.

- #616's ruling comment (`5647614190`) says adia-ui-kit's #251 "already expects to pin one tag
  covering the OKLCH/Panda/Radix exports". That sentence is a rationale for widening the TAG
  SCHEME to cover #618's document; it is not a requirement list, and #616's follow-up
  (`5647640551`) immediately replaced "one tag" with per-artifact tags. Neither comment asks this
  repo to publish a Panda artifact.
- #631's own Summary and Acceptance (the seed this dispatch is bound to) name exactly two
  artifacts. adia-ui-kit's repository is not reachable from this machine (`gh issue view 251 -R
  kimgranlund/adia-ui-kit` resolves to nothing), so the only in-reach statement of what #251
  consumes is #631's seed, and the seed says two.
- `exportPanda` / `exportPandaModule` exist (`src/engine/exports.js:934` / `:1036`) and the
  generator design below emits from the same `projectView(doc).exports` object, so adding
  `exports.panda` later is one line in the artifact table plus one tag. The cost of deferring is
  near zero; the cost of publishing an artifact nobody asked for is a third pinned surface that
  must then be bumped forever. Ship two; if adia-ui-kit's #251 turns out to need Panda, file a
  follow-up that adds the row and cuts `adia-panda-export@1.0.0` under the same scheme.

### R-2 Artifact location and names

Both files live in `docs/reference/data/` beside `radix-projection.json` (the ticket's proposed
default; `src/ui/*-assets.js` is the app's internal convention and stays out of this).

| Artifact | Path | Tag |
|---|---|---|
| OKLCH CSS | `docs/reference/data/adia-oklch-export.css` | `adia-oklch-export@1.0.0` |
| Radix ESM | `docs/reference/data/adia-radix-export.mjs` | `adia-radix-export@1.0.0` |

Naming rule: `<document>-<format>-export.<ext>`, and the tag is the basename without extension
plus `@X.Y.Z`. File basename == tag family, so a consumer pinning a tag knows the path by
construction. `.mjs`, not `.js`: the Radix module is `export default {...}` ESM and the repo has no
`"type": "module"` that would make `.js` import cleanly from Node; `.mjs` is loadable as-is
(`node --input-type=module -e "import('./docs/reference/data/adia-radix-export.mjs')"`).

`radix-projection.json` carries its version as a JSON field. CSS and ESM have no JSON slot, so
each artifact carries the version in a leading comment block that the generator writes ABOVE the
exporter's own output, without altering the exporter output itself:

```
/* ultimate-tokens export schema 2 */              <- exporter's own first line, untouched
/* adia-oklch-export 1.0.0
   source: docs/reference/colors/categories/brands.json (adia-brand-document@1.0.0, 770297b)
   generator: scripts/gen-adia-derived-exports.mjs (projectView(hydrate(preset)).exports.oklch)
   DO NOT EDIT: regenerate with `npm run gen:adia-exports`. */
:root {
```

The exporter's own `/* ultimate-tokens export schema N */` stays line 1 (Acceptance item 4, no
extra step). The provenance block is line 2 onward. It is ILLUSTRATIVE in wording, NORMATIVE in
the four facts it must carry: artifact version, source document tag + commit, generator path +
call, regenerate command. The source commit sha in the header is the `adia-brand-document`
commit the preset was read at, not the merge sha of this PR (which is unknowable at generation
time; the tag carries that).

Bump policy (same discipline as #616): patch = provenance/comment-only change with identical
exporter bytes; minor = the same document re-exported under a bumped `EXPORT_SCHEMA_VERSION`
or a new `adia-brand-document` tag; major = a shape change a consumer's byte-compare cannot
absorb (format keys renamed or removed). Any change to either file bumps that file's version
and cuts that file's tag; the other file is untouched (independent cadence, #616 follow-up).

### R-3 Pipeline: `hydrate(preset)` then `projectView(doc).exports`

The exact call sequence (verified in a scratch probe at `770297b`; all imports are DOM-free and
already used from `scripts/gen-categories.mjs` and `test/engine/*.mjs`):

```js
import { PRESETS } from "../src/ui/categories/brands.js";   // generated mirror of brands.json
import { hydrate } from "../src/ui/persist.js";
import { projectView } from "../src/ui/model.mjs";
const preset = PRESETS.find((p) => p.name === "Adia · The product's own design system");
const doc = hydrate(preset);                                 // == app's openConfigAsSet path (*)
const { oklch, radix } = projectView(doc).exports;           // the export drawer's own bytes
```

(*) `openConfigAsSet` calls `hydrateStoredDoc`, which only differs from `hydrate` by stamping
`hueSpace: "cam16"` on a doc that lacks the field; the Adia preset carries `hueSpace: "oklch"`,
so the two are identical here. `app-helpers.mjs` (where `hydrateStoredDoc` lives) also imports
`type-fonts.js` and app-theme helpers, so the generator uses `hydrate` directly and states this
equivalence in its header.

Why `projectView(...).exports` and not bare `exportOKLCH(state)` / `exportRadix(state)`:
`model.mjs:950-969` is the one place the app assembles every export. It calls
`exportRadix(state, { geometry: geomScaleFor(state, "base") })`, and Adia's document carries
`geometry: { ramp: "linear4" }`, so the drawer's Radix module includes a `tokens.radii` block
(`none 0px, xs 4px, sm 8px, md 12px, lg 16px, xl 28px, full 9999px`). A bare `exportRadix(state)`
omits that block and produces different bytes (probe: `6d7e9c8c...` bare vs `2f03074d...` via
projectView). The ticket's Acceptance names the exporter functions; the ticket's Summary names the
goal (what adia-ui-kit would get from this repo). The drawer's bytes are the goal, and
`projectView` is the only path that is by construction not a hand-rolled shortcut. For OKLCH the
two paths are byte-identical (`exportOKLCH` takes no opts), so nothing is lost there.

Measured at `770297b` (whole-file hash will differ once the provenance block is added; these are
the exporter-body hashes the builder must reproduce before adding the header):

| Body | bytes | sha256 |
|---|---|---|
| `exports.oklch` | 111071 | `95235b6a842c0f27ed233283ecd7a99bf1c4a4e45c74a6295ef9f674d18c6fd0` |
| `exports.radix` | 134223 | `2f03074d33db54d171b72a663da26cfb56dd53fbd1439a02cceca1db3ef62def` |

Determinism: two independent `hydrate -> projectView` runs hashed identical in the probe.
`gen-categories.mjs` already rounds every emitted OKLCH component to 4 decimals for exactly the
Node-version-drift reason (TKT-0011), and the exporters format through `oklchStr`, so the
artifacts are as stable as the existing committed category modules that CI's drift gate already
polices.

### R-4 Generator: a repeatable `scripts/gen-adia-derived-exports.mjs`, wired into `test` and `build`

Not a one-off. Reasons, in order of weight:

1. CI's generated-artifact drift gate (`.github/workflows/ci.yml`, `git diff --exit-code` after
   `npm run build && npm test`) is the repo's existing mechanism for "committed output matches
   the engine". Wiring the generator into `npm test` makes a stale artifact a red build, for free,
   with no new gate code. A one-off script gives the artifact no owner once the engine moves.
2. The artifact is pinned to a tag, but the engine is not frozen. When `EXPORT_SCHEMA_VERSION`
   bumps or a future `adia-brand-document@1.1.0` lands, the same script regenerates 1.1.0 of each
   artifact; the bump policy in R-2 is only honest if regeneration is one command.
3. It is the repo's convention (`gen:categories`, `gen:figma-assets`, `gen:mcp-assets`): a
   `scripts/gen-*.mjs` with a header explaining what it reads and writes, an `npm run gen:*`
   entry, and no import-time side effects.

Contract for the script:

- Reads: `src/ui/categories/brands.js` (`PRESETS`), the Adia preset by exact name.
- Writes: the two files in R-2, each = exporter body with the provenance block spliced after
  line 1. The artifact version and the source tag/commit are constants at the top of the script
  (`ARTIFACT_VERSION`, `SOURCE_TAG`, `SOURCE_COMMIT`), bumped by hand per the R-2 policy.
- Fails loudly (non-zero exit, named reason) if: the Adia preset is not found; `exports.radix` is
  the no-driver sentinel string; any of Adia's 16 palette slugs equals one of exportRadix's
  reserved alias keys `accent|gray|error|fg|canvas|border|bg` (the #630 re-check the ticket asks
  for, done at generation time so a future rename cannot silently drop a palette).
- `package.json`: `"gen:adia-exports": "node scripts/gen-adia-derived-exports.mjs"`, and both the
  `test` and `build` chains gain `&& npm run gen:adia-exports` immediately after
  `npm run gen:categories` (the generator reads `brands.js`, which `gen:categories` writes, so
  ordering is load-bearing). This touches the build chain, so `npm run build` is a required gate
  (Acceptance item 9).

### R-5 Tags

`adia-oklch-export@1.0.0` and `adia-radix-export@1.0.0`, both on the squash-merge commit of this
PR, annotated, pushed to `origin`. Consistent with #616's follow-up ruling: per-artifact tags,
shared `<artifact>@X.Y.Z` discipline, independent cadence, distinct from
`adia-brand-document@X.Y.Z` (parameters) and `radix-projection@X.Y.Z` (mapping table). No Panda
tag (R-1).

### R-6 ADR: not warranted for this ticket

The "derived-export-artifact convention" question is real but this is its first instance, and no
genuine fork was resolved: location follows the ticket's own proposed default, naming follows the
tag scheme #616 already ratified, and the generator follows the repo's existing `gen:*` shape.
An ADR whose Context reads fine with no Decision above it is not an ADR. The convention is stated
in R-2 (naming, version comment, bump policy) and in the generator's header comment; a second
derived artifact (Panda, or another brand) is the moment to promote it to an ADR, because only
then does a real choice appear (one generator per document vs one table-driven generator). Record
this as a non-decision in the Risks section below, not as a blocker.

No LLD is owed at this tier either, despite `size:big`: `doc-writing-rules`' Owed chain calls for
an LLD when a change adds or alters a component/interface contract; this ticket wires one new
`gen:*` script into the existing `test`/`build` chains (the same shape as `gen-categories.mjs`)
and adds two static data files — no new interface, no altered contract, nothing an LLD would
document beyond what R-2 through R-4 above already fix. The `big` size reflects decision count
(scope, naming, tag scheme, pipeline-path proof), not architectural surface.

### R-7 Assert layer

Payload-level byte compare, at two grains:

- Generation grain: CI's drift gate (R-4) proves committed bytes == regenerated bytes.
- Consumer grain: `sha256` over each whole committed file (provenance block included), published
  in the PR body and on #618; adia-ui-kit pins the file at the tag and compares against that hash.
  Hash the WHOLE file, not the exporter body: the consumer has no way to strip our header, and a
  provenance-only edit is a version bump by the R-2 policy anyway.

A small test file (`test/engine/adia-derived-exports.mjs`, added to `test/run.mjs`) additionally
asserts the invariants that `git diff` cannot express: line 1 of each artifact is the schema
comment with the live `EXPORT_SCHEMA_VERSION`; line 2 names the artifact and `ARTIFACT_VERSION`;
the Radix module parses and its `semanticTokens.colors` keys are exactly Adia's 16 slugs plus the
7 alias keys (23 keys, none lost, the #630 assertion in test form); the ESM file imports under
Node. Negative control: the builder mutates one byte of an artifact body once, confirms the test
fails, reverts, and notes it in the PR.

## Steps

1. **Generator.** Owner: builder. Status: todo. Write `scripts/gen-adia-derived-exports.mjs` per
   R-3/R-4 (header comment in the `gen-categories.mjs` style: what it reads, what it writes, why
   `projectView`, why `hydrate` == `hydrateStoredDoc` here, the R-2 bump policy). Add
   `gen:adia-exports` to `package.json` and chain it into `test` and `build` after
   `gen:categories`. done-when: `npm run gen:adia-exports` exits 0, writes both files, and a
   second run leaves `git status --porcelain docs/reference/data` empty.
2. **Artifacts.** Owner: builder. Status: todo. Commit the two generated files from step 1. Done
   when: stripping the provenance block from each file and hashing the remainder reproduces the
   two body hashes in R-3 (`95235b6a...` and `2f03074d...`); if either differs, stop and
   diagnose (engine moved since `770297b`, or the call sequence deviates from R-3) before going
   on. Serves Acceptance items 1, 3, 4, 5 as faithful-pipeline output — item 2's literal
   `--md-sys-color-*` wording is NOT served (R-A: the real pipeline emits `--c-*`); this
   divergence, and item 3's "eight" vs the real 16 palette slugs (R-F), were escalated to #631 as
   a comment before this step runs (2026-09-13), per dispatch-ticket's discovered-design-fork
   discipline — not silently reinterpreted.
3. **Gate.** Owner: builder. Status: todo. Add `test/engine/adia-derived-exports.mjs` per R-7 and
   register it in `test/run.mjs`. done-when: `node test/engine/adia-derived-exports.mjs` exits 0
   on the branch, and exits 1 after a one-byte mutation of either artifact (negative control,
   then reverted).
4. **Repo gates.** Owner: builder. Status: todo. done-when: `npm test` exits 0 and `npm run build`
   exits 0 (build chain touched, Acceptance item 9), and `git status` shows only the intended
   files (generator, package.json, two artifacts, test file, test/run.mjs, this plan).
5. **Hashes.** Owner: builder. Status: todo. done-when: `shasum -a 256
   docs/reference/data/adia-oklch-export.css docs/reference/data/adia-radix-export.mjs` output is
   captured verbatim for the PR body. Serves Acceptance item 6.
6. **PR.** Owner: builder, via the `shipping-changes` skill. Status: todo. PR body carries: the
   two paths, the two whole-file sha256 values, the source tag/commit, the negative-control note
   from step 3, and a link to this plan. done-when: CI green (including the drift gate and smoke)
   and the PR is squash-merged to `main`.
7. **Tags.** Owner: builder (or owner, per the write-gate in force). Status: todo. On the merge
   commit: `git tag -a adia-oklch-export@1.0.0 -m "..."` and `git tag -a adia-radix-export@1.0.0
   -m "..."`, then `git push origin --tags` (or the two tags by name). done-when: `git ls-remote
   --tags origin` lists both and `git tag --points-at <merge-sha>` lists both. Serves Acceptance
   item 7.
8. **Record.** Owner: builder. Status: todo. Comment on #618 with: both tag names, the merge sha,
   both paths, both sha256 values, `EXPORT_SCHEMA_VERSION` (2), and the R-1 scope note (OKLCH +
   Radix; Panda deferred, follow-up on request). Fill #631's Findings with the same plus a link to
   this plan. done-when: `gh issue view 618 --json comments` shows the comment. Serves Acceptance
   item 8.

## Validation

- Steps 1 to 4 are the local proof: generator idempotent, body hashes match R-3, new gate passes
  and fails on its negative control, `npm test` + `npm run build` green.
- Step 6's CI run is the independent proof: the drift gate regenerates both artifacts on a clean
  runner and diffs them against the commit.
- Step 7 + 8 are the external contract: the tags and hashes adia-ui-kit's ADR-0010 CI will pin.
- Reviewer (doc-checker for this plan; code-checker for the PR) checks, in this order: the
  `projectView` call is used (not bare `exportRadix`), line 1 of each artifact is the untouched
  schema comment, the 23-key Radix assertion exists, `gen:adia-exports` sits after
  `gen:categories` in both chains.

## Risks

- **R-A (attention) Prefix mismatch with the ticket text.** #631 says the CSS carries
  `--md-sys-color-*` properties. The committed Adia document has no `export.colorPrefix`, so the
  real pipeline emits the default `--c-*` prefix (probe: `--c-neutral-050` present, no `md-sys`
  anywhere). Ruling: ship what the tagged document produces. Setting a prefix would mean either
  mutating state by hand (banned by the ticket) or editing `brands.json` and cutting
  `adia-brand-document@1.1.0` first (a different ticket). Detection: step 2's body hash. Fallback:
  if adia-ui-kit's #251 genuinely requires `--md-sys-color-*`, the coordinator files a follow-up
  to add `export: { colorPrefix: "md-sys-color" }` to the Adia entry, re-tag the document, then
  regenerate 1.1.0 of the OKLCH artifact under this same plan. Builder posts the `--c-*` fact in
  the #618 comment so the downstream owner sees it at pin time, not at integration time.
- **R-B (attention) #630 lands first and changes `exportRadix` output.** Detection: step 2's
  body hash for Radix no longer matches `2f03074d...`. Fallback: regenerate, re-hash, record the
  new hash in this plan's R-3 table with the reason, and continue; the 23-key assertion in step 3
  still holds because Adia's names never collided in the first place.
- **R-C (attention) Engine drift between `770297b` and the merge commit.** Same detection as
  R-B. The artifact's provenance block names the document tag, and the artifact's own tag names
  the merge commit, so a consumer can always reconstruct which engine produced the bytes.
- **R-D (non-decision, recorded) Convention promotion.** Per R-6, no ADR now. Trigger to write
  one: a second derived-export artifact request. Owner of the trigger: whoever files that ticket.
- **R-F (attention) Ticket text says "eight palette names"; the real committed document has 16.**
  #631's Acceptance item 3 literally names "Adia's eight palette names (Neutral/Primary/
  Secondary/Tertiary/Info/Success/Warning/Danger)" — the 8 core families only. The real committed
  document at `770297b` (#618) is the fitted **16-family** document (8 core + 8 data), per #618's
  own commit message. Ruling: proceed against the real 16-family document (all 16 slugs checked
  against the #630 alias-collision list in the generator, R-4) — the ticket's "eight" undercounts
  what commit `770297b` actually contains, same stale-wording class as R-A. Escalated to #631 as a
  comment (2026-09-13) alongside R-A rather than silently reinterpreted either narrower or wider.
- **R-E (attention) Radix preset `name` is `ultimate-tokens-radix-brand-kit`, not `...-adia`.**
  `stateOf(doc)` does not carry `doc.name`, so `exportRadix` falls back to `brand-kit`. This is
  the app's own behavior today for every document, so it is faithful output, not a defect of this
  plan. Noted here so a reviewer does not read it as a wrong preset. If a named preset is wanted,
  that is an engine change (`stateOf` threading `name`) with its own ticket and would bump every
  Radix/Panda export's bytes.

## Rollback

- Steps 1 to 5 are branch-local: delete the branch.
- Step 6 after merge: a revert PR removing the generator, the `package.json` chain entries, the
  two artifacts, the test file and its `run.mjs` line. The drift gate then passes again because
  nothing regenerates the removed files.
- Step 7: tags are never moved or deleted once pushed (a consumer may have pinned). A bad artifact
  gets a new patch/minor version and a new tag; the old tag stays and its hash stays true for the
  bytes it named.
- Step 8: a correcting comment on #618, never an edit of the original.

<!-- LIVING STATE: one canonical copy. On completion: status flip to complete, R-3's measured
     hashes replaced by the committed whole-file hashes, file moved to docs/plan/archive/. -->
