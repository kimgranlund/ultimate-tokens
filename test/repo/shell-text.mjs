#!/usr/bin/env node
// shell-text.mjs: every shell rule reads its text from the shell type roles, and every shell control
// and container reads its insets and radius from the cell roles (T-0044 step 3, widening the T-0027
// control gate).
//
// Text, on every rule not allow-listed: a nonzero literal font-size or letter-spacing, a numeric
// font-weight, a text-transform other than none, inherit or capitalize (a data word's case, not a
// role's), a line-height other than 1, normal, inherit or 0, and a font shorthand with no var( are
// flagged; the shorthand passes when a later font-size in the same rule reads a var(. Geometry, on the
// control and container kinds below: a padding*, gap or border-radius with a nonzero literal length
// outside var( is flagged, except border-radius: 50% (a circle is a shape, not a size). A value that reads a var( passes the
// text checks; custom-property declarations (--*) and @keyframes are not checked.
//
// ALLOW exempts a selector that is not the shell chrome. PENDING lists the families a later step of
// T-0044 migrates; a selector they match is skipped until that step empties its list. A needle that
// starts with = matches one selector exactly; any other needle matches by substring.
//
// Usage: node test/repo/shell-text.mjs [--strict] [path/to/styles.css]   (default src/ui/styles.css)
//   --strict ignores PENDING. /dev/stdin reads the rules from a pipe.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const STRICT = args.includes("--strict");
const pathArg = args.find((a) => !a.startsWith("--"));
const STYLES = pathArg ? resolve(pathArg) : join(ROOT, "src", "ui", "styles.css");

const ELEMENTS = ["button", "select"];
const LITERALS = ['input[type="text"]', 'input[type="search"]', ".toggle .track"];
const CLASSES = [
  "segmented", "canvas-seg", "section-seg", "chip", "ghost", "icon-only", "pane-toggle", "figma-files",
  "radix-files", "tyi-font-input", "docname", "map-raw-select", "map-raw-input", "toggle",
  "tyi-voice-name", "tools-menu", "tools-more", "linklike",
];

const ALLOW = [
  [".ex-", "a specimen painted at a kit cell"],
  [".geom-ex-", "a specimen painted at a kit cell"],
  [".geom-ctl", "the ramp's live mock control, sized by inline style (sections/geometry.js:375)"],
  [".geom-glyph", "a specimen painted at a kit cell"],
  [".geom-caret", "a specimen painted at a kit cell"],
  [".gallery-", "the gallery is a content page, not the editor chrome"],
  [".masthead", "the gallery is a content page, not the editor chrome"],
  [".category-", "the gallery is a content page, not the editor chrome"],
  [".categories-", "the gallery is a content page, not the editor chrome"],
  [".set-", "the gallery is a content page, not the editor chrome"],
  [".tile-", "the gallery is a content page, not the editor chrome"],
  [".new-tile", "the gallery is a content page, not the editor chrome"],
  [".figma-import-row", "the gallery is a content page, not the editor chrome"],
  [".preset-vol", "the gallery is a content page, not the editor chrome"],
  [".brand", "the wordmark is a logotype"],
  [".drag-handle::before", "a drawn glyph"],
  [".radix-step::after", "a drawn glyph"],
  [".ch-", "chart marks own their scale (T-0029)"],
  [".an-svg", "chart marks own their scale (T-0029)"],
  ["=body", "the page outside the host, kept as the pre-host fallback; the host rule declares the body role"],
];
// shell chrome that carries a specimen prefix: never exempt by ALLOW
const CHROME = [".ex-collapse-toggle", ".ex-artifact-title"];

const PENDING = {
  "step-5": [
    ".map-table", ".map-sem", ".map-reset", ".map-drift", ".tok-", ".insp-", ".field", ".key-slot", ".color-story",
    ".color-role", ".story-", ".ex-collapse-toggle", ".ex-artifact-title",
  ],
  "step-6": [
    ".drawer-", ".figma-note", ".radix-note", ".config-note", ".copy-float", ".pro-upsell", ".newpal-", ".apply-gate-",
    ".settings-", ".acct-", ".account-", ".cleanup-",
  ],
  "step-8": [
    "=button", "=select", '=input[type="text"]', '=input[type="search"]', "=.linklike", ".chip", ".segmented",
    ".figma-files", ".radix-files", ".toggle", ".tyi-voice-name", ".tyi-font-input", ".map-raw-", ".tools-menu",
  ],
};

const matches = (s, needle) => (needle.startsWith("=") ? s === needle.slice(1) : s.includes(needle));
const allowed = (s) => !CHROME.some((c) => s.includes(c)) && ALLOW.some(([needle]) => matches(s, needle));
const pendingKey = (s) => Object.keys(PENDING).find((k) => PENDING[k].some((needle) => matches(s, needle)));

const elementRe = (name) => new RegExp(`(^|[\\s>+~(])${name}(?![\\w-])`);
const classRe = (name) => new RegExp(`\\.${name}(?![\\w-])`);
const KINDS = [
  ...ELEMENTS.map(elementRe).map((re) => (s) => re.test(s)),
  ...LITERALS.map((lit) => (s) => s.includes(lit)),
  ...CLASSES.map(classRe).map((re) => (s) => re.test(s)),
];
const isKind = (s) => KINDS.some((t) => t(s));

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

// every style rule as [selector list, body], descending into @media / @supports blocks, skipping @keyframes
function rules(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = [];
  const walk = (from, to) => {
    let i = from;
    while (i < to) {
      const open = text.indexOf("{", i);
      if (open === -1 || open >= to) break;
      const prelude = text.slice(i, open).trim().replace(/^[^]*;\s*/, "");
      let depth = 1, j = open + 1;
      while (j < to && depth > 0) {
        if (text[j] === "{") depth++;
        else if (text[j] === "}") depth--;
        j++;
      }
      if (/^@(-\w+-)?keyframes\b/i.test(prelude)) { i = j; continue; }
      if (prelude.startsWith("@")) walk(open + 1, j - 1);
      else out.push([prelude, text.slice(open + 1, j - 1)]);
      i = j;
    }
  };
  walk(0, text.length);
  return out;
}

const LENGTH = /(?<![\w.-])-?(\d*\.?\d+)(px|rem|em|pt|pc|ch|ex|vh|vw|vmin|vmax|cm|mm|in|q|%)/gi;
const nonZeroLength = (v) => [...v.matchAll(LENGTH)].some((m) => parseFloat(m[1]) > 0);
// the value with every var(...) group removed, fallbacks included
function outsideVar(v) {
  let out = "", i = 0;
  while (i < v.length) {
    if (v.startsWith("var(", i)) {
      let depth = 0, j = i + 3;
      for (; j < v.length; j++) {
        if (v[j] === "(") depth++;
        else if (v[j] === ")" && --depth === 0) break;
      }
      i = j + 1;
      continue;
    }
    out += v[i++];
  }
  return out;
}

const GEOMETRY = (prop) => prop.startsWith("padding") || prop === "gap" || prop === "border-radius";

function textBad(prop, bare, later) {
  if (/var\(/.test(bare)) return false;
  if (prop === "font-size" || prop === "letter-spacing") return nonZeroLength(bare);
  if (prop === "font-weight") return /^\d+(\.\d+)?$/.test(bare);
  if (prop === "text-transform") return !["none", "inherit", "capitalize"].includes(bare);
  if (prop === "line-height") return !["1", "normal", "inherit", "0"].includes(bare);
  if (prop === "font") return !later.some((d) => d.prop === "font-size" && /var\(/.test(d.bare));
  return false;
}

function geometryBad(prop, bare) {
  if (!GEOMETRY(prop)) return false;
  if (prop === "border-radius" && bare === "50%") return false;
  return nonZeroLength(outsideVar(bare));
}

// flagged declarations: { selectors, prop, value } in `found`, and the ones a PENDING family holds in `pending`
function check(css, strict) {
  const found = [], pending = [];
  for (const [list, body] of rules(css)) {
    const live = splitList(list).filter((s) => !allowed(s));
    if (!live.length) continue;
    const decls = body.split(";").map((decl) => {
      const at = decl.indexOf(":");
      if (at === -1) return null;
      const value = decl.slice(at + 1).trim();
      return { prop: decl.slice(0, at).trim().toLowerCase(), value, bare: value.replace(/\s*!important\s*$/i, "") };
    }).filter((d) => d && !d.prop.startsWith("--"));
    decls.forEach(({ prop, value, bare }, i) => {
      let scope = [];
      if (textBad(prop, bare, decls.slice(i + 1))) scope = live;
      else if (geometryBad(prop, bare)) scope = live.filter(isKind);
      if (!scope.length) return;
      const open = strict ? scope : scope.filter((s) => !pendingKey(s));
      if (open.length) found.push({ selectors: open, prop, value });
      else pending.push({ selectors: scope, prop, value, keys: [...new Set(scope.map(pendingKey))] });
    });
  }
  return { found, pending };
}

const line = (v) => `${v.selectors.join(", ")} | ${v.prop}: ${v.value}`;

// negative controls, under strict: each must be flagged
const CONTROLS = [
  ".pane-head .pane-title { font-size: 12px; }",
  ".sub-head { font-weight: 600; }",
  ".tools-menu:popover-open { border-radius: 16px; }",
  ".figma-files button { font-size: 11.5px; }",
  ".toggle { font: inherit; }",
];
for (const css of CONTROLS) {
  if (check(css, true).found.length !== 1) {
    console.log(`FAIL shell-text: the negative control (${css}) was not flagged`);
    process.exit(1);
  }
}
// allow-list positive, under strict: a specimen must pass
const POSITIVE = ".ex-title { font-size: 15px; }";
if (check(POSITIVE, true).found.length) {
  console.log(`FAIL shell-text: the allow-list positive (${POSITIVE}) was flagged`);
  process.exit(1);
}

const { found, pending } = check(readFileSync(STYLES, "utf8"), STRICT);
if (found.length) {
  for (const v of found) console.log(`FAIL ${line(v)}`);
  for (const [needle, reason] of ALLOW) console.log(`allowed: ${needle}: ${reason}`);
  console.log(`shell-text: ${found.length} shell declaration${found.length === 1 ? "" : "s"} with a literal text value, inset, gap or radius`);
  process.exit(1);
}
console.log("shell-text: pass, every shell rule reads its text from the type roles and every control and container its insets and radius from the cell roles");
if (pending.length) {
  const keys = Object.keys(PENDING).filter((k) => pending.some((p) => p.keys.includes(k)));
  console.log(`shell-text: ${pending.length} declaration${pending.length === 1 ? "" : "s"} pending in ${keys.join(", ")}`);
}
