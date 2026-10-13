## Workflow

**Your own worktree:** other agents share this repository and the main checkout is the person's, so before your first edit you work in a linked worktree on your own branch; every change lands on `main` as a pull request with a conventional-commit title, squash-merged once CI is green, and once it merges you remove the worktree and branch you made. Steps, and the sweep for ones others left: `docs/agents/worktrees.md`.

**Public mirror:** the repo is push-mirrored on every commit to the public GitHub repo https://github.com/piscis/nitro-web-redirect. Everything committed is published there, so keep hostnames of private infrastructure, tokens and client names out of commits, docs and PRs. Issues and pull requests live on Forgejo only.

## Agent skills

### Issue tracker

Issues and pull requests live on Forgejo behind the `origin` remote, driven by the `fj` CLI with `curl` + `jq` on the REST API for the rest; every spec also gets the `spec` label. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
