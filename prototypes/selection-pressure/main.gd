extends Node2D
## Selection Pressure grey box: tower defence where each wave is a GA population.

const GA := preload("res://ga.gd")
const POP := 24
const WAVES := 8
const LANE_W := 36.0
const LANES := [
	[Vector2(-10, 130), Vector2(680, 130), Vector2(680, 270), Vector2(950, 270)],
	[Vector2(-10, 410), Vector2(680, 410), Vector2(680, 270), Vector2(950, 270)],
]
const GENE_NAMES := ["speed", "toughness", "resist Pulse<->Gun", "top lane %"]
var TOWERS := {
	1: {"name": "Gun", "cost": 30, "range": 120.0, "rate": 0.35, "dmg": 7.0, "col": Color(0.95, 0.75, 0.2)},
	2: {"name": "Pulse", "cost": 45, "range": 85.0, "rate": 0.9, "dmg": 5.0, "col": Color(0.3, 0.85, 0.95)},
}

var pop := []
var creeps := []
var towers := []
var shots := []
var history := []
var lane_len := [0.0, 0.0]
var money := 150
var lives := 20
var wave := 0
var state := "build"  # build | wave | won | lost
var sel := 1
var spawn_i := 0
var spawn_t := 0.0
var autotest := false
@onready var font: Font = ThemeDB.fallback_font

func _ready() -> void:
	randomize()
	for i in POP:
		pop.append(GA.random_genome())
	for l in 2:
		for i in LANES[l].size() - 1:
			lane_len[l] += LANES[l][i].distance_to(LANES[l][i + 1])
	autotest = "--autotest" in OS.get_cmdline_user_args()
	if autotest:
		Engine.time_scale = 10.0

func start_wave() -> void:
	creeps.clear()
	for g in pop:
		var t: float = g[1]
		var hp: float = (8.0 + 24.0 * t) * (1.0 + 0.2 * wave)
		creeps.append({"g": g, "lane": 0 if g[3] < 0.5 else 1, "d": 0.0, "hp": hp, "maxhp": hp,
			"speed": (35.0 + 80.0 * g[0]) * (1.0 - 0.45 * t), "size": 8.0 + 12.0 * t,
			"active": false, "alive": true, "done": false})
	history.append(GA.mean(pop))
	spawn_i = 0
	spawn_t = 0.0
	state = "wave"

func end_wave() -> void:
	var fit := []
	for c in creeps:
		fit.append(c.d / lane_len[c.lane] + (1.0 if c.done else 0.0))
	pop = GA.next_generation(pop, fit)
	wave += 1
	if autotest:
		print("wave %d done, lives %d, money %d, mean %s" % [wave, lives, money, str(history[-1])])
	if wave >= WAVES:
		state = "won"
	else:
		state = "build"

func pos_at(lane: int, d: float) -> Vector2:
	var pts: Array = LANES[lane]
	for i in pts.size() - 1:
		var seg: float = pts[i].distance_to(pts[i + 1])
		if d <= seg:
			return pts[i].lerp(pts[i + 1], d / seg)
		d -= seg
	return pts[-1]

func damage(c: Dictionary, type: int) -> void:
	var r: float = c.g[2]
	var mult := 1.0 - 0.75 * (r if type == 1 else 1.0 - r)
	c.hp -= TOWERS[type].dmg * mult
	if c.hp <= 0.0:
		c.alive = false
		money += 5

func _process(delta: float) -> void:
	queue_redraw()
	for s in shots:
		s.t -= delta
	shots = shots.filter(func(s): return s.t > 0.0)
	if state == "build" and autotest:  # bot: spend randomly, then send
		for i in 40:
			try_place(pos_at(randi() % 2, randf_range(100, 900)) + Vector2(0, [-45, 45].pick_random()), 1 + randi() % 2)
		start_wave()
	if state != "wave":
		return
	spawn_t -= delta
	if spawn_t <= 0.0 and spawn_i < POP:
		creeps[spawn_i].active = true
		spawn_i += 1
		spawn_t = 0.6
	for c in creeps:
		if c.active and c.alive and not c.done:
			c.d += c.speed * delta
			if c.d >= lane_len[c.lane]:
				c.done = true
				lives -= 1
	for tw in towers:
		tw.cd -= delta
		if tw.cd > 0.0:
			continue
		var spec: Dictionary = TOWERS[tw.type]
		var best = null
		var hit := false
		for c in creeps:
			if not (c.active and c.alive and not c.done):
				continue
			var p := pos_at(c.lane, c.d)
			if p.distance_to(tw.pos) > spec.range:
				continue
			if tw.type == 2:
				damage(c, 2)
				hit = true
			elif best == null or c.d > best.d:
				best = c
		if best != null:
			shots.append({"a": tw.pos, "b": pos_at(best.lane, best.d), "t": 0.08, "type": 1})
			damage(best, 1)
			hit = true
		if hit:
			tw.cd = spec.rate
			if tw.type == 2:
				shots.append({"a": tw.pos, "b": tw.pos, "t": 0.15, "type": 2})
	if lives <= 0:
		lives = 0
		state = "lost"
		return
	if spawn_i == POP and creeps.all(func(c): return not c.alive or c.done):
		end_wave()

func can_place(p: Vector2) -> bool:
	if p.y < 70 or p.y > 435 or p.x > 920:
		return false
	for l in 2:
		for i in LANES[l].size() - 1:
			var q := Geometry2D.get_closest_point_to_segment(p, LANES[l][i], LANES[l][i + 1])
			if q.distance_to(p) < LANE_W / 2 + 14:
				return false
	for tw in towers:
		if tw.pos.distance_to(p) < 28:
			return false
	return true

func try_place(p: Vector2, type: int) -> void:
	p = (p / 30.0).floor() * 30.0 + Vector2(15, 15)
	if money >= TOWERS[type].cost and can_place(p):
		money -= TOWERS[type].cost
		towers.append({"pos": p, "type": type, "cd": 0.0})

func _unhandled_input(e: InputEvent) -> void:
	if e is InputEventKey and e.pressed and not e.echo:
		match e.keycode:
			KEY_R: get_tree().reload_current_scene()
			KEY_1: sel = 1
			KEY_2: sel = 2
			KEY_SPACE:
				if state == "build":
					start_wave()
	elif e is InputEventMouseButton and e.pressed and state in ["build", "wave"]:
		if e.button_index == MOUSE_BUTTON_LEFT:
			try_place(e.position, sel)
		elif e.button_index == MOUSE_BUTTON_RIGHT:
			for tw in towers:
				if tw.pos.distance_to(e.position) < 15:
					money += TOWERS[tw.type].cost / 2
					towers.erase(tw)
					break

func text(p: Vector2, s: String, size := 14, col := Color(0.9, 0.9, 0.9)) -> void:
	draw_string(font, p, s, HORIZONTAL_ALIGNMENT_LEFT, -1, size, col)

func _draw() -> void:
	draw_rect(Rect2(0, 0, 960, 540), Color(0.13, 0.13, 0.15))
	for l in LANES:
		draw_polyline(PackedVector2Array(l), Color(0.25, 0.25, 0.28), LANE_W)
	draw_rect(Rect2(920, 240, 40, 60), Color(0.6, 0.6, 0.65))
	var m := get_local_mouse_position()
	if state in ["build", "wave"]:
		var gp := (m / 30.0).floor() * 30.0 + Vector2(15, 15)
		var ok: bool = can_place(gp) and money >= TOWERS[sel].cost
		draw_arc(gp, TOWERS[sel].range, 0, TAU, 48, Color(1, 1, 1, 0.25) if ok else Color(1, 0.2, 0.2, 0.25))
	for tw in towers:
		draw_rect(Rect2(tw.pos - Vector2(11, 11), Vector2(22, 22)), TOWERS[tw.type].col)
	for c in creeps:
		if not (c.active and c.alive and not c.done):
			continue
		var p := pos_at(c.lane, c.d)
		var col: Color = TOWERS[2].col.lerp(TOWERS[1].col, c.g[2]).darkened(0.5 * (1.0 - c.g[0]))
		draw_rect(Rect2(p - Vector2.ONE * c.size / 2, Vector2.ONE * c.size), col)
		draw_rect(Rect2(p + Vector2(-c.size / 2, -c.size / 2 - 4), Vector2(c.size * c.hp / c.maxhp, 2)), Color(0.3, 1, 0.3))
	for s in shots:
		if s.type == 1:
			draw_line(s.a, s.b, TOWERS[1].col, 2)
		else:
			draw_arc(s.a, TOWERS[2].range, 0, TAU, 48, TOWERS[2].col, 2)
	text(Vector2(10, 22), "Wave %d/%d   Lives %d   $%d   Placing: %s ($%d)" % [min(wave + 1, WAVES), WAVES, lives, money, TOWERS[sel].name, TOWERS[sel].cost], 16)
	text(Vector2(10, 44), "1 Gun  2 Pulse  LMB place  RMB sell (50%)  Space send wave  R restart   Creep colour: cyan resists Pulse, gold resists Gun; size = tough; bright = fast", 12, Color(0.65, 0.65, 0.7))
	# Gene readout: one bar per wave for each gene, so the drift is visible.
	for gi in 4:
		var x0 := 10.0 + gi * 238.0
		text(Vector2(x0, 456), "mean " + GENE_NAMES[gi], 12, Color(0.7, 0.7, 0.75))
		draw_rect(Rect2(x0, 462, 8 * 26, 60), Color(0.18, 0.18, 0.2))
		for wi in history.size():
			var v: float = history[wi][gi]
			var col := Color(0.7, 0.7, 0.75)
			if gi == 2:
				col = TOWERS[2].col.lerp(TOWERS[1].col, v)
			draw_rect(Rect2(x0 + wi * 26 + 3, 522 - 60 * v, 20, 60 * v), col)
			text(Vector2(x0 + wi * 26 + 6, 535), str(wi + 1), 10, Color(0.5, 0.5, 0.55))
	var msg := ""
	if state == "build" and wave == 0:
		msg = "SELECTION PRESSURE: place towers, then Space to send wave 1"
	elif state == "build":
		msg = "Wave %d bred from the survivors. Adjust, then Space." % (wave + 1)
	elif state == "won":
		msg = "YOU HELD: %d waves survived with %d lives. R to restart" % [WAVES, lives]
	elif state == "lost":
		msg = "OVERRUN on wave %d. R to restart" % (wave + 1)
	if msg != "":
		draw_string(font, Vector2(0, 285), msg, HORIZONTAL_ALIGNMENT_CENTER, 960, 20, Color(1, 1, 1))
