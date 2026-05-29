#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for python_bin in python3.12 python3.11 python3.10 python3 python; do
  if command -v "$python_bin" >/dev/null 2>&1; then
    exec "$python_bin" "$SCRIPT_DIR/publish.py" "$@"
  fi
done

printf 'publish_result.status=blocked\n' >&2
printf 'publish_result.reason=Python 3 is required for dependency-free here.now publishing\n' >&2
exit 1
