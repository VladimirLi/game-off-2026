# Body Hop art: what jam developers use, and which style to pick

Researched 2026-11-21 for the art pass (feature freeze 24 Nov, submit 30 Nov). Claims cite primary sources; *unverified* marks what could not be traced. itch.io rate-limited some game pages during this pass.

## 1. Where jam and web-game art comes from

[Gamedev.js Survey 2025](https://gamedevjs.com/survey/2025/): 445 web game developers, 62.8% solo, 41.8% making puzzle games.

| Where graphics come from ([Q21](https://gamedevjs.com/survey/2025/img/21.png)) | % |
|---|---|
| Make them myself | 74.4 |
| Free resources (CC etc.) | 54.0 |
| Bought packs | 33.5 |
| AI tools (22.5 in 2024) | 28.1 |
| Designer on the team | 18.0 |
| Procedural generation | 14.0 |
| Hired a freelancer | 12.1 |

| Tools ([Q22](https://gamedevjs.com/survey/2025/img/22.png), 401 answers) | % |
|---|---|
| Aseprite | 30.9 |
| GIMP | 28.4 |
| Blender | 27.9 |
| Inkscape | 20.5 |
| Photoshop | 19.0 |
| Krita | 15.5 |
| Illustrator | 12.0 |
| Canva | 11.7 |
| Photopea, Figma, Affinity Designer | about 10 each |

No art-tool survey from itch.io, GMTK, Ludum Dare or js13k was found.

### Free or cheap toolkit

| Tool | Cost and licence |
|---|---|
| [Aseprite](https://www.aseprite.org/) | $19.99 ([Steam](https://store.steampowered.com/app/431730/)) |
| [LibreSprite](https://github.com/LibreSprite/LibreSprite) | Free, GPLv2 fork of Aseprite |
| [Pixelorama](https://github.com/Orama-Interactive/Pixelorama) | Free, MIT, runs in the browser too |
| [Piskel](https://github.com/piskelapp/piskel) | Free, Apache-2.0, browser |
| [Lospec palettes](https://lospec.com/palette-list) | Free palette library |
| [Kenney packs](https://kenney.nl/support) | CC0, attribution optional. Suited to tile puzzles: [1-Bit Pack](https://kenney.nl/assets/1-bit-pack), [Tiny Dungeon](https://kenney.nl/assets/tiny-dungeon), [Micro Roguelike](https://kenney.nl/assets/micro-roguelike) |

The repo is public, so CC0 assets can be committed and CC-BY assets need a credit. Paid itch packs often forbid redistributing the raw files; check each licence.

### Generative AI

- Game Off 2026 allows AI and asks about it at submission ([GitHub blog](https://github.blog/open-source/gaming/game-off-2026-the-theme-is-shift/)). GMTK bans generative art and audio ([GMTK 2025](https://itch.io/jam/gmtk-2025)).
- itch.io tags assets "Generative AI" or "No AI" ([Game Developer](https://www.gamedeveloper.com/production/itch-wants-asset-creators-to-disclose-when-they-ve-used-generative-ai)). Since Nov 2026 players can filter games by that disclosure ([Engadget](https://www.engadget.com/2305699/itchio-adds-a-filter-for-games-with-gen-ai-disclosures/)).
- Every Graphics winner below whose page showed the AI field declared "No generative AI". No study of rating impact was found.

## 2. What wins Graphics in Game Off

Graphics top 3 ([2025](https://itch.io/jam/game-off-2025/results/graphics), [2024](https://itch.io/jam/game-off-2024/results/graphics)):

| Year / rank | Game | Team | Style |
|---|---|---|---|
| 2025 #1 | [Ooqo](https://aznoqmous.itch.io/ooqo) | Solo dev, plus a music credit | Isometric tiles on dark, few pastel accents. Tile puzzle, also #1 Gameplay. Procreate + Photoshop, about 2 weeks |
| 2025 #2 | [A Kingdom Slightly Out Of Tune](https://flavedogame.itch.io/wave) | 4, one artist | Hand-drawn pastel cartoon |
| 2025 #3 | [Within Rotation](https://vine-moss-games.itch.io/within-rotation) | Studio | Flat painterly shapes on one strong colour |
| 2024 #1 | [Museum Servivit](https://stardice-games.itch.io/museum-servivit) | 11, art director + 2 artists | Hand-drawn watercolour |
| 2024 #2 | [The Secret Funeral](https://magicalyuto.itch.io/mystery-of-funeral) | Solo | Photographed papercraft collage |
| 2024 #3 | [Dead Color](https://elymal.itch.io/dead-color) | Solo | Painterly visual novel |

- 5 of the 2025 Graphics top 10 are puzzles. Others in that top 10: [BEACON](https://icd-icd.itch.io/beacon) (dark pixel art with coloured glow), [Tidal Town](https://grumelkeks.itch.io/tidaltown) (soft pastel pixel grid puzzle).
- One- or two-colour entries placed high: [Trail of Secrets](https://grumelkeks.itch.io/trail-of-secrets) (lime on black, 2024 #1 Overall), [Nocturne](https://sunspoken.itch.io/nocturne) (teal on black, 2024 Graphics #10), [Evaw](https://wafflenaut-games.itch.io/evaw) (neon line art on black, 2025 #1 Overall).
- Solo Graphics winners are art-first developers. No winner credited an asset pack.
- A highly placed jam game's postmortem names "a distinct or striking art style", changing palettes and "smooth level transitions" as what players praised ([7 Seconds to Live](https://zachu.itch.io/7-seconds-to-live/devlog/1617009/7-seconds-to-live-post-jam-postmortem)). Cohesion and motion matter more than detail.

## 3. Reference games

| Game | Look | How it was made |
|---|---|---|
| Patrick's Parabox | Abstract flat colour | "Programmer art but with a bunch of iteration"; outlines, glow and squish were tried and dropped; the shrink/grow animation is the payoff ([IGF interview](https://www.gamedeveloper.com/business/road-to-the-igf-patrick-traynor-s-i-patrick-s-parabox-i-)) |
| Thomas Was Alone | Coloured rectangles, each a character with one ability | Minimalist visuals ([PocketGamer.biz](https://www.pocketgamer.biz/a-tale-of-friendship-the-making-of-thomas-was-alone)); closest precedent for switching between bodies |
| Baba Is You | Wobbly sprites on black | 3 wobble frames per sprite ([modding guide](https://github.com/cg5-/baba-modding-guide), [interview](https://gamepilgrim.com/2019/04/06/developer-interview-hempuli-oy/)) |
| Hue | Objects vanish when they match the background hue | Added a symbol system for colour-blind players ([Standard](https://www.standard.co.uk/news/tech/hue-game-developer-henry-hoffman-talks-awards-colourblindness-and-the-soundtrack-a3337096.html)); direct precedent for Body Hop's tint |

## 4. Accessibility for red/blue

[Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/ensure-no-essential-information-is-conveyed-by-a-fixed-colour-alone): red-green colour blindness affects about 8 to 10% of males, and red often looks darker to them. Colour must back up a symbol, pattern or shape, never carry meaning alone. For Body Hop that means a pattern per colour (for example stripes for red, dots for blue), different brightness for red and blue tiles, and a body silhouette that says who you are without colour.

## 5. Style candidates

| | Style | Look | References | Effort for one beginner |
|---|---|---|---|---|
| A | Flat Lens | Flat rounded shapes on a calm grid, a silhouette per body, a full-screen colour wash on each hop, eased movement | Parabox, Thomas Was Alone, Trial of Wasdo | Low, 2 to 3 days, all canvas code |
| B | Two-Tone Body | Low-res pixel art; each body swaps the whole palette (guard: red on dark, cat: blue on dark) | Trail of Secrets, Nocturne, Evaw | Medium, 3 to 5 days |
| C | Wobble Ink | Hand-wobbly outlines on black, redrawn every 200 ms from seeded jitter | Baba Is You | Medium, 3 to 4 days, no drawing skill needed |
| D | Marker Sketch | Hand-drawn sprites with paper texture | 2024 Graphics top 10 | High, 5 to 7 days; uses all remaining time |

A, B and C can stay entirely in canvas code: no image files, no generative AI, and the `file://` build keeps working. Whichever is chosen, the colour patterns and movement animation from sections 2 and 4 apply.
