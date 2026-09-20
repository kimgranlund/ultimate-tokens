# Every row of .sdlc/architecture.md §8 Doc drift is a measurement at this head, not a copy:
# its quote sits on the cited doc line, its cited code paths are tracked, its state is one of three.
# Reads files and git only. Usage: sh .sdlc/checks/doc-drift-rows-check.sh   (from the repo root)
node - <<'EOF'
const fs = require("fs"), cp = require("child_process");
const sec = (fs.readFileSync(".sdlc/architecture.md", "utf8").split(/^## 8\. Doc drift/m)[1] || "").split(/^## /m)[0];
const rows = sec.split("\n").filter((l) => /^\| DD\d+ \|/.test(l)).map((l) => l.split("|").map((s) => s.trim()));
const tracked = new Set(cp.execSync("git ls-files", { encoding: "utf8" }).split("\n"));
const isPath = (s) => s.match(/^([\w.\/-]+\.(?:js|mjs|ts|json|css|md|yml|html))(?::\d+(?:-\d+)?)?$/);
let bad = 0, n = { drifted: 0, holds: 0, undetermined: 0 };
const say = (l) => { bad++; console.log(l); };
for (const r of rows) {
  const [, id, doc, code, state] = r;
  const m = (doc || "").match(/^`([^`:]+):(\d+)` "([^"]{20,})"/);
  if (!m) { say(`SHAPE ${id}: doc cell is not \`path:line\` "quote of 20+ chars"`); continue; }
  const [, f, line, q] = m;
  const txt = tracked.has(f) ? (fs.readFileSync(f, "utf8").split("\n")[+line - 1] || "") : "";
  if (!txt.includes(q)) say(`QUOTE ${id}: not found at ${f}:${line}`);
  if (q.includes(String.fromCharCode(0x2014))) say(`EMDASH ${id}`);
  for (const t of (code || "").match(/`[^`]+`/g) || []) { const p = isPath(t.slice(1, -1)); if (p && !tracked.has(p[1])) say(`PATH ${id}: ${p[1]} not tracked`); }
  const st = (state || "").match(/^(drifted|holds|undetermined)\b/);
  if (!st) say(`STATE ${id}`); else n[st[1]]++;
  if (st && st[1] === "drifted" && !(code || "").match(/`[^`]+`/)) say(`CODE ${id}: drifted row cites no code`);
}
console.log(`rows ${rows.length} drifted ${n.drifted} holds ${n.holds} undetermined ${n.undetermined} bad ${bad}`);
process.exit(rows.length && !bad ? 0 : 1);
EOF
