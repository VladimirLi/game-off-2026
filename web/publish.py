#!/usr/bin/env python3
"""Compose the GitHub Pages site (the gh-pages branch) from web builds.

    publish.py add    --site SITE --dist DIST --branch NAME --sha SHA --message MSG [--launcher FILE]
    publish.py remove --site SITE --branch NAME [--launcher FILE]

Layout of SITE:
    index.html        launcher page (copied from web/launcher/index.html)
    builds.json       one entry per branch: what was built, from which commit, when
    b/<slug>/<sha7>/<project>/   the builds themselves

Each branch keeps only its newest build. The commit hash is part of the path, so a
new build never collides with a cached copy of the previous one.
"""
import argparse
import datetime as dt
import json
import os
import re
import shutil
import sys


def slugify(branch):
    s = re.sub(r"[^A-Za-z0-9._-]+", "-", branch).strip("-.")
    return s or "branch"


def load(path):
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return {"branches": {}}


def save(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=1, sort_keys=True)
        f.write("\n")


def finish(site, data, launcher):
    data["generated"] = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    save(os.path.join(site, "builds.json"), data)
    if launcher:
        shutil.copyfile(launcher, os.path.join(site, "index.html"))
    open(os.path.join(site, ".nojekyll"), "a").close()


def cmd_add(a):
    slug = slugify(a.branch)
    sha7 = a.sha[:7]
    with open(os.path.join(a.dist, "projects.json"), encoding="utf-8") as f:
        projects = json.load(f)
    if not projects:
        sys.exit("no projects in " + a.dist)

    branch_dir = os.path.join(a.site, "b", slug)
    shutil.rmtree(branch_dir, ignore_errors=True)
    target = os.path.join(branch_dir, sha7)
    os.makedirs(target)
    for p in projects:
        shutil.copytree(os.path.join(a.dist, p["name"]), os.path.join(target, p["name"]))

    data = load(os.path.join(a.site, "builds.json"))
    data["branches"][slug] = {
        "branch": a.branch,
        "sha": a.sha,
        "sha7": sha7,
        "time": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "message": a.message.strip().splitlines()[0] if a.message.strip() else "",
        "projects": [
            {"name": p["name"], "title": p["title"], "source": p["source"],
             "path": f"b/{slug}/{sha7}/{p['name']}/"}
            for p in projects
        ],
    }
    finish(a.site, data, a.launcher)
    print(f"published {len(projects)} build(s) for {a.branch} at b/{slug}/{sha7}/")


def cmd_remove(a):
    slug = slugify(a.branch)
    shutil.rmtree(os.path.join(a.site, "b", slug), ignore_errors=True)
    data = load(os.path.join(a.site, "builds.json"))
    data["branches"].pop(slug, None)
    finish(a.site, data, a.launcher)
    print(f"removed builds for {a.branch}")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    add = sub.add_parser("add")
    add.add_argument("--site", required=True)
    add.add_argument("--dist", required=True)
    add.add_argument("--branch", required=True)
    add.add_argument("--sha", required=True)
    add.add_argument("--message", default="")
    add.add_argument("--launcher")
    add.set_defaults(fn=cmd_add)
    rem = sub.add_parser("remove")
    rem.add_argument("--site", required=True)
    rem.add_argument("--branch", required=True)
    rem.add_argument("--launcher")
    rem.set_defaults(fn=cmd_remove)
    a = ap.parse_args()
    os.makedirs(a.site, exist_ok=True)
    a.fn(a)


if __name__ == "__main__":
    main()
