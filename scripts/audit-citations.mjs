#!/usr/bin/env node
// audit-citations.mjs -- the generative completeness predicate for #637 §6 filing item 1,
// and a GATE: `test/repo/citations.mjs` runs it from `npm test`.
// Run from the repo root:  node scripts/audit-citations.mjs  [--md | --json | --selftest]
// Read-only: readFileSync + `git ls-files`. It writes nothing and mutates nothing.
//
// EXIT CODE (PR #658 review, finding 1; #672: NOFILE joins STALE): 1 when any audited doc has a
// STALE or NOFILE line, or when a read/parse fails; 0 otherwise. `--md`/`--json` keep their output
// AND the same exit semantics. `--selftest` exercises parseCitations() on literal strings, then
// the anchor/symbol predicate on synthetic lines (#672's negative controls), and exits nonzero on
// the first miss. `runAudit()` / `parseCitations()` / `staleLines()` are exported so the gate
// imports the logic instead of scraping stdout.
//
// It answers two questions MECHANICALLY, so that §6's enumeration is generated rather
// than hand-counted:
//   (A) which LINES of every citing doc under docs/ (discovered, see DOCS_IMPLIED /
//       DOCS_EXEMPT / discoverDocs below) carry a citation that no longer describes what
//       it points at, and
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
//   ANCHOR    = a token on the CITING line (or, when the line itself carries none, the
//               enclosing prose paragraph -- a citing sentence commonly wraps onto the
//               previous doc line) specific enough to look for in the CITED line: a
//               camelCase/PascalCase identifier, a `.class`/`#id`, any identifier the doc
//               writes as a call inside backticks (`` `name()` ``), or the citation's own
//               subject written bare as `name :N` or `name (` -- backtick-HUGGED
//               (`` `render` :570 ``, `` `carve-out` (`file.js:9`) ``) or, with no backtick
//               anywhere before the `:N`/`(`, required to itself be camelCase/PascalCase/
//               snake_case (#672; the `name(` form joined this floor at PR #694 critic
//               review item 2 -- it used to also pass on ANY bare word whose own
//               parenthetical merely contained a citation, which reopened #672's exact bug
//               for that one shape). A FULLY BARE lowercase English word is NOT an anchor
//               -- that restriction, not "which one anchor wins", is #672's actual fix: a
//               `tonal.js:335` cite for `_okL` no longer passes on a same-line prose word
//               like "domain", and a `tonal.js:216` cite for a comment no longer passes on
//               a same-line prose word like "guarantee" sitting next to `(tonal.js:216)`.
//               A citation is judged against EVERY anchor in scope, and passes if ANY of
//               them occurs at/near the cited line (#672 correction, PR review by the
//               lead): an earlier draft narrowed this to the ONE anchor nearest the
//               citation's position, which broke two real shapes -- a doc line naming two
//               symbols before one shared line number (`` `toggleLeftPane`/`toggleRightPane`
//               :1448 ``, where the nearer backtick belongs to the OTHER method) and a
//               wrapped sentence whose subject sits on the previous doc line -- both
//               correct citations, both misread as STALE. "Any anchor" over an
//               identifier-only set keeps the ticket's real win without reintroducing the
//               "any anchor" bug on BARE ENGLISH WORDS, because bare words were never
//               anchors to begin with.
//               #693 narrows "any" for RECURRING tokens: when the doc binds a citation to a
//               credible SUBJECT by adjacency (`disabled (styles.css:188)`), another anchor
//               validates the line only if it is rare in the cited file (<= RARE lines) or the
//               line is its definition site. The subject itself always counts.
//   KNOWN LIMIT (#693, what remains): recurrence is still undetectable when (1) the recurring
//               token IS the subject (`` `render` :570 `` repointed onto one of 68 `render`
//               lines, or `active = .on (styles.css:879)` onto any `.on` rule), (2) the citing
//               line has no anchor of its own and the anchors come from the paragraph widen
//               (no subject binding is attempted there; a rarity rule on paragraph anchors
//               flagged 18 correct `this.segmented(` call-site cites and was rejected), (3) the
//               subject is a plain word that is common in the file or appears only in comments,
//               or (4) the wrong line sits inside the subject's own body. Measured on +37-line
//               drifts of every OK citation, the catch rate went from 80.6% to 82.7%; the
//               named exploit (component-inventory.md:118 repointed 217 lines) now reads STALE.
//   VERDICTS  STALE-PAST-EOF   cited line number exceeds the cited file's length
//             STALE-WRONG-LINE no anchor occurs at the cited line or within WINDOW
//             NEAR             an anchor occurs within WINDOW of the cited line
//             OK               an anchor occurs AT the cited line
//             UNDECIDABLE      the citing line (and paragraph) carry no anchor; a human must read it
//             NOFILE           the cited path is not tracked -- fails the gate like STALE (#672)
// STALE ∪ NEAR ∪ UNDECIDABLE ∪ OK ∪ NOFILE partitions every citation, so the
// DENOMINATOR (total citation lines) is generated too, which is the thing two rounds
// of hand-enumeration could not produce.

import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// ---------- the audited set: DISCOVERED, not hand-listed (#664) ----------
// Every tracked `docs/**/*.md` that carries at least one citation the parser recognizes is
// audited. The old hand-listed 2-doc DOCS array left every citation into src/engine/* (or any
// tree other than app.js) structurally outside the gate: two review records cited
// `src/engine/tonal.js:275` for `_okL` while it sat at :283, and the gate read STALE 0.
// DOCS_IMPLIED declares the file a doc's BARE `:NNN` citations point at; a doc without an entry
// gets no default, and its bare citations classify UNDECIDABLE (never silently app.js).
// DOCS_EXEMPT is the allow-list, one reason string per entry; ship it empty unless a doc
// genuinely cannot be pinned (an archived record citing a deleted file is NOFILE, not STALE,
// so it needs no exemption).
const DOCS_IMPLIED = {
  "docs/lld/app-shell.md": "src/ui/app.js",
  "docs/reference/references/component-inventory.md": "src/ui/app.js",
};
// An entry's `path` is an exact tracked path or, ending in `/` or `-`, a prefix. Ruling #664:
// dated snapshots are exempt, live records are not.
export const DOCS_EXEMPT = [
  // the 2026-07-17 CTO/librarian/export-drift review round: a dated snapshot of the pre-#646
  // monolithic app.js (7000+ lines, now 2578); its citations describe a file that no longer exists
  { path: "docs/reference/reviews/2026-07-17-", reason: "archived 2026-07-17 review round, pre-#646 app.js snapshot" },
  // the file-ticket archive, frozen when tickets moved to GitHub Issues (ADR-017, 2026-07-17)
  { path: "docs/tickets/", reason: "archived file tickets, frozen at ADR-017 (2026-07-17)" },
  // closed plans, moved here on landing (.sdlc/adapter.md §5); a closed plan is a record of the
  // tree it was built on, not a claim about the current tree
  { path: "docs/plan/archive/", reason: "closed plans, archived on landing" },
];
const isExempt = (p) => DOCS_EXEMPT.some((e) => p === e.path || (/[\/-]$/.test(e.path) && p.startsWith(e.path)));
const reDocPath = /^docs\/.*\.md$/;
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
// `[{ path, implied }]` for every tracked docs/**/*.md with >= 1 recognized citation, minus
// DOCS_EXEMPT. Exported so the gate can assert the discovered count is not vacuous.
export function discoverDocs() {
  const out = [];
  for (const p of tracked) {
    if (!reDocPath.test(p) || isExempt(p)) continue;
    const implied = DOCS_IMPLIED[p] ?? null;
    if (read(p).some((ln) => parseCitations(ln, implied).length)) out.push({ path: p, implied });
  }
  return out;
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
// written (an explicit one) or `implied` (null when the doc declares none). A slash list yields one entry per member, each
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
// A citation-shaped run, for detecting "this token sits directly next to an actual citation" --
// distinct from the parser's own reExplicit/reBare (which extract citations to resolve), this is
// used only to test adjacency when deciding whether a NEIGHBORING bare word gets to anchor.
const reCiteStart = new RegExp(`^(?::\\d{2,4}|[A-Za-z0-9_@./-]+\\.(?:${EXT}):\\d+)`);
const reCiteEnd = new RegExp(`(?::\\d{2,4}(?:[-–]\\d{2,4})?|[A-Za-z0-9_@./-]+\\.(?:${EXT}):\\d+(?:[-–]\\d+)?)\\s*$`);

// A small, closed-class set of English function words (articles, prepositions, conjunctions,
// pronouns, common copulas/auxiliaries): never an anchor, from either bare heuristic below,
// REGARDLESS of case shape or backtick placement (#672 round 2, F1). Needed because case shape
// alone cannot separate a real symbol from an English word of the same shape -- both
// `` `render` `` and `` `the` `` are plain lowercase, backtick-hugged, non-call tokens; only a
// closed-class list tells them apart. Reviewer-verified live contaminants (at, in, to, out,
// after, it, only, inside) are all in this class; kept short and closed rather than open-ended,
// so it stays auditable in one read rather than growing into an unbounded blocklist.
const STOPWORDS = new Set([
  "a", "an", "the", "this", "that", "these", "those", "and", "or", "but", "not", "no", "yes",
  "in", "on", "at", "to", "for", "of", "by", "as", "is", "are", "was", "were", "be", "been", "being",
  "it", "its", "he", "she", "we", "you", "i", "they", "them", "their", "his", "her", "our", "your",
  "with", "from", "into", "onto", "over", "under", "above", "below", "after", "before", "again",
  "so", "if", "than", "then", "when", "where", "which", "who", "whom", "whose", "what", "why", "how",
  "all", "any", "some", "each", "every", "both", "few", "more", "most", "other", "such", "only",
  "own", "same", "too", "very", "just", "also", "still", "now", "here", "there", "out", "up", "down",
  "off", "per", "via", "one", "two", "do", "does", "did", "has", "have", "had", "will", "would", "can",
  "could", "should", "may", "might", "inside", "outside",
]);

function resolvePath(cited) {
  if (tracked.includes(cited)) return cited;
  const base = cited.split("/").pop();
  const hits = (byBase.get(base) || []).filter((p) => p.endsWith(cited) || p.split("/").pop() === base);
  if (!hits.length) return null;
  const rank = (p) => (p.startsWith("src/") ? 0 : p.startsWith("test/") ? 1 : 2);
  return hits.sort((a, b) => rank(a) - rank(b) || a.length - b.length)[0];
}

// Every identifier-shaped anchor on a doc line, deduped. A citation passes if ANY of them
// occurs at/near the cited line (#672 correction) -- but the SET itself stays restricted to
// tokens that look like real symbols, which is what keeps a bare English word from qualifying.
export function anchorsOf(docLine) {
  const out = new Set();
  const add = (tok) => { if (tok && !reExtTail.test(tok)) out.add(tok); };
  for (const m of docLine.matchAll(/`([^`]+)`/g)) {
    const raw = m[1];
    // a code FRAGMENT (a CSS declaration, a JS expression) is matched literally: the
    // doc claims this exact text lives at the cited line.
    const frag = raw.trim();
    if (/[:;=]/.test(frag) && /\s/.test(frag) && !new RegExp(`\\.(?:${EXT}):\\d`).test(frag)) { out.add(LIT + frag); continue; }
    const s = raw.replace(new RegExp(`[A-Za-z0-9_@./-]+\\.(?:${EXT}):\\d+`, "g"), (mm) => " ".repeat(mm.length));
    let sawShapedToken = false;
    for (const t of s.matchAll(/(?<![A-Za-z0-9_$.#])[.#]?[A-Za-z_$][A-Za-z0-9_$-]*/g)) {
      const tok = t[0];
      const bare = tok.replace(/^[.#]/, "");
      const isSelector = /^[.#]/.test(tok);
      const isCamel = /[A-Z]/.test(bare);
      const isCall = new RegExp(`${bare.replace(/[-]/g, "\\$&")}\\s*\\(`).test(s);
      if (isSelector || isCamel || isCall) { add(tok); sawShapedToken = true; }
    }
    // A WHOLE, standalone backtick span (nothing else inside it) that is a plain lowercase word
    // or hyphenated label, with no camelCase/call/selector signal of its own, still anchors when
    // it directly hugs an actual citation on either side (`` `render`, `app.js:570` `` /
    // `` test/engine/tonal.mjs:246-264 `okhsl-modes` `` / `` `aria-pressed` at
    // `app.js:1466/1602` ``): the author's placing it immediately next to the citation IS the
    // signal -- same logic as the bare `:N` hug below, generalized to the explicit-citation
    // shape, to either direction, and past ONE short connector word (at/in/on) so ordinary
    // English between the subject and its citation doesn't defeat the adjacency (#672 round 2).
    // Never for a stopword (`` `the`, `app.js:570` `` still must not anchor -- the connector
    // itself is never the candidate token, only what it's connecting), and never when the span
    // carries other text (that's prose, not a lone symbol name).
    if (!sawShapedToken && /^[A-Za-z_$][A-Za-z0-9_$-]*$/.test(frag) && !STOPWORDS.has(frag.toLowerCase())) {
      const before = docLine.slice(Math.max(0, m.index - 80), m.index);
      const after = docLine.slice(m.index + m[0].length, m.index + m[0].length + 80).replace(/^[,;\s`]*(?:(?:at|in|on)\s+)?[,;\s`]*/, "");
      const hugsAfter = reCiteStart.test(after);
      const hugsBefore = reCiteEnd.test(before);
      if (hugsAfter || hugsBefore) add(frag);
    }
  }
  // `name :N` / `name(` outside backticks too -- the component table's own shape. Both
  // heuristics have no punctuation/call signal of their own to lean on for a BARE occurrence, so
  // a fully bare name (#672) must be camelCase/PascalCase/snake_case itself (`/[A-Z_]/`) --
  // otherwise ANY bare English word ahead of a bare `:N` or `(` (the doc's own "aimed at :200"
  // or "carve-out (" prose, not a symbol) anchored it, which is how a wrong-line citation could
  // pass on a generic word instead of the cited symbol.
  //
  // The `:N` form ALSO accepts a name that is backtick-HUGGED on both sides
  // (`` `render` :570 ``, no space between the name and either backtick): the backtick is the
  // author's own "this is code" signal, so a plain-lowercase, non-call, backticked function name
  // still anchors. A backtick merely somewhere in the gap is NOT hugging and does not exempt --
  // "the memo is aimed at `:200`" backticks the CITATION, not the word "at", and must still read
  // as no anchor (#672 round 2, F1.1: a naive `gap.includes(backtick)` check missed this and let
  // a 230-line-off citation pass on the anchor `to`/`at`). Hugging alone still isn't enough,
  // because a real symbol and an English word of the same shape are indistinguishable by shape or
  // position alone (`` `render` :570 `` vs. `` `the` :200 ``) -- so hugging exempts the SHAPE
  // check but never the STOPWORDS check above, closed-class and shape-independent.
  for (const m of docLine.matchAll(/(?<![A-Za-z0-9_$.])([A-Za-z_$][A-Za-z0-9_$]*)([\s`]*):\d{2,4}/g)) {
    const name = m[1];
    if (STOPWORDS.has(name.toLowerCase())) continue;
    const hugged = docLine[m.index - 1] === "`" && m[2].startsWith("`");
    if (hugged || /[A-Z_]/.test(name)) add(name);
  }
  // The `(` form now takes the EXACT SAME floor as the `:N` form above: a fully bare, unbacked
  // `name(` must itself be camelCase/PascalCase/snake_case (`/[A-Z_]/`), OR the name must be
  // backtick-HUGGED immediately before the `(` (`` `segmented` (`styles.css:869-870`) ``,
  // `` `disabled` (`styles.css:188`) ``) -- and STOPWORDS is checked first, unconditionally,
  // same as the `:N` form (PR #694 critic review item 2, owner-ruled 2026-09-19: fix in this PR).
  //
  // The PRIOR rule instead exempted a fully bare, unshaped word whenever its OWN parenthetical
  // happened to contain a citation-shaped run ("its own parenthetical must itself contain a real
  // citation"). That is precisely #672's own class of bug reopened for this one shape: a prose
  // word validates a citation merely because it sits next to one, not because it is the citation's
  // real subject. Live exploit (critic review, PR #694): `anchorsOf("the \`_okL\` memo covers the
  // lift domain (\`src/engine/tonal.js:216\`)")` returned `["_okL","domain"]`, and
  // `anchorsOf("guarantee (\`src/engine/tonal.js:216\`)")` returned `["guarantee"]` -- both readable
  // as OK against `tonal.js:216`, a comment naming neither word, purely because their parenthetical
  // held a real citation. No live citation depended on this hole (the ~64 plain-lowercase `word (
  // cite)` rows in the corpus were all already backtick-hugged), but eleven DID depend on it and
  // were repinned/backticked in the same commit as this fix (each read at its cited line first) --
  // see the doc diffs, not this comment, for the per-citation reasoning. One of those,
  // `04-context-and-messaging.md`'s `` `apply` `carve-out` `` line, is worth a callout: `carve-out`
  // names a COMMENT naming the real `apply` branch, sitting a few lines above it (line numbers
  // move as figma/plugin/code.js changes; #689 last pinned the branch itself at `:279-281` and the
  // comment naming `carve-out` at `:277`). Citing only the branch lines leaves this NEAR
  // (`carve-out` found outside the cited range), both before this fix (via the old exemption) and
  // after (via the new hug rule) -- the anchor-selection artifact tracked as #693's KNOWN LIMIT.
  // Backticking `carve-out` is necessary for it to anchor AT ALL under this fix's shape-or-hug
  // floor (an unbacked bare `carve-out (` no longer anchors on shape alone), but it does not by
  // itself turn NEAR into OK -- that would need the citation to also widen to include the comment
  // line, which a later ruling on this same doc line declined to do (keeping the citation's own
  // range accurate to the code it names, not padded to satisfy this predicate).
  //
  // The lookbehind/character-class cover hyphens (not just letters/digits/dot), so a hyphenated
  // compound (`carve-out(`) matches as ONE token instead of splitting at the hyphen into an
  // orphaned `out` -- the whole compound is what actually appears verbatim at a cited line ("Add a
  // carve-out below for...", "margin-bottom: 16px"), and the hug rule below is what lets a
  // shapeless compound like this still anchor once its author backticks it.
  for (const m of docLine.matchAll(/(?<![A-Za-z0-9_$.-])([A-Za-z_$][A-Za-z0-9_$-]*)([\s`]*)\(/g)) {
    const name = m[1];
    if (STOPWORDS.has(name.toLowerCase())) continue;
    const hugged = docLine[m.index - 1] === "`" && m[2].startsWith("`");
    if (hugged || /[A-Z_]/.test(name)) add(name);
  }
  return [...out];
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const hasToken = (line, anchor) => {
  if (anchor.startsWith(LIT)) return line.includes(anchor.slice(LIT.length)); // literal fragment
  const bare = anchor.replace(/^[.#]/, "");
  const isSelector = /^[.#]/.test(anchor);
  // A selector whose bare form is an English stopword ("on", "then", ...) must keep its
  // punctuation to count -- stripping it before matching is exactly the F1 class of hole
  // (#672 round 3): `.on` would otherwise match a plain "on" sitting in unrelated prose, e.g.
  // a comment 144 lines off ("...on open ... on close"). Real sites carry a mark: CSS always
  // compounds the selector (`.chip.on {`, never a bare `.on {` rule), and this codebase's
  // JS/hyperscript sites always quote the class name (`classList.contains("on")`,
  // `class: on ? "on" : ""`) rather than writing a literal `.on`. So a selector-shaped anchor
  // whose bare form is a stopword is accepted only with its dot/hash present, or as a quoted
  // string literal -- never as a bare unquoted word.
  // This makes a stopword selector PROSE-safe; RECURRENCE (the same code token on many lines of the
  // cited file, e.g. "accented via .on" one line above a `.pane-toggle.on` rule) is judgeLine()'s
  // job since #693 (see RARE / subjectsOf), not this function's.
  if (isSelector && STOPWORDS.has(bare.toLowerCase())) {
    const b = esc(bare);
    return new RegExp(`\\.${b}\\b|["']${b}["']`).test(line);
  }
  const t = esc(bare);
  return new RegExp(`(?<![A-Za-z0-9_$])${t}(?![A-Za-z0-9_$-])`).test(line);
};

// Is line `l` of file `p` a DEFINITION site of `anchor` (a function/method/const head, a CSS rule
// head, a JS class-name site), rather than a mere mention? Shared by homesOf() (where does the
// symbol actually live, repo-wide) and judgeLine()'s specificity rule (#693: a match at a
// definition site is strong evidence however often the name recurs in the file).
function definesAt(p, l, anchor) {
  if (anchor.startsWith(LIT)) return false; // a literal fragment has no definition shape
  const name = esc(anchor.replace(/^[.#]/, ""));
  if (/^[.#]/.test(anchor)) {
    if (p.endsWith(".css")) return new RegExp(`(^|[\\s,>+~])\\.${name}(?![A-Za-z0-9_-])[^{;]*[{,]`).test(l);
    return new RegExp(`class:\\s*[\`"'][^\`"']*\\b${name}\\b`).test(l) || new RegExp(`classList\\.[a-z]+\\([\`"']${name}`).test(l);
  }
  return new RegExp(`^\\s*(?:async\\s+)?(?:static\\s+)?${name}\\s*\\(`).test(l)
    || new RegExp(`(?:function|const|let|var|class)\\s+${name}(?![A-Za-z0-9_$])`).test(l)
    || new RegExp(`^\\s*${name}\\s*[:=]\\s*(?:async\\s*)?(?:function|\\()`).test(l);
}

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
  const hits = [];
  for (const p of tracked) {
    if (!/^(src|test|scripts|mcp|figma\/binder)\/.*\.(js|mjs|css)$/.test(p)) continue;
    const lines = read(p);
    for (let i = 0; i < lines.length; i++) if (definesAt(p, lines[i], anchor)) hits.push(`${p}:${i + 1}`);
  }
  return hits;
}

// ---------- run ----------
// Judges every citation found on ONE doc line (`lines[i]`), against `resolveAndRead(cited)` ->
// `[target, targetLines]` (or `[null, null]` for NOFILE). Split out of runAudit() (#672 round 2,
// F3) so --selftest can drive this SAME verdict logic -- the real matcher and the real widen --
// over an in-memory fixture, instead of re-deriving `anchorsOf().some(...)` by hand on literal
// strings (which passed unchanged under a mutant that broke either one).
// ---------- #693: recurrence -- the citation's SUBJECT, and how rare an anchor is in the cited file ----------
// "Any anchor anywhere on the cited line" (#672) lets a code token that RECURS in the cited file
// validate a line that is not the citation's subject: component-inventory.md:118 cites
// `disabled (styles.css:188)` and later names `.on` for another clause, so a repoint 217 lines off
// onto a `.pane-toggle.on` rule read OK on `.on`. The fix binds each citation to its SUBJECT (the
// anchor the doc writes right against it) and, when a credible subject exists, stops a DIFFERENT
// anchor from validating the line on recurrence alone: that anchor must be RARE in the cited file
// (<= RARE lines) or the line must be its DEFINITION site. The subject itself always counts.
//
// RARE = 3 is the smallest value that catches the named exploit: a plain-word subject is credible
// only when rare (below), and `disabled` sits on exactly 3 lines of styles.css. Values 1..5 read
// the live docs identically (one genuine STALE, repaired) and move the drift catch rate by < 0.3pt,
// so the smallest sufficient value keeps "non-subject but rare" as narrow as possible.
const RARE = 3;

// The anchors a doc line binds to ONE citation (`form`, as written), by adjacency only:
//   - the anchor ending right before it, past `(`, backticks, commas, a call's own `(...)`, and
//     one connector (at/in/on): `disabled (styles.css:188)`, `` `render` :570 ``, `zoomBy()`, …;
//     then every anchor chained ahead of that one by `/` or `,`
//     (`` `_typeScaleFor("base")` / `_typeModeScales()` (drawer.js:47) ``: both are subjects);
//   - every anchor inside the citation's OWN parenthetical, which the doc uses to describe the
//     cited site (`` (`sections/color.js:1344`, `.ov` override state) ``);
//   - failing both, an anchor right after it across backticks/whitespace only
//     (`` `test/engine/tonal.mjs:246-264` `okhsl-modes` ``). A `)`, `,` or `;` ends the
//     citation's clause, so the next list item's anchor is never its subject.
// No subject => the citation keeps #672's any-anchor rule unchanged.
function subjectsOf(raw, form, anchors) {
  const out = new Set();
  const ends = (str, t) => str.endsWith(t) && !/[A-Za-z0-9_$.#-]$/.test(str.slice(0, str.length - t.length));
  for (let at = raw.indexOf(form); at !== -1; at = raw.indexOf(form, at + 1)) {
    let before = raw.slice(0, at).replace(/[\s`(,]*(?:\b(?:at|in|on)\s+[\s`(]*)?$/, "");
    for (;;) {
      before = before.replace(/\([^()]*\)$/, "");
      const hit = anchors.filter((a) => ends(before, a.startsWith(LIT) ? a.slice(LIT.length) : a)).sort((x, y) => y.length - x.length)[0];
      if (!hit) break;
      out.add(hit);
      const rest = before.slice(0, before.length - (hit.startsWith(LIT) ? hit.length - LIT.length : hit.length));
      const sep = rest.match(/[\s`]*[\/,][\s`]*$/);
      if (!sep) break;
      before = rest.slice(0, rest.length - sep[0].length);
    }
    // the citation's own parenthetical (`(`sections/color.js:1344`, `.ov` override state)`): every
    // anchor written inside the same group describes the same site, so it is a co-subject
    let open = -1;
    for (let j = at - 1, depth = 0; j >= 0; j--) {
      if (raw[j] === ")") depth++;
      else if (raw[j] === "(") { if (depth === 0) { open = j; break; } depth--; }
    }
    if (open !== -1) {
      let close = raw.length;
      for (let j = at + form.length, depth = 0; j < raw.length; j++) {
        if (raw[j] === "(") depth++;
        else if (raw[j] === ")") { if (depth === 0) { close = j; break; } depth--; }
      }
      const group = raw.slice(open + 1, at) + " " + raw.slice(at + form.length, close);
      for (const a of anchorsOf(group)) if (anchors.includes(a)) out.add(a);
    }
    if (out.size) continue;
    const after = raw.slice(at + form.length).replace(/^[\s`]*/, "");
    for (const a of anchors) {
      const t = a.startsWith(LIT) ? a.slice(LIT.length) : a;
      if (after.startsWith(t) && !/^[A-Za-z0-9_$-]/.test(after.slice(t.length))) out.add(a);
    }
  }
  return [...out];
}
// anchor -> number of lines of one cited file it occurs on (hasToken), memoized per file array
const FREQ = new WeakMap();
function freqIn(tl, a) {
  let m = FREQ.get(tl);
  if (!m) FREQ.set(tl, (m = new Map()));
  if (!m.has(a)) m.set(a, tl.reduce((k, l) => k + (hasToken(l, a) ? 1 : 0), 0));
  return m.get(a);
}
// A plain lowercase word bound as subject (`explicit (persist.js:291)`, `scope (model.mjs:57)`)
// is often English, not a symbol; it is only CREDIBLE when it is rare in the cited file and
// occurs on at least one code (non-comment) line there. `disabled` in styles.css passes (3 lines,
// `button:disabled`); `explicit` (comments only) and `map` (12 lines) do not.
const isComment = (l) => /^\s*(?:\/\/|\/\*|\*)/.test(l);
const indent = (l) => (l.trim() ? l.match(/^\s*/)[0].length : Infinity);
// The cited line plus each less-indented line above it: the chain of blocks enclosing the cited
// line. A citation INTO the body of its subject (`applyLoadedConfig (app.js:2345)`, eight lines
// under the method head) is a correct cite of a line that need not name the subject, so when a
// subject's definition is on this chain the citation falls back to the any-anchor rule.
function enclosingChain(tl, k) {
  const out = [tl[k - 1]];
  let cur = indent(tl[k - 1]);
  for (let j = k - 2; j >= 0 && cur > 0; j--) {
    const d = indent(tl[j]);
    if (d < cur) { out.push(tl[j]); cur = d; }
  }
  return out;
}
export function judgeLine(lines, i, implied, resolveAndRead) {
  const raw = lines[i], n = i + 1;
  const cites = parseCitations(raw, implied);
  if (!cites.length) return [];

  // Anchors normally come from just the citing line. Only when that line carries NO anchor of
  // its own do we widen to the enclosing prose paragraph -- a citation's subject can sit in the
  // previous (wrapped) sentence, e.g. app-shell.md:143 / :219, or component-inventory.md:44's
  // `app-helpers.mjs:370` citation, whose subject `switchControl` is named one line up (#672
  // round 3 owner ruling: unioning the WHOLE paragraph unconditionally, as round 2 did, was a
  // loosening the brief never asked for -- it let a citation's OWN unrelated anchors be diluted
  // by an adjacent bullet's anchors, e.g. a `.on` sitting in a different list item, and it made
  // anchorScope meaningless by mislabeling most single-line citations "paragraph"). Conditional
  // widening keeps the same "wider can only be more forgiving" invariant for the genuine
  // wrapped-sentence case while no longer touching a line that already stands on its own.
  let anchors = anchorsOf(raw);
  let anchorScope = "line";
  if (!anchors.length) {
    const para = [];
    for (let j = i; j >= 0 && lines[j].trim() !== ""; j--) para.push(lines[j]);
    for (let j = i + 1; j < lines.length && lines[j].trim() !== ""; j++) para.push(lines[j]);
    anchors = [...new Set(para.flatMap(anchorsOf))];
    if (anchors.length) anchorScope = "paragraph";
  }
  const rows = [];
  const resolved = cites.map((c) => (c.cited == null ? [null, null] : resolveAndRead(c.cited)));
  for (const [ci, c] of cites.entries()) {
    // a bare `:N` in a doc with no declared implied file: nothing to resolve against, and
    // guessing app.js would manufacture verdicts. UNDECIDABLE, a human must read it.
    if (c.cited == null) { rows.push({ line: n, form: c.form, list: c.list, cited: null, target: null, anchors, anchorScope, verdict: "UNDECIDABLE", detail: "bare :N and this doc declares no implied file (DOCS_IMPLIED)" }); continue; }
    const [target, tl] = resolved[ci];
    const base = { line: n, form: c.form, list: c.list, cited: c.cited, target, anchors, anchorScope };
    if (!target) { rows.push({ ...base, verdict: "NOFILE", detail: "cited path is not tracked" }); continue; }
    const homes = () => Object.fromEntries(anchors.map((a) => [a, homesOf(a).slice(0, 4)]).filter(([, h]) => h.length));
    const end = Math.min(c.end ?? c.n, tl.length);
    const cited = [];
    for (let k = c.n; k <= end; k++) cited.push(k);
    if (c.n > tl.length) { rows.push({ ...base, verdict: "STALE-PAST-EOF", detail: `${target} is ${tl.length} lines`, homes: homes() }); continue; }
    if (!anchors.length) { rows.push({ ...base, verdict: "UNDECIDABLE", detail: `${target}:${c.n} reads: ${tl[c.n - 1].trim() || "(blank)"}` }); continue; }
    // ANY anchor in scope satisfies the citation (#672 correction): the identifier-shape
    // restriction on `anchors` itself is what keeps a bare English word from qualifying, not
    // narrowing to one "nearest" anchor -- narrowing broke real multi-symbol and wrapped-line
    // citations (see the ANCHOR definition above). #693 narrows only the RECURRING case: when the
    // citation has a credible subject, a non-subject anchor counts only where it is rare in the
    // file or at its definition site (see RARE / subjectsOf above). A paragraph-widened citation
    // has no subject on its own line, so it keeps the plain rule.
    const w = WINDOW(target);
    const rare = (a) => freqIn(tl, a) <= RARE;
    const soft = (a) => /^[a-z][a-z0-9-]*$/.test(a);
    const credible = (a) => freqIn(tl, a) > 0 && (!soft(a) || (rare(a) && tl.some((l) => !isComment(l) && hasToken(l, a))));
    let subj = subjectsOf(raw, c.list ?? c.form, anchors).filter(credible);
    if (subj.length && c.n <= tl.length && enclosingChain(tl, c.n).some((l) => subj.some((a) => definesAt(target, l, a)))) subj = [];
    const hit = subj.length
      ? (l, a) => hasToken(l, a) && (subj.includes(a) || rare(a) || definesAt(target, l, a))
      : (l, a) => hasToken(l, a);
    const inRange = cited.find((k) => anchors.some((a) => hit(tl[k - 1], a)));
    if (inRange) {
      const matched = anchors.find((a) => hit(tl[inRange - 1], a));
      rows.push({ ...base, verdict: "OK", detail: `matched \`${matched.replace(LIT, "")}\` at ${target}:${inRange}` }); continue;
    }
    const near = [];
    for (let d = -w; d <= w + (end - c.n); d++) {
      const j = c.n - 1 + d;
      if (cited.includes(j + 1) || j < 0 || j >= tl.length) continue;
      const h = anchors.find((a) => hit(tl[j], a));
      if (h) near.push(`${target}:${j + 1} has \`${h.replace(LIT, "")}\` (${d > 0 ? "+" : ""}${d})`);
    }
    // name the demoted recurring anchor, so a reader sees WHY a line that contains an anchor failed
    const demoted = subj.length ? anchors.filter((a) => !subj.includes(a) && cited.some((k) => hasToken(tl[k - 1], a))) : [];
    const why = demoted.length ? ` (recurring non-subject ${demoted.map((a) => `\`${a.replace(LIT, "")}\` on ${freqIn(tl, a)} lines`).join(", ")} does not count; subject ${subj.map((a) => `\`${a.replace(LIT, "")}\``).join(", ")})` : "";
    rows.push({ ...base, verdict: near.length ? "NEAR" : "STALE-WRONG-LINE",
      detail: near.length ? near.slice(0, 3).join("; ") : `${target}:${c.n} reads: ${tl[c.n - 1].trim() || "(blank)"}${why}`,
      homes: near.length ? undefined : homes() });
  }
  return rows;
}

export function runAudit() {
const VALUES = canvasViewValues();
const report = { head: execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim(), canvasViewValues: VALUES, docs: {} };

const DOCS = discoverDocs();
report.audited = DOCS.length;
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

    rows.push(...judgeLine(lines, i, implied, (cited) => {
      const target = resolvePath(cited);
      return [target, target ? read(target) : null];
    }));
  }
  report.docs[doc] = { lines: lines.length, citations: rows, enumerations: enums };
}
return report;
}

const lineSet = (rows, pred) => new Set(rows.filter(pred).map((c) => c.line));
const STALE = (c) => c.verdict.startsWith("STALE");
// #672: NOFILE (a cite to an untracked path) fails the gate too, same as STALE -- a cite to a
// deleted/renamed file is exactly the same drift the STALE verdicts exist to catch. It stays its
// own verdict label in the report (NOFILE, never renamed to STALE); only the failing predicate
// folds the two together.
const FAILS = (c) => STALE(c) || c.verdict === "NOFILE";
// doc path -> sorted STALE/NOFILE doc-line numbers; the gate predicate is "every array empty".
export function staleLines(report) {
  return Object.fromEntries(Object.entries(report.docs).map(([doc, r]) => [doc, [...lineSet(r.citations, FAILS)].sort((a, b) => a - b)]));
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
    // a doc with NO declared implied file: the bare form still parses (so discovery sees it)
    // but carries a null target, which runAudit classifies UNDECIDABLE, never app.js
    ["see :836/837 for the tags", null, [[null, 836, 836], [null, 837, 837]]],
    ["`src/engine/tonal.js:283` memo", null, [["src/engine/tonal.js", 283, 283]]],
  ];
  let failed = 0;
  for (const [line, implied, want] of cases) {
    const got = parseCitations(line, implied).map((c) => [c.cited, c.n, c.end]);
    const ok = JSON.stringify(got) === JSON.stringify(want);
    if (!ok) failed++;
    console.log(`  ${ok ? "✓" : "✗"} parseCitations(${JSON.stringify(line)}) -> ${JSON.stringify(got)}${ok ? "" : ` (want ${JSON.stringify(want)})`}`);
  }

  // #672 negative control 1: a cite whose SYMBOL is absent from the cited line, but a generic
  // word from the citing sentence IS present there, must read STALE -- never OK/NEAR on the
  // strength of the generic word. This is the exact shape of the reported bug: a
  // `tonal.js:335` cite for `_okL` aimed at the wrong line passed because "domain" (or here,
  // "at") also occurred on that line. Checked two ways: the loose word must never even become
  // an anchor, and the real symbol's absence must drive the verdict to STALE.
  {
    const docLine = "the real subject is `_okL`, but this text is aimed at :200 for no reason";
    const anchors = anchorsOf(docLine);
    const looseWordAnchored = anchors.some((a) => a === "at" || a === "aimed" || a === "for");
    console.log(`  ${!looseWordAnchored ? "✓" : "✗"} anchorsOf() rejects a generic word ahead of a bare :N citation (got ${JSON.stringify(anchors)})`);
    if (looseWordAnchored) failed++;

    // the wrong cited line contains the generic word ("at") the pre-#672 any-word predicate
    // would have matched on; none of the (identifier-only) anchors can match it, which is what
    // drives runAudit()'s verdict to STALE-WRONG-LINE (or NEAR, if within WINDOW; either way
    // never OK).
    const wrongCitedLine = "there is nothing here at all related to the topic";
    const staleUnderPredicate = !anchors.some((a) => hasToken(wrongCitedLine, a));
    console.log(`  ${staleUnderPredicate ? "✓" : "✗"} no anchor matches the wrong line (drives STALE), though it contains "at" (anchors: ${JSON.stringify(anchors)})`);
    if (!staleUnderPredicate) failed++;

    // the real symbol must still match its own, correct line -- the fix must not overcorrect
    // into rejecting a genuinely right citation.
    const rightCitedLine = "function _okL(x) { return x.L; }";
    const okUnderPredicate = anchors.some((a) => hasToken(rightCitedLine, a));
    console.log(`  ${okUnderPredicate ? "✓" : "✗"} the real symbol \`_okL\` still matches its own line (anchors: ${JSON.stringify(anchors)})`);
    if (!okUnderPredicate) failed++;
  }

  // #672 follow-up (lead's ruling on the live audit): a first fix draft narrowed matching to the
  // ONE anchor nearest a citation's position (or the first anchor once the scope widened to the
  // paragraph). That broke real, correct citations -- caught by hand-reading the "68 STALE"
  // false positives the narrowed binder produced against the live docs. Cases (a)/(b) below
  // drive the REAL gate function, `judgeLine()` (round 2, F3: the reviewer mutation-tested a
  // hand-rolled `anchorsOf(...).some(...)` version of these and found it survived a
  // `[anchors[0]]` matcher mutant, and case (b) hand-built its own paragraph anchor set instead
  // of letting the widen produce it, so it survived the widen being deleted too). Both mutants
  // are proven red against these two cases, then green again, as part of this unit's own
  // verification (not re-run here -- selftest only needs to pass against the real code).

  // (a) two symbols named before ONE shared citation, slash-separated, where each citation's
  // cited line holds a DIFFERENT one and the anchor nearest each citation's position is the
  // WRONG one for it. A nearest-anchor binder picks `paneToggle`/`toggleLeftPane` respectively
  // and misses both; `[anchors[0]]` (always the first-seen anchor) also misses the second.
  {
    const docLines = ["collapse: `toggleLeftPane`/`toggleRightPane` :11 / `paneToggle` :12"];
    const fixtureSource = [
      ...Array(10).fill("// filler"),
      "toggleLeftPane() { this.panesLeft = !this.panesLeft; this.render(); }",
      "toggleRightPane() { this.panesRight = !this.panesRight; this.render(); }",
    ];
    const rows = judgeLine(docLines, 0, "fixture-target.js", () => ["fixture-target.js", fixtureSource]);
    const v1 = rows.find((r) => r.form === ":11")?.verdict, v2 = rows.find((r) => r.form === ":12")?.verdict;
    const ok = v1 === "OK" && v2 === "OK";
    console.log(`  ${ok ? "✓" : "✗"} judgeLine() matches each citation on its OWN correct anchor, not the nearest/first one (got :11=${v1}, :12=${v2})`);
    if (!ok) failed++;
  }

  // (b) the cited symbol sits on the PREVIOUS doc line (a wrapped sentence), and the citing line
  // itself carries no anchor at all (only the citation form), so judgeLine() must widen to the
  // enclosing paragraph and pick up `switchControl` from the line above.
  {
    const docLines = [
      "(`.toggle`) are built on real buttons with ARIA roles (`switchControl`,",
      "`fixture-target.js:1`), so they keep focus.",
    ];
    const fixtureSource = ["export const switchControl = ({ on, onToggle, label, ariaLabel }) =>"];
    const rows = judgeLine(docLines, 1, null, (cited) => [cited, fixtureSource]);
    const verdict = rows[0]?.verdict;
    console.log(`  ${verdict === "OK" ? "✓" : "✗"} judgeLine() widens to the paragraph when the citing line has NO anchor of its own (got ${verdict})`);
    if (verdict !== "OK") failed++;
  }

  // (b2) #672 round 3 owner ruling: the widen must be CONDITIONAL, not unconditional. Same shape
  // as (b), but the citing line now carries its OWN anchor (`segmented`, from the adjacent
  // `app.js:1587` citation) -- so it must judge on ONLY that anchor and must NOT reach across to
  // the previous line's `switchControl` just because the paragraph happens to contain it. A
  // wrong-line citation whose correct symbol sits only on the previous line must read STALE.
  {
    const docLines = [
      "(`.toggle`, `segmented()`) are built on real buttons with ARIA roles (`switchControl`,",
      "`fixture-target.js:1`; `segmented`, `app.js:1587`), so they keep focus.",
    ];
    const fixtureSource = ["export const switchControl = ({ on, onToggle, label, ariaLabel }) =>"];
    const rows = judgeLine(docLines, 1, null, (cited) => [cited, fixtureSource]);
    const verdict = rows[0]?.verdict;
    console.log(`  ${verdict === "STALE-WRONG-LINE" ? "✓" : "✗"} judgeLine() does NOT widen when the citing line already has its own anchor (got ${verdict})`);
    if (verdict !== "STALE-WRONG-LINE") failed++;
  }

  // (c) a comma-separated symbol list: same shape as (a), the other separator the ticket named.
  {
    const docLine = "wired via `onCancel`, `onSave` :204 in the same dialog handler";
    const anchors = anchorsOf(docLine);
    const citedLine204 = "function onCancel() { this.dialog.close(); }";
    const ok = anchors.some((a) => hasToken(citedLine204, a));
    console.log(`  ${ok ? "✓" : "✗"} a comma-separated symbol pair matches on the FAR (not nearest) anchor \`onCancel\` (anchors: ${JSON.stringify(anchors)})`);
    if (!ok) failed++;
  }

  // (d) a plain lowercase, non-call identifier that IS backticked as the citation's own subject
  // (`` `render` :570 ``) must still anchor, even though it fails camelCase/PascalCase/snake_case
  // and has no parens: found live, post-fix, in docs/lld/app-shell.md (the audit's lone real
  // STALE-WRONG-LINE after cases a-c landed). The backtick is the author's own "this is code"
  // signal; requiring the shape check on it too over-corrected the ticket's real fix.
  {
    const docLine = "| **LLD-C1** | Root element / view fork | `render` :570 | SPEC-R9 (gallery) + SPEC-R10 (editor) |";
    const anchors = anchorsOf(docLine);
    const renderAnchored = anchors.includes("render");
    console.log(`  ${renderAnchored ? "✓" : "✗"} a backticked lowercase, non-call subject \`render\` still anchors (got ${JSON.stringify(anchors)})`);
    if (!renderAnchored) failed++;
    // and the ticket's real win survives: a bare (non-backticked) generic word still must not.
    const stillRejectsBareProse = !anchorsOf("this text is aimed at :200 for no reason").includes("at");
    console.log(`  ${stillRejectsBareProse ? "✓" : "✗"} a bare (non-backticked) generic word still does not anchor`);
    if (!stillRejectsBareProse) failed++;
  }

  // #672 round 3: a selector anchor whose bare form is an English stopword must not match a
  // bare, unquoted occurrence of that word -- component-inventory.md:181's exact exploit shape,
  // reproduced by the reviewer: `.on` matching a focus-trap comment ("...on open ... on close")
  // 144 lines off the real target. hasToken() stripping the leading `.` before matching is what
  // let this through; the fix requires the dot (a real CSS compound selector) or a quoted string
  // (this codebase's JS/hyperscript class-name shape) to be literally present.
  {
    const docLine = "active = `.on` (`fixture-target.js:1`).";
    const anchors = anchorsOf(docLine);
    const wrongLineProse = ["// showModal() moves focus into the dialog on open and the browser traps Tab there; on close"];
    const exploitVerdict = judgeLine([docLine], 0, null, (cited) => [cited, wrongLineProse])[0]?.verdict;
    console.log(`  ${exploitVerdict !== "OK" ? "✓" : "✗"} a selector anchor's stopword bare form does not match bare unquoted prose (got ${exploitVerdict}, anchors: ${JSON.stringify(anchors)})`);
    if (exploitVerdict === "OK") failed++;

    const cssSite = ["  .segmented button.on {"];
    const cssVerdict = judgeLine([docLine], 0, null, (cited) => [cited, cssSite])[0]?.verdict;
    console.log(`  ${cssVerdict === "OK" ? "✓" : "✗"} the same selector anchor still matches a real CSS compound selector (got ${cssVerdict})`);
    if (cssVerdict !== "OK") failed++;

    const jsSite = ['          class: on ? "on" : "",'];
    const jsVerdict = judgeLine([docLine], 0, null, (cited) => [cited, jsSite])[0]?.verdict;
    console.log(`  ${jsVerdict === "OK" ? "✓" : "✗"} the same selector anchor still matches a quoted JS class-name site (got ${jsVerdict})`);
    if (jsVerdict !== "OK") failed++;
  }

  // #694 critic review item 1: the identifier-shape floor on the two BARE forms (`name :N`,
  // `name(`) had no selftest that bit ALONE -- every existing bare-word control used a STOPWORD
  // (`at`), so a mutant that broke only the shape check (M1: `add(name)` unconditionally instead
  // of `hugged || /[A-Z_]/.test(name)`) or only the STOPWORDS check (M5: drop
  // `if (STOPWORDS.has(...)) continue;` on both bare-form loops) still passed every prior case --
  // a STOPWORDS hit and a failed shape check produce the same "not added" result when both guards
  // are intact, so no case told the two apart. These three cases use a NON-stopword plain English
  // word to isolate M1, and a stopword deliberately shaped/hugged to slip past a dropped STOPWORDS
  // check to isolate M5, one per bare-form site.
  {
    // pins M1 alone: "domain" is not a stopword, so STOPWORDS never rejects it -- only the shape
    // check (identifier-shaped or hugged) does. M1's unconditional `add(name)` would add it.
    const docLine = "the `_okL` memo is aimed at domain :216";
    const anchors = anchorsOf(docLine);
    const ok = JSON.stringify(anchors) === JSON.stringify(["_okL"]);
    console.log(`  ${ok ? "✓" : "✗"} a non-stopword bare word ahead of \`:N\` (\`domain\`) does not anchor -- pins M1 (got ${JSON.stringify(anchors)})`);
    if (!ok) failed++;

    // pins M5 on the `name :N` site: "the" IS a stopword, but it is backtick-hugged
    // (`` `the`:200 ``), which alone satisfies the shape check's OR branch. With STOPWORDS
    // intact, "the" is rejected before the shape/hug check ever runs, so M1 alone cannot reopen
    // this case -- only dropping STOPWORDS (M5) can. Asserts the EXACT anchor set, not just
    // includes/excludes, so a mutant that added some OTHER stray anchor alongside "the" would
    // still be caught.
    const hugLine = "the subject is `_okL` here, though `the`:200 is not it";
    const hugAnchors = anchorsOf(hugLine);
    const hugOk = JSON.stringify(hugAnchors) === JSON.stringify(["_okL"]);
    console.log(`  ${hugOk ? "✓" : "✗"} a hugged stopword before \`:N\` (\`the\`:200) does not anchor -- pins M5's \`name :N\` site (got ${JSON.stringify(hugAnchors)})`);
    if (!hugOk) failed++;

    // pins M5 on the `name(` site: "only" IS a stopword, and it is backtick-hugged immediately
    // before the `(` (`` `only` (`test/…:246-264` for details) ``), which alone satisfies the
    // `(` form's shape-or-hug OR branch (PR #694 item 2 closed the OLD hole here -- a bare,
    // unhugged, unshaped word whose own parenthetical merely contained a citation -- so a plain
    // "only (test/…)" no longer even reaches the hug check; it must be hugged to test M5 at all).
    // With STOPWORDS intact, "only" is rejected before the hug check ever runs, so the #672
    // item-2 shape-or-hug floor alone cannot reopen this case -- only dropping STOPWORDS (M5) can.
    // Asserts the exact anchor set, same reasoning as hugOk above.
    const parenLine = "explanation `only` (`test/engine/tonal.mjs:246-264` for details), plus `_okL` details";
    const parenAnchors = anchorsOf(parenLine);
    const parenOk = JSON.stringify(parenAnchors) === JSON.stringify(["_okL"]);
    console.log(`  ${parenOk ? "✓" : "✗"} a hugged stopword before \`(\` (\`\`only\`\` (\`test/…:246-264\`…)) does not anchor -- pins M5's \`name(\` site (got ${JSON.stringify(parenAnchors)})`);
    if (!parenOk) failed++;
  }

  // PR #694 critic review item 2 (owner-ruled 2026-09-19: fix in this PR): a plain word before a
  // parenthesised citation must not anchor merely because its OWN parenthetical happens to hold a
  // citation -- #672's exact bug, reopened for the `word (cite)` shape. Reproduces the critic's
  // two live exploit strings verbatim, plus a positive control proving the real convention
  // (`segmented (styles.css:869-870)`, kept working by backtick-hugging the subject in the doc,
  // see the same-commit doc diff) still anchors once hugged.
  {
    // exploit 1: "domain" sits next to a citation-bearing paren but is neither shaped nor hugged.
    const docLine = "the `_okL` memo covers the lift domain (`src/engine/tonal.js:216`)";
    const anchors = anchorsOf(docLine);
    const ok = JSON.stringify(anchors) === JSON.stringify(["_okL"]);
    console.log(`  ${ok ? "✓" : "✗"} a plain word before a citation-bearing paren does not anchor merely because its parenthetical holds a citation (got ${JSON.stringify(anchors)})`);
    if (!ok) failed++;

    // exploit 2: the critic's minimal reproduction -- no OTHER anchor on the line at all, so the
    // old rule's only path to "OK" was the bare word itself; the fixed set must be empty.
    const bareLine = "guarantee (`src/engine/tonal.js:216`)";
    const bareAnchors = anchorsOf(bareLine);
    const bareOk = bareAnchors.length === 0;
    console.log(`  ${bareOk ? "✓" : "✗"} \`anchorsOf("guarantee (\`src/engine/tonal.js:216\`)")\` yields no anchor at all (got ${JSON.stringify(bareAnchors)})`);
    if (!bareOk) failed++;

    // positive control: the same shape, backtick-hugged, still anchors -- the fix is a floor, not
    // a ban on this citation form.
    const huggedLine = "no self-margin, the parent owns spacing: `segmented` (`styles.css:869-870`)";
    const huggedAnchors = anchorsOf(huggedLine);
    const huggedOk = huggedAnchors.includes("segmented");
    console.log(`  ${huggedOk ? "✓" : "✗"} a backtick-hugged word before the same shape still anchors (got ${JSON.stringify(huggedAnchors)})`);
    if (!huggedOk) failed++;
  }

  // #693: a code token that RECURS in the cited file must not validate a line that is not the
  // citation's subject. The review's exploit, in miniature: component-inventory.md:118 cites
  // `disabled (styles.css:188)`, and the same doc line names `.on` for a later clause. Repointed
  // 41 lines off (the live one was 217), the cite lands on a `.pane-toggle.on` rule under a comment
  // reading "accented via .on", and the pre-#693 any-anchor matcher read it OK on `.on`. `.on`
  // occurs on 6 lines of the fixture (> RARE) and is not the citation's subject, so it is demoted;
  // the subject `disabled` is nowhere within WINDOW, so the verdict is STALE.
  const css = Array.from({ length: 60 }, () => "/* filler */");
  css[9] = "button:disabled, button[disabled] {";
  for (const k of [29, 31, 33, 35]) css[k] = ".chip.on { color: red; }";
  css[49] = "/* pane-collapse toggles (accented via .on); once collapsed they pop to the header */";
  css[50] = ".pane-toggle.on { color: blue; }";
  const cssRead = (cited) => [cited, css];
  {
    // "disabled" is backtick-hugged (PR #694 item 2: an unhugged, unshaped bare word ahead of
    // `(` no longer anchors at all, so the fixture must match the live doc's own repin of this
    // exact convention -- component-inventory.md's `` `disabled` (`styles.css:188`) `` row).
    const docLine = (n) => `\`disabled\` (\`fixture.css:${n}\`) · toggle-pressed (\`.on\` + \`aria-pressed\`)`;
    const exploit = judgeLine([docLine(51)], 0, null, cssRead)[0]?.verdict;
    console.log(`  ${exploit === "STALE-WRONG-LINE" ? "✓" : "✗"} #693 a recurring non-subject token (\`.on\`) does not validate a wrong cite 41 lines off its subject \`disabled\` (got ${exploit})`);
    if (exploit !== "STALE-WRONG-LINE") failed++;
    const right = judgeLine([docLine(10)], 0, null, cssRead)[0]?.verdict;
    console.log(`  ${right === "OK" ? "✓" : "✗"} #693 positive control: the same doc line citing the real \`button:disabled\` rule still reads OK (got ${right})`);
    if (right !== "OK") failed++;
    // the recurring token IS the subject here (`active = .on (…)`), cited at one of its real sites:
    // recurrence alone must never flag a correct citation
    const recurring = judgeLine(["active = `.on` (`fixture.css:32`)"], 0, null, cssRead)[0]?.verdict;
    console.log(`  ${recurring === "OK" ? "✓" : "✗"} #693 positive control: a correct cite whose subject legitimately recurs (\`.on\`, 6 lines) still reads OK (got ${recurring})`);
    if (recurring !== "OK") failed++;
  }
  // The four live shapes a first #693 draft misread as STALE (all correct citations, read by hand
  // in 02-sections-and-resolvers.md:27, 04-context-and-messaging.md:61, 03-stores-and-persistence.md:38,
  // component-inventory.md:244): a slash-joined subject pair, a cite INSIDE the subject's own body, a
  // prose word bound as the subject by the `word (cite)` shape, and a descriptor written inside the
  // citation's own parenthetical. Each is pinned so that removing its rule reds this selftest.
  {
    const js = [
      "class X {",
      "  _typeScaleFor(k) { return k; }",
      "  a() { this._typeScaleFor(\"x\"); }",
      "  b() { this._typeScaleFor(\"y\"); }",
      "  c() { this._typeScaleFor(\"z\"); }",
      "  d() { this._typeScaleFor(\"w\"); }",
      "  _typeModeScales() { return 1; }",
      "  // an explicit note, in a comment only",
      "  e() { return 0; }",
      "  applyLoadedConfig(config) {",
      "    if (!config) return;",
      "    this.view = \"x\";",
      "    this.render();",
      "    this.flag = 1;",
      "    this._loadRequested = false;",
      "  }",
      "  f() { this._loadRequested = true; }",
      "  g() { this._loadRequested = true; }",
      "  h() { this._loadRequested = true; }",
      "  i() { return this.view === \"editor\"; }",
      "  j() { return \"cell ov\"; }",
      "  k() { return \"cell ov\"; }",
      "  l() { return \"chip ov\"; }",
      "  m() { return \"input ov\"; }",
      "}",
    ];
    const jsRead = (cited) => [cited, js];
    const cases2 = [
      ["a slash-joined subject pair binds BOTH names", "- Exports: `_typeScaleFor(\"base\")` / `_typeModeScales()` (`fixture.js:5`)."],
      ["a cite inside the subject's own body falls back to any anchor", "reset by `applyLoadedConfig` (`fixture.js:15`) on any exit path, clearing `_loadRequested`"],
      ["a prose word seen only in comments is not a credible subject", "The file is explicit (`fixture.js:15`) about `_loadRequested`."],
      ["an anchor inside the citation's own parenthetical is a co-subject", "free-text token editor (`fixture.js:24`, `.ov` override state)."],
    ];
    for (const [what, docLine] of cases2) {
      const v = judgeLine([docLine], 0, null, jsRead)[0]?.verdict;
      console.log(`  ${v === "OK" ? "✓" : "✗"} #693 positive control: ${what} (got ${v})`);
      if (v !== "OK") failed++;
    }
  }

  // #672 negative control 2: a NOFILE verdict must fail the gate (exit 1) unless the doc itself
  // is exempt -- checked directly against staleLines(), the single choke point both this
  // script's own exit code and test/repo/citations.mjs's FAIL loop read.
  {
    const fakeReport = { docs: { "docs/fake-for-selftest.md": { citations: [
      { line: 7, verdict: "NOFILE" },
      { line: 12, verdict: "OK" },
    ] } } };
    const failing = staleLines(fakeReport)["docs/fake-for-selftest.md"];
    const nofileFails = Array.isArray(failing) && failing.includes(7) && !failing.includes(12);
    console.log(`  ${nofileFails ? "✓" : "✗"} staleLines() fails a NOFILE line (exit 1) and leaves an OK line alone (got ${JSON.stringify(failing)})`);
    if (!nofileFails) failed++;
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
if (stale && !process.argv.includes("--json")) console.log(`✗ ${stale} STALE/NOFILE citation line(s); exit 1`);
process.exit(stale ? 1 : 0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
