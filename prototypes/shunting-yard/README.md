# Shunting Yard (grey box)

A tower defence where towers never kill. Every tower is a floor plate that **shifts** the enemy stepping on it sideways. The only things that kill are pits, and pits fill up. You win a wave by composing plates so the whole wave sorts itself into the pits.

Built after the Drag the margin playtest showed a one-integer state space is not fun to search. Here the state is the whole board, moves compose, and every consequence is drawn before you commit.

## Run

```
godot --path prototypes/shunting-yard
```

Web build: open the launcher (see the top-level README) and tap Shunting Yard. Taps work as clicks; no keyboard needed.

## Rules

- Enemies spawn on the left (green column) in their lane and walk east one cell per tick. Reaching the red column leaks and costs a life. Five lives per level.
- **Plates** go on any free cell in columns 1 to 10 that is not a pit or bolted floor, up to two per cell. Stacking two plates doubles the strength. The level gives a plate budget; plates stay between waves and can be erased and moved.
- **Shift up / Shift down:** move the enemy that many rows. **Alternator:** shifts up, then down, then up, one enemy at a time.
- **Enemy types:** Light moves 1 row per strength. Slick moves 2. Heavy moves 1 only at strength 2 (two stacked plates), otherwise it ignores the plate.
- A shifted enemy that lands on another plate is shifted again, up to four times. Walls clamp.
- **Pits** kill whoever steps in, until their capacity is used up; a full pit is floor.
- **Preview:** between waves every enemy's path through your machine is drawn in its colour, ending in a green dot (pit) or a red cross (base). Each pit shows predicted fill over capacity, red when it would overflow.
- Groups in a wave are interleaved (Light, Slick, Light, Slick...), so sorting matters.

## Controls

Tap or click: palette buttons (or keys 1 to 4) choose a plate type or the eraser, tap a cell to place or erase, **Go** (space) runs the wave, **Speed** (F) toggles 3x. **R** restarts the level. **N** goes to the next level after a win; **Shift+N** skips (logged as SKIPPED).

## Levels

Each teaches one thing, then the set tightens: budgets equal the solver's minimum, pit capacities equal the wave sizes, and from level 9 some cells are **bolted floor** where no plate can go. `python3 solve.py` searches every level and prints the fewest plates that win all waves with zero leaks, plus how many distinct layouts do it; it exits non-zero if a budget is below the minimum. `python3 solve.py 9 "U@8,2 A@8,3"` tests one layout.

| Level | Teaches | Min plates = budget | Layouts at min |
|---|---|---|---|
| 1 One shift | place a plate, read the preview | 1 | 6 |
| 2 Slick skips a row | multipliers: one plate, two pits | 1 | 6 |
| 3 Heavy needs two | stacking | 2 | 6 |
| 4 Pits fill up | capacity, the Alternator | 1 | 6 |
| 5 Every other one | interleaving: the Alternator sorts by type | 1 | 6 |
| 6 Merge | two types from one lane into one pit; chaining | 2 | 35 |
| 7 Sort all three | one stacked plate, three rows, the wall clamp | 2 | 6 |
| 8 Two lanes, two waves | one layout must serve both waves | 3 | 294 |
| 9 Bolted floor | plates where you can, not where you want | 2 | 7 |
| 10 Share the load | two Alternators feeding three pits exactly | 2 | 49 |
| 11 Three lanes | order matters: a plate after another one | 4 | 288 |
| 12 The yard | everything, 16 enemies into 16 slots | 4 | 156 |

## Log line

Printed at the end of each wave, on restart, skip and failure (visible in the web build's log panel):

```
Level 3 (Heavy needs two) wave done | wave 1/1 | killed 6 leaked 0 | lives 5 | plates 2/2: DD@4,3 | time 21.3 s
```

## Test question

Does a tester build a two-plate composition on purpose (a stack, or an Alternator feeding two pits) before level 4 asks for it? When a wave goes wrong, do they say "I see why" or "what happened"? The preview exists to make the first answer the common one.

What fun would look like: the tester stops placing, watches a mixed wave peel apart into three pits, and immediately starts the next level to see what breaks the machine. If they treat each level as "find the one cell", it is the margin again.
