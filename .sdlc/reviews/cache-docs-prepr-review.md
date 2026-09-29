PASS

# cache-docs pre-land review (#750)

Reviewed `plan/cache-docs` at `99219abb` (draft PR #760) against `origin/main` at `b466c386`, in fresh context,
with `git -C .worktrees/plan-cache-docs` only; nothing edited in the worktree, no `npm test`/`npm run build` run
(the Verifier seat reruns the gates). Plan: `.sdlc/plans/cache-docs.md` revision 4; unit verdict
`.sdlc/verdicts/cache-docs-U1.md` (pass 2 🟢 at `127fef33`).

## Doc claims against the live engine

Read the source in the plan worktree, not the handoff's quotes.

| Doc line | Claim | Source | State |
|---|---|---|---|
| `docs/reference/references/knowledge-01-color-engine.md:131` | `maxChromaInGamut` keyed `hue + "|" + tone`, exact float, `boundedCache(CACHE_CAP)` | `src/engine/hct.js:313` `_mc = boundedCache(CACHE_CAP)`, `:316` `const key = hue + "|" + tone;` | 🟢 |
| `knowledge-01-color-engine.md:139` | `peakC` keyed `String(hue)`, the shared-bucket order dependence #686 fixed | `hct.js:339`, `:341` `const key = String(hue);`; the `#686` comment block at `hct.js:269` to `:311` describes the same defect | 🟢 |
| `knowledge-01-color-engine.md:155` | `oklchToCam16Hue` memoizes by `target + ":" + cf`, wrapped hue and clamped fraction | `hct.js:368` to `:372`: `target = ((h % 360) + 360) % 360`, `cf = Math.min(1, Math.max(0, chromaFrac))`, `const key = target + ":" + cf;` | 🟢 |
| `knowledge-01-color-engine.md:181` to `:182` | three exact-float keys, each `CACHE_CAP` bounded; the `tonal.js` memo before `okhslLAt` is gone (#738) | `hct.js` has exactly three `boundedCache(CACHE_CAP)` sites; `tonal.js:926` "okhslLAt is pure, with no cache (#738)", no `Map` in front of `:929` | 🟢 |
| `.claude/skills/geometry-system/references/best-practices.md:78` | color engine keys on the exact float; type engine keeps no cache | `type.mjs:519` and `geometry.mjs:325` hold the only `toFixed` (the rem/em unit formatter); no `new Map`, no `boundedCache` in either | 🟢 |

## Stale-claim sweep elsewhere

`grep -rn 'toFixed(2)|toFixed(3)'` over `docs/`, `.claude/skills/`, `plugin/`, `mcp/`, `README.md` (archives
excluded) prints one hit: `docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md:71`, the
`_okL` line the plan's Not in scope table assigns to chroma-floor cf-U1. `0.01°`/`within 0.01` prints nothing.
`color-math/SKILL.md:91` and `color-math/references/best-practices.md:66` already say exact float and no cache
(okl-memo). `00-synthesis.md:89` is already repaired. No other stale line found.

## Gates and hygiene at the head

| Check | Result | State |
|---|---|---|
| em dash (U+2014) on added lines, whole diff | `0` | 🟢 |
| `node test/repo/em-dash.mjs` in the worktree | `em-dash: clean (797 files scanned)` | 🟢 |
| `node test/repo/branding.mjs` in the worktree | `branding: clean (789 files scanned)`; no maker brand or pre-rename identifier in any added `.sdlc` line | 🟢 |
| `node test/repo/citations.mjs` | `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 99219abb)` | 🟢 |
| `sh .sdlc/checks/verdict-frontmatter-check.sh` | `verdicts 164 graded 164 bad 0` | 🟢 |
| `card-amendment-check.sh`, `card-source-range-check.sh` | `stale total: 0`, `range mismatches: 0` | 🟢 |
| `baseline-agrees-check.sh`, `doc-drift-rows-check.sh` | `stale total: 1`, `bad 1`; the same figures the U1 verdict's K row reads on main (R53, DD9), carried, not this plan's | 🟡 carried |
| scope wall (P4 filter over `git diff --name-only`) | seven paths, all inside the admitted set: the two doc files, `.sdlc/board.md`, and the plan's own plan/handoff/questions/review records; nothing under `src scripts test figma mcp plugin package.json` (P2 `0`, so build and smoke are not owed) | 🟢 |
| numstat on the two doc files | `1 1 best-practices.md`, `5 5 knowledge-01-color-engine.md` (U1-4's shape) | 🟢 |
| bold inline labels on added lines | none (the `**Memoized**` at `knowledge-01:131` is the pre-image's) | 🟢 |
| commit hygiene | 14 commits, all `(#750)` or a merge subject; every Orchestrator commit carries `Seat: orchestrator`; builder commits carry none (as expected); no em dash in any message | 🟢 |
| integration with `origin/main` | `plan/cache-docs` is one commit behind `origin/main` (`b466c386`, the board mirror of the U1 🟢 row); `git merge-tree --write-tree origin/main plan/cache-docs` exits `0` and the `cache-docs` board rows are byte-identical on both sides, so the squash lands clean without another sync | 🟢 |

## Findings, ranked

1. 🟡 `Closes #750` closes a ticket with one bullet still open on this branch. `#750`'s first stale line
   (`04-context-and-messaging.md:71`, the `_okL` memo) is untouched here by design (plan Not in scope, Q1,
   R52) and belongs to chroma-floor cf-U1; `#701` is OPEN today with no PR from `plan/chroma-floor` yet. The
   PR body the lead is rewriting should say the `_okL` line lands with chroma-floor (#701), so the closed
   ticket is not read as a claim that all three lines are repaired. No change to this branch.
2. 🟡 Known: PR #760's title is `plan/cache-docs` and its body is empty; the plan's Landing wants
   `docs(engine): the cache-key lines say exact float, #686 (#750)` and `Closes #750`. The lead is fixing it
   separately; recorded here so the pre-land record can cite it.
3. ⚪ Cosmetic: `knowledge-01-color-engine.md:139` and `:182` run well past the file's ~100-column wrap.
   U1-4's `5 5` numstat left the builder no room to re-wrap; a later editing pass may rewrap them without any
   claim changing.
4. ⚪ Cosmetic: the §8 pseudo-code (`knowledge-01-color-engine.md:150` to `:156`) uses `target` and `cf`,
   which the block's signature `oklchToCam16Hue(h, chromaFrac=1)` does not declare; the trailing comment on
   line 155 defines them, so a reader is not lost.
5. ⚪ `.sdlc/board.md`'s `cache-docs U1` row pins `plan/cache-docs @ 8f8325af`; the head is `99219abb`. The
   Orchestrator's landing step rewrites that row anyway.

## Verdict

The five rewritten lines are true of `hct.js`, `tonal.js`, `type.mjs` and `geometry.mjs` as they stand, cite the
right rulings (#686, #738), no other stale `toFixed` cache claim survives outside the file chroma-floor owns,
every prose and record gate is green at the head, the scope wall holds, and the branch merges clean onto
`origin/main`. PASS, with the two 🟡 items for the lead's PR-body rewrite.

verdict: 🟢
sha: 99219abb654b78ef46f9eebaf761725a27ed4e0b
