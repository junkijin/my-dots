#!/usr/bin/env python3
"""Validate a local to-spec artifact without third-party dependencies."""

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
REQUIRED_SECTIONS = [
    "Proposal",
    "Behavioral Contract",
    "System Design",
    "Interfaces and Data",
    "Failure and Edge Cases",
    "Compatibility and Rollout",
    "Quality Constraints",
    "Test Strategy",
    "Implementation Latitude",
    "Out of Scope",
    "Traceability",
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


def validate(path: Path, publication: bool) -> Dict[str, Any]:
    if path.is_dir():
        path = path / "spec.md"
    meta, body, errors = read_document(path)
    checked = [str(path)]
    if meta is None:
        return {"ok": False, "checked": checked, "errors": [f"{path}: {message}" for message in errors]}

    result_errors = [f"{path}: {message}" for message in errors]
    for key in ("kind", "id", "status", "proposal"):
        if key not in meta or meta[key] == "":
            result_errors.append(f"{path}: missing frontmatter field: {key}")
    if meta.get("kind") != "spec":
        result_errors.append(f"{path}: kind must be spec")
    if meta.get("status") not in {"draft", "approved", "stale"}:
        result_errors.append(f"{path}: status must be draft, approved, or stale")
    if publication and meta.get("status") != "approved":
        result_errors.append(f"{path}: publication validation requires status: approved")

    strict = meta.get("status") == "approved"
    for title in REQUIRED_SECTIONS:
        value = section_body(body, title)
        if value is None:
            result_errors.append(f"{path}: missing section: ## {title}")
        elif strict and not substantive(value):
            result_errors.append(f"{path}: section is empty or still contains a placeholder: ## {title}")
    if strict and ("{{" in body or "}}" in body or re.search(r"\b(?:TBD|TODO)\b", body, re.IGNORECASE)):
        result_errors.append(f"{path}: approved spec contains template placeholders")

    proposal = str(meta.get("proposal", ""))
    if proposal and "://" not in proposal and not proposal.startswith("#"):
        proposal_path = (path.parent / proposal).resolve()
        if proposal_path.exists():
            proposal_meta, _, proposal_errors = read_document(proposal_path)
            result_errors.extend(f"{proposal_path}: {message}" for message in proposal_errors)
            if proposal_meta is not None:
                if proposal_meta.get("kind") != "proposal":
                    result_errors.append(f"{proposal_path}: referenced artifact is not a proposal")
                if strict and proposal_meta.get("status") != "approved":
                    result_errors.append(f"{proposal_path}: approved spec requires an approved proposal")

    return {"ok": not result_errors, "checked": checked, "errors": result_errors}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", help="spec.md or its effort directory")
    parser.add_argument("--publication", action="store_true", help="require an approved Spec ready for canonical publication")
    args = parser.parse_args()
    result = validate(Path(args.path), args.publication)
    json.dump(result, sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write("\n")
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
