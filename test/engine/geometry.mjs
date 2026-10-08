#!/usr/bin/env node
// geometry.mjs, verifier for the dimensional engine (src/engine/geometry.mjs). Pure, no DOM.
// The engine is the Maison ui-kit ladder (T-0017); the answer key is Maison's own generated output,
// vendored as test/engine/fixtures/maison-geometry-rows.json (geometry.ts geometryRows, the per-tier
// resolver cells, and the component-geometry CSV), so every cell is checked against Maison, not
// against a second copy of the engine's formulas.
import { readFileSync } from "node:fs";
import * as G from "../../src/engine/geometry.mjs";
import { typeScale, UI_TEXT } from "../../src/engine/type.mjs";

const fails = [];
const ok = (group, c, m) => { if (!c) fails.push(`[${group}] ${m}`); };
const J = (x) => JSON.stringify(x);

const FIX = JSON.parse(readFileSync(new URL("./fixtures/maison-geometry-rows.json", import.meta.url), "utf8"));
const nameOf = (r) => `${r.tier}-${r.scale}-${r.size}`;
const base = G.geomScale({});

// ── maison-ladder: the 27 cells deep-equal Maison's geometryRows and resolver cells; off-table throws ──
{
  const g = "maison-ladder";
  ok(g, FIX.rows.length === 27 && FIX.resolverCells.length === 27 && FIX.ladder.length === 25, "the fixture carries 27 rows, 27 resolver cells, 25 ladder rows");
  ok(g, J(G.orderedSizeNames(base)) === J(FIX.rows.map(nameOf)), `the 27 cells are in Maison's geometryRows order (got ${G.orderedSizeNames(base)})`);
  ok(g, J(Object.keys(base.cells)) === J(FIX.rows.map(nameOf)), "scale.cells holds exactly the 27 cells, in geometryRows order");
  for (const r of FIX.rows) {
    const c = base.cells[nameOf(r)];
    ok(g, J({ height: c.height, inset: c.inset, text: c.text, icon: c.icon }) === J({ height: r.height, inset: r.inset, text: r.text, icon: r.icon }), `${nameOf(r)} row = Maison's (got ${J(c)})`);
    ok(g, G.cellHeight(r.tier, r.scale, r.size) === r.height, `cellHeight(${r.tier}, ${r.scale}, ${r.size}) = ${r.height}`);
  }
  for (const r of FIX.resolverCells) {
    const c = base.cells[nameOf(r)];
    const got = { "caption-text": c.captionText, "chip-height": c.chipHeight, "chip-inset": c.chipInset, "chip-text": c.chipText, "icon-height-ratio": c.iconRatio };
    const want = { "caption-text": r["caption-text"], "chip-height": r["chip-height"], "chip-inset": r["chip-inset"], "chip-text": r["chip-text"], "icon-height-ratio": r["icon-height-ratio"] };
    ok(g, J(got) === J(want), `${nameOf(r)} resolver cell = Maison's (got ${J(got)}, want ${J(want)})`);
  }
  ok(g, J(G.LADDER_ROWS) === J(FIX.ladder.map(({ height, inset, icon }) => ({ height, inset, icon }))), "LADDER_ROWS is the CSV (height, inset, icon), in its descending order");
  ok(g, FIX.ladder.every((r) => UI_TEXT[r.height] === r.text), "type's UI_TEXT is the CSV text column at every ladder height");
  ok(g, J(G.TIERS) === J({ content: { base: 48, offsets: { sm: -12, md: 0, lg: 16 }, step: 8 }, product: { base: 32, offsets: { sm: -4, md: 0, lg: 4 }, step: 8 }, micro: { base: 16, offsets: { sm: -2, md: 0, lg: 2 }, step: 2 } }), "TIERS is definition.mjs verbatim");
  ok(g, J(G.SCALES) === J(["sm", "md", "lg"]) && J(G.SIZES) === J({ sm: -1, md: 0, lg: 1 }), "SCALES and SIZES are Maison's axes");
  // off-table: a lookup at a height the ladder lacks, or an unknown axis id, is a RangeError
  const throwsRange = (fn) => { try { fn(); return false; } catch (e) { return e instanceof RangeError; } };
  ok(g, throwsRange(() => G.ladderRow(30)) && throwsRange(() => G.ladderRow(100)), "ladderRow off-table (30, 100) throws RangeError");
  ok(g, G.ladderRow(32).inset === 8, "ladderRow on-table returns the row");
  ok(g, throwsRange(() => G.cellHeight("nope", "md", "md")) && throwsRange(() => G.cellHeight("product", "xl", "md")) && throwsRange(() => G.cellHeight("product", "md", "xl")), "cellHeight with an unknown tier, scale or size throws RangeError");
  // config: unknown ids and keys fall back to DEFAULT_GEOMETRY
  ok(g, J(G.DEFAULT_GEOMETRY) === J({ tier: "product", scale: "md", radius: "round", spaceBase: 4 }), "DEFAULT_GEOMETRY is product/md/round at spaceBase 4");
  ok(g, J(G.geomScale({ tier: "nope", scale: "xl", radius: "square", spaceBase: -2, treatment: "compact" })) === J(base), "unknown ids and unknown keys fall back to DEFAULT_GEOMETRY");
  ok(g, J(G.geomScale(G.DEFAULT_GEOMETRY)) === J(base) && J(G.geomScale()) === J(base), "geomScale() and geomScale(DEFAULT_GEOMETRY) equal geomScale({})");
  ok(g, base.tier === "product" && base.scale === "md" && base.radius === "round" && base.spaceBase === 4, "the resolved scale echoes its axes");
  // composition: text and chip text read the type scale's UI text table when one is supplied
  ok(g, J(G.geomScale({}, { typeScale: typeScale({ treatment: "product", bodyBase: 16 }) })) === J(base), "composition is value-neutral at the type defaults");
  const big = typeScale({ treatment: "product", bodyBase: 20 });
  const composed = G.geomScale({}, { typeScale: big }).cells["product-md-md"];
  ok(g, composed.text === big.uiText[32] && composed.chipText === big.uiText[24] && composed.text !== base.cells["product-md-md"].text, `text composes from the type scale's uiText (text ${composed.text}, chip ${composed.chipText})`);
  ok(g, composed.height === 32 && composed.inset === 8 && composed.icon === 16, "composition never moves the frame (height, inset, icon)");
}

// ── anatomy: the centering law, inset = (height − icon) / 2, on all 27 cells and all 25 rows ──
{
  const g = "anatomy";
  for (const name of G.orderedSizeNames(base)) {
    const c = base.cells[name];
    ok(g, c.inset === (c.height - c.icon) / 2, `${name}: inset = (height − icon) / 2 (got ${c.inset}, want ${(c.height - c.icon) / 2})`);
    ok(g, c.minWidth === c.height, `${name}: minWidth = height (the square floor)`);
    ok(g, c.iconRatio === c.icon / c.height, `${name}: iconRatio = icon / height, unrounded`);
    ok(g, c.chipHeight <= c.height && c.chipHeight <= c.height - c.inset || c.chipHeight === G.LADDER_ROWS[G.LADDER_ROWS.length - 1].height, `${name}: the chip fits inside the control less one inset (or is the smallest row)`);
  }
  ok(g, G.LADDER_ROWS.every((r) => r.height === r.icon + 2 * r.inset), "every ladder row satisfies height = icon + 2 · inset");
}

// ── radius-modes: 27 cells × 4 modes = 108 radius sets, against Maison's k table (generate.mjs:58) ──
{
  const g = "radius-modes";
  const K = [["default", 0.5, 0], ["round", 1, 0], ["sharp", 0.25, 0], ["pill", 0, 0.5]];
  ok(g, J(G.RADIUS_MODES) === J(Object.fromEntries(K.map(([id, text, height]) => [id, { text, height }]))), "RADIUS_MODES is Maison's k table");
  let checked = 0;
  for (const [radius, kt, kh] of K) {
    const s = G.geomScale({ radius });
    ok(g, s.radius === radius, `geomScale({ radius: "${radius}" }) resolves that mode`);
    for (const r of FIX.rows) {
      const c = s.cells[nameOf(r)];
      const rc = r.text * kt + r.height * kh;
      const want = { radiusControl: rc, radiusMark: rc * (r.icon / r.height), radiusInset: Math.max(0, rc - r.inset / 2), radiusCard: rc + r.inset / 2 };
      const got = { radiusControl: c.radiusControl, radiusMark: c.radiusMark, radiusInset: c.radiusInset, radiusCard: c.radiusCard };
      ok(g, J(got) === J(want), `${radius} ${nameOf(r)}: radii ${J(got)} (want ${J(want)})`);
      checked += 1;
    }
  }
  ok(g, checked === 108, `108 radius cases checked (got ${checked})`);
  const md = (radius) => G.geomScale({ radius }).cells["product-md-md"];
  ok(g, md("round").radiusControl === 14 && md("default").radiusControl === 7 && md("sharp").radiusControl === 3.5 && md("pill").radiusControl === 16, "product-md-md control radius: round 14, default 7, sharp 3.5, pill 16");
}

// ── anchors: MD is the kit default cell; XS, SM, LG, XL, 2XL are LEGACY_SIZE_CELLS ──
{
  const g = "anchors";
  ok(g, J(G.LEGACY_SIZE_CELLS) === J({ XS: "product-sm-sm", SM: "product-md-sm", LG: "product-lg-md", XL: "content-md-md", "2XL": "content-lg-md" }) && !("MD" in G.LEGACY_SIZE_CELLS), "LEGACY_SIZE_CELLS maps the five non-MD steps, no MD key");
  ok(g, base.cell.name === "product-md-md" && G.mdAnchor(base).name === "product-md-md" && G.mdAnchor(base).size === base.cells["product-md-md"], "MD is the kit default cell (product-md-md)");
  const other = G.geomScale({ tier: "content", scale: "lg" });
  ok(g, other.cell.name === "content-lg-md" && G.mdAnchor(other).name === "content-lg-md", `MD follows the kit's tier and scale (got ${G.mdAnchor(other).name})`);
  ok(g, J({ name: "content-lg-md", ...other.cells["content-lg-md"] }) === J(other.cell), "scale.cell is { name, ...cells[name] }");
  const LEGACY_PX = { XS: 20, SM: 24, LG: 36, XL: 48, "2XL": 64 };
  for (const [step, cell] of Object.entries(G.LEGACY_SIZE_CELLS)) {
    for (const s of [base, other]) {
      const a = G.sizeAnchor(s, step);
      ok(g, a.name === cell && a.size === s.cells[cell], `sizeAnchor(${step}) = ${cell} (got ${a.name})`);
    }
    ok(g, base.cells[cell].height === LEGACY_PX[step], `${step} keeps its legacy ${LEGACY_PX[step]}px height (got ${base.cells[cell].height})`);
  }
  ok(g, G.sizeAnchor(base, "micro-lg-lg").name === "micro-lg-lg" && G.sizeAnchor(base, "micro-lg-lg").size === base.cells["micro-lg-lg"], "a cell name passes through sizeAnchor");
  ok(g, G.orderedSizeNames(base).length === 27 && J(G.orderedSizeNames(undefined)) === "[]", "orderedSizeNames: 27 names, [] for no scale");
}

// ── compound-law: the part fields come from Maison's rows (part = height - inset, pad = inset / 2) ──
{
  const g = "compound-law";
  for (const r of FIX.rows) {
    const c = base.cells[nameOf(r)];
    ok(g, c.partHeight === r.height - r.inset, `${nameOf(r)} partHeight = ${r.height} - ${r.inset} (got ${c.partHeight})`);
    ok(g, c.partInset === r.inset / 2, `${nameOf(r)} partInset = ${r.inset} / 2 (got ${c.partInset})`);
  }
  // the chip snaps to a ladder row and fits under the part, except on the three micro cells where no
  // ladder row fits under height - inset (the chip falls back to the 12px row there)
  const CHIP_OVER_PART = ["micro-sm-sm", "micro-sm-md", "micro-md-sm"];
  for (const [n, c] of Object.entries(base.cells)) {
    if (CHIP_OVER_PART.includes(n)) ok(g, c.chipHeight === 12 && c.chipHeight > c.partHeight, `${n} chip falls back to the 12px row, over its ${c.partHeight}px part (got ${c.chipHeight})`);
    else ok(g, c.chipHeight <= c.partHeight, `${n} chipHeight ${c.chipHeight} <= partHeight ${c.partHeight}`);
  }
  ok(g, Object.keys(base.cells).length - CHIP_OVER_PART.length === 24, "the chip fits under the part on 24 cells");
}

// ── emitters: CSS primitives + resolver (and the prefix contract), DTCG, Figma, Figma modes ──
{
  const g = "emitters";
  const css = G.geomTokensCSS(base);
  const PRIM = /--size-(content|product|micro)-(sm|md|lg)-(sm|md|lg)-[a-z-]+: /g;
  ok(g, (css.match(PRIM) || []).length === 27 * 16, `CSS declares 27 × 16 cell primitives (got ${(css.match(PRIM) || []).length})`);
  ok(g, css.includes("--size-product-md-md-height: 32px;") && css.includes("--size-content-lg-lg-height: 72px;") && css.includes("--size-product-md-md-icon-ratio: 0.5;") && css.includes("--size-product-md-md-radius-control: 14px;"), "CSS primitives carry the cell values (icon-ratio unitless)");
  for (const sel of ['[data-tier="content"]', '[data-tier="product"]', '[data-tier="micro"]', '[data-scale="sm"]', '[data-scale="md"]', '[data-scale="lg"]', '[data-size="sm"]', '[data-size="md"]', '[data-size="lg"]', '[data-radius="default"]', '[data-radius="round"]', '[data-radius="sharp"]', '[data-radius="pill"]', ":where(:root)", ":where(*, :host)"])
    ok(g, css.includes(sel), `CSS resolver carries ${sel}`);
  for (const role of ["--control-height:", "--control-inset:", "--control-text:", "--control-icon:", "--control-caption-text:", "--control-icon-ratio:", "--chip-height:", "--chip-inset:", "--chip-text:", "--radius-control:", "--radius-mark:", "--radius-inset:", "--radius-card:", "--control-part-height:", "--control-part-inset:"])
    ok(g, css.includes(role), `CSS resolver defines ${role}`);
  ok(g, css.includes("--radius-inset: max(0px, calc(var(--radius-control) - var(--control-inset) / 2));") && css.includes("--radius-mark: calc(var(--radius-control) * var(--control-icon-ratio));"), "the radius roles follow Maison's formulas");
  ok(g, css.includes("--control-part-height: calc(var(--control-height) - var(--control-inset));") && css.includes("--control-part-inset: calc(var(--control-inset) / 2);"), "the compound part roles derive from the resolved control height and inset");
  ok(g, !/caret|icon-gap|padding-wide|\.control-|--density|--radius-default|--g-|--r-|--m-/.test(css), "CSS carries no retired field, class, density, radius-default, or Maison-namespace token");
  // :where(:root) is the KIT default context
  const rootBlock = (s) => s.slice(s.indexOf(":where(:root) {"), s.indexOf("}", s.indexOf(":where(:root) {")));
  const kit = rootBlock(G.geomResolverCSS(G.geomScale({ tier: "content", scale: "lg", radius: "pill" })));
  ok(g, kit.includes("--ctx-scale-lg: 1;") && kit.includes("--ctx-scale-md: 0;") && kit.includes("--ctx-size-md: 1;") && kit.includes("--ctx-radius-text: 0;") && kit.includes("--ctx-radius-height: 0.5;") && kit.includes("--ctx-cell-md-md-height: var(--size-content-md-md-height);"), "the default context is the kit's tier, scale and radius mode");
  const defRoot = rootBlock(css);
  ok(g, defRoot.includes("--ctx-scale-md: 1;") && defRoot.includes("--ctx-radius-text: 1;") && defRoot.includes("--ctx-cell-sm-sm-chip-text: var(--size-product-sm-sm-chip-text);") && (defRoot.match(/--ctx-cell-/g) || []).length === 81, "the default kit context maps the product tier's nine cells × nine resolver fields");
  // the PREFIX contract: primitives and container ladders take it, roles and ctx hooks never do
  const pre = G.geomTokensCSS(base, { prefix: "md" });
  ok(g, pre.includes("--md-size-product-md-md-height: 32px;") && pre.includes("--md-radius-md: 12px;") && pre.includes("--md-space-4:") && pre.includes("--md-inset-card:") && pre.includes("--md-focus-ring-width:"), "prefix namespaces the cell primitives and the container ladders");
  ok(g, pre.includes("var(--md-size-product-md-md-height)") && !/(^|[^-a-z])--size-/.test(pre), "the ctx reassignments reference the prefixed primitives (no bare --size-*)");
  ok(g, /(^|[;{\s])--control-height:/.test(pre) && /(^|[;{\s])--radius-card:/.test(pre) && /(^|[;{\s])--ctx-scale-md:/.test(pre), "roles and ctx hooks stay bare under a prefix");
  ok(g, !/--md-(control|chip|ctx)-|--md-radius-(control|mark|inset|card)/.test(pre), "no role or ctx hook is ever prefixed");
  ok(g, G.geomTokensCSS(base, { prefix: "" }) === css, "empty prefix is byte-identical to the native default (identity gate)");
  ok(g, G.geomResolverCSS(base) === css.slice(css.indexOf(":where(:root)")), "geomTokensCSS ends with the resolver, byte-identical to geomResolverCSS");
  ok(g, !G.geomResolverCSS(base).includes("--size-product-md-md-height:"), "the resolver reads the primitives, it never declares them");
  // unit
  const rem = G.geomTokensCSS(base, { unit: "rem" });
  ok(g, rem.includes("--size-product-md-md-height: 2rem;") && rem.includes("--size-product-md-md-icon-ratio: 0.5;"), "unit:rem converts dimensions, icon-ratio stays unitless");
  // size-only CSS: the primitives alone, a strict subset of the full file's lines
  const sizes = G.geomTokensSizesCSS(base, { prefix: "md" });
  const full = G.geomTokensCSS(base, { prefix: "md" });
  ok(g, sizes.trimEnd().startsWith(":root {") && sizes.trimEnd().endsWith("}") && (sizes.match(/\n/g) || []).length === 29, "the size-only CSS is one :root block of 27 cell lines");
  ok(g, !/--md-(radius|space|inset|gap|border|focus)-|--ctx-|--control-|data-/.test(sizes), "the size-only CSS carries no container tier and no resolver");
  ok(g, sizes.split("\n").filter((l) => l.startsWith("  ")).every((l) => full.includes(l)), "every size-only line appears byte-identical in the full export");
  // breakpoint CSS: each mode file sets only the scale indicators for its scale
  const sm = G.geomScale({ scale: "sm" }), lg = G.geomScale({ scale: "lg" });
  const solo = G.geomTokensBreakpointCSS([{ name: "Mobile", minWidth: 476, scale: sm }, { name: "NoWidth", scale: sm }]);
  ok(g, solo.length === 1 && solo[0].name === "Mobile", "a mode without a minWidth is skipped");
  ok(g, /@media \(max-width: 1279px\) \{\s*:where\(:root\) \{\s*--ctx-scale-sm: 1; --ctx-scale-md: 0; --ctx-scale-lg: 0;\s*\}\s*\}/.test(solo[0].css), `a narrow mode file sets only its scale indicators (got ${J(solo[0].css)})`);
  ok(g, !/--size-|--control-|--ctx-size-|--ctx-cell-/.test(solo[0].css), "a mode file never re-declares primitives, roles, size or cell hooks");
  const two = G.geomTokensBreakpointCSS([{ name: "Mobile", minWidth: 476, scale: sm }, { name: "Tablet", minWidth: 992, scale: sm }, { name: "Desktop Xl", minWidth: 1440, scale: lg }]);
  ok(g, J(two.map((m) => m.name)) === J(["Desktop Xl", "Tablet", "Mobile"]), `wide first, then narrow descending (got ${two.map((m) => m.name)})`);
  ok(g, /@media \(min-width: 1440px\)/.test(two[0].css) && two[0].css.includes("--ctx-scale-lg: 1;") && /@media \(min-width: 992px\) and \(max-width: 1279px\)/.test(two[1].css) && /@media \(max-width: 991px\)/.test(two[2].css), "breakpoint bounds and per-mode scale indicators");
  ok(g, G.geomTokensBreakpointCSS([]).length === 0, "no modes → no files");
  // DTCG
  const d = G.geomTokensDTCG(base);
  ok(g, Object.keys(d.size).length === 27 && J(Object.keys(d.size)) === J(FIX.rows.map(nameOf)), "DTCG size group is keyed by the 27 cells in order");
  ok(g, d.size["content-lg-lg"].height.$value === "72px" && d.size["product-md-md"]["chip-height"].$value === "24px" && d.size["product-md-md"]["radius-card"].$type === "dimension", "DTCG cell fields are dimensions");
  ok(g, d.size["product-md-md"]["icon-ratio"].$type === "number" && d.size["product-md-md"]["icon-ratio"].$value === 0.5, "DTCG icon-ratio is a unitless number");
  ok(g, Object.values(d.size).every((c) => Object.keys(c).length === 16), "every DTCG cell carries the 16 fields");
  ok(g, G.geomTokensDTCG(base, { unit: "rem" }).size["product-md-md"].height.$value === "2rem", "DTCG carries the unit");
  // Figma (flat)
  const f = G.geomTokensFigma(base);
  ok(g, f.Geometry && Object.keys(f.Geometry.size).length === 27 && f.Geometry.size["product-md-md"].height.$type === "number" && f.Geometry.size["product-md-md"].height.$value === 32 && f.Geometry.size["product-md-md"]["icon-ratio"].$value === 0.5, "Figma size group: 27 cells of unitless numbers");
  // Figma modes: mode-constant size/ FLOATs + per-mode control/ ALIASes
  const fm = G.geomTokensFigmaModes(base, [{ name: "Mobile", scale: sm }, { name: "Desktop Xl", scale: lg }]);
  const col = fm.collections.Geometry;
  const vars = col.variables;
  const keys = Object.keys(vars);
  ok(g, J(col.modes) === J(["Base", "Mobile", "Desktop Xl"]), `modes [Base, Mobile, Desktop Xl] (got ${J(col.modes)})`);
  ok(g, keys.filter((k) => k.startsWith("size/")).length === 432 && keys.filter((k) => k.startsWith("control/")).length === 144, "432 size/ + 144 control/ variables");
  ok(g, keys.filter((k) => k.startsWith("size/")).every((k) => vars[k].type === "FLOAT" && new Set(col.modes.map((m) => vars[k].values[m])).size === 1), "size/ variables are FLOAT and mode-constant");
  const cv = vars["control/product/md/height"];
  ok(g, cv && cv.type === "ALIAS" && cv.values.Base === "size/product-md-md/height" && cv.values.Mobile === "size/product-sm-md/height" && cv.values["Desktop Xl"] === "size/product-lg-md/height", `control/product/md/height aliases each mode's scale (got ${J(cv)})`);
  ok(g, keys.filter((k) => k.startsWith("control/")).every((k) => vars[k].type === "ALIAS" && col.modes.every((m) => vars[vars[k].values[m]] && vars[vars[k].values[m]].type === "FLOAT")), "every control/ ALIAS targets an existing FLOAT size/ variable in every mode");
  const idn = G.geomTokensFigmaModes(base, []).collections.Geometry;
  ok(g, J(idn.modes) === J(["Base"]) && Object.values(idn.variables).every((x) => Object.keys(x.values).join() === "Base"), "no modes ⇒ a single Base mode");
  const named = G.geomTokensFigmaModes(sm, [{ name: "Desktop", scale: base }, { name: "Mobile", scale: lg }], { baseName: "Mobile", baseLast: true }).collections.Geometry;
  ok(g, J(named.modes) === J(["Desktop", "Mobile 2", "Mobile"]) && named.variables["control/micro/lg/text"].values.Mobile === "size/micro-sm-lg/text", `baseName/baseLast and disambiguation (got ${J(named.modes)})`);
  ok(g, !/caret|icon-gap|padding-wide|pill-radius/.test(J(d) + J(f) + J(fm)), "no retired field in DTCG, Figma or Figma modes");
}

// ── container-identity: the M3 radii, space, insets, gaps, borders, focus are today's values at spaceBase 4 ──
{
  const g = "container-identity";
  const TODAY = { radii: { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 28, full: 9999 }, space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 7: 48, 8: 64, 9: 96 }, insets: { controlGroup: 8, card: 16, panel: 24, dialog: 32, page: 48 }, gaps: { cluster: 8, stackTight: 12, stack: 16, stackLoose: 24, grid: 16, section: 48 }, borders: { thin: 1, thick: 2 }, focus: { ringWidth: 2, ringOffset: 2 } };
  const pick = (s) => ({ radii: s.radii, space: s.space, insets: s.insets, gaps: s.gaps, borders: s.borders, focus: s.focus });
  ok(g, J(pick(base)) === J(TODAY), `the container tier deep-equals today's values at spaceBase 4 (got ${J(pick(base))})`);
  for (const cfg of [{ tier: "content", scale: "lg" }, { tier: "micro", scale: "sm", radius: "pill" }, { radius: "sharp" }])
    ok(g, J(pick(G.geomScale(cfg))) === J(TODAY), `the container tier ignores tier, scale and radius (${J(cfg)})`);
  const wide = G.geomScale({ spaceBase: 8 });
  ok(g, wide.space[4] === 32 && wide.insets.card === 32 && wide.gaps.stack === 32 && J(wide.radii) === J(TODAY.radii) && J(wide.borders) === J(TODAY.borders), "space, insets and gaps follow spaceBase; radii and strokes stay fixed");
  const css = G.geomTokensCSS(base);
  ok(g, ["--radius-xs: 4px;", "--radius-full: 9999px;", "--space-4: 16px;", "--inset-control-group: 8px;", "--gap-stack-loose: 24px;", "--border-thin: 1px;", "--focus-ring-offset: 2px;"].every((t) => css.includes(t)), "CSS emits the container tier as before");
  const d = G.geomTokensDTCG(base);
  ok(g, d.radius.md.$value === "12px" && d.space["4"].$value === "16px" && d.inset["control-group"].$value === "8px" && d.gap["stack-tight"].$type === "dimension" && d.border.thin.$value === "1px" && d.focus["ring-width"].$value === "2px", "DTCG carries the container groups as before");
  const fm = G.geomTokensFigmaModes(base, []).collections.Geometry.variables;
  ok(g, fm["radius/full"].values.Base === 9999 && fm["space/4"].values.Base === 16 && fm["inset/card"].values.Base === 16 && fm["gap/section"].values.Base === 48 && fm["border/thick"].values.Base === 2 && fm["focus/ring-width"].values.Base === 2, "Figma modes carry the container variables as before");
}

if (fails.length) { console.error(`geometry FAIL (${fails.length}):\n  ` + fails.join("\n  ")); process.exit(1); }
console.log("geometry PASS, the Maison ladder (27 cells vs the vendored fixture), anatomy, 108 radius cases, anchors, the compound law, emitters + the prefix contract, container identity");
process.exit(0);
