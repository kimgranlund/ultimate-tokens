FAIL

# Review · anchor-gaps U3 · pass 1 · `unit/ag-U3` @ `46fb05a6` (base `d017bbc9`)

| Field | Value |
|---|---|
| Seat | reviewer, stand-in for reviewer-l4 while fable is capped: Opus, the builder's own family (builder-l5), under the owner ruling `.sdlc/questions/seat-reliability-approval.md` (`b9044bb`, sdlc-orchestration repo) |
| Criteria | `.sdlc/plans/anchor-gaps.md` revision 7: U3-1 to U3-6, P1 to P4 (the P4 wall), Q7 default (a) |
| Source findings | `.sdlc/verdicts/anchor-gaps-prepr.md` items 1 to 5 |
| Handoff | `.sdlc/handoffs/anchor-gaps-U3.md`, Deviations 1 to 3 |
| Where run | a `--shared` clone of `46fb05a6` under the job scratchpad; every control reverted with `git checkout -- .`, `git status --short \| wc -l` read `0` after each |

## Verdict

The code is right: `openConfigAsSet` is off the backfill, `openSet` and the set tile keep it, the fixture re-capture is honest, and no pre-v5 stored kit regresses. It fails on one point: the one-line fix can be reverted and `npm test` stays green (54 of 54). Source finding 1 asked for "a gate that feeds every corpus preset through the gallery path". `gallery-reach` feeds them through `hydrateConfig`, a helper. It never goes through `openConfigAsSet`. The class of bug that escaped pass 1 can escape the same way again.

## Findings, ranked

1. 🔴 Nothing in `npm test` pins the wiring. With `src/ui/app.js:2371` put back to `const doc = hydrateStoredDoc(config);`, a full `npm test` in the clone printed `✓ all 54 test files passed`, exit 0. Revision 7's U3-1 control says that revert "reds U3-2". It cannot: U3-2 and (h) to (j) call `hydrateConfig` directly (handoff Deviation 2, which states this correctly). U3-1's greps do swap on the revert (`1 1 0 2 1` to `1 0 1 2 1`), so the reviewer and verifier catch it today. Nothing catches it after landing. The fix is bounded and inside the wall. Option one: add a sub-gate (k) to the `gallery-reach` block in `test/ui/persist.mjs` that reads `src/ui/app.js` and asserts that the `openConfigAsSet` method body calls `hydrateConfig(` and not `hydrateStoredDoc(`. Its negative control is this exact revert, and it should print a `gallery-reach` FAIL. Option two, stronger but outside the wall: a plan revision that admits `test/ui/headless-boot.mjs`, which already calls `app.openConfigAsSet(maison, ...)` at `:3668`, and asserts that Maison's `Success` opens with no `anchor`. Either way, U3-1's control text needs a revision that names the check that reds.
2. 🟡 The opened doc runs through the backfill a second time. `openConfigAsSet` serializes the doc and then calls `this.openSet(id)`, which runs `hydrateStoredDoc(rec.doc)` (`app.js:205`). The backfill does nothing there only because `serialize()` stamps `schemaVersion: 6` and `backfillDefaultAnchors` returns early at `>= 5` (`app-helpers.mjs:853`). My end-to-end probe of the real chain, `hydrateStoredDoc(serialize(hydrateConfig(p)))` over every preset, printed `stamped 0 differ 0`. Put `hydrateStoredDoc` in place of `hydrateConfig` and it printed `stamped 1 differ 1 Maison`. So the behaviour is right, but the new comments at `app-helpers.mjs:870-879` and `app.js:2362-2364` both imply the seam choice alone keeps the backfill out. One clause naming the v6 stamp as the second guard would stop a later edit to `serialize` or the version gate from reopening #740 silently. If finding 1 is fixed with (k), (h) could also model this chain instead of `hydrateConfig` alone.
3. 🟢 Deviation 1 (P4 fifth reads `3`, not `2`) accepted. `git diff -U0 d017bbc9 -- src/ui/app.js` shows `@@ -53 +53 @@` (import), `@@ -2362,3 +2362,3 @@` (the method's comment) and `@@ -2371 +2371 @@` (its body). At default context there are `2`. Every hunk sits inside the wall's "the import line and the `openConfigAsSet` method with its comment". The comment edit was required, since the old text named `hydrateStoredDoc()` as the seam. The plan row's figure should read `3` under `-U0`.
4. 🟢 Deviation 2 accepted as a true report. As a coverage gap it is finding 1.
5. 🟢 Deviation 3 accepted. One joined `FAIL("gallery-reach", ...)` is right, because `FAIL` keeps one message per gate name. My alias control printed (h) and (i) together on one line, so no sub-gate hides another. The U3-6 `awk` reads the reach sentence because that sentence carries `#740`. The needle still bites (`0` on `81ac5521~1`, per the handoff).
6. 🟢 Q7 (a) holds: the backfill reaches the stored set list only. `grep -rn 'hydrateStoredDoc(' src` finds `app.js:205` (`openSet`) and `:682` (set tile), and `hydrateConfig(` finds only `openConfigAsSet`. The four `openConfigAsSet` callers (`:806` gallery, `:1192` Open saved palette, `:1227` Figma variables, `:2358` project restore) all go through it.

## Evidence

| Row | Claim | Result at `46fb05a6` | Negative control, run | Control bites |
|---|---|---|---|---|
| P1 | `npm test` green, no `node_modules`, tree clean | `✓ all 54 test files passed`, exit 0, `0` dirty (87 s, load 2.9) | wiring revert (finding 1): `✓ all 54 test files passed`, exit 0 | 🔴 no, for the U3 fix |
| U3-1 | seam split | `hydrateConfig` only in `openConfigAsSet`; `hydrateStoredDoc(rec.doc)` `2` | wiring revert swaps the greps | 🟢 greps only |
| U3-2 / (h) | no preset gains an anchor on the gallery seam | persist gate PASS | `export const hydrateConfig = hydrateStoredDoc;`: `FAIL  gallery-reach, (h) of 343 ... 1 gained an anchor and 1 render off their tile (first: Maison ...); (i) ... got 9 and 9` | 🟢 |
| e2e | the real `openConfigAsSet` chain: `hydrateStoredDoc(serialize(hydrateConfig(p)))` | `e2e presets 343 stamped 0 differ 0` | `hydrateStoredDoc` in place of `hydrateConfig`: `stamped 1 differ 1 Maison · The product's own design system` | 🟢 |
| U3-3 / (i) | Figma-variables seed | `0 9` | alias: `9 9` (in the joined FAIL above) | 🟢 |
| (j) | Maison `#21701A` on the stored seam | persist gate PASS | backfill removed, handoff's run: `(j) ... got undefined` | 🟢 (handoff's, not re-run) |
| stored kits | a pre-v5 default kit still regains anchors | `pre-v5 kit anchors 16 of 16 ramps off fresh 0`; `hydrateStoredDoc` is byte-unchanged vs `d017bbc9` (the `app-helpers.mjs` diff only adds lines at file end) | `hydrateConfig` equals `main`'s (`7006405c`) `hydrateStoredDoc` body line for line, so the embedded-config restores open exactly as on `main` | 🟢 no regression |
| U3-5 | fixture honest | gate `pass ... 990c17c5ae140e6e peak b59bd41501cd829a ... captured at 81ac5521`; `81ac5521` is `07fe3c0a`'s parent; `07fe3c0a` changes the fixture only; vs base the diff is `capturedAt`, `perceptual`, `peak`, and `owner` and `corpus` are unchanged | my own `--capture` at `46fb05a6` wrote the same two hashes and moved only `capturedAt` | 🟢 re-derived, not copied |
| P4 | wall | `git diff --name-only d017bbc9`: nine paths, all admitted; `app.js` `3` hunks under `-U0` (Deviation 1) | n/a | 🟢 |

## For the builder, pass 2

| Do | Done when |
|---|---|
| Add a wiring check that `npm test` runs (finding 1, option one or the plan's choice) | the `app.js:2371` revert makes `npm test` exit 1 with a `gallery-reach` FAIL line |
| One clause on the v6 guard in the two new comments (finding 2) | the comments name `serialize`'s `schemaVersion` stamp as the reason `openSet`'s second pass is inert |

The Orchestrator revises U3-1's control text and P4's fifth figure (`3`) in the plan.
