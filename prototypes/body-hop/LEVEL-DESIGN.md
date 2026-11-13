# Body Hop level design spec (v3)

The level set is redesigned from scratch against two sources: the research in `research/compelling-games/` and the silent playtest in `playtests/2026-11-13/`. The rules (README, "Rules (v2)") stay as they are: every playtester understood them, and the research says to dig deeper into a small ruleset rather than add mechanics.

## What the playtest showed (baseline, v2 levels)

| Level (v2) | Solved by (of 8) | Random-play solve rate | Expert difficulty (Kenji, 1–5) | Notes |
|---|---|---|---|---|
| 1 First hop | 8 | 99.9% | 1 | Ruth: didn't know the white circle was her |
| 2 Different eyes | 7 | 80.9% | 1 | Maya quit: read the dashed red outline as a wall and never tried it. Two ideas in one level (red not there + blue bridge) |
| 3 Through the wall | 7 | 96.8% | 1 | Ruth's best moment ("I felt clever"). Hint "stand next to one" misleads: you walk into it |
| 4 Dead weight | 7 | 26.4% | 1 | |
| 5 Make way | 6 | 40.6% | 1 | Priya: accidental hop, 38 turns against par 14 |
| 6 Relay | 5 | 2.7% | 2 | Theo quit: lost track of three bodies |
| 7 Light sleeper | 4 | 10.7% | 2 | |
| 8 Doorstop | 3 | 53.0% | 3 | Doorstop rule learned from the legend, not play (Alex, Sam) |
| 9 No trace | 3 | 32.3% | 2 | Hint didn't match anything (Kenji, Sam) |
| 10 Lay-by | 3 | 2.7% | 3 | "a bit shuffle-y" (Kenji) |
| 11 Two breaks | 3 | 9.4% | 3.5 | Kenji's favourite |
| 12 Changing of the guard | 3 | 7.1% | 3.5 | |

The three strongest players solved all 12 at par, almost all on the first plan, and never got stuck. The two least patient quit at levels 2 and 6.

## Structure

Three chapters of four levels on the main path, plus an optional expert set. Each chapter opens easy and closes with its hardest level (sawtooth). A chapter end is a natural stopping point; the game will show a "chapter complete" screen there (build work, later).

| Slot | Chapter | Teaches (one idea) | The wrong assumption it breaks |
|---|---|---|---|
| 1 | Eyes | Walk into a body to become it; the guard has the key | "I am stuck as the white circle" |
| 2 | Eyes | Red isn't there for the cat (a dashed outline = not there for you) | "Dashed means wall" |
| 3 | Eyes | A blue bridge exists only for the cat | "That pit is impassable" |
| 4 | Eyes (closer) | Hop body to body, from wherever you stand, even inside a red block | "Hopping only works from open floor / only the spirit hops" |
| 5 | Leftovers | A body left on a plate holds the gate; the spirit weighs nothing | "I can hold the plate myself and walk through" |
| 6 | Leftovers | Parked bodies block; park where you can still hop back | "Bodies get out of my way" |
| 7 | Leftovers | The first hop is the one move you can't undo (pick the right first body) | "Any body will do to start" |
| 8 | Leftovers (closer) | A chain of bodies is a route: control passes along adjacent bodies | "I need to walk a body to where it's needed" |
| 9 | Gates | A body standing in a gate keeps every gate open | "Leaving the plate shuts the gate" |
| 10 | Gates | Only the spirit leaves nothing behind | "Any body can enter any body" |
| 11 | Gates | Each body type has its own waiting places (blue blocks for guards, red for cats) | "There is nowhere to park" |
| 12 | Gates (closer) | Combine: a plate hand-over through a relay | |
| X1–X6 | Night shift (optional, open from the start) | Expert levels where the obvious plan fails | Each names its own trap |

Slots 9 to 12 and the Night shift set may use ideas from v2 levels (Light sleeper, Doorstop, No trace, Lay-by, Two breaks, Changing of the guard) when the redesign measures better; the slot's idea matters, not the old map.

## Rules for every level

1. **One idea.** Write the one-sentence aha before building. The level must be unsolvable without it (a solver check proves this where a check exists).
2. **Teach with the layout.** The first level with an element cannot be solved without using it, and the first use is unavoidable early in the level.
3. **Every tile matters.** `node tools/ablate.js <n>` shows no NOISE tile.
4. **No busywork after the insight.** No stretch of the optimal route where two bodies alternate single steps just to move together, and no long walk with no decision in it. Start bodies where they are needed.
5. **No accidental-hop lines.** Don't put a body directly in the line of a corridor the player must walk along, unless walking into it is the point.
6. **Readable at a glance.** At most 3 bodies on the main path (4 allowed in Night shift). Board at most 9 wide and 8 tall including walls.
7. **Hints are questions or nudges that never name the trick.** Tutorial hints (slots 1 to 4) may state the rule plainly; from slot 5 on, a hint is a question. A hint must match what the player actually does.

## Targets

| Tier | Optimal turns | Hops | Random-play solve rate (`solve.js luck`) | Dead states | Who should finish it |
|---|---|---|---|---|---|
| Chapter openers (1, 5, 9) | 6 to 12 | 1 to 3 | any | any | everyone, Maya included |
| Chapter middles | 8 to 18 | 2 to 4 | under 60% | any | most players |
| Chapter closers (4, 8, 12) | 12 to 24 | 3 to 6 | under 15% | any | players who like puzzles |
| Night shift | 14 to 34 | 4 to 8 | under 2% | 10% or more preferred | strong players, after at least one failed plan |

Night shift levels must also show their trap with the solver: the most natural first plan (e.g. hopping a particular body first, or holding the plate with the obvious body) must be impossible or a dead end.

## Checks to run

```
node tools/solve.js          # solvable, par, declared checks
node tools/solve.js luck     # random-play solve rate
node tools/ablate.js <n>     # every tile matters
node tools/bot.js            # browser replay at par
```
