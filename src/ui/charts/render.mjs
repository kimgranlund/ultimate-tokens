// render.mjs, renderChart(spec): a resolved chart (core.mjs) as native DOM. Marks are plain
// elements placed in percent inside an aspect-ratio box and styled by CSS; the data rides along
// in a visually hidden table for assistive tech. No SVG, and no markup strings: every node is h().
import { h } from "../app-helpers.mjs";
import { resolveChart, sourceRows } from "./core.mjs";

const cx = (...c) => c.filter(Boolean).join(" ");

export function renderChart(spec) {
  const o = resolveChart(spec);
  const marks = [
    ...o.bands.map((m) => h("div", { class: cx("ch-band", m.cls), style: `clip-path: ${m.clip}` })),
    ...o.ribbons.map((m) => h("div", { class: cx("ch-ribbon", m.cls), style: `clip-path: ${m.clip}` })),
    ...o.rules.map((m) =>
      h("div", { class: cx("ch-rule", m.orient === "h" ? "ch-h" : "ch-v", m.cls), style: `left: ${m.left}%; top: ${m.top}%; ${m.orient === "h" ? "width" : "height"}: ${m.len}%` })),
    ...o.rects.map((m) => h("div", { class: cx("ch-rect", m.cls), style: `left: ${m.left}%; top: ${m.top}%; width: ${m.width}%; height: ${m.height}%` })),
    ...o.circles.map((m) => h("div", { class: cx("ch-circle", m.cls), style: `left: ${m.left}%; top: ${m.top}%; width: ${m.width}%; height: ${m.height}%` })),
    ...o.dots.map((m) =>
      h("div", { class: cx("ch-dot", m.ring && "ch-ring", m.cls), style: `left: ${m.left}%; top: ${m.top}%; --r: ${m.r}px` + (m.fill ? `; background: ${m.fill}` : "") })),
    ...o.labels.map((m) => h("div", { class: cx("ch-label", "ch-a-" + m.anchor, m.cls), style: `left: ${m.left}%; top: ${m.top}%` }, m.text)),
  ];
  const rows = sourceRows(spec);
  const columns = spec.columns ?? ["series", "x", "y"];
  const table = rows.length
    ? h(
        "table",
        { class: "vh" },
        spec.title ? h("caption", {}, spec.title) : null,
        h("thead", {}, h("tr", {}, ...columns.map((c) => h("th", { scope: "col" }, c)))),
        h("tbody", {}, ...rows.map((r) => h("tr", {}, ...r.map((c) => h("td", {}, c))))),
      )
    : null;
  return h(
    "div",
    { class: cx("an-chart", spec.cls), style: `aspect-ratio: ${o.W} / ${o.H}; max-width: ${o.W}px` },
    h("div", { class: "ch-marks", "aria-hidden": "true" }, ...marks),
    table,
  );
}
