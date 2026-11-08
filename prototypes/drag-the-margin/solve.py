"""Reachability and par solver for Drag the margin. Reads LEVELS from main.gd.
Model (mirrors main.gd, pixel units): words are floors; the player (20 px wide) cannot jump up a 48 px line.
State: (margin width, alignment, word you stand on, letters collected). Moves:
  walk:  to any word in the same segment. Segments split at spike walls (all-punctuation words of 4+ chars), at
         gaps wider than 4 cells (64 px, the most a hop is trusted to clear), and at 2+ cell gaps with a spike just
         before or a capital just after (clearing both in one hop is a pixel-precise jump). Other spikes, capitals and
         gaps are hopped.
  fall:  walk or jump off any free edge of the segment: a line end or a gap of 2+ cells (32 px, wider than the player),
         never past the solid left wall or the solid margin (it moves with the handle). In the air the player steers freely (modelled at 115 px/s, the game allows 140),
         so it can land on any lower line its body can reach, including shorter lines back under the one it left.
         It dies if its body overlaps a spike where it lands. A landing or pass counts only with 4 px of slack either side,
         and a pass must stay 8 px further clear of spikes and capitals on the line it passes (the body is level
         with that line for a moment and can drift). Just after walking off, the path may not cross the take-off
         line's spikes or capitals at all.
  die:   a death respawns on the first word, keeping width, alignment and letters (cost 0). Only where a death is
         possible: a punctuation spike in the segment to walk into, or a drop that reaches no lower line.
  ride:  change the margin to any width while standing on a word (cost 1: one commit is one change, however far).
  tab:   cycle alignment left > centre > right > justify, riding your word (cost 1; only on "align" levels).
  spell: on "spell" levels, letters must be touched in order; touching = walking onto that word's segment.
0-1 BFS gives par, the minimum number of changes.
Usage: python3 solve.py              check every level: stored par matches, no zero-change win, levels 2+ par >= 2,
                                     level 1 par 1 or 2, level 9 needs a Tab and a margin change within its budget
       python3 solve.py plan         print each level's optimal plan for tools/bot.gd
       python3 solve.py "text"       print par for every start width (left alignment)"""
import json, re, sys
from collections import deque
PUNCT = ",.;:!?"; MAXC = 55; MAXL = 9
OX = 32; CW = 16; HALF = 10; SPIKE_IN = 4; REACH = 48; MAX_HOP_GAP = 4
ALIGNS = ["left", "centre", "right", "justify"]

def is_wall(w): return len(w) >= 4 and all(c in PUNCT for c in w)

def layout(words, cols, align=0):
    """(line, col) per word. Greedy wrap, then alignment shifts whole cells (justify widens gaps, not the last line)."""
    lines = [[]]; col = 0
    for i, w in enumerate(words):
        if col > 0 and col + len(w) > cols: lines.append([]); col = 0
        lines[-1].append(i); col += len(w) + 1
    out = [None] * len(words)
    for l, ids in enumerate(lines):
        slack = cols - (sum(len(words[i]) for i in ids) + len(ids) - 1)
        lead = {0: 0, 1: slack // 2, 2: slack, 3: 0}[align]
        gaps = len(ids) - 1
        c = lead
        for n, i in enumerate(ids):
            out[i] = (l, c)
            extra = 0
            if align == 3 and gaps > 0 and l < len(lines) - 1:
                extra = slack // gaps + (1 if n < slack % gaps else 0)
            c += len(words[i]) + 1 + extra
    return out

def min_cols(words):
    c = max(len(w) for w in words)
    while layout(words, c)[-1][0] + 1 > MAXL: c += 1
    return c

# ---- falling with mid-air steering -------------------------------------------------------------------------
# Horizontal control is instant in the game, so a falling player can steer either way at up to 140 px/s.
# The solver uses V (a little slower, for safety) and propagates the set of reachable centre x positions line by
# line: at each lower line, positions over a word land there; the rest fall on and spread by V * time.
V = 115.0; G = 1100.0; JUMP = 260.0; LH = 48; WALL_X = OX + HALF + 1; ROBUST = 4  # px of slack a human gets on every landing and pass
DRIFT = 8  # px the body can drift sideways while it is still level with a line it falls past (~0.05 s at 140 px/s)
TOP = 72    # y of line 0's floor (OY + CH in main.gd)

def t_walk(depth): return (2 * depth / G) ** 0.5
def t_jump(depth): return (JUMP + (JUMP * JUMP + 2 * G * depth) ** 0.5) / G

def merge(iv):
    iv = sorted((a, b) for a, b in iv if b >= a); out = []
    for a, b in iv:
        if out and a <= out[-1][1]: out[-1] = (out[-1][0], max(out[-1][1], b))
        else: out.append((a, b))
    return out
def dilate(iv, d, hi): return merge([(max(a - d, WALL_X), min(b + d, hi)) for a, b in iv])
def subtract(iv, cut):
    out = []
    for a, b in iv:
        pieces = [(a, b)]
        for c, d in cut:
            pieces = [q for x, y in pieces for q in ((x, min(y, c)), (max(x, d), y)) if q[1] > q[0]]
        out += pieces
    return merge(out)

class Layout:
    def __init__(self, words, cols, align):
        self.lay = lay = layout(words, cols, align); n = len(words); self.words = words
        self.hi = OX + cols * CW - HALF - 1  # the margin is a wall too
        nl = lay[-1][0] + 1; self.nl = nl
        self.spans = [[] for _ in range(nl)]; self.spikes = [[] for _ in range(nl)]
        for i, ((l, c), w) in enumerate(zip(lay, words)):
            x0 = OX + c * CW; self.spans[l].append((x0, x0 + len(w) * CW, i))
            for k, ch in enumerate(w):
                if ch in PUNCT: self.spikes[l].append((x0 + k * CW + SPIKE_IN, x0 + (k + 1) * CW - SPIKE_IN))
            self.obst = getattr(self, "obst", [[] for _ in range(nl)])
            for k, ch in enumerate(w):  # things a body brushing past a line can hit: spikes kill, capitals block
                if ch in PUNCT or ch.isupper(): self.obst[l].append((x0 + k * CW, x0 + (k + 1) * CW))
        self.seg = [None] * n; self.members = {}; sid = 0; takeoffs = {}
        for l in range(nl):
            row = self.spans[l]; sid += 1; cur = None
            for idx, (a, b, i) in enumerate(row):
                prv = row[idx - 1] if idx else None; nxt = row[idx + 1] if idx + 1 < len(row) else None
                gap_l = None if prv is None else (a - prv[1]) // CW
                gap_r = None if nxt is None else (nxt[0] - b) // CW
                if is_wall(words[i]):
                    sid += 1; cur = None; continue
                hard = gap_l is not None and gap_l >= 2 and (words[prv[2]][-1] in PUNCT or words[i][0].isupper())
                if cur is None or gap_l is None or (gap_l > MAX_HOP_GAP or hard):
                    sid += 1; cur = sid
                self.seg[i] = cur; self.members.setdefault(cur, []).append(i)
                # take-off edges: a line end, or a gap of 2+ cells (wider than the player)
                if gap_l is None or gap_l >= 2:
                    takeoffs.setdefault(cur, []).append((l, a, -1, words[i][0] in PUNCT, prv is not None and is_wall(words[prv[2]])))
                if gap_r is None or gap_r >= 2:
                    takeoffs.setdefault(cur, []).append((l, b, 1, words[i][-1] in PUNCT, nxt is not None and is_wall(words[nxt[2]])))
        self.fall = {s: {} for s in self.members}
        self.death = {}
        for s, ms in self.members.items():  # walk into a spike in the segment
            for i in ms:
                for k, ch in enumerate(words[i]):
                    if ch in PUNCT and s not in self.death: self.death[s] = f"ds{i},{k}"
        for s, tos in takeoffs.items():
            for l, edge, side, spike, wall_next in tos:
                if not spike: self._fly(s, l, f"W{'R' if side > 0 else 'L'}", edge + side * HALF, False)
                if not wall_next: self._fly(s, l, f"J{'R' if side > 0 else 'L'}", edge - side * (32 if spike else 9), True)

    def _catch(self, j):
        return [(a - HALF, b + HALF) for a, b, _ in self.spans[j]]

    def _fly(self, s, l, kind, x0, jump):
        if x0 < WALL_X or x0 > self.hi: return
        tf = t_jump if jump else t_walk
        # levels the body passes, as (depth below the take-off floor, line, is a floor line we could land on)
        levels = [(0, l, False)] if jump else [(14, l, False)]  # leaving: still level with the take-off line
        levels += [(k * LH, l + k, True) for k in range(1, self.nl - l)]
        R = [(x0, x0)]; t_prev = 0.0; hist = []
        for depth, j, floor in levels:
            t = tf(depth); R = dilate(R, V * (t - t_prev), self.hi); t_prev = t
            y = TOP + LH * l + depth
            hist.append((y, R))
            if floor:
                for x in range(int(min(a for a, _ in R)), int(max(b for _, b in R)) + 1):
                    if not any(a + ROBUST <= x <= b - ROBUST for a, b in R): continue
                    sg = self._land(j, x)
                    if sg is not None and sg not in self.fall[s] and all(self._land(j, x + d) == sg for d in (-ROBUST, ROBUST)):
                        self.fall[s][sg] = (kind, x0, self._path(hist, x))
            if not floor and not jump:
                # just walked off, still level with the take-off line for ~0.16 s: the straight path from the edge
                # to here must not cross that line's spikes or capitals, so keep only the piece that holds x0
                R = [iv for iv in subtract(R, [(a - HALF - ROBUST, b + HALF + ROBUST) for a, b in self.obst[j]])
                     if iv[0] - ROBUST <= x0 <= iv[1] + ROBUST]
            else:
                cut = [(a - HALF - ROBUST - DRIFT, b + HALF + ROBUST + DRIFT) for a, b in self.obst[j]]
                cut += [(a - HALF - ROBUST, b + HALF + ROBUST) for a, b in self._catch_raw(j)]
                R = subtract(R, cut)
            hist[-1] = (y, R)  # waypoints at a level must be in its passing set
            if not R: break
        else:
            if R and s not in self.death:  # some path misses every line: a deliberate fall to the bottom
                a, b = R[0]
                self.death[s] = f"df{kind}@{round(x0)}:" + ",".join(self._path(hist, (a + b) / 2))

    def _catch_raw(self, j): return [(a, b) for a, b, _ in self.spans[j]]

    def _path(self, hist, x):
        """Waypoints x_y: steer to x until the body's bottom passes y. Each is reachable from the previous at V."""
        pts = [(x, hist[-1][0])]
        for idx in range(len(hist) - 2, -1, -1):
            y, R = hist[idx]; nxt = pts[-1][0]; best = None
            for a, b in R:
                c = min(max(nxt, a + ROBUST), b - ROBUST)
                if best is None or abs(c - nxt) < abs(best - nxt): best = c
            pts.append((best, y))
        return [f"{round(px)}_{round(py)}" for px, py in reversed(pts)]

    def _land(self, j, c):
        hit = [i for a, b, i in self.spans[j] if a < c + HALF and b > c - HALF]
        if not hit: return None
        if any(a < c + HALF + ROBUST and b > c - HALF - ROBUST for a, b in self.spikes[j]): return None
        return self.seg[hit[0]]

def parse_levels(src):
    out = []
    for m in re.finditer(r'\["(.*?)", (\d+), (\d+)(?:, "(\w*)")?(?:, (\[\[.*?\]\]))?\]', src):
        out.append(dict(text=m[1], start=int(m[2]), par=int(m[3]), kind=m[4] or "",
                        letters=[tuple(x) for x in json.loads(m[5])] if m[5] else []))
    return out

def budget_for(n, par):
    """Mirrors main.gd: levels 1-3 unlimited (None), 4-10 par + 2."""
    return None if n <= 3 else par + 2

def levels():
    out = parse_levels(open(__file__.replace("solve.py", "main.gd")).read())
    for n, lv in enumerate(out, 1): lv["budget"] = budget_for(n, lv["par"])
    return out

def search(lv, allow_align=None, max_margin=None):
    words = lv["text"].split(); start = lv["start"]; letters = lv["letters"]
    allow_align = lv["kind"] == "align" if allow_align is None else allow_align
    lo = min_cols(words); goal = len(words) - 1; cache = {}
    def L(w, a):
        if (w, a) not in cache: cache[(w, a)] = Layout(words, w, a)
        return cache[(w, a)]
    def collect(X, s, p):
        while p < len(letters) and letters[p][0] in X.members[s]: p += 1
        return p
    s0 = (start, 0, 0, 0, 0)  # width, align, word, progress, margin changes used (only tracked if max_margin)
    dist = {s0: 0}; prev = {}; dq = deque([s0])
    while dq:
        st = dq.popleft(); d = dist[st]; w, a, i, p, mm = st; X = L(w, a); s = X.seg[i]
        p = collect(X, s, p)
        if p == len(letters) and goal in X.members[s]:
            acts = []; cur = st
            while cur in prev: cur, act = prev[cur]; acts.append(act)
            return d, list(reversed(acts)) + [f"w{goal}"]
        nxt = []
        p0 = st[3]
        pre = [f"c{letters[q][0]},{letters[q][1]}" for q in range(p0, p)]
        for j in X.members[s]: nxt.append(((w, a, j, p, mm), 0, pre + [f"w{j}"]))
        for s2, (kind, x0, path) in X.fall[s].items():
            tok = f"f{kind}@{round(x0)}:" + ",".join(path)
            for j in X.members[s2]: nxt.append(((w, a, j, p, mm), 0, pre + [tok, f"w{j}"]))
        if s in X.death: nxt.append(((w, a, 0, p, mm), 0, pre + [X.death[s]]))
        if max_margin is None or mm < max_margin:
            for w2 in range(lo, MAXC + 1):
                if w2 != w:
                    nxt.append(((w2, a, i, p, mm + (max_margin is not None)), 1, pre + [f"r{w2 - w:+d}"]))
        if allow_align: nxt.append(((w, (a + 1) % 4, i, p, mm), 1, pre + ["t"]))
        for s2, c, act in nxt:
            if dist.get(s2, 1e9) > d + c:
                dist[s2] = d + c; prev[s2] = (st, ";".join(act))
                (dq.appendleft if c == 0 else dq.append)(s2)
    return None, None

def clean_plan(acts):
    toks = ";".join(acts).split(";")
    # a walk is redundant if the next token is another walk (same segment) or a letter/die
    return [t for k, t in enumerate(toks) if not (t[0] == "w" and k + 1 < len(toks) and toks[k + 1][0] in "wcd")]

def check(n, lv):
    p, _ = search(lv)
    errs = []
    if p is None: errs.append("unsolvable")
    elif lv["par"] != p: errs.append(f"par in main.gd should be {p}")
    if n == 1 and p not in (1, 2): errs.append("level 1 should have par 1 or 2")
    if n >= 2 and (p or 0) < 2: errs.append("par below 2")
    if search(lv, allow_align=False, max_margin=0)[0] is not None: errs.append("solvable with zero changes")
    if lv["kind"] == "align":
        # "needs X" means: cannot be finished within the budget without X
        q = search(lv, allow_align=False)[0]
        if q is not None and (lv["budget"] is None or q <= lv["budget"]): errs.append(f"finishable within budget without a Tab ({q} changes)")
        # with one change per commit, any width is one move, so the rule is now "needs a margin change", not "2+"
        q = search(lv, max_margin=0)[0]
        if q is not None and (lv["budget"] is None or q <= lv["budget"]): errs.append(f"finishable within budget with Tabs alone ({q})")
    if lv["kind"] == "spell":
        if not 3 <= len(lv["letters"]) <= 5 or len({k for k, _ in lv["letters"]}) != len(lv["letters"]):
            errs.append("needs 3-5 letters in different words")
    return p, errs

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "plan":
        for n, lv in enumerate(levels(), 1):
            p, acts = search(lv); print(n, p, ";".join(clean_plan(acts)))
        sys.exit()
    if len(sys.argv) > 1:
        ws = sys.argv[1]; lv = dict(text=ws, start=0, par=0, budget=None, kind="", letters=[])
        print("min cols", min_cols(ws.split()))
        print({w: search(dict(lv, start=w))[0] for w in range(min_cols(ws.split()), MAXC + 1)}); sys.exit()
    ok = True
    for n, lv in enumerate(levels(), 1):
        p, errs = check(n, lv); ok &= not errs
        b = "unlimited" if lv["budget"] is None else lv["budget"]
        print(f"level {n} {lv['kind'] or 'plain'}: start width {lv['start']}, par {p}, budget {b}  {'OK' if not errs else 'FAIL: ' + ', '.join(errs)}")
    sys.exit(0 if ok else 1)
