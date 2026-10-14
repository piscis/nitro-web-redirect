# Issue tracker: Forgejo

Issues and specs for this repo live as issues on the self-hosted Forgejo instance behind the `origin` remote (`vicoli-labs/nitro-web-redirect`). Two tools, one API:

- **`fj` (forgejo-cli)** for everyday reads and writes. It is already signed in and infers the repo from `origin` when run inside the clone.
- **The REST API with `curl` + `jq`** for what `fj` lacks: issue dependencies, CI runs and job logs, and PR lookups by branch.

The repo is push-mirrored to the public GitHub repo `piscis/nitro-web-redirect` on every commit. GitHub is read-only: issues and pull requests happen on Forgejo only.

## Calling the API

The examples below write `$API` for the repo's API root and `$AUTH` for `Authorization: token $FORGEJO_ACCESS_TOKEN` (the token is in the shell environment). An agent's shell keeps no variables between tool calls, so set both inside every command:

```bash
API="$(git remote get-url origin | sed -E 's#https://([^@]+@)?([^/]+)/(.+)\.git#https://\2/api/v1/repos/\3#')"
AUTH="Authorization: token $FORGEJO_ACCESS_TOKEN"
```

Pipe a response straight into `jq` or into a file. A write with a Markdown body builds its JSON with `jq -n --arg … --rawfile b <path>` rather than by hand.

## Conventions

- **Create an issue**: `fj issue create "<title>" --body-file <file>` (or `--body "..."` for one-liners). Always pass `--body` or `--body-file`, or `fj` opens an editor. `fj` sets no labels on create; add them right after with **Apply labels**.
- **Read an issue**: `fj issue view <n>` for title and body, `fj issue view <n> comments` for the thread.
- **List issues**: `fj issue search [query] --state open|closed|all --labels <label>`.
- **Comment on an issue**: `fj issue comment <n> --body-file <file>` (or the body as a second positional argument).
- **Apply / remove labels**: `fj issue edit <n> labels --add <label>` / `--rm <label>`.
- **Edit title / body**: `fj issue edit <n> title "..."` / `fj issue edit <n> body ...`.
- **Close**: `fj issue close <n> --with-msg "..."`.
- **Repo labels**: `fj repo labels view`, `fj repo labels create <name> <hex-color> -d "<description>"`.
- **Parent / child**: Forgejo has no sub-issues. Put `Part of #<parent>` at the top of the child body and add the child to a task list in the parent body.
- **Blocking**: Forgejo's native issue dependencies (enabled on this repo). Add an edge with `curl -s -X POST -H "$AUTH" -H 'Content-Type: application/json' $API/issues/<child>/dependencies -d '{"owner":"vicoli-labs","repo":"nitro-web-redirect","index":<blocker>}'`. `GET $API/issues/<child>/dependencies` lists every blocker, closed ones included, so only those with `state: "open"` still block.

## Pull requests

Pull requests are opened, checked and merged on Forgejo. The branch and worktree rules are in [worktrees.md](./worktrees.md).

- **Open**: `git push -u origin <branch>`, then `fj pr create "<title>" --base main --body-file <file>`. The title is a conventional-commit subject, since the squash commit takes it (plus ` (#<n>)`), and the body carries `Closes #<n>` for the issue it finishes.
- **Read CI**: `fj pr status <n> --wait` waits for every check and lists each one. The checks are `Lint & Test & Build / Lint ✅`, `/ Test 🧪` and `/ Build 👷🏼‍♂️`, each with ` (pull_request)` appended. `renovate/stability-days` shows up on Renovate's PRs only. A `skipped` check counts as passed.
- **Read a failed job's log**: find the run by SHA with `curl -s -H "$AUTH" "$API/actions/runs?page=1&limit=50&head_sha=<sha>" | jq '.workflow_runs[] | {id, workflow_id, status}'`, its jobs with `GET $API/actions/runs/<id>/jobs` (a bare array of `{id, name, status}`), and the whole log with `GET $API/actions/jobs/<job id>/logs`. A run's `status` turns `failure` while a sibling job is still running, so read the jobs before calling a run finished.
- **Re-run a failed job**: Forgejo 16 has no re-run endpoint. Give the same tree a new SHA instead: `git commit --amend --no-edit --date=now`, then `git push --force-with-lease`. Re-run only once the log shows the failure has nothing to do with the change.
- **Merge**: once every check is green, `fj pr merge <n> --method squash --delete --title "<title> (#<n>)"`. Squash is the only style used here. The default squash body comes from `.forgejo/default_merge_message/SQUASH_TEMPLATE.md`, which leaves out Forgejo's `Reviewed-on:` trailer: it names the private Forgejo host, and every commit reaches the public mirror. A `--message` replaces that body, so never put a Forgejo URL in one. A red check is fixed or re-run, never merged past: never pass `force_merge` to the API, because the agents' token belongs to a site admin and Forgejo lets a site admin's `force_merge` past every protection. Before merging, check that the PR's head SHA is still the one whose checks you read. Afterwards confirm with `fj pr view <n>` that it merged before retrying anything, then clean up as in [worktrees.md](./worktrees.md#after-the-merge) and close the issue as in _Close_ above if `Closes #<n>` did not.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs go through the same labels and states as issues, using `fj pr` equivalents. Issues and PRs share one number space, so a bare `#42` may be either.

## When a skill says "publish to the issue tracker"

Create a Forgejo issue.

## When a skill publishes a spec

Forgejo has no sub-issues, so a spec looks like any other issue in the list. The **`spec`** label marks it: `/to-spec` adds both `spec` and `ready-for-agent` right after creating it (`spec` says what the issue is, `ready-for-agent` who it is for). The tickets `/to-tickets` cuts from it carry `Part of #<spec>` at the top of their body and never the `spec` label. A spec split out of a larger spec is labelled `spec` too; its own `Part of #<n>` line names the parent.

List the specs with `fj issue search --labels spec --state all`.

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above, newest comment first.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: one issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. The `wayfinder:*` labels do not exist yet; create them with **Repo labels** the first time.
- **Child ticket**: `Part of #<map>` at the top of the body, listed in the map's task list. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: native issue dependencies, as in **Blocking** above. A ticket is unblocked once every blocker is closed.
- **Frontier query**: the map's open children in task-list order, minus those with an open blocker or an assignee; the first one wins.
- **Claim**: `fj issue assign <n> piscis`, the session's first write.
- **Resolve**: `fj issue comment <n> "<answer>"`, then `fj issue close <n>`, then append a pointer (gist + link) to the map's Decisions-so-far.
