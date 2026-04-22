# GLCalc Coding Agent Handoff Protocol

This file defines how the coding agent should work with the verification agent for `glcalc.com`.

## Core Rule

The coding agent does not decide when work is complete.

The verification agent decides whether the project is in `PASS`, `FAIL`, or `BLOCKED`.

## Required Input Files

Before starting a fix round, the coding agent should read:

- `.harness/verification/report.md`
- `.harness/verification/report.json`
- `.harness/verification/open-issues.json` if present
- `.harness/verification/test-cases.md`

## Fix Order

Always fix in this order:

1. highest priority issues first
2. within the same priority, fix the issues that unblock the widest user surface first
3. handle lower-priority issues only after all higher-priority issues are addressed

Suggested interpretation:

- `P0` before everything
- `P1` before `P2`
- `P2` before `P3`

## One Round Contract

Each coding round should:

1. select the target issue IDs from verifier output
2. implement the minimum safe fix
3. add or update regression tests
4. document the submission
5. hand the code back to the verifier

Do not skip step 3.

## submission.md Template

Before asking for verification, write or update:

- `.harness/verification/submission.md`

The file should include:

```md
# Verification Submission

## Summary
- What changed in this round

## Target Issues
- GLAC-VER-001
- GLAC-VER-002

## Files Changed
- src/...
- tests/...

## Regression Coverage Added Or Updated
- REG-001
- REG-002

## Known Risks
- Any remaining uncertainty or dependency risk
```

## Regression Test Rule

Every real verifier-reported defect must result in one of these:

- a new regression test case
- an updated existing regression test case that now covers the defect

If the verifier marks `must_have_regression_test: true`, do not resubmit without that coverage.

## How To Read report.json

Use these fields directly:

- `priority`
- `test_case`
- `area`
- `expected_result`
- `actual_result`
- `fix_guidance`
- `must_have_regression_test`

Do not reinterpret vague intent from prose if the structured fields already tell you what to do.

## What The Coding Agent Must Not Do

The coding agent must not:

- declare success before verifier approval
- mark issues resolved without evidence
- change issue priority on its own
- suppress known failures by removing tests
- skip full verification because "only a small thing changed"

## Resubmission Standard

Only resubmit when:

- the targeted issue IDs have concrete code changes behind them
- regression coverage has been added or updated
- the submission file is current
- local validation has been run as appropriate for the changed area

## Handling BLOCKED Runs

If the verifier returns `BLOCKED`, the coding agent should:

1. identify whether the blocker is environmental, third-party, or requirements-related
2. document the blocker in `submission.md`
3. avoid pretending the underlying feature is complete

## Handling Repeated Failures

If the same issue remains open for multiple rounds:

- reread the verifier evidence carefully
- prefer a root-cause fix over another surface patch
- add stronger regression coverage before resubmitting

If an issue is marked `stalled`, treat that as a sign that the previous iterations did not materially address the root cause.

## Definition Of Done For The Coding Agent

A coding round is done only when:

- the code changes are implemented
- regression tests exist
- `submission.md` is updated
- the verifier has rerun the suite
- the verifier returns `PASS`

Anything short of that is an iteration in progress, not completion.
