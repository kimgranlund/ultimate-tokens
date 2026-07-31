#!/usr/bin/env node
// font-fallbacks.mjs — verifier for the Google-Fonts-safe substitute table (src/engine/font-fallbacks.mjs).
// Pure, no DOM.
import { FONT_FALLBACKS, googleSafeFontFor } from "../../src/engine/font-fallbacks.mjs";

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };

// ── a mapped premium family resolves to its curated substitute ──
{
  ok(googleSafeFontFor("Söhne") === "Inter Tight", `Söhne → ${googleSafeFontFor("Söhne")}, want Inter Tight`);
  ok(googleSafeFontFor("PP Monument Extended") === "Archivo", `PP Monument Extended → ${googleSafeFontFor("PP Monument Extended")}, want Archivo`);
}

// ── an already-Google family passes through unchanged (no entry needed, never should be) ──
{
  ok(!("Inter" in FONT_FALLBACKS), "Inter should not need its own fallback entry");
  ok(googleSafeFontFor("Inter") === "Inter", "Inter passes through unchanged");
  ok(googleSafeFontFor("Playfair Display") === "Playfair Display", "Playfair Display passes through unchanged");
}

// ── an unclassified family passes through unchanged — NEVER worse than today's behavior ──
{
  ok(googleSafeFontFor("Some Unlisted Foundry Face") === "Some Unlisted Foundry Face", "unclassified family passes through unchanged");
}

// ── every fallback value is itself a plausible Google Fonts family (non-empty string, not the
//    same as its own key — a self-mapping entry would be a no-op worth deleting) ──
{
  for (const [family, sub] of Object.entries(FONT_FALLBACKS)) {
    ok(typeof sub === "string" && sub.trim().length > 0, `${family}: empty/non-string substitute`);
    ok(sub !== family, `${family}: maps to itself (no-op entry)`);
  }
}

if (fails.length) { console.error(`font-fallbacks FAIL (${fails.length}):\n  ` + fails.join("\n  ")); process.exit(1); }
console.log("font-fallbacks PASS — mapped/already-Google/unclassified lookup, no self-mapping entries");
process.exit(0);
