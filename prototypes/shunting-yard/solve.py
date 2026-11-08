#!/usr/bin/env python3
"""Verify every Shunting Yard level has a perfect incremental run: plates arrive as income before each wave,
plates that ran a wave are locked, every wave must pass with zero leaks.

Mirrors main.gd: interleaved spawn order, stacking (max 2), multipliers, clamping, chaining (max 4), pit capacity
carried across waves, bolted cells, rails. Per wave, the search adds plates (within the cumulative income) on the
path of a leaking enemy or of an enemy that filled a pit on its path; it backtracks over earlier waves' choices.
Also reports, for wave 1, how many distinct minimal layouts pass it: 1 means "find the one layout".

    python3 solve.py                      check all levels
    python3 solve.py 9 "U@8,2 A@8,3"      test one layout on level 9 (all waves, pre-placed)
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

def evaluate_wave(level, w, plates, pits_in):
    """Runs wave w on pits_in (copied). Returns (ok, repair_cells, pits_out)."""
    pits = dict(pits_in)
    forbidden = set(pits) | {(b[0], b[1]) for b in level.get("bolted", [])}
    rails = set(level.get("rails", range(1, COLS - 1)))
    enemies = run_wave(level, w, plates, pits)
    leakers = [e for e in enemies if e["end"] == "base"]
    if not leakers:
        return True, set(), pits
    e = leakers[0]
    cells = set(e["path"])
    on_path = set(e["path"])
    for o in enemies:
        if o["end"] not in (None, "base") and o["end"] in on_path:
            cells |= set(o["path"])
    cells = {c for c in cells if c[0] in rails and c not in forbidden}
    return False, cells, pits

def key_of(plates):
    return tuple(sorted((c, "".join(sorted(v))) for c, v in plates.items()))

def plates_count(plates):
    return sum(len(v) for v in plates.values())

def layouts_for_wave(level, w, base, pits, limit):
    """All layouts that extend `base` with up to `limit` total plates and pass wave w, fewest additions first."""
    out, seen = [], set()
    def dfs(plates, used):
        k = key_of(plates)
        if k in seen:
            return
        seen.add(k)
        ok, cells, pits_out = evaluate_wave(level, w, plates, pits)
        if ok:
            out.append((dict(plates), pits_out))
            return
        if used >= limit:
            return
        for c in cells:
            stack = plates.get(c, "")
            if len(stack) >= MAX_STACK:
                continue
            for t in "UDA":
                plates[c] = stack + t
                dfs(plates, used + 1)
                if stack:
                    plates[c] = stack
                else:
                    del plates[c]
    dfs(dict(base), plates_count(base))
    out.sort(key=lambda x: plates_count(x[0]))
    return out

def perfect_run(level):
    """A sequence of layouts, one per wave, each extending the previous within cumulative income; or None."""
    cum, total = [], 0
    for inc in level["income"]:
        total += inc
        cum.append(total)
    pits0 = {(p[0], p[1]): p[2] for p in level["pits"]}
    def rec(w, base, pits):
        if w == len(level["waves"]):
            return []
        for layout, pits_out in layouts_for_wave(level, w, base, pits, cum[w]):
            rest = rec(w + 1, layout, pits_out)
            if rest is not None:
                return [layout] + rest
        return None
    return rec(0, {}, pits0)

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
        pits = {(p[0], p[1]): p[2] for p in lv["pits"]}
        for w in range(len(lv["waves"])):
            ok, cells, pits = evaluate_wave(lv, w, plates, pits)
            print(f"wave {w+1}: {'clean' if ok else 'leaks; try cells ' + str(sorted(cells))}")
        return
    bad = 0
    for i, lv in enumerate(levels):
        run = perfect_run(lv)
        pits0 = {(p[0], p[1]): p[2] for p in lv["pits"]}
        first = layouts_for_wave(lv, 0, {}, pits0, lv["income"][0])
        nmin = plates_count(first[0][0]) if first else None
        n_at_min = sum(1 for l, _ in first if plates_count(l) == nmin) if first else 0
        if run is None:
            print(f"level {i+1:2d} {lv['name']!r}: NO perfect run within income {lv['income']}"); bad += 1
        else:
            steps = " | ".join(fmt(l) or "-" for l in run)
            print(f"level {i+1:2d} {lv['name']!r}: income {lv['income']}, wave-1 min {nmin} plates ({n_at_min} layouts); run: {steps}")
    sys.exit(1 if bad else 0)

if __name__ == "__main__":
    main()
