PASS

# Review · anchor-gaps U3 · pass 2 · `unit/ag-U3` @ `ab1a8710` (code `327eb6aa`, base `d017bbc9`)

| Field | Value |
|---|---|
| Seat | reviewer-l3 (Opus), fresh context, round 2 after the pass 1 FAIL |
| Criteria | `.sdlc/plans/anchor-gaps.md` revision 7: U3-1 to U3-6, P3, P4; pass 1 record `.sdlc/reviews/anchor-gaps-U3-review.md` findings 1 and 2 |
| Handoff | `.sdlc/handoffs/anchor-gaps-U3.md`, Pass 2 section |
| Where run | two `--shared` clones of `ab1a8710` under the job scratchpad (`c` green, `neg` controls); `neg` restored with `git checkout -- .`, `git status --short \| wc -l` read `0`; the worktree read `0` dirty before this record |
| `$B` | `5cdf9ed1` (`git merge-base origin/main ab1a8710`) |

## Verdict

Both pass 1 findings are fixed. The wiring revert now makes `npm test` exit 1 on a `gallery-reach` (k) FAIL, and the two comments name `serialize()`'s `schemaVersion 6` stamp as the second guard, which is true in code and is itself pinned by (k)'s second half. Every U3 row reads as the plan expects, apart from the two figures pass 1 already accepted as Deviations.

## Findings, ranked

1. 🟢 Pass 1 finding 1 is fixed. In clone `neg`, `src/ui/app.js:2371` put back to `const doc = hydrateStoredDoc(config);` and a full `npm test` printed `▶ ui/persist.mjs FAIL`, `FAIL  gallery-reach, (k) app.js openConfigAsSet must call hydrateConfig( and not hydrateStoredDoc(, read hydrateConfig false hydrateStoredDoc true`, `✗ 1/54 test file(s) failed`, `exit 1`. The check is at `test/ui/persist.mjs:745-751`. It reads the source (pass 1's option one), and the slice `"\n  openConfigAsSet("` to the first `"\n  }\n"` cannot match a `this.openConfigAsSet(` call site, so it reads the method body only.
2. 🟢 Pass 1 finding 2 is fixed, and the claim is true in code. `serialize()` returns `{ ..., schemaVersion: CURRENT_SCHEMA_VERSION }` (`src/ui/persist.js:488`, `CURRENT_SCHEMA_VERSION = 6` at `:377`). `openConfigAsSet` stores `serialize(doc)` and calls `this.openSet(id)` (`app.js:2376-2378`). `openSet` runs `hydrateStoredDoc(rec.doc)` (`app.js:205`), which calls `backfillDefaultAnchors` before `hydrate` (`app-helpers.mjs:210-213`), and that returns early at `schemaVersion >= 5` (`app-helpers.mjs:855`). The comments at `app.js:2362-2364` and `app-helpers.mjs:878-881` say this. Control: `>= 5` to `>= 7` at `:855` made `node test/ui/persist.mjs` print `FAIL  stored-anchors, (c) a doc already stamped schemaVersion 6 must not be backfilled, got 16 anchors` and `FAIL  gallery-reach, (k) Maison through hydrateConfig, serialize and hydrateStoredDoc must open Success unanchored, got "#21701A"`.
3. 🟡 For the Orchestrator, not the builder. Plan revision 7 still carries the two texts pass 1 flagged: U3-1's control (`.sdlc/plans/anchor-gaps.md:198`) says the wiring revert "reds U3-2", when the check that reds is `gallery-reach` (k). P4's fifth figure (`:165`) still reads `2`, when it reads `3` under `-U0` (Deviation 1, accepted in pass 1, re-measured below). Both are plan edits, outside the builder's wall.

## Evidence, at `ab1a8710`

| Row | Result | Expected | |
|---|---|---|---|
| P1 | `✓ all 54 test files passed`, `exit 0`, `0` dirty after (clone `c`, load 3.1) | green, tree clean | 🟢 |
| U3-1 | `1`, `1`, `0`, `2`, `1` | same | 🟢 |
| U3-2 | `presets 343 stamped 0 differ 0 maison #21701A` | same | 🟢 |
| U3-3 | `0 9` | same | 🟢 |
| U3-4 | `3`, `15`, `1`, `8`; persist gate green inside P1 | `3`+, `7`+, `1`, `1`+ | 🟢 |
| U3-5 | `▶` mode-isolation leg green inside P1; not re-derived this pass, the fixture is unchanged since pass 1 (`git diff --stat 46fb05a6 ab1a8710 -- test/engine/fixtures` prints nothing) | pass | 🟢 |
| U3-6 | `1`, `0`, `2`, `1`, `1`, `### 2026-09-26` | same, date re-set at landing | 🟢 |
| gallery presets | the real chain `hydrateStoredDoc(serialize(hydrateConfig(p)))` over the corpus: `e2e 343 stamped 0` | `0` | 🟢 |
| pre-v5 stored kits | `hydrateStoredDoc` of the 16 default rows at `schemaVersion: 4`: `16 of 16` anchored | backfill still reaches stored kits | 🟢 |
| P3 | `branding: clean (972 files scanned)`, `em-dash: clean (980 files scanned)`; U+2014 in added lines vs `d017bbc9`: `0` | clean | 🟢 |
| P4 | `0`, `1 1`, `0`, `0`, `3`, `0` | fifth `2` in the plan, `3` accepted (finding 3) | 🟢 |
| baseline KB | `baseline-agrees-check.sh`: `ok    ui.html: baseline 4141.3 KB, tree 4141.3 KB`; the correction paragraph names its cause and program output | agrees | 🟢 |

## Next

Send U3 to the verifier at `ab1a8710` or the head carrying this record. The Orchestrator revises the two plan texts in finding 3.
