// geometry.mjs, the GEOMETRY / dimensional engine: the spatial analog of the color & type engines.
// A few discrete axes → a fixed ladder → derived control geometry → DTCG / CSS / Figma tokens. Pure, no DOM.
//
// The Maison ui-kit geometry system (T-0017, user decision 2026-10-07), in our token names. Maison's
// geometry is not a ramp with a height knob: it is a FIXED 25-row ladder (height → inset, icon; the
// text column lives in type.mjs as UI_TEXT, so control text per height is one table) addressed by
// three discrete axes, tier × scale × size:
//
//   height = TIERS[tier].base + TIERS[tier].offsets[scale] + SIZES[size] · TIERS[tier].step
//
// 27 cells (3 tiers × 3 scales × 3 sizes), every one on-table. Each cell reads its ladder row, then:
//
//   THE CENTERING LAW, inset = (height − icon) / 2, holds on every ladder row (Maison's generator
//   asserts it too): every glyph sits in one square icon box, centered in a control of side = height.
//   text          = type's UI text at the height (opts.typeScale.uiText when supplied, else uiText)
//   compact row   = the first ladder row, in descending height, with height ≤ height − inset
//                   (else the smallest row); captionText = chipText = its text, chipInset = its inset,
//                   chipHeight = min(its height, height)
//   iconRatio     = icon / height (unitless, unrounded)
//   radiusControl = text · k.text + height · k.height, k = RADIUS_MODES[the kit's radius mode]
//   radiusMark    = radiusControl · iconRatio
//   radiusInset   = max(0, radiusControl − inset / 2);   radiusCard = radiusControl + inset / 2
//   partHeight    = height − inset;   partInset = inset / 2
//
// THE COMPOUND LAW, for a container of repeated parts (segmented control, listbox, menu): half the
// part's inset moves to the container, so the part's content and the outer size stay where they were.
// A control-sized container pads by partInset and keeps radiusControl. Its repeated part is partHeight
// tall, keeps partInset inline, and takes radiusInset, so the two corners stay concentric. A wrap
// around full-height controls (listbox, menu, card) takes radiusCard outside and radiusControl inside.
// The chip snaps to a ladder row and the part is exact. On the three micro cells where no ladder row
// fits under height − inset (micro-sm-sm, micro-sm-md, micro-md-sm), the chip falls back to the 12px
// row and is taller than the part.
//
// The CSS export adds Maison's context RESOLVER in our names: `data-tier` / `data-scale` / `data-size`
// / `data-radius` set 0/1 indicators (`--ctx-*`), and the roles (`--control-*`, `--chip-*`,
// `--radius-control/-mark/-inset/-card`, `--control-part-height/-inset`) are a calc sum of products
// over the nine cells of the active tier, or derived from those sums. The roles equal Maison's per-instance override hooks, so they are never prefixed.
// The CONTAINER tier (the M3 radius ladder, space, insets, gaps, borders, focus) is a separate concern
// from control geometry: it derives from `spaceBase` alone.

import { COLLECTIONS } from "./collections.js";
import { uiText } from "./type.mjs";

const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

// TIERS, Maison's definition.mjs verbatim: each tier is a base height, a per-scale offset and the
// per-size step. SIZES is the size axis as a step multiplier; SCALES the scale axis in order.
export const TIERS = {
  content: { base: 48, offsets: { sm: -12, md: 0, lg: 16 }, step: 8 },
  product: { base: 32, offsets: { sm: -4, md: 0, lg: 4 }, step: 8 },
  micro: { base: 16, offsets: { sm: -2, md: 0, lg: 2 }, step: 2 },
};
export const SCALES = ["sm", "md", "lg"];
export const SIZES = { sm: -1, md: 0, lg: 1 };
const SIZE_IDS = Object.keys(SIZES);

// RADIUS_MODES, Maison's radius k table (scripts/generate.mjs:58): the control corner is
// text · k.text + height · k.height, so default/round/sharp follow the text and pill follows the height.
export const RADIUS_MODES = {
  default: { text: 0.5, height: 0 },
  round: { text: 1, height: 0 },
  sharp: { text: 0.25, height: 0 },
  pill: { text: 0, height: 0.5 },
};

export const DEFAULT_GEOMETRY = { tier: "product", scale: "md", radius: "round", spaceBase: 4 };

// LADDER_ROWS, Maison's component-geometry.csv (height, inset, icon), in its own descending order,
// which the compact-row rule depends on. The text column is type.mjs's UI_TEXT.
export const LADDER_ROWS = [
  { height: 96, inset: 24, icon: 48 }, { height: 92, inset: 23, icon: 46 }, { height: 88, inset: 22, icon: 44 },
  { height: 84, inset: 21, icon: 42 }, { height: 80, inset: 20, icon: 40 }, { height: 76, inset: 19, icon: 38 },
  { height: 72, inset: 18, icon: 36 }, { height: 68, inset: 17, icon: 34 }, { height: 64, inset: 16, icon: 32 },
  { height: 60, inset: 15, icon: 30 }, { height: 56, inset: 14, icon: 28 }, { height: 52, inset: 13, icon: 26 },
  { height: 48, inset: 12, icon: 24 }, { height: 44, inset: 11, icon: 22 }, { height: 40, inset: 10, icon: 20 },
  { height: 36, inset: 9, icon: 18 }, { height: 32, inset: 8, icon: 16 }, { height: 28, inset: 7, icon: 14 },
  { height: 24, inset: 5.5, icon: 13 }, { height: 22, inset: 5, icon: 12 }, { height: 20, inset: 4.5, icon: 11 },
  { height: 18, inset: 4, icon: 10 }, { height: 16, inset: 3.5, icon: 9 }, { height: 14, inset: 3, icon: 8 },
  { height: 12, inset: 2.5, icon: 7 },
];

// ladderRow(height), the ladder row at an exact height; off-table is a RangeError, never a nearest
// match (a continuous knob over a discrete standard is the drift the 27-cell validation prevents).
export function ladderRow(height) {
  const row = LADDER_ROWS.find((r) => r.height === height);
  if (!row) throw new RangeError(`ladderRow: no ladder row for height ${height}`);
  return row;
}

// cellHeight(tier, scale, size), Maison's height formula; an unknown axis id is a RangeError.
export function cellHeight(tier, scale, size) {
  if (!has(TIERS, tier) || !SCALES.includes(scale) || !has(SIZES, size)) throw new RangeError(`cellHeight: unknown cell ${tier}-${scale}-${size}`);
  const t = TIERS[tier];
  return t.base + t.offsets[scale] + SIZES[size] * t.step;
}

// CELL_NAMES, every cell `{tier}-{scale}-{size}` in Maison's geometryRows order (content, product,
// micro; then scale sm, md, lg; then size sm, md, lg). The one place cell order is authored.
const CELL_NAMES = Object.keys(TIERS).flatMap((tier) => SCALES.flatMap((scale) => SIZE_IDS.map((size) => `${tier}-${scale}-${size}`)));

// LEGACY_SIZE_CELLS, the cell that holds each legacy t-shirt step's pixels (XS 20, SM 24, LG 36,
// XL 48, 2XL 64; where a height is shared, product > content > micro, then md > sm > lg). Read by
// sizeAnchor; there is no MD key because MD is the kit default cell.
export const LEGACY_SIZE_CELLS = { XS: "product-sm-sm", SM: "product-md-sm", LG: "product-lg-md", XL: "content-md-md", "2XL": "content-lg-md" };

// orderedSizeNames(scale), the scale's cell names in CELL_NAMES order, never `Object.keys` order.
export function orderedSizeNames(scale) {
  const cells = (scale && scale.cells) || {};
  return CELL_NAMES.filter((n) => has(cells, n));
}
// sizeAnchor(scale, name), the resolved { name, size } for a legacy step name: MD is the kit default
// cell, the other five come from LEGACY_SIZE_CELLS, and a cell name passes through.
export function sizeAnchor(scale, name) {
  const n = name === "MD" ? (scale && scale.cell && scale.cell.name) : (has(LEGACY_SIZE_CELLS, name) ? LEGACY_SIZE_CELLS[name] : name);
  return { name: n, size: scale && scale.cells && scale.cells[n] };
}
// mdAnchor(scale), sizeAnchor's MD case, kept as its own export since it's the single most common one.
export function mdAnchor(scale) {
  return sizeAnchor(scale, "MD");
}

// buildCell, one cell's full geometry from its height, the radius k pair and the text lookup
// (Maison scripts/generate.mjs:36,47-52,70-73).
function buildCell(height, k, textAt) {
  const row = ladderRow(height);
  const compact = LADDER_ROWS.find((r) => r.height <= height - row.inset) || LADDER_ROWS[LADDER_ROWS.length - 1];
  const text = textAt(height);
  const chipText = textAt(compact.height);
  const iconRatio = row.icon / height;
  const radiusControl = text * k.text + height * k.height;
  return {
    height,
    inset: row.inset,
    text,
    icon: row.icon,
    captionText: chipText,
    chipHeight: Math.min(compact.height, height),
    chipInset: compact.inset,
    chipText,
    iconRatio,
    minWidth: height, // the 1:1 floor, an icon-only control is at least square
    partHeight: height - row.inset, // the compound law: a repeated part inside a control-sized container
    partInset: row.inset / 2,
    radiusControl,
    radiusMark: radiusControl * iconRatio,
    radiusInset: Math.max(0, radiusControl - row.inset / 2),
    radiusCard: radiusControl + row.inset / 2,
  };
}

// The radius ladder = Material 3's shape-corner scale, verbatim (0·4·8·12·16·28 + full pill). M3 uses
// ONE fixed shape scale, so we adopt it as-is; `exports.js` seeds Tailwind/shadcn/Panda/Radix from it.
// The control's own corner is the per-cell radiusControl, a separate, text-linked value.
const M3_CORNERS = { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 28, full: 9999 };

// the layout-spacing scale (--space-*): page gutters, card/stack gaps, section rhythm. A SEPARATE concern
// from control geometry (the law above), the space BETWEEN components, not the padding inside one. A
// roughly-geometric ladder of `spaceBase` multiples (0·1·2·3·4·6·8·12·16·24).
const SPACE_STEPS = [0, 1, 2, 3, 4, 6, 8, 12, 16, 24];

// geomScale, the resolved geometry for a config { tier, scale, radius, spaceBase }. An unknown id or
// key falls back to DEFAULT_GEOMETRY. `cells` holds all 27 cells (the kit's radius mode applies to
// every one); `cell` is the kit default `{tier}-{scale}-md`. `opts.typeScale` (optional) composes each
// cell's text from the type scale's height-indexed UI text table, value-neutral at defaults.
export function geomScale(config = {}, opts = {}) {
  const c = config && typeof config === "object" ? config : {};
  const tier = has(TIERS, c.tier) ? c.tier : DEFAULT_GEOMETRY.tier;
  const scale = SCALES.includes(c.scale) ? c.scale : DEFAULT_GEOMETRY.scale;
  const radius = has(RADIUS_MODES, c.radius) ? c.radius : DEFAULT_GEOMETRY.radius;
  const sb = Number(c.spaceBase);
  const spaceBase = Number.isFinite(sb) && sb > 0 ? sb : DEFAULT_GEOMETRY.spaceBase;
  const ui = opts && opts.typeScale && opts.typeScale.uiText;
  const textAt = (h) => (ui ? ui[h] : uiText(h));
  const k = RADIUS_MODES[radius];
  const cells = {};
  for (const name of CELL_NAMES) {
    const [t, s, z] = name.split("-");
    cells[name] = buildCell(cellHeight(t, s, z), k, textAt);
  }
  const cellName = `${tier}-${scale}-md`;
  const radii = { ...M3_CORNERS }; // the fixed M3 shape-corner scale
  const space = {};
  SPACE_STEPS.forEach((m, i) => { space[i] = m * spaceBase; });
  // The CONTAINER tier, semantic names over the space ladder, so a consumer never guesses a raw
  // `--space-N` rung. Insets pad INSIDE a container; gaps separate SIBLINGS within one. Each is a
  // named SPACE_STEPS rung × spaceBase (derived, not hand-picked), so the whole tier follows the
  // spacing rhythm and stays mode-independent like `space`. Control-INTERNAL geometry (inset, the
  // icon box, the chip) lives on the cells above, a different law (centering).
  const insets = { controlGroup: space[2], card: space[4], panel: space[5], dialog: space[6], page: space[7] };
  const gaps = { cluster: space[2], stackTight: space[3], stack: space[4], stackLoose: space[5], grid: space[4], section: space[7] };
  // Strokes, constants, not rhythm: borders don't scale with spacing (a hairline is a hairline at
  // every density), and the focus ring pair is an accessibility contract (offset keeps the ring
  // clear of the control edge so it survives any radius).
  const borders = { thin: 1, thick: 2 };
  const focus = { ringWidth: 2, ringOffset: 2 };
  return { tier, scale, radius, spaceBase, cells, cell: { name: cellName, ...cells[cellName] }, radii, space, insets, gaps, borders, focus };
}

// ── emitters ───────────────────────────────────────────────────────────────────────────────────
// dimUnit(px, unit), a px dimension in the chosen CSS export unit. rem/em = px÷16 (root-relative), stripped
// of trailing zeros; absent / "px" ⇒ `${px}px`. Mirrors type.mjs.
const dimUnit = (px, unit) => (unit === "rem" || unit === "em" ? `${parseFloat((px / 16).toFixed(4))}${unit}` : `${px}px`);

// ns(pfx, name), a geometry namespace token core: native `size`/`radius`/… by default, or
// `{pfx}-size`/`{pfx}-radius`/… when a scheme prefix is set (so a Material scheme namespaces the cell
// primitives and the container ladders under one root: `--md-size-*`, `--md-radius-*`, …). Empty pfx
// ⇒ native. The resolver's roles and `--ctx-*` hooks never take it (Maison's control CSS reads them bare).
const ns = (pfx, name) => (pfx ? `${pfx}-${name}` : name);

// camelCase → kebab-case for the container-tier token names (controlGroup → control-group).
const camelKebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// CELL_FIELDS, the 16 per-cell token fields [emitted kebab name, cell key], in emit order. icon-ratio
// is the one unitless field (a plain number on every surface).
export const CELL_FIELDS = [
  ["height", "height"], ["inset", "inset"], ["text", "text"], ["icon", "icon"],
  ["caption-text", "captionText"], ["chip-height", "chipHeight"], ["chip-inset", "chipInset"], ["chip-text", "chipText"],
  ["icon-ratio", "iconRatio"], ["min-width", "minWidth"], ["part-height", "partHeight"], ["part-inset", "partInset"],
  ["radius-control", "radiusControl"], ["radius-mark", "radiusMark"], ["radius-inset", "radiusInset"], ["radius-card", "radiusCard"],
];
const UNITLESS = new Set(["icon-ratio"]);
const cellValue = (field, v, unit) => (UNITLESS.has(field) ? String(v) : dimUnit(v, unit));

// the per-cell `--size-{cell}-{field}` primitive lines (no :root), one line per cell.
function geomSizeVarLines(scale, indent = "  ", unit = "px", pfx = "") {
  const size = ns(pfx, "size");
  return orderedSizeNames(scale).map((name) => {
    const c = scale.cells[name];
    const p = `--${size}-${name}`;
    return indent + CELL_FIELDS.map(([f, key]) => `${p}-${f}: ${cellValue(f, c[key], unit)};`).join(" ");
  }).join("\n");
}

// the container-tier lines (radius ladder, space, insets, gaps, borders, focus), unchanged in shape.
function geomContainerLines(scale, unit, p) {
  const lines = [];
  for (const [k, v] of Object.entries(scale.radii)) lines.push(`  --${ns(p, "radius")}-${k}: ${dimUnit(v, unit)};`);
  for (const [k, v] of Object.entries(scale.space)) lines.push(`  --${ns(p, "space")}-${k}: ${dimUnit(v, unit)};`);
  for (const [k, v] of Object.entries(scale.insets || {})) lines.push(`  --${ns(p, "inset")}-${camelKebab(k)}: ${dimUnit(v, unit)};`);
  for (const [k, v] of Object.entries(scale.gaps || {})) lines.push(`  --${ns(p, "gap")}-${camelKebab(k)}: ${dimUnit(v, unit)};`);
  for (const [k, v] of Object.entries(scale.borders || {})) lines.push(`  --${ns(p, "border")}-${camelKebab(k)}: ${dimUnit(v, unit)};`);
  for (const [k, v] of Object.entries(scale.focus || {})) lines.push(`  --${ns(p, "focus")}-${camelKebab(k)}: ${dimUnit(v, unit)};`);
  return lines;
}

// RESOLVER_FIELDS, the nine fields the resolver reads per cell (Maison's resolvedFields); the chip
// fields resolve to `--chip-*`, the rest to `--control-*`.
const RESOLVER_FIELDS = ["height", "inset", "text", "icon", "caption-text", "icon-ratio", "chip-height", "chip-inset", "chip-text"];
const roleOf = (f) => (f.startsWith("chip-") ? `--${f}` : `--control-${f}`);
const cssBlock = (selector, decls) => `${selector} {\n${decls.map((d) => `  ${d}`).join("\n")}\n}\n`;
const indicators = (axis, ids, on) => ids.map((id) => `--ctx-${axis}-${id}: ${id === on ? 1 : 0};`);

// geomResolverCSS, Maison's context resolver in our names. It READS the primitives (it never declares
// them): `:where(:root)` is the kit default context (the kit tier's cells as `--ctx-cell-*`, the kit
// scale + size md indicators, the kit radius k pair); `[data-tier]` reassigns the ctx cells to that
// tier's primitives; `[data-scale]`, `[data-size]` and `[data-radius]` set the indicators; and
// `:where(*, :host)` resolves the roles as a sum of products over the nine cells (each term falls back
// to the kit default, as Maison's do), then the four radius roles from them.
export function geomResolverCSS(scale, { unit = "px", prefix = "" } = {}) {
  const size = ns(prefix, "size");
  const kitTier = has(TIERS, scale.tier) ? scale.tier : DEFAULT_GEOMETRY.tier;
  const kitScale = SCALES.includes(scale.scale) ? scale.scale : DEFAULT_GEOMETRY.scale;
  const k = RADIUS_MODES[has(RADIUS_MODES, scale.radius) ? scale.radius : DEFAULT_GEOMETRY.radius];
  const ctxCells = (tier) => SCALES.flatMap((s) => SIZE_IDS.flatMap((z) => RESOLVER_FIELDS.map((f) => `--ctx-cell-${s}-${z}-${f}: var(--${size}-${tier}-${s}-${z}-${f});`)));
  const fieldKey = Object.fromEntries(CELL_FIELDS);
  const roles = RESOLVER_FIELDS.map((f) => {
    const terms = SCALES.flatMap((s) => SIZE_IDS.map((z) => {
      const fallback = cellValue(f, scale.cells[`${kitTier}-${s}-${z}`][fieldKey[f]], unit);
      return `var(--ctx-cell-${s}-${z}-${f}, ${fallback}) * var(--ctx-scale-${s}, ${s === kitScale ? 1 : 0}) * var(--ctx-size-${z}, ${z === "md" ? 1 : 0})`;
    }));
    return `${roleOf(f)}: calc(${terms.join(" + ")});`;
  });
  const out = [
    cssBlock(":where(:root)", [
      ...indicators("scale", SCALES, kitScale),
      ...indicators("size", SIZE_IDS, "md"),
      `--ctx-radius-text: ${k.text};`, `--ctx-radius-height: ${k.height};`,
      ...ctxCells(kitTier),
    ]),
    ...Object.keys(TIERS).map((t) => cssBlock(`:where([data-tier="${t}"])`, ctxCells(t))),
    ...SCALES.map((s) => cssBlock(`:where([data-scale="${s}"])`, indicators("scale", SCALES, s))),
    ...SIZE_IDS.map((z) => cssBlock(`:where([data-size="${z}"])`, indicators("size", SIZE_IDS, z))),
    ...Object.entries(RADIUS_MODES).map(([id, m]) => cssBlock(`:where([data-radius="${id}"])`, [`--ctx-radius-text: ${m.text};`, `--ctx-radius-height: ${m.height};`])),
    cssBlock(":where(*, :host)", [
      ...roles,
      "--radius-control: calc(var(--control-text) * var(--ctx-radius-text, 1) + var(--control-height) * var(--ctx-radius-height, 0));",
      "--radius-mark: calc(var(--radius-control) * var(--control-icon-ratio));",
      "--radius-inset: max(0px, calc(var(--radius-control) - var(--control-inset) / 2));",
      "--radius-card: calc(var(--radius-control) + var(--control-inset) / 2);",
      "--control-part-height: calc(var(--control-height) - var(--control-inset));",
      "--control-part-inset: calc(var(--control-inset) / 2);",
    ]),
  ];
  return out.join("");
}

// geomTokensCSS, the full geometry stylesheet: one `:root` block of the 27 × 16 cell primitives and
// the container lines (the radius ladder, the space scale, insets, gaps, borders, focus), then the
// context resolver (geomResolverCSS) that turns them into the `--control-*` / `--chip-*` /
// `--radius-control…` roles.
export function geomTokensCSS(scale, { unit = "px", prefix = "" } = {}) {
  const lines = [":root {", geomSizeVarLines(scale, "  ", unit, prefix), ...geomContainerLines(scale, unit, prefix), "}"];
  return lines.join("\n") + "\n" + geomResolverCSS(scale, { unit, prefix });
}

// geomTokensSizesCSS, a SIZE-ONLY sibling of geomTokensCSS (issue #487, gen-ui-kit's own request):
// just the `:root` block of `--{pfx}-size-{cell}-*` primitives, no container tier and no resolver, so a
// consumer that only binds cell fields doesn't have to vendor a slice of the full file itself.
export function geomTokensSizesCSS(scale, { unit = "px", prefix = "" } = {}) {
  return [":root {", geomSizeVarLines(scale, "  ", unit, prefix), "}"].join("\n") + "\n";
}

// geomTokensBreakpointCSS, ONE self-contained override file PER breakpoint mode. The cells are the same
// at every width; what a breakpoint changes is the SCALE axis, so each file's `:where(:root)` sets only the
// `--ctx-scale-*` indicators for that mode's `scale.scale`, and the resolver in the base file does the
// rest. `desktopMinWidth` (default 1280, this app's Desktop anchor) splits `modes` into NARROW
// (< desktopMinWidth, Tablet/Mobile) and WIDE (≥ desktopMinWidth, e.g. Desktop Lg/Xl). Each side is
// bounded on its own outward-facing edge, narrow modes on the ceiling (pinned to `desktopMinWidth - 1`
// for the widest narrow mode), open on the floor only for the NARROWEST; wide modes mirror this on the
// floor, open on the ceiling only for the WIDEST. Interior modes on both sides are bounded both ends, so
// ranges never overlap. The indicators are never prefixed, so this file takes no prefix. `modes` =
// [{ name, minWidth, scale }]; a mode without a positive minWidth is skipped (preview-only, mirrors the
// DTCG files).
export function geomTokensBreakpointCSS(modes = [], { desktopMinWidth = 1280 } = {}) {
  const valid = (modes || []).filter((m) => m && m.scale && Number(m.minWidth) > 0);
  const narrow = valid.filter((m) => Number(m.minWidth) < desktopMinWidth).sort((a, b) => Number(b.minWidth) - Number(a.minWidth));
  const wide = valid.filter((m) => Number(m.minWidth) >= desktopMinWidth).sort((a, b) => Number(a.minWidth) - Number(b.minWidth));
  const scaleLine = (m) => `    ${indicators("scale", SCALES, SCALES.includes(m.scale.scale) ? m.scale.scale : DEFAULT_GEOMETRY.scale).join(" ")}`;
  const out = [];
  wide.forEach((m, i) => {
    const lower = Math.round(m.minWidth);
    const widest = i === wide.length - 1;
    const upper = widest ? null : Math.round(wide[i + 1].minWidth) - 1;
    const name = m.name || "Mode";
    const cond = widest ? `(min-width: ${lower}px)` : `(min-width: ${lower}px) and (max-width: ${upper}px)`;
    out.push({
      name, minWidth: lower,
      css: `/* ${name}, ${widest ? `${lower}px+` : `${lower}–${upper}`}px, load AFTER the Desktop base file */\n@media ${cond} {\n  :where(:root) {\n${scaleLine(m)}\n  }\n}\n`,
    });
  });
  narrow.forEach((m, i) => {
    const lower = Math.round(m.minWidth);
    const upper = (i === 0 ? desktopMinWidth : Math.round(narrow[i - 1].minWidth)) - 1;
    const narrowest = i === narrow.length - 1;
    const name = m.name || "Mode";
    const cond = narrowest ? `(max-width: ${upper}px)` : `(min-width: ${lower}px) and (max-width: ${upper}px)`;
    out.push({
      name, minWidth: lower,
      css: `/* ${name}, ${narrowest ? `≤${upper}` : `${lower}–${upper}`}px */\n@media ${cond} {\n  :where(:root) {\n${scaleLine(m)}\n  }\n}\n`,
    });
  });
  return out;
}

// geomTokensDTCG, the geometry as DTCG tokens: a `size` group keyed by cell (`{tier}-{scale}-{size}`)
// with the 16 kebab fields as `dimension` tokens (`icon-ratio` is a `number`), plus the radius ladder,
// space scale and container groups as `dimension` tokens.
export function geomTokensDTCG(scale, { unit = "px" } = {}) {
  const dim = (px) => ({ $type: "dimension", $value: dimUnit(px, unit) });
  const size = {};
  for (const name of orderedSizeNames(scale)) {
    const c = scale.cells[name];
    size[name] = Object.fromEntries(CELL_FIELDS.map(([f, key]) => [f, UNITLESS.has(f) ? { $type: "number", $value: c[key] } : dim(c[key])]));
  }
  const radius = {};
  for (const [k, v] of Object.entries(scale.radii)) radius[k] = dim(v);
  const space = {};
  for (const [k, v] of Object.entries(scale.space)) space[k] = dim(v);
  const group = (src) => { const g = {}; for (const [k, v] of Object.entries(src || {})) g[camelKebab(k)] = dim(v); return g; };
  return { size, radius, space, inset: group(scale.insets), gap: group(scale.gaps), border: group(scale.borders), focus: group(scale.focus) };
}

// geomTokensFigma, the geometry as DTCG `number` tokens (UNITLESS values), the shape a Figma variable
// importer turns into **FLOAT (number) variables**, a "Geometry" collection with size/radius/space groups
// (px is 1:1 with Figma's unitless floats). Same numbers as the DTCG export, minus the `px` suffix.
export function geomTokensFigma(scale) {
  const num = (v) => ({ $type: "number", $value: v });
  const size = {};
  for (const name of orderedSizeNames(scale)) {
    const c = scale.cells[name];
    size[name] = Object.fromEntries(CELL_FIELDS.map(([f, key]) => [f, num(c[key])]));
  }
  const radius = {};
  for (const [k, v] of Object.entries(scale.radii)) radius[k] = num(v);
  const space = {};
  for (const [k, v] of Object.entries(scale.space)) space[k] = num(v);
  const group = (src) => { const g = {}; for (const [k, v] of Object.entries(src || {})) g[camelKebab(k)] = num(v); return g; };
  return { [COLLECTIONS.breakpoints]: { size, radius, space, inset: group(scale.insets), gap: group(scale.gaps), border: group(scale.borders), focus: group(scale.focus) } };
}

// geomTokensFigmaModes, the geometry as a single Figma-variable COLLECTION ("Geometry") with one MODE per
// breakpoint (a "Base" mode + one per supplied breakpoint mode). The same primitives-to-roles cascade the
// color binder uses:
//   size/{cell}/{field}            FLOAT, MODE-CONSTANT (27 × 16): the base scale's cells in every mode
//   control/{tier}/{size}/{field}  ALIAS, PER MODE (9 × 16): `values[mode]` names the
//                                  `size/{tier}-{modeScale}-{size}/{field}` variable, modeScale = that
//                                  mode's `scale.scale`
//   radius/ space/ inset/ gap/ border/ focus   FLOAT, written per mode from that mode's scale.
// `modes` = [{ name, scale }] (minWidth, if present, is ignored, Figma modes are named, not media-queried).
// IDENTITY: `modes = []` ⇒ a single base mode. `opts.baseName` (default "Base") NAMES the synthetic base
// layer (e.g. "Mobile", the standard set); `opts.baseLast` (default false) places it AFTER the
// breakpoints (Figma's default mode = the FIRST mode).
// Figma requires DISTINCT mode names per collection; the synthetic base layer (`baseName`) is reserved +
// de-dup (case-insensitively) so a breakpoint sharing its name / two same-named modes can't collide on import.
function disambiguateModeNames(names, baseName = "Base") {
  const used = new Set([String(baseName).toLowerCase()]);
  return (names || []).map((raw) => {
    const stem = String(raw);
    let n = stem, i = 1;
    while (used.has(n.toLowerCase())) { i += 1; n = `${stem} ${i}`; }
    used.add(n.toLowerCase());
    return n;
  });
}
export function geomTokensFigmaModes(baseScale, modes = [], { baseName = "Base", baseLast = false } = {}) {
  const list = (Array.isArray(modes) ? modes : []).filter((m) => m && m.name && m.scale && m.scale.cells);
  const names = disambiguateModeNames(list.map((m) => m.name), baseName);
  const modeNames = baseLast ? [...names, baseName] : [baseName, ...names];
  const variables = {};
  const set = (key, mode, value, type = "FLOAT") => {
    if (!variables[key]) variables[key] = { type, values: {} };
    variables[key].values[mode] = value;
  };
  const layer = (scale, mode) => {
    for (const name of orderedSizeNames(baseScale)) {
      const c = baseScale.cells[name];
      for (const [f, key] of CELL_FIELDS) set(`size/${name}/${f}`, mode, c[key]);
    }
    const modeScale = SCALES.includes(scale.scale) ? scale.scale : DEFAULT_GEOMETRY.scale;
    for (const tier of Object.keys(TIERS)) {
      for (const size of SIZE_IDS) {
        for (const [f] of CELL_FIELDS) set(`control/${tier}/${size}/${f}`, mode, `size/${tier}-${modeScale}-${size}/${f}`, "ALIAS");
      }
    }
    for (const [k, v] of Object.entries(scale.radii)) set(`radius/${k}`, mode, v);
    for (const [k, v] of Object.entries(scale.space)) set(`space/${k}`, mode, v);
    for (const [k, v] of Object.entries(scale.insets || {})) set(`inset/${camelKebab(k)}`, mode, v);
    for (const [k, v] of Object.entries(scale.gaps || {})) set(`gap/${camelKebab(k)}`, mode, v);
    for (const [k, v] of Object.entries(scale.borders || {})) set(`border/${camelKebab(k)}`, mode, v);
    for (const [k, v] of Object.entries(scale.focus || {})) set(`focus/${camelKebab(k)}`, mode, v);
  };
  layer(baseScale, baseName);
  list.forEach((m, i) => layer(m.scale, names[i]));
  return {
    $schema: "figma-ui3-variables.float.schema.v1",
    collections: { [COLLECTIONS.breakpoints]: { modes: modeNames, variables } },
  };
}
