# Scheduled dependency and release run

A schedule runs this procedure in a fresh, unattended Claude Code agent on the
maintainer's Mac. It ships the dependency updates Renovate has already picked, verifies
them, and — when there is something worth shipping — prepares the next release up to the
tag, which stays the maintainer's call. No human is watching, so every step ends in a
state you can check, and every failure leaves a trail on the issue tracker.

The schedule's prompt is a single line: `Follow docs/agents/dependency-release.md.`

The run is idempotent and cadence-neutral: daily and weekly both work, and a run that
finds nothing applicable changes nothing. Weekly is the maintainer's default, because
Renovate opens its own pull requests only on days 1–3 of the month (`schedule` in
`renovate.json`) and because a release waits for a human tag either way.

## Hard rules

- **Minimum release age.** Every version you merge or install, transitive ones included,
  must be older than the minimum release age: `minimumReleaseAge: "1 day"` in
  `renovate.json` and `minimumReleaseAge: 1440` in `pnpm-workspace.yaml`. An update that
  is too young waits for the next run. The age gate stays exactly as configured: leave
  both keys untouched, add no `minimumReleaseAgeExclude` entries or CLI overrides, and
  leave every Dependency Dashboard checkbox unticked.
- **Renovate decides what to bump, and what may merge unreviewed.** Apply only updates
  the dashboard lists; Renovate owns every version bump here. Merge only what
  `renovate.json` would automerge — non-major updates outside the `nitro` group
  (`:automergeMinor`, `:automergeLinters`, `:automergeTypes`). Every major, and every
  `nitro` group bump (`automerge: false`, because a Nitro prerelease counts as a patch
  but may break), gets a pull request you leave open for a human.
- **The tag is the maintainer's.** You never create or push a `v*` tag, and never run
  step 4 of [releasing.md](./releasing.md#4-tag-maintainers-go). You stop at the merged
  `chore(release)` commit and ask.
- **Workflow.** CLAUDE.md's Workflow rules hold for every step: a linked worktree per
  [worktrees.md](./worktrees.md), Node through `fnm`, one squash-merged pull request per
  change. Run every pnpm command as `corepack pnpm …`: a bare `pnpm` on this machine is an
  old Homebrew build that cannot read `pnpm-workspace.yaml`, while corepack honours
  `packageManager` in `package.json`.
- **Public mirror.** Everything committed reaches the public GitHub mirror. Keep the
  Forgejo host, tokens and client names out of commits, pull request bodies and the
  changelog, and merge with `--message ""` so no `Reviewed-on:` URL lands on `main`.

## Steps

`<date>` below is today as `YYYY-MM-DD`. `$API` and `$AUTH` are as in
[issue-tracker.md](./issue-tracker.md#calling-the-api) — set both inside every command.

### 0. Pick up the last run's release

Look for an open issue titled `Release pending: v*` (`fj issue search "Release pending"
--state open`). If there is one, read the version it names and
`git ls-remote --tags origin 'v<X.Y.Z>*'`:

- **Tag present**: the maintainer released it. Run
  [releasing.md step 5](./releasing.md#5-verify-production), then close the issue with a
  comment naming what you verified. Carry on with step 1.
- **No tag**: the release still waits. Carry on with step 1, but skip step 6 — one
  pending release at a time.

Done when: at most one release is pending, and a released version has been verified.

### 1. Guard

`git fetch --prune origin`, then stop with a one-line status and change nothing if an
open pull request sits on a `chore/deps-*` branch (a previous run, or a human's sweep, is
still in flight):

```bash
curl -s -H "$AUTH" "$API/pulls?state=open&limit=50" \
  | jq -r '.[] | select(.head.ref | startswith("chore/deps-")) | "\(.number) \(.title)"'
```

A pull request on a `renovate/*` branch is Renovate's own and does not block you; step 5
ships it. An open `chore/release-*` or `release/*` pull request blocks step 6 only.

Then sweep `.claude/worktrees/` as in
[worktrees.md](./worktrees.md#prune-what-others-left).

Done when: no `chore/deps-*` pull request is in flight, and merged worktrees are gone.

### 2. Collect

Read the Dependency Dashboard, issue 32: `fj issue view 32`. Sort its entries:

- **Awaiting Schedule**: apply these. Each line names the Renovate branch
  (`unschedule-branch=renovate/<slug>`) and the title to reuse; the target versions are in
  the "Detected Dependencies" section (`→ [Updates: …]`). Outside days 1–3 of the month
  this holds everything, which is expected.
- **Open**: Renovate's own pull requests. Ship these as they are (step 5).
- **Pending Status Checks**: still inside the age window. Skip them.

One Renovate branch is one unit of work: `renovate/all-minor-patch` is one commit and one
pull request, `renovate/node` another (it moves `.nvmrc`, the `Dockerfile` base image, the
README Requirements line, and `engines.node` on majors only).

For each target, confirm its age yourself — more than 24 hours old:

- npm packages: `npm view <pkg> time --json | jq -r '.["<version>"]'`.
- Node.js: `curl -s https://nodejs.org/dist/index.json | jq -r '.[] | select(.version=="v<x.y.z>") | .date'`.
- GitHub Actions: `gh api repos/<owner>/<repo>/releases/tags/<tag> --jq .published_at`.

Mark an update **major** when its major version changes, or its minor version while it is
below 1.0. Majors and the `nitro` group are not yours to merge; see step 5.

Done when: every dashboard entry is applicable with its age confirmed, or skipped with a
reason.

If nothing is applicable and no Renovate pull request is open, go to step 6, which may
still release earlier unreleased commits.

### 3. Apply

One branch per unit from step 2, each off fresh `origin/main`, named
`chore/deps-<date>-<slug>` with `<slug>` the Renovate branch's last segment
(`all-minor-patch`, `node`, `lock-file-maintenance`):

```bash
git worktree add -b chore/deps-<date>-<slug> .claude/worktrees/deps-<date>-<slug> origin/main
cd .claude/worktrees/deps-<date>-<slug> && eval "$(fnm env)" && fnm use && corepack pnpm install
```

Record the baseline audit from the first worktree before editing anything:
`corepack pnpm audit --json > /tmp/audit-base-<date>.json`. Then, per unit:

- Edit the file Renovate detected the dependency in, keeping the existing range style
  (`^x.y.z`, or an exact pin for `nitro`). A `pnpm` bump moves `packageManager` in
  `package.json`.
- Lock file maintenance is `rm pnpm-lock.yaml && corepack pnpm install --lockfile-only`,
  then `corepack pnpm install`. No manifest file changes.
- Run `corepack pnpm install`. If pnpm rejects a version as too young, drop that update
  from this run.
- If install leaves auto-installed peers stale, delete **both** `pnpm-lock.yaml` and
  `node_modules` and install again. Deleting only the lockfile rebuilds it from
  `node_modules/.pnpm/lock.yaml`.

Commit with the dashboard entry's title (for example
`chore(deps): update all non-major dependencies`). Then run `corepack pnpm audit --json` again,
compare against the baseline, and note any new advisory in the pull request body.

Done when: every branch installs cleanly with no age rejections, and `git diff --stat`
against `origin/main` shows only the files you meant to change.

### 4. Verify locally

On each branch, through `eval "$(fnm env)" && fnm use`:

```bash
corepack pnpm lint
corepack pnpm test:run
corepack pnpm build
```

`test:run`, not `test`: the bare script watches on a terminal. These three are
what CI runs. If `lint:fix` is needed, run it and check that it touched nothing
beyond your own files; revert the rest.

CI never builds the image, so when a branch changes the `Dockerfile` or `.nvmrc`, also
build and smoke-test it on the host's platform (`uname -m`):

```bash
docker buildx build --platform linux/arm64 --load -t nitro-web-redirect:deps-check .
DOCKER_DEFAULT_PLATFORM=linux/arm64 scripts/smoke-test.sh nitro-web-redirect:deps-check
```

The other platform waits for [releasing.md step 2](./releasing.md#2-verify-main).

If a check fails, fix it only when the fix is a direct consequence of the update (a
renamed import, a changed type). Otherwise drop that update and record why. Never weaken a
test or a lint rule to get to green.

Done when: every command is green on every branch you still intend to ship.

### 5. Pull request and merge

Open one pull request per branch as in
[issue-tracker.md](./issue-tracker.md#pull-requests): `git push -u origin <branch>`, then
`fj pr create "<title>" --base main --body-file <file>`. The body lists every update as
`pkg from → to`, any update you dropped and why, and any new audit advisory. No Forgejo
URLs.

Then, one pull request at a time:

1. Read CI: head SHA from `curl -s -H "$AUTH" "$API/pulls/<n>" | jq -r .head.sha`, then
   `scripts/wait-ci.sh <sha>`. Exit 2 is a queued run, not a failure — run it again, or in
   the background with a longer timeout (`scripts/wait-ci.sh <sha> 3600`), and leave the
   run alone.
2. **A major, or the `nitro` group**: do not merge. Leave the pull request open and label
   it for a human, then move on:

   ```bash
   id="$(fj repo labels view | grep -o 'ready-for-human  [0-9]*' | grep -o '[0-9]*')"
   curl -s -X POST -H "$AUTH" -H 'Content-Type: application/json' \
     "$API/issues/<n>/labels" -d "{\"labels\":[$id]}" > /dev/null
   ```

   When a ticket already tracks it (issue 41 tracks the `nitro` group), say so in the
   body instead of opening another.
3. **Everything else**, once green: `fj pr merge <n> --method squash --delete --title
   "<title> (#<n>)" --message ""`, then confirm with `fj pr view <n>`.
4. Rebase each remaining branch onto the new `origin/main` and rerun step 4 if the
   lockfile changed.
5. For each open Renovate pull request from step 2: check its branch out as in
   [worktrees.md](./worktrees.md#on-an-existing-pull-request), run step 4 on it, then take
   the same two steps. If it conflicts with `main`, skip it silently — Renovate rebases
   its own branches.

A pull request that fails CI is not merged. Leave it open, comment with the failing
command and its output, carry on with the others, and handle it in step 7.

Clean up each merged branch's worktree as in
[worktrees.md](./worktrees.md#after-the-merge).

Done when: every pull request is merged, left open with a label or a comment, or skipped
as conflicting.

### 6. Release

Release only if all of these hold:

- No release is pending: step 0 found no untagged `Release pending` issue, and no open
  pull request is titled `chore(release): v*`.
- `git log $(git describe --tags --abbrev=0 origin/main)..origin/main` holds at least one
  commit that changes what ships — `fix`, `feat`, `perf`, `refactor` or `chore(deps)`. A
  stretch of `docs:` and `chore(ai):` commits alone is not worth a version.

Then run [releasing.md](./releasing.md) steps 2 and 3: verify `origin/main` (CI green,
both platforms built and smoke-tested), then cut the release pull request on
`release/vX.Y.Z` and squash-merge it once green. The release ticket the changelog check
expects may not exist; in that case leave the `Refs` line out and say in the body that the
run is scheduled.

Stop there. Open an issue titled `Release pending: vX.Y.Z awaits the tag push`, labelled
`ready-for-human`, naming the version and the `chore(release)` merge commit SHA, and
repeat the ask in your report. The maintainer's literal "release vX.Y.Z" starts the tag;
the next run's step 0 verifies production.

Done when: `chore(release): vX.Y.Z (#<n>)` is on `origin/main` and the pending-release
issue is open — or the conditions did not hold and you wrote down which one.

### 7. Failures and report

- If an update or pull request stays broken, open a `needs-triage` issue with the failing
  command and its output, and keep the pull request open. When an issue already tracks it,
  comment only on news: a different error, a new blocking package, or a blocker that
  cleared. An unchanged blocker needs no comment — list it in the report instead.
- If a verified release turns out broken in step 0, open a `needs-triage` issue titled
  `Release vX.Y.Z unhealthy`. Never roll back, retag or republish: every tag, Git or
  Docker, keeps pointing where it was first pushed. The fix ships as the next patch.
- Remove every worktree whose pull request merged, plus its local branch. Keep a failing
  one only when you opened an issue for it or commented with news; otherwise the issue
  already holds the output.

Finish with one short paragraph for the schedule's log: what shipped (versions, pull
requests, release), what was left for a human and why, and the numbers of any issues you
opened.
