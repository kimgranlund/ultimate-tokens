# Every top-level .md file under .sdlc/verdicts/ carries a machine-readable verdict: line (#723):
# its LAST `verdict:` line's first token is one of 🟢 🟡 🔴, the line adapter.py's read_gate reads
# (it keeps the last match on every gate line). A file named in verdict-frontmatter-grandfather.txt
# is not counted as graded, but it is still read: a listed name whose file is gone is STALE, and a
# listed file that now carries a valid last verdict: line is CLEARED, since it must leave the list
# in the same commit that fixes it (revision 4; a name kept past that point left the file outside
# enforcement for good, unnoticed). The backfill ticket (U2) clears the mandate one file at a time.
# The list is pinned to f685529f (its own header names that commit, and the script pins the same
# value once below; a header edited to a different sha reds, revision 10 F3/U3-7). A listed name is
# only legitimately grandfathered if it FAILED this same grading rule when read at that pin -- not
# merely if a file with that name existed there (revision 10 F1/U3-6: reusing the name of a pinned
# file that already carried a valid verdict: line does not exempt a field-less rewrite). A name that
# does not exist at the pin, or existed there but already graded clean, is GROWN (#723 U3) -- the
# mandate on new records cannot be dodged by pointing at the pin. If the pin commit itself cannot be
# read (no git, no repo, a shallow clone), that is a hard failure, never a silent pass.
# Reads files only (plus a few git reads against the pin). Usage:
#   sh .sdlc/checks/verdict-frontmatter-check.sh   (from the repo root)
PIN=f685529f
if ! git cat-file -e "${PIN}^{commit}" 2>/dev/null; then
  echo "PIN unreadable: cannot read commit ${PIN} (no git, no repo, or shallow clone)"
  exit 1
fi
export PIN
node - <<'EOF'
const fs = require("fs");
const { execFileSync } = require("child_process");
const pin = process.env.PIN;
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

const headerLine = listLines.find((l) => l.startsWith("#")) || "";
const headerPinMatch = headerLine.match(/\bat ([0-9a-f]{6,40})\b/);
const headerPin = headerPinMatch ? headerPinMatch[1] : null;
if (headerPin !== pin) {
  say(`PIN MISMATCH: header names ${headerPin || "no pin"}, script pin is ${pin}`);
}

const gradeText = (content) => {
  const lines = content.split("\n");
  const verdictLines = lines.filter((l) => /^verdict:/.test(l));
  if (!verdictLines.length) return { fail: "MISSING" };
  const last = verdictLines[verdictLines.length - 1];
  const value = last.slice("verdict:".length).trim();
  const token = value.split(/\s+/)[0];
  if (!["🟢", "🟡", "🔴"].includes(token)) return { fail: "VALUE" };
  return { fail: null };
};

const gradeOne = (f) => {
  const content = fs.readFileSync(`.sdlc/verdicts/${f}`, "utf8");
  const result = gradeText(content);
  if (result.fail === "MISSING") return { fail: "MISSING", detail: `MISSING ${f}: no verdict: line` };
  if (result.fail === "VALUE") {
    const lines = content.split("\n");
    const last = lines.filter((l) => /^verdict:/.test(l)).slice(-1)[0];
    const value = last.slice("verdict:".length).trim();
    return { fail: "VALUE", detail: `VALUE ${f}: last verdict: ${value} is not 🟢, 🟡 or 🔴` };
  }
  return { fail: null };
};

const failedAtPin = (name) => {
  let content;
  try {
    content = execFileSync("git", ["show", `${pin}:.sdlc/verdicts/${name}`], { encoding: "utf8" });
  } catch {
    return false;
  }
  return !!gradeText(content).fail;
};

for (const name of names) {
  if (!failedAtPin(name)) { say(`GROWN ${name}: not grandfathered at ${pin}`); continue; }
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
