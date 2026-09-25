# Every top-level .md file under .sdlc/verdicts/ carries a machine-readable verdict: line (#723):
# its LAST `verdict:` line's first token is one of 🟢 🟡 🔴, the line adapter.py's read_gate reads
# (it keeps the last match on every gate line). The #723 grandfather list named 47 records that
# failed this rule before the mandate; #734 backfilled every one of them and the list shrank to
# its header alone, so this check now grades every file, with no list, no pin and no git read.
# Usage:
#   sh .sdlc/checks/verdict-frontmatter-check.sh   (from the repo root)
node - <<'EOF'
const fs = require("fs");

const files = fs.readdirSync(".sdlc/verdicts").filter((f) => f.endsWith(".md")).sort();

let bad = 0, graded = 0;
const say = (l) => { bad++; console.log(l); };

const gradeOne = (f) => {
  const content = fs.readFileSync(`.sdlc/verdicts/${f}`, "utf8");
  const lines = content.split("\n");
  const verdictLines = lines.filter((l) => /^verdict:/.test(l));
  if (!verdictLines.length) { say(`MISSING ${f}: no verdict: line`); return; }
  const last = verdictLines[verdictLines.length - 1];
  const value = last.slice("verdict:".length).trim();
  const token = value.split(/\s+/)[0];
  if (!["🟢", "🟡", "🔴"].includes(token)) { say(`VALUE ${f}: last verdict: ${value} is not 🟢, 🟡 or 🔴`); return; }
};

for (const f of files) {
  graded++;
  gradeOne(f);
}

console.log(`verdicts ${files.length} graded ${graded} bad ${bad}`);
process.exit(bad ? 1 : 0);
EOF
