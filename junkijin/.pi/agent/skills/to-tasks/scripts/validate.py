#!/usr/bin/env python3
"""Validate a local to-tasks dependency graph without third-party dependencies."""

import argparse
import csv
import heapq
import io
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

FRONTMATTER = re.compile(r"\A---\s*\n(.*?)\n---\s*(?:\n|$)", re.DOTALL)
HEADING = re.compile(r"(?m)^##\s+(.+?)\s*$")
REQUIRED_SECTIONS = [
    "Context",
    "Outcome",
    "Scope",
    "Spec Decisions",
    "Dependencies",
    "Acceptance Criteria",
    "Verification",
    "Coordination",
]


def parse_value(raw: str) -> Any:
    value = raw.strip()
    if value.startswith("[") and value.endswith("]"):
        inner = value[1:-1].strip()
        if not inner:
            return []
        return [item.strip().strip("\"'") for item in next(csv.reader(io.StringIO(inner), skipinitialspace=True))]
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        if value[0] == '"':
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                pass
        return value[1:-1]
    return value


def read_document(path: Path) -> Tuple[Optional[Dict[str, Any]], str, List[str]]:
    errors: List[str] = []
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as exc:
        return None, "", [f"cannot read file: {exc}"]
    match = FRONTMATTER.search(text)
    if not match:
        return None, text, ["missing YAML frontmatter"]
    metadata: Dict[str, Any] = {}
    for number, line in enumerate(match.group(1).splitlines(), 2):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line[:1].isspace() or ":" not in line:
            errors.append(f"unsupported frontmatter syntax on line {number}; use top-level key: value fields")
            continue
        key, raw = line.split(":", 1)
        key = key.strip()
        if key in metadata:
            errors.append(f"duplicate frontmatter key: {key}")
            continue
        metadata[key] = parse_value(raw)
    return metadata, text[match.end():], errors


def section_body(body: str, title: str) -> Optional[str]:
    matches = list(HEADING.finditer(body))
    for index, match in enumerate(matches):
        if match.group(1).strip() == title:
            end = matches[index + 1].start() if index + 1 < len(matches) else len(body)
            return body[match.end():end].strip()
    return None


def substantive(value: Optional[str]) -> bool:
    if value is None or "{{" in value or "}}" in value:
        return False
    cleaned = re.sub(r"<!--.*?-->", "", value, flags=re.DOTALL)
    cleaned = re.sub(r"(?m)^#{1,6}\s+", "", cleaned)
    cleaned = re.sub(r"[\s\-_*|:`\[\]()]", "", cleaned)
    return bool(cleaned)


def topological_order(graph: Dict[str, List[str]]) -> Tuple[List[str], Optional[List[str]]]:
    indegree = {node: 0 for node in graph}
    dependents: Dict[str, List[str]] = {node: [] for node in graph}
    for node, blockers in graph.items():
        indegree[node] = len(blockers)
        for blocker in blockers:
            if blocker in dependents:
                dependents[blocker].append(node)
    queue = [node for node, degree in indegree.items() if degree == 0]
    heapq.heapify(queue)
    order: List[str] = []
    while queue:
        node = heapq.heappop(queue)
        order.append(node)
        for dependent in dependents[node]:
            indegree[dependent] -= 1
            if indegree[dependent] == 0:
                heapq.heappush(queue, dependent)
    if len(order) == len(graph):
        return order, None
    return order, sorted(node for node, degree in indegree.items() if degree > 0)


def validate(target: Path, publication: bool) -> Dict[str, Any]:
    if target.is_dir() and (target / "tasks").is_dir():
        tasks_dir = target / "tasks"
    else:
        tasks_dir = target
    if not tasks_dir.is_dir():
        return {"ok": False, "checked": [], "errors": [f"tasks directory does not exist: {tasks_dir}"]}

    files = sorted(tasks_dir.glob("*.md"))
    if not files:
        return {"ok": False, "checked": [], "errors": [f"no task files found in {tasks_dir}"]}

    errors: List[str] = []
    checked: List[str] = []
    tasks: Dict[str, Tuple[Path, Dict[str, Any], str]] = {}

    for path in files:
        meta, body, parse_errors = read_document(path)
        checked.append(str(path))
        errors.extend(f"{path}: {message}" for message in parse_errors)
        if meta is None:
            continue
        local_errors: List[str] = []
        for key in ("kind", "id", "status", "spec", "blocked_by", "claimed_by"):
            if key not in meta or (key in {"kind", "id", "status", "spec"} and meta[key] == ""):
                local_errors.append(f"missing frontmatter field: {key}")
        if meta.get("kind") != "task":
            local_errors.append("kind must be task")
        task_id = str(meta.get("id", ""))
        if not re.fullmatch(r"T\d{3}", task_id):
            local_errors.append("task id must match T001")
        if task_id in tasks:
            local_errors.append(f"duplicate task id: {task_id}")
        status = meta.get("status")
        if status not in {"draft", "ready", "claimed", "resolved", "stale"}:
            local_errors.append("invalid task status")
        blockers = meta.get("blocked_by")
        if not isinstance(blockers, list):
            local_errors.append("blocked_by must be a YAML flow list, for example [T001]")
        if status == "claimed" and not meta.get("claimed_by"):
            local_errors.append("claimed task requires claimed_by")
        if status == "ready" and meta.get("claimed_by"):
            local_errors.append("ready task must be unassigned")
        if publication and status != "ready":
            local_errors.append("publication validation requires every task status to be ready")
        if publication and meta.get("claimed_by"):
            local_errors.append("publication validation requires every task to be unassigned")
        for title in REQUIRED_SECTIONS:
            value = section_body(body, title)
            if value is None:
                local_errors.append(f"missing section: ## {title}")
            elif status != "draft" and not substantive(value):
                local_errors.append(f"section is empty or still contains a placeholder: ## {title}")
        if status != "draft" and ("{{" in body or "}}" in body or re.search(r"\b(?:TBD|TODO)\b", body, re.IGNORECASE)):
            local_errors.append("published task contains template placeholders")
        expected_prefix = task_id.lower() + "-"
        if task_id and not path.name.lower().startswith(expected_prefix):
            local_errors.append(f"task filename must start with {expected_prefix}")
        tasks[task_id] = (path, meta, body)
        errors.extend(f"{path}: {message}" for message in local_errors)

    graph: Dict[str, List[str]] = {}
    for task_id, (path, meta, _) in tasks.items():
        blockers = meta.get("blocked_by", [])
        if not isinstance(blockers, list):
            continue
        graph[task_id] = [str(item) for item in blockers]
        for blocker in graph[task_id]:
            if blocker == task_id:
                errors.append(f"{path}: task cannot block itself")
            elif blocker not in tasks:
                errors.append(f"{path}: unknown blocker {blocker}")

    order, cyclic = topological_order(graph)
    if cyclic:
        errors.append("task dependency cycle involves: " + ", ".join(cyclic))

    specs = {str(meta.get("spec", "")) for _, meta, _ in tasks.values() if meta.get("spec")}
    if len(specs) > 1:
        errors.append("all tasks in one graph must reference the same Spec")
    for spec in specs:
        if "://" in spec or spec.startswith("#"):
            continue
        sample_path = next(path for path, meta, _ in tasks.values() if str(meta.get("spec")) == spec)
        spec_path = (sample_path.parent / spec).resolve()
        if spec_path.exists():
            spec_meta, _, spec_errors = read_document(spec_path)
            errors.extend(f"{spec_path}: {message}" for message in spec_errors)
            if spec_meta is not None:
                if spec_meta.get("kind") != "spec":
                    errors.append(f"{spec_path}: referenced artifact is not a Spec")
                if publication and spec_meta.get("status") != "approved":
                    errors.append(f"{spec_path}: publication requires an approved Spec")

    frontier = []
    for task_id, (_, meta, _) in tasks.items():
        if meta.get("status") != "ready" or meta.get("claimed_by"):
            continue
        blockers = graph.get(task_id, [])
        if all(tasks[blocker][1].get("status") == "resolved" for blocker in blockers if blocker in tasks):
            frontier.append(task_id)

    return {
        "ok": not errors,
        "checked": checked,
        "errors": errors,
        "topological_order": order,
        "frontier": sorted(frontier),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", help=".pi/scratch/<effort> or its tasks directory")
    parser.add_argument("--publication", action="store_true", help="require ready, unassigned tasks and an approved local Spec")
    args = parser.parse_args()
    result = validate(Path(args.path), args.publication)
    json.dump(result, sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write("\n")
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
