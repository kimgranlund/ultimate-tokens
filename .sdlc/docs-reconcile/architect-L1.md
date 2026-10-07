<!-- role=architect level=L1 model=fable effort=high -->
## Approach

The discriminator is who resolves a path at run time. Docs content splits into two tiers. Tier A is the data that code, generators and a shipped artifact read at an exact repo-relative path: `docs/reference/data/*` (6 files) and `docs/reference/colors/categories/*.json` (8 files). These stay put. `docs/layout.md` lists `reference/` under Homes with a Kinds row bound to kind `assets`, which clears D-1 and D-9 for the folder with zero consumer churn. Tier B is everything else (99 files). It moves by `git mv` into the standard homes, and all Markdown leaves `docs/reference/`, because an assets-kind home rejects Markdown.

Tier B is split by kind only where the form is unambiguous:
- Dated reviews go to `reports/`.
- The runbook goes to `guides/`.
- Closed plans and the ADR-017 ticket archive go to `archive/`.
- The preview SVG and the two unread token snapshots go to `assets/`.
- Clusters stay whole otherwise: the marketing corpus becomes `specs/marketing/`, the hosting specs become `specs/site/`, and the old `reference/references/` block becomes `references/`.
- `decision-records.md` stays one file in `references/`.

One move map drives everything: `.sdlc/docs-reconcile/decompose/move-map.tsv`, 113 rows. The moves are staged first as pure renames. Four rewrite slices then run in parallel, one writer per file: code side, agent side, docs-internal, and live `.sdlc` contracts. Generated artifacts are regenerated, never edited. `onboard.py setup` writes the entry files only after the moves are staged. A residue gate (old-prefix grep plus a basename sweep) proves no live file names an old path.

Finished run records are not rewritten: `.sdlc/{handoffs,verdicts,records,reviews,questions,plans}`, plus the bodies of `docs/archive/` and `docs/reports/`, existing changelog entries and existing ADR bodies. They stay resolvable through a path map published in `docs/reports/2026-10-06-docs-reconcile.md`, which also carries the `.sdlc` audit. A new ADR records the decision. The audit of the private docs folder is written inside that folder so it never reaches a commit.

Decomposition: `decompose/report.md`. Manifest: `.sdlc/docs-reconcile/decompose/manifest-v1.json` (technical-architecture, plan mode), coverage_check clean, quadrant load-bearing. I did not add the `Decomposition:` line to `handoff.md`, because this role writes only under `decompose/`.

## Interfaces

- **Move map:** `.sdlc/docs-reconcile/decompose/move-map.tsv`, `old<TAB>new` relative to `docs/`. It is the single source for the executor, the rewrites and the published path map. The folder rules are in `decompose/report.md`.
- **`docs/layout.md`:** add `` - `reference/` `` under `## Homes`, and one Kinds row with id `reference/`, kind `assets`, holding "data read at this exact path". Nothing goes under `## Legacy`.
- **New homes under `docs/`:** `specs/` (with topics `marketing/`, `site/`), `references/` (with topics `rubrics/`, `colors/`, `typography/`, `geometry/`), `reports/`, `guides/`, `assets/`, `archive/` (`plans/`, `tickets/`).
- **Renames inside the move:**
  - `reference/CHANGELOG.md` to `references/changelog.md`
  - `reference/SKILL.md` to `specs/spec-cell.md`
  - `marketing/INDEX.md` to `specs/marketing/index.md`
  - `reviews/2026-08-20-reactivity/INDEX.md` to `reports/2026-08-20-reactivity.md`, with its siblings as the evidence folder
  - `*.tokens.json` to `assets/{geometry,typography}-tokens.json`
- **Path-keyed lists, the first files the code rewrite touches:**
  - `test/repo/branding.mjs` RECORDS
  - `scripts/audit-citations.mjs` owner map and SKIP prefixes
  - `test/repo/citations.mjs` doc pins
  - `scripts/gen-preview.mjs` OUT
  - `README.md` image link
- **Plan-closure contract:** `.sdlc/plans/archive/` becomes the only live plan archive, and `docs/archive/plans/` is read-only history. This edits `.sdlc/adapter.md` section 5 steps 1 and 3 and row X10, `.claude/CLAUDE.md:103`, and `.claude/skills/project-docs/SKILL.md:27`.
- **Residue contract:** the regex and allowlist pathspecs are in `decompose/report.md`. Bare mentions of `docs/reference/` are triaged by hand.
- **New records:**
  - `docs/reports/2026-10-06-docs-reconcile.md` (path map plus `.sdlc` audit)
  - one ADR appended before the Quick map of `docs/references/decision-records.md`
  - a local-only audit file inside the private docs folder
- **Work tree:** `.worktrees/docs-reconcile` on `plan/docs-reconcile`. The five untracked onboard outputs are copied in and staged there. No task-folder `*.log` is copied.

## Constraints and assumptions

- The map plus the layout row reaches 0 errors: verified by a dry run on a temp copy with docs_check 0.20.11 (`0 errors, 18 warnings`, D-10 8, D-11 10).
- A Kinds row for a non-default home clears D-1, and kind `assets` clears D-9 for non-Markdown: verified by reading `docs_check.py:130-139,201-214,247-253` and by the dry run's `info D-1 docs/reference/: custom home bound to kind assets`.
- D-7 is silent today and fires after the move (8 folders): verified by the dry run.
- `onboard.py setup` creates nested entry files only for tracked or staged files: verified, since it created none until `git add -A`.
- `onboard.py setup` leaves the edited `docs/layout.md` alone: verified, `onboard.py check` printed `present docs/layout.md` and exited 0.
- `role-table.json` ships at its exact path in the Describe MCP download: verified by reading `src/ui/app.js:2498`, `scripts/gen-describe-mcp-assets.mjs:48` and `mcp/describe-kit-core.mjs:24`.
- Nothing reads the two `*.tokens.json` snapshots: verified by `git grep -E "(geometry|typography)\.tokens\.json" -- ':!docs' ':!.sdlc'`. The hits are a comment in `type.mjs:6` and export entry names.
- The spec cell `docs/reference/SKILL.md` is loaded by nothing in the repo: verified by `git grep hct-palette-generator-spec -- ':!.sdlc'` (docs hits only) and no symlinks. An external validator is unverified.
- Old paths in finished `.sdlc` records break no gate: verified, the only check that resolves a docs path is `.sdlc/checks/card-amendment-check.sh:6`.
- Most references are prose or backticked paths, not Markdown links, so D-10 cannot serve as the detector: verified, the unrepaired dry run shows only 8 D-10 warnings.
- No external URL hot-links `docs/img/palette-preview.svg`: verified inside the repo only; store pages and the hosted site are unverified.
- `docs/brand-assets/` holds no tracked or checker-visible file: verified by `git ls-files docs` and the checker output.
- Regenerating after source comment edits changes `src/ui/describe-mcp-assets.js` and `figma/plugin/ui.html`: unverified, inferred from their embedding of `type.mjs`.
- All predicates work on a staged, uncommitted tree: unverified for `npm test`'s own tree-clean step; the manifest compares `git status --porcelain` before and after instead.

## Rejected alternatives

- `## Legacy` globs over the old folders: passes the gate with zero moves, but the user chose full migration.
- Move Tier A into `docs/assets/`: churns about 25 literal paths across src, test, scripts, mcp, figma and plugin, about 10 regenerated artifacts, the shipped zip layout (`app.js:2498`) and the consumer plugin script (`role-parity.mjs:15`). The handoff prefers path preservation here. To flip it, change 14 map rows and drop the layout row.
- Keep `docs/reference/` whole as a custom home: one home has one kind, so either the Markdown or the data fails D-9.
- Split `decision-records.md` into `decisions/NNNN-*.md`: a content restructure that breaks the append contract in `.claude/CLAUDE.md`, the shipping skill, `card-amendment-check.sh:6` and `citations.mjs`. Better as a follow-up ticket.
- Rewrite every old path in all 343 `.sdlc` record files: the project rule says never rewrite a finished run record, and no gate reads them. The same rewrite tool does it if the user wants it, by dropping the allowlist.
- Rename the token snapshots in place under `reference/`: they have no reader, so they would make the Kinds row's "runtime-read" claim false.
- Keep `marketing/` or `img/` as extra custom homes: no code consumer justifies an exception.
- Re-home each `references/` document by reading it (several are specs by the schema's wording): not gate-checkable, and it multiplies rewrite rules. Listed as follow-up in the report.
- Wire `docs_check.py` into `npm test`: the gate is zero-dependency and CI has no plugin cache.

## Risks

- `reference/` and `references/` differ by one letter, and `colors/` exists under both. The mitigation is the Kinds row's `not` column and `docs/AGENTS.md` listing both. If the user finds this worse than the churn, flip Tier A to `docs/assets/`.
- Making `.sdlc/plans/archive/` the only plan archive edits a section recorded as a human ruling (`.sdlc/adapter.md` section 5). The branch being retired has no live files, but the user should confirm. The fallback is a path-only edit to `docs/planning/` and `docs/archive/plans/`, which collides with D-4: the schema's status enum has no `active`.
- The handoff says update every reference including `.sdlc/` records, and also says fix only what the move breaks. I took the second reading. About 343 record files keep old paths by design.
- Path-keyed exemption lists fail silently in the wrong direction. If `branding.mjs` RECORDS is not updated, the changelog and ADR file get scanned and go red. If the `audit-citations.mjs` SKIP prefixes are not updated, archived files get audited.
- Relative mentions with no `docs/` prefix (about 45 in the spec cell alone, more in skills) are caught only by the basename sweep; a missed one fails no gate.
- `npm test` in the main checkout is red right now. The branding gate walks the filesystem and this run's own log under `.sdlc/docs-reconcile/` quotes the gate's banned strings. The unit worktree will not contain it; the log must not be copied or committed.
- "Do not commit" conflicts with the usual worktree flow. The predicates are written for a staged tree, but the parent must decide whether local commits on `plan/docs-reconcile` are allowed.
- The n-moves predicate expects 99 `R100` renames and holds only if measured before any content edit.
- The marketing agent and voice skill resolve corpus paths at use time. A missed reference there shows up only when the agent next runs.

## Carry forward

- Move map `.sdlc/docs-reconcile/decompose/move-map.tsv`: 113 rows, 99 change, 14 stay; targets are archive 34, references 28, specs 20, reference 14, reports 13, assets 3, guides 1.
- Manifest `.sdlc/docs-reconcile/decompose/manifest-v1.json` (15 leaves with accept predicates, 15 edges); the residue regex and allowlist are in `decompose/report.md`.
- Dry run: map + layout row + `onboard.py setup --yes` on staged files gives `docs_check: 0 errors, 18 warnings` (`decompose/report.md`, Dry run).
- Checker mechanics: `docs_check.py:130-139` (custom homes), `:201-214` (D-1), `:247-253` (D-9), `:276-298` (D-12), `:310-327` (D-7); `onboard.py:200-203` (a Kinds id must be listed under Homes).
- onboard writes nested entries only for tracked or staged files, at 2+ documents: `onboard.py:652-676`, confirmed in the dry run.
- Shipped or runtime data path, unchanged: `src/ui/app.js:2498`, `scripts/gen-describe-mcp-assets.mjs:48`, `mcp/describe-kit-core.mjs:24`, `mcp/describe-rubric.mjs:30`, `plugin/ultimate-tokens/skills/color-tokens/scripts/role-parity.mjs:15`, `scripts/gen-categories.mjs:44`, `scripts/gen-adia-derived-exports.mjs:54,58`.
- Path-keyed lists to edit first: `test/repo/branding.mjs:48-49`, `scripts/audit-citations.mjs:109-110,117-122`, `test/repo/citations.mjs:52,85-91,105-106`; `test/repo/em-dash.mjs:46` stays valid.
- Other code-side paths: `scripts/gen-preview.mjs:18`, `README.md:20`, `.github/workflows/ci.yml:32,68`, `.sdlc/checks/card-amendment-check.sh:6`; `.gitignore:9` is already stale.
- Hand-written src comments citing moved docs: `src/engine/data-hues.mjs:2`, `exports.js:943,1068`, `type.mjs:6,17,67`, `src/ui/app-helpers.mjs:362,851`, `persist.js:705`, `sections/color.js:359` (search: `git grep -n -E "docs/(reference|site|lld|spec|marketing|tickets|plan|prd|img)/" -- src`, minus generated files).
- Plan-closure text naming `docs/plan/`: `.sdlc/adapter.md:179,190,192,244`, `.claude/CLAUDE.md:103`, `.claude/skills/project-docs/SKILL.md:27`.
- Frozen `.sdlc` files naming old docs paths: verdicts 101, handoffs 98, plans 52, records 47, reviews 34, questions 11 (search: `git grep -l -E "docs/(reference|site|lld|spec|marketing|tickets|plan|prd|img)/" -- .sdlc`, grouped by subdir).
- Spec cell `docs/reference/SKILL.md`: about 45 relative mentions of `data/`, `rubrics/`, `references/`; registered nowhere (search: `git grep hct-palette-generator-spec -- ':!.sdlc'`).
- The branding gate walks the filesystem (`test/repo/branding.mjs:41`); `.sdlc/docs-reconcile/architect-L1.log` fails it in the main checkout as of 2026-10-06.
- Untracked onboard output to copy into the worktree: `AGENTS.md`, `CLAUDE.md`, `docs/AGENTS.md`, `docs/CLAUDE.md`, `docs/layout.md`; delete the untracked entry files under the seven legacy folders (source: `git status --short`, 2026-10-06).
- Plugin root for the gate commands: `SDLC=/Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.20.11` (`handoff.md`, Goal).
