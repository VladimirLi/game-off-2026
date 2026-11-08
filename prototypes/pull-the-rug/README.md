# Pull the Rug (grey box)

Shortlist rank 3 (idea M35). You never touch the objects. You pull the rugs they stand on.
Light objects (small coloured squares) ride the rug. Heavy objects (large dark squares) stay put, and the rug slides out from under them.

Run: `godot --path .` (Godot 4.7.2, gl_compatibility, fixed 960x540).

## Controls

Click a rug, then press an arrow key or drag to pull it one cell. Z undo, R restart, N next room.

## Rules as built

- 10x8 grid. Rugs are 2 to 4 cell rectangles and never overlap.
- A pull fails if the rug's new cells hit the edge, a wall, another rug, or any object. A rug cannot slide under anything.
- A pull also fails if a riding light object would move into a heavy object on the same rug.
- Heavy objects left behind flash yellow for half a second. A blocked pull flashes the rug outline red.
- Goal: every light object on the outline of its colour.
- Six rooms. Each starts from a solved layout and applies K reverse pulls, each verified by simulating the forward pull, so every room is solvable. Rugs rise 2 to 5 and K rises 3 to 13. Par shown is K. Seeds are fixed, so rooms are the same every run.
- Breadth-first search confirmed optimal solutions of 3, 4, 4, 4, 8 and 9 moves.

## Test question

Does "light rides, heavy stays" click instantly, without being told? And does the first unexpected rug slide-out, where a heavy object is left behind, get a reaction (a laugh, an "oh", a lean in)?
Do not explain the rule. After room 2, ask the tester to state it.

## What fun would look like

The tester starts planning in terms of the rule: "pull this rug out from under the safe first, then the vase can ride it over." Slide-outs become a tool rather than a surprise. The tester notices that a slide-out is one-way, because the rug cannot slide back under a heavy object, and starts treating it as a commitment. They want the tablecloth sound and a hover preview before the sound is even in.

If instead testers treat it as an awkward Sokoban and pull rugs at random until something lines up, the two weight classes are not doing work.
