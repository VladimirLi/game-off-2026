# AI persona round 1, 14 November 2026

AI personas, not people. Eight persona-tester agents played the game blind from level 1 through the play harness. AI personas solve at exactly par far more often than people do, so this is evidence of confusion, not of fun or difficulty.

Build played: commit cb9ad98ff974a24e432de595d34373d9bdbcdff1 (levels.js copied here as `levels-played.js`).

| Session | Persona | Model |
|---|---|---|
| maya | Casual phone gamer, impatient, skims text | Haiku |
| theo | 12, impulsive, mashes keys | Haiku |
| ruth | 61, non-gamer, reads every word | Sonnet |
| jonas | Jam judge, about 15 minutes per game | Sonnet |
| priya | Colour-blind, deuteranopia filter | Sonnet |
| alex | Speedrunner, tries to break things | Sonnet |
| kenji | Puzzle expert | Opus |
| sam | Methodical engineer | Opus |

- `sessions/*.json`: every call (keys, think-aloud note, level, turns, status). Screenshots not kept.
- `interviews/*.md`: exit interviews, in character.

Findings: level 3 was the weak spot (all 7 undos and 2 restarts of the round; 4 of 8 walked back into the body they had just left by accident). Smaller: what red blocks on level 4, the unexplained vent on level 7, level 10's hint not matching the par route, and a refused-move "pit" status read as a death. Nobody reached levels 15 to 18.
