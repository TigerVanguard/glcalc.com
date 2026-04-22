# GLCalc Verification Agent Design

**Project:** `glcalc.com`  
**Date:** `2026-04-19`  
**Status:** Draft for review

## Goal

Design a project-specific verification agent for `glcalc.com` that independently validates all required functionality, reports concrete failures in a structured format, and feeds those failures back to a coding agent for iterative fixes until every required test case passes.

## Non-Goals

- Building a generic multi-project verification platform
- Letting the verification agent silently fix product code
- Replacing human product decisions with automated judgment
- Treating partial success as complete success

## Why This Agent Exists

`glcalc.com` is a frontend-heavy product with multiple failure surfaces:

- calculation correctness
- food search behavior
- barcode recognition flow
- photo recognition flow
- error-state handling
- browser-visible regressions

Script-only validation is not enough, and browser-only validation is too weak for code-level regression control. The harness therefore uses a dedicated verification agent that combines deterministic checks with end-to-end browser testing and produces a structured defect report that a coding agent can act on.

## Recommended Pattern

Use a **Generator-Evaluator loop** with strict role separation:

- **Coding Agent**: implements features, fixes defects, adds regression tests, prepares a submission for review
- **Verification Agent**: runs the full validation protocol, produces `PASS`, `FAIL`, or `BLOCKED`, and never self-approves implementation quality based on code inspection alone

This is a project-specific application of the evaluator pattern because self-verification is not reliable enough for feature-complete UI work.

## Success Criteria

The verification system is successful when it can:

1. Validate the full `glcalc.com` MVP behavior independently
2. Detect both code-level and browser-level regressions
3. Produce failure reports precise enough for a coding agent to act on without re-triage
4. Repeat the loop until all required test cases pass
5. Refuse to claim success unless every required gate is green

## Agent Responsibilities

### Coding Agent

The coding agent is responsible for:

- implementing requested functionality
- fixing defects reported by the verification agent
- adding or updating regression tests for every real defect
- documenting each submission before verification

The coding agent is not allowed to:

- mark work complete without verifier approval
- suppress or reinterpret verifier failures as acceptable
- skip regression coverage for reported defects

### Verification Agent

The verification agent is responsible for:

- reading the current submission artifact
- running the full verification protocol in order
- collecting evidence for every failure
- assigning priority to every defect
- writing structured reports for the coding agent
- returning only `PASS`, `FAIL`, or `BLOCKED`

The verification agent is not allowed to:

- edit application code as part of routine verification
- downgrade failures to pass because the change "looks reasonable"
- stop after partial validation when strict mode is required

## Decision Model

The verification agent has exactly three terminal states:

- `PASS`
- `FAIL`
- `BLOCKED`

### PASS

The verification agent may emit `PASS` only if all of the following are true:

- dependency installation succeeds
- build and static checks succeed
- all automated logic tests succeed
- all browser test scenarios succeed
- all required regression tests succeed
- there are zero open issues
- there are zero unclassified critical runtime errors
- there are zero blocked core flows

### FAIL

The verification agent emits `FAIL` when:

- any required check fails
- any required user flow breaks
- any reported defect remains unresolved
- any expected result differs from actual behavior

### BLOCKED

The verification agent emits `BLOCKED` only when completion cannot be determined due to non-product blockers, such as:

- third-party API outage
- missing credentials or configuration
- broken local environment
- contradictory product requirements

`BLOCKED` is not a soft pass.

## Strict Completion Policy

This project uses **strict completion**:

> The iteration is not complete until every required test case passes.

No severity tier is allowed to remain open at the time of `PASS`.

## Verification Strategy

The verification agent uses a hybrid validation stack made of four layers.

### 1. Static Gate

Purpose:

- confirm the project can install, build, and satisfy static validation

Typical checks:

- dependency install
- lint
- type or syntax validation
- production build

### 2. Logic Gate

Purpose:

- verify deterministic business logic without relying on UI clicks

Target areas:

- GI/GL calculations
- unit conversion
- food matching
- barcode lookup normalization
- photo candidate parsing

### 3. Flow Gate

Purpose:

- validate the product like a user would

Target flows:

- text search to GL result
- barcode scan to candidate selection to GL result
- photo upload to candidate selection to GL result
- error states and retries

### 4. Regression Gate

Purpose:

- ensure previously fixed defects stay fixed

Rules:

- every real defect must map to a regression test case
- regression cases must be rerun in every verification cycle

## Required Test Case Families

The verification suite for `glcalc.com` should define stable test IDs.

### Calculation

- `CALC-001`: text search computes GL for a known food
- `CALC-002`: gram input produces correct carbohydrate and GL values
- `CALC-003`: ounce input produces correct carbohydrate and GL values
- `CALC-004`: GI/GL band labels match threshold rules

### Search

- `SEARCH-001`: exact food name search returns expected result
- `SEARCH-002`: partial search returns narrowed candidates
- `SEARCH-003`: too-many-results state is displayed correctly

### Barcode

- `BAR-001`: valid barcode resolves to product metadata
- `BAR-002`: candidate mapping flow allows user confirmation
- `BAR-003`: invalid barcode shows recoverable error state

### Photo

- `PHOTO-001`: valid food image returns candidate foods
- `PHOTO-002`: user can confirm a suggested food
- `PHOTO-003`: recognition failure produces retry-friendly UI

### UI and Resilience

- `UI-001`: result area is visible on desktop
- `UI-002`: result area remains usable on mobile
- `ERR-001`: API timeout produces visible error state
- `ERR-002`: empty input does not leave UI in broken state

### Regression

- `REG-001`: ounce carbohydrate display stays aligned with GL calculation
- `REG-002+`: one ID per future defect

## Priority Model

Every failure must be classified into one of four priorities.

### P0

Use `P0` when the product is fundamentally unusable.

Examples:

- app does not load
- build fails
- GL calculation is materially incorrect
- critical data corruption

### P1

Use `P1` when a core user flow is blocked.

Examples:

- text search cannot complete a calculation
- barcode flow cannot reach confirmation
- photo flow never returns candidates

### P2

Use `P2` when the feature works but behaves incorrectly in a meaningful way.

Examples:

- wrong unit label
- broken threshold labeling
- error state appears but is misleading

### P3

Use `P3` for low-risk defects that do not block core functionality.

Examples:

- styling regression
- non-critical copy issue
- minor layout inconsistency

## Verification Artifacts

The harness should use file-based coordination so both agents work against durable artifacts rather than chat history.

### Required Files

- `.harness/verification/test-cases.md`
- `.harness/verification/submission.md`
- `.harness/verification/open-issues.json`
- `.harness/verification/report.md`
- `.harness/verification/report.json`
- `.harness/verification/env.md`

### submission.md

Written by the coding agent before requesting verification.

It should contain:

- summary of the implemented change
- files touched
- intended behavior
- known risks
- issue IDs expected to be closed

### test-cases.md

Canonical list of required verification cases.

Each case should include:

- stable ID
- description
- priority of failure if broken
- verification method
- expected outcome

### open-issues.json

Machine-readable ledger of unresolved defects across rounds.

### report.md

Human-readable summary of one verification round.

### report.json

Machine-readable result of one verification round.

## report.json Schema

Each verification run should produce one top-level object:

```json
{
  "run_id": "2026-04-19T18-00-00Z",
  "project": "glcalc.com",
  "status": "FAIL",
  "summary": {
    "passed": 9,
    "failed": 3,
    "blocked": 0
  },
  "issues": []
}
```

Each issue should follow this shape:

```json
{
  "id": "GLAC-VER-001",
  "title": "Photo flow never reaches food confirmation step",
  "priority": "P1",
  "status": "open",
  "area": "photo-recognition",
  "test_case": "PHOTO-003",
  "severity_reason": "Core user flow blocked",
  "environment": "local-dev",
  "steps_to_reproduce": [
    "Open homepage",
    "Switch to Photo tab",
    "Upload sample image",
    "Click Analyze"
  ],
  "expected_result": "User sees top food candidates and can confirm one",
  "actual_result": "Spinner stays forever and no candidate list appears",
  "evidence": [
    "path/to/screenshot.png",
    "Console: Unhandled promise rejection",
    "POST /photo-identify returned 500"
  ],
  "suspected_scope": [
    "src/features/photo/*",
    "src/App.js"
  ],
  "fix_guidance": [
    "Check unresolved promise path in photo analyzer",
    "Add timeout and explicit error-state UI",
    "Add regression coverage for pending-state termination"
  ],
  "must_have_regression_test": true
}
```

## Verification Run Protocol

Every run must follow the same sequence.

### Step 1: Load Context

Read:

- `submission.md`
- `test-cases.md`
- `open-issues.json`
- environment notes

### Step 2: Execute Static Gate

Run all required install, lint, syntax, and build checks.

If any fail:

- collect command output
- mark the matching test cases failed
- continue gathering evidence where feasible

### Step 3: Execute Logic Gate

Run deterministic tests for core calculations and utilities.

### Step 4: Execute Flow Gate

Run browser-based scenarios for user-facing behavior.

Evidence for flow failures should include:

- screenshot
- console errors
- network summary when relevant

### Step 5: Execute Regression Gate

Rerun all historical regression cases, not just cases related to the latest change.

### Step 6: Classify Results

Assign:

- test case status
- issue priority
- suspected scope
- fix guidance

### Step 7: Write Reports

Write:

- `report.md`
- `report.json`
- updated `open-issues.json`

### Step 8: Return Terminal Status

Return only:

- `PASS`
- `FAIL`
- `BLOCKED`

## Evidence Requirements

No failure may be reported without evidence.

Minimum evidence by failure type:

- command failure: command + exit code + relevant output
- browser failure: screenshot + reproduction steps
- console/runtime failure: error summary
- network/API failure: endpoint + status or timeout evidence

If evidence cannot be gathered, the issue should be marked as lower confidence in the report, but it should not be silently dropped.

## Coding Agent Handoff Rules

The coding agent should consume verifier output in this order:

1. highest priority first
2. grouped by functional area
3. one issue ID mapped to one concrete fix or fix set
4. add regression coverage for every resolved issue

The coding agent should update `submission.md` each round with:

- which issue IDs were targeted
- what changed
- what regression tests were added or updated

## Iteration Loop

The intended loop is:

1. coding agent implements or fixes
2. coding agent writes `submission.md`
3. verification agent runs full protocol
4. verifier returns `FAIL` with structured issues, or `PASS`, or `BLOCKED`
5. coding agent fixes issues and adds regression coverage
6. verifier reruns the full suite from scratch
7. repeat until `PASS`

The verifier must rerun the full suite every round. It is not allowed to verify only the directly modified area in strict mode.

## Stall Detection

To prevent infinite loops, the harness should track repeated non-progress.

### Stalled Issue

Mark an issue as `stalled` when:

- the same issue remains open for 3 verification rounds
- and evidence shows no material progress

### Escalation

Escalate the run to `BLOCKED` when:

- the project completes 5 verification rounds without reaching all-green
- or the same blocker cannot be cleared due to environment or requirement ambiguity

## Verification Agent Prompt Contract

The verification agent prompt should encode these rules:

- you are the independent verifier for `glcalc.com`
- you do not edit product code as part of routine verification
- you must run the full protocol in order
- you must not claim pass without fresh evidence
- you must classify every defect with priority
- you must produce machine-readable output for the coding agent
- you must return only `PASS`, `FAIL`, or `BLOCKED`

## Recommended Next Artifacts

After this design is approved, the next implementation artifacts should be:

1. `.harness/verification/test-cases.md`
2. `.harness/verification/report.schema.json`
3. `.harness/verification/verification-agent-prompt.md`
4. `.harness/verification/coding-agent-handoff.md`
5. automated test scaffolding aligned with the case IDs above

## Open Questions

These choices can be finalized during implementation:

- exact command set for static and test gates
- whether browser verification uses Playwright only or Playwright plus screenshots
- whether barcode and photo integrations are mocked in CI and live-checked only in selected environments

## Recommendation

Approve this design and implement the verifier as a project-specific harness component for `glcalc.com`, not as a generic framework. Keep the state machine strict, keep reporting structured, and keep the evaluator separate from the coding agent.
