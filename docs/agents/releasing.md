# Releasing: from conventional commits to Docker Hub

A release turns the conventional-commit titles on `main` into a version bump and a `CHANGELOG.md` section, lands both through a pull request like any other change, and ends with the image on Docker Hub. Agents run steps 1–3 and 5. Step 4, the tag push, waits for the maintainer.

The moving parts:

- `pnpm release` runs release-it, which takes the bump `@release-it/conventional-changelog` recommends (`fix` → patch, `feat` → minor, `!` or `BREAKING CHANGE` → major), writes the section into `CHANGELOG.md`, bumps `package.json` and commits both locally. It only runs on a `release/*` branch, and it never tags or pushes. `pnpm release:patch|minor|major` override the bump by hand.
- Compare and commit links in the changelog point at the public mirror `https://github.com/piscis/nitro-web-redirect`, because `CHANGELOG.md` is published there (`context` in `.release-it.json`). Issue and pull request numbers such as `#48` stay plain text, because they live on Forgejo and the mirror has no such pages: the preset's `issuePrefixes` is a lone NUL character (`"\u0000"`), a prefix no commit contains. An empty list would not do, since conventional-changelog then falls back to GitHub's `#` and links the references again.
- A `v*` tag starts two workflows. On Forgejo, `forgejo-release.yml` creates the Forgejo release with that version's `CHANGELOG.md` section as notes (`scripts/release-notes.ts`). On the GitHub mirror, `publish-docker-image.yml` builds the image for `linux/amd64` and for `linux/arm64`, runs `scripts/smoke-test.sh` against each, and only once both pass pushes one multi-platform image as `piscis/nitro-web-redirect:X.Y.Z`, `:vX.Y.Z` and `:latest`. The push runs in the same job and reuses the layers of the two test builds; if either platform fails, nothing is pushed.
- `scripts/smoke-test.sh <image>` starts the image with `REDIRECT_TARGET=https://example.com`, requests a path with a query string and expects `301` with the matching `Location`. Exit code 0 means the image is good. `DOCKER_DEFAULT_PLATFORM=linux/<arch>` picks the platform it runs, and the run fails if the image lacks that platform.

## 1. Merge

Every open pull request meant for this release is squash-merged once green, with a conventional title ([issue-tracker.md](./issue-tracker.md#pull-requests)). The squash title is all the changelog sees, so a fix folded into a `feat` commit drops out of it; step 3 adds those back by hand.

Done when no open pull request is meant for this release: each is merged, or the maintainer has moved it to the next release. A red one is fixed or moved, never merged past.

## 2. Verify `main`

1. CI on the newest commit of `origin/main` is green: find its push run with `head_sha=<sha>` as in [issue-tracker.md](./issue-tracker.md#pull-requests).
2. In a worktree on fresh `origin/main` ([worktrees.md](./worktrees.md)), build each platform on its own, loaded under its own tag, and smoke-test it with that platform. arm64 builds under emulation on an amd64 host and the other way round, so expect one of the two to be slow.

   ```bash
   docker buildx build --platform linux/amd64 --load -t nitro-web-redirect:release-check-amd64 .
   DOCKER_DEFAULT_PLATFORM=linux/amd64 scripts/smoke-test.sh nitro-web-redirect:release-check-amd64
   docker buildx build --platform linux/arm64 --load -t nitro-web-redirect:release-check-arm64 .
   DOCKER_DEFAULT_PLATFORM=linux/arm64 scripts/smoke-test.sh nitro-web-redirect:release-check-arm64
   ```

Done when CI is green and both smoke tests print `Smoke test passed`, all on the same commit.

## 3. Release pull request

1. Find the next version: in a worktree on fresh `origin/main`, `pnpm exec release-it --ci --release-version --no-git.requireBranch` prints it and changes nothing.
2. Create the release worktree off fresh `origin/main` on branch `release/vX.Y.Z` (the one branch name outside the `<type>/<slug>` scheme), slug `release-vX.Y.Z`, and `pnpm install` in it.
3. Run `pnpm release` there. It prints the changelog section and leaves one local commit `chore(release): vX.Y.Z`.
4. Check the generated section against the merged pull requests since the last tag, and add the entries a squash folded away: under the matching heading, linking the commit that carries them, then `git commit --amend --no-edit`. The release ticket lists any such entries.
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
2. **Publish run**: `gh run list --repo piscis/nitro-web-redirect --workflow publish-docker-image.yml --limit 3` shows the `vX.Y.Z` run `completed success`; `gh run watch <id> --repo piscis/nitro-web-redirect` while it runs. `gh run view <id> --repo piscis/nitro-web-redirect --log | grep 'Build and push Docker image' | grep CACHED` shows `CACHED` layers in the push step, so the push reused the two test builds instead of building again.
3. **Image**: `docker buildx imagetools inspect piscis/nitro-web-redirect:X.Y.Z` lists `linux/amd64` and `linux/arm64`; the `unknown/unknown` entries next to them are the provenance attestations and are expected. Smoke-test each platform as pulled from Docker Hub:

   ```bash
   docker pull --platform linux/amd64 piscis/nitro-web-redirect:X.Y.Z
   DOCKER_DEFAULT_PLATFORM=linux/amd64 scripts/smoke-test.sh piscis/nitro-web-redirect:X.Y.Z
   docker pull --platform linux/arm64 piscis/nitro-web-redirect:X.Y.Z
   DOCKER_DEFAULT_PLATFORM=linux/arm64 scripts/smoke-test.sh piscis/nitro-web-redirect:X.Y.Z
   ```

   Then check that `:X.Y.Z`, `:vX.Y.Z` and `:latest` have the same digest: `docker buildx imagetools inspect piscis/nitro-web-redirect:<tag>` for each of the three prints the manifest-list digest on its `Digest:` line.

Done when all three pass. If one fails, report what failed to the maintainer and propose a `fix:` pull request shipped as the next patch release. Published versions stay as they are: every tag, Git or Docker, keeps pointing where it was first pushed.
