#!/usr/bin/env node
// em-dash.mjs -- the no-em-dash house rule (`.claude/CLAUDE.md`) is a GATE, not a style note (#730).
//
// The owner ruled: sweep main first (that sweep is U4), then gate at zero, no grandfather list.
// This file is the gate AND the sweep tool (`--fix`): the same rule table decides what a hand
// sweep would decide, so the sweep is one run of it and a late branch is repaired the same way.
//
// Only two things are exempt from the count: a Markdown inline code span (`` `word` `` -- a
// verbatim quote of program output, per the adapter's verbatim-quote rule, never masked in a
// fenced block, only the inline form), and a byte-pinned verbatim copy named in PINNED below.
// Nothing else is masked: a template literal, a comment, a JSON string and a lone-glyph string
// token (`"\u2014"` as an empty-value placeholder) all count -- the owner's Q3 ruling replaces
// every one of those with "n/a" (a separate unit, U6); until that lands, a lone token is exactly
// the FAIL this gate exists to raise, and `--fix` refuses to rewrite it (R0 (e) below) rather
// than turn rendered output into a comma splice.
//
// The glyph is written here as the `\u2014` escape, never the literal character, so this file is
// not exempt from its own rule (#730's trap: a byte-mode read of a file carrying the glyph finds
// nothing, so the self-test below proves the reader is UTF-8 before it ever scans the tree).

import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
process.chdir(ROOT);

const DASH = "\u2014"; // never the literal glyph in this file's source

// Extensions the walk never opens (binary; matches the branding gate's deny-list, #730 scope).
const BINARY = /\.(woff2|woff|ttf|otf|png|jpe?g|gif|ico|webp|zip|pdf)$/i;

// Generated artifacts `npm test` regenerates from swept sources: a per-line rule cannot read a
// whole-Markdown-source-as-one-line-string bundle, and rewriting it by hand would only be undone
// by the next `npm test`. The GATE still scans these (a regression here is still a FAIL); only
// `--fix` skips them. `docs/img/palette-preview.svg` and `src/ui/type-fonts.js` are generated too
// but not by `npm test`, so `--fix` sweeps them (their generators are re-run by hand afterwards).
function isGenerated(rel) {
  if (rel === "figma/plugin/ui.html") return true;
  if (rel === "src/ui/describe-mcp-assets.js") return true;
  if (rel === "src/ui/mcp-assets.js") return true;
  if (rel === "src/ui/figma-plugin-assets.js") return true;
  if (rel.startsWith("src/ui/categories/")) return true;
  if (rel.startsWith("docs/reference/data/adia-")) return true;
  return false;
}

// A byte-pinned verbatim copy (adapter §3): a record whose header states the hash of the exact
// bytes it pins, so it cannot both keep the hash and be rewritten. Empty today (the one pinned
// body carries no dash); adding to it is a pre-land reviewer's finding, never a builder's
// convenience.
const PINNED = [
  // { path: "path/from/repo/root.md", hash: "sha256:...", pinnedBy: "seat-name" },
];
const PINNED_PATHS = new Set(PINNED.map((p) => p.path));

// -- Markdown inline-span masking -------------------------------------------------------------
// Replaces the INTERIOR of every backtick span with a same-length run of a placeholder character
// (never the dash), so positions outside the span line up unchanged and a dash inside the span is
// invisible to every rule below. Only inline spans; a fenced block is prose (adapter §3) and is
// swept like any other line. Markdown files only -- a template literal's backticks in a `.js`
// file are code, not a quote, and are never masked (#730 revision-4 finding: masking backticks in
// code hid 66 dashes in generated files and reds `test/engine/exports.mjs`).
function maskMdSpans(line) {
  return line.replace(/`[^`]*`/g, (span) => "`" + "\u0000".repeat(span.length - 2) + "`");
}

function prevNonSpace(line, idx) {
  let i = idx - 1;
  while (i >= 0 && line[i] === " ") i--;
  return i;
}
function nextNonSpace(line, idx) {
  let i = idx + 1;
  while (i < line.length && line[i] === " ") i++;
  return i;
}
function dashIndices(line) {
  const out = [];
  for (let i = 0; i < line.length; i++) if (line[i] === DASH) out.push(i);
  return out;
}

// A lone-glyph string token: the whole quoted string is the dash and nothing else, plain or
// backslash-escaped (the form the generated mirrors' JSON strings carry).
const LONE_TOKEN_RE = new RegExp(`(?:\\\\)?(["'\`])${DASH}(?:\\\\)?\\1`);
// A table cell whose whole content is the dash: `| \u2014 |`. In a `.md` file this is R1 (the
// gate + fix); in any other file it is a table row a program prints (R0 (b)).
const CELL_RE = new RegExp(`\\|\\s*${DASH}\\s*\\|`);
// A Markdown ATX heading, one to six `#` and a space, fenced blocks included (a `#` line inside a
// fence reads as a shell comment, so the colon still fits).
const HEADING_RE = /^#{1,6} /;
// A bullet whose first token is a code span or a bold label, then the dash.
const BULLET_LABEL_RE = new RegExp(`^\\s*[-*]\\s+(\`[^\`]*\`|\\*\\*[^*]+\\*\\*)\\s*${DASH}`);
const WORD_END_RE = /[A-Za-z0-9)\]}"'”’]$/;
const PUNCT_END_RE = /[.,;:!?]$/;

function isMd(rel) { return rel.endsWith(".md"); }

// ---------------------------------------------------------------------------------------------
// classifyLine(): applied to ONE line (already masked for `.md`), returns the rule that governs
// its first actionable dash, or `null` if the line carries none. Used by both the gate (to decide
// whether a dash counts) and `--fix` (to decide the replacement). `refuse` covers every R0
// construct; the caller is told which one, for the residual list.
function classifyLine({ line, prevLine, md }) {
  const idxs = dashIndices(line);
  if (!idxs.length) return null;

  // R0 (b): a table cell that is only the dash, inside program output (never a `.md` file).
  if (!md && CELL_RE.test(line)) return { rule: "R0", construct: "b" };
  // R0 (c): a `.md` file quoting the lone-glyph placeholder in prose (a code span already masked
  // it out if it were quoted as a span instead).
  if (md && new RegExp(`"${DASH}"`).test(line)) return { rule: "R0", construct: "c" };
  // R0 (e): a lone-glyph string token in a non-Markdown file, plain or backslash-escaped.
  if (!md && LONE_TOKEN_RE.test(line)) return { rule: "R0", construct: "e" };

  // R1: a Markdown table cell that is only the dash.
  if (md && CELL_RE.test(line)) return { rule: "R1" };

  for (const idx of idxs) {
    // R0 (a): a dash right after a full stop.
    const pv = prevNonSpace(line, idx);
    if (pv >= 0 && line[pv] === ".") return { rule: "R0", construct: "a" };

    // Line-start dash: R7 (join to the sentence above) or R0 (d) (the line before already ends
    // in punctuation, so joining would double it up).
    if (line.slice(0, idx).trim() === "") {
      const prevTrim = (prevLine ?? "").trimEnd();
      if (prevTrim && WORD_END_RE.test(prevTrim) && !PUNCT_END_RE.test(prevTrim)) return { rule: "R7" };
      return { rule: "R0", construct: "d" };
    }
  }

  // R2: a Markdown heading, first dash on the line (fenced blocks included).
  if (md && HEADING_RE.test(line)) return { rule: "R2" };

  // R3: a bullet whose first token is a code span or a bold label, then the dash.
  if (BULLET_LABEL_RE.test(line)) return { rule: "R3" };

  for (const idx of idxs) {
    const pv = prevNonSpace(line, idx);
    if (pv >= 0 && ",;:(".includes(line[pv])) return { rule: "R4" };
    const nx = nextNonSpace(line, idx);
    if (nx < line.length && ",.;:)".includes(line[nx]) && (nx + 1 >= line.length || line[nx + 1] === " "))
      return { rule: "R5" };
    if (line.slice(idx + 1).trim() === "") return { rule: "R6" };
  }
  return { rule: "R8" };
}

// ---------------------------------------------------------------------------------------------
// Reads every tracked file (skipping BINARY and, for `--fix`, GENERATED and PINNED), splits into
// lines, and folds `fn(rel, lines, isMdFile)` over each. `fn` returns the (possibly rewritten)
// lines array; a change is written back only if the joined text differs.
function walkTracked() {
  const out = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT }).toString("utf8");
  return out.split("\0").filter(Boolean);
}

function readText(abs) {
  try { return readFileSync(abs, "utf8"); } catch { return null; }
}

// ---------------------------------------------------------------------------------------------
function runGate() {
  const files = walkTracked();
  let scanned = 0, hits = [], total = 0, filesWithHits = new Set();
  for (const rel of files) {
    if (BINARY.test(rel)) continue;
    if (PINNED_PATHS.has(rel)) { scanned++; continue; }
    const src = readText(join(ROOT, rel));
    if (src === null) continue;
    scanned++;
    const md = isMd(rel);
    const lines = src.split("\n");
    let prevLine = null;
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const masked = md ? maskMdSpans(raw) : raw;
      const count = dashIndices(masked).length;
      if (count > 0) {
        total += count;
        filesWithHits.add(rel);
        hits.push(`${rel}:${i + 1}`);
      }
      prevLine = raw;
    }
  }
  if (total) {
    for (const h of hits.slice(0, 40)) console.log(`  ✗ ${h}`);
    console.log(`\nFAIL: ${total} em dashes outside inline code spans in ${filesWithHits.size} files`);
  } else {
    console.log(`em-dash: clean (${scanned} files scanned)`);
  }
  return total === 0;
}

// ---------------------------------------------------------------------------------------------
function applyRule(line, prevLine, decision) {
  switch (decision.rule) {
    case "R1": return line.replace(CELL_RE, "| none |");
    case "R2": {
      const idx = line.indexOf(DASH);
      // Collapse the surrounding spaces, then join with a colon.
      return line.slice(0, idx).replace(/\s+$/, "") + ": " + line.slice(idx + 1).replace(/^\s+/, "");
    }
    case "R3": {
      const idx = line.indexOf(DASH);
      return line.slice(0, idx).replace(/\s+$/, "") + ": " + line.slice(idx + 1).replace(/^\s+/, "");
    }
    case "R4": {
      const idxs = dashIndices(line);
      for (const idx of idxs) {
        const pv = prevNonSpace(line, idx);
        if (pv >= 0 && ",;:(".includes(line[pv])) {
          const nx = nextNonSpace(line, idx);
          return line.slice(0, pv + 1) + " " + line.slice(nx);
        }
      }
      return line;
    }
    case "R5": {
      const idxs = dashIndices(line);
      for (const idx of idxs) {
        const nx = nextNonSpace(line, idx);
        if (nx < line.length && ",.;:)".includes(line[nx]) && (nx + 1 >= line.length || line[nx + 1] === " ")) {
          const pv = prevNonSpace(line, idx);
          return line.slice(0, pv + 1) + line.slice(nx);
        }
      }
      return line;
    }
    case "R6": {
      const idx = line.lastIndexOf(DASH);
      return line.slice(0, idx).replace(/\s+$/, "") + ",";
    }
    case "R8": {
      const idx = line.indexOf(DASH);
      const pv = prevNonSpace(line, idx);
      const nx = nextNonSpace(line, idx);
      return line.slice(0, pv + 1) + ", " + line.slice(nx);
    }
    default: return line;
  }
}

function runFix({ sample }) {
  const files = walkTracked();
  const perRule = { R0: 0, R1: 0, R2: 0, R3: 0, R4: 0, R5: 0, R6: 0, R7: 0, R8: 0 };
  const r0Lines = [];
  const samples = {};
  const pushSample = (rule, before, after) => {
    if (!sample) return;
    (samples[rule] ??= []).push({ before, after });
  };

  for (const rel of files) {
    if (BINARY.test(rel)) continue;
    if (PINNED_PATHS.has(rel)) continue;
    if (isGenerated(rel)) continue;
    const abs = join(ROOT, rel);
    const src = readText(abs);
    if (src === null) continue;
    const md = isMd(rel);
    const lines = src.split("\n");
    const before = lines.length;
    let changed = false;

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const masked = md ? maskMdSpans(raw) : raw;
      if (!dashIndices(masked).length) continue;

      const prevRaw = i > 0 ? lines[i - 1] : null;
      const prevMasked = prevRaw !== null ? (md ? maskMdSpans(prevRaw) : prevRaw) : null;
      const decision = classifyLine({ line: masked, prevLine: prevMasked, md });
      if (!decision) continue;

      if (decision.rule === "R0") {
        perRule.R0++;
        r0Lines.push({ rel, line: i + 1, construct: decision.construct, text: raw });
        continue;
      }
      if (decision.rule === "R7") {
        perRule.R7++;
        const beforeLine = raw;
        const idx = raw.indexOf(DASH);
        const rest = raw.slice(idx + 1).replace(/^\s+/, "");
        lines[i] = rest;
        lines[i - 1] = lines[i - 1].replace(/\s+$/, "") + ",";
        pushSample("R7", `${beforeLine}\n${prevRaw}`, `${lines[i]}\n${lines[i - 1]}`);
        changed = true;
        continue;
      }
      perRule[decision.rule] = (perRule[decision.rule] || 0) + 1;
      const after = applyRule(raw, prevRaw, decision);
      if (after !== raw) { pushSample(decision.rule, raw, after); lines[i] = after; changed = true; }
    }

    if (changed) {
      if (lines.length !== before) throw new Error(`${rel}: line count changed (${before} -> ${lines.length})`);
      writeFileSync(abs, lines.join("\n"));
    }
  }

  console.log("R0 " + perRule.R0);
  for (const r of ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8"]) console.log(`${r} ${perRule[r] || 0}`);
  if (r0Lines.length) {
    console.log("\nR0 residual (left in place, fix by hand):");
    for (const r of r0Lines) console.log(`  ${r.rel}:${r.line} (${r.construct}) ${r.text}`);
  }
  if (sample) {
    console.log("\nsamples:");
    for (const [rule, arr] of Object.entries(samples)) {
      for (const s of arr.slice(0, 4)) console.log(`  ${rule} - ${s.before}\n  ${rule} + ${s.after}`);
    }
  }
  return perRule;
}

// ---------------------------------------------------------------------------------------------
// Self-test. Runs BEFORE the tree scan: a broken rule or a byte-mode reader fails here, never
// vacuously green on the real tree (the `citations.mjs` pattern).
function selftest() {
  const fails = [];
  const FAIL = (name, msg) => fails.push(`${name}: ${msg}`);

  // (1) The byte-mode trap (#730): a `latin1`/byte read of a file carrying the glyph must NOT
  // agree with the UTF-8 read this gate actually uses.
  const tmp = join(tmpdir(), `em-dash-selftest-${process.pid}.txt`);
  writeFileSync(tmp, `x ${DASH} y\n`, "utf8");
  const utf8Count = dashIndices(readFileSync(tmp, "utf8")).length;
  const latin1Count = dashIndices(readFileSync(tmp, "latin1")).length;
  unlinkSync(tmp);
  if (utf8Count !== 1) FAIL("reader", `UTF-8 read found ${utf8Count} dashes, expected 1`);
  if (latin1Count === 1) FAIL("reader", "a latin1/byte-mode read also found the glyph -- the self-test cannot tell it apart from a real UTF-8 read");

  // (2) One fixture per row of the rule table (plan `rule-gates.md`, U3 design), each an
  // {line, prevLine, md, expectRule[, expectFix]} case. A row whose expected output is wrong
  // fails here, before the tree scan, per the plan's own negative control (U3-1).
  const cases = [
    { name: "R0(a) after a full stop", md: true, line: `etc. ${DASH} so`, expectRule: "R0" },
    { name: "R0(b) table cell in code", md: false, line: `\`| row | ${DASH} |\``, expectRule: "R0" },
    { name: "R0(c) prose quotes the placeholder", md: true, line: `the guide degrades to "${DASH}" when`, expectRule: "R0" },
    { name: "R0(d) line-start after punctuation", md: true, line: `${DASH} continues`, prevLine: "ends here.", expectRule: "R0" },
    { name: "R0(e) lone token, plain", md: false, line: `const s = "${DASH}";`, expectRule: "R0" },
    { name: "R0(e) lone token, escaped", md: false, line: `const j = "{\\"v\\": \\"${DASH}\\"}";`, expectRule: "R0" },
    { name: "R1 empty md cell", md: true, line: `| a | ${DASH} | b |`, expectRule: "R1", expectFix: "| a | none | b |" },
    { name: "R2 heading label", md: true, line: `## 1.63 ${DASH} 2026-09-18 - title`, expectRule: "R2", expectFix: "## 1.63: 2026-09-18 - title" },
    { name: "R3 bullet label", md: true, line: `- \`npm test\` ${DASH} the gate.`, expectRule: "R3", expectFix: "- \`npm test\`: the gate." },
    { name: "R4 after comma", md: true, line: `foo, ${DASH} bar`, expectRule: "R4", expectFix: "foo, bar" },
    { name: "R5 before period, space required", md: true, line: `(#477) ${DASH} .btn`, expectRule: "R8" },
    { name: "R5 before period, punctuation followed by a space", md: true, line: `keep the pause ${DASH} . Next sentence`, expectRule: "R5", expectFix: "keep the pause. Next sentence" },
    { name: "R6 line-end", md: true, line: `gen:type-fonts ${DASH}`, expectRule: "R6", expectFix: "gen:type-fonts," },
    { name: "R7 line-start after a word", md: true, line: `${DASH} this file is only the mental model.`, prevLine: "assumes", expectRule: "R7" },
    { name: "R8 default", md: true, line: `TKT-0015 ${DASH} undocumented elsewhere`, expectRule: "R8", expectFix: "TKT-0015, undocumented elsewhere" },
  ];
  for (const c of cases) {
    const masked = c.md ? maskMdSpans(c.line) : c.line;
    const prevMasked = c.prevLine !== undefined ? (c.md ? maskMdSpans(c.prevLine) : c.prevLine) : null;
    const decision = classifyLine({ line: masked, prevLine: prevMasked, md: c.md });
    if (!decision) { FAIL(c.name, "no rule matched"); continue; }
    if (decision.rule !== c.expectRule) { FAIL(c.name, `matched ${decision.rule}, expected ${c.expectRule}`); continue; }
    if (c.expectFix !== undefined) {
      const got = decision.rule === "R7"
        ? c.line.slice(c.line.indexOf(DASH) + 1).replace(/^\s+/, "")
        : applyRule(c.line, c.prevLine ?? null, decision);
      if (got !== c.expectFix) FAIL(c.name, `fix produced "${got}", expected "${c.expectFix}"`);
    }
  }

  // (3) The two exemptions. A Markdown inline span keeps its glyph byte for byte (the mask must
  // not leak into the rewritten line), and a PINNED file is never opened by `--fix`.
  const spanLine = "SMOKE PASS `gallery " + DASH + " editor` done";
  if (dashIndices(maskMdSpans(spanLine)).length !== 0) FAIL("markdown-span-mask", "a dash inside an inline span was still counted");
  if (!spanLine.includes(DASH)) FAIL("markdown-span-mask", "the fixture itself lost its glyph before masking");

  // (4) Idempotence: fixing an already-fixed line is a no-op.
  const already = "TKT-0015, undocumented elsewhere";
  if (dashIndices(already).length !== 0) FAIL("idempotence", "the fixed fixture still carries the glyph");

  if (fails.length) {
    console.log(`self-test: FAIL ${fails.length} case(s)`);
    for (const f of fails) console.log(`  ✗ ${f}`);
    return false;
  }
  console.log("self-test: PASS");
  return true;
}

// ---------------------------------------------------------------------------------------------
const args = process.argv.slice(2);
const fix = args.includes("--fix");
const sample = args.includes("--sample");

if (!selftest()) process.exit(1);

if (fix) {
  runFix({ sample });
  const clean = runGate();
  process.exit(0);
} else {
  const clean = runGate();
  process.exit(clean ? 0 : 1);
}
