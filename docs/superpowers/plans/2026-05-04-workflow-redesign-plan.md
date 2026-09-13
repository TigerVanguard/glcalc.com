# GL Calculator Workflow Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reshape the GL calculator into a focused mobile-first workflow with a single food-finding entry switcher, stronger result hierarchy, and clearer PWA/app value.

**Architecture:** Keep the existing React/Vite app and calculation logic, but reorganize the top-level flow around a single active input method and a contiguous calculator workspace. Preserve existing barcode/photo/search capabilities while changing how they are presented, how selection state is surfaced, and how mobile users are guided toward the result. Execute the chunks strictly sequentially because `src/App.jsx`, `src/styles/app.css`, and the end-to-end specs are shared integration points.

**Tech Stack:** React 17, Vite, CSS, Vitest, Playwright

---

## Ownership Model

- **Parent integrator:** owns shared integration files and final merges for `src/App.jsx`, `src/styles/app.css`, `tests/e2e/app.spec.js`, and harness artifacts.
- **Chunk 1 implementer:** owns finder workflow components and finder-state wiring, then hands shared-file edits back through the parent integrator.
- **Chunk 2 implementer:** owns result-first presentation, mobile/PWA polish, and metadata-aligned copy, then hands shared-file edits back through the parent integrator.
- **Chunk 3 verifier:** must be a fresh verification owner/agent, not the same coding agent that implemented Chunks 1-2.
- **Integration gate after Chunk 1:** the parent integrator freezes the accepted `App.jsx` state API, shared selectors, and CSS/test touch points before Chunk 2 starts. Any contract change to selected-food behavior must be explicitly approved by the parent integrator, not inferred by the presentation owner.

## Chunk 1: Workflow Shell And Selection State

### Task 1: Replace stacked input cards with a single active finder workspace

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/features/search/FoodSearch.jsx`
- Modify: `src/features/barcode/BarcodeLookup.jsx`
- Modify: `src/features/photo/PhotoLookup.jsx`
- Create: `src/features/workflow/FinderTabs.jsx`
- Create: `src/features/workflow/SelectedFoodSummary.jsx`
- Modify: `src/styles/app.css`
- Test: `tests/e2e/app.spec.js`

**State contract:**
- canonical state in `App.jsx`:
  - `selectedFood = null | { food, source, sourceLabel }`
  - `food` is the normalized matched food object used by `CalculatorResult`, never raw provider output
  - minimum `food` fields guaranteed to consumers: `title`, `gi`, and one of `carbs_per_100g` or `carbsPer100g`
- finder callback contract:
  - every finder emits `onSelectSelection({ food, source, sourceLabel })`
- selected-food payload fields:
  - `food`: the matched food object used by `CalculatorResult`
  - `source`: one of `search`, `barcode`, `photo`
  - `sourceLabel`: human-readable label for the summary card
- inactive finders stay mounted so unfinished draft input and pending local results persist across tab switches
- switching finder tabs preserves unfinished input inside that finder and does not clear the selected food
- clearing search text resets only search results, not the selected food summary or result panel
- finder-specific clear actions clear only their own local draft state and pending candidates
- the summary card reset action clears the selected food only, not the unfinished finder input
- selecting a food from a different finder replaces the current summary payload and result
- hidden finders may keep draft input and local candidate results, but they must never auto-replace the active selected-food state without an explicit user select action

- [ ] **Step 1: Write or update failing end-to-end expectations for the new workflow shell**

Add assertions covering:
- one active finder at a time
- visible tab or segmented controls for `Search`, `Barcode`, and `Photo`
- selected food summary shown after choosing a food
- search clear does not drop the selected result
- summary reset clears only the selected result
- replacing the selected food from another finder updates the summary

- [ ] **Step 2: Run the targeted end-to-end test to verify it fails**

Run: `npx playwright test tests/e2e/app.spec.js --grep "workflow shell|searches for a food"`
Expected: FAIL because the current UI still renders stacked finder panels and no selected-food summary

- [ ] **Step 3: Implement minimal workflow-shell state in `src/App.jsx`**

Requirements:
- add active finder mode state
- render a single active finder method at a time
- keep selected food state in `App.jsx`
- pass selection metadata so the summary can explain where the food came from
- expose a single clear-selected-food action to the summary card

- [ ] **Step 4: Create `src/features/workflow/FinderTabs.jsx`**

Requirements:
- accessible tab-like switcher or segmented control
- three options: `Search`, `Barcode`, `Photo`
- mobile-friendly compact layout

- [ ] **Step 5: Create `src/features/workflow/SelectedFoodSummary.jsx`**

Requirements:
- show selected food title
- show source method label
- include a clear/reset action
- sit above serving controls or result area as the “current calculation target”

- [ ] **Step 6: Update finder components to fit the new workflow**

Requirements:
- remove `Step 1b` and `Step 1c` language
- align copy to the new `Find a food` stage
- barcode wording must reflect manual entry, not real scanning, unless a real camera scanner already exists
- ensure each finder reports enough information for the summary card

- [ ] **Step 6b: Add only the CSS needed for the new workflow shell**

Requirements:
- style the new finder tabs and summary card well enough for desktop and mobile functionality
- defer broader visual polish to Chunk 2

- [ ] **Step 7: Run targeted tests**

Run: `npx playwright test tests/e2e/app.spec.js --grep "workflow shell|searches for a food|looks up a barcode|uploads a photo|reset|tab switch|replace selection"`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx src/features/search/FoodSearch.jsx src/features/barcode/BarcodeLookup.jsx src/features/photo/PhotoLookup.jsx src/features/workflow/FinderTabs.jsx src/features/workflow/SelectedFoodSummary.jsx tests/e2e/app.spec.js
git commit -m "feat: reshape calculator into a single finder workflow"
```

## Chunk 2: Result-First Layout And Visual Hierarchy

### Task 2: Promote the result workspace and tighten mobile/PWA presentation

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/features/calculator/CalculatorResult.jsx`
- Modify: `src/features/common/DisclosureNotice.jsx`
- Modify: `src/styles/app.css`
- Modify: `index.html`
- Test: `tests/e2e/app.spec.js`
- Test: `tests/e2e/pwa.spec.js`
- Test: `tests/e2e/seo.spec.js`

- [ ] **Step 1: Write or update failing tests for result priority and copy changes**

Add assertions covering:
- heading and copy for the new three-stage flow
- barcode copy uses `Type a barcode` or equivalent honest wording
- selected result remains prominent after selection
- tab switching preserves unfinished draft input across finders
- mobile viewport shows the result workflow without misleading duplicate entry cards
- mobile viewport shows the result workspace before lower-priority SEO content after selection
- active finder control exposes a clear selected state and keyboard-focusable semantics
- clearing the selected food returns the result panel to an instructive empty state
- empty-state recovery works after clearing the summary and picking a new food

- [ ] **Step 2: Run targeted tests to verify they fail**

Run: `npx playwright test tests/e2e/app.spec.js tests/e2e/pwa.spec.js`
Expected: FAIL on copy/structure assertions before implementation

- [ ] **Step 3: Rework the top-of-page composition in `src/App.jsx`**

Requirements:
- convert hero to a tighter app header
- add an install-value CTA or message
- present the page as `Find a food -> Set serving -> Review GL`
- reduce SEO content prominence relative to the calculator flow

- [ ] **Step 4: Rebuild `CalculatorResult.jsx` into a stronger result-first panel**

Requirements:
- make GL the dominant metric
- keep GI and carbohydrates as supporting stats
- keep accessibility text labels and semantic structure
- improve empty state so it reinforces the workflow instead of reading like a dead end

- [ ] **Step 5: Update `DisclosureNotice.jsx` and supporting copy**

Requirements:
- keep trust-building language concise
- avoid pushing the notice above the main result

- [ ] **Step 6: Overhaul `src/styles/app.css` for the new workflow**

Requirements:
- mobile-first spacing and layout polish
- clearer visual hierarchy between header, workflow shell, summary, controls, result, and educational content
- more distinctive “calm nutrition field guide” styling
- no deceptive button-like chips without actions
- preserve visible focus styles and contrast
- ensure mobile layout makes the result area visually more prominent than the educational content

- [ ] **Step 7: Update `index.html` only where the visible product framing changed**

Requirements:
- keep PWA/SEO metadata coherent with the revised product copy
- do not remove existing manifest or core metadata
- preserve canonical URL, structured data, analytics gating, and noscript fallback content expected by `seo.spec.js`

- [ ] **Step 8: Run unit, e2e, and build verification**

Run:
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`

Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/App.jsx src/features/calculator/CalculatorResult.jsx src/features/common/DisclosureNotice.jsx src/styles/app.css index.html tests/e2e/app.spec.js tests/e2e/pwa.spec.js
git commit -m "feat: promote result-first mobile calculator experience"
```

## Chunk 3: Independent Verification

### Task 3: Run independent verification against the redesigned workflow

**Files:**
- Modify: `.harness/verification/test-cases.md`
- Modify: `.harness/verification/report.md`
- Modify: `.harness/verification/report.json`
- Modify: `.harness/verification/open-issues.json`

- [ ] **Step 1: Execute the existing verification suite from a clean state**

Environment:
- local development app for this repo
- mocked/default provider mode unless explicit live-provider credentials are configured

`BLOCKED` criteria:
- required app build cannot start
- Playwright environment cannot open the local app
- required external provider behavior cannot be reproduced in either mocked mode or configured live mode

Run:
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`

- [ ] **Step 2: Perform focused manual browser checks**

Verify:
- finder tabs switch cleanly on desktop and mobile widths
- the active finder exposes a visible selected state and usable keyboard navigation
- search, barcode, and photo flows each end in a visible result
- selected-food summary appears after each successful flow
- clearing search text does not remove the active result summary
- summary reset returns the result panel to the new instructional empty state
- switching tabs preserves unfinished draft input
- selecting a new food from another finder replaces the active summary
- empty-state recovery works after reset and re-selection
- result panel is visually more prominent than FAQ/SEO content

- [ ] **Step 2b: Update the canonical harness case definitions**

Requirements:
- add or revise workflow-focused cases for tab switching, selected-food summary, reset behavior, and result-first mobile layout
- keep old calculation and provider cases intact
- add named case IDs for active finder switching, selected-food summary visibility, summary reset without draft loss, cross-finder replacement of the selected summary, and search clear preserving the selected result
- add a contract-to-test map in the verification notes covering tab persistence, search clear preserving selection, summary reset preserving draft state, cross-finder replacement, and empty-state recovery

- [ ] **Step 3: Record PASS/FAIL/BLOCKED in harness outputs**

Requirements:
- if failures exist, log specific reproduction details
- if all checks pass, clear open issues
- explicitly report `npm run test:e2e` coverage for `app.spec.js`, `pwa.spec.js`, and `seo.spec.js`

- [ ] **Step 4: Do not close the plan until verification artifacts are updated**

No code commit required for verification-only updates unless the harness workflow in this repo expects one.
