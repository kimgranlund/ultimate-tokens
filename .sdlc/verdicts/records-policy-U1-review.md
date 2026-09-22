# Review U1 · PASS

Unit unit/rp-U1 @ cb944613a0783edc7b274b6715d0ae7d36a36d4d, base plan/records-policy @ 0c3242e023492bfaa278677b49160cacbbe20ffc. Every P and U1 row re-run independently in a fresh `git clone -q --shared` for the edit-controls, never in the worktree.

## Source cited at ref and line

Ruled case, at its source: `plan/preset-intent-fidelity:scripts/gen-adia-derived-exports.mjs:65` to `:69` (`git show plan/preset-intent-fidelity:scripts/gen-adia-derived-exports.mjs | sed -n '60,72p'`):
```
  // 1.2.0 (#681, plan revision 28): the #681 engine (stored anchor, shared chroma envelope, CIE-L*
  // prime ladder) moved TOKEN VALUES in both artifacts from the same unchanged document at the same
  // EXPORT_SCHEMA_VERSION 3, so `minor` again, since a consumer's byte-compare breaks while the shape
  // it compares does not: no key, name or ordering moved. SOURCE_TAG stays `adia-brand-document@1.0.0`
  // because `brands.json` is byte-identical to origin/main, so no document tag is cut (C9).
```
and `pif-u5.md` §3.1 ("### 3.1 The one generator line (plan revision 28, C9)"), whose reasoning reads: "`major` asks whether a shape change defeats a consumer's byte-compare. A byte-compare does break here, because token values moved, but the SHAPE it compares does not, which is what that case turns on. ... the radix artifact has 2,909 `key: value` entries on both sides, the key sequence is identical, 797 values differ, and every one of the 797 is an `oklch(...)` string replaced by another `oklch(...)` string, with zero moves of any other kind. No key, name or ordering moved. So `minor`."

New policy text (`scripts/gen-adia-derived-exports.mjs:34-38` on cb944613): "minor the same document re-exported under a bumped EXPORT_SCHEMA_VERSION, a new `adia-brand-document` tag, OR with token values moved by an engine change under an unchanged document, schema and tag (#681 at 1.2.0): a consumer re-pins, its contract holds. ... The distinguishing question is whether a consumer's CONTRACT changed, never whether a version string did: bytes moved under the same keys is minor, a key gone or renamed is major."

This is worded on the consumer's contract, not on #681's mechanics: "token values moved by an engine change" generalizes the ruled case's "engine ... moved TOKEN VALUES" without repeating the anchor/chroma-envelope specifics; "a consumer re-pins, its contract holds" restates the ruled reasoning ("a consumer's byte-compare breaks while the shape it compares does not"); "bytes moved under the same keys is minor, a key gone or renamed is major" restates "no key, name or ordering moved" as the general test. The wording matches the ruled case: `#681 at 1.2.0` is cited as the precedent, parenthetically, not as a condition the rule depends on.

## Clarity for a seat that has never seen #681

The rule reads standalone: "token values moved by an engine change under an unchanged document, schema and tag" is a complete, generalizable trigger; `(#681 at 1.2.0)` supplies a worked example, not a prerequisite. The distinguishing question is stated exactly once, immediately after `major`, in one sentence ("whether a consumer's CONTRACT changed, never whether a version string did"), with a one-clause test for each side (minor/major) that a reader can apply without re-deriving §3.1's 2,909-key measurement.

## Criteria reproduced (all commands re-run by this reviewer, not copied from the handoff)

| Id | Result | Negative control (this reviewer, fresh clone) |
|---|---|---|
| U1-1 | `1`, `1`, `1` | restored from `origin/main`: `1`, `0`, `0` |
| U1-2 | `1`, `1` | closing two lines removed: `0`, `0` |
| U1-3 | `0` (paired with U1-1's `1,1,1`, diff not empty) | at this base the `ARTIFACTS` rows are still `1.1.0` (`#681` has not merged into `plan/records-policy`); bumping row 68 from `1.1.0` to `1.1.1` prints `2`, matching the plan's stated control once run against the correct pre-#681 state |
| U1-4 | `0` | `major` line reworded (`a shape` → `a SHAPE`): `4` |
| U1-5 | satisfied by this document | n/a |

## Other checks

- Diff `0c3242e0..cb944613` touches exactly two files: `scripts/gen-adia-derived-exports.mjs` and `.sdlc/handoffs/records-policy-U1.md`. Inside the script, only the `BUMP POLICY` comment block changed (confirmed by U1-3's `0` and by inspecting the full diff): the `ARTIFACTS` table, the `1.1.0`/`1.2.0` per-row comments, and no version string were touched.
- `npm test`: `✓ all 48 test files passed`, tree clean after (`git status --short` → 0 lines).
- `node test/repo/branding.mjs`: `branding: clean (547 files scanned)`.

## Findings

None. No em dash outside backtick spans in the new comment lines (inspected directly).

Verdict left uncommitted per instruction; nothing staged or committed in the worktree by this review.
