---
kind: verdict
plan: bold-labels
seat: verifier
pass: 1
ticket: "#752"
written: 2026-09-29
---

# Pre-PR · bold-labels · pass 1 · 🟢 at `852e8c81`: every plan and unit row holds at the head, the gates and CI are green, and the yellows are plan text, the PR body and inherited or remedied history

Closes #752

verdict: 🟢
sha: 852e8c81b4630c8959721c33b89f0d61ddd2f703
version: n/a (a plan landing, no release)

`plan/bold-labels` at `852e8c81` (PR #763, draft), revision 6 (owner answer A, R73) on merge `f1bad822` (`816ede4c` + main `9e22b088`). `B` = `9e22b088`; `git diff --name-only 9e22b088 origin/main -- . ':!.sdlc'` is empty. Checkers in fresh context: verifier-l2 for the gates, unit rows, build, smoke and CI (fresh clones), and reviewer-l3 for the whole plan diff (PASS), standing in for verifier-l3 and reviewer-l4 while fable is capped (b9044bb). The seat re-read CI and the head, and spot-checked the reviewer's near misses and the plan's lane line.

### Yellow

| id | criterion | state | evidence | negative control |
|---|---|---|---|---|
| PR | the PR title and body match Landing | 🟡 | title equals Landing; body unit table reads `U1 ... 🔵 with the Verifier`, `U3 ... ⚪ after #761 and #753 land`, `the seven lines`, `no generated file` | the plan's own Units list reads `[x] U1`, `[x] U2`, `[x] U3`, and the diff carries `figma/plugin/ui.html` and `src/ui/mcp-assets.js` |
| LN | the plan's text is true at the head | 🟡 | `lane: docs (... no generated file)` (`bold-labels.md:5`) and Landing's `The prose-only diff regenerates nothing` are false: the bundled `mcp/README.md` regenerates the two files P4 admits (revisions 3 and 5); the Summary and Units checklist still say `seven lines` (six since #761) | P4's own cell names the pair, so the plan contradicts itself |
| NM | near misses of the ticket's defect | 🟡 | the predicate `^\s*\*\*[^*]+\*\*, ` skips a label with a parenthetical before the comma; five lines carried the dash at `37b04676^` and now read as lists: `ui-plan.md:148` `**Ramps** (default), swatch grids`, two lines above this plan's `**Analysis**:`; `store-copy.md:407` ``**`checkout_data`** (prefill + pass-through), set``; `knowledge-04-export-formats.md:363,375,389` | outside the plan's enumerated scope (it scoped to the predicate); P1 `17 kept-exact` is not affected |
| MG | every plan-branch merge equals `git merge-tree --write-tree p1 p2` | 🟡 | six of eight EQUAL (`f1bad822`, `3f3f3c9e`, `b4d50ae5`, `aa60de32`, `575e8334`, `3b235bd2`); `5096d7fe` DIFF (conflicts in board, `02-sections-and-resolvers.md`, `ui.html`, `mcp-assets.js`; it took main's copy of the review file, colon count `13` to `2`, restored at `7c355327`, `13` at the head); `0b551835` DIFF in `.sdlc/board.md` and the plan file only | wrong parent on each EQUAL merge prints a different tree; `git diff --stat f1bad822 852e8c81` is `.sdlc/` only |
| CK | every `sh .sdlc/checks/*.sh` | 🟡 | four exit 0 (`stale total: 0`, `stale total: 0`, `bad 0`, `bad 0`); `card-source-range` `range mismatches: 3`, exit 1 | inherited: `3` on origin/main and at `33bd8920` (#701's squash), `0` at `33bd8920^` |
| RC | records follow the plan's own rules | 🟡 | the Prompt line in `mcp/README.md` swaps two marks (``**Prompt**: `apply_brand`, how to apply``), disclosed in the U1 handoff, not in the plan table; five ruled-colon lines now read with two colons (e.g. `**Ghost / text button**: text-only: text`); `.sdlc/handoffs/bold-labels-U2.md` adds four bold labels (`**U2-1**` to `**U2-4**`) | each parses; no gate reads `.sdlc/` for bold labels (P3 excludes it) |

### Green

| id | criterion | state | evidence | negative control |
|---|---|---|---|---|
| P0 | #761 and #753 landed | 🟢 | `MERGED` `MERGED`; `fc839d14`, `ed759f6a` ancestors of the head | at `fb84cc29`: `not-ancestor`, exit 1 |
| P1 | the predicate finds exactly the kept list | 🟢 | `17` then `kept-exact` | `**Probe**, a planted line` in README.md: `18`, `17a18 > README.md	**Probe**` |
| P2 | no em dash added | 🟢 | `em-dash: clean (983 files scanned)`, exit 0, added `0` | a planted glyph: `FAIL: 1 em dashes outside inline code spans in 1 files`, exit 1 |
| P3 | branding clean, no bold label added | 🟢 | `branding: clean (975 files scanned)`, added `67`, removed `68` | a planted `**Planted**: text`: `68` and `68` |
| P4 | scope wall | 🟢 | first count `0`; second `2`, the admitted `figma/plugin/ui.html`, `src/ui/mcp-assets.js` | a planted `docs/spec/planted.md`: `1` |
| P5 | line for line | 🟢 | `line-for-line` | a split Resources line: `UNEQUAL 3	2	mcp/README.md`, exit 1 |
| P6 | `npm test`, no node_modules, tree clean | 🟢 | `✓ all 54 test files passed`, exit 0, `0` | `"scrimX`: `✗ 1/54 test file(s) failed`, exit 1 |
| P7 | three customer-facing lines | 🟢 | `1`, `1`, `1` | on origin/main: `0`, `0`, `0` |
| P8 | live URL count holds | 🟢 | head `3`, base `3` | URL dropped: `2` |
| U1 | U1-1 to U1-5 | 🟢 | U1's files `30` then `3` (B4 already a colon since #753); `17`, `10`; `12`; `10`; plugin parity `3` pass | row 31 restored: `67` then `2`; K18 dropped: `16`, `9`; `53 semantic roles` to `54`: `▶ plugin/color-tokens.mjs  FAIL` |
| U2 | U2-1 to U2-4 | 🟢 | `32`, `0`, `0`; voice-check silent, exit 0; `blocks-identical`; Placeholders `1` | line 632 back to a comma: `31`; `leverage` planted: `banned lexicon`, exit 1; a fenced line changed: no `blocks-identical` |
| U3 | U3-1 to U3-3 | 🟢 | `17 kept-exact`; `1 1 1 1 1 0 2` (row 5 gone at `fc839d14`); `0 0 0` | at `$B`: `0 1 0 0 0 0`; a `description:` edit: `2` |
| BD | `npm run build` after `npm ci`, tree clean, KB agrees | 🟢 | `wrote figma/plugin/ui.html 4137.0 KB`, exit 0, `0`, `ok    ui.html: baseline 4137.0 KB, tree 4137.0 KB` | P6's scrim control reds the shared gen chain; the clean tree after the build proves the committed pair equals the regenerated one |
| SM | `npm run smoke` in real Chrome | 🟢 | `SMOKE PASS, gallery · category · editor · export dialog all render in a real browser`, exit 0 | smoke's own failing path was not planted; its green stands with the build's clean tree |
| CI | required jobs green on the head | 🟢 | `gh pr view 763` (seat read) headRefOid `852e8c81b4630c8959721c33b89f0d61ddd2f703`: `build-test`, `panda-smoke`, `corpus-contrast` and all seven `sweeps (...)` `SUCCESS`, `deploy=SKIPPED` | the evidence run's first read showed `IN_PROGRESS` rows, so the rollup reports non-final states |
| RV | whole-diff review | 🟢 | reviewer-l3: `PASS`; every changed token is `**,` to `**:` except the planned rewrites and the Prompt swap; the 17 kept lines untouched; frontmatter untouched | the reviewer's near-miss sweep found the NM lines above, so the read does separate |
| UV | unit verdicts | 🟢 | U1 🟡 pass 2 (cleared), U2 🟢, U3 🟡 pass 2 (cleared); U3's two yellow rows (P1 `17`, P4) read 🟢 above under revision 6 | U3 pass 1 recorded 🔴, so a non-green state is written when one exists |

### Findings

1. 🟢 Landable: no row is red. Every plan and unit row, `npm test`, build, smoke and CI hold at `852e8c81`.
2. 🟡 PR: the Orchestrator's landing step replaces the body with this record's table (adapter §2.1); the current body misstates the unit states and the generated files.
3. 🟡 LN: the plan's `lane:` line, Landing sentence, Summary and Units checklist should say the diff regenerates `ui.html` and `mcp-assets.js` and that U3 edits six lines. The baseline conclusion in Landing (close-out re-runs `npm test`, `ref` to the squash) still holds.
4. 🟡 NM: five labels behind a parenthetical still read as lists. Two sit in files this plan edits (`ui-plan.md:148`, `store-copy.md:407`); file a follow-up for all five, or fix the two here under a revision (which would move the head and need a pass 2).
5. 🟡 MG: `5096d7fe` was a conflicted merge whose resolution dropped U1's 11 colons; `7c355327` restored them and U1-3 reads `12` at the head. Recorded, remedied.
6. 🟡 CK: `card-source-range` exit 1 is inherited from #701.
7. 🟡 RC: the Prompt swap, the double colons and the U2 handoff's bold labels are text taste and record hygiene, not criteria failures.
