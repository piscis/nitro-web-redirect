#!/usr/bin/env bash
# Smoke test for a built image: start it with REDIRECT_TARGET=https://example.com,
# request a path with a query string, expect a 301 to the matching Location.
# Usage: scripts/smoke-test.sh <image> [host port, default 3939]
set -euo pipefail

image="${1:?usage: scripts/smoke-test.sh <image> [port]}"
port="${2:-3939}"
name="nitro-web-redirect-smoke-$$"
url="http://127.0.0.1:${port}/smoke/test?x=1&y=two"
expected_location="https://example.com/smoke/test?x=1&y=two"

trap 'docker rm -f "$name" >/dev/null 2>&1 || true' EXIT

docker run -d --name "$name" -p "127.0.0.1:${port}:3000" \
  -e REDIRECT_TARGET=https://example.com "$image" >/dev/null

response=""
for _ in $(seq 1 30); do
  if response="$(curl -s -o /dev/null -w '%{http_code} %header{location}' "$url")" \
    && [[ "$response" != 000* ]]; then
    break
  fi
  if [[ "$(docker inspect -f '{{.State.Running}}' "$name" 2>/dev/null)" != "true" ]]; then
    break
  fi
  sleep 1
done

if [[ "$response" == "301 ${expected_location}" ]]; then
  echo "Smoke test passed: GET ${url} -> 301 ${expected_location}"
  exit 0
fi

echo "Smoke test failed: expected '301 ${expected_location}', got '${response:-no response}'" >&2
echo "--- container logs ---" >&2
docker logs "$name" >&2 || true
exit 1
