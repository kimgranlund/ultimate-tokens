<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
pass

## Criteria
- AC1 (old-path regex has no hit in hand-written code-side files): pass. `git grep -n -E <RE> -- src scripts test mcp figma plugin .github .gitignore README.md` (generated files excluded) printed nothing, rc=1. The check bites: the same grep on `HEAD` (the pre-step commit) matches 28 files.
- AC2 (no old-path hit in the generated files): pass. `! grep -a -q -E <RE> src/ui/describe-mcp-assets.js figma/plugin/ui.html` gave rc=0. After a full `npm test` regeneration, `git diff --stat` was identical to before, so the committed generated files are stable.
- AC3 (`node test/repo/citations.mjs`): pass. Output was "citations: parser self-test + STALE 0 across 10 discovered docs...", with 0 stale symbol homes.
- AC4 (`node test/repo/branding.mjs`): pass. Output was "branding: clean (1241 files scanned)".
- AC5 (guard, `node test/repo/em-dash.mjs`): pass. Output was "self-test: PASS" and "em-dash: clean (1249 files scanned)".
- AC6 (preview path in `gen-preview.mjs` and `README.md`): pass. Both `grep -qF` checks returned rc=0.
- AC7 (`audit-citations.mjs` keys and exempt paths): pass. All four `grep -qF` checks returned rc=0.
- AC8 (`branding.mjs` RECORDS entries): pass. Both `grep -qF` checks returned rc=0.
- AC9 (guard, unchanged data, handoff and record paths): pass. `git diff --quiet "$(git merge-base HEAD main)" -- ...` returned rc=0.
- AC10 (guard, `.claude/docs/other` untracked): pass. `test -z "$(git ls-files -- .claude/docs/other)"` returned rc=0.
- Gate `npm test` stays green: pass. I ran it in the worktree and got exit 0 with "all 54 test files passed".
- New paths exist: pass. I checked every `docs/...` path added in the diff. Two did not resolve, and both are intentional. `docs/references/__selftest-pinned__.md` is the em-dash self-test fake path the handoff calls for. `docs/reports/2026-07-17-` is a prefix in `audit-citations.mjs`, as the handoff specifies.

## Out of scope changes
`test/ui/persist.mjs` (comment lines 615 and 773) is outside the handoff's list. I read the diff: it only re-points wrapped doc-path comments, and AC1 would otherwise match there. Each file's line count is unchanged, so the edit is needed and harmless. The other 29 changed files are all on the handoff list. No `docs/` files changed.

## For the next attempt
None
