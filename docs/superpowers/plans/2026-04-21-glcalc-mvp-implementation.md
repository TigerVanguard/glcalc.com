# GLCalc MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a no-database GL calculator MVP on Vercel with text search, barcode lookup, photo identification, candidate confirmation, and a verification loop that independently tests the full app.

**Architecture:** First migrate the project from its legacy Parcel 1 setup to a modern Vite-based React app with Vitest and Playwright so the coding and verification agents have a stable baseline. Then implement the MVP in modular feature slices: static GI data, client-side GL calculation, serverless barcode/photo APIs, and a UI flow that always requires user confirmation before calculating results.

**Tech Stack:** React, Vite, Vitest, Playwright, Vercel serverless functions, static JSON data, Open Food Facts-compatible barcode lookup, image recognition API integration

---

## File Structure

- Create: `vite.config.js`
- Create: `vitest.config.js`
- Create: `playwright.config.js`
- Create: `api/barcode.js`
- Create: `api/photo-identify.js`
- Create: `src/data/gi.json`
- Create: `src/lib/gl.js`
- Create: `src/lib/foodMatch.js`
- Create: `src/lib/normalizeFood.js`
- Create: `src/features/calculator/CalculatorResult.jsx`
- Create: `src/features/search/FoodSearch.jsx`
- Create: `src/features/barcode/BarcodeLookup.jsx`
- Create: `src/features/photo/PhotoLookup.jsx`
- Create: `src/features/confirm/FoodCandidateList.jsx`
- Create: `src/features/common/ErrorNotice.jsx`
- Create: `src/features/common/DisclosureNotice.jsx`
- Create: `src/styles/app.css`
- Create: `tests/unit/gl.test.js`
- Create: `tests/unit/foodMatch.test.js`
- Create: `tests/e2e/app.spec.js`
- Modify: `package.json`
- Modify: `public/index.html`
- Modify: `src/index.js`
- Replace or split: `src/App.js`
- Modify or remove: legacy Parcel-specific files as needed
- Update: `.harness/verification/test-cases.md`
- Update: `.harness/verification/env.md`

## Chunk 1: Modernize The Runtime And Test Baseline

### Task 1: Replace legacy Parcel build with Vite and modern scripts

**Files:**
- Create: `vite.config.js`
- Create: `vitest.config.js`
- Modify: `package.json`
- Modify: `public/index.html`

- [ ] **Step 1: Write the failing baseline checks**

Define the expected scripts in `package.json` for:

- `dev`
- `build`
- `test:unit`
- `test:e2e`
- `check`

Expected initial failure: these commands do not exist or do not run in the current project.

- [ ] **Step 2: Run the build or check command to verify the baseline fails**

Run: `npm run build`
Expected: FAIL because the project is still on the legacy toolchain or dependencies are missing.

- [ ] **Step 3: Implement the minimal Vite-based setup**

Add Vite-compatible scripts and configuration, keeping the React app small and stable.

- [ ] **Step 4: Run the build command to verify it passes**

Run: `npm run build`
Expected: PASS with a production bundle generated successfully.

- [ ] **Step 5: Commit**

```bash
git add package.json public/index.html vite.config.js vitest.config.js
git commit -m "build: migrate app baseline to vite"
```

### Task 2: Establish initial unit and browser test infrastructure

**Files:**
- Create: `playwright.config.js`
- Create: `tests/unit/gl.test.js`
- Create: `tests/e2e/app.spec.js`
- Modify: `package.json`

- [ ] **Step 1: Write failing seed tests**

Add one unit test for GL calculation and one e2e smoke test for page load.

- [ ] **Step 2: Run the tests to verify they fail for the expected reason**

Run: `npm run test:unit`
Expected: FAIL because the GL utility does not exist yet.

Run: `npm run test:e2e`
Expected: FAIL because the new runtime or app behavior is not ready yet.

- [ ] **Step 3: Add the minimal config and placeholders required to make tests runnable**

Create the config files and placeholder test targets so the suite can run under Vite/Playwright.

- [ ] **Step 4: Run the tests again to verify the harness is live**

Run: `npm run test:unit`
Expected: PASS for the seed utility after implementation exists.

Run: `npm run test:e2e`
Expected: PASS for the smoke page-load case.

- [ ] **Step 5: Commit**

```bash
git add package.json playwright.config.js tests/unit/gl.test.js tests/e2e/app.spec.js
git commit -m "test: add unit and e2e baseline"
```

## Chunk 2: Build Core GL Calculation And Search UX

### Task 3: Extract static food data and GL calculation utilities

**Files:**
- Create: `src/data/gi.json`
- Create: `src/lib/gl.js`
- Test: `tests/unit/gl.test.js`

- [ ] **Step 1: Write failing calculation tests**

Cover:

- carbohydrate calculation by grams
- carbohydrate calculation by ounces
- GI label thresholds
- GL label thresholds
- total GL calculation for a selected food and serving

- [ ] **Step 2: Run the unit tests to verify they fail**

Run: `npm run test:unit -- gl`
Expected: FAIL with missing functions or incorrect outputs.

- [ ] **Step 3: Implement the minimal calculation module**

Add pure functions for:

- serving normalization
- carbohydrate amount
- GI label selection
- GL label selection
- GL calculation

- [ ] **Step 4: Run the unit tests to verify they pass**

Run: `npm run test:unit -- gl`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/gi.json src/lib/gl.js tests/unit/gl.test.js
git commit -m "feat: extract core gl calculation utilities"
```

### Task 4: Replace monolithic App with modular text-search calculator flow

**Files:**
- Create: `src/features/search/FoodSearch.jsx`
- Create: `src/features/calculator/CalculatorResult.jsx`
- Create: `src/features/common/DisclosureNotice.jsx`
- Create: `src/styles/app.css`
- Modify: `src/App.js`
- Modify: `src/index.js`
- Test: `tests/e2e/app.spec.js`

- [ ] **Step 1: Write failing browser scenarios for text search**

Cover:

- page load
- search known food
- select result
- change unit and serving
- show GI, carbohydrates, and GL

- [ ] **Step 2: Run the e2e test to verify it fails**

Run: `npm run test:e2e -- app`
Expected: FAIL because the flow is not yet implemented in the new structure.

- [ ] **Step 3: Implement the modular search-and-calculate UI**

Add:

- single-page MVP layout
- search entry point
- serving controls
- result cards
- disclosure text explaining that results are estimates

- [ ] **Step 4: Run e2e and unit tests to verify this flow passes**

Run: `npm run test:unit`
Expected: PASS

Run: `npm run test:e2e -- app`
Expected: PASS for text-search scenarios

- [ ] **Step 5: Commit**

```bash
git add src/App.js src/index.js src/features src/styles tests/e2e/app.spec.js
git commit -m "feat: ship modular text-search gl calculator flow"
```

## Chunk 3: Add Barcode And Photo Identification

### Task 5: Implement food normalization and candidate matching

**Files:**
- Create: `src/lib/normalizeFood.js`
- Create: `src/lib/foodMatch.js`
- Test: `tests/unit/foodMatch.test.js`

- [ ] **Step 1: Write failing food matching tests**

Cover:

- case normalization
- punctuation removal
- simple brand-word stripping
- ranking of direct matches above weak matches

- [ ] **Step 2: Run unit tests to verify they fail**

Run: `npm run test:unit -- foodMatch`
Expected: FAIL because the matcher does not exist yet.

- [ ] **Step 3: Implement the minimal normalization and ranking logic**

Keep the algorithm simple:

- normalize string
- tokenize
- score overlap and exactness
- return top candidate list

- [ ] **Step 4: Run the unit tests to verify they pass**

Run: `npm run test:unit -- foodMatch`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/normalizeFood.js src/lib/foodMatch.js tests/unit/foodMatch.test.js
git commit -m "feat: add food candidate matching utilities"
```

### Task 6: Add barcode API and candidate-confirmation UI

**Files:**
- Create: `api/barcode.js`
- Create: `src/features/barcode/BarcodeLookup.jsx`
- Create: `src/features/confirm/FoodCandidateList.jsx`
- Create: `src/features/common/ErrorNotice.jsx`
- Modify: `src/App.js`
- Test: `tests/e2e/app.spec.js`

- [ ] **Step 1: Write failing tests for barcode success and failure paths**

Cover:

- valid barcode returns product metadata and candidates
- invalid barcode returns recoverable error UI
- user confirms candidate and sees calculated result

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test:e2e -- app`
Expected: FAIL because barcode functionality does not exist yet.

- [ ] **Step 3: Implement the minimal barcode lookup flow**

API responsibilities:

- accept a barcode
- query the configured provider
- return normalized product info and candidate names

UI responsibilities:

- submit barcode
- show candidate list
- allow manual confirmation
- recover from error states

- [ ] **Step 4: Run the tests to verify barcode flow passes**

Run: `npm run test:e2e -- app`
Expected: PASS for barcode scenarios

- [ ] **Step 5: Commit**

```bash
git add api/barcode.js src/features/barcode src/features/confirm src/features/common src/App.js tests/e2e/app.spec.js
git commit -m "feat: add barcode lookup and candidate confirmation"
```

### Task 7: Add photo-identify API and upload-confirmation UI

**Files:**
- Create: `api/photo-identify.js`
- Create: `src/features/photo/PhotoLookup.jsx`
- Modify: `src/App.js`
- Test: `tests/e2e/app.spec.js`

- [ ] **Step 1: Write failing tests for photo success and failure paths**

Cover:

- upload valid image and receive candidates
- confirm candidate and calculate result
- show recoverable UI when recognition fails or times out

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test:e2e -- app`
Expected: FAIL because photo flow does not exist yet.

- [ ] **Step 3: Implement the minimal photo-identification flow**

API responsibilities:

- accept image input
- call configured image recognition provider
- return candidate foods only, not a final medical answer

UI responsibilities:

- upload or capture photo
- show loading state
- show candidate list or error state

- [ ] **Step 4: Run tests to verify photo flow passes**

Run: `npm run test:e2e -- app`
Expected: PASS for photo scenarios

- [ ] **Step 5: Commit**

```bash
git add api/photo-identify.js src/features/photo src/App.js tests/e2e/app.spec.js
git commit -m "feat: add photo identification flow"
```

## Chunk 4: Wire The Verification Harness Into The Product

### Task 8: Align app behavior and environment docs with the verifier contract

**Files:**
- Modify: `.harness/verification/test-cases.md`
- Modify: `.harness/verification/env.md`
- Modify: `.harness/verification/submission.md`

- [ ] **Step 1: Update harness files to match the actual app commands and flows**

Set the real:

- dev URL
- install/build/test commands
- fixture expectations
- exact flow names used by the verifier

- [ ] **Step 2: Run a manual consistency check**

Read the harness files and confirm that the verifier prompt, test cases, and app commands all use the same terms.

- [ ] **Step 3: Commit**

```bash
git add .harness/verification/test-cases.md .harness/verification/env.md .harness/verification/submission.md
git commit -m "chore: align verification harness with live app flows"
```

### Task 9: Run full project verification and capture submission artifacts

**Files:**
- Update: `.harness/verification/submission.md`
- Update: `.harness/verification/open-issues.json`
- Update: `.harness/verification/report.md`
- Update: `.harness/verification/report.json`

- [ ] **Step 1: Fill in the current submission**

Document the implemented scope, files changed, regression cases, and known risks.

- [ ] **Step 2: Run the full verification command set**

Run:

- `npm run test:unit`
- `npm run build`
- `npm run test:e2e`

Expected: all commands pass and the verifier has no open issues.

- [ ] **Step 3: If verification fails, log issues and iterate**

Use the verifier outputs to feed the next coding round until there are zero open issues.

- [ ] **Step 4: Commit the final verified state**

```bash
git add .harness/verification/submission.md .harness/verification/open-issues.json .harness/verification/report.md .harness/verification/report.json
git commit -m "test: record verified mvp submission state"
```
