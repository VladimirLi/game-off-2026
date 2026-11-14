#!/usr/bin/env python3
"""PreToolUse on Agent: keep every subagent on a model chosen for its job.

- Project agents (.claude/agents/<name>.md) carry their own model: a call may not override it,
  unless the agent's frontmatter says allow-model-override: true (persona-tester).
- persona-tester and the built-in agents must be given a model explicitly.
"""
import json, os, sys

root = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
i = json.load(sys.stdin).get("tool_input", {})
name, model = i.get("subagent_type") or "general-purpose", i.get("model")
f = os.path.join(root, ".claude", "agents", f"{name}.md")
override_ok = False
if os.path.isfile(f):
    front = open(f).read().split("---")
    override_ok = len(front) > 2 and "allow-model-override: true" in front[1]
    if model and not override_ok:
        sys.exit(print(f"Don't pass model for the project agent '{name}': .claude/agents/{name}.md sets the model "
                       f"chosen for its job. Call it again without model.", file=sys.stderr) or 2)
if not model and (override_ok or not os.path.isfile(f)):
    hint = "the persona's model from .claude/personas.md" if override_ok else "haiku for lookups, sonnet for most work, opus for hard reasoning"
    sys.exit(print(f"Pass model for '{name}' ({hint}); the session default is not a choice.", file=sys.stderr) or 2)
