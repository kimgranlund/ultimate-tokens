#!/usr/bin/env node
// roadmap-gen.mjs: generates .sdlc/roadmap.md from one read of the repo's mutable state, and verifies it.
//
// Owner ruling R18 (plan records-followup, U14): the roadmap is rebuilt so that every cell is the output
// of a command recorded beside it. The file has two parts:
//   1. a snapshot: every mutable input (refs, worktrees, reflogs, open issues, open PRs) read ONCE, between
//      two recorded instants, each block the stdout of the command printed above it;
//   2. tables: every cell is the stdout of its column's sh command, run with the snapshot blocks as
//      variables. Those commands address git objects by sha, never by ref name, so they print the same
//      thing at any later time.
// Nothing in a table is typed by hand. `--verify` re-renders the file from its own snapshot and compares
// byte for byte, which is how the legend holds by construction rather than by inspection.
//
//   node .sdlc/scripts/roadmap-gen.mjs --out <path> --ticket 709 --by "<plan unit>"   read now, write <path>
//   node .sdlc/scripts/roadmap-gen.mjs --verify <path>                                re-render, compare
//   node .sdlc/scripts/roadmap-gen.mjs --out <path> --rerender <commit>                render <commit>'s
//        roadmap snapshot again, with no new read: the snapshot blocks are copied unchanged, so GENERATOR
//        still names the blob that read, and the RENDER block names the blob that rendered
//
// Writing .sdlc/roadmap.md itself also needs --final, and --final refuses unless the running generator is
// the one committed at HEAD, so the renderer blob the file names is the code that produced it.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const EM = "\u2014";
const EM_TEXT = "<U+2014>";
const BANNED = [new RegExp("NON" + "OUN"), new RegExp("non" + "oun\\.io"), new RegExp("non" + "oun-color-tokens")];
const FENCE = "```";
const LIMIT = 500;

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const flag = (name) => args.includes(name);

function die(code, msg) { process.stderr.write(`roadmap-gen: ${msg}\n`); process.exit(code); }

const TOP = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();

// Run one sh command. `env` carries the snapshot blocks; stdout comes back without its final newline, the
// way `$(...)` would return it.
function sh(cmd, env = {}) {
  try {
    const out = execFileSync("/bin/sh", ["-c", cmd], {
      cwd: TOP, encoding: "utf8", maxBuffer: 64 << 20, stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, LC_ALL: "C", GIT_PAGER: "cat", ...env },
    });
    return out.replace(/\n+$/, "");
  } catch (e) {
    die(2, `command failed (exit ${e.status}):\n${cmd}\n${e.stderr || ""}`);
  }
}

// ---------------------------------------------------------------------------------------------------------
// The read. Every block below is one command; nothing else in the generation reads mutable state.

const ROOT_SED = `sed "s#^worktree $(git rev-parse --path-format=absolute --git-common-dir | sed 's#/\\.git$##')#worktree <ROOT>#"`;
const READS = [
  ["HEAD", "git symbolic-ref -q HEAD; git rev-parse HEAD"],
  ["GENERATOR", "git hash-object .sdlc/scripts/roadmap-gen.mjs"],
  ["REFS", "git for-each-ref --format='%(objectname) %(refname)' refs/heads/main refs/remotes/origin/main refs/heads/plan/"],
  ["WORKTREES", `git worktree list --porcelain | ${ROOT_SED}`],
  ["REFLOG", "{ git for-each-ref --format='%(refname)' refs/heads/main refs/remotes/origin/main refs/heads/plan/; git worktree list --porcelain | sed -n 's/^branch //p'; } | sort -u | while read -r r; do git reflog show --date=iso-strict --format='%H %gd %gs' -n 1 \"$r\"; done"],
  ["ISSUES", `gh issue list --state open --limit ${LIMIT} --json number,createdAt,labels,title --jq '.[] | [.number, .createdAt, ([.labels[].name] | join(",")), .title] | @tsv' | sort -n`],
  ["PRS", `gh pr list --state open --limit ${LIMIT} --json number,isDraft,createdAt,headRefName,headRefOid,closingIssuesReferences,title --jq '.[] | [.number, .isDraft, .createdAt, .headRefName, .headRefOid, ([.closingIssuesReferences[].number | tostring] | join(",")), .title] | @tsv' | sort -n`],
];
const INSTANT_CMD = "date -u +%Y-%m-%dT%H:%M:%SZ";

// The read must agree with itself: every ref's newest reflog entry names the sha the ref and worktree reads
// saw. If a ref moved between those commands, the snapshot is not one state. A live read writes nothing
// then; --verify and --rerender refuse a snapshot that fails it.
function checkAgreement(snap) {
  const top = new Map();
  for (const line of snap.REFLOG.split("\n")) {
    const m = /^([0-9a-f]{40}) (.+)@\{/.exec(line);
    if (m) top.set(m[2], m[1]);
  }
  const shortOf = (ref) => ref.replace(/^refs\/heads\//, "").replace(/^refs\/remotes\//, "");
  for (const line of snap.REFS.split("\n")) {
    const [sha, ref] = line.split(" ");
    if (top.has(shortOf(ref)) && top.get(shortOf(ref)) !== sha) die(3, `${ref} moved during the read (${sha} vs reflog ${top.get(shortOf(ref))})`);
  }
  let head = null;
  for (const line of snap.WORKTREES.split("\n")) {
    if (line.startsWith("HEAD ")) head = line.slice(5);
    if (line.startsWith("branch ")) {
      const b = shortOf(line.slice(7));
      if (top.has(b) && top.get(b) !== head) die(3, `${b} moved during the read (${head} vs reflog ${top.get(b)})`);
    }
  }
}

function readLive() {
  const snap = {};
  const t0 = sh(INSTANT_CMD);
  for (const [k, cmd] of READS) snap[k] = sh(cmd);
  const t1 = sh(INSTANT_CMD);
  snap.INSTANT = `${t0}\n${t1}`;
  checkAgreement(snap);
  if (snap.ISSUES.split("\n").length >= LIMIT || snap.PRS.split("\n").length >= LIMIT) die(3, `gh returned ${LIMIT} rows; raise LIMIT`);
  return snap;
}

// ---------------------------------------------------------------------------------------------------------
// The tables. Each column is [header, sh command]. Commands see the snapshot blocks as variables, plus
// HEADSHA, SRCSHA, ROWS (the rows command's output) and ROW (one line of it).

const LABELS = `printf '%s\\n' "$ISSUES" | awk -F'\\t' -v n="$ROW" '$1==n {print $3}' | tr , '\\n'`;
const PARA = (field) => `printf '%s\\n' "$WORKTREES" | awk -v w="worktree <ROOT>/$ROW" '$0==w {f=1; next} /^worktree / {f=0} f && /^${field} / {sub(/^${field} /, ""); print}'`;
const WT_SHA = `SHA=$(${PARA("HEAD")})`;
const WT_BRANCH = `B=$(${PARA("branch")} | sed 's#^refs/heads/##')`;
// head, and the commit checked out when the Snapshot was read, which carries this branch's own records.
const QREFS = `{ printf '%s refs/remotes/origin/main\\n' "$HEADSHA"; printf '%s %s\\n' "$SRCSHA" "$(printf '%s\\n' "$HEAD" | sed -n '1{/^refs\\//p;}' | grep . || echo HEAD)"; }`;
const COMMIT_COLS = [
  ["Commit", `printf '%s\\n' "$ROW" | cut -c1-8`],
  ["Date", `git show -s --format=%cs "$ROW"`],
  ["Subject", `git show -s --format=%s "$ROW"`],
];
const WORKTREE_COLS = [
  ["Worktree", `printf '\\140%s\\140\\n' "$ROW"`],
  ["Branch", `${PARA("branch")} | sed 's#^refs/heads/##'`],
  ["Head", `${PARA("HEAD")} | cut -c1-8`],
  ["Commits not on head", `${WT_SHA}; git rev-list --count "$HEADSHA..$SHA"`],
  ["Head commits not on it", `${WT_SHA}; git rev-list --count "$SHA..$HEADSHA"`],
  ["Open PR from its branch", `${WT_BRANCH}; printf '%s\\n' "$PRS" | awk -F'\\t' -v b="$B" 'b != "" && $4==b {print "#" $1}' | paste -sd' ' -`],
];

const TABLES = {
  issues: {
    rows: `printf '%s\\n' "$ISSUES" | awk -F'\\t' '{p=9; n=split($3, l, ","); for (i=1; i<=n; i++) if (l[i] ~ /^P[0-3]$/) {p=substr(l[i], 2, 1); break}; print p "\\t" $1}' | sort -k1,1n -k2,2n | cut -f2`,
    cols: [
      ["Order", `printf '%s\\n' "$ROWS" | grep -nx "$ROW" | cut -d: -f1`],
      ["Issue", `printf '#%s\\n' "$ROW"`],
      ["Title", `printf '%s\\n' "$ISSUES" | awk -F'\\t' -v n="$ROW" '$1==n {print $4}'`],
      ["Kind", `${LABELS} | sed -n 's/^kind://p' | paste -sd, -`],
      ["Pri", `${LABELS} | grep -E '^P[0-3]$' | paste -sd, -`],
      ["Size", `${LABELS} | sed -n 's/^size://p' | paste -sd, -`],
      ["Lane", `${LABELS} | sed -n 's/^lane://p' | paste -sd, -`],
      ["Status", `${LABELS} | sed -n 's/^status://p' | paste -sd, -`],
      ["Other labels", `${LABELS} | grep -vE '^(kind:|size:|lane:|status:|P[0-3]$)' | paste -sd, -`],
      ["Opened", `printf '%s\\n' "$ISSUES" | awk -F'\\t' -v n="$ROW" '$1==n {print $2}'`],
      ["Plans whose ticket: line is it, at any REFS tip", `printf '%s\\n' "$REFS" | while read -r s r; do git grep -l -E "^ticket: \\"?#$ROW\\"?( |$)" "$s" -- .sdlc/plans ':(exclude).sdlc/plans/archive'; done | sed 's/^[0-9a-f]*://' | sort -u | paste -sd' ' -`],
      ["Open PRs closing it, or naming it in the title", `printf '%s\\n' "$PRS" | awk -F'\\t' -v n="$ROW" '{hit=0; k=split($6, c, ","); for (i=1; i<=k; i++) if (c[i]==n) hit=1; if ($7 ~ ("#" n "([^0-9]|$)")) hit=1; if (hit) print "#" $1}' | paste -sd' ' -`],
    ],
  },
  missing: {
    rows: `printf 'kind:\\nP\\nsize:\\nlane:\\nstatus:\\n'`,
    cols: [
      ["Label prefix", `printf '%s\\n' "$ROW"`],
      ["Open issues without it", `printf '%s\\n' "$ISSUES" | awk -F'\\t' -v p="$ROW" '{hit=0; n=split($3, l, ","); for (i=1; i<=n; i++) if ((p=="P" && l[i] ~ /^P[0-3]$/) || (p!="P" && index(l[i], p)==1)) hit=1; if (!hit) print "#" $1}' | paste -sd' ' -`],
    ],
  },
  prs: {
    rows: `printf '%s\\n' "$PRS" | cut -f1`,
    cols: [
      ["PR", `printf '#%s\\n' "$ROW"`],
      ["Title", `printf '%s\\n' "$PRS" | awk -F'\\t' -v n="$ROW" '$1==n {print $7}'`],
      ["Draft", `printf '%s\\n' "$PRS" | awk -F'\\t' -v n="$ROW" '$1==n {print $2}'`],
      ["Opened", `printf '%s\\n' "$PRS" | awk -F'\\t' -v n="$ROW" '$1==n {print $3}'`],
      ["Head branch", `printf '%s\\n' "$PRS" | awk -F'\\t' -v n="$ROW" '$1==n {print $4}'`],
      ["Head commit", `printf '%s\\n' "$PRS" | awk -F'\\t' -v n="$ROW" '$1==n {print substr($5, 1, 8)}'`],
      ["Closes", `printf '%s\\n' "$PRS" | awk -F'\\t' -v n="$ROW" '$1==n {print $6}' | tr , '\\n' | sed -n 's/^\\([0-9]\\)/#\\1/p' | paste -sd' ' -`],
      ["Commits not on head", `O=$(printf '%s\\n' "$PRS" | awk -F'\\t' -v n="$ROW" '$1==n {print $5}'); git rev-list --count "$HEADSHA..$O" 2>/dev/null || echo 'commit not in this clone'`],
    ],
  },
  plans: {
    rows: `printf '%s\\n' "$REFS" | while read -r s r; do git ls-tree --name-only "$s" .sdlc/plans/ | grep '\\.md$' | while read -r f; do echo "$f $(git rev-parse "$s:$f")"; done; done | sort -u`,
    cols: [
      ["Plan file", `printf '\\140%s\\140\\n' "$(printf '%s\\n' "$ROW" | cut -d' ' -f1)"`],
      ["Blob", `printf '%s\\n' "$ROW" | cut -d' ' -f2 | cut -c1-8`],
      ["Refs whose tip carries this blob", `F=$(printf '%s\\n' "$ROW" | cut -d' ' -f1); X=$(printf '%s\\n' "$ROW" | cut -d' ' -f2); printf '%s\\n' "$REFS" | while read -r s r; do [ "$(git rev-parse -q --verify "$s:$F" 2>/dev/null)" = "$X" ] && echo "$r@$(printf '%s' "$s" | cut -c1-8)"; done | sed 's#^refs/heads/##; s#^refs/remotes/##' | paste -sd' ' -`],
      ["ticket:", `git cat-file -p "$(printf '%s\\n' "$ROW" | cut -d' ' -f2)" | grep -m1 '^ticket:' | sed 's/^ticket: *//'`],
      ["status:", `git cat-file -p "$(printf '%s\\n' "$ROW" | cut -d' ' -f2)" | grep -m1 '^status:' | sed 's/^status: *//'`],
    ],
  },
  gitWorktrees: {
    rows: `printf '%s\\n' "$WORKTREES" | sed -n 's#^worktree <ROOT>/\\.git-worktrees/#.git-worktrees/#p'`,
    cols: WORKTREE_COLS,
  },
  unitWorktrees: {
    rows: `printf '%s\\n' "$WORKTREES" | sed -n 's#^worktree <ROOT>/\\.worktrees/#.worktrees/#p'`,
    cols: WORKTREE_COLS,
  },
  questions: {
    rows: `${QREFS} | while read -r s r; do git ls-tree --name-only "$s" .sdlc/questions/ | grep '\\.md$' | while read -r f; do echo "$f $(git rev-parse "$s:$f")"; done; done | sort -u`,
    cols: [
      ["Question file", `printf '\\140%s\\140\\n' "$(printf '%s\\n' "$ROW" | cut -d' ' -f1)"`],
      ["Blob", `printf '%s\\n' "$ROW" | cut -d' ' -f2 | cut -c1-8`],
      ["Read at", `F=$(printf '%s\\n' "$ROW" | cut -d' ' -f1); X=$(printf '%s\\n' "$ROW" | cut -d' ' -f2); ${QREFS} | while read -r s r; do [ "$(git rev-parse -q --verify "$s:$F" 2>/dev/null)" = "$X" ] && echo "$r@$(printf '%s' "$s" | cut -c1-8)"; done | sed 's#^refs/heads/##; s#^refs/remotes/##' | paste -sd' ' -`],
      ["First status: line", `git cat-file -p "$(printf '%s\\n' "$ROW" | cut -d' ' -f2)" | grep -m1 '^status:' | sed 's/^status: *//'`],
    ],
  },
  debt: {
    rows: `git show "$HEADSHA:.sdlc/debt.md" | sed -n 's/^## //p'`,
    cols: [
      ["Section", `printf '%s\\n' "$ROW"`],
      ["Row ids", `git show "$HEADSHA:.sdlc/debt.md" | awk -v h="## $ROW" '$0==h {f=1; next} /^## / {f=0} f && /^[|] [A-Z]+[0-9]+ [|]/ {print $2}' | paste -sd' ' -`],
    ],
  },
  landed: {
    rows: `P=$(git show "$SRCSHA:.sdlc/roadmap.md" | sed -n 's/^head: \\([0-9a-f]\\{7,40\\}\\).*/\\1/p' | head -1); git log --first-parent --format=%H "$P..$HEADSHA"`,
    cols: COMMIT_COLS,
  },
  revisions: {
    rows: `git log --format=%H "$ANCHOR" -- .sdlc/roadmap.md`,
    cols: COMMIT_COLS,
  },
};

// Scalars used in prose lines. Same rule: the value is the command's stdout.
const SCALARS = {
  HEADSHA: `printf '%s\\n' "$REFS" | awk '$2=="refs/remotes/origin/main" {print $1}'`,
  SRCSHA: `printf '%s\\n' "$HEAD" | sed -n '$p'`,
  ANCHOR: `printf '%s\\n' "$RENDER" | sed -n 's/^snapshot \\([0-9a-f]\\{40\\}\\):.*/\\1/p' | head -1 | grep . || printf '%s\\n' "$SRCSHA"`,
  SRCREF: `printf '%s\\n' "$HEAD" | sed -n '1{/^refs\\//p;}'`,
  T0: `printf '%s\\n' "$INSTANT" | sed -n 1p`,
  T1: `printf '%s\\n' "$INSTANT" | sed -n 2p`,
  PREV: `git show "$SRCSHA:.sdlc/roadmap.md" | sed -n 's/^head: \\([0-9a-f]\\{7,40\\}\\).*/\\1/p' | head -1`,
  COUNT: `printf '%s\\n' "$ISSUES" | awk -F'\\t' '{p=9; n=split($3, l, ","); for (i=1; i<=n; i++) if (l[i] ~ /^P[0-3]$/) {p=substr(l[i], 2, 1); break}; c[p]++; t++} END {printf "P0 %d, P1 %d, P2 %d, P3 %d, no P label %d, total %d\\n", c[0], c[1], c[2], c[3], c[9], t}'`,
  N_ISSUES: `printf '%s\\n' "$ISSUES" | awk 'NF {n++} END {print n+0}'`,
  N_PRS: `printf '%s\\n' "$PRS" | awk 'NF {n++} END {print n+0}'`,
  N_WORKTREES: `printf '%s\\n' "$WORKTREES" | awk '/^worktree / {n++} END {print n+0}'`,
  N_REFS: `printf '%s\\n' "$REFS" | awk 'NF {n++} END {print n+0}'`,
  N_REFLOG: `printf '%s\\n' "$REFLOG" | awk 'NF {n++} END {print n+0}'`,
  N_GITWT: `printf '%s\\n' "$WORKTREES" | awk 'index($0, "worktree <ROOT>/.git-worktrees/")==1 {n++} END {print n+0}'`,
  N_UNITWT: `printf '%s\\n' "$WORKTREES" | awk 'index($0, "worktree <ROOT>/.worktrees/")==1 {n++} END {print n+0}'`,
  N_OTHERWT: `printf '%s\\n' "$WORKTREES" | awk '/^worktree / && index($0, "worktree <ROOT>/.git-worktrees/")!=1 && index($0, "worktree <ROOT>/.worktrees/")!=1 {n++} END {print n+0}'`,
};
const SCALAR_ORDER = ["HEADSHA", "SRCSHA", "ANCHOR", "SRCREF", "T0", "T1", "PREV", "COUNT", "N_ISSUES", "N_PRS", "N_WORKTREES", "N_REFS", "N_REFLOG", "N_GITWT", "N_UNITWT", "N_OTHERWT"];

// ---------------------------------------------------------------------------------------------------------
// Rendering.

const cellText = (s) => s.split(EM).join(EM_TEXT).replace(/\|/g, "\\|");

function computeScalars(env) {
  const v = {};
  for (const k of SCALAR_ORDER) { v[k] = sh(SCALARS[k], { ...env, ...v }); }
  return v;
}

function renderTable(name, env) {
  const t = TABLES[name];
  const ROWS = sh(t.rows, env);
  const rows = ROWS === "" ? [] : ROWS.split("\n");
  const out = [];
  out.push(`| ${t.cols.map((c) => c[0]).join(" | ")} |`);
  out.push(`|${t.cols.map(() => "---|").join("")}`);
  for (const ROW of rows) {
    const cells = t.cols.map(([h, cmd]) => {
      const v = sh(cmd, { ...env, ROWS, ROW });
      if (v.includes("\n")) die(2, `table ${name}, column ${h}, row ${ROW}: the command printed more than one line`);
      return v === "" ? "none" : cellText(v);
    });
    out.push(`| ${cells.join(" | ")} |`);
  }
  out.push("");
  out.push("Commands for this table, the rows first and then one per column:");
  out.push("");
  out.push(FENCE + "sh");
  out.push(`# rows (ROW is each line; ROWS is all of them)`);
  out.push(t.rows);
  for (const [h, cmd] of t.cols) { out.push(`# ${h}`); out.push(cmd); }
  out.push(FENCE);
  return { text: out.join("\n"), n: rows.length };
}

function render(snap) {
  const blocks = ["HEAD", "GENERATOR", "REFS", "WORKTREES", "REFLOG", "ISSUES", "PRS", "INSTANT", "PARAMS", "RENDER"];
  const env = {};
  for (const k of blocks) env[k] = snap[k];
  const s = computeScalars(env);
  Object.assign(env, { HEADSHA: s.HEADSHA, SRCSHA: s.SRCSHA, ANCHOR: s.ANCHOR });
  const kv = (block) => Object.fromEntries(block.split("\n").map((l) => [l.slice(0, l.indexOf(" ")), l.slice(l.indexOf(" ") + 1)]));
  const render_ = kv(snap.RENDER);
  const params = Object.fromEntries(snap.PARAMS.split("\n").map((l) => [l.slice(0, l.indexOf(" ")), l.slice(l.indexOf(" ") + 1)]));
  const T = (n) => renderTable(n, env).text;
  const short = (x) => x.slice(0, 8);

  const L = [];
  L.push("---");
  L.push("kind: roadmap");
  L.push("repo: ultimate-tokens");
  L.push("status: generated (the Conductor owns this file)");
  L.push(`written: ${s.T0.slice(0, 10)}`);
  L.push(`head: ${s.HEADSHA} (refs/remotes/origin/main, read between ${s.T0} and ${s.T1})`);
  L.push(`instant: read from ${s.T0} to ${s.T1}, once; every figure below is computed from that read`);
  L.push(`generator: .sdlc/scripts/roadmap-gen.mjs, read by blob ${snap.GENERATOR}, rendered by blob ${render_.renderer}`);
  L.push(`inputs: gh issue list --state open (${s.N_ISSUES} issues), gh pr list --state open (${s.N_PRS} PRs), git worktree list (${s.N_WORKTREES} worktrees), git for-each-ref (${s.N_REFS} refs), git reflog (${s.N_REFLOG} entries); commands and output verbatim in Snapshot`);
  L.push(`generated-for: ${params.for}`);
  L.push("---");
  L.push("");
  L.push("# Roadmap");
  L.push("");
  L.push("Generated by `.sdlc/scripts/roadmap-gen.mjs`. Nothing below is typed by hand, and nothing is patched after generation: a change is a new generation.");
  L.push("");
  L.push("## How to read a cell");
  L.push("");
  L.push("| Rule | What it means |");
  L.push("|---|---|");
  L.push("| one read | refs, worktrees, reflogs, open issues and open PRs were read once, between the two instants in `instant:`, by the commands in Snapshot. Nothing else the generation runs reads state that can change |");
  L.push("| a cell is a command's output | every table cell is the stdout of the command listed for its column under the table, run with the Snapshot blocks as shell variables. Those commands name git objects by sha, never by branch, so they print the same thing whenever they are rerun, while the objects they name remain in the clone |");
  L.push("| no marks | there is no proposed, derived or legacy mark, because no cell is proposed, mapped or ranked. A label column prints the label's text after its prefix, verbatim: `size:small` prints `small`, and `task`, which has no prefix, prints under Other labels |");
  L.push("| `none` | the column's command printed nothing |");
  L.push("| escapes | a `\\|` in a cell is a plain `|` escaped for the table. U+2014 is written `<U+2014>` everywhere in this file, Snapshot included |");
  L.push("| order | the issue table is sorted by its `P` label, P0 first, then by issue number, and issues with no `P` label come last. That is a sort; this file ranks nothing |");
  L.push("| refs | every git fact names the sha it was read at. Whether a commit is on head is `git rev-list`, which is reachability, never a date. Which sha a branch pointed at during the read is witnessed by its newest reflog entry, quoted in Snapshot |");
  L.push("");
  L.push("To rerun a cell by hand, from the repo root, in bash or zsh:");
  L.push("");
  L.push(FENCE + "sh");
  L.push("f=.sdlc/roadmap.md");
  L.push("block() { awk -v k=\"$1\" '$0==\"```snapshot \" k {x=1; next} /^```$/ {x=0} x' \"$f\" | perl -CSD -pe 's/<U\\+2014>/\\x{2014}/g'; }");
  L.push("HEAD=$(block HEAD); REFS=$(block REFS); WORKTREES=$(block WORKTREES); ISSUES=$(block ISSUES); PRS=$(block PRS)");
  L.push(`HEADSHA=$(${SCALARS.HEADSHA})`);
  L.push(`SRCSHA=$(${SCALARS.SRCSHA})`);
  L.push("export HEAD REFS WORKTREES ISSUES PRS HEADSHA SRCSHA LC_ALL=C");
  L.push("# then set ROWS to the table's rows command output, ROW to one line of it, and run the column's command");
  L.push(FENCE);
  L.push("");
  L.push("Or all at once, which re-renders the whole file from its own Snapshot and compares byte for byte:");
  L.push("`node .sdlc/scripts/roadmap-gen.mjs --verify .sdlc/roadmap.md` (exit 0 when every cell reproduces).");
  L.push("");
  L.push("What that proves, and what it cannot: exit 0 means every cell follows from the Snapshot and the Snapshot agrees with itself, each ref's quoted reflog entry naming the sha REFS and WORKTREES record. It cannot prove the Snapshot matched the world: a value changed in both the Snapshot and its cell still passes. The check against the world is the Verifier's grade of the read inside the freeze window it was taken in, the `gh` blocks against live `gh` and the git blocks against this repo's reflogs.");
  L.push("");
  L.push("## Open issues");
  L.push("");
  L.push(`Count: ${s.COUNT}. The priority breakdown is its own command:`);
  L.push("");
  L.push(FENCE + "sh");
  L.push(SCALARS.COUNT);
  L.push(FENCE);
  L.push("");
  L.push(T("issues"));
  L.push("");
  L.push("### Open issues missing a label, by prefix");
  L.push("");
  L.push(T("missing"));
  L.push("");
  L.push("## Open PRs");
  L.push("");
  L.push(`Commits not on head counts \`git rev-list ${short(s.HEADSHA)}..<head commit>\`.`);
  L.push("");
  L.push(T("prs"));
  L.push("");
  L.push("## Plans");
  L.push("");
  L.push("Every `.sdlc/plans/*.md` outside `archive/`, at the tip of every ref in the REFS block. One row per distinct file content, with the refs that carry it. `ticket:` and `status:` are the first such line in that blob, verbatim.");
  L.push("");
  L.push(T("plans"));
  L.push("");
  L.push("## Worktrees under `.git-worktrees/`");
  L.push("");
  L.push(`${s.N_GITWT} worktrees under \`.git-worktrees/\`. Counts are \`git rev-list\` against head \`${short(s.HEADSHA)}\`.`);
  L.push("");
  L.push(T("gitWorktrees"));
  L.push("");
  L.push("## Worktrees under `.worktrees/`");
  L.push("");
  L.push(`Under \`.worktrees/\`: ${s.N_UNITWT}, counted the same way. The other ${s.N_OTHERWT} \`worktree\` entries in the WORKTREES block, those under neither directory, are not tabled.`);
  L.push("");
  L.push(T("unitWorktrees"));
  L.push("");
  L.push("## Question files");
  L.push("");
  L.push(`Every \`.sdlc/questions/*.md\` at head \`${short(s.HEADSHA)}\` and at \`${short(s.SRCSHA)}\`, the commit checked out when the Snapshot was read, one row per distinct file content, with its first \`status:\` line as written. A file with no such line shows \`none\`; this table does not decide which questions are open.`);
  L.push("");
  L.push(T("questions"));
  L.push("");
  L.push("## Debt ids at head");
  L.push("");
  L.push(`The row ids under each section of \`.sdlc/debt.md\` at \`${short(s.HEADSHA)}\`. Ids only: \`debt.md\` records no machine-readable open or closed state, so this table does not say which rows are open.`);
  L.push("");
  L.push(T("debt"));
  L.push("");
  L.push("## Landed since the last generation");
  L.push("");
  L.push(`First-parent commits on head since \`${s.PREV}\`, the \`head:\` of the roadmap at \`${short(s.SRCSHA)}\`, the commit checked out when the Snapshot was read.`);
  L.push("");
  L.push(T("landed"));
  L.push("");
  L.push("## Revisions");
  L.push("");
  L.push(`Commits that touched this file, reachable from \`${short(s.ANCHOR)}\`, which is the commit whose Snapshot this file carries, or the checkout the read ran at when the Snapshot is a live read. Commits that touched it later, the one that adds this rendering among them, are not listed: a file cannot name its own commit, and it cannot see what came after the Snapshot it renders. How many those are is not stated here, because nothing in this file measures it. Each listed revision's prose is at \`git show <commit>:.sdlc/roadmap.md\`. This rendering: ${params.for}, snapshot read at head \`${short(s.HEADSHA)}\`.`);
  L.push("");
  L.push(T("revisions"));
  L.push("");
  L.push("## Snapshot");
  L.push("");
  L.push(`Every block is the stdout of the command above it, run at \`${short(s.SRCSHA)}\` between ${s.T0} and ${s.T1}, with \`LC_ALL=C\`, verbatim except U+2014, written \`<U+2014>\`, and trailing newlines, which are dropped. The generator refuses to write when any ref's newest reflog entry disagrees with the REFS or WORKTREES read, so the blocks describe one state. INSTANT is \`${INSTANT_CMD}\` run before the first command and after the last. PARAMS is the generator's arguments and RENDER names the blob that rendered this file and where its snapshot came from; neither is a read.`);
  const cmds = Object.fromEntries(READS);
  cmds.INSTANT = `${INSTANT_CMD}  # before HEAD, and again after PRS`;
  cmds.PARAMS = "the --ticket and --by arguments";
  cmds.RENDER = "not a read: the rendering generator's blob, and live read or the commit whose snapshot was rendered again";
  for (const k of ["INSTANT", "HEAD", "GENERATOR", "REFS", "WORKTREES", "REFLOG", "ISSUES", "PRS", "PARAMS", "RENDER"]) {
    L.push("");
    L.push(`### ${k}`);
    L.push("");
    L.push(k === "PARAMS" || k === "RENDER" ? FENCE + "text" : FENCE + "sh");
    L.push(cmds[k]);
    L.push(FENCE);
    L.push("");
    L.push(FENCE + "snapshot " + k);
    if (snap[k] !== "") L.push(snap[k].split(EM).join(EM_TEXT));
    L.push(FENCE);
  }
  L.push("");
  const text = L.join("\n");
  for (const re of BANNED) if (re.test(text)) die(4, `output matches ${re}, which test/repo/branding.mjs bans; nothing written`);
  if (text.includes(EM)) die(4, "output still carries U+2014; nothing written");
  return text;
}

function parseSnapshot(text) {
  const snap = {};
  const re = new RegExp("^" + FENCE + "snapshot ([A-Z]+)\\n([\\s\\S]*?)^" + FENCE + "$", "gm");
  for (const m of text.matchAll(re)) snap[m[1]] = m[2].replace(/\n$/, "").split(EM_TEXT).join(EM);
  return snap;
}

function checkBlocks(snap) {
  for (const [k, v] of Object.entries(snap)) {
    if (v.split("\n").some((l) => l.startsWith(FENCE))) die(4, `block ${k} carries a fence line; it cannot be quoted`);
  }
}

// ---------------------------------------------------------------------------------------------------------

const SELF = sh("git hash-object " + JSON.stringify(fileURLToPath(import.meta.url)));

if (flag("--verify")) {
  const file = opt("--verify");
  const text = readFileSync(file, "utf8");
  const snap = parseSnapshot(text);
  checkAgreement(snap);
  const renderer = snap.RENDER ? (/^renderer (\S+)/m.exec(snap.RENDER) || [])[1] : snap.GENERATOR;
  if (renderer !== SELF) { console.log(`verify: ${file} names renderer blob ${renderer}; this generator is blob ${SELF}. Run that blob: git cat-file blob ${renderer} > <tmp>.mjs`); process.exit(1); }
  const again = render(snap);
  if (again === text) { console.log(`verify: ${file} reproduces from its own Snapshot (${text.split("\n").length} lines)`); process.exit(0); }
  const a = text.split("\n"), b = again.split("\n");
  let i = 0; while (i < a.length && a[i] === b[i]) i++;
  console.log(`verify: ${file} differs from its re-render at line ${i + 1}\n  file:     ${a[i]}\n  rerender: ${b[i]}`);
  process.exit(1);
}

const out = opt("--out");
const ticket = opt("--ticket");
const by = opt("--by");
const from = opt("--rerender");
if (!out || (!from && (!ticket || !by))) die(1, "usage: --out <path> --ticket <n> --by <plan unit>, or --out <path> --rerender <commit>, or --verify <path>");
const outAbs = resolve(process.cwd(), out);
if (outAbs === resolve(TOP, ".sdlc/roadmap.md") && !flag("--final")) die(1, "writing .sdlc/roadmap.md needs --final");
if (flag("--final")) {
  const committed = sh("git rev-parse -q --verify HEAD:.sdlc/scripts/roadmap-gen.mjs || true");
  if (SELF !== committed) die(1, "--final needs the running generator to be the one committed at HEAD");
  if (sh("git status --porcelain") !== "") die(1, "--final needs a clean tree");
}
let snap;
if (from) {
  const sha = sh(`git rev-parse --verify ${JSON.stringify(from + "^{commit}")}`);
  snap = parseSnapshot(sh(`git show ${sha}:.sdlc/roadmap.md`) + "\n");
  checkAgreement(snap);
  snap.RENDER = `renderer ${SELF}\nsnapshot ${sha}:.sdlc/roadmap.md`;
} else {
  snap = readLive();
  snap.PARAMS = `for plan ${by}, ticket #${ticket}`;
  snap.RENDER = `renderer ${SELF}\nsnapshot live read`;
}
checkBlocks(snap);
const text = render(snap);
if (from) {
  // the snapshot must come through byte for byte: every block but RENDER is the source's
  const back = parseSnapshot(text);
  for (const k of Object.keys(snap)) if (k !== "RENDER" && back[k] !== snap[k]) die(2, `block ${k} did not survive the re-render unchanged`);
}
writeFileSync(outAbs, text);
console.log(`wrote ${outAbs}: ${text.split("\n").length} lines, snapshot read ${snap.INSTANT.split("\n").join(" to ")}`);
