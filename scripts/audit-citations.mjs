#!/usr/bin/env node
// audit-citations.mjs -- the generative completeness predicate for #637 §6 filing item 1,
// and a GATE: `test/repo/citations.mjs` runs it from `npm test`.
// Run from the repo root:  node scripts/audit-citations.mjs  [--md | --json | --selftest]
// Read-only: readFileSync + `git ls-files`. It writes nothing and mutates nothing.
//
// EXIT CODE (PR #658 review, finding 1): 1 when any audited doc has STALE > 0 lines, or
// when a read/parse fails; 0 otherwise. `--md`/`--json` keep their output AND the same
// exit semantics. `--selftest` exercises parseCitations() on literal strings and exits
// nonzero on the first miss. `runAudit()` / `parseCitations()` / `staleLines()` are
// exported so the gate imports the logic instead of scraping stdout.
//
// It answers two questions MECHANICALLY, so that §6's enumeration is generated rather
// than hand-counted:
//   (A) which LINES of the two committed records carry a citation that no longer
//       describes what it points at, and
//   (B) which LINES carry a canvasView value-set enumeration that a 4th value falsifies.
//
// Definitions, stated as code rather than as prose:
//   CITATION  = `<file>.<ext>:<N>` anywhere in the doc, INCLUDING inside a fenced
//               code block, or a bare `:<N>` whose file is the doc's own stated
//               default (DOCS[].implied).  The ENUMERATION test alone skips fences.
//               A range `:<N>-<M>` is one citation spanning N..M. A SLASH LIST
//               `:<N>/<M>/<K>` (`app.js:726/727/836/837`) is one citation PER number:
//               every member is checked and the doc line is STALE if any member is
//               (PR #658 review, finding 2: only the first member used to be checked).
//   ANCHOR    = a token on the CITING line specific enough to look for in the CITED
//               line: a camelCase/PascalCase identifier, a `.class`/`#id`, or any
//               identifier the doc writes as a call (`name(`) or as the citation's own
//               subject (`name :N`). Bare lowercase English is NOT an anchor.
//   VERDICTS  STALE-PAST-EOF   cited line number exceeds the cited file's length
//             STALE-WRONG-LINE no anchor occurs at the cited line or within WINDOW
//             NEAR             an anchor occurs within WINDOW of the cited line
//             OK               an anchor occurs AT the cited line
//             UNDECIDABLE      the citing line carries no anchor; a human must read it
//             NOFILE           the cited path is not tracked
// STALE ∪ NEAR ∪ UNDECIDABLE ∪ OK ∪ NOFILE partitions every citation, so the
// DENOMINATOR (total citation lines) is generated too, which is the thing two rounds
// of hand-enumeration could not produce.

import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const DOCS = [
  { path: "docs/lld/app-shell.md", implied: "src/ui/app.js" },
  { path: "docs/reference/references/component-inventory.md", implied: "src/ui/app.js" },
];
const EXT = "js|mjs|cjs|css|html|json|md";
const WINDOW = (target) => (target.endsWith(".css") ? 15 : 3); // a CSS rule body is long

const tracked = execSync("git ls-files", { encoding: "utf8" }).trim().split("\n");
const byBase = new Map();
for (const p of tracked) {
  const b = p.split("/").pop();
  if (!byBase.has(b)) byBase.set(b, []);
  byBase.get(b).push(p);
}
const cache = new Map();
function read(p) {
  if (!cache.has(p)) {
    const t = readFileSync(p, "utf8").split("\n");
    if (t.length && t[t.length - 1] === "") t.pop(); // a trailing newline is not a line
    cache.set(p, t);
  }
  return cache.get(p);
}

// ---------- the canvasView value set, DERIVED from src/, never hardcoded ----------
function canvasViewValues() {
  const vals = new Set();
  for (const p of tracked) {
    if (!/^src\/.*\.(js|mjs)$/.test(p)) continue;
    for (const ln of read(p)) {
      for (const m of ln.matchAll(/canvasView\s*(?:===|!==)\s*"([a-z]+)"/g)) vals.add(m[1]);
    }
  }
  const color = read("src/ui/sections/color.js");
  const seg = color.findIndex((l) => l.includes('cls: "canvas-seg"'));
  if (seg > 0) for (let i = seg; i >= 0 && i > seg - 30; i--) {
    const m = color[i].match(/\{ id: "([a-z]+)", label: "[^"]+"/);
    if (m) vals.add(m[1]);
  }
  return [...vals].sort();
}

// ---------- citation extraction ----------
const reExplicit = new RegExp(`([A-Za-z0-9_@./-]+\\.(?:${EXT})):(\\d+)(?:[-\u2013](\\d+))?((?:/\\d+)+)?`, "g");
const reBare = /(?:^|[^A-Za-z0-9_./)\]])[:](\d{2,4})(?:[-\u2013](\d{2,4}))?((?:\/\d{2,4})+)?\b/g;

// One doc line -> its citations, each `{ cited, n, end, form, list }`. `cited` is the path as
// written (an explicit one) or `implied`. A slash list yields one entry per member, each
// carrying the whole list in `list` so the report can still show what the doc wrote.
export function parseCitations(raw, implied) {
  const cites = [];
  const expand = (cited, n, end, slash, form) => {
    const members = slash ? slash.split("/").filter(Boolean).map(Number) : [];
    const list = members.length ? form : undefined;
    cites.push({ cited, n, end, form: members.length ? form.slice(0, form.length - slash.length) : form, list });
    const prefix = form.slice(0, form.indexOf(":") + 1);
    for (const m of members) cites.push({ cited, n: m, end: m, form: `${prefix}${m}`, list });
  };
  let stripped = raw;
  for (const m of raw.matchAll(reExplicit)) {
    expand(m[1], +m[2], m[3] ? +m[3] : +m[2], m[4] || "", m[0]);
    stripped = stripped.replace(m[0], " ".repeat(m[0].length));
  }
  for (const m of stripped.matchAll(reBare)) {
    const form = `:${m[1]}${m[2] ? "-" + m[2] : ""}${m[3] || ""}`;
    expand(implied, +m[1], m[2] ? +m[2] : +m[1], m[3] || "", form);
  }
  return cites;
}
const reExtTail = new RegExp(`\\.(?:${EXT})$`);
const LIT = "~~LIT~~"; // sentinel prefix marking a literal code fragment rather than an identifier

function resolvePath(cited) {
  if (tracked.includes(cited)) return cited;
  const base = cited.split("/").pop();
  const hits = (byBase.get(base) || []).filter((p) => p.endsWith(cited) || p.split("/").pop() === base);
  if (!hits.length) return null;
  const rank = (p) => (p.startsWith("src/") ? 0 : p.startsWith("test/") ? 1 : 2);
  return hits.sort((a, b) => rank(a) - rank(b) || a.length - b.length)[0];
}

function anchorsOf(docLine) {
  const out = new Set();
  const add = (tok) => { if (tok && !reExtTail.test(tok)) out.add(tok); };
  const spans = [...docLine.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  for (const raw of spans) {
    // a code FRAGMENT (a CSS declaration, a JS expression) is matched literally: the
    // doc claims this exact text lives at the cited line.
    const frag = raw.trim();
    if (/[:;=]/.test(frag) && /\s/.test(frag) && !new RegExp(`\\.(?:${EXT}):\\d`).test(frag)) out.add(LIT + frag);
    const s = raw.replace(new RegExp(`[A-Za-z0-9_@./-]+\\.(?:${EXT}):\\d+`, "g"), " ");
    for (const t of s.matchAll(/(?<![A-Za-z0-9_$.#])[.#]?[A-Za-z_$][A-Za-z0-9_$-]*/g)) {
      const tok = t[0];
      const bare = tok.replace(/^[.#]/, "");
      const isSelector = /^[.#]/.test(tok);
      const isCamel = /[A-Z]/.test(bare);
      const isCall = new RegExp(`${bare.replace(/[-]/g, "\\$&")}\\s*\\(`).test(s);
      if (isSelector || isCamel || isCall) add(tok);
    }
  }
  // `name :N` / `name(` outside backticks too -- the component table's own shape
  for (const m of docLine.matchAll(/(?<![A-Za-z0-9_$.])([A-Za-z_$][A-Za-z0-9_$]*)[\s`]*:\d{2,4}/g)) add(m[1]);
  for (const m of docLine.matchAll(/(?<![A-Za-z0-9_$.])([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g)) add(m[1]);
  return [...out];
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const hasToken = (line, anchor) => {
  if (anchor.startsWith(LIT)) return line.includes(anchor.slice(LIT.length)); // literal fragment
  const t = esc(anchor.replace(/^[.#]/, ""));
  return new RegExp(`(?<![A-Za-z0-9_$])${t}(?![A-Za-z0-9_$-])`).test(line);
};

// the mechanically-derived ACTUAL home of an anchor: definition sites, not mentions
function homesOf(anchor) {
  if (anchor.startsWith(LIT)) {
    const lit = anchor.slice(LIT.length), hits = [];
    for (const p of tracked) {
      if (!/^(src|test|scripts|mcp)\/.*\.(js|mjs|css)$/.test(p)) continue;
      const lines = read(p);
      for (let i = 0; i < lines.length; i++) if (lines[i].includes(lit)) hits.push(`${p}:${i + 1}`);
    }
    return hits;
  }
  const name = esc(anchor.replace(/^[.#]/, ""));
  const selector = /^[.#]/.test(anchor);
  const hits = [];
  for (const p of tracked) {
    if (!/^(src|test|scripts|mcp|figma\/binder)\/.*\.(js|mjs|css)$/.test(p)) continue;
    const lines = read(p);
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      let hit = false;
      if (selector) {
        if (p.endsWith(".css")) hit = new RegExp(`(^|[\\s,>+~])\\.${name}(?![A-Za-z0-9_-])[^{;]*[{,]`).test(l);
        else hit = new RegExp(`class:\\s*[\`"'][^\`"']*\\b${name}\\b`).test(l) || new RegExp(`classList\\.[a-z]+\\([\`"']${name}`).test(l);
      } else {
        hit = new RegExp(`^\\s*(?:async\\s+)?(?:static\\s+)?${name}\\s*\\(`).test(l)
          || new RegExp(`(?:function|const|let|var|class)\\s+${name}(?![A-Za-z0-9_$])`).test(l)
          || new RegExp(`^\\s*${name}\\s*[:=]\\s*(?:async\\s*)?(?:function|\\()`).test(l);
      }
      if (hit) hits.push(`${p}:${i + 1}`);
    }
  }
  return hits;
}

// ---------- run ----------
export function runAudit() {
const VALUES = canvasViewValues();
const report = { head: execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim(), canvasViewValues: VALUES, docs: {} };

for (const { path: doc, implied } of DOCS) {
  const lines = read(doc);
  let fenced = false;
  const rows = [], enums = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i], n = i + 1;
    if (/^\s*```/.test(raw)) { fenced = !fenced; continue; }

    // The fence skip applies to the ENUMERATION test ONLY (round 11's blocking finding).
    // A fenced block is a quoted RECORD in these two docs, and a citation inside one is
    // as much a claim about the repo as a citation in prose: component-inventory.md
    // carries 3 stale citations (:163, :218, :279) inside fenced JSON that the old
    // blanket `if (fenced) continue;` hid from the STALE set, and therefore from the
    // `STALE 0` discharge gate. Citation extraction now runs on fenced lines too.
    if (!fenced) {
      const lc = raw.toLowerCase();
      const named = VALUES.filter((v) => lc.includes(v));
      if (named.length >= 2 && !lc.includes("radix"))
        enums.push({ line: n, named, text: raw.trim() });
    }

    const cites = parseCitations(raw, implied);
    if (!cites.length) continue;

    // Anchors come from the citing line. If it carries none (a citation whose subject
    // sits in the previous sentence, e.g. app-shell.md:143 / :219), widen to the
    // enclosing prose paragraph rather than reporting UNDECIDABLE: a wider anchor set
    // can only make the verdict MORE forgiving, never falsely stale.
    let anchors = anchorsOf(raw), anchorScope = "line";
    if (!anchors.length) {
      const para = [];
      for (let j = i; j >= 0 && lines[j].trim() !== ""; j--) para.push(lines[j]);
      for (let j = i + 1; j < lines.length && lines[j].trim() !== ""; j++) para.push(lines[j]);
      anchors = [...new Set(para.flatMap(anchorsOf))];
      if (anchors.length) anchorScope = "paragraph";
    }
    for (const c of cites) {
      const target = resolvePath(c.cited);
      const base = { line: n, form: c.form, list: c.list, cited: c.cited, target, anchors, anchorScope };
      if (!target) { rows.push({ ...base, verdict: "NOFILE", detail: "cited path is not tracked" }); continue; }
      const tl = read(target);
      const homes = () => Object.fromEntries(anchors.map((a) => [a, homesOf(a).slice(0, 4)]).filter(([, h]) => h.length));
      const end = Math.min(c.end ?? c.n, tl.length);
      const cited = [];
      for (let k = c.n; k <= end; k++) cited.push(k);
      if (c.n > tl.length) { rows.push({ ...base, verdict: "STALE-PAST-EOF", detail: `${target} is ${tl.length} lines`, homes: homes() }); continue; }
      if (!anchors.length) { rows.push({ ...base, verdict: "UNDECIDABLE", detail: `${target}:${c.n} reads: ${tl[c.n - 1].trim() || "(blank)"}` }); continue; }
      const inRange = cited.find((k) => anchors.some((a) => hasToken(tl[k - 1], a)));
      if (inRange) {
        rows.push({ ...base, verdict: "OK", detail: `matched \`${anchors.find((a) => hasToken(tl[inRange - 1], a)).replace(LIT, "")}\` at ${target}:${inRange}` }); continue;
      }
      const w = WINDOW(target), near = [];
      for (let d = -w; d <= w + (end - c.n); d++) {
        const j = c.n - 1 + d;
        if (cited.includes(j + 1) || j < 0 || j >= tl.length) continue;
        const h = anchors.find((a) => hasToken(tl[j], a));
        if (h) near.push(`${target}:${j + 1} has \`${h.replace(LIT, "")}\` (${d > 0 ? "+" : ""}${d})`);
      }
      rows.push({ ...base, verdict: near.length ? "NEAR" : "STALE-WRONG-LINE",
        detail: near.length ? near.slice(0, 3).join("; ") : `${target}:${c.n} reads: ${tl[c.n - 1].trim() || "(blank)"}`,
        homes: near.length ? undefined : homes() });
    }
  }
  report.docs[doc] = { lines: lines.length, citations: rows, enumerations: enums };
}
return report;
}

const lineSet = (rows, pred) => new Set(rows.filter(pred).map((c) => c.line));
const STALE = (c) => c.verdict.startsWith("STALE");
// doc path -> sorted STALE doc-line numbers; the gate predicate is "every array empty".
export function staleLines(report) {
  return Object.fromEntries(Object.entries(report.docs).map(([doc, r]) => [doc, [...lineSet(r.citations, STALE)].sort((a, b) => a - b)]));
}

// ---------- --selftest: the parser on literal strings ----------
export function selftest() {
  const cases = [
    ["`app.js:836/837`", "src/ui/app.js", [["app.js", 836, 836], ["app.js", 837, 837]]],
    ["count + \"preset\"/\"ago\" (`app.js:726/727/836/837`)", "src/ui/app.js", [["app.js", 726, 726], ["app.js", 727, 727], ["app.js", 836, 836], ["app.js", 837, 837]]],
    ["see :836/837 for the tags", "src/ui/app.js", [["src/ui/app.js", 836, 836], ["src/ui/app.js", 837, 837]]],
    ["`:1656-1660` is the handler", "src/ui/app.js", [["src/ui/app.js", 1656, 1660]]],
    ["`styles.css:114`", "src/ui/app.js", [["styles.css", 114, 114]]],
    ["`styles.css:291-302` and `app.js:726`", "src/ui/app.js", [["styles.css", 291, 302], ["app.js", 726, 726]]],
    ["no citation here, 12:30 is a clock", "src/ui/app.js", []],
  ];
  let failed = 0;
  for (const [line, implied, want] of cases) {
    const got = parseCitations(line, implied).map((c) => [c.cited, c.n, c.end]);
    const ok = JSON.stringify(got) === JSON.stringify(want);
    if (!ok) failed++;
    console.log(`  ${ok ? "✓" : "✗"} parseCitations(${JSON.stringify(line)}) -> ${JSON.stringify(got)}${ok ? "" : ` (want ${JSON.stringify(want)})`}`);
  }
  return failed;
}

function main() {
if (process.argv.includes("--selftest")) {
  const failed = selftest();
  console.log(failed ? `✗ selftest: ${failed} case(s) failed` : "✓ selftest: parseCitations cases pass");
  process.exit(failed ? 1 : 0);
}
let report;
try { report = runAudit(); }
catch (e) { console.error(`✗ audit-citations: ${e.message}`); process.exit(1); }
const VALUES = report.canvasViewValues;

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else if (process.argv.includes("--md")) {
  console.log(`Generated by \`node audit-citations.mjs --md\` at \`${report.head}\`. canvasView value set, derived from \`src/\`: \`[${VALUES.join(", ")}]\`\n`);
  for (const [doc, r] of Object.entries(report.docs)) {
    const st = lineSet(r.citations, STALE), un = lineSet(r.citations, (c) => c.verdict === "UNDECIDABLE");
    const ne = lineSet(r.citations, (c) => c.verdict === "NEAR"), ok = lineSet(r.citations, (c) => c.verdict === "OK");
    const all = new Set(r.citations.map((c) => c.line));
    console.log(`### \`${doc}\` -- ${r.citations.length} citations on ${all.size} of ${r.lines} lines`);
    console.log(`STALE ${st.size} · NEAR ${ne.size} · UNDECIDABLE ${un.size} · OK ${ok.size} lines\n`);
    console.log("| Doc line | Citation | Verdict | Mechanically-derived actual home / cited line's real content |");
    console.log("|---|---|---|---|");
    for (const c of r.citations) {
      const h = c.homes && Object.keys(c.homes).length
        ? Object.entries(c.homes).slice(0, 3).map(([a, v]) => `\`${a.replace(LIT, "")}\` -> ${v.slice(0, 2).join(", ")}`).join("; ")
        : c.detail;
      const scope = c.anchorScope === "paragraph" ? " _(anchors from the enclosing paragraph)_" : "";
      console.log(`| \`:${c.line}\` | \`${c.form}\` | ${c.verdict} | ${String(h).replace(/\|/g, "\\|")}${scope} |`);
    }
    console.log(`\n**canvasView enumerations in this file: ${r.enumerations.length}**\n`);
    for (const e of r.enumerations) console.log(`- \`:${e.line}\` names [${e.named.join(", ")}], no \`radix\`: ${e.text.replace(/\|/g, "\\|").slice(0, 160)}`);
    console.log();
  }
} else {
  console.log(`HEAD ${report.head} · canvasView value set derived from src/: [${VALUES.join(", ")}]\n`);
  for (const [doc, r] of Object.entries(report.docs)) {
    const st = lineSet(r.citations, STALE), un = lineSet(r.citations, (c) => c.verdict === "UNDECIDABLE");
    const ne = lineSet(r.citations, (c) => c.verdict === "NEAR"), ok = lineSet(r.citations, (c) => c.verdict === "OK");
    const nf = lineSet(r.citations, (c) => c.verdict === "NOFILE");
    const all = new Set(r.citations.map((c) => c.line));
    console.log(`=== ${doc} (${r.lines} lines)`);
    console.log(`    ${r.citations.length} citations on ${all.size} lines`);
    console.log(`    STALE ${st.size} | NEAR ${ne.size} | UNDECIDABLE ${un.size} | OK ${ok.size} | NOFILE ${nf.size}  (line counts, deduped)`);
    console.log(`    STALE lines: ${[...st].join(",")}`);
    if (ne.size) console.log(`    NEAR lines: ${[...ne].join(",")}`);
    if (un.size) console.log(`    UNDECIDABLE lines: ${[...un].join(",")}`);
    if (ok.size) console.log(`    OK lines: ${[...ok].join(",")}`);
    for (const c of r.citations) {
      console.log(`  ${c.verdict.padEnd(16)} ${doc}:${c.line} cites ${c.form} -> ${c.detail}`);
      if (c.homes) for (const [a, h] of Object.entries(c.homes)) console.log(`                   \`${a.replace(LIT, "")}\` -> ${h.slice(0, 4).join(" , ")}`);
    }
    console.log(`  canvasView enumerations: ${r.enumerations.length}`);
    for (const e of r.enumerations) console.log(`    ${doc}:${e.line} names [${e.named}] : ${e.text.slice(0, 120)}`);
    console.log();
  }
}

const stale = Object.values(staleLines(report)).reduce((n, v) => n + v.length, 0);
if (stale && !process.argv.includes("--json")) console.log(`✗ ${stale} STALE citation line(s); exit 1`);
process.exit(stale ? 1 : 0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
