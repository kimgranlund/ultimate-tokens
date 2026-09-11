#!/usr/bin/env node
// gen-ramp-fixture.mjs — regenerates test/ui/fixtures/default-doc-ramps.json, the AC-003(b) document-
// level byte-diff fixture (SPEC spec-muted-base-key-spikes 0.3.0, ticket #559): projectView(defaultDocument())'s
// 25-stop hex (fullRamp) per palette, at the ratified GROUP_DEFAULTS. Run ONLY by hand, once, from the
// resolver you want to pin; `npm test` only COMPARES against this file, it never regenerates it.
//   node scripts/gen-ramp-fixture.mjs
import { writeFileSync } from "node:fs";
import { defaultDocument, projectView } from "../src/ui/model.mjs";

const doc = defaultDocument();
const view = projectView(doc);
const out = { generatedFrom: process.argv[2] || "hand", paletteGroups: doc.paletteGroups, palettes: {} };
for (const p of view.palettes) out.palettes[p.name] = p.fullRamp.map((s) => s.hex);

const dest = new URL("../test/ui/fixtures/default-doc-ramps.json", import.meta.url);
writeFileSync(dest, JSON.stringify(out, null, 1) + "\n");
console.log(`wrote ${dest.pathname}: ${Object.keys(out.palettes).length} palettes x ${view.palettes[0].fullRamp.length} stops`);
