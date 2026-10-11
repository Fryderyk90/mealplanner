# Architecture Decision Records

An **ADR** records one significant decision: its context, the options that were considered, what was decided, and the consequences. Code shows *what* was built; ADRs explain *why*.

## Rules

- **One decision per ADR.** Keep it short; one page is plenty.
- **Numbered sequentially** (`0001`, `0002`, …), with file names like `0007-use-helm-charts.md`.
- **Immutable once accepted.** Don't rewrite history. If a decision changes, write a new ADR that supersedes the old one, and change only the old one's status to `Superseded by ADR NNNN`.
- **Status lifecycle:** `Proposed` → `Accepted` → `Deprecated` or `Superseded`.
- An ADR is merged in the same PR as the change it describes, or before it.

See [CONTRIBUTING.md](../../CONTRIBUTING.md#when-is-an-adr-required) for when an ADR is required.

## Adding an ADR

1. Copy [`template.md`](template.md) to `NNNN-short-title.md`, using the next free number. Check open PRs too, so two branches don't claim the same number.
2. Fill it in, with the status `Proposed`.
3. Add a row to the index below.
4. Set the status to `Accepted` when the PR is merged.

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](0001-why-microservices.md) | Use a microservices architecture (deliberately, for learning) | Accepted |
