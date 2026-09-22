# Every top-level .md file under .sdlc/verdicts/ carries a machine-readable verdict: line (#723):
# its LAST `verdict:` line's first token is one of 🟢 🟡 🔴, the line adapter.py's read_gate reads
# (it keeps the last match on every gate line). A file named in verdict-frontmatter-grandfather.txt
# is not counted as graded, but it is still read: a listed name whose file is gone is STALE, and a
# listed file that now carries a valid last verdict: line is CLEARED, since it must leave the list
# in the same commit that fixes it (revision 4; a name kept past that point left the file outside
# enforcement for good, unnoticed). The backfill ticket (U2) clears the mandate one file at a time.
# Reads files only. Usage: sh .sdlc/checks/verdict-frontmatter-check.sh   (from the repo root)
node - <<'EOF'
const fs = require("fs");
const listPath = ".sdlc/checks/verdict-frontmatter-grandfather.txt";
const listLines = fs.existsSync(listPath)
  ? fs.readFileSync(listPath, "utf8").split("\n").map((l) => l.trim()).filter((l) => l.length)
  : [];
const names = listLines.filter((l) => !l.startsWith("#"));
const nameSet = new Set(names);

const files = fs.readdirSync(".sdlc/verdicts").filter((f) => f.endsWith(".md")).sort();
const fileSet = new Set(files);

let bad = 0, graded = 0, grandfathered = 0;
const say = (l) => { bad++; console.log(l); };

const gradeOne = (f) => {
  const lines = fs.readFileSync(`.sdlc/verdicts/${f}`, "utf8").split("\n");
  const verdictLines = lines.filter((l) => /^verdict:/.test(l));
  if (!verdictLines.length) return { fail: "MISSING", detail: `MISSING ${f}: no verdict: line` };
  const last = verdictLines[verdictLines.length - 1];
  const value = last.slice("verdict:".length).trim();
  const token = value.split(/\s+/)[0];
  if (!["🟢", "🟡", "🔴"].includes(token)) return { fail: "VALUE", detail: `VALUE ${f}: last verdict: ${value} is not 🟢, 🟡 or 🔴` };
  return { fail: null };
};

for (const name of names) {
  if (!fileSet.has(name)) { say(`STALE ${name}: grandfathered but absent`); continue; }
  if (!gradeOne(name).fail) say(`CLEARED ${name}: grandfathered but carries the field`);
}

for (const f of files) {
  if (nameSet.has(f)) { grandfathered++; continue; }
  graded++;
  const result = gradeOne(f);
  if (result.fail) say(result.detail);
}

console.log(`verdicts ${files.length} graded ${graded} grandfathered ${grandfathered} bad ${bad}`);
process.exit(bad ? 1 : 0);
EOF
