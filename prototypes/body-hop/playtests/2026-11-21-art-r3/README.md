# Art round 3: blind AI persona test after the round 2 fixes (21 Nov 2026)

AI persona, not a human playtest. Fresh omp subagents (default model), no game context.

| Testers | What they saw |
|---|---|
| SeeC1-3 | `images/c1.png`-`c8.png`, canvas only |
| ColourBlind | `images/d1.png`-`d3.png`, the board through a deuteranopia filter (Machado 2009, severity 1) |
| ArtCritic2 | c1-c8, as a pixel-art director |
| PlayerE | played levels 5-8 |
| PlayerF | played X1-X4 (used a search script for routes, so its press counts are not difficulty data) |

## Scores

| Question | Round 2 | Round 3 |
|---|---|---|
| Names the body you control | 24 of 24 | 24 of 24 |
| Finds the exit, mean confidence | 4.5 | 4.8 |
| Gates and plates match behaviour (players) | no (bug) | yes, "nothing ever went against the picture" |
| Art critic score | 6/10 | 7/10 |
| Colour-blind: tells the two block families apart | (not tested) | yes, by stripes versus dots and square versus rounded corners |

## Findings

- A solid block drawn as a frame around a body standing in it read as an unexplained "blue outline" (3 of 3).
- In the spirit's grey view, red and blue blocks could not be told apart before hopping (5 testers).
- A body on a held plate hid the plate.
- Two cats in one level looked identical.
- The open gate's green beam blended with the green EXIT sign below it.
- Critic: walls lack a lit cap and floor shadows; floor too plain; the sleep z overlapped neighbours.

## Changes made after round 3

Fog keeps half the block's hue. A body in a block it sees as solid now stands behind the block's front lip. A held plate shows a lit green lip around the body. Open gates: no green beam, bar tips tucked into the beam, green lamps. Second and later bodies of a kind get a coloured collar (cat) or badge (guard). Floor tiles vary (pebbles, crack, worn corner) and walls cast a shadow on the floor; walls get a lit cap. The z stays inside its tile. Guard-view walls are less red so red blocks stand out.
