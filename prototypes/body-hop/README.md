# Body Hop

You are a spirit that hops between the bodies in a building. Each body sees one colour, and only what it sees is real. Bodies you leave behind stay where they are, asleep, and get in the way. Theme fit: one verb, the hop, shifts who you are and what the world contains.

This is a browser game in plain HTML and JavaScript. It needs no build step and runs from a file. The rules live in one file, `engine.js`. The game and the solver both load it, so the solver checks exactly the rules the game plays.

## Run

Open `index.html` in a browser (double-click works). `index.html?level=7` opens a level directly. To deploy, copy `index.html`, `engine.js`, `levels.js`, `audio.js` and `pixel-art.js` together (or build one self-contained page with `node tools/build-page.js out.html`, which inlines all four scripts).

## Controls

- **Arrows or WASD:** walk one tile. Walking into a body hops into it. Each press is one turn.
- **Z or Backspace:** undo one turn. **R:** restart.
- **N:** next level, after a win. **Shift+N:** skip a level (playtest aid; it logs SKIPPED).
- **L** (or the legend button in the footer): open the legend over the board. For each body it lists the tiles it can and cannot pass, drawn as that body sees them, it names the special tiles (wall, red and blue block, plate, gate, exit), and it shows the body markers (your yellow outline and ring, "z" for asleep, the yellow hop arrow). It lies over the board (on a small board it may also cover the status line, never the touch pad) and scrolls inside itself if it does not fit. Press L again, or click or tap anywhere on it, to close it. While it is open every other game input (arrow, Z, R, N, Shift+N, a level button or a touch pad button) only closes it and does nothing else, so nothing happens on a board you cannot see. The status line then says so: "Legend closed. Press again to move." (or "to undo", "to restart", "for the next level", "to skip this level", "to go to level N"; the button for the level you are on says "to restart"; after a win an arrow gives "Legend closed. Press N for the next level.", and a key that would do nothing anyway just "Legend closed.", such as Z, R or the current level's button at turn 0). L and a click on the legend close it without a message.
- **Touch:** on a phone or tablet an arrow pad and Undo, Restart and Next level buttons appear under the board. Tap an arrow to move or hop. On a laptop, the "Touch controls" button in the footer shows them too.
- **M** (or the "Music on/off" button in the footer): music on or off. The "Sound on/off" button switches the sound effects. Both are saved on this machine. M is not a game input, so it never closes the legend.
- The level buttons under the board jump to any level. A tick means solved on this machine.

The header names your body and what it sees: "guard: sees red, not blue", "cat: sees blue, not red", "spirit: sees no colour". The label keeps one width for every body, so a hop never moves the turn counter or the board.

## Art

8-bit pixel art, drawn in code by `pixel-art.js` (no image files): every tile is 16 x 16 art pixels in an NES-like palette, scaled up 4x with no smoothing. The style was chosen from mockups and tuned over five rounds of blind AI persona tests (`playtests/2026-11-21-art-r1` to `-r5`; research in `research/body-hop-art.md` at the repo root).

- **The lens:** each body repaints the floor and walls: grey for the spirit, brown for the guard, blue for the cat. Floors stay light and walls dark in every lens. A hop recolours the room in four quick steps.
- **You:** a yellow outline round the sprite and a pulsing yellow ring at its feet. Every other body sleeps (closed eyes and a "z") with a shadow under it. A second or third body of one kind gets its own collar (cat) or badge (guard) colour.
- **Hop targets:** a yellow arrow on the edge between you and each body next to you, pointing into it. Walking that way hops in.
- **Red and blue blocks** differ by pattern and shape as well as colour, so they read without colour: a red block is a square crate with diagonal stripes, a blue block a gem with cut corners and dots. A block your body sees is raised and solid (bevelled top, front face, shadow). A block it can't see is a dotted outline in its colour over a faint checker, slowly marching: it is there for someone else. The spirit sees neither colour: both are mist, still tinted toward their colour and still striped or dotted, with wisps on top, and mist is a wall to the spirit. A body standing inside a block keeps the block visible: the dotted edge over it, or the block's front lip over its legs when the block is solid to you.
- **Plate:** a flat plate set in the floor with a ring on it. Held, it lights green and a green lip shows round the body standing on it.
- **Gate:** a portcullis. Shut: heavy bars to the floor and red lamps. Open: the bars pulled up into the beam and green lamps. A body standing in a gate is drawn under its beam, between its posts.
- **Exit:** an open, lit doorway under a green EXIT sign. With a wall above it the sign hangs on the wall and the door fills its tile; otherwise sign and door share the tile.
- **Walls and floor:** bricks with the odd lighter or darker brick, a lit cap where a wall's top meets floor and a front face where its bottom does; floor tiles with soft seams, pebbles or a crack, and a shadow along walls above or to the left.

**Animation** is worked out from the game state each frame (the drawing never changes the game): a walk slides one tile with stepping legs and a one-pixel hop, facing the way it moves; a hop sends a gold spark from the body you leave to the one you enter, repaints the room and lands with a squash; a plate sinks and lights as a body arrives on it, and the gate bars rise once every walk has landed (they drop faster than they rise); a refused press nudges your body two pixels with a puff of dust while the tile you pushed against blinks red; a win sinks the body down into the exit, then a flash and a ring of light. The settled picture is also drawn on timers after each change, so a hidden tab with no animation frames still shows the truth.

The status line under the board names the body after every hop: "You are the cat now. Z to undo.", or "Back in the guard. Z to undo." when you walk into a body you were in before (an easy accident). A refused press starts with "Blocked:" and says why, for example "Blocked: the guard sees red, so the red block is a wall to it." Nothing ever dies.

A walk that changes the gates says so: "The gates open." or "The gates shut: no body on a plate or in a gate." ("The gate opens." and "The gate shuts: no body on a plate or in a gate." in a level with one gate). Walking into a shut gate gives "Blocked: the gate is shut. A body on a plate, or standing in a gate, opens it.". When the last body leaves a plate but a body in a gate keeps them open, it says "No body on a plate, but a body standing in a gate holds the gates open." When the spirit steps onto a plate: "You weigh nothing: the plate stays up." When a body walks onto a block of the colour it can't see: "The cat can't see red: the red block isn't there for it." (or "The guard can't see blue: the blue block isn't there for it."), on every such step. These can't clash with a hop line or a "Blocked:" line: a hop moves no body, so it never changes a plate or gate, and a refused press changes nothing. The win line replaces them. If one walk could trigger more than one, the order is gate change, then the doorstop line, then the spirit line, then the unseen-block line (the spirit line and the unseen-block line can't both apply: the spirit never stands on a block). The next walk clears the line, as it does a hop line.

## Rules (v3)

1. **One press, one turn.** Walk one tile, or walk into an orthogonally adjacent body to hop into it.
2. **Parked bodies.** Your old body stays where it is, asleep. Every body occupies its tile. Nothing walks through a body, and bodies are never pushed. You can hop back into a body you left, but only from a tile next to it.
3. **The spirit is used up by its first hop.** There is no "leave body" action.
4. **A hop is not a walk.** Only adjacency matters, so a guard can hop into a cat that is standing inside a red block.
5. **Colour vision.** The guard sees red, the cat sees blue. A body's own colour is real to it, the other colour is not: a real block is a wall and an unreal block is floor. The spirit sees no colour: every block is fog it cannot pass.
6. **Plates and gates.** A body on a plate holds it down, parked or not. The spirit weighs nothing. All gates share one channel: every gate in the level is open while any plate is held, and also while a body stands in any gate. A body in one gate holds all of them open.
7. **Win** by stepping onto the exit in any form. There is no death: undo or restart.

| Tile | Spirit | Guard | Cat |
|---|---|---|---|
| floor `.`, plate `_`, exit `E` | yes | yes | yes |
| red block `R` | no (fog: a wall) | no (wall) | yes |
| blue block `B` | no (fog: a wall) | yes | no (wall) |
| gate `\|` | while open | while open | while open |
| wall `#` | no | no | no |

Up to 21 Nov 2026 the game also had locked doors, vents, red and blue bridges and pits. Each played exactly like a colour block or a wall (a door or a red bridge like a blue block, a vent or a blue bridge like a red block, a pit like a wall), so they were cut: every level kept its route, par and state count.

## Levels

| # | Chapter | Name | Teaches | Par (turns) | Hops | Solver checks |
|---|---|---|---|---|---|---|
| 1 | Eyes | First hop | you are the ghost; walk into a body to become it; another body can pass what stops you | 8 | 1 | needs guard |
| 2 |  | Dashed means not there | a red block is a wall to the guard (it sees red) and to you (fog is a wall to the spirit); the cat can't see red, so to the cat it is a dashed outline that isn't there | 13 | 2 | needs both |
| 3 |  | Hand-off | hop from body to body: the guard carries you through blue to the cat, and the cat carries you through red | 10 | 2 | needs both |
| 4 |  | Side by side | hop body to body from wherever you stand: a guard inside a blue block, a cat inside a red block | 17 | 3 | needs both |
| 5 | Leftovers | Paperweight | a body left on a plate holds the gate; the spirit weighs nothing | 10 | 2 | needs both, plate |
| 6 |  | Step aside | parked bodies block; park where you can still hop back | 9 | 3 | needs both, re-entry |
| 7 |  | Who goes first | the first hop is the one move you can't undo: pick the right first body | 13 | 2 | needs both, plate |
| 8 |  | Bucket brigade | a chain of bodies is a route: control passes along adjacent bodies | 16 | 5 | needs both, plate, re-entry |
| 9 | Gates | Two gates | a body standing in a gate keeps every gate open, so the plate can be left empty | 9 | 2 | needs both, plate, doorstop |
| 10 |  | No trace | only the spirit leaves nothing behind: whoever wakes the boxed-in cat stands on its only way out, and a body would stay there | 12 | 3 | needs both, plate, re-entry |
| 11 |  | Lay-by | each body has its own waiting places: the guard waits inside a blue block, the cat inside a red one | 13 | 4 | needs both, re-entry |
| 12 |  | Changing of the guard | hand the plate from the guard to a cat: a second cat in the corner is the only link between the plate and the guard's way out | 19 | 6 | needs both, re-entry, plate |
| 13 (X1) | Night shift (optional) | The long way round | the first hop decides who can still reach whom: wake the courier, not the weight | 25 | 4 | needs both, re-entry, plate |
| 14 (X2) |  | Knot | control flows round a ring of sleepers: the cat that isn't in the way is the one that has to move | 23 | 8 | needs both, re-entry |
| 15 (X3) |  | Junction | the cat between the two blue blocks can leave only downwards, through the red block, and has to walk all the way round to stand behind the guard | 34 | 6 | needs both, re-entry |
| 16 (X4) |  | Crossed colours | a 2x2 of red and blue is a room only a guard and a cat can share: the guard steps aside into its blue square, and only a cat already waiting in the red square below can take you out again | 28 | 5 | needs both, re-entry |
| 17 (X5) |  | Shift change | the cat that crosses holds the plate first; the weight relieves it from beside the gate | 28 | 6 | needs both, re-entry, plate |
| 18 (X6) |  | Go-between | two guards on opposite sides of the wall can never be next to each other; a cat in the red blocks, beside a guard waiting inside the far blue block, is the only link from the plate to the gate | 26 | 5 | needs both, re-entry, plate |

Levels 13 to 18 are the optional Night shift chapter, labelled X1 to X6 in the game. `levels.js` is the source of truth; this table is a summary. Par is the optimal number of turns (walks plus hops) and Hops the number of hops on the solver's route, both from `node tools/solve.js`.

## Design notes (what the solver taught us)

- **Two bodies can never travel through a 1-wide corridor together.** You can only move the body you are in. Once it steps away, the other one is out of hop range. So a 1-tile gap only one colour can pass lets exactly one body of a pair across, unless a third body is already waiting on the other side. Corridor width decides who can travel together.
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

The checks a level can declare: `needs:G` and `needs:C` (unsolvable without hopping into that body type), `reenter` (unsolvable if each body may be entered only once), `plate` and `doorstop` (unsolvable without that element). `solve.js` also reports the share of reachable states from which the exit is no longer reachable ("dead").

`tools/analyze-playtest.js` replays each session's keys through the engine, with the legend modelled as the page does it (while open, any key but L only closes it). Sessions played before 14 Nov 2026 (every run in `playtests/` up to `2026-11-14-r1`) were on a build where keys still acted under the legend: add `--old-legend` for those.

`tools/bot.js` uses Playwright. It replays the solver's route for each level as real key presses, checks the game reports a win in exactly par turns, and checks that `window.BodyHopAudio.log` holds a `win` cue and, when the route hops, a `hop:` cue (it reads which cues were requested; it can't hear them). Then it undoes every turn and checks it is back at the start. It also fails on any page error.

## Sound

All sound is made in code by `audio.js`: no audio files, nothing downloaded. Browsers allow sound only after a user gesture, so it starts on the first key press, click or tap. It pauses while the tab is hidden.

**Sound effects** are [ZzFX](https://github.com/KilledByAPixel/ZzFX) sounds (by Frank Force, MIT licence; its notice is kept in `audio.js`). Each is a parameter array in the `SOUNDS` table at the top of `audio.js`, and `CUES` maps game events to them. A walk plays the step plus at most one extra, the most specific one (gate change, then plate, then unseen block).

| Cue | When |
|---|---|
| `step:S`, `step:G`, `step:C` | a walk: a soft breath for the spirit, a low thud for the guard, a light patter for the cat (slightly different pitch every time) |
| `hop:G`, `hop:C` | a hop: a whoosh that lands on a low D (guard) or a high D (cat); `hop:G:back` and `hop:C:back` ("Back in the ...") land on the D and rise to the A |
| `blocked` | a refused press: a soft dull bump |
| `gate-open`, `gate-shut` | the gates open (rising) or shut (falling) |
| `plate-down`, `plate-up` | a body steps onto a plate, or off it |
| `plate-ghost` | the spirit on a plate ("You weigh nothing"): a faint hollow tick |
| `shimmer` | the cat walks into red, or the guard into blue |
| `win`, `start`, `restart`, `undo`, `ui` | a low D major arpeggio (D3 to D4) over a gentle swell of the music, a soft low level-start chime (A3, D4), a rewind sweep, a descending blip, a very quiet tick (legend, level buttons, sound switches) |

To tune a sound, paste its array into the [ZzFX designer](https://killedbyapixel.github.io/ZzFX) as `zzfx(...[ ... ])`, change it there, and copy the array back. The randomness value (second number) is applied as a small pitch change each time the sound plays. Keep repeated sounds (steps, blocked) quieter than rare ones.

**Music** is one calm ambient track generated live (no loop, so no seam): a soft pad and sparse slow notes from D major pentatonic at 72 bpm, through a generated reverb. It stays low and mellow: sines and low-passed triangles, slow note attacks, no note above 800 Hz. Each body has its own layer in about the same register, told apart mainly by colour, and a hop drifts to it over about 2 s: the spirit's is plain sines on D3/A3/D4 with long gaps; the guard's is the darkest, triangles on D3/A3 under a low low-pass with a hint of sub bass and slow notes; the cat's is the brightest but still mellow, on A3/D4/F#4 with a more open low-pass and slightly more frequent notes. A level change (next, skip, restart, a level button) never cuts the music: it dips by about 6 dB and comes back over about 2 s while it drifts to the spirit's layer. A win swells it gently for a couple of seconds. The music sits well under the sound effects. Its layers are the `LAYERS` table in `audio.js`.

`window.BodyHopAudio.log` lists the last 100 cues the game requested (plus `body:G` and the like when the music changes body), for automated checks.

## Test question

Do players plan where to leave each body, or do they still just "pick the body that isn't blocked"? Watch for the moment a tester stops before a hop and looks at where the body they are leaving will end up.

## Log line

Each level prints one line to the browser console when it is completed, restarted, skipped or left:

```
Level 6 complete | turns 9 (par 9) | time 14.2 s | undos 0 | keys Rx2 D L U R Dx3
```
