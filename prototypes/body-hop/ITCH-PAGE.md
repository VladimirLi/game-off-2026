# Body Hop: itch.io page draft

Text for the owner to paste into the itch.io project page. Nothing here is uploaded or published. Everything between the two lines is page text; the screenshot list after it is for you.

---

# Body Hop

**Each body sees one colour, and only what it sees is real.**

You are a spirit loose in a building at night. You can't open anything and you can't pass anything, but you can walk into a sleeping body and become it. The guard sees red, so red crates are solid to him and blue gems are thin air. The cat sees blue, so it's the other way round. Every hop repaints the room in the new body's colour, and the walls you stood behind a moment ago may no longer be there.

There's a catch. The body you leave stays where you left it, asleep, and it gets in the way. Every body takes up its tile, nothing walks through a body, and you can only hop into a body standing next to you. So the real puzzle is not who to become, but where to leave each one.

A turn-based puzzle game for the browser: 12 main levels, plus 6 harder ones in the optional Night shift chapter. Nothing ever dies, and undo is always one key away.

## How to play

- Walk one tile per turn. Walk into a body next to you to hop into it.
- **The spirit** sees no colour: every block is fog, and fog is a wall. It also weighs nothing. Your first hop uses it up for good.
- **The guard** sees red: red crates are walls, blue gems are floor.
- **The cat** sees blue: blue gems are walls, red crates are floor.
- **Plates and gates:** a body on a plate holds every gate open, even while it sleeps. A body standing in a gate also keeps every gate open.
- Reach the exit in any body to win. Each level has a par (the fewest turns it can be done in); match it to earn a star.

## Controls

**Keyboard**
- Arrows or WASD: walk, or hop into a body
- Z or Backspace: undo. R: restart
- N, Enter or Space: next level after a win
- H: hint. L: how to play
- Esc or P: menu (level select, sound, music, feedback). M: music on or off

**Touch (phone or tablet)**
- An arrow pad and buttons (Hint, Help, Undo, Restart, Menu, Next) appear on screen. Tapping a board tile also walks one step toward it.
- Holding a phone upright gives you a tall layout.

Sound starts with your first key press or tap.

## Theme: SHIFT

The game has one verb, the hop, and it shifts two things at once: who you are, and what the world is made of. Hop into the guard and the room repaints itself in his colours: the red crate in front of you is solid now, and the blue gem beside it is only a dotted outline. Hop into the cat and it flips: the crate fades to a dotted outline and you walk straight through it. Gates open and shut as bodies shift on and off plates, and the later levels are about shifts in the other sense: handing a job from one body to the next. You start your shift, and at the end you clock out.

## Credits

- Design and direction: Vladimir Li
- Sound effects: [ZzFX](https://github.com/KilledByAPixel/ZzFX) by Frank Force (MIT licence)
- Art, music and sound are all generated in code. There are no image or audio files.
- Made for [GitHub Game Off 2026](https://itch.io/jam/game-off-2026). Source: [github.com/VladimirLi/game-off-2026](https://github.com/VladimirLi/game-off-2026)

## AI disclosure

Research, ideation and game code were produced with Claude (Anthropic) under my direction; design decisions and playtesting are mine. Declared per the Game Off rules.

## Privacy

The browser version sends anonymous play events (level, turns, keys pressed, time, device type, and whether the level was solved) so I can see where players get stuck. No cookies, no account, and IP addresses are discarded. Switch it off under Play stats in the pause menu (Esc).

---

## Screenshots to take (for the owner)

Take them from the live build at the jam window size, with the keyboard layout (a computer, not a phone), so the side panel shows the body, the block legend and the hint. `?level=N` opens a level directly (add `&dev=1` on the live site so your own play stays out of the stats). The solver route for each level is printed by `node tools/solve.js plan N`.

1. **Title screen**, while the logo's colour runs across the letters (it says "EACH BODY SEES ONE COLOUR"). Plain visit, no `?level`. Use it as the cover image too, cropped to 630 x 500.
2. **Level 1 "First hop", just after the hop**: the spirit has walked into the guard, the room has repainted in the guard's colours, and the blue gem in the way is now a dotted outline. Route `URRRDRRR`: the 4th press (`R`) hops into the guard; screenshot straight after it.
3. **Level 2 "Dashed means not there", the cat inside a red block**: the cat walking through the red blocks beside the exit, the guard asleep behind it. Route `DDDRRRRRUUULL`; screenshot after the 12th press (one step from the exit).
4. **Level 5 "Paperweight", the guard parked on the plate**: the plate lit green, the gate's bars up, the cat on its way to the gate. Route `RRRLLDRRDD`; screenshot after the 8th press.
5. **The end screen "YOU GOT OUT!"** with the Shift report and the "CLOCKED OUT" stamp: win level 12 (`?level=12&dev=1`, route from `node tools/solve.js plan 12`) and press N. Optional.

Optional sixth: a phone held upright, on any level, to show the touch pad. Only add it if the shot is taken on a real phone.
