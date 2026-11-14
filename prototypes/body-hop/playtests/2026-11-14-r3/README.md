# AI persona round 3, 14 November 2026

AI personas, not people. Five persona-tester agents played blind through the play harness, after loop round 2 (new levels 5 and 9, level 10 hint, visible open gates and held plates, gate and plate status lines). AI personas solve at par far more often than people do.

Build played: commit 2c0b773b1034529a2cf30f32faec42e0e7ebf6f2 (levels.js copied here as `levels-played.js`).

| Session | Persona | Model | Started at |
|---|---|---|---|
| maya | Casual phone gamer, impatient, skims text | Haiku | level 5 |
| ruth | 61, non-gamer, reads every word | Sonnet | level 5 |
| kenji | Puzzle expert | Opus | level 5 |
| priya | Colour-blind, deuteranopia filter | Sonnet | level 5 |
| jonas | Jam judge, about 15 minutes per game | Sonnet | level 14 (X2) |

Findings: level 9 now 4 of 4 at par; levels 6 to 12 all at par. Level 5 median 14 vs par 10 (3 of 4 over). Recurring: the colour rule (guard sees red, so a red block is solid to it) learned only from the legend (kenji, ruth); "a body in any gate holds every gate open" learned only from the legend (priya, ruth); level 10 hint vague and level felt like filler (maya, kenji). Night shift: jonas solved X2 in 53 turns vs par 23 and quit X3. Two personas reported keys dropped after a Blocked message; under investigation.
