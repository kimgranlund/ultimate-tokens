## Task goal
The editor shell is one standardized UI: a single text-role system, one inset and radius composition rule for every container, one anatomy table for every control, one glyph motion set, all derived from the Maison ladder cell, with the shell defaulting to the product tier, sm scale, md size.

## Step 3: The shell text gate, with the not-yet-migrated families pending
level: L3
### Read first
- `docs/references/AGENTS.md`
### Do
Depends on: step 2 (the gate's samples read `--ui-*` names the alias block declares).
1. Run `git mv test/repo/control-text.mjs test/repo/shell-text.mjs`. This is a rename, not a delete, so the T-0027 history follows the file. Then rewrite it as the widened gate. Its comments name the predecessor as "the T-0027 control gate", never by its old file name, so the dependents grep below stays clean.
2. What it checks. It walks every style rule, descending into `@media` and `@supports`, skipping `@keyframes` and custom-property declarations (`--*`), as `control-text.mjs:53-75` did.
   - Text, on every rule not allow-listed:
     - `font-size`, `letter-spacing`: a nonzero literal length is flagged.
     - `font-weight`: a numeric literal is flagged.
     - `text-transform`: anything but `none`, `inherit` or `capitalize` is flagged. `capitalize` is a data word's case, not a role's.
     - `line-height`: anything but `1`, `normal`, `inherit` or `0` is flagged.
     - `font` shorthand with no `var(`: flagged unless a later `font-size` in the same rule reads `var(`, the old gate's rule.
   - Geometry, on control and container kinds: `padding*`, `gap` and `border-radius` with a nonzero literal length outside `var(` are flagged, except `border-radius: 50%` (a circle is a shape, not a size). The kinds are the old gate's `ELEMENTS`, `LITERALS` and `CLASSES`, plus `tools-menu`, `tools-more`, `linklike` and `.toggle .track`.
3. `ALLOW`: `[needle, reason]` pairs. A selector is exempt when it contains the needle, unless it contains one of the NAMED chrome exceptions `.ex-collapse-toggle` or `.ex-artifact-title`. Entries and reasons:
   - Specimens painted at a kit cell: `.ex-`, `.geom-ex-`, `.geom-ctl`, `.geom-glyph`, `.geom-caret`. `.geom-ctl` is the ramp's live mock control, sized by inline style (`sections/geometry.js:375`).
   - The gallery is a content page, not the editor chrome: `.gallery-`, `.masthead`, `.category-`, `.categories-`, `.set-`, `.tile-`, `.new-tile`, `.figma-import-row`, `.preset-vol`.
   - `.brand`: the wordmark is a logotype.
   - Drawn glyphs: `.drag-handle::before`, `.radix-step::after`.
   - Chart marks own their scale (T-0029): `.ch-`, `.an-svg`.
   - The exact selector `body`: the page outside the host, kept as the pre-host fallback; the host rule declares the body role (step 4).
   On failure the gate prints each violation, then one `allowed: <needle>: <reason>` line per entry.
4. `PENDING`: `const PENDING = { "step-4": [...], "step-5": [...], "step-6": [...], "step-7": [...], "step-8": [...] };`. A selector is skipped while a pending needle matches it. A needle starting with `=` matches one selector exactly; any other needle matches by substring. The lists:
   - `"step-4"`: `.pane-label`, `.pane-head`, `.an-`, `.mode-editor`, `.compare-col`, `.ramp-`, `.radix-badge`, `.sub-head`, `.mini-check`, `.canvas-footer`, `.app-footer`, `.scrim-`, `.key-cell`, `.toast`
   - `"step-5"`: `.map-table`, `.map-sem`, `.map-reset`, `.map-drift`, `.tok-`, `.insp-`, `.field`, `.key-slot`, `.color-story`, `.color-role`, `.story-`, `.ex-collapse-toggle`, `.ex-artifact-title`
   - `"step-6"`: `.drawer-`, `.figma-note`, `.radix-note`, `.config-note`, `.copy-float`, `.pro-upsell`, `.newpal-`, `.apply-gate-`, `.settings-`, `.acct-`, `.account-`, `.cleanup-`
   - `"step-7"`: `.typo-`, `.type-spec-`, `.ty-role`, `.tyi-voices-head`, `.tyi-weights-core`, `.tyi-voice-font`, `.tyi-voice-stats`, `.tyi-font-role`, `.tyi-font-legend`, `.geom-`
   - `"step-8"`: `=button`, `=select`, `=input[type="text"]`, `=input[type="search"]`, `=.linklike`, `.chip`, `.segmented`, `.figma-files`, `.radix-files`, `.toggle`, `.tyi-voice-name`, `.tyi-font-input`, `.map-raw-`, `.tools-menu`
   This partition covers every flagged declaration on today's tree (a probe found none outside it). If T-0043 or another lane adds an offender, put it in the family its prefix names.
5. CLI: `--strict` ignores `PENDING`. The first non-flag argument is the stylesheet path, default `src/ui/styles.css`; `/dev/stdin` works. Without `--strict` and with pending entries, it also prints `shell-text: <n> declarations pending in <keys>`.
6. Negative controls run first, under strict, and exit 1 if any is not flagged:
   - `.pane-head .pane-title { font-size: 12px; }`
   - `.sub-head { font-weight: 600; }`
   - `.tools-menu:popover-open { border-radius: 16px; }`
   - The old gate's two: `.figma-files button { font-size: 11.5px; }` and `.toggle { font: inherit; }`
   - One allow-list positive, which must pass: `.ex-title { font-size: 15px; }`
7. `test/run.mjs`: replace `"repo/control-text.mjs"` with `"repo/shell-text.mjs"`.
8. Dependents that name the old file, rewritten to name `test/repo/shell-text.mjs` and say it gates text on every shell rule: `.claude/CLAUDE.md:44`, `.claude/skills/building-editor-sections/SKILL.md:119` and `docs/references/component-inventory.md:127-128`. History stays as written: `CHANGELOG.md`, `docs/references/changelog.md`, `docs/reports/2026-10-08-geometry-compound-insets.md`, `docs/archive/`.
9. Run `node test/repo/shell-text.mjs` (green with the pending list), `node test/repo/shell-text.mjs --strict` (red: the families are still literal), `node test/repo/citations.mjs`.
### Acceptance criteria
- (red) `node test/repo/shell-text.mjs`
- (red) `! test -e test/repo/control-text.mjs && grep -qF '"repo/shell-text.mjs"' test/run.mjs && ! grep -qF '"repo/control-text.mjs"' test/run.mjs`
- (red) `test -f test/repo/shell-text.mjs && for s in '.pane-head .pane-title { font-size: 12px; }' '.sub-head { font-weight: 600; }' '.tools-menu:popover-open { border-radius: 16px; }' '.ex-collapse-toggle { font-size: 10.5px; }' '.chip { border-radius: 999px; }' '.settings-note { line-height: 1.55; }'; do if printf '%s\n' "$s" | node test/repo/shell-text.mjs --strict /dev/stdin >/dev/null; then echo "not flagged: $s"; exit 1; fi; done`
- (red) `test -f test/repo/shell-text.mjs && printf '%s\n' '.ex-title { font-size: 15px; }' '.masthead-title { font-size: 22px; }' '.pane-head .pane-title { font: var(--ui-pane-title-font); letter-spacing: var(--ui-pane-title-tracking); text-transform: var(--ui-pane-title-case); }' '.toggle .track::after { border-radius: 50%; }' | node test/repo/shell-text.mjs --strict /dev/stdin`
- (red) `! git grep -nE 'control-text\.mjs|repo/control-text|control-text\)' -- .claude/CLAUDE.md .claude/skills docs/references/component-inventory.md docs/specs test`
- `! node test/repo/shell-text.mjs --strict`
- (guard) `node test/repo/citations.mjs`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/engine src/ui/app.js src/ui/styles.css src/ui/sections src/ui/overlays src/ui/icons.js src/ui/shell-roles.mjs scripts test/ui test/smoke)$(git ls-files --others --exclude-standard -- src/engine src/ui/app.js src/ui/styles.css src/ui/sections src/ui/overlays src/ui/icons.js src/ui/shell-roles.mjs scripts test/ui test/smoke)"`

### Notes
- add `.radix-tip` to the `"step-4"` PENDING list (the canvas family, beside `.radix-badge`); it landed with T-0043 after the plan's probe and is the one flagged declaration outside ALLOW and PENDING, so without it the step's `node test/repo/shell-text.mjs` criterion is red. Evidence: `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/src/ui/styles.css:752-758` (`.radix-tip { ... line-height: 1.4; ... }`), `git log -S".radix-tip" --oneline -1 -- src/ui/styles.css` prints `e93bded4 Radix tooltip popover ... (T-0043) (#824)`; a probe replicating the gate's ALLOW, kinds and five PENDING families over the current stylesheet printed `families: {"step-4":38,"step-5":64,"step-8":11,"step-6":74,"step-7":49}` and `uncovered: 1 .radix-tip | line-height: 1.4`.

## Notes
- plan review: add `.radix-tip` (landed with T-0043, src/ui/styles.css ~752) to the "step-4" PENDING list in the gate, or `node test/repo/shell-text.mjs` is red.
