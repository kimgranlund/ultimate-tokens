#!/usr/bin/env node
// shell-roles.mjs, direct coverage for the shell's standard tables (src/ui/shell-roles.mjs) over all
// 27 cells of geomScale({}). The row-step check derives the expected text independently, from the
// height keys of type.mjs's UI_TEXT sorted descending, never from LADDER_ROWS, which the module walks.
import * as S from "../../src/ui/shell-roles.mjs";
import { geomScale } from "../../src/engine/geometry.mjs";
import { UI_TEXT, uiText } from "../../src/engine/type.mjs";

const fails = [];
let checks = 0;
const ok = (c, m) => { checks++; if (!c) fails.push(m); };
const near = (a, b) => Math.abs(a - b) < 1e-9;

const cells = geomScale({}).cells;
const names = Object.keys(cells);
ok(names.length === 27, `geomScale({}) has ${names.length} cells, want 27`);

// The independent row walk: heights from UI_TEXT, tallest first.
const HEIGHTS = Object.keys(UI_TEXT).map(Number).sort((a, b) => b - a);
const expectText = (cell, step, at) => {
  const h = HEIGHTS[Math.min(HEIGHTS.indexOf(cell.height) - step, HEIGHTS.length - 1)];
  return at ? at[h] : UI_TEXT[h];
};
const F125 = Object.fromEntries(HEIGHTS.map((h) => [h, uiText(h, 1.25)]));
const rowStepMisses = (fn, at) => {
  const out = [];
  for (const n of names) for (const s of [0, -1, -2, -3]) {
    const got = fn(cells[n], s, at), want = expectText(cells[n], s, at);
    if (got !== want) out.push(`${n} step ${s}: ${got}, want ${want}`);
  }
  return out;
};

// Row steps, bare table and the factor-1.25 map.
for (const at of [null, F125]) {
  const miss = rowStepMisses(S.roleText, at);
  ok(miss.length === 0, `roleText ${at ? "factor 1.25" : "bare"}: ${miss.slice(0, 3).join("; ")}`);
}
for (const n of names) {
  const c = cells[n];
  ok(S.roleText(c, 0, null) === c.text, `${n} step 0 is ${S.roleText(c, 0, null)}, cell.text ${c.text}`);
  ok(S.roleText(c, "badge", null) === c.chipText, `${n} badge is ${S.roleText(c, "badge", null)}, chipText ${c.chipText}`);
}
// The micro cells whose steps run past the last row clamp at row 12.
const pastEnd = names.filter((n) => HEIGHTS.indexOf(cells[n].height) + 3 > HEIGHTS.length - 1);
ok(pastEnd.length > 0 && pastEnd.every((n) => n.startsWith("micro-")), `cells stepping past row 12: ${pastEnd}`);
for (const n of pastEnd) ok(S.roleText(cells[n], -3, null) === UI_TEXT[12], `${n} step -3 is ${S.roleText(cells[n], -3, null)}, want the row-12 text ${UI_TEXT[12]}`);

// Negative control: a stand-in that ignores the step must fail the row-step check.
const ignoresStep = (cell, step, at) => (at ? at[cell.height] : uiText(cell.height));
ok(rowStepMisses(ignoresStep, null).length > 0, "negative control: the row-step check accepts a roleText that ignores the step");
ok(rowStepMisses(ignoresStep, F125).length > 0, "negative control: the factor-1.25 row-step check accepts a roleText that ignores the step");

// Anatomy: every value finite, positive except the icon-only inset, and the named laws.
const ANATOMY = ["button", "icon-only", "input", "select", "trigger", "chip", "badge", "switch", "range"];
ok(ANATOMY.every((k) => typeof S.CONTROL_ANATOMY[k] === "function") && Object.keys(S.CONTROL_ANATOMY).length === ANATOMY.length, `CONTROL_ANATOMY kinds ${Object.keys(S.CONTROL_ANATOMY)}`);
for (const n of names) {
  const c = cells[n];
  for (const k of ANATOMY) {
    const a = S.CONTROL_ANATOMY[k](c);
    for (const [f, v] of Object.entries(a)) {
      const zero = k === "icon-only" && f === "inset";
      ok(Number.isFinite(v) && (zero ? v === 0 : v > 0), `${n} ${k}.${f} = ${v}`);
    }
  }
  const sel = S.CONTROL_ANATOMY.select(c), chip = S.CONTROL_ANATOMY.chip(c), badge = S.CONTROL_ANATOMY.badge(c), sw = S.CONTROL_ANATOMY.switch(c);
  ok(sel.lane === c.icon + c.inset, `${n} select.lane ${sel.lane}, want icon + inset ${c.icon + c.inset}`);
  ok(chip.height === c.height, `${n} chip.height ${chip.height}, want height ${c.height}`);
  ok(badge.glyph === c.chipHeight - 2 * c.chipInset, `${n} badge.glyph ${badge.glyph}`);
  ok(sw.thumb + 2 * sw.edge === c.icon, `${n} switch thumb ${sw.thumb} + 2 * edge ${sw.edge} != icon ${c.icon}`);
}

// Composition law: the outer radius is the part radius plus the padding.
const CONTAINERS = ["segmented", "tab-row", "menu", "input-group", "switch-track"];
ok(CONTAINERS.every((k) => typeof S.CONTAINER_COMPOSITION[k] === "function"), `CONTAINER_COMPOSITION kinds ${Object.keys(S.CONTAINER_COMPOSITION)}`);
for (const n of names) for (const k of ["segmented", "menu"]) {
  const r = S.CONTAINER_COMPOSITION[k](cells[n]);
  ok(near(r.radius, r.partRadius + r.padding), `${n} ${k} radius ${r.radius} != partRadius ${r.partRadius} + padding ${r.padding}`);
}

// The CSS block names the host key and every emitted variable.
{
  const c = cells["product-sm-md"];
  const css = S.shellRolesCSS(c, null, "k9");
  const lines = css.split("\n");
  ok(lines[0] === 'ultimate-tokens[data-ut-geom="k9"] {' && lines[lines.length - 1] === "}", `shellRolesCSS frame: ${lines[0]} ... ${lines[lines.length - 1]}`);
  const want = [0, -1, -2, -3].map((s, i) => `--ui-text-step-${i}: ${expectText(c, s, null)}px;`).concat(`--ui-badge-icon: ${c.chipHeight - 2 * c.chipInset}px;`, `--ui-edge: ${S.edge(c)}px;`);
  for (const d of want) ok(lines.some((l) => l.trim() === d), `shellRolesCSS lacks "${d}"`);
  ok(lines.length === want.length + 2, `shellRolesCSS has ${lines.length} lines, want ${want.length + 2}`);
}

if (fails.length) {
  for (const f of fails) console.log("FAIL " + f);
  console.log(`FAIL: ${fails.length}`);
  process.exit(1);
}
console.log(`shell-roles: pass, ${checks} checks over ${names.length} cells`);
process.exit(0);
