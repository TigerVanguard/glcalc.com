# GLCalc Verification Harness Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the project-specific verification harness for `glcalc.com` so coding and verification agents can exchange structured artifacts and run repeatable validation rounds.

**Architecture:** Keep the harness file-based and project-local under `.harness/verification/`. Start with durable protocol files and templates before adding any automation. This keeps the initial system inspectable, simple, and easy to evolve.

**Tech Stack:** Markdown, JSON Schema, JSON, project-local harness conventions

---

## File Structure

- Existing: `.harness/verification/test-cases.md`
- Existing: `.harness/verification/report.schema.json`
- Existing: `.harness/verification/verification-agent-prompt.md`
- Existing: `.harness/verification/coding-agent-handoff.md`
- Create: `.harness/verification/submission.md`
- Create: `.harness/verification/open-issues.json`
- Create: `.harness/verification/env.md`

## Chunk 1: Bootstrap Harness Templates

### Task 1: Add submission template

**Files:**
- Create: `.harness/verification/submission.md`

- [ ] **Step 1: Write the template content**

Include sections for summary, target issues, files changed, regression coverage, and known risks.

- [ ] **Step 2: Verify readability**

Read the file back and confirm the structure is easy for both humans and agents to fill in consistently.

- [ ] **Step 3: Commit checkpoint**

Commit once the template is correct and stable.

### Task 2: Add open issue ledger

**Files:**
- Create: `.harness/verification/open-issues.json`

- [ ] **Step 1: Create the initial JSON structure**

Use an empty issue ledger with project metadata and an empty issues array.

- [ ] **Step 2: Validate JSON**

Run a JSON parse check and confirm the file is valid JSON.

- [ ] **Step 3: Commit checkpoint**

Commit once the ledger is valid and aligned with the reporting contract.

### Task 3: Add environment template

**Files:**
- Create: `.harness/verification/env.md`

- [ ] **Step 1: Create the environment note template**

Include sections for app URL, install command, test command, browser expectations, and third-party service assumptions.

- [ ] **Step 2: Verify clarity**

Read the file back and confirm it gives the verifier enough context without project-specific noise.

- [ ] **Step 3: Commit checkpoint**

Commit once the template is stable.

## Chunk 2: Validate Bootstrap State

### Task 4: Verify directory integrity

**Files:**
- Verify: `.harness/verification/*`

- [ ] **Step 1: List the harness directory**

Run a directory listing and confirm every required file exists.

- [ ] **Step 2: Validate machine-readable artifacts**

Parse `report.schema.json` and `open-issues.json` to confirm both are valid JSON.

- [ ] **Step 3: Review for protocol consistency**

Check that `submission.md`, `env.md`, `test-cases.md`, `verification-agent-prompt.md`, and `coding-agent-handoff.md` use consistent terminology.

- [ ] **Step 4: Commit checkpoint**

Commit once the bootstrap set is complete and internally consistent.

## Execution Notes

- Do not add automation scripts yet.
- Do not add generic framework abstractions.
- Keep the bootstrap focused on enabling the first real coding/verifier iteration.
- When the bootstrap is complete, the next plan should cover either verifier automation or the product MVP implementation workflow that will use this harness.
