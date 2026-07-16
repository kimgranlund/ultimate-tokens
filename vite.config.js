// vite.config.js — with no config, Vite's dependency-scan crawler auto-discovers every *.html file
// under the project root as a potential entry, including figma/plugin/ui.html (a committed, GENERATED
// 2.7MB single-file bundle for the Figma plugin — never a page a developer navigates to in the dev
// server). Scanning that huge embedded blob is fragile: esbuild's crude <script>-extraction from HTML
// can misparse deep into a large inlined bundle and abort the whole dependency pre-scan (harmless —
// Vite falls back to skipping pre-bundling and the app still serves — but it prints a scary parse
// error on every `npm run dev`). Restricting the scan to the two REAL app entries avoids it.
export default {
  optimizeDeps: {
    entries: ["index.html", "src/ui/index.html"],
  },
};
