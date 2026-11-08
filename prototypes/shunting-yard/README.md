# Shunting Yard (grey box)

A tower defence where towers never kill. Every tower is a floor plate that **shifts** the enemy stepping on it sideways. The only things that kill are pits, and pits fill up. Plates arrive as income before each wave and lock once they have run one, so you build the machine up wave by wave and every leak costs a life.

Built after the Drag the margin playtest showed a one-integer state space is not fun to search. Here the state is the whole board, moves compose, and every consequence is drawn before you commit.

## Run

```
godot --path prototypes/shunting-yard
```

Web build: open the launcher (see the top-level README) and tap Shunting Yard. Taps work as clicks; no keyboard needed.

## Rules

- Enemies spawn on the left (green column) in their lane and walk east one cell per tick. Reaching the red column leaks and costs a life. Four lives per level; a wave always passes, so a leaky wave is survivable but the next one must be cleaner.
- **Plates** go only on the **rails**, the lit columns, and not on pits or bolted floor; up to two per cell. Stacking two plates doubles the strength. Plates arrive as **income** before each wave (the side panel shows +n per wave); unused ones carry over.
- **Shift up / Shift down:** move the enemy that many rows. **Alternator:** shifts up, then down, then up, one enemy at a time.
- **Enemy types:** Light moves 1 row per strength. Slick moves 2. Heavy moves 1 only at strength 2 (two stacked plates), otherwise it ignores the plate.
- A shifted enemy that lands on another plate is shifted again, up to four times. Walls clamp.
- **Pits** kill whoever steps in, until their capacity is used up; a full pit is floor.
- **Locking:** when a wave has run, every plate on the board locks (padlock). You can add plates, never move or erase them, so the machine you build for wave 1 must leave room for the waves listed in the side panel. R restarts the level.
- **Preview:** between waves every enemy's path for the *current* wave is drawn in its colour, ending in a green dot (pit) or a red cross (base). Each pit shows predicted fill over capacity, red when it would overflow. Later waves are shown as composition only (type, count, lane); tracing them through your locked machine is the puzzle.
- Groups in a wave are interleaved (Light, Slick, Light, Slick...), so sorting matters.

## Controls

Tap or click: palette buttons (or keys 1 to 4) choose a plate type or the eraser, tap a cell to place or erase, **Go** (space) runs the wave, **Speed** (F) toggles 3x. **R** restarts the level. **N** goes to the next level after a win; **Shift+N** skips (logged as SKIPPED).

## Levels

Each teaches one thing, then the set tightens: income equals what a perfect run needs, pit capacities equal the wave sizes, plates go only on rails, and plates lock after a wave. Some rail cells are **bolted floor**. `solve.py` verifies every level has a *perfect incremental run*: a layout per wave, each extending the previous within the income so far, with zero leaks. `python3 solve.py` searches every level and prints the fewest plates that win all waves with zero leaks, plus how many distinct layouts do it; it exits non-zero if a budget is below the minimum. `python3 solve.py 9 "U@8,2 A@8,3"` tests one layout.

| Level | Teaches | Income per wave |
|---|---|---|
| 1 One shift | rails, place a plate, read the preview | 1 |
| 2 Slick skips a row | multipliers: one plate, two pits | 1 |
| 3 Heavy needs two | stacking | 2 |
| 4 Every other one | interleaving: the Alternator sorts by type | 1 |
| 5 Plates lock | wave 1's plate must also serve wave 2 | 1, 1 |
| 6 Merge | two rails, a chain across the board | 2 |
| 7 Sort all three | one stacked plate, three rows, the wall clamp | 2 |
| 8 Build as you go | three waves, a new lane each time, one plate of income each | 2, 1, 1 |
| 9 Bolted rails | three rails with holes in them | 2 |
| 10 Share the load | two Alternators built one per wave, exact capacities | 1, 1, 0 |
| 11 Three lanes | chains inside a rail column; a lane of Heavies arrives in wave 2 | 2, 2, 0 |
| 12 The yard | one plate for wave 1, then three to make it survive the Heavies | 1, 3 |

## Log line

Printed at the end of each wave, on restart, skip and failure (visible in the web build's log panel):

```
Level 3 (Heavy needs two) wave done | wave 1/1 | killed 6 leaked 0 | lives 4 | plates 2/2: DD@4,3 | time 21.3 s
```

## Playtest history

- Set 1 (seven levels, plates anywhere, layout editable between waves): all seven fell in 14 to 25 s each. Too easy.
- Set 2 (twelve levels, tighter budgets): all twelve in 5 to 40 s. Every plate went in the pit column and the machine was rebuilt between waves, so geometry and planning did not matter. Led to rails and locking.
- Set 3 (rails, locking, zero-leak waves with retry): levels 1 to 10 in 6 to 23 s; level 11 failed twice because a locked layout with no budget left had no move, and the game still said "fix the machine". Led to the tower-defence loop: income per wave, leaky waves pass and cost lives.

## Test question

Does a tester build a two-plate composition on purpose (a stack, or an Alternator feeding two pits) before level 4 asks for it? When a wave goes wrong, do they say "I see why" or "what happened"? The preview exists to make the first answer the common one.

What fun would look like: the tester stops placing, watches a mixed wave peel apart into three pits, and immediately starts the next level to see what breaks the machine. If they treat each level as "find the one cell", it is the margin again.
