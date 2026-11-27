# Game Off 2026 — theme: SHIFT

Solo entry for [GitHub Game Off 2026](https://itch.io/jam/game-off-2026) (theme **SHIFT**, due 1 Dec 2026): **Body Hop**, a turn-based browser puzzle game in plain HTML and JavaScript.

![Body Hop, level 2: the spirit hops into the guard, which walks through the blue block, then into the cat, which walks through the red blocks to the exit in 13 turns, at par.](prototypes/body-hop/media/body-hop.gif)

You are a spirit that hops between the bodies in a building. Each body sees one colour, and only what it sees is real. Bodies you leave behind stay where they are and get in the way, so the puzzle is where to leave each one. One verb, the hop, shifts who you are and what the world contains.

**Play:** [vladimirli.github.io/game-off-2026](https://vladimirli.github.io/game-off-2026/), or open `prototypes/body-hop/index.html` locally.

## Status

- 18 levels: 12 main levels and the optional Night shift chapter (X1 to X6), each checked by the solver.
- Tested by AI personas over seven level rounds and five art rounds; no human playtest yet.
- Sound is in: effects generated in code and a calm generative music track that shifts with the body you are in.
- Art is in: 8-bit pixel art and animation drawn in code; each body repaints the room in its colour. No title or end screen yet. Feature freeze 24 Nov, submit 30 Nov.

## Layout

| Path | What |
|---|---|
| `prototypes/body-hop/` | The game. Its [README](prototypes/body-hop/README.md) holds the rules, controls, levels and tools |
| `prototypes/body-hop/playtests/` | AI persona runs: session logs, interviews and analysis |
| `research/` | Primary-sourced notes: placing in Game Off, idea-to-shipped-game process, compelling puzzle design, Body Hop prior art. Notes from 7 Nov assume Godot or Bevy; the game is plain HTML and JavaScript |
| `.claude/` | Claude Code agents, hooks and checks used to build and test the game |

## Tooling

- Node.js for the checks, run from `prototypes/body-hop/`: `node tools/solve.js` (every level solvable at par) and `node tools/bot.js` (replays each solution as key presses in Chromium; needs `npm install` once).

## AI disclosure

Research, ideation and game code were produced with Claude (Anthropic) under my direction; design decisions and playtesting are mine. Declared per the Game Off rules.
