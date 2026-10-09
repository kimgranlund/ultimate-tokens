#!/usr/bin/env node
// ui-polish.mjs (T-0036), the stylesheet half of the control polish: the checks the headless shim cannot make because it
// computes no CSS. Each rule is read from src/ui/styles.css by exact selector; the real-browser half (computed appearance,
// thumb size, swatch widths) is in test/smoke/smoke.mjs. Every check runs first on a known-bad sample so it cannot pass vacuously.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { selectCaret } from "../../src/ui/icons.js";
import { appThemeCSS } from "../../src/ui/model.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CSS = readFileSync(process.argv[2] ? resolve(process.argv[2]) : join(ROOT, "src", "ui", "styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

// the body of the first rule whose selector list is exactly `sel`
const body = (css, sel) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = css.match(new RegExp(`(?:^|\\})\\s*${esc}\\s*\\{([^}]*)\\}`));
  return m ? m[1] : null;
};
const decl = (b, prop) => {
  const m = b && b.match(new RegExp(`(?:^|[;\\s])${prop}\\s*:\\s*([^;]+)`));
  return m ? m[1].trim() : null;
};

const APP = readFileSync(join(ROOT, "src", "ui", "app.js"), "utf8");
// the chrome's --ink-dim per scheme: --c-neutral-on-surface-variant is light-dark(neutral-750, neutral-250) in the boot theme
const THEME = appThemeCSS();
const neutral = (stop) => (THEME.match(new RegExp(`--c-neutral-${stop}:\\s*([^;]+);`)) || [])[1];
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// the rule bodies whose selector is not the gallery or a specimen (the motion allow-list)
const GALLERY = [".tile", ".category-", ".gallery-", ".set-", ".new-tile", ".preset-", ".masthead", ".ex-", ".geom-ex-"];
const shellRules = (css) => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [m[1].trim().replace(/\s+/g, " "), m[2]]).filter(([sel]) => !GALLERY.some((a) => sel.includes(a)));
const transitions = (css) => shellRules(css).flatMap(([sel, b]) => b.split(";").filter((d) => /^\s*transition\s*:/.test(d)).map((d) => [sel, d.trim()]));
const RANGE = 'input[type="range"]';
const CHECKS = [
  ["every select drops the native look (appearance none) and draws the caret (--select-caret)", (css) => {
    const b = body(css, "select");
    return !!b && decl(b, "appearance") === "none" && decl(b, "background-image") === "var(--select-caret)" && /var\(--sh-control-icon/.test(decl(b, "--select-lane") || "") && /var\(--select-lane\)/.test(decl(b, "padding-inline-end") || "");
  }],
  ["the range thumb is at least the control icon role in both engines", (css) => {
    const mult = (css.match(/--ctl-range-thumb:\s*calc\(var\(--sh-control-icon\)\s*\*\s*([\d.]+)\)/) || [])[1];
    return !!mult && parseFloat(mult) >= 1 &&
      ["::-webkit-slider-thumb", "::-moz-range-thumb"].every((p) => /var\(--ctl-range-thumb\)/.test(decl(body(css, `${RANGE}${p}`), "width") || ""));
  }],
  ["the range track is sized from the control icon role", (css) => /--ctl-range-track:\s*calc\(var\(--sh-control-icon\)/.test(css) && /var\(--ctl-range-track\)/.test(decl(body(css, RANGE), "height") || "")],
  ["the prime strip has no gap and its swatches share the width equally (flex-basis 0, no fixed width)", (css) => {
    const strip = body(css, ".prime-strip"), sw = body(css, ".prime-swatch");
    return !!strip && !!sw && /^0(px)?$/.test(decl(strip, "gap") || "") && decl(strip, "width") === "100%" && /^1 1 0/.test(decl(sw, "flex") || "") && decl(sw, "width") === null;
  }],
  ["the New Palette context priority row is one gapless strip too", (css) => {
    const row = body(css, ".newpal-pp-chain-row"), sw = body(css, ".newpal-pp-chain-sw");
    return !!row && !!sw && /^0(px)?$/.test(decl(row, "gap") || "") && /^1 1 0/.test(decl(sw, "flex") || "") && decl(sw, "width") === null;
  }],
  ["the pinned example select keeps the chevron lane, and its field style sets background-color (a background shorthand resets the chevron image)", (css, app) => {
    const fs = (app.match(/const fieldStyle = "([a-z-]+):/) || [])[1];
    return /\.ex-select\s*\{[^}]*padding-inline-end:\s*var\(--select-lane\)/.test(css) && fs === "background-color";
  }],
  // the anatomy rows (T-0044, shell-roles.mjs CONTROL_ANATOMY and CONTAINER_COMPOSITION)
  ["anatomy: the interactive chip is a control (control font, height and inset, a pill on the control height)", (css) => {
    const b = body(css, "button.chip");
    return decl(b, "font") === "var(--ui-control-font)" && decl(b, "min-block-size") === "var(--sh-control-height)" && decl(b, "padding-inline") === "var(--sh-control-inset)" && decl(b, "border-radius") === "calc(var(--sh-control-height) / 2)";
  }],
  ["anatomy: the badge chip keeps the compact chip row (badge font, chip height and inset, a pill on the chip height)", (css) => {
    const b = body(css, ".chip");
    return decl(b, "font") === "var(--ui-badge-font)" && decl(b, "min-block-size") === "var(--sh-chip-height)" && decl(b, "padding-inline") === "var(--sh-chip-inset)" && decl(b, "border-radius") === "calc(var(--sh-chip-height) / 2)";
  }],
  ["anatomy: the switch thumb sits one edge inside its track (thumb = icon - 2 edge, inset by the edge, track radius half the icon)", (css) => {
    const thumb = body(css, ".toggle .track::after");
    return /--ctl-thumb:\s*calc\(var\(--sh-control-icon\)\s*-\s*2\s*\*\s*var\(--ui-edge\)\)/.test(css) && decl(thumb, "top") === "var(--ui-edge)" && decl(thumb, "left") === "var(--ui-edge)" && decl(thumb, "width") === "var(--ctl-thumb)" && decl(body(css, ".toggle .track"), "border-radius") === "calc(var(--sh-control-icon) / 2)";
  }],
  ["anatomy: the menu wrap pads by the part inset and rounds on the card radius", (css) => {
    const b = body(css, ".tools-menu:popover-open");
    return decl(b, "padding") === "var(--sh-part-inset)" && decl(b, "border-radius") === "var(--sh-radius-card)";
  }],
  ["anatomy: every button reads the control role font, with no size override", (css) => {
    const b = body(css, "button");
    return decl(b, "font") === "var(--ui-control-font)" && decl(b, "font-size") === null;
  }],
  // the select caret (user ruling 2026-10-09: the caret-down glyph, not the gradient triangle)
  ["select caret: the caret-down path, one data-URI per scheme filled with the chrome's --ink-dim, and the compact select on one caret", (css) => {
    const light = selectCaret(neutral(750)), dark = selectCaret(neutral(250));
    const raw = body(css, ".map-raw-select");
    return !!neutral(750) && css.includes(`ultimate-tokens { --select-caret: ${light}; }`) && css.includes(`ultimate-tokens[data-theme="dark"] { --select-caret: ${dark}; }`) &&
      new RegExp(`@media \\(prefers-color-scheme: dark\\) \\{\\s*ultimate-tokens\\[data-theme="system"\\] \\{ --select-caret: ${esc(dark)}; \\}`).test(css) &&
      !/linear-gradient\([^)]*--select-chevron/.test(css) && decl(raw, "background-position") === "right var(--sh-chip-inset) center";
  }],
  // the glyph motion set (shell-roles.mjs MOTION)
  ["motion: every non-gallery transition reads the glyph motion tokens (no literal duration)", (css) => {
    const all = transitions(css);
    return all.length > 0 && all.every(([, d]) => !/\d(ms|s)\b/.test(d.replace(/var\([^)]*\)/g, "")) && /var\(--ui-motion-(fast|base)\) var\(--ui-motion-ease\)/.test(d));
  }],
  ["motion: the disclosure caret turns over on aria-expanded, and both reduced-motion blocks collapse every duration", (css) => {
    const base = body(css, ".caret"), open = body(css, '[aria-expanded="true"] > .caret');
    return decl(base, "transition") === "transform var(--ui-motion-fast) var(--ui-motion-ease)" && decl(open, "transform") === "rotate(180deg)" &&
      /ultimate-tokens\[data-motion="reduced"\] \*[^{]*\{[^}]*transition-duration:\s*0\.01ms !important/.test(css) &&
      /@media \(prefers-reduced-motion: reduce\)\s*\{\s*ultimate-tokens\[data-motion="system"\] \*[^{]*\{[^}]*transition-duration:\s*0\.01ms !important/.test(css);
  }],
];

// known-bad samples, one per check, that the check must reject
const BAD = [
  "select { font: inherit; }",
  "ultimate-tokens { --ctl-range-thumb: calc(var(--sh-control-icon) * 0.5); }",
  `${RANGE} { height: 4px; }`,
  ".prime-strip { display: flex; gap: 3px; } .prime-swatch { width: 26px; }",
  ".newpal-pp-chain-row { display: flex; gap: 6px; } .newpal-pp-chain-sw { width: 22px; }",
  ".ex-select { width: auto; }",
  "button.chip { font: var(--ui-control-font); min-block-size: var(--sh-chip-height); padding-inline: var(--sh-chip-inset); border-radius: 999px; }",
  ".chip { font-size: var(--sh-chip-text); font-weight: 600; min-block-size: var(--sh-chip-height); padding-inline: var(--sh-chip-inset); border-radius: 999px; }",
  "ultimate-tokens { --ctl-thumb: calc(var(--sh-control-icon) - 4px); } .toggle .track { border-radius: 999px; } .toggle .track::after { top: 2px; left: 2px; width: var(--ctl-thumb); }",
  ".tools-menu:popover-open { padding: var(--sh-part-inset); border-radius: calc(var(--sh-control-radius) + var(--sh-part-inset)); }",
  "button { font: inherit; font-size: var(--sh-control-text); }",
  "select { background-image: linear-gradient(45deg, transparent 50%, var(--select-chevron, var(--ink-dim)) 50%); } .map-raw-select { background-position: calc(100% - 5px) 50%, 100% 50%; }",
  ".toggle .track { transition: background .12s; }",
  ".caret { flex: none; transition: transform var(--ui-motion-fast) var(--ui-motion-ease); } [aria-expanded=\"true\"] > .caret { transform: rotate(180deg); }",
];
// a field style that is the `background:` shorthand, with the right padding rule: still rejected
const BAD_APP = 'const fieldStyle = "background:" + pick(x);';

let failed = 0;
CHECKS.forEach(([name, fn], i) => {
  if (fn(BAD[i], i === 5 ? BAD_APP : APP) || (i === 5 && fn(".ex-select { padding-inline-end: var(--select-lane); }", BAD_APP))) { console.log(`FAIL ui-polish: the negative control for "${name}" was accepted`); failed++; return; }
  if (!fn(CSS, APP)) { console.log(`FAIL ui-polish: ${name}`); failed++; }
});
if (failed) process.exit(1);
console.log(`ui-polish: pass, ${CHECKS.length} stylesheet checks (each rejects its known-bad sample)`);
