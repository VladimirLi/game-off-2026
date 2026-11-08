#!/usr/bin/env python3
"""Verify every Shunting Yard level: fewest plates that win all waves with zero leaks, and how many
distinct layouts do it with that many plates (1 = the player must find the one layout).

Mirrors main.gd: interleaved spawn order, stacking (max 2), multipliers, clamping, chaining (max 4),
pit capacity carried across waves, bolted cells. Search: iterative deepening on plate count; each step
adds one plate on a cell along the path of a leaking enemy or of an enemy that used up a pit on the
leaker's path (any zero-leak fix must touch one of those cells). Exits non-zero if a level's budget is
below its minimum.

    python3 solve.py            check all levels
    python3 solve.py 9 "U@4,5 U@4,4"   test one layout on level 9
"""
import sys

COLS, ROWS, MAX_STACK, MAX_CHAIN, MAX_SIM = 12, 7, 2, 4, 400
LIGHT, SLICK, HEAVY = 0, 1, 2

def parse_levels(path="main.gd"):
    src = open(path).read()
    body = src[src.index("const LEVELS := ["):]
    body = body[: body.index("\n]\n") + 3]
    body = body.replace("Kind.LIGHT", "0").replace("Kind.SLICK", "1").replace("Kind.HEAVY", "2")
    return eval(body[body.index("["):])

def displacement(kind, s):
    if kind == LIGHT: return s
    if kind == SLICK: return 2 * s
    return (1 if s > 0 else -1 if s < 0 else 0) * (abs(s) // 2)

def run_wave(level, wave, plates, pits):
    """Runs one wave on the given pit capacities (mutated). Returns list of enemy records."""
    groups = level["waves"][wave]
    left = [g[2] for g in groups]; queue = []
    while any(left):
        for gi, g in enumerate(groups):
            if left[gi] > 0:
                queue.append((g[0], g[1])); left[gi] -= 1
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
                e["row"] = max(0, min(ROWS - 1, e["row"] + d)); e["path"].append((e["col"], e["row"]))
                return enter(e, chain + 1)
        key = (e["col"], e["row"])
        if pits.get(key, 0) > 0:
            pits[key] -= 1; e["alive"] = False; e["end"] = key
            return True
        return False
    while tick < MAX_SIM and (queue or any(e["alive"] for e in enemies)):
        tick += 1
        for e in enemies:
            if not e["alive"]: continue
            e["col"] += 1; e["path"].append((e["col"], e["row"]))
            if enter(e, 0): continue
            if e["col"] >= COLS - 1:
                e["alive"] = False; e["end"] = "base"
        if queue:
            k, r = queue.pop(0)
            enemies.append({"kind": k, "col": 0, "row": r, "alive": True, "end": None, "path": [(0, r)]})
    return enemies

def evaluate(level, plates):
    """Returns (ok, repair_cells): ok if zero leaks over all waves; else cells worth adding a plate to."""
    pits = {(p[0], p[1]): p[2] for p in level["pits"]}
    forbidden = set(pits) | {(b[0], b[1]) for b in level.get("bolted", [])}
    for w in range(len(level["waves"])):
        enemies = run_wave(level, w, plates, pits)
        leakers = [e for e in enemies if e["end"] == "base"]
        if leakers:
            e = leakers[0]
            cells = set(e["path"])
            on_path = set(e["path"])
            for o in enemies:
                if o["end"] not in (None, "base") and o["end"] in on_path:
                    cells |= set(o["path"])  # it filled a pit the leaker crossed
            cells = {c for c in cells if 1 <= c[0] <= COLS - 2 and c not in forbidden}
            return False, cells
    return True, set()

def key_of(plates):
    return tuple(sorted((c, "".join(sorted(v))) for c, v in plates.items()))

def search(level, max_n):
    """Fewest plates (<= max_n) and the set of distinct winning layouts at that count."""
    for n in range(1, max_n + 1):
        found, seen = {}, set()
        def dfs(plates, used):
            k = key_of(plates)
            if (k, used) in seen: return
            seen.add((k, used))
            ok, cells = evaluate(level, plates)
            if ok:
                if used == n: found[k] = dict(plates)
                return
            if used == n: return
            for c in cells:
                stack = plates.get(c, "")
                if len(stack) >= MAX_STACK: continue
                for t in "UDA":
                    plates[c] = stack + t
                    dfs(plates, used + 1)
                    if stack: plates[c] = stack
                    else: del plates[c]
        dfs({}, 0)
        if found:
            return n, list(found.values())
    return None, []

def fmt(plates):
    return " ".join(f"{''.join(sorted(v))}@{c[0]},{c[1]}" for c, v in sorted(plates.items()))

def main():
    levels = parse_levels()
    if len(sys.argv) >= 3:
        lv = levels[int(sys.argv[1]) - 1]
        plates = {}
        for tok in sys.argv[2].split():
            st, pos = tok.split("@"); c, r = map(int, pos.split(","))
            plates[(c, r)] = st
        ok, cells = evaluate(lv, plates)
        print("wins" if ok else f"leaks; try cells {sorted(cells)}"); return
    bad = 0
    for i, lv in enumerate(levels):
        n, sols = search(lv, lv["budget"])
        if n is None:
            print(f"level {i+1:2d} {lv['name']!r}: NOT solvable within budget {lv['budget']}"); bad += 1
        else:
            slack = lv["budget"] - n
            print(f"level {i+1:2d} {lv['name']!r}: min {n} plates, budget {lv['budget']} (slack {slack}), {len(sols)} layout(s) at min, e.g. {fmt(sols[0])}")
    sys.exit(1 if bad else 0)

if __name__ == "__main__":
    main()
