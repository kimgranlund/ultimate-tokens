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

// The three reasons `--fix` never opens a file, in one seam so the self-test can exercise the
// PINNED exemption directly (#730 review finding 5) without needing a real file on disk for it.
function shouldSkipFix(rel) {
  return BINARY.test(rel) || PINNED_PATHS.has(rel) || isGenerated(rel);
}

// -- Markdown inline-span masking -------------------------------------------------------------
// Replaces the INTERIOR of every backtick span with a same-length run of a placeholder character
// (never the dash), so positions outside the span line up unchanged and a dash inside the span is
// invisible to every rule below. Only inline spans; a fenced block is prose (adapter §3) and is
// swept like any other line. Markdown files only -- a template literal's backticks in a `.js`
// file are code, not a quote, and are never masked (#730 revision-4 finding: masking backticks in
// code hid 66 dashes in generated files and reds `test/engine/exports.mjs`).
//
// A span can wrap across a line break (CommonMark: the backtick run that closes it need not be on
// the line that opened it), which leaves a lone backtick sitting at the start of the CONTINUING
// line. A single-line-only mask pairs that stray backtick with the next one it finds instead, and
// mis-masks the real span (found in the wild during pass 2 review: `docs/tickets/tkt-0031.md:82`,
// a wrapped span from a prior line left a lone backtick, which paired with the wrong neighbour and
// let the dash inside `` `TKT-XXXX -- ...` `` get rewritten). So masking carries an open/closed
// flag ONE line ahead: `computeOpenAtStart()` walks every line once up front (backtick COUNT only,
// never touched by any fix rule, so this is safe to compute before any edit and reuse throughout).
//
// It is capped at one line on purpose. A long line with many spans on it (a table row mixing
// prose, code and shell snippets) can carry a genuinely unbalanced backtick from an authoring slip
// with nothing to do with a real wrap; found in the wild in the SAME pass-2 review pass, two lines
// apart from the fixture above: `.sdlc/plans/rule-gates.md:163` has an odd count from exactly this,
// and trusting it indefinitely carried "open" through 73 unrelated lines and hid a real,
// unrelated dash at line 236 from the gate entirely. Every genuine wrap seen closes on the very
// next line, so "still open after one full extra line" is treated as that same kind of false
// signal and dropped, not propagated further.
function computeOpenAtStart(lines) {
  const openAtStart = new Array(lines.length);
  let open = false;
  let openStreak = 0;
  for (let i = 0; i < lines.length; i++) {
    openAtStart[i] = open;
    const backticks = (lines[i].match(/`/g) || []).length;
    if (backticks % 2 === 1) open = !open;
    openStreak = open ? openStreak + 1 : 0;
    if (openStreak > 1) { open = false; openStreak = 0; }
  }
  return openAtStart;
}
function maskMdSpansStateful(line, openAtStart) {
  const chars = line.split("");
  let open = openAtStart;
  let spanStart = open ? 0 : null;
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== "`") continue;
    if (!open) { open = true; spanStart = i + 1; }
    else { for (let k = spanStart; k < i; k++) chars[k] = "\u0000"; open = false; spanStart = null; }
  }
  if (open) for (let k = spanStart; k < chars.length; k++) chars[k] = "\u0000";
  return { masked: chars.join(""), openAtEnd: open };
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
// The R1 FIX form: global, and a lookahead on the closing `|` so it is never consumed, which is
// what lets two empty cells on the same row (sharing one `|` between them) both match (#730
// review finding 2: consuming the closing pipe left the next cell's opening pipe missing, and R8
// then wrote a table-breaking `|, |` into it).
const CELL_FIX_RE = new RegExp(`\\|(\\s*)${DASH}(\\s*)(?=\\|)`, "g");
// A Markdown ATX heading, one to six `#` and a space, fenced blocks included (a `#` line inside a
// fence reads as a shell comment, so the colon still fits).
const HEADING_RE = /^#{1,6} /;
// A bullet whose first token is a code span or a bold label, then the dash.
// A "bullet" here is either an unordered marker (`-`/`*`) or a numbered-list marker (`1.`).
const BULLET_LABEL_RE = new RegExp(`^\\s*(?:[-*]|\\d+\\.)\\s+(\`[^\`]*\`|\\*\\*[^*]+\\*\\*)\\s*${DASH}`);
const WORD_END_RE = /[A-Za-z0-9)\]}"'`”’]$/;
const PUNCT_END_RE = /[.,;:!?]$/;

function isMd(rel) { return rel.endsWith(".md"); }

// ---------------------------------------------------------------------------------------------
// classifyLine(): applied to ONE line (already masked for `.md`), returns the rule that governs
// its first actionable dash, or `null` if the line carries none. Used by both the gate (to decide
// whether a dash counts) and `--fix` (to decide the replacement). `refuse` covers every R0
// construct; the caller is told which one, for the residual list.
function classifyLine({ line, prevLine, md, skipStructural = false }) {
  const idxs = dashIndices(line);
  if (!idxs.length) return null;

  // R0 (b): a table cell that is only the dash, inside program output (never a `.md` file).
  if (!md && CELL_RE.test(line)) return { rule: "R0", construct: "b" };
  // R0 (c): a `.md` file quoting the lone-glyph placeholder in prose (a code span already masked
  // it out if it were quoted as a span instead).
  if (md && new RegExp(`"${DASH}"`).test(line)) return { rule: "R0", construct: "c" };
  // R0 (e): a lone-glyph string token in a non-Markdown file, plain or backslash-escaped.
  if (!md && LONE_TOKEN_RE.test(line)) return { rule: "R0", construct: "e" };

  // R1: a Markdown table cell that is only the dash. A SHAPE rule: fires once per line.
  if (!skipStructural && md && CELL_RE.test(line)) return { rule: "R1" };

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

  // R2: a Markdown heading, first dash on the line (fenced blocks included). A SHAPE rule: fires
  // once per line, per the rule table ("a second dash on the same heading falls to R8").
  if (!skipStructural && md && HEADING_RE.test(line)) return { rule: "R2" };

  // R3: a bullet whose first token is a code span or a bold label, then the dash. Also once.
  if (!skipStructural && BULLET_LABEL_RE.test(line)) return { rule: "R3" };

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
    const openAtStart = md ? computeOpenAtStart(lines) : null;
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const masked = md ? maskMdSpansStateful(raw, openAtStart[i]).masked : raw;
      const count = dashIndices(masked).length;
      if (count > 0) {
        total += count;
        filesWithHits.add(rel);
        hits.push(`${rel}:${i + 1}`);
      }
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
// Every index below is found on `masked` (so a dash inside a Markdown inline span is invisible to
// every search, including R1's own cell scan) and then applied to `raw` at that SAME index (the
// mask keeps every position outside a span byte-aligned with the raw line, since only a span's
// interior characters are ever swapped for a same-length placeholder). Slicing `raw` at a masked
// index is therefore always the real text, never the placeholder (#730 review finding 1: applying
// `line.indexOf(DASH)` etc. straight to the raw line let a span's dash be hit first, and get
// rewritten, whenever it sat before the outside dash that actually triggered the rule).
function applyRule(raw, masked, prevRaw, prevMasked, decision) {
  switch (decision.rule) {
    case "R1": {
      // Every empty cell on the row, not just the first (finding 2): CELL_FIX_RE never consumes
      // the closing `|`, so two cells sharing one pipe both match.
      let result = "", last = 0, any = false;
      for (const m of masked.matchAll(CELL_FIX_RE)) {
        any = true;
        result += raw.slice(last, m.index) + "| none ";
        last = m.index + m[0].length;
      }
      return any ? result + raw.slice(last) : raw;
    }
    case "R2":
    case "R3": {
      const idx = masked.indexOf(DASH);
      const head = raw.slice(0, idx).replace(/\s+$/, "");
      const rest = raw.slice(idx + 1).replace(/^\s+/, "");
      // No trailing ": " when the dash was the last thing on the line (finding 6).
      return rest === "" ? head + ":" : head + ": " + rest;
    }
    case "R4": {
      const idxs = dashIndices(masked);
      for (const idx of idxs) {
        const pv = prevNonSpace(masked, idx);
        if (pv >= 0 && ",;:(".includes(masked[pv])) {
          const nx = nextNonSpace(masked, idx);
          return raw.slice(0, pv + 1) + " " + raw.slice(nx);
        }
      }
      return raw;
    }
    case "R5": {
      const idxs = dashIndices(masked);
      for (const idx of idxs) {
        const nx = nextNonSpace(masked, idx);
        if (nx < masked.length && ",.;:)".includes(masked[nx]) && (nx + 1 >= masked.length || masked[nx + 1] === " ")) {
          const pv = prevNonSpace(masked, idx);
          return raw.slice(0, pv + 1) + raw.slice(nx);
        }
      }
      return raw;
    }
    case "R6": {
      const idx = masked.lastIndexOf(DASH);
      return raw.slice(0, idx).replace(/\s+$/, "") + ",";
    }
    case "R8": {
      const idx = masked.indexOf(DASH);
      const pv = prevNonSpace(masked, idx);
      const nx = nextNonSpace(masked, idx);
      return raw.slice(0, pv + 1) + ", " + raw.slice(nx);
    }
    default: return raw;
  }
}

// ---------------------------------------------------------------------------------------------
// The one place that walks a line array and applies the rule table, shared by `runFix()` (a real
// file's lines) and the self-test (a small in-memory fixture, including its own idempotence and
// R7 checks). A line can carry more than one dash (a heading's second dash, a wrapped sentence
// with two parentheticals): loop until the line carries none, re-masking after every edit so
// positions stay correct. R1/R2/R3 are whole-line SHAPE rules (one table's cells, one heading
// label, one bullet label) and fire at most once per line; a later dash on the same line falls
// through to R4-R8, per the rule table ("a second dash on the same heading falls to R8"). R0
// stops the whole line (it is left in place and listed) without touching it.
function fixLines(lines, md) {
  const out = lines.slice();
  // Backtick COUNT per line never changes (no rule below ever adds or removes a backtick), so the
  // open-span state entering every line is computed once, up front, from the untouched originals,
  // and stays valid for every re-mask of that line as its content is edited.
  const openAtStart = md ? computeOpenAtStart(lines) : null;
  const maskOf = (i) => (md ? maskMdSpansStateful(out[i], openAtStart[i]).masked : out[i]);
  const edits = []; // { rule, construct?, lineIndex, text? | before, after }
  for (let i = 0; i < out.length; i++) {
    let structuralDone = false;
    let guard = 0;
    while (guard++ < 200) {
      const raw = out[i];
      const masked = maskOf(i);
      if (!dashIndices(masked).length) break;

      const prevRaw = i > 0 ? out[i - 1] : null;
      const prevMasked = i > 0 ? maskOf(i - 1) : null;
      const decision = classifyLine({ line: masked, prevLine: prevMasked, md, skipStructural: structuralDone });
      if (!decision) break;

      if (decision.rule === "R0") {
        edits.push({ rule: "R0", construct: decision.construct, lineIndex: i, text: raw });
        break;
      }
      if (["R1", "R2", "R3"].includes(decision.rule)) structuralDone = true;
      if (decision.rule === "R7") {
        const idx = masked.indexOf(DASH);
        const beforeLine = raw, beforePrev = prevRaw;
        out[i] = raw.slice(idx + 1).replace(/^\s+/, "");
        out[i - 1] = out[i - 1].replace(/\s+$/, "") + ",";
        edits.push({ rule: "R7", lineIndex: i, before: `${beforeLine}\n${beforePrev}`, after: `${out[i]}\n${out[i - 1]}` });
        continue;
      }
      const after = applyRule(raw, masked, prevRaw, prevMasked, decision);
      if (after === raw) break; // no forward progress; avoid an infinite loop
      edits.push({ rule: decision.rule, lineIndex: i, before: raw, after });
      out[i] = after;
    }
  }
  return { lines: out, edits };
}

function runFix({ sample }) {
  const files = walkTracked();
  // Counted PER LINE, not per dash-edit (#730 review finding 3): a `Set` of `rel:lineIndex` per
  // rule, so a line with two edits of the same rule (rare, but R8 can fire twice on one line)
  // counts once, matching how the plan itself counted the rule table.
  const linesByRule = { R1: new Set(), R2: new Set(), R3: new Set(), R4: new Set(), R5: new Set(), R6: new Set(), R7: new Set(), R8: new Set() };
  const r0ByConstruct = { a: 0, b: 0, c: 0, d: 0, e: 0 };
  const r0Lines = [];
  const samples = { R1: [], R2: [], R3: [], R4: [], R5: [], R6: [], R7: [], R8: [] };

  for (const rel of files) {
    if (shouldSkipFix(rel)) continue;
    const abs = join(ROOT, rel);
    const src = readText(abs);
    if (src === null) continue;
    const md = isMd(rel);
    const lines = src.split("\n");
    const { lines: fixed, edits } = fixLines(lines, md);
    let changed = false;

    for (const e of edits) {
      if (e.rule === "R0") {
        r0ByConstruct[e.construct]++;
        r0Lines.push({ rel, line: e.lineIndex + 1, construct: e.construct, text: e.text });
        continue;
      }
      changed = true;
      linesByRule[e.rule].add(`${rel}:${e.lineIndex}`);
      if (sample) samples[e.rule].push({ rel, line: e.lineIndex + 1, before: e.before, after: e.after });
    }

    if (changed) {
      if (fixed.length !== lines.length) throw new Error(`${rel}: line count changed (${lines.length} -> ${fixed.length})`);
      writeFileSync(abs, fixed.join("\n"));
    }
  }

  const counts = {};
  for (const c of ["a", "b", "c", "d", "e"]) console.log(`R0 ${c} ${r0ByConstruct[c]}`);
  for (const r of ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8"]) {
    counts[r] = linesByRule[r].size;
    console.log(`${r} ${counts[r]}`);
  }
  if (r0Lines.length) {
    console.log("\nresidual (left in place, fix by hand):");
    for (const r of r0Lines) console.log(`  ${r.rel}:${r.line} (${r.construct}) ${r.text}`);
  }
  if (sample) {
    // P3: every rule under 50 hits lists every hit; a bigger rule gets four samples.
    console.log("\nsamples:");
    for (const r of ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8"]) {
      const arr = counts[r] < 50 ? samples[r] : samples[r].slice(0, 4);
      for (const s of arr) console.log(`  ${r} ${s.rel}:${s.line} - ${s.before}\n  ${r} ${s.rel}:${s.line} + ${s.after}`);
    }
  }
  return counts;
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

  // (2) One fixture per row of the rule table (plan `rule-gates.md`, U3 design), each a
  // {line, prevLine, md, expectRule[, expectFix]} case, run through `fixLines()` -- the SAME
  // per-line loop `runFix()` uses on a real file, not a hand-rolled shortcut (#730 review finding
  // 5: the old R7 check bypassed `runFix`'s own R7 code path and could not have caught a bug in
  // it). A row whose expected output is wrong fails here, before the tree scan, per the plan's
  // own negative control (U3-1).
  const cases = [
    { name: "R0(a) after a full stop", md: true, line: `etc. ${DASH} so`, expectRule: "R0" },
    { name: "R0(b) table cell in code", md: false, line: `\`| row | ${DASH} |\``, expectRule: "R0" },
    { name: "R0(c) prose quotes the placeholder", md: true, line: `the guide degrades to "${DASH}" when`, expectRule: "R0" },
    { name: "R0(d) line-start after punctuation", md: true, line: `${DASH} continues`, prevLine: "ends here.", expectRule: "R0" },
    { name: "R0(e) lone token, plain", md: false, line: `const s = "${DASH}";`, expectRule: "R0" },
    { name: "R0(e) lone token, escaped", md: false, line: `const j = "{\\"v\\": \\"${DASH}\\"}";`, expectRule: "R0" },
    { name: "R1 empty md cell", md: true, line: `| a | ${DASH} | b |`, expectRule: "R1", expectFix: "| a | none | b |" },
    { name: "R1 two empty md cells share one row", md: true, line: `| a | ${DASH} | ${DASH} | b |`, expectRule: "R1", expectFix: "| a | none | none | b |" },
    { name: "R2 heading label", md: true, line: `## 1.63 ${DASH} 2026-09-18 - title`, expectRule: "R2", expectFix: "## 1.63: 2026-09-18 - title" },
    { name: "R2 heading label, dash ends the line", md: true, line: `## title ${DASH}`, expectRule: "R2", expectFix: "## title:" },
    { name: "R3 bullet label", md: true, line: `- \`npm test\` ${DASH} the gate.`, expectRule: "R3", expectFix: "- \`npm test\`: the gate." },
    { name: "R4 after comma", md: true, line: `foo, ${DASH} bar`, expectRule: "R4", expectFix: "foo, bar" },
    { name: "R5 before period, space required", md: true, line: `(#477) ${DASH} .btn`, expectRule: "R8" },
    { name: "R5 before period, punctuation followed by a space", md: true, line: `keep the pause ${DASH} . Next sentence`, expectRule: "R5", expectFix: "keep the pause. Next sentence" },
    { name: "R6 line-end", md: true, line: `gen:type-fonts ${DASH}`, expectRule: "R6", expectFix: "gen:type-fonts," },
    { name: "R7 line-start after a word", md: true, line: `${DASH} this file is only the mental model.`, prevLine: "assumes", expectRule: "R7", expectFix: "this file is only the mental model.\nassumes," },
    { name: "R8 default", md: true, line: `TKT-0015 ${DASH} undocumented elsewhere`, expectRule: "R8", expectFix: "TKT-0015, undocumented elsewhere" },
    // Finding 1: a span dash sits BEFORE the outside dash that actually triggers a rule. The old
    // code found `line.indexOf(DASH)` on the raw line and hit the span's dash first.
    { name: "a span dash before the outside dash is never touched", md: true,
      line: `\`gallery ${DASH} editor\` shipped today ${DASH} not someday.`,
      expectRule: "R8", expectFix: `\`gallery ${DASH} editor\` shipped today, not someday.` },
  ];
  for (const c of cases) {
    const arr = c.prevLine !== undefined ? [c.prevLine, c.line] : [c.line];
    const { edits } = fixLines(arr, c.md);
    const edit = edits[0];
    if (!edit) { FAIL(c.name, "no rule matched"); continue; }
    if (edit.rule !== c.expectRule) { FAIL(c.name, `matched ${edit.rule}, expected ${c.expectRule}`); continue; }
    if (c.expectFix !== undefined) {
      const got = edit.rule === "R0" ? edit.text : edit.after;
      if (got !== c.expectFix) FAIL(c.name, `fix produced "${got}", expected "${c.expectFix}"`);
    }
  }

  // (3) The two exemptions. A Markdown inline span keeps its glyph byte for byte end to end
  // through `fixLines()` (checked above, "a span dash before..."), and a PINNED path is never
  // opened by `--fix` (`shouldSkipFix()` is the seam `runFix()`'s walk actually calls).
  const fakePinned = "docs/reference/__selftest-pinned__.md";
  if (shouldSkipFix(fakePinned)) FAIL("pinned-exemption", "an unpinned path was already skipped -- the fixture is not isolated");
  PINNED_PATHS.add(fakePinned);
  if (!shouldSkipFix(fakePinned)) FAIL("pinned-exemption", "adding a path to PINNED did not make shouldSkipFix() skip it");
  PINNED_PATHS.delete(fakePinned);

  // A span that wraps across a line break (found in the wild in pass 2 review, docs/tickets/
  // tkt-0031.md:82): the first line has an ODD backtick count, so its lone backtick opens a span
  // that only closes on the NEXT line. The dash inside that continuation is still inside the span
  // and must survive byte for byte, with zero edits.
  const wrapped = [
    "before `wrapped span starts here",
    `continues ${DASH} and closes\` after the span`,
  ];
  const wrappedFixed = fixLines(wrapped, true);
  if (wrappedFixed.edits.length !== 0) FAIL("wrapped-span-mask", `a dash inside a line-wrapping span was edited: ${JSON.stringify(wrappedFixed.edits[0])}`);
  if (wrappedFixed.lines.join("\n") !== wrapped.join("\n")) FAIL("wrapped-span-mask", "the wrapped-span fixture changed even though no edit was recorded");

  // A stray, genuinely unbalanced backtick (an authoring slip, not a real wrap) must not carry
  // "open" past one line and hide an unrelated dash three lines later (found in the wild in the
  // same pass 2 review pass: .sdlc/plans/rule-gates.md:163 to :236). The middle line here neither
  // closes the phantom span nor opens a new one (an even count), so the cap must have reset by the
  // third line and the dash there must be fixed normally, not swallowed.
  const bogus = [
    "a line with one stray ` backtick, an authoring slip",
    "an ordinary line with no backticks at all",
    `an unrelated sentence ${DASH} that must still be fixed.`,
  ];
  const bogusFixed = fixLines(bogus, true);
  if (bogusFixed.edits.length !== 1 || bogusFixed.edits[0].lineIndex !== 2)
    FAIL("stray-backtick-cap", `expected exactly one edit on line 3, got ${JSON.stringify(bogusFixed.edits)}`);

  // (4) Idempotence: a real, multi-rule, multi-line fixture run through `fixLines()` twice must
  // produce the SAME lines both times, with zero edits on the second pass (#730 review finding 5:
  // the old check only asserted a hand-written "already fixed" string had no dash in it, which
  // cannot fail no matter what `fixLines()` does).
  const idemSrc = [
    `## 1.63 ${DASH} 2026-09-18 - title`,
    `- \`npm test\` ${DASH} the gate.`,
    `assumes`,
    `${DASH} this file is only the mental model.`,
    `plain sentence ${DASH} continues here.`,
  ];
  const pass1 = fixLines(idemSrc, true);
  const pass2 = fixLines(pass1.lines, true);
  if (pass2.edits.length !== 0) FAIL("idempotence", `a second --fix pass still made ${pass2.edits.length} edit(s): ${JSON.stringify(pass2.edits[0])}`);
  if (pass2.lines.join("\n") !== pass1.lines.join("\n")) FAIL("idempotence", "a second --fix pass changed the text without recording an edit");

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
