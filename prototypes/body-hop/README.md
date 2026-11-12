# Body Hop (grey box)

You are a spirit that hops between the bodies in a building. Each body sees one colour, and only what it sees is real. Bodies you leave behind stay where they are, asleep, and get in the way. Theme fit: one verb, the hop, shifts who you are and what the world contains.

This is a browser prototype in plain HTML and JavaScript, not Godot like the other prototypes. It needs no build step and runs from a file. The rules live in one file, `engine.js`. The game and the solver both load it, so the solver checks exactly the rules the game plays.

## Run

Open `index.html` in a browser (double-click works). `index.html?level=7` opens a level directly.

## Controls

- **Arrows or WASD:** walk one tile. Walking into a body hops into it. Each press is one turn.
- **Z or Backspace:** undo one turn. **R:** restart.
- **N:** next level, after a win. **Shift+N:** skip a level (playtest aid; it logs SKIPPED).
- **L:** show the legend over the board.
- The level buttons under the board jump to any level. A tick means solved on this machine.

The board marks each body next to you with a small white arrow (you can hop there). Things your current body cannot see are drawn as a dashed outline in their colour, so you still know they are there for others. The whole board takes on the tint of the body you are in, and the tint cross-fades on every hop.

## Rules (v2)

1. **One press, one turn.** Walk one tile, or walk into an orthogonally adjacent body to hop into it.
2. **Parked bodies.** Your old body stays where it is, asleep. Every body occupies its tile. Nothing walks through a body, and bodies are never pushed. You can hop back into a body you left, but only from a tile next to it.
3. **The spirit is used up by its first hop.** There is no "leave body" action.
4. **A hop is not a walk.** Only adjacency matters, so a guard can hop into a cat that is standing inside a red block.
5. **Colour vision.** A body's own colour is real to it, the other colour is not. A real block is a wall and an unreal block is floor. A real bridge is floor and an unreal bridge is a pit. The spirit sees no colour: every coloured thing is fog it cannot pass.
6. **Guard (sees red)** carries the key: locked doors are guard-only tiles. **Cat (sees blue)** is small: vents are cat-only tiles. Doors and vents keep no state.
7. **Plates and gates.** A body on a plate holds it down, parked or not. The spirit weighs nothing. Every gate in the level is open while any plate is held, and also while a body stands in a gate (a gate never closes on a body).
8. **Win** by stepping onto the exit in any form. There is no death: undo or restart.

| Tile | Spirit | Guard | Cat |
|---|---|---|---|
| floor, plate, exit | yes | yes | yes |
| red block `R` | no (fog) | no (wall) | yes |
| blue block `B` | no (fog) | yes | no (wall) |
| red bridge `r` | no (pit) | yes | no (pit) |
| blue bridge `b` | no (pit) | no (pit) | yes |
| locked door `D` | no | yes | no |
| vent `V` | no | no | yes |
| gate `\|` | while open | while open | while open |
| wall `#`, pit `~` | no | no | no |

## Levels

| # | Name | Teaches | Par (turns) | Hops | Solver checks |
|---|---|---|---|---|---|
| 1 | First hop | hopping; doors are guard-only | 7 | 1 | needs guard |
| 2 | Different eyes | the cat doesn't see red | 10 | 1 | needs cat |
| 3 | Through the wall | hop body to body; a hop only needs adjacency | 8 | 2 | needs both, door |
| 4 | Bridges | bridges exist only for their colour | 14 | 2 | needs both |
| 5 | Dead weight | plates, gates, a parked body as a weight; spirit weighs nothing | 9 | 2 | needs both, plate |
| 6 | Make way | parked bodies block; park where you can still hop back | 14 | 3 | needs both, re-entry |
| 7 | Relay | a cat asleep inside a wall is the only link from the plate to the guard | 18 | 4 | needs both, re-entry, plate, door |
| 8 | Light sleeper | a sleeping cat holds the gate open: walk the spirit through before you wake anyone | 18 | 3 | needs both, re-entry, plate, door |
| 9 | Middle of the bridge | a guard parked on its own bridge links two cats across a pit | 16 | 4 | needs both, re-entry, plate |
| 10 | Doorstop | a cat standing in one gate keeps every gate open, so the guard can leave the plate | 22 | 3 | needs both, re-entry, plate, door, doorstop |
| 11 | Night shift | finale: levels 8 and 10 together; stepping aside into the alcove now shuts the gate | 20 | 3 | needs both, re-entry, plate, door, doorstop |

Levels 8 to 11 were designed by a separate agent working from the design notes below, then re-checked with the same solver and the browser bot. `levels.js` is the source of truth; this table is a summary. Par is the optimal number of turns (walks plus hops) from the solver.

## Design notes (what the solver taught us)

- **Two bodies can never travel through a 1-wide corridor together.** You can only move the body you are in. Once it steps away, the other one is out of hop range. So a 1-tile bridge, a door or a vent lets exactly one body of a pair across, unless a third body is already waiting on the other side. Corridor width decides who can travel together.
- **In a 2-wide space a pair can leapfrog,** two moves per body per tile. It is legal but tedious. Levels that need much of it read as busywork, so start bodies where they are needed.
- **Every hop needs the two bodies to meet.** So the puzzle is really *where can these two bodies stand next to each other*, which differs per pair because of colour. A cat can stand inside a red block, next to a guard who never could.
- **A "cat-only plate" cannot stand alone.** If a guard can stand next to a plate (to take control back from the cat on it), the guard can also step onto it. To make a plate cat-only, wall it in with red blocks; then only another cat, standing inside the red, can be the link back (level 7).
- **Gates share one channel.** Any held plate opens every gate. A plate right next to a gate is a one-way door for a single body (step from the plate into the gate; the gate can't close on you). Keep plates two or more tiles from gates unless that is the point.
- **Without gates, the only irreversible move is the spirit's first hop.** Everything else can be walked or hopped back. So with no gates, a dead end comes only from picking the wrong first body. With gates, waking a body that holds a plate can shut a gate behind you (levels 8, 10 and 11 have 14 to 31% dead states; undo gets you out).
- **A body can start on a special tile** (the `on` field in `levels.js`): a cat asleep inside a red wall (level 7) or already on a plate (levels 8 and 11). A body that starts in place is the cheapest way to avoid leapfrogging.

## Tools

```
node tools/solve.js              # check every level: solvable, par, and each declared check (exit 1 on failure)
node tools/solve.js plan [n]     # optimal moves and a readable route per level
node tools/solve.js map.txt      # analyse a plain-text map: route, and which elements it really needs
node tools/gen.js 300000 1 9 7 GC  # random search for raw material (tries, seed, width, height, bodies)
node tools/bot.js [shot-dir]     # browser check: replay each solution as key presses in Chromium
```

The checks a level can declare: `needs:G` and `needs:C` (unsolvable without hopping into that body type), `reenter` (unsolvable if each body may be entered only once), `plate`, `door` and `doorstop` (unsolvable without that element). `solve.js` also reports the share of reachable states from which the exit is no longer reachable ("dead").

`tools/bot.js` uses Playwright. It replays the solver's route for each level as real key presses, checks the game reports a win in exactly par turns, then undoes every turn and checks it is back at the start. It also fails on any page error.

## Test question

Do players plan where to leave each body, or do they still just "pick the body that isn't blocked"? Watch for the moment a tester stops before a hop and looks at where the body they are leaving will end up.

## Log line

Each level prints one line to the browser console when it is completed, restarted, skipped or left:

```
Level 6 complete | turns 14 (par 14) | time 21.3 s | undos 0 | keys R R R U L D R x8
```
