#!/usr/bin/env python3
"""Dependency-free here.now publisher for pipa-audio-brief bundles."""

from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import os
from pathlib import Path
import sys
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


BASE_URL = "https://here.now"
CREDENTIALS_FILE = Path.home() / ".herenow" / "credentials"
STATE_DIR = Path(".herenow")
STATE_FILE = STATE_DIR / "state.json"


def die(message: str) -> None:
    print(f"error: {message}", file=sys.stderr)
    raise SystemExit(1)


def request_json(url: str, method: str, body: dict[str, Any] | None, headers: dict[str, str]) -> dict[str, Any]:
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = Request(url, data=data, method=method, headers=headers)
    try:
        with urlopen(req) as response:
            payload = response.read().decode("utf-8")
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        die(f"HTTP {exc.code} from here.now: {detail or exc.reason}")
    except URLError as exc:
        die(f"could not reach here.now: {exc.reason}")

    try:
        result = json.loads(payload)
    except json.JSONDecodeError:
        die(f"unexpected non-JSON response: {payload[:300]}")

    if result.get("error"):
        details = result.get("details")
        die(f"{result['error']}{f' ({details})' if details else ''}")

    return result


def upload_file(url: str, path: Path, content_type: str | None) -> None:
    headers = {}
    if content_type:
        headers["Content-Type"] = content_type
    req = Request(url, data=path.read_bytes(), method="PUT", headers=headers)
    try:
        with urlopen(req) as response:
            if not 200 <= response.status < 300:
                die(f"upload failed for {path} with HTTP {response.status}")
    except HTTPError as exc:
        die(f"upload failed for {path} with HTTP {exc.code}")
    except URLError as exc:
        die(f"upload failed for {path}: {exc.reason}")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def content_type(path: Path) -> str:
    guessed, _ = mimetypes.guess_type(path.name)
    if guessed:
        if guessed.startswith("text/") or guessed in {"application/json", "image/svg+xml"}:
            return f"{guessed}; charset=utf-8"
        return guessed
    return "application/octet-stream"


def collect_files(target: Path) -> tuple[list[dict[str, Any]], dict[str, Path]]:
    files: list[dict[str, Any]] = []
    file_map: dict[str, Path] = {}

    if target.is_file():
        paths = [(target.name, target)]
    elif target.is_dir():
        paths = []
        for root, dirs, filenames in os.walk(target):
            dirs[:] = sorted(d for d in dirs if d != ".herenow")
            for filename in sorted(filenames):
                if filename == ".DS_Store":
                    continue
                absolute = Path(root) / filename
                relative = absolute.relative_to(target).as_posix()
                paths.append((relative, absolute))
    else:
        die(f"path does not exist: {target}")

    for relative, absolute in paths:
        stat = absolute.stat()
        files.append(
            {
                "path": relative,
                "size": stat.st_size,
                "contentType": content_type(absolute),
                "hash": sha256(absolute),
            }
        )
        file_map[relative] = absolute

    if not files:
        die("no files found")

    return files, file_map


def load_api_key(flag_value: str | None) -> tuple[str, str]:
    if flag_value:
        return flag_value, "flag"
    if os.environ.get("HERENOW_API_KEY"):
        return os.environ["HERENOW_API_KEY"], "env"
    if CREDENTIALS_FILE.is_file():
        value = CREDENTIALS_FILE.read_text(encoding="utf-8").strip()
        if value:
            return value, "credentials"
    return "", "none"


def load_state() -> dict[str, Any]:
    if not STATE_FILE.is_file():
        return {"publishes": {}}
    try:
        return json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {"publishes": {}}


def save_state(slug: str, site_url: str, response: dict[str, Any]) -> None:
    state = load_state()
    publishes = state.setdefault("publishes", {})
    entry: dict[str, Any] = {"siteUrl": site_url}
    if response.get("claimToken"):
        entry["claimToken"] = response["claimToken"]
    if response.get("claimUrl"):
        entry["claimUrl"] = response["claimUrl"]
    if response.get("expiresAt"):
        entry["expiresAt"] = response["expiresAt"]
    publishes[slug] = entry
    STATE_DIR.mkdir(exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Publish a pipa-audio-brief bundle to here.now")
    parser.add_argument("target", help="file or directory to publish")
    parser.add_argument("--api-key")
    parser.add_argument("--slug")
    parser.add_argument("--claim-token")
    parser.add_argument("--title")
    parser.add_argument("--description")
    parser.add_argument("--ttl", type=int)
    parser.add_argument("--client", default="opencode")
    parser.add_argument("--spa", action="store_true")
    parser.add_argument("--base-url", default=BASE_URL)
    parser.add_argument("--allow-nonherenow-base-url", action="store_true")
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")
    api_key, api_key_source = load_api_key(args.api_key)
    if api_key and base_url != BASE_URL and not args.allow_nonherenow_base_url:
        die("refusing to send API key to non-default base URL; pass --allow-nonherenow-base-url to override")

    claim_token = args.claim_token or ""
    if args.slug and not claim_token and not api_key:
        state_entry = load_state().get("publishes", {}).get(args.slug, {})
        claim_token = state_entry.get("claimToken", "")

    target = Path(args.target)
    files, file_map = collect_files(target)
    body: dict[str, Any] = {"files": files}
    if args.ttl is not None:
        body["ttlSeconds"] = args.ttl
    if args.title or args.description:
        body["viewer"] = {}
        if args.title:
            body["viewer"]["title"] = args.title
        if args.description:
            body["viewer"]["description"] = args.description
    if claim_token and args.slug and not api_key:
        body["claimToken"] = claim_token
    if args.spa:
        body["spaMode"] = True

    method = "PUT" if args.slug else "POST"
    url = f"{base_url}/api/v1/publish/{args.slug}" if args.slug else f"{base_url}/api/v1/publish"
    auth_mode = "authenticated" if api_key else "anonymous"
    client = "".join(ch.lower() if ch.isalnum() or ch in "._-" else "-" for ch in args.client).strip("-")
    headers = {
        "content-type": "application/json",
        "x-herenow-client": f"{client or 'opencode'}/publish-py",
    }
    if api_key:
        headers["authorization"] = f"Bearer {api_key}"

    print(f"creating publish ({len(files)} files)...", file=sys.stderr)
    response = request_json(url, method, body, headers)

    slug = response.get("slug")
    site_url = response.get("siteUrl")
    upload = response.get("upload", {})
    uploads = upload.get("uploads", [])
    skipped = upload.get("skipped", [])
    version_id = upload.get("versionId")
    finalize_url = upload.get("finalizeUrl")
    if not slug or not site_url or not version_id or not finalize_url:
        die(f"unexpected response: {json.dumps(response)[:500]}")

    print(f"uploading {len(uploads)} files ({len(skipped)} unchanged, skipped)...", file=sys.stderr)
    for item in uploads:
        path = item["path"]
        upload_url = item["url"]
        upload_headers = item.get("headers", {})
        upload_file(upload_url, file_map[path], upload_headers.get("Content-Type"))

    print("finalizing...", file=sys.stderr)
    request_json(finalize_url, "POST", {"versionId": version_id}, headers)

    save_state(slug, site_url, response)

    expires_at = response.get("expiresAt", "")
    claim_url = response.get("claimUrl", "")
    safe_claim_url = claim_url if isinstance(claim_url, str) and claim_url.startswith("https://") else ""
    persistence = "expires_24h" if auth_mode == "anonymous" else "permanent"
    if auth_mode == "authenticated" and expires_at:
        persistence = "expires_at"

    print(site_url)
    print("", file=sys.stderr)
    print(f"publish_result.site_url={site_url}", file=sys.stderr)
    print(f"publish_result.slug={slug}", file=sys.stderr)
    print(f"publish_result.action={'update' if args.slug else 'create'}", file=sys.stderr)
    print(f"publish_result.auth_mode={auth_mode}", file=sys.stderr)
    print(f"publish_result.api_key_source={api_key_source}", file=sys.stderr)
    print(f"publish_result.persistence={persistence}", file=sys.stderr)
    print(f"publish_result.expires_at={expires_at}", file=sys.stderr)
    print(f"publish_result.claim_url={safe_claim_url}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
