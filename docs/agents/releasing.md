# Releasing: from conventional commits to Docker Hub

A release turns the conventional-commit titles on `main` into a version bump and a `CHANGELOG.md` section, lands both through a pull request like any other change, and ends with the image on Docker Hub. Agents run steps 1–3 and 5. Step 4, the tag push, waits for the maintainer.

The moving parts:

- `pnpm release` runs release-it, which takes the bump `@release-it/conventional-changelog` recommends (`fix` → patch, `feat` → minor, `!` or `BREAKING CHANGE` → major), writes the section into `CHANGELOG.md`, bumps `package.json` and commits both locally. It only runs on a `release/*` branch, and it never tags or pushes. `pnpm release:patch|minor|major` override the bump by hand.
- Changelog links point at the public mirror `https://github.com/piscis/nitro-web-redirect`, because `CHANGELOG.md` is published there (`context` in `.release-it.json`).
- A `v*` tag starts two workflows. On Forgejo, `forgejo-release.yml` creates the Forgejo release with that version's `CHANGELOG.md` section as notes (`scripts/release-notes.ts`). On the GitHub mirror, `publish-docker-image.yml` builds the image, runs `scripts/smoke-test.sh` against it, and only then pushes `piscis/nitro-web-redirect:vX.Y.Z` and `:latest`.
- `scripts/smoke-test.sh <image>` starts the image with `REDIRECT_TARGET=https://example.com`, requests a path with a query string and expects `301` with the matching `Location`. Exit code 0 means the image is good.

## 1. Merge

Every open pull request meant for this release is squash-merged once green, with a conventional title ([issue-tracker.md](./issue-tracker.md#pull-requests)). The squash title is all the changelog sees, so a fix folded into a `feat` commit drops out of it; step 3 adds those back by hand.

Done when no open pull request is meant for this release: each is merged, or the maintainer has moved it to the next release. A red one is fixed or moved, never merged past.

## 2. Verify `main`

1. CI on the newest commit of `origin/main` is green: find its push run with `head_sha=<sha>` as in [issue-tracker.md](./issue-tracker.md#pull-requests).
2. In a worktree on fresh `origin/main` ([worktrees.md](./worktrees.md)): `docker build -t nitro-web-redirect:release-check .`, then `scripts/smoke-test.sh nitro-web-redirect:release-check`.

Done when both are green on the same commit.

## 3. Release pull request

1. Find the next version: in a worktree on fresh `origin/main`, `pnpm exec release-it --ci --release-version --no-git.requireBranch` prints it and changes nothing.
2. Create the release worktree off fresh `origin/main` on branch `release/vX.Y.Z` (the one branch name outside the `<type>/<slug>` scheme), slug `release-vX.Y.Z`, and `pnpm install` in it.
3. Run `pnpm release` there. It prints the changelog section and leaves one local commit `chore(release): vX.Y.Z`.
4. Read the new section against the merged pull requests since the last tag. Add by hand what a squash folded away, under the matching heading, linking the commit that carries it, then `git commit --amend --no-edit`.
   - **v2.0.0**: #48 folded two `fix:` commits into its `feat!` commit. Add under `### Bug Fixes`: the target counts as having a protocol only on `^https?://` (so a host like `httpbin.org` is no longer taken for one), and trailing slashes on the target are trimmed. Link both to `89bff79`.
5. `pnpm lint` (run `pnpm lint:fix` and amend if the generated Markdown trips it), `pnpm test:run`, push, and open `chore(release): vX.Y.Z` with a body that lists the section and says `Refs #<release ticket>`. Squash-merge once green.

Done when `chore(release): vX.Y.Z (#<n>)` is on `origin/main`, `package.json` there says `X.Y.Z`, and `CHANGELOG.md` there opens with the `X.Y.Z` section. Clean up the worktree and branch as in [worktrees.md](./worktrees.md#after-the-merge).

## 4. Tag (maintainer's go)

Ask the maintainer, naming the version and the merge commit, and wait for the literal reply **"release vX.Y.Z"**. Then:

```bash
git fetch --prune --force origin
git tag -a vX.Y.Z <merge commit sha> -m "vX.Y.Z"
git push origin vX.Y.Z
```

The tag goes on the `chore(release)` merge commit on `main`, which is where `CHANGELOG.md` holds the section. The mirror receives the tag with the next push mirror run.

Done when `git ls-remote --tags origin vX.Y.Z` names that commit.

## 5. Verify production

1. **Forgejo release**: `curl -s -H "$AUTH" "$API/releases/tags/vX.Y.Z" | jq '{name, body}'` shows the section; if not, read the `Forgejo release` run's log by the tag's commit SHA ([issue-tracker.md](./issue-tracker.md#pull-requests)).
2. **Publish run**: `gh run list --repo piscis/nitro-web-redirect --workflow publish-docker-image.yml --limit 3` shows the `vX.Y.Z` run `completed success`; `gh run watch <id> --repo piscis/nitro-web-redirect` while it runs.
3. **Image**: `docker pull piscis/nitro-web-redirect:vX.Y.Z`, then `scripts/smoke-test.sh piscis/nitro-web-redirect:vX.Y.Z`, and check that `:latest` has the same digest (`docker buildx imagetools inspect piscis/nitro-web-redirect:latest`).

Done when all three pass. If one fails, report what failed to the maintainer and propose a `fix:` pull request shipped as the next patch release. Published versions stay as they are: every tag, Git or Docker, keeps pointing where it was first pushed.
