#!/usr/bin/env bash
# Wait for CI on one commit: poll the Forgejo commit status until the Lint, Test
# and Build checks of "Lint & Test & Build" are all final, then report each.
# Usage: scripts/wait-ci.sh <sha> [timeout in seconds, default 540]
# Exit 0 when all three passed (success or skipped), 1 when one did not, 2 on timeout.
# The API root comes from the origin remote, the token from FORGEJO_ACCESS_TOKEN;
# WAIT_CI_INTERVAL sets the seconds between polls (default 10).
# Other checks (renovate/stability-days, the release workflows) are ignored.
set -euo pipefail

sha="${1:?usage: scripts/wait-ci.sh <sha> [timeout seconds]}"
timeout="${2:-540}"
interval="${WAIT_CI_INTERVAL:-10}"
: "${FORGEJO_ACCESS_TOKEN:?FORGEJO_ACCESS_TOKEN is not set}"

api="$(git remote get-url origin | sed -E 's#https://([^@]+@)?([^/]+)/(.+)\.git#https://\2/api/v1/repos/\3#')"
checks=(Lint Test Build)

# One line per check, "<name> <state>": the newest status of the workflow's job
# with that name, whatever event triggered it, or "missing" while it has none.
read_checks() {
  curl -sS --fail-with-body -H "Authorization: token $FORGEJO_ACCESS_TOKEN" \
    "$api/commits/$sha/status?limit=50" \
    | jq -r --argjson names "$(printf '%s\n' "${checks[@]}" | jq -R . | jq -s .)" '
        [(.statuses // [])[] | select(.context | startswith("Lint & Test & Build / "))] as $s
        | $names[] as $n
        | ([$s[] | select(.context | ltrimstr("Lint & Test & Build / ") | startswith($n + " "))]
           | sort_by(.updated_at) | last) as $c
        | "\($n) \($c.status // "missing")"'
}

deadline=$((SECONDS + timeout))
while true; do
  states="$(read_checks)"
  if ! grep -qvE ' (success|skipped|failure|error|warning)$' <<<"$states"; then
    break
  fi
  if ((SECONDS >= deadline)); then
    echo "CI on ${sha} not final after ${timeout}s:" >&2
    sed 's/^/  /' <<<"$states" >&2
    exit 2
  fi
  sleep "$interval"
done

echo "CI on ${sha}:"
sed 's/^/  /' <<<"$states"
if grep -qvE ' (success|skipped)$' <<<"$states"; then
  echo "CI failed" >&2
  exit 1
fi
echo "CI passed"
