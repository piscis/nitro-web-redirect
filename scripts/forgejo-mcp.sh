#!/usr/bin/env bash
# Start forgejo-mcp, the Forgejo MCP server, on stdio for this repository.
# Wired into .mcp.json as the "forgejo" server. The instance URL comes from the
# origin remote, so the private host stays out of the repository and off the
# public mirror; the credential comes from FORGEJO_ACCESS_TOKEN in the
# environment, as for `fj` and scripts/wait-ci.sh.
# Install the server with: go install code.forgejo.org/forgejo/forgejo-mcp@latest
set -euo pipefail

: "${FORGEJO_ACCESS_TOKEN:?FORGEJO_ACCESS_TOKEN is not set}"

if ! command -v forgejo-mcp >/dev/null 2>&1; then
  echo "forgejo-mcp is not on PATH: go install code.forgejo.org/forgejo/forgejo-mcp@latest" >&2
  exit 127
fi

# https://host/owner/repo.git -> https://host
url="$(git remote get-url origin | sed -E 's#^(https?://)([^@]+@)?([^/]+)/.*$#\1\3#')"
[ -n "$url" ] || { echo "cannot derive the Forgejo URL from the origin remote" >&2; exit 1; }

# The token is passed through the environment, never on the command line.
exec forgejo-mcp -t stdio -url "$url"
