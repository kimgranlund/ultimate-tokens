#!/usr/bin/env node
// control-text.mjs: every shell control rule reads its text size and padding from the cell roles
// (T-0027 step 4).
//
// A control rule is one whose selector names a shell control: the button, select, text and search
// input elements, or one of the control classes below. Its font-size and padding* values must come
// through a var( (the --sh-control-* / --sh-part-* / --sh-chip-* aliases) or be zero, and its
// line-height must be 1, normal, inherit or a var(, so a label sits on one line at the cell height.
// A font shorthand with no var( resets the size too (font: inherit takes the body's 13px), so it fails
// unless a later font-size in the same rule reads a var(.
// Selectors naming .ex- or .geom-ex- are specimen mocks painted at a kit cell, not the shell.
//
// Usage: node test/repo/control-text.mjs [path/to/styles.css]   (default src/ui/styles.css)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const STYLES = process.argv[2] ? resolve(process.argv[2]) : join(ROOT, "src", "ui", "styles.css");

const ELEMENTS = ["button", "select"];
const LITERALS = ['input[type="text"]', 'input[type="search"]'];
const CLASSES = [
  "segmented", "canvas-seg", "section-seg", "chip", "ghost", "icon-only", "pane-toggle", "figma-files",
  "radix-files", "tyi-font-input", "docname", "map-raw-select", "map-raw-input", "pane-back", "toggle",
  "tyi-voice-name",
];
const ALLOW = [".ex-", ".geom-ex-"];

const elementRe = (name) => new RegExp(`(^|[\\s>+~(])${name}(?![\\w-])`);
const classRe = (name) => new RegExp(`\\.${name}(?![\\w-])`);
const TESTS = [
  ...ELEMENTS.map(elementRe).map((re) => (s) => re.test(s)),
  ...LITERALS.map((lit) => (s) => s.includes(lit)),
  ...CLASSES.map(classRe).map((re) => (s) => re.test(s)),
];

// split a selector list on its top-level commas (a :not(a, b) stays one selector)
function splitList(list) {
  const out = [];
  let depth = 0, cur = "";
  for (const ch of list) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// every style rule as [selector list, body], descending into @media / @supports blocks
function rules(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = [];
  const walk = (from, to) => {
    let i = from;
    while (i < to) {
      const open = text.indexOf("{", i);
      if (open === -1 || open >= to) break;
      const prelude = text.slice(i, open).trim();
      let depth = 1, j = open + 1;
      while (j < to && depth > 0) {
        if (text[j] === "{") depth++;
        else if (text[j] === "}") depth--;
        j++;
      }
      if (prelude.startsWith("@")) walk(open + 1, j - 1);
      else out.push([prelude.replace(/^[^]*;\s*/, ""), text.slice(open + 1, j - 1)]);
      i = j;
    }
  };
  walk(0, text.length);
  return out;
}

const isControl = (list) => splitList(list).some((s) => !ALLOW.some((a) => s.includes(a)) && TESTS.some((t) => t(s)));
const LENGTH = /(?<![\w.-])(\d*\.?\d+)(px|rem|em|pt|pc|ch|ex|vh|vw|vmin|vmax|cm|mm|in|q|%)/gi;
const nonZeroLength = (v) => [...v.matchAll(LENGTH)].some((m) => parseFloat(m[1]) > 0);

function violations(css) {
  const out = [];
  for (const [list, body] of rules(css)) {
    if (!isControl(list)) continue;
    const decls = body.split(";").map((decl) => {
      const at = decl.indexOf(":");
      if (at === -1) return null;
      const value = decl.slice(at + 1).trim();
      return { prop: decl.slice(0, at).trim().toLowerCase(), value, bare: value.replace(/\s*!important\s*$/i, "") };
    }).filter(Boolean);
    decls.forEach(({ prop, value, bare }, i) => {
      const literal = !/var\(/.test(bare);
      const sizedLater = decls.slice(i + 1).some((d) => d.prop === "font-size" && /var\(/.test(d.bare));
      const bad =
        ((prop === "font-size" || prop.startsWith("padding")) && literal && nonZeroLength(bare)) ||
        (prop === "line-height" && literal && !["1", "normal", "inherit"].includes(bare)) ||
        (prop === "font" && literal && !sizedLater);
      if (bad) out.push(`${splitList(list).join(", ")} | ${prop}: ${value}`);
    });
  }
  return out;
}

// negative control: a literal text size on a control rule must be flagged
const control = violations(".figma-files button { font-size: 11.5px; }");
if (control.length !== 1) {
  console.log("FAIL control-text: the negative control (.figma-files button { font-size: 11.5px; }) was not flagged");
  process.exit(1);
}
// negative control: a font shorthand with no var( size after it must be flagged
const shorthand = violations(".toggle { font: inherit; }");
if (shorthand.length !== 1) {
  console.log("FAIL control-text: the negative control (.toggle { font: inherit; }) was not flagged");
  process.exit(1);
}

const found = violations(readFileSync(STYLES, "utf8"));
if (found.length) {
  for (const v of found) console.log(`FAIL ${v}`);
  console.log(`control-text: ${found.length} control declaration${found.length === 1 ? "" : "s"} with a literal text size, padding or line-height`);
  process.exit(1);
}
console.log("control-text: pass, every shell control rule reads its text size and padding from the cell roles, line-height 1 or inherited");
