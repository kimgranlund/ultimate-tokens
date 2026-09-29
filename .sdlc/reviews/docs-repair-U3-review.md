FIX-FIRST

Review of unit/dr-U3 @ 36b598f9 (ticket #751), pass 1. Quiet window (R47) was in effect for this
pass; npm test, npm run build, smoke and corpus runs were deferred rather than started, per the
Orchestrator's instruction. Everything else was re-derived directly against the code, not taken
on the handoff's word.

## Checks run and confirmed

All nine U3 criteria (U3-1 through U3-9) were re-run against the actual code and match the
plan's expected values exactly:

- U3-1: docs/lld/app-shell.md now states colorMode has four states (system, light, dark, both)
  and the app-pref persistence exception paragraph; app.js:2280 _appPrefsKey() and the
  colorMode: this.colorMode write at app.js:2297 both exist as cited.
- U3-2: docs/lld/app-shell.md says "15 voices", not "11 voices"; makeVoices() in
  src/engine/type.mjs returns 15 keys.
- U3-3: the mixinInto cite moved to app.js:2581, the call line; node scripts/audit-citations.mjs
  now reads that citation OK (previously NEAR).
- U3-4: deleteMode is gone from .claude/skills/building-editor-sections/SKILL.md; it names
  deleteTypeMode and deleteGeomMode, both of which exist as methods in
  src/ui/sections/typography.js:210 and src/ui/sections/geometry.js:265; the skill gained the
  two new References rows for app-shell.md and component-inventory.md.
- U3-5: docs/reference/references/component-inventory.md's five factory rows (switchControl,
  swatch, btn, chip, field) now say app-helpers.mjs, matching the exports in
  src/ui/app-helpers.mjs; segmented() and slider() correctly stay app.js (method) rows.
- U3-6: docs/reference/app-shell-patterns.md's dead ~/.claude/skills/ui-patterns/... link is
  replaced with a name-only pointer to the frontend plugin's ui-pattern-facts skill; no ~/ path
  remains.
- U3-7 (partial, see finding 1 below): src/ui/app.js line 1 now names Ultimate Tokens, not the
  retired product name; src/engine/geometry.mjs's source note drops the private
  .claude/docs/ path.
- U3-8: docs/marketing is untouched by this unit's diff.
- U3-9: the src/ui/app.js, src/ui/persist.js and src/engine/geometry.mjs diffs are comment-only
  (numstat 1/1, 2/0, 2/2); the baseline.md build row and its correction paragraph were updated
  in the same commit, and the ui.html KB figure (4125.5) matches the tree via
  baseline-agrees-check.sh (stale total: 0).

P3 (branding, em dash) and P4 (scope wall) were also re-run directly: test/repo/branding.mjs
reports clean; the added-lines em-dash count (outside backtick spans) is 0, and the raw count
including the handoff is 0; the scope-wall name-only filter, the comment-only diff on the three
source files, the test/scripts/CI-untouched check, and the DD-row check in
.sdlc/architecture.md all read 0, 0, 0, 0 as expected.

## Findings

1. (should-fix) src/ui/persist.js retains a stale duplicate header. The builder added a new
   line 1 ("// persist.js: the persistence layer...") which satisfies U3-7's head -1 check. But
   the file's actual original header block, a full doc comment starting at persist.js:29
   (`persist.js — UI state persistence for the HCT Palette Generator.`), was never touched and
   still names the retired product name. The file now carries two different header comments,
   and the exact stale name this audit item was meant to remove is still present verbatim; it
   also propagated into the regenerated figma/plugin/ui.html and src/ui/describe-mcp-assets.js
   (grep confirms 2 and 1 occurrences respectively). No stated criterion catches this because
   U3-7 only checks head -1, but it is a genuine unrepaired instance of the thing U3 was built
   to fix, and it should be folded into persist.js's new header rather than left as a second,
   contradicting comment block.

2. (minor, cosmetic) docs/lld/app-shell.md:13, the "Source of record" line, lost the backticks
   around HctApp when the mixinInto line-number cite was updated: it now reads "onto the HctApp
   prototype" instead of "onto the `HctApp` prototype". Worth a one-character fix alongside
   finding 1.

## Deferred to the next round (quiet window)

- P1: npm test in a scratch --shared clone at 36b598f9 (foreground, expect
  "all 50 test files passed", TESTS count 50, tree stable).
- P2: npm run build in the same clone, then baseline-agrees-check.sh (expect exit 0, a
  "wrote figma/plugin/ui.html" line, stale total: 0).
- P5: node test/repo/citations.mjs in the clone (expect the parser self-test line plus
  STALE 0), and the bumped-citation negative control.

verdict: 🟡 FIX-FIRST
