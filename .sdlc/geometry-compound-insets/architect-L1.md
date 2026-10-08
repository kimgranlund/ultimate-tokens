<!-- role=architect level=L1 model=fable effort=high -->
## Approach

The compound rule is one law the engine already half-encodes. Every cell carries `radiusInset = max(0, radiusControl - inset/2)` and `radiusCard = radiusControl + inset/2` (`src/engine/geometry.mjs:134-135`): the concentric corner for a child padded in by `inset/2`, and for a wrap padded out by `inset/2`. The user's rule ("take half of the component's inset, give it to the container, net alignment held") is the dimension side of that same half. So the design adds two per-cell fields and no new radius field: `partHeight = height - inset` (the repeated part's height inside a control-sized container, so the outer stays `height`) and `partInset = inset / 2` (the part's remaining inset, and the container's padding, one number). The radius composition is documented, not built: a control-sized container (segmented) uses `radius-control` outside and `radius-inset` on its parts; a wrap around full-height controls (listbox, card, popover) uses `radius-card` outside and `radius-control` inside. The chip stays a separate thing: it snaps to a ladder row (`chipHeight <= height - inset`), the part is exact; `chipHeight <= partHeight` on every cell is a gate.

Maison does not have one compound rule, it has two. Its listbox (`src/components/select/listbox/listbox.styles.css`: container `padding: inset/2`, option radius `--r-inset`, container `--r-control`) is the half law. Its segmented (`segmented.styles.css`: container `padding: inset/4`, item `height - inset/2`, item radius `r-control - inset/4`) is a quarter. The engine adopts the half (the user's words, the listbox, and the existing radius fields all agree) and names the segmented quarter as the deviation it does not match. Maison's icon-only rule (`button.styles.css:294-300`: `inline-size = control height`, `padding-inline: 0`) and ghost tone are matched as written.

Emit path: the fields join `CELL_FIELDS` (14 to 16), which every emitter iterates (CSS primitives, sizes-only CSS, DTCG, Figma floats, Figma modes 27 x 16 FLOAT + 9 x 16 ALIAS). The CSS roles `--control-part-height` and `--control-part-inset` are derived lines in the `:where(*, :host)` block beside the four radius roles (`geometry.mjs:272-278`), not new `RESOLVER_FIELDS`, so the 81 ctx-cell hooks and the nine-term calcs do not move. Figma cannot calc, which is why the fields are primitives and not "consumers compute it". ds-export spreads cells wholesale and the MCP serves `cells` as-is, so both carry the fields with no code; only descriptions and the one hand-rolled compound (`ds-export.js:614`, `menuPad = 4`) change. No persist schema change: both fields derive from `{tier, scale, radius, spaceBase}`.

Shell: two aliases (`--sh-part-height`, `--sh-part-inset`, fallbacks 24px / 4px, the product-md-md round cell), `.segmented` rewritten on them (today it hand-rolls `padding: 2px`, `height - 6px`, radius `var(--r)`, so its corners are not concentric), a `button.icon-only` class for the pane toggle (the bordered circle is `button.ghost { border-color }` at `styles.css:191` plus `.pane-toggle` padding at `:424`; this shell's `.ghost` means outlined, the opposite of the ticket's wording, and is not renamed here). The palette Name input is reproduce-first: the code says it is styled (`styles.css:206` matches `input[type="text"]`, `field()` uses `setAttribute`, and the `.tyi-font-input` comment at `:1459-1461` says it copies this very field), so no fix is designed until a smoke screenshot shows the defect. Sequencing: engine and record leaves first (they touch no T-0025 or T-0026 file), shell leaves after T-0025 lands. Manifest: `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.sdlc/geometry-compound-insets/decompose/manifest-v1.json` (plan mode, coverage clean), report beside it.

## Interfaces

- `src/engine/geometry.mjs` `buildCell` (:114-137): adds `partHeight: height - row.inset`, `partInset: row.inset / 2`.
- `src/engine/geometry.mjs` `CELL_FIELDS` (:203-208): becomes `export const`, 16 entries, `["part-height","partHeight"], ["part-inset","partInset"]` after `min-width`.
- `src/engine/geometry.mjs` `geomResolverCSS` (:272-278): two lines, `--control-part-height: calc(var(--control-height) - var(--control-inset));` and `--control-part-inset: calc(var(--control-inset) / 2);`. `RESOLVER_FIELDS` stays 9.
- `src/engine/geometry.mjs` header (:1-30): the compound and concentric law in prose.
- `src/ui/sections/geometry.js:11-17`: `TABLE_FIELDS` deleted, imports `CELL_FIELDS`.
- `src/engine/ds-export.js:614-615`: `menuPad = mdAnchor(geomSc).size.partInset` (fallback 4); `menuItemRadius = max(0, rLg - menuPad)` unchanged (the popover is `rLg` by #480).
- `src/ui/styles.css:74-85`: `--sh-part-height: var(--control-part-height, 24px); --sh-part-inset: var(--control-part-inset, 4px);`
- `src/ui/styles.css:880-903` `.segmented`: `box-sizing: border-box; block-size: var(--sh-control-height); padding: calc(var(--sh-part-inset) - 1px); border-radius: var(--sh-control-radius); gap: 0;` button `min-block-size: var(--sh-part-height); padding-inline: var(--sh-part-inset); border-radius: var(--sh-radius-inset)`. `.seg-sm` on the chip roles as CSS calc (`padding: calc(var(--sh-chip-inset) / 2 - 1px)`, button `calc(var(--sh-chip-height) - var(--sh-chip-inset))`). `.canvas-seg` keeps `inset * 2`.
- `src/ui/styles.css`: new `button.icon-only { inline-size: var(--sh-control-height); block-size: var(--sh-control-height); box-sizing: border-box; padding: 0; justify-content: center; border-color: transparent; background: transparent; }` + hover/active fill; `.pane-toggle` padding override (:424) removed, `.on` color only.
- `src/ui/app.js:1463` `paneToggle`: class `icon-only pane-toggle ...`, `ghost` dropped.
- Tests: `test/engine/geometry.mjs:119,123,132,166` (27 x 16, roles list +2, 81 unchanged, 16 fields), `test/figma/migrations.mjs:63` (378 to 432), `test/smoke/smoke.mjs:269-281` (bind part-height to `height`, part-inset to `padding-left`), `test/ui/headless-boot.mjs` one lettered group, `test/engine/ds-gates.mjs`.
- Records: `docs/references/geometry/README.md:69,94`, `.claude/skills/geometry-system/{SKILL.md:51,103,108,128, references/foundations.md:14,114, rubric.md:15, best-practices.md:53}`, `plugin/ultimate-tokens/skills/geometry-tokens/{SKILL.md:32,45-48, references/controls.md:39-67, scripts/dimension-parity.mjs:5,23 comments}`, `mcp/brand-kit-core.mjs:87,129`, a new ADR appended to `docs/references/decision-records.md` before its Quick map.

## Constraints and assumptions

- The half law (container pad = inset/2, part height = height - inset) is the one compound rule, and Maison's segmented quarter (`segmented.styles.css`: `padding: inset/4`, item `height - inset/2`) is not matched: verified Maison's listbox and the engine's `radiusInset`/`radiusCard` (`geometry.mjs:134-135`) both encode the half; the user's words say half | unverified as the user's ratification
- Role names `--control-part-height` / `--control-part-inset` (field kebab `part-height` / `part-inset`): `group` collides with the container tier's `--inset-control-group` (`geometry.mjs:177`) | unverified as the user's naming choice
- The shell's `.segmented` keeps its 1px border inside the half (`padding: calc(part-inset - 1px)`), so the outer equals `--control-height`; Maison's container is borderless | unverified as the user's choice
- The ds-export menu card keeps `rLg` as its popover radius (#480 AdiaUI parity, `ds-export.js:605-607`) and takes only `menuPad` from the engine | verified by reading the ratified comment
- Adding derived fields needs no persist schema bump: `persist.js:368-369` stores `{tier, scale, radius, spaceBase}`, cells are derived | verified by grep `cells|geometry` in `src/ui/persist.js`
- Nothing under `figma/` enumerates the 14 field names statically; `mode-apply-plan.mjs:247-262` and `code.js:362-363` read fields off the plan's own `size/` variables, so the engine slice touches no T-0026 file | verified by grep `chip-inset|radius-card` over `figma/binder`, `figma/plugin/code.js`, `figma/plugin/manifest.json` (empty)
- The shell receives the resolver live: `app.js:2341` injects `geomTokensSizesCSS(sc) + geomResolverCSS(sc)` at render, no generated asset | verified by reading `_applyShellGeometry`
- `icon()` sizes its svg `var(--sh-control-icon)` (`src/ui/icons.js:51`), so an icon-only square needs an explicit `inline-size = height`, since the base `button` has a 1px transparent border (`styles.css:168-183`) that breaks the centering sum | verified by reading both
- The MCP tests pin only 27 cells and md fields, not the field count (`test/mcp/brand-kit.mjs:171`, `core.mjs:57`) | verified by grep
- The palette Name input is styled by `styles.css:206` and no override was found (grep `input` over styles.css); the reported defect is not reproducible from code | unverified, reproduce by smoke screenshot before any change

## Rejected alternatives

- Resolver fields (11 instead of 9) for the part roles: doubles the ctx-cell hooks for two values that are pure functions of resolved roles; the radius roles already set the derived-line precedent.
- CSS-only roles, no engine fields: Figma floats and DTCG consumers cannot calc; `CELL_FIELDS` is the lockstep contract (`geometry-system` skill rule 4).
- A `radius-part` field or alias: `radiusInset` is that number; a duplicate is decoration.
- Matching Maison's segmented quarter: contradicts the user's rule, the engine's existing radius fields and Maison's own listbox; two laws would need two field sets.
- `data-size="sm"` on `.seg-sm` (Maison's way): the `--sh-*` aliases are declared once on the host and inherit resolved, so a nested context changes `--control-*` but not `--sh-*`; CSS calc on the chip roles is the smaller honest change.
- Renaming the shell's `.ghost` (outlined) to match the ticket's ghost (borderless): `.map-head .ghost` also uses it; a new `icon-only` class is additive.

## Risks

- The user meant Maison's quarter after all: then `partInset = inset/4` and `partHeight = height - inset/2`, one line each in `buildCell`, but `radiusInset` no longer composes and a third radius field appears.
- The Name input "not styled" is a Safari rendering of `width: 100%` inside `.field`, not a missing rule; a builder who styles it blind adds a second rule for the wrong cause.
- `test/plugin/typography-tokens.mjs` matched the count pattern (6 hits) but was not opened; if it pins the geometry field count it is a missing site.
- Adding header and field lines to `geometry.mjs` shifts every cited line number; `test/repo/citations.mjs` goes red unless `scripts/audit-citations.mjs` runs in the same step.
- No listbox or menu exists in the shell, so the ticket's "listbox pixel check" has only the ds-export menu card and the Geometry section's examples as targets.

## Carry forward

- Compound law: container pad `partInset = inset/2`, part `partHeight = height - inset`, container radius `radiusControl`, part radius `radiusInset` (`geometry.mjs:134`), wrap radius `radiusCard` (`:135`); no new radius field.
- `CELL_FIELDS` `src/engine/geometry.mjs:203-208` is the one emit list; it is not exported today; `src/ui/sections/geometry.js:11-17` hand-copies it as `TABLE_FIELDS`.
- Derived role lines live in the `:where(*, :host)` block, `geometry.mjs:272-278`; `RESOLVER_FIELDS` (:236) stays 9, ctx-cell count stays 81 (`test/engine/geometry.mjs:132`).
- Count literals to move 14 to 16: `test/engine/geometry.mjs:119,166`; `test/figma/migrations.mjs:63` (378 to 432); roles list `test/engine/geometry.mjs:123` (+2 names); found by `grep -rnoE "(27 ?[x×] ?14|14 (per-cell|fields|kebab|cell)|CELL_FIELDS|radius-card)"` over src test figma/binder mcp plugin docs/specs docs/references scripts .claude/skills.
- Record pins: `docs/references/geometry/README.md:69,94`; `.claude/skills/geometry-system/SKILL.md:51,103,108,128`, `references/foundations.md:14,114`, `rubric.md:15`, `best-practices.md:53`; `plugin/.../geometry-tokens/SKILL.md:32` ("13 resolved roles"), `:45-48`; `mcp/brand-kit-core.mjs:87,129`.
- `dimension-parity.mjs:23,25` reads FIELDS off `s.cell` and ROLES off `geomResolverCSS`, so it needs only comment edits; `test/plugin/geometry-tokens.mjs` has no count pin.
- Figma: nothing under `figma/` enumerates field names (grep `chip-inset|radius-card` over `figma/binder`, `figma/plugin/code.js`: empty); engine slice is T-0026-safe.
- MCP: cells pass through (`test/mcp/brand-kit.mjs:171` pins 27 cells only); only descriptions change.
- Smoke resolver cases `test/smoke/smoke.mjs:269-281`: custom properties compute to calc text, bind part-height to `height` and part-inset to `padding-left` on the probe `<i>`.
- Shell roles arrive live, `src/ui/app.js:2341` (`_applyShellGeometry`), aliases at `src/ui/styles.css:74-85`; `.segmented` at `:880-903`, `button` base `:168-183`, `button.ghost` `:191` (outlined), `.pane-toggle` `:423-427`.
- Icon-only buttons: one found, `src/ui/app.js:1469` (`paneToggle`), by the perl regex `h\("button",\s*\{...\}\s*,\s*icon\([^)]*\)\s*\)` over `src/ui/app.js src/ui/sections/*.js src/ui/overlays/*.js`; `app.js:971` has a text kid, not icon-only.
- Shell listbox or menu: none (`grep -nE "listbox|\.menu|combobox" src/ui/styles.css` finds only `.segmented` and `.tyi-font-input`); the ds-export menu card `src/engine/ds-export.js:614-615` is the one compound consumer, gate `test/engine/ds-gates.mjs`.
- Palette Name input: `src/ui/sections/color.js:1666-1693`, styled by `styles.css:206`; `src/ui/icons.js:51` sizes svg by `--sh-control-icon`.
- Maison sources: `/Users/kimgranlund/Projects/maison/ui-kit-maison/src/components/{segmented/segmented.styles.css, select/listbox/listbox.styles.css, select/listbox/option/option.styles.css, menu/menu.styles.css, button/button.styles.css:294-300}`.
- Manifest `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.sdlc/geometry-compound-insets/decompose/manifest-v1.json` (plan mode, clean); the handoff's Context line `Decomposition: decompose/report.md` was not added (Edit disabled for this role).
