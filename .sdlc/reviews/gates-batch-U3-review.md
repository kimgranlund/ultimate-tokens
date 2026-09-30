# gates-batch U3 review (pass 1)

Reviewer: reviewer-l3, fresh context. Branch `unit/gb-U3` @ 8ad5946c (code 4d58a37d).

**FAIL**: the `renameparity` regex can be fooled by a comment copy of a constant (reproduced). Everything else checks out.

## Findings

| # | Sev | Where | Finding | Fix |
|---|---|---|---|---|
| 1 | 🔴 Major | `test/figma/binder.mjs:817` | `grab` is not anchored to line start and returns the FIRST `(const\|var\|let) NAME = ...;` it finds, which can be inside a `//` comment. Reproduced: I added `//   e.g. const LIBRARY_TYPE_VOICE_MAP = { heading: "headline", ... };` at line 1 of the binder `code.js` and drifted the real line 85 to `heading: "DRIFT"`: `pass renameparity`, exit 0. The gate compares a comment instead of the code, which is the vacuous pass this unit exists to prevent, and these files are full of lockstep comments. | Anchor with `^[ \t]*(?:const\|var\|let)\s+NAME\s*=` and FAIL when the name is declared more than once. Add the decoy as a handoff control. |
| 2 | 🟡 Minor | `test/figma/binder.mjs:815` | `canonSort` sorts object keys, so reordered map keys still pass (reproduced by swapping `heading`/`ui` in the binder's `LIBRARY_TYPE_VOICE_MAP`). Key order matters in code: `code.js:297` `expandVoiceAliasMap` walks `Object.keys(voiceMap)` and stops at the first match. Only observable when a name has two old voice segments. | Drop the sort and compare plain `JSON.stringify`. |
| 3 | 🟡 Minor | same gate | Passes when the canonical map and every copy are all `{}` (reproduced for `GEOMETRY_FIELD_RENAME_MAP`). That is real parity, but it is a weak floor. | Add a one-line non-empty check. |
| 4 | 🟡 Info | `test/figma/binder.mjs:824-836` | One `try` wraps every lookup, so if one `new Function` throws, the remaining names are skipped. The run still reds; only the message is less specific. | Optional: a `try` per name. |

## Negative controls (scratch copy of the tree)

| Plant | Result |
|---|---|
| U3-2 binder `legal: "label"` | 🟢 exit 1, named FAIL |
| U3-3 drop "Color Modes" | 🟢 exit 1 |
| `SEMANTIC_RENAME_FROM` array order swapped | 🟢 exit 1 |
| U3-4 flagship `radius: "radius"` | 🟢 exit 1, names flagship |
| flagship gains an extra key | 🟢 exit 1 |
| binder loses a key | 🟢 exit 1 |
| U3-5 binder const renamed | 🟢 "binder is missing GEOMETRY_FIELD_RENAME_MAP" |
| flagship `var` renamed | 🟢 "flagship is missing ..." |
| U3-6 plant in `migrations.mjs` | 🟢 exit 1 |
| migrations "Color Roles" array edited | 🟢 exit 1 |
| migrations "Color Roles" key renamed | 🟢 caught, "could not load/compare" |
| migrations export renamed | 🟢 import link error, exit 1 |
| map key order swapped | 🔴 pass (finding 2) |
| canon and all copies emptied | 🟡 pass (finding 3) |
| comment decoy plus real drift | 🔴 pass (finding 1) |

## Focus points

| Point | Status | Evidence |
|---|---|---|
| All three maps compared key for key and value for value, in the binder and the flagship, against `migrations.mjs` | 🟢 | the controls above |
| No `SEMANTIC_RENAME_FROM` in the flagship; "Color Roles" compared directly | 🟢 | `figma/plugin/code.js` has only `SEMANTIC_COLLECTION` (:26). `FIGMA_MIGRATIONS.color.collections["Color Roles"]` is a bare array (`migrations.mjs:84`). |
| U3-7 / U3-8 | 🟢 | counts 1/2/3; the comment-only check prints `0` (read with `--text`) |
| C5 and the generated files | 🟡 | After regenerating in scratch (`gen:figma-assets`, then `bundle` and `scripts/gen-figma-ui.mjs`), `src/ui/figma-plugin-assets.js` and `figma/plugin/ui.html` are byte-identical to the committed files. Their diffs are only the new comment text carried into the embedded strings. C5 as written lists only `type.mjs` and `typography.js`, so by its letter it is red. Its intent (no code change in `src/`) holds, and C1's clean-tree rule makes this file change unavoidable. Recommend a plan revision that admits a generated `*-assets.js` when it is byte-identical to generator output. This is plan wording, not builder rework. |

## Not run

`npm test`: the heavy-suite count read 5, over the cap of 2. `node test/figma/binder.mjs` alone passes on the branch. The worktree is clean. My scratch copy is still at `/Users/kimba/.claude/jobs/8c58a81c/tmp/gb3` because the `rm` was denied.

# Pass 2 (rework 1, `cf0da74a`, gate change `e2a95903`)

**PASS**: all four pass-1 findings are fixed. The change since pass 1 touches only `test/figma/binder.mjs` and the handoff, and all 13 controls behave as expected.

| Finding | Status | Evidence (scratch copy synced to `cf0da74a`) |
|---|---|---|
| 1 comment decoy | 🟢 | The pattern now matches only at a line start (`^[ \t]*` with `gm`). The comment decoy plus a real `heading: "DRIFT"` edit fails the gate, exit 1. The comment decoy alone, with no drift, passes, which is correct. Adding a second real `var` declaration to the flagship fails with "declares GEOMETRY_FIELD_RENAME_MAP 2 times". |
| 2 key order | 🟢 | A plain `JSON.stringify` compare replaces the sort. Swapping `heading`/`ui` in the binder fails, exit 1. |
| 3 empty floor | 🟢 | Emptying the canonical map and every copy fails with "canonical GEOMETRY_FIELD_RENAME_MAP ... is empty". Emptying the "Color Roles" list fails for `SEMANTIC_RENAME_FROM`. Renaming the "Color Roles" key also fails, on the same floor check. |
| 4 per-name try | 🟢 | A broken literal in the binder's `LIBRARY_TYPE_VOICE_MAP` gives "could not load/compare LIBRARY_TYPE_VOICE_MAP in the binder", and the other names are still checked. |
| Pass-1 plants rerun | 🟢 | U3-2, U3-4, U3-5 and U3-6 each exit 1 with a named `renameparity` FAIL. With no plant, the gate passes. |

Unchanged since pass 1: the U3-7 and U3-8 files, and the regenerated asset files (the C5 recommendation to revise the plan wording still stands). `npm test` was not run: the heavy-suite count read 4, over the cap of 2. The worktree is clean.
