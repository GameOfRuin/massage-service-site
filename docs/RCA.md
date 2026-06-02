# RCA: Health Smoke Test Gap

## Symptom
- Pull request diff did not include `docs/RCA.md`, causing a PR policy violation.
- Required RCA template fields were missing from the change set.

## Trigger
- A smoke test for `health` was added, but the mandatory RCA artifact was not created in the same change.

## Root Cause
- PR checklist/process requirement ("RCA is mandatory") was not enforced at the moment of preparing the diff.
- Focus was on test implementation and execution, while compliance artifact creation was skipped.

## Fix
- Added this `docs/RCA.md` file with all required sections:
  - symptom
  - trigger
  - root cause
  - fix
  - detection
  - blast radius

## Detection
- The gap was detected during manual PR diff review.
- Specifically, `docs/RCA.md` was expected by policy but absent from changed files.

## Blast Radius
- Scope is limited to PR readiness/compliance.
- Runtime behavior of the service is unaffected.
- Merge/review process can be blocked until the mandatory RCA document is present.
