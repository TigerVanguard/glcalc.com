# GLCalc Verification Test Cases

**Project:** `glcalc.com`  
**Mode:** Strict completion  
**Last updated:** `2026-04-19`

## How To Use This File

This file is the canonical list of verification cases for the `glcalc.com` MVP.

Rules:

- Every verification run must evaluate every required case.
- A run may return `PASS` only if every required case passes.
- Every failed case must produce a matching issue in `report.json`.
- Every production defect fixed by the coding agent must add or update at least one regression case here.

## Verification Methods

- `logic`: deterministic code-level or unit-level validation
- `ui`: browser interaction or visible UI state validation
- `integration`: app plus external or mocked service integration
- `regression`: previously failed scenario kept permanently in the suite

## Test Cases

| ID | Area | Priority If Broken | Method | Description | Expected Outcome |
|---|---|---:|---|---|---|
| `CALC-001` | calculation | `P0` | `logic` | Search a known food and calculate GL for the default serving size. | The app shows carbohydrate amount, GI band, and GL value for the selected food. |
| `CALC-002` | calculation | `P0` | `logic` | Calculate using gram input for a known food with stable data. | Carbohydrate amount and GL value match the calculation formula. |
| `CALC-003` | calculation | `P0` | `logic` | Calculate using ounce input for a known food with stable data. | Ounce conversion is correct and the displayed carbohydrate amount matches the GL calculation basis. |
| `CALC-004` | calculation | `P2` | `logic` | Verify GI threshold labels. | GI values at low, medium, and high thresholds map to the correct labels and colors. |
| `CALC-005` | calculation | `P2` | `logic` | Verify GL threshold labels. | GL values at low, medium, and high thresholds map to the correct labels and colors. |
| `SEARCH-001` | search | `P1` | `ui` | Search using an exact food name. | The expected food appears and can be selected. |
| `SEARCH-002` | search | `P1` | `ui` | Search using a partial name. | The app returns a narrowed candidate list and allows selection. |
| `SEARCH-003` | search | `P2` | `ui` | Trigger the too-many-results state. | The app shows a refinement hint instead of flooding the UI. |
| `SEARCH-004` | search | `P2` | `ui` | Clear the search input after results have appeared. | The UI resets cleanly without stale results or broken state. |
| `BAR-001` | barcode | `P1` | `integration` | Scan or submit a valid barcode for a known packaged food. | Product metadata is returned and the user is moved into the food confirmation flow. |
| `BAR-002` | barcode | `P1` | `ui` | Confirm one of the barcode-mapped food candidates. | The confirmed food is used for GL calculation. |
| `BAR-003` | barcode | `P2` | `integration` | Submit an invalid or unknown barcode. | The app shows a recoverable error state and allows retry. |
| `BAR-004` | barcode | `P2` | `ui` | Barcode lookup returns no strong match in the GI dataset. | The app shows fallback confirmation or manual search assistance instead of failing silently. |
| `PHOTO-001` | photo | `P1` | `integration` | Upload a valid food image. | The app returns candidate foods for user confirmation. |
| `PHOTO-002` | photo | `P1` | `ui` | Confirm one of the photo-derived food candidates. | The selected food is used for GL calculation. |
| `PHOTO-003` | photo | `P2` | `integration` | Submit an image that the recognizer cannot classify. | The app shows a retry-friendly failure state with no stuck loading state. |
| `PHOTO-004` | photo | `P2` | `ui` | Cancel or replace an uploaded photo before confirmation. | The UI updates cleanly and does not retain stale candidates. |
| `ERR-001` | resilience | `P1` | `integration` | External barcode or photo service times out. | The user sees an explicit timeout or retry message. |
| `ERR-002` | resilience | `P2` | `ui` | Submit an empty state or incomplete input. | The app prevents the action or shows a safe empty state. |
| `ERR-003` | resilience | `P2` | `ui` | Trigger an external service failure after the UI has already entered a loading state. | Loading state ends and error UI appears. |
| `UI-001` | layout | `P2` | `ui` | Verify the main result area on desktop width. | Search, serving controls, and result blocks are visible and usable without overlap. |
| `UI-002` | layout | `P2` | `ui` | Verify the main result area on mobile width. | The app remains readable and actionable without clipped or hidden controls. |
| `UI-003` | layout | `P3` | `ui` | Verify footer and attribution remain visible without blocking interaction. | Footer does not obstruct key controls or results. |
| `REG-001` | regression | `P0` | `regression` | Ounce carbohydrate display remains aligned with GL calculation. | Switching to `oz` preserves calculation and display consistency. |

## External Dependency Policy

These cases may rely on external services:

- barcode recognition
- photo recognition

The verification agent should prefer stable test fixtures or mock-backed runs in automated environments. If live services are required and unavailable, the run should return `BLOCKED`, not `PASS`.

## Stable Fixtures

The verifier should maintain a stable set of fixtures for repeatability:

- one low-GI food fixture
- one medium-GI food fixture
- one high-GI food fixture
- one valid barcode fixture
- one invalid barcode fixture
- one recognizable food image fixture
- one unrecognizable image fixture

The exact fixture files and values can be defined later in the implementation phase, but the case IDs above are stable now.

## Adding New Cases

When a new production defect is found:

1. Add a new `REG-###` entry.
2. Link the verifier issue ID to the new regression case.
3. Update automated coverage so the regression case can fail before the fix and pass after the fix.
4. Keep the case permanently in this file unless the underlying feature is removed.
