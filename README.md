# Game Off 2026 — theme: SHIFT

Solo entry for [GitHub Game Off 2026](https://itch.io/jam/game-off-2026) (theme **SHIFT**, due 1 Dec 2026), built in Godot 4.7.2 with GDScript, browser-first.

This repo holds the whole process, not just the game: the research that shaped it, the idea funnel, the grey-box prototypes that were tried and rejected, and the game itself.

## Status

Week 1, prototyping. Frontrunner: **Drag the margin**, a platformer on a paragraph of text where dragging the right margin reflows the words under you.

## Layout

| Path | What |
|---|---|
| `research/` | Primary-sourced notes: how to place in Game Off, idea-to-shipped-game process, theme-to-idea methods, and the filtered shortlist from 187 generated ideas |
| `prototypes/` | Grey-box prototypes (rectangles only, no art, no sound). Each has a README with the question it tests and the verdict. Run one with `godot --path prototypes/<name>`, except body-hop, which is plain HTML: open its `index.html` |
| `game/` | The entry itself (to come) |

## Prototype verdicts

| Prototype | Verdict |
|---|---|
| drag-the-margin | Frontrunner. Readable at once; difficulty is a level-design dial. In iteration |
| body-hop | Contender. Possess bodies that each see one colour; parked bodies make placement the puzzle. Browser grey box, 11 solver-checked levels, not yet played by people |
| insert-a-row | Confusing in play. Benched |
| pull-the-rug | Confusing in play. Benched |
| rulebender | Too complicated (18 rule bits). Out |
| selection-pressure | Out on prior art (several evolving-enemy tower defences exist) |
| tell | Out: theme in fiction only, random play beats the predictor |
| slide-the-row | Out on prior art (six close jam games) |

## Tooling

- Godot 4.7.2 (`brew install --cask godot`)
- Prototypes verify with `godot --headless --path <dir> --quit-after 180` (expect only the engine banner)

## AI disclosure

Research, ideation and prototype code were produced with Claude (Anthropic) under my direction; design decisions and playtesting are mine. Declared per the Game Off rules.
