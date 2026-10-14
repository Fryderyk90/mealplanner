# CLAUDE.md

Context for AI assistants (Claude Code) working in this repo. Read it at the start of every session.

## Project

**Meal Planner** is a **learning project**. The owner (GitHub: `Fryderyk90`) is an experienced C#/React developer learning modern full-stack architecture end to end: microservices, federated GraphQL, microfrontends, Kubernetes, CI/CD, DevSecOps and IaC. The app is deliberately over-architected for learning ([ADR 0001](docs/adr/0001-why-microservices.md)).

**Hard constraint: free and open-source options only.** No paid services, no cloud bills. That's why the repo is public: CodeQL, secret scanning, rulesets, environments, attestations and unlimited Actions minutes are all free on public repos.

## Where the work is defined

- **The GitHub issues are the spec.** Each milestone M0–M16 has one epic issue (label `type:epic`) with task **sub-issues**. Each task has Context / Requirements / Acceptance criteria / Notes. Read the issue before starting: `gh issue view <n>`.
- **Board:** https://github.com/users/Fryderyk90/projects/3, with the fields Status (Todo / In Progress / In Review / Done), Area and Size (S/M/L).
- **Milestones:** `gh api repos/Fryderyk90/mealplanner/milestones --jq '.[] | "\(.number) \(.title) open=\(.open_issues)"'`. GitHub milestone number = M-number + 1.
- **What's next:** the lowest open milestone's open issues: `gh issue list --milestone "<title>"`. Within M0 the order was chosen by dependency, not issue number (e.g. #9 CI before #6 ruleset).

## Architecture and stack (decided, don't re-litigate)

- **Backend:** .NET 10, Hot Chocolate subgraphs using **Apollo Federation v2** (`HotChocolate.ApolloFederation`), behind **Hive Gateway** (MIT). An ASP.NET Core **BFF** (OIDC cookie auth + YARP) is the only thing the browser talks to.
- **Services:** Recipes, Planner, Shopping. One Postgres database each, **Clean Architecture** (Domain / Application / Infrastructure / Api), **plain handler classes, no MediatR** (commercial licence), NetArchTest layering tests.
- **Messaging:** RabbitMQ + **MassTransit 8.x, pinned `< 9`** (v9 is commercial), with the EF Core outbox and inbox.
- **Auth:** Keycloak, BFF pattern, `household_id` claim → EF Core global query filter (multi-tenancy).
- **Frontend:** React + TS **microfrontends with Module Federation 2.0 on Rsbuild**: a shell plus recipes/planner/shopping remotes. Also Apollo Client + GraphQL Codegen (persisted documents), Tailwind + shadcn/ui, and Storybook.
- **Local dev:** .NET Aspire. **Prod-like:** kind + Helm + Envoy Gateway (Gateway API) + operators (CloudNativePG, RabbitMQ, Keycloak) + Argo CD. **IaC:** OpenTofu.
- **Observability:** OpenTelemetry → Grafana LGTM. **Feature flags:** OpenFeature + flagd.

## How we work together (important)

- **The owner writes the code; Claude coaches.** For each issue:
  1. Explain the concept and the _why_.
  2. Give **detailed numbered steps**: exact file paths, exact commands, full file skeletons with comments, and an **"Expect:"** line saying what output to see. Mark the owner's own decisions with ✏️.
  3. Let the owner do it. Hint-only guidance ("look it up in the docs") has caused them to get stuck, so don't rely on it.
- **"Check my progress"** means: inspect the files, git state, PR and CI runs with tools, then report ✅ done / ❌ must fix (with the exact fix) / 🟡 optional, and the next step.
- **"Finish this up for me"** means: complete the issue fully (files, verification, commit, push, PR), then explain what was done and any decisions made on the owner's behalf.
- **The owner merges PRs**, not Claude.
- Verify claims with real output (build, test, CI logs) before reporting success.
- Keep explanations concise. Use tables for comparisons.

## Conventions (details in [CONTRIBUTING.md](CONTRIBUTING.md))

- **Flow:** issue → board "In Progress" → branch `<type>/<issue#>-<short-name>` → PR from the template with `Closes #N` → **squash merge** (the PR title becomes the commit on `main`).
- **Conventional Commits.** Scopes: `recipes planner shopping gateway bff web ui infra k8s ci deps docs`. Enforced locally by lefthook + commitlint (`commitlint.config.mjs`).
- **PR descriptions:** fill in "How I verified it" with real evidence. Tick only the checklist items that are true.
- **ADRs** in `docs/adr/`, from `template.md`. They're immutable once accepted, so supersede instead of editing. Update the index in `docs/adr/README.md`.
- **C# style:** `.editorconfig` is enforced in the build (`EnforceCodeStyleInBuild`, `TreatWarningsAsErrors`, `AnalysisLevel` latest-recommended):
  - file-scoped namespaces
  - `var` everywhere
  - `_camelCase` private fields, including statics
  - package versions only in `Directory.Packages.props` (Central Package Management)
- **Web style:** Prettier (`.prettierrc`: single quotes, width 100, trailing commas).

## Commands

```bash
dotnet build MealPlanner.slnx                        # analyzers + style are errors
dotnet format MealPlanner.slnx --verify-no-changes
dotnet test MealPlanner.slnx
pnpm install                                         # tooling + git hooks (prepare → lefthook install)
pnpm exec prettier --check .
gh pr checks --watch                                 # follow CI on the current PR
```

CI: `.github/workflows/ci.yml` (job **`ci`**: restore/build/format/test plus Prettier) and `codeql.yml` (actions + javascript-typescript; **C# is commented out until the first `.cs` file exists**, see the reminder on #25).

## Environment and gotchas

- Windows 11. The shells are PowerShell and Git Bash. Tools: .NET SDK 10.0.401 (pinned in `global.json`), Node 22, **pnpm 12** (pinned through `packageManager`/`devEngines`), gh 2.102.
- **Use Visual Studio 2026, not 2022.** VS 2022 17.4 is also installed, but it can't open `.slnx` or target .NET 10.
- **pnpm blocks dependency install scripts.** `pnpm-workspace.yaml` → `allowBuilds:` must list each package as `true`/`false`. lefthook is `false`; our own `prepare` script installs the hooks.
- **Hooks are per clone.** If `pnpm install` says "Already up to date", run `pnpm run prepare`. Emergency skip: `LEFTHOOK=0`.
- **pnpm workspace location:** the root `pnpm-workspace.yaml` is _the_ workspace. In M1, add `web/apps/*` and `web/packages/*` there instead of creating `web/pnpm-workspace.yaml` (the M1 issue text predates this).
- **GitHub reads issue and PR templates only from `main`**, so they can only be tested after merging.
- **GitHub Actions security:** never put `${{ github.event.* }}` (attacker-controlled) directly inside `run:`. Pass it through `env:` instead. CodeQL flags this (`actions/code-injection`).
- YAML: use `value: |` for multi-line text, and real booleans (`true`/`false`), never `yes`/`no`.

## Model guidance

Routine guided work, progress checks, config, docs and reviews work fine on a cheaper model. Suggest switching to a stronger model for:

- architecture-heavy milestones: M5 federation and messaging, M9 GraphQL security, M10 cache invalidation, M12 Kubernetes design
- subtle ADR trade-offs
- debugging that isn't converging
