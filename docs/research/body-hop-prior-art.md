# Body Hop: prior-art check (researched 2026-11-13)

Concept recap: a turn-based, top-down grid puzzle. A spirit hops into orthogonally adjacent bodies. Each body has its own perception layer (guard sees red, cat sees blue), and only the current body's layer is solid or real. Abandoned bodies sleep in place and work as blocks, weights, doorstops and relays. The screen re-tints on every hop.

Letter key: A = possession or body-swapping as the core verb. B = what exists depends on which character you control. C = left-behind characters used as tools. D = A+B (+C) together.

Closeness scale: 1 = unrelated in practice, 5 = a judge would call Body Hop derivative of it.

## Ranked findings

| # | Game | Year / platform | Core mechanic (as verified) | Match | Close |
|---|------|-----------------|-----------------------------|-------|-------|
| 1 | Toodee and Topdee (began as an LD41 jam game, 2018) | 2022, Switch/PC | You switch between a side-view platformer character and a top-down character in shared level geometry. Each one experiences different rules: gravity, holes, and breakable platforms that act as walls for Topdee. The inactive character is "faded out, fixed in place and invulnerable". | B (rules per character), weak C | 3 |
| 2 | The Swapper | 2013, PC/consoles | You make up to 4 clones and swap control to any clone in line of sight. "Puzzles usually consist of putting clones on top of pressure plates." Coloured lights block cloning or swapping, but they are not per-character perception. | A + C | 3 |
| 3 | Hue | 2016, PC/consoles/mobile | Changing the background colour makes objects of that colour vanish. Changing it again brings them back. | B (one character, colour-world switching) | 2-3 |
| 4 | Red & Blue (HAL_9001, Browser Game Jam) | 2015, HTML5 | Two characters share the same controls. "Only red collides with red tiles", blue with blue. | B (colour-locked collision per character) | 2-3 |
| 5 | Color Swap (HappyNE) | ~2025 (inferred), Windows prototype | You switch between Red and Blue with R. Each has its own path and colour-coded gates. The page does not say whether these affect visibility or collision. | B-ish + switching | 2 |
| 6 | Heroes of Sokoban (Jonah Ostroff, PuzzleScript) | 2013, browser | Sokoban in which you switch between 3 heroes with distinct abilities. Whether idle heroes act as blocks is unverified: the pages I opened did not say. | switching (not possession), C? | 2 |
| 7 | Ghost Trick: Phantom Detective | 2010 DS, 2023 remaster | A ghost hops between object "cores" within range and possesses objects to do "tricks". Time rewind. | A | 2 |
| 8 | BOKURA | 2023, PC | Two-player online game. Each player sees a different version of the same world. | B (asymmetric co-op, not switching) | 2 |
| 9 | Possessed (doramong2003, GMTK 2021) | ~2021, HTML5 | "Get in and out of bodies and solve puzzles." Nothing about perception or abandoned bodies. | A | 2 |
| 10 | Puzzession!!! (Yuio) | ~2024, HTML5 | A ghost possesses corpses to solve puzzles. Grid and leftover-body behaviour not stated. | A | 2 |
| 11 | Silt | 2022, PC/consoles | A diver possesses sea creatures to use their abilities, including chained possessions. Does not mention a change in perception. | A | 1-2 |
| 12 | Feu Follet (moiraikai) | year n/a, HTML5 | A tile-based ghost-dog puzzle. You possess objects to swap between the living and dead realms. Leftover bodies not stated. | A + realm switch (B-adjacent) | 2 |
| 13 | Homebound spirit / Mind Crosser (GWJ #2) / Jumpossess / Possess Quest / Objectively Possessive (Pirate Jam 16, 2025) / Possession (FoxyCatDogThing) / Possession (feeg1, Mini Jam 73) / Peculiar Possession / Material Possession | various | Each uses possession to borrow abilities or access. feeg1's game tints possessable objects red and possessed ones blue, which is cosmetic only. | A | 1-2 |
| 14 | BodyHop (LD44, 2019) | 2019, jam | **Name clash only.** A real-time shooter: you click an enemy to take its body and weapons. | A (action) | 1 |
| 15 | Ghost Switch (d4nts) | n/a, HTML5 | You toggle alive/dead. The ghost passes through walls. | B-ish (self state, not bodies) | 1-2 |
| 16 | Thomas Was Alone | 2012/13 | You switch between rectangles with distinct abilities and stack them as platforms. | switching + C | 1-2 |
| 17 | Crosspaws (COTEDI 2026) | 2026 | You edit tiles. Each animal has its own movement rules. No possession. | none | 1 |
| 18 | Possessions (Playdate, 2022) | 2022 | A spirit possesses residents to change relationships. Not spatial. | A | 1 |

## Baba Is You and Patrick's Parabox

- **Baba Is You (2019):** you rearrange word tiles to rewrite rules. `YOU` "makes all instances of the object become controlled by the player". `WALL IS STOP` makes walls solid, and breaking the sentence lets you walk through them. So control transfer (A-like) and changing what is solid (B-like) both exist, but both happen through **global rule editing that applies to the whole level**. Perception never depends on which body you are in. The claim that a former YOU object turns inert when you form `KEKE IS YOU` comes from my own knowledge and is not verified from an opened page. Similarity: conceptual at most (2). A judge might mention it, but it is a different verb.
- **Patrick's Parabox (2022):** recursive Sokoban where you push boxes, enter boxes, and boxes contain boxes (including themselves). No possession and no per-character perception. Not meaningfully similar (1). It shares only the grid and the Sokoban-like push rules.

## Verdict on originality

- **A alone is saturated.** There are dozens of possession puzzle and jam games (the itch "possession" tag lists 47).
- **B alone is well-trodden.** Hue, Red & Blue and other colour-collision games, plus dimension-switch games, already cover it.
- **A+C is established** by The Swapper: clones held on pressure plates.
- **A+B (D):** I found **no** game in which possessing a body changes which world layer exists, and certainly none in a turn-based grid. The closest structural relative is Toodee and Topdee: switching character changes which rules apply, and the idle character freezes in place. But it has two fixed characters, no possession or adjacency hop, and no colour-perception layers.
- The full set (A+B+C, spatial adjacency hopping, sleeping bodies existing in both layers) appears original as far as this search reached.
- Caveat: itch.io has thousands of jam entries that are not well indexed, so an obscure match may exist. Treat this as "no well-known or easily findable precedent", not proof of absence.

## What to emphasise for jam judges

1. **Lead with "perception is physics".** It should show in the first 10 seconds: the same room re-tints, walls vanish, and a bridge appears on the hop. That is the part no possession game does. Don't present it as "a possession game", which is a saturated label.
2. **Make sleeping bodies cross layers.** Sleeping bodies stay solid in every view, which no colour-switch game does. A cat asleep on a guard-only plate, used as a relay, makes A+B+C feel like one idea.
3. **Hopping is spatial (orthogonal adjacency) and turn-based.** That separates it from line-of-sight swapping (Swapper) and free-roam possession (Silt, Ghost Trick). Build puzzles around chains of bodies as a route.
4. **Avoid Hue and Red-&-Blue readings.** Don't let it collapse into "press a key to change colour". The colour must belong to a creature, and the scarce resource is which bodies are adjacent.
5. **Tie it to SHIFT explicitly:** a shift of body, a shift of perception, a shift of what is real.
6. **Name:** "BodyHop" (LD44, 2019) already exists. It is a different genre, but consider a distinct title.

## Sources actually opened

- https://en.wikipedia.org/wiki/The_Swapper
- https://destructoid.com/?p=151472 (The Swapper review: pressure plates quote)
- https://en.wikipedia.org/wiki/Hue_(video_game)
- https://en.wikipedia.org/wiki/Ghost_Trick:_Phantom_Detective
- https://en.wikipedia.org/wiki/Baba_Is_You (opened twice)
- https://en.wikipedia.org/wiki/Patrick%27s_Parabox
- https://www.nintendolife.com/reviews/switch-eshop/toodee-and-topdee
- https://www.gamedeveloper.com/design/designing-dual-perspective-puzzles-for-2d-3d-platformer-i-toodee-and-topdee-i-
- https://store.steampowered.com/app/1801110/BOKURA/
- https://www.bontegames.com/2013/10/heroes-of-sokoban.html?m=1 (thinkygames page returned 403)
- https://hal-9001.itch.io/red-blue
- https://happyne.itch.io/color-swap
- https://doramong2003.itch.io/possessed
- https://yuioo.itch.io/corpse-puzzle
- https://moiraikai.itch.io/feu-follet
- https://www.well-played.com.au/silt-review/
- https://en.wikipedia.org/wiki/Silt_(video_game)
- https://ludum-dare.foon.uk/games/44/153698 (BodyHop LD44)
- https://d4nts.itch.io/ghost-switch
- https://tobiassnordin.itch.io/homebound-spirit
- https://altru.itch.io/mind-crosser
- https://kingzustin.itch.io/possessive
- https://foxycatdogthing.itch.io/possession
- https://itch.io/post/2574913/view-in-topic (Possession by feeg1, Mini Jam 73)
- https://iatroph.itch.io/peculiar-possession
- https://gamedesignltu.itch.io/materialpossession
- https://www.seeles.ai/games/puzzle/jumpossess-body-swapping-puzzle-platform-game
- https://mickajohnson.itch.io/possessions
- https://pxlpush.itch.io/possess (no mechanic described)
- https://autumnlines.itch.io/possessive (no detail)
- https://nuriia.itch.io/crosspaws
- https://gamecenter.nyu.edu/projects/three-bodies-four-colors/ (unrelated)
- https://itch.io/games/tag-possession

Failed to open (not cited as evidence): skich.app/games/pawsession (404), thinkygames Heroes of Sokoban (403), Baba Is You fandom wikis (402). Pawsession's mechanics are known only from a search snippet, so they are **unverified**: a soul possesses a cat, and animals act as obstacles.

Search-snippet-only (not opened, not used as evidence): Thomas Was Alone stacking details come from the search summary. **Unverified.**
