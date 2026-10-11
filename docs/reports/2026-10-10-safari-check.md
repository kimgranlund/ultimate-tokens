# Safari check list for the 2026-10-09 UI and color changes

Why this exists: the repo's smoke test runs in headless Chrome only, so nobody has looked at these changes in Safari (see `shipping-changes` `references/foundations.md`). ADR-035, ADR-036 and ADR-037 were ratified without a Safari pass. Run once, about 10 minutes: `npm run dev`, open the printed URL in Safari. A miss becomes a bug issue (`/file-bug`).

## Shell (ADR-036, #826)

1. The shell opens at product, sm: controls 28px tall, 13px text. Open Settings, switch Default, Follow kit and Custom: the chrome resizes each time and nothing clips.
2. Select triggers (Distribution, the mapping selects): the solid caret-down glyph shows at the right in light and dark, and clears the text.
3. The Examples toggle and the Typography voice headers show a caret that flips when they open. The Examples toggle label stays on one or two lines at the widest cell (Settings, Custom, content lg) with the caret inside the pane.
4. Chips and the segmented control are control height; badges and tags are the small row. The settings nav's selected item reads differently from hover.
5. Hover a Radix step: the tooltip shows role and intent, flips above when the swatch is at the window bottom, and the text has no clipped line height.

## Charts (ADR-035, #820 batch)

6. Open Color, Typography and Geometry sections: the analysis charts draw as native shapes (ribbons, bars, lines) with no wedge fills on open lines. Compare dark mode.

## Color (ADR-037, #827 and #825)

7. Color section, all palettes visible: the first and last swatches of each ramp (050 to 100, 900 to 950) line up across palettes in lightness.
8. Deselect every palette, find the Match peer lightness row under Hue space: turn it On, the ramps' middle stops line up too; Off returns them.
9. Select the default Primary and drag its Hue to green and back: the ramp keeps its light-to-dark spread (stop 500 stays near the original lightness) and Reset to source color restores it.
10. Open an older saved kit: the inspector shows "Upgrade to latest" and the ramps still render as before until you press it.

## Result
Mark each line OK or write what looked wrong.
