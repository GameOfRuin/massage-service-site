# RCA: Health error details lost on failure

## Symptom
- `GET /health` returned HTTP `503`, but response body could miss meaningful diagnostic details.
- In failure cases where underlying error had only `error.message` (without `error.response`), the API could emit a generic/empty message, making incident triage slower.

## Trigger
- PostgreSQL health probe failed with a plain `Error` object (for example timeout/connection failure) that did not include Terminus-style `response` payload.

## Root Cause
- In `HealthController.check()`, catch handler mapped exception message only from `error.response`.
- For plain `Error` failures, `error.response` is `undefined`, so details from `error.message` were dropped.

## Fix
- Behavior change implemented in `src/infrastructure/health/health.controller.ts`:
  - before: `AppHealthCheckException({ message: error.response })`
  - after: `AppHealthCheckException({ message: error.response ?? error.message ?? 'Health check failed' })`
- Added regression coverage in `src/infrastructure/health/health.controller.regression.spec.ts`:
  - verifies payload is preserved when `error.response` exists,
  - verifies fallback to `error.message` when `error.response` is missing (the seeded bug).

## Detection
- Defect was detected during PR review from blocker feedback requiring a regression test for seeded bug.
- Reproduced in unit-level scenario by mocking `health.check()` rejection with `new Error('postgres timeout')` and observing that old logic did not preserve this message.

## Blast Radius
- Affects all consumers of `/health` during dependency outages (DB down, timeout, transient network failures).
- Primary impact is operational: weaker observability and slower root-cause identification by on-call/monitoring systems.
- Does not affect successful health checks or business endpoints directly.
