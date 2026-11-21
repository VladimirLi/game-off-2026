# Body Hop (grey box)

You are a spirit that hops between the bodies in a building. Each body sees one colour, and only what it sees is real. Bodies you leave behind stay where they are, asleep, and get in the way. Theme fit: one verb, the hop, shifts who you are and what the world contains.

This is a browser game in plain HTML and JavaScript. It needs no build step and runs from a file. The rules live in one file, `engine.js`. The game and the solver both load it, so the solver checks exactly the rules the game plays.

## Run

Open `index.html` in a browser (double-click works). `index.html?level=7` opens a level directly.

## Controls

- **Arrows or WASD:** walk one tile. Walking into a body hops into it. Each press is one turn.
- **Z or Backspace:** undo one turn. **R:** restart.
- **N:** next level, after a win. **Shift+N:** skip a level (playtest aid; it logs SKIPPED).
- **L** (or the legend button in the footer): open the legend over the board. For each body it lists the tiles it can and cannot pass, drawn as that body sees them, it names the special tiles (wall, pit, vent, locked door, plate, gate, plus a body on a held plate next to a body in an open gate, so the two can be compared), and it shows the body markers (your white outline, "z" for asleep, the footprints and the yellow hop corners). It lies over the board (on a small board it may also cover the status line, never the touch pad) and scrolls inside itself if it does not fit. Press L again, or click or tap anywhere on it, to close it. While it is open every other game input (arrow, Z, R, N, Shift+N, a level button or a touch pad button) only closes it and does nothing else, so nothing happens on a board you cannot see. The status line then says so: "Legend closed. Press again to move." (or "to undo", "to restart", "for the next level", "to skip this level", "to go to level N"; the button for the level you are on says "to restart"; after a win an arrow gives "Legend closed. Press N for the next level.", and a key that would do nothing anyway just "Legend closed.", such as Z, R or the current level's button at turn 0). L and a click on the legend close it without a message.
- **Touch:** on a phone or tablet an arrow pad and Undo, Restart and Next level buttons appear under the board. Tap an arrow to move or hop. On a laptop, the "Touch controls" button in the footer shows them too.
- The level buttons under the board jump to any level. A tick means solved on this machine.

The body you are in has a white outline; every other body is asleep (a small "z"). Walking into a body always hops into it, so the board marks before you press which steps would hop: every body next to you gets yellow corner brackets on its tile and a yellow arrow on the edge between you, pointing into it (both have a dark edge, so they read on any tile). The body you most recently hopped out of carries a pair of white footprints with a dark edge in the top-left corner of its tile, so walking back into it is never a surprise, and the hop's status line says so (see below). Two feet replaced a single foot on a white disc: one AI persona (theo, round 6) read that as "a little white dot", and another (ruth, round 5) saw "a small circle" she did not understand at first. It is a shape, not a word, so it still reads on a phone, where the widest board scales to about 0.65; it sits on the tile diagonal, where it never touches a hop arrow (edge middles), a corner bracket or the "z" (top right). The footprints move to the new body on every hop, come back with undo, and are gone after a restart or a level change (a hop out of the spirit leaves no footprints: the spirit leaves no body). These marks differ from the white "you" outline, the green plate and gate frames and the red blocked flash by shape (corners, arrow, footprints), not by colour alone. After a win the hop marks are hidden. Things your current body cannot see are drawn as a dashed outline in their colour, so you still know they are there for others. The spirit sees no colour, so it can pass nothing coloured: it sees a red block or blue block in its full colour under grey diagonal bands (fog), and fog is a wall to the spirit. The legend says so: "red block (fog: a wall to the spirit)". The header names your body and what it sees: "guard: sees red, not blue", "cat: sees blue, not red", "spirit: sees no colour". The label keeps one width for every body, so a hop never moves the turn counter or the board. The legend and the messages always say "red block" and "blue block". The whole board takes on the tint of the body you are in, and the tint cross-fades on every hop.

Walls and pits never look alike, by brightness and shape rather than hue: a wall (`#`, the frame and every inner wall) is a raised block of light grey bricks with dark mortar, with a light lip along its top where open ground lies above it and a dark front face along its bottom where open ground lies below it. A pit is a flat black hole, with its far side showing as a dark band along the top where the tile above is not a hole.

Plates and gates show their state. A plate is a square slab in a dark groove, the same on all four sides. Empty, it is raised and grey; held, it sinks in, lights green and shows a dark bevel in each corner. A gate is a portcullis: two posts and a top beam, open at the bottom, with spiked bars. Shut, it is grey with the bars down to the floor; open, its posts and beam light the same green and the bars are pulled up under the beam with their spikes showing, so the floor shows through. A held plate and an open gate share the green, but a body on them never looks the same, by shape: a body on a held plate is ringed by a closed green square and the plate's flat green front lip is drawn over its feet; a body in an open gate has the posts at its sides, the raised spiked bars drawn over its head, and plain floor at its feet. A vent is round, not square: a grey rim around a dark hole with flat slats, so it never looks like a gate, whatever the colours. A locked door is a plank door in a dark frame with two iron bands and a steel padlock on the upper band, filling the tile, so it reads as a shut door and not as a key to pick up (the guard already carries the key).

The status line under the board names the body after every hop, and after a hop out of a body it also names the body you left and points at its footprints: "You are the cat now. Footprints mark the guard you left. Z to undo.", or "Back in the guard. Footprints mark the cat you left. Z to undo." when you walk into a body you were in before (an easy accident). The spirit's first hop leaves no body, so it just says "You are the guard now. Z to undo.". A refused press starts with "Blocked:" and says why, for example "Blocked: the cat can't cross a pit." Nothing ever dies.

A walk that changes the gates says so: "The gates open." or "The gates shut: no body on a plate or in a gate." ("The gate opens." and "The gate shuts: no body on a plate or in a gate." in a level with one gate). Walking into a shut gate gives "Blocked: the gate is shut. A body on a plate, or standing in a gate, opens it.". When the last body leaves a plate but a body in a gate keeps them open, it says "No body on a plate, but a body standing in a gate holds the gates open." When the spirit steps onto a plate: "You weigh nothing: the plate stays up." When a body walks onto a block of the colour it can't see: "The cat can't see red: the red block isn't there for it." (or "The guard can't see blue: the blue block isn't there for it."), on every such step. These can't clash with a hop line or a "Blocked:" line: a hop moves no body, so it never changes a plate or gate, and a refused press changes nothing. The win line replaces them. If one walk could trigger more than one, the order is gate change, then the doorstop line, then the spirit line, then the unseen-block line (the spirit line and the unseen-block line can't both apply: the spirit never stands on a block). The next walk clears the line, as it does a hop line.

## Rules (v2)

1. **One press, one turn.** Walk one tile, or walk into an orthogonally adjacent body to hop into it.
2. **Parked bodies.** Your old body stays where it is, asleep. Every body occupies its tile. Nothing walks through a body, and bodies are never pushed. You can hop back into a body you left, but only from a tile next to it.
3. **The spirit is used up by its first hop.** There is no "leave body" action.
4. **A hop is not a walk.** Only adjacency matters, so a guard can hop into a cat that is standing inside a red block.
5. **Colour vision.** A body's own colour is real to it, the other colour is not. A real block is a wall and an unreal block is floor. A real bridge is floor and an unreal bridge is a pit. The spirit sees no colour: every coloured thing is fog it cannot pass.
6. **Guard (sees red)** carries the key: locked doors are guard-only tiles. **Cat (sees blue)** is small: vents are cat-only tiles. Doors and vents keep no state.
7. **Plates and gates.** A body on a plate holds it down, parked or not. The spirit weighs nothing. All gates share one channel: every gate in the level is open while any plate is held, and also while a body stands in any gate. A body in one gate holds all of them open.
8. **Win** by stepping onto the exit in any form. There is no death: undo or restart.

| Tile | Spirit | Guard | Cat |
|---|---|---|---|
| floor, plate, exit | yes | yes | yes |
| red block `R` | no (fog: a wall) | no (wall) | yes |
| blue block `B` | no (fog: a wall) | yes | no (wall) |
| red bridge `r` | no (pit) | yes | no (pit) |
| blue bridge `b` | no (pit) | no (pit) | yes |
| locked door `D` | no | yes | no |
| vent `V` | no | no | yes |
| gate `\|` | while open | while open | while open |
| wall `#`, pit `~` | no | no | no |

## Levels

| # | Chapter | Name | Teaches | Par (turns) | Hops | Solver checks |
|---|---|---|---|---|---|---|
| 1 | Eyes | First hop | you are the white circle; walk into a body to become it; guards carry the key | 8 | 1 | needs guard, door |
| 2 |  | Dashed means not there | a red block is a wall to the guard (it sees red) and to you (fog is a wall to the spirit); the cat can't see red, so to the cat it is a dashed outline that isn't there | 13 | 2 | needs both, door |
| 3 |  | Cat's bridge | a blue bridge exists only for the cat; the guard sees a pit | 10 | 2 | needs both, door |
| 4 |  | Side by side | hop body to body from wherever you stand: a guard in a doorway, a cat inside a red block | 17 | 3 | needs both, door |
| 5 | Leftovers | Paperweight | a body left on a plate holds the gate; the spirit weighs nothing | 10 | 2 | needs both, plate |
| 6 |  | Step aside | parked bodies block; park where you can still hop back | 9 | 3 | needs both, re-entry, door |
| 7 |  | Who goes first | the first hop is the one move you can't undo: pick the right first body | 13 | 2 | needs both, plate |
| 8 |  | Bucket brigade | a chain of bodies is a route: control passes along adjacent bodies | 16 | 5 | needs both, plate, re-entry |
| 9 | Gates | Two gates | a body standing in a gate keeps every gate open, so the plate can be left empty | 9 | 2 | needs both, plate, doorstop |
| 10 |  | No trace | only the spirit leaves nothing behind: whoever wakes the boxed-in cat stands on its only way out, and a body would stay there | 12 | 3 | needs both, plate, re-entry |
| 11 |  | Lay-by | each body has its own waiting places: the guard waits inside a blue block, the cat inside a red one | 13 | 4 | needs both, re-entry |
| 12 |  | Changing of the guard | hand the plate from the guard to a cat: a second cat in the corner is the only link between the plate and the guard's way out | 19 | 6 | needs both, re-entry, plate, door |
| 13 (X1) | Night shift (optional) | The long way round | the first hop decides who can still reach whom: wake the courier, not the weight | 25 | 4 | needs both, re-entry, plate |
| 14 (X2) |  | Knot | control flows round a ring of sleepers: the cat that isn't in the way is the one that has to move | 23 | 8 | needs both, re-entry |
| 15 (X3) |  | Junction | the island in the pit is shared, but each body leaves it only by its own bridge: the cat on it goes down the blue bridge and has to walk all the way round to stand behind the guard | 34 | 6 | needs both, re-entry |
| 16 (X4) |  | Crossed colours | a 2x2 of red and blue is a room only a guard and a cat can share: the guard steps aside into its blue square, and only a cat already waiting in the red square below can take you out again | 28 | 5 | needs both, re-entry |
| 17 (X5) |  | Shift change | the cat that crosses holds the plate first; the weight relieves it from beside the gate | 28 | 6 | needs both, re-entry, plate, door |
| 18 (X6) |  | Go-between | two guards on opposite banks of a pit can never be next to each other; a cat on the blue bridge, beside a guard waiting inside a blue block, is the only link from the plate to the gate | 26 | 5 | needs both, re-entry, plate |

Levels 13 to 18 are the optional Night shift chapter, labelled X1 to X6 in the game. `levels.js` is the source of truth; this table is a summary. Par is the optimal number of turns (walks plus hops) and Hops the number of hops on the solver's route, both from `node tools/solve.js`.

## Design notes (what the solver taught us)

- **Two bodies can never travel through a 1-wide corridor together.** You can only move the body you are in. Once it steps away, the other one is out of hop range. So a 1-tile bridge, a door or a vent lets exactly one body of a pair across, unless a third body is already waiting on the other side. Corridor width decides who can travel together.
- **In a 2-wide space a pair can leapfrog,** two moves per body per tile. It is legal but tedious. Levels that need much of it read as busywork, so start bodies where they are needed.
- **With exactly two bodies, one plate can never be held by each of them in turn.** The body you did not hop into first is always parked on its starting chessboard colour, and the other on the opposite colour (checked on 600 random boards). A third body breaks this.
- **Every hop needs the two bodies to meet.** So the puzzle is really *where can these two bodies stand next to each other*, which differs per pair because of colour. A cat can stand inside a red block, next to a guard who never could.
- **A "cat-only plate" cannot stand alone.** If a guard can stand next to a plate (to take control back from the cat on it), the guard can also step onto it. To make a plate cat-only, wall it in with red blocks; then only another cat, standing inside the red, can be the link back (level 7).
- **Gates share one channel.** Any held plate opens every gate. A plate right next to a gate is a one-way door for a single body (step from the plate into the gate; the gate can't close on you). Keep plates two or more tiles from gates unless that is the point.
- **Without gates, the only irreversible move is the spirit's first hop.** Everything else can be walked or hopped back. So with no gates, a dead end comes only from picking the wrong first body. With gates, waking a body that holds a plate can shut a gate behind you; undo gets you out. `solve.js` prints the share of dead states for every level.
- **A body can start on a special tile** (the `on` field in `levels.js`): a guard already on a plate (level 12, the only level that uses it now). A body that starts in place is the cheapest way to avoid leapfrogging.

## Tools

```
node tools/solve.js              # check every level: solvable, par, and each declared check (exit 1 on failure)
node tools/solve.js plan [n]     # optimal moves and a readable route per level
node tools/solve.js map.txt      # analyse a plain-text map: route, and which elements it really needs
node tools/gen.js 300000 1 9 7 GC  # random search for raw material (tries, seed, width, height, bodies)
node tools/bot.js [shot-dir]     # browser check: replay each solution as key presses in Chromium
node tools/analyze-playtest.js <run>/sessions [notes] [--old-legend]  # score AI persona sessions against levels.js
```

The checks a level can declare: `needs:G` and `needs:C` (unsolvable without hopping into that body type), `reenter` (unsolvable if each body may be entered only once), `plate`, `door` and `doorstop` (unsolvable without that element). `solve.js` also reports the share of reachable states from which the exit is no longer reachable ("dead").

`tools/analyze-playtest.js` replays each session's keys through the engine, with the legend modelled as the page does it (while open, any key but L only closes it). Sessions played before 14 Nov 2026 (every run in `playtests/` up to `2026-11-14-r1`) were on a build where keys still acted under the legend: add `--old-legend` for those.

`tools/bot.js` uses Playwright. It replays the solver's route for each level as real key presses, checks the game reports a win in exactly par turns, then undoes every turn and checks it is back at the start. It also fails on any page error.

## Test question

Do players plan where to leave each body, or do they still just "pick the body that isn't blocked"? Watch for the moment a tester stops before a hop and looks at where the body they are leaving will end up.

## Log line

Each level prints one line to the browser console when it is completed, restarted, skipped or left:

```
Level 6 complete | turns 9 (par 9) | time 14.2 s | undos 0 | keys Rx2 D L U R Dx3
```
