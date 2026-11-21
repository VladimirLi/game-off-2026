# Art round 1: blind AI persona test of the 8-bit art (21 Nov 2026)

AI persona, not a human playtest. Every tester was a fresh omp subagent (default model) with no context about the game and was told to read only the files or URL in its task. Build: the `art` worktree with the colour-only tile set (doors, vents, bridges and pits shown as their colour-block twins).

| Testers | What they saw | Asked |
|---|---|---|
| SeeA1-3 | `images/c1.png`-`c6.png`, canvas only, no text | who you control, where the goal is, what each object is, what changed between shots |
| ExitStairs/Sign/Portal/Beacon 1-2 | one image each (`x-*.png`, level 3 with one exit design) | where the goal is, with confidence |
| ExitCompare | all four `x-*.png` | rank the exits for clarity and fit |
| PlayerA | played levels 1-4 in headless Chromium | visual confusions |
| PlayerB | played levels 5-8 | visual confusions |

Note: c2 in this round was taken one press early (the spirit had not hopped yet).

## Findings

- **Exit:** the EXIT sign over a lit door was the only design named "exit door" with confidence 5/5 (2 of 2). Stairs, beacon and portal got 4/5 and were also read as a treasure chest, a coin or a power-up. ExitCompare ranked sign first for clarity.
- **Who you are:** the arrow above your body and the yellow corner brackets on hop targets both read as "selected" (3 of 3 viewers). The arrow sat in the tile above the body and was read as pointing at that tile.
- **Footprints** on the body you left read as wings, a halo, specks or a glitch (5 of 5 who mentioned them).
- **Grey fog blocks** (spirit view) read as glass, crates or grates; nobody linked them to the red and blue blocks. The bright blue block read as water and the red block as lava.
- **Open gate** looked shut in screenshots from a hidden tab (no animation frames ran, so the bars never rose).
- **Floor and wall** were hard to tell apart in the guard's red view.
- **Plate** read as a box or safe; a body on it hid it completely.
- **A body standing in a block** hid the block.
- Liked: the whole room recolouring per body, the dotted outline for "not there for me", the sprites, the z for asleep.

## Changes made after round 1

Exit is the EXIT sign over a lit door (now one framed unit). You: yellow sprite outline and a pulsing yellow ring at the feet (arrow removed). Hop targets: a yellow chevron on the shared edge (corner brackets removed). Footprints removed. Solid blocks bevelled with a darker pattern; fog blocks tinted toward their colour with mist wisps on top. Floors lighter and walls darker in every lens. Plate is a full-tile slab whose green rim shows around a body. Open gate: no bars, green beam and posts; shut: heavy bars, red lamps. The dotted outline sits at the tile edge so it shows around a body. The board redraws its settled state on timers too.
