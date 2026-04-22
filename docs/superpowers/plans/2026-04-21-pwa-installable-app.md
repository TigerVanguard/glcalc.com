# GLCalc PWA Installable App Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `glcalc.com` into an installable mobile-friendly PWA with a more formal nutrition-tool identity, updated icons, manifest metadata, and polished mobile app-shell presentation.

**Architecture:** Keep this scope focused on installability rather than offline support. Add one canonical web app manifest, app icons, and mobile meta tags in the root HTML entry. Adjust the existing UI shell to feel more app-like on phones, but do not add service-worker caching beyond what is strictly necessary for installation metadata.

**Tech Stack:** Vite, React, web app manifest, mobile browser meta tags, SVG/PNG icon assets, Playwright

---

## File Structure

- Modify: `index.html`
- Modify: `src/App.jsx`
- Modify: `src/styles/app.css`
- Modify: `package.json`
- Create: `public/manifest.webmanifest`
- Create: `public/icons/gl-guide-icon.svg`
- Create: `public/icons/gl-guide-maskable.svg`
- Create: `public/icons/apple-touch-icon.png`
- Create: `public/icons/icon-192.png`
- Create: `public/icons/icon-512.png`
- Create: `tests/e2e/pwa.spec.js`

## Chunk 1: PWA Metadata And Install Assets

### Task 1: Add manifest and mobile meta wiring

**Files:**
- Create: `public/manifest.webmanifest`
- Modify: `index.html`

- [ ] **Step 1: Write the failing PWA smoke test**

Add an end-to-end check that expects:
- a linked manifest
- a theme color
- an Apple mobile-capable meta tag

- [ ] **Step 2: Run the e2e test to verify it fails**

Run: `npm run test:e2e -- pwa`
Expected: FAIL because the current app has no install metadata.

- [ ] **Step 3: Implement the minimal PWA metadata**

Add:
- canonical manifest link
- theme color metadata
- Apple install metadata
- app name and description aligned with the new brand direction

- [ ] **Step 4: Run the e2e test to verify it passes**

Run: `npm run test:e2e -- pwa`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add index.html public/manifest.webmanifest tests/e2e/pwa.spec.js
git commit -m "feat: add installable pwa metadata"
```

### Task 2: Add formal health-tool icon assets

**Files:**
- Create: `public/icons/gl-guide-icon.svg`
- Create: `public/icons/gl-guide-maskable.svg`
- Create: `public/icons/apple-touch-icon.png`
- Create: `public/icons/icon-192.png`
- Create: `public/icons/icon-512.png`
- Modify: `public/manifest.webmanifest`
- Modify: `index.html`

- [ ] **Step 1: Write a failing test expectation for icon references**

Expect the manifest to expose install icons including a maskable icon and the page to expose an Apple touch icon.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:e2e -- pwa`
Expected: FAIL because the icon set is incomplete.

- [ ] **Step 3: Implement the new icon set**

Create a nutrition-life brand direction:
- more like a health utility than a pizza shortcut
- readable `GL` mark
- works on light mobile home screens

- [ ] **Step 4: Run the PWA test again**

Run: `npm run test:e2e -- pwa`
Expected: PASS with icon metadata detected.

- [ ] **Step 5: Commit**

```bash
git add public/icons public/manifest.webmanifest index.html tests/e2e/pwa.spec.js
git commit -m "feat: add gl guide pwa icon set"
```

## Chunk 2: Make The Mobile Shell Feel App-Like

### Task 3: Update brand copy and app-shell presentation

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/styles/app.css`

- [ ] **Step 1: Write a failing e2e assertion for the updated app identity**

Expect the app shell to show the new app name and mobile-friendly top structure.

- [ ] **Step 2: Run the e2e test to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL because the current shell still uses the older page treatment.

- [ ] **Step 3: Implement the minimum app-shell refinements**

Update:
- hero/app title language
- mobile-safe top spacing
- top card/header feel
- stronger installable-app visual identity

Do not break the existing text, barcode, and photo flows.

- [ ] **Step 4: Run full app verification**

Run:
- `npm run test:unit`
- `npm run build`
- `npm run test:e2e`

Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/styles/app.css tests/e2e/app.spec.js tests/e2e/pwa.spec.js
git commit -m "feat: polish mobile app shell for installable pwa"
```

## Chunk 3: Final Verification

### Task 4: Verify installable metadata and app regressions together

**Files:**
- Verify: `index.html`
- Verify: `public/manifest.webmanifest`
- Verify: `public/icons/*`
- Verify: `src/App.jsx`
- Verify: `src/styles/app.css`
- Verify: `tests/e2e/*.spec.js`

- [ ] **Step 1: Run the full verification set**

Run:
- `npm run test:unit`
- `npm run build`
- `npm run test:e2e`

Expected: all PASS

- [ ] **Step 2: Review installability completeness**

Confirm:
- manifest is linked
- icons resolve
- Apple touch icon exists
- theme metadata exists
- app opens with a mobile-friendly shell

- [ ] **Step 3: Commit**

```bash
git add index.html public/manifest.webmanifest public/icons src/App.jsx src/styles/app.css tests/e2e/pwa.spec.js
git commit -m "test: verify installable pwa shell"
```
