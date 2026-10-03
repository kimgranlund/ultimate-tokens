---
kind: verdict
plan: md-prefix
unit: U2
seat: verifier
pass: 1
ticket: "#791"
written: 2026-10-03
---

# md-prefix U2 · pass 1 · 🟡 at `30d8a33e`

verdict: 🟡
sha: 30d8a33efae90ad8addc03c8e76847cfafd8c23f

`unit/md-U2` at `30d8a33e`, base `f3661dbe` (the merge-base with plan/md-prefix). Graded against plan rows C2.1, C2.3 and C2.4 (C2.2 was dropped in revision 1), the U2 units line, and the plan's lane (`git show f3661dbe:.sdlc/plans/md-prefix.md`). The plan is at its revision cap, so the weak C2.3 count is recorded as a finding and no revision is requested.

The builder was builder-l1 (sonnet). The checker was verifier-l2 (opus, high), working in a fresh context outside the builder's model family.

Preflight: `verdict.py check` exited 0 on the handoff, which the unit created. The review `/Users/kimba/.claude/jobs/8c58a81c/tmp/md-U2-r/review.md` fails the shape check (line 19: the evidence column is headed "Command and result", not "Evidence"). The handoff does not cite it and nothing here relies on it. The reviewer-l3 PASS was read but not used as evidence. The seat re-checked the C2.3 `#791` needle and the knowledge-02 hunk itself.

## Rows

| Criterion | State | Evidence | Negative control |
|---|---|---|---|
| Gate: `npm test` + clean tree | 🟢 | `npm test` rc=0, last line `✓ all 54 test files passed`; `git status --porcelain` after it: empty | U+2014 appended to `plugin/ultimate-tokens/README.md`, `npm test` rc=1: `▶ repo/em-dash.mjs FAIL` · `✗ 1/54 test file(s) failed`; restored, porcelain empty |
| C2.1 no `md-sys` in plugin, skills, marketing | 🟢 | `git grep -c md-sys -- plugin .claude/skills docs/marketing`: no output, rc=1 (merge-base `f3661dbe`: 13 files hit, matching the plan's "13 files") | `token-integrator.md` Material root put back to `--md-sys-color-*`: `plugin/ultimate-tokens/agents/token-integrator.md:1`, rc=0 |
| C2.3 CHANGELOG Unreleased slice | 🟡 | awk Unreleased slice: `grep -cF -- '--md-*'` = `3` (merge-base `0`); `grep -c md-sys` = `0` (merge-base slice held 2, lines 448-449) | second half bites: old note restored from merge-base, `grep -c md-sys` = `2`. First half does NOT bite as written: new #791 entry dropped, `grep -cF -- '--md-*'` = `1`, not the plan's `0` (the rewritten naming-scheme note also carries `--md-*`). The suggested needle bites: same slice `grep -c '#791'` = `1` at head, `0` with the entry dropped |
| C2.4 em-dash + branding gates | 🟢 | `node test/repo/em-dash.mjs` rc=0 `em-dash: clean (1128 files scanned)`; `node test/repo/branding.mjs` rc=0 `branding: clean (1120 files scanned)` | U+2014 appended to plugin README: em-dash rc=1 `FAIL: 1 em dashes outside inline code spans in 1 files`; the retired maker brand's uppercase form appended to the same README: branding rc=1 `FAIL: 1 branding violation(s) across 1120 files`; both restored |
| U2 lane (`git diff --name-status f3661dbe 30d8a33e`) | 🟡 | `16 files`: 6 under `plugin/ultimate-tokens/`, 2 under `.claude/skills/geometry-system/`, `CHANGELOG.md`, 5 under `docs/marketing/`, `.sdlc/handoffs/md-prefix-U2.md`, plus `M docs/reference/references/knowledge-02-tonal-scale.md` | out-of-lane file: knowledge-02 section 8.4 is in U1's line, not U2's (see Findings); every other path maps to the U2 line `consumer plugin, geometry-system skill, CHANGELOG, marketing corpus` |
| Facts the new CHANGELOG entry states | 🟢 | head: `src/engine/exports.js:55 EXPORT_SCHEMA_VERSION = 5`; `mcp/brand-kit-core.mjs:15 version: "0.5.0"`; `src/ui/persist.js:382 CURRENT_SCHEMA_VERSION = 7`, `:430 from: { colorPrefix: "md-sys-color", ... }` (the v7 rewrite the entry describes) | entry claims `brand-kit/5`, `0.5.0`, "v7 hydrate rewrite": a mismatch on any of the three greps would contradict it; none does |
| No stray old names outside ratified history | 🟢 | `git grep -l md-sys` excluding the plan's named history paths and `docs/tickets`: only `.sdlc/` records of this plan, `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js`, `src/ui/persist.js`, `test/ui/persist.mjs` (all U1's pinned RENAME_MAPS sites) | covered by C2.1's control for the U2 lanes; the remaining hits are U1-owned and pinned by C1.1/C1.2 |

## Findings

- 🟡 C2.3 first count is weak, confirmed. As written, `grep -cF -- '--md-*'` reads `1` with the new #791 entry removed, because the rewritten "Configurable token naming scheme" note (Unreleased, ~line 455) also contains `--md-*`; the plan's control ("drop the new entry: first reads 0") does not hold. The unit itself satisfies the criterion's intent: the entry exists, and a `#791` needle on the same slice reads `1` and goes to `0` when the entry is dropped. Plan at revision cap, so recorded as a finding, not a revision request; a future plan should pin the ticket number, not the family glob.
- 🟡 Lane drift: `docs/reference/references/knowledge-02-tonal-scale.md` is in U1's unit line, not U2's. The edit is one phrase ("Two bumps landed after v4, both adding" to "Three bumps landed after v4: two added") and it is a correct repair: at the merge-base the paragraph said `CURRENT_SCHEMA_VERSION` is 7 yet counted two bumps after v4 while also describing v7, an internal contradiction U1 left. Content verified correct at head (`sed -n 386,397p`). Accept as a stale-record repair, but it is an unplanned file in U2's diff.
- 🟡 Process deviation: the U2 line says "marketing corpus via `marketing-manager-agent`"; the builder edited the 5 marketing files directly and did not dispatch the agent, reasoning that only token spellings changed. Verified by diff: each of the 7 marketing hunks swaps only the token spelling (`--md-sys-*` to `--md-*`; fact-sheet row also `--md-color-*` / `--md-typescale-*`), no count, price, tier or sentence reworded. Low risk, but the named route was skipped.
- Note: the CHANGELOG rewrite of the older naming-scheme note (originally #189/#191) is inside `## [Unreleased]` (which runs to line 729), so the plan mandates it; not a history rewrite under the plan's terms.
- Note: `plugin/ultimate-tokens/.claude-plugin/plugin.json` description changed but `version` stays `0.2.1`; `npm test` (including the plugin parity legs) is green, and the plan sets no plugin version criterion.
- 🟡 The reviewer-l3 review file fails `verdict.py check` (line 19: no Evidence column). It is shape only, but a review the next pass might cite should carry the standard column.
- Note: the knowledge-02 hunk repairs the "Two bumps" sentence that `.sdlc/verdicts/md-prefix-U1.md` named as a finding.
