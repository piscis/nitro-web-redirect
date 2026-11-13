## Workflow

**Your own worktree:** other agents share this repository and the main checkout is the person's, so before your first edit you work in a linked worktree on your own branch; every change lands on `main` as a pull request with a conventional-commit title, squash-merged once CI is green, and once it merges you remove the worktree and branch you made. Steps, and the sweep for ones others left: `docs/agents/worktrees.md`.

**Releases:** cutting a version, changing the changelog or release tooling, or checking a published image goes by `docs/agents/releasing.md`; the tag push waits for the maintainer's "release vX.Y.Z".

**Dependency updates:** a scheduled, unattended run ships the updates Renovate has picked and prepares the next release up to the tag; it follows `docs/agents/dependency-release.md`.

**Development configuration:** `REDIRECT_TARGET` and `REDIRECT_STATUS_CODE` for `pnpm dev` and `pnpm preview` come from Phase (`.phase.json` links the app; `pnpm dev:local` reads a `.env` instead). Do not create a `.env` in this repository: an ambient value is exactly what the end-to-end specs guard against with `withConfiguration`.

**Public mirror:** the repo is push-mirrored on every commit to the public GitHub repo https://github.com/piscis/nitro-web-redirect. Everything committed is published there, so keep hostnames of private infrastructure, tokens and client names out of commits, docs and PRs. Issues and pull requests live on Forgejo only.

## Agent conventions

### Issue tracker

Issues and pull requests live on Forgejo behind the `origin` remote, driven by the `fj` CLI with `curl` + `jq` on the REST API for the rest; every spec also gets the `spec` label. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
