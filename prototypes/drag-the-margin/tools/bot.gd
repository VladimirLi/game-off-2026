extends SceneTree
# Input-only test bot for Drag the margin. It only sends key events (A, D, Space, Left, Right, Tab) and reads state.
# Args: plan <level> "<tokens>"   tokens (from `python3 solve.py plan`):
#         w<word>       walk to a word on this line          c<word>,<char>  walk onto that letter cell
#         f<W|J><R|L>@<x0>:<x1>,<x2>..  drop: Walk off (or Jump from x0) on the Right/Left side, then steer in the air
#                       to each waypoint before crossing each lower line (jumps start with the take-off line)
#         r+1 / r-1     press Right / Left (margin)          t               press Tab (alignment)
#         ds<word>,<char>  walk into that spike to die (respawn on the first word)
#         df<drop>      a drop (as f) whose path misses every line: fall to the bottom and respawn
#       adv <level> <hug|random|ends> <seed>   adversarial, never changes the margin or alignment:
#         hug    hug the left wall with A/D wiggles and Space, then long D runs (the old left-edge descent)
#         random random A/D/none and Space with random durations
#         ends   go to a random free edge (line end or wide gap), walk or jump off, steer randomly in the air
var m
var mode := ""
var lvl := 0
var toks := []
var rng := RandomNumberGenerator.new()
var held := 0
var frames := 0
var wait := 0
var fall_x := -1.0
var fall_y := 0.0
var deaths_seen := 0
var trace := []
var lastpos := Vector2.ZERO
var lastword := ""
var target_x := -1.0
var strat := ""
var timer := 0
var cur_dir := 0
var fl := {}
var drops := 0
var was_floor := true
var edge_age := 0
var deepest := 0
var line_drops := 0
var last_line := 0

func key(k, p):
	var e := InputEventKey.new(); e.keycode = k; e.physical_keycode = k; e.pressed = p
	Input.parse_input_event(e)

func hold(dir):
	if dir == held: return
	if held == 1: key(KEY_D, false)
	if held == -1: key(KEY_A, false)
	if dir == 1: key(KEY_D, true)
	if dir == -1: key(KEY_A, true)
	held = dir

func tap(k):
	key(k, true); key(k, false)

func _initialize():
	var a := OS.get_cmdline_user_args()
	mode = a[0]; lvl = int(a[1]) - 1
	if mode == "plan": toks = Array(a[2].split(";", false))
	else:
		strat = a[2]; rng.seed = int(a[3])
	m = load("res://main.tscn").instantiate()
	root.add_child(m)

func line_y(k): return m.bodies[k].position.y
func span(k) -> Vector2: return Vector2(m.bodies[k].position.x, m.bodies[k].position.x + m.words[k].length() * m.CW)
func standing() -> bool: return m.player.is_on_floor() and m.floor_word >= 0

# Spikes and capitals ahead on the floor line: smallest gap from the player's front edge.
func obstacle_gap(dir) -> float:
	var p = m.player
	var bottom = p.position.y + m.PSIZE.y / 2
	var front = p.position.x + dir * m.PSIZE.x / 2
	var back = p.position.x - dir * m.PSIZE.x / 2
	var best := 1e9
	for k in m.words.size():
		if abs(line_y(k) - bottom) > 3: continue
		for c in m.words[k].length():
			var r: Rect2
			if m.PUNCT.contains(m.words[k][c]): r = m.spike_rect(k, c)
			elif m.is_cap(m.words[k][c]): r = Rect2(m.bodies[k].position + Vector2(c * m.CW, -m.CH), Vector2(m.CW, m.CH))
			else: continue
			var near = r.position.x if dir > 0 else r.end.x
			var far = r.end.x if dir > 0 else r.position.x
			if dir * (far - back) <= 0: continue
			best = min(best, dir * (near - front))
	return best

# Edge of the floor run under the player in direction dir, and the gap (px) to the next word on the line.
func floor_edge(dir) -> Vector2:
	var y = line_y(m.floor_word)
	var spans := []
	for k in m.words.size():
		if abs(line_y(k) - y) < 1: spans.append(span(k))
	spans.sort_custom(func(a, b): return a.x < b.x)
	var cur: Vector2 = span(m.floor_word)
	var i := spans.find(cur)
	var edge = cur.y if dir > 0 else cur.x
	var nb = i + dir
	if nb < 0 or nb >= spans.size(): return Vector2(edge, 1e9)
	return Vector2(edge, spans[nb].x - cur.y if dir > 0 else cur.x - spans[nb].y)

# Will the caret hit us within the next n frames if we stay put? Returns the first frame or -1.
func caret_hit_in(n) -> int:
	if m.kind != "caret": return -1
	var pr := Rect2(m.player.position - m.PSIZE / 2, m.PSIZE).grow(3)
	var q0 = m.caret_q
	var cps = m.char_word.size() / m.CARET_PERIOD
	for f in range(0, n):
		var q = fmod(q0 + f * cps / 60.0, m.char_word.size())
		var i := int(q)
		var p = m.bodies[m.char_word[i]].position
		var r := Rect2(p + Vector2((m.char_off[i] + q - i) * m.CW - 1.5, -20), Vector2(3, 36))
		if r.intersects(pr): return f
	return -1

func walk(dir, no_hop_gap := false, no_hop_spikes := false):
	var p = m.player
	if not p.is_on_floor():
		hold(dir); return
	var t = caret_hit_in(14)
	if t >= 3 and t <= 9:
		key(KEY_SPACE, true); hold(dir); return
	var g = obstacle_gap(dir)
	var fe = floor_edge(dir)
	var past = dir * (p.position.x - fe.x)  # how far the centre is beyond our floor edge
	var gap_cells = fe.y / m.CW
	if no_hop_spikes: g = 1e9
	if g < 5: hold(-dir); key(KEY_SPACE, false)  # too close to hop cleanly: back up
	elif g <= 14: hold(dir); key(KEY_SPACE, true)
	elif gap_cells >= 2 and gap_cells < 1e8 and not no_hop_gap and past >= 2 and past <= 9: hold(dir); key(KEY_SPACE, true)
	else: hold(dir); key(KEY_SPACE, false)

func done(msg):
	hold(0); key(KEY_SPACE, false)
	print("RESULT level %d %s %s | won %s | used %d/%s | deaths %d | drops %d | line_drops %d | deepest %d of %d | spelled %d/%d | %s" % [lvl + 1, mode, strat, m.won, m.used, ("unlimited" if m.budget < 0 else str(m.budget)), m.deaths, drops, line_drops, deepest, line_of(m.words.size() - 1), m.spell_p, m.letters.size(), msg])
	quit()

func go_to_x(x) -> bool:
	if not standing(): return false
	if abs(m.player.position.x - x) < 3:
		hold(0); key(KEY_SPACE, false); return true
	walk(1 if x > m.player.position.x else -1)
	return false

func step_walk(k) -> bool:
	if not standing(): return false
	var s: Vector2 = span(k)
	if m.floor_word == k and m.player.position.x > s.x + 3 and m.player.position.x < s.y - 3:
		hold(0); key(KEY_SPACE, false); return true
	if abs(line_y(m.floor_word) - line_y(k)) > 1: done("plan wants word %d on another line" % k); return false
	walk(1 if (s.x + s.y) / 2 > m.player.position.x else -1)
	return false

func line_top(line) -> float: return 72.0 + 48.0 * line
func line_of(k) -> int: return roundi((line_y(k) - 72.0) / 48.0)

func step_fall(tok: String) -> bool:
	if fl.is_empty():
		if not standing(): return false
		var head = tok.substr(1).split("@")
		var rest = head[1].split(":")
		fl = {"jump": head[0][0] == "J", "side": 1 if head[0][1] == "R" else -1, "x0": float(rest[0]),
			"pts": Array(rest[1].split(",")).map(func(v): return Vector2(float(v.split("_")[0]), float(v.split("_")[1]))),
			"line": line_of(m.floor_word), "idx": 0, "air": false}
	var p = m.player
	if standing() and line_of(m.floor_word) > fl.line:
		fl = {}; return true
	if not fl.air:
		if not standing(): fl.air = true
		elif abs(p.position.x - fl.x0) < 40 and caret_busy(fl.line, roundi((fl.pts[-1].y - 72.0) / 48.0), 80):
			stand(); return false  # let the caret pass before dropping into its lines
		elif fl.jump:
			if abs(p.position.x - fl.x0) < 2.5:
				key(KEY_SPACE, true); fl.air = true; hold(sign(fl.pts[0].x - p.position.x))
			else:
				walk(1 if fl.x0 > p.position.x else -1)
			return false
		else:
			var edge = fl.x0 - fl.side * 10
			if fl.side * (edge - p.position.x) < -4 and not fl.has("back"):
				walk(-fl.side)  # the take-off edge is behind us: walk back to it first
				return false
			fl["back"] = true
			var fe = floor_edge(fl.side)
			walk(fl.side, abs(fe.x - edge) < 1)  # never hop the gap we mean to drop into
			return false
	if fl.air and standing() and line_of(m.floor_word) == fl.line:
		fl.air = false; fl.idx = 0  # came back down on the take-off line: try again
		return false
	# airborne: steer to each waypoint until the body's bottom passes that waypoint's height
	var bottom = p.position.y + m.PSIZE.y / 2
	while fl.idx < fl.pts.size() - 1 and p.velocity.y > 0 and bottom > fl.pts[fl.idx].y + 0.5:
		fl.idx += 1
	var tx = fl.pts[fl.idx].x
	if abs(p.position.x - tx) > 1.2: hold(1 if tx > p.position.x else -1)
	else: hold(0)
	return false

func caret_busy(lo, hi, n) -> bool:  # will the caret be on lines lo..hi within n frames?
	if m.kind != "caret": return false
	var cps = m.char_word.size() / m.CARET_PERIOD
	for f in range(0, n, 2):
		var q = fmod(m.caret_q + f * cps / 60.0, m.char_word.size())
		var ln = line_of(m.char_word[int(q)])
		if ln >= lo and ln <= hi: return true
	return false

func stand():  # wait in place, jumping the caret if it is about to hit
	hold(0)
	var t = caret_hit_in(14)
	key(KEY_SPACE, t >= 3 and t <= 9 and m.player.is_on_floor())

func random_free_edge() -> Vector2:  # (edge x, side) on the current line, or side 0 if none
	var y = line_y(m.floor_word)
	var spans := []
	for k in m.words.size():
		if abs(line_y(k) - y) < 1: spans.append(span(k))
	spans.sort_custom(func(a, b): return a.x < b.x)
	var opts := []
	if m.OX + m.cols * m.CW - spans[-1].y >= 32: opts.append(Vector2(spans[-1].y, 1))
	if spans[0].x >= m.OX + 32: opts.append(Vector2(spans[0].x, -1))
	for i in spans.size() - 1:
		if spans[i + 1].x - spans[i].y >= 32: opts.append(Vector2(spans[i].y, 1)); opts.append(Vector2(spans[i + 1].x, -1))
	if opts.is_empty(): return Vector2(0, 0)
	return opts[rng.randi() % opts.size()]

func adversary():
	timer -= 1
	var p = m.player
	match strat:
		"hug":
			if timer <= 0:
				var r = rng.randf()
				if r < 0.35: cur_dir = -1; timer = rng.randi_range(10, 60)
				elif r < 0.75: cur_dir = 1 if cur_dir != 1 else -1; timer = rng.randi_range(2, 8)
				else: cur_dir = 1; timer = rng.randi_range(20, 200)
			hold(cur_dir)
			key(KEY_SPACE, rng.randf() < 0.04 and p.is_on_floor())
		"random":
			if timer <= 0:
				cur_dir = rng.randi_range(-1, 1); timer = rng.randi_range(3, 30)
			hold(cur_dir)
			key(KEY_SPACE, rng.randf() < 0.08 and p.is_on_floor())
		"ends":
			if fl.has("wander"):
				if timer <= 0: cur_dir = rng.randi_range(-1, 1); timer = rng.randi_range(10, 60)
				hold(cur_dir); key(KEY_SPACE, rng.randf() < 0.05 and p.is_on_floor())
				edge_age += 1
				if edge_age > 240: fl = {}; edge_age = 0
			elif standing() and not fl.has("air_rand"):
				edge_age += 1
				if not fl.has("edge") or edge_age > 300:
					var e = random_free_edge()
					edge_age = 0
					if e.y == 0:  # no free edge on this line: wander instead
						fl = {"wander": true}; edge_age = 0
					fl = {"edge": e.x, "side": int(e.y), "jump": rng.randf() < 0.5, "jd": rng.randf_range(4, 40)}
				var d = fl.side * (fl.edge - p.position.x)  # distance to the edge, ahead of us
				if fl.jump and d < fl.jd and d > 0:
					key(KEY_SPACE, true); fl["air_rand"] = true
				var fe = floor_edge(fl.side)
				walk(fl.side, abs(fe.x - fl.edge) < 1)
			elif not p.is_on_floor():
				fl["air_rand"] = true
				key(KEY_SPACE, false)
				if timer <= 0:
					cur_dir = rng.randi_range(-1, 1); timer = rng.randi_range(2, 12)
				hold(cur_dir)
			elif standing():
				fl = {}
			else:  # wedged (on a corner, against a wall): wander out
				fl = {"wander": true}; edge_age = 0

func safe_to_ride() -> bool:
	return caret_hit_in(40) < 0

func _physics_process(_d):
	frames += 1
	if frames == 2: m.load_level(lvl)
	if frames < 40: return false
	if frames > 60 * 120: done("timeout"); return false
	if m.won: done("goal reached"); return false
	if m.failed: done("out of budget"); return false
	if was_floor and not m.player.is_on_floor(): drops += 1
	if standing():
		var ln = line_of(m.floor_word)
		if ln > last_line: line_drops += 1
		last_line = ln
		deepest = max(deepest, ln)
	was_floor = m.player.is_on_floor()
	if not m.player.is_on_floor() and mode != "adv": key(KEY_SPACE, false)
	if standing(): lastword = m.words[m.floor_word]
	var dying = toks.size() > 0 and toks[0].begins_with("d")
	if m.deaths > deaths_seen:
		deaths_seen = m.deaths; fall_x = -1.0; fl = {}
		trace.append("died after '%s' at %s width %d %s" % [lastword, lastpos.round(), m.cols, m.ALIGNS[m.align]])
		if dying: toks.pop_front()
		elif mode == "plan" or m.deaths > 400: done("deaths: " + "; ".join(trace)); return false
	lastpos = m.player.position
	if wait > 0: wait -= 1; return false
	if mode == "adv":
		adversary()
		return false
	if toks.is_empty(): done("plan finished without reaching goal"); return false
	var t: String = toks[0]
	var fin := false
	match t[0]:
		"w": fin = step_walk(int(t.substr(1)))
		"c":
			var kc = t.substr(1).split(",")
			var k = int(kc[0]); var c = int(kc[1])
			if standing() and m.floor_word != k and abs(line_y(m.floor_word) - line_y(k)) < 1 and target_x < 0:
				target_x = 0  # walk onto the word first
			fin = go_to_x(m.bodies[k].position.x + c * m.CW + m.CW / 2)
			if fin: target_x = -1.0
		"f": fin = step_fall(t)
		"d":
			if t[1] == "s":
				var kc = t.substr(2).split(",")
				var x = m.bodies[int(kc[0])].position.x + int(kc[1]) * m.CW + m.CW / 2
				if standing(): walk(1 if x > m.player.position.x else -1, false, true)
			else:
				step_fall(t.substr(1))
		"r", "t":
			if standing() and safe_to_ride():
				hold(0)
				tap(KEY_TAB if t == "t" else (KEY_RIGHT if t[1] == "+" else KEY_LEFT))
				fin = true; wait = 25
	if fin: toks.pop_front()
	return false
