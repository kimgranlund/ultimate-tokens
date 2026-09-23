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
// Rebuilt from the CommonMark 6.1 code-span definition (pass 3, #730 review Pass 2: two prior
// patches over-corrected and under-corrected in turn; this replaces both with the actual rule
// instead of another heuristic).
//
//   - A code span OPENS at a run of N backtick characters and CLOSES at the next run of EXACTLY N
//     backticks; a run of a different length inside is neither an opener nor a closer for THIS
//     span (CommonMark 6.1). An opener with no same-length closer anywhere ahead is literal text,
//     never a span, and scanning resumes right after it.
//   - A span may cross a line break, but only within one paragraph: a blank line, a fence line, a
//     heading, a table row, or a list-item marker line (each list item is its own block, so a
//     span cannot cross from one item into the next) ends the search (`computeMdRoles()`'s
//     SCOPE). An opener with no closer before its scope ends is literal, per the rule above.
//   - A fenced code block (a line whose trimmed text starts with three or more backticks or
//     tildes, up to its matching fence) is not scanned for spans at all: the fence line itself
//     never opens one, and its content is swept like ordinary prose (the plan: "Dashes inside
//     Markdown fenced blocks ... swept like prose", `## Measured by the planner`). So a dash
//     inside a fenced block counts normally; it is exempt from nothing.
//   - A heading or a table row is its own one-line scope: it can hold a self-contained span, but
//     a span never crosses INTO or OUT OF one (matches `HEADING_RE`/`CELL_RE`'s per-line rules,
//     which already treat a heading/row as one unit).
//   - Non-Markdown files are never masked here (a template literal's backticks are code, not a
//     quote; #730 revision-4 finding: masking them hid dashes in generated files).
//
// `computeMdRoles(lines)` walks the ORIGINAL (pre-`--fix`) lines once and returns one role object
// per line, from which `maskMdLine(currentText, role)` can mask that line's CURRENT text (already
// edited or not): a fix rule only ever touches a dash and its immediate spacing/punctuation, never
// a backtick, so a line's backtick run COUNT, LENGTHS and ORDER are identical before and after any
// number of edits -- only their column positions shift -- which is what lets the role, computed
// once, be replayed against edited text by re-finding that line's runs fresh each time.
function isBlankLine(line) { return line.trim() === ""; }
function isHeadingLine(line) { return /^#{1,6} /.test(line); }
function isTableRowLine(line) { return /^\s*\|/.test(line); }
// A list-item marker line (CommonMark: `-`/`*`/`+`, or a numbered `1.`/`1)`). Each list item is
// its own block, so a span cannot cross from one item into the next -- a scope that kept growing
// across marker lines let a stray backtick in one bullet pair with the next single-backtick run
// several bullets later and `fullyMasked` every line in between (pass 3 review, Pass 3 finding 1).
function isListItemLine(line) { return /^\s*([-*+]|\d+[.)])\s/.test(line); }
function fenceMarkerOf(line) {
  const m = line.trim().match(/^(`{3,}|~{3,})/);
  return m ? m[1] : null;
}
function findBacktickRuns(text) {
  const runs = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] !== "`") { i++; continue; }
    let j = i;
    while (j < text.length && text[j] === "`") j++;
    runs.push({ start: i, end: j, length: j - i });
    i = j;
  }
  return runs;
}
// Matches spans within one SCOPE (a paragraph's original lines, or a single heading/table-row
// line): CommonMark's run-length matching, left to right, across the whole scope at once.
function matchSpansInScope(scopeLines) {
  const perLineRuns = scopeLines.map(findBacktickRuns);
  const flat = [];
  perLineRuns.forEach((runs, li) => runs.forEach((_, ri) => flat.push({ li, ri })));
  const role = scopeLines.map(() => ({ entersOpen: false, enterCloseAt: null, pairCloseIndex: new Map(), opensContinuing: null, fullyMasked: false }));
  let k = 0;
  while (k < flat.length) {
    const opener = flat[k];
    const openLen = perLineRuns[opener.li][opener.ri].length;
    let m = k + 1, closer = null;
    while (m < flat.length) {
      if (perLineRuns[flat[m].li][flat[m].ri].length === openLen) { closer = flat[m]; break; }
      m++;
    }
    if (!closer) { k++; continue; } // no same-length closer anywhere ahead: literal, try the next run
    if (closer.li === opener.li) {
      role[opener.li].pairCloseIndex.set(opener.ri, closer.ri);
    } else {
      role[opener.li].opensContinuing = opener.ri;
      role[closer.li].entersOpen = true;
      role[closer.li].enterCloseAt = closer.ri;
      for (let li = opener.li + 1; li < closer.li; li++) role[li].fullyMasked = true;
    }
    k = m + 1; // resume scanning right after the matched closer
  }
  return role;
}
// One role object per line of the whole file, computed once from the ORIGINAL content. `null`
// means "no role": a blank line, a fence marker, or fenced content -- never masked (unmasked text
// passes straight through, i.e. counted like any other prose line).
function computeMdRoles(lines) {
  const roles = new Array(lines.length).fill(null);
  let i = 0, inFence = false, fenceMarker = null;
  while (i < lines.length) {
    const raw = lines[i];
    if (!inFence) {
      const marker = fenceMarkerOf(raw);
      if (marker) { inFence = true; fenceMarker = marker; i++; continue; }
    } else {
      const close = raw.trim().match(/^(`{3,}|~{3,})\s*$/);
      if (close && close[1][0] === fenceMarker[0] && close[1].length >= fenceMarker.length) { inFence = false; fenceMarker = null; }
      i++; continue;
    }
    if (isBlankLine(raw)) { i++; continue; }
    if (isHeadingLine(raw) || isTableRowLine(raw)) { roles[i] = matchSpansInScope([raw])[0]; i++; continue; }
    let j = i + 1;
    while (j < lines.length && !isBlankLine(lines[j]) && !isHeadingLine(lines[j]) && !isTableRowLine(lines[j]) && !fenceMarkerOf(lines[j]) && !isListItemLine(lines[j])) j++;
    const scopeRoles = matchSpansInScope(lines.slice(i, j));
    for (let k = 0; k < scopeRoles.length; k++) roles[i + k] = scopeRoles[k];
    i = j;
  }
  return roles;
}
// Applies one line's precomputed role to its CURRENT text (see the note above on why this is
// safe after edits): masks every character inside a span with U+0000 (never a real newline, so
// line-splitting elsewhere stays correct), and leaves everything else -- including the backticks
// themselves and any literal, unmatched backtick run -- untouched.
function maskMdLine(currentText, role) {
  if (!role) return currentText;
  const mask = (from, to, chars) => { for (let p = from; p < to; p++) if (chars[p] !== "\n") chars[p] = "\u0000"; };
  if (role.fullyMasked) { const chars = currentText.split(""); mask(0, chars.length, chars); return chars.join(""); }
  const runs = findBacktickRuns(currentText);
  const chars = currentText.split("");
  let idx = 0;
  if (role.entersOpen) {
    if (role.enterCloseAt === null || role.enterCloseAt >= runs.length) { mask(0, chars.length, chars); return chars.join(""); }
    mask(0, runs[role.enterCloseAt].start, chars);
    idx = role.enterCloseAt + 1;
  }
  while (idx < runs.length) {
    if (role.pairCloseIndex.has(idx)) {
      const closeIdx = role.pairCloseIndex.get(idx);
      mask(runs[idx].end, runs[closeIdx].start, chars);
      idx = closeIdx + 1;
    } else if (role.opensContinuing === idx) {
      mask(runs[idx].end, chars.length, chars);
      idx = runs.length;
    } else {
      idx++;
    }
  }
  return chars.join("");
}

// One boolean per line of a `.md` file: true for a line INSIDE a fenced block (the fence markers
// themselves are false). Reuses `fenceMarkerOf()`, independent of `computeMdRoles()`'s span work
// -- only the refused list's "habitat" column needs it (revision 11).
function computeFenceFlags(lines) {
  const flags = new Array(lines.length).fill(false);
  let inFence = false, fenceMarker = null;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!inFence) {
      const marker = fenceMarkerOf(raw);
      if (marker) { inFence = true; fenceMarker = marker; continue; }
    } else {
      flags[i] = true;
      const close = raw.trim().match(/^(`{3,}|~{3,})\s*$/);
      if (close && close[1][0] === fenceMarker[0] && close[1].length >= fenceMarker.length) { inFence = false; fenceMarker = null; }
    }
  }
  return flags;
}
// Is the character at `idx` inside an open quote (`"`, `'`, or a backtick), counting each type's
// occurrences before it independently? An odd count of one type means `idx` sits inside a string
// of that kind. Escapes aren't tracked (good enough for a readable label, not a parser).
function insideStringAt(raw, idx) {
  const before = raw.slice(0, idx);
  for (const q of ['"', "'", "`"]) {
    let count = 0;
    for (let i = 0; i < before.length; i++) if (before[i] === q) count++;
    if (count % 2 === 1) return true;
  }
  return false;
}
// A plain-English label for a refused line with no lettered sub-construct (revision 11's refused
// list prints one per line): the Markdown block it sits in, or, in a non-Markdown file, whether
// the dash is inside a string literal, a comment-only line, or a trailing comment after real
// code. Checks `insideStringAt` FIRST at the `//`/`#` marker itself (pass 5 review finding 4:
// `## Which variant? [dash] decision tree` is a quoted string, not a real heading comment, and
// `` `// GENERATED ... [dash] DO NOT EDIT.` `` is a template literal, not a real `//` comment).
function habitatOf(rel, raw, md, inFence) {
  const trimmed = raw.trim();
  if (md) {
    if (inFence) return "fence";
    if (trimmed.startsWith(">")) return "quote";
    if (isListItemLine(raw)) return "list";
    if (isTableRowLine(raw)) return "table";
    if (isHeadingLine(raw)) return "heading";
    return "paragraph";
  }
  const markerIdx = raw.search(/\/\/|#/);
  if (markerIdx >= 0 && insideStringAt(raw, markerIdx)) return "string";
  if (/^(\/\/|#|\/\*|\*)/.test(trimmed)) return "comment";
  if (markerIdx > 0 && raw.slice(0, markerIdx).trim() !== "") return "trailing comment";
  if (/["'`]/.test(raw)) return "string";
  return "comment";
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
const PUNCT_END_RE = /[.,;:!?]$/;

// -- The positive guard (plan revision 11) ----------------------------------------------------
// Five passes grew R0 one lettered construct at a time, and the re-diagnosis
// (`.sdlc/plans/rule-gates-U3-rediagnosis.md` §1) showed the list was still open: a legend
// naming the glyph, a drawn chart line, a heading in an exported string, a question label, a
// glued field name, an aligned comment column and a status mark all slipped through revision 10.
// The owner ruled B: flip the guard from a negative list of what `--fix` must not touch to a
// positive test of what it may. A dash may be rewritten only where it sits between two words: an
// actual space on each side (never glued, `relTrackEm[dash] tracking`), the nearest character
// before that space a letter, a digit or a CLOSING token (bracket, quote, backtick, a bold/strike
// marker, `°`, `%`, `…`), and the nearest character after the other space a letter, a digit or an
// OPENING token (bracket, quote, backtick, `*`, `_`, `~`, `#`, `$`, `@`, `&`, `<`, `§`). Anything
// that fails either side -- a slash before an emoji legend, a `?` before a question label, a `>`
// or `/` from an aligned placeholder, no space at all -- is refused, whole line, no guess.
// `\p{L}`/`\p{N}` (Unicode letter/number, `u` flag), not `A-Za-z0-9`: a non-ASCII letter on either
// side is still a word, not a symbol (pass 5 review: `cliché [dash]` and `γ [dash]` were wrongly refused).
const GUARD_BEFORE_CHARS = /[\p{L}\p{N})\]}"'`*_~°%…”’]/u;
const GUARD_AFTER_CHARS = /[\p{L}\p{N}(\[{"'`*_~#$@&<§“‘]/u;
function guardHolds(line, idx) {
  if (line[idx - 1] !== " " || line[idx + 1] !== " ") return false;
  const pv = prevNonSpace(line, idx);
  const nx = nextNonSpace(line, idx);
  if (pv < 0 || !GUARD_BEFORE_CHARS.test(line[pv])) return false;
  if (nx >= line.length || !GUARD_AFTER_CHARS.test(line[nx])) return false;
  return true;
}
function guardBeforeHolds(line, idx) {
  if (line[idx - 1] !== " ") return false;
  const pv = prevNonSpace(line, idx);
  return pv >= 0 && GUARD_BEFORE_CHARS.test(line[pv]);
}
function guardAfterHolds(line, idx) {
  if (line[idx + 1] !== " ") return false;
  const nx = nextNonSpace(line, idx);
  return nx < line.length && GUARD_AFTER_CHARS.test(line[nx]);
}

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

  // Line-start dash: R7 (join to the sentence above, the guard's before side read across the
  // wrap, no punctuation there, and the guard's after side holding on this line) or a plain
  // refusal (revision 11: what was R0 (a)/(d)/(f)/(g) all failed the guard anyway and need no
  // letter; a full stop, a leading `//`/`#`/`>` marker, and a table cell's opening `|` are none
  // of them a letter, digit or closing/opening token).
  for (const idx of idxs) {
    if (line.slice(0, idx).trim() === "") {
      const prevTrim = (prevLine ?? "").trimEnd();
      if (prevTrim && GUARD_BEFORE_CHARS.test(prevTrim.slice(-1)) && !PUNCT_END_RE.test(prevTrim) && guardAfterHolds(line, idx)) {
        return { rule: "R7" };
      }
      return { rule: "R0" };
    }
  }

  // R2: a Markdown heading, first dash on the line (fenced blocks included), the guard's after
  // side holding. A SHAPE rule: fires once per line, per the rule table ("a second dash on the
  // same heading falls to R8"). A heading whose label-dash fails the after-guard (glued, or ends
  // the line) is refused rather than guessed -- a plain refusal (pass 5 review finding 4: a rule
  // name is not a habitat; the caller tags it like any other refused line).
  if (!skipStructural && md && HEADING_RE.test(line)) {
    return guardAfterHolds(line, idxs[0]) ? { rule: "R2" } : { rule: "R0" };
  }

  // R3: a bullet whose first token is a code span or a bold label, then the dash, the guard's
  // after side holding. Also once. (Revision 11 measured 2 refused here: a label whose dash ends
  // the line.)
  if (!skipStructural && BULLET_LABEL_RE.test(line)) {
    return guardAfterHolds(line, idxs[0]) ? { rule: "R3" } : { rule: "R0" };
  }

  for (const idx of idxs) {
    const pv = prevNonSpace(line, idx);
    // R4: a dash right after `, : ; (`, the guard's after side holding (never after a full stop,
    // never after a table pipe: both fail the guard and are plain refusals now).
    if (pv >= 0 && ",;:(".includes(line[pv]) && guardAfterHolds(line, idx)) return { rule: "R4" };
    const nx = nextNonSpace(line, idx);
    // R5: a dash right before `, . ; : )` followed by a space or the line end, the guard's before
    // side holding.
    if (nx < line.length && ",.;:)".includes(line[nx]) && (nx + 1 >= line.length || line[nx + 1] === " ") && guardBeforeHolds(line, idx))
      return { rule: "R5" };
    // R6: a dash that ends the line, the guard's before side holding (revision 11 measured 1
    // refused here; a plain refusal, tagged by habitat like the rest -- pass 5 review finding 4).
    if (line.slice(idx + 1).trim() === "") {
      return guardBeforeHolds(line, idx) ? { rule: "R6" } : { rule: "R0" };
    }
  }
  // R8: every other dash that passes the guard on both sides; anything else is a plain refusal --
  // the positive test the re-diagnosis recommended, replacing the open-ended R0 list (a legend
  // naming the glyph, a drawn chart line, a heading in an exported string, a question label, a
  // glued field name, an aligned comment column, a status mark: none of them flanked by two words).
  return guardHolds(line, idxs[0]) ? { rule: "R8" } : { rule: "R0" };
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
    const roles = md ? computeMdRoles(lines) : null;
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const masked = md ? maskMdLine(raw, roles[i]) : raw;
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
  // Roles are computed once from the untouched originals (a fix rule never adds or removes a
  // backtick, so a line's runs stay the same in count, length and order through every edit) and
  // stay valid for every re-mask of that line as its content changes.
  const roles = md ? computeMdRoles(lines) : null;
  const maskOf = (i) => (md ? maskMdLine(out[i], roles[i]) : out[i]);
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
        // The dash and its own trailing space go; the line's leading indentation (everything
        // before the dash -- a line-start dash's own classifyLine check already proved this
        // prefix is whitespace-only) stays, so an indented continuation keeps its column
        // (verifier row 16: `raw.slice(idx + 1)` alone dropped it, moving `decision-records.md:235`
        // and `type-rubric.md:45` to column 0).
        const indent = raw.slice(0, idx);
        out[i] = indent + raw.slice(idx + 1).replace(/^\s+/, "");
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
  const r0Lines = [];
  const samples = { R1: [], R2: [], R3: [], R4: [], R5: [], R6: [], R7: [], R8: [] };

  for (const rel of files) {
    if (shouldSkipFix(rel)) continue;
    const abs = join(ROOT, rel);
    const src = readText(abs);
    if (src === null) continue;
    const md = isMd(rel);
    const lines = src.split("\n");
    const fenceFlags = md ? computeFenceFlags(lines) : null;
    const { lines: fixed, edits } = fixLines(lines, md);
    let changed = false;

    for (const e of edits) {
      if (e.rule === "R0") {
        // (b), (c), (e) keep their own sub-label; every other refusal -- including a shape rule
        // (R2/R3/R6) whose guard side failed -- gets a habitat computed from the line itself, per
        // the plan ("every refused line carries its habitat", pass 5 review finding 4: a rule
        // name printed there is not a habitat).
        const tag = e.construct || habitatOf(rel, e.text, md, fenceFlags ? fenceFlags[e.lineIndex] : false);
        r0Lines.push({ rel, line: e.lineIndex + 1, tag, text: e.text });
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
  // Revision 11: R0 collapses from seven lettered constructs to the guard's one refusal, so the
  // rule table prints a single aggregate count; the refused list below (no cap, per P3) is where
  // a reviewer reads every line, not a `R0 <letter> <n>` breakdown.
  console.log(`R0 ${r0Lines.length}`);
  for (const r of ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8"]) {
    counts[r] = linesByRule[r].size;
    console.log(`${r} ${counts[r]}`);
  }
  if (r0Lines.length) {
    console.log("\nresidual (left in place, fix by hand):");
    for (const r of r0Lines) console.log(`  ${r.rel}:${r.line} (${r.tag}) ${r.text}`);
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

  // (1) The byte-mode trap (#730): the temp file is read back through `readText()` itself (the
  // SAME function `runGate()`/`runFix()` call on every real file), not a hand-rolled read, so a
  // mutant that turns `readText()` byte-mode (`"latin1"`, or a `Buffer` with `.toString("binary")`)
  // is caught here, before it goes vacuously green over every real dash in the tree (verifier
  // controls d2/d3: with `readText()` mutated, this fixture is the only thing standing between
  // the mutant and a `self-test: PASS`). A SEPARATE, hand-rolled `latin1` read is kept alongside
  // only to prove the two disagree -- i.e. that this fixture is capable of telling a byte-mode
  // read apart from a real one at all.
  const tmp = join(tmpdir(), `em-dash-selftest-${process.pid}.txt`);
  writeFileSync(tmp, `x ${DASH} y\n`, "utf8");
  const utf8Count = dashIndices(readText(tmp) ?? "").length;
  const latin1Count = dashIndices(readFileSync(tmp, "latin1")).length;
  unlinkSync(tmp);
  if (utf8Count !== 1) FAIL("reader", `readText() found ${utf8Count} dashes, expected 1`);
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
    // Verifier row 24 (mutant M5): R2 must not fire outside a `.md` file (a `#` line in a `.py`
    // or `.sh` file is a comment, not a Markdown heading).
    { name: "R2 does not fire outside Markdown", md: false, line: `# heading ${DASH} x`, expectRule: "R8" },
    // Revision 11: a heading label's dash ending the line fails the guard's after side (nothing
    // follows it), so it is refused rather than guessed at -- the same outcome the plan measures
    // for R3 ("2 refused, a label whose dash ends the line").
    { name: "R2 heading label, dash ends the line", md: true, line: `## title ${DASH}`, expectRule: "R0" },
    { name: "R3 bullet label", md: true, line: `- \`npm test\` ${DASH} the gate.`, expectRule: "R3", expectFix: "- \`npm test\`: the gate." },
    { name: "R4 after comma", md: true, line: `foo, ${DASH} bar`, expectRule: "R4", expectFix: "foo, bar" },
    // R0 (f), plan revision 9: a table cell that OPENS with the dash but carries more content
    // (R1's whole-cell check above does not fire) is a presence matrix where the dash means
    // "absent" (`docs/reference/reviews/2026-07-17-export-drift.md:212`), not a pause R4 can drop
    // (R4's generic drop, and R8's generic ", ", both changed the row's meaning -- Pass 2 review
    // finding 3 and the Pass 3 re-review). Refused and named; U4 rewrites it by hand.
    { name: "R0(f) table cell opens with the dash", md: true, line: `| a | ${DASH} (mapped indirectly) | b |`, expectRule: "R0" },
    // R0 (g), plan revision 10: the only text before the dash is a leading comment or quote
    // marker, so there is no sentence above to join (R7) and no line-before to check (R0 (d)).
    { name: "R0(g) JS comment marker", md: false, line: `// ${DASH} see applyFloatPlans below`, expectRule: "R0" },
    { name: "R0(g) YAML/shell comment marker", md: false, line: `# ${DASH} an automatic deploy in flight.`, expectRule: "R0" },
    { name: "R0(g) blockquote sign-off", md: true, line: `> ${DASH} Ultimate Tokens`, expectRule: "R0" },
    // Revision 11, the re-diagnosis's four further constructs (`.sdlc/plans/rule-gates-U3-rediagnosis.md`
    // §1): none of them fail because of a lettered rule any pass named -- each fails the guard.
    { name: "guard: legend naming the glyph", md: false, line: `// (✓ match / ✗ drifted / ${DASH} absent)`, expectRule: "R0" },
    { name: "guard: glued field name", md: false, line: `//   relTrackEm${DASH} tracking as em`, expectRule: "R0" },
    { name: "guard: question heading", md: false, line: `"## Which variant? ${DASH} decision tree"`, expectRule: "R0" },
    { name: "guard: aligned comment column", md: false, line: `//   weight/<voice>/<slug> ${DASH} MUTUALLY`, expectRule: "R0" },
    // Pass 5 review finding 2: step 1b names a drawn chart line among the re-diagnosis's
    // constructs, but no fixture pinned it (only the tree itself, `ui-plan.md:111`, caught a
    // regression there). The bullet-plot glyph `●` before the dash fails the before-side guard.
    { name: "guard: drawn chart line", md: true, line: `   …  ┤   ●●                      ${DASH} tone line`, expectRule: "R0" },
    // R5 needs a space (or the line end) right after the punctuation; a period glued to more text
    // (a CSS selector, `.btn`, not a sentence end) is not that, and under the guard a period is
    // not a valid after-token either, so this is now a plain refusal, not R8's blind ", ".
    { name: "R5 before period, space required", md: true, line: `(#477) ${DASH} .btn`, expectRule: "R0" },
    { name: "R5 before period, punctuation followed by a space", md: true, line: `keep the pause ${DASH} . Next sentence`, expectRule: "R5", expectFix: "keep the pause. Next sentence" },
    { name: "R6 line-end", md: true, line: `gen:type-fonts ${DASH}`, expectRule: "R6", expectFix: "gen:type-fonts," },
    // Pass 5 review finding 3: `guardBeforeHolds` (R5/R6's before-side check) had no fixture --
    // forcing it to always return `true` still passed the whole self-test, while on the tree
    // `mode-apply-plan.mjs:289` (`<slug> [dash]` at the end of the line) moved from refused to R6. A
    // placeholder's closing `>` fails the before-guard, so this line-end dash is refused too.
    { name: "guard: R6 before-side (placeholder before a line-end dash)", md: false, line: `name <slug> ${DASH}`, expectRule: "R0" },
    // The line-before's trailing whitespace has to be trimmed BEFORE the comma is appended, and
    // this fixture's prevLine carries a trailing space so a mutant that appends `,` without
    // trimming (`out[i-1] + ","`) fails here, not just one that changes the comma itself.
    { name: "R7 line-start after a word", md: true, line: `${DASH} this file is only the mental model.`, prevLine: "assumes  ", expectRule: "R7", expectFix: "this file is only the mental model.\nassumes," },
    // Verifier row 16: the continuation's leading indentation must survive; only the dash and its
    // one separating space go (real instance: `decision-records.md:235`, five spaces).
    { name: "R7 keeps the continuation's indentation", md: true, line: `     ${DASH} editorial voices use ...`, prevLine: "assumes", expectRule: "R7", expectFix: "     editorial voices use ...\nassumes," },
    { name: "R8 default", md: true, line: `TKT-0015 ${DASH} undocumented elsewhere`, expectRule: "R8", expectFix: "TKT-0015, undocumented elsewhere" },
    // Pass 5 review finding 1: a non-ASCII letter on either side of the dash is still a word, not
    // a symbol -- `A-Za-z0-9` wrongly refused these; `\p{L}`/`\p{N}` fixes it.
    { name: "guard: Unicode letter before the dash", md: true, line: `cliché ${DASH} the word survives`, expectRule: "R8", expectFix: "cliché, the word survives" },
    { name: "guard: Unicode letter after the dash", md: true, line: `the ratio ${DASH} γ approaches zero`, expectRule: "R8", expectFix: "the ratio, γ approaches zero" },
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

  // A table cell that opens with the dash and carries more text is refused, not rewritten, and
  // must survive `--fix` byte for byte -- the `|` before it fails the guard's before side (not a
  // letter, digit or closing token), so it needs no letter of its own any more (plan revision 9's
  // R0 (f) is retired as a construct by revision 11; the outcome is unchanged).
  const r0fLine = `| Color stops (raw) | ${DASH} (mapped indirectly) | ok |`;
  const r0fFixed = fixLines([r0fLine], true);
  if (r0fFixed.lines[0] !== r0fLine) FAIL("r0f-refused", `the line changed: "${r0fFixed.lines[0]}"`);
  if (r0fFixed.edits.length !== 1 || r0fFixed.edits[0].rule !== "R0")
    FAIL("r0f-refused", `expected one R0 edit, got ${JSON.stringify(r0fFixed.edits)}`);

  // A leading comment/quote marker with the dash right after it is refused, not rewritten, and
  // must survive `--fix` byte for byte -- the sign-off in `store-copy.md:486` (`> [dash] Ultimate
  // Tokens`) must keep its author, not become `>, Ultimate Tokens` (revision 10's R0 (g) is
  // retired as a construct by revision 11: the marker itself fails the guard's before side, so it
  // needs no letter either).
  const r0gLine = `> ${DASH} Ultimate Tokens`;
  const r0gFixed = fixLines([r0gLine], true);
  if (r0gFixed.lines[0] !== r0gLine) FAIL("r0g-refused", `the line changed: "${r0gFixed.lines[0]}"`);
  if (r0gFixed.edits.length !== 1 || r0gFixed.edits[0].rule !== "R0")
    FAIL("r0g-refused", `expected one R0 edit, got ${JSON.stringify(r0gFixed.edits)}`);

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

  // Pass 3, three reviewer probes the old (pass-2) stateful streak masker got wrong, all in the
  // over-masking direction (a real dash hidden). Each one reds (0 edits) on the pass-2 code and
  // passes (the dash found and fixed by R8) on the CommonMark-run-length rebuild.

  // Probe: the first line of a fenced block. The pass-2 masker counted the fence marker's three
  // backticks like any other run, toggling "open" onto the block's first content line and masking
  // it whole. A fence never opens an inline span, and the plan's ruling is that fenced content is
  // swept like prose (not exempt), so the dash here must be found and fixed.
  const fenceFirstLine = ["```", `plain code line ${DASH} with a dash`, "```"];
  const fenceFixed = fixLines(fenceFirstLine, true);
  if (fenceFixed.edits.length !== 1 || fenceFixed.edits[0].lineIndex !== 1 || fenceFixed.edits[0].rule !== "R8")
    FAIL("fence-first-line", `expected one R8 edit on line 2, got ${JSON.stringify(fenceFixed.edits)}`);

  // Probe: a lone backtick with no closer anywhere in its paragraph. CommonMark says an opener
  // with no closer is literal text, not a span, so nothing after it is masked. The pass-2 masker
  // paired it with an imaginary closer at end of line and swallowed the rest of the line, dash
  // included.
  const strayRest = [`a stray \` backtick then a dash ${DASH} here`];
  const strayRestFixed = fixLines(strayRest, true);
  if (strayRestFixed.edits.length !== 1 || strayRestFixed.edits[0].lineIndex !== 0 || strayRestFixed.edits[0].rule !== "R8")
    FAIL("stray-backtick-rest-of-line", `expected one R8 edit on line 1, got ${JSON.stringify(strayRestFixed.edits)}`);

  // Probe: two genuine line-wrapping spans back to back. The pass-2 masker's one-line-open streak
  // cap forced "closed" at the start of the third line even though the second wrap (opened on the
  // middle line) was still genuinely open there, so its own lone closing backtick was read as a
  // fresh opener and everything after it -- including the dash outside both spans -- was masked.
  const backToBack = [
    "before `wrap A starts",
    "closes` and then `wrap B starts",
    `wrap B closes\` and now plain text ${DASH} continues`,
  ];
  const backToBackFixed = fixLines(backToBack, true);
  if (backToBackFixed.edits.length !== 1 || backToBackFixed.edits[0].lineIndex !== 2 || backToBackFixed.edits[0].rule !== "R8")
    FAIL("back-to-back-wraps", `expected one R8 edit on line 3, got ${JSON.stringify(backToBackFixed.edits)}`);

  // Probe: a list item is its own block (pass 3 review, Pass 3 finding 1). A stray backtick in
  // one bullet used to pair with a stray backtick several bullets later (no list-item scope
  // break existed), `fullyMasked`-ing every bullet in between, dash included.
  const listScope = [
    "- item one with a stray ` backtick",
    `- item two has a dash ${DASH} here`,
    "- item three closes the phantom pair `",
  ];
  const listScopeFixed = fixLines(listScope, true);
  if (listScopeFixed.edits.length !== 1 || listScopeFixed.edits[0].lineIndex !== 1 || listScopeFixed.edits[0].rule !== "R8")
    FAIL("list-item-scope-break", `expected one R8 edit on line 2, got ${JSON.stringify(listScopeFixed.edits)}`);

  // Probe: CommonMark's run-length rule itself (pass 3 review, Pass 3 finding 2). A 2-backtick
  // opener closes only at the next 2-backtick run, never at a shorter one; there is no true closer
  // here, so the whole run is literal and the dash stays outside, countable.
  const runLenFixed = fixLines([`\`\`span with the dash ${DASH} inside, wrongly closed by\` a single backtick after`], true);
  if (runLenFixed.edits.length !== 1 || runLenFixed.edits[0].lineIndex !== 0 || runLenFixed.edits[0].rule !== "R8")
    FAIL("run-length-mismatch", `expected one R8 edit on line 1, got ${JSON.stringify(runLenFixed.edits)}`);

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
