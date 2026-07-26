#!/usr/bin/env python3
"""Validate local to-proposal artifacts without third-party dependencies."""

import argparse
import csv
import io
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

FRONTMATTER = re.compile(r"\A---\s*\n(.*?)\n---\s*(?:\n|$)", re.DOTALL)
HEADING = re.compile(r"(?m)^##\s+(.+?)\s*$")
PROPOSAL_SECTIONS = [
    "Outcome",
    "Problem",
    "Proposed Direction",
    "Scope",
    "Key Decisions",
    "Constraints",
    "Evidence",
    "Risks and Details Deferred to Spec",
    "Success Criteria",
]
MAP_SECTIONS = [
    "Destination",
    "Boundaries",
    "Standing Context",
    "Decisions So Far",
    "Not Yet Specified",
    "Out of Scope",
]
DECISION_SECTIONS = ["Question", "Why Now", "Dependencies", "Output Contract", "Resolution"]


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
        if not key:
            errors.append(f"empty frontmatter key on line {number}")
            continue
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


def require_metadata(meta: Dict[str, Any], keys: List[str], errors: List[str]) -> None:
    for key in keys:
        if key not in meta or meta[key] == "":
            errors.append(f"missing frontmatter field: {key}")


def require_sections(body: str, sections: List[str], strict: bool, errors: List[str]) -> None:
    for title in sections:
        value = section_body(body, title)
        if value is None:
            errors.append(f"missing section: ## {title}")
        elif strict and not substantive(value):
            errors.append(f"section is empty or still contains a placeholder: ## {title}")


def find_cycle(nodes: Dict[str, List[str]]) -> Optional[List[str]]:
    state: Dict[str, int] = {}
    stack: List[str] = []

    def visit(node: str) -> Optional[List[str]]:
        state[node] = 1
        stack.append(node)
        for blocker in nodes.get(node, []):
            if state.get(blocker, 0) == 0:
                cycle = visit(blocker)
                if cycle:
                    return cycle
            elif state.get(blocker) == 1:
                start = stack.index(blocker)
                return stack[start:] + [blocker]
        stack.pop()
        state[node] = 2
        return None

    for node in nodes:
        if state.get(node, 0) == 0:
            cycle = visit(node)
            if cycle:
                return cycle
    return None


def validate(target: Path, publication: bool) -> Dict[str, Any]:
    errors: List[str] = []
    checked: List[str] = []
    documents: List[Tuple[Path, Dict[str, Any], str]] = []

    if target.is_file():
        candidates = [target]
    elif target.is_dir():
        candidates = []
        for name in ("proposal.md", "map.md"):
            path = target / name
            if path.exists():
                candidates.append(path)
        decisions = target / "decisions"
        if decisions.exists():
            candidates.extend(sorted(decisions.glob("*.md")))
    else:
        return {"ok": False, "checked": [], "errors": [f"path does not exist: {target}"]}

    if not candidates:
        return {"ok": False, "checked": [], "errors": ["no proposal artifacts found"]}

    for path in candidates:
        meta, body, parse_errors = read_document(path)
        checked.append(str(path))
        errors.extend(f"{path}: {message}" for message in parse_errors)
        if meta is not None:
            documents.append((path, meta, body))

    decisions: Dict[str, Tuple[Path, Dict[str, Any], str]] = {}
    proposal_doc: Optional[Tuple[Path, Dict[str, Any], str]] = None
    map_doc: Optional[Tuple[Path, Dict[str, Any], str]] = None

    for path, meta, body in documents:
        kind = meta.get("kind")
        local_errors: List[str] = []
        if kind == "proposal":
            require_metadata(meta, ["kind", "id", "status", "mode"], local_errors)
            if meta.get("status") not in {"draft", "approved", "stale"}:
                local_errors.append("proposal status must be draft, approved, or stale")
            if meta.get("mode") not in {"direct", "map"}:
                local_errors.append("proposal mode must be direct or map")
            strict = meta.get("status") == "approved"
            require_sections(body, PROPOSAL_SECTIONS, strict, local_errors)
            if strict and ("{{" in body or "}}" in body or re.search(r"\b(?:TBD|TODO)\b", body, re.IGNORECASE)):
                local_errors.append("approved proposal contains template placeholders")
            if proposal_doc is not None:
                local_errors.append("more than one proposal document found")
            proposal_doc = (path, meta, body)
        elif kind == "map":
            require_metadata(meta, ["kind", "id", "status"], local_errors)
            if meta.get("status") not in {"draft", "active", "completed", "stale"}:
                local_errors.append("map status must be draft, active, completed, or stale")
            strict = meta.get("status") in {"active", "completed"}
            require_sections(body, MAP_SECTIONS, strict, local_errors)
            if map_doc is not None:
                local_errors.append("more than one map document found")
            map_doc = (path, meta, body)
        elif kind == "decision":
            require_metadata(meta, ["kind", "id", "type", "status", "map"], local_errors)
            for field in ("blocked_by", "claimed_by"):
                if field not in meta:
                    local_errors.append(f"missing frontmatter field: {field}")
            issue_id = str(meta.get("id", ""))
            if not re.fullmatch(r"D\d{3}", issue_id):
                local_errors.append("decision id must match D001")
            if issue_id in decisions:
                local_errors.append(f"duplicate decision id: {issue_id}")
            if meta.get("type") not in {"decision", "research", "prototype", "prerequisite"}:
                local_errors.append("decision type must be decision, research, prototype, or prerequisite")
            if meta.get("status") not in {"draft", "open", "claimed", "resolved", "out-of-scope", "stale"}:
                local_errors.append("invalid decision status")
            blockers = meta.get("blocked_by")
            if not isinstance(blockers, list):
                local_errors.append("blocked_by must be a YAML flow list, for example [D001]")
            if meta.get("status") == "claimed" and not meta.get("claimed_by"):
                local_errors.append("claimed decision requires claimed_by")
            if meta.get("status") == "open" and meta.get("claimed_by"):
                local_errors.append("open decision must not have claimed_by")
            strict_question = meta.get("status") != "draft"
            require_sections(body, DECISION_SECTIONS, False, local_errors)
            if strict_question:
                for title in ("Question", "Why Now", "Dependencies", "Output Contract"):
                    if not substantive(section_body(body, title)):
                        local_errors.append(f"published decision needs a substantive ## {title}")
            if meta.get("status") in {"resolved", "out-of-scope"} and not substantive(section_body(body, "Resolution")):
                local_errors.append("resolved or out-of-scope decision needs a substantive ## Resolution")
            expected_prefix = issue_id.lower() + "-"
            if issue_id and not path.name.lower().startswith(expected_prefix):
                local_errors.append(f"decision filename must start with {expected_prefix}")
            decisions[issue_id] = (path, meta, body)
        else:
            local_errors.append(f"unknown kind: {kind!r}")
        errors.extend(f"{path}: {message}" for message in local_errors)

    graph: Dict[str, List[str]] = {}
    for issue_id, (path, meta, _) in decisions.items():
        blockers = meta.get("blocked_by", [])
        if not isinstance(blockers, list):
            continue
        graph[issue_id] = [str(item) for item in blockers]
        for blocker in graph[issue_id]:
            if blocker == issue_id:
                errors.append(f"{path}: decision cannot block itself")
            elif blocker not in decisions:
                errors.append(f"{path}: unknown blocker {blocker}")
    cycle = find_cycle(graph)
    if cycle:
        errors.append("decision dependency cycle: " + " -> ".join(cycle))

    if publication:
        if proposal_doc is None:
            errors.append("publication validation requires proposal.md")
        elif proposal_doc[1].get("status") != "approved":
            errors.append("publication validation requires status: approved")

    if proposal_doc and proposal_doc[1].get("status") == "approved" and proposal_doc[1].get("mode") == "map":
        if map_doc is None:
            errors.append("approved map-mode proposal requires map.md")
        elif map_doc[1].get("status") != "completed":
            errors.append("approved map-mode proposal requires a completed map")
        unresolved = [
            issue_id
            for issue_id, (_, meta, _) in decisions.items()
            if meta.get("status") not in {"resolved", "out-of-scope"}
        ]
        if unresolved:
            errors.append("approved map-mode proposal has unresolved decisions: " + ", ".join(sorted(unresolved)))

    return {"ok": not errors, "checked": checked, "errors": errors}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", help="proposal.md or .pi/scratch/<effort> directory")
    parser.add_argument("--publication", action="store_true", help="require an approved Proposal ready for canonical publication")
    args = parser.parse_args()
    result = validate(Path(args.path), args.publication)
    json.dump(result, sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write("\n")
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
