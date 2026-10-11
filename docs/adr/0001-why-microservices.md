# ADR 0001: Use a microservices architecture (deliberately, for learning)

- **Status:** Accepted
- **Date:** 2026-10-11

## Context

Meal Planner is a learning project. Its goal is to practise the design, delivery and operation of a modern distributed system:
- service boundaries and data ownership
- federated GraphQL
- asynchronous messaging
- auth across services
- microfrontends
- containers, Kubernetes, GitOps and observability

Judged on product needs alone (a handful of users, one developer, three small subdomains), the right architecture would be a **modular monolith**: one deployable unit with well-separated modules. It would be cheaper to build, test, deploy and operate.

## Decision

We split the system into **three services along bounded-context lines**, plus a BFF and a federation gateway. Each service owns its own database.

| Service | Bounded context | Owns |
|---|---|---|
| Recipes | Recipe catalogue | Recipes, ingredients, tags |
| Planner | Meal planning | Week plans, a snapshot of recipe ingredients |
| Shopping | Shopping | Shopping lists, items, checked state |

The frontend is split the same way into microfrontends, one per service, plus a shell.

Rules that follow from this:
1. **No shared database.** A service never reads another service's tables.
2. **Integration through events** (RabbitMQ) for state changes, and through **GraphQL federation** for read-time composition.
3. **Shared code is limited** to integration event contracts (`Contracts/`). Entities are never shared.
4. Every service must be **independently deployable** and **independently testable**.

## Consequences

**Positive (the learning goals)**
- There are real reasons to practise eventual consistency, the outbox pattern, idempotency, federation, distributed tracing, and deployments per service.
- The structure mirrors how larger organisations split work across teams.

**Negative (accepted on purpose)**
- More moving parts: 3 databases, a broker, a gateway, a BFF and an identity provider.
- Debugging needs distributed tracing from day one.
- Changes that span services need contract versioning.
- Local development depends on .NET Aspire to stay manageable.

**Revisit if** this ever became a real product with a single small team. Merging the services into a modular monolith would then be the pragmatic choice, and the clean bounded contexts make that straightforward.
