---
kind: review
plan: adopt-hygiene
unit: U1
diff: b885e67..unit/hygiene-U1 (head 9b7051e)
reviewer: reviewer-l1 (fresh context)
date: 2026-09-16
verdict: 🟢 pass
---

# U1 review — records, plans, stubs, moved docs

Fresh-context review against `.sdlc/plans/adopt-hygiene.md` §U1 (12 criteria), plan-level P1–P5,
the scope wall, the branding rule, and `change-reviewer-agent.md` §What to check. `npm test`/
`npm run build` not run per instructions; all criterion commands and read-only checks were.

## Criteria (12/12 pass)

All 12 U1 criterion commands were re-run independently in the worktree and matched expected
output exactly:

| # | Result |
|---|---|
| 1 | ADR-010/013/016 amendments: `1,1,1` |
| 2 | ADR order ADR-022 → ADR-023 → ADR-024 → Quick map: confirmed |
| 3 | `Supersedes ADR-004`: 1, `Amends ADR-010 wording`: 1 |
| 4 | LLD/runbook/describe-spec amendments: `1,1,1`; `resolve.mjs`: 1 |
| 5 | OD-004: old path 0, new path 1 |
| 6 | `docs/plan/*.md`: 0, archive: 3, `complete`: 2, `todo`: 0/0 (verified with bash; a bare zsh run of the same command prints a benign `no matches found` stderr line from the empty first glob but the same five numeric results) |
| 7 | PLAN-overhaul moved, `Closed 2026-09-16`: 1, stray-path grep: 0 |
| 8 | PRD frontmatter: 4, G7: 2, SKILL.md stale text: 0 |
| 9 | cards: 3, index rows: 3, decisions rows: 3 |
| 10 | `interchange`: 1, `gen-font-test`: 1, drawer/scripts diff: 0 |
| 11 | reactivity report moved, reviews listing: 1, stray-path grep: 0 |
| 12 | K18 control: 1 match, control block prints nothing (passes at HEAD) |

## Plan-level and wall checks

- P2 (private folder / node_modules untracked): `0`. 🟢
- P3 (scope wall, `src mcp scripts test` excl. branding.mjs): `0`. 🟢
- P5 (decision-records.md append-only, no `^-[^-]` lines): `0`. 🟢
- P1 (npm test): not run, per dispatch instructions (the Verifier's job).

## Also-checked

- **decision-records.md append-only**: confirmed by direct diff read, not just the P5 grep — every
  hunk is a pure insertion (`Amendment` lines, ADR-023, ADR-024); no line starting `-` besides diff
  markers.
- **Scope wall**: nothing under `src/`, `mcp/`, `scripts/`, `test/` in the U1-specific diff
  (`b885e67..unit/hygiene-U1`); confirmed both by the plan's own P3 command and by the file list in
  `git diff --stat`.
- **.claude/ edits confined to project-docs table cells + the two moves out**: confirmed. The only
  `.claude/` touches are `.claude/skills/project-docs/SKILL.md` (two table cells) and the two `git mv`
  moves (`overhaul-plan-2026-08-14.md` out of `.claude/`, and the six reactivity-report files out of
  `.claude/docs/reports/`). No other `.claude/` file appears in the diff.
- **Moves are renames, not copy-leaving-original**: `git diff --summary` shows all nine relocated
  files as `rename {...} => {...}`, none as a plain add+delete pair; originals are gone from their
  old paths.
- **Branding**: `node test/repo/branding.mjs` → `clean (398 files scanned)` on the worktree tree.
  Manually re-read every new/edited paragraph under `.sdlc/` and `docs/` for the retired maker name
  and the pre-rename element identifier — none present; the ADR-016 amendment and ADR-004 references
  paraphrase rather than quote.
- **`.claude/settings.json` not in the diff**: confirmed — `git diff b885e67..unit/hygiene-U1 --
  .claude/settings.json` is empty. (An `origin/main`-relative diff does show it changed, but that
  predates U1's base commit `b885e67` and is unrelated to this unit — correctly out of scope.)

## Factual spot-checks (content, not just grep presence)

Since several criteria only grep for a marker string, I independently verified the underlying
claims against the actual source tree (read-only, no edits):

- `src/engine/collections.js` really names the collections "Color Primitives" / "Color Roles" /
  "Type Primitives" / "Geometry" — matches the ADR-016 amendment text verbatim.
- `src/ui/zip.mjs` exports `zipStore`, not `makeZip` — matches the ADR-010 amendment.
- `src/engine/type.mjs` carries `UI-control` and `UI-widget` alongside the other 13 voices (15
  total) — matches the ADR-013 amendment.
- `src/engine/resolve.mjs` exists and is the shared resolver — matches the LLD amendment.
- `flagOf("maxSets")`, `flagOf("proExport")`, `flagOf("advancedTreatments")`, and
  `flagOf("describePalette")` are all real call sites in `src/ui/app.js` /
  `src/ui/overlays/drawer.js`; `hostedMcp` has no call site anywhere outside `src/engine/flags.js`
  and the Account dev-toggle label — matches the runbook amendment exactly.
- `test/ui/persist.mjs` carries a `schema-rename` case gated at `CURRENT_SCHEMA_VERSION` 4 — the
  new K18 control (`grep -qE "schema-rename v${CUR}\b" test/ui/persist.mjs`) genuinely matches
  real content, not a vacuous always-true pattern.

Texts pasted from `.sdlc/adapter.md` §6 (ADR-023, ADR-024, PRD stub) are byte-for-byte consistent
with the adapter source, including the Status lines.

## change-reviewer-agent checklist

1. Privacy + repo hygiene: N/A concern raised — clean (P2 = 0, no `.claude/docs/other` touch).
2. Semantic-role parity: N/A — `src/engine/semantic.js` untouched.
3. Browser traps (font-family/SVG): N/A — no such files touched.
4. Headless-shim safety: N/A — `test/ui/headless-boot.mjs` untouched.
5. Editor-section pattern: N/A — no section/canvas code touched.
6. Architecture: N/A for runtime deps/engines (scope wall holds); the one generated-artifact
   adjacent item, `test/ui/persist.mjs`'s snapshot case cited by the new K18 control, was verified
   present and correctly matched.
7. Tests + commit: commit `9b7051e` carries a `Co-Authored-By` trailer and a squash-shaped single
   commit; no lettered headless group needed (docs-only unit).

## Verdict

🟢 **Pass.** All 12 U1 criteria, all five plan-level checks in scope for a unit review, the scope
wall, the branding rule, and every "also check" item hold. Content spot-checks against the live
source tree confirm the amendments state true facts, not just grep-satisfying text. No blockers,
majors, or minors found.
