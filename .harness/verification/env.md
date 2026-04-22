# Verification Environment Notes

## App URL

- Dev server URL: `http://127.0.0.1:4173/`
- The Playwright suite should target `/` as the canonical app URL.

## Install And Run Commands

- Install: `npm install --legacy-peer-deps`
- Dev server: `npm run dev -- --host 127.0.0.1 --port 4173`
- Build: `npm run build`
- Unit tests: `npm run test:unit`
- E2E tests: `npm run test:e2e`
- Full local verification: `npm run test:unit && npm run build && npm run test:e2e`

## Browser Expectations

- Primary browser automation target: Playwright with Chromium
- Required viewport checks: desktop layout and mobile-usable layout via the e2e suite
- Camera access is not required for automated tests; photo flow is exercised via file upload

## Third-Party Service Assumptions

- Barcode provider: Open Food Facts-compatible endpoint when configured, otherwise deterministic mock fallback
- Photo recognition provider: optional OpenAI vision path when configured, otherwise deterministic mock fallback
- Live services are not required for local verification or CI-style automated testing

## Known Environment Constraints

- `GLCALC_BARCODE_PROVIDER=openfoodfacts` enables live barcode lookup if desired
- `GLCALC_PHOTO_PROVIDER=openai` and `OPENAI_API_KEY` enable live photo identification if desired
- Without these environment variables, the app uses built-in mock/demo responses for barcode and photo flows
