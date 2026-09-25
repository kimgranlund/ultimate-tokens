#!/usr/bin/env node
// mode-isolation-gate.mjs — #701 U1, C6: perceptual and peak render byte-identically before and after
// this plan's work, which touches `chromaEnvelope`'s even branch only (the `isEven` guard in
// src/engine/tonal.js). Captures a sha256 fingerprint (first 16 hex digits, the plan's own method) of
// perceptual and peak's rendered 25-stop hex ramps over the full corpus (343 curated documents, 3,780
// palettes) plus the 16-palette default kit, via `projectView` (the SAME construction the product
// renders, not a raw `paletteStops` call), and compares against the frozen fixture
// (test/engine/fixtures/mode-isolation.json). A change that moves either fingerprint means the change
// leaked outside even mode — U1's own C6 tripwire, not a re-derivation of chromaEnvelope's own code.
//
// This is a full-corpus sweep (two `projectView` passes over 3,796 palettes), so per #713 it is its own
// gate script (`npm run gate:mode-isolation`, a `gate:sweeps` member and a `sweeps` CI matrix leg), not
// a `test/run.mjs` TESTS entry — always run in full, `--full` accepted for the shared convention but not
// read (there is no SAMPLED reading to fall back to; the fixture is a full-corpus capture).
//
//   node test/engine/mode-isolation-gate.mjs [--full] [--capture]
//
// `--capture` re-generates the fixture at the CURRENT tree's rendered output and writes it, printing the
// sha to name in this header and in the fixture's own `owner` field — used only by hand, by whichever
// plan next moves perceptual or peak (#725 is that plan today, per the plan's revision 8 ruling).
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { hydrate } from "../../src/ui/persist.js";
import { defaultDocument, projectView } from "../../src/ui/model.mjs";

const CATS = ["architecture", "brands", "cuisine", "film", "literature", "music", "nature", "travel"];
const CAPTURE = process.argv.includes("--capture");
const FIXTURE_URL = new URL("./fixtures/mode-isolation.json", import.meta.url);

const presets = [];
for (const slug of CATS) {
  const { PRESETS } = await import(`../../src/ui/categories/${slug}.js`);
  for (const preset of PRESETS) presets.push(preset);
}
const dk = defaultDocument(); // .name is read before hydrate, same shape as anchor.mjs's own kit sweep
const kitLabel = dk.name ?? "Default";

function fingerprintMode(mode) {
  const lines = [];
  for (const preset of presets) {
    const doc = hydrate({ ...preset, toneMode: mode });
    const view = projectView(doc);
    for (const p of view.palettes) lines.push(`${preset.name}|${p.name}|${p.fullRamp.map((s) => s.hex).join(" ")}`);
  }
  {
    const doc = hydrate({ ...dk, toneMode: mode });
    const view = projectView(doc);
    for (const p of view.palettes) lines.push(`${kitLabel}|${p.name}|${p.fullRamp.map((s) => s.hex).join(" ")}`);
  }
  lines.sort();
  return createHash("sha256").update(lines.join("\n")).digest("hex").slice(0, 16);
}

const perceptual = fingerprintMode("perceptual");
const peak = fingerprintMode("peak");
const corpusLabel = `${presets.length} corpus + ${kitLabel === "Default" ? 16 : dk.palettes.length} default kit`;

if (CAPTURE) {
  let sha = "unknown";
  try { sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: new URL("../..", import.meta.url) }).toString().trim(); } catch { /* detached/no-git scratch context: leave "unknown" */ }
  const fx = {
    owner: "the plan that moves perceptual or peak re-captures this fixture in its own change and names the new sha here; #725 is that plan today (#701 revision 8)",
    capturedAt: sha,
    corpus: corpusLabel,
    perceptual,
    peak,
  };
  writeFileSync(FIXTURE_URL, JSON.stringify(fx, null, 1) + "\n");
  console.log(`captured perceptual ${perceptual} peak ${peak} at ${sha} (${corpusLabel})`);
  process.exit(0);
}

const FX = JSON.parse(readFileSync(FIXTURE_URL, "utf8"));
const ok = perceptual === FX.perceptual && peak === FX.peak;
console.log(`  ${ok ? "pass" : "FAIL"}  mode-isolation: perceptual ${perceptual} peak ${peak} match fixture (captured at ${FX.capturedAt}, ${FX.corpus}, 25-stop, projectView)`);
if (!ok) {
  console.log(`    expected perceptual ${FX.perceptual} peak ${FX.peak}`);
  console.log(`FAIL: mode-isolation`);
  process.exit(1);
}
console.log("PASS: mode-isolation clears its checkable [gate] predicate");
