# Persona testers (AI, not people)

Run as `persona-tester` subagents, all in parallel, one per persona, with the model below. Results are AI-persona evidence: label them that way, and never report them as a human playtest.

| Session name | Persona brief (as in `prototypes/body-hop/playtests/2026-11-13/README.md`) | Model |
|---|---|---|
| maya | Casual phone gamer, impatient, skims text | haiku |
| theo | 12, impulsive, mashes keys | haiku |
| ruth | 61, non-gamer, reads every word | sonnet |
| jonas | Jam judge, about 15 minutes per game | sonnet |
| priya | Colour-blind (start the session with `--filter deuteranopia`) | sonnet |
| alex | Speedrunner, tries to break things | sonnet |
| kenji | Puzzle expert | opus |
| sam | Methodical engineer | opus |

To test one level, tell each tester to start with `Level:<n>`. A quick check uses maya, ruth and kenji (one per model tier); a full round uses all eight.
