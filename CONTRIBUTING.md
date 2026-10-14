# Contributing

This is a learning project, but it follows the practices of a professional team. This guide explains how work flows from an issue to `main`.

## Prerequisites

| Tool                                              | Version                                                | Needed from              |
| ------------------------------------------------- | ------------------------------------------------------ | ------------------------ |
| [.NET SDK](https://dotnet.microsoft.com/download) | 10.0.x (pinned in [`global.json`](global.json))        | M0                       |
| Git                                               | any recent version                                     | M0                       |
| [GitHub CLI](https://cli.github.com/) (`gh`)      | recent 2.x                                             | M0                       |
| IDE                                               | **Visual Studio 2026**, VS Code + C# Dev Kit, or Rider | M0                       |
| Node.js + pnpm                                    | Node 22+                                               | M0 (git hooks), M1 (web) |
| Docker Desktop                                    | recent, WSL 2 backend on Windows                       | M1                       |
| kind, kubectl, Helm, OpenTofu                     | recent                                                 | M12+                     |

> ⚠️ **Use Visual Studio 2026, not 2022.** The solution uses the `.slnx` format and targets .NET 10. Older Visual Studio versions can't open it, and they ignore the SDK pinned in `global.json`. If double-clicking `MealPlanner.slnx` opens the wrong version, use _Open with → Visual Studio 2026_ and tick "Always use this app".

### First-time setup

After cloning, run this once:

```bash
pnpm install
```

It installs the dev tooling (Prettier, commitlint) and the **git hooks** (through the `prepare` script, which runs `lefthook install`):

| Hook         | What it does                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| `pre-commit` | Runs `dotnet format` on staged `.cs` files and Prettier on staged web/config/Markdown files, then re-stages the fixes |
| `commit-msg` | Rejects messages that don't follow [Conventional Commits](#commit-messages) or use an unknown scope                   |

The hooks are defined in [`lefthook.yml`](lefthook.yml). In an emergency you can skip them with `LEFTHOOK=0 git commit …`, but CI runs the same formatting checks (from #9), and the ruleset checks PR titles (from #6).

## Workflow

Every change goes through the same loop:

1. **Pick an issue** from the [project board](https://github.com/users/Fryderyk90/projects/3) and move it to **In Progress**. Work through a milestone's tasks roughly in order. Each epic issue lists its tasks as sub-issues.
2. **Create a branch** from an up-to-date `main` (see [Branch naming](#branch-naming)).
3. **Make the change** in small commits.
4. **Verify locally** (see the [PR checklist](#pull-request-checklist)).
5. **Open a pull request** whose description contains `Closes #<issue>`, and move the issue to **In Review**.
6. **Review**: read your own diff on GitHub before merging, and get a second pair of eyes when you can.
7. **Squash-merge** and delete the branch. The issue closes automatically and the board moves it to **Done**.
8. Update your local `main`: `git switch main && git pull`.

### Board statuses

| Status      | Meaning                             |
| ----------- | ----------------------------------- |
| Todo        | Not started                         |
| In Progress | A branch exists and work is ongoing |
| In Review   | A PR is open                        |
| Done        | Merged, and the issue is closed     |

## Branch naming

```
<type>/<issue-number>-<short-description>
```

Examples: `chore/2-build-props`, `feat/24-recipe-query`, `docs/13-contributing`.

Use the same `<type>` values as for commits (below). Branches are short-lived. Merge within a few days, so you never drift far from `main` (trunk-based development).

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <description>

[optional body]

[optional footer, e.g. BREAKING CHANGE: …]
```

**Types**

| Type       | Use for                                                   |
| ---------- | --------------------------------------------------------- |
| `feat`     | A new feature                                             |
| `fix`      | A bug fix                                                 |
| `docs`     | Documentation only (including ADRs)                       |
| `test`     | Adding or fixing tests                                    |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `perf`     | A performance improvement                                 |
| `build`    | The build system or dependencies (MSBuild, NuGet, pnpm)   |
| `ci`       | GitHub Actions workflows                                  |
| `chore`    | Other maintenance (tooling, config)                       |
| `revert`   | Reverting an earlier commit                               |

**Scopes** (optional, but recommended): `recipes`, `planner`, `shopping`, `gateway`, `bff`, `web`, `ui`, `infra`, `k8s`, `ci`, `deps`, `docs`.

Examples:

```
feat(recipes): add tag filtering to the recipes query
fix(shopping): merge quantities with different units correctly
docs: add ADR for caching strategy
```

**Why this matters**

- PRs are **squash-merged**, so the **PR title becomes the commit message on `main`**. The PR title must follow this format too.
- From M13 on, [release-please](https://github.com/googleapis/release-please) reads these messages to bump versions and write changelogs: `fix` → patch, `feat` → minor, and `!` or `BREAKING CHANGE:` → major.
- Issue #4 adds commitlint through a git hook, so badly formatted messages are rejected locally.

## Code style

- **C#**: [`.editorconfig`](.editorconfig) defines the style. It's enforced in `dotnet build` (warnings are errors), so style violations fail the build.
  - Run `dotnet format` to fix formatting, file-scoped namespaces and `var` usage automatically.
  - **Naming violations aren't fixed automatically.** Renaming can break code in other files, so use the IDE quick fix (Ctrl+.) to rename safely.
  - Package versions live only in [`Directory.Packages.props`](Directory.Packages.props). Never put `Version=` on a `PackageReference`.
  - Shared build settings live in [`Directory.Build.props`](Directory.Build.props). Keep `.csproj` files minimal.
- **Web** (from M1): Prettier ([`.prettierrc`](.prettierrc)) and ESLint.
- **Line endings**: LF everywhere, enforced by [`.gitattributes`](.gitattributes) and `.editorconfig`.

## Pull request checklist

Before you open a PR, make sure:

- [ ] `dotnet build` succeeds (this includes the analyzers and code style)
- [ ] `dotnet format --verify-no-changes` passes
- [ ] Tests have been added or updated, and `dotnet test` passes
- [ ] The PR title follows Conventional Commits
- [ ] The description contains `Closes #<issue>`, and says **how you verified** the change
- [ ] Docs are updated (README, `docs/`, runbooks), and an ADR is added if one is required
- [ ] There are screenshots for UI changes
- [ ] No secrets, `.env` files or credentials are committed

## When is an ADR required?

Write an [Architecture Decision Record](docs/adr/README.md) when a decision is **significant and not obvious from the code**. Rules of thumb:

- **Hard to reverse.** Changing it later would touch many files or services (data ownership, communication style, frameworks).
- **New technology.** It adds a framework, library, tool or service that others will have to learn and maintain.
- **Cross-service contracts.** It changes how services, microfrontends or teams interact (events, schema conventions, auth flow).
- **Trade-offs.** Several reasonable options exist, and you chose one for reasons worth remembering.
- **Deviating from a convention.** It goes against this guide, an earlier ADR or common practice.

Not needed for: bug fixes, refactors inside one component, or library upgrades without behaviour change.

Copy [`docs/adr/template.md`](docs/adr/template.md) to get started.

## Troubleshooting

| Symptom                                                              | Fix                                                                                                                                      |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| The solution won't open, or there are errors about `.slnx` / .NET 10 | You opened it in Visual Studio 2022. Use **Visual Studio 2026**.                                                                         |
| `ERR_PNPM_IGNORED_BUILDS` during `pnpm install` / `pnpm add`         | pnpm blocks dependency install scripts by default. Add the package under `allowBuilds:` in `pnpm-workspace.yaml` with `true` or `false`. |
| Git hooks don't run after cloning                                    | Run `pnpm install`. If it says "Already up to date", run `pnpm run prepare`.                                                             |
| A commit is rejected by commitlint                                   | Use `type(scope): description` with an allowed type and scope (see [Commit messages](#commit-messages)).                                 |
| An issue form is missing from "New issue"                            | Its YAML is invalid. Open the file on GitHub to see the error. Templates are only read from `main`.                                      |
| VS shows "Miscellaneous Files … cannot be opened" for a deleted file | Stale IDE state. Close VS and delete the `.vs/` folder.                                                                                  |

## Security

Never commit secrets. Use git-ignored `.env` files locally, and Sealed Secrets in Kubernetes. If you find a vulnerability, don't open a public issue. A `SECURITY.md` with private vulnerability reporting is set up in M9.
