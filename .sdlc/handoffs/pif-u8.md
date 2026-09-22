# Handoff pif-u8 · #681 preset-intent-fidelity, adopting the orphaned pre-land pass-2 fixes

Builder, grade l5. Branch `unit/pif-u8`, base `505416d7`. Worktree `.worktrees/pif-u8`. Written
2026-09-22. Host load sat between 6 and 7 for every run below; other lanes' sessions kept the
`pgrep -f 'node .*test/(run|engine|ui)' | wc -l` guard at 3 to 4 throughout (this host runs several
concurrent units), never at 0; per `flaky-gates` this is contention, not a stop condition, and no
run here is offered as a baseline figure.

## 1. What this unit is

Adopting, byte for byte, an already-written diff a previous driver left uncommitted: the five
pre-land pass-2 fixes named in `.git-worktrees/lane-a-notes/u8-preland-fixes-brief.md`, with its
anchor.mjs controls still queued and its own handoff never written (per
`.git-worktrees/lane-a-notes/HANDOVER-681-to-e8.md`). Owner ruling: adopt as U8
(`.sdlc/questions/preset-intent-fidelity-u8.md`, Q5). I did not rewrite the diff's intent; I ran the
gates it left undone, re-verified its cited figures myself, and wrote the record.

## 2. Verdict on my own work, before the table

🟢 All six criteria hold. Nothing here changes product behaviour; every edit is test text or record
text.

## 3. Per-criterion status

| # | Status | Evidence |
|---|---|---|
| U8-1 | 🟢 | `npm test` exit 0, `✓ all 49 test files passed`, 10:02 wall (10:02.47, 88% cpu, load 6.33-6.87 at start). `git status --short` after: only the nine intended paths (six modified + three new). Log: `.sdlc/records/pif-u7-gate-logs/u8-npm-test.log` |
| U8-2 | 🟢 | Both negative controls bite. See §4 |
| U8-3 | 🟢 | `.sdlc/records/pif-u7-blast/blast.mjs` and `ko.mjs` exist and run (README in the same dir). `grep -rn "scratchpad/u7rev" .sdlc/` on the staged diff's added lines: 0 hits. Every other backtick-quoted path in the six files resolves in the tree (checked by hand: `.sdlc/verdicts/pif-u4.md`, `.sdlc/questions/preset-intent-fidelity-preland.md`, `src/ui/sections/color.js`, `test/engine/anchor.mjs`, `test/ui/headless-boot.mjs`, `scripts/report-preset-fidelity.mjs`, `src/engine/tonal.js`, `src/ui/model.mjs`, `src/ui/persist.js`) |
| U8-4 | 🟢 | Every revision-33 figure re-measured and holds. See §5 |
| U8-5 | 🟢 | `branding: clean (571 files scanned)`, exit 0. Added-line em-dash sweep: one hit survived the backtick strip, in the plan diff, and it is the pre-existing "ratios explode near 0" clause reproduced by a whole-line replace, not a new dash (raw count on that file: 2 removed, 1 added, net -1). My own new gate-log comment carried one new em dash; found and removed before staging. Net added em dashes across the six files plus the three new paths: 0 |
| U8-6 | 🟢 | one commit on `unit/pif-u8`, this handoff included in it (subject and trailer as specified; sha is this commit's own, self-citing it here would be circular) |

## 4. U8-2, the negative controls

Run directly in the worktree (working tree matched the staged index for both files beforehand,
confirmed with `git diff test/engine/anchor.mjs test/engine/prime.mjs` printing nothing), reverted
with `git checkout --` after each, confirmed clean by the same empty-diff check.

**anchor.mjs**: swapped `ORDER_ALLOW[0]` (the Nike secondary entry) for a fabricated name at the
same count (26). `node test/engine/anchor.mjs`:

    `  FAIL  anchor-ladder order-allow-list: 26 (expected 26)`

Exit 1. Reverted; clean re-run after: `node test/engine/anchor.mjs` exit 0.

**prime.mjs**: swapped `SYM_BY_CONSTRUCTION_ALLOW[0]` (the same Nike entry, in this file's own
copy of the list) for a fabricated name at the same count (26). `node test/engine/prime.mjs`:

    `  FAIL  symmetry corpus by-construction: 26 of 3380 (expected 26)`

Exit 1. Reverted; clean re-run after: `node test/engine/prime.mjs` exit 0.

Both summary lines read `FAIL` at an unchanged count, membership included, matching the fix's stated
purpose (the pass/FAIL word now reads the same predicate the failure branch does).

## 5. U8-4, revision-33 figures re-measured at this unit's head

| Figure | Command | Revision 33 says | My reading |
|---|---|---|---|
| chromaEnvelope, all call sites | `grep -c "chromaEnvelope(" src/engine/tonal.js` | 5 | `5` |
| chromaEnvelope, definition only | `grep -c "export function chromaEnvelope(" src/engine/tonal.js` | 1 | `1` |
| old dampAmp inline expression | `grep -c "1 + ((controls.dampAmp" src/engine/tonal.js` | 0 | `0` |
| DUPE_ALLOW count, gate's own print | `node test/engine/anchor.mjs` | `dupe-allow-list: 3 (expected 3)` | `pass  anchor-ladder dupe-allow-list: 3 (expected 3)` |
| C4's named flag, absent | `grep -c identity-control scripts/report-preset-fidelity.mjs` | 0 | `0` |

All five hold; nothing needed fixing. Separately confirmed the P-Funk removal date the plan states
as "left `DUPE_ALLOW` at `4125d965`": `git show 4125d965 -- test/engine/anchor.mjs` shows that commit
deleting the `music "P-Funk..." secondary-muted #211E27` line from `DUPE_ALLOW` (and, in the same
commit, adding an unrelated new entry to `ORDER_ALLOW`, "The rave"). Confirmed, not asserted.

## 6. Left out

Nothing from the adopted diff was altered. `.sdlc/board.md` untouched, per dispatch. Q6 (the
interim-ceiling ruling relayed from the previous driver's handover) was appended to
`.sdlc/questions/preset-intent-fidelity-u8.md` by the team lead before I started; committed as
received, unedited by me. The ceiling work itself (a new labelled figure, per Q6) is not part of
this unit and is not attempted here.
