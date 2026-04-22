# Verification Submission

## Summary

- Migrated the app from legacy Parcel to Vite/Vitest/Playwright.
- Rebuilt the UI into a modular MVP with text search, barcode lookup, and photo identification.
- Added deterministic candidate matching, confirmation flows, and recoverable error states.
- Kept the product no-database and confirmation-first: the app never auto-accepts barcode or photo results as final.

## Target Issues

- `GLAC-VER-001`

## Files Changed

- `package.json`
- `vite.config.js`
- `vitest.config.js`
- `playwright.config.js`
- `index.html`
- `src/App.jsx`
- `src/index.jsx`
- `src/SearchWorker.js`
- `src/data/gi.json`
- `src/lib/gl.js`
- `src/lib/normalizeFood.js`
- `src/lib/foodMatch.js`
- `src/features/search/FoodSearch.jsx`
- `src/features/calculator/CalculatorResult.jsx`
- `src/features/barcode/BarcodeLookup.jsx`
- `src/features/photo/PhotoLookup.jsx`
- `src/features/confirm/FoodCandidateList.jsx`
- `src/features/common/DisclosureNotice.jsx`
- `src/features/common/ErrorNotice.jsx`
- `src/styles/app.css`
- `api/barcode.js`
- `api/photo-identify.js`
- `tests/unit/gl.test.js`
- `tests/unit/foodMatch.test.js`
- `tests/unit/photoIdentify.test.js`
- `tests/e2e/app.spec.js`
- `tests/fixtures/photo-blueberries.svg`
- `tests/fixtures/photo-unknown.svg`

## Regression Coverage Added Or Updated

- `REG-001`
- Text-search, barcode, and photo e2e scenarios were added to cover the MVP core paths.

## Local Validation Run

- `npm run build` -> PASS
- `npm run test:unit` -> PASS
- `npm run test:e2e` -> PASS

## Known Risks

- Live barcode and photo providers are optional and environment-driven; the automated suite currently validates the deterministic fallback paths.
- Provider-specific runtime behavior should be re-verified if production credentials are enabled.

## Notes For Verifier

- Verify all three core paths: text search, barcode, and photo.
- Verify ounce conversion remains consistent between carbohydrate display and GL calculation.
- Treat mock fallback behavior as the expected automated-test baseline unless explicit live provider env vars are present.
