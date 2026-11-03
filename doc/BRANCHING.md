# Branching Strategy

This document defines how we create, name, review and merge branches in the **Attendies** repository.

Repository: `https://github.com/zaheershaikh936/attendance-project`

---

## 1. Overview

We use a simplified Git Flow with two long-lived branches, **one parent branch per feature**, and **sub-branches for each task inside that feature**.

```
main            ●──────────────────────────────────────●──────────●   (production)
                 \                                    /          /
develop           ●──────●────────────────────────────●          /    (staging)
                          \                          /          /
feature/auth               ●─────●──────────●───────●          /     (one feature)
                            \   /  \       /                  /
auth/sign-in                 ●●●    \     /                  /       (sub-task)
                                     \   /                  /
auth/sign-up                          ●●●                  /         (sub-task)
                                                          /
hotfix/*                                         ●───────●           (urgent prod fix)
```

| Branch           | Purpose                                   | Branches from    | Merges into      | Lifetime        |
|------------------|-------------------------------------------|------------------|------------------|-----------------|
| `main`           | Production-ready code only                | —                | —                | Permanent       |
| `develop`        | Integration of finished features          | `main`           | `main`           | Permanent       |
| `feature/<name>` | **Parent** branch for one whole feature   | `develop`        | `develop`        | Until feature is done |
| `<name>/<task>`  | **Sub-branch** for one task of a feature  | `feature/<name>` | `feature/<name>` | Short-lived     |

| Branch       | Purpose                              | Deploys to                 | Lifetime    |
|--------------|--------------------------------------|----------------------------|-------------|
| `main`       | Production-ready code only           | Vercel **Production**      | Permanent   |
| `develop`    | Integration of finished work         | Vercel **Preview/Staging** | Permanent   |
| `feature/*`  | Parent branch for one feature        | Vercel Preview             | Until done  |
| `<feature>/*`| Sub-task inside a feature            | Vercel Preview (per PR)    | Short-lived |
| `fix/*`      | Non-urgent bug fixes                 | Vercel Preview (per PR)    | Short-lived |
| `hotfix/*`   | Urgent fixes for production          | Vercel Preview (per PR)    | Short-lived |
| `chore/*`    | Tooling, deps, config, docs          | Vercel Preview (per PR)    | Short-lived |
| `release/*`  | Optional: stabilise a release        | Vercel Preview             | Short-lived |

---

## 2. Long-lived branches

### `main`
- Always deployable. What is on `main` is what users see.
- **No direct pushes.** Changes arrive only by Pull Request from `develop`, `release/*` or `hotfix/*`.
- Every merge into `main` is tagged with a version (see [Releases](#7-releases-and-tags)).

### `develop`
- The default target for all day-to-day work.
- Should always build (`npm run build`) and run (`npm run dev`).
- **No direct pushes.** Changes arrive by Pull Request.

---

## 3. Working branches

### 3.1 Feature branches and sub-branches

Every feature in the app gets **one parent branch**: `feature/<feature>`.
All the work for that feature happens in **sub-branches** named `<feature>/<task>`, which branch off the parent and merge back into it.
Only when the whole feature is finished does the parent branch merge into `develop`.

```
develop
└── feature/auth                  ← parent: the whole Auth feature
    ├── auth/sign-in              ← sub-task
    ├── auth/sign-up              ← sub-task
    ├── auth/forgot-password      ← sub-task
    └── auth/google-login         ← sub-task
```

Planned features and example sub-branches:

| Parent branch          | Sub-branches                                                                 |
|------------------------|------------------------------------------------------------------------------|
| `feature/auth`         | `auth/sign-in`, `auth/sign-up`, `auth/forgot-password`, `auth/google-login`  |
| `feature/company`      | `company/registration`, `company/settings`, `company/admin-setup`            |
| `feature/employee`     | `employee/list`, `employee/invite`, `employee/profile`                       |
| `feature/location`     | `location/crud`, `location/geofence`                                         |
| `feature/attendance`   | `attendance/check-in`, `attendance/check-out`, `attendance/policies`         |
| `feature/leave`        | `leave/request`, `leave/approval`, `leave/balance`                           |
| `feature/reports`      | `reports/daily`, `reports/monthly`, `reports/export`                         |

**Rules for feature and sub-branches**
- The sub-branch prefix is the **feature name** (the part after `feature/`), e.g. `feature/auth` → `auth/*`.
- Sub-branches are always created **from the parent feature branch**, never from `develop`.
- Sub-branch PRs target the **parent feature branch**, never `develop` or `main`.
- Bug fixes for a feature still in progress are also sub-branches: `auth/fix-sign-in-redirect`.
- Never create a branch named only `auth` (without `/task`). Git cannot have both `auth` and `auth/sign-in`.
- Small changes that don't belong to a feature (config, docs, deps) use `chore/*`, `docs/*`, `fix/*` from `develop` as before.

### 3.2 Other branch types

### Naming

```
<type>/<short-description>
<type>/<issue-number>-<short-description>
```

- Lowercase, words separated by hyphens (`-`)
- Keep it short and descriptive (max ~5 words)

| Type        | Use for                                | Example                                   |
|-------------|----------------------------------------|-------------------------------------------|
| `feature/`  | Parent branch for a feature (see 3.1)  | `feature/auth`                            |
| `<feature>/`| Sub-task of a feature (see 3.1)        | `auth/sign-in`                            |
| `fix/`      | Bug fix (not urgent)                   | `fix/12-late-checkin-calculation`         |
| `hotfix/`   | Production is broken, fix now          | `hotfix/login-redirect-loop`              |
| `chore/`    | Deps, config, tooling, CI              | `chore/upgrade-next-15`                   |
| `docs/`     | Documentation only                     | `docs/branching-strategy`                 |
| `refactor/` | Code change with no behaviour change   | `refactor/supabase-client`                |
| `db/`       | Database migrations / schema changes   | `db/add-attendance-policies-table`        |

### Rules
- `feature/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`, `db/*` branch **from `develop`**.
- Sub-branches (`<feature>/*`) branch **from their parent `feature/<feature>`**.
- `hotfix/*` branches **from `main`**.
- One branch = one task. Don't mix unrelated changes.
- Keep branches short-lived (ideally merged within 1–3 days).
- Rebase on or merge the latest `develop` before opening a PR.
- Delete the branch after it is merged.

---

## 4. Daily workflow

### Step 1: Create the parent feature branch (once per feature)

```bash
git checkout develop
git pull origin develop
git checkout -b feature/auth
git push -u origin feature/auth
```

### Step 2: Create a sub-branch for a task

```bash
git checkout feature/auth
git pull origin feature/auth
git checkout -b auth/sign-in
```

### Step 3: Work and commit

```bash
git add <files>
git commit -m "feat(auth): add sign-in form"
git push -u origin auth/sign-in
```

### Step 4: Open a PR from the sub-branch into the parent
- **Base:** `feature/auth`  ←  **Compare:** `auth/sign-in`
- Fill in the PR template (see [Pull Requests](#6-pull-requests)).
- After approval, **Squash and merge**, then delete `auth/sign-in`.

Repeat steps 2–4 for `auth/sign-up`, `auth/forgot-password`, etc.

### Step 5: Merge the finished feature into `develop`
When every sub-task of the feature is merged and the feature works end-to-end:
- **Base:** `develop`  ←  **Compare:** `feature/auth`
- After approval, **Merge commit** (keeps one commit per sub-task), then delete `feature/auth`.

### Keeping branches up to date

The parent branch is **shared**, so update it with **merge** (never rebase + force-push):

```bash
# bring latest develop into the parent feature branch
git checkout feature/auth
git pull origin feature/auth
git merge origin/develop
git push origin feature/auth
```

Your own sub-branch can be rebased on the parent:

```bash
git checkout auth/sign-in
git fetch origin
git rebase origin/feature/auth
git push --force-with-lease      # only on your own sub-branch
```

---

## 5. Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>
```

| Type       | Meaning                                  |
|------------|------------------------------------------|
| `feat`     | New feature                              |
| `fix`      | Bug fix                                  |
| `chore`    | Tooling, deps, config                    |
| `docs`     | Documentation                            |
| `refactor` | Code change without behaviour change     |
| `style`    | Formatting only                          |
| `test`     | Adding or fixing tests                   |
| `db`       | Database migration                       |

Suggested scopes: `auth`, `attendance`, `company`, `employee`, `leave`, `reports`, `location`, `ui`, `db`, `config`.

Examples:
```
feat(company): add company registration form
fix(attendance): correct overtime calculation for night shifts
db(location): add geofence_radius to locations
chore(deps): install @supabase/ssr
```

---

## 6. Pull Requests

### Requirements before merging
- [ ] Targets the correct base branch (sub-branch → `feature/<name>`, feature → `develop`, hotfix/release → `main`)
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] No secrets committed (`.env`, keys); only `.env.example` is tracked
- [ ] No `node_modules/` or `.next/` files in the diff
- [ ] Database changes include a new migration file in `supabase/migrations/`
- [ ] At least **1 approval** from another developer
- [ ] Vercel Preview deployment checked

### PR title
Use the same format as commit messages, e.g. `feat(auth): add Google login`.

### PR description template

```markdown
## What
Short description of the change.

## Why
Link to issue / reason.

## How to test
1. Steps to verify on the Vercel preview or locally.

## Screenshots (UI changes)

## Checklist
- [ ] Build passes
- [ ] Migration added (if DB change)
- [ ] Env vars documented in .env.example (if added)
```

### Merge strategy
| Into              | From                          | Method             |
|-------------------|-------------------------------|--------------------|
| `feature/<name>`  | `<name>/*` sub-branches       | **Squash and merge** |
| `develop`         | `feature/*`                   | **Merge commit**     |
| `develop`         | `fix/*`, `chore/*`, etc.      | **Squash and merge** |
| `main`     | `develop`, `release/*`        | **Merge commit**     |
| `main`     | `hotfix/*`                    | **Squash and merge** |

---

## 7. Releases and tags

When `develop` is stable and ready to go live:

```bash
# Open a PR: develop → main, review it, then merge.
git checkout main
git pull origin main
git tag -a v0.2.0 -m "Release v0.2.0: company registration and check-in"
git push origin v0.2.0
```

Versioning follows [SemVer](https://semver.org/) `MAJOR.MINOR.PATCH`:
- `PATCH` (`v0.2.1`): bug fixes / hotfixes
- `MINOR` (`v0.3.0`): new features (e.g. each project phase)
- `MAJOR` (`v1.0.0`): first public launch or breaking changes

> Suggested mapping to the project plan: each completed phase in `PROJECT_PLAN.md` is a `MINOR` release (Phase 1 → `v0.1.0`, Phase 2 → `v0.2.0` …), and the MVP launch is `v1.0.0`.

### Optional `release/*` branch
For larger releases that need a stabilisation period:

```bash
git checkout develop && git pull
git checkout -b release/v0.3.0
# only bug fixes go here; then PR release/v0.3.0 → main
# after release, merge main back into develop
```

---

## 8. Hotfixes

Use only when **production is broken**.

```bash
git checkout main
git pull origin main
git checkout -b hotfix/login-redirect-loop
# fix, commit, push
git push -u origin hotfix/login-redirect-loop
```

1. Open PR `hotfix/*` → `main`, get it reviewed and merged.
2. Tag a patch release (e.g. `v0.2.1`).
3. **Bring the fix back into `develop`:**
   ```bash
   git checkout develop
   git pull origin develop
   git merge origin/main
   git push origin develop
   ```

---

## 9. Database migrations (Supabase)

Schema changes are the easiest place to break things across branches.

- Every schema change is a **new** file in `supabase/migrations/`; never edit a migration that has already been merged.
- Name migrations with an increasing number or timestamp: `002_add_leave_requests.sql`.
- If two branches both add `00X_*.sql` with the same number, the second to merge must renumber theirs.
- Apply migrations to the **staging** Supabase project when merged into `develop`, and to **production** only when merged into `main`.

---

## 10. Environments

| Branch      | Vercel environment | Supabase project       | Env file / settings          |
|-------------|--------------------|------------------------|------------------------------|
| `main`      | Production         | `attendies-prod`       | Vercel → Production env vars |
| `develop`   | Preview (staging)  | `attendies-staging`    | Vercel → Preview env vars    |
| other / PR  | Preview            | `attendies-staging`    | Vercel → Preview env vars    |
| local       | —                  | staging or local CLI   | `.env.local` (git-ignored)   |

> Never point a preview or local environment at the production database.

---

## 11. GitHub branch protection (one-time setup)

In **GitHub → Settings → Branches → Add branch ruleset**, apply to `main`, `develop` and `feature/*`:

- [x] Require a pull request before merging
- [x] Require at least 1 approval
- [x] Dismiss stale approvals when new commits are pushed
- [x] Require status checks to pass (Vercel build, lint)
- [x] Require branches to be up to date before merging
- [x] Block force pushes
- [x] Restrict deletions

Also in **Settings → General**:
- Set the default branch to `develop` (so PRs target it by default)
- Enable **Automatically delete head branches**

---

## 12. Quick reference

```bash
# new feature (parent branch, once per feature)
git checkout develop && git pull && git checkout -b feature/<name> && git push -u origin feature/<name>

# new sub-task inside a feature
git checkout feature/<name> && git pull && git checkout -b <name>/<task>

# PRs:  <name>/<task> → feature/<name>   then   feature/<name> → develop

# update parent feature branch with latest develop (merge, it's shared)
git checkout feature/<name> && git pull && git merge origin/develop && git push

# update your sub-branch with latest parent
git fetch origin && git rebase origin/feature/<name>

# urgent production fix
git checkout main && git pull && git checkout -b hotfix/<name>

# release
# PR develop → main, merge, then:
git checkout main && git pull && git tag -a vX.Y.Z -m "Release vX.Y.Z" && git push origin vX.Y.Z

# clean up merged local branches
git fetch --prune && git branch --merged develop | grep -vE "main|develop" | xargs git branch -d
```
