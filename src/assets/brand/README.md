# Vitalry — Brand & Logo Assets

Drop-in logo, wordmark, and app-icon files. All marks are vector SVG.

## Files
| File | Use |
|------|-----|
| `vitalry-mark.svg` | The high-five mark, full color. On light/cream backgrounds. |
| `vitalry-mark-mono.svg` | Monochrome ink mark. Single-color contexts, stamps, watermarks. |
| `vitalry-mark-reverse.svg` | Cream mark + bright spark. On evergreen/dark backgrounds. |
| `vitalry-app-icon.svg` | 512×512 app icon — evergreen rounded tile, enlarged mark, soft shadow. |
| `vitalry-lockup-horizontal.svg` | Mark + "Vitalry." wordmark, side by side. Primary lockup. |
| `vitalry-lockup-stacked.svg` | Mark over wordmark over tagline. Centered contexts. |
| `vitalry-wordmark.svg` | "Vitalry." wordmark alone. |

## The mark
Two raised hands forming a high-five — which also read as a **V** and a **sprouting plant**.
The three short strokes above are the "spark" of the high-five. Keep round caps and joins.

## Colors
| Token | Hex | Role |
|-------|-----|------|
| Evergreen | `#0F4D2E` | Brand primary — mark arms, wordmark |
| Green 500 | `#2FA05C` | Spark / the period in "Vitalry." |
| Green 400 | `#52BC7C` | Bright spark on dark |
| Cream 50 | `#FCF9F3` | App background, reverse mark |
| Sage 500 | `#6FA588` | Tagline |
| Ink 900 | `#2A2620` | Monochrome, warm near-black text |

## Type
- **Display / wordmark:** Bricolage Grotesque, weight 800, letter-spacing −0.02em
- **Body / tagline:** Hanken Grotesk

The wordmark/lockup SVGs use **vector outlines** (real Bricolage Grotesque / Hanken
Grotesk glyphs converted to `<path>` data) — no font file, `@font-face`, or network is
needed, so they render pixel-identical everywhere including `<img>` and sandboxed
contexts. For app UI text, load the full families from Google Fonts (both are there).

## Clearspace & don'ts
- Keep clearspace around the mark equal to the height of one "spark" stroke.
- App-icon corner radius is ~22% of the tile (baked into `vitalry-app-icon.svg`).
- Don't recolor the mark outside the palette, rotate it, or remove the spark.
