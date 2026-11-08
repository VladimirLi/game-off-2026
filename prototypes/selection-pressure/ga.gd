extends RefCounted
## Genetic algorithm over creep genomes. Genome = [speed, tough, resist, lane], each 0..1.
## resist: 0 = shrugs off Pulse, 1 = shrugs off Gun. lane: < 0.5 top, >= 0.5 bottom.

const N := 4
const MUT_RATE := 0.3
const MUT_SIGMA := 0.12
const ELITES := 2

static func random_genome() -> Array:
	var g := []
	for i in N:
		g.append(randf())
	return g

static func next_generation(pop: Array, fitness: Array) -> Array:
	var order := range(pop.size())
	order.sort_custom(func(a, b): return fitness[a] > fitness[b])
	var out := []
	for i in ELITES:
		out.append(pop[order[i]].duplicate())
	while out.size() < pop.size():
		var a: Array = pop[_tournament(fitness)]
		var b: Array = pop[_tournament(fitness)]
		var child := []
		for i in N:
			var v: float = a[i] if randf() < 0.5 else b[i]
			if randf() < MUT_RATE:
				v += randfn(0.0, MUT_SIGMA)
			child.append(clampf(v, 0.0, 1.0))
		out.append(child)
	return out

static func _tournament(fitness: Array) -> int:
	var best := randi() % fitness.size()
	for i in 2:
		var c := randi() % fitness.size()
		if fitness[c] > fitness[best]:
			best = c
	return best

## Mean of each gene; for lane, the share of creeps taking the top lane.
static func mean(pop: Array) -> Array:
	var m := [0.0, 0.0, 0.0, 0.0]
	for g in pop:
		for i in 3:
			m[i] += g[i]
		m[3] += 1.0 if g[3] < 0.5 else 0.0
	for i in N:
		m[i] /= pop.size()
	return m
