# SHIFT ideas: filtered shortlist (top 5, honourable mentions, notable rejects)

Filtered 2026-11-07. Scope: the 187 ideas in the four generator files (`gen-mechanic.md` 41, `gen-strengths.md` 43, `gen-wordplay.md` 46, `gen-collision.md` 57), filtered for a solo engineer new to game dev (TypeScript, Python, ML research, evolutionary algorithms, RL; not an artist or musician), Godot 4.7.2 GDScript, single-threaded browser build, three weeks to Dec 1 2026, rated on Gameplay, Graphics, Audio, Innovation and Theme. Criteria come from `theme-to-idea.md` (rules 3, 6, 7, 10; selection criteria) and the scope rules in `idea-to-shipped-game.md`. Idea references are file letter plus number: M = mechanic, S = strengths, W = wordplay, C = collision.

Prior art: the generator files' own searches were used, plus seven WebSearch calls here (one per finalist whose prior art was thin, two confirming fetches). "Not searched (budget)" in a source file was treated as unknown, not as novel. Two searches here overturned source claims of "not found"; those are flagged below.

## 1. Dedupe

Merged families (kept idea first, merged ones after):

- **Shift a row or column:** M1 Slide the row ← C4 Row Sokoban, C38 Auto-Pac, C13 Scramble-Man, C17 Shift Picross (same verb, clue goal), C1 Shear Snake (world-driven variant), C12 kept separate (one-hole 15-puzzle is a different verb).
- **Shift one letter:** M10 ← C21 Ladder Typing, W2 Vowel Shift, C51 Drifting Wordle, C22 Letter-Shift Room.
- **Insert or delete so everything downstream shifts:** M2 Insert a row ← W23 Frameshift, W46 Shift Out (same operation on a string instead of a grid; Frameshift is the best skin option for M2).
- **Shift a colour plate:** M8 ← W24 Out of Register.
- **Input delay as a dial:** M7 Dial the lag ← W34 Décalage.
- **Depth layer hop:** M22 ← C7 Parallax Runner.
- **Gear shift on an engine tone:** C23 Stick Shift ← W10 Manual.
- **Toggle a rule bit of a cellular automaton:** S1 Rulebender ← S23 Rule 110 Radio (audio variant).
- **Shift a row of targets under a falling thing:** C47 Shifting Cities ← C2, C28, C45.
- **Adaptive-opponent duel:** S4 Tell ← S9 The Director, S41 Bastard Shift share the learner-you-must-outwit shape; different verbs so kept, all scored.

After merging: about 160 distinct verbs.

## 2. Hard cull

Rejected if any failed: theme in the verb (not only fiction); one core mechanic; one-day GDScript grey box; low or medium art; one-sentence pitch; self-generating or cheap content; single-threaded browser; no exact or near-exact prior art.

Counts by main reason: theme only in fiction or system 38 (most of S19 to S43, several W); exact or near-exact prior art 31; two or more systems or no one-day grey box 9 (S6, S11, S29, S33, W31, W9, M32, C11, C36); art scope above medium or content authored by hand 7 (W26, W8, W18, W17, C22, S25, S18); abstract puzzle with no readable body or thin gag 20 (C9, C25, C42, C54, S34, W25, W22 and similar). About 55 survived to scoring.

## 3. Scoring the survivors

Seven axes, 1 to 5: fun in 10 seconds, Innovation, Theme strength, Audio opportunity (sound as part of the mechanic), Graphics with rectangles, developer fit, and risk of one boring optimum or confusion (5 = low risk). The 12 highest:

| Idea | Fun10 | Innov | Theme | Audio | Gfx | Fit | Risk | Sum |
|---|---|---|---|---|---|---|---|---|
| M25 Drag the margin | 4 | 5 | 5 | 3 | 4 | 5 | 3 | 29 |
| M2 Insert a row | 3 | 4 | 5 | 4 | 4 | 5 | 4 | 29 |
| M35 Pull the rug | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 27 |
| C12 Slide Lemmings | 4 | 4 | 4 | 3 | 3 | 4 | 4 | 26 |
| M18 Scrub the frame | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 26 |
| S1 Rulebender | 4 | 3* | 3 | 3 | 4 | 5 | 2 | 24 |
| S35 Euclid | 4 | 3* | 4 | 5 | 4 | 4 | 2 | 26* |
| S3 Hourglass | 4 | 3 | 3 | 4 | 4 | 4 | 3 | 25 |
| S26 Lane Shift | 3 | 3 | 5 | 3 | 3 | 4 | 3 | 24 |
| C49 Shift Bomber | 4 | 3 | 4 | 3 | 3 | 3 | 3 | 23 |
| S2 Selection Pressure | 3 | 2* | 3 | 2 | 3 | 5 | 2 | 20 |
| S4 Tell | 3 | 3 | 2 | 3 | 3 | 5 | 1 | 20 |

Asterisks mark Innovation capped by prior art found during this filter (section 7). Reasoning for the top scores is in each entry below; for the lower rows, see the honourable mentions and rejects.

## 4. Top 5

### 1. Drag the margin (M25)

- **Pitch:** The level is a paragraph and you drag the right margin; words reflow, lines break differently, and the word you stand on moves to a new line.
- **Verb:** Drag the margin a few characters narrower or wider. Walk and jump between margin changes.
- **Where SHIFT lives:** Shifting the margin shifts every word after the first line break. The theme is the verb and needs no fiction, and the typographic pun ("Shift" key, text shifting) lands by itself.
- **Familiar base + twist:** Platformer on text (words are platforms, spaces are gaps, capitals are tall, punctuation is spikes) plus word wrap as the world-moving mechanic. Rule 10: known base, one new rule.
- **Content:** Any paragraph is a level and every margin width a layout; a greedy wrap over a monospace font gives every word's rectangle. Levels are text files; a solver (BFS over margin widths and reachable words) rates them. Public-domain prose or the developer's own jokes cost nothing.
- **Audio:** Each reflow is a typewriter carriage return; each word landing a key click; the margin a ratchet. Sound is tied to the only verb, so the Audio score rides on the mechanic rather than on music.
- **Biggest risk and mitigation:** Reflow teleports the player when their word jumps lines. Decide on day one between "you ride your word" and "you fall"; tween the reflow over 0.3 s with the moved words highlighted.
- **One-day grey box:** Monospace Label-free renderer: compute line breaks in GDScript, spawn a StaticBody2D per word, a CharacterBody2D square, a margin handle. One paragraph, one goal word. Measure: do two testers change the margin unprompted within 30 s, and do they laugh when a word jumps lines?
- **Prior art:** Source file found none with reflow. Search here (words-as-platforms on itch) returned Words Between Words, WORD (Demo), Lingo, a GMTK 2023 words-as-platforms entry, none with reflow or a movable margin. Open.

### 2. Insert a row (M2, with W23 Frameshift as an alternative skin)

- **Pitch:** A spreadsheet-brained puzzle whose only tools are "insert row" and "delete column": everything beyond shifts, and whatever is pushed off the sheet is gone.
- **Verb:** Click a gap to insert an empty row or column; click a line to delete one.
- **Where SHIFT lives:** Excel's own wording, "shift cells down"; insertion and deletion shift the cells. Literal and in the verb.
- **Familiar base + twist:** Sokoban grid logic, but you edit the grid's structure instead of pushing objects in it. No wrap: things fall off the edge, which is the loss and the tool.
- **Content:** Fixed sheet size plus a budget of inserts and deletes; a brute-force solver over the small move set verifies and rates random scatters of walls, goals and a walker. The Frameshift skin (letters in triplets re-chunking into new words) is the same operation if a word version proves funnier.
- **Audio:** The slide and "thunk" of a row dropping into place, a different pitch per row distance, a paper-shredder sound for a deletion. The source file says this is the appeal rather than polish; it also makes Audio part of the mechanic.
- **Biggest risk and mitigation:** Reads as dry. Easing on every cell slide, a visible budget, and a walker who reacts; test on day two whether non-engineers smile at the spreadsheet look.
- **One-day grey box:** 2D array, splice, redraw as ColorRects in a GridContainer, win check when the walker's row reaches the goal. Measure: time to first unprompted insert; whether testers try deleting the row under the walker.
- **Prior art:** Source found none with insert/delete as the verb. Search here returned Cellbound (real spreadsheet engine with a logic puzzle), arrayshift(); (row shift with wrap), Shapeshifter (shift rows plus add a row, closest), The Worksheet Saga (Life in Excel). None make insert/delete the sole verb. Open, with Shapeshifter worth a look.

### 3. Pull the rug (M35)

- **Pitch:** You cannot touch the furniture; you can only yank the rugs it stands on, and light things slide with the rug while heavy things stay put.
- **Verb:** Pull a rug one tile in a direction.
- **Where SHIFT lives:** You shift the surface; what shifts with it depends on weight. "Rug pull" is a second, cheeky reading for free.
- **Familiar base + twist:** Sokoban plus the tablecloth trick. One verb, two object classes, and sorting puzzles fall out (separate vase from safe, bring the key to the door while the guard stays).
- **Content:** Grid, deterministic, two classes: a solver generates and grades levels from random scatters.
- **Audio:** Rug swish for the pull, a slide for light objects, a heavy thud when something stays. Each outcome has its own sound, so the ear reads the rule.
- **Biggest risk and mitigation:** Rug edges and overlapping rugs create rule ambiguities. One rug per room for the first week; rugs never overlap; preview the result on hover.
- **One-day grey box:** Grid array, a rug as a rectangle region, two weight classes, a pull input. Measure: can a tester state the rule after two levels without being told?
- **Prior art:** Source found none. Search here (rug, tablecloth, heavy/light sokoban) returned Push the Pull, Weight Walker, Heavily Gated, Don't push me; none with a pulled surface. Open.

### 4. Slide Lemmings (C12)

- **Pitch:** Lemmings walk mindlessly across a level made of 15-puzzle tiles, and your only verb is to shift a tile into the empty slot.
- **Verb:** Shift a tile into the hole, building the route under walkers who never stop.
- **Where SHIFT lives:** The level shifts tile by tile; the walkers never change.
- **Familiar base + twist:** Lemmings plus the 15-puzzle. Two bases everyone knows, a collision nobody found.
- **Content:** Six to eight tile types (floor, ramp, gap, exit); scramble solved layouts by random tile moves, so every level is solvable by construction with a par.
- **Audio:** Tile slide and clack; walkers' footsteps multiply as the crowd grows; a fall is a comic whistle. Not the mechanic, but every event is audible.
- **Biggest risk and mitigation:** A tile moving under a walker must feel funny, not cruel. Slow walkers, fast tiles, and walkers who ride the tile rather than fall through.
- **One-day grey box:** Grid with one hole, click-to-slide, two-state walkers (walk, turn at wall), exit tile. Measure: do testers slide a tile under a walking lemming on purpose, and do they grin?
- **Prior art:** Source found none; nearest Twisted Maze Sama (slide maze rows for a controlled character). Search here returned "I heard you like 15-puzzles" (pure sliding field) and several Lemmings-likes with job assignment; none combine them. Open, one search deep.

### 5. Scrub the frame (M18)

- **Pitch:** The level is a ten-frame animation and only the current frame is solid; you scrub the frame while jumping so the platform exists when you land.
- **Verb:** Scroll the frame index up or down while moving.
- **Where SHIFT lives:** You shift the time index of the world and live outside it. Distinct from the two-era swap in the worked example: many frames, continuous.
- **Familiar base + twist:** Platformer plus a hand-scrubbed flipbook. A platform that moves right across frames is a ladder if you scrub while climbing.
- **Content:** Generate frames instead of drawing them: each platform has a parametric path (line, arc, bounce); frames are the path sampled at ten points. Levels are a list of paths, so a random generator plus a reachability check works.
- **Audio:** The scrub itself can be a film-projector or VHS sound whose pitch follows scrub speed; each frame a soft click. Sound is on the verb.
- **Biggest risk and mitigation:** Players cannot tell what the next frame holds. Onion-skin ghosts of the adjacent frames at low alpha from day one; a frame counter.
- **One-day grey box:** Array of TileMapLayers (or arrays of ColorRects), only one enabled, scroll wheel or keys to scrub, modulate neighbours' alpha for the onion skin. Measure: can testers cross a three-frame moving platform within five minutes without explanation?
- **Prior art:** Source searched and found only flip-themed platformers without scrubbing. Not re-searched here (budget spent on the ideas that moved). Treat as open but thin.

## 5. Honourable mentions

1. **Rulebender (S1, grey-boxed).** Search here found HOX (LOWREZJAM 2024, Unity, HTML5): design rules so a seed grows into a target silhouette, CA-inspired, well received. Same goal and same player activity; only the rule formalism differs (18 B/S bits versus 16 ordered 3x3 kernels). Innovation capped; survives only if it becomes something HOX is not, such as steering a live, running colony by shifting the rule mid-flight, which also puts "shift" into the verb. Rank 6.
2. **Euclid (S35).** Audio is the mechanic, which no top-5 entry can claim, but Arhythmetic (rotate the rhythm circle to restore each polygon of a polyrhythm) and Polyrhythmia are near. Also each ring is an independent search once the ghost is shown, so the puzzle collapses. Rank 7.
3. **Hourglass (S3).** Rotate the glass and a falling-sand automaton reflows. Looks and sounds good for free, fits the developer, combination not found. Theme is in the consequence, not the verb, and rotation alone is thin. Rank 8.
4. **Lane Shift (S26).** The most literal theme hit and ten lines of Nagel-Schreckenberg, no prior art. Fun depends on seeing the jam you caused, which is behind you; a rear-view density strip is mandatory. Rank 9.
5. **Shift Bomber (C49).** Explosions shift the four lines outward instead of destroying. Proven loop, "near only" prior art; chain reactions must be capped to stay readable. Rank 10.

## 6. Notable rejects

- **Selection Pressure (S2, grey-boxed):** rejected on prior art found here. A.N.G.E.R. (AI and Games Jam 2021, Godot: enemies mutate each wave, best genes carried forward), Adapto (enemies evolve to counter your tower types), Lootland Defense (waves adapt to tower layouts), Mutant Malfunction (Brackeys 13). The source file's "tower defence with bred creeps not found" is wrong. Theme was also the weakest of the grey-boxed four: the verb is "place a tower", the shift is in the system. Would rank about 11 even without the prior art, because of convergence risk and tower-defence being several systems.
- **Tell (S4, grey-boxed):** fails the theme cull (the verb is attack; "shift your rhythm" is fiction) and has a boring optimum: against a predictor, playing uniformly at random is the best policy. Would need asymmetric payoffs to fix. About rank 12.
- **Slide the row (M1 family, grey-boxed):** rejected on prior art only. arrayshift(); (same verb plus a walker), Tile Shifter, Twisty Tombs, Maze<-->Shift, Unwrapped, Twisted Maze Sama and the Grid Shift app make this the most crowded verb in all four files. Otherwise it would sit around rank 6.
- **Swipe the squad (M24), Shift the queue (M17), Swap two tile types (M31):** exact matches (Rogue2048, Timing Travelers, The Swap Wizard).
- **Gatekeeper (C6), Spawn 2048 (C41), Deckchairs (W40):** exact matches, two each.
- **Swap places (M5), Dial the lag (M7) and Décalage (W34), Stick Shift (C23) and Manual (W10), Hum Along (W14):** three or more precedents each; the lag games' comments say "too frustrating", and gear shift is on the announcement's own list.
- **Pitch the platform (M4):** pitch moves platforms in three mic-driven games; the slider is an input swap, not a new rule.
- **Slide the threshold (M34):** theme is "slide a slider", collision rebuilds on web are costly, found photos make messy levels; BrightBound is close in spirit.
- **Snap the grid (M26):** highest raw novelty in the set, but the rounding rule is unpredictable by design; confusion risk too high for a first game.
- **Recollapse (S6), Camouflage (S11), Plasmodium (S29), Meta (S33), Scripting (W31):** fail the one-day grey box.
- **The Shift, Irish disco (W26):** the funniest pitch, but the comedy lives in expressive sprites, which a non-artist cannot ship.
- **Breeders (S12):** keiwan's Evolution is this.
- **Only what is framed exists (M3):** Out of Frame, Out of Game already has "you are the camera; framed means solid".
- **Firebreak, Watershed, Wa-Tor, Daisyworld, Avalanche, Borders (S31, S19, S32, S43, S28, S16):** fine toys, theme only in the fiction; the verb is cut, place, cast, plant, drop or move.

## 7. The four grey-boxed ideas

- **Selection Pressure:** does not survive. Four close precedents found today; theme in the system, not the verb. Keep the GA code; it is reusable in nothing on the top 5, so this is a sunk day.
- **Tell:** does not survive. Theme in fiction; random play is optimal. Rank about 12.
- **Rulebender:** survives the cull, capped by HOX. Honourable mention, rank 6. The pivot that saves it is live steering of a running colony.
- **Slide the row:** does not survive, on prior art alone. Three source precedents plus three more found by the collision file. The engine (array, wrap, redraw) is reusable for Insert a row (top 5, #2), which is the natural pivot per rule 9.

## 8. Recommendation

Prototype Drag the margin and Insert a row on consecutive days; they share nothing but both answer a clear question in a day. If Drag the margin's reflow makes testers laugh, it wins on Theme and Innovation. If it feels like a teleport bug, Insert a row inherits the Slide the row grey box and is the safe build. Pull the rug is the fallback with the cleanest rules.
