# Art round 2: blind AI persona test after the round 1 fixes (21 Nov 2026)

AI persona, not a human playtest. Fresh omp subagents (default model), no game context, told to read only the files or URL in their task.

| Testers | What they saw |
|---|---|
| SeeB1-3 | `images/c1.png`-`c8.png`, canvas only: 4 levels, all three bodies |
| ArtCritic | the same images, as a pixel-art director |
| PlayerC | played levels 1-4 |
| PlayerD | played levels 9-12 |

## Scores against round 1

| Question | Round 1 | Round 2 |
|---|---|---|
| Names the body you control, all shots | 13 of 18 | 24 of 24 |
| Finds the exit | 18 of 18, confidence about 4 | 12 of 12, confidence 4.5 |
| Reads the hop marker as "jump into this body" | 0 of 3 (read as "selected") | 3 of 3 |
| Infers "a block is solid to the body of its colour" | 2 of 3 | 3 of 3 |

## Findings

- **Bug (both players, and the critic's "spike trap"):** gates and plates did not always match the game. The easing went backwards once it reached its target, and a finished spirit walk was never cleared, which froze the gate. Fixed, and checked with a one-off script that replayed every solver route in Chromium and compared the drawn gate and plates with the game after each move: 18 of 18 levels match.
- The blue block's 2x2 dots read as a face (4 of 6).
- The plate read as a metal box or safe.
- The dashed "not there" outline was too faint on the other body's floor colour.
- Bodies standing in blocks looked stuck in or behind them.
- Grey spirit-view blocks could not be told as red or blue.
- Critic (6/10): flat floor, no shadows, identical bricks, sleep z too small and spilling into the next tile.
- Text still mentions doors, vents, bridges, a key and a white circle (needs the level text update that goes with the colour-only cut).

## Changes made after round 2

Blue blocks are now gems with cut corners (shape, not only colour). Fog keeps the shape and a hint of the colour. Blue dots are single pixels. The plate is a low slab with a round button. The dashed outline is two-pixel dashes with a dark edge. A body standing in a block gets the block's edge drawn over it. Floor grout and specks, varied bricks, shadows under parked bodies, a larger z kept inside the tile, and shut gates heavier.
