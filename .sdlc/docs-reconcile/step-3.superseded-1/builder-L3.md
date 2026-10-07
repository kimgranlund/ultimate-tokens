<!-- role=builder level=L3 model=opus effort=high -->
## Status
blocked

## Changes
- `docs/reference/data/font-cuts.json`: line 2 `$comment` now points at `docs/references/typography/intended-use.md`. One line changed and the JSON still parses.
- `docs/specs/spec-cell.md`: the folder-relative `data/`, `rubrics/` and `references/` mentions are now repo-rooted (44 lines). The `../lld/app-shell.md` row is now `docs/specs/app-shell.md`. Line 25 `CHANGELOG.md` (the spec's provenance file) is now `docs/references/changelog.md`.
- `docs/references/spec-draft.md`: the relative `references/`, `data/` and `rubrics/` mentions are now repo-rooted, and the OD-004 path is now `docs/references/od-004-plugin-free-import-test.md`.
- `docs/references/decomposition.md`: line 5 `../SKILL.md` is now `docs/specs/spec-cell.md`.
- `docs/references/geometry/README.md`: lines 3 and 47 `geometry.tokens.json` are now `docs/assets/geometry-tokens.json`.
- `docs/references/typography/README.md`: line 3 `typography.tokens.json` is now `docs/assets/typography-tokens.json`.
- `docs/guides/go-live-runbook.md`: line 49 now `docs/specs/site/licensing-identity-spec.md`.
- MAP rewrite of `docs/...` old paths, using full-path rows and then folder prefixes in a single pass:
  - `docs/references/`: `app-shell-patterns.md`, `knowledge-02-tonal-scale.md`, `knowledge-04-export-formats.md`, `rubrics/type-rubric.md`, `typography/preset-revisions.md`, `ui-plan.md`
  - `docs/specs/`: `app-shell.md`, `lld-muted-base-key-spikes.md`, `prd-0001-app-shell.md`, `spec-muted-base-key-spikes.md`, `spec-panda-park-ui-exports.md`
  - `docs/specs/marketing/`: `fact-sheet.md`, `index.md`, `store-copy.md`
  - `docs/specs/site/`: `describe-palette-spec.md`, `licensing-identity-spec.md`, `mcp-hosting-spec.md`, `storage-and-sync-spec.md`
- `docs/specs/marketing/voice/voice-platform.md`: line 96 path rewritten. The line 172 link now targets `../../../reports/2026-07-02-brand-council.md`, and its text is now `docs/reports/2026-07-02-brand-council.md`.
- `docs/reports/2026-08-20-reactivity.md`: only the five link targets on lines 12 to 16 changed, to `2026-08-20-reactivity/<file>.md`.

## Checks
- AC1, the residue `git grep` over live docs: PASS (no hits).
- AC2, the spec-cell token existence loop: PASS.
- AC3, `docs_check.py --only D-10`: PASS. Only the two allowed warnings remain (`docs/AGENTS.md` and the `store-copy.md` skills link).
- AC4, font-cuts numstat `1 1` and `JSON.parse`: PASS.
- G5 (guard), the reports/reviews rename guard: FAIL. The only offender is `D docs/reference/reviews/2026-08-20-reactivity/INDEX.md` together with `A docs/reports/2026-08-20-reactivity.md`. With `-M30%` the pair shows as `R033`.
- G5 at base, the same filter on `git diff -M --name-status <merge-base> ded55e1f`: empty output, so green at base.
- G6 (guard), the archive/tickets/plan rename guard: PASS.
- G7 (guard), `docs_check.py`: PASS (`docs_check: 0 errors, 24 warnings (B-2a 12, D-10 2, D-11 10)`).
- G8 (guard), `onboard.py check`: PASS.
- G9 (guard), `git diff --quiet` on data, categories, the frozen `.sdlc` folders and `CHANGELOG.md`: PASS.
- G10 (guard), `.claude/docs/other` not tracked: PASS.
- `npm test`: PASS ("all 54 test files passed").

## Notes
plan defect: G5 `git diff -M ... | grep -v '^R100' | grep -v -F 'docs/reports/2026-08-20-reactivity.md'` cannot pass once the Do's required D-10 fix is applied.
- The index is 16 lines and 1811 bytes. Retargeting its five long table rows brings rename similarity down to 33%, below git's 50% default for `-M`. Git then reports the pair as `D <old INDEX.md>` plus `A <new>`, and the `D` line names only the old path, so the filter does not drop it. The guard is green at base and goes red only from this required edit.
- Suggested fix: add `| grep -v -F 'docs/reference/reviews/2026-08-20-reactivity/INDEX.md'` to G5. Lowering the threshold (`-M30%`) is not a clean fix: at 30%, `docs/reports/2026-07-02-brand-council.md` shows up as `A`.
- All other work is done and left uncommitted in the tree. Step 2's uncommitted code-side changes are still present and untouched.
- Basename sweep: these bare basename mentions are deliberately unchanged, because none of them pointed relatively at an old sibling location:
  - `knowledge-0x` in `spec-muted-base-key-spikes.md:182-184`
  - `ui-plan.md` in `app-shell.md`
  - `app-shell-patterns.md` in `prd-0001-app-shell.md:24`
  - `color-model-function.md` in `color-neutral-derivation.md:11`
  - `spec-draft.md` in `spec-cell.md:219`
  - root `CHANGELOG.md` in `spec-panda-park-ui-exports.md:437`
- No bare `docs/reference/` document mentions are left in live docs. The ones remaining are `docs/reference/data/` paths and stay as they are.
