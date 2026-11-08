#!/usr/bin/env bash
# Export every Godot project in the repo as a web build.
#   web/build-all.sh <out_dir>
# game/ is exported first (if it exists), then each prototypes/<name>/.
# Writes <out_dir>/projects.json listing what was built, for web/publish.py.
set -euo pipefail
out=$1
here=$(cd "$(dirname "$0")" && pwd)
root=$(cd "$here/.." && pwd)

mkdir -p "$out"
projects=()
[ -f "$root/game/project.godot" ] && projects+=("game")
for p in "$root"/prototypes/*/project.godot; do
	[ -f "$p" ] && projects+=("prototypes/$(basename "$(dirname "$p")")")
done

json="["
sep=""
for rel in "${projects[@]}"; do
	name=$(basename "$rel")
	title=$(sed -n 's/^config\/name="\(.*\)"$/\1/p' "$root/$rel/project.godot" | head -1)
	[ -z "$title" ] && title=$name
	"$here/build.sh" "$root/$rel" "$out/$name"
	json+="$sep{\"name\":\"$name\",\"title\":\"$title\",\"source\":\"$rel\"}"
	sep=","
done
json+="]"
printf '%s\n' "$json" > "$out/projects.json"
echo "built ${#projects[@]} project(s): ${projects[*]}"
