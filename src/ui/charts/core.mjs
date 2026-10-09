// core.mjs, the pure chart core behind renderChart (render.mjs). No DOM, no imports: a chart spec
// in nominal px (the W x H box each section function already draws in) resolves to percent
// primitives, so every mark scales with the chart box and never needs SVG or Canvas.
//
// Missing data stays missing: a non-finite input maps to NaN, splits a run, and drops the mark,
// it is never placed at 0. The ribbon is a port of strokeRibbon from the native-dom-charts
// project (src/lib/core/geometry.js): one clip-path polygon per run, bounded miter joins.

// Stroke widths in px. The polygon fixes the thickness when the chart resolves, so a width is a
// constant per series here, not a CSS token.
export const STROKE = { line: 1.5, ref: 1 };

const finite = (v) => typeof v === "number" && Number.isFinite(v);
const r3 = (v) => Math.round(v * 1000) / 1000;

// scaleLinear([d0, d1], [r0, r1]) maps a domain value to the range. A non-number or non-finite
// input returns NaN; a degenerate domain maps to the range midpoint.
export function scaleLinear([d0, d1], [r0, r1]) {
  return (v) => {
    if (!finite(v)) return NaN;
    if (d0 === d1) return (r0 + r1) / 2;
    return r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
  };
}

// runs(points): the stretches of consecutive points with finite x and y. A missing point ends the
// run and is dropped; a lone point is a run of length 1.
export function runs(points) {
  const out = [];
  let cur = [];
  for (const p of points ?? []) {
    if (p && finite(p.x) && finite(p.y)) cur.push(p);
    else if (cur.length) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
}

const pctPolygon = (pts, W, H) => {
  const xs = pts.map((p) => (p.x / W) * 100), ys = pts.map((p) => (p.y / H) * 100);
  if (![...xs, ...ys].every(Number.isFinite)) return "";
  return `polygon(${xs.map((x, i) => `${x.toFixed(3)}% ${ys[i].toFixed(3)}%`).join(", ")})`;
};

// ribbon(run, W, H, stroke): a stroked line as a clip-path polygon of 2n vertices, the run offset
// by +stroke/2 along each vertex normal, then back by -stroke/2. Fewer than 2 points draws nothing.
export function ribbon(run, W, H, stroke = STROKE.line) {
  if (!run || run.length < 2 || !(W > 0) || !(H > 0)) return "";
  const normals = run.slice(1).map((v, i) => {
    const dx = v.x - run[i].x, dy = v.y - run[i].y, l = Math.hypot(dx, dy) || 1;
    return { x: -dy / l, y: dx / l };
  });
  const edges = run.map((v, i) => {
    const a = normals[Math.max(0, i - 1)], b = normals[Math.min(i, normals.length - 1)];
    const den = Math.max(0.25, 1 + a.x * b.x + a.y * b.y);
    return { x: v.x, y: v.y, nx: (a.x + b.x) / den, ny: (a.y + b.y) / den };
  });
  const side = (v, sign) => ({ x: v.x + (v.nx * sign * stroke) / 2, y: v.y + (v.ny * sign * stroke) / 2 });
  return pctPolygon([...edges.map((v) => side(v, 1)), ...edges.reverse().map((v) => side(v, -1))], W, H);
}

// band(run, W, H, base): a filled area, the run closed onto a base line. `{ y }` is a horizontal
// base, `{ x }` a vertical one (graphLC's gamut ceiling closes to X(0)).
export function band(run, W, H, base) {
  if (!run || !run.length || !(W > 0) || !(H > 0) || !base) return "";
  const first = run[0], last = run[run.length - 1];
  let close;
  if (finite(base.y)) close = [{ x: last.x, y: base.y }, { x: first.x, y: base.y }];
  else if (finite(base.x)) close = [{ x: base.x, y: last.y }, { x: base.x, y: first.y }];
  else return "";
  return pctPolygon([...run, ...close], W, H);
}

// polar(angleDeg, r, cx, cy): 0 degrees at top, clockwise, in the units of the inputs.
export function polar(angleDeg, r, cx, cy) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) };
}

const ANCHORS = new Set(["start", "middle", "end"]);

// resolveChart(spec): the spec's px marks as percent primitives. Every number in the result is
// finite; a mark with a non-finite coordinate is dropped.
export function resolveChart(spec) {
  const W = spec?.W, H = spec?.H;
  const out = { W: finite(W) ? W : 0, H: finite(H) ? H : 0, ribbons: [], bands: [], dots: [], rules: [], labels: [], rects: [], circles: [] };
  if (!(W > 0 && H > 0 && finite(W) && finite(H))) return out;
  const px = (x) => r3((x / W) * 100), py = (y) => r3((y / H) * 100);

  for (const s of spec.series ?? []) {
    const cls = s.cls ?? "";
    for (const run of runs(s.points)) {
      if (s.kind === "band") {
        const clip = band(run, W, H, s.base);
        if (clip) out.bands.push({ cls, clip });
      } else {
        const clip = ribbon(run, W, H, finite(s.stroke) ? s.stroke : STROKE.line);
        if (clip) out.ribbons.push({ cls, clip });
      }
      if (finite(s.dot)) for (const p of run) out.dots.push({ cls, left: px(p.x), top: py(p.y), r: s.dot, fill: null, ring: false });
    }
  }
  for (const d of spec.rules ?? []) {
    if (![d.x1, d.y1, d.x2, d.y2].every(finite)) continue;
    const h = d.y1 === d.y2;
    out.rules.push({
      cls: d.cls ?? "", orient: h ? "h" : "v",
      left: px(Math.min(d.x1, d.x2)), top: py(Math.min(d.y1, d.y2)),
      len: h ? r3((Math.abs(d.x2 - d.x1) / W) * 100) : r3((Math.abs(d.y2 - d.y1) / H) * 100),
    });
  }
  for (const d of spec.labels ?? []) {
    if (!finite(d.x) || !finite(d.y)) continue;
    out.labels.push({ text: String(d.text ?? ""), left: px(d.x), top: py(d.y), anchor: ANCHORS.has(d.anchor) ? d.anchor : "start", cls: d.cls ?? "" });
  }
  for (const d of spec.rects ?? []) {
    if (![d.x, d.y, d.w, d.h].every(finite)) continue;
    out.rects.push({ cls: d.cls ?? "", left: px(d.x), top: py(d.y), width: r3((d.w / W) * 100), height: r3((d.h / H) * 100) });
  }
  for (const d of spec.circles ?? []) {
    if (![d.cx, d.cy, d.r].every(finite)) continue;
    out.circles.push({ cls: d.cls ?? "", left: px(d.cx - d.r), top: py(d.cy - d.r), width: r3(((2 * d.r) / W) * 100), height: r3(((2 * d.r) / H) * 100) });
  }
  for (const d of spec.dots ?? []) {
    if (![d.x, d.y, d.r].every(finite)) continue;
    out.dots.push({ cls: d.cls ?? "", left: px(d.x), top: py(d.y), r: d.r, fill: d.fill ?? null, ring: !!d.ring });
  }
  return out;
}

const cell = (v) => (typeof v === "string" ? v : finite(v) ? String(r3(v)) : "");

// sourceRows(spec): the chart's data as [label, x, y] strings, one per series point and free dot
// that carries `v`. A missing value prints "", never "0".
export function sourceRows(spec) {
  const rows = [];
  const row = (label, v) => rows.push([String(label ?? ""), cell(v?.[0]), cell(v?.[1])]);
  for (const s of spec?.series ?? []) for (const p of s.points ?? []) if (p && p.v) row(s.label, p.v);
  for (const d of spec?.dots ?? []) if (d && d.v) row(d.label, d.v);
  return rows;
}
