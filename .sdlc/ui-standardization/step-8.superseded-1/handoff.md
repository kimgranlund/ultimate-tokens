## Task goal
The editor shell is one standardized UI: a single text-role system, one inset and radius composition rule for every container, one anatomy table for every control, one glyph motion set, all derived from the Maison ladder cell, with the shell defaulting to the product tier, sm scale, md size.

## Step 8: Control and container anatomy, the chip and badge split, and the gate made strict
level: L4
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
### Do
Depends on: step 7. Edits `src/ui/styles.css` (the `"step-8"` family and the controls named below), `test/repo/shell-text.mjs`, `test/repo/ui-polish.mjs` and doc cites. The anatomy and composition tables are step 1's `CONTROL_ANATOMY` and `CONTAINER_COMPOSITION`.
1. Controls on the control role (handoff Intent part 3):
   - `button`: `font: var(--ui-control-font);` replaces `font: inherit; font-size: var(--sh-control-text);`.
   - The text-input and select rule (`input[type="text"], input[type="search"], select`, ~:1700) and `.linklike`: `font: var(--ui-control-font)` replaces `font: inherit`.
   - `.segmented button`: its `font-weight: 550` goes; the role's 500 applies.
   - `button.primary`, `.chip.on`, and the `.on` part rule of `.segmented`/`.figma-files`/`.radix-files`: `font-weight: var(--ui-weight-strong)` (architect: the `.on` and `.primary` state weight).
   - `.map-raw-select.ov, .map-raw-input.ov`: `var(--ui-weight-strong)`. `.map-raw-select, .map-raw-input`: `border-radius: var(--sh-control-radius)`, replacing 5px.
   - `.tyi-voice-name`: `font: var(--ui-control-font)` (replacing `font: inherit` and weight 650), `gap: var(--sh-control-inset)`; `:focus-visible` `border-radius: var(--sh-radius-mark)`.
   - `.tyi-font-input`: any literal moves to the control roles.
2. Chips, by the user's ruling: "chips and segmented controls use the BUTTON/CONTROL text size (`--ui-control`, step 0), not the compact chip row", and the chip's "height and padding stay the cell's compact chip row only where a chip is a badge".
   - `.chip` (the base, which is the status badge `<span>`): `font: var(--ui-badge-font); letter-spacing: var(--ui-badge-tracking); min-block-size: var(--sh-chip-height); padding-inline: var(--sh-chip-inset); gap: calc(var(--sh-chip-inset) / 2); border-radius: calc(var(--sh-chip-height) / 2);`
   - `button.chip` (the interactive chip): `font: var(--ui-control-font); letter-spacing: var(--ui-control-tracking); min-block-size: var(--sh-control-height); padding-inline: var(--sh-control-inset); gap: calc(var(--sh-control-inset) / 2); border-radius: calc(var(--sh-control-height) / 2);`. The pill shape stays: the ruling moves text, height and padding, not the shape.
   - Which `.chip` uses are controls, all `chip(..., { mode: "interactive" })` and so `button.chip`: the damp presets (`sections/color.js:176`, `.damp-presets`), the breakpoint width quick-picks (`app.js:1934`, `.mode-preset`), and the export systems (`overlays/drawer.js:163`, `.sys-chip`).
   - Which are badges: the mapping drift summary (`sections/color.js:1318`, a `span.chip` with `.in-sync`/`.has-drift`). The other badges are already on the badge role: `.acct-badge`, `.radix-badge`, `.tok-sub`, `.geom-chip`, `.key-slot .key-place`.
   - Not text chips: `.newpal-chip` (a 32px swatch toggle), `.geom-ex-chip` (specimen), `.tile-tag` (gallery). No JS changes: the helper `chip()` (`app-helpers.mjs:539`) already emits `button` or `span`.
3. Switch (anatomy row: track 1.75I by I, thumb I - 2e, edge e):
   - `--ctl-thumb: calc(var(--sh-control-icon) - 2 * var(--ui-edge));` in the alias block.
   - `.toggle .track`: `border-radius: calc(var(--sh-control-icon) / 2)`.
   - `.toggle .track::after`: `top: var(--ui-edge); left: var(--ui-edge)`. Its `border-radius: 50%` stays. The `.on` translate stays `calc(0.75 * var(--sh-control-icon))`.
   - `.toggle`: `gap: var(--sh-control-inset)`, the label gap P.
4. Menu wrap: `.tools-menu:popover-open` `border-radius: var(--sh-radius-card)`, the same number as today's `calc(radius + part-inset)`.
5. Containers already on the compound law (T-0027): `.segmented`/`.figma-files`/`.radix-files`, the tab row and icon-only. No input group exists in the shell (`git grep -n "input-group" src/ui` is empty); the table records the rule for the first one.
6. `test/repo/shell-text.mjs`: remove the `"step-8"` key, then the empty `PENDING` object. `--strict` stays accepted.
7. `test/repo/ui-polish.mjs`: add at least five checks whose names start `anatomy: `, each with its known-bad sample in `BAD`, aligned by index (keep the `i === 5` special case):
   - the interactive chip row
   - the badge chip row
   - the switch edge and thumb
   - the menu wrap on `--sh-radius-card`
   - `button` on `--ui-control-font`
8. Citations: repair STALE `styles.css:N` cites in `docs/references/component-inventory.md` and `docs/specs/app-shell.md` by number.
9. Run `node test/repo/shell-text.mjs --strict`, `node test/repo/ui-polish.mjs`, `node test/repo/citations.mjs`.
### Acceptance criteria
- (red) `node test/repo/shell-text.mjs --strict && ! grep -qE '"step-[0-9]+"' test/repo/shell-text.mjs`
- (red) `node -e 'const c=require("fs").readFileSync("src/ui/styles.css","utf8").replace(/\/\*[\s\S]*?\*\//g,"");const R=[...c.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m)=>[m[1].trim().split(/\s*,\s*/).map((s)=>s.replace(/\s+/g," ")),m[2]]);const body=(s)=>R.filter(([l])=>l.includes(s)).map((r)=>r[1]).join(";");const need=[["button.chip","min-block-size: var(--sh-control-height)"],["button.chip","padding-inline: var(--sh-control-inset)"],["button.chip","font: var(--ui-control-font)"],["button.chip","border-radius: calc(var(--sh-control-height) / 2)"],[".chip","font: var(--ui-badge-font)"],[".chip","min-block-size: var(--sh-chip-height)"],[".chip","border-radius: calc(var(--sh-chip-height) / 2)"],["button","font: var(--ui-control-font)"],[".toggle .track","border-radius: calc(var(--sh-control-icon) / 2)"],[".toggle .track::after","top: var(--ui-edge)"],[".tools-menu:popover-open","border-radius: var(--sh-radius-card)"],["button.primary","font-weight: var(--ui-weight-strong)"],[".chip.on","font-weight: var(--ui-weight-strong)"]];const miss=need.filter(([s,d])=>!body(s).includes(d));miss.forEach((m)=>console.log("missing",m.join(" | ")));process.exit(miss.length?1:0)'`
- (red) `test "$(grep -c '\["anatomy: ' test/repo/ui-polish.mjs)" -ge 5 && node test/repo/ui-polish.mjs`
- (guard) `node test/repo/citations.mjs`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/ui/app.js src/ui/app-helpers.mjs src/ui/sections src/ui/overlays src/ui/icons.js test/ui test/smoke scripts .claude/skills)$(git ls-files --others --exclude-standard -- src/ui/sections src/ui/overlays test/ui test/smoke scripts)"`

## Notes
- step 6 verifier ruling: `.settings-nav-item.on` (styles.css ~:1393) now matches rest and hover ink, so selected shows only by background and looks like hover. Give it a distinct selected cue, a state-colour exception the role rules allow (accent ink or an inset marker), and keep the gate green.

## Scope widened
- `test/smoke/smoke.mjs`: allowed by a conductor scope decision (steps.py widen): verifier-L3 plan defect: smoke.mjs:365-368 chip predicate pins the pre-ruling chip text; drop .chip from it (one line), the user ruled interactive chips use the control size
