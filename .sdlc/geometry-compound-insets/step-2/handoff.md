## Task goal
User request 2026-10-08, with two screenshots (a segmented control, "Mode | Single", whose container has a visible inner padding around the active segment; and the Color left-pane header where the "toggle left pane" icon button is a bordered circle next to the "ANALYSIS Neutral" title):

1. The palette name input is not styled (find it: the palette inspector's name field in `src/ui/sections/color.js`; it should take the shell's input look: `--sh-control-height`, inset, text, radius, border like the other inputs in `src/ui/styles.css`).
2. A system for compound insets, for components that contain repeated parts such as a listbox (options) and a segmented control (segments). The user's rule, in their words: "I usually take half of the composed component and remove it (segment or button/option/trigger/etc) and give it to the container so the net effect and alignment is held. This also needs to be factored in to how radius composes." Interpretation to confirm in the design: the container gets padding equal to half of the child's inset, and the child's own inset shrinks by the same amount, so the child's content stays where it would be without the container and the outer size is unchanged; and the container's radius composes as the child's radius plus that container padding (concentric corners), so the child's rounded corner stays concentric with the container's. Express this in the geometry engine as per-cell fields or derived roles (names consistent with the existing `--control-*`, `--chip-*`, `--radius-*` roles and the prefix contract), emitted through CSS, DTCG, Figma, MCP and the consumer skills the same way as the other roles, and used by the app shell's `.segmented` rule (`src/ui/styles.css`) and any listbox or menu component in the shell.
3. Icon buttons should be square when all inset and icon/glyph container sizes add up (width = height = control height; icon box centered), borderless and ghost (no border, transparent until hover/active). Apply to the shell's icon-only buttons (the left-pane toggle in the header, and other icon-only buttons found with a repo search).

## Step 2: Maintainer and consumer records, MCP descriptions, and the ADR
level: L2
### Read first
- `docs/references/AGENTS.md`
### Do
Depends on: step 1. `test/plugin/geometry-tokens.mjs` checks every role a skill names against the engine, so this step cannot land before it.
1. Move every count from 14 to 16 fields (27 × 16, 9 × 16, 432 FLOAT, 144 ALIAS) and from 13 to 15 roles, and name the two new fields and roles, in:
   - `docs/references/geometry/README.md` (:59, :69, :94-95; add `part-height` and `part-inset` to the field table).
   - `.claude/skills/geometry-system/SKILL.md` (:51, :103, :108, :128), plus `references/foundations.md` (:14, :114), `references/rubric.md` (:15, including its `378`) and `references/best-practices.md` (:53).
   - `.claude/skills/maintaining-figma-plugins/SKILL.md:115`.
   - `plugin/ultimate-tokens/skills/geometry-tokens/SKILL.md` (:32 "13 resolved roles", and the grammar lists at :45-48), plus `references/controls.md`, `references/detail.md`, and the comments in `scripts/dimension-parity.mjs` (:5, :23).
2. Teach the compound recipe in `plugin/ultimate-tokens/skills/geometry-tokens/references/controls.md`, as a CSS block that uses the literal spans `var(--control-part-height)`, `var(--control-part-inset)`, `var(--radius-control)` and `var(--radius-inset)`:
   - A segmented or tab container pads `var(--control-part-inset)` (minus its border width) and takes `var(--radius-control)`.
   - Each segment is `var(--control-part-height)` tall with `var(--control-part-inset)` inline padding and `var(--radius-inset)`.
   - A listbox or menu wrap takes `var(--radius-card)` around `var(--radius-control)` options.
   - An icon-only button is square at `var(--control-height)` with `padding: 0`.
   - Also state, in prose, that `--chip-*` is a different thing: it snaps to a ladder row, while the part is exact.
3. Add `part-height` and `part-inset` to both MCP descriptions in `mcp/brand-kit-core.mjs` (:87 roles sentence, :129 `get_geometry` field list). The cells pass through unchanged (architect Carry forward). Regenerate with `npm run gen:mcp-assets`.
4. Append `## ADR-033: Compound containers take half the part's inset and compose radius concentrically` to `docs/references/decision-records.md`, before `## Quick map`. If ADR-033 was taken by another lane, use the next free number; the criterion matches the heading text, not the number. Content:
   - The half law, with the user's words from the handoff.
   - Maison's listbox matches it and its segmented quarter does not.
   - No new radius field.
   - Rejected: resolver fields, a `radius-part` field, `data-size` on `.seg-sm`.
   - Consequences: 16 fields, 15 roles, 432/144 Figma variables, the three micro cells where the chip is taller than the part.
5. Leave ADR-032's own text (`decision-records.md` ~:1101-1137) and `docs/references/changelog.md` as written: they are history, and ADR-033 supersedes the count.
6. `.sdlc/notes.md:12` fix-now: reword the `test/plugin/geometry-tokens.mjs` comment that still says ".control-* class it names must match" to name the `--control-*` and `--chip-*` roles.
7. No U+2014 anywhere.
### Acceptance criteria
- (red) `! grep -rnE '27 ?[x×] ?14|9 ?[x×] ?14|14 (per-cell|fields|kebab)|13 (resolved )?roles|(^|[^0-9])378([^0-9]|$)' docs/references/geometry/README.md .claude/skills/geometry-system .claude/skills/maintaining-figma-plugins/SKILL.md plugin/ultimate-tokens/skills/geometry-tokens mcp/brand-kit-core.mjs`
- (red) `grep -qF -- '--control-part-height' plugin/ultimate-tokens/skills/geometry-tokens/SKILL.md && grep -qF -- '--control-part-inset' plugin/ultimate-tokens/skills/geometry-tokens/SKILL.md && grep -qF -- 'var(--control-part-height)' plugin/ultimate-tokens/skills/geometry-tokens/references/controls.md && grep -qF -- 'var(--radius-inset)' plugin/ultimate-tokens/skills/geometry-tokens/references/controls.md && node test/plugin/geometry-tokens.mjs`
- (red) `grep -qF 'partInset' .claude/skills/geometry-system/SKILL.md && grep -qF 'part-height' docs/references/geometry/README.md`
- (red) `test "$(grep -c 'part-height' mcp/brand-kit-core.mjs)" -ge 2 && node test/mcp/core.mjs`
- (red) `n=$(grep -nE "^## ADR-[0-9]+: .*[Cc]ompound" docs/references/decision-records.md | head -1 | cut -d: -f1) && q=$(grep -n "^## Quick map" docs/references/decision-records.md | cut -d: -f1) && test -n "$n" && test "$n" -lt "$q"`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/ui/styles.css src/ui/app.js src/ui/sections/color.js src/ui/model.mjs src/ui/persist.js src/ui/overlays figma/binder figma/plugin/code.js)$(git ls-files --others --exclude-standard -- src/ui/overlays figma/binder)"`
