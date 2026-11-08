# Insert a row (grey box)

Shortlist #2. A spreadsheet-brained puzzle: your only tools are "insert row" and "delete column", everything beyond the edit shifts, and whatever is pushed off the sheet is gone.

## Run

```
godot --path /Users/vladimir/orca/projects/scratchpad/greybox/insert-a-row
```

Print the generated levels' solution lengths:

```
godot --headless --path /Users/vladimir/orca/projects/scratchpad/greybox/insert-a-row --quit-after 5 -- --report
```

## Rules

- The sheet is 8 columns (A to H) by 6 rows. Cells hold a wall (dark), the goal (green), the walker (orange) or nothing.
- **Insert row:** click a line between rows, or the top edge, or Shift+click a row number. An empty row appears there, everything below moves down one, and row 6 falls off and is destroyed.
- **Delete column:** click a column letter. Everything to its right moves left one, and an empty column appears at H.
- Each tool use costs one move, then the walker takes one step.
- **Walker rule:** fall one cell if the cell below is on the sheet and not a wall. Otherwise step right if that cell is on the sheet and not a wall. Otherwise wait. The bottom and right edges act as walls.
- Win when the walker steps into the goal. Lose if the walker or the goal is destroyed, or the budget runs out.
- Z undo, R restart, N next level.

## Levels

Six levels come from a fixed seed. Walker in columns A to C, goal in columns F to H, 6 to 12 walls scattered. A breadth-first search over all 14 moves (6 row gaps, 8 column deletes) keeps a layout only if its shortest solution equals the target length. The generator also rejects layouts that "delete column H" alone, which is effectively waiting, would solve within the budget. Budget is the solution length plus 1.

| Level | Shortest solution | Budget |
|---|---|---|
| 1 | 2 | 3 |
| 2 | 3 | 4 |
| 3 | 3 | 4 |
| 4 | 4 | 5 |
| 5 | 4 | 5 |
| 6 | 5 | 6 |

## Test question

1. How long until a tester makes the first unprompted insert? Time from the level appearing to the first row insert, without anyone pointing at the row lines.
2. Do testers try deleting the column under the walker? Count how often, and whether they expected it to kill the walker or carry it along.

Also note whether they read the 0.15 s slides as cause and effect, and whether non-engineers smile at the spreadsheet look.

## What fun would look like

A tester stops clicking, traces a finger down a column, and says "if I insert here, the wall drops under him". Then they laugh when the bottom row, with a wall they needed, slides off the sheet. Fun is the moment the edit stops feeling like housekeeping and starts feeling like moving the floor under someone. If testers only ever delete the empty column H to wait, or solve by random clicking within the budget, the idea is dry and needs the audio "thunk" or a second element before it earns more days.
