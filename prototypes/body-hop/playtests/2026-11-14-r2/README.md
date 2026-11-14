# AI persona round 2, 14 November 2026

AI personas, not people. Five persona-tester agents played blind through the play harness, after loop round 1 (new level 3, hop and blocked messages, per-body legend). AI personas solve at par far more often than people do.

Build played: commit 81158336230e967d616ee4f45c91dd47124bec1a (levels.js copied here as `levels-played.js`).

| Session | Persona | Model | Started at |
|---|---|---|---|
| maya | Casual phone gamer, impatient, skims text | Haiku | level 3 |
| ruth | 61, non-gamer, reads every word | Sonnet | level 3 |
| kenji | Puzzle expert | Opus | level 3 |
| alex | Speedrunner, tries to break things | Sonnet | level 13 (X1) |
| sam | Methodical engineer | Opus | level 13 (X1) |

Sam's agent stopped early on an API error (safeguards flag), so there is no sam interview; the session log up to that point is kept.

Findings: the new level 3 tested clean (no undos or restarts). Plates and gates are the weak spot: maya 15 turns vs par 9 on level 5 and quit on level 8; ruth solved level 9 without understanding it. Level 10's hint still misleads (kenji). Night shift: alex solved X1 and got stuck on X2; sam solved X1 to X4 (levels 13 to 16) and reached X5 before the agent stopped.
