#!/usr/bin/env python3
"""Check every Shunting Yard level: is it solvable with its plate budget, and what is the fewest plates?

Mirrors main.gd exactly (interleaved spawn order, stacking, multipliers, clamping, chaining, pit capacity).
Brute force over placements on columns 1..10, plates U/D/A stacked up to 2 per cell, up to the budget.
Exits non-zero if a level cannot be won with zero leaks within its budget.
"""
import itertools, re, sys

COLS, ROWS, MAX_STACK, MAX_CHAIN, MAX_SIM = 12, 7, 2, 4, 400
LIGHT, SLICK, HEAVY = 0, 1, 2

def parse_levels(path="main.gd"):
    src = open(path).read()
    body = src[src.index("const LEVELS := ["):]
    body = body[: body.index("\n]\n") + 3]
    body = body.replace("Kind.LIGHT", "0").replace("Kind.SLICK", "1").replace("Kind.HEAVY", "2")
    body = body[body.index("[") :]
    return eval(body)

def displacement(kind, s):
    if kind == LIGHT: return s
    if kind == SLICK: return 2 * s
    return (1 if s > 0 else -1 if s < 0 else 0) * (abs(s) // 2)

def run(level, wave, plates):
    """plates: {(c, r): "UD"...}. Returns (killed, leaked)."""
    groups = level["waves"][wave]
    left = [g[2] for g in groups]
    queue = []
    while any(left):
        for gi, g in enumerate(groups):
            if left[gi] > 0:
                queue.append((g[0], g[1])); left[gi] -= 1
    alt = {k: -1 for k, v in plates.items() if "A" in v}
    pits = {(p[0], p[1]): p[2] for p in level["pits"]}
    enemies, killed, leaked, tick = [], 0, 0, 0
    def enter(e, chain):
        nonlocal killed
        key = (e["col"], e["row"])
        if chain <= MAX_CHAIN and key in plates:
            s = 0
            for p in plates[key]:
                if p == "U": s -= 1
                elif p == "D": s += 1
                else:
                    s += alt[key]; alt[key] = -alt[key]
            d = displacement(e["kind"], s)
            if d:
                e["row"] = max(0, min(ROWS - 1, e["row"] + d))
                return enter(e, chain + 1)
        key = (e["col"], e["row"])
        if pits.get(key, 0) > 0:
            pits[key] -= 1; e["alive"] = False; killed += 1
            return True
        return False
    while tick < MAX_SIM and (queue or any(e["alive"] for e in enemies)):
        tick += 1
        for e in enemies:
            if not e["alive"]: continue
            e["col"] += 1
            if enter(e, 0): continue
            if e["col"] >= COLS - 1:
                e["alive"] = False; leaked += 1
        if queue:
            k, r = queue.pop(0)
            enemies.append({"kind": k, "col": 0, "row": r, "alive": True})
    return killed, leaked

def solvable(level, plates):
    """All waves in order on one layout, zero leaks; pits keep their remaining capacity between waves."""
    pits = {(p[0], p[1]): p[2] for p in level["pits"]}
    for w in range(len(level["waves"])):
        lvw = {"waves": level["waves"], "pits": [[c, r, cap] for (c, r), cap in pits.items()]}
        killed, leaked = run(lvw, w, plates)
        if leaked:
            return False
        pits = remaining_pits(lvw, w, plates)
    return True

def remaining_pits(level, wave, plates):
    pits = {(p[0], p[1]): p[2] for p in level["pits"]}
    # rerun with per-pit accounting
    groups = level["waves"][wave]
    left = [g[2] for g in groups]; queue = []
    while any(left):
        for gi, g in enumerate(groups):
            if left[gi] > 0: queue.append((g[0], g[1])); left[gi] -= 1
    alt = {k: -1 for k, v in plates.items() if "A" in v}
    enemies, tick = [], 0
    def enter(e, chain):
        key = (e["col"], e["row"])
        if chain <= MAX_CHAIN and key in plates:
            s = 0
            for p in plates[key]:
                if p == "U": s -= 1
                elif p == "D": s += 1
                else: s += alt[key]; alt[key] = -alt[key]
            d = displacement(e["kind"], s)
            if d:
                e["row"] = max(0, min(ROWS - 1, e["row"] + d)); return enter(e, chain + 1)
        key = (e["col"], e["row"])
        if pits.get(key, 0) > 0:
            pits[key] -= 1; e["alive"] = False; return True
        return False
    while tick < MAX_SIM and (queue or any(e["alive"] for e in enemies)):
        tick += 1
        for e in enemies:
            if not e["alive"]: continue
            e["col"] += 1
            if enter(e, 0): continue
            if e["col"] >= COLS - 1: e["alive"] = False
        if queue:
            k, r = queue.pop(0); enemies.append({"kind": k, "col": 0, "row": r, "alive": True})
    return pits

def candidate_cells(level):
    pits = {(p[0], p[1]) for p in level["pits"]}
    return [(c, r) for c in range(1, COLS - 1) for r in range(ROWS) if (c, r) not in pits]

def search(level):
    cells = candidate_cells(level)
    stacks = ["U", "D", "A", "UU", "DD", "AA", "UD", "UA", "DA"]
    for n in range(1, level["budget"] + 1):
        # choose up to n plates: enumerate multisets of (cell, stack) with total plate count n
        for k in range(1, n + 1):
            for cells_k in itertools.combinations(cells, k):
                for combo in itertools.product(stacks, repeat=k):
                    if sum(len(s) for s in combo) != n: continue
                    plates = dict(zip(cells_k, combo))
                    if solvable(level, plates):
                        return n, plates
    return None, None

def main():
    levels = parse_levels()
    bad = 0
    for i, lv in enumerate(levels):
        n, plates = search(lv)
        if n is None:
            print(f"level {i+1} {lv['name']!r}: NOT solvable within budget {lv['budget']}"); bad += 1
        else:
            lay = " ".join(f"{s}@{c},{r}" for (c, r), s in sorted(plates.items()))
            print(f"level {i+1} {lv['name']!r}: min plates {n} (budget {lv['budget']})  e.g. {lay}")
    sys.exit(1 if bad else 0)

if __name__ == "__main__":
    main()
