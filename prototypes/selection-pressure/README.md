# Selection Pressure (grey box)

Tower defence where every wave is a genetic-algorithm population. 24 creeps per wave carry four genes:
speed, toughness (more hit points, bigger, slower), resist (Pulse-resistant cyan to Gun-resistant gold) and lane (top or bottom).
After each wave the creeps that got furthest (reaching the base counts double) breed with crossover and mutation, plus two elites.
Your tower mix and placement is the selection pressure. Eight waves, 20 lives.

## The one question

Is it fun to watch the enemies adapt to you, and to counter-adapt?

## What fun would look like

- The player glances at the gene bars between waves and says "they're going gold, I need Pulse" or "they all switched to the bottom lane".
- The player changes the build in response, and the next wave visibly shifts again: a back-and-forth, not a one-off.
- Losing feels like being out-evolved by something legible, not by random stats.
- Warning signs: the player ignores the readout, or the population converges to one optimum (all top lane, max speed) by wave 4 and stays there.
  The bot runs below already show lane converging fast; fitness sharing or a lane-cost would be the first fix.

## Run

    godot --path .

Headless bot (random lane-side towers, auto-sends waves, prints mean genes per wave):

    godot --headless --path . --fixed-fps 60 --quit-after 9000 -- --autotest

## Controls

1 Gun ($30, single target, fast), 2 Pulse ($45, area). Left click place, right click sell for half. Space sends the next wave. R restarts.
Creeps: colour = resist, size = toughness, brightness = speed. Bottom bars = population mean per wave for each gene.
