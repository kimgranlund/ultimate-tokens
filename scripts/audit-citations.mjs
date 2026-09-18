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
//               writes as a call (`name(`), or the citation's own subject written as
//               `name :N` -- backticked (`` `render` :570 ``) or, if fully bare with no
//               backtick anywhere before the number, required to itself be
//               camelCase/PascalCase/snake_case (#672). A FULLY BARE lowercase English
//               word is NOT an anchor -- that restriction, not "which one anchor wins", is
//               #672's actual fix: a `tonal.js:335` cite for `_okL` no longer passes on a
//               same-line prose word like "domain".
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
  const spans = [...docLine.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  for (const raw of spans) {
    // a code FRAGMENT (a CSS declaration, a JS expression) is matched literally: the
    // doc claims this exact text lives at the cited line.
    const frag = raw.trim();
    if (/[:;=]/.test(frag) && /\s/.test(frag) && !new RegExp(`\\.(?:${EXT}):\\d`).test(frag)) out.add(LIT + frag);
    const s = raw.replace(new RegExp(`[A-Za-z0-9_@./-]+\\.(?:${EXT}):\\d+`, "g"), (mm) => " ".repeat(mm.length));
    for (const t of s.matchAll(/(?<![A-Za-z0-9_$.#])[.#]?[A-Za-z_$][A-Za-z0-9_$-]*/g)) {
      const tok = t[0];
      const bare = tok.replace(/^[.#]/, "");
      const isSelector = /^[.#]/.test(tok);
      const isCamel = /[A-Z]/.test(bare);
      const isCall = new RegExp(`${bare.replace(/[-]/g, "\\$&")}\\s*\\(`).test(s);
      if (isSelector || isCamel || isCall) add(tok);
    }
  }
  // `name :N` / `name(` outside backticks too -- the component table's own shape. This `:N`
  // heuristic has no punctuation/call signal of its own to lean on, so a FULLY BARE name (no
  // backtick anywhere between it and the number) must be camelCase/PascalCase/snake_case itself
  // (`/[A-Z_]/`) -- otherwise ANY bare English word immediately ahead of a bare `:N` citation
  // (the doc's own "aimed at :200" prose, not a symbol) anchored it, which is how a wrong-line
  // citation could pass on a generic word instead of the cited symbol (#672).
  // A name with a backtick in the gap before the number (`` `render` :570 ``) is exempted from
  // that shape check: the backtick is the author's own signal that this is code, not prose, and
  // requiring camelCase there too wrongly stales a correct, plain-lowercase, backticked function
  // name (found via the live audit after the #672 fix landed -- `render` :570 in app-shell.md).
  for (const m of docLine.matchAll(/(?<![A-Za-z0-9_$.])([A-Za-z_$][A-Za-z0-9_$]*)([\s`]*):\d{2,4}/g))
    if (m[2].includes("`") || /[A-Z_]/.test(m[1])) add(m[1]);
  for (const m of docLine.matchAll(/(?<![A-Za-z0-9_$.])([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g)) add(m[1]);
  return [...out];
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const hasToken = (line, anchor) => {
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
      // a bare `:N` in a doc with no declared implied file: nothing to resolve against, and
      // guessing app.js would manufacture verdicts. UNDECIDABLE, a human must read it.
      if (c.cited == null) { rows.push({ line: n, form: c.form, list: c.list, cited: null, target: null, anchors, anchorScope, verdict: "UNDECIDABLE", detail: "bare :N and this doc declares no implied file (DOCS_IMPLIED)" }); continue; }
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
      // ANY anchor in scope satisfies the citation (#672 correction): the identifier-shape
      // restriction on `anchors` itself is what keeps a bare English word from qualifying, not
      // narrowing to one "nearest" anchor -- narrowing broke real multi-symbol and wrapped-line
      // citations (see the ANCHOR definition above).
      const inRange = cited.find((k) => anchors.some((a) => hasToken(tl[k - 1], a)));
      if (inRange) {
        const matched = anchors.find((a) => hasToken(tl[inRange - 1], a));
        rows.push({ ...base, verdict: "OK", detail: `matched \`${matched.replace(LIT, "")}\` at ${target}:${inRange}` }); continue;
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
  // false positives the narrowed binder produced against the live docs. Each case here is
  // checked against the ANY-anchor matching runAudit() actually uses (anchorsOf() + hasToken()
  // over the whole anchor set), never a single picked anchor.

  // (a) two symbols named before ONE shared citation, slash-separated, where the cited line
  // holds the FIRST one and the NEARER backtick belongs to a different, correct citation
  // elsewhere on the same line. A nearest-anchor binder picks `toggleRightPane` and misses.
  {
    const docLine = "collapse: `toggleLeftPane`/`toggleRightPane` :1448 / `paneToggle` :1458";
    const anchors = anchorsOf(docLine);
    const citedLine1448 = "toggleLeftPane() { this.panesLeft = !this.panesLeft; this.render(); }";
    const ok = anchors.some((a) => hasToken(citedLine1448, a));
    console.log(`  ${ok ? "✓" : "✗"} a slash-separated symbol pair matches on the FAR (not nearest) anchor \`toggleLeftPane\` (anchors: ${JSON.stringify(anchors)})`);
    if (!ok) failed++;
  }

  // (b) the cited symbol sits on the PREVIOUS doc line (a wrapped sentence); the citing line
  // itself carries no anchor at all (only the citation form), so runAudit() widens to the
  // enclosing paragraph -- and every anchor collected there, not just the first, must be tried.
  {
    // the earlier `.toggle`/`segmented()` anchors are the decoy: a "first anchor in scope"
    // binder picks `.toggle` here and misses, even though `switchControl` (later in the same
    // paragraph) is the real, correct symbol.
    const prevLine = "(`.toggle`, `segmented()`) are built on real buttons with ARIA roles (`switchControl`,";
    const citingLine = "`app-helpers.mjs:370`; `segmented`, `app.js:1587`), so they keep focus.";
    const lineAnchors = anchorsOf(citingLine);
    console.log(`  ${lineAnchors.length === 0 ? "✓" : "✗"} the citing line alone carries no anchor, forcing the paragraph widen (got ${JSON.stringify(lineAnchors)})`);
    if (lineAnchors.length !== 0) failed++;
    const paraAnchors = [...new Set([...lineAnchors, ...anchorsOf(prevLine)])];
    const citedLine370 = "export const switchControl = ({ on, onToggle, label, ariaLabel }) =>";
    const ok = paraAnchors.some((a) => hasToken(citedLine370, a));
    console.log(`  ${ok ? "✓" : "✗"} the wrapped-sentence symbol \`switchControl\` still matches, not just the first paragraph anchor (anchors: ${JSON.stringify(paraAnchors)})`);
    if (!ok) failed++;
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
