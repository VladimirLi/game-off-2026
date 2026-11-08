extends Node2D
# Shunting yard: a tower defence where towers never kill. Every tower is a floor plate that shifts the
# enemy stepping on it sideways; the only things that kill are pits, and pits have a capacity.
# Enemies walk east one cell per tick. Shift strength is the number of plates stacked on a cell (max 2).
# Light moves 1 cell per strength, Slick 2, Heavy needs strength 2 to move 1. The Alternator shifts up, then
# down, alternating per enemy. An enemy shifted onto another plate is shifted again (chains up to 4).
# Walls clamp. Before Go, every enemy's path through the machine is traced, and each pit shows its predicted fill.
# Levels: {name, pits: [[col, row, capacity]], budget, waves: [[[kind, row, count], ...], ...]}.
# Groups within a wave are interleaved, so sorting matters. Each level gives 5 lives; a leak costs one.

const COLS := 12            # column 0 spawns, column 11 is the base
const ROWS := 7
const CS := 64.0
const ORG := Vector2(96, 36)
const PAL_Y := 484.0
const TICK := 0.45
const MAX_STACK := 2
const MAX_CHAIN := 4
const LIVES := 5
const MAX_SIM := 400

enum Tool { UP, DOWN, ALT, ERASE }
enum Kind { LIGHT, SLICK, HEAVY }
const KIND_NAME := ["Light", "Slick", "Heavy"]
const KIND_COL := [Color(1, 0.85, 0.3), Color(0.4, 0.9, 1.0), Color(0.85, 0.35, 0.35)]
const KIND_SIZE := [22.0, 16.0, 34.0]
const PLATE_CHAR := ["U", "D", "A"]
const TOOL_NAME := ["Shift up", "Shift down", "Alternator", "Erase"]

const LEVELS := [
	{"name": "One shift", "pits": [[6, 2, 9]], "budget": 2, "waves": [[[Kind.LIGHT, 3, 4]]]},
	{"name": "Slick skips a row", "pits": [[6, 2, 9], [6, 1, 9]], "budget": 2, "waves": [[[Kind.LIGHT, 3, 3], [Kind.SLICK, 3, 3]]]},
	{"name": "Heavy needs two", "pits": [[6, 4, 9], [6, 5, 9]], "budget": 2, "waves": [[[Kind.LIGHT, 3, 3], [Kind.HEAVY, 3, 3]]]},
	{"name": "Pits fill up", "pits": [[6, 2, 3], [6, 4, 3]], "budget": 1, "waves": [[[Kind.LIGHT, 3, 6]]]},
	{"name": "Two lanes", "pits": [[7, 3, 16]], "budget": 3, "waves": [[[Kind.LIGHT, 1, 3], [Kind.SLICK, 5, 3]], [[Kind.LIGHT, 1, 3], [Kind.SLICK, 5, 3], [Kind.HEAVY, 3, 3]]]},
	{"name": "Sort all three", "pits": [[6, 0, 9], [6, 1, 9], [6, 2, 9]], "budget": 2, "waves": [[[Kind.LIGHT, 3, 3], [Kind.SLICK, 3, 3], [Kind.HEAVY, 3, 3]]]},
	{"name": "Share the load", "pits": [[6, 1, 4], [6, 3, 8], [6, 5, 4]], "budget": 4, "waves": [[[Kind.LIGHT, 2, 8], [Kind.LIGHT, 4, 8]]]},
]

var level := 0
var wave := 0
var plates := {}            # Vector2i -> Array[Tool]
var pits := {}              # Vector2i -> capacity left
var budget := 0
var lives := LIVES
var tool: int = Tool.UP
var running := false
var speed := 1.0
var acc := 0.0
var sim := {}               # live simulation state, see new_sim()
var preview: Array = []     # [{kind, cells: [Vector2i], end: "pit"|"base"}]
var pit_fill := {}          # predicted kills per pit from the preview
var flash := {}             # Vector2i -> seconds left
var won := false
var failed := false
var finished := false
var level_t := 0.0
var killed := 0
var leaked := 0
var label: Label
var note := ""
var note_t := 0.0
var font: Font

func _ready() -> void:
	font = ThemeDB.fallback_font
	label = Label.new()
	label.position = Vector2(8, 6)
	add_child(label)
	load_level(0)

func load_level(i: int) -> void:
	level = i
	wave = 0
	plates.clear()
	pits.clear()
	for p in LEVELS[i]["pits"]:
		pits[Vector2i(p[0], p[1])] = p[2]
	budget = LEVELS[i]["budget"]
	lives = LIVES
	running = false
	won = false
	failed = false
	level_t = 0.0
	killed = 0
	leaked = 0
	flash.clear()
	update_preview()

func plates_used() -> int:
	var n := 0
	for k in plates:
		n += plates[k].size()
	return n

func cell_at(p: Vector2) -> Vector2i:
	var c := Vector2i(floori((p.x - ORG.x) / CS), floori((p.y - ORG.y) / CS))
	if c.x < 0 or c.x >= COLS or c.y < 0 or c.y >= ROWS:
		return Vector2i(-1, -1)
	return c

func cell_rect(c: Vector2i) -> Rect2:
	return Rect2(ORG + Vector2(c) * CS, Vector2(CS, CS))

func cell_center(c: Vector2i) -> Vector2:
	return ORG + (Vector2(c) + Vector2(0.5, 0.5)) * CS

# --- simulation (pure over a state dictionary, shared by the run and the preview) ---

func new_sim() -> Dictionary:
	var queue: Array = []
	var groups: Array = LEVELS[level]["waves"][wave]
	var left: Array = []
	for g in groups:
		left.append(g[2])
	var any := true
	while any:  # interleave the groups: L S L S ...
		any = false
		for gi in groups.size():
			if left[gi] > 0:
				queue.append({"kind": groups[gi][0], "row": groups[gi][1]})
				left[gi] -= 1
				any = true
	var alt := {}
	for k in plates:
		if Tool.ALT in plates[k]:
			alt[k] = -1
	return {"queue": queue, "enemies": [], "alt": alt, "pits": pits.duplicate(), "tick": 0, "killed": 0, "leaked": 0}

func displacement(kind: int, s: int) -> int:
	match kind:
		Kind.LIGHT: return s
		Kind.SLICK: return 2 * s
		Kind.HEAVY: return signi(s) * (absi(s) / 2)
	return 0

# Apply the plates on the enemy's cell, chaining onto the landing cell. Returns true if the enemy died in a pit.
func enter_cell(st: Dictionary, e: Dictionary, chain: int, record: bool) -> bool:
	var key := Vector2i(e["col"], e["row"])
	if chain <= MAX_CHAIN and plates.has(key):
		var s := 0
		for p in plates[key]:
			match p:
				Tool.UP: s -= 1
				Tool.DOWN: s += 1
				Tool.ALT:
					s += st["alt"][key]
					st["alt"][key] = -st["alt"][key]
		var d := displacement(e["kind"], s)
		if not record:
			flash[key] = 0.3
		if d != 0:
			e["row"] = clampi(e["row"] + d, 0, ROWS - 1)
			if record:
				e["path"].append(Vector2i(e["col"], e["row"]))
			return enter_cell(st, e, chain + 1, record)
	key = Vector2i(e["col"], e["row"])
	if st["pits"].has(key) and st["pits"][key] > 0:
		st["pits"][key] -= 1
		e["alive"] = false
		e["end"] = "pit"
		e["pit"] = key
		st["killed"] += 1
		return true
	return false

func sim_tick(st: Dictionary, record: bool) -> void:
	st["tick"] += 1
	for e in st["enemies"]:
		if not e["alive"]:
			continue
		e["prev"] = Vector2i(e["col"], e["row"])
		e["col"] += 1
		if record:
			e["path"].append(Vector2i(e["col"], e["row"]))
		if enter_cell(st, e, 0, record):
			continue
		if e["col"] >= COLS - 1:
			e["alive"] = false
			e["end"] = "base"
			st["leaked"] += 1
	if not st["queue"].is_empty():
		var q: Dictionary = st["queue"].pop_front()
		var e := {"kind": q["kind"], "col": 0, "row": q["row"], "prev": Vector2i(0, q["row"]), "alive": true, "end": "", "path": [Vector2i(0, q["row"])], "pit": Vector2i(-1, -1)}
		st["enemies"].append(e)

func sim_done(st: Dictionary) -> bool:
	if not st["queue"].is_empty():
		return false
	for e in st["enemies"]:
		if e["alive"]:
			return false
	return true

func update_preview() -> void:
	preview.clear()
	pit_fill.clear()
	if wave >= LEVELS[level]["waves"].size():
		queue_redraw()
		return
	var st := new_sim()
	var n := 0
	while not sim_done(st) and n < MAX_SIM:
		sim_tick(st, true)
		n += 1
	for e in st["enemies"]:
		preview.append({"kind": e["kind"], "cells": e["path"], "end": e["end"]})
		if e["end"] == "pit":
			pit_fill[e["pit"]] = pit_fill.get(e["pit"], 0) + 1
	queue_redraw()

# --- input ---

func _unhandled_input(ev: InputEvent) -> void:
	if ev is InputEventKey and ev.pressed and not ev.echo:
		match ev.keycode:
			KEY_1: tool = Tool.UP
			KEY_2: tool = Tool.DOWN
			KEY_3: tool = Tool.ALT
			KEY_4, KEY_X: tool = Tool.ERASE
			KEY_SPACE, KEY_ENTER: go()
			KEY_F: speed = 3.0 if speed == 1.0 else 1.0
			KEY_R:
				report("restarted")
				load_level(0 if finished else level)
			KEY_N:
				if won:
					next_level()
				elif ev.shift_pressed and not finished:
					report("SKIPPED")
					next_level()
		queue_redraw()
	if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
		var p: Vector2 = ev.position
		if p.y >= PAL_Y:
			palette_click(p)
		elif not running and not won and not failed and not finished:
			var c := cell_at(p)
			if c.x >= 1 and c.x <= COLS - 2:
				edit_cell(c)
		queue_redraw()

func palette_buttons() -> Array:  # [[Rect2, id], ...] ids: 0..3 tools, "go", "speed"
	var out := []
	var x := 8.0
	for t in 4:
		out.append([Rect2(x, PAL_Y + 6, 150, 44), t])
		x += 158
	out.append([Rect2(x + 10, PAL_Y + 6, 150, 44), "go"])
	out.append([Rect2(x + 170, PAL_Y + 6, 120, 44), "speed"])
	return out

func palette_click(p: Vector2) -> void:
	for b in palette_buttons():
		if b[0].has_point(p):
			if b[1] is int:
				tool = b[1]
			elif b[1] == "go":
				go()
			elif b[1] == "speed":
				speed = 3.0 if speed == 1.0 else 1.0

func edit_cell(c: Vector2i) -> void:
	if pits.has(c):
		set_note("That is a pit.")
		return
	if tool == Tool.ERASE:
		if plates.has(c):
			plates[c].pop_back()
			if plates[c].is_empty():
				plates.erase(c)
	else:
		var stack: Array = plates.get(c, [])
		if stack.size() >= MAX_STACK:
			set_note("Two plates per cell at most.")
			return
		if plates_used() >= budget:
			set_note("No plates left. Erase one first.")
			return
		stack.append(tool)
		plates[c] = stack
	update_preview()

func set_note(t: String) -> void:
	note = t
	note_t = 2.5

func go() -> void:
	if running or won or failed or finished:
		if won:
			next_level()
		return
	if wave >= LEVELS[level]["waves"].size():
		return
	sim = new_sim()
	running = true
	acc = 0.0
	preview.clear()
	pit_fill.clear()

func next_level() -> void:
	if level + 1 < LEVELS.size():
		load_level(level + 1)
	else:
		finished = true

func layout_string() -> String:
	var parts := PackedStringArray()
	var keys := plates.keys()
	keys.sort()
	for k in keys:
		var s := ""
		for p in plates[k]:
			s += PLATE_CHAR[p]
		parts.append("%s@%d,%d" % [s, k.x, k.y])
	return " ".join(parts)

func report(what: String) -> void:
	print("Level %d (%s) %s | wave %d/%d | killed %d leaked %d | lives %d | plates %d/%d: %s | time %.1f s" % [
		level + 1, LEVELS[level]["name"], what, min(wave + 1, LEVELS[level]["waves"].size()), LEVELS[level]["waves"].size(),
		killed, leaked, lives, plates_used(), budget, layout_string(), level_t])

# --- run loop ---

func _process(dt: float) -> void:
	note_t = max(0.0, note_t - dt)
	for k in flash.keys():
		flash[k] -= dt
		if flash[k] <= 0:
			flash.erase(k)
	if not (won or failed or finished):
		level_t += dt
	if running:
		acc += dt * speed
		while acc >= TICK and running:
			acc -= TICK
			var before_leaked: int = sim["leaked"]
			sim_tick(sim, false)
			if sim["leaked"] > before_leaked:
				lives -= sim["leaked"] - before_leaked
			if sim_done(sim) or lives <= 0:
				end_wave()
	queue_redraw()

func end_wave() -> void:
	running = false
	killed += sim["killed"]
	leaked += sim["leaked"]
	for k in sim["pits"]:
		pits[k] = sim["pits"][k]
	if lives <= 0:
		failed = true
		report("FAILED")
		return
	report("wave done")
	wave += 1
	if wave >= LEVELS[level]["waves"].size():
		won = true
		report("complete")
	update_preview()

# --- drawing ---

func _draw() -> void:
	# board
	for r in ROWS:
		for c in COLS:
			var cell := Vector2i(c, r)
			var rect := cell_rect(cell)
			var col := Color(0.16, 0.17, 0.2) if (c + r) % 2 == 0 else Color(0.19, 0.2, 0.23)
			if c == 0:
				col = Color(0.25, 0.3, 0.25)
			elif c == COLS - 1:
				col = Color(0.4, 0.2, 0.2)
			draw_rect(rect.grow(-1), col)
	# lane arrows at the spawn
	for r in ROWS:
		var cc := cell_center(Vector2i(0, r))
		draw_colored_polygon(PackedVector2Array([cc + Vector2(-8, -8), cc + Vector2(8, 0), cc + Vector2(-8, 8)]), Color(0.5, 0.7, 0.5))
	# pits
	var live_pits: Dictionary = sim["pits"] if running else pits
	for k in pits:
		var rect := cell_rect(k)
		var cap: int = live_pits[k]
		draw_rect(rect.grow(-6), Color(0.05, 0.05, 0.07) if cap > 0 else Color(0.3, 0.3, 0.33))
		draw_rect(rect.grow(-6), Color(0.6, 0.6, 0.65), false, 2.0)
		var txt := str(cap)
		var fcol := Color.WHITE
		if not running and pit_fill.has(k):
			txt = "%d/%d" % [pit_fill[k], cap]
			fcol = Color(0.3, 1, 0.45) if pit_fill[k] <= cap else Color(1, 0.4, 0.4)
		draw_string(font, rect.position + Vector2(10, 40), txt, HORIZONTAL_ALIGNMENT_LEFT, -1, 18, fcol)
	# plates
	for k in plates:
		var rect := cell_rect(k)
		var hot: bool = flash.has(k)
		draw_rect(rect.grow(-4), Color(0.55, 0.35, 0.65) if hot else Color(0.35, 0.25, 0.45))
		var stack: Array = plates[k]
		var cc := cell_center(k)
		var n := stack.size()
		for i in n:
			var ox := (i - (n - 1) / 2.0) * 22.0
			draw_plate_glyph(stack[i], cc + Vector2(ox, 0), k)
	# preview paths
	if not running:
		var idx := 0
		for pv in preview:
			var pts := PackedVector2Array()
			var off := Vector2(0, (idx % 5 - 2) * 4.0)
			for c in pv["cells"]:
				pts.append(cell_center(c) + off)
			var col: Color = KIND_COL[pv["kind"]]
			col.a = 0.55
			if pts.size() >= 2:
				draw_polyline(pts, col, 2.0)
			var last := pts[pts.size() - 1]
			if pv["end"] == "pit":
				draw_circle(last, 4, Color(0.3, 1, 0.45))
			else:
				draw_line(last + Vector2(-6, -6), last + Vector2(6, 6), Color(1, 0.3, 0.3), 3.0)
				draw_line(last + Vector2(-6, 6), last + Vector2(6, -6), Color(1, 0.3, 0.3), 3.0)
			idx += 1
	# enemies
	if running:
		var t: float = clamp(acc / TICK, 0.0, 1.0)
		for e in sim["enemies"]:
			if not e["alive"] and e["end"] != "":
				continue
			var a := cell_center(e["prev"])
			var b := cell_center(Vector2i(e["col"], e["row"]))
			var p := a.lerp(b, ease(t, -1.6))
			var s: float = KIND_SIZE[e["kind"]]
			draw_rect(Rect2(p - Vector2(s, s) / 2, Vector2(s, s)), KIND_COL[e["kind"]])
			if e["kind"] == Kind.SLICK:
				draw_rect(Rect2(p - Vector2(s, s) / 2, Vector2(s, s)).grow(3), KIND_COL[e["kind"]], false, 1.5)
	# palette
	draw_rect(Rect2(0, PAL_Y, 960, 540 - PAL_Y), Color(0.1, 0.1, 0.12))
	for b in palette_buttons():
		var rect: Rect2 = b[0]
		var sel: bool = (b[1] is int and b[1] == tool)
		var txt := ""
		var fill := Color(0.22, 0.22, 0.26)
		if b[1] is int:
			txt = "%d  %s" % [b[1] + 1, TOOL_NAME[b[1]]]
			if sel:
				fill = Color(0.45, 0.32, 0.55)
		elif b[1] == "go":
			txt = "Next level" if won else ("Retry (R)" if failed else "Go  (space)")
			fill = Color(0.2, 0.5, 0.3) if not running else Color(0.2, 0.3, 0.22)
		else:
			txt = "Speed x%d (F)" % int(speed)
		draw_rect(rect, fill)
		draw_rect(rect, Color(1, 1, 1, 0.35), false, 1.5)
		draw_string(font, rect.position + Vector2(10, 29), txt, HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Color.WHITE)
	# HUD
	var lv: Dictionary = LEVELS[level]
	var msg := "Level %d/%d  %s    wave %d/%d    plates %d/%d    lives %d    killed %d  leaked %d" % [
		level + 1, LEVELS.size(), lv["name"], min(wave + 1, lv["waves"].size()), lv["waves"].size(), plates_used(), budget, lives, killed, leaked]
	if not running and not won and not failed:
		msg += "    tap a cell: %s" % TOOL_NAME[tool].to_lower()
	if won:
		msg = "Level %d complete: %d killed, %d leaked, %.0f s. Press Next level (N)." % [level + 1, killed, leaked, level_t]
	if failed:
		msg = "Out of lives. R to retry the level."
	if finished:
		msg = "All levels done. R to start over."
	if note_t > 0:
		msg = note
	label.text = msg

func draw_plate_glyph(t: int, c: Vector2, key: Vector2i) -> void:
	var w := Color(1, 1, 1, 0.95)
	match t:
		Tool.UP:
			draw_colored_polygon(PackedVector2Array([c + Vector2(0, -12), c + Vector2(-9, 4), c + Vector2(9, 4)]), w)
			draw_rect(Rect2(c + Vector2(-3, 4), Vector2(6, 8)), w)
		Tool.DOWN:
			draw_colored_polygon(PackedVector2Array([c + Vector2(0, 12), c + Vector2(-9, -4), c + Vector2(9, -4)]), w)
			draw_rect(Rect2(c + Vector2(-3, -12), Vector2(6, 8)), w)
		Tool.ALT:
			var next: int = sim["alt"].get(key, -1) if running and sim.has("alt") else -1
			var up := Color(1, 1, 1, 1.0 if next < 0 else 0.35)
			var dn := Color(1, 1, 1, 1.0 if next > 0 else 0.35)
			draw_colored_polygon(PackedVector2Array([c + Vector2(0, -14), c + Vector2(-7, -3), c + Vector2(7, -3)]), up)
			draw_colored_polygon(PackedVector2Array([c + Vector2(0, 14), c + Vector2(-7, 3), c + Vector2(7, 3)]), dn)
