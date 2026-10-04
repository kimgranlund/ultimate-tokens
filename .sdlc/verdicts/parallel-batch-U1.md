---
kind: verdict
plan: parallel-batch
unit: U1
seat: verifier
pass: 1
ticket: "#786"
written: 2026-10-04
---

# parallel-batch U1 · pass 1 · 🟢 at `6017e1ad`

verdict: 🟢
sha: 6017e1ad

Unit `unit/pb-U1` at `6017e1ad` (content `46e04538`, builder handoff `cb5051f2`, reviewer record on top), base `61bcd123`, issue #748 item 1 and #796's marketing lines, criteria C1.1 to C1.5 at plan revision 2. Builder `pb-U1-builder-l2-p1` (sonnet, marketing-manager-agent); checker the Verifier seat itself at grade L2 (opus), so the checker sits outside the builder's family. Reviewer-l3 record PASS with five low findings. Preflight: `verdict.py check` exits 0 on the request. Every run is the seat's own, in a fresh clone at `6017e1ad` under the job dir; the root and `.worktrees/pb-U1` were only read. Load was 25 to 46 during `npm test`, so no row is a timing row.

## Rows

| Criterion | State | Evidence | Negative control |
|---|---|---|---|
| `ran` block reproduces | 🟢 | the handoff's `~~~sh ran` block, extracted and rerun with `bash` at `6017e1ad`: `diff` against `~~~out ran` differs on line 1 only (`46e04538` vs `6017e1ad`), the difference the handoff declares; porcelain `0` after | the block plants its own U+2014 in `landing.md` and reads `exit 1`, then restores it; my ledger and marker mutations below each changed the output |
| C1.1 no stale voice count | 🟢 | `grep -rn "eleven" docs/marketing \| grep -ic voice` `0` at head | the same count at base `61bcd123` is `4` (rerun line 2 of the block) |
| C1.2 `fix-old-names` markers survive | 🟢 | `grep -c "fix-old-names: keep" docs/marketing/product/claude-plugin.md` `3`, base `3`, at lines `19 33 60` | marker stripped from `:19` in the clone: count `2`; restored |
| C1.3 em-dash clean, 15 voices | 🟢 | `em-dash: clean`; `makeVoices()` `15`; `landing.md:41` `15 voices`, `claude-plugin.md:19`, `:60` `15-voice`, `boilerplate.md:38` `15 type voices` | a U+2014 appended to `landing.md`: `exit 1`, the gate names `landing.md` once |
| C1.4 scope | 🟢 | `git diff --name-only 61bcd123 6017e1ad`: `boilerplate.md`, `claude-plugin.md`, `store-copy.md`, `web/landing.md` under `docs/marketing/`, plus `.sdlc/handoffs/parallel-batch-U1.md` and `.sdlc/reviews/parallel-batch-U1-review.md` | a path outside `docs/marketing/**` would print as an extra line; none does |
| C1.5 voice verdict and claims ledger | 🟢 | the handoff carries a per-line rubric table (kept or polished, with reasons) and an 85-row `## Claims` ledger; the block's perl reader prints `claims rows 85 fail 0`; `voice-check exit 0`; `branding: clean` | the first `present` needle mutated to `ZZGate every edit with the` in the clone: `FAIL present docs/marketing/store-copy.md: ZZGate every edit with the (0)`, `claims rows 85 fail 1`; restored |
| Claim-changing edits stay inside the record | 🟢 | `landing.md:41` now `15 voices from display to fine print, 5 treatments`: `fact-sheet.md:22` pins **15** voices starting at Display, `:23` pins **5** type treatments. `landing.md:52` now `can't drift from each other`: `voice-platform.md:57` states the thesis as `Exports don't drift from each other` | the base text `eleven voices` and `cannot drift` contradict `fact-sheet.md:22` and `voice-platform.md:57` respectively, so the same comparison reads false at base |
| `npm test` | 🟢 | clean clone at `6017e1ad`, NODE_OPTIONS unset: rc 0, `✓ all 54 test files passed`, porcelain `0` | `repo/em-dash.mjs` runs inside the suite, and C1.3's plant makes it exit 1 |

## Findings

- 🟡 `store-copy.md:608` and `:660` still name `src/ui/app.js` for the account microcopy that lives in `src/ui/overlays/settings.js`. Both references predate the unit (base `:605`, `:657`), so this is a follow-up, not a defect of U1.
- 🟡 The reviewer's other low findings (`$19 / seat / year` spacing at `store-copy.md:188`, lowercase `light and dark` at `store-copy.md:133` and `boilerplate.md:28`, `:37`, a skipped table label in the handoff, the receipt sign-off line break) are style nits for a follow-up. The builder's four open items (settings.js `hosted MCP` tense, voice-check numerals, the platform's `em-dash form` wording, the live store walk) are outside the lane, as the request says.
