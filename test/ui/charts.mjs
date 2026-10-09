#!/usr/bin/env node
// charts.mjs, direct coverage for the native DOM chart core (src/ui/charts/core.mjs) and its
// renderer (src/ui/charts/render.mjs). The core is pure, so its numbers are checked by hand-built
// inputs: missing data never becomes 0, a gap splits a ribbon, a ribbon's thickness is the stroke,
// a band closes to its base, polar runs clockwise from the top. The renderer runs under this
// file's own minimal document stub (only what h() in src/ui/app-helpers.mjs calls).
import { STROKE, band, polar, resolveChart, ribbon, runs, scaleLinear, sourceRows } from "../../src/ui/charts/core.mjs";

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };
const near = (a, b, tol = 1e-6) => Math.abs(a - b) < tol;
const pcts = (s) => (s.match(/-?[0-9]+(?:[.][0-9]+)?%/g) ?? []).map(parseFloat);
const MISSING = [NaN, null, undefined, Infinity, -Infinity, "5"];

// STROKE
ok(STROKE.line === 1.5 && STROKE.ref === 1, `STROKE is ${JSON.stringify(STROKE)}`);

// scaleLinear
{
  const s = scaleLinear([0, 10], [20, 120]);
  ok(s(0) === 20 && s(10) === 120 && s(5) === 70, "scaleLinear maps the domain ends and midpoint");
  ok(near(scaleLinear([0, 10], [100, 0])(2.5), 75), "scaleLinear handles an inverted range");
  for (const v of MISSING) ok(Number.isNaN(s(v)), `scaleLinear(${String(v)}) is NaN, not ${s(v)}`);
  ok(scaleLinear([4, 4], [10, 30])(4) === 20, "a degenerate domain maps to the range midpoint");
  ok(Number.isNaN(scaleLinear([4, 4], [10, 30])(null)), "a degenerate domain still returns NaN for null");
}

// runs
{
  const r = runs([{ x: 0, y: 1 }, { x: 1, y: NaN }, { x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: null }, { x: undefined, y: 2 }, { x: 6, y: 6 }]);
  ok(r.length === 3, `runs splits on every missing point (got ${r.length})`);
  ok(r[0].length === 1 && r[1].length === 2 && r[2].length === 1, "runs keeps lone points as runs of 1");
  ok(!r.flat().some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y)), "runs drops the missing points");
  ok(runs([]).length === 0 && runs(undefined).length === 0, "runs of nothing is empty");
}

// ribbon
{
  const r = ribbon([{ x: 0, y: 50 }, { x: 100, y: 50 }], 200, 100, 2);
  const n = pcts(r);
  ok(r.startsWith("polygon(") && n.length === 8, `a 2-point ribbon has 4 vertices (got ${n.length / 2})`);
  const ys = n.filter((_, i) => i % 2);
  ok(near(Math.max(...ys) - Math.min(...ys), (2 / 100) * 100), "ribbon thickness across a horizontal run is stroke / H * 100");
  ok(near(Math.min(...ys), 49) && near(Math.max(...ys), 51), "a horizontal ribbon straddles its line");
  const v = pcts(ribbon([{ x: 50, y: 0 }, { x: 50, y: 100 }], 100, 100, 4)).filter((_, i) => i % 2 === 0);
  ok(near(Math.max(...v) - Math.min(...v), 4), "a vertical ribbon is stroke / W * 100 wide");
  const three = pcts(ribbon([{ x: 0, y: 0 }, { x: 50, y: 50 }, { x: 100, y: 0 }], 100, 100));
  ok(three.length === 12 && three.every(Number.isFinite), "a 3-point ribbon has 2n vertices, all finite");
  ok(/^polygon\((-?\d+\.\d{3}% -?\d+\.\d{3}%(, )?)+\)$/.test(ribbon([{ x: 1, y: 2 }, { x: 3, y: 4 }], 10, 10)), "ribbon writes <x>% <y>% to 3 decimals");
  ok(ribbon([{ x: 1, y: 1 }], 10, 10, 1) === "" && ribbon([], 10, 10) === "", "fewer than 2 points draws nothing");
  ok(near(Math.max(...pcts(ribbon([{ x: 0, y: 50 }, { x: 100, y: 50 }], 100, 100)).filter((_, i) => i % 2)) - 50, STROKE.line / 2), "ribbon defaults to STROKE.line");
}

// band
{
  const b = pcts(band([{ x: 20, y: 10 }, { x: 60, y: 40 }], 100, 100, { y: 90 }));
  ok(b.length === 8, `a 2-point band has n + 2 vertices (got ${b.length / 2})`);
  ok(near(b[4], 60) && near(b[5], 90) && near(b[6], 20) && near(b[7], 90), "a band closes to a horizontal base under its last then first point");
  const v = pcts(band([{ x: 20, y: 10 }, { x: 60, y: 40 }], 200, 100, { x: 0 }));
  ok(near(v[4], 0) && near(v[5], 40) && near(v[6], 0) && near(v[7], 10), "a band closes to a vertical base beside its last then first point");
  ok(band([{ x: 1, y: 1 }, { x: 2, y: 2 }], 10, 10, {}) === "", "a band with no base draws nothing");
}

// polar
{
  const p0 = polar(0, 40, 50, 50), p9 = polar(90, 40, 50, 50), p18 = polar(180, 40, 50, 50), p27 = polar(270, 40, 50, 50);
  ok(near(p0.x, 50) && near(p0.y, 10), "polar 0 degrees is at the top");
  ok(near(p9.x, 90) && near(p9.y, 50), "polar 90 degrees is at the right (clockwise)");
  ok(near(p18.x, 50) && near(p18.y, 90) && near(p27.x, 10) && near(p27.y, 50), "polar 180 and 270 degrees are bottom and left");
}

// resolveChart
const SPEC = {
  W: 200, H: 100,
  series: [
    { label: "s", cls: "x", dot: 2, points: [{ x: 10, y: 10, v: [0, 1] }, { x: 50, y: 20, v: [1, 2] }, { x: NaN, y: 30, v: [2, NaN] }, { x: 120, y: 40, v: [3, 4] }, { x: 190, y: 90, v: [4, 5] }] },
    { label: "b", cls: "area", kind: "band", base: { y: 90 }, points: [{ x: 10, y: 50 }, { x: 100, y: null }, { x: 150, y: 60 }, { x: 190, y: 70 }] },
  ],
  rules: [{ cls: "ax", x1: 20, y1: 90, x2: 190, y2: 90 }, { cls: "ay", x1: 20, y1: 10, x2: 20, y2: 90 }, { cls: "bad", x1: NaN, y1: 0, x2: 10, y2: 0 }],
  labels: [{ text: "px", x: 2, y: 14, anchor: "end" }, { text: "q", x: 4, y: 4, anchor: "sideways" }, { text: "gone", x: null, y: 4 }],
  rects: [{ cls: "cell", x: 60, y: 20, w: 80, h: 60 }, { cls: "bad", x: 0, y: 0, w: undefined, h: 1 }],
  circles: [{ cls: "ring", cx: 100, cy: 50, r: 40 }, { cls: "bad", cx: 1, cy: 1, r: NaN }],
  dots: [{ cls: "free", x: 100, y: 50, r: 3, fill: "#f00", ring: true, label: "pt", v: [7.12345, "x"] }, { cls: "bad", x: 1, y: Infinity, r: 2, label: "gone", v: [null, undefined] }],
};
{
  const o = resolveChart(SPEC);
  const nums = [];
  const txt = JSON.stringify(o, (k, v) => { if (typeof v === "number") nums.push(v); return v; });
  ok(nums.length > 0 && nums.every(Number.isFinite), "every number resolveChart returns is finite");
  ok(!txt.includes("NaN") && !txt.includes("Infinity"), "no resolved string contains NaN or Infinity");
  ok(o.W === 200 && o.H === 100, "resolveChart carries W and H");
  ok(o.ribbons.length === 2 && o.ribbons.every((r) => r.cls === "x"), `a gap splits the line series into 2 ribbons (got ${o.ribbons.length})`);
  ok(o.bands.length === 2 && o.bands.every((b) => b.cls === "area"), `a gap splits the band series into 2 bands (got ${o.bands.length})`);
  ok(o.dots.filter((d) => d.cls === "x").length === 4, "a series with dot gets one dot per finite point");
  const free = o.dots.find((d) => d.cls === "free");
  ok(free && free.left === 50 && free.top === 50 && free.r === 3 && free.fill === "#f00" && free.ring === true, "a free dot resolves to percent with its fill and ring");
  ok(!o.dots.some((d) => d.cls === "bad"), "a free dot with a non-finite coordinate is dropped");
  const [ax, ay] = o.rules;
  ok(o.rules.length === 2 && ax.orient === "h" && ax.left === 10 && ax.top === 90 && ax.len === 85, "a horizontal rule resolves to left, top and width in percent");
  ok(ay.orient === "v" && ay.left === 10 && ay.top === 10 && ay.len === 80, "a vertical rule resolves to left, top and height in percent");
  ok(o.labels.length === 2 && o.labels[0].anchor === "end" && o.labels[0].left === 1 && o.labels[0].top === 14 && o.labels[1].anchor === "start", "labels resolve to percent, an unknown anchor reads start, a missing coordinate drops");
  ok(o.rects.length === 1 && o.rects[0].left === 30 && o.rects[0].width === 40 && o.rects[0].height === 60, "a rect resolves to percent, a non-finite one drops");
  ok(o.circles.length === 1 && o.circles[0].left === 30 && o.circles[0].top === 10 && o.circles[0].width === 40 && o.circles[0].height === 80, "a circle resolves to its bounding box in percent");
  const empty = resolveChart({ W: NaN, H: 100, series: SPEC.series });
  ok(empty.ribbons.length === 0 && Number.isFinite(empty.W), "a chart with no valid box resolves to no marks");
}

// sourceRows
{
  const rows = sourceRows(SPEC);
  ok(rows.length === 5 + 2, `one row per series point and free dot with v (got ${rows.length})`);
  ok(rows.every((r) => r.length === 3 && r.every((c) => typeof c === "string")), "rows are string triples");
  ok(rows[0][0] === "s" && rows[0][1] === "0" && rows[0][2] === "1", "a row carries the series label and its values");
  ok(rows[2][1] === "2" && rows[2][2] === "", "sourceRows blanks a missing value");
  ok(rows[5][0] === "pt" && rows[5][1] === "7.123" && rows[5][2] === "x", "a free dot uses its own label, at most 3 decimals, strings pass through");
  ok(rows[6][1] === "" && rows[6][2] === "", "null and undefined print empty, never 0");
  ok(!rows.some((r) => r[0] === "b"), "band points without v carry no row");
}

// renderChart under a minimal document stub
{
  const mk = (t) => ({
    tagName: t.toUpperCase(), className: "", attrs: {}, children: [], nodeType: 1, listeners: 0,
    setAttribute(k, v) { this.attrs[k] = String(v); },
    append(...k) { this.children.push(...k); },
    addEventListener() { this.listeners++; },
    set innerHTML(_) { throw new Error("renderChart set innerHTML"); },
  });
  globalThis.document = { createElement: mk, createTextNode: (s) => ({ nodeType: 3, textContent: String(s) }) };
  const { renderChart } = await import("../../src/ui/charts/render.mjs");
  const all = (n, o = []) => { o.push(n); (n.children ?? []).forEach((c) => all(c, o)); return o; };
  const has = (n, c) => String(n.className ?? "").split(/ +/).includes(c);
  const text = (n) => (n.children ?? []).map((k) => k.textContent ?? text(k)).join("");

  const el = renderChart({ ...SPEC, cls: "lc", title: "Lightness vs chroma", columns: ["role", "L", "C"] });
  const a = all(el);
  ok(el.tagName === "DIV" && has(el, "an-chart") && has(el, "lc"), "the root is div.an-chart plus spec.cls");
  ok(el.attrs.style === "aspect-ratio: 200 / 100; max-width: 200px", `the root sizes by aspect ratio (got ${el.attrs.style})`);
  const marks = el.children[0];
  ok(has(marks, "ch-marks") && marks.attrs["aria-hidden"] === "true", "div.ch-marks is aria-hidden");
  const order = marks.children.map((m) => ["ch-band", "ch-ribbon", "ch-rule", "ch-rect", "ch-circle", "ch-dot", "ch-label"].findIndex((c) => has(m, c)));
  ok(order.every((v, i) => v >= 0 && (i === 0 || v >= order[i - 1])), `marks paint band, ribbon, rule, rect, circle, dot, label (got ${order.join(",")})`);
  ok(marks.children.filter((m) => has(m, "ch-ribbon")).every((m) => has(m, "x") && /^clip-path: polygon\(/.test(m.attrs.style)), "ribbons carry their cls and a clip-path polygon");
  ok(marks.children.filter((m) => has(m, "ch-band")).length === 2, "bands render");
  const rules = marks.children.filter((m) => has(m, "ch-rule"));
  ok(has(rules[0], "ch-h") && /width: 85%/.test(rules[0].attrs.style) && has(rules[1], "ch-v") && /height: 80%/.test(rules[1].attrs.style), "rules render ch-h with width, ch-v with height");
  const dot = marks.children.find((m) => has(m, "free"));
  ok(dot && has(dot, "ch-dot") && has(dot, "ch-ring") && /left: 50%; top: 50%; --r: 3px; background: #f00/.test(dot.attrs.style), "a free dot renders position, --r, background and ch-ring");
  ok(marks.children.filter((m) => has(m, "ch-dot") && has(m, "x")).every((m) => !/background/.test(m.attrs.style)), "a dot without fill sets no background");
  const lab = marks.children.find((m) => has(m, "ch-label"));
  ok(lab && has(lab, "ch-a-end") && text(lab) === "px" && /left: 1%; top: 14%/.test(lab.attrs.style), "a label renders its text, anchor class and percent position");
  const table = el.children[1];
  ok(table?.tagName === "TABLE" && has(table, "vh"), "table.vh follows the marks");
  const cap = a.find((n) => n.tagName === "CAPTION");
  ok(cap && text(cap) === "Lightness vs chroma", "the table carries the title as its caption");
  ok(a.filter((n) => n.tagName === "TH").map(text).join("|") === "role|L|C", "the header row comes from columns");
  ok(a.filter((n) => n.tagName === "TR").length === 1 + sourceRows(SPEC).length, "one body row per sourceRows entry");
  ok(!a.some((n) => n.tagName === "SVG" || n.tagName === "CANVAS"), "no SVG or Canvas element");

  const bare = renderChart({ W: 100, H: 50, rules: [{ x1: 0, y1: 1, x2: 100, y2: 1 }] });
  ok(bare.children.length === 1 && !all(bare).some((n) => n.tagName === "TABLE"), "the table is omitted when there are no rows");
  ok(all(bare).filter((n) => n.tagName === "TH").length === 0, "no header without rows");
  const dflt = renderChart({ W: 100, H: 50, series: [{ label: "a", points: [{ x: 0, y: 0, v: [1, 2] }, { x: 10, y: 10, v: [2, 3] }] }] });
  ok(all(dflt).filter((n) => n.tagName === "TH").map(text).join("|") === "series|x|y" && !all(dflt).some((n) => n.tagName === "CAPTION"), "columns default to series, x, y and the caption is optional");
}

if (fails.length) {
  for (const f of fails) console.log("FAIL " + f);
  console.log(`FAIL: ${fails.length}`);
  process.exit(1);
}
console.log("charts: core (scaleLinear, runs, ribbon, band, polar, resolveChart, sourceRows) and renderChart pass");
process.exit(0);
