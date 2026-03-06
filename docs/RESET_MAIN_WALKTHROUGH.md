# Walkthrough: Point main to the commit before 43610fe

**Goal:** Make `main` point to the commit **before** `43610fe` (that commit is `394c54d`). Every commit from `43610fe` through the current tip of main will no longer be on main.

**Commits that will be removed from main:**
- 43610fe — added new datatype MYPRIMETYPE
- 7e84699 — Revert "added new datattype MYPRIMETYPE..."
- c073f53 — implemented datatype MYPRIMENUMBER
- 459fe7c — added feature where users can generate sample data from tables
- 139d303 — fixed bugs with features
- 08d5134 — Merge pull request #1 from evanli02/prime-sampledata
- a5e2fdb — Revert "Merge pull request #1..."

After the reset, **main** will point to **394c54d** (Add diagram ids improve navigation #889).

---

## Steps

### 1. Make sure you're on main and it's up to date

```bash
git checkout main
git pull origin main
```

### 2. Reset main to the commit before 43610fe

The commit before `43610fe` is its parent, which is `394c54d`. Use either:

```bash
git reset --hard 43610fe^
```

or explicitly:

```bash
git reset --hard 394c54d
```

- `--hard` moves the branch and updates your working tree to match that commit (all later commits are dropped from this branch).

### 3. Confirm the history

```bash
git log --oneline -5
```

You should see `394c54d` as the latest commit on main.

### 4. Force-push main (only if main is already pushed)

If main has already been pushed to `origin`, the remote still has the old tip. To update it to the reset state:

```bash
git push origin main --force
```

**Warning:** Force-pushing rewrites history on the remote. Anyone who has pulled the current main will have to reset or rebase their local main. Coordinate with others if this is a shared branch.

---

## Summary

| Step | Command |
|------|---------|
| 1 | `git checkout main` then `git pull origin main` |
| 2 | `git reset --hard 43610fe^` (or `git reset --hard 394c54d`) |
| 3 | `git log --oneline -5` to verify |
| 4 | `git push origin main --force` to update the remote |

After this, main will point to the commit prior to 43610fe, and all commits in between will no longer be on main.
