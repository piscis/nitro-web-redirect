# Worktrees: one agent, one checkout

Several agents work in this repository at once, and the main checkout belongs to the person. A `git switch` there moves the files under everyone who shares it, uncommitted edits included. So every agent works in a **linked worktree** on its own branch, and every change reaches `main` as a pull request.

## Before the first edit

1. Find out where you are: `git rev-parse --git-dir --git-common-dir`. Two different paths mean a linked worktree; the same path twice means the main checkout.
2. **In a linked worktree on its own branch** (an `EnterWorktree` session, a subagent started with `isolation: "worktree"`): work there. Its path and branch name belong to the tool that made it.
3. **In the main checkout**: prune first (below), then branch off a fresh `main` into `.claude/worktrees/` (gitignored), and do everything else from there:

   ```bash
   git fetch origin
   git worktree add -b <branch> .claude/worktrees/<slug> origin/main
   pnpm -C .claude/worktrees/<slug> install
   ```

   The branch is `<type>/<issue>-<slug>` (`fix/12-preserve-query`), or `<type>/<slug>` with no issue, where `<type>` is the conventional-commit type the pull request's title will carry. The slug is the branch's last segment.

Done when `git rev-parse --git-dir` names a linked worktree and `git branch --show-current` is a branch no other worktree has checked out.

## Through a pull request

Commit with conventional subjects (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, optional scope). The pull request's title is the one that counts: the squash merge makes it the commit on `main`, and release-it builds `CHANGELOG.md` from those. Run `pnpm lint` and `pnpm test:run` before pushing. Opening, reading CI and merging are in [issue-tracker.md](./issue-tracker.md#pull-requests).

## After the merge

Forgejo deletes the remote branch; the local ones are yours.

- **You merged, from a worktree you created**: return to the main checkout, then

  ```bash
  git worktree remove .claude/worktrees/<slug>
  git branch -D <branch>
  git fetch --prune origin
  ```

  `-D`, because a squash merge never makes the branch look merged to git.

- **You merged, from a worktree a tool created**: leave the worktree and its branch to that tool, and say in your report that the pull request is merged.

## Prune what others left

A pull request the person merges after the agent's session has ended leaves its worktree behind. Before creating a worktree, sweep `.claude/worktrees/`: for each entry in `git worktree list` under that folder, look its branch up with `curl -s -H "$AUTH" "$API/pulls/main/<branch>" | jq '{number, merged}'` (`$API` and `$AUTH` as in [issue-tracker.md](./issue-tracker.md#calling-the-api); the lookup still answers once the remote branch is deleted). Remove it as above only when `merged` is `true` and `git -C <path> status --porcelain` prints nothing; report the rest. The sweep stops at `.claude/worktrees/`: the main checkout and any folder a person made are theirs.
